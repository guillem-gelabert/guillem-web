---
quick_id: 260903-gn5
status: complete
completed: 2026-09-03
commit: 6cc7c43
---

# Playground design applied to the landing page

The root page now places its nameplate and featured case study in the playground's responsive transparent-frame composition over the same black-to-white conic gradient.

## What changed

- Added a focused client layout for the landing scene while keeping the page, metadata, and content resolution server-rendered.
- Recreated the playground's top-left and bottom-right frames, inverse blend mode, anchor points, minimum dimensions, conic center, and portrait stacking behavior around the landing content.
- Extracted the seam calculation into a shared hook used by both `/` and `/style-playground`.
- Removed the superseded static landing gradient and constrained the two-line nameplate against both viewport width and height.

## Verification

- All changed TypeScript files pass ESLint.
- `/` and `/style-playground` returned HTTP 200 from the existing development server.
- `npm run build` passed; both routes remain statically prerendered.
- `git diff --check` passed.

## Commits

- `3554097 refactor(260903-gn5): share seam alignment logic`
- `6cc7c43 feat(260903-gn5): bring playground design to landing`
