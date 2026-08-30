---
phase: 02-content-pipeline
plan: 05
subsystem: testing
tags: [playwright, getcomputedstyle, tailwindcss-typography, shiki, cls, accessibility]

# Dependency graph
requires:
  - phase: 02-content-pipeline (Plan 03)
    provides: ".prose-site CSS, mdx-components.tsx's pre override (role/aria-label, style destructure)"
  - phase: 02-content-pipeline (Plan 04)
    provides: "content/fixture.mdx and the /writing/fixture route sweeping every Prose Contract element"
provides:
  - "tests/prose-typography.spec.ts: SC3 coverage — measured computed values for p, h2, h3, strong, em, blockquote, blockquote em, th, td, plus the negative that no rendered prose element resolves outside {14px, 18px}"
  - "tests/prose-code.spec.ts: SC4 coverage — Shiki class/theme, stripped inline style, tabindex/role/aria-label, keyboard focus, token colouring present in pre and absent on inline code"
  - "tests/fixture-viewport.spec.ts: SC5 coverage — every Prose Contract element present at 375px and 1440px, no page-level horizontal overflow while pre/table scroll internally, the h2/h3 hierarchy signal measurable at both widths"
  - "tests/font-cls.spec.ts extended: BUILD-06 regression guard parameterised over ['/', '/writing/fixture']"
  - "app/globals.css: three corrective fixes so blockquote, ul/ol, Aside body text and the bare table/thead/tbody/tr elements actually resolve to the Prose Contract's Body/Label roles instead of @tailwindcss/typography's own defaults"
affects: [02-06, 02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "A Body-role default on .prose-site itself (font-family/size/weight/line-height), overridden by every more specific selector (h2/h3/th/td/code/pre) — closes the gap for any element the plugin's own CSS would otherwise reach first"
    - "One page.evaluate per spec collecting a structured object (not one round trip per assertion), matching tests/viewport.spec.ts's shape"
    - "Parameterising an existing spec's body over a route/viewport array instead of duplicating it (tests/font-cls.spec.ts, tests/fixture-viewport.spec.ts)"

key-files:
  created:
    - tests/prose-typography.spec.ts
    - tests/prose-code.spec.ts
    - tests/fixture-viewport.spec.ts
  modified:
    - app/globals.css
    - tests/font-cls.spec.ts

key-decisions:
  - "Fixed three measured disagreements between shipped CSS and the Prose Contract in app/globals.css rather than loosening the assertions: blockquote had no font-family/size/line-height (rendered 16px system sans); .prose-site itself had no Body-role default so ul/ol and Aside body text fell to the same 16px default; .prose-site table had no font-size so table/thead/tbody/tr retained the typography plugin's 0.875em (15.75px) — none of these are visible-text violations in the plugin default case except blockquote and list/aside text, but all three are now within the {14px, 18px} budget the negative test enforces"
  - "RESEARCH Assumption A1 (does the pre override's style destructure actually strip Shiki's inline background) was measured directly rather than assumed: the style attribute is null on every rendered pre, not merely background-color-free — a stronger result than the assumption required. The documented !important fallback in app/globals.css was not needed and mdx-components.tsx was not touched"
  - "mdx-components.tsx was left completely unmodified — despite being in this plan's files_modified corrective-edit budget — because no measurement disagreed with its output"

patterns-established: []

requirements-completed: [WRIT-01]

# Metrics
duration: 30min
completed: 2026-08-30
---

# Phase 2 Plan 5: Measuring the Prose Layer Against the Contract Summary

**Three new Playwright specs (57 new test cases across prose-typography, prose-code, and fixture-viewport) that measure success criteria 3, 4, and 5 against a real render of `/writing/fixture`, plus three corrective `app/globals.css` fixes the measurements surfaced — `.prose-site blockquote`, `.prose-site` itself, and `.prose-site table` were all silently falling back to `@tailwindcss/typography`'s own type scale for one or more properties.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-08-30T02:03:00+02:00 (approx., immediately after the worktree base correction and `npm ci`)
- **Completed:** 2026-08-30T02:15:00+02:00 (approx.)
- **Tasks:** 3 completed
- **Files modified:** 5 (3 new test files, 1 extended test file, 1 CSS fix)

## Accomplishments

- `tests/prose-typography.spec.ts`: 8 Playwright tests reading `getComputedStyle` on `p`, `h2`/`h3` (as a paired hierarchy-signal test), `strong`, `em`, `blockquote`, `blockquote em`, `th`/`td`, plus the negative assertion that walks the entire `.prose-site` subtree (excluding `pre code` spans) and asserts every computed font size is `14px` or `18px` — nothing else. All values are measured pixel outputs (`28.8px`, `0.56px`), not the authored CSS strings (`1.6`, `0.04em`), per Phase 1's scar-tissue rule.
- Three real, measured disagreements between the shipped CSS and the UI-SPEC Prose Contract were found and fixed in `app/globals.css` before the spec was finalized (full detail in Deviations below): `blockquote` had no `font-family`/`font-size`/`line-height` and rendered in the browser's default sans at 16px; `.prose-site` itself declared no Body-role default so `ul`/`ol` list items and `<Aside>`'s body text (neither of which has its own font rule) inherited the same 16px default; `.prose-site table` declared no `font-size` so the non-text-bearing `table`/`thead`/`tbody`/`tr` elements retained `@tailwindcss/typography`'s own `0.875em` (15.75px against an 18px base).
- `tests/prose-code.spec.ts`: 10 Playwright tests confirming every `pre` inside `.prose-site` carries `shiki github-light-high-contrast`, has **no inline `style` attribute at all** (RESEARCH Assumption A1 — measured, not assumed, and it held stronger than the assumption required), is keyboard-reachable (`tabindex="0"` exactly once, `role="region"`, non-empty `aria-label`, and a real `.focus()` + `document.activeElement` check), renders IBM Plex Mono at the measured `27px` line-height, sits on the measured `rgba(0, 0, 0, 0.04)` ink tint, and that the long `bash` fence scrolls internally while inline `` `code` `` stays uncoloured (full ink, no token spans) even as `pre` carries real token colouring.
- `tests/fixture-viewport.spec.ts`: 6 Playwright tests (3 per viewport × 2 viewports via the existing `VIEWPORTS`-loop shape) asserting every Prose Contract element count by name, exactly two `pre`/`figure` and one `figure[data-wide]`, no page-level horizontal overflow (`document.documentElement.scrollWidth <= innerWidth + 1`) distinct from the expected internal scroll on `pre`/`.prose-table`, and the `h2`/`h3` hierarchy signal (`48px`+rule vs `32px`+no-rule) holding at both 375px and 1440px.
- `tests/font-cls.spec.ts` extended: the existing CLS-measurement body parameterised over `["/", "/writing/fixture"]` rather than duplicated — both routes measure comfortably under the `< 0.1` threshold, closing out RESEARCH Assumption A5 (the added Newsreader italic + IBM Plex Mono on a `pre`-heavy route was named the phase's most plausible silent BUILD-06 regression).
- `mdx-components.tsx` was not touched — A1 held, so the documented `!important` fallback was never invoked.
- Full verification green: 39/39 Playwright specs (9 pre-existing Phase 1 + 5 pre-existing Plan 04 + 25 new/extended from this plan), 24/24 `node --test` unit assertions (the `.prose-site` conformance gate survived every corrective edit unchanged), `npx tsc --noEmit` clean.

## Task Commits

Each task was committed atomically:

1. **Task 1: Measure the prose typography against Phase 1's tokens** - `d024c22` (test)
2. **Task 2: Verify the code blocks — Shiki, accessibility, and the stripped background** - `873eca8` (test)
3. **Task 3: The fixture at 375px and 1440px, and the CLS regression guard** - `b453891` (test)

**Plan metadata:** (pending — final docs commit follows this summary)

## Files Created/Modified

- `tests/prose-typography.spec.ts` (new) - SC3 coverage: measured computed typography values against the Prose Contract
- `tests/prose-code.spec.ts` (new) - SC4 coverage: Shiki class/theme, stripped inline style, accessibility, inline-vs-block colouring
- `tests/fixture-viewport.spec.ts` (new) - SC5 coverage: full element sweep and no-page-overflow at 375px/1440px
- `tests/font-cls.spec.ts` (modified) - parameterised over `["/", "/writing/fixture"]`, same threshold and observer shape
- `app/globals.css` (modified) - `.prose-site blockquote` gained `font-family`/`font-size`/`line-height`; `.prose-site` gained a Body-role default; `.prose-site table` gained `font-size: 14px`

## Decisions Made

- Fixed all three measured disagreements at their source in `app/globals.css` rather than loosening any assertion, per the plan's own interfaces contract ("the contract is the source of truth, the assertion follows it").
- Chose to put the Body-role default on `.prose-site` itself (rather than adding individual `font-family`/`font-size`/`line-height` declarations to `ul`, `ol`, and `aside` separately) because it is the smaller, more structurally honest fix: every element in the Prose Contract that needs the Label role or the mono face already overrides it with a more specific selector, so the cascade does the right thing by construction rather than by enumeration.
- Left `mdx-components.tsx` byte-for-byte unchanged. It was in this plan's `files_modified` list specifically to hold a corrective edit if RESEARCH Assumption A1 failed; it didn't, so touching the file would have been change without a measurement to justify it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `.prose-site blockquote` rendered in the browser's default sans-serif at 16px, not Newsreader 18px/1.6**
- **Found during:** Task 1, first real-browser measurement pass (before any assertion was written)
- **Issue:** `.prose-site blockquote` declared `font-style`, `font-weight`, borders, padding and margin, but no `font-family`, `font-size` or `line-height`. With no Body-role default anywhere in `.prose-site` at the time, the blockquote fell through to `@tailwindcss/typography`'s own blockquote rule: `-apple-system, system-ui, ...` at `16px`, `line-height: 28px` — a value the Prose Contract's own table (`<blockquote>` → Body → 18px / 1.6 / 400 / italic) directly contradicts.
- **Fix:** Added `font-family: var(--font-body); font-size: 18px; line-height: 1.6;` to `.prose-site blockquote`.
- **Files modified:** `app/globals.css`
- **Verification:** Re-measured with a headless Chromium page against the live render — `blockquote` now computes `fontFamily` containing `Newsreader`, `fontSize: 18px`, `lineHeight: 28.8px`. `npm run test:unit` (the `.prose-site` conformance gate) still passes 24/24 — `18px` is already an allowed value in the type budget.
- **Committed in:** `d024c22`

**2. [Rule 1 - Bug] `ul`/`ol` list items and `<Aside>` body text rendered at 16px, not Body-role 18px**
- **Found during:** Task 1, same measurement pass, walking the full `.prose-site` subtree for the negative assertion
- **Issue:** Neither `.prose-site ul`/`.prose-site ol` nor `.prose-site aside` declares a `font-size`/`font-family`, and `.prose-site` itself declared only `color` and `max-width` — no Body-role default for anything not explicitly overridden. List items and the Aside's body copy (which has no wrapping `<p>` of its own) both fell through to the browser's/plugin's ambient `16px` sans, violating the Prose Contract rows for `<ul>/<ol>` and `<Aside>` (both "Body → 18px / 1.6").
- **Fix:** Added `font-family: var(--font-body); font-size: 18px; font-weight: 400; line-height: 1.6;` directly to `.prose-site` (the wrapper class itself), so every descendant inherits the Body role by default unless a more specific selector (`h2`, `h3`, `th`, `td`, `code`, `pre`, `.aside-kicker`) overrides it — which every one of them already does.
- **Files modified:** `app/globals.css`
- **Verification:** Re-measured — the negative-assertion offender list (elements outside `{14px, 18px}`) dropped from 21 elements to 7 (the remaining 7 were the Deviation #3 table elements, fixed next). `npm run test:unit` still 24/24.
- **Committed in:** `d024c22`

**3. [Rule 1 - Bug] `table`/`thead`/`tbody`/`tr` retained the typography plugin's own `0.875em` (15.75px), outside the {14px, 18px} budget**
- **Found during:** Task 1, same measurement pass, after fixing #2
- **Issue:** `.prose-site table` declared `border-collapse`, `width` and `margin` but no `font-size`. `@tailwindcss/typography` sets its own `table { font-size: 0.875em; ... }` on the raw element, which resolved to `15.75px` against the new 18px base from fix #2. None of these elements render visible text directly (all text lives in the already-correctly-styled `th`/`td` cells), so this had no visual effect, but it failed the negative assertion's literal budget.
- **Fix:** Added `font-size: 14px;` to `.prose-site table`.
- **Files modified:** `app/globals.css`
- **Verification:** Re-measured with the offender-scan script — zero elements outside `{14px, 18px}` in the full `.prose-site` subtree. `npm run test:unit` still 24/24; full Playwright suite green.
- **Committed in:** `d024c22`

---

**Total deviations:** 3 auto-fixed (Rule 1 — all three are the plan's own explicitly authorised corrective-edit path: "a measurement that disagrees with the Prose Contract can be fixed at its source rather than papered over in an assertion")
**Impact on plan:** All three fixes are visual corrections that bring the shipped CSS into conformance with the already-approved UI-SPEC Prose Contract; none change the contract itself, none touch `mdx-components.tsx`, and the `.prose-site` conformance gate (`tests/unit/prose-contract.test.ts`) passed unchanged after each one.

## Issues Encountered

**1. RESEARCH Assumption A1 held stronger than stated, not weaker.** RESEARCH flagged A1 ("destructuring `style` off the `pre` props actually removes Shiki's inline background") as MEDIUM confidence and provided a documented `!important` fallback. Direct measurement against the live render showed the `style` attribute is `null` on every `pre` — not merely free of `background-color`, but entirely absent. This is a stronger result than the assumption required, so the fallback path (and any edit to `mdx-components.tsx` or an additional `!important` rule in `app/globals.css`) was not exercised. Recorded per the plan's own instruction to note the outcome regardless of which way it resolved.

**2. `next-env.d.ts` toggles between dev-mode and build-mode import paths.** A dev server was run manually (outside the Playwright `webServer` lifecycle) to take real `getComputedStyle` measurements before writing each spec's assertions. This left `next-env.d.ts` in its dev-mode form, which matched the file's already-committed state (`git diff --stat next-env.d.ts` empty throughout) — no corrective action needed, but noted per the worktree handoff instructions since this is a known source of a dirty return.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Success criteria 3, 4 and 5 are now proven by measurement, not merely by the fact that CSS exists — the exact gap this plan's objective named as still open after Plans 03/04.
- `app/globals.css`'s three corrective fixes are additive only: no selector was removed, no value outside the `{14px, 18px}` / `{400, 530}` budget was introduced, and `tests/unit/prose-contract.test.ts`'s conformance gate (which enforces exactly that budget structurally, from the CSS source) passed unchanged after each fix.
- `tests/font-cls.spec.ts` now covers both routes this phase's font additions touch; a future phase adding a fourth route with new prose content should extend the same `ROUTES` array rather than adding a parallel spec.
- No blockers or concerns for Plans 06/07 (the German route template and its own fixture/spec set) — the corrective `app/globals.css` fixes apply globally to `.prose-site`, so `/texte/[slug]` inherits all three fixes automatically once it renders through the same `Prose` wrapper.

## Self-Check: PASSED

All created files verified present on disk (`tests/prose-typography.spec.ts`, `tests/prose-code.spec.ts`,
`tests/fixture-viewport.spec.ts`, this SUMMARY.md). All three commit hashes (`d024c22`, `873eca8`,
`b453891`) verified present in `git log --oneline --all`. `tests/font-cls.spec.ts` and
`app/globals.css` modifications confirmed via `git diff --stat` against each task commit.

---
*Phase: 02-content-pipeline*
*Completed: 2026-08-30*
