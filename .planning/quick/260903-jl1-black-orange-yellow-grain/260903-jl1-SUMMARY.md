---
quick_id: 260903-jl1
status: complete
completed: 2026-09-03
commit: 6f4d134
---

# Black-to-yellow grain palette

The `/noise-gradient` conic sequence is now opaque black → orange → yellow.
The SVG turbulence texture and 30% bottom inset remain unchanged. Brightness
was normalized to preserve a visibly orange middle instead of clipping it.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
