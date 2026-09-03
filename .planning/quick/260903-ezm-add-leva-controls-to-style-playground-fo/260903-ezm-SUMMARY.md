---
quick_id: 260903-ezm
status: complete
completed: 2026-09-03
commit: d453381
---

# Leva controls for the style playground

Added an interactive Leva panel to `/style-playground` for its non-typographic design parameters.

## What changed

- Added Leva 0.10.1 and grouped controls into Layout, Gradient, and Frames.
- Exposed the responsive edge inset, corner gap, seam rise, gradient center, angle offset, gradient colors, outline width, and anchor size.
- Kept box dimensions and the base seam angle derived from the responsive layout, so resizing the viewport preserves the existing corner-to-corner geometry.
- Left all Humane type settings out of the panel.

## Verification

- Focused ESLint passed.
- `/style-playground` development request returned HTTP 200.
- `npm run build` passed; `/style-playground` remains statically prerendered.
- `git diff --check` passed.

## Commit

- `d453381 feat(260903-ezm): add Leva playground controls`
