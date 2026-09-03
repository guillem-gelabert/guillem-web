---
quick_id: 260903-k9f
status: complete
completed: 2026-09-03
commit: 537571c
---

# SVG noise forced to monochrome

The feTurbulence output is now passed through `grayscale(100%)` before the
existing contrast and brightness filters. This collapses the SVG's independent
RGB channels to luminance and removes colored confetti speckles regardless of
the selected blend modes.

`isolation: isolate` remains on the layer wrapper. Its role is to contain blend
interactions; the grayscale stage handles color removal.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected; colored speckles removed
- `git diff --check` — passed
