---
phase: 05-backlog
plan: 01
subsystem: ui
tags: [react-server-components, nextjs-app-router, tailwind-v4, content-module, build-time-validation]

# Dependency graph
requires:
  - phase: 03-work-list-landing-skeleton
    provides: "the <section id=\"backlog\"> skeleton, SectionStub, .link/.link-quiet/.section-head classes, lib/work.ts's data-module shape"
provides:
  - "lib/backlog.tsx — the backlog's typed content module (BacklogItem, BACKLOG, LAST_TOUCHED, COPY_REVIEWED, fail-loud validator)"
  - "components/landing/backlog-list.tsx — the rendered <ul> of three rows, work-list grammar minus ordinal/host/link"
  - "app/(en)/page.tsx#backlog now renders the date line + BacklogList instead of Phase 3's SectionStub"
affects: ["05-02 (repo-tier freshness guard)", "05-03 (Playwright/build-tier test updates for h3 count and stub narrowing)", "05-04", "06-* (FIND-02 launch gate — backlog leg closes, COPY_REVIEWED still false)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Build-time fail-loud validation (assertFrontmatter's collect-then-throw shape) applied to a second content module"
    - "Source-only drafted-copy tripwire (COPY_REVIEWED) mirroring HOME-01's POSITIONING_PLACEHOLDER pattern"

key-files:
  created:
    - lib/backlog.tsx
    - components/landing/backlog-list.tsx
  modified:
    - "app/(en)/page.tsx"

key-decisions:
  - "LAST_TOUCHED set to 2026-08-31, confirmed by measurement (find -newermt) that masterarbeit was touched that day"
  - "pudding-pudding included as item 3, described strictly as a corpus study, never as a pitch — flagged as the one-edit veto item for the author's review"
  - "Item names render as <h3>, per the settled Validation decision (accepted, though it leaves tests/landing.spec.ts (r) red until Plan 03 updates the h3 count)"

requirements-completed: [BACK-01, BACK-02]

# Metrics
duration: 13min
completed: 2026-08-31
---

# Phase 5 Plan 1: Backlog data module, list component, and stub replacement Summary

**Three grounded backlog items (Swiss commodity-market thesis, Zürich house names, The Pudding as a corpus) shipped via `lib/backlog.tsx`, rendered by `BacklogList` in the work-list's row grammar minus its affordances, with a proven build-time freshness guard.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-08-31T20:28:46+02:00 (worktree base reset)
- **Completed:** 2026-08-31T20:41:44+02:00
- **Tasks:** 3 completed (2 produced commits; Task 3 is a proof task with no net file diff)
- **Files modified:** 3 (2 created, 1 edited)

## Accomplishments

- `lib/backlog.tsx` ships the backlog's entire content as one typed module: three grounded items in editorial order, a source-only `COPY_REVIEWED = false` tripwire, a `LAST_TOUCHED` date carrying its own semantics in a comment, and a fail-loud validator.
- `components/landing/backlog-list.tsx` renders the three rows using the work list's row grammar with D-11's three subtractions (no ordinal, no host line, plain-text name) held.
- `app/(en)/page.tsx` mounts the absolute "Last touched" date line above the list and deletes Phase 3's `SectionStub` copy from `#backlog` — not branched around, actually gone. `SectionStub` and its import stay for `#contact`.
- The build-time half of D-09's two-guard design is now measured, not assumed (closes Assumptions Log A1/A2): a malformed date and an empty `BACKLOG` array each fail `next build` with a non-zero exit naming `lib/backlog.tsx:`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author lib/backlog.tsx** - `8683c38` (feat)
2. **Task 2: BacklogList, the date line, and the stub's deletion from app/(en)/page.tsx** - `3c4aa9a` (feat)
3. **Task 3: Prove the build-time validator actually fails `next build`** - no new commit. This task's action is a build-probe procedure that temporarily mutates and then restores `lib/backlog.tsx`; `git diff --stat lib/backlog.tsx` against the Task 1 commit shows zero difference, so there is nothing new to commit. Findings are recorded below.

**Plan metadata:** committed together with this SUMMARY.md (see below).

## Files Created/Modified

- `lib/backlog.tsx` - `BacklogItem` type, `BACKLOG` (3 items), `LAST_TOUCHED`, `COPY_REVIEWED`, module-scope fail-loud validator
- `components/landing/backlog-list.tsx` - `BacklogList`, the rendered `<ul role="list">`
- `app/(en)/page.tsx` - imports `LAST_TOUCHED`/`formatPostDate`/`BacklogList`; `#backlog` now renders the date line + list instead of `SectionStub`

## The three items, final copy and grounding

Order is D-04 (widest-range-first), taken as-is from `05-RESEARCH.md § Q4` and verified against the underlying repo records this session before committing to it.

**1. A data portrait of the Swiss commodity trade** (`~/vault/projects/personal/masterarbeit`)

> The physical commodity trade runs through Switzerland in private partnerships with no
> disclosure duty and no regulator of their own. The question is what can actually be
> measured about a business whose defining feature is that it is not.

Traces to `masterarbeit/CLAUDE.md` ("A data portrait of the Swiss commodity market") and `masterarbeit/planning/research-notes.md:32,36` ("The sector is structurally opaque — private partnerships, no disclosure duty." / "There is no regulator. Banks have FINMA; traders have nobody."), both re-read this session. No year is put on the *Rohstoff* book — confirmed the repo's own records disagree (`CLAUDE.md` says 2012, `research-notes.md` says 2011). No supervisor or interview contact is named.

**2. The house names of Zürich** (`~/vault/projects/personal/data-story-hausnamen`)

> Before street numbers, houses in Zürich were known by name. The question is how many of
> those names survived from the eighteenth century into the present — and whether what
> disappeared was the houses or only the naming.

Traces to `data-story-hausnamen/CLAUDE.md` ("a data-driven story based on the naming patterns of Swiss Hausnamen"; the claim under test is explicitly "not yet" fixed). Stated as a question, never a finding — the repo's own record says the claim is unresolved (blocked on Q-2). No individual Zürich house is named; per the Validation coordinator decision, real house names are omitted rather than read from `data/derived/`.

**3. The Pudding, read as a corpus** (`~/vault/projects/personal/pudding-pudding`)

> Two hundred-odd visual essays by one publication, read together instead of one at a time.
> The question is whether a house style is visible in the aggregate — which subjects recur,
> which forms get reused, and what the publication has quietly stopped doing.

Traces to `pudding-pudding/README.md` ("Research archive for a meta-story about The Pudding: its recurring subjects, storytelling patterns, and editorial conventions"; "the 224 numbered stories"). **This item is described strictly as a corpus study and never as a pitch — flagged here as the one-edit veto item.** `data-story-pistachio/CLAUDE.md` (not part of this plan's `read_first` but referenced by research) records `pudding-pudding` as a candidate live Pudding pitch elsewhere in the user's own planning; publicly describing it as a pitch on this site could cost that pitch, so the copy above deliberately calls it a corpus study of the publication's body of work and nothing else. If the author vetoes this item on review, D-02's honest degradation applies and the section ships with two.

No description names a tool, language or framework; no `<strong>` is used anywhere (Pitfall 1); no `<a>` ships (none of the three has a public artifact — D-07 argues against manufacturing a link); no `github.com` href or `target="_blank"` appears.

## LAST_TOUCHED measurement

`LAST_TOUCHED = "2026-08-31"`. Measured this session via:

```
find ~/vault/projects/personal/masterarbeit -type f -not -path '*/.git/*' -newermt '2026-08-30'
```

which returned 9 files (`planning/book-map.md`, five `code/book-map/*.py` scripts, `code/book-map/README.txt`, `data/processed/book_entities.csv`, `data/processed/book_claims_raw.md`), confirming item 1 was genuinely touched on 2026-08-31. The current date at time of execution was still 2026-08-31 (`date -u` returned `2026-08-31T18:31:13Z`), so no re-measurement against a later ship date was needed. The honest reading is `max(item last-touch)` — masterarbeit 2026-08-31, hausnamen 2026-08-26, pudding-pudding 2026-08-19 — and both readings (ship date / max item last-touch) coincide because item 1 was touched that day, as recorded in the module's own comment.

## Build-probe table (Task 3)

All three builds run with `rm -rf .next && npm run build` immediately before, per Pitfall 6.

| Probe | Exit code | Result |
|---|---|---|
| Baseline (real values) | `0` | Control — build succeeds. |
| Invalid date (`LAST_TOUCHED = "2026-02-31"`) | **non-zero** | `Error: lib/backlog.tsx: LAST_TOUCHED "2026-02-31" is not a real calendar date` at `lib/backlog.tsx:114:11`. Confirms the round-trip real-calendar-date check fires, not just the regex shape check. |
| Empty list (`BACKLOG = []`) | **non-zero** | `Error: lib/backlog.tsx: BACKLOG must not be empty (D-13: there is no empty state)` at `lib/backlog.tsx:80:11`. |
| Final (restored real values) | `0` | `.next/server/app/index.html` contains `dateTime="2026-08-31"` and all three item names (`A data portrait of the Swiss commodity trade`, `The house names of Zürich`, `The Pudding, read as a corpus`), each verified with a direct grep. |

**A1 and A2 (Assumptions Log) are closed: false, not assumed.** A module-scope `throw` in `lib/backlog.tsx` does fail `next build` with a non-zero exit, and the validation block survives bundling (Next 16.3.3 / Turbopack) rather than being tree-shaken. No workaround was needed — the guard fires exactly as designed.

`git diff --stat lib/backlog.tsx` against the Task 1 commit shows no remaining probe edits; `LAST_TOUCHED` and `BACKLOG` hold their real, committed values.

## Decisions Made

- **`LAST_TOUCHED` value confirmed by direct measurement**, not just trusted from research — `find -newermt` re-run this session against masterarbeit before committing the date.
- **`pudding-pudding` ships as item 3**, described strictly as a corpus study and flagged as the one-edit veto item — per `05-VALIDATION.md`'s accepted coordinator decision.
- **Item names render as `<h3>`** (not `<p>`) — settled by `05-VALIDATION.md`, matches the work list's grammar, preserves a navigable heading outline. This is what leaves Playwright `(r)` red until Plan 03 updates the document-wide `h3` count from 3 to 6.
- **No real Zürich house name is used** — omitted per the Validation coordinator's decision rather than reading one from `data-story-hausnamen/data/derived/`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reworded two source comments to satisfy their own literal acceptance-criteria greps**
- **Found during:** Task 1 and Task 2 verification
- **Issue:** The plan's action text illustrates comments using the literal strings `<strong>`, `git `, `link-quiet`, `text-label`, and `aria-hidden` (e.g., "restricted by contract to `<em>`, `<strong>`, `<a className=\"link\">`", and D-11 comment examples referencing `<p className=\"text-label\">` / `<a className=\"link-quiet\">`), but the plan's own acceptance criteria run literal `grep -c` checks requiring zero matches for `<strong`, `git ` (lowercase, space-terminated), and `link-quiet\|text-label\|aria-hidden` in these exact files. As written, following the action text's illustrative wording would fail the plan's own stated acceptance gate.
- **Fix:** Reworded the four affected comments in `lib/backlog.tsx` and `components/landing/backlog-list.tsx` to preserve identical meaning without the literal banned substrings (e.g., "one paragraph, inline-only content only (D-08)" instead of naming `<em>`/`<strong>`/`<a className="link">` in-line; "Freshness-vs-source-control is Plan 02's tier" instead of "Freshness-vs-git"; "hidden-from-assistive-tech" instead of "aria-hidden"; "unstyled as a navigation affordance" instead of naming `.link-quiet` literally).
- **Files modified:** `lib/backlog.tsx`, `components/landing/backlog-list.tsx`
- **Verification:** All four `grep -c` acceptance-criteria commands from the plan (`<strong`, `spawnSync\|child_process\|git `, `link-quiet\|text-label\|aria-hidden`) now return `0`, and `npx tsc --noEmit` stayed clean throughout.
- **Committed in:** `8683c38` (Task 1), `3c4aa9a` (Task 2)

**2. [Rule 3 - Blocking] Restored `next-env.d.ts` after the build probes**
- **Found during:** Task 3, post-probe cleanup
- **Issue:** Running `npm run build` after `rm -rf .next` toggles `next-env.d.ts`'s import paths from `./.next/dev/types/*` to `./.next/types/*` (a Next.js framework artifact, not a change this plan owns), which would have left the tree dirty on a file outside this plan's declared `files_modified`.
- **Fix:** `git checkout -- next-env.d.ts` to restore it to its committed state after the final build.
- **Files modified:** `next-env.d.ts` (reverted, not committed)
- **Verification:** `git status --short` returns empty after the restore.
- **Committed in:** not committed — reverted to match HEAD, per the execution notes' "leave the tree CLEAN" instruction.

---

**Total deviations:** 2 auto-fixed (both Rule 3 — blocking issues that would otherwise have failed the plan's own stated verification gates).
**Impact on plan:** No scope creep. Both fixes preserve every substantive requirement (D-08, D-11, D-09's git-free build path, and "leave the tree clean") while resolving a literal self-contradiction inside the plan's own text and a Next.js framework side effect neither owned by this plan's `files_modified`.

## Issues Encountered

None beyond the deviations above. All three tasks' verification commands ran clean on the first or second attempt.

## Expected-red Playwright tests (owned by Plan 03)

Per the plan's objective, this plan deliberately ends with exactly two known-red assertions in `tests/landing.spec.ts`. Confirmed by running the full spec file after Task 2:

- **`(r) the heading outline is h1=1, h2=4, h3=3, h4/h5/h6=0, and every aria-labelledby resolves`** — `tests/landing.spec.ts:373` (assertion at `:389`). Fails because item names render as three new `<h3>` elements (`h3: 6` actual vs. `h3: 3` expected) — Pitfall 3, resolved deliberately in favour of `<h3>`.
- **`(u) both stubs render one standfirst and one body line, standfirst at weight 530`** — `tests/landing.spec.ts:444`. Fails because `#backlog` no longer renders a `p.text-standfirst`/`p.text-body` pair (it renders three `h3.text-standfirst` names and three `p.text-body` descriptions instead of one of each).

19 of 21 tests in `tests/landing.spec.ts` pass, including `(t) no card idiom` and `(s) D-02: nothing on / reads as unfinished`, run individually per the Task 2 verify step and again as part of the full-suite run. No other test is red. Neither test was edited — Plan 03 owns updating them.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `lib/backlog.tsx`'s `LAST_TOUCHED` is exported and ready for Plan 02's repo-tier freshness guard (`tests/unit/backlog-source.ts` / `backlog-freshness.test.ts`) to read as source text.
- `COPY_REVIEWED = false` is exported and must be re-asserted as a blocker on Phase 6's `FIND-02` robots flip until the author's editorial pass — in particular the one-edit veto on item 3 (`pudding-pudding`).
- Plan 03 has two concrete, located test edits waiting: narrow `(u)` to `["contact"]` and retitle it, and update `(r)`'s `h3` count from `3` to `6`, plus the new backlog-specific structural/geometry/weight-budget Playwright tests and the `tests/build/prerender.test.ts` edits (delete `:486`/`:487`/`:539`, retitle the launch-gate test, add the rendered-date-equality and `COPY_REVIEWED` assertions) described in `05-RESEARCH.md § Q2`.
- No blockers. The backlog leg of Phase 3's four-surface launch gate is functionally closed (`SectionStub` no longer serves `#backlog`), but per D-14 it must not be marked closed for `FIND-02` purposes until `COPY_REVIEWED` flips to `true`.

---
*Phase: 05-backlog*
*Completed: 2026-08-31*

## Self-Check: PASSED

All claimed files verified present (`lib/backlog.tsx`, `components/landing/backlog-list.tsx`,
`app/(en)/page.tsx`, this SUMMARY.md) and all claimed commit hashes verified present in
`git log --oneline --all` (`8683c38`, `3c4aa9a`, `cf4da4d`). No missing items.
