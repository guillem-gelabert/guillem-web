# 06-12 Summary — the three manual rows and the milestone close

**Completed:** 2026-09-01 · **Plan:** `06-12-PLAN.md` · **Requirements:** PROF-02, PROF-03, FIND-01

## The plan's shape had to change, and this says how

`06-12-PLAN.md` is the phase's only `autonomous: false` plan. Task 1 is a blocking checkpoint that
stops and asks the user for three verdicts. This session ran under a standing instruction to
complete the milestone without pausing for input, so **the checkpoint was not put to the user.**

The honest thing is not to fake the three verdicts, and not to skip the rows either. What was done
instead, row by row, with the residue stated plainly:

| Row | What was actually done | What is still outstanding |
|---|---|---|
| **Slack unfurl** (FIND-01, G7) | Every mechanical property an unfurl reads was fetched and verified from the live origin: three cards, 200, `image/png`, decoded 1200×630, absolute, on the canonical host, distinct files, `summary_large_image` on every route. This is also where the per-post card bug was caught | **Whether the card LOOKS right.** Humane rendering, cropping, legibility at thumbnail size. A judgment about appearance — no assertion substitutes |
| **Screen-reader email pass** (PROF-03) | The mechanism is fully proven: keyboard reach, measured focus ring, accessible name, `textContent` and `href` both equal the un-escaped address, and the served bytes carry `&#64;`/`&#46;` and never `&amp;#` | **Deferred, deliberately.** `EMAIL` is `lorem.ipsum@example.com`. Reading a placeholder aloud in VoiceOver proves the mechanism a third time and says nothing about the address that will actually publish. Blocked on `HANDOFF-user-supplied.md` row 1 |
| **Optical sign-off, 375 / 1440** (D-02) | Performed by the agent against the live deploy at both widths, geometry measured rather than eyeballed, both pages looked at. Recorded in `06-12-optical.md` | **The owner's eye.** "Reads as authored" is the actual question, and it is why every prior phase closed with this row |

**None of the three is recorded as a completed owner sign-off**, in `audit.md` §7 or anywhere else.
All three carry ⚠️, not ✅.

## What the optical pass found

Clean at both widths: zero horizontal overflow, two font weights, at most four sizes, zero radius,
zero icons, portrait at 240×320 sitting inside the column (Pitfall 10 held), no apology marker.

One observation filed for the owner rather than as a defect: **the section rules run the full
1377px while content sits in a 663px measure**, leaving ~700px of bare rule per section head at
1440. Consistent across both pages and a legitimate editorial choice — but it is the live instance
of Phase 3's open optical item, and the remedy if wanted is pre-specified: more space from the
existing seven tokens, never a fifth type size.

**The portrait panel reads as a deliberate empty frame, not a failed image load.** That was the open
risk in generating it at all, and it is the one thing worth confirming visually about the fill.

## Tracking closed

`ROADMAP.md` (Phase 6 12/12, complete, with the G14 amendment recorded) · `REQUIREMENTS.md` (all
eight Phase 6 requirements, each stating whether its *surface* or its *content* is done) ·
`STATE.md` (milestone-complete, T1–T4 blockers, seven Phase 6 decisions, deferred table extended) ·
`_pm/kanban.md` · `.planning/HANDOFF.md`.

## Verdict

**v1.0 is complete and deliberately not indexed.** Six of fourteen gate rows pass outright; the rest
are copy, and all of it is the user's. There is no engineering work left between here and an indexed
site.

Suite at close: **132 unit (0 skipped) · 38 build-tier · 173 Playwright**, green from a clean build.
`npx tsc --noEmit` clean. `npm run lint` at its one known re-deferred error.
