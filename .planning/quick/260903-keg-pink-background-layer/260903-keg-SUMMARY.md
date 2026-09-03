---
quick_id: 260903-keg
status: complete
completed: 2026-09-03
commit: 6129d1e
---

# Pink base layer

The lowest `/noise-gradient` layer changed from orange to bright pink
(`#ff1493`). The visible conic remains a neutral black → white → black loop;
the noise-shaping conic remains black → transparent → black. Pink enters the
result only through the base layer and blending.

SVG turbulence, grayscale filtering, isolation, stacking, and both blend-mode
controls remain unchanged.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
