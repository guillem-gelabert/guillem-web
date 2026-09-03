---
quick_id: 260903-kmx
description: Make brightness and contrast affect only SVG noise and correct blend-control semantics.
date: 2026-09-03
---

# Quick Task Plan

Keep the existing pink/noise/gradient stack and its selected blend behavior.
Reduce the noise element to the SVG texture alone, apply contrast/brightness
only there, and implement the optional conic falloff as a CSS mask rather than
a painted background on the filtered element. Verify the filter and mask
responsibilities through computed styles and interactions.
