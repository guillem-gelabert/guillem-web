---
quick_id: 260903-gy7
status: complete
completed: 2026-09-03
commit: 88cfed3
---

# Desktop and mobile seam modes added

The shared landing/playground scene now selects its layout by a 64rem device-width breakpoint, with separate orientation behavior inside mobile mode.

## What changed

- Kept the desktop corner layout active at every desktop aspect ratio.
- Added a bounded width-versus-height contribution to desktop box height so the measured corner-to-corner seam becomes flatter in tall windows and steeper in wide ones.
- Preserved the stacked mobile portrait layout and its bottom-left pivot.
- Added a clockwise-rotated mobile landscape layout: side-by-side boxes with an edge-sized gap and a bottom-right pivot aimed through that gap.
- Kept the landing page and `/style-playground` on identical responsive geometry.

## Verification

- The shared geometry hook passes ESLint.
- `/` and `/style-playground` returned HTTP 200 from the existing development server.
- `npm run build` passed; both routes remain statically prerendered.
- `git diff --check` passed.

## Commit

- `88cfed3 feat(260903-gy7): add responsive seam modes`
