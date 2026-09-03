---
quick_id: 260903-jmr
status: complete
completed: 2026-09-03
commit: 81145f2
---

# Black-to-white grain palette corrected

The final `/noise-gradient` stop is now opaque white, producing the requested
black → orange → white sequence. SVG turbulence, CSS multiply blending, the
grain filter, and gradient position are unchanged.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
