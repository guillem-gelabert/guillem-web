---
phase: 03-work-list-landing-skeleton
plan: 02
subsystem: ui
tags: [css, tailwind, node-test, accessibility, design-system]

# Dependency graph
requires:
  - phase: 02-content-pipeline
    provides: "app/globals.css's Prose Contract, its type/spacing/colour @theme tokens, and the tests/unit/prose-contract.test.ts brace-depth-aware CSS parser this plan extracts and reuses"
provides:
  - "app/globals.css: .section-head, .link, .link-quiet — the three CSS classes every Phase 3 markup plan (03-03 onward) depends on for non-prose link and section-head styling"
  - "tests/unit/css-source.ts: the shared, nesting-aware globals.css parser, exported for reuse by any future CSS-contract test"
  - "tests/unit/link-contract.test.ts: the executable source-fact gate over the link/section-head budget; Plan 03-03 appends a second remit to this same file (the amendment-A1 source-fact check)"
affects: [03-03, 03-04, 03-05, 03-06, 03-07, 03-08, 03-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared CSS-contract parser module (tests/unit/css-source.ts), imported by multiple node --test suites instead of each suite re-deriving its own brace-depth-aware extractor"
    - "Text-range assertion (not selector-based) for verifying an at-rule's nested content, because the parser treats @-rules as containers, not scopes"

key-files:
  created:
    - tests/unit/css-source.ts
    - tests/unit/link-contract.test.ts
  modified:
    - tests/unit/prose-contract.test.ts
    - app/globals.css

key-decisions:
  - "Extracted the CSS parser verbatim rather than re-deriving it, preserving the WR-13 nesting fix and the semicolon-in-value fix byte-for-byte"
  - "Named the shared helper tests/unit/css-source.ts (no .test segment) so npm run test:unit's *.test.ts glob does not execute it as a zero-test suite"
  - ".link-quiet carries no rest-state underline (WCAG 1.4.1 does not apply outside a block of text); the hover/focus state restores it so the affordance is never colour-only"
  - "Rule-weight budget enforced by regex over border(-*)? and outline(-width)? properties: any px length must be 1px or 2px, and must carry a var(--color-*) colour component, closing the WR-06/Pitfall 1 bare-border-falls-through-to-currentColor failure mode"

patterns-established:
  - "A node --test CSS-contract suite must assert reduced-motion gating by TEXT RANGE (summing transition occurrences inside every @media (prefers-reduced-motion: no-preference) block's body and comparing to the total count in the file), never by selector, because the parser's at-rule-as-container model does not qualify nested selectors with the at-rule"

requirements-completed: [HOME-03, HOME-04]

# Metrics
duration: 10min
completed: 2026-08-31
---

# Phase 3 Plan 2: Link and Section-Head CSS Contract Summary

**Added `.section-head`, `.link` and `.link-quiet` to `app/globals.css` — every declaration copied from a value already shipped — plus an 8-test `node --test` gate (`tests/unit/link-contract.test.ts`) that fails in well under a second on a literal hex, a fourth rule weight, an ungated transition, a missing hover underline or a removed focus outline.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-08-31T11:30:41Z
- **Tasks:** 3/3
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- Extracted the nesting-aware `app/globals.css` parser (`extractBlocks`, `ownDeclarationText`, `splitDeclarations`, `declarationsOf`, `valuesOf`, plus the derived `css`/`allBlocks`/`allSelectors` constants) out of `prose-contract.test.ts` into a shared, non-`*.test.ts` module (`tests/unit/css-source.ts`) — zero assertion changes, all 12 prose-contract tests stayed green
- Shipped `.section-head` (Label role + 1px full-ink rule, minus prose margins), `.link` (verbatim `.prose-site a`), and `.link-quiet` (no rest underline, restored on hover/focus) — purely additive to `app/globals.css`, `@theme` and both `clamp()` curves untouched
- Wrote `tests/unit/link-contract.test.ts`: 8 tests enforcing selector presence, the type budget, no literal colour, no fourth rule weight (with the WR-06/Pitfall-1 "bare border falls through to currentColor" check), `.link-quiet`'s rest/hover underline symmetry, the focus-visible outline, reduced-motion transition gating (by text range, not selector), and the `!important`/`clamp()` invariants
- Hand-verified three negative cases and reverted them: a transition moved outside the reduced-motion media query fails test (g); a literal `#C1272D` in `.link:hover` fails test (c); a bare `border-bottom: 1px` on `.section-head` fails test (d)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract the globals.css parser into tests/unit/css-source.ts and rewire prose-contract.test.ts** - `4df118f` (refactor)
2. **Task 2: Append .section-head, .link and .link-quiet to app/globals.css** - `1a66a39` (feat)
3. **Task 3: Write tests/unit/link-contract.test.ts and extend prose-contract's required-selector list** - `a9ffde0` (test)

_No plan-metadata commit — the orchestrator commits STATE.md/ROADMAP.md after the wave completes._

## Files Created/Modified
- `tests/unit/css-source.ts` - New. The shared, nesting-aware globals.css parser (extracted verbatim from prose-contract.test.ts), exports `css`, `allBlocks`, `allSelectors`, `Block`, `extractBlocks`, `ownDeclarationText`, `splitDeclarations`, `declarationsOf`, `valuesOf`
- `tests/unit/prose-contract.test.ts` - Modified. Deleted the moved parser code, imports it from `./css-source.ts` instead; test (f)'s required-selector array extended with `.section-head`, `.link`, `.link-quiet`
- `app/globals.css` - Modified. Appended `.section-head`, `.link`, `.link-quiet` and their hover/focus-visible/reduced-motion rules after `.text-standfirst`, before `body`
- `tests/unit/link-contract.test.ts` - New. 8-test source-fact gate over the three new classes; header comment records that Plan 03-03 appends a second remit (the amendment-A1 `app/(en)/page.tsx` source-fact check) to this same file

## Decisions Made
- Followed the plan's interface contract exactly for `css-source.ts`'s exports; `CSS_PATH` and `rawCss` stayed module-local as specified
- Implemented test (d)'s "no fourth rule weight" check as a single regex-driven loop over every `border*`/`outline*` declaration in `linkBlocks`, rather than hand-listing the two known declarations (`.section-head`'s `border-bottom` and the shared `:focus-visible` `outline`) — this keeps the gate correct if a future edit adds another border/outline declaration to the same three classes
- Test (g)'s reduced-motion assertion sums `transition` occurrences inside every `@media (prefers-reduced-motion: no-preference)` block's body text and compares against the total count in the whole file, per the plan's explicit guidance that the parser cannot answer "is this inside the media query?" from a block's selector alone

## Deviations from Plan

None - plan executed exactly as written. The three negative-check mutations described in Task 3's acceptance criteria were performed by hand against a scratchpad backup of `app/globals.css` and fully reverted before the Task 3 commit; `git diff` confirmed `app/globals.css` was byte-identical to its Task 2 state before staging.

## Issues Encountered

The worktree's merge-base against the expected phase-start commit (`a3a152449d3eebecf52fd036fd43c4262b8b35b7`) did not match on startup — the worktree had forked from a stale point five commits ahead (ending at `df4a372`, a Phase 6/CR-01 planning-doc commit unrelated to this plan). Corrected via `git reset --hard a3a152449d3eebecf52fd036fd43c4262b8b35b7` per the worktree branch check protocol, confirmed via `git rev-parse HEAD`, then proceeded. No project files were affected — the stale commits were all `.planning/` documentation on top of the correct base, and are still present on `master`/other branches; this worktree branch simply now starts clean from the intended base.

## Next Phase Readiness
- `.section-head`, `.link` and `.link-quiet` are shipped and gated — every downstream Phase 3 plan (03-03 through 03-09) that renders a section head, a work-list title link, a contents-nav item, a back link or the language switch can apply these classes with the accessibility contract (focus-visible outline, reduced-motion-safe transitions) already proven
- `tests/unit/css-source.ts` is available for Plan 03-03's second remit on `tests/unit/link-contract.test.ts` (the amendment-A1 source-fact check) without re-deriving any parser
- No blockers. `npm run test:unit` (38 tests, 0 failures), `npx tsc --noEmit` (exit 0) and `npm run lint` (only the pre-existing deferred `use-prefers-reduced-motion.ts:23` error) all pass at plan completion

## Self-Check: PASSED

- FOUND: tests/unit/css-source.ts
- FOUND: tests/unit/link-contract.test.ts
- FOUND: tests/unit/prose-contract.test.ts (modified)
- FOUND: app/globals.css (modified)
- FOUND commit: 4df118f
- FOUND commit: 1a66a39
- FOUND commit: a9ffde0

---
*Phase: 03-work-list-landing-skeleton*
*Completed: 2026-08-31*
