---
phase: 03-work-list-landing-skeleton
plan: 06
subsystem: testing
tags: [playwright, integration-testing, accessibility, wcag]

# Dependency graph
requires:
  - phase: 03-work-list-landing-skeleton
    provides: "03-03: app/(en)/page.tsx (de-clienting, metadata, section composition) and components/landing/contents-nav.tsx, work-list.tsx, featured-slot.tsx, section-stub.tsx — the rendered contract this plan gates"
provides:
  - "tests/landing.spec.ts: 21 Playwright tests gating HOME-01, HOME-03, HOME-04, WORK-01, WORK-02 and the CASE-03 slot's state-agnostic structure against npm run dev"
affects: [03-07, 03-08, 03-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "State-agnostic integration assertions for content that is derived from the pipeline (findBySlug -> PostEntry | null): assert only what is true in every state (roles, counts, order), never the copy that differs between dev-with-drafts and production"
    - "Host-label correctness proven by in-browser derived-equality (new URL(link.href).hostname) against the row's own anchor, rather than a second hardcoded copy of the expected string"
    - "Playwright's shadow-DOM-piercing locator surfaces Next.js's own dev-mode overlay (a <button> inside a <nextjs-portal> shadow root) as a false positive on unscoped element-count assertions — scope such assertions to <main> to test only markup this phase controls"

key-files:
  created:
    - tests/landing.spec.ts
  modified: []

key-decisions:
  - "Split the single 461-line spec file into three staged commits matching the plan's task boundaries (tests a-g, then h-o, then p-u) rather than one commit for the whole file, so each task's automated verify command (`npx playwright test tests/landing.spec.ts`) has a real, isolated commit to point at — the plan targets one file across all three tasks, so per-task atomicity required reconstructing incremental versions rather than per-file staging"
  - "Scoped the no-card-idiom button assertion to `page.locator(\"main button\")` instead of the plan's literal `page.locator(\"button\")`, after discovering Next.js's dev-mode \"Open Next.js Dev Tools\" indicator renders a real <button> inside a <nextjs-portal> shadow root on every dev-server route — Playwright's locator pierces shadow DOM and counted it, while a plain `document.querySelector` (and any production build) does not see it. Scoping to <main> keeps the assertion testing this phase's own markup rather than the dev server's own tooling."
  - "Reworded the header comment for test (p) to paraphrase the featured slot's interim copy strings instead of quoting them, after grep -c 'On the Mallorca piece' returned 1 against the file's own explanatory comment — the acceptance criteria's banned-literal check scans the whole raw file including comments, the same trap 03-03/03-04/03-05 already documented and fixed for their own banned-string checks"

patterns-established:
  - "For a plan whose every task targets one shared new file, commit the file in staged reconstructions matching task boundaries (not per-file staging) to preserve genuine per-task atomicity and a bisectable history"

requirements-completed: [WORK-01, WORK-02, HOME-01, HOME-03, HOME-04]

# Metrics
duration: 24min
completed: 2026-08-31
---

# Phase 3 Plan 6: tests/landing.spec.ts — the Landing View's Integration Gate Summary

**21 new Playwright tests in `tests/landing.spec.ts`, all reading computed values from a real `npm run dev` render, gate `HOME-01/03/04`, `WORK-01/02` and the `CASE-03` featured-slot structure — including the one-source equality between the rendered positioning `<p>` and `meta[name="description"]`, and a state-agnostic featured-slot assertion that will still pass once Phase 4 publishes the case study.**

## Performance

- **Duration:** 24 min
- **Started:** 2026-08-31T11:47:00Z
- **Completed:** 2026-08-31T12:11:00Z
- **Tasks:** 3/3
- **Files modified:** 1 (created)

## Accomplishments
- `tests/landing.spec.ts` created with 21 tests spanning three groups matching the plan's tasks: the navigation surface + positioning sentence (a–g), the work list's structure/destinations/non-card treatment (h–o), and the featured slot's state-agnostic structure + heading outline + no-placeholder-words rule (p–u)
- Every measured value is read from a real render rather than assumed: nav-link target-size heights, `scroll-margin-top`, the work-list separator's `borderTopColor: rgba(0, 0, 0, 0.12)` vs. the section-head's `borderBottomColor: rgb(0, 0, 0)`, and the host label's `new URL(href).hostname` derived-equality
- Test (g) proves the one-source property by equality (`meta[name="description"]` content === the rendered positioning `<p>`'s trimmed text) rather than a literal string — passes today with the placeholder and keeps passing when the real sentence lands
- Test (p) asserts the `CASE-03` slot structurally (one `h2.section-head`, one `h3.text-heading` inside `section#case-study`) with zero dependence on which of the two derived states (`null` interim vs. `PostEntry` published) is currently rendered
- Full `npx playwright test` suite: 99/99 passing (78 pre-existing + 21 new); `npm run test:unit`: 47/47; `npx tsc --noEmit`: clean; `npm run lint`: exactly the one known deferred error (`use-prefers-reduced-motion.ts:23`)
- Two negative checks performed by hand and reverted, confirming the assertions actually gate what they claim: dropping `py-xs` from a nav link fails test (b) (measured height 18.1875px); dropping `border-rule` from the work list's second row fails test (n) with a computed colour of `rgb(0, 0, 0)` (the exact WR-06/Pitfall 1 defect)

## Task Commits

Each task was committed atomically. All three tasks target the same new file (`tests/landing.spec.ts`), so each commit is a staged reconstruction of the file up to that task's boundary rather than a per-file diff — see Decisions Made.

1. **Task 1: Scaffold tests/landing.spec.ts and assert HOME-03/HOME-01** - `8d64f56` (test)
2. **Task 2: Assert WORK-01, WORK-02 and HOME-04** - `414de3e` (test)
3. **Task 3: Assert the CASE-03 slot structure, heading outline, no-placeholder-words** - `8fbca81` (test)

_No plan-metadata commit — the orchestrator commits STATE.md/ROADMAP.md after the wave completes, per parallel-executor instructions._

## Files Created/Modified
- `tests/landing.spec.ts` - New. 21 tests, 3 test groups matching the plan's task boundaries, 461 lines

## Decisions Made
- Split the file into three staged commits (a–g, then h–o, then p–u) so each task lands as a real, verifiable, atomic commit rather than one commit covering all three tasks' acceptance criteria at once — each stage was independently type-checked and run against `npx playwright test tests/landing.spec.ts` before its commit
- Scoped the `(t)` no-card-idiom button assertion to `main button` rather than the plan's literal `page.locator("button")`, after the unscoped version failed against a real Next.js dev-mode artifact (see Deviations)
- Reworded test (p)'s explanatory comment to paraphrase the featured slot's interim copy instead of quoting it literally, after discovering the comment itself tripped the plan's own `grep -c` acceptance check

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test (t)'s unscoped `page.locator("button")` assertion failed against a Next.js dev-mode framework artifact, not against this phase's markup**
- **Found during:** Task 3, first run of `npx playwright test tests/landing.spec.ts`
- **Issue:** `expect(page.locator("button")).toHaveCount(0)` (the plan's literal text) failed with 1 button found. Investigation (a standalone Playwright script comparing `page.locator("button")` against `document.querySelector("button")`, plus a shadow-root walk) confirmed the element is Next.js's own "Open Next.js Dev Tools" indicator (`id="next-logo"`, `aria-label="Open Next.js Dev Tools"`), rendered inside a `<nextjs-portal>` custom element with an open shadow root appended to `<body>` on every route in dev mode. Playwright's locator engine pierces open shadow roots by design; a plain DOM `querySelector` does not, and the element does not exist at all in a production build. This is a dev-server tooling artifact present on literally every route of every Next.js app in dev mode, not something this phase's components render.
- **Fix:** Scoped the assertion to `page.locator("main button")`, matching how the plan's own `img`/`svg` checks are already scoped (`main svg`). This asserts what the phase's own markup contains rather than what the dev server's tooling injects into `<body>`.
- **Files modified:** `tests/landing.spec.ts`
- **Verification:** Re-ran `npx playwright test tests/landing.spec.ts` — 21/21 passing; confirmed via a standalone script that the dev-tools button sits inside `<nextjs-portal>`'s shadow root, outside `<main>`.
- **Committed in:** `8fbca81` (Task 3 commit — fixed before commit, not a separate commit)

**2. [Rule 1 - Bug] Test (p)'s own explanatory comment tripped the plan's `grep -c 'On the Mallorca piece'` acceptance check**
- **Found during:** Task 3, acceptance-criteria verification
- **Issue:** The plan's action text instructs commenting exactly which interim strings are deliberately NOT asserted, naming them literally ("The case study is being written." / "On the Mallorca piece: ..."). But the plan's own acceptance criteria greps the whole raw file for those same literals to prove no copy assertion crept in — and a comment naming them literally trips that same grep, even though it names them only to explain their absence. `grep -c 'On the Mallorca piece' tests/landing.spec.ts` returned 1 against my first draft's comment (the other string escaped detection only by accident, having wrapped across a line break). This is the identical trap 03-03, 03-04 and 03-05 each independently documented for their own banned-literal verify scripts.
- **Fix:** Reworded the comment to paraphrase ("the interim heading sentence", "the interim body paragraph's wording") without quoting either string. Intent — explaining why no copy assertion exists — is preserved.
- **Files modified:** `tests/landing.spec.ts`
- **Verification:** `grep -c 'The case study is being written' tests/landing.spec.ts` and `grep -c 'On the Mallorca piece' tests/landing.spec.ts` both return 0; `npx playwright test tests/landing.spec.ts` still 21/21 passing.
- **Committed in:** `8fbca81` (Task 3 commit — fixed before commit, not a separate commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — bugs surfaced by the plan's own acceptance criteria and a real dev-server artifact, both fixed before their respective task commits)
**Impact on plan:** Neither changes the assertions' intent or coverage — one narrows an element-count query to exclude a framework artifact outside this phase's control, the other rewords a comment. No scope creep, no weakening of any assertion.

## Issues Encountered

**Port 3000 ownership verification.** Per the parallel-execution warning in this plan's context, checked `lsof -ti:3000` before trusting any Playwright result and confirmed via `curl localhost:3000/cv` (a route only this worktree has, shipped in sibling plan 03-04) that the server on port 3000 was this worktree's own throughout the session. No cross-worktree contamination occurred.

## Verification

- `npx tsc --noEmit` — exits 0.
- `npx playwright test tests/landing.spec.ts` — 21/21 passing.
- `npx playwright test` (full suite) — 99/99 passing.
- `npm run test:unit` — 47/47 passing.
- `npm run lint` — exactly the one known pre-existing error (`use-prefers-reduced-motion.ts:23`, deferred); zero new errors.
- `grep -c "^import" tests/landing.spec.ts` — returns 1 (only `@playwright/test`).
- `grep -c 'The case study is being written'` / `grep -c 'On the Mallorca piece'` — both 0.
- `grep -n "Developer\."` — one hit, inside a comment explaining the one-source property (not a hardcoded assertion value).
- `grep -n "test.only\|test.skip\|--watch"` — none found.
- Negative checks (performed by hand, reverted, confirmed clean afterward via `git diff --stat`): removing `py-xs` from a nav link fails test (b); removing `border-rule` from the work list's second `<li>` fails test (n) with `borderTopColor: rgb(0, 0, 0)`.

## Known Stubs

None introduced by this plan. This plan adds test coverage only; it does not touch any component or route.

## Threat Flags

None — this plan adds one Playwright spec file exercising already-shipped Server Components against `npm run dev` on localhost. No new network surface, no new route, no new dependency. The threat model's T-03-21 through T-03-24 mitigations (private-repo leak, placeholder-word leak, reverse-tabnabbing, test-integrity for the state-agnostic slot assertion) are all directly implemented as tests (j), (s), (i) and (p) respectively.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`tests/landing.spec.ts` closes the largest Wave 0 gap named in `03-VALIDATION.md`'s requirement→test map: all `HOME-01`, `HOME-03`, `HOME-04`, `WORK-01`, `WORK-02` and `CASE-03 slot`-structure rows that name this file now have a passing assertion. The featured slot's assertions are proven state-agnostic by construction (test (p) asserts only role/count/order, never copy), so Plan 03-08's build-tier test can safely add the literal interim-copy assertion in `tests/build/prerender.test.ts` without this file needing to change when Phase 4 later publishes the case study. No blockers for 03-07 (the sibling viewport/trail/reduced-motion spec files), 03-08 (build-tier extension) or 03-09.

**Carried forward, per the UI-SPEC's phase-completion checklist (unchanged by this plan):** `HOME-01` remains outstanding (`POSITIONING_PLACEHOLDER = "Developer."` in `lib/work.ts`) — this plan's test (g) is specifically designed to keep passing once the user's real sentence replaces it, and must not itself become stale. The two `WORK-02` annotations remain drafts (D-09). The featured slot, backlog stub and contact stub remain in their interim state, covered by the launch gate.

## Self-Check: PASSED

- FOUND: tests/landing.spec.ts
- FOUND commit: 8d64f56
- FOUND commit: 414de3e
- FOUND commit: 8fbca81

---
*Phase: 03-work-list-landing-skeleton*
*Completed: 2026-08-31*
