---
quick_id: 260903-lcq
description: Restore the exact pre-palette /noise-gradient implementation from commit b2cdf6a.
date: 2026-09-03
---

# Quick Task Plan

Restore the `/noise-gradient` component, stylesheet, and focused Playwright
spec exactly as they existed at `b2cdf6a`, the last version before the
left/right palette guards were introduced. This returns to three isolated
layers—a pink base, one SVG turbulence layer, and one black-to-white conic
gradient—plus the blend, mask, contrast, and brightness controls.

Do not touch the user's unrelated landing and seam work. Resolve the current
conflicted noise-gradient test by replacing it with the known-good historical
version, then run that focused contract and inspect the restored page.
