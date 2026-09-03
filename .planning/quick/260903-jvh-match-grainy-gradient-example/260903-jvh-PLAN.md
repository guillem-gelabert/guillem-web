---
quick_id: 260903-jvh
description: Restructure /noise-gradient to more closely match the CSS-Tricks grainy-gradient example.
date: 2026-09-03
---

# Quick Task Plan

Add a dedicated isolated stacking wrapper with sibling noise and gradient
layers. Move `feTurbulence` into a separate local SVG loaded as the noise
layer's CSS background, and apply `mix-blend-mode` to the gradient overlay as
in the reference. Preserve the black → orange → white palette and center.
