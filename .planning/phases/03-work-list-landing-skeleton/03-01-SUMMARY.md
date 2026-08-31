---
phase: 03-work-list-landing-skeleton
plan: 01
subsystem: data
tags: [typescript, next.js, node-test, i18n]

# Dependency graph
requires: []
provides:
  - "lib/work.ts: WorkEntry type, WORK tuple, CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER"
  - "tests/unit/work.test.ts: structural + editorial data gate for the work list"
  - "SmearTitle as? widened to h1 | h2 | h3"
  - "lib/locales.ts homeLink key (UI.en / UI.de)"
affects: [03-02, 03-03, 03-04, 03-05, 03-06, 03-07, 03-08, 03-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Data modules (lib/work.ts) follow lib/locales.ts's shape: file comment, exported type, exported const(s), no imports when the data is fully static"
    - "Editorial correctness (banned-tool-word list) gated by an executable node:test spec, not just a docs convention"

key-files:
  created:
    - lib/work.ts
    - tests/unit/work.test.ts
  modified:
    - components/smear-title.tsx
    - lib/locales.ts
    - tests/unit/dates.test.ts

key-decisions:
  - "WorkEntry is exported (unlike UiCopy) because landing components need it as a props type"
  - "CASE_STUDY_SLUG and POSITIONING_PLACEHOLDER ship as named constants with source-only doc comments so HOME-01 stays a one-line edit and never renders a visible placeholder marker"

patterns-established:
  - "New data-only lib/*.ts modules carry zero imports when their content is fully static, matching lib/work.ts"

requirements-completed: [WORK-01, WORK-02, HOME-01]

# Metrics
duration: 8min
completed: 2026-08-31
---

# Phase 3 Plan 1: Work-List Data Layer & Primitive Amendments Summary

**`lib/work.ts` ships the two-entry work-list tuple, the locked case-study slug and the source-marked `HOME-01` placeholder, with `SmearTitle` widened to `h3` and `lib/locales.ts` gaining a shared `homeLink` string for both locales.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-31T13:24:00+02:00 (approx.)
- **Completed:** 2026-08-31T13:27:27+02:00
- **Tasks:** 3
- **Files modified:** 5 (2 created, 3 amended)

## Accomplishments
- `lib/work.ts` created: `WorkEntry` type, the `WORK` two-tuple (Mallorca GDP piece + Watch People Die Live), `CASE_STUDY_SLUG`, `POSITIONING_PLACEHOLDER` — no imports, no boolean flags, no private-repo reference
- `tests/unit/work.test.ts` created: 8 tests covering tuple shape, https-absolute + host/href agreement, private-repo absence, single-line annotations, the WORK-02 banned-tool-word gate, `CASE_STUDY_SLUG`'s `SAFE_SLUG` shape, and the placeholder's rendered-marker-word absence
- `SmearTitle`'s `as` union widened from `"h1" | "h2"` to `"h1" | "h2" | "h3"` — one line, `components/smear-heading/` untouched
- `lib/locales.ts` gained `homeLink` (`"← Guillem Gelabert"`, identical in both locales) in `UiCopy` and both `UI.en`/`UI.de` entries
- `tests/unit/dates.test.ts` grown to assert all ten copy keys (was nine), including `homeLink`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create lib/work.ts** - `5f12d8b` (feat)
2. **Task 2: Create tests/unit/work.test.ts** - `1c7f538` (test)
3. **Task 3: Widen SmearTitle to h3, add homeLink, grow dates.test.ts key list** - `f300bb6` (feat)

_No plan-metadata commit yet — SUMMARY.md is committed as part of this same execution, per parallel-executor instructions (STATE.md/ROADMAP.md are owned by the orchestrator)._

## Files Created/Modified
- `lib/work.ts` - WorkEntry type, WORK tuple, CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER
- `tests/unit/work.test.ts` - WORK-01/WORK-02/D-05 data gate, 8 tests
- `components/smear-title.tsx` - `as` union widened to include `"h3"` (line 6 only)
- `lib/locales.ts` - `homeLink: string` added to `UiCopy`, and to both `UI.en`/`UI.de`
- `tests/unit/dates.test.ts` - key list grown to ten, title updated to "all ten copy keys"

## Decisions Made
None beyond the plan's own drafted choices — plan executed as specified. `WorkEntry`'s export status and the doc-comment registers for `CASE_STUDY_SLUG`/`POSITIONING_PLACEHOLDER` were pre-decided in the plan and followed verbatim.

## Deviations from Plan

None - plan executed exactly as written. All three tasks matched their `<action>` blocks; no bugs, missing functionality, blockers, or architectural questions surfaced.

## Issues Encountered

None. The worktree required `npm ci` before any build/test tooling was available (per the parallel-executor setup note) — not a deviation, an expected first step in a fresh worktree.

**Spot-check performed and reverted (per Task 2 acceptance criteria):** temporarily mutated `WORK[0].annotation` to include "React", confirmed `node --test tests/unit/work.test.ts` reported test 6 (`no annotation names a tool...`) as failing, then reverted via a scratchpad backup. `git diff --stat lib/work.ts` confirmed a clean revert before the Task 2 commit; the mutation was never staged or committed.

## Verification

- `npx tsc --noEmit` — exits 0.
- `npm run test:unit` — 38/38 tests pass across `content.test.ts`, `dates.test.ts`, `prose-contract.test.ts`, `work.test.ts`.
- `npm run lint` — exactly the one known pre-existing error in `components/smear-heading/use-prefers-reduced-motion.ts:23` (deferred Phase 1 item); zero new errors.
- `git diff --stat HEAD -- components/smear-heading/` — empty; the smear system itself is untouched.
- `git grep -n 'Developer\.'` currently returns `app/(en)/layout.tsx:12`, `app/(en)/page.tsx:13`, and `lib/work.ts:55` — three hits, not the plan's eventual two. **This is expected at this point in the phase**: the plan's `<verification>` block describes the phase's end state, and removing the rendered `<p>` in `app/(en)/page.tsx` is explicitly Plan 03's job (03-03-PLAN.md), not this plan's. `lib/work.ts` is now the single English *statement* of the positioning sentence (its source-of-truth constant); the still-rendered `<p>` in `app/(en)/page.tsx` is Phase 1's original holding-page copy, unchanged until Plan 03 replaces that page per Amendment A1.

## Known Stubs

None introduced by this plan. `POSITIONING_PLACEHOLDER = "Developer."` is a deliberate, source-marked placeholder per `D-08`/`D-02` — not a stub in the "missing wiring" sense. It is HOME-01, tracked as deferred-by-decision per the UI-SPEC's phase-completion checklist, and is not this plan's job to resolve.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`lib/work.ts`, the widened `SmearTitle`, and `lib/locales.ts`'s `homeLink` are all committed and ready for Plans 03, 04 and 05 (all three depend on this plan's exports per the plan's `<interfaces>` contract). No blockers.

**Carried forward, per the UI-SPEC's phase-completion checklist:** `HOME-01` remains outstanding, shipping as `POSITIONING_PLACEHOLDER = "Developer."` in `lib/work.ts:55`, marked in source and invisible on screen. This must be re-asserted at the top of every subsequent phase's carried-forward state until the user supplies the real sentence, and must not reach Phase 6's `FIND-02` robots flag flip.

---
*Phase: 03-work-list-landing-skeleton*
*Completed: 2026-08-31*
