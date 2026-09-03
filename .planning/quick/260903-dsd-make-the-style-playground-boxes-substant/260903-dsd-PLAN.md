---
quick_id: 260903-dsd
mode: quick
status: ready
description: Make the /style-playground boxes substantially larger and reflect the current corner-aligned seam angle across the vertical y-axis
---

# Quick Task 260903-dsd Plan

## Task 1: Enlarge the boxes and mirror the seam

**Files:**
- `app/(en)/style-playground/style-playground.module.css`

**Action:** Preserve the previous responsive corner coordinates as hidden anchor geometry, swap their vertical coordinates to produce the exact vertical-axis reflection of the existing line, and position substantially larger boxes around those anchors so A's bottom-right and B's top-left remain the measured seam corners.

**Verify:** Run scoped lint, request `/style-playground` from the existing development server, and run the production build.

**Done:** Both boxes are roughly twice the previous desktop size, their designated corners still define the conical-gradient seam, the seam has the reflected slope, and narrower layouts still trend toward horizontal.
