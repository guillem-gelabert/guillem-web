---
quick_id: 260903-ied
status: complete
completed: 2026-09-03
commit: b124afd
---

# Noise-gradient blend study

`/noise-gradient` is a static route that layers a 512×512 monochrome Gaussian
noise PNG over a red-to-yellow conic gradient. Its native blend-mode select
updates the PNG layer immediately, with `soft-light` as the initial state.

## What changed

- Added the isolated `/noise-gradient` page and client-side blend-mode control.
  The study has precisely two visual div layers: the conic gradient and the
  repeated PNG noise texture.
- Generated `public/noise-gradient.png` as an 8-bit, 512×512 grayscale PNG
  with Gaussian noise, ready to replace if the user later provides a preferred
  noise asset.
- Added browser coverage for the route, both visual source layers, the default
  selection, and switching the blend mode to `multiply`.

## Verification

- `npm run build` — passed; Next.js prerenders `/noise-gradient` as a static
  route.
- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — passed
  (1 test).
- Chromium screenshot inspected at desktop size — the gradient, texture, and
  labelled select are visible and legible.
- `git diff --check` — passed.
- `npm run lint` — remains red from the pre-existing
  `react-hooks/set-state-in-effect` error at
  `components/smear-heading/use-prefers-reduced-motion.ts:23`; the error is
  already recorded in `.planning/STATE.md` and no new lint issues were added.

## Commit

- `b124afd feat(260903-ied): add a noise gradient blend study`
