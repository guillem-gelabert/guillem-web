import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/db";
import { deleteItem } from "@/lib/backlog-store";

/**
 * DELETE /api/backlog/:id
 *
 * This exists because D-02's four-item ceiling would otherwise brick the write
 * API after four calls. It is the minimum that keeps a bounded list operable —
 * there is deliberately no PATCH, no reorder and no bulk delete. Editing an
 * item is delete-then-add, which is one round trip more and one concept less.
 *
 * Usage:
 *   curl -X DELETE https://guillemgelabert.com/api/backlog/<id> \
 *     -H "Authorization: Bearer $BACKLOG_API_TOKEN"
 */

export const dynamic = "force-dynamic";

// The id column is a uuid. Rejecting anything that is not one before it
// reaches the query is not injection defence — the query is parameterised, so
// it is already safe — but it turns a class of malformed input into a clean
// 400 instead of a Postgres "invalid input syntax for type uuid" surfacing as
// a 500.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = authorize(request);
  if (!auth.ok) return json({ error: auth.message }, auth.status);

  if (!hasDatabase()) {
    return json({ error: "no database configured on this deployment" }, 503);
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return json({ error: "id must be a uuid" }, 400);
  }

  try {
    const deleted = await deleteItem(id);
    if (!deleted) return json({ error: "no item with that id" }, 404);

    revalidatePath("/");
    return json({ deleted: id }, 200);
  } catch (err) {
    console.error("[api/backlog] delete failed:", err);
    return json({ error: "internal error" }, 500);
  }
}
