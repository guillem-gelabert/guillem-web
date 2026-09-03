---
quick_id: 260903-iof
description: Place the /noise-gradient conic-gradient layer above the noise layer on the z-axis while preserving the blend-mode control.
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Promote the conic gradient to the foreground

**Files:**
- `app/(en)/noise-gradient/noise-gradient.tsx`
- `app/(en)/noise-gradient/noise-gradient.module.css`
- `tests/noise-gradient.spec.ts`

**Action:** Put the PNG noise first and the conic gradient second in the layer
markup, assign explicit z-indices that keep the gradient above the noise, and
apply the selected blend mode to the now-foreground gradient. Update the
accessible visual description for the current yellow-orange-red palette and
assert the stack and interactive blend target in the browser test.

**Verify:** Run the focused Playwright test and inspect the foreground gradient
in Chromium.

**Done:** The conic gradient has `z-index: 1`, the noise has `z-index: 0`, and
the blend-mode dropdown continues to affect the visible composite.
