---
quick_id: 260903-kyf
status: complete
completed: 2026-09-03
commit: f6d0635
---

# Monochrome noise split into two fields

The previous shared noise, conic overlay, and three palette guards have been
replaced by two independent SVG-turbulence elements. The white element uses
`screen` on the left and the black element uses `multiply` on the right; their
soft conic masks both reach zero at bottom-center so the pink base remains
solid there without a join.

Both fields use `background-blend-mode: luminosity` by default. A solid pink
layer above them uses `mix-blend-mode: color`, colorizing the isolated
monochrome result while preserving its luminance. The controls now tune those
two responsibilities directly, and contrast/brightness start at neutral 100%
to avoid clipped white and black fields.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Focused test verifies the two turbulence elements, their conic masks, fixed side blends, luminosity default, and pink color layer
- Desktop Chromium screenshot inspected at the new defaults
- `git diff --check` for the changed source and test files — passed
