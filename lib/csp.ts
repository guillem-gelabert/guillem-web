/**
 * BUILD-04's Content-Security-Policy, built by one pure function so it can be
 * unit-tested exactly (D-4.3). `buildCsp` takes `dev` as an argument and
 * reads no environment variable of its own: `playwright.config.ts` runs its
 * `webServer` as `npm run dev`, so a Playwright test structurally cannot
 * observe the production policy, and `node --test` must be able to assert
 * both strings without touching `process.env`. The caller (`next.config.ts`)
 * is the only place `process.env.NODE_ENV` is read.
 *
 * ---
 *
 * THE HONEST FRAMING (D-4.2)
 *
 * This site has no user input, no forms, no third-party scripts and no
 * third-party origins of any kind. The XSS surface `'unsafe-inline'` guards
 * is therefore close to nil here. The policy compensates where it costs
 * nothing: `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`,
 * `frame-ancestors 'none'`. Stating the tradeoff beats pretending it does
 * not exist — particularly for a reader who came from the security-headers
 * writing this site itself hosts.
 *
 * `script-src 'unsafe-inline'` — Next's App Router inlines the RSC flight
 * payload as `<script>self.__next_f.push(…)</script>` on every route.
 * `script-src 'self'` blocks it and hydration dies. The alternative is a
 * nonce threaded through `middleware.ts` (now `proxy.ts` in Next 16) and
 * *two* root layouts (`app/(en)/layout.tsx`, `app/(de)/layout.tsx`) plus
 * `app/global-not-found.tsx`, and it forces dynamic rendering on every
 * route — forfeiting static generation on a site that is entirely static
 * content. Declined for v1; recorded here as the v2 improvement.
 *
 * `style-src 'unsafe-inline'` — there are TWO inline-style consumers, not
 * one, and fixing either alone does not let this directive tighten:
 *   1. Shiki emits `style="color:#…"` on every syntax-highlighted token
 *      span (shikijs/shiki#671, open, no clean fix). Measured: 15 token
 *      colours on the fixture post's real render.
 *   2. remark-gfm emits `style="text-align:right"` on aligned table cells
 *      (from `| --- | ---: |` column syntax). Measured: 4 alignments on the
 *      same fixture.
 * Under CSP Level 2+, `style-src 'self'` blocks inline style *attributes*,
 * so the visible symptom of getting this wrong is every code block and
 * every aligned table on the site rendering as undifferentiated ink the
 * moment this header ships. Rejected alternatives: `'unsafe-hashes'` plus a
 * per-attribute hash (impractical at token granularity, and `'unsafe-hashes'`
 * is itself a weakening); a rehype transformer rewriting Shiki's inline
 * styles to classes (a real option, but it is a Phase 2 pipeline change and
 * it does not touch remark-gfm's alignment styles, so `style-src` still
 * could not tighten). The nonce route would not fix this either — CSP
 * offers no nonce mechanism for style *attributes*, only for `<style>`
 * elements and `<script>`.
 *
 * ---
 *
 * TWO FREE STRENGTHENINGS, MEASURED AND DECLINED FOR v1
 *
 * Research measured, across `/`, `/cv` and the case study's built HTML:
 * zero inline `<style>` elements (prod and dev), zero `on*=` handlers, and
 * (on published, non-draft routes) zero bare inline style *attributes*
 * outside the two consumers above. That means `style-src-elem 'self'` and
 * `script-src-attr 'none'` could both ship today at zero measured cost —
 * browsers without CSP3 sub-directive support fall back to `style-src` /
 * `script-src`, which already carry `'unsafe-inline'`, so the fallback is
 * safe, not a breakage. Declined anyway: they need a dev/prod split of
 * their own (Turbopack's CSS HMR injects `<style>` elements at runtime, so
 * dev's `style-src-elem` would have to diverge from prod's), and they
 * complicate the exact-string assertion that is this file's whole point.
 * Recorded so it reads as a decision, not an omission — a v1.1 candidate,
 * not a gap.
 */

/**
 * The site uses none of these browser features. Enumerated by name rather
 * than left to a wildcard default so a reader can see exactly what was
 * considered and declined, not merely that something was.
 */
export const PERMISSIONS_POLICY =
  "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()";

/**
 * Returns the exact Content-Security-Policy header value for the given
 * environment. Production is the single source of truth D-4.2 locks;
 * `tests/unit/csp.test.ts` asserts it character for character.
 *
 * Dev relaxes exactly what dev needs and nothing more:
 *   - `'unsafe-eval'` in `script-src`, required by Turbopack's dev runtime.
 *   - `connect-src` widened with `ws:` to permit the HMR websocket.
 * Every other directive — critically the whole `style-src` token set — is
 * byte-identical between dev and prod. That parity is what lets Task 3's
 * dev-tier browser proof (Shiki token colour surviving with the CSP header
 * delivered) stand in for a production proof: `tests/unit/csp.test.ts`
 * asserts the two `style-src` token sets are the same set, so whatever the
 * browser proved under dev's policy holds under prod's too.
 */
export function buildCsp({ dev }: { dev: boolean }): string {
  const directives: Array<[string, string[]]> = [
    ["default-src", ["'self'"]],
    [
      "script-src",
      dev ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] : ["'self'", "'unsafe-inline'"],
    ],
    // Identical in dev and prod — see "TWO inline-style consumers" above.
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["img-src", ["'self'", "data:"]],
    ["font-src", ["'self'"]],
    ["connect-src", dev ? ["'self'", "ws:"] : ["'self'"]],
    ["frame-ancestors", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'none'"]],
    ["object-src", ["'none'"]],
  ];

  const parts = directives.map(([name, values]) => `${name} ${values.join(" ")}`);
  // A bare directive with no value list — no trailing `;`.
  parts.push("upgrade-insecure-requests");

  return parts.join("; ");
}
