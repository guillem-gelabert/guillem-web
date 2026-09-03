---
quick_id: 260903-e0l
status: complete
completed: 2026-09-03
commit: f44524f
---

# Bottom-left seam pivot

Moved the `/style-playground` conic-gradient origin from the midpoint between the two boxes to the point where the same seam meets the viewport boundary nearest the bottom-left corner.

The seam angle is still calculated from A's bottom-right corner to B's top-left corner, so the requested corner alignment and narrower-screen flattening are unchanged. The CSS fallback origin now also begins near the bottom-left.

## Verification

- `npx eslint 'app/(en)/style-playground/seam-playground.tsx'`
- `git diff --check`
- `curl http://127.0.0.1:3000/style-playground` returned `200`
- `npm run build`
