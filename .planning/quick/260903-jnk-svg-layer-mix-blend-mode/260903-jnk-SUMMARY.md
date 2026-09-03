---
quick_id: 260903-jnk
status: complete
completed: 2026-09-03
commit: 53e7fa2
---

# SVG layer now owns blending

The fractal-noise filter is now rendered as an inline SVG above a separate
black → orange → white conic-gradient layer. `mix-blend-mode: multiply` and the
grain-shaping CSS filter are applied directly to the SVG element. The external
SVG background asset and `background-blend-mode` were removed.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
