# Launch gate — state after Phase 5

This record follows `.planning/phases/04-the-case-study/launch-gate.md`'s format: what this phase
closed and why, the tripwire that replaces the deleted assertion, the items and their editorial
flags, the settled editorial calls, `LAST_TOUCHED`'s semantics, and a dated verification table.
Read this before Phase 6 touches anything the four-surface gate covers.

---

## The backlog leg, closed by name (2026-08-31)

`03-UI-SPEC.md:372` set the original four-surface gate: *"the site is `robots: { index: false }`
until `FIND-02`. … The same now applies to the featured slot's interim state, the backlog stub and
the contact stub. If any of the four is still in its interim state when Phase 6 goes to flip the
robots flag, Phase 6 is blocked."* `03-UI-SPEC.md:572` restated it as a phase-completion checklist
item: *"The featured slot is in its interim state and the launch gate above applies to it, to the
backlog stub and to the contact stub. Carry all four into Phase 4/5/6 state as blocking for
`FIND-02`."*

The four surfaces, and how each closed:

| Surface | Status | Closed by |
|---|---|---|
| Featured slot | **Closed Phase 4** | `content/the-chart-therefore-changes.mdx` published `draft: false`; `.planning/phases/04-the-case-study/launch-gate.md` |
| Backlog stub | **Closed here, Phase 5, Plan 04 (2026-08-31)** | See mechanism below |
| Contact stub | Still open | Owned by Phase 6 |
| `/cv` | Still open | Owned by Phase 6; interim body asserted by `tests/cv.spec.ts` |

**Mechanism.** `lib/backlog.tsx` (Plan 01) ships three real items, a hand-set `LAST_TOUCHED` date
and a fail-loud build-time validator; `components/landing/backlog-list.tsx` renders them in the
work list's row grammar minus its three affordances (D-11); `app/(en)/page.tsx` no longer mounts
`SectionStub` at `#backlog` — Phase 3's stub copy ("Nothing listed here yet." / "The current work
is being written up.") is **deleted**, not kept as an unreachable fallback branch (D-13). The
production build proves this rather than assuming it: `tests/build/prerender.test.ts`'s "the
contact stub ships its real, deliberately typeset copy" test asserts both deleted strings are
**absent** from `/`'s prerendered HTML (not merely unrendered in dev, where they never showed
regardless — `npm run dev` always shows drafts, but `SectionStub`'s copy was never draft-gated, it
was just deleted from the render tree), and a new test, "BACK-01/BACK-02: the backlog section
renders three real items and a source-bound date in production", proves the positive replacement:
three `<li>`, three `<h3>` item names, one `<time dateTime>` equal to `lib/backlog.tsx`'s own
`LAST_TOUCHED` by equality, zero `<a>`, and zero tool-word copy.

Phase 6 inherits an accurate gate: **two interim surfaces remain** (contact stub, `/cv`), not four.

---

## The D-14 tripwire — three channels, named as three, and why three

The backlog item copy is drafted from repository evidence and has not been reviewed by the author
(`COPY_REVIEWED = false`). Unlike the featured slot or the two now-closed stubs, this is not a
structural state a build can prove closed by rendering something new — it is an editorial judgement
only the author can make. A single channel is not enough: `HOME-01`'s own history (unwritten across
Phases 3 and 4) shows that a tripwire read in only one place gets silently carried without being
re-examined. Three independent channels exist so that any one surviving means the risk is still
visible:

1. **Source.** `export const COPY_REVIEWED = false;` in `lib/backlog.tsx`, with a comment stating
   the rule in full. Marked in source and never on screen — `tests/landing.spec.ts` (s) and
   `tests/build/prerender.test.ts`'s banned-marker loop both ban marker words ("TODO", "Coming
   soon", "Under construction", "Lorem", "todo"/"placeholder"/"tbd" in body text) from rendered
   output, so this tripwire cannot leak into a visible "draft" badge — a visible badge on a live URL
   during a job hunt is exactly what D-02 exists to prevent.
2. **Test.** The build-tier source-scrape in the re-pointed launch gate
   (`tests/build/prerender.test.ts`, the "launch gate: the contact stub is still interim and three
   copy items are still unreviewed" test), which replaced the deleted `assert.ok(root.includes("Nothing
   listed here yet."))` line so the gate did not shrink to nothing when the backlog leg closed. It
   imports `backlogSource` from `tests/unit/backlog-source.ts` and asserts
   `/export const COPY_REVIEWED = false/` matches — the literal `false`, not a truthiness check —
   with a failure message written as an instruction: when it fails, the author's editorial pass has
   happened, and the gate should be narrowed again, not deleted. `tests/unit/backlog.test.ts`
   independently re-asserts the same literal at the repo tier (Plan 02), so the source claim is
   checked twice by two different test tiers reading the same file two different ways.
3. **Record.** This file. Re-asserted in carried-forward state (`.planning/STATE.md`) every phase
   until the author's editorial pass happens.

**Failure mode, stated plainly.** The backlog section looks finished at every optical pass — three
real items, a real date, real prose, no visible marker — so no visual review at any breakpoint will
ever catch that the copy is unreviewed. That is precisely `HOME-01`'s failure mode, generalised.
**The backlog copy must not reach Phase 6's `FIND-02` robots flip while `COPY_REVIEWED` is `false`.**

---

## The three items and their editorial flags

Shipped in `lib/backlog.tsx`, in D-04's fixed editorial order (widest-range-first, not alphabetical,
not recency):

1. **A data portrait of the Swiss commodity trade** — grounded in `~/vault/projects/personal/masterarbeit`.
2. **The house names of Zürich** — grounded in `~/vault/projects/personal/data-story-hausnamen`.
3. **The Pudding, read as a corpus** — grounded in `~/vault/projects/personal/pudding-pudding`.

All three descriptions are drafted from repository evidence (05-01-SUMMARY.md's grounding section)
and are **unreviewed by the author** — `COPY_REVIEWED = false`, per the tripwire above.

**Item 3 is the one-edit veto item.** `pudding-pudding` is recorded elsewhere in the user's own
planning (`data-story-pistachio/CLAUDE.md`) as a candidate live pitch to The Pudding. The shipped
copy describes it **strictly as a corpus study of the publication's body of work and never as a
pitch** — publicly describing it as a pitch could cost that pitch. If the author vetoes this item on
review, removing it is a single array-element deletion in `lib/backlog.tsx`, after which D-02's
honest degradation applies and the section ships with two items rather than inventing a third.

---

## Settled editorial calls (do not re-open in Phase 6)

- **No real Zürich house name is named.** Omitted per the Validation coordinator's decision rather
  than reading one from `data-story-hausnamen/data/derived/` (05-01-SUMMARY.md).
- **No private individual is named.** No supervisor or interview contact from `masterarbeit`
  (`meetings/18 agost - Bleisch.md`, `planning/interviews.md`) appears in the copy.
- **No research finding is stated as settled, only as a question.** Item 1's research question is
  not yet fixed (`masterarbeit/writeup/disposition.md` is empty); item 2's claim is explicitly
  "not yet" resolved in its own repo's record. Both descriptions pose questions, not conclusions.
- **No year is put on the *Rohstoff* book.** The repo's own records disagree — `masterarbeit/CLAUDE.md`
  says 2012, `planning/research-notes.md` says 2011 — so the shipped copy names the book without a
  year rather than picking one.
- **Zero `<a>` ships in the backlog in v1.** None of the three items has a public artifact to link
  to; `D-07`'s reasoning (a link on unfinished work invites a click that disappoints) argues against
  manufacturing one. Proven directly: `tests/build/prerender.test.ts`'s new production test asserts
  `assert.doesNotMatch(section, /<a\b/)` against the sliced `section#backlog`.

---

## `LAST_TOUCHED` semantics

`LAST_TOUCHED = "2026-08-31"` in `lib/backlog.tsx`. For a later editor bumping this value:

- **The honest reading is `max(item last-touch)`** — the measured per-item dates from Plan 01:
  masterarbeit 2026-08-31, hausnamen 2026-08-26, pudding-pudding 2026-08-19 — **not** "when I last
  edited this file." On 2026-08-31 both readings coincide because item 1 was genuinely touched that
  day (confirmed by `find -newermt`, 05-01-SUMMARY.md); if item 1 were ever dropped the honest value
  would fall back to 2026-08-26, not stay at whatever date the file was last saved.
- **The guard's floor:** `LAST_TOUCHED` may never be earlier than `lib/backlog.tsx`'s own last
  change — `tests/unit/backlog-freshness.test.ts`'s `isStale` predicate enforces this, independently
  of the build-time shape/validity check in `lib/backlog.tsx` itself (D-09's two-guard design).
- **Which of the five git branches fires in this environment:** Branch 5 —
  `git log -1 --format=%cs -- lib/backlog.tsx`, comparison date `2026-08-31`, equal to
  `LAST_TOUCHED`, non-stale (05-02-SUMMARY.md). This differs from research's own prediction that the
  worktree-mtime branch (branch 3) would fire, because Plan 01 had already committed the module by
  the time Plan 02 ran, leaving the tree clean. Branch 3 was still exercised and confirmed working
  during Plan 02's own red-proof (Probe 1), which made the file dirty on purpose.

---

## Verification table

All checks below were run this session (Phase 5, Plan 04) unless a different plan is named.

| # | Check | Command | Result | Plan |
|---|---|---|---|---|
| 1 | Build-time validator fails `next build` on an invalid date | probe: `LAST_TOUCHED = "2026-02-31"`, `rm -rf .next && npm run build` | **non-zero exit**, `Error: lib/backlog.tsx: LAST_TOUCHED "2026-02-31" is not a real calendar date` | 01 |
| 2 | Build-time validator fails `next build` on an empty array | probe: `BACKLOG = []`, `rm -rf .next && npm run build` | **non-zero exit**, `Error: lib/backlog.tsx: BACKLOG must not be empty (D-13: there is no empty state)` | 01 |
| 3 | Restored build renders three items and the date | `rm -rf .next && npm run build`, grep `.next/server/app/index.html` | **0 exit**, `dateTime="2026-08-31"` plus all three item names present | 01 |
| 4 | Freshness comparison fires on a stale `LAST_TOUCHED` | probe: `LAST_TOUCHED = "2026-01-01"`, `npm run test:unit` | **AssertionError** naming the real last-change date and source branch | 02 |
| 5 | Source scrape throws (not skips) on a renamed declaration | probe: `LAST_TOUCHED` → `LAST_TOUCHED_X` | **hard crash at module load**, not a silent skip | 02 |
| 6 | `isStale` pure predicate is not tautological | probe: inverted comparison in `backlog-freshness.test.ts` | **3 of 4 fixed-input assertions fail** | 02 |
| 7 | `h3` count before Plan 03's edit measured, not assumed | `npx playwright test tests/landing.spec.ts --reporter=line` against HEAD pre-edit | `(r)` failed `received.h3 = 6` vs `expected.h3 = 3`, exactly as predicted | 03 |
| 8 | Playwright spec count | `npx playwright test --list` before, `--reporter=line` after | 124 → **127** (`+3`: (v), (w), (x)) | 03 |
| 9 | Unit test count | `npm run test:unit` | 88 → **102** (`+14`) | 02 |
| 10 | Build-tier assertion count | `npm run test:build` | 21 → **22** (`+1` net: 2 tests edited, 1 test added) | 04 |
| 11 | Clean production build + build-tier tests | `rm -rf .next && npm run build && npm run test:build` | **0 exit**, 22/22 pass | 04 |
| 12 | Full suite from a clean build | `npm run test:all` | **0 exit** — 102 unit / clean build / 22 build-tier / 127 Playwright, all pass | 04 |
| 13 | Lint baseline held | `npm run lint` | **1 error**, `use-prefers-reduced-motion.ts:23` (pre-existing, unchanged) | 04 |
| 14 | Type-check clean | `npx tsc --noEmit` | **0 exit**, no output | 04 |
| 15 | Live deploy: real Next.js app | `PLAYWRIGHT_BASE_URL=https://web-production-9cedb.up.railway.app npx playwright test tests/deploy-smoke.spec.ts` | **PASS**, 1/1 | 04 |
| 16 | Live deploy: three item names, the date, and absence of both stub strings | `curl` fetch of `/`, `grep -c` each | **All three item names present (1 each)**; `dateTime="2026-08-31"` present (×2, date line + none other); both stub strings **0** matches each; `noindex` unchanged | 04 |

**Live deployment note.** Checked `2026-08-31T19:20:57Z`–`2026-08-31T19:21:08Z` UTC against
`https://web-production-9cedb.up.railway.app` directly. `origin/master`'s tip at fetch time was
`e76b6d80a08455cc4d06daaa0ec4ba76446347bf` ("docs(phase-05): update tracking after wave 2") — the
production code for BACK-01/BACK-02 (`lib/backlog.tsx`, `components/landing/backlog-list.tsx`,
`app/(en)/page.tsx`) shipped in that commit's history (Plan 01, merged before this plan started) and
was already live at check time. This plan's own commits (Plan 04: `tests/build/prerender.test.ts`
plus this closure record) are **test-tier and planning-documentation only** — zero production code —
so they do not change what is served at `/`; they are local to this worktree branch pending the
orchestrator's merge-and-push, the same pattern recorded for every prior phase's worktree executor
(see `_pm/kanban.md`'s Phase 2 entry for the precedent). The live confirmation above is therefore a
genuine, direct proof of BACK-01 and BACK-02 in production, not an inference from a local build.
