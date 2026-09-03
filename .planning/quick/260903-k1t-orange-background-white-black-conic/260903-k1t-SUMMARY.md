---
quick_id: 260903-k1t
status: complete
completed: 2026-09-03
commit: cb0c168
---

# Orange background and monochrome conic

The `/noise-gradient` page background is now orange (`#ff8000`). The visible
conic overlay was simplified from black/orange/white to white → black, with no
orange stop inside the conic itself.

SVG turbulence, the conic noise mask, shared 50%/70% origin, filters,
isolation, and both blend-mode controls remain unchanged.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
