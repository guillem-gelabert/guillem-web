---
quick_id: 260903-fdq
description: Add controllable minimum widths and heights to the style playground boxes
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Protect box dimensions with configurable minimums

**Files:**
- `app/(en)/style-playground/seam-playground.tsx`
- `app/(en)/style-playground/style-playground.module.css`

**Action:** Add minimum-width and minimum-height controls to Leva's Layout group, pass them through typed CSS custom properties, and apply them to both boxes. Keep the calculated landscape and stacked dimensions as the preferred responsive sizes while preventing extreme viewport or control values from collapsing a box below its configured floor.

**Verify:** Run focused ESLint, check the route on the existing development server, run `git diff --check`, and complete a production build.

**Done:** Both boxes have adjustable minimum dimensions, the defaults do not alter normal desktop or mobile layouts, and seam measurement continues to use their rendered corners.
