# Phase 3: Work List & Landing Skeleton - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-29
**Phase:** 03-work-list-landing-skeleton
**Areas discussed:** HOME-03's dead links, The positioning sentence, Landing structure
at n=3, Work list contents & destinations, WORK-02 copy ownership

---

## Pre-discussion scouting

- `ib-gdp-evolution` is a private GitHub repo, but its site is public — so the work list
  links to the live piece, never to source.
- `watch-people-die-live` is public and was pushed the same day, but carried no homepage
  URL and no subdomain of the apex resolved (`wpd.`, `watch-people-die.`,
  `watchpeopledie.` all NXDOMAIN). Destination had to be asked for.
- Structural problem surfaced before questioning: HOME-03 requires the landing view to
  reach the backlog (Phase 5) and CV/contact (Phase 6), neither of which exists, and
  neither of which this capped run (`--to 3`) will build.

---

## HOME-03's dead links

| Option | Description | Selected |
|--------|-------------|----------|
| Build the routes as real stubs | Real pages, placeholder content, nothing 404s | ✓ |
| Nav omits what doesn't exist yet | HOME-03 unmet until Phase 6 | |
| Full nav, links disabled until live | Communicates shape; reads as unfinished | |

**User's choice:** Build the routes as real stubs.

**Notes:** Safe because Phase 1 D-07 keeps `robots: index:false` on until Phase 6.
CONTEXT.md D-02 adds the constraint that placeholder content must be deliberately
typeset — it sits on a live URL during a job hunt.

---

## The positioning sentence (HOME-01)

| Option | Description | Selected |
|--------|-------------|----------|
| You write it — I build around a placeholder | Layout ships, copy is the user's | ✓ |
| I draft options, you choose and edit | 3-5 candidates from BRIEF.md framing | |
| I write it, you review at the end | Fastest | |

**User's choice:** User writes it; Phase 3 ships a placeholder.

**Notes:** Recorded in CONTEXT.md D-08 with the explicit consequence that HOME-01 cannot
verify as met at the end of Phase 3, and that this is deferred-by-decision rather than a
gap.

---

## Landing structure at n=3

> The premise was wrong when asked — the real work-item count is two, not three. See the
> work list area below.

| Option | Description | Selected |
|--------|-------------|----------|
| Short landing, real routes behind it | Every surface linkable; risks looking thin | |
| One long page, anchored sections | Fullest at low volume; nothing deep-links | |
| Hybrid — landing scrolls, writing is routed | Landing carries sections; writing routed | ✓ |

**User's choice:** Hybrid.

**Notes:** Reinforced once the count turned out to be two — a two-item work list makes
the thin-page risk sharper, so keeping backlog and contact on the landing page matters
more, not less.

---

## Work list contents & destinations

| Option | Description | Selected |
|--------|-------------|----------|
| Three items — only finished, live work | | |
| Everything presentable, live or not | Pulls toward dev-portfolio reading | |
| Three now, designed to grow | | |

**User's response (free text):** "there's no work list yet, I have the two personal
projects"

**Notes:** This corrected the premise of the question rather than selecting from it. The
real count is **two**. Consequences applied:
- HOME-04 reworded from "three work items" to "two" in REQUIREMENTS.md, and the matching
  Phase 3 success criterion reworded in ROADMAP.md.
- PROJECT.md's "two to three interactive projects exist" is resolved as two.
- The curation and data-not-markup intents from the unselected options were retained as
  CONTEXT.md D-04 and D-05, since the free-text answer did not contradict them.

### Follow-up: destinations (free text)

**User's response:**
1. `watchpeopledie.live`
2. `ib-gdp.guillemgelabert.com/<localised-slug>` is the piece;
   `.../<localised-slug>/methodology` will be the base of the case study.

**Verified:**
- `https://watchpeopledie.live` — HTTP 200, own domain (69.46.46.21), not an apex
  subdomain. This contradicted Phase 2's D-04, which asserted projects live on
  subdomains of the apex; that decision was corrected in `02-CONTEXT.md`.
- `.../everyone-in-mallorca-agrees-on-one-thing/methodology` — HTTP 200, 136KB, `en-GB`.
- `.../auf-mallorca-weiss-es-jeder/methodik` — HTTP 200, 140KB, `de-DE`. An initial probe
  of `.../methodology` returned 404; that was a guessed URL, not a missing page. The
  nested segment is localised too (`methodology` / `methodik`), which extends Phase 2's
  D-06 beyond top-level slugs. Both languages have a full methodology.

The second answer also resolved the open question about whether the work-list entry and
the featured slot collide: they point at different things (CONTEXT.md D-07).

---

## WORK-02 copy ownership

Surfaced after the HOME-01 decision: WORK-02 is also copy, and unlike HOME-01 it is a
requirement this phase must satisfy.

| Option | Description | Selected |
|--------|-------------|----------|
| I draft the two annotations, you edit | Grounded in the live pieces; WORK-02 met | ✓ |
| Placeholders — you write them, like HOME-01 | WORK-02 would verify as unmet | |
| Draft annotations, placeholder for HOME-01 only | Same as option 1, stated explicitly | |

**User's choice:** Claude drafts the two annotations, user edits.

---

## Claude's Discretion

- Navigation form (header, anchors, index block, or combination).
- Whether outbound links to independently-hosted projects are marked as leaving the site.
- Section ordering below the positioning line.
- Whether the featured slot is visually distinct from the work list or is its first entry
  given primacy.
- How Phase 1's heading trail applies to landing section headings — Phase 1 left trail
  scope open and this is the first phase with real headings.

## Deferred Ideas

- The positioning sentence itself — user-authored, no phase.
- The featured entry's annotation — Phase 4.
- Widening the work list beyond two — considered and excluded.
- A third work item — anticipated by PROJECT.md; the list is built to take one.

## Corrections Made During This Discussion

- `02-CONTEXT.md` D-04 rewritten: projects are hosted independently with no uniform
  pattern, not uniformly on apex subdomains.
- `REQUIREMENTS.md` HOME-04: three work items → two.
- `ROADMAP.md` Phase 3 success criterion 4: three work items → two.
