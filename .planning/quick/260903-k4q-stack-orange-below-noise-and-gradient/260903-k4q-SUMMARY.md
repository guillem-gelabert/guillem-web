---
quick_id: 260903-k4q
status: complete
completed: 2026-09-03
commit: eb4f119
---

# Orange base stacked below noise and conic

The composition now has three explicit layers inside the isolated wrapper:

1. Solid orange background at z0
2. Conic-shaped embedded SVG noise at z1
3. White → black conic gradient at z2

The background-mode control still blends the two noise backgrounds, while the
mix-mode control acts on the top conic. Selecting normal mix mode now displays
the white → black conic instead of a solid orange box.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test exercises overlay and normal mix modes
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
