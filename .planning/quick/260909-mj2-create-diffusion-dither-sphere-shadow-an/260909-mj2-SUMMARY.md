---
status: complete
quick_id: 260909-mj2
description: Create diffusion-dither sphere shadow and highlight blend overlays
---

# Diffusion-dither sphere overlays

Created two 1254 × 1254, 8-bit monochrome PNG overlays in `public/work/`:

- `sphere-shadow-diffusion.png` — black diffusion-dithered sphere for `darken` blending.
- `sphere-highlight-diffusion.png` — inverse white diffusion-dithered sphere for `lighten` or `screen` blending.

They share the same clipped sphere silhouette, have no floor shadow, and contain only black and white pixels. This makes them reusable over any project thumbnail without introducing a background colour.

## Related landing refinement

The same refinement moved the reading face to variable Jost, established the More Work circle/square geometry, promoted the latest Mallorca project to the featured square, renamed and shortened the defunction-model project copy, added the dither-to-colour globe hover reveal, neutralised project-link hover colour/decoration, thinned the language switch, used the full-resolution grain on touch devices, and disabled the retained heading-trail implementation.

## Verification

- ImageMagick confirmed each asset is 1254 × 1254, 8-bit PNG with two colours.
- Relevant Playwright landing and trail specs, unit work-data tests, and lint checks passed before the commit.
