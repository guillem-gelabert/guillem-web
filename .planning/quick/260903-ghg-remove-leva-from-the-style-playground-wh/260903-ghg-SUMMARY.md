---
quick_id: 260903-ghg
status: complete
completed: 2026-09-03
commit: 4567f8a
---

# Leva removed from the style playground

Removed the runtime control panel while preserving the playground's current appearance and responsive seam behavior.

## What changed

- Removed the Leva component, controls, and inline CSS-variable overrides.
- Made the current design values the permanent CSS defaults, including the larger responsive clamp ceilings previously supplied by Leva.
- Kept the portrait seam calculation dynamic by reading the conic center from the CSS custom properties.
- Removed `leva` and its unused transitive packages from the dependency tree.

## Verification

- The playground component passes ESLint.
- `/style-playground` returned HTTP 200 from the existing development server.
- `npm run build` passed; `/style-playground` remains statically prerendered.
- `git diff --check` passed.
- `npm ls leva --depth=0` confirms Leva is absent.

## Commit

- `4567f8a refactor(260903-ghg): remove Leva from playground`
