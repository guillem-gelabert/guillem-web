---
quick_id: 260903-jis
description: Replace the /noise-gradient PNG stack with the SVG turbulence grain technique described by CSS-Tricks.
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Replace raster noise with SVG turbulence

**Files:**
- `public/noise-gradient-noise.svg`
- `app/(en)/noise-gradient/noise-gradient.tsx`
- `app/(en)/noise-gradient/noise-gradient.module.css`
- `tests/noise-gradient.spec.ts`

**Action:** Generate local fractal noise with an SVG `feTurbulence` filter,
combine it with the existing yellow/orange/red conic gradient in CSS, and use
contrast/brightness plus background blending to produce the grain. Stop loading
the previous PNG and collapse the visual to one layer.

**Verify:** Assert the SVG filter primitives and rendered CSS in Playwright,
then inspect the desktop rendering in Chromium.

**Done:** `/noise-gradient` uses SVG-generated fractal noise with no raster
noise request or interactive controls.
