---
quick_id: 260903-ft0
status: complete
completed: 2026-09-03
commit: 1d7d971
---

# Portrait box gap matched to the viewport inset

Reduced the gap between the stacked `/style-playground` boxes so it matches their distance from the viewport edges.

## What changed

- Calculated portrait box heights from three equal edge insets: top, middle, and bottom.
- Made the inter-box gap respond to Leva's existing `Edge inset` control.
- Preserved the independent `Corner gap` setting for landscape layouts.
- Kept box minimums and the seam's dynamic gap targeting unchanged.

## Verification

- `/style-playground` development request returned HTTP 200.
- `npm run build` passed; `/style-playground` remains statically prerendered.
- `git diff --check` passed.

## Commit

- `1d7d971 fix(260903-ft0): tighten portrait box spacing`
