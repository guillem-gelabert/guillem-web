---
quick_id: 260903-jee
status: complete
completed: 2026-09-03
commit: 426e3ce
---

# Noise-gradient controls removed

`/noise-gradient` is a static composition again. The color pickers, opacity
sliders, and blend-mode selector were removed along with their client-side
state, while the current visual values were preserved in CSS.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Chromium screenshot inspected at desktop size
- `git diff --check` — passed
