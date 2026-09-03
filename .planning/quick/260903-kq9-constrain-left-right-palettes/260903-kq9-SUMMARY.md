---
quick_id: 260903-kq9
status: complete
completed: 2026-09-03
commit: be9231d
---

# Left and right palettes constrained

Two conic-half palette guards now sit above the existing composition at the
shared 50%/70% origin:

- Left: solid pink with `screen`, limiting neutral input to pink → white
- Right: solid pink with `multiply`, limiting neutral input to black → pink

The embedded monochrome SVG noise, optional noise mask, visible conic, and all
tuning controls continue to operate underneath these guards.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test verifies both conic masks, pink inputs, and fixed guard blend modes
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
