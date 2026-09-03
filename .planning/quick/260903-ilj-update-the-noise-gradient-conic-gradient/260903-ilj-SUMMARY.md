---
quick_id: 260903-ilj
status: complete
completed: 2026-09-03
commit: 753c9f9
---

# Noise-gradient palette updated

The `/noise-gradient` conic gradient now progresses from opaque yellow through
50%-opacity orange to opaque red, retaining the 5px-inset bottom-center pivot.

## What changed

- Replaced the prior red-to-yellow gradient with `#ffe100`,
  `rgb(255 128 0 / 0.5)`, and `#e40000` in that order.
- Extended the focused browser test to verify all three rendered color stops,
  including the orange alpha value.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — passed
  (1 test).
- Chromium screenshot inspected at desktop size — the requested yellow,
  transparent-orange, and red palette is visible.
- `git diff --check` — passed.

## Commit

- `753c9f9 feat(260903-ilj): update noise-gradient color stops`
