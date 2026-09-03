---
quick_id: 260903-jee
description: Remove all controls from /noise-gradient while preserving its current static gradient and noise treatment.
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Return the noise-gradient study to a static composition

**Files:**
- `app/(en)/noise-gradient/noise-gradient.tsx`
- `app/(en)/noise-gradient/noise-gradient.module.css`
- `tests/noise-gradient.spec.ts`

**Action:** Remove color, alpha, and blend-mode controls together with the
client-side state that powers them. Move their current values into CSS custom
properties and static rules, leaving the conic and CodePen-inspired noise
treatment untouched. Update the browser test to assert the static composition
and absence of form controls.

**Verify:** Run the focused Playwright test and inspect the full-viewport study
in Chromium.

**Done:** `/noise-gradient` is a static, control-free study with no client
component state or form elements.
