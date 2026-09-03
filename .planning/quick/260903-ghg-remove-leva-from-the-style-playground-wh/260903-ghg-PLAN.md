---
quick_id: 260903-ghg
description: Remove Leva from the style playground while preserving its current visual defaults
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Remove the Leva control layer

**Files:**
- `app/(en)/style-playground/seam-playground.tsx`
- `app/(en)/style-playground/style-playground.module.css`
- `package.json`
- `package-lock.json`

**Action:** Remove the Leva panel, hooks, style overrides, and dependency. Move the current control defaults into the playground's CSS custom properties so the rendered design remains unchanged. Keep the responsive seam calculation client-side, reading its fixed conic-center coordinates from CSS so landscape and portrait geometry continue to share the same source of truth.

**Verify:** Lint the playground component, request `/style-playground` from the existing development server, run `git diff --check`, and complete a production build.

**Done:** `/style-playground` has no Leva UI or package dependency, while its current box sizing, gradient, seam alignment, and responsive behavior remain intact.
