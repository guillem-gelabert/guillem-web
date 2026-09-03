---
quick_id: 260903-dmw
mode: quick
status: ready
description: Correct the /style-playground conical-gradient seam so it passes through box A's bottom-right corner and box B's top-left corner
---

# Quick Task 260903-dmw Plan

## Task 1: Correct the seam anchors

**Files:**
- `app/(en)/style-playground/seam-playground.tsx`
- `app/(en)/style-playground/style-playground.module.css`

**Action:** Change the measured line endpoints from A bottom-left/B top-right to A bottom-right/B top-left, move the visible corner markers to those same endpoints, and cap responsive box sizing so the two inner corners retain horizontal separation on very narrow screens.

**Verify:** Run scoped lint, request `/style-playground` from the development server, and run the production build.

**Done:** The conic gradient's two hard-stop rays form the full line through A's bottom-right and B's top-left, with the boxes remaining on opposite sides as the viewport narrows.
