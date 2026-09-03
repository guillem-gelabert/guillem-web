---
quick_id: 260903-kk1
status: complete
completed: 2026-09-03
commit: a96d3a9
---

# New blend defaults applied

`/noise-gradient` now initializes with:

- Background mode: `hue`
- Mix mode: `luminosity`
- Noise mask: disabled

All controls remain interactive. Contrast and brightness defaults are unchanged
at 150% and 700%.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test verifies all three initial states and re-enables the mask
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
