---
quick_id: 260903-fl6
status: complete
completed: 2026-09-03
commit: 1e31628
---

# Portrait seam rises to the right

Reversed the conic seam ray in square and portrait layouts so its visible edge runs diagonally from lower-left to upper-right.

## What changed

- Reused the portrait aspect-ratio check for both center placement and direction selection.
- Reversed the corner vector only in portrait before converting it to a CSS conic angle.
- Preserved the exact midpoint pivot, angle offset, and existing landscape direction.

## Verification

- Focused ESLint passed.
- `/style-playground` development request returned HTTP 200.
- `npm run build` passed; `/style-playground` remains statically prerendered.
- `git diff --check` passed.

## Commit

- `1e31628 fix(260903-fl6): reverse portrait seam direction`
