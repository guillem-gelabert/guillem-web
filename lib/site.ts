/**
 * The one place the site's own origin is written down.
 *
 * It used to be `new URL("https://web-production-9cedb.up.railway.app")`
 * verbatim in both root layouts, and every rel="canonical" and every hreflang
 * alternate on every route resolves against it — exactly the class of value
 * where a stale hostname is silently wrong rather than loudly broken, with
 * nothing asserting the two copies matched. Phase 6 flips robots to
 * indexable, which is when it starts to matter.
 *
 * Env-overridable so the first custom domain is a deploy variable, not a code
 * change: set NEXT_PUBLIC_SITE_URL in the hosting environment. The literal
 * below stays as the current Railway origin's fallback.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-production-9cedb.up.railway.app",
);
