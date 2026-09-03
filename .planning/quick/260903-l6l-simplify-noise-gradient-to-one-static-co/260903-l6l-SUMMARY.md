---
quick_id: 260903-l6l
status: complete
completed: 2026-09-03
commit: c71eb5d
---

# Noise gradient reduced to one static background

The experimental layer stack, React state, masks, duplicated fields, palette
guards, and controls have all been removed. `/noise-gradient` now renders one
empty square with three CSS background images:

- A solid pink color layer using `color`
- One embedded SVG `feTurbulence` texture using `soft-light`
- One continuous grayscale conic gradient underneath

The conic uses the same 50%/70% origin and repeats gray at 0°, 180°, and 360°,
with black at 90° and white at 270°. That makes both conic joins resolve to
pink and avoids a black-to-white discontinuity.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Focused test verifies the single empty element, three background layers, turbulence data URI, blend modes, conic stops, and absence of controls/masks
- Desktop Chromium screenshot inspected
- `git diff --check` for the changed source and test files — passed
