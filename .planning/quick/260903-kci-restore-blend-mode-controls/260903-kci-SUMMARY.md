---
quick_id: 260903-kci
status: complete
completed: 2026-09-03
commit: 3af9a53
---

# Blend-mode controls restored

The background- and mix-mode selects are back so visual tuning can continue.
They use controlled React state and start from the current `normal` background
mode and `soft-light` mix mode.

The monochrome SVG-noise filter, orange base, conic layers, isolation, and
three-layer stack remain unchanged.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test changes both controls and verifies their computed CSS
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
