---
quick_id: 260903-jnk
description: Apply mix-blend-mode directly to an inline SVG turbulence layer on /noise-gradient.
date: 2026-09-03
---

# Quick Task Plan

Split the conic gradient and fractal noise into separate DOM layers. Render
`feTurbulence` in an inline SVG above the gradient and apply CSS
`mix-blend-mode: multiply` directly to that SVG. Remove the external noise SVG,
update the focused browser contract, and inspect the result in Chromium.
