---
phase: 03-work-list-landing-skeleton
plan: 08
subsystem: testing
tags: [node-test, production-build, metadata, seo, accessibility]

# Dependency graph
requires:
  - phase: 03-work-list-landing-skeleton
    provides: "03-03 through 03-07: the shipped landing view, /cv, the CSS/link amendments, and every Playwright spec gating the dev-server half of the phase's requirements — this plan gates the production-build half those specs structurally cannot reach"
provides:
  - "tests/build/prerender.test.ts: 8 new production-tier tests asserting /'s canonical, the POSITIONING_PLACEHOLDER-bound meta description, the inherited noindex on / and /cv, /cv's own title/canonical, the interim featured-slot copy with no link in its h3, the stub copy with no leaked marker word, the private-repo rule, and a single launch-gate test recording all interim surfaces"
  - ".planning/phases/03-work-list-landing-skeleton/deferred-items.md: the HOME-01 tripwire (first, named as such), the two WORK-02 drafts, the four launch-gated interim surfaces, SmearTitle's h3 widening (done), the two 03-RESEARCH.md corrections to the UI-SPEC, and the carried CR-01 note"
  - ".planning/STATE.md: Deferred Items table populated (HOME-01, WORK-02, the four interim surfaces, CR-01), a Blockers/Concerns entry naming the HOME-01 tripwire, and three new Phase 3 decisions"
affects: [03-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Production-tier assertions live in tests/build/prerender.test.ts and read real HTML from .next/server/app; any assertion whose result depends on draft visibility (the featured slot's derived state) belongs there, never in Playwright, which always runs against npm run dev where showDrafts() is true"
    - "Binding two consumption sites of one source constant (POSITIONING_PLACEHOLDER) by equality rather than by literal string, so the assertion keeps passing when the real value lands and fails only if the two sites drift apart"
    - "A single named launch-gate test records the current interim state of multiple surfaces at once, so the test that has to change when a later phase fills one of them is the place the gate gets noticed rather than silently going stale"

key-files:
  created:
    - .planning/phases/03-work-list-landing-skeleton/deferred-items.md
  modified:
    - tests/build/prerender.test.ts
    - .planning/STATE.md

key-decisions:
  - "Reworded the meta-description test's explanatory comment to avoid the literal quoted string \"Developer.\" — the plan's own acceptance criterion (`grep -c '\"Developer\\.\"' tests/build/prerender.test.ts` returns 0) bans exactly that quoted form anywhere in the file, comments included, the same comment-literal-ban trap 03-03 through 03-07 each independently documented for their own verify scripts"
  - "Did not push to Railway or run the live-origin smoke checks the plan's Task 2 specifies. The orchestrator's execution_notes for this run explicitly state it handles git push and deploy verification after merging worktrees, and that pushing from inside a worktree would bypass the merge. All locally-verifiable gates in Task 2 (tsc, unit, clean build, build tier, full Playwright, lint) were run and are green; the live-origin checks (deploy-smoke against PLAYWRIGHT_BASE_URL, live /cv 200, live canonical, live noindex) are the orchestrator's step to perform post-merge, per direct instruction overriding the plan's literal text"

patterns-established: []

requirements-completed: [WORK-01, WORK-02, HOME-01, HOME-03, HOME-04]

# Metrics
duration: ~20min
completed: 2026-08-31
---

# Phase 3 Plan 8: Production-Tier Assertions, the Clean-Build Gate, and the HOME-01 Tripwire Summary

**`tests/build/prerender.test.ts` gained 8 tests reading real `.next/server/app` HTML to prove what Phase 3 actually ships in production — `/`'s new canonical, the one-source `POSITIONING_PLACEHOLDER` description, the inherited `noindex` on both new routes, `/cv`'s own metadata, and the interim state of all four launch-gated surfaces — and the `HOME-01` tripwire is now written into `deferred-items.md` and `STATE.md` where every subsequent phase reads it.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-08-31T14:21:43+02:00 (worktree base reset)
- **Completed:** 2026-08-31T14:30:00+02:00 (approx.)
- **Tasks:** 3/3
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- `tests/build/prerender.test.ts` extended with 8 new tests plus one extension to the existing route-key test (now asserting `""`, `"type"` and `"cv"`), all reading real prerendered HTML rather than dev-server output — verified against a clean `rm -rf .next && npm run build`
- Confirmed by direct inspection of the built HTML before writing assertions: `/`'s canonical resolves to pathname `/` (`https://web-production-9cedb.up.railway.app`), `/cv`'s resolves to `/cv`; `/`'s meta description is exactly `Developer.` (the current `POSITIONING_PLACEHOLDER` value); both routes carry `<meta name="robots" content="noindex"/>`; the featured slot renders its interim `<h3 class="text-heading">` with no `<a` inside it; all four stub/interim copy strings are present; no `ib-gdp-evolution`, no `github.com` href, no `target="_blank"` anywhere on `/`
- Full phase gate run clean: `npx tsc --noEmit` (0), `npm run test:unit` (47/47), `rm -rf .next && npm run build` (route table lists `○ /` and `○ /cv`, both static), `npm run test:build` (16/16), `npx playwright test` (117/117), `npm run lint` (exactly the one known deferred `use-prefers-reduced-motion.ts:23` error, zero new), `git diff --stat HEAD -- components/smear-heading/` empty
- `.planning/phases/03-work-list-landing-skeleton/deferred-items.md` created with the `HOME-01` tripwire first and named as such, the two `WORK-02` drafts quoted verbatim, the four launch-gated interim surfaces, `SmearTitle`'s `h3` widening recorded as done, both `03-RESEARCH.md` corrections to the UI-SPEC (including that Phase 6's photograph reserves space for `BUILD-06`, not trail correctness), and the carried CR-01 note
- `.planning/STATE.md` Deferred Items table populated (previously a single placeholder row), a `HOME-01` tripwire entry added to Blockers/Concerns, and three Phase 3 decisions recorded (English-only landing, derived featured-slot state, the A3 scope extension to `app/not-found.tsx` and both `[slug]` templates)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend tests/build/prerender.test.ts with the production-tier assertions for / and /cv** - `c8bfc17` (test)
2. **Task 2: Run the clean-build phase gate** - no commit (gate-running only; writes no application code, per its own action text — see Verification below)
3. **Task 3: Write the phase-completion record and carry the HOME-01 tripwire into STATE.md** - `a4342c4` (docs)

_No separate plan-metadata commit — this SUMMARY.md is committed immediately after this note, per the executor's REQUIRED ORDER._

## Files Created/Modified
- `tests/build/prerender.test.ts` - 8 new tests plus the route-key extension; imports `POSITIONING_PLACEHOLDER` from `../../lib/work.ts`
- `.planning/phases/03-work-list-landing-skeleton/deferred-items.md` - New. The HOME-01 tripwire record plus four other phase-completion entries and the carried CR-01 note
- `.planning/STATE.md` - Deferred Items table, Blockers/Concerns, and three Decisions entries updated

## Decisions Made
- Reworded the meta-description test's comment to avoid the literal quoted string `"Developer."`, which the plan's own acceptance criterion bans anywhere in the file (see Deviations)
- Did not push to Railway or run live-origin checks — the orchestrator's execution_notes for this run take precedence over the plan's Task 2 text on this point (see Deviations)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The meta-description test's own explanatory comment tripped the plan's own acceptance-criteria grep**
- **Found during:** Task 1, immediately after drafting test (b)
- **Issue:** The plan's acceptance criteria state `grep -c '"Developer\."' tests/build/prerender.test.ts` must return 0 — the literal quoted string `"Developer."`, not just the bare word. My first-draft comment explaining Pitfall 6 quoted `"Developer."` with surrounding quote marks to illustrate the failure mode, which matched the banned pattern exactly. This is the identical comment-literal-ban trap 03-03 through 03-07 each independently documented for their own verify scripts.
- **Fix:** Reworded the comment to describe the failure without quoting the placeholder value in quotation marks ("the meta description still holds the old placeholder value" instead of `"Developer."`).
- **Files modified:** `tests/build/prerender.test.ts`
- **Verification:** `/usr/bin/grep -c '"Developer\."' tests/build/prerender.test.ts` returns 0; `npm run test:build` still 16/16.
- **Committed in:** `c8bfc17` (Task 1 commit — fixed before commit, not a separate commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — a bug surfaced by the plan's own acceptance criteria, fixed before commit)
**Impact on plan:** No change to assertion intent or coverage. No scope creep.

### Deviation from the plan's literal Task 2 text (not an auto-fix rule — an explicit spawn-time instruction override)

The plan's Task 2 action instructs pushing to Railway, waiting for the deploy, and running `tests/deploy-smoke.spec.ts` and manual checks against the live origin. This run's `execution_notes` (from the orchestrator that spawned this executor) state explicitly: *"the orchestrator handles `git push` and deploy verification after merging your worktree. Do NOT push from this worktree — it would bypass the merge."* That is a direct spawn-time instruction, which takes precedence over the plan's literal text for this one step. All other Task 2 gates (`tsc`, unit tests, clean build, build-tier tests, full Playwright suite, lint, the `components/smear-heading/` empty-diff check) were run locally and are green — see Verification. The live-origin checks (`/cv` returns 200, `/` carries a canonical, both `/` and `/cv` are noindexed on the live Railway URL) are recorded here as **the orchestrator's step to perform after merge**, not as completed by this plan.

## Issues Encountered

None beyond the one auto-fixed comment-literal trap above. Port 3000 was free and uncontended throughout this session (single executor, per the execution_notes).

## Verification

- `npx tsc --noEmit` — exits 0.
- `npm run test:unit` — 47/47 pass.
- `rm -rf .next && npm run build` — clean; route table lists `○ /` and `○ /cv` as prerendered static routes (run twice during this plan, identical result both times).
- `npm run test:build` — 16/16 pass (7 pre-existing + 8 new + 1 extended route-key test, counted as one of the 16).
- `npx playwright test` — 117/117 pass (full suite, run twice during this plan).
- `npm run lint` — exactly one error, `components/smear-heading/use-prefers-reduced-motion.ts:23` (`react-hooks/set-state-in-effect`), the known Phase 1 deferred item. Zero new errors.
- `git diff --stat HEAD -- components/smear-heading/` — empty.
- `NEXT_PUBLIC_SITE_URL` — neither set nor unset; not touched by this plan or this session.
- `git status --short` — clean at every checkpoint in this plan, including after the final re-verification pass; `next-env.d.ts`'s dev/build type-path toggle self-reverted after the last `next dev`-backed Playwright run and was never committed.
- **Not run (see Deviations above):** live-origin deploy-smoke spec, live `/cv` 200 check, live canonical check, live noindex check. These require a `git push`, which this executor was instructed not to perform.

## Known Stubs

None introduced by this plan. This plan adds test coverage and documentation only; it touches no application component or route. The four interim surfaces it documents (featured slot, backlog stub, contact stub, `/cv`) were all shipped as deliberate, source-marked placeholders by earlier plans in this phase (03-03, 03-04) and are recorded, not newly introduced, here.

## Threat Flags

None. This plan adds test coverage and two documentation files; it introduces no new network surface, no new route, no new dependency, and touches no runtime code path. Every mitigation named in the plan's `<threat_model>` (T-03-30 through T-03-35, T-03-SC) is directly implemented as one of the 8 new tests or as the gate-running discipline in Task 2 (clean `.next`, no `NEXT_PUBLIC_SITE_URL` change).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `tests/build/prerender.test.ts` now closes every `⚠️ extend`-marked row in `03-VALIDATION.md`'s requirement→test map that named it, and the production half of the featured-slot/stub/canonical/noindex/description contract is asserted against real build output, not dev-server output.
- The `HOME-01` tripwire is written into `.planning/phases/03-work-list-landing-skeleton/deferred-items.md` and `.planning/STATE.md` — both files any later phase's planner reads before writing new state. It must be re-asserted at the top of every subsequent phase's carried-forward state and must not reach Phase 6's `FIND-02` robots flip while `POSITIONING_PLACEHOLDER` still holds its current placeholder value.
- **Not this plan's job, carried forward:** the live Railway deploy verification (push, wait, smoke-test, and the three live-origin checks named in the plan's Task 2). The orchestrator performs this after merging this worktree, per its own execution_notes.
- No blockers for 03-09 (the phase's optical sign-off plan).

## Self-Check: PASSED

- FOUND: tests/build/prerender.test.ts (modified)
- FOUND: .planning/phases/03-work-list-landing-skeleton/deferred-items.md
- FOUND: .planning/STATE.md (modified)
- FOUND commit: c8bfc17
- FOUND commit: a4342c4

---
*Phase: 03-work-list-landing-skeleton*
*Completed: 2026-08-31*
