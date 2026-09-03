---
quick_id: 260903-jzh
description: Remove the radial mask so /noise-gradient uses conic gradients only.
date: 2026-09-03
---

# Quick Task Plan

Replace the noise layer's radial shaping gradient with a conic black →
transparent → black mask centered at the existing 50%/70% origin. Preserve the
embedded SVG turbulence, black → orange → white overlay, filters, isolation,
and blend-mode controls. Assert that no radial gradient remains.
