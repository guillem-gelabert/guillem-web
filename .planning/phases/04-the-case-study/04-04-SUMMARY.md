---
phase: 04-the-case-study
plan: 04
subsystem: content
tags: [mdx, case-study, editorial-writing, content-pipeline, i18n]

# Dependency graph
requires:
  - phase: 04-the-case-study (Plan 01)
    provides: the three committed 2400x1640 PNG figures and the live-text snapshots (de-story.txt, de-methodology.txt) this plan quotes from
  - phase: 04-the-case-study (Plan 02)
    provides: the locked interface (German filename, section marks, figure contract, word band) this plan writes against
  - phase: 04-the-case-study (Plan 03)
    provides: the published English case study this plan translates and shares a translationKey with
provides:
  - "content/die-darstellung-aendert-sich.mdx — the German case study, draft: false, DRAFT BRANCH TAKEN"
  - "The German half of tests/unit/case-study-content.test.ts, tests/unit/case-study-figures.test.ts, and tests/case-study.spec.ts goes GREEN"
  - "/texte stops being empty — both in dev and in the production build"
affects: [04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Verbatim-quote verification via a throwaway Node probe (scratchpad) that extracts every „...“-delimited fragment plus the blockquote and checks each with .includes() against the concatenated live-text/de-story.txt + live-text/de-methodology.txt — same technique Plan 03 used for English, adapted for German's guillemet quoting convention instead of straight double quotes"
    - "Orthography decision, disclosed as a deviation below: consistent Swiss-style German (no ß) throughout, matching the actual live-fetched live-text/*.txt snapshots exactly (0 occurrences of ß in either file), rather than the interface note's claim that 'the body writes ß' — which does not hold for the primary, most-current source this plan was told to quote verbatim"

key-files:
  created:
    - content/die-darstellung-aendert-sich.mdx
  modified: []

key-decisions:
  - "DRAFT BRANCH TAKEN: draft: false. Confidence basis: (1) 21 of 22 machine-checked quotations matched live-text/de-story.txt or live-text/de-methodology.txt verbatim on the first post-fix pass — the sole non-match is the licensed English title of the abandoned thesis, the same class of exception Plan 03 used for ARTICLE_PLAN.md; (2) a clean `next build` correctly prerenders `/texte/die-darstellung-aendert-sich` as static HTML (●), proving the draft:false branch actually works end to end in production, not just in dev; (3) the German word count (1,764) sits at 98.7% of the English count (1,788), inside the 80-125% band without needing padding; (4) the register reads as continuous, idiomatic German prose throughout, not as a translation with seams — verified by a full read-through after the quote-accuracy fixes. This means Plan 05's `tests/build/prerender.test.ts:102` empty-state assertion for `/texte` MUST change (it can no longer assert zero public entries) — the draft:true branch was NOT taken."
  - "Orthography: used consistent Swiss-style German (ss, never ß) throughout the whole file, rather than mixing it with the interface note's claim about a ß-writing 'body'. Verified directly: both live-text/de-story.txt and live-text/de-methodology.txt — the two sources this plan was explicitly told to quote verbatim, fetched live on 2026-08-31, the same date as this plan's execution — contain zero instances of ß between them (checked via grep -c). The ß claim in the plan's Interfaces section traces to a different, older file (the vault's de_with_charts.md), not to the live pages. Quoting live-text verbatim while writing connective prose in the opposite orthographic convention would have produced a visibly inconsistent document; matching the actual, current, most-authoritative source's own convention throughout was the more defensible and more verifiable choice. Recorded here so it is not silently re-litigated."
  - "Two tasks committed as two separate atomic commits (2c29d4a, f33886a), unlike Plan 03's single combined commit for the English file — per this executor's own task_commit_protocol, each task's own verify script was run and passed before its commit."

requirements-completed: [CASE-01, CASE-02]

# Metrics
duration: ~70min
completed: 2026-08-31
---

# Phase 4 Plan 4: The German Case Study Summary

**`content/die-darstellung-aendert-sich.mdx` — 1,764 words (98.7% of the English count), six beats mirroring CASE-02's order, three figures with adapted German alt/caption, one Aside, one blockquote quoting the shipped German pivot sentence verbatim, one outbound link to the German edition — published with `draft: false` after machine-verifying every quotation against the author's own live German pages.**

## Performance

- **Duration:** ~70 min
- **Tasks:** 2 (front-matter + beats 1-3, then beats 4-6 + draft decision + both-locale verification)
- **Files created:** 1

## Draft Branch Taken

**`draft: false`.** See `key-decisions` above for the full confidence basis. In one line, for Plan 05: the German file ships live, `/texte` now has one real public entry in both dev and production, and `tests/build/prerender.test.ts:102`'s "both /writing and /texte render their empty state" assertion is now false for `/texte` and needs to change to reflect one real entry — the same way it already needed to change for `/writing` after Plan 03.

## Accomplishments

- Wrote and published `content/die-darstellung-aendert-sich.mdx`: front-matter locked to the Plan 02 interface (`title: "Die Darstellung ändert sich"`, `date: "2026-08-31"`, `lang: de`, `translationKey: ib-gdp-case-study` — byte-identical to the English file — `draft: false`, `type: case-study`), six `##` sections in the locked German order and exact wording, one `Figure` import, three `<Figure>` elements (only the third `wide`), one `<Aside>` in `## Methodik`, one blockquote carrying the shipped pivot sentence *"Dafür ändert sich die Darstellung. Statt das Einkommen in Dollar anzugeben, zeigt die Grafik jede Volkswirtschaft als Anteil am EU-Durchschnitt."* verbatim, and one plain inline outbound link to the live German edition inside "Was veröffentlicht wurde".
- **Word counts:** English 1,788 (unchanged from Plan 03). German **1,764** — 98.7% of English, comfortably inside the 80-125% band (1,430.4-2,235) with no padding needed.
- **Quotation accuracy (T-04-14):** a throwaway Node probe extracted every „...“-delimited fragment plus the blockquote (22 total) and checked each against the concatenated `live-text/de-story.txt` + `live-text/de-methodology.txt`. First pass found 4 mismatches (see Deviations); after fixing, **21 of 21 real quotations matched verbatim**, 0 mismatches (the one remaining non-match, the English title of the abandoned thesis, is a licensed non-live source, the same exception class Plan 03 used).
- **Per-anchor reuse-or-translate table** (the four anchors the plan specifically named):

  | Anchor | Status | German text used |
  |---|---|---|
  | 45.5% share of the Balearic economy | **Reused verbatim** | "Der Tourismus erwirtschaftet 45,5 Prozent der balearischen Wirtschaftsleistung" |
  | Left-right agreement tourism rescued the islands | **Reused verbatim** | "Der Tourismus habe die Inseln aus der Armut befreit" (rendered as reported speech after a colon, matching the live page's own construction) |
  | Extremadura comparison and its tenfold growth | **Reused verbatim** | "Ohne Magaluf oder s'Arenal, ohne Badehotels und sogar ohne Küste verzehnfachte sich auch in Extremadura die Wirtschaftsleistung pro Kopf innerhalb von zwei Generationen." |
  | Islands not exceptionally poor through first half of century | **Reused verbatim** | "In der ersten Hälfte des 20. Jahrhunderts waren die Inseln nicht aussergewöhnlich arm." |

  All four found and reused verbatim from `live-text/de-story.txt` — none required translation. Beyond these four, roughly 16 further sentences across all six beats are direct verbatim quotations from the live German story and methodology pages; the abandoned-thesis material in beat 2 (which exists only in the English `ARTICLE_PLAN.md`) was translated, as the plan anticipated, since no published German sentence corresponds to it.
- **Beat 6 ("Methodik") quotes `de-methodology.txt` directly and extensively**, per the plan's instruction that it "needs no translation" — the three chaining approaches (two rejected), the >20% base-year sensitivity, the honest sting that the simpler method is closer to Rosés-Wolf up to 2020, the 2020/2021 exclusion, the no-regional-deflator caveat, the EU-27 average's computed/incomplete-before-1985 caveat, and the Cirer-Costa sensitivity test inside the single `<Aside>`.
- **Orthography:** consistent Swiss-style German (no `ß`) throughout, matching both live-text source files exactly (verified 0 occurrences of `ß` in either) — see `key-decisions` for why this diverges from, and is more defensible than, the plan's own note. The only transliteration is the filename stem itself (`ä` → `ae`).
- `npm run test:unit`: **88/88 pass**, including all German-file assertions in `case-study-content.test.ts` and `case-study-figures.test.ts`.
- `npx playwright test tests/case-study.spec.ts`: **9/9 pass** — all 8 English-block assertions plus the German-block assertion (`/texte/die-darstellung-aendert-sich` responds 200, six `h2` with the locked German section marks and non-empty ids, zero `h3`-`h6`).
- `npx tsc --noEmit`: clean.
- `npm run build`: succeeds. Route table shows `● /texte/die-darstellung-aendert-sich` prerendered as static HTML (SSG) — direct production proof that `draft: false` works.
- `npm run lint`: exactly 1 error, the pre-existing deferred `use-prefers-reduced-motion.ts:23` — unchanged.

## Task Commits

1. **Task 1: front-matter and beats 1-3** — `2c29d4a` (feat)
2. **Task 2: beats 4-6, draft decision, both-locale verification** — `f33886a` (feat)

**Plan metadata:** (this SUMMARY's own commit)

## Files Created/Modified

- `content/die-darstellung-aendert-sich.mdx` — the German case study: 80 lines, six `##` sections, three `<Figure>`, one `<Aside>`, one blockquote, one outbound link, `draft: false`

## Decisions Made

See `key-decisions` in the frontmatter above for the full rationale on: (1) the draft branch taken and why, (2) the deliberate orthography choice and why it diverges from the plan's Interfaces note, and (3) committing the two tasks separately rather than combined.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Four verbatim-quotation mismatches found and fixed before the second commit**

- **Found during:** Task 2, self-verification pass via the quotation probe (before running the full test suite)
- **Issue:** my first draft had (a) a straight apostrophe (`s'Arenal`) where the source uses curly (`s’Arenal`) in the Extremadura quote; (b) a false quotation — `„der Tourismus hat uns gerettet“` was my own invented paraphrase, not a real sentence from either live-text source, wrapped in German quote marks as if it were verbatim; (c) a capitalization and punctuation mismatch in the pandemic-exclusion quote (`die Pandemie war...,` vs. the source's `Die Pandemie war...;` — wrong case at the sentence-initial word and a comma where the source has a semicolon).
- **Fix:** (a) corrected the apostrophe to curly, matching the source exactly; (b) rewrote the sentence to drop the false quotation marks and describe the narrative allusively instead ("die Erzählung vom rettenden Tourismus") rather than claiming it as a direct quote; (c) corrected the capitalization and punctuation to match `de-methodology.txt` exactly. Also proactively fixed one non-quoted stylistic inconsistency: a straight apostrophe in "Barceló Pons'" was changed to curly ("Barceló Pons'") for consistency with the German typographic convention used throughout.
- **Files modified:** `content/die-darstellung-aendert-sich.mdx`
- **Verification:** re-ran the quotation probe — 21/21 real quotations OK, 0 MISS (the sole remaining non-match is the licensed English thesis title, a false positive by design).
- **Committed in:** `f33886a` (folded into the Task 2 commit — the fixes were made before that commit, not as a separate patch)

---

**Total deviations:** 1 auto-fixed (Rule 1 — verbatim-quotation accuracy, caught by machine verification before commit, mirroring Plan 03's own precedent for the same class of error).
**Impact on plan:** No scope creep — this is exactly the accuracy gate (T-04-14) the plan's threat model requires, executed as specified.

## Issues Encountered

- The worktree forked from a stale base (wave-1 tracking commit, missing Plans 02 and 03's gate suite and the published English file). Corrected per the mandatory `<worktree_branch_check>` — `git reset --hard` to the specified base commit `7f8a2a17f` — before any other work began; verified the reset landed correctly.
- `npm ci` was needed (no `node_modules` in the fresh worktree), per the execution notes.
- `next-env.d.ts` toggled between its dev and build type-reference paths during `npm run build`; it settled back to its original (dev) state by the time of the final commit, so no explicit `git checkout -- next-env.d.ts` was needed — verified clean via `git status --short` before both commits.
- The plan's Interfaces section claims "the body writes ß (schließlich, größten)" as the orthography to match. Direct verification found zero `ß` occurrences in either `live-text/de-story.txt` or `live-text/de-methodology.txt` — the two sources this plan explicitly designates as the primary, most-current, verbatim-quotable authority, fetched the same day as execution. The `ß`-writing convention traces instead to the vault's `de_with_charts.md`, an older/different source. Resolved by following the live-text sources' own consistent convention throughout (see `key-decisions`), rather than mixing two orthographic systems in one document.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**The exact red set after this plan, verified by running the actual suites (not assumed) — all owned by Plan 05:**

`tests/build/prerender.test.ts` (4 of 19 fail):
- Test 2 — `both /writing and /texte render their empty state` — now false for both routes (both have one real entry).
- Test 15 — `the featured slot ships its interim copy in production`.
- Test 16 — `the interim featured headline carries no link`.
- Test 19 — `launch gate: the featured slot, the backlog stub and the contact stub are all still interim`.

(Tests 15, 16, 19 were already red after Plan 03 published the English file — unchanged by this plan, since it touches no English-side state.)

`tests/writing-index.spec.ts` (2 of 8 fail):
- `/writing renders exactly one article whose h2 is the sole link` — dev shows 2 (draft `fixture.mdx` + the published English case study), unchanged from Plan 03.
- `/texte renders two articles separated by hr, reverse-chronological, both h2s sharing one class list` — **newly red as of this plan**: dev now shows 3 articles (`fixture.mdx` and `musterseite.mdx`, both `draft: true`, plus the newly published `die-darstellung-aendert-sich.mdx`), since `npm run dev`'s `showDrafts()` is always true.

That is 6 assertions total for Plan 05, matching the plan's own count. Full suite tallies at hand-off: `npm run test:unit` 88/88 pass; `npx playwright test tests/case-study.spec.ts` 9/9 pass (both locales green); `npm run test:build` 15/19 pass (4 fail, all listed above, all pre-existing from Plan 03 except test 2's `/texte` half); `npx playwright test tests/writing-index.spec.ts` 6/8 pass (2 fail, one pre-existing from Plan 03, one newly red from this plan); `npm run lint` 1 pre-existing error, unchanged.

- No blockers for Plan 05. It rewrites the six listed assertions to the now-published state of both locales; this plan does not touch any file Plan 05 needs to read differently than documented here.
- Known stub/risk carried forward, not introduced here: per CONTEXT's `<deferred>` note, this German prose ships without a native speaker's editorial pass — the accuracy gate (machine-verified quotations) reduces factual risk but does not substitute for the author's ear. That pass is recommended before Phase 6 flips `robots` to indexable, same as the English file.

## Self-Check: PASSED

- FOUND: content/die-darstellung-aendert-sich.mdx
- FOUND commit: 2c29d4a
- FOUND commit: f33886a
- `npx tsc --noEmit`: clean
- `npm run test:unit`: 88/88 pass
- `npx playwright test tests/case-study.spec.ts`: 9/9 pass (both locales)
- `npm run build`: succeeds; `/texte/die-darstellung-aendert-sich` prerenders as `●` (SSG), proving `draft: false` in production
- `npm run lint`: exactly 1 error, the known pre-existing `use-prefers-reduced-motion.ts:23`, unchanged
- `git status --short`: clean (only this SUMMARY pending, prior to its own commit)

---
*Phase: 04-the-case-study*
*Completed: 2026-08-31*
