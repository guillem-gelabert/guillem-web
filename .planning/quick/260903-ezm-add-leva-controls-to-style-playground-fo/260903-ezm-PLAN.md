---
quick_id: 260903-ezm
description: Add Leva controls to /style-playground for all non-typographic geometry and gradient settings while preserving derived responsive behavior
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Install and integrate Leva controls

**Files:**
- `package.json`
- `package-lock.json`
- `app/(en)/style-playground/seam-playground.tsx`
- `app/(en)/style-playground/style-playground.module.css`

**Action:** Add Leva 0.10.1 and render a named control panel on the existing client playground. Group non-typographic controls for responsive layout coefficients, conic center and rotation, gradient colors, outline width, and anchor size. Feed the values into CSS custom properties while retaining derived box dimensions and the measured responsive base angle.

**Verify:** Run focused ESLint, check the route on the existing development server, and complete a production build.

**Done:** `/style-playground` has an interactive Leva panel that updates every non-typographic visual parameter without exposing font controls or breaking responsive geometry.
