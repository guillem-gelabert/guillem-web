import type { BacklogItem } from "./backlog";

/**
 * The write API's validation, with no database and no React in its import
 * graph — which is the entire reason it is a module of its own rather than
 * living in lib/backlog-store.ts beside the queries it guards.
 *
 * `node --test` cannot import a .tsx file (ERR_UNKNOWN_FILE_EXTENSION), and
 * lib/backlog.tsx is locked as .tsx by D-05. Anything that reaches that module
 * for a VALUE is therefore untestable in the unit tier. Splitting the pure
 * half out keeps the one piece of code standing between an HTTP body and a row
 * on a live page fully covered by tests/unit/backlog-store.test.ts, with no
 * loader dependency and no mock. Same reasoning that put buildCsp({dev}) in
 * lib/csp.ts rather than inside next.config.ts, and isStale() beside its own
 * environment probe.
 *
 * The `import type` above is erased at compile time and never resolved at
 * runtime, so it does not reintroduce the problem.
 */

export const MAX_ITEMS = 4;

export const MAX_NAME_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 600;

export type ValidationResult =
  | { ok: true; value: BacklogItem }
  | { ok: false; errors: string[] };

/**
 * Pure, exported, and unit-tested without a database (tests/unit/backlog-store.test.ts).
 * Collect-then-return rather than throw-on-first, mirroring assertFrontmatter's
 * shape in lib/content.ts: a caller fixing a malformed request should see
 * everything wrong with it in one response, not discover the second problem
 * after fixing the first.
 */
export function validateItem(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: ["body must be a JSON object"] };
  }

  const record = input as Record<string, unknown>;

  // Named explicitly rather than ignored silently: a request sending `href` or
  // `status` has misunderstood what a backlog item is (D-06 — exactly two
  // fields), and quietly dropping the field would let that misunderstanding
  // persist through a 201.
  const unknownKeys = Object.keys(record).filter((key) => key !== "name" && key !== "description");
  if (unknownKeys.length > 0) {
    errors.push(`unknown field(s): ${unknownKeys.join(", ")} — an item has exactly name and description`);
  }

  const cleaned: Record<"name" | "description", string> = { name: "", description: "" };

  for (const field of ["name", "description"] as const) {
    const raw = record[field];
    if (typeof raw !== "string") {
      errors.push(`${field} must be a string`);
      continue;
    }
    // Collapse runs of whitespace, including the newlines a here-doc or a
    // copy-paste out of an editor will carry. The renderer puts each
    // description in a single <p>; a literal newline would survive into the
    // database and render as a space anyway, so normalising on the way in
    // keeps what is stored equal to what is shown.
    const value = raw.replace(/\s+/g, " ").trim();
    if (value.length === 0) {
      errors.push(`${field} must not be empty`);
      continue;
    }
    // C0/C1 control characters. Not a rendering risk — React escapes
    // everything — but they are invisible in every review surface, which makes
    // them exactly the thing to reject at the boundary rather than store.
    if (/[\u0000-\u001f\u007f-\u009f]/.test(value)) {
      errors.push(`${field} must not contain control characters`);
      continue;
    }
    const max = field === "name" ? MAX_NAME_LENGTH : MAX_DESCRIPTION_LENGTH;
    if (value.length > max) {
      errors.push(`${field} must be at most ${max} characters (got ${value.length})`);
      continue;
    }
    cleaned[field] = value;
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { name: cleaned.name, description: cleaned.description } };
}
