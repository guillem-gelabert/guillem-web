---
quick_id: 260903-ilj
description: Update the /noise-gradient conic gradient to yellow at full opacity, orange at 50% opacity, then red at full opacity.
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Update and protect the conic-gradient color stops

**Files:**
- `app/(en)/noise-gradient/noise-gradient.module.css`
- `tests/noise-gradient.spec.ts`

**Action:** Replace the two-color conic gradient with yellow at full opacity,
orange at 50% opacity, and red at full opacity. Extend the focused browser
test to assert the three rendered colors and alpha value.

**Verify:** Run the focused Playwright test and inspect the updated gradient in
Chromium.

**Done:** The conic gradient renders yellow → transparent orange → red while
retaining the existing 5px bottom-center pivot.
