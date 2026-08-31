---
phase: 04-the-case-study
plan: 01
subsystem: content
tags: [playwright, screenshot-capture, evidence-snapshot, case-study]

# Dependency graph
requires:
  - phase: 03-work-list-landing-skeleton
    provides: the featured slot that resolves to CASE_STUDY_SLUG
provides:
  - Three committed 2400x1640 PNG figures of the live ib-gdp-evolution piece, free of the step prose card overlay
  - Four committed verbatim live-text snapshots (EN/DE story + methodology) for the D-19 accuracy gate
  - A reusable, self-verifying capture script and snapshot script under scripts/
affects: [04-02, 04-03, 04-04, 04-05, 04-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Settle-oracle Playwright driving (svg[data-animation-state=idle] + generation counter), ported from ib-gdp-evolution's story-driver.ts rather than reimplemented"
    - "One-shot build-time scripts under scripts/, invoked by hand, imported by nothing under app/ — network dependency discharged at commit time, not carried into production"

key-files:
  created:
    - scripts/capture-case-study-figures.mjs
    - scripts/snapshot-live-text.mjs
    - public/case-study/f1-constant-dollars.png
    - public/case-study/f2-eu-average.png
    - public/case-study/f3-arrivals-diverge.png
    - .planning/phases/04-the-case-study/live-text/en-story.txt
    - .planning/phases/04-the-case-study/live-text/de-story.txt
    - .planning/phases/04-the-case-study/live-text/en-methodology.txt
    - .planning/phases/04-the-case-study/live-text/de-methodology.txt
  modified: []

key-decisions:
  - "Walked Act 2 steps 1..12 in a single pass (not three separate walks), capturing at data-step 3/6/12 as the walk passed them — cheaper and still honours the path-dependent settle-each-step constraint"
  - "Overlap probe queries all .step elements on the page (unscoped by root), mirroring the injected CSS selector .explainer-root .step exactly, rather than scoping to Act 2 only"

requirements-completed: [CASE-01]

# Metrics
duration: ~20min
completed: 2026-08-31
---

# Phase 4 Plan 1: Live Evidence Capture Summary

**Ported the ib-gdp-evolution settle driver into a one-shot Playwright script that captured three clean 2400x1640 figures (132-180 KB each) of the live scrollytelling piece, plus offline verbatim snapshots of all four live source pages for the D-19 fact-check gate.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-08-31T15:53:00Z (approx, worktree base correction)
- **Completed:** 2026-08-31T16:02:00Z
- **Tasks:** 3
- **Files modified:** 9 (2 scripts, 3 PNGs, 4 text snapshots)

## Accomplishments
- `scripts/capture-case-study-figures.mjs` ports `readLifecycle`, `waitForNewerGeneration`, `waitForChartIdle`, `waitForActiveStep`, `scrollStepIntoView` and `scrollToStep` verbatim from the production-tested `story-driver.ts`, walks Act 2 steps 1→12 settling each, and self-asserts both an overlap-probe (no `.step` element with opacity > 0 may intersect the SVG box) and the 2400×1640 PNG dimensions before exiting.
- Three figures captured against the live site at `deviceScaleFactor: 2` and committed under `public/case-study/`, all confirmed by direct visual inspection to be free of the step prose card.
- `scripts/snapshot-live-text.mjs` visited all four live URLs directly (never the site root), scrolled each to bottom, and wrote `document.body.innerText` with a two-line source/timestamp header to `.planning/phases/04-the-case-study/live-text/`, self-verifying against three verbatim anchor strings research measured on the live pages.
- Confirmed the coordinator's settled DE title evidence: `de-story.txt` contains `Dafür ändert sich die Darstellung.` and does **not** contain the provisional `Die Grafik ändert sich`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Port the settle driver into a one-shot figure capture script** - `1927d82` (feat)
2. **Task 2: Snapshot the four live source pages to disk** - `80d7195` (feat)
3. **Task 3: Run both scripts, inspect the three figures, commit the evidence** - `e3cb206` (feat)

**Plan metadata:** (pending — this summary's own commit)

## Files Created/Modified
- `scripts/capture-case-study-figures.mjs` - One-shot Playwright capture of Act 2 steps s2/s5/s11 (DOM data-step 3/6/12) at DSF 2, with a hard overlap probe and self-asserted output dimensions
- `scripts/snapshot-live-text.mjs` - One-shot Playwright snapshot of the four live EN/DE story + methodology pages to plain-text files, self-verified against three verbatim anchors
- `public/case-study/f1-constant-dollars.png` - F1: six comparators in constant 2011 international PPP dollars
- `public/case-study/f2-eu-average.png` - F2: the same measure switched to % of the EU-27 average, 100 baseline visible
- `public/case-study/f3-arrivals-diverge.png` - F3: relative income flat/falling against tourist arrivals on the right axis
- `.planning/phases/04-the-case-study/live-text/en-story.txt` - Verbatim shipped English prose (20,929 chars)
- `.planning/phases/04-the-case-study/live-text/de-story.txt` - Verbatim shipped German prose (24,128 chars)
- `.planning/phases/04-the-case-study/live-text/en-methodology.txt` - Verbatim shipped English methodology (18,919 chars)
- `.planning/phases/04-the-case-study/live-text/de-methodology.txt` - Verbatim shipped German methodology (20,806 chars)

## Visual Inspection Record (Task 3 acceptance criterion)

| Figure | Series count | Axis title(s) | Step card visible? | File size |
|---|---|---|---|---|
| F1 (`f1-constant-dollars.png`) | 6 lines (Balearics, Extremadura, Andalucia, Portugal, Ireland, France) | y: "GDP per capita" | No | 180,335 bytes |
| F2 (`f2-eu-average.png`) | 4 series (Balearics, Bulgaria, Ireland + dashed EU-27 average baseline at 100) | y: "GDP per capita as a % of the EU average"; visible 100 baseline | No | 132,071 bytes |
| F3 (`f3-arrivals-diverge.png`) | 3 series (Balearics, EU-27 average, tourist arrivals) | left y: "GDP per capita as a % of the EU average"; right y: "Tourist arrivals" to ~20M | No | 133,264 bytes |

All three read exactly 2400×1640 from their own PNG IHDR header (verified programmatically and by `git ls-tree -l` blob sizes matching the working-tree bytes). Total committed: 445,670 bytes, under the ~600 KB estimate from research and each individually under the 400 KB ceiling.

## Decisions Made
- Walked Act 2 once from step 1 to step 12, capturing at data-step 3/6/12 as the walk passed each target, rather than three independent walks-and-reset. This still honours the "walk in order, settle every intermediate step" constraint (the chart is path-dependent) while being cheaper — no `scrollToHero` reset was needed between figures.
- The overlap probe queries every `.step` element on the whole page (`document.querySelectorAll(".step")`), matching the unscoped `.explainer-root .step` selector the opacity injection targets, rather than scoping to the Act 2 root only. This is the more conservative check and costs nothing extra.

## Deviations from Plan

None - plan executed exactly as written. The capture and snapshot scripts, the figure/step mapping, the settle-driver port, the overlap probe, and the live-text anchors all matched the plan's specification on the first run; no auto-fixes were needed.

## Issues Encountered
None. The live site was reachable (HTTP 200 verified before running either script), Playwright's Chromium binary was already present from Phase 1, and both scripts' self-assertions passed on the first execution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The live-site dependency for this phase is fully discharged: no later plan in Phase 4 needs the network. Plans 02-06 can write against the committed figures and the offline `live-text/` snapshots.
- Figure filenames (`f1-constant-dollars.png`, `f2-eu-average.png`, `f3-arrivals-diverge.png`) and the `2400 × 1640` intrinsic dimension pair are locked and available as a contract for the `<Figure>` components in the MDX bodies Plans 02/03 will write.
- `.planning/phases/04-the-case-study/live-text/*.txt` is available for Plan 06's D-19 fact-check pass as an offline, string-matchable authority over the vault drafts.
- No blockers.

## Self-Check: PASSED

- FOUND: scripts/capture-case-study-figures.mjs
- FOUND: scripts/snapshot-live-text.mjs
- FOUND: public/case-study/f1-constant-dollars.png
- FOUND: public/case-study/f2-eu-average.png
- FOUND: public/case-study/f3-arrivals-diverge.png
- FOUND: .planning/phases/04-the-case-study/live-text/en-story.txt
- FOUND: .planning/phases/04-the-case-study/live-text/de-story.txt
- FOUND: .planning/phases/04-the-case-study/live-text/en-methodology.txt
- FOUND: .planning/phases/04-the-case-study/live-text/de-methodology.txt
- FOUND commit: 1927d82
- FOUND commit: 80d7195
- FOUND commit: e3cb206
- `npx tsc --noEmit`: clean
- `npm run test:unit`: 52/52 pass
- `npm run test:build`: 19/19 pass
- `npm test` (Playwright): 115/115 pass
- `npm run lint`: exactly 1 error (the known deferred `use-prefers-reduced-motion.ts:23`), no new errors

---
*Phase: 04-the-case-study*
*Completed: 2026-08-31*
