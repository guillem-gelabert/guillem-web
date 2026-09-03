---
quick_id: 260903-jvh
status: complete
completed: 2026-09-03
commit: a0c9f9f
---

# Grainy-gradient example structure adopted

`/noise-gradient` now uses a dedicated isolated wrapper with sibling noise and
gradient divs. A separate local SVG contains the `feTurbulence` filter and is
loaded as the noise layer's CSS background. The black → orange → white conic
overlay above it owns `mix-blend-mode: multiply`.

The noise layer also follows the reference's radial shaping plus contrast,
brightness, and inversion treatment, preserving a visible granular falloff.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
