---
quick_id: 260903-fbc
status: complete
completed: 2026-09-03
commit: d6c7bab
---

# Vertical box layout at square and portrait ratios

Changed `/style-playground` so the boxes switch from a diagonal side-by-side arrangement to a vertical stack when the viewport reaches a `1:1` aspect ratio.

## What changed

- Added an inclusive `max-aspect-ratio: 1 / 1` breakpoint.
- At the breakpoint, both boxes use the available viewport width and split the available height around the existing responsive gap.
- Kept A above B and aligned both boxes into one column.
- Preserved the existing landscape layout and corner-based seam measurement.

## Verification

- `/style-playground` development request returned HTTP 200.
- `npm run build` passed; `/style-playground` remains statically prerendered.
- `git diff --check` passed.

## Commit

- `d6c7bab feat(260903-fbc): stack playground boxes on portrait screens`
