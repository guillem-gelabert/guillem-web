---
quick_id: 260903-jzh
status: complete
completed: 2026-09-03
commit: 6316175
---

# Noise mask changed to conic

The radial/elliptical noise mask inherited from the ground-shadow example was
replaced with a conic black → transparent → black mask at the same 50%/70%
origin. `/noise-gradient` now contains only conic CSS gradients.

SVG turbulence, the black → orange → white overlay, filters, isolation, and
both blend-mode controls remain intact.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test asserts no `radial-gradient` remains
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
