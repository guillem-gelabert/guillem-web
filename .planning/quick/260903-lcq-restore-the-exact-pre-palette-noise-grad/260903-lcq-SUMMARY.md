---
quick_id: 260903-lcq
status: complete
completed: 2026-09-03
commit: 7c0849e
---

# Exact pre-palette noise study restored

The `/noise-gradient` component, stylesheet, and focused browser test now
match commit `b2cdf6a` byte-for-byte. This is the last historical version
before the left/right palette constraints and every later attempt to repair
their seam.

The restored page has a pink base, one embedded SVG `feTurbulence` layer, one
black-to-white conic overlay, isolation, blend selectors, an optional conic
noise mask, and contrast/brightness controls. No palette guards, center wedge,
or duplicated black/white noise elements remain.

## Verification

- `git diff b2cdf6a -- <three restored files>` — no differences
- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- Focused `git diff --check` — passed
