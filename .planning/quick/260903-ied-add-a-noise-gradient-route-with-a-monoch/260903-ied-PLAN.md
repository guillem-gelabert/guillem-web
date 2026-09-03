---
quick_id: 260903-ied
description: Add a /noise-gradient route with a monochrome Gaussian noise PNG layer, a red-to-yellow conic-gradient layer, and a dropdown that changes their blend mode.
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Build the noise-and-gradient study

**Files:**
- `app/(en)/noise-gradient/page.tsx`
- `app/(en)/noise-gradient/noise-gradient.tsx`
- `app/(en)/noise-gradient/noise-gradient.module.css`
- `public/noise-gradient.png`

**Action:** Add a static `/noise-gradient` route with a small client component
for the blend-mode selection. Render exactly two visual layers: a red-to-yellow
conic-gradient div and a monochrome Gaussian-noise PNG div above it. Default to
`soft-light` so both layers are legible, while offering a representative set of
standard CSS blend modes from the native select control.

**Verify:** Run ESLint, production build, and inspect the route in Chromium.

**Done:** `/noise-gradient` displays the two requested layers and selecting a
blend mode updates the noise layer immediately.

## Task 2: Cover the interactive contract

**Files:**
- `tests/noise-gradient.spec.ts`

**Action:** Add a focused Playwright specification that verifies the route,
both visual sources, the default blend mode, and a dropdown change.

**Verify:** Run the focused Playwright specification on an isolated port.

**Done:** The route's visual ingredients and dropdown behavior are protected
by a browser-level test.
