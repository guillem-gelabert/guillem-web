---
phase: 02-content-pipeline
plan: 01
subsystem: infra
tags: [next.js, mdx, shiki, turbopack, next-font, playwright, route-groups]

# Dependency graph
requires:
  - phase: 01-deploy-foundation-design-system
    provides: Phase 1's shipped `/` and `/type` routes, Humane/Newsreader fonts, SmearHeadingProvider, Playwright suite
provides:
  - Ten build-time MDX/Shiki packages installed and wired into next.config.ts
  - One remark/rehype plugin chain (Turbopack-safe, string-only options) serving both .md and .mdx
  - mdx-components.tsx at project root with the Shiki pre override (role/aria-label, background stripped)
  - IBM Plex Mono 400 font loader (--font-ibm-plex-mono)
  - Newsreader extended with the italic style
  - app/(en)/ route group holding Phase 1's root layout, home page, and /type page
  - Playwright scoped to *.spec.ts via testMatch, "test" and "test:unit" npm scripts
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07]

# Tech tracking
tech-stack:
  added: ["@next/mdx@16.3.3", "@mdx-js/loader@3.1.1", "@mdx-js/react@3.1.1", "@types/mdx@2.0.14", "remark-gfm@4.0.1", "remark-frontmatter@5.0.0", "remark-mdx-frontmatter@5.2.0", "rehype-slug@6.0.0", "shiki@4.4.3", "@shikijs/rehype@4.4.3"]
  patterns:
    - "String-only remark/rehype plugin declarations in next.config.ts (Turbopack cannot receive function-valued options)"
    - "Two root layouts via route groups instead of app/[lang]/ — per-route <html lang> without a URL prefix"
    - "mdx-components.tsx at repo root as the escape hatch for anything Turbopack's serializable-options constraint can't express in next.config.ts"

key-files:
  created:
    - app/fonts/ibm-plex-mono.ts
    - mdx-components.tsx
    - "app/(en)/layout.tsx"
    - "app/(en)/page.tsx"
    - "app/(en)/type/page.tsx"
  modified:
    - package.json
    - package-lock.json
    - playwright.config.ts
    - tsconfig.json
    - .gitignore
    - app/fonts/newsreader.ts
    - next.config.ts
    - next-env.d.ts

key-decisions:
  - "Shiki theme set to github-light-high-contrast (not github-light) per UI-SPEC Revision 2 — the only GitHub-family theme clearing 4.5:1 against the #F5F5F5 code surface"
  - "LayoutProps<\"/\"> replaced with an explicit { children: React.ReactNode } in app/(en)/layout.tsx — two root layouts both nominally at / break the generated route type otherwise"
  - "metadataBase set to the Railway generated URL as a literal (not an env var) — Phase 6 domain cutover edits this one line deliberately"

patterns-established:
  - "Pattern 1 (RESEARCH): two root layouts via route groups"
  - "Pattern 4 (RESEARCH): one next.config.ts, one Turbopack-safe plugin chain"
  - "Pattern 9 (RESEARCH): Shiki pre override in mdx-components.tsx"

requirements-completed: [WRIT-01, I18N-01]

duration: 9min
completed: 2026-08-30
---

# Phase 2 Plan 1: MDX Toolchain, Third Type Face, and (en) Route Group Summary

**Installed the @next/mdx + Shiki build toolchain with a single Turbopack-safe plugin chain, added IBM Plex Mono and the Newsreader italic, and split Phase 1's single root layout into an `app/(en)/` route group with zero regressions in the shipped routes.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-08-30T01:07:00+02:00 (approx.)
- **Completed:** 2026-08-30T01:15:00+02:00 (approx.)
- **Tasks:** 3 completed
- **Files modified:** 13

## Accomplishments
- Ten build-time packages (`@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, `remark-gfm`, `remark-frontmatter`, `remark-mdx-frontmatter`, `rehype-slug`, `shiki`, `@shikijs/rehype`) installed at their researched/verified versions with 0 npm audit vulnerabilities
- `next.config.ts` wired with one Turbopack-safe remark/rehype plugin chain serving both `.md` and `.mdx` through `@next/mdx`'s `extension` option, Shiki at `github-light-high-contrast`
- `mdx-components.tsx` created at the project root with the `pre` override (strips Shiki's inline background, adds `role="region"` + `aria-label="Code sample"`)
- IBM Plex Mono 400 loaded (`app/fonts/ibm-plex-mono.ts`, `--font-ibm-plex-mono`); Newsreader extended with `style: ['normal', 'italic']`
- Phase 1's routes moved via `git mv` into `app/(en)/` (`layout.tsx`, `page.tsx`, `type/page.tsx`); `app/layout.tsx` and `app/page.tsx` no longer exist
- `app/(en)/layout.tsx` carries `metadataBase`, retained `robots: { index: false }`, the third font variable, and an explicit `{ children: React.ReactNode }` type replacing `LayoutProps<"/">`
- Clean-cache build (`rm -rf .next && npm run build`) succeeds with `/` and `/type` both static; `npx tsc --noEmit` clean; all nine Phase 1 Playwright specs pass unchanged
- Prerendered `/` HTML confirmed to carry `<html lang="en"` and a `noindex` robots meta

## Task Commits

Each task was committed atomically:

1. **Task 1: Install the MDX toolchain and wire the test scripts** - `181b391` (feat)
2. **Task 2: Add the mono face, the Newsreader italic, and the one MDX plugin chain** - `f59bdfc` (feat)
3. **Task 3: Move Phase 1's routes into an (en) route group** - `7fd4145` (feat)

**Plan metadata:** (pending — final docs commit follows this summary)

## Files Created/Modified
- `package.json` / `package-lock.json` - ten new build-time dependencies; `test` and `test:unit` scripts added
- `playwright.config.ts` - `testMatch: "**/*.spec.ts"` added so future `node --test` unit files aren't swept into the Playwright run
- `tsconfig.json` - `allowImportingTsExtensions: true` added for future `.ts`-suffixed ESM imports in unit tests
- `.gitignore` - `*.tsbuildinfo` added (generated by the pre-existing `incremental: true` tsconfig flag)
- `app/fonts/ibm-plex-mono.ts` - IBM Plex Mono 400-only loader, single-quote/no-semicolon style matching its `app/fonts/` siblings
- `app/fonts/newsreader.ts` - added `style: ['normal', 'italic']`
- `next.config.ts` - `@next/mdx` wired with `pageExtensions` and the string-only plugin chain
- `mdx-components.tsx` (new, project root) - `useMDXComponents` with the Shiki `pre` override
- `app/(en)/layout.tsx` (moved from `app/layout.tsx`) - relative imports adjusted, `LayoutProps<"/">` replaced, `metadataBase` added, third font variable added
- `app/(en)/page.tsx`, `app/(en)/type/page.tsx` (moved, unchanged content) - history preserved via `git mv`
- `next-env.d.ts` - regenerated by `next build`

## Decisions Made
- Followed RESEARCH's Pitfall 1 correction: locked `github-light-high-contrast` rather than the UI-SPEC's original `github-light`, per the UI-SPEC's own override clause.
- Kept `description: "Developer."` in `app/(en)/layout.tsx`'s metadata unchanged — the plan's five specified edits didn't touch it and there was no reason to.

## Deviations from Plan

None - plan executed exactly as written. All acceptance criteria in Tasks 1-3 were verified to pass, including the grep-based assertions on `next.config.ts`, `mdx-components.tsx`, `app/fonts/ibm-plex-mono.ts`, `app/fonts/newsreader.ts`, and `app/(en)/layout.tsx`.

One housekeeping note not rising to a deviation: `next-env.d.ts` toggles between `.next/types/*` (after `next build`) and `.next/dev/types/*` (after `next dev`, which Playwright's `webServer` starts). This is Next's own auto-regeneration behavior on a file explicitly marked "should not be edited" — the committed state reflects the last `next build` run, matching the plan's literal final verification command.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The MDX/Shiki toolchain, `mdx-components.tsx`, and the three-font-variable `app/(en)/layout.tsx` are ready for Plan 02 (content loader) and Plan 03 (Prose Contract CSS + MDX component map extension).
- `app/(de)/` is intentionally not created here — Plan 05 adds it alongside the German routes it serves, per the plan's own scope boundary.
- No blockers or concerns for the next plan in this phase.

## Self-Check: PASSED

All created files verified present on disk (`app/fonts/ibm-plex-mono.ts`, `mdx-components.tsx`,
`app/(en)/layout.tsx`, `app/(en)/page.tsx`, `app/(en)/type/page.tsx`, this SUMMARY.md). All four
commit hashes (`181b391`, `f59bdfc`, `7fd4145`, `52537f4`) verified present in `git log --oneline --all`.

---
*Phase: 02-content-pipeline*
*Completed: 2026-08-30*
