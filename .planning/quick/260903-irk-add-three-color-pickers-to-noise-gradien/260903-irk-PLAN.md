---
quick_id: 260903-irk
description: Add three color pickers to /noise-gradient for its yellow, orange, and red gradient stops, and move the gradient center to 30% inset from the bottom.
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Make the three gradient stops adjustable

**Files:**
- `app/(en)/noise-gradient/noise-gradient.tsx`
- `app/(en)/noise-gradient/noise-gradient.module.css`
- `tests/noise-gradient.spec.ts`

**Action:** Add three native color inputs for the yellow, orange, and red stops.
Feed their values into scoped CSS custom properties; preserve the orange stop's
50% alpha. Move the conic center to 30% inset from the bottom and make the
control layout responsive.

**Verify:** Run the focused Playwright test, including changing the orange
picker, and inspect the controls and gradient in Chromium.

**Done:** Each picker immediately changes its gradient stop and the center is
at the horizontal midpoint, 30% above the bottom edge.
