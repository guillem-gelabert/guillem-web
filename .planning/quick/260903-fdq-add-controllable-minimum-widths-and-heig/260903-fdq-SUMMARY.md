---
quick_id: 260903-fdq
status: complete
completed: 2026-09-03
commit: f74996f
---

# Configurable minimum box dimensions

Added explicit minimum dimensions to both `/style-playground` boxes and exposed them in Leva.

## What changed

- Added `Min width` and `Min height` controls to Leva's Layout group.
- Set conservative defaults of `224px` wide and `128px` high.
- Applied the values as CSS `min-width` and `min-height`, leaving the existing responsive width and height calculations in place as the preferred dimensions.
- Kept the rendered-corner seam measurement responsive to any minimum-size override.

## Verification

- Focused ESLint passed.
- `/style-playground` development request returned HTTP 200.
- `npm run build` passed; `/style-playground` remains statically prerendered.
- `git diff --check` passed.

## Commit

- `f74996f feat(260903-fdq): add minimum box dimensions`
