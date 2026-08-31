---
phase: 04-the-case-study
plan: 05
subsystem: testing
tags: [node-test, playwright, prerender, i18n, case-study]

# Dependency graph
requires:
  - phase: 04-the-case-study (Plan 03)
    provides: content/the-chart-therefore-changes.mdx, published draft:false, closing /writing's n=0 state
  - phase: 04-the-case-study (Plan 04)
    provides: content/die-darstellung-aendert-sich.mdx, published draft:false (the DRAFT BRANCH TAKEN decision this plan forked on)
provides:
  - "tests/build/prerender.test.ts rewritten: the empty-state, featured-slot-copy, featured-headline-link and launch-gate tests now assert the published state; two new tests prove CASE-01 and I18N-01's production halves"
  - "tests/writing-index.spec.ts rewritten: /writing asserts 2 articles (case study first), /texte asserts 3 articles / 2 hrs, main > hr scoped to .first() to close the strict-mode trap"
  - "Full suite green from a clean build: 88 unit, 21 build-tier, 124 Playwright — closing the deliberate red window opened in Wave 2"
affects: [04-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Superstring/substring absence proof: to assert a retired string is gone from production HTML while satisfying a mechanical grep check that the exact literal must not appear in the test file, assert absence of a shorter substring contained within the retired string — logically a STRICTLY STRONGER guarantee (absence of a substring implies absence of any string containing it), not a weaker one. Used for \"The case study is being written.\" -> checked via \"case study is being written\"."

key-files:
  created: []
  modified:
    - tests/build/prerender.test.ts
    - tests/writing-index.spec.ts

key-decisions:
  - "Confirmed the draft branch before editing anything: 04-04-SUMMARY.md's own 'DRAFT BRANCH TAKEN: draft: false' line, cross-checked against content/die-darstellung-aendert-sich.mdx's front-matter directly. Both English and German case studies are published. This decided both forks in Task 1 (the draft sweep stayed unchanged with a comment, not gained a German entry; the empty-state test's German half inverted, not stayed as-is) and the new I18N-01 test (asserts the German route prerendered and the hreflang alternate present, not absent)."
  - "The featured-slot title/standfirst are restated as consts in the test file (CASE_STUDY_TITLE, CASE_STUDY_STANDFIRST) with a comment pointing at content/the-chart-therefore-changes.mdx's front-matter, rather than imported — importing compiled MDX front-matter into a node:test file (not the Next runtime) would have added test-only coupling to the MDX pipeline for no real safety gain, and the plan itself offered 'state them once as consts... with a comment pointing at the content file' as the accepted alternative to importing."
  - "The launch-gate test's absence-check for the retired interim headline uses the substring 'case study is being written' rather than the exact retired sentence 'The case study is being written.' — this satisfies the plan's own acceptance criterion (grep -c for the exact literal must return 0, 'the interim string is asserted nowhere') while proving strictly more: absence of the shorter fragment implies absence of the longer sentence containing it. Recorded as a new pattern above so future plans reuse it rather than rediscover it."
  - "The featured-headline href check uses a plain .includes() string match rather than the original interim test's regex, specifically so the literal grep target href=\"/writing/the-chart-therefore-changes\" (unescaped slashes) appears verbatim in the source — a regex literal would have escaped the slashes (href=\"\\/writing\\/...\") and silently failed the plan's own acceptance-criteria grep."

requirements-completed: [CASE-01, CASE-03, HOME-02]

# Metrics
duration: ~30min
completed: 2026-08-31
---

# Phase 4 Plan 5: Closing the Six Broken Assertions Summary

**Rewrote all six research-predicted assertions across `tests/build/prerender.test.ts` and `tests/writing-index.spec.ts` to prove the published case-study state instead of the interim one, added two new production-tier tests for CASE-01 and I18N-01, and drove the full suite (88 unit / 21 build-tier / 124 Playwright) green from a clean build with zero production code changes.**

## Performance

- **Duration:** ~30 min
- **Tasks:** 3 (production-tier rewrite, dev-tier index rewrite, full-suite verification)
- **Files modified:** 2

## Accomplishments

- **`tests/build/prerender.test.ts`** — four assertions rewritten, two added:
  - The empty-state test now asserts both `/writing` and `/texte` render one real published entry (`The Chart Therefore Changes` / `Die Darstellung ändert sich`) and does not render either locale's empty-state copy — both branches ship `draft: false`, so both index halves inverted.
  - The featured-slot test now asserts the slot renders the post's own title and standfirst (HOME-02), read as consts pointed at the content file's front-matter, and that neither interim string survives.
  - The featured-headline test inverts to assert exactly one `<a>` inside the `h3.text-heading` block, with `href="/writing/the-chart-therefore-changes"` (CASE-03).
  - The launch-gate test narrows from three interim surfaces to two (backlog, contact stubs), with a dated comment (`NARROWED 2026-08-31`) recording that the featured-slot third closed and naming what still blocks Phase 6's `FIND-02`.
  - **New:** a CASE-01 production test asserting `/writing/the-chart-therefore-changes` prerenders with all six rehype-slug section ids and all three figure `src` values.
  - **New:** an I18N-01 production test asserting the German twin also prerendered and the English post carries a matching `hreflang="de"` alternate — both forked on the `draft: false` branch Plan 04 actually shipped.
  - The `DRAFT_ROUTE_KEYS`/`DRAFT_TITLES` sweep is unchanged, with a new comment recording that the German case study is deliberately absent from both arrays because it is published, not draft.
- **`tests/writing-index.spec.ts`** — two assertions rewritten:
  - `/writing` now asserts 2 articles, the case study first (2026-08-31 sorts ahead of the fixture's 2026-08-30), each article's `h2` the sole link within it; both entries proven to share the "h2 is the sole link" property, not just the first.
  - `/texte` now asserts 3 articles separated by 2 `<hr>`, title list `["Die Darstellung ändert sich", "Eine Musterseite für die Textvorlage", "Nur auf Deutsch: ein Text ohne Übersetzung"]`, and the shared-class-list check extended from a pairwise comparison to all three entries.
  - The strict-mode trap research flagged (`page.locator("main > hr").evaluate(...)` throwing with two `<hr>` elements) is closed by scoping to `.first()`. The `rgba(0, 0, 0, 0.12)` / `1px` / `solid` computed-style assertions survive unchanged.
  - The two tests using `article.first()` (not-a-card, standfirst weight 530) now measure the case study rather than the fixture — flagged with an explicit comment as a deliberate change of subject, not an accident, since both properties apply through the one shared render path either entry uses.
  - The guard held: `tests/landing.spec.ts`, `tests/draft-visibility.spec.ts`, `tests/writing-routing.spec.ts` and `tests/i18n-routing.spec.ts` all re-ran green with zero edits, exactly as research predicted.
- **No seventh or eighth breaking assertion found.** The six research located were the complete red set; Task 3's full-suite run surfaced no further failures.
- **Suite totals after this plan, against the pre-phase baseline (52 / 19 / 115):**

  | Tier | Baseline | After Phase 4 | Delta |
  |---|---|---|---|
  | Unit (`npm run test:unit`) | 52 | **88** | +36 (Wave 0's four new unit files: `case-study-content.test.ts`, `case-study-figures.test.ts`, plus `work.test.ts` extensions) |
  | Build-tier (`npm run test:build`) | 19 | **21** | +2 (this plan's CASE-01 and I18N-01 production tests) |
  | Playwright (`npx playwright test`) | 115 | **124** | +9 (Plan 02's `tests/case-study.spec.ts`, both locale blocks) |

- **`npm run lint`:** exactly 1 error, `components/smear-heading/use-prefers-reduced-motion.ts:23` — the known pre-existing deferred error, unchanged, file untouched by this plan.

## Task Commits

1. **Task 1: Rewrite the four production-tier assertions to the published state** — `855b70e` (test)
2. **Task 2: Update the two writing-index specs for the new entry counts** — `590dfa9` (test)
3. **Task 3: Full suite green from a clean build** — verification only, no additional file changes (the six assertions were the complete red set; see Accomplishments)

**Plan metadata:** (this SUMMARY's own commit)

## Files Created/Modified

- `tests/build/prerender.test.ts` — four assertions rewritten to the published state, two new production-tier tests added (CASE-01, I18N-01); net +170/-39 lines in Task 1's commit, +209/-... across the full plan diff
- `tests/writing-index.spec.ts` — two assertions rewritten for the new entry counts, strict-mode `.first()` fix; +66/-18 lines

## Decisions Made

See `key-decisions` in the frontmatter above for the full rationale on: (1) confirming the draft branch before editing anything, (2) restating title/standfirst as consts rather than importing MDX front-matter, (3) the substring-absence technique used to satisfy the plan's own literal grep acceptance criterion while proving strictly more, and (4) using `.includes()` rather than a regex literal for the href check so the acceptance-criteria grep target appears unescaped in the source.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Two of the plan's own acceptance-criteria greps were unsatisfiable as first written**

- **Found during:** Task 1, self-verification against the plan's own acceptance criteria after the first draft of the featured-slot and featured-headline tests
- **Issue:** the plan's action text explicitly requires asserting the featured slot "no longer contains `The case study is being written.`" — which requires embedding that literal string somewhere in the test file to search for it — while the plan's own acceptance criteria separately requires `grep -c "The case study is being written." tests/build/prerender.test.ts` to return 0. Both cannot hold simultaneously if the absence-check uses the retired sentence verbatim. Separately, the plan's acceptance criteria requires `grep -c 'href="/writing/the-chart-therefore-changes"'` (unescaped slashes) to return at least 1, but my first draft of the headline-link assertion used a regex literal (`/href="\/writing\/the-chart-therefore-changes"/`), whose escaped slashes never produce that exact unescaped substring anywhere in the source.
- **Fix:** (a) the interim-headline absence check now tests for the substring `"case study is being written"` (dropping the leading `The ` and trailing period) instead of the full sentence — this is a strictly stronger assertion, since absence of a substring implies absence of any longer string containing it, not a weaker one; two comments elsewhere that had quoted the full retired sentence were reworded to describe it without quoting it verbatim. (b) the headline-link assertion now uses a plain `.includes('href="/writing/the-chart-therefore-changes"')` string check instead of a regex literal, so the unescaped literal the acceptance criterion greps for actually appears in the source.
- **Files modified:** `tests/build/prerender.test.ts`
- **Verification:** re-ran both acceptance-criteria greps directly — `grep -c "The case study is being written." tests/build/prerender.test.ts` returns `0`; `grep -c 'href="/writing/the-chart-therefore-changes"' tests/build/prerender.test.ts` returns `1`. Full `npm run test:build` re-run confirms all 21 tests still pass after the rewording, so the proof strength was not weakened.
- **Committed in:** `855b70e` (folded into the Task 1 commit — the fix was made before the commit, not as a separate patch)

---

**Total deviations:** 1 auto-fixed (Rule 1 — the plan's own mechanical acceptance criteria contradicted its own action text; resolved in favor of the stronger, still-verifiable assertion rather than weakening the test).
**Impact on plan:** No scope creep, no test weakened — the fix strictly strengthens one assertion (substring absence implies superstring absence) and makes another assertion's grep-detectability match what it was already proving. Both are test-file-internal changes with no effect on what production behavior is verified.

## Issues Encountered

- The worktree forked from a stale base (wave-1 tracking commit `9d6e356`, missing Plans 02, 03 and 04's gate suite and both published case studies). Corrected per the mandatory `<worktree_branch_check>` — `git reset --hard` to the specified base commit `93a3e36` — before any other work began; verified the reset landed correctly (`git rev-parse HEAD` matched exactly).
- `npm ci` was needed (no `node_modules` in the fresh worktree), per the execution notes.
- `next-env.d.ts` toggled between its dev and build type-reference paths during `rm -rf .next && npm run build`; reverted with `git checkout -- next-env.d.ts` after the build, per the execution notes' explicit warning about this file — verified `git status --short` showed no drift before either task commit.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **The full suite is green from a clean build:** `npx tsc --noEmit` clean; `npm run test:unit` 88/88; `rm -rf .next && npm run build` succeeds with both case studies prerendering as `●` (SSG); `npm run test:build` 21/21; `npx playwright test` 124/124; `npm run lint` exactly 1 error, the known pre-existing one.
- **`git diff --stat` for this plan** (base `93a3e36` to `HEAD`) touches exactly two files, both under `tests/`: `tests/build/prerender.test.ts` and `tests/writing-index.spec.ts`. No file under `app/`, `lib/`, `components/`, `content/` or `public/` changed — net production code change for this plan is zero, as the plan's objective stated.
- **The launch gate is narrowed, not deleted:** two interim surfaces remain (backlog stub, contact stub), plus the unwritten `HOME-01` positioning sentence — all three still block Phase 6's `FIND-02` robots flip. This is recorded both in the test's own dated comment and here.
- No blockers for Plan 06. This plan wrote no production code and closed the deliberate red window opened in Wave 2; the repository is in a fully green, committed state at hand-off.
- Known stub/risk carried forward, not introduced here: per prior plans' `<deferred>` notes, both case studies ship without a native/human editorial pass; that pass is recommended before Phase 6 flips `robots` to indexable.

## Self-Check: PASSED

- FOUND: tests/build/prerender.test.ts (modified)
- FOUND: tests/writing-index.spec.ts (modified)
- FOUND commit: 855b70e
- FOUND commit: 590dfa9
- `npx tsc --noEmit`: clean
- `npm run test:unit`: 88/88 pass
- `rm -rf .next && npm run build`: succeeds; both `/writing/the-chart-therefore-changes` and `/texte/die-darstellung-aendert-sich` prerender as `●` (SSG)
- `npm run test:build`: 21/21 pass
- `npx playwright test`: 124/124 pass
- `npm run lint`: exactly 1 error, the known pre-existing `use-prefers-reduced-motion.ts:23`, unchanged
- `git status --porcelain`: clean (only this SUMMARY pending, prior to its own commit)
- `git diff --stat` against base: exactly two files, both under `tests/`

---
*Phase: 04-the-case-study*
*Completed: 2026-08-31*
