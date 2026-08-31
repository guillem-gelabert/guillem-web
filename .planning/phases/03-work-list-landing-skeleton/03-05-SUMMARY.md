---
phase: 03-work-list-landing-skeleton
plan: 05
subsystem: ui
tags: [nextjs, accessibility, wcag, css, playwright, i18n]

# Dependency graph
requires:
  - phase: 03-work-list-landing-skeleton (Wave 1)
    provides: "app/globals.css's .link/.link-quiet/.section-head classes (03-02) and lib/locales.ts's homeLink key (03-01), consumed verbatim here"
provides:
  - "Site-root back links (← Guillem Gelabert → /) on /writing and /texte, closing the dead end the landing's Writing nav entry creates"
  - "The one declared locale crossing: /texte's back link carries hrefLang=\"en\""
  - ".link-quiet on all seven non-prose link sites A3 names: two index headline links, two post-template back links, three not-found back links, plus components/language-switch.tsx"
  - "Extended coverage in tests/writing-index.spec.ts, tests/writing-not-found.spec.ts, tests/writing-routing.spec.ts gating A2/A3 on every surface they touch"
affects: [03-06, 03-07, 03-08, 03-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standalone Label-role back links take the full `text-label link-quiet inline-block py-xs` class string; inline links that share a text line (LanguageSwitch) take `link-quiet` only, per WCAG 2.5.8's inline exception"
    - "Table-driven Playwright specs (LOCALE_CASES, POST_BACK_LINK_CASES) grown by adding entries/loops rather than duplicating hand-written tests"

key-files:
  created: []
  modified:
    - app/(en)/writing/page.tsx
    - app/(de)/texte/page.tsx
    - app/(en)/writing/[slug]/page.tsx
    - app/(de)/texte/[slug]/page.tsx
    - app/(en)/writing/not-found.tsx
    - app/(de)/texte/not-found.tsx
    - app/not-found.tsx
    - components/language-switch.tsx
    - tests/writing-index.spec.ts
    - tests/writing-not-found.spec.ts
    - tests/writing-routing.spec.ts

key-decisions:
  - "03-PATTERNS.md does not exist in this worktree (no wave-1 plan created it, no git history for it) — worked directly from the actual source files using the plan's <read_first> line hints and the UI-SPEC, which the plan's own scope_note already designates as normative over the pattern map on any conflict"
  - "hrefLang=\"en\" on /texte's back link is a literal string, not otherLocale(locale) — a fixed crossing to an English-only page, not a symmetric locale switch"
  - "LanguageSwitch's comment describing why it takes no padding was reworded to avoid the literal substrings 'inline-block'/'py-xs' appearing anywhere in the file, since Task 2's own verification regex (/inline-block|py-xs/) scans the whole file text, not just the className attribute"

patterns-established:
  - "A3's WCAG 2.5.8 comment is written once, at the first back-link site touched (app/(en)/writing/[slug]/page.tsx), and not repeated at the other four identical sites — matching the plan's own instruction"

requirements-completed: [HOME-03]

# Metrics
duration: 23min
completed: 2026-08-31
---

# Phase 3 Plan 5: Dead-End Closure and Link Conformance (A2/A3) Summary

**Closed the /writing and /texte dead end with a `← Guillem Gelabert` site-root back link (one carrying `hrefLang="en"`), and brought all seven remaining non-prose link sites on the shipped site into `.link-quiet` conformance with Phase 2's own accent-on-hover/focus contract — extending three Playwright specs to gate both amendments.**

## Performance

- **Duration:** ~23 min
- **Started:** 2026-08-31T13:25:00+02:00 (approx.)
- **Completed:** 2026-08-31T13:48:00+02:00
- **Tasks:** 3/3
- **Files modified:** 11 (8 app/component files, 3 spec files)

## Accomplishments
- `app/(en)/writing/page.tsx` and `app/(de)/texte/page.tsx` each gain a `<Link href="/">` (`UI[locale].homeLink`) as the first child of `<main>`, above the kicker row, closing the dead end Phase 3's landing-page Writing nav entry creates
- `/texte`'s back link carries a literal `hrefLang="en"` — the one declared locale crossing, honestly signalling that the landing only exists in English for v1
- Both index headline links, both post-template back links (`← Writing` / `← Texte`), all three not-found back links (`/writing`, `/texte`, and the global `app/not-found.tsx` boundary per the plan's `<scope_note>`), and `components/language-switch.tsx` all now carry `.link-quiet` — closing the accent-hover/focus gap Tailwind's preflight left open
- The five standalone Label-role back links additionally take `inline-block py-xs`, clearing WCAG 2.5.8's 24px target floor (measured at 26.2px); `LanguageSwitch` deliberately does not, per its documented inline exception
- Three Playwright specs extended with pure additions (zero lines removed from any existing test): `writing-index.spec.ts` gains 2 tests (A2 back-link presence/hreflang, A3 link-quiet + measured height), `writing-not-found.spec.ts` grows `LOCALE_CASES` from 2 to 3 entries (adding `/nope`, the global boundary) and gains a link-quiet + height test looped across all three, `writing-routing.spec.ts` gains a table-driven test covering both post-template back links

## Task Commits

Each task was committed atomically:

1. **Task 1: Amendment A2 — site-root back links on both writing indexes, plus A3 on their headline links** - `4b5b2fb` (feat)
2. **Task 2: Amendment A3 — .link-quiet on the two post back links, the three not-found back links, and LanguageSwitch** - `cc9118f` (feat)
3. **Task 3: Extend the three shipped specs to gate A2 and A3** - `8cc9a5d` (test)

_No plan-metadata commit — the orchestrator commits STATE.md/ROADMAP.md after the wave completes, per parallel-executor instructions._

## Files Created/Modified
- `app/(en)/writing/page.tsx` - Site-root back link (A2) as first child of `<main>`; `link-quiet` on the entry headline link (A3)
- `app/(de)/texte/page.tsx` - Same, plus literal `hrefLang="en"` on the back link
- `app/(en)/writing/[slug]/page.tsx` - `← Writing` back link takes `text-label link-quiet inline-block py-xs`; carries the plan's one WCAG 2.5.8 comment
- `app/(de)/texte/[slug]/page.tsx` - `← Texte` back link, same class list
- `app/(en)/writing/not-found.tsx` - Back link, same class list
- `app/(de)/texte/not-found.tsx` - Back link, same class list
- `app/not-found.tsx` - Global boundary's back link, same class list (scope_note extension #1)
- `components/language-switch.tsx` - `link-quiet` only, no `inline-block`/`py-xs`, with its documented inline exception
- `tests/writing-index.spec.ts` - +2 tests (A2, A3)
- `tests/writing-not-found.spec.ts` - `LOCALE_CASES` grown to 3 entries; +1 test looped across all three
- `tests/writing-routing.spec.ts` - +1 table-driven test covering both post-template back links (scope_note extension #2)

## Decisions Made
- Followed the plan's `hrefLang="en"` literal-string instruction exactly rather than reusing `otherLocale(locale)` — this is a fixed, asymmetric crossing, not the symmetric `LanguageSwitch` pattern
- Reworded the `LanguageSwitch` comment to avoid the literal substrings `inline-block`/`py-xs` appearing anywhere in the file text (see Deviations) — no change to the actual className or behaviour
- Placed the new `writing-routing.spec.ts` test in its own `test.describe("post template back links (A3)")` block rather than nesting it inside the existing `"filesystem-driven routing"` describe, since the two are testing different concerns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `03-PATTERNS.md` does not exist in this worktree**
- **Found during:** Task 1 read_first
- **Issue:** The plan's `<files_to_read>` and every task's `<read_first>` reference `.planning/phases/03-work-list-landing-skeleton/03-PATTERNS.md` with exact line numbers. The file does not exist anywhere in this worktree's `.planning/` directory and has no git history under any branch (`git log --all -- '.../03-PATTERNS.md'` returns nothing) — it was apparently never created by any Wave 1 plan.
- **Fix:** Read every referenced source file directly (`app/(en)/writing/page.tsx`, `app/(de)/texte/page.tsx`, both `[slug]/page.tsx` templates, all three `not-found.tsx` files, `components/language-switch.tsx`, `lib/locales.ts`) and cross-checked against `03-UI-SPEC.md`'s Amendments A2/A3 sections and Accessibility contract, which the plan's own `<scope_note>` already designates as normative over the pattern map whenever the two would conflict. No functional impact: every acceptance criterion in the plan is line-number-agnostic (className strings, `<node -e>` structural checks, Playwright assertions), so working from source directly produced identical results to what the pattern map would have pointed at.
- **Files modified:** None (documentation-navigation issue only, not a code fix)
- **Verification:** All three tasks' automated verification blocks passed exactly as specified
- **Committed in:** N/A (no code change; recorded here for the record)

**2. [Rule 1 - Bug] `components/language-switch.tsx`'s own comment tripped Task 2's verification regex**
- **Found during:** Task 2 verification
- **Issue:** The plan's Task 2 verify script scans the whole file text for `/inline-block|py-xs/` to confirm `LanguageSwitch` takes no target-size padding. My first draft of the required explanatory comment (documenting *why* no padding is applied) used the literal words "inline-block padding" and "NO inline-block/py-xs", which the regex correctly flagged as present in the file — even though neither string appeared in the actual `className`.
- **Fix:** Reworded the comment to convey the identical two reasons (PostMeta's inline text line is WCAG 2.5.8's inline exception; padding would regress the shipped meta-line height) without using the literal class-name tokens.
- **Files modified:** `components/language-switch.tsx`
- **Verification:** Re-ran the Task 2 `node -e` verification script — passed; re-ran `npx tsc --noEmit`, `npx eslint components/language-switch.tsx`, and the three affected Playwright specs — all green
- **Committed in:** `cc9118f` (Task 2 commit — the comment was corrected before staging, so only the final wording was ever committed)

---

**Total deviations:** 2 (1 blocking/documentation-navigation, 1 self-caught bug in a draft comment before commit)
**Impact on plan:** Neither affected shipped behaviour or test coverage. No scope creep.

## Issues Encountered

**Port contention with a sibling parallel-execution worktree.** `npm run test:all`'s final `npm test` (Playwright) step returned 15 failures, all either `ERR_CONNECTION_REFUSED` or content mismatches. Investigation (`lsof -i :3000`, `ps aux`) confirmed a different worktree's `next dev` process (`agent-afe9e7f019ba4a33d`, an unrelated sibling agent running concurrently) was squatting on the shared port 3000 at that moment, and Playwright's `reuseExistingServer: !process.env.CI` config connected to that foreign server instead of spawning this worktree's own. `curl -s http://localhost:3000/` at the time returned an empty 200 body, confirming cross-contamination rather than a real regression.

This is an environmental hazard inherent to running multiple worktree agents in parallel on one machine with a hardcoded port, not a defect in this plan's code. Resolution: re-ran the isolated stages independently — `npm run test:unit` (46/46 pass), `npx tsc --noEmit` (clean), `npm run lint` (only the one known deferred `use-prefers-reduced-motion.ts:23` error), a fresh `rm -rf .next && npm run build` (clean production build) and `npm run test:build` (7/7 pass) — all of which are port-independent and passed cleanly. Once port 3000 was confirmed free (`lsof -i :3000` returned nothing), a final `npx playwright test` ran cleanly against this worktree's own server: **71/71 passed**, including the three `javaScriptEnabled: false` not-found assertions and every new A2/A3 test. This full-suite pass was also reproduced twice earlier in the session (14 tests, 17 tests, 23 tests, and a prior full 71-test run) before the sibling agent's server came up, with identical results each time.

**Recommendation for the orchestrator:** once this worktree merges into a single branch, a final `npm run test:all` re-run there will be free of parallel-execution port contention and is the cleanest final confirmation.

## Verification

- `npx tsc --noEmit` — exits 0.
- `npx playwright test` — 71/71 passed (full suite, run cleanly against this worktree's own server after confirming port 3000 was uncontended).
- `npm run test:unit` — 46/46 pass.
- `npm run lint` — exactly the one known pre-existing error (`use-prefers-reduced-motion.ts:23`, deferred); zero new errors.
- `rm -rf .next && npm run build` — clean production build, all 7 routes prerender.
- `npm run test:build` — 7/7 pass, including the drafts-excluded-from-production assertion.
- `git grep -n 'className="text-label"' app components` — every remaining hit is a legitimate non-link use (the index kicker `<h1>`, `/type`'s specimen `<p>` labels, `PostMeta`'s `<p>`) — no back-link or switch-link site left bare.
- CR-01 untouched: no middleware, no `dynamicParams = false`, no `headers()` added to any not-found boundary; `tests/writing-not-found.spec.ts`'s existing `javaScriptEnabled: false` assertions for the three server-rendering paths are unmodified and still pass, and no such assertion was added for the two CR-01-affected paths.

## Known Stubs

None introduced by this plan.

## Threat Flags

None — every threat register entry in the plan's `<threat_model>` (T-03-16 through T-03-20, T-03-SC) was addressed exactly as specified: no npm install occurred, `hrefLang="en"` is a disclosed crossing not a data leak, and every focus-visible/target-size mitigation was verified via the extended specs.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`/writing` and `/texte` now have a route back to `/`, and every non-prose link on the shipped site (`/writing`, `/texte`, both `[slug]` templates, all three not-found boundaries, `LanguageSwitch`) carries the accent hover/focus/focus-visible contract. This closes both A2 and A3 for the phase's remaining plans. No blockers for 03-06 through 03-09.

**Carried forward, per the UI-SPEC's phase-completion checklist (unchanged by this plan):** `HOME-01` remains outstanding (`POSITIONING_PLACEHOLDER = "Developer."` in `lib/work.ts`), and CR-01 (localised `[slug]` 404s not server-rendering without JS) remains open and deferred to Phase 6. Neither is this plan's job; both must stay visible in subsequent phases' carried-forward state.

---
*Phase: 03-work-list-landing-skeleton*
*Completed: 2026-08-31*

## Self-Check: PASSED

- FOUND: app/(en)/writing/page.tsx
- FOUND: app/(de)/texte/page.tsx
- FOUND: app/(en)/writing/[slug]/page.tsx
- FOUND: app/(de)/texte/[slug]/page.tsx
- FOUND: app/(en)/writing/not-found.tsx
- FOUND: app/(de)/texte/not-found.tsx
- FOUND: app/not-found.tsx
- FOUND: components/language-switch.tsx
- FOUND: tests/writing-index.spec.ts
- FOUND: tests/writing-not-found.spec.ts
- FOUND: tests/writing-routing.spec.ts
- FOUND commit: 4b5b2fb (feat: A2 back links + A3 headline links)
- FOUND commit: cc9118f (feat: A3 remaining six link sites)
- FOUND commit: 8cc9a5d (test: A2/A3 spec coverage)
