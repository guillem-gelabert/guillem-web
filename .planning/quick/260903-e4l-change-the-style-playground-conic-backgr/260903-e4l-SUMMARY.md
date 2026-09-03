---
quick_id: 260903-e4l
status: complete
completed: 2026-09-03
commit: 82a5727
---

# Monochrome conic-gradient center

Changed `/style-playground` to a crisp black/white conic split and fixed its center at `15% 85%`, equivalent to 15% from the left and 15% from the bottom.

Removed the superseded boundary-intersection pivot calculation. The blue and red boxes are unchanged, and the gradient rotation still responds to the slope between A's bottom-right and B's top-left corners.

## Verification

- Focused ESLint passed
- Route returned HTTP 200
- Production build passed
- Diff check passed
