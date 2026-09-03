---
quick_id: 260903-jy6
status: complete
completed: 2026-09-03
commit: a9083b6
---

# Blend-mode controls added

`/noise-gradient` now provides controlled dropdowns for the noise layer's
`background-blend-mode` and the conic overlay's `mix-blend-mode`. They default
to `normal` and `multiply`, respectively, and expose the standard blend-mode
set. The square scales down to leave room for the controls.

The React implementation follows the official controlled-select pattern: each
select binds its state through `value` and updates it synchronously in
`onChange`.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
