---
quick_id: 260903-ktb
status: complete
completed: 2026-09-03
commit: bcd9cef
---

# Palette join softened with a pink center

The hard 180-degree swap between the left `screen` guard and right `multiply`
guard has been removed. Each side now feathers away from the downward axis,
and a normal-blend pink guard fills the middle with an opaque center and soft
edges.

The upper conic wrap is feathered as well, preventing the previous vertical
division from continuing above the 50%/70% gradient origin. The result keeps
white grain over pink at bottom-left, solid pink at bottom-center, and black
grain over pink at bottom-right.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test verifies the pink center guard, normal blend mode, conic origin, and top z-index
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
