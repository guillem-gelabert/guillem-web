# Deferred Items — Phase 2

Items discovered during execution that are out of scope for the plan that found them (per the
executor's SCOPE BOUNDARY rule) and are logged here rather than fixed.

## 02-03 Task 2: pre-existing `npm run lint` error in `components/smear-heading/use-prefers-reduced-motion.ts`

- **Found during:** Task 2's verification (`npm run lint`)
- **What:** `react-hooks/set-state-in-effect` flags line 23 —
  `setPrefersReducedMotion(mediaQuery.matches)` called synchronously inside the
  mount `useEffect`, before the change-listener subscription.
- **Why out of scope:** the file is Phase 1 output (commit `9b98e08`), not touched by this plan.
  `02-03-PLAN.md` Task 3 explicitly forbids touching `components/smear-heading/` at all, and its
  own acceptance criteria assert `git diff --stat HEAD -- components/smear-heading/` is empty.
  Fixing the lint finding would require editing this file, which the plan itself prohibits.
- **Root cause (not fixed):** the rule requires reading `mediaQuery.matches` via the effect's own
  synchronous state read pattern; the idiomatic fix is `useState(() => window.matchMedia(QUERY).matches)`
  as the initializer, or `useSyncExternalStore`. Neither was in scope here.
  This is very likely a newer `eslint-plugin-react-hooks` rule that shipped after Phase 1 was
  written (`npm ci` installs whatever `package-lock.json` currently pins, and this rule was not
  necessarily active at Phase 1 execution time).
- **Impact:** `npm run lint` exits 1 for this reason alone; all Phase 2 files added by 02-03 lint
  clean individually (verified by scoping `npx eslint components/mdx components/prose.tsx
  components/smear-title.tsx components/post-meta.tsx components/language-switch.tsx
  mdx-components.tsx` — 0 errors, pre-existing warnings only).
- **Recommendation:** a future phase (or a dedicated lint-debt task) should fix
  `use-prefers-reduced-motion.ts` directly, independent of Phase 2's content-pipeline scope.

- **Update (code-review fix, WR-12):** the *volume* problem is fixed — `eslint.config.mjs`
  now ignores `.claude/**` (the agent worktree, a full second copy of the tree) plus
  Playwright's generated output, and prefix-ignores the intentional `_`-prefixed discards.
  `npm run lint` went from **589 errors + 8,609 warnings** to **1 error, 0 warnings**, and
  that one error is this item. The hand-written file list workaround described above is no
  longer needed. This item itself remains deferred and unfixed, as scoped.
