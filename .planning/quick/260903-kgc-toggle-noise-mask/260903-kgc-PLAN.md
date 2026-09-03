---
quick_id: 260903-kgc
description: Add a checkbox to toggle the /noise-gradient conic noise mask.
date: 2026-09-03
---

# Quick Task Plan

Add a controlled “Noise mask” checkbox, enabled by default. When disabled,
remove only the conic mask background from the noise layer while preserving the
embedded SVG texture, grayscale/contrast/brightness filter, pink base, visible
conic gradient, isolation, and blend controls. Add browser coverage for both
states.
