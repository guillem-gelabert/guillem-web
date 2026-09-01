---
phase: 06-cv-contact-photo-discoverability
plan: 01
subsystem: routing
tags: [nextjs-proxy, wcag-3.1.1, node-test, playwright, cr-01]

# Dependency graph
requires:
  - phase: 02-content-pipeline
    provides: "lib/content.ts (publishedFor, selectForLocale, assertFrontmatter, SAFE_SLUG shape), lib/locales.ts (PATH_TOKEN, UI, indexPath), and CR-01's original root-cause isolation (deferred-items.md)"
provides:
  - "proxy.ts — Next 16 proxy convention (not middleware.ts), rewriting unmatched/cross-locale /writing/:slug and /texte/:slug to a real per-locale 404 route with an explicit 404 status"
  - "lib/locales.ts NOT_FOUND_SLUG + notFoundPath() — the fixed rewrite-target constant plan 06-05's sitemap must also read"
  - "components/not-found-body.tsx — the single localised 404 body, shared by both not-found.tsx boundaries and both reserved pages"
  - "Two reserved routes: app/(en)/writing/not-found-page, app/(de)/texte/nicht-gefunden — self-guarding, noindex, own title+description"
  - "tests/unit/proxy-slugs.test.ts — binds the proxy's slug predicate to lib/content.ts's real selection logic"
affects: [06-05-sitemap-robots, 06-02-csp-headers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next 16 proxy.ts convention: NextResponse.rewrite(url, { status }) to set an HTTP status before an App Router page renders, since pages themselves cannot set one"
    - "Relative imports + explicit .ts/.js extensions in files that must be directly importable by plain `node --test` (no bundler, no tsconfig paths resolution)"
    - "Binding unit test pattern: when a real function can't run under the test runner (bundler-only dynamic import), bind to the pure sub-function it delegates to (selectForLocale) fed with independently-read, assertFrontmatter()-validated data, rather than re-deriving the rule with no real-code binding at all"

key-files:
  created:
    - proxy.ts
    - components/not-found-body.tsx
    - app/(en)/writing/not-found-page/page.tsx
    - app/(de)/texte/nicht-gefunden/page.tsx
    - tests/unit/proxy-slugs.test.ts
  modified:
    - lib/locales.ts
    - app/(en)/writing/not-found.tsx
    - app/(de)/texte/not-found.tsx
    - tests/writing-not-found.spec.ts
    - tests/global-setup.ts

key-decisions:
  - "proxy.ts uses relative imports (./lib/content.ts, ./lib/locales.ts) and next/server.js instead of the @/ alias and bare next/server every other module uses, because tests/unit/proxy-slugs.test.ts imports it directly under plain node --test, which resolves neither tsconfig paths nor a next/server subpath missing its extension (next's package.json has no exports field). Verified identical once Turbopack bundles it."
  - "isPublished restates D-11's showDrafts() (NODE_ENV === development) alongside the locale filter, not just the locale filter as the plan's action text literally described — without it a draft would 404 at its own URL in next dev even though publishedFor() lists it on the index, because the proxy's matcher sits in front of [slug]/page.tsx's own check."
  - "tests/unit/proxy-slugs.test.ts binds to lib/content.ts's selectForLocale() + assertFrontmatter(), not the literal publishedFor(), because publishedFor()/allPosts() cannot run under plain node --test (loadPostModule's import(`@/content/${slug}.mdx`) is a bundler-only alias specifier) — confirmed by tests/unit/content.test.ts's own pre-existing header comment and reproduced directly against publishedFor() before choosing the substitution."
  - "Both reserved pages export their own metadata.description (reusing UI.{en,de}.notFoundBody, no new UI key) rather than inheriting the root layouts' still-placeholder descriptions — caught by the pre-existing WR-06 build-tier invariant for the German route, applied to English too for consistency."

patterns-established:
  - "Proxy-tier 404: NextResponse.rewrite(url, { status: 404 }) to a real per-locale page is the only way to get a genuine (non-hydration-only) localised 404 in Next 16.3.3 App Router with two root layouts."

requirements-completed: [FIND-02]

# Metrics
duration: ~50min
completed: 2026-09-01
---

# Phase 6 Plan 1: CR-01 Proxy Fix Summary

**`proxy.ts` (Next 16's file convention, not `middleware.ts`) closes the WCAG 3.1.1 defect where `/writing/<unknown>` and `/texte/<unbekannt>` served `<html id="__next_error__">` with an empty body and no `lang` under JavaScript-disabled — now a genuine, server-rendered, correctly-localised 404 on both locales, with a binding unit test proving the proxy's slug predicate never drifts from `lib/content.ts`'s real selection rules.**

## Performance

- **Duration:** ~50 min (estimate; six commits span 2026-09-01T11:39–12:02+02:00, plus setup/investigation before the first commit)
- **Tasks:** 3 (all completed), plus 3 auto-fix commits (Rules 1 and 3)
- **Files modified:** 10 (5 created, 5 modified)

## Accomplishments

- `proxy.ts` rewrites any unmatched or cross-locale `/writing/:slug` / `/texte/:slug` request to a real per-locale reserved page with `{ status: 404 }`, set **before** the App Router render starts — measured 404 + correct `<html lang>` + correct localised `<h1>` + non-default `<title>` + non-placeholder `<meta name="description">`, in the **server HTML with JavaScript disabled**, on both locales.
- The 404 body exists in exactly one component (`components/not-found-body.tsx`), rendered by both segment `not-found.tsx` boundaries and both proxy-rewritten reserved pages.
- `tests/unit/proxy-slugs.test.ts` proves the proxy's predicate and `lib/content.ts`'s real selection agree, per locale, in both `NODE_ENV` values, and was demonstrated red once on an induced drift.
- `tests/writing-not-found.spec.ts`'s 14-line KNOWN GAP block is gone, replaced by working no-JS assertions plus two new case families (cross-locale rejection, reserved-target self-guarding).

## Task Commits

Each task was committed atomically, plus three auto-fix commits discovered while executing Tasks 2 and 3 (documented under Deviations):

1. **Task 1: proxy.ts, the two reserved 404 routes, and the one shared 404 body** — `f5b2e41` (feat)
2. **[Rule 3 - Blocking] make proxy.ts importable by plain node --test** — `f517f66` (fix)
3. **[Rule 1 - Bug] proxy predicate honours NODE_ENV draft visibility (D-11)** — `e76b7a2` (fix)
4. **Task 2: the binding unit test** — `68421c6` (test)
5. **Task 3: replace the KNOWN GAP block with no-JS and cross-locale assertions** — `ab0a62d` (test)
6. **[Rule 1 - Bug] reserved 404 pages declare their own meta description** — `29cdb07` (fix)

_No plan-metadata commit: per this session's objective, STATE.md/ROADMAP.md are not updated by this executor (parallel-wave orchestrator owns that pass after merge)._

## Files Created/Modified

- `proxy.ts` — the CR-01 fix: `export function proxy`, `export function isPublished`, `export const config = { matcher: [...] }`
- `components/not-found-body.tsx` — `export function NotFoundBody({ locale })`, the single source for the 404 JSX
- `app/(en)/writing/not-found-page/page.tsx` — EN reserved rewrite target, own `title` + `description`
- `app/(de)/texte/nicht-gefunden/page.tsx` — DE reserved rewrite target, own `title` + `description`
- `tests/unit/proxy-slugs.test.ts` — the binding test (6 cases)
- `lib/locales.ts` — added `NOT_FOUND_SLUG`, `notFoundPath()`
- `app/(en)/writing/not-found.tsx`, `app/(de)/texte/not-found.tsx` — now render `<NotFoundBody locale="..." />`
- `tests/writing-not-found.spec.ts` — KNOWN GAP replaced; no-JS LOCALE_CASES; cross-locale table; reserved-target table
- `tests/global-setup.ts` — `ROUTES` gains `/texte/gibt-es-nicht`, `/writing/not-found-page`, `/texte/nicht-gefunden`

## Decisions Made

See `key-decisions` in frontmatter. In short: proxy.ts had to trade the codebase's usual `@/` alias for relative imports (testability under plain `node --test`); the draft-visibility rule had to be restated in the proxy (not just the locale filter) to avoid a real dev-mode regression; the binding test binds to `selectForLocale()`/`assertFrontmatter()` rather than the literal `publishedFor()` because the latter cannot run outside a bundler; and both reserved pages needed their own `description` to avoid leaking either root layout's placeholder text.

## Measured Curl Table (all nine paths, `next start`, no JavaScript)

| path | status | `<html lang>` | `<h1>` |
|---|---|---|---|
| `/writing/does-not-exist` | 404 | `en` | `Not found` |
| `/texte/gibt-es-nicht` | 404 | `de` | `Nicht gefunden` |
| `/writing/die-darstellung-aendert-sich` (cross-locale) | 404 | `en` | `Not found` |
| `/texte/the-chart-therefore-changes` (cross-locale) | 404 | `de` | `Nicht gefunden` |
| `/writing/not-found-page` (direct hit) | 404 | `en` | — |
| `/texte/nicht-gefunden` (direct hit) | 404 | `de` | — |
| `/writing/the-chart-therefore-changes` | 200 | `en` | *(post title)* |
| `/texte/die-darstellung-aendert-sich` | 200 | `de` | *(post title)* |
| `/nope` | 404 | `en` | `Not found` |

Both 404 titles: `Not found — Guillem Gelabert` / `Nicht gefunden — Guillem Gelabert` (never the bare `Guillem Gelabert`). Both 404 descriptions: `That piece doesn't exist here.` / `Diesen Text gibt es hier nicht.` (never the layout placeholder). Both reserved routes carry exactly one `<meta name="robots" content="noindex">`. Zero `middleware` deprecation warnings in the build log.

**Measured latency** (local `next start`): landing ≈1.5ms, 404 ≈4.4ms, published post ≈2.8ms.

## Induced-Drift Demonstration (Task 2 requirement)

Temporarily set `draft: true` on `content/the-chart-therefore-changes.mdx` (a currently-published post) and re-ran `node --test tests/unit/proxy-slugs.test.ts`. Test 3 (`the-chart-therefore-changes (EN case study) is admitted for en and rejected for de`) went red with:

```
Expected values to be strictly equal:
false !== true
```

Restored the file (`git diff` confirmed empty afterward) and reconfirmed 108/108 green.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] proxy.ts made importable by plain `node --test`**
- **Found during:** Task 2 (designing the binding unit test)
- **Issue:** `proxy.ts` as committed in Task 1 used the `@/` alias and a bare `next/server` specifier. Both resolve fine under Turbopack's bundler resolution (the build passed) but neither resolves under plain Node's ESM loader (`ERR_MODULE_NOT_FOUND` on both, reproduced and diagnosed in isolation), which Task 2's own test must directly import.
- **Fix:** `@/lib/content`, `@/lib/locales` → relative `./lib/content.ts`, `./lib/locales.ts`; `next/server` → `next/server.js` (identical file, explicit extension).
- **Files modified:** `proxy.ts`
- **Verification:** `rm -rf .next && npm run build` still succeeds with zero deprecation warnings; the same nine-path curl table still matches; `npx tsc --noEmit` clean.
- **Committed in:** `f517f66`

**2. [Rule 1 - Bug] proxy predicate honours `NODE_ENV` draft visibility (D-11)**
- **Found during:** Task 2 (the plan requires the proxy predicate and `publishedFor()` to still agree under `development`, where `publishedFor()` shows drafts)
- **Issue:** `isPublished` rejected drafts unconditionally, regardless of `NODE_ENV`. Since `publishedFor()` DOES surface drafts in `next dev` (`showDrafts()`), the proxy would have 404'd a draft's own URL in dev the instant its `/writing` index link was followed — a real regression, not just a test-design mismatch, because the proxy's matcher runs in front of `[slug]/page.tsx`'s own `publishedFor()` check.
- **Fix:** Restated `showDrafts()` (`NODE_ENV === "development"`) inside `proxy.ts`, alongside the already-restated locale filter.
- **Files modified:** `proxy.ts`
- **Verification:** production behaviour re-confirmed unchanged (`fixture` still 404s, both published posts still 200, against a real `next start`); `tests/unit/proxy-slugs.test.ts` test 2 (development agreement) passes.
- **Committed in:** `e76b7a2`

**3. [Rule 3 - Blocking, substitution] Binding test binds to `selectForLocale()`/`assertFrontmatter()`, not the literal `publishedFor()`**
- **Found during:** Task 2
- **Issue:** The plan's must_haves/key_links specify binding to `lib/content.ts publishedFor`. `publishedFor()` = `selectForLocale(await allPosts(), lang)`, and `allPosts()` loads every post through `loadPostModule`'s `import(\`@/content/${slug}.mdx\`)` — a bundler-only alias specifier. `tests/unit/content.test.ts`'s own pre-existing header comment already documents this as untestable under plain `node --test` ("depend on the bundler's @/ alias... covered end-to-end by the Playwright specs instead"); reproduced the identical `ERR_MODULE_NOT_FOUND` directly against `publishedFor()` before choosing the substitution.
- **Fix:** The test reads `content/`'s real front-matter independently (a minimal single-line-value reader), validates it through the real, unmodified `assertFrontmatter()`, and feeds the result into the real, unmodified `selectForLocale()` — the exact selection algorithm `publishedFor()` delegates to for everything the slug-set question touches.
- **Files modified:** `tests/unit/proxy-slugs.test.ts`
- **Verification:** all 6 cases pass; induced-drift demonstration (above) proves the binding actually catches divergence.
- **Committed in:** `68421c6`

**4. [Rule 1 - Bug] Reserved 404 pages declare their own meta description**
- **Found during:** post-Task-3 full-gate verification (`npm run test:all`, the project's actual pre-commit gate per `./CLAUDE.md`)
- **Issue:** `app/(de)/texte/nicht-gefunden/page.tsx` exported only `title`, so it inherited `app/(de)/layout.tsx`'s still-placeholder description ("Entwickler."), failing the pre-existing build-tier invariant `tests/build/prerender.test.ts`: "the German layout's default description reaches no shipped route (WR-06)" — every other `(de)` route already declares its own.
- **Fix:** Both reserved pages now export `metadata.description`, reusing `UI.{en,de}.notFoundBody` (no new UI key; D-1.5 forbids growing the `UI` map for this plan). Applied to English too for consistency, though no existing test covered that side.
- **Files modified:** `app/(de)/texte/nicht-gefunden/page.tsx`, `app/(en)/writing/not-found-page/page.tsx`
- **Verification:** `npm run test:all` — 108/108 unit, 22/22 build (including the previously-failing case), 131/131 Playwright.
- **Committed in:** `29cdb07`

---

**Total deviations:** 4 auto-fixed (2× Rule 1 - bug, 2× Rule 3 - blocking issue)
**Impact on plan:** All four were necessary for correctness (draft visibility, description leakage) or for the plan's own mandated test to be executable at all (import resolution, the `publishedFor()` substitution). No scope creep — no file outside the plan's `files_modified` list was touched.

## Issues Encountered

**Playwright port contention during Task 3's first run.** All 22 tests in `tests/writing-not-found.spec.ts` (including pre-existing, previously-passing cases like `/nope`) returned HTTP 500 on the first `--repeat-each=2` run. Traced to `playwright.config.ts`'s `reuseExistingServer: !process.env.CI`: a sibling parallel executor's `npm run dev` was transiently bound to `:3000` during a race window immediately after my own `lsof -ti:3000` check reported the port free, so Playwright silently attached to the sibling's server instead of starting its own. Re-ran after re-confirming `lsof -ti:3000` was empty immediately beforehand — 22/22 passed cleanly, twice. This matches the port-contention hazard the orchestrator's own instructions flagged in advance; no code change was needed.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `NOT_FOUND_SLUG` / `notFoundPath()` in `lib/locales.ts` are ready for plan 06-05's sitemap to read (both reserved routes must stay excluded from `sitemap.xml`).
- `proxy.ts` exists and is verified working; plan 06-02 (CSP/headers) must NOT add a `runtime` key or consolidate headers into this file (D-4.1 / this plan's own header comment already record why).
- `robots: { index: false }` in both root layouts is untouched by this plan, as required.
- Working tree is clean; all six commits are on this worktree's branch (`worktree-agent-ac1a1182b6a688063`), ready for the orchestrator's merge.

---
*Phase: 06-cv-contact-photo-discoverability*
*Plan: 01*
*Completed: 2026-09-01*

## Self-Check: PASSED

All 10 claimed files verified present on disk (`proxy.ts`, `components/not-found-body.tsx`,
`app/(en)/writing/not-found-page/page.tsx`, `app/(de)/texte/nicht-gefunden/page.tsx`,
`tests/unit/proxy-slugs.test.ts`, `lib/locales.ts`, `app/(en)/writing/not-found.tsx`,
`app/(de)/texte/not-found.tsx`, `tests/writing-not-found.spec.ts`, `tests/global-setup.ts`).
All 6 claimed commit hashes verified present in `git log` (`f5b2e41`, `f517f66`, `e76b7a2`,
`68421c6`, `ab0a62d`, `29cdb07`).
