---
quick_id: 260903-nbd
description: Simplify staged noise-gradient implementation and tests by trimming redundant comments, making visual sampling deterministic, and removing overlapping implementation assertions
date: 2026-09-03
---

# Quick Task Plan

Keep the staged noise-gradient implementation unchanged while tightening its
explanation and verification. Condense CSS comments to the non-obvious
compositing rationale, replace random screenshot sampling with a fixed polar
grid, and remove assertions that duplicate CSS constants already covered by
the rendered-output checks.

Verify the focused files with ESLint, TypeScript, the noise-gradient Playwright
spec, and Git's whitespace check. Commit only the staged noise-gradient feature
and this task's refinements; preserve unrelated working-tree changes.
