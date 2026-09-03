---
quick_id: 260903-eef
status: complete
completed: 2026-09-03
commit: e052ada
---

# Inverse transparent type boxes

Removed the blue and red fills from the two `/style-playground` boxes while preserving their responsive dimensions and positions.

Replaced the A/B labels with large `BLACK` and `WHITE` words using the existing Humane display typeface. The text, frame outlines, and corner markers use `mix-blend-mode: difference`, rendering light over dark and dark over light as the monochrome conic gradient passes underneath.

## Verification

- Focused ESLint passed
- Route returned HTTP 200
- Production build passed
- Diff check passed
