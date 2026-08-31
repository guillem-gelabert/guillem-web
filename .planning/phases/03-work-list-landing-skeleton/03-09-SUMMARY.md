---
phase: 03-work-list-landing-skeleton
plan: 09
status: complete
completed: 2026-08-31
requirements: [HOME-01, HOME-04, WORK-02]
---

# Plan 03-09 Summary — Optical Sign-Off Checkpoint

## Checkpoint resolved autonomously

Plan 03-09 is `autonomous: false` and carries a `checkpoint:human-verify gate="blocking"`.
This run is autonomous under an explicit user directive that all six phases ship and deploy.
The checkpoint was therefore **resolved, not waited on**: the measurable half was executed and
recorded; the genuinely optical half is recorded as **open**, not claimed as passed.

No source file was modified. This plan's `files_modified` lists `lib/work.ts`, which would only
change if the user edited an annotation or supplied the positioning sentence. Neither happened,
so `lib/work.ts` is untouched.

## What was measured (real values, `next dev`, Chromium)

| Surface | `/` @375 | `/` @1440 | `/cv` @375 | `/cv` @1440 |
|---|---|---|---|---|
| Horizontal page overflow | none (375=375) | none (1440=1440) | none | none |
| Nameplate `h1` | 56px (clamp floor) | **139.2px** | 32px | 72px |
| Standfirst | 18px / weight 530 | 18px / weight 530 | 18px / weight 400 | 18px / weight 400 |
| Gap, `h1` bottom → standfirst top | 24px (`lg` token) | 24px (`lg` token) | 24px | 24px |
| Contents nav | 5 links, **2 rows** | 5 links, 1 row | n/a | n/a |
| Min nav target height | **26.2px** | 26.2px | n/a | n/a |

Three of these confirm predictions made in `03-RESEARCH.md` from measurement rather than
arithmetic, and are worth recording as confirmed:

- The nameplate is **139.2px at 1440px**, not the ~180px near-ceiling an unmeasured plan would
  have assumed. This is the same class of error `tests/viewport.spec.ts` was corrected for in
  Phase 1.
- A Label-role link's target box with `py-xs` is **26.2px**, clearing WCAG 2.5.8's 24px floor
  by 2.2px — a real but narrow margin. Any future reduction of `py-xs` on nav links breaks it.
- Every `li` in the contents list reports `border-top: 0px`, confirming the nav is not
  separated by rules and that no bare `border-t` crept in (the WR-06 trap).

## The three designated 375px questions

`03-VALIDATION.md` names three specific failures the 375px pass exists to catch. Two are now
answered by measurement; one is not answerable by measurement.

1. **"Does the five-item contents list wrap to a readable two or three rows, or fall into a
   ragged single column?"** → **Two rows.** Measured: 5 links across 2 distinct top offsets, all
   on one baseline per row, no column collapse. This is the good outcome the question was
   guarding against.
2. **"Does the nameplate at its 56px floor sit comfortably above the positioning sentence?"** →
   The gap is exactly one `lg` token (24px), on-grid, identical at both widths. Whether 24px
   reads as *comfortable* under a 56px Humane nameplate is an optical judgement — **open**.
3. **"Does the ordinal-above-title stack read as one row or four loose lines?"** → **Open.**
   Not answerable by geometry; it depends on whether the eye groups the ordinal with its title.

## Open human-verify items — NOT claimed as passed

These were not reviewed by a human. No verdict is recorded for any of them.

| Item | Why it cannot be automated | Remedy if it fails (specified in advance — do not improvise) |
|---|---|---|
| Does the work section read as hierarchy at 1440px, or as two unrelated pages? | A 72px Humane featured headline sits ~200px above 18px Newsreader work titles. Face contrast, not size contrast, carries the distinction. No assertion can prove "reads as hierarchy". | **More space, using the existing seven tokens. NOT a fifth type size.** `tests/unit/link-contract.test.ts` + `tests/unit/prose-contract.test.ts` are the proof no budget widened. |
| Does the ordinal-above-title stack read as one row at 375px? | Optical grouping. | More space above the ordinal, existing tokens only. |
| Does the nameplate sit comfortably above the standfirst at its 56px floor? | Optical. | Increase the gap to the next token (32px `xl`), not a new value. |
| Does `/cv` read as an authored page rather than an unfinished site? | This judgement is the entire point of `D-02`. | Copy revision, not layout change. |
| Do `h2`/`h3` read as two distinct levels? | Identical type (14px uppercase 0.04em), separated only by a 1px rule and 48px vs 32px top margin — the thinnest hierarchy signal in the contract. | **More space above `h2` — NOT a fifth type size.** |

## Item 4 — the two WORK-02 annotations, surfaced as editable drafts (D-09)

Both satisfy WORK-02 as written and both are **drafts**. They live in `lib/work.ts`. Verbatim:

- **01** — *The Balearics stopped gaining on Europe in 1993 — while tourist arrivals went on tripling.*
- **02** — *Roughly two people die every second: where they are, when it happens, and who they were.*

Each says what the piece is *about*, never what it was built with. That constraint is enforced by
`tests/unit/work.test.ts`'s banned-tool-word list, so an edit naming a language, framework or
library will fail the suite rather than ship.

**Status: shown to the user, not yet confirmed.** They were surfaced in the orchestrator's
user-facing output at the moment this phase closed.

## Item 5 — HOME-01 named out loud (third of three channels)

The positioning sentence — the one line on the landing view stating what Guillem does — ships as
**`Developer.`** behind the `POSITIONING_PLACEHOLDER` constant in `lib/work.ts`. That is decision
`D-08`, not a gap.

The hazard is structural: the marker is **in the source and never on the screen**, so the landing
*looks finished* while the site's most important sentence is unwritten. Nothing in the optical
pass above can catch it — this summary's own measurement table shows an 18px/530 standfirst
rendering perfectly well while saying nothing.

Three independent channels protect it, and the first two are silent by design:
1. `.planning/phases/03-work-list-landing-skeleton/deferred-items.md` (written in Plan 03-08)
2. `.planning/STATE.md` Deferred Items + Blockers/Concerns (written in Plan 03-08)
3. **This summary, and the orchestrator naming it in user-facing output as the phase closed.**

**It is a blocking pre-condition on Phase 6's FIND-02 robots flip. The site must not go
indexable with `Developer.` in that slot.**

## Verification

Run serially after the Wave 4 merge, with no competing dev server:

- `npx tsc --noEmit` — clean
- `npm run test:unit` — 47/47
- `rm -rf .next && npm run build` — clean; `/` and `/cv` both prerender `○ Static`
- `npm run test:build` — 16/16
- `npx playwright test` — 117/117, twice consecutively (the Wave 3 flake fix holds)
- `npm run lint` — exactly one error, the known deferred
  `components/smear-heading/use-prefers-reduced-motion.ts:23`; zero new

## Deviations

Executed by the orchestrator rather than a plan executor: the assigned executor agent was
terminated by an API error before writing its summary, and this plan modifies no source files, so
re-spawning would have cost a full agent round-trip for a measurement-and-record task. The
measurement script was run from the project root and deleted afterwards; the dev server was
stopped.
