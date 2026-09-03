---
quick_id: 260903-nbd
status: complete
completed: 2026-09-03
commit: fac5511
---

# Dithered tone ramps simplified and verified

The staged `/noise-gradient` change now ships selectable three- and five-tone
pink ramps built from shared SVG turbulence fields. Its React mode model was
kept intact because it is already the smallest clear representation of the two
configurations.

The supporting code was tightened before commit:

- CSS comments now explain only the non-obvious overlap, compositing, and
  opacity rules; repeated per-arc arithmetic was removed.
- The Playwright visual analysis uses a fixed polar sampling grid instead of
  `Math.random()`.
- Assertions that repeated exact CSS implementation constants were removed;
  the test keeps semantic controls, layer counts, and rendered-output checks.

## Verification

- Focused ESLint — passed
- `npx tsc --noEmit` — passed
- Noise-gradient Playwright spec repeated five times in parallel — 5 passed
- `git diff --cached --check` — passed before commit

Unrelated working-tree changes were preserved and excluded from `fac5511`.
