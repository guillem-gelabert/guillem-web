---
phase: 06-cv-contact-photo-discoverability
plan: 02
subsystem: infra
tags: [csp, security-headers, next-config, playwright, node-test, shiki, remark-gfm]

# Dependency graph
requires:
  - phase: 02-content-pipeline
    provides: "the two inline-style consumers (Shiki token spans, remark-gfm table alignment) this CSP has to tolerate"
provides:
  - "lib/csp.ts — pure buildCsp({dev}) + PERMISSIONS_POLICY, the single source of the CSP string"
  - "next.config.ts headers() delivering the six-header BUILD-04 set on /:path*, including /_next/static/*"
  - "three-layer verification: exact-string unit test, real-response Playwright delivery test, dev-tier CSP-enforcement proof for Shiki/remark-gfm colour"
affects: [06-01, 06-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure config-builder function (buildCsp({dev})) so a value that must never leak a dev relaxation into production can be asserted by an exact-string unit test without starting a server"
    - "headers() called with buildCsp() invoked inside the function body, not at module scope, so process.env.NODE_ENV is read fresh per request/build rather than baked in at config-load time"

key-files:
  created:
    - lib/csp.ts
    - tests/unit/csp.test.ts
    - tests/security-headers.spec.ts
  modified:
    - next.config.ts
    - tests/prose-code.spec.ts

key-decisions:
  - "style-src stays 'self' 'unsafe-inline' in both dev and prod, identical token sets, because TWO consumers emit inline style attributes (Shiki token spans, remark-gfm table alignment) and CSP has no nonce mechanism for style attributes"
  - "script-src keeps 'unsafe-inline' because Next's RSC flight payload is an inline <script>; the nonce/middleware route is declined for v1 since it forces dynamic rendering on an entirely static site"
  - "headers() in next.config.ts, not proxy.ts — proxy.ts (06-01, not yet merged into this worktree) is path-matched and structurally cannot cover /_next/static/*, so headers() is the correct tier even though a proxy now exists"
  - "style-src-elem and script-src-attr measured available at zero cost but declined for v1 — they need their own dev/prod split (Turbopack's CSS HMR injects <style> elements) and would complicate the exact-string unit test"
  - "No HSTS preload, no X-Frame-Options, no X-XSS-Protection, no Cross-Origin-Resource-Policy, no X-DNS-Prefetch-Control, no COEP — each omission argued in-place in next.config.ts"

patterns-established:
  - "Three-tier CSP verification: tests/unit/csp.test.ts owns the exact production string (server-free), tests/security-headers.spec.ts owns real delivery (dev tier), the post-deploy curl in plan 06-11 owns the live production value"

requirements-completed: [BUILD-04]

duration: ~45min
completed: 2026-09-01
---

# Phase 6 Plan 2: CSP and Security Response Headers Summary

**A pure `buildCsp({dev})` function delivers a six-header, fully-justified security response set via `next.config.ts` `headers()` on every route including static assets, with the `style-src`/`script-src` `'unsafe-inline'` tradeoff argued in place and proven against a real browser under CSP enforcement.**

## Performance

- **Duration:** ~45 min
- **Completed:** 2026-09-01T09:46:46Z
- **Tasks:** 3/3 completed
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments

- `lib/csp.ts` — a pure `buildCsp({dev}): string` with zero `process.env` reads of its own, so `node --test` can assert the exact production policy without a server, while `next.config.ts` (evaluated in a long-lived Node process at build and `next start`) is the only place `NODE_ENV` is read.
- The production policy is delivered byte-identical to the D-4.2 interface string, verified against a real `next start` response on `/`, `/cv`, the proxy-rewritten-shape 404 (`/texte/gibt-es-nicht`, currently Next's default 404 since `proxy.ts`/06-01 has not merged into this worktree), the global 404 (`/nope`), and a `/_next/static/chunks/*.js` asset.
- G9's three-part proof implemented: (1) `tests/prose-code.spec.ts`'s token-colour test now asserts the CSP header is delivered with `style-src 'unsafe-inline'` and no browser CSP violation for style, *before* trusting the colour claim; (2) `tests/unit/csp.test.ts` asserts dev/prod `style-src` token-set parity, transferring (1)'s dev-tier proof to production; (3) plan 06-11 owns the post-deploy curl.
- Every omitted header (`X-Frame-Options`, `X-XSS-Protection`, `Cross-Origin-Resource-Policy`, `X-DNS-Prefetch-Control`, COEP, HSTS `preload`) is documented in place in `next.config.ts` with its reason.

## Task Commits

1. **Task 1: lib/csp.ts — pure function and exact-string unit test** - `c426566` (feat)
2. **Task 2: wire headers() in next.config.ts** - `8969d42` (feat)
3. **Task 3: delivery proof in the browser, and G9's three-part code-colour proof** - `f478b70` (test)

_Plan metadata commit to follow this SUMMARY._

## Files Created/Modified

- `lib/csp.ts` — pure `buildCsp({dev})`, `PERMISSIONS_POLICY`, and the full honest-framing comment block (script-src and style-src `'unsafe-inline'` tradeoffs, both inline-style consumers named, the two declined free strengthenings)
- `tests/unit/csp.test.ts` — exact-string assertion on the production policy, no `'unsafe-eval'`/`ws:` in prod, dev/prod `style-src` token-set parity (with a named-divergent-token failure message), `PERMISSIONS_POLICY` membership
- `next.config.ts` — `async headers()` returning the six-header set on `source: "/:path*"`, with the proxy-vs-headers seam and every omission commented in place; `pageExtensions` and `experimental.globalNotFound` untouched
- `tests/security-headers.spec.ts` — real-response header delivery on `/`, `/cv`, and a `/_next/static/` asset discovered from the page; `frame-ancestors`/`object-src`/`base-uri`/`form-action` presence; `X-Frame-Options`/`X-XSS-Protection` absence
- `tests/prose-code.spec.ts` — the existing token-colour test extended (not duplicated) with the CSP-delivery precondition and a console-violation check

## Decisions Made

- **The seam with 06-01's `proxy.ts`, stated explicitly:** this plan's `files_modified` list does not include `proxy.ts`, and per the parallel-execution instructions I did not create it. `proxy.ts` did not exist anywhere in this worktree at any point during this plan's execution (06-01 runs in a sibling worktree). The plan itself (06-02-PLAN.md Task 2) is explicit that headers belong in `next.config.ts` `headers()`, not `proxy.ts` — a path-matched proxy cannot see `/_next/static/*` requests, so it structurally cannot deliver these headers there. This composes cleanly with 06-01: once merged, `proxy.ts` will own the CR-01 404 rewrite and `next.config.ts` will independently own the header set, with no file-ownership conflict. I recorded this reasoning as an in-place comment in `next.config.ts` so a future reader does not "fix" it by moving headers into the proxy. Note: `06-VALIDATION.md` suggested the headers "ride along with" the proxy, but the 06-02-PLAN.md task instructions (the authoritative source for this plan's execution) explicitly override that and direct `headers()` — I followed the plan.
- **Console-violation match text corrected from the plan's assumption.** The plan's Task 3 action said to check for a `"Refused to apply inline style"` console message. Measured directly (narrowing `lib/csp.ts`'s dev `style-src` to `'self'` and recording real browser output — see below): this Chromium build emits `"Applying inline style violates the following Content Security Policy directive 'style-src ...'"`, not the older phrasing. The test now matches on `"Content Security Policy directive"` + `"style"` together, which is robust to either wording and was verified to actually catch the violation (Rule 1 — the originally planned text would never have matched, silently defeating the assertion).
- **`style-src`/`script-src` scoping bug in the token-colour test, caught during the required demonstration.** My first draft of the CSP-delivery precondition checked `csp.toContain("'unsafe-inline'")` against the *whole* policy string. Because `script-src` also carries `'unsafe-inline'`, that assertion passed even when `style-src` itself was narrowed to `'self'` — it would never have caught the real regression it exists to catch. Fixed to extract and check the `style-src` directive specifically (Rule 1 — bug in the verification I wrote, caught by actually running the demonstration rather than assuming it would work).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Console-violation match text did not match reality**
- **Found during:** Task 3, demonstrating the required "test fails when style-src is narrowed" acceptance criterion
- **Issue:** The plan's action text specified matching console output for `"Refused to apply inline style"`. A direct browser probe (narrowing `lib/csp.ts`'s dev `style-src` to `'self'` and capturing `page.on("console")` output against `/writing/fixture`) showed the actual message is `"Applying inline style violates the following Content Security Policy directive 'style-src 'self''. Either the 'unsafe-inline' keyword, a hash (...), or a nonce (...) is required to enable inline execution. ... The action has been blocked."` — a different phrasing that the planned substring would never match.
- **Fix:** Matched on `"Content Security Policy directive"` AND (case-insensitive) `"style"` together instead, and recorded the measured real message in a code comment.
- **Files modified:** `tests/prose-code.spec.ts`
- **Verification:** Re-ran the narrowing demonstration; the fixed filter correctly identifies the violation (though in practice the test now fails earlier, at the `style-src` precondition assertion itself — see deviation 2).
- **Committed in:** `f478b70` (Task 3 commit)

**2. [Rule 1 - Bug] `'unsafe-inline'` presence check was not scoped to `style-src`**
- **Found during:** Task 3, the same demonstration
- **Issue:** `expect(csp).toContain("'unsafe-inline'")` checked the whole policy string. `script-src` also carries `'unsafe-inline'`, so narrowing only `style-src` to `'self'` left this assertion passing — a false negative that would have shipped a broken regression gate.
- **Fix:** Extract the `style-src` directive's value specifically via regex and assert `'unsafe-inline'` against that substring only.
- **Files modified:** `tests/prose-code.spec.ts`
- **Verification:** With `style-src` narrowed to `'self'` in `lib/csp.ts`'s dev branch, the test now correctly fails with `Expected substring: "'unsafe-inline'"` / `Received string: "'self'"`. Reverted, confirmed 32/32 pass with `--repeat-each=2`.
- **Committed in:** `f478b70` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — bugs in this plan's own verification code, caught by actually performing the required once-only demonstration rather than assuming the assertions would behave as written).
**Impact on plan:** Both fixes are inside the test files this plan owns; no scope creep, no change to `lib/csp.ts` or `next.config.ts` beyond the temporary/reverted narrowing used to demonstrate the gate.

## Issues Encountered

- **`.next` ISR-cache pollution during Task 2 verification.** Running the header curl loop against `npx next start` for `/texte/gibt-es-nicht` (an unknown slug, since `proxy.ts`/CR-01 has not merged into this worktree) caused Next's default file-system ISR cache to materialize `.next/server/app/texte/gibt-es-nicht.html` — the fallback-404 shell, carrying the German layout's default `"Entwickler."` description. A subsequent `npm run test:build` then read that cached file and failed `tests/build/prerender.test.ts`'s "(de) layout's default description reaches no shipped route" check, which loops over every route Next has ever built to disk. This was **not** a real regression: a completely fresh `rm -rf .next && npm run build && npm run test:build`, run as its own isolated cycle with no `next start` in between, passes 22/22 — identical to the pre-plan baseline. Resolved by treating the plan's two verification blocks (the header curl loop, and `test:build`) as independent cycles, each starting from its own `rm -rf .next`, exactly as the plan's acceptance criteria list them as separate bullet points. No code change; documented here so a future reader does not mistake transient ISR cache contamination for a build regression.
- **`next-env.d.ts` toggles between dev and build type paths on every `next dev`/`next build` invocation** (`.next/dev/types/...` vs `.next/types/...`), as flagged in the parallel-execution instructions. Reverted with `git checkout -- next-env.d.ts` after every build/dev cycle so it never entered a commit. Confirmed via final `git status --short` (empty) before finishing.

## Verification Evidence

### Exact production policy, delivered by curl against a real `next start` (port 3198)

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'; upgrade-insecure-requests
```

Matches `buildCsp({dev:false})`'s literal in `tests/unit/csp.test.ts` character for character.

### Five-surface delivery table

| Surface | All six headers delivered? | Status |
|---|---|---|
| `/` (prerendered static) | Yes | 200 |
| `/cv` | Yes | 200 |
| `/texte/gibt-es-nicht` (unknown slug; 404 fallback since `proxy.ts`/06-01 not yet merged here) | Yes | 404 |
| `/nope` (global 404) | Yes | 404 |
| `/_next/static/chunks/310vm2bl3xxpt.js` | Yes (CSP confirmed present) | 200 |

`X-Frame-Options`, `X-XSS-Protection`, `Cross-Origin-Resource-Policy`, `Cross-Origin-Embedder-Policy` confirmed absent on every surface checked.

### Browser console message observed with `style-src` narrowed to `'self'` (dev branch, temporary, reverted)

```
[error] Applying inline style violates the following Content Security Policy directive 'style-src 'self''.
Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to enable
inline execution. Note that hashes do not apply to event handlers, style attributes and javascript:
navigations unless the 'unsafe-hashes' keyword is present. The action has been blocked.
```

(~50 occurrences on a single `/writing/fixture` load — one per inline-styled token span / aligned table cell, matching the fixture's measured 15 Shiki colours + table alignments plus framework-level inline styles.) `tests/prose-code.spec.ts`'s token-colour test correctly fails under this narrowing (`Expected substring: "'unsafe-inline'"` / `Received: "'self'"`), then passes again once reverted.

### Two declined free strengthenings — decision record

`style-src-elem 'self'` and `script-src-attr 'none'` were measured (06-RESEARCH.md) as available at zero cost — zero inline `<style>` elements and zero `on*=` handlers across `/`, `/cv` and the case study's built HTML. Declined for v1 per the plan's explicit instruction: they require their own dev/prod split (Turbopack's CSS HMR injects `<style>` elements at runtime in dev) and would complicate the exact-string unit test that is `lib/csp.ts`'s whole point. Recorded as a comment in `lib/csp.ts` so it reads as a considered decision, not a gap — a v1.1 candidate.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `BUILD-04` is complete: six-header security response set, fully justified, delivered on every response class.
- Ready to merge with 06-01's `proxy.ts` (CR-01) — no file overlap; `headers()` and `proxy.ts` are independent mechanisms confirmed to compose (headers() covers what the proxy structurally cannot: `/_next/static/*`).
- `06-11`'s post-deploy verification can now run its `curl` against the live Railway URL and compare directly against the literal in `tests/unit/csp.test.ts`.
- No blockers for downstream plans in this phase.

## Self-Check: PASSED

All claimed files found on disk (`lib/csp.ts`, `tests/unit/csp.test.ts`, `tests/security-headers.spec.ts`, `next.config.ts`, `tests/prose-code.spec.ts`, this SUMMARY.md). All three task commit hashes (`c426566`, `8969d42`, `f478b70`) confirmed present in `git log --oneline --all`.

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*
