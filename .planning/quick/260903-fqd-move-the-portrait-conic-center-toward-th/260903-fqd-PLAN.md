---
quick_id: 260903-fqd
description: Move the portrait conic center toward the bottom-left and make the seam more vertical
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Aim the portrait seam from the lower-left pivot through the gap

**Files:**
- `app/(en)/style-playground/seam-playground.tsx`
- `app/(en)/style-playground/style-playground.module.css`

**Action:** In portrait, place the conic center and rotation pivot at the Leva-controlled lower-left position (15% from each edge by default), then calculate the seam direction from that point through the midpoint between A's bottom-right and B's top-left. Remove the centered portrait fallback and let the shared center controls provide the pre-hydration origin. Preserve landscape geometry.

**Verify:** Run focused ESLint, request `/style-playground` from the existing development server, run `git diff --check`, and complete a production build.

**Done:** The portrait conic origin is close to the bottom-left, the rising-right seam crosses the inter-box gap and becomes more vertical as the viewport narrows, and the pivot and cone center remain identical.
