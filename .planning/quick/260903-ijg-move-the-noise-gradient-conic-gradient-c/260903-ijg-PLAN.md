---
quick_id: 260903-ijg
description: Move the /noise-gradient conic-gradient center to the bottom-center of the square, inset by 5px.
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Reposition and protect the conic pivot

**Files:**
- `app/(en)/noise-gradient/noise-gradient.module.css`
- `tests/noise-gradient.spec.ts`

**Action:** Set the red-to-yellow conic gradient's center to horizontally
centered and 5px above the bottom of its square. Update the focused browser
spec to assert the rendered gradient retains that position.

**Verify:** Run the focused Playwright test and inspect the route in Chromium.

**Done:** The conic center sits at `50% calc(100% - 5px)` of the study square.
