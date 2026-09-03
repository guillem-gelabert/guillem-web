---
quick_id: 260903-ka4
status: complete
completed: 2026-09-03
commit: c3818c4
---

# Optimal blend locked and controls removed

The temporary background- and mix-mode selects were removed together with all
React state, option data, client-component code, and control styles. The page
is a static Server Component again.

Eight useful mode combinations were visually compared after the monochrome
noise correction. The chosen static pair is:

- `background-blend-mode: normal` on the conic-shaped SVG noise
- `mix-blend-mode: soft-light` on the orange-lightness conic overlay

This keeps the light side bright, the dark side deep, and the noise monochrome.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test asserts fixed blend modes and absence of controls
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
