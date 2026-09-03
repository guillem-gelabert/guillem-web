---
quick_id: 260903-kyf
description: Replace palette guards with two separate black and white monochrome noise-gradient elements, colorized over a pink background.
date: 2026-09-03
---

# Quick Task Plan

Replace the shared noise, conic overlay, and palette-guard stack with two
independent SVG-turbulence elements: a screen-blended white field on the left
and a multiply-blended black field on the right. Shape both with soft conic
masks that reach zero at bottom-center, keep their internal noise treatment on
`luminosity`, and add a pink `color` layer over the isolated composition.

Retain the two blend selectors and the intensity sliders, rewiring them to the
new structure. Remove the obsolete optional noise-mask toggle and update the
focused browser contract for the new DOM and blend responsibilities.
