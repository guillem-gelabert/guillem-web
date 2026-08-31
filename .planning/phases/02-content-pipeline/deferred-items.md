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

---

## CR-01 — localised `[slug]` 404s do not server-render (deferred to Phase 6)

**Status:** open, deferred by coordinator decision 2026-08-31.
**Severity:** Critical (WCAG 3.1.1 Level A) but narrowly scoped — affects only
`/writing/<unknown>` and `/texte/<unbekannt>` with JavaScript disabled. The root
404 and all non-`[slug]` paths were fixed under WR-14 (`39d35aa`) and do
server-render correctly.

**Measured behaviour** (`next start`, JS disabled, after WR-14 landed):

| path | status | lang | h1 |
|---|---|---|---|
| `/nope` | 404 | `en` | `Not found` | ← fixed |
| `/writing/does-not-exist` | 404 | (none) | (none) | ← open |
| `/texte/gibt-es-nicht` | 404 | (none) | (none) | ← open |

**Root cause is framework-level, not a repo bug.** Next 16.3.3's
`next/dist/server/app-render/app-render.js` seeds every HTTP-access-fallback
error response with a hardcoded `createElement('html', { id: '__next_error__' })`;
the boundary's content reaches the client only via the flight payload. Isolated
four ways: with and without a root `app/not-found.tsx`; with `dynamic =
"force-dynamic"`; with the client component removed from the boundary; and
decisively, a throwaway *static* route calling `notFound()` unconditionally
prerendered to `__next_error__` at build time.

**Why not the two obvious fixes.**
`dynamicParams = false` does move the 404 to the routing layer, which server-renders
correctly — but the routing-layer 404 always serves the global `/_not-found`, so
`/texte/unbekannt` would render **English**, and both `not-found.tsx` files become
dead code. That contradicts `02-UI-SPEC.md`'s Error State row, which mandates
`Nicht gefunden` / `Diesen Text gibt es hier nicht.` Localising it is not possible:
`headers()` in `app/not-found.tsx` turns every page dynamic (`Page changed from
static to dynamic at runtime`, 500s), and `usePathname()` reports `/_not-found`
rather than the URL typed.

**Chosen disposition: fix in Phase 6 via the middleware layer that phase already
requires.** `06-CONTEXT.md` commits to a security-headers implementation; a
Node-runtime `middleware.ts` that rewrites unmatched localised slugs to a
per-locale 404 page with a 404 status is a small addition to infrastructure that
is arriving anyway, and it is the only option that keeps the German error copy
*and* fixes the accessibility defect. Deferring costs nothing in the meantime —
the site ships `noindex` until Phase 6 flips it.

**Do not** add a no-JS assertion for the two localised paths before this lands;
it would fail today. `tests/writing-not-found.spec.ts` already asserts server HTML
with `javaScriptEnabled: false` for the three paths that *are* fixed, and carries
a comment recording this trade so it is not re-derived.
