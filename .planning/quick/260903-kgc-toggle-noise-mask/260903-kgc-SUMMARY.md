---
quick_id: 260903-kgc
status: complete
completed: 2026-09-03
commit: fbf0bc4
---

# Noise-mask toggle added

`/noise-gradient` now has a controlled “Noise mask” checkbox, enabled by
default. Disabling it removes the conic mask background while retaining the
embedded SVG turbulence and its monochrome filter treatment.

The pink base, visible conic, isolation, and both blend-mode controls remain
unchanged. The embedded SVG data URI is factored into a CSS custom property so
the masked and unmasked states share one texture definition.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test disables the checkbox and verifies the conic mask disappears while the SVG remains
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
