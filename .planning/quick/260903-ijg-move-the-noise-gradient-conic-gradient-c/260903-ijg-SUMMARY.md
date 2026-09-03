---
quick_id: 260903-ijg
status: complete
completed: 2026-09-03
commit: bb86214
---

# Noise-gradient pivot moved to the bottom center

The conic gradient on `/noise-gradient` now pivots at the horizontal center,
5px above the study square's bottom edge.

## What changed

- Changed the gradient center from its implicit center point to
  `50% calc(100% - 5px)`.
- Extended the browser test to assert that exact rendered gradient position.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — passed
  (1 test).
- Chromium screenshot inspected at desktop size — the conic seam meets the
  square's bottom center with the requested inset.
- `git diff --check` — passed.

## Commit

- `bb86214 fix(260903-ijg): move noise-gradient pivot to bottom center`
