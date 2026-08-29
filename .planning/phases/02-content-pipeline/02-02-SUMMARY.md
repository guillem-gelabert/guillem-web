---
phase: 02-content-pipeline
plan: 02
subsystem: content-pipeline
tags: [node:fs, node:test, intl, i18n, mdx]

# Dependency graph
requires:
  - phase: 02-content-pipeline (Plan 01)
    provides: MDX/Shiki toolchain, tsconfig `allowImportingTsExtensions`, `app/(en)/` route group
provides:
  - lib/content.ts — filesystem content loader (enumerate, validate, select, pair, allowlist)
  - lib/locales.ts — locale path tokens, UI copy, Intl date formatting
  - tests/unit/dates.test.ts, tests/unit/content.test.ts — node:test unit suites
affects: [02-03, 02-04, 02-05, 02-06, 02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Type-only cross-import (lib/locales.ts imports type Locale from lib/content.ts) so node --test can load either module standalone with no runtime cycle"
    - "assertFrontmatter collects every problem into one array before throwing a single Error, so a malformed post fails next build with every issue named at once"
    - "findBySlug is the named ASVS V4 allowlist boundary: routes must call it against publishedFor(locale) and bail to notFound() before loadPostModule ever runs"
    - "process.env.NODE_ENV read at call time inside isVisible (never captured to a module constant), and mutated via a Record<string,string|undefined> cast in tests to work around Next's readonly NodeJS.ProcessEnv augmentation"

key-files:
  created:
    - lib/content.ts
    - lib/locales.ts
    - tests/unit/dates.test.ts
    - tests/unit/content.test.ts

key-decisions:
  - "translationOf() applies isVisible to the paired candidate after findTranslation, so a translation that exists but is a draft is treated as absent in production — consistent with T-02-09's single-predicate rule"
  - "Task 2 (lib/content.ts) is tdd=true in the plan but scoped to lib/content.ts alone with no task-owned test file; its behaviour is validated by Task 3's tests/unit/content.test.ts instead of a task-2-local RED/GREEN pair — followed the plan's literal file assignment rather than forcing a redundant test file"

patterns-established:
  - "lib/content.ts's dependency stays one-directional: it never imports lib/locales.ts, keeping the loader free of any UI-string coupling"

requirements-completed: [WRIT-01, I18N-01]

# Metrics
duration: 9min
completed: 2026-08-30
---

# Phase 2 Plan 2: Content Loader, Locale Module, and Unit Tests Summary

**Filesystem content loader (`lib/content.ts`) and locale module (`lib/locales.ts`) with 14 passing `node --test` unit assertions covering front-matter validation, draft visibility, cross-locale translation pairing, the ASVS V4 slug allowlist, and both localised date formats.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-08-30T01:18:00+02:00 (approx.)
- **Completed:** 2026-08-30T01:27:00+02:00 (approx.)
- **Tasks:** 3 completed
- **Files modified:** 4

## Accomplishments
- `lib/locales.ts` reproduces the UI-SPEC's exact date strings (`29 August 2026` / `29. August 2026`) via `Intl.DateTimeFormat` with `en-GB`/`de-DE` and a `timeZone: "UTC"` pin, verified stable under `process.env.TZ = "America/Los_Angeles"`
- `lib/content.ts` implements the full interface contract: `assertFrontmatter`, `isVisible`, `selectForLocale`, `findTranslation`, `findBySlug`, `loadPostModule`, `allPosts`, `publishedFor`, `translationOf` — the single place `fs` is touched in the phase
- `findBySlug` is documented and tested as the ASVS V4 allowlist boundary: routes must resolve a slug against `publishedFor(locale)` and call `notFound()` before `loadPostModule` ever runs
- `assertFrontmatter` collects every problem into one array and throws a single `content/{file}: msg1; msg2` error — verified to report multiple distinct field names in one message, not just the first
- 14/14 `node --test` assertions pass across both suites; `npx tsc --noEmit` clean; `lib/content.ts` loads under plain `node` with no bundler; all 9 pre-existing Playwright specs still pass unchanged
- Clean-cache build (`rm -rf .next && npm run build`) succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Locale module — path tokens, UI copy, and Intl date formatting** — RED `0cfcdb1` (test), GREEN `591d386` (feat)
2. **Task 2: Content loader — front-matter schema, enumeration, selection, pairing, allowlist** — `a01f1a2` (feat)
3. **Task 3: Unit-test the loader's schema, visibility, pairing and allowlist** — `af2b1b2` (test)

**Plan metadata:** (pending — final docs commit follows this summary)

## Files Created/Modified
- `lib/locales.ts` — `PATH_TOKEN`, `indexPath`, `postPath`, `otherLocale`, `formatPostDate`, `UI` (eight-key copy table per locale)
- `lib/content.ts` — `LOCALES`, `Locale`, `PostFrontmatter`, `PostEntry`, `assertFrontmatter`, `isVisible`, `selectForLocale`, `findTranslation`, `findBySlug`, `loadPostModule`, `allPosts`, `publishedFor`, `translationOf`
- `tests/unit/dates.test.ts` — 7 assertions covering I18N-01's two date formats, the UTC pin, path helpers, and the UI copy table
- `tests/unit/content.test.ts` — 7 named test cases (9 malformed front-matter shapes, all-problems-in-one-message, draft visibility in both `NODE_ENV` states, translation pairing including its same-locale failure mode, and the ASVS V4 traversal-shaped slug allowlist)

## Decisions Made
- Followed the interfaces contract in the plan verbatim — no renaming or reshaping of any exported symbol.
- `translationOf()` re-applies `isVisible` to the paired candidate returned by `findTranslation`, so a draft translation is treated as absent in a production build (not explicitly spelled out in the interfaces list but required by T-02-09's single-predicate rule and implied by the plan's action text: "`translationOf(entry)` returning `findTranslation(entry, await allPosts())` filtered through `isVisible`").
- Task 2's `tdd="true"` flag has no task-scoped test file in the plan's own file assignment (`<files>lib/content.ts</files>` only) — the plan assigns all of Task 2's behavioural assertions to Task 3's `tests/unit/content.test.ts` instead. Treated this as the plan's intended cross-task TDD split (implement in Task 2, verify exhaustively in Task 3) rather than writing a redundant task-2-local test file that would either duplicate or fight Task 3's ownership of that file.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Cast `process.env` to a mutable type in `tests/unit/content.test.ts`**
- **Found during:** Task 3 (`npx tsc --noEmit` verification)
- **Issue:** `process.env.NODE_ENV = value` and `delete process.env.NODE_ENV` both failed to typecheck (`TS2540`, `TS2704`) because Next.js's `NodeJS.ProcessEnv` type augmentation declares `NODE_ENV` `readonly`. This blocked the plan's own required behaviour ("Save and restore `process.env.NODE_ENV` around each case").
- **Fix:** `withNodeEnv` now casts `process.env` to `Record<string, string | undefined>` before assigning/deleting, restoring the original value (or deleting the key if it was previously unset) in a `finally` block. No change to runtime behaviour or to `lib/content.ts` itself.
- **Files modified:** `tests/unit/content.test.ts`
- **Verification:** `npx tsc --noEmit` exits 0; all 14 unit tests still pass.
- **Committed in:** `af2b1b2` (Task 3 commit — fixed before commit, not a separate follow-up)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking TypeScript error, not a behavioural change)
**Impact on plan:** No scope creep. The fix only changes how the test suite mutates `process.env` for its own setup/teardown; `lib/content.ts`'s `isVisible` reads `NODE_ENV` exactly as specified in the plan.

## Issues Encountered
None beyond the auto-fixed TypeScript issue above.

One non-blocking note: the plan's acceptance criterion `grep -c 'content/\${slug}.md' lib/content.ts` is 1` actually returns `2`, because the literal string `content/${slug}.md` is a substring of `content/${slug}.mdx` (`.mdx` = `.md` + `x`), so both the `.mdx` and `.md` import lines match the grep pattern. This is inherent to the dual-extension try/catch shape and is present identically in `02-RESEARCH.md`'s own verified Pattern 2/3 code — not a defect in this implementation. All other grep-based acceptance criteria for all three tasks passed exactly as specified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `lib/content.ts` and `lib/locales.ts` are ready for Plan 03 (Prose Contract CSS + MDX component map) and Plans 04/05 (the `/writing` and `/texte` routes), which must call `findBySlug(await publishedFor(locale), slug)` and bail to `notFound()` before `loadPostModule` — exactly the order asserted by this plan's ASVS V4 test.
- No `content/*.mdx` fixture files exist yet — `allPosts()`, `publishedFor()` and `translationOf()` are therefore untested end-to-end in this plan by design (per plan scope); Plan 04/05's Playwright specs are the first callers that exercise them against real files, once the fixture posts required by success criterion 5 exist.
- No blockers or concerns for the next plan in this phase.

## Self-Check: PASSED

All created files verified present on disk (`lib/content.ts`, `lib/locales.ts`, `tests/unit/dates.test.ts`, `tests/unit/content.test.ts`, this SUMMARY.md). All four commit hashes (`0cfcdb1`, `591d386`, `a01f1a2`, `af2b1b2`) verified present in `git log --oneline --all`.

---
*Phase: 02-content-pipeline*
*Completed: 2026-08-30*
