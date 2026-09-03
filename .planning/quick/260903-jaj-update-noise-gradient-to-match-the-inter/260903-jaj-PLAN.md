---
quick_id: 260903-jaj
description: Update /noise-gradient to match the interaction behavior of the referenced CodePen https://codepen.io/cjimmy/pen/JjJWegZ while retaining the page controls.
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Port the CodePen noise treatment

**Files:**
- `app/(en)/noise-gradient/noise-gradient.module.css`
- `tests/noise-gradient.spec.ts`

**Action:** Adapt the CodePen's CSS-only noise behavior to the existing PNG
layer: overflow it vertically, fade it with a centered radial mask, increase
contrast and brightness before inversion, and blend it with `screen`. Preserve
the foreground gradient and all existing color, opacity, and blend controls.

**Verify:** Run the focused Playwright test and inspect the texture treatment in
Chromium.

**Done:** The noise layer has the CodePen-inspired radial, filter, and screen
blend treatment while the page's controls remain functional.
