---
quick_id: 260903-klk
status: complete
completed: 2026-09-03
commit: 1e2dda7
---

# Noise frequency preserved across mask states

The unmasked state now explicitly keeps the SVG background at 400×310px,
centered and repeating. Previously, removing the first background image caused
CSS's comma-list alignment to assign the surviving SVG the conic layer's
`auto` size, changing its apparent frequency.

Only the conic mask now changes when the checkbox is toggled; the underlying
SVG texture stays identical.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test verifies computed background size, position, and repeat in both states
- `git diff --check` — passed
