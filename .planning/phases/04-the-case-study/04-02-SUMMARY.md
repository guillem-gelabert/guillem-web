---
phase: 04-the-case-study
plan: 02
subsystem: testing
tags: [node-test, playwright, mdx, content-gate, tdd-interface]

# Dependency graph
requires:
  - phase: 04-the-case-study (Plan 01)
    provides: the three committed 2400x1640 PNG figures and live-text snapshots this plan's tests read against
provides:
  - "The locked interface Plans 03 (English) and 04 (German) write against: exact filenames, front-matter values, six section marks per locale, figure paths/dimensions, word-count bands, banned-token list, and the single outbound-link contract"
  - "Three executable, currently-RED gates mechanising D-18's done-checklist so no editorial rule survives to production on trust alone"
affects: [04-03, 04-04, 04-05, 04-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Source-level content gate via a hand-rolled front-matter line parser (no YAML dependency) in tests/unit/case-study-source.ts, shared by both unit test files so they fail the same legible way"
    - "PNG IHDR byte reading (readUInt32BE at offset 16/20) to assert declared Figure dimensions against real file bytes, ported to the rendered layer as measured naturalWidth"
    - "A throwing navigation helper (visitCaseStudy) in the Playwright spec that turns a 404 into one legible cause for every test in the file, rather than letting negative DOM assertions (zero h3-h6, zero target=_blank) pass vacuously against an empty page"

key-files:
  created:
    - tests/unit/case-study-source.ts
    - tests/unit/case-study-content.test.ts
    - tests/unit/case-study-figures.test.ts
    - tests/case-study.spec.ts
  modified: []

key-decisions:
  - "Read files per-test (not once at module scope) so every one of the 28+8 unit assertions fails individually and legibly, rather than one uncaught module-load exception hiding the assertion surface"
  - "Added a hard 200-status guard inside the Playwright spec's shared visitCaseStudy() helper after discovering 'zero h3-h6' passed vacuously against the current 404 — this is a gate-strengthening fix, not scope creep: every one of the 9 case-study.spec.ts tests now fails for the same clear 'has not published this route yet' reason instead of a mix of real and accidental-pass symptoms"
  - "attrNumber() in the figure gate accepts width={n} and width=\"n\" alike but throws naming the tag when neither shape parses, rather than silently producing a figure with a missing dimension"

requirements-completed: [CASE-02, CASE-03]

# Metrics
duration: ~20min
completed: 2026-08-31
---

# Phase 4 Plan 2: The Mechanical Gate Summary

**Three executable test files (924 lines) that turn D-18's done-checklist into 45 assertions over content that does not exist yet — front-matter identity, the locked six-part spine per locale, word-count bands, the Figure/Aside allowlist, the banned-fabrication scan, the single outbound link, and a rendered-DOM proof in both locales — all currently RED with one legible cause per failure.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-08-31T18:04:45+02:00 (approx, worktree base correction)
- **Completed:** 2026-08-31T18:18:12+02:00
- **Tasks:** 3
- **Files modified:** 4 (all new)

## Accomplishments
- `tests/unit/case-study-source.ts` — a shared, dependency-free reader/parser (`readContentFile`, `splitFrontmatter`, `parseFrontmatterFields`, `extractHeadings`, `extractFigureBlocks`) that both unit test files consume, so a missing MDX file fails every test with the identical message `content/{filename} does not exist yet — Plan 03 (English) / Plan 04 (German) creates it`.
- `tests/unit/case-study-content.test.ts` (396 lines, 28 tests) — the source-level gate: slug/CASE_STUDY_SLUG identity, SAFE_SLUG shape, the seven front-matter fields including the EN-draft-exactly-false / DE-draft-is-a-boolean split (D-16/D-17), the six locked `##` marks per locale in order with a zero-`h3`-`h6` ceiling, EN word count 1200–1800 and DE within 80%–125% of EN, the `Figure`/`Aside` component allowlist with a single scoped import, exactly one `Aside`, zero bare images/fenced code, the full D-12/D-19 banned-token and fabrication-string scan (`International Baccalaureate`, `World Bank`, `EU-15`, `ib-gdp-evolution`, `github.com`, `target="_blank"`), the single outbound-link contract with its character-offset bound between the fifth and sixth heading (D-20), and the euro-sign-inside-a-Figure trap (Pitfall 6).
- `tests/unit/case-study-figures.test.ts` (213 lines, 8 tests) — the figure gate: three `<Figure>` elements in the locked f1/f2/f3 order, only the third carrying `wide` (D-07), every `src` resolving under `public/` with declared width/height matching the file's own PNG IHDR header and equal to 2400×1640, alt text clearing a 120-char/20-word floor while avoiding the "Chart of..." family of lazy prefixes (D-09), no duplicate alts, and every caption naming at least one of nine known data sources.
- `tests/case-study.spec.ts` (214 lines, 9 tests across two locales) — the rendered-DOM gate: six `h2` ids in CASE-02's exact order, zero `h3`–`h6`, one `aside` proven (via `compareDocumentPosition`) to sit after `h2#methodology`, three figures with only the third `data-wide`, three images each measured at `naturalWidth` 2400 off the loaded bitmap (not the width attribute), one outbound link and zero `target="_blank"` anywhere on the page, and the first `blockquote`'s computed `font-style: italic` with a nested `em` resetting to `normal` (02-UI-SPEC). A smaller German block proves the same six-heading structure in text against `/texte/die-darstellung-aendert-sich`.

## Task Commits

Each task was committed atomically:

1. **Task 1: The source-level content gate over both MDX files** - `66088f6` (test)
2. **Task 2: The figure gate — MDX attributes against the real PNG bytes** - `8971544` (test)
3. **Task 3: The rendered-DOM gate for the case-study route** - `310d405` (test)

**Plan metadata:** (pending — this summary's own commit)

## Files Created/Modified
- `tests/unit/case-study-source.ts` - Shared reader/parser: ENOENT → legible "does not exist yet" message, front-matter YAML splitter (no YAML dependency), heading/figure-block extractors
- `tests/unit/case-study-content.test.ts` - 28 tests mechanising D-04, D-05, D-06, D-10, D-12, D-15, D-16, D-19, D-20 over both MDX bodies
- `tests/unit/case-study-figures.test.ts` - 8 tests mechanising D-07, D-08, D-09 — declared Figure attributes against real PNG bytes
- `tests/case-study.spec.ts` - 9 Playwright tests proving CASE-02's six-part structure, the methodology-last aside, the figure/image contract and the blockquote-em reset in a real render, both locales

## Decisions Made
- **Per-test file reads, not module-scope.** Reading each MDX file inside every individual `test()` body (rather than once at the top of the file) means all 28 content-gate assertions and all 8 figure-gate assertions fail independently with the same legible message, giving a complete inventory of what still needs proving rather than one opaque module-load crash.
- **Hardened the Playwright helper after finding a vacuous pass.** The first draft of `tests/case-study.spec.ts` let "zero h3, h4, h5 and h6 elements" pass against the current 404 page, because an empty `.prose-site` genuinely has zero of everything. Per this plan's own instruction to verify the observed RED set is real and not accidentally green, `visitCaseStudy()` now throws a clear diagnostic whenever a navigation doesn't return 200, so all 9 tests in the file fail for the one real reason (`has not published this route yet`) instead of a mix of genuine and coincidental failures. Re-run after the fix: all 9 fail, the other 115 Playwright tests across every other spec file stay green.
- **Figure attribute parsing treats `width={2400}` and `width="2400"` as equivalent, but throws naming the tag if neither shape is present** — per the plan's own instruction that a mis-quoted numeric prop is a real failure mode, not something to silently skip past.

## Deviations from Plan

None — plan executed exactly as written. The one adjustment (the `visitCaseStudy` 200-status guard) is not a deviation from the plan's tasks but a direct application of this plan's own verification instruction — "Verify the failures you get match that set exactly... a test that unexpectedly PASSES is also a defect" — applied to my own draft before finalizing it, since the plan text did not spell out this exact implementation detail.

## Issues Encountered
- Worktree had no `node_modules`; ran `npm ci` per the execution notes before any test could run.
- The Playwright browsers were already cached from Phase 1 (`chromium-1234`); no install needed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness

**The exact RED set, verified twice (once per test file, once via the full suites):**

- `npm run test:unit`: 88 tests total, **52 pass / 36 fail**. All 36 failures are in `tests/unit/case-study-content.test.ts` (28) and `tests/unit/case-study-figures.test.ts` (8); every failure's `location:` field points into one of those two files (verified by grep over the raw TAP output). The five pre-existing unit files (`content.test.ts`, `dates.test.ts`, `link-contract.test.ts`, `post-meta-contract.test.ts`, `prose-contract.test.ts`) plus `work.test.ts` stayed green at their original counts.
- `npm test` (Playwright): 124 tests total, **115 pass / 9 fail**. All 9 failures are in `tests/case-study.spec.ts` (both the English and German describe blocks); every other spec file (18 files, 115 tests) stayed green.
- `npm run test:build`: not run — this plan touched no build-tier file and no app/content file (`git status --short` before this commit shows only the four new test files), so there is nothing for it to catch that the unaffected build-tier suite would report differently. Per the plan's own `<verification>`: "unaffected — no build-tier file is touched by this plan."
- `npm run lint`: exactly 1 error, the known deferred `components/smear-heading/use-prefers-reduced-motion.ts:23` — unchanged before and after every task.
- `npx tsc --noEmit`: clean throughout.

**The contract handed forward to Plans 03 and 04**, restated from `04-02-PLAN.md`'s `<interfaces>` and now backed by executable assertions:

| | EN | DE |
|---|---|---|
| Filename | `content/the-chart-therefore-changes.mdx` | `content/die-darstellung-aendert-sich.mdx` |
| Title | `The Chart Therefore Changes` | `Die Darstellung ändert sich` |
| `lang` | `en` | `de` |
| `draft` | exactly `false` | boolean (either legitimate — D-17 escape hatch) |

Six section marks, in order (both files share `translationKey`, `date: "2026-08-31"`, `type: "case-study"`):

| # | English (`##` text → rehype-slug id) | German (`##` text) |
|---|---|---|
| 1 | The question → `the-question` | Die Frage |
| 2 | What I expected → `what-i-expected` | Was ich erwartet hatte |
| 3 | What the data showed → `what-the-data-showed` | Was die Daten zeigten |
| 4 | Where the chart changed → `where-the-chart-changed` | Wo sich die Darstellung ändert |
| 5 | What shipped → `what-shipped` | Was veröffentlicht wurde |
| 6 | Methodology → `methodology` | Methodik |

Figures (locked by Plan 01, asserted here): `/case-study/f1-constant-dollars.png` and `/case-study/f2-eu-average.png` at default width, `/case-study/f3-arrivals-diverge.png` with `wide`, all 2400×1640.

- No blockers for Plan 03. It can write `content/the-chart-therefore-changes.mdx` directly against the test files here — the assertions are the acceptance criteria.
- Plan 04 (German) inherits the same contract plus the `draft` escape hatch; `tests/case-study.spec.ts`'s German block deliberately passes under either branch since Playwright runs against dev.
- Known stub/risk carried forward, not introduced here: no MDX content exists yet by design — that is Plan 03/04's job, not a gap in this plan.

## Self-Check: PASSED

- FOUND: tests/unit/case-study-source.ts
- FOUND: tests/unit/case-study-content.test.ts
- FOUND: tests/unit/case-study-figures.test.ts
- FOUND: tests/case-study.spec.ts
- FOUND commit: 66088f6
- FOUND commit: 8971544
- FOUND commit: 310d405
- `npx tsc --noEmit`: clean
- `npm run test:unit`: 52/88 pass (36 fail, exactly the two new files, verified by `location:` field)
- `npm test` (Playwright): 115/124 pass (9 fail, exactly `tests/case-study.spec.ts`)
- `npm run lint`: exactly 1 error (the known deferred `use-prefers-reduced-motion.ts:23`), no new errors
- `git status --short`: clean except this SUMMARY (working tree otherwise clean before this commit)

---
*Phase: 04-the-case-study*
*Completed: 2026-08-31*
