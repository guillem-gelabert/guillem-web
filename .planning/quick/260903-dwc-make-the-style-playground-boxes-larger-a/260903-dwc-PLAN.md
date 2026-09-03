---
quick_id: 260903-dwc
mode: quick
status: ready
description: Make the /style-playground boxes larger and bring A's bottom-right and B's top-left closer together, following the supplied sketch while preserving responsive seam geometry
---

# Quick Task 260903-dwc Plan

## Task 1: Match the sketch's box proportions

**Files:**
- `app/(en)/style-playground/style-playground.module.css`

**Action:** Replace the oversized off-canvas square treatment with large viewport-relative rectangles anchored inside the upper-left and lower-right edges. Derive both widths from a narrow responsive corner gap and both heights from a responsive vertical overlap so the measured A bottom-right/B top-left seam matches the sketch and becomes flatter on narrow screens.

**Verify:** Run scoped lint, request `/style-playground` from the development server, and run the production build.

**Done:** Both boxes fill most of their corner quadrants, their designated corners sit much closer together, the seam remains exact, and narrow screens keep the more-horizontal response.
