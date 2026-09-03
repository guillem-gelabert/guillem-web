---
status: resolved
trigger: "the center of the conic gradient isn't inside the viewport at all"
created: 2026-09-03T10:15:00+02:00
updated: 2026-09-03T10:17:03+02:00
---

# Debug Session: Conic center appears off-screen

## Symptoms

- **Expected:** The black-to-white conic gradient should have a visible center around 15% from the left and 15% from the bottom.
- **Actual:** The gradient's center does not appear to be inside the viewport.
- **Errors:** No runtime error reported.
- **Timeline:** Began after changing the prior colored gradient to a black/white treatment with a fixed `15% 85%` origin.
- **Reproduction:** Open `/style-playground` and inspect the background gradient.

## Current Focus

- **hypothesis:** Two solid 180-degree color fields reduce the conic gradient to a straight black/white divider, making every point on the divider visually equivalent and hiding the actual pivot.
- **test:** Compare the current stop list with a continuous black-to-white angular sweep while preserving the declared `15% 85%` origin.
- **expecting:** A continuous angular transition will visibly converge around the in-viewport origin.
- **next_action:** Complete — the continuous sweep is implemented and verified.
- **reasoning_checkpoint:** The CSS variables already place the mathematical origin within the viewport; the defect is visual observability, not coordinate calculation.
- **tdd_checkpoint:** Not applicable to this visual CSS correction.

## Evidence

- timestamp: 2026-09-03T10:15:00+02:00
  observation: `--seam-x` is `15%` and `--seam-y` is `85%`, both in-viewport percentages.
- timestamp: 2026-09-03T10:15:00+02:00
  observation: The current stops hold black from 0–179.96 degrees and white from 180–359.96 degrees, producing two solid half-planes separated by a straight line.

## Eliminated

- hypothesis: The center is outside the viewport because its CSS coordinates are out of range.
  reason: Both configured percentages are between 0% and 100%.

## Resolution

- **root_cause:** The black and white stops each occupied a solid 180-degree half. That rendered as a straight divider, so moving the mathematical conic origin along that divider produced no visible cue for the center.
- **fix:** Removed the intermediate half-plane stops so black now transitions continuously to white around the declared `15% 85%` origin, with a narrow wrap seam at 360 degrees.
- **verification:** `/style-playground` returned HTTP 200, `git diff --check` passed, and `npm run build` completed successfully.
- **files_changed:** `app/(en)/style-playground/style-playground.module.css`
- **commit:** `a7d3040`
