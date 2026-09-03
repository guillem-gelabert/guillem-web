---
quick_id: 260903-fi1
status: complete
completed: 2026-09-03
commit: a696233
---

# Portrait seam centered between the boxes

Moved the portrait conic-gradient center and rotation pivot onto the line between the stacked boxes' designated corners.

## What changed

- Separated the Leva-controlled landscape center from the resolved conic center.
- At square and portrait aspect ratios, calculated the exact midpoint between A's bottom-right and B's top-left from their rendered bounds.
- Used `50% 50%` as the CSS fallback before client measurement.
- Restored the Leva-controlled center automatically when the viewport returns to landscape.

## Verification

- Focused ESLint passed.
- `/style-playground` development request returned HTTP 200.
- `npm run build` passed; `/style-playground` remains statically prerendered.
- `git diff --check` passed.

## Commit

- `a696233 fix(260903-fi1): center portrait seam between boxes`
