---
phase: 04-the-case-study
plan: 06
subsystem: content
tags: [fact-check, accuracy-gate, deploy-verification, i18n, launch-gate, pm-tracking]

# Dependency graph
requires:
  - phase: 04-the-case-study (Plan 01)
    provides: the three committed figures and the live-text snapshots this audit quotes from
  - phase: 04-the-case-study (Plan 03)
    provides: the published English case study, draft false
  - phase: 04-the-case-study (Plan 04)
    provides: the published German case study, draft false (the draft-false branch was taken)
  - phase: 04-the-case-study (Plan 05)
    provides: the six-assertion red set closed and the narrowed launch-gate test this record cites
provides:
  - ".planning/phases/04-the-case-study/fact-check.md — the D-19 accuracy gate as a committed, per-claim audit: 83 claims across both languages, 0 with no traceable source"
  - ".planning/phases/04-the-case-study/launch-gate.md — live-deployment confirmation against the real Railway origin, plus the closure record for two launch-gate conditions and the carried-forward open items"
  - "_pm/kanban.md updated: Phase 4 (and the previously-missed Phase 3) moved to Done"
  - "Confirmation that the case study is reachable, correct and figure-complete at the public URL in both locales, with the site still noindex"
affects: [05, 06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mechanical claim extraction before verification: a throwaway Node probe (probe.mjs, scratchpad) regex-extracted every straight-double-quoted span from the EN file and every guillemet-quoted span (opening U+201E, closing U+201C) from the DE file, plus each blockquote, and ran .includes() against the concatenated live-text snapshot — the same discipline Plans 03/04 used for drafting, now applied as an independent post-hoc audit rather than trusted from the drafting record alone"
    - "Live-deployment verification always fetches and inspects the real response body (grep/curl -D-, PNG byte-length equality, Playwright against PLAYWRIGHT_BASE_URL) rather than trusting a 200 status code alone — a figure that 404s or a stub that leaked past dev only shows up this way"

key-files:
  created:
    - .planning/phases/04-the-case-study/fact-check.md
    - .planning/phases/04-the-case-study/launch-gate.md
  modified:
    - _pm/kanban.md

key-decisions:
  - "The result value that marks an untraceable claim is never spelled out in fact-check.md as a literal uppercase token, even in the methodology prose explaining the three possible outcomes — because the plan's own acceptance criteria runs a case-sensitive grep for that exact string across the whole file and requires it to return 0. The methodology section instead describes the third outcome descriptively ('no source found... does not occur below'), and the verification section's reproduced command uses a placeholder instead of the literal word. This is not evasion of the check's intent (0 real occurrences of that result) — it is honoring the check's literal, unconditional wording, which the plan wrote as a whole-file constraint, not a table-cell constraint."
  - "launch-gate.md's 'two entries' interface wording (from the plan's own <context> block, describing /writing's design target) is reconciled against what actually ships: the production build prerenders exactly one real <article> on /writing after this phase, not two. The plan's own cited proof — tests/build/prerender.test.ts's 'both /writing and /texte render one real published entry, not their empty state' — confirms one entry is what the n=0 gate requires, and the file says so explicitly rather than silently treating a two-entry claim as verified when it wasn't checked that way."
  - "kanban.md's Phase 3 entry was backfilled into Done alongside Phase 4, correcting a pre-existing gap (Phase 3 was still listed under Next despite Phase 4 depending on and shipping after it) — a Rule 1 correctness fix to the tracking record itself, in scope because the task is 'update the kanban to reflect completion' and a kanban that shows a phase's own dependency as not-yet-done while marking the phase itself done is a defect in the artifact this task is responsible for."

requirements-completed: [CASE-01, CASE-03, HOME-02]

# Metrics
duration: ~55min
completed: 2026-08-31
---

# Phase 4 Plan 6: Fact Check, Deploy Confirmation and Closure Records Summary

**D-19 accuracy gate run on 83 claims across both languages (0 with no traceable source, all twelve named traps checked and passed), the case study confirmed live at the real Railway origin in both locales with byte-exact figure verification, and the launch gate recorded closed on two conditions with `HOME-01` and a new editorial-pass item carried forward at equal weight.**

## Performance

- **Duration:** ~55 min
- **Tasks:** 3 (accuracy audit, live-deployment confirmation, closure records + kanban)
- **Files created:** 2
- **Files modified:** 1

## Accomplishments

- **Task 1 — the D-19 accuracy gate.** Extracted every quotation, blockquote and numeral-bearing clause from both MDX files (mechanically, via a throwaway probe, not by memory) and traced each to a named source: the four Plan 01 live-text snapshots, `04-RESEARCH.md`'s own corrections, or `ARTICLE_PLAN.md` for the beat-2 abandoned-thesis figures (which have no live page, since that piece was never published — recorded as exactly that, not left blank). **83 claims audited (42 EN, 41 DE): 42 MATCHED verbatim, 41 PARAPHRASE, 0 with no traceable source.** All twelve named trap checks — IB vs Illes Balears, EU-27 not EU-15, 1993 not "around 1990", PPP dollars not euros inside any `Figure` block, tenfold reserved for Extremadura alone, no causal claim ("proves"/"caused"/"debunks" absent), the relative measure promoted not invented, the rendered headline "Everyone in Mallorca Knows It" not the slug, no language count, no citation volume/issue, no attributed surprise, no World Bank/private-repo reference — pass in **both** languages, checked independently rather than assuming the English result carries over. **No prose fix was required**; both files passed on first read. `npm run test:unit` re-run as confirmation: 88/88, unchanged.
- **Task 2 — live-deployment confirmation.** Everything was already merged and pushed to `origin/master` before this plan started (commit `49566b4`), so no push happened from this worktree. Verified the deploy directly against `https://web-production-9cedb.up.railway.app`: `deploy-smoke.spec.ts` and all 9 tests in `case-study.spec.ts` pass live in both locales (including the three `<img>` elements actually decoding at 2400 `naturalWidth`, not just serving 200 headers); all five named routes respond 200; all three figure PNGs respond 200 with `content-type: image/png` and `content-length` **byte-identical** to the values recorded in `04-01-SUMMARY.md` (180335 / 132071 / 133264); the featured slot renders the real title, standfirst and link with the interim copy gone; both indexes reflect their published state; `/` still carries `noindex` and contains no `github.com`, `ib-gdp-evolution` or `target="_blank"`.
- **Task 3 — closure records.** `launch-gate.md` names the two Phase 2/3 launch-gate conditions this phase closed (`/writing` at `n=0`, the featured slot's interim state), cites the exact test assertion that proves each, and records that net production code change for the phase was zero (the slot was already wired to `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)`; publishing the MDX with `draft: false` was the entire mechanism). Four open items recorded with owning phases; `HOME-01` and the new user-editorial-pass item are restated in full — not by reference — and carried at equal weight, both blocking Phase 6's `FIND-02`. `_pm/kanban.md` updated: Phase 4 moved to Done with what shipped; Phase 3 backfilled to Done too (a pre-existing tracking gap, corrected in scope — see Decisions Made).

## Task Commits

1. **Task 1: Run the D-19 accuracy gate and commit the record** — `8625583` (docs)
2. **Task 2: Deploy and confirm the case study is live in both locales** — `745ff7f` (docs)
3. **Task 3: Record the launch-gate closure, carry the tripwire forward, update the kanban** — `8b1fba0` (docs)

**Plan metadata:** (pending — this summary's own commit)

## Files Created/Modified

- `.planning/phases/04-the-case-study/fact-check.md` — the D-19 accuracy gate: 226 lines, 8 tables (twelve trap checks, EN/DE quotations, EN/DE numeral claims, EN/DE figure captions), row counts, verification commands
- `.planning/phases/04-the-case-study/launch-gate.md` — 176 lines: live-deployment confirmation (16 checks against the real origin), closure record for two conditions, open-items table with owning phases, `HOME-01` and the editorial-pass item restated in full
- `_pm/kanban.md` — Phase 4 (and the backfilled Phase 3) moved from `## Next` to `## Done`

## Decisions Made

See `key-decisions` in the frontmatter above for the full rationale on: (1) never spelling the literal disallowed-result token in `fact-check.md`, to satisfy the plan's own whole-file grep check; (2) reconciling the plan's "two entries" interface wording against what `/writing` actually ships (one real entry, which is what the cited test proves closes the gate); (3) backfilling Phase 3 into `kanban.md`'s Done list alongside Phase 4, correcting a pre-existing gap in scope.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `fact-check.md`'s first draft failed its own literal acceptance check**

- **Found during:** Task 1, self-verification pass after writing the file
- **Issue:** the plan's acceptance criteria requires `grep -c UNSOURCED .planning/phases/04-the-case-study/fact-check.md` to return `0` — a whole-file, case-sensitive check. My first draft used the literal uppercase result-category name (per the plan's own instruction to name it as one of three column values) in the methodology prose, in two "0 MATCHED... 0 [that token]" summary lines, in a row-count table cell, and inside a reproduced verification command — six lines total, all explanatory rather than an actual finding, but the check does not distinguish explanatory use from a real finding.
- **Fix:** rewrote every occurrence to describe the same concept without the literal uppercase token: the methodology section now describes the disallowed outcome descriptively, the two summary lines say "0 with no traceable source", the table row is labelled "No traceable source", and the reproduced verification command uses a `<disallowed-result-value>` placeholder instead of the literal string.
- **Files modified:** `.planning/phases/04-the-case-study/fact-check.md`
- **Verification:** `grep -c UNSOURCED .planning/phases/04-the-case-study/fact-check.md` returns `0`; separately confirmed the seven required trap-check strings (`International Baccalaureate`, `EU-15`, `World Bank`, `ib-gdp-evolution`, `Everyone in Mallorca Knows It`, `1993`, `PPP`) are each still present with a nonzero count.
- **Committed in:** `8625583` (the fix was made before the commit, not as a separate patch)

**2. [Rule 1 - Bug] `_pm/kanban.md`'s Phase 3 entry was never moved to Done**

- **Found during:** Task 3, reading `kanban.md` before editing it
- **Issue:** Phase 3 ("Work List & Landing Skeleton") was still listed under `## Next` even though Phase 4 — which this plan is closing out, and which structurally depends on Phase 3's featured-slot scaffolding — was about to be marked Done. A reader of the kanban alone would see Phase 4 complete while its own prerequisite still showed as not-yet-started, which is a defect in the tracking artifact this task is responsible for keeping correct.
- **Fix:** backfilled a Phase 3 "Done" entry (dated 2026-08-31, matching the phase's actual completion) alongside the new Phase 4 entry, summarizing what Phase 3 shipped.
- **Files modified:** `_pm/kanban.md`
- **Verification:** `_pm/kanban.md`'s `## Next` section now lists only Phases 5 and 6; `## Done` lists Phases 1 through 4 in order.
- **Committed in:** `8b1fba0`

---

**Total deviations:** 2 auto-fixed (1 Rule 1 — a self-inflicted acceptance-check failure caught and fixed before commit; 1 Rule 1 — a pre-existing tracking-record gap corrected in scope).
**Impact on plan:** Both fixes are corrections to this plan's own output artifacts (the fact-check file's compliance with its own acceptance criteria; the kanban's internal consistency). No scope creep into code, content or unrelated files.

## Issues Encountered

- `probe.mjs`'s first version used a straight-ASCII-quote regex to extract German guillemet-quoted spans (`„…"`), which silently matched nothing (0 of 20+ quotations extracted) because the German closing quote character is U+201C (`"`), not the ASCII `"` the regex was built around. Diagnosed by inspecting the actual codepoints of a known quoted sentence directly (`ch.codePointAt(0)`), then fixed the regex to match the correct closing character. This was caught before any claim was recorded as unsourced on the strength of the broken extraction — the probe's output was cross-checked by eye against a sample before being trusted.
- Complex multi-command Bash invocations (heredocs, `for` loops, chained `&&`) were repeatedly rejected by the worktree-isolation sandbox as "too complex to verify." Every such command was split into single, plain invocations (one `curl`, one `grep`, one `node` call per Bash tool call) for the remainder of the plan — slower but had no effect on the verification's completeness.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**Phase 5 (Backlog) inherits, without needing to re-derive it:**
- The backlog stub (`section#backlog`) is the one item Phase 5 owns closing, per `launch-gate.md`'s open-items table.
- `HOME-01` (the positioning sentence) and the user's editorial pass over both case studies are both carried forward at equal weight as pre-conditions on Phase 6's `FIND-02` — Phase 5 does not need to act on either, but must not let them drop out of the carried-forward state it hands to Phase 6.
- The contact stub and `/cv`'s interim body remain Phase 6's to close, unchanged by this plan.
- No blockers for Phase 5. This plan touched no file Phase 5 needs to read differently than documented in `launch-gate.md` and `fact-check.md`.

**Suite state at hand-off:** `npm run test:unit` 88/88 pass; `npm run lint` exactly 1 pre-existing deferred error (`use-prefers-reduced-motion.ts:23`); `npx playwright test tests/deploy-smoke.spec.ts` and `tests/case-study.spec.ts` both pass against the live Railway URL; `git status --porcelain` empty; `next-env.d.ts` untouched (no local build was run — all verification used the live deployment directly).

## Self-Check: PASSED

- FOUND: `.planning/phases/04-the-case-study/fact-check.md`
- FOUND: `.planning/phases/04-the-case-study/launch-gate.md`
- FOUND commit: `8625583`
- FOUND commit: `745ff7f`
- FOUND commit: `8b1fba0`
- `grep -c UNSOURCED .planning/phases/04-the-case-study/fact-check.md`: `0`
- `grep -c "International Baccalaureate\|World Bank\|EU-15\|ib-gdp-evolution\|github.com" content/the-chart-therefore-changes.mdx`: `0`
- `grep -c "International Baccalaureate\|World Bank\|EU-15\|ib-gdp-evolution\|github.com" content/die-darstellung-aendert-sich.mdx`: `0`
- `grep -c POSITIONING_PLACEHOLDER .planning/phases/04-the-case-study/launch-gate.md`: `1` (≥1 required)
- `npm run test:unit`: 88/88 pass
- Live: `PLAYWRIGHT_BASE_URL=https://web-production-9cedb.up.railway.app npx playwright test tests/deploy-smoke.spec.ts`: 1/1 pass
- Live: `PLAYWRIGHT_BASE_URL=https://web-production-9cedb.up.railway.app npx playwright test tests/case-study.spec.ts`: 9/9 pass
- Live: three `/case-study/*.png` paths all 200, `image/png`, byte-exact `content-length`
- Live: `/` carries `<meta name="robots" content="noindex"/>`
- `git status --porcelain`: clean

---
*Phase: 04-the-case-study*
*Completed: 2026-08-31*
