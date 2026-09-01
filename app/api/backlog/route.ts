import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/db";
import { addItem, listItems, MAX_ITEMS, validateItem } from "@/lib/backlog-store";

/**
 * POST /api/backlog — add an item.  GET /api/backlog — list them.
 *
 * The only write surface on the site. Everything else is prerendered from
 * files on disk, so this route carries the whole of whatever attack surface
 * the site has, and is written accordingly: bearer-token auth that fails
 * closed (lib/api-auth.ts), a body-size cap read before parsing, validation
 * that returns every problem at once, parameterised queries throughout, and
 * error responses that never echo a database message back to the caller.
 *
 * Both handlers require the token, GET included. The backlog is public on the
 * landing page, so listing it is not a secrecy boundary — but GET returns row
 * IDs, which are the input to DELETE, and an unauthenticated endpoint that
 * hands out the identifiers for a privileged operation is a gift to whoever
 * eventually finds a hole in DELETE.
 *
 * Usage:
 *   curl -X POST https://guillemgelabert.com/api/backlog \
 *     -H "Authorization: Bearer $BACKLOG_API_TOKEN" \
 *     -H "Content-Type: application/json" \
 *     -d '{"name":"...","description":"..."}'
 */

// This route reads and writes a database per request; it must never be
// prerendered or cached. Without this, `next build` would try to evaluate it.
export const dynamic = "force-dynamic";

// A backlog item is a name and a paragraph. 16 KB is already several hundred
// times what a legitimate request needs, and the cap exists so a malicious
// body is refused before it is buffered into memory and JSON-parsed, not
// after.
const MAX_BODY_BYTES = 16 * 1024;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // This endpoint's responses are per-caller and must not be held by any
      // shared cache between here and the client.
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Turns an unknown failure into a 500 that says nothing useful to an attacker
 * and everything useful to the operator, who has the logs. A Postgres error
 * echoed into a response body leaks schema, and sometimes data.
 */
function serverError(context: string, err: unknown): Response {
  console.error(`[api/backlog] ${context}:`, err);
  return json({ error: "internal error" }, 500);
}

export async function GET(request: Request): Promise<Response> {
  const auth = authorize(request);
  if (!auth.ok) return json({ error: auth.message }, auth.status);

  if (!hasDatabase()) {
    return json({ error: "no database configured on this deployment" }, 503);
  }

  try {
    const items = await listItems();
    return json({ items, count: items.length, capacity: MAX_ITEMS }, 200);
  } catch (err) {
    return serverError("list failed", err);
  }
}

export async function POST(request: Request): Promise<Response> {
  const auth = authorize(request);
  if (!auth.ok) return json({ error: auth.message }, auth.status);

  if (!hasDatabase()) {
    return json({ error: "no database configured on this deployment" }, 503);
  }

  // Checked before reading the body, so an oversized request is rejected
  // without being buffered. A missing or lying Content-Length is caught by the
  // second check below, after the read — belt and braces, because the header
  // is caller-supplied and therefore not evidence of anything.
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ error: `body must be at most ${MAX_BODY_BYTES} bytes` }, 413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ error: "could not read the request body" }, 400);
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return json({ error: `body must be at most ${MAX_BODY_BYTES} bytes` }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "body must be valid JSON" }, 400);
  }

  const validation = validateItem(parsed);
  if (!validation.ok) {
    return json({ error: "invalid item", details: validation.errors }, 422);
  }

  try {
    const result = await addItem(validation.value);

    if (!result.ok) {
      // 409, not 400: the request is well-formed and would succeed against a
      // different server state. That distinction is what tells a caller to
      // delete something and retry rather than to fix their payload.
      return json({ error: result.message, reason: result.reason }, 409);
    }

    // The landing page renders this list with a revalidate window, so without
    // this the new item would not appear until that window expired — the API
    // would look broken for up to a minute after returning 201. Both locales'
    // roots are purged because the German landing view is a planned surface
    // that will read the same store.
    revalidatePath("/");

    return json({ item: result.item }, 201);
  } catch (err) {
    return serverError("insert failed", err);
  }
}
