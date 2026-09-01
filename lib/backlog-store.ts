import { BACKLOG, LAST_TOUCHED, type BacklogItem } from "./backlog";
import { getPool, hasDatabase } from "./db";
import { MAX_ITEMS } from "./backlog-validate";

// Re-exported so callers have one import for the backlog's server side, while
// the pure half stays independently importable by the unit tier.
export {
  MAX_ITEMS,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  validateItem,
  type ValidationResult,
} from "./backlog-validate";

/**
 * The backlog's read and write paths, and the one place that knows the
 * database exists.
 *
 * Two rules shape everything here.
 *
 * **The site must render without a database.** `next build` runs with no
 * DATABASE_URL on a laptop and in CI, `npm run test:build` asserts against the
 * HTML that build writes, and 173 Playwright specs run against `next dev`.
 * None of that may start requiring Postgres. So every read falls back to
 * lib/backlog.tsx's BACKLOG, and the fallback is a first-class path rather
 * than an error branch.
 *
 * **A read must never take the page down.** The backlog is one section of the
 * landing page. A database that is paused, migrating or briefly unreachable
 * should cost the visitor the freshest version of three sentences, not the
 * whole site. Every query below is wrapped, and a failure logs and falls back.
 * This is the opposite of the posture the write path takes, where a failure
 * must be loud.
 */

export type StoredBacklogItem = BacklogItem & {
  id: string;
  createdAt: string; // ISO date, YYYY-MM-DD
};

export type BacklogView = {
  items: readonly BacklogItem[];
  /** BACK-02's section-level freshness date. */
  lastTouched: string;
  /** Which path produced this. Surfaced so the API can report it and tests can assert on it. */
  source: "database" | "module";
};

/**
 * D-02's ceiling, enforced in three places now rather than one: the build-time
 * validator in lib/backlog.tsx (the seed array), addItem() below (the write
 * path), and the API route's own error mapping. Curation is the entire point
 * of the backlog — an unbounded list is a wishlist, which is the read D-02
 * exists to prevent — so the ceiling has to hold on the path that made it
 * easy to add items.
 */
// --- schema -----------------------------------------------------------------

// CREATE TABLE IF NOT EXISTS rather than a migration tool, and memoised per
// process so it costs one round trip per cold start rather than one per
// request. One table with no foreign keys does not justify a migration
// framework, a migrations table, or a second npm dependency; when a second
// table arrives, that calculus changes and this should become a real
// migration step in the deploy.
let schemaReady: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const pool = getPool();
    if (!pool) return;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS backlog_item (
        id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name        text NOT NULL,
        description text NOT NULL,
        position    integer NOT NULL,
        created_at  timestamptz NOT NULL DEFAULT now()
      )
    `);
    // D-04: array order IS the editorial order. `position` preserves it
    // across inserts and deletes; ordering by created_at would be almost the
    // same thing until the day two rows land in the same millisecond, and
    // would make reordering impossible without rewriting timestamps.
    await pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS backlog_item_position_idx ON backlog_item (position)`,
    );
    await seedIfEmpty();
  })().catch((err) => {
    // Reset so a transient failure at boot does not permanently poison every
    // later request in this process.
    schemaReady = null;
    throw err;
  });
  return schemaReady;
}

/**
 * Seeds from lib/backlog.tsx's BACKLOG the first time the table is empty.
 *
 * The seeded rows get created_at = LAST_TOUCHED, NOT now(). That looks like a
 * detail and is the whole honesty of BACK-02: the section renders "Last
 * touched <date>", derived below from max(created_at). Seeding with now()
 * would make a fresh deploy of three-week-old items claim they were touched
 * today, which is exactly the freshness overclaim the section-level date was
 * introduced to avoid.
 */
async function seedIfEmpty(): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  const { rows } = await pool.query<{ count: string }>("SELECT count(*)::text FROM backlog_item");
  if (Number(rows[0].count) > 0) return;

  for (const [index, item] of BACKLOG.entries()) {
    await pool.query(
      `INSERT INTO backlog_item (name, description, position, created_at)
       VALUES ($1, $2, $3, $4::date)
       ON CONFLICT DO NOTHING`,
      [item.name, item.description, index, LAST_TOUCHED],
    );
  }
}

// --- reads ------------------------------------------------------------------

function moduleView(): BacklogView {
  return { items: BACKLOG, lastTouched: LAST_TOUCHED, source: "module" };
}

function toIsoDate(value: Date | string): string {
  return (value instanceof Date ? value : new Date(value)).toISOString().slice(0, 10);
}

/**
 * What the landing page renders. Never throws.
 *
 * The lastTouched it returns is max(created_at) across the live rows — the
 * honest reading BACK-02 specifies, and now actually computed rather than
 * hand-maintained. It can only move backwards if the newest item is deleted,
 * which is correct: the section is claiming when the backlog last changed
 * shape, not when the file was last edited.
 */
export async function getBacklog(): Promise<BacklogView> {
  if (!hasDatabase()) return moduleView();

  try {
    await ensureSchema();
    const pool = getPool();
    if (!pool) return moduleView();

    const { rows } = await pool.query<{ name: string; description: string; created_at: Date }>(
      `SELECT name, description, created_at FROM backlog_item ORDER BY position ASC`,
    );
    if (rows.length === 0) return moduleView();

    const lastTouched = rows
      .map((row) => toIsoDate(row.created_at))
      .reduce((newest, date) => (date > newest ? date : newest));

    return {
      items: rows.map(({ name, description }) => ({ name, description })),
      lastTouched,
      source: "database",
    };
  } catch (err) {
    // Deliberately swallowed. See this module's header: one unreachable
    // database must not cost the visitor the whole landing page.
    console.error("[backlog] read failed, serving the module seed:", (err as Error).message);
    return moduleView();
  }
}

/** The API's list endpoint — same rows, with ids, so a caller can delete one. */
export async function listItems(): Promise<StoredBacklogItem[]> {
  await ensureSchema();
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<{
    id: string;
    name: string;
    description: string;
    created_at: Date;
  }>(`SELECT id, name, description, created_at FROM backlog_item ORDER BY position ASC`);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: toIsoDate(row.created_at),
  }));
}

// --- writes -----------------------------------------------------------------

export type AddResult =
  | { ok: true; item: StoredBacklogItem }
  | { ok: false; reason: "full" | "duplicate"; message: string };

/**
 * Unlike the read path, this throws on a database failure. A write that
 * silently did nothing and returned 201 would be a much worse failure than a
 * 500 — the caller would believe the item is on the site.
 */
export async function addItem(item: BacklogItem): Promise<AddResult> {
  await ensureSchema();
  const pool = getPool();
  if (!pool) throw new Error("no database configured");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // The ceiling and the insert have to be one atomic decision. Counting
    // outside a transaction and inserting after is the textbook check-then-act
    // race: two concurrent requests both read 3, both insert, and the backlog
    // is five items long with every individual request having behaved
    // correctly. The lock makes concurrent writers queue instead.
    await client.query("LOCK TABLE backlog_item IN SHARE ROW EXCLUSIVE MODE");

    const { rows: countRows } = await client.query<{ count: string }>(
      "SELECT count(*)::text FROM backlog_item",
    );
    if (Number(countRows[0].count) >= MAX_ITEMS) {
      await client.query("ROLLBACK");
      return {
        ok: false,
        reason: "full",
        message:
          `the backlog holds ${countRows[0].count} items and the ceiling is ${MAX_ITEMS} (D-02) — ` +
          "delete one before adding another; curation is the point",
      };
    }

    const { rows: dupeRows } = await client.query<{ id: string }>(
      "SELECT id FROM backlog_item WHERE lower(name) = lower($1)",
      [item.name],
    );
    if (dupeRows.length > 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "duplicate", message: `an item named "${item.name}" already exists` };
    }

    const { rows } = await client.query<{ id: string; created_at: Date }>(
      `INSERT INTO backlog_item (name, description, position)
       VALUES ($1, $2, COALESCE((SELECT max(position) + 1 FROM backlog_item), 0))
       RETURNING id, created_at`,
      [item.name, item.description],
    );
    await client.query("COMMIT");

    return {
      ok: true,
      item: { ...item, id: rows[0].id, createdAt: toIsoDate(rows[0].created_at) },
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Deletion exists because the ceiling would otherwise brick the API after four
 * adds. It is the smallest thing that keeps a bounded list operable, not scope
 * creep towards a CMS: there is no update, no reorder, and no partial write.
 */
export async function deleteItem(id: string): Promise<boolean> {
  await ensureSchema();
  const pool = getPool();
  if (!pool) throw new Error("no database configured");
  const { rowCount } = await pool.query("DELETE FROM backlog_item WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
