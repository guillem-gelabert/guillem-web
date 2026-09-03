---
quick_id: 260903-fqd
status: complete
completed: 2026-09-03
commit: 16d5b25
---

# Lower-left portrait pivot with a steeper seam

Moved the portrait conic-gradient center and rotation pivot toward the lower-left and aimed the seam through the gap between the stacked boxes.

## What changed

- Used the shared Leva center values for portrait as well as landscape, retaining the default position 15% from the left and bottom.
- Calculated the portrait seam vector from that origin through the midpoint between A's bottom-right and B's top-left.
- Made the seam naturally steepen as the viewport becomes narrower while continuing to rise toward the right.
- Kept the conic center and rotation pivot represented by the same coordinates.

## Verification

- Focused ESLint passed.
- `/style-playground` development request returned HTTP 200.
- `npm run build` passed; `/style-playground` remains statically prerendered.
- `git diff --check` passed.

## Commit

- `16d5b25 fix(260903-fqd): aim portrait seam from lower-left pivot`
