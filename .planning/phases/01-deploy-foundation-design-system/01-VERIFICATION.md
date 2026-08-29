---
phase: 01-deploy-foundation-design-system
verified: 2026-08-29T23:30:00Z
status: human_needed
score: 5/5 must-haves verified (automated)
overrides_applied: 0
human_verification:
  - test: "Open /type at 375px and at 1440px and read it as a whole page (not per-element computed styles)."
    expected: "The type scale reads as a deliberate, authored system — not framework-default styling. Display/Heading roles in Humane read as a poster-scale structural element; Body/Label read as newspaper-register serif text; nothing looks like an unstyled Tailwind/Next.js scaffold."
    why_human: "Automated specs (viewport.spec.ts, type-specimen.spec.ts) can only assert computed CSS values (font-size in bounds, uppercase transform present) — they cannot judge whether the composition 'reads as authored,' which is the actual wording of Success Criterion 2 and HOME-05. The project's own 01-VALIDATION.md independently flags this exact check as manual-only."
  - test: "Scroll the holding page (or /type) and watch the heading trail live; separately open text_trail_demo/index.html (shadow tab) side by side and compare the smear's lag/settle feel."
    expected: "The heading visibly lags behind scroll position with a stacked-shadow smear, and the smear's speed/settle feel matches the ported benchmark — not just 'some shadow appears and disappears' (which the automated spec already proves)."
    why_human: "tests/smear-heading.spec.ts asserts a non-'none', multi-layer computed text-shadow mid-scroll and a return to 'none' after settle — it proves the algorithm runs, not that the motion 'feels correct,' which is Success Criterion 5's own qualitative bar and is separately listed as manual-only in 01-VALIDATION.md."
---

# Phase 1: Deploy Foundation & Design System Verification Report

**Phase Goal:** The site exists as a live, deployed Next.js application with its typographic
design system and accessibility defaults in place before any content is built.
**Verified:** 2026-08-29T23:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visitor can load a live Next.js site at a stable Railway URL — not the old static prototype | ✓ VERIFIED | `curl -s -o /dev/null -w '%{http_code}' https://web-production-9cedb.up.railway.app` → `200`. Response body is real Next.js App Router markup (`__next_f` RSC payload, `/_next/static/` chunks, `<title>Guillem Gelabert</title>`), not `prototype-stack.html`. `Dockerfile`/`nginx.conf.template`/`prototype-stack.html` confirmed absent from the working tree and deleted in commit `57fb61b` (first commit of the phase, per D-08). `deploy-smoke.spec.ts` passes both locally and against the live URL. |
| 2 | Visitor sees a deliberate, authored typographic system (type scale, self-hosted fonts) correctly on mobile and desktop viewports | ✓ VERIFIED (mechanically) — see human item below | `app/fonts/humane.ts` (`next/font/local`, `Humane-VF.ttf`, byte-identical 85000 bytes, D-01 no-subsetting honoured) and `app/fonts/newsreader.ts` (`next/font/google`) both wired into `app/layout.tsx`. `app/globals.css` `.text-display`/`.text-heading` use the exact locked `clamp()` curves; weight budget verified at exactly 2 values (`800` Humane, `400` Newsreader, grep-confirmed, no other `font-weight` occurrences). `tests/viewport.spec.ts` passes at 375px and 1440px, both locally and against the live URL, asserting computed font-size against the real clamp() formula (not a hardcoded guess) and that Display/Heading genuinely grow between breakpoints. Whether the result *reads as* deliberate/authored is a human call — see Human Verification. |
| 3 | Visitor loading any page sees no layout shift as fonts load | ✓ VERIFIED | `tests/font-cls.spec.ts` installs a real `PerformanceObserver({type: 'layout-shift', buffered: true})` before navigation, settles on `document.fonts.ready` + one rAF, and asserts cumulative shift (excluding `hadRecentInput`) < 0.1. This is a measured CLS, not an assumption from `font-display` alone. Passes locally and against the live URL. `display: 'optional'` (Humane) / `display: 'swap'` (Newsreader) choices match UI-SPEC's stated rationale. |
| 4 | Visitor with `prefers-reduced-motion` set is shown no motion that ignores it, gated from the first component built | ✓ VERIFIED | `SmearHeadingProvider`'s `start()` checks `prefersReducedMotionRef.current` before the *only* `requestAnimationFrame` call site in the tree exists (grep-confirmed: exactly one rAF call site). `usePrefersReducedMotion` wraps `matchMedia` only inside `useEffect` (never at module scope/render), live-updates via a `change` listener, and a live mid-session toggle immediately clears any in-flight `textShadow` (not just gates future frames). `tests/reduced-motion.spec.ts` uses real `page.emulateMedia({reducedMotion:'reduce'})` (not the unreliable Playwright context option — a real, tested deviation documented in 01-04-SUMMARY.md), samples computed `text-shadow` across 5 scroll steps, and asserts `'none'` throughout. Passes locally and live. Checked for hydration-mismatch risk directly: server-rendered HTML for `/` and `/type` carries no inline `text-shadow`; a live `next dev` console-message capture on both routes showed zero hydration warnings/errors. |
| 5 | Visitor scrolling sees headings trail with a smear effect that settles when scrolling stops — built with stacked `text-shadow`, ported from `text_trail_demo/index.html`, not rebuilt from scratch | ✓ VERIFIED (mechanically) — see human item below | Line-by-line comparison of `components/smear-heading/smear-heading-provider.tsx` against `text_trail_demo/index.html`: `draw()` (provider) vs. `createTextShadowEffect.draw` (`:663-681`) — identical layer-count formula (`Math.min(MAX_SHADOWS, Math.max(2, Math.ceil(distance*2)))`) and shadow-string construction, only the color argument replaced with the fixed `#171714` literal (the documented, required deviation). `frame()` (provider) vs. source `frame()` (`:827-874`) — identical smoothing (`1 - Math.exp(-elapsed*0.009)`), identical `MAX_TRAIL` clamp, identical strength curve (`min(1, distance/3)`), identical 0.15px settle threshold, generalized from a single `activeEffect` to `for (const [el,state] of registry)` (the documented, required generalization for multi-heading support). `holdInput`/`releaseInput`/`finishScrolling`/`scheduleScrollStop`/pointer-event handling match the source almost verbatim (`:1005-1063`). Constants unchanged: `MAX_TRAIL=280`, `MAX_SHADOWS=240`, `SCROLL_STOP_DELAY=120` (grep-confirmed). `trailColor`/`HUE_SPEED`/`trailHue` confirmed absent (grep, count 0) — the only sanctioned deviation besides the registry generalization. `tests/smear-heading.spec.ts` proves a real multi-layer, non-`'none'` `text-shadow` mid-scroll and a return to `'none'` after settle, on both `/` and the live URL. Whether the smear *feels* like the benchmark is a human call — see Human Verification. |

**Score:** 5/5 truths mechanically verified. 2 of the 5 carry a genuinely-aesthetic sub-clause ("reads as authored," "feels correct in motion") that automated assertions cannot settle — see Human Verification below, which is why overall status is `human_needed` rather than `passed`.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | Next.js scripts, no Dockerfile dependency | ✓ VERIFIED | `"build": "next build"`, `"start": "next start"` present; no `output` override in `next.config.ts` (grep `output:` → 0 matches) |
| `Dockerfile` / `nginx.conf.template` / `prototype-stack.html` | Deleted | ✓ VERIFIED | Absent from working tree; deletion is the literal first commit of the phase (`57fb61b`) |
| `app/fonts/Humane-VF.ttf` | Byte-identical to original, unmodified (D-01) | ✓ VERIFIED | `wc -c` → `85000` bytes, matching CONTEXT.md's "85 KB" figure; no subsetting tool referenced anywhere in the plans/summaries |
| `app/fonts/humane.ts`, `app/fonts/newsreader.ts` | `next/font` loaders per Interfaces contract | ✓ VERIFIED | Both match the locked contract exactly (weight range, `display`, `variable`) |
| `app/globals.css` | `@theme` tokens + 4 `clamp()` type-scale classes | ✓ VERIFIED | All exact values present (palette, spacing, both `clamp()` curves, weight budget) |
| `app/layout.tsx` | Font variables + `robots: { index: false }` | ✓ VERIFIED | Confirmed in source and in live HTML (`<meta name="robots" content="noindex"/>` on both `/` and `/type`) |
| `app/page.tsx` | D-05/D-06 holding page: Display `<h1>` + one Body paragraph, no positioning claim | ✓ VERIFIED | Renders exactly "Guillem Gelabert" / "Developer." — matches Q4's "Name only, no claim" selection in `01-DISCUSSION-LOG.md`; no nav/links/CTA |
| `app/type/page.tsx` | Specimen route, all 4 type roles, no own `metadata` export | ✓ VERIFIED | All 4 `.text-*` classes present and visible; file contains no `metadata`/`generateMetadata` export (inherits root noindex, Pitfall 7 honoured) |
| `components/smear-heading/smear-heading-provider.tsx` | Ported driver, ≥40 lines | ✓ VERIFIED | 272 lines; single rAF call site (grep-confirmed); no `useState` for the per-frame shadow value (direct DOM write via ref) |
| `components/smear-heading/use-smear-heading.ts` | Registration hook | ✓ VERIFIED | Registers after `document.fonts.ready`, unregisters + clears `textShadow` on unmount |
| `components/smear-heading/use-prefers-reduced-motion.ts` | Live-toggling gate | ✓ VERIFIED | `matchMedia` only inside `useEffect`, `change` listener wired |
| `tests/*.spec.ts` (6 files, 8 tests) | Automated proof for every criterion | ✓ VERIFIED | All 8 tests pass locally (`npx playwright test --project=chromium`) and against the live Railway URL (`PLAYWRIGHT_BASE_URL=... npx playwright test --project=chromium`) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `app/page.tsx <h1>` | `app/globals.css .text-display` | `className="text-display"` | ✓ WIRED | Confirmed in source and rendered HTML |
| `app/layout.tsx <html>` | `app/fonts/humane.ts` / `newsreader.ts` | `humane.variable newsreader.variable` on `<html>` | ✓ WIRED | Live HTML `<html>` class attribute contains both generated variable class names |
| `app/globals.css --font-display` | `app/fonts/humane.ts --font-humane` | `var(--font-humane)` | ✓ WIRED | `@theme` block references the exact CSS custom property |
| `app/page.tsx <h1>` / `app/type/page.tsx` headings | `use-smear-heading.ts` | `ref={headingRef}` from `useSmearHeading()` | ✓ WIRED | Confirmed in source for `/` (1 ref) and `/type` (2 refs: Display + Heading; Body/Label deliberately unwired per UI-SPEC's standing rule) |
| `smear-heading-provider.tsx start()` | `use-prefers-reduced-motion.ts` | early-return checked before any `requestAnimationFrame` | ✓ WIRED | `start()`'s first statement checks `prefersReducedMotionRef.current`; confirmed via `reduced-motion.spec.ts` passing under real emulation |
| `app/layout.tsx` | `SmearHeadingProvider` | wraps `{children}` | ✓ WIRED | Confirmed in source; this is the only mount point in the tree |

### Data-Flow Trace (Level 4)

Not applicable in the usual sense — Phase 1 ships no dynamic data (no DB, no API, no fetch). The
closest analog is "does the effect actually run off real DOM measurements, not hardcoded values,"
which was traced directly: `useSmearHeading` measures `getBoundingClientRect()` post-mount (after
`document.fonts.ready`), and `frame()` reads live `window.scrollY` every tick — confirmed by the
Playwright specs' mid-scroll sampling loop observing real, changing computed `text-shadow` values
tied to actual scroll position, not a static string.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Production build compiles | `npm run build` | Compiled successfully, 3 static routes (`/`, `/type`, `/_not-found`) | ✓ PASS |
| Full local Playwright suite | `npx playwright test --project=chromium` | 8/8 passed (4.4s) | ✓ PASS |
| Full suite against live URL | `PLAYWRIGHT_BASE_URL=https://web-production-9cedb.up.railway.app npx playwright test --project=chromium` | 8/8 passed (4.8s) | ✓ PASS |
| Live URL root response | `curl -s -o /dev/null -w '%{http_code}'` | `200`, real Next.js markup, `Developer.` copy, `robots: noindex` | ✓ PASS |
| Live `/type` response | `curl -s -o /dev/null -w '%{http_code}'` | `200`, `robots: noindex` inherited | ✓ PASS |
| Hydration integrity | Headless `next dev` console capture on `/` and `/type` | Zero hydration warnings/errors on either route | ✓ PASS |
| Humane asset integrity (D-01) | `wc -c app/fonts/Humane-VF.ttf` | `85000` bytes — matches CONTEXT.md's original figure, no subsetting | ✓ PASS |

### Probe Execution

Not applicable — no `scripts/*/tests/probe-*.sh` convention exists in this repo, and no plan/
SUMMARY declares probe-based verification for this phase. The phase's own equivalent (Playwright
specs run against local and live URLs) is covered above under Behavioral Spot-Checks.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|--------------|--------|----------|
| BUILD-01 | 01-01 | The site runs as a Next.js application | ✓ SATISFIED | `next build`/`next start`, App Router scaffold present and building |
| BUILD-02 | 01-01 | Deployed on Railway, reachable at a stable public URL | ✓ SATISFIED | Live 200 response confirmed at `web-production-9cedb.up.railway.app`, real app markup |
| BUILD-03 | 01-03 | Usable on desktop and mobile browsers | ✓ SATISFIED | `viewport.spec.ts` passes at 375px/1440px, both locally and live |
| BUILD-05 | 01-04 | Reduced-motion preference respected | ✓ SATISFIED | Gate gated at first component, live-toggling, `reduced-motion.spec.ts` passes under real emulation |
| BUILD-06 | 01-02, 01-03 | Fonts self-hosted, no layout shift | ✓ SATISFIED | `next/font` self-hosting confirmed; measured CLS < 0.1 via real `PerformanceObserver` |
| HOME-05 | 01-02, 01-03 | Deliberate typographic system, reads as authored | ? NEEDS HUMAN | Mechanically satisfied (see Truth #2); "reads as authored" itself is a human judgment call — flagged in project's own VALIDATION.md as manual-only |
| HOME-06 | 01-04 | Heading trail with smear/settle effect | ? NEEDS HUMAN | Mechanically satisfied (see Truth #5); "feels correct in motion" itself is a human judgment call — flagged in project's own VALIDATION.md as manual-only |

No orphaned requirements — every ID mapped to Phase 1 in `.planning/REQUIREMENTS.md`'s traceability
table (BUILD-01/02/03/05/06, HOME-05/06) is claimed by at least one plan's `requirements:`
frontmatter field, and vice versa.

### Anti-Patterns Found

None. Scanned all files under `app/`, `components/`, `tests/`, plus `next.config.ts` and
`package.json` for `TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER`, "coming soon"/"not yet implemented"/
"under construction" language, empty-implementation patterns (`return null`, `=> {}`), and
hardcoded-empty-data patterns. Zero matches. The one documented placeholder (the `/type` route's
prose copy) is explicitly pre-authorized by D-05/UI-SPEC as acceptable reference-artifact copy,
not a functional stub, and does not affect any success criterion.

### Locked-Decision Spot Checks (D-01 through D-08)

| Decision | Check | Result |
|----------|-------|--------|
| D-01 (Humane licence — no subsetting) | Byte count of `app/fonts/Humane-VF.ttf` | `85000` bytes, matches original — VERIFIED |
| D-06 (holding page — no positioning claim) | Rendered copy of `/` | "Guillem Gelabert" / "Developer." only, no adjectives, no in-progress language — VERIFIED, matches `01-DISCUSSION-LOG.md` Q4 selection |
| D-07 (`robots: { index: false }`, flip required in Phase 6) | Live HTML meta tag + `.planning/CONTEXT.md` Deferred section | `<meta name="robots" content="noindex"/>` present on `/` and `/type`; flip is explicitly recorded as a required Phase 6 (FIND-02) action in both CONTEXT.md's Deferred section and ROADMAP.md Phase 6 — VERIFIED |
| D-08 (delete before scaffold) | `git show --stat 57fb61b` | Deletions and scaffold committed together as the phase's first commit, before any design work — VERIFIED |

## Human Verification Required

### 1. `/type` specimen reads as a deliberate, authored typographic system

**Test:** Open `/type` at a 375px-wide viewport and again at 1440px. Read the page as a whole —
not individual computed style values.
**Expected:** The type scale reads as intentional and editorial (poster-scale Humane display type,
newspaper-register Newsreader body), not as framework-default styling.
**Why human:** Automated specs already prove the mechanics (fonts self-hosted, `clamp()` bounds
correct, weight budget locked to 2 values) — but "reads as authored" is inherently a judgment call.
The project's own `01-VALIDATION.md` independently lists this exact check as manual-only.

### 2. Heading trail feels correct in motion

**Test:** Scroll `/` or `/type` and watch the heading trail live. Separately, open
`text_trail_demo/index.html`'s "shadow" tab side by side and compare the lag/settle feel.
**Expected:** The ported trail's smear behavior (speed, settle) matches the benchmark's feel, not
just its assertable properties (non-`'none'` multi-layer shadow mid-scroll, settle to `'none'`).
**Why human:** `tests/smear-heading.spec.ts` proves the algorithm runs correctly and produces the
right shape of output — it cannot judge whether the motion "feels correct," which is Success
Criterion 5's own qualitative bar and is separately flagged as manual-only in `01-VALIDATION.md`.

## Gaps Summary

No gaps. All 5 roadmap success criteria are mechanically verified against the live deployment and
the local codebase — build passes, all 8 Playwright specs pass both locally and against the live
Railway URL, the heading-trail port is a genuine line-for-line port (not a reimplementation) with
only the two pre-authorized deviations, the reduced-motion gate is checked before the app's one
`requestAnimationFrame` call site exists and introduces no hydration mismatch, CLS is measured
(not assumed) at effectively zero, and the licensed font asset is untouched. The only reason status
is `human_needed` rather than `passed` is that two of the five criteria (HOME-05, HOME-06) contain
a qualitative clause ("reads as authored," "feels correct in motion") that no automated check can
close — and the project's own validation strategy already anticipated this by listing both as
manual-only verifications. This is not a defect in the implementation; it is the expected shape of
a phase whose deliverable is partly aesthetic.

---

*Verified: 2026-08-29T23:30:00Z*
*Verifier: Claude (gsd-verifier)*
