---
quick_id: 260903-irk
status: complete
completed: 2026-09-03
commit: 94b9f96
---

# Noise-gradient colors made adjustable

`/noise-gradient` now has three native color pickers for the yellow, orange,
and red conic-gradient stops. The orange stop retains its fixed 50% alpha, and
the gradient's center is 30% inset from the bottom edge.

## What changed

- Added controlled Yellow, Orange, and Red color inputs.
- Passed their values to scoped CSS custom properties; the middle color is
  converted to `rgb(... / 0.5)` before rendering.
- Moved the conic center to `50% 70%`, which is 30% up from the bottom.
- Kept the foreground gradient, noise texture, and blend-mode control intact.
- Placed color and blend controls side-by-side at desktop widths, then stack
  them on narrow screens; constrained the square's height so all controls fit
  within a 720px viewport.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — passed
  (1 test). It checks the 30%-from-bottom center, three defaults, the orange
  picker updating the rendered gradient at 50% alpha, the z-order, and blend
  selection.
- Chromium screenshot inspected at desktop size — all three color controls and
  the blend selector are visible without scrolling.
- `git diff --check` — passed.

## Commit

- `94b9f96 feat(260903-irk): add configurable noise-gradient colors`
