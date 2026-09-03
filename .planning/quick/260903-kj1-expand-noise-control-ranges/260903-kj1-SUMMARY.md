---
quick_id: 260903-kj1
status: complete
completed: 2026-09-03
commit: 14ed055
---

# Noise-control ranges expanded

The SVG-noise sliders now support:

- Contrast: 0–1000%, step 10%, default 150%
- Brightness: 0–3000%, step 25%, default 700%

All other visual behavior and controls remain unchanged.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test verifies slider attributes and computed filters at both maximum values
- `git diff --check` — passed
