---
phase: 01-deploy-foundation-design-system
plan: 02
subsystem: ui
tags: [nextjs, next-font, tailwindv4, typography, self-hosted-fonts]

# Dependency graph
requires:
  - phase: 01-01
    provides: Bare Next.js 16.3.3 App Router scaffold, package.json build/start scripts locked
provides:
  - "app/fonts/humane.ts — next/font/local Humane loader (weight '100 900', display: optional, --font-humane)"
  - "app/fonts/newsreader.ts — next/font/google Newsreader loader (display: swap, --font-newsreader)"
  - "app/globals.css — Tailwind v4 @theme tokens (font/color/spacing) + four clamp()-based type-scale classes (.text-display/.text-heading/.text-body/.text-label)"
  - "@tailwindcss/typography registered via @plugin, ready for Phase 2's prose blocks"
affects: [01-03, 01-04, phase-2]

# Tech tracking
tech-stack:
  added: ["@tailwindcss/typography@0.5.20"]
  patterns:
    - "Font loaders live at app/fonts/{humane,newsreader}.ts, each exporting a next/font object with a `variable` CSS custom property; nothing imports them yet — Plan 03's app/layout.tsx is the first consumer"
    - "Tailwind v4 @theme block only holds tokens (--font-*, --color-*, --spacing-*); the clamp() type-scale rules and other typographic CSS live as plain classes below @theme, per D-04's split"
    - "Weight budget is locked at exactly 2 values system-wide: Humane 800 (Display/Heading), Newsreader 400 (Body/Label) — enforced by grep in this plan's acceptance criteria"

key-files:
  created:
    - app/fonts/humane.ts
    - app/fonts/newsreader.ts
  modified:
    - app/globals.css
    - package.json
    - package-lock.json

key-decisions:
  - "git mv was not usable for the Humane asset move — text_trail_demo/ was never committed to git (confirmed via `git ls-files`/`git log -- text_trail_demo`), so the source path was untracked. Used a plain filesystem mv instead; the licence-driven no-modify/no-subset constraint (D-01) is unaffected since the binary itself was never altered."
  - "@tailwindcss/typography installed at the exact audited version 0.5.20 (package-lock.json confirms the resolved/pinned version), per the threat model's T-01-04 mitigation — no substitution."

patterns-established:
  - "Font-loader module pattern: one file per typeface under app/fonts/, each a next/font call exporting a single named object with a `variable` string — later consumers apply `.variable` to a shared ancestor className, never a per-component import of the raw font object."

requirements-completed: [BUILD-06, HOME-05]

# Metrics
duration: 4min
completed: 2026-08-29
---

# Phase 1 Plan 2: Typography Mechanism Summary

**Self-hosted Humane (next/font/local, display:optional) and Newsreader (next/font/google, display:swap) font loaders, wired into a Tailwind v4 `@theme` token block plus four locked `clamp()`-based type-scale classes in `app/globals.css`.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-29T22:23:57+02:00 (immediately after 01-01's completion commit)
- **Completed:** 2026-08-29T22:27:33+02:00
- **Tasks:** 2
- **Files modified:** 6 (2 created, 3 modified, 1 moved)

## Accomplishments

- Moved `Humane-VF.ttf` from `text_trail_demo/assets/` to `app/fonts/` without modifying the binary (D-01's no-subsetting licence constraint intact)
- Installed `@tailwindcss/typography@0.5.20` (exact audited version, confirmed pinned in `package-lock.json`) — `tailwindcss@4.3.3`/`@tailwindcss/postcss@4.3.3` were already present from Plan 01, not reinstalled
- Created `app/fonts/humane.ts` (`next/font/local`, `weight: '100 900'`, `display: 'optional'`, `variable: '--font-humane'`) and `app/fonts/newsreader.ts` (`next/font/google` `Newsreader`, `display: 'swap'`, `variable: '--font-newsreader'`) — both verified against Context7's current `/vercel/next.js` docs (weight-range string syntax, `variable` CSS-custom-property option)
- Rewrote `app/globals.css`: `@plugin "@tailwindcss/typography";` registered beneath `@import "tailwindcss";`; a `@theme` block defining `--font-display`/`--font-body` (wired to the two `next/font` CSS variables), the locked palette (`--color-paper`/`--color-ink`/`--color-accent`), and the seven `--spacing-*` tokens; four plain-CSS type-scale classes (`.text-display`, `.text-heading`, `.text-body`, `.text-label`) matching the Interfaces contract's exact `clamp()` curves, weights, and letter-spacing caps
- Confirmed via Context7 (`/tailwindlabs/tailwindcss.com`) that `@theme` accepts custom `--font-*`/`--color-*`/`--spacing-*` namespaces and that `@plugin "@tailwindcss/typography";` is the current v4-correct registration syntax
- `npm run build` exits 0 after both tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Install the typography plugin, move the Humane asset, create both font loaders** - `cd8046c` (feat)
2. **Task 2: Build the design-token stylesheet** - `5222de1` (feat)

**Plan metadata:** (recorded below, this commit)

## Files Created/Modified

- `app/fonts/humane.ts` - `next/font/local` loader for Humane, full 100–900 variable axis, `display: optional`
- `app/fonts/newsreader.ts` - `next/font/google` loader for Newsreader, `display: swap`
- `app/fonts/Humane-VF.ttf` - the licensed display-face binary, moved (not copied/modified) from `text_trail_demo/assets/`
- `app/globals.css` - full rewrite: `@theme` design tokens + four `clamp()`-based type-scale classes + `body` background/color wiring
- `package.json` / `package-lock.json` - added `@tailwindcss/typography@0.5.20`

## Decisions Made

- Used a plain `mv` instead of `git mv` for the Humane asset (see Deviations below) — no impact on the licence constraint since the file content is untouched.
- Kept `@theme` limited to tokens only (font-family/color/spacing custom properties); all `clamp()` type-scale rules, weight values, and letter-spacing live as plain CSS classes beneath `@theme`, per D-04's explicit split between Tailwind-native tokens and hand-authored typographic CSS.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `git mv` failed — `text_trail_demo/` was never tracked by git**
- **Found during:** Task 1 (moving the Humane font asset)
- **Issue:** The plan's literal action was `git mv text_trail_demo/assets/Humane-VF.ttf app/fonts/Humane-VF.ttf`. Running it returned `fatal: not under version control, source=text_trail_demo/assets/Humane-VF.ttf` — confirmed via `git ls-files text_trail_demo/` (empty) and `git log --oneline --all -- text_trail_demo` (no history) that the entire `text_trail_demo/` directory, including the font asset, had never been committed to git; it only ever existed as an untracked working-tree directory.
- **Fix:** Used a plain filesystem `mv` (`mkdir -p app/fonts && mv text_trail_demo/assets/Humane-VF.ttf app/fonts/Humane-VF.ttf`) instead, then `git add`'d the file at its new path in the Task 1 commit. Same outcome the plan's acceptance criteria actually check (file exists at the new path, absent from the old path, binary untouched) — the git-mechanics detail (`git mv` vs `git add` of a moved file) doesn't change D-01's licence constraint, since no tool that modifies/subsets the binary was ever invoked.
- **Files modified:** `app/fonts/Humane-VF.ttf` (new path), `text_trail_demo/assets/` (now empty)
- **Verification:** `test -f app/fonts/Humane-VF.ttf` succeeds; `test -f text_trail_demo/assets/Humane-VF.ttf` fails; file size unchanged (85000 bytes, matching the original per `01-CONTEXT.md`'s "85 KB" figure).
- **Committed in:** `cd8046c` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking/tooling mechanics)
**Impact on plan:** No scope change — the plan's actual intent (relocate the asset, don't duplicate or modify it) was achieved exactly; only the specific git command differed from the plan's literal text because its precondition (source file tracked by git) didn't hold.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `app/fonts/humane.ts` and `app/fonts/newsreader.ts` are ready for Plan 03's `app/layout.tsx` to import and apply as `.variable` classNames on `<html>`/`<body>`.
- `app/globals.css`'s four type-scale classes (`.text-display`, `.text-heading`, `.text-body`, `.text-label`) are ready for Plan 03's `app/page.tsx` (holding page) and `app/type/page.tsx` (specimen route) to consume verbatim.
- `@tailwindcss/typography` is registered and available for Phase 2's `prose` classes on migrated posts — nothing in this phase renders a `prose` block yet, which is expected.
- No route currently imports these font loaders or CSS classes — by design, this plan produces the mechanism only. `npm run build` succeeding confirms the code compiles and type-checks, but the typographic system is not yet visible to a visitor; that's Plan 03's job.
- The ornamental horizontal-rule background and any second Humane/Newsreader weight remain explicitly out of scope per UI-SPEC — not started, not needed by this plan's success criteria.

---
*Phase: 01-deploy-foundation-design-system*
*Completed: 2026-08-29*

## Self-Check: PASSED

All claimed files found (`app/fonts/humane.ts`, `app/fonts/newsreader.ts`, `app/fonts/Humane-VF.ttf`, `app/globals.css`) and all claimed commits (`cd8046c`, `5222de1`) verified present in `git log --oneline --all`.
