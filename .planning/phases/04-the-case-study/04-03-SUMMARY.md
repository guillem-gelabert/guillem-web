---
phase: 04-the-case-study
plan: 03
subsystem: content
tags: [mdx, case-study, editorial-writing, content-pipeline]

# Dependency graph
requires:
  - phase: 04-the-case-study (Plan 01)
    provides: the three committed 2400x1640 PNG figures and the live-text snapshots this plan quotes from
  - phase: 04-the-case-study (Plan 02)
    provides: the locked interface (filenames, front-matter, six section marks, figure contract, word bands, banned-token list) this plan writes against
provides:
  - "content/the-chart-therefore-changes.mdx — the published English case study, draft: false"
  - "The English half of tests/unit/case-study-content.test.ts, tests/unit/case-study-figures.test.ts, and tests/case-study.spec.ts goes GREEN"
  - "The featured slot resolves (CASE-03, HOME-02) with zero code change, and /writing's n=0 launch gate closes"
affects: [04-04, 04-05, 04-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Verbatim-quote verification via string search against the Plan 01 live-text snapshots, run as a throwaway Node probe before every edit, not asserted by eye — apostrophe/dash/casing mismatches (straight vs curly apostrophe, em dash, mid-sentence capitalisation) were the actual failure mode caught this way, not wording"

key-files:
  created:
    - content/the-chart-therefore-changes.mdx
  modified: []

key-decisions:
  - "Both tasks (beats 1-3, beats 4-6 + standfirst) were written and committed as a single atomic commit rather than two, because the word-count bands (beats 1-3: 550-950; whole piece: 1200-1800) and the 90-second first-two-paragraph test are properties of the finished piece, not of a partial draft, and the apostrophe/punctuation fixes discovered while verifying beats 4-6's quotations also touched sentences in beats 1-3 (the Extremadura paragraph). Splitting the commit would have meant either committing a beats-1-3-only draft that failed its own word-count gate pre-fix, or committing already-corrected text under a Task-1-only label that misrepresents when the fix actually happened."
  - "Verified every quotation by machine, not by eye. A Node probe (scratchpad, not committed) extracted every double-quoted string and the blockquote from the finished MDX and ran .includes() against the concatenated live-text snapshots (plus ARTICLE_PLAN.md for the one abandoned-thesis title, which is D-01's licensed non-live source). This caught six real mismatches — straight vs curly apostrophe in 'Balearics'', 'boom's', 'EU's', 'Rosés-Wolf's', 'Spain's', 'Cirer-Costa's', 'article's', plus two sentence-boundary casing errors ('the pandemic was' vs 'The pandemic was', 'this works only if' vs 'This works only if') and one truncated quote whose added closing punctuation broke the substring match — none of which a visual read caught."
  - "The pivot blockquote carries an <em> around 'therefore' (rendering upright against the blockquote's italic) to satisfy case-study.spec.ts's requirement that the first blockquote contain a nested em proving the Prose Contract's reset. This is additive markup only — the quoted words are unchanged — and the plan's own action text names this exact case as where the reset first matters."
  - "Rephrased the causal-posture sentence in beat 3 to avoid the word 'caused' as my own claim ('At no point does the piece assert that tourism was responsible for the climb...') rather than paraphrasing act2.md's craft note ('...claim tourism caused the climb') literally, per the plan's explicit instruction that 'proves', 'caused' and 'debunks' do not belong in the case study's own voice. The one surviving instance of the word 'cause' is the licensed verbatim quote 'boom's underlying cause.'"

requirements-completed: [CASE-01, CASE-02, CASE-03, HOME-02]

# Metrics
duration: ~55min
completed: 2026-08-31
---

# Phase 4 Plan 3: The English Case Study Summary

**`content/the-chart-therefore-changes.mdx` — 1,788 words, six beats in CASE-02's order, three figures, one aside, one pull-quote, one outbound link — published with `draft: false`, closing the featured slot and the `/writing` n=0 gate with zero code change.**

## Performance

- **Duration:** ~55 min
- **Tasks:** 2 (written and verified as one coherent piece; see Decisions Made)
- **Files created:** 1

## Accomplishments

- Wrote and published `content/the-chart-therefore-changes.mdx`: front-matter locked to the Plan 02 interface (`title`, `standfirst`, `date: "2026-08-31"`, `lang: en`, `translationKey: ib-gdp-case-study`, `draft: false`, `type: case-study`), six `##` sections in CASE-02's exact order and wording, one `Figure` import, three `<Figure>` elements (only the third `wide`), one `<Aside>` in Methodology, one pull-quote `<blockquote>` carrying the title sentence verbatim with a nested `<em>`, and one plain inline outbound link to the live piece inside "What shipped".
- Every quoted sentence traces to `live-text/en-story.txt` or `live-text/en-methodology.txt` (Plan 01's authoritative snapshots), with one exception licensed by D-01: the abandoned thesis's title, verified against `/Users/guillem/vault/projects/personal/data-story-ib-gdp/ARTICLE_PLAN.md` directly. **21 quotations checked, 21 matched verbatim, 0 mismatches** in the final version (six real mismatches were found and fixed during drafting — see Deviations).
- Preserved the causal posture from `act2.md:64` without using the word "caused" as my own claim, and reserved "tenfold" for Extremadura alone — the shipped text says only "the same pattern appears" for Andalusia, Portugal, France and Ireland.
- English word count: **1,788** (band 1200–1800). Beats 1–3 subset: **826** words (band 550–950, per Task 1's own verify script).
- `npm run test:unit`: `case-study-content.test.ts` tests 1, 7, 14 pass (the only three that don't loop over the still-missing German file); every other test in that file and in `case-study-figures.test.ts` fails **solely** because `content/die-darstellung-aendert-sich.mdx` does not exist yet — confirmed by inspecting the `error:` field on every failure, which names only the German filename.
- `npx playwright test tests/case-study.spec.ts`: all 8 English-block assertions pass, including the blockquote/`em` computed-style reset. The 9th test (German) fails with a clean 404, as designed.
- `npx tsc --noEmit`: clean. `next build`: succeeds, and the route table shows `● /writing/the-chart-therefore-changes` prerendered.
- `npm run lint`: exactly 1 error, the pre-existing deferred `use-prefers-reduced-motion.ts:23` — unchanged.

## Task Commits

1. **Task 1 + Task 2 combined: front-matter, standfirst, and all six beats** — `7bf8c15` (feat)

Both tasks target the same single file (`content/the-chart-therefore-changes.mdx`) and were verified together as one coherent piece rather than split into two commits — see "Decisions Made" for why.

**Plan metadata:** (pending — this summary's own commit)

## Files Created/Modified

- `content/the-chart-therefore-changes.mdx` — the English case study: 79 lines, six `##` sections, three `<Figure>`, one `<Aside>`, one blockquote, one outbound link, `draft: false`

## Decisions Made

See `key-decisions` in the frontmatter above for the full rationale on: (1) committing both tasks together, (2) machine-verifying every quotation rather than trusting a visual read, (3) the deliberate `<em>` inside the pivot blockquote, and (4) rephrasing around the word "caused" to preserve the causal posture without violating the plan's own voice guard.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Six verbatim-quotation mismatches found and fixed before commit**

- **Found during:** drafting Tasks 1–2, self-verification pass before committing
- **Issue:** the plan requires every rendered quotation to match the live-text snapshots exactly. My first draft used straight apostrophes (`'`) where the source uses curly (`’`) in six quoted fragments ("Balearics' route", "boom's underlying cause", "EU's poorest country", "Rosés-Wolf's real GDP figures", "Spain's", "Cirer-Costa's estimate" / "article's conclusion"), used lowercase where the source capitalises a sentence-initial word inside two quoted fragments ("the pandemic was..." vs "The pandemic was...", "this works only if..." vs "This works only if..."), and closed one quotation with a period/comma the source does not have at that exact character offset ("Rosés-Wolf's real GDP figures." vs the source's "...figures, because...").
- **Fix:** wrote a throwaway Node probe (not committed — lived in the scratchpad) that extracts every double-quoted string plus the blockquote from the finished MDX and checks each with `String.prototype.includes()` against the concatenated live-text snapshots (and separately against `ARTICLE_PLAN.md` for the one licensed non-live quote). Fixed each mismatch in place — always by correcting my own prose to match the source exactly, never by weakening what counted as a "match."
- **Files modified:** `content/the-chart-therefore-changes.mdx`
- **Verification:** final probe run shows 21/21 real quotations OK, 0 MISS (the remaining MISS entries in probe output are false positives — the import line, three `src` paths, three composed `alt` strings, and the Aside's own kicker text, none of which are claimed quotations).
- **Committed in:** `7bf8c15` (the only content commit — the fixes are folded into the finished file, not a separate patch commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — verbatim-quotation accuracy, caught by machine verification before commit rather than by the test suite, since no unit test asserts quotation-level accuracy against the live-text snapshots).
**Impact on plan:** No scope creep — this is exactly the accuracy gate (D-19, T-04-09) the plan's threat model requires, executed as specified ("every quotation is string-searched... before the task closes").

## Issues Encountered

- The worktree forked from a stale base (wave-1 tracking commit, missing Plan 02's gate suite). Corrected per the mandatory `<worktree_branch_check>` — `git reset --hard` to the specified base commit — before any other work began.
- `npm ci` was needed (no `node_modules` in the fresh worktree), per the execution notes.
- `next build` toggled `next-env.d.ts` between its dev and build type-reference paths; reverted with `git checkout -- next-env.d.ts` after the build to leave the tree clean, per the execution notes' explicit warning about this file.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**The exact red set, verified by running the actual suites (not assumed):**

Owned by **Plan 04** (German):
- `tests/case-study.spec.ts` → `German case-study route (CASE-02, both draft branches)` — 404 on `/texte/die-darstellung-aendert-sich`, one test.
- Every non-EN-only assertion in `tests/unit/case-study-content.test.ts` (25 of 28) and all 8 in `tests/unit/case-study-figures.test.ts` — every failure's `error:` field names only `content/die-darstellung-aendert-sich.mdx does not exist yet`, confirmed by direct inspection, not inference.

Owned by **Plan 05** (index/build state, per the plan's own `<verification>` note — publishing the English file changes what `/writing` and the production build emit):
- `tests/build/prerender.test.ts` test 2 — `both /writing and /texte render their empty state` (now false: `/writing` has one real entry).
- `tests/build/prerender.test.ts` test 15 — `the featured slot ships its interim copy in production`.
- `tests/build/prerender.test.ts` test 16 — `the interim featured headline carries no link` (now `/writing/the-chart-therefore-changes` is linked, as designed).
- `tests/build/prerender.test.ts` test 19 — `launch gate: the featured slot, the backlog stub and the contact stub are all still interim`.
- `tests/writing-index.spec.ts` — `/writing renders exactly one article whose h2 is the sole link` (dev now shows 2: the draft `fixture.mdx` plus the newly published case study, since Playwright runs against `npm run dev` where `showDrafts()` is always true).

That is 5 assertions for Plan 05 + 1 for Plan 04 = 6, matching the plan's own count exactly. Full suite tallies at hand-off: `npm run test:unit` 55/88 pass (33 fail, all German-file-missing); `npx playwright test` 122/124 pass (2 fail, the two listed above under German + the writing-index one); `npm run test:build` 15/19 pass (4 fail, all listed above); `npm run lint` 1 pre-existing error, unchanged.

- No blockers for Plan 04. It writes `content/die-darstellung-aendert-sich.mdx` directly against the same Plan 02 gate files; the English file is untouched by that plan.
- Plan 05 should not need to touch this file either — it rewrites the five listed assertions to the now-published state.
- Known stub/risk carried forward, not introduced here: per CONTEXT's `<deferred>` note, this English prose ships without a human editorial pass; that pass is recommended before Phase 6 flips `robots` to indexable, and is out of scope for this plan.

## Self-Check: PASSED

- FOUND: content/the-chart-therefore-changes.mdx
- FOUND commit: 7bf8c15
- `npx tsc --noEmit`: clean
- `npm run test:unit`: 55/88 pass — all 33 failures verified (via the `error:` field, not assumed) to name only the missing German file
- `npx playwright test tests/case-study.spec.ts`: 8/9 pass, the 9th is the expected German 404
- `next build`: succeeds; `/writing/the-chart-therefore-changes` prerenders as `●` (SSG)
- `npm run lint`: exactly 1 error, the known pre-existing `use-prefers-reduced-motion.ts:23`, unchanged
- `git status --short`: clean (only the new SUMMARY pending, prior to this commit)

---
*Phase: 04-the-case-study*
*Completed: 2026-08-31*
