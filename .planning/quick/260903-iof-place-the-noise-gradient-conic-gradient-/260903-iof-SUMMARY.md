---
quick_id: 260903-iof
status: complete
completed: 2026-09-03
commit: 827d925
---

# Noise-gradient layer order reversed

The conic gradient is now the foreground layer over the Gaussian-noise PNG.
The blend-mode select remains effective by applying its selected mode to this
foreground gradient.

## What changed

- Reordered the visual layers so the noise renders first and the gradient
  renders second.
- Set the noise to `z-index: 0` and the gradient to `z-index: 1`.
- Moved `mix-blend-mode` from the noise to the foreground gradient.
- Corrected the accessible description to name the current yellow-orange-red
  gradient.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — passed
  (1 test), including z-index values and the new blend-mode target.
- Chromium screenshot inspected at desktop size — the gradient renders over the
  granular noise texture.
- `git diff --check` — passed.

## Commit

- `827d925 fix(260903-iof): layer the conic gradient above noise`
