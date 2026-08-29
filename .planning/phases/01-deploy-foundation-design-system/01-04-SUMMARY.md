---
phase: 01-deploy-foundation-design-system
plan: 04
subsystem: ui
tags: [react, nextjs, playwright, scroll-effect, prefers-reduced-motion, text-shadow]

# Dependency graph
requires:
  - phase: 01-03
    provides: "app/layout.tsx, app/page.tsx (<h1 class=\"text-display\">), app/type/page.tsx (.text-display/.text-heading elements) as plain top-level nodes ready for ref attachment"
  - phase: 01-02
    provides: "app/globals.css's .text-display/.text-heading/.text-body/.text-label type-scale classes"
provides:
  - "components/smear-heading/smear-heading-provider.tsx — single shared requestAnimationFrame driver + registry, ported from createTextShadowEffect + frame()/start()/handleScroll()"
  - "components/smear-heading/use-smear-heading.ts — per-heading registration hook (register on mount after document.fonts.ready, unregister on unmount)"
  - "components/smear-heading/use-prefers-reduced-motion.ts — live-toggling prefers-reduced-motion gate"
  - "app/page.tsx and app/type/page.tsx wired to the trail on every Humane-set heading"
  - "tests/reduced-motion.spec.ts, tests/smear-heading.spec.ts"
affects: [phase-2, phase-3, phase-4]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single shared rAF driver pattern: one requestAnimationFrame call in the whole tree, owned by SmearHeadingProvider, iterating a Map<HTMLElement, {documentTop, lagY}> registry rather than one rAF per component instance"
    - "Heading trail registration always waits on document.fonts.ready before the first getBoundingClientRect() measurement, to avoid measuring against a fallback-font layout"
    - "page.emulateMedia({ reducedMotion: 'reduce' }) called BEFORE page.goto(), not Playwright's reducedMotion test/context option — see Deviations"

key-files:
  created:
    - components/smear-heading/smear-heading-provider.tsx
    - components/smear-heading/use-smear-heading.ts
    - components/smear-heading/use-prefers-reduced-motion.ts
    - tests/reduced-motion.spec.ts
    - tests/smear-heading.spec.ts
  modified:
    - app/layout.tsx
    - app/page.tsx
    - app/type/page.tsx

key-decisions:
  - "app/page.tsx and app/type/page.tsx converted from Server Components to Client Components ('use client') — required to call the useSmearHeading() hook and attach a ref; both routes have no server-only data fetching, so this has no cost."
  - "Playwright's reducedMotion context/test option (test.use({ reducedMotion: 'reduce' })) was found NOT to affect matchMedia('(prefers-reduced-motion: reduce)').matches in this environment (Playwright 1.62.1, Chromium) — verified directly, it stayed false. Switched to page.emulateMedia({ reducedMotion: 'reduce' }) called before page.goto(), verified to correctly report matches: true."
  - "Both new specs inject a 3000px-tall spacer div via page.evaluate() before scrolling — the holding page (D-06) is intentionally short (one heading, one line) and does not overflow the viewport on its own at common sizes, so window.scrollBy() would be a no-op without it. Test-only DOM addition; no production file touched."

patterns-established:
  - "Any future prefers-reduced-motion Playwright spec in this repo should use page.emulateMedia(), not the reducedMotion context option — the latter did not reliably affect matchMedia in this environment."

requirements-completed: [BUILD-05, HOME-06]

# Metrics
duration: 12min
completed: 2026-08-29
---

# Phase 1 Plan 4: Heading Scroll-Trail (Port) Summary

**Scroll-driven CSS text-shadow heading trail ported verbatim from `text_trail_demo/index.html`'s `createTextShadowEffect` + shared `frame()`/`start()`/`handleScroll()` driver, generalized into a single shared `requestAnimationFrame` loop over a heading registry, with the source's rainbow hue-cycling replaced by monochrome ink and gated by `prefers-reduced-motion` before any frame is ever scheduled.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-29T20:41:14Z
- **Completed:** 2026-08-29T20:53:12Z
- **Tasks:** 2
- **Files modified:** 8 (5 created, 3 modified)

## Accomplishments

- Ported `createTextShadowEffect`'s `layout`/`draw` and the shared `frame()`/`start()`/`handleScroll()`/`holdInput()`/`releaseInput()`/`finishScrolling()`/`scheduleScrollStop()` control flow into `smear-heading-provider.tsx`, generalized from the source's single `activeEffect` to `for (const [el, state] of registry)` — exactly one `requestAnimationFrame` call site in the whole tree, confirmed via grep
- Constants carried over unchanged: `MAX_TRAIL = 280`, `MAX_SHADOWS = 240`, `SCROLL_STOP_DELAY = 120`, smoothing `1 - exp(-elapsed * 0.009)`, strength `min(1, distance / 3)`, settle threshold `0.15px`
- Required deviation applied: every shadow layer renders `#171714` (solid ink); `trailColor()`/`HUE_SPEED`/`trailHue` are not present anywhere in the provider (confirmed via grep, count 0)
- `use-prefers-reduced-motion.ts` wraps `matchMedia` inside `useEffect` only, live-updates via the `change` listener (Pitfall 6); `start()` early-returns under reduced motion before any frame is scheduled, and a live mid-session toggle immediately clears any in-flight trail (T-01-11 mitigation)
- `use-smear-heading.ts` defers `getBoundingClientRect()` measurement until `document.fonts.ready` resolves, avoiding a stale rect measured against a fallback font (mirrors `:1067`'s intent); no inline `text-shadow` is ever set from server-rendered markup (Pitfall 5)
- `app/layout.tsx` mounts `SmearHeadingProvider` once around `{children}`; `app/page.tsx`'s `<h1>` and `app/type/page.tsx`'s `.text-display`/`.text-heading` elements each carry a `useSmearHeading()` ref — `.text-body`/`.text-label` deliberately do not
- Two new Playwright specs prove the actual ported behavior end-to-end: a genuine multi-layer `text-shadow` appears mid-scroll and settles back to `'none'`, and under `prefers-reduced-motion: reduce` the shadow never leaves `'none'` across a full scroll
- Full Playwright suite (8 tests across 6 spec files) and `npm run build` both green after both tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Build the reduced-motion hook and the shared smear-heading provider/registry** - `9b98e08` (feat)
2. **Task 2: Wire the provider onto the app's real headings; add reduced-motion + smear-heading specs** - `23f9538` (feat)

**Plan metadata:** (recorded below, this commit)

## Files Created/Modified

- `components/smear-heading/smear-heading-provider.tsx` - the single shared rAF driver + registry; owns the only `requestAnimationFrame` call in the tree
- `components/smear-heading/use-smear-heading.ts` - per-heading registration hook, measures after `document.fonts.ready`
- `components/smear-heading/use-prefers-reduced-motion.ts` - live `matchMedia` gate
- `app/layout.tsx` - wraps `{children}` in `<SmearHeadingProvider>`
- `app/page.tsx` - converted to a Client Component; attaches `useSmearHeading()` to the `<h1>`
- `app/type/page.tsx` - converted to a Client Component; attaches `useSmearHeading()` to `.text-display` and `.text-heading`
- `tests/reduced-motion.spec.ts` - proves `text-shadow` stays `'none'` throughout a full scroll under reduced-motion emulation
- `tests/smear-heading.spec.ts` - proves a multi-layer `text-shadow` mid-scroll and settle-to-`'none'` after stopping

## Decisions Made

- `app/page.tsx` and `app/type/page.tsx` needed `"use client"` to call `useSmearHeading()` — both routes have zero server-only data fetching, so this is a cost-free consequence of attaching a ref hook, not an architectural change.
- Kept the provider's internal control flow (`frame`/`start`/`holdInput`/`releaseInput`/`finishScrolling`/`scheduleScrollStop`) as plain function declarations inside a single mount-time `useEffect`, mirroring the source's own IIFE structure, rather than splitting into several `useCallback`s — keeps the port closer to line-by-line and avoids re-creating listeners on every render.
- Did not port the source's `resize()` function or its `resize`/no corresponding listener — the read_first range included it for context but the task's `<action>` text enumerates only `frame`/`draw`/`start`/scroll+pointer listeners as things to port; no acceptance criterion or test exercises a post-mount viewport resize. Noted as a design note below, not a deviation, since nothing broke and no requirement covers it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Comments naming the excluded rainbow-cycling symbols broke the acceptance-criteria grep**
- **Found during:** Task 1, running the plan's own acceptance-criteria checks
- **Issue:** `grep -c 'trailColor\|HUE_SPEED\|trailHue' components/smear-heading/smear-heading-provider.tsx` must return `0`. The first draft's explanatory comments (documenting that these symbols were intentionally *not* ported) literally contained the strings `trailColor`, `HUE_SPEED`, and `trailHue`, so the grep matched 2 lines instead of 0 — the comments themselves tripped the very check they were trying to explain.
- **Fix:** Reworded both comments to describe the excluded behavior ("the source's scroll-speed-driven rainbow hue-cycling helper", "the source's hue-cycling color helper and its scroll-speed input") without using the literal identifier names. The deviation itself is still fully documented — here, in this SUMMARY, and in the RESEARCH.md/UI-SPEC.md references — just not by naming the excluded symbols inside the file the grep inspects.
- **Files modified:** `components/smear-heading/smear-heading-provider.tsx`
- **Verification:** `grep -c 'trailColor\|HUE_SPEED\|trailHue' components/smear-heading/smear-heading-provider.tsx` returns `0`.
- **Committed in:** `9b98e08` (Task 1 commit)

**2. [Rule 3 - Blocking] Playwright's `reducedMotion` context option did not affect `matchMedia` in this environment**
- **Found during:** Task 2, first run of `tests/reduced-motion.spec.ts`
- **Issue:** The plan's action text specified `contextOptions: { reducedMotion: 'reduce' }`. Using `test.use({ reducedMotion: 'reduce' })`, a direct `page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)` check returned `false` — the emulation was not reaching the page's `matchMedia` result in this Playwright 1.62.1 / Chromium combination. As a direct consequence, the reduced-motion spec passed for the wrong reason (the app's own gate was reading `false`, same as default, and the trail behaved as if reduced motion were off), and — because both new specs were run in parallel workers and the wrong one turned out to behave "correctly" by coincidence, the smear-heading spec's own timing gap (see item 3) made the two failures look swapped at first before isolating the root cause.
- **Fix:** Switched to `page.emulateMedia({ reducedMotion: 'reduce' })`, called before `page.goto('/')` so the app's mount-time `matchMedia(...).matches` read sees the emulated value from the very first effect run, rather than depending on a `change` event to correct a stale initial read. Verified directly: `page.emulateMedia({ reducedMotion: 'reduce' })` before or after navigation both make a fresh `matchMedia(...).matches` query report `true`.
- **Files modified:** `tests/reduced-motion.spec.ts`
- **Verification:** `npx playwright test tests/reduced-motion.spec.ts --project=chromium` passes, and passes for the correct reason — verified by a separate debug run showing shadows *do* appear when the trail is genuinely un-gated, and do not when `page.emulateMedia` is applied.
- **Committed in:** `23f9538` (Task 2 commit)

**3. [Rule 3 - Blocking] Neither route overflows the default Playwright viewport, so `window.scrollBy()` was a no-op**
- **Found during:** Task 2, first run of `tests/smear-heading.spec.ts`
- **Issue:** The holding page (D-06) is one heading plus one line of body text, `min-h-screen` centered — its total content height (measured directly) is well under the default 1280×720 viewport, so `document.documentElement.scrollHeight === window.innerHeight` and `window.scrollBy(0, 1200)` left `scrollY` at `0`. With no scroll delta, `targetY` never changes and the trail never activates — not a gate failure, just nothing to scroll.
- **Fix:** Both new specs append a `3000px`-tall spacer `<div>` to `document.body` via `page.evaluate()` immediately after navigation, before scrolling. This is a test-only DOM addition (never touches a production file) that makes the scroll assertion meaningful regardless of the holding page's actual content height at whatever viewport a future CI run uses.
- **Files modified:** `tests/reduced-motion.spec.ts`, `tests/smear-heading.spec.ts`
- **Verification:** Confirmed via a throwaway debug spec that `window.scrollBy(0, 1200)` genuinely moves `scrollY` to `1200` after the spacer is appended; both real specs pass consistently across 3 repeated runs.
- **Committed in:** `23f9538` (Task 2 commit)

**4. [Rule 1 - Bug] Registration-timing race made the mid-scroll assertion flaky**
- **Found during:** Task 2, iterating on `tests/smear-heading.spec.ts` after fixing items 2 and 3
- **Issue:** `use-smear-heading.ts` intentionally defers registration until `document.fonts.ready` resolves (matching the source's own font-loading guard). Scrolling immediately after `page.goto()` resolves risked racing that promise on a cold Playwright worker, causing the mid-scroll poll loop to never observe a non-`'none'` shadow (the heading simply wasn't registered yet when the scroll fired).
- **Fix:** Both specs now explicitly `await page.evaluate(() => document.fonts.ready)` plus a `200ms` buffer before scrolling, giving the registration promise time to resolve deterministically.
- **Files modified:** `tests/reduced-motion.spec.ts`, `tests/smear-heading.spec.ts`
- **Verification:** `npx playwright test tests/reduced-motion.spec.ts tests/smear-heading.spec.ts --project=chromium` passed on 3 consecutive repeated runs with no flakiness observed.
- **Committed in:** `23f9538` (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (1 bug in the production file's own comments, 1 bug + 2 blocking issues in test setup)
**Impact on plan:** No scope creep and no change to the ported algorithm's actual behavior. All four fixes are either wording-only (item 1) or test-harness corrections needed to make the two new specs assert what they claim to assert, rather than passing by coincidence (items 2-4).

## Issues Encountered

None beyond the deviations documented above.

## Known Stubs

None. This plan wires the trail onto real production headings on both routes — no placeholder data paths were introduced.

## Design Note (non-blocking)

- The provider does not re-measure a registered heading's `documentTop` on window `resize` (the source's `resize()` function, `text_trail_demo/index.html:817-825`, was read for context but not ported — the plan's task text enumerates `frame`/`draw`/`start`/scroll+pointer listeners as the porting scope, not `resize`). In practice this means if a viewport resize reflows a heading's vertical position (e.g. a responsive breakpoint changing line-wrapping) while the tab is open, the trail's anchor point goes stale until the next full page load. No requirement or test in this plan covers a post-mount resize scenario; flagged here for a future phase to reconsider if it becomes visible in practice.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The heading trail is live on `/` and `/type`; `components/smear-heading/*` is a self-contained, reusable subsystem — any future Humane-set heading elsewhere in the app can opt in with a single `useSmearHeading()` call, as long as it renders inside `app/layout.tsx`'s `<SmearHeadingProvider>`.
- Per `01-UI-SPEC.md`'s standing rule, future phases (writing/post pages, Phase 2+) should only attach the trail to a post title if it is itself set in Humane at Display/Heading scale — never to in-body Newsreader subheadings.
- `page.emulateMedia({ reducedMotion: 'reduce' })` (not the `reducedMotion` context/test option) is now the established pattern for any future prefers-reduced-motion Playwright spec in this repo — see `tech-stack.patterns` above.
- Full Playwright suite is 8 tests across 6 spec files, all green: `deploy-smoke`, `font-cls`, `viewport` (×3), `type-specimen`, `reduced-motion`, `smear-heading`. This closes out Phase 1's Wave 0 test list — `smear-heading.spec.ts` and `reduced-motion.spec.ts` were the last two remaining per `01-VALIDATION.md`.
- This is the phase's last plan (wave 4 of 4). Phase-level verification (`/gsd:verify-work`) should still perform the one inherently-manual check noted in `01-VALIDATION.md`: running `tests/deploy-smoke.spec.ts` against the live Railway URL post-push, not just the local dev server.

---
*Phase: 01-deploy-foundation-design-system*
*Completed: 2026-08-29*

## Self-Check: PASSED

All claimed files found (`components/smear-heading/smear-heading-provider.tsx`, `components/smear-heading/use-smear-heading.ts`, `components/smear-heading/use-prefers-reduced-motion.ts`, `tests/reduced-motion.spec.ts`, `tests/smear-heading.spec.ts`, `app/layout.tsx`, `app/page.tsx`, `app/type/page.tsx`) and all claimed commits (`9b98e08`, `23f9538`) verified present in `git log --oneline --all`.
