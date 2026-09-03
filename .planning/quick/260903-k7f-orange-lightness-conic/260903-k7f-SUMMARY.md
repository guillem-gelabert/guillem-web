---
quick_id: 260903-k7f
status: complete
completed: 2026-09-03
commit: 0309d58
---

# Orange lightness conic

The visible conic gradient now uses explicit orange-HSL endpoints:
`hsl(30 100% 0%)` → `hsl(30 100% 100%)`. This preserves the orange hue while
sweeping lightness from black to white in the requested direction.

The orange base, SVG turbulence, conic noise mask, three-layer stack, and both
blend controls remain unchanged.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test verifies black precedes white in the computed conic
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
