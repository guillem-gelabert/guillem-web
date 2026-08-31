---
phase: 05-backlog
plan: 02
subsystem: test
tags: [node-test, source-scraping, git-subprocess, repo-tier-validation]

# Dependency graph
requires:
  - phase: 05-backlog
    plan: 01
    provides: "lib/backlog.tsx (BacklogItem, BACKLOG, LAST_TOUCHED, COPY_REVIEWED, build-time validator)"
provides:
  - "tests/unit/backlog-source.ts — shared, non-*.test.ts reader that scrapes lib/backlog.tsx as source text and throws (never returns null) if LAST_TOUCHED's declaration cannot be parsed"
  - "tests/unit/backlog.test.ts — repo-tier re-validation of LAST_TOUCHED shape/validity/recency, the COPY_REVIEWED=false D-14 tripwire, and the D-02/D-06/D-07 content contract"
  - "tests/unit/backlog-freshness.test.ts — isStale(lastTouched, lastChange) pure predicate plus the five-branch git/mtime environment probe, D-09.2's repo-tier freshness guard"
affects: ["05-04 (tests/build/prerender.test.ts can import backlog-source.ts, per 05-RESEARCH.md Q1 §B)", "06-* (FIND-02 launch gate — COPY_REVIEWED still false)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Source-text scraping to test a .tsx module from node --test (ERR_UNKNOWN_FILE_EXTENSION blocker) — the shared-reader idiom (css-source.ts, case-study-source.ts) extended to a third module"
    - "Pure-predicate/environment-probe split for a git-backed guard, so the comparison logic runs unconditionally even when the git branch skips"
    - "spawnSync with an argv array for the only git subprocess call in the repo, never shell-mode"

key-files:
  created:
    - tests/unit/backlog-source.ts
    - tests/unit/backlog.test.ts
    - tests/unit/backlog-freshness.test.ts
  modified: []

key-decisions:
  - "Banned-tool-token check (D-14) scoped to the BACKLOG array text, not the whole module source — applying it file-wide false-positives on `import type { ReactNode } from \"react\";`, since \\bReact\\b matches the bare string \"react\" case-insensitively"
  - "Two explanatory comments reworded (existsSync -> 'directory-existence check', execSync -> 'string-interpolated subprocess call') to satisfy this plan's own literal acceptance-criteria greps — same self-inflicted trap Plan 01 hit and fixed the same way"
  - "Item-count and field-shape checks counted from source via indentation-anchored regex (`^ {4}name:`), not a JSX/AST parser — matches the technique the plan itself prescribes and the repo's own css-source.ts idiom"

requirements-completed: []

# Metrics
duration: 11min
completed: 2026-08-31
---

# Phase 5 Plan 2: Repo-tier backlog reader and the five-branch freshness guard Summary

**Three new `node --test` files (102 total, up from an 88-test baseline) read `lib/backlog.tsx` as source text — never by importing the `.tsx` module — and all three deliberate red-proofs were run and observed failing before being restored to green.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-08-31T20:45:00+02:00 (worktree base reset to `1613f62`)
- **Completed:** 2026-08-31T20:56:26+02:00
- **Tasks:** 3 completed (2 produced commits; Task 3 is a red-proof task with no net file diff, mirroring Plan 01's own Task 3)
- **Files created:** 3

## Accomplishments

- `tests/unit/backlog-source.ts` reads `lib/backlog.tsx` with `readFileSync` and parses `LAST_TOUCHED` with a regex that **throws**, naming the file and the declaration it looked for, rather than returning `null` on a failed match — the one path that would otherwise turn every downstream assertion into a vacuous pass.
- `tests/unit/backlog.test.ts` independently re-validates everything the build-time validator checks (ISO shape, real-calendar-date round trip, not-future with a 36h grace) plus the `COPY_REVIEWED = false` D-14 tripwire and the exact-3-item / exactly-2-field (`name`, `description`) D-02/D-06 contract — all read from source text, all counted with indentation-anchored regexes rather than a JSX parser.
- `tests/unit/backlog-freshness.test.ts` implements `isStale(lastTouched, lastChange)` as a pure, unconditionally-tested predicate, plus the five-branch git/mtime environment probe from `05-RESEARCH.md § Q1 §G`, verbatim: no-work-tree skip, shallow-clone skip, dirty-worktree mtime fallback, no-history-yet skip, and the `git log -1 --format=%cs` happy path. Every skip emits its reason through both `t.skip` and `t.diagnostic`; the branch taken is diagnosed on the success path too.
- All three guards were **observed** failing on a real defect (Task 3), not just asserted to work.

## Task Commits

1. **Task 1: `tests/unit/backlog-source.ts` and `tests/unit/backlog.test.ts`** — `a6c7478` (test)
2. **Task 2: `tests/unit/backlog-freshness.test.ts` — the five-branch git guard** — `6e18f0b` (test)
3. **Task 3: Demonstrate that all three guards fail when they should** — no new commit. Each probe temporarily mutated `lib/backlog.tsx` or `tests/unit/backlog-freshness.test.ts` and was restored before the next probe; `git status --porcelain` is empty and `git diff --stat` against the Task 2 commit shows zero difference, so there is nothing new to commit — the same shape as Plan 01's own Task 3.

## Files Created

- `tests/unit/backlog-source.ts` — `BACKLOG_MODULE`, `backlogSource`, parsed `LAST_TOUCHED` (throws on unmatched declaration)
- `tests/unit/backlog.test.ts` — 9 tests covering `LAST_TOUCHED` shape/validity/recency, `COPY_REVIEWED`, item count/shape, banned markup/tokens
- `tests/unit/backlog-freshness.test.ts` — `isStale`, 5 tests (4 pure fixed-input cases + 1 environment-probe test)

## Which of the five branches fires in this environment

At the time this plan ran, `lib/backlog.tsx` was already committed and clean (shipped by Plan 01's `8683c38`/`3c4aa9a`, no uncommitted edit outstanding). Probed directly:

```
git rev-parse --is-inside-work-tree        -> true
git rev-parse --is-shallow-repository      -> false
git status --porcelain -- lib/backlog.tsx  -> (empty — clean)
git log -1 --format=%cs -- lib/backlog.tsx -> 2026-08-31
```

**Branch 5 fires: `git log -1 --format=%cs`**, comparison date `2026-08-31`, equal to `LAST_TOUCHED` — non-stale. This differs from the plan's own prediction that the worktree-mtime branch (branch 3) would be "the branch that fires when you run it" — that prediction assumed the module would still be uncommitted at this point in the phase, but Plan 01 already committed it in Wave 1, so the tree is clean by the time Plan 02 runs. Branch 3 (mtime) was nonetheless exercised and confirmed working during Task 3's Probe 1, below, where editing the file deliberately made it dirty again.

## Red-proof table (Task 3)

| Probe | Exact observed failure | Restored green? |
|---|---|---|
| **1. Freshness comparison fires.** `LAST_TOUCHED` set to `"2026-01-01"` (earlier than the module's real last change). | `AssertionError`: `` lib/backlog.tsx's LAST_TOUCHED ("2026-01-01") is earlier than its last change (2026-08-31, via worktree mtime (module has uncommitted changes)) — bump LAST_TOUCHED in lib/backlog.tsx when the work moved, and never the other way round ``. Editing the file made it dirty, so branch 3 (mtime) fired here, not branch 5 — exactly the branch research predicted for an uncommitted edit. | Yes — `git diff --stat lib/backlog.tsx` empty, `npm run test:unit`: 102/102 pass. |
| **2. Source scrape throws rather than skipping.** `LAST_TOUCHED` renamed to `LAST_TOUCHED_X` in `lib/backlog.tsx`. | Hard crash at module load (not a test failure, not a skip): `` Error: tests/unit/backlog-source.ts could not find `export const LAST_TOUCHED = "YYYY-MM-DD"` in lib/backlog.tsx — if the declaration was reformatted, fix this reader, do not delete it. `` Both `backlog.test.ts` and `backlog-freshness.test.ts` failed to load as a direct consequence (both import the shared reader). | Yes — `git diff --stat lib/backlog.tsx` empty, `npm run test:unit`: 102/102 pass. |
| **3. Pure predicate is not tautological.** `isStale` inverted to `lastChange < lastTouched` in `tests/unit/backlog-freshness.test.ts`. | 3 of the 4 fixed-input assertions failed with `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal` (`expected: true, actual: false` on tests 1 and 4; `expected: false, actual: true` on test 3) — only the same-day case (test 2) is invariant under the inversion. | Yes — `git diff --stat tests/unit/backlog-freshness.test.ts` empty, `npm run test:unit`: 102/102 pass. |

`git status --porcelain lib/backlog.tsx tests/unit/` is empty after all three probes.

## `npm run test:unit` totals

| | Tests | Assertion call-sites added |
|---|---|---|
| Pre-phase baseline | 88 | — |
| After Task 1 (`backlog-source.ts` + `backlog.test.ts`) | 97 | 24 (several inside loops over `bannedTokens`/`bannedPhrases`/`itemChunks`, so the count actually executed per run is higher) |
| After Task 2 (`backlog-freshness.test.ts`) | 102 | +5 |
| **Total added this plan** | **+14 tests** | **29 `assert.*` call-sites** (executed count higher due to loop bodies) |

Test count grew by 14 and assertion call-sites grew by 29 in step — Pitfall 5's warning sign (test count growing while assertion count does not) did not occur.

## No dependency added

`git diff package.json package-lock.json` against the Task 2 commit is empty. No TS/TSX loader (`tsx`, `ts-node`, `esbuild-register`) or any other package was installed. `npm ci` was run once at the start of this plan purely to populate the worktree's missing `node_modules` (the worktree ships with no `node_modules` by design) — it installed the same locked dependency set already committed in `package-lock.json`, adding nothing new.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reworded two explanatory comments to satisfy this plan's own literal acceptance-criteria greps**
- **Found during:** Task 2 verification
- **Issue:** The plan's own action text and research illustrate the "NOT existsSync(...)" and "never execSync" reasoning using those literal identifiers, but the plan's acceptance criteria run `grep -c "existsSync"` (must be 0) and `grep -c "shell: true\|execSync"` (must be 0) against the same file. Following the illustrative wording literally would fail the plan's own stated gate — the identical self-contradiction Plan 01 hit and documented for `<strong>`/`git `/`link-quiet` literals.
- **Fix:** Reworded both comments in `tests/unit/backlog-freshness.test.ts` to preserve identical meaning without the literal banned substrings ("a directory-existence check on \".git\"" instead of naming `existsSync` inline; "never a shell-mode spawn, never a string-interpolated subprocess call" instead of naming `execSync` inline).
- **Files modified:** `tests/unit/backlog-freshness.test.ts`
- **Verification:** All four grep-based acceptance criteria (`existsSync`, `is-shallow-repository`, `status`, `shell: true\|execSync`) return the required counts; `npm run test:unit` and `npx tsc --noEmit` stayed clean throughout.
- **Committed in:** `6e18f0b` (Task 2) — caught and fixed before the commit, not after.

**2. [Rule 3 - Blocking] Scoped the banned-tool-token check to the BACKLOG array text rather than the whole module**
- **Found during:** Task 1, while drafting the banned-token test
- **Issue:** `work.test.ts:56-58`'s `bannedTokens` list includes `"React"`, matched case-insensitively with a `\bReact\b` word-boundary pattern. Applied to the whole module source, this pattern matches the bare string `"react"` inside `import type { ReactNode } from "react";` — a false positive that has nothing to do with D-14's actual concern (whether the *copy* names a tool).
- **Fix:** Scoped the check to `backlogArrayText`, the substring between the `BACKLOG` and `LAST_TOUCHED` declarations, which holds the item copy and excludes the import statement and type declarations.
- **Files modified:** `tests/unit/backlog.test.ts`
- **Verification:** `npm run test:unit` passes with the scoped check; manually confirmed the file-wide version would false-fail by temporarily widening the scope during drafting and observing the `react` match, then narrowing it back.
- **Committed in:** `a6c7478` (Task 1) — caught and fixed before the commit.

---

**Total deviations:** 2 auto-fixed (both Rule 3 — blocking issues that would otherwise have failed the plan's own stated verification gates, caught during drafting/verification and fixed before each task's commit).
**Impact on plan:** No scope creep. Both fixes preserve every substantive requirement (D-09.2's five branches, T-05-07's argv-array-only git subprocess call, D-14's actual copy-content check) while resolving a literal self-contradiction inside the plan's own illustrative text and a legitimate false-positive in the banned-token check's naive scope.

## Issues Encountered

None beyond the deviations above. All three tasks' verification commands ran clean on the first or second attempt. `node_modules` was absent in this worktree (by design, per the parallel-execution notes) and was populated with a single `npm ci` before any test was run.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `tests/unit/backlog-source.ts` is a plain `.ts` module (not `*.test.ts`), so `tests/build/prerender.test.ts` can import it in a later plan to bind rendered `<time dateTime>` output to the source `LAST_TOUCHED` constant by equality — the `POSITIONING_PLACEHOLDER` technique `05-RESEARCH.md § Q1 §B` names as the intended consumer.
- `COPY_REVIEWED = false` is independently re-asserted at the repo tier now, in addition to Plan 01's build-time module; both must stay in sync until the author's editorial pass, and neither may reach Phase 6's `FIND-02` robots flip while `false`.
- The Playwright and build tiers (`tests/landing.spec.ts`, `tests/build/prerender.test.ts`) are untouched by this plan — they remain Plan 05-03's and Plan 05-04's scope respectively, per the parallel-execution boundary (`tests/landing.spec.ts` is 05-03's file; this plan touched only `tests/unit/backlog*`).
- No blockers.

---
*Phase: 05-backlog*
*Completed: 2026-08-31*

## Self-Check: PASSED

All claimed files verified present (`tests/unit/backlog-source.ts`, `tests/unit/backlog.test.ts`,
`tests/unit/backlog-freshness.test.ts`, this SUMMARY.md) and all claimed commit hashes verified
present in `git log --oneline --all` (`a6c7478`, `6e18f0b`). No missing items.
