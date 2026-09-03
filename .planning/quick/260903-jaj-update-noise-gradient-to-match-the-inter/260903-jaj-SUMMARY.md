---
quick_id: 260903-jaj
status: complete
completed: 2026-09-03
commit: 4e7f96b
---

# Noise-gradient adopts the reference Pen's noise treatment

The `/noise-gradient` PNG texture now uses the CSS behavior from the referenced
Pen: an oversized noise field, centered radial fade, high-contrast bright
inversion, and screen blending. Existing foreground-gradient and control
behavior stays intact.

## What changed

- Gave the noise layer the Pen's -15% vertical offset and 120% height.
- Added a centered black-to-transparent radial mask above the existing PNG.
- Applied `contrast(145%) brightness(650%) invert(100%)` and `screen`
  blending to produce the reference's bright, moonlit noise effect.
- Retained the gradient foreground layer plus all color, alpha, and blend-mode
  controls.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — passed
  (1 test), covering the radial background, filter, and screen blend.
- Chromium screenshot inspected at desktop size — the noise forms a bright,
  radially concentrated texture behind the gradient.
- `git diff --check` — passed.

## Reference

- https://codepen.io/cjimmy/pen/JjJWegZ

## Commit

- `4e7f96b feat(260903-jaj): adapt noise treatment from reference pen`
