import { Pool } from "pg";

/**
 * The database connection, and the first runtime dependency this project has
 * taken on.
 *
 * REQUIREMENTS.md listed "headless CMS or database" as out of scope for v1,
 * with the reasoning "disproportionate at roughly fifteen content files,
 * single author". That reasoning was sound and is now overridden by an
 * explicit decision (2026-09-01) to expose a write API for the backlog. The
 * entry is amended rather than quietly ignored — see REQUIREMENTS.md and
 * .planning/STATE.md.
 *
 * Everything below is shaped by one constraint: THE SITE MUST STILL BUILD AND
 * RENDER WITH NO DATABASE. `next build` runs on a developer's laptop and in
 * CI with no DATABASE_URL, `npm run test:build` reads the HTML that build
 * writes to disk, and none of that may start depending on a Postgres being
 * reachable. So the pool is lazy and nullable, never constructed at module
 * load, and every caller is expected to have a no-database path.
 */

let pool: Pool | null = null;
let attempted = false;

/**
 * Railway hands the `web` service `${{Postgres.DATABASE_URL}}`, which resolves
 * to the private-network host `postgres.railway.internal`. That link is
 * inside Railway's network and needs no TLS; the public proxy host
 * (`*.proxy.rlwy.net`, used when connecting from a laptop) does. Deciding by
 * hostname rather than by NODE_ENV means the same code works from both
 * without a second variable to keep in sync.
 *
 * `rejectUnauthorized: false` is deliberate and is not a downgrade of a
 * working check: Railway's proxy presents a certificate for a host that does
 * not match the connection string's, so verification cannot succeed as
 * configured. The connection is still encrypted. The private-network path,
 * which is what production actually uses, does not go through this branch at
 * all.
 */
function sslFor(connectionString: string) {
  return connectionString.includes(".railway.internal")
    ? undefined
    : { rejectUnauthorized: false };
}

export function getPool(): Pool | null {
  if (attempted) return pool;
  attempted = true;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  pool = new Pool({
    connectionString,
    ssl: sslFor(connectionString),
    // Small on purpose. This is one table read by a page that revalidates on
    // a timer and written by hand a few times a year; a large pool would only
    // hold idle connections open against a database sized for a personal
    // site.
    max: 3,
    idleTimeoutMillis: 10_000,
    // Without this a Postgres that is unreachable (paused service, network
    // blip during a deploy) hangs the request until the platform's own
    // timeout. Five seconds is long enough for a cold private-network
    // connection and short enough that the caller's fallback still renders a
    // page rather than a spinner.
    connectionTimeoutMillis: 5_000,
  });

  // An idle client erroring out must not become an unhandled 'error' event,
  // which in Node terminates the process — taking the whole site down over a
  // dropped backlog connection.
  pool.on("error", (err) => {
    console.error("[db] idle client error:", err.message);
  });

  return pool;
}

/** True when a database is configured. Callers use it to pick a path without touching the pool. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
