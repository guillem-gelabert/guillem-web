---
phase: 05-backlog
plan: 04
subsystem: testing
tags: [node-test, production-build-verification, launch-gate, prerender-html, source-binding]

# Dependency graph
requires:
  - phase: 05-backlog
    plan: 01
    provides: "lib/backlog.tsx (BACKLOG, LAST_TOUCHED, COPY_REVIEWED, build-time validator), components/landing/backlog-list.tsx, app/(en)/page.tsx#backlog"
  - phase: 05-backlog
    plan: 02
    provides: "tests/unit/backlog-source.ts — the shared, non-*.test.ts source reader this plan imports into the build tier"
  - phase: 05-backlog
    plan: 03
    provides: "tests/landing.spec.ts (v)/(w)/(x) — the dev-tier proof this plan's production-tier proof complements"
provides:
  - "tests/build/prerender.test.ts — production-tier proof of BACK-01 (three items, three names, no tool word, zero <a>) and BACK-02 (dateTime equal to source LAST_TOUCHED by equality, rendered via the one shipped formatter), plus D-13's absence proof and D-14's re-pointed launch gate"
  - ".planning/phases/05-backlog/launch-gate.md — the closure record: backlog leg closed by name, D-14's three tripwire channels, the three items with the veto flag on item 3, settled editorial calls, LAST_TOUCHED semantics, dated verification table"
  - "Live deployment confirmation against the Railway URL: three item names, the dateTime value, and the absence of both Phase 3 stub strings, all verified in fetched production HTML"
affects: ["06-* (FIND-02 launch gate inherits two interim surfaces instead of four, plus a third named copy tripwire alongside HOME-01 and the case-study editorial pass)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "backlogSectionOf(root): slice a named <section id=\"...\"> to its closing </section> with both indices asserted found, so a shifted section boundary fails loud rather than silently scoping to zero-length"
    - "Tag-stripped text banned-token check at the production tier: strip HTML before running work.test.ts's word-boundary regex list, so an attribute or class name cannot satisfy or defeat the check"

key-files:
  created:
    - .planning/phases/05-backlog/launch-gate.md
  modified:
    - tests/build/prerender.test.ts
    - .planning/STATE.md
    - _pm/kanban.md

key-decisions:
  - "The launch gate was re-pointed, not shrunk: the deleted backlog-stub assertion was replaced by a COPY_REVIEWED = false source-scrape (D-14's second tripwire channel), and the comment names all three outstanding copy items explicitly rather than leaving a one-line check nobody reads"
  - "The new production test matches dateTime (camelCase) rather than datetime — React 19.2.8 emits the JSX prop name verbatim in the raw prerendered file; a lowercase match would silently never fire (Pitfall 2, re-confirmed this session against the real build)"
  - "The live deploy check used the already-live origin/master tip (e76b6d8, from Plan 01) rather than requiring a push of this plan's own commits — this plan's commits are test-tier and documentation only, so they carry zero production-code delta and the live URL already reflects what BACK-01/BACK-02 need proven"

requirements-completed: [BACK-01, BACK-02]

# Metrics
duration: 11min
completed: 2026-08-31
---

# Phase 5 Plan 4: Production truth for the backlog, re-pointed launch gate, and deploy confirmation Summary

**Production build now proves what dev cannot — three real backlog items, one source-bound date, and the absence of Phase 3's stub copy — while the launch gate is re-pointed at the one item that is genuinely still open: the backlog copy's unreviewed status.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-08-31T21:13:11+02:00 (worktree base at `e76b6d8`)
- **Completed:** 2026-08-31T21:23:38+02:00
- **Tasks:** 3 completed (2 produced commits; Task 2 is a verification-only task with no net file diff, same shape as Plans 01/02's own proof tasks)
- **Files modified:** 4 (1 created, 3 edited)

## Accomplishments

- `tests/build/prerender.test.ts` now proves BACK-01 and BACK-02 against real prerendered HTML: exactly three `<li>`/`<h3>` in `section#backlog`, all three item names, a `<time dateTime>` equal to `lib/backlog.tsx`'s own `LAST_TOUCHED` by equality (not a retyped literal), the rendered text equal to `formatPostDate`'s output, zero tool-word copy, and zero `<a>`.
- D-13 is proven by absence, not merely by omission from dev: both deleted Phase 3 stub strings ("Nothing listed here yet." / "The current work is being written up.") are asserted absent from production HTML, distinguishing "not rendered" from "not present."
- The launch gate is re-pointed rather than shrunk: the deleted backlog-stub assertion is replaced by a `COPY_REVIEWED = false` source-scrape — D-14's second tripwire channel — with a comment naming all three copy items still blocking Phase 6's `FIND-02` (HOME-01, the case-study editorial pass, the backlog copy).
- The whole suite ran green from a clean build: 102 unit / 22 build-tier / 127 Playwright, `npx tsc --noEmit` clean, lint at its one known deferred error.
- The live deployment was confirmed directly against the Railway URL — not inferred from a local build — because the production code (Plan 01) was already on `origin/master`'s tip before this plan started.
- `.planning/phases/05-backlog/launch-gate.md` closes the backlog leg by name, following Phase 4's precedent format exactly, and both `STATE.md` and `_pm/kanban.md` carry the closure and the new tripwire forward.

## Task Commits

Each task was committed atomically:

1. **Task 1: Production truth for the backlog, and the re-pointed launch gate** - `9f3415b` (test)
2. **Task 2: Full suite from a clean build, lint baseline, and the live deploy confirmation** - no new commit. This task is a verification-only task (run `npm run test:all`, `npm run lint`, `npx tsc --noEmit`, and the live-URL checks); `git status --short` was empty afterward, so there was nothing new to commit — the same shape as Plans 01 and 02's own proof tasks. Findings are recorded below and in `launch-gate.md`.
3. **Task 3: The closure record, the carried-forward state, and the kanban entry** - `ca2034a` (docs)

**Plan metadata:** committed together with this SUMMARY.md (see below).

## Files Created/Modified

- `tests/build/prerender.test.ts` — two tests edited (stub-copy test retitled + D-13 inversion added; launch gate retitled + re-pointed + COPY_REVIEWED assertion added), one test added (BACK-01/BACK-02 production proof), one `backlogSectionOf` helper added, imports extended (`formatPostDate`, `backlogSource`, `BACKLOG_LAST_TOUCHED`)
- `.planning/phases/05-backlog/launch-gate.md` — new closure record (six required blocks)
- `.planning/STATE.md` — Deferred Items table narrowed/extended; Blockers/Concerns re-asserted with the third carried item; the Phase 5 "accepted risk" concern resolved as Revisit
- `_pm/kanban.md` — Phase 5 Done entry added, removed from Next

## Suite counts, reconciled against the pre-phase baseline and the three prior SUMMARYs

| Tier | Pre-phase baseline | After Plan 01 | After Plan 02 | After Plan 03 | **After Plan 04 (this plan, authoritative)** |
|---|---|---|---|---|---|
| Unit (`node --test`) | 88 | 88 (unchanged) | **102** (+14, `backlog.test.ts` + `backlog-freshness.test.ts`) | 102 (unchanged, confirmed) | **102** (unchanged, confirmed) |
| Build-tier (`node --test`) | 21 | 21 (unchanged) | 21 (unchanged) | 21 (unchanged, out of this plan's scope) | **22** (+1 net: 2 tests edited, 1 test added) |
| Playwright | 124 | 124 (2 deliberately red, per Plan 01's own record) | 124 (unaffected — different file) | **127** (+3: (v), (w), (x)) | **127** (unchanged, confirmed) |

No disagreement found between the four SUMMARYs — each plan's own count carries forward cleanly. This plan's only new delta is the build-tier count (21 → 22).

## Exact lint result

```
/…/components/smear-heading/use-prefers-reduced-motion.ts
  23:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
  react-hooks/set-state-in-effect

✖ 1 problem (1 error, 0 warnings)
```

Exactly one error, exactly the pre-existing deferred one, file unchanged by this plan. `npx tsc --noEmit` produced no output (clean).

## Deploy confirmation

**Checked `2026-08-31T19:20:57Z`–`2026-08-31T19:21:08Z` UTC** directly against `https://web-production-9cedb.up.railway.app` (never localhost):

- `PLAYWRIGHT_BASE_URL=https://web-production-9cedb.up.railway.app npx playwright test tests/deploy-smoke.spec.ts` — **PASS**, 1/1.
- Fetched `/` (HTTP 200) and grepped the response for all three backlog item names — **1 each, present**; `dateTime="2026-08-31"` — **present** (×2, only on the backlog's own `<time>`); both Phase 3 stub strings — **0 matches each, absent**; `<meta name="robots" content="noindex"/>` — **unchanged**.

**Why this counts as a genuine production confirmation, not an inference from local state:** `origin/master`'s tip at check time was `e76b6d80a08455cc4d06daaa0ec4ba76446347bf` — this worktree's own base commit, already merged before this plan began. The production code for BACK-01/BACK-02 (`lib/backlog.tsx`, `components/landing/backlog-list.tsx`, `app/(en)/page.tsx`) shipped in that commit's history (Plan 01) and was already live at Railway before this plan's own commits (`9f3415b`, `ca2034a`) existed. Those two commits are test-tier (`tests/build/prerender.test.ts`) and planning-documentation only (`launch-gate.md`, `STATE.md`, `_pm/kanban.md`) — **zero production code** — so they carry nothing new for the live URL to serve. The live check above is a direct, fetched confirmation of what BACK-01/BACK-02 require, not an assumption from a green local build.

Per the execution notes for this session, this executor did not push (`Do NOT git push`). This plan's own two commits are local to `worktree-agent-a1caac1cbe2f80cb1`, pending the orchestrator's merge-and-push — the standard pattern for every prior phase's worktree executor (see `_pm/kanban.md`'s Phase 2 entry, and this repo's own `git log` history of "chore: merge executor worktree" commits).

## Decisions Made

- **The launch gate's re-pointing follows Phase 4's exact precedent**, narrowing rather than deleting: the interim-state assertion for the now-closed surface is removed, a dated `NARROWED 2026-08-31 (Phase 5, Plan 04)` paragraph records why, and the replacement assertion (`COPY_REVIEWED = false`) is what keeps the gate non-vacuous.
- **`dateTime` (camelCase), not `datetime`, in the build-tier regex** — Pitfall 2, re-verified this session directly against the real prerendered file (`dateTime="2026-08-31"` measured in both the local build and the live fetch).
- **The banned-tool-token check is mirrored, not imported**, into the new production test — matching Plan 02's own choice to scope the check rather than reach into `lib/work.ts`, and keeping this file's dependency surface unchanged (still only `lib/work.ts`'s `POSITIONING_PLACEHOLDER` and `lib/locales.ts`'s `UI`/`formatPostDate`, plus the new `tests/unit/backlog-source.ts` import).
- **The live deploy check reads the already-live `origin/master` tip rather than requiring a push from this worktree** — accurate because this plan changed no production code; recorded precisely in both this SUMMARY and `launch-gate.md` rather than glossed as "deploy confirmed" without qualification.
- **The Phase 5 "accepted risk" concern in `STATE.md` is resolved as Revisit, not Closed** — the dateless/per-item-state risk PROJECT.md logged is genuinely mitigated (curation to three, the section-level date, the copy voice), but the record states plainly that revisiting post-launch is still the correct disposition, not premature closure.

## Deviations from Plan

None beyond what the plan's own `<action>` text already anticipated and named (the two deletions, the inversion, the re-pointed gate, the new production test, and the pending-push contingency). No additional breakage was found beyond the three research located. No file outside the plan's declared `files_modified` changed, except the transient `next-env.d.ts` dev/build path toggle each `next build` run causes — restored to its committed state after Task 1's build and self-corrected to the same state by Task 2's own `npm test` (which boots `next dev` last in the `test:all` chain); `git status --short` was empty at both task boundaries.

## Issues Encountered

**Worktree had no `node_modules`** (by design, per this session's execution notes) — resolved with a single `npm ci` before the first build, installing exactly the locked dependency set already committed in `package-lock.json`. No new dependency added; `git diff package.json package-lock.json` against the Task 1 commit is empty.

No other issues. All three tasks' verification commands ran clean on the first attempt.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 6 inherits an accurate four-surface gate with **two interim surfaces remaining** (contact stub, `/cv`), not four, and **three named unreviewed copy items** blocking `FIND-02`: `HOME-01`'s positioning sentence, the user's editorial pass over both case studies, and the backlog item copy (with a one-edit veto flag on item 3, "The Pudding, read as a corpus" — it must never be described as a pitch).
- `.planning/phases/05-backlog/launch-gate.md` is the full record Phase 6 should read before touching any of the above; `STATE.md`'s Deferred Items table and Blockers/Concerns block both carry the same facts forward in the standard carry-forward format.
- No blockers to closing Phase 5. The phase's own goal (BACK-01, BACK-02) is proven at three independent tiers now: unit (Plan 02), Playwright (Plan 03), and production build (this plan) — plus a live deployment fetch confirming the same facts against the real URL.

---
*Phase: 05-backlog*
*Completed: 2026-08-31*

## Self-Check: PASSED

All claimed files verified present (`tests/build/prerender.test.ts`,
`.planning/phases/05-backlog/launch-gate.md`, this SUMMARY.md, `.planning/STATE.md`,
`_pm/kanban.md`) and both claimed commit hashes verified present in
`git log --oneline --all` (`9f3415b`, `ca2034a`). No missing items.
