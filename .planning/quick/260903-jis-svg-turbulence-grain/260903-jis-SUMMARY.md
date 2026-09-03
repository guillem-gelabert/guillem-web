---
quick_id: 260903-jis
status: complete
completed: 2026-09-03
commit: 4b81f82
---

# SVG turbulence grain added

`/noise-gradient` now follows the CSS-Tricks grainy-gradient technique. A
local SVG generates Perlin-style fractal noise with `feTurbulence`; CSS layers
that texture with the existing three-color conic gradient and shapes the result
with background blending, contrast, and brightness.

The raster noise PNG and separate z-axis layers were removed. The page remains
static and control-free.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
