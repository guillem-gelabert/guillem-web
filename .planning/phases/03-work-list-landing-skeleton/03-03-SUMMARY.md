---
phase: 03-work-list-landing-skeleton
plan: 03
subsystem: ui
tags: [next.js, react-server-components, tailwind, accessibility, i18n]

# Dependency graph
requires:
  - phase: 03-work-list-landing-skeleton
    provides: "03-01: lib/work.ts (WorkEntry, WORK, CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER), SmearTitle widened to h3, lib/locales.ts homeLink; 03-02: app/globals.css .section-head/.link/.link-quiet, tests/unit/css-source.ts, tests/unit/link-contract.test.ts"
provides:
  - "app/(en)/page.tsx: the real landing view — async Server Component, no client directive, exports metadata with a canonical"
  - "components/landing/contents-nav.tsx, section-stub.tsx, work-list.tsx, featured-slot.tsx: the four Server Components the landing composes"
  - "tests/unit/link-contract.test.ts test (i): the amendment-A1 source-fact gate (no \"use client\", no useSmearHeading, metadata export, canonical, no robots override)"
affects: [03-06, 03-07, 03-08, 03-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "De-clienting a page while keeping its scroll trail: move \"use client\" from the page module down to SmearTitle, the sanctioned client leaf (already proven on app/(en)/writing/[slug]/page.tsx, now applied to /)"
    - "Derived-not-flagged slot state: findBySlug(await publishedFor(locale), SLUG) resolves to PostEntry | null; the component branches on the value, never on a boolean"
    - "Acceptance-criteria string bans apply to comments too — a source-fact check for the literal absence of a string (e.g. no `robots`, no `target=`) fails on an explanatory code comment that names the very thing it explains not to do; comments must describe the constraint without repeating the banned literal"

key-files:
  created:
    - components/landing/contents-nav.tsx
    - components/landing/section-stub.tsx
    - components/landing/work-list.tsx
    - components/landing/featured-slot.tsx
  modified:
    - app/(en)/page.tsx
    - tests/unit/link-contract.test.ts

key-decisions:
  - "Comments explaining a banned pattern (smooth scrolling, target=\"_blank\", min-h-screen/justify-center, metadataBase, robots) are worded to avoid the literal banned string, since the plan's own automated verify script bans that string anywhere in the file, comments included — not just in executable code"
  - "The 5th `\"use client\"` hit in app/ and components/ (components/smear-heading/use-prefers-reduced-motion.ts) is pre-existing from Phase 1 (commit 9b98e08) and untouched by this plan; the plan's own <verification> block names only 4 files, a documentation gap in the plan text rather than a regression introduced here"

patterns-established:
  - "landing/ subdirectory under components/ for page-composition Server Components that have no reuse outside app/(en)/page.tsx"

requirements-completed: [WORK-01, WORK-02, HOME-01, HOME-03, HOME-04]

# Metrics
duration: 11min
completed: 2026-08-31
---

# Phase 3 Plan 3: Work List, Landing Composition & the A1 De-Clienting Summary

**`app/(en)/page.tsx` replaced wholesale — a `"use client"` holding page becomes an `async` Server Component exporting real route metadata (title, description sourced from `POSITIONING_PLACEHOLDER`, `alternates.canonical: "/"`), composing four new Server Components (`ContentsNav`, `FeaturedSlot`, `WorkList`, `SectionStub`) into the five-section landing the UI-SPEC specifies.**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-08-31T13:36:59+02:00 (worktree base reset)
- **Completed:** 2026-08-31T13:48:13+02:00
- **Tasks:** 3/3
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments
- `components/landing/contents-nav.tsx`: `<nav aria-label="Sections">` with the five HOME-03 destinations (`#work`, `indexPath("en")`, `#backlog`, `/cv`, `#contact`) as `.link-quiet` links, `inline-block py-xs` clearing the WCAG 2.5.8 24px target-size floor, no separator glyph, no sixth `#case-study` link
- `components/landing/section-stub.tsx`: the D-02 backlog/contact placeholder shape, reproducing the shipped `/writing` empty state exactly
- `components/landing/work-list.tsx`: `<ol role="list">` over `lib/work.ts`'s `WORK` tuple, `--color-rule` hairline between rows (Pitfall 1 / WR-06 safe — `border-rule` always paired with `border-t`), `aria-hidden` ordinals, same-tab outbound `<a>` marked by its host label, no card treatment, no `target`/`rel`
- `components/landing/featured-slot.tsx`: the two-state CASE-03 slot derived from `PostEntry | null` — interim copy (not a link) today, the published headline/standfirst/`PostMeta` shape Phase 4 fills in, both branches a trail-carrying `SmearTitle as="h3"`
- `app/(en)/page.tsx`: de-cliented per Amendment A1 — `async function Landing()` resolves `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)` and renders header (nameplate + positioning sentence + `ContentsNav`) then four `scroll-mt-xl` sections in order: Case study, Work, Backlog, Contact. Heading outline: one `<h1>`, four `<h2>` section heads, `<h3>`s only inside `FeaturedSlot`/`WorkList`
- `tests/unit/link-contract.test.ts` gains test (i): reads `app/(en)/page.tsx` from disk and asserts no `"use client"`, no `useSmearHeading` import, a `metadata` export, a `canonical`, and no robots override — the source-fact gate a Playwright assertion cannot replace (measured in `03-RESEARCH.md` C-2: `/` already inherits a title/description, so "a title appears" proves nothing)

## Task Commits

Each task was committed atomically:

1. **Task 1: Build ContentsNav and SectionStub** - `9506807` (feat)
2. **Task 2: Build WorkList and FeaturedSlot** - `ab594d3` (feat)
3. **Task 3: De-client app/(en)/page.tsx and add the A1 source-fact test** - `59336c0` (feat)

_No plan-metadata commit for STATE.md/ROADMAP.md — the orchestrator owns those after the wave. This SUMMARY.md is committed separately, immediately after this note._

## Files Created/Modified
- `components/landing/contents-nav.tsx` - `ContentsNav()`, the five-link HOME-03 navigation
- `components/landing/section-stub.tsx` - `SectionStub({ state, body })`, backlog/contact placeholder shape
- `components/landing/work-list.tsx` - `WorkList()`, the `<ol role="list">` over `lib/work.ts`
- `components/landing/featured-slot.tsx` - `FeaturedSlot({ entry })`, the two-state CASE-03 slot
- `app/(en)/page.tsx` - replaced wholesale: async Server Component, `metadata` export, composes all four landing components
- `tests/unit/link-contract.test.ts` - appended test (i), the amendment-A1 source-fact gate

## Decisions Made
- Followed the plan's exact component contracts, class strings and copy verbatim (byte-exact interim featured-slot strings, exact section IDs/`aria-labelledby` pairs, exact nav order)
- Reworded four explanatory comments (anchor-navigation motion, outbound-link hardening, viewport sizing, metadata inheritance) to avoid literally containing the strings the plan's own automated verify scripts and acceptance criteria ban (`scroll-behavior`/`smooth`, `target=`, `min-h-screen`/`justify-center`, `metadataBase`, `robots`) — the plan's `<read_first>` prose asked for comments naming these concepts, but the plan's own `<verify>`/acceptance-criteria scripts check for the literal string's absence in the whole file, comments included. Resolved by describing the same constraint without repeating the banned substring; no loss of the "comment the failure, not the code" intent

## Deviations from Plan

None substantive — plan executed as specified. The comment rewording above is a wording adjustment to satisfy the plan's own literal-string verification, not a change to any behavior, markup, class, copy or structure the plan specified.

## Issues Encountered

**Transient dev-server cold-start failure under the full Playwright suite.** The first `npx playwright test` run (no flags) produced 30 failures, all `net::ERR_CONNECTION_REFUSED` against `localhost:3000`, spanning routes and specs entirely unrelated to this plan's changes (`prose-typography.spec.ts`, `writing-index.spec.ts`, `smear-heading.spec.ts`, etc.). Diagnosed by starting `npm run dev` directly and probing `/`, `/writing/fixture`, `/writing`, `/nope`, `/type` with `curl` — all returned correct status codes with no compile errors. Re-running the full suite against the now-warm dev server passed all 63 tests. This points to Playwright's own `webServer` cold-boot (first-compile-under-5-parallel-workers) timing out or the server not yet being ready when the first test group fired, not a defect in `app/(en)/page.tsx` or the new components. `npm run test:all` (the CLAUDE.md-mandated pre-commit gate, which builds fresh — no dev-server cold-start race — before running Playwright) passed cleanly end to end on a single invocation, confirming this.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `app/(en)/page.tsx` is a Server Component, `/` still prerenders static (`next build` output: `○ /`), and all four landing components are shipped and gated by `npx tsc --noEmit`, `npm run test:unit` (47/47), `npm run lint` (0 new errors), and the full `npx playwright test` suite (63/63)
- `components/smear-heading/` is untouched (`git diff --stat HEAD -- components/smear-heading/` empty) — no viewport guard was added, matching `03-RESEARCH.md` C-3's measurement that it is unnecessary at two registered headings
- `git grep -n 'Developer\.' -- ':!.planning'` returns exactly two hits: `app/(en)/layout.tsx:12` and `lib/work.ts:55` — the old `app/(en)/page.tsx:13` hit is gone (Pitfall 6 closed)

**Carried forward, per the UI-SPEC's phase-completion checklist (all four items still apply after this plan):**
1. **`HOME-01` remains outstanding.** `/` now renders `POSITIONING_PLACEHOLDER` ("Developer.") as both the `<p className="text-standfirst">` and the `metadata.description` — one source, but still the placeholder, not the user's real sentence. Must be re-asserted at the top of every subsequent phase's state until the user supplies the sentence, and must not reach Phase 6's `FIND-02` flag flip.
2. **The two `WORK-02` annotations (`lib/work.ts`, shipped in 03-01) are drafts awaiting the user's edit (D-09).** They satisfy the requirement as written but are not final copy.
3. **The featured slot is in its interim state** (`findBySlug` resolves to `null` — `content/` has no non-draft `en` entries yet). Covered by the same launch gate as the backlog and contact stubs (both shipped in this plan via `SectionStub`) and `/cv` (Plan 03-04's job, not yet built).
4. **`SmearTitle`'s `as` union was widened to `"h3"` in Plan 03-01** and the featured headline renders as an `<h3>` in both branches of `FeaturedSlot`, confirmed by this plan's node source-fact check.

No blockers for Plans 03-04/03-05 (parallel siblings — `/cv`, `/type`, the writing/texte indexes — none of which this plan touched) or for Plans 03-06 through 03-09 (verification/spec/audit plans that consume this plan's landing view).

## Self-Check: PASSED

- FOUND: components/landing/contents-nav.tsx
- FOUND: components/landing/section-stub.tsx
- FOUND: components/landing/work-list.tsx
- FOUND: components/landing/featured-slot.tsx
- FOUND: app/(en)/page.tsx (modified)
- FOUND: tests/unit/link-contract.test.ts (modified)
- FOUND commit: 9506807
- FOUND commit: ab594d3
- FOUND commit: 59336c0

---
*Phase: 03-work-list-landing-skeleton*
*Completed: 2026-08-31*
