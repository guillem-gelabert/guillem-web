---
quick_id: 260903-eef
description: Make the /style-playground boxes transparent and replace their labels with Humane text that uses difference blending to invert over the black-to-white gradient
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Convert the boxes to inverse transparent type frames

**Files:**
- `app/(en)/style-playground/seam-playground.tsx`
- `app/(en)/style-playground/style-playground.module.css`

**Action:** Remove the blue and red box fills while preserving their responsive geometry. Replace the A/B display labels with `BLACK` and `WHITE`, set them in the existing Humane display face, and composite the transparent box contents with `mix-blend-mode: difference` so white-rendered type and outlines invert against the monochrome gradient.

**Verify:** Run focused ESLint, check the route on the existing development server, and complete a production build.

**Done:** Both boxes are transparent, retain visible inverse geometry, and contain large Humane text that flips between white and black according to the background beneath it.
