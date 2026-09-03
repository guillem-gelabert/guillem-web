---
quick_id: 260903-fbc
description: Stack the style playground boxes vertically at aspect ratios of 1:1 and narrower
date: 2026-09-03
---

# Quick Task Plan

## Task 1: Add the square-and-portrait layout

**Files:**
- `app/(en)/style-playground/style-playground.module.css`

**Action:** Add a `max-aspect-ratio: 1 / 1` layout that makes both boxes nearly viewport-wide, divides the available height between them, and aligns them into one vertical column with A above B. Preserve the current landscape layout and the existing corner markers. Let the client component's existing `ResizeObserver` remeasure A's bottom-right and B's top-left after the media query changes the boxes.

**Verify:** Run the focused stylesheet checks, request `/style-playground` from the existing development server, and complete a production build.

**Done:** At square and portrait aspect ratios the boxes are stacked vertically; above 1:1 they remain side by side, and the gradient seam continues to follow the designated corners.
