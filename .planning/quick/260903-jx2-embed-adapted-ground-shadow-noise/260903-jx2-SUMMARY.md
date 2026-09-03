---
quick_id: 260903-jx2
status: complete
completed: 2026-09-03
commit: cb9b992
---

# Adapted ground-shadow grain recipe embedded

The noise layer now uses the supplied SVG data-URI technique with a 400×310
viewBox, `fractalNoise`, `baseFrequency="0.55"`, three octaves, and stitched
tiles. Its radial ellipse is adapted to the square's 50%/70% conic origin, with
`contrast(150%) brightness(700%)`.

The separate SVG file was removed. The isolated black → orange → white overlay
and its multiply blend remain unchanged.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
