---
phase: 01-deploy-foundation-design-system
plan: 03
subsystem: ui
tags: [nextjs, next-font, tailwindv4, playwright, cls, clamp, typography]

# Dependency graph
requires:
  - phase: 01-02
    provides: "app/fonts/humane.ts, app/fonts/newsreader.ts font loaders; app/globals.css's four type-scale classes (.text-display/.text-heading/.text-body/.text-label)"
provides:
  - "app/layout.tsx — font variables wired document-wide, robots: { index: false } (D-07)"
  - "app/page.tsx — the '/' holding page (D-05/D-06): Display <h1>Guillem Gelabert</h1> + one Body paragraph"
  - "app/type/page.tsx — the non-indexed '/type' specimen route demonstrating all four type roles (D-05), the reference artifact later phases check new components against"
  - "tests/font-cls.spec.ts — automated CLS assertion (BUILD-06) via a real PerformanceObserver"
  - "tests/viewport.spec.ts — automated clamp()-bounds + responsiveness assertion at 375px/1440px (BUILD-03)"
  - "tests/type-specimen.spec.ts — automated presence/visibility assertion for all four type roles (HOME-05)"
affects: [01-04, phase-2, phase-3]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "robots: { index: false } is set exactly once, in the root layout's metadata — child routes under this phase must never export their own metadata object without explicitly re-declaring { index: false } (Pitfall 7's non-merge behavior)"
    - "Playwright viewport specs compute expected clamp() values in JS from the same rem/vw formula as the CSS, rather than hardcoding pixel targets — keeps the test honest against the real formula instead of an assumption"

key-files:
  created:
    - app/type/page.tsx
    - tests/font-cls.spec.ts
    - tests/viewport.spec.ts
    - tests/type-specimen.spec.ts
  modified:
    - app/layout.tsx
    - app/page.tsx

key-decisions:
  - "viewport.spec.ts asserts the Display role's 1440px font-size against the real clamp() formula (139.2px) rather than the plan's '≈180px near-ceiling' assumption — empirically verified the Display curve doesn't saturate to its 180px ceiling until ~1950px viewport width; the Heading role's curve does saturate to 72px by 1440px as the plan assumed. See Deviations."

patterns-established:
  - "Type-scale Playwright specs read getComputedStyle(...).fontSize directly rather than asserting on markup presence alone — ties the test to observable rendered behavior per the phase's Nyquist validation requirement."

requirements-completed: [HOME-05, BUILD-03, BUILD-06]

# Metrics
duration: 4min
completed: 2026-08-29
---

# Phase 1 Plan 3: Routes & Typography Rendering Summary

**Wired next/font variables + robots noindex into the root layout, and shipped the two routes this phase's success criteria are checked against: `/` (name-only holding page) and `/type` (non-indexed type specimen) — both proven via Playwright specs asserting near-zero CLS and viewport-responsive `clamp()` sizing, not just markup presence.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-29T20:34:21Z
- **Completed:** 2026-08-29T20:38:00Z
- **Tasks:** 2
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments

- `app/layout.tsx` now imports `humane`/`newsreader`, applies both `.variable` custom properties on `<html>`, imports `globals.css`, and exports the phase's one `robots: { index: false }` declaration (D-07) — the only place `robots` is set this phase, per Pitfall 7's non-merge behavior
- `tests/font-cls.spec.ts` measures real cumulative layout shift via a `PerformanceObserver` injected before navigation, settled on `document.fonts.ready` + one `requestAnimationFrame` — passes at effectively 0 CLS (BUILD-06)
- `app/page.tsx` renders the D-05/D-06 holding page exactly: one Display-scale `<h1>Guillem Gelabert</h1>`, one Body paragraph "Developer.", zero nav/links/CTA
- `app/type/page.tsx` renders all four declared type roles (Display, Heading, Body, Label) as the reference specimen (D-05); exports no `metadata` of its own, correctly inheriting root's noindex
- `tests/viewport.spec.ts` and `tests/type-specimen.spec.ts` both pass at 375px and 1440px, confirming the type scale is genuinely viewport-responsive (not markup-only)
- Full Playwright suite (6 specs) and `npm run build` both green after both tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire the root layout — fonts, robots noindex, globals import** - `c6128c2` (feat)
2. **Task 2: Build the holding page and the /type specimen route; add viewport + specimen tests** - `360746a` (feat)

**Plan metadata:** (recorded below, this commit)

## Files Created/Modified

- `app/layout.tsx` - imports humane/newsreader, applies `.variable` classes on `<html>`, imports `globals.css`, exports `metadata` with `robots: { index: false }`
- `app/page.tsx` - the `/` holding page: `<h1 className="text-display">Guillem Gelabert</h1>` + `<p className="text-body">Developer.</p>`, wrapped in a centering `<main>` with no other content
- `app/type/page.tsx` - the `/type` specimen: labeled Display/Heading/Body sections using `.text-label` captions, one `.text-display` `<h1>`, one `.text-heading` `<h2>`, a two-paragraph `.text-body` prose block; no `metadata` export
- `tests/font-cls.spec.ts` - `PerformanceObserver`-based CLS assertion (< 0.1) on `/`
- `tests/viewport.spec.ts` - clamp()-bounds + cross-viewport growth assertions on `/type`
- `tests/type-specimen.spec.ts` - presence/visibility + `text-transform: uppercase` assertion on `/type`

## Decisions Made

- Kept `app/layout.tsx`'s `<html>`/`<body>` markup minimal (no extra utility classes beyond the two font `.variable`s) — the plan only specified wiring the variables and metadata; no visual requirement called for additional classes at this stage.
- `app/page.tsx` and `app/type/page.tsx` use the locked spacing tokens (`gap-md`, `gap-sm`, `gap-2xl`, `px-lg`, `py-3xl`) from Plan 02's `@theme` block for layout spacing — confirmed these resolve to real Tailwind utilities generated from the `--spacing-*` theme keys.
- `/type`'s prose copy is intentionally placeholder editorial-register text (per D-05/UI-SPEC's explicit allowance: "placeholder editorial-register text is acceptable here since this route is a reference artifact, not audience-facing copy") — see Known Stubs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `viewport.spec.ts`'s literal "near-ceiling at 1440px" assumption for the Display role does not match the actual clamp() formula**
- **Found during:** Task 2 (writing `tests/viewport.spec.ts`)
- **Issue:** The plan's task text specified asserting the Display role's font-size is "near its clamp() ceiling" (≈180px, ±4px) at a 1440px viewport. Directly measuring the real rendered value with a headless Chromium page against the actual CSS (`clamp(3.5rem, 1.5rem + 8vw, 11.25rem)` in `app/globals.css`, built by Plan 02 and locked as an interface for this plan to consume verbatim) showed 139.2px at 1440px, not ≈180px. Solving the formula, the Display curve doesn't reach its 180px ceiling until ~1950px viewport width (`1.5rem + 8vw = 11.25rem` → `24 + 0.08W = 180` → `W ≈ 1950`). The Heading role's curve (`clamp(2rem, 1rem + 4vw, 4.5rem)`) *does* saturate to 72px by 1440px exactly as the plan assumed — only the Display assertion was wrong.
- **Fix:** Rewrote the 1440px assertions to compute the expected pixel value from the real clamp() formula (min/preferred/max in JS, mirroring the CSS) rather than a hardcoded "≈180px" target, and added a third test explicitly asserting both Display and Heading font-sizes grow from 375px to 1440px — directly proving the scale "actually responds to viewport width rather than rendering a fixed size" (the plan's own stated intent for this test), without depending on the incorrect ceiling assumption. Did not modify `app/globals.css` — its clamp() curves are a locked interface from Plan 02, and 139.2px at 1440px is still correct, in-bounds, fluid behavior (above the 375px floor, below the 180px ceiling), just not maximized at this particular breakpoint.
- **Files modified:** `tests/viewport.spec.ts`
- **Verification:** `npx playwright test tests/viewport.spec.ts --project=chromium` passes at both 375px and 1440px; full suite (6 specs) green; `npm run build` exits 0.
- **Committed in:** `360746a` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — test assumption corrected against empirically measured behavior)
**Impact on plan:** No production-code change and no scope creep. The correction only affects the test's own expected values; the underlying `clamp()` CSS (Plan 02's locked interface) was left untouched. Flagged below as a design note worth revisiting, not a blocker.

## Issues Encountered

None beyond the deviation documented above.

## Known Stubs

- **`app/type/page.tsx` prose copy** (2 paragraphs under the "Body" section) is placeholder editorial-register text, not final audience-facing copy. This is intentional and pre-authorized by D-05/UI-SPEC.md ("placeholder editorial-register copy is acceptable here — this route is a reference artifact... not audience-facing copy"). Does not block this plan's goal (`/type` exists to demonstrate type roles, not to carry real prose) and is not tracked as a future-plan action item — no later phase is scoped to rewrite it, since the route's job is structural reference, not content.

## Design Note (non-blocking)

- The Display role's `clamp()` curve doesn't reach its declared 180px ceiling until ~1950px viewport width — on a common 1440px laptop screen it renders 139.2px. This is correct, in-bounds, fluid behavior (confirmed via `tests/viewport.spec.ts`'s growth assertion) and not a defect, but if a future design pass wants the poster-scale Display type to feel closer to its maximum on typical desktop widths, the `.text-display` preferred-value slope (`1.5rem + 8vw`) in `app/globals.css` would need a steeper coefficient. Not acted on here: `app/globals.css` is Plan 02's locked interface, and no success criterion in this plan required hitting the ceiling at 1440px specifically — only that the scale render "correctly" and respond to viewport width, both of which hold.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/` and `/type` are both live under `next dev` and `next build`, and are the two routes Plan 04 (the heading trail port) will attach its scroll-driven `text-shadow` effect to — per the Interfaces contract, the `<h1 className="text-display">Guillem Gelabert</h1>` on `/` and the `.text-display`/`.text-heading` elements on `/type` were built as plain top-level elements with no wrapping intermediate node, so Plan 04 can attach refs directly without any measurement surprises.
- `robots: { index: false }` is set once, at the root — Plan 04 must not add its own `metadata` export to any new route without explicitly re-declaring `{ index: false }` (Pitfall 7, still standing).
- Full Playwright suite is 6 specs, all green: `deploy-smoke`, `font-cls`, `viewport` (×3), `type-specimen`. `smear-heading.spec.ts` and `reduced-motion.spec.ts` remain for Plan 04 to add, per `01-VALIDATION.md`'s Wave 0 Requirements.
- The Design Note above (Display role not reaching ceiling until ~1950px) is not a blocker for Plan 04 or later phases — flagged for optional future reconsideration only.

---
*Phase: 01-deploy-foundation-design-system*
*Completed: 2026-08-29*

## Self-Check: PASSED

All claimed files found (`app/layout.tsx`, `app/page.tsx`, `app/type/page.tsx`, `tests/font-cls.spec.ts`, `tests/viewport.spec.ts`, `tests/type-specimen.spec.ts`, `01-03-SUMMARY.md`) and all claimed commits (`c6128c2`, `360746a`) verified present in `git log --oneline --all`.
