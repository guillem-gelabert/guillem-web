# Phase 3: Work List & Landing Skeleton - Context

**Gathered:** 2026-08-29
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase assembles the landing view: the positioning line, the vertical work list of
two projects, the navigation surface reaching every other section, and stub routes for
the sections that later phases fill.

It builds structure and layout, not the site's argument. Two pieces of copy are
explicitly *not* produced here — the positioning sentence (the user writes it) and the
featured entry's final annotation (Phase 4 supplies it once the case study exists).

**Not in this phase:** the case study itself (Phase 4), backlog content (Phase 5), CV
and contact content (Phase 6), the writing pipeline (Phase 2).

</domain>

<decisions>
## Implementation Decisions

### Landing Structure

- **D-01: Hybrid — the landing scrolls, long-form content is routed.** The positioning
  line, featured piece, work list, backlog and contact live as sections on `/`. Writing
  and the case study are real routes (`/writing`, `/writing/[slug]`) per Phase 2.
  Rationale: at two work items and one case study, several thin pages read emptier than
  one substantial page, which is PROJECT.md's stated launch risk — while long-form
  content still needs to be linkable and shareable on its own URL.

- **D-02: Unbuilt sections ship as real stub routes/sections, not omitted and not
  disabled.** `/cv` exists as a real page; backlog and contact exist as real landing
  sections. All carry placeholder content and correct metadata. Nothing 404s and nothing
  renders as visibly greyed-out or pending — a visitor in a ninety-second scan reads
  disabled navigation as an unfinished site, which is anti-goal territory.
  - Phases 5 and 6 *fill* these surfaces; they do not create them.
  - Safe to ship thin because Phase 1's `robots: { index: false }` (Phase 1 D-07) stays
    on until Phase 6.
  - **Planner note:** placeholder content must be deliberately typeset, not lorem ipsum
    and not an empty element. It is on a live URL during a job hunt.

### Work List

- **D-03: The work list has exactly two items.** ib-gdp-evolution and Watch People Die.
  PROJECT.md's "two to three interactive projects" is resolved: it is two. HOME-04 and
  the Phase 3 success criterion were both corrected from "three" to "two" on 2026-08-29.
  - This makes the thin-layout risk sharper, not softer, and is part of why D-01 keeps
    the landing scrolling rather than routing everything out.

- **D-04: The list stays curated — finished, live work only.** Other repositories
  (Mallorca campaign site, popup simulator, the Mazzucato summary, and similar) are
  deliberately excluded. PROJECT.md's core risk is reading as a dev portfolio, and a
  longer list of uneven pieces pulls directly toward it.

- **D-05: Work-list entries are data, not markup.** Adding a third item later must be a
  content change, not a layout change.

- **D-06: Destinations are the live pieces, hosted independently.** Verified:
  - ib-gdp-evolution → `https://ib-gdp.guillemgelabert.com/<localised-slug>`
    (EN: `everyone-in-mallorca-agrees-on-one-thing`,
    DE: `auf-mallorca-weiss-es-jeder` — both HTTP 200)
  - Watch People Die → `https://watchpeopledie.live` (HTTP 200, its own domain)
  - **Hosting is per-project and has no uniform pattern.** One is an apex subdomain, the
    other is a separate domain entirely. Do not derive URLs from a rule; use these.
  - The `ib-gdp-evolution` GitHub repo is **private**. Never link to source for it.

- **D-07: The work-list entry and the featured slot point at different things.** The
  work-list entry links to the live piece on its own host. The featured slot (CASE-03)
  links to the case study at `/writing/[slug]`. They do not duplicate each other.

### Copy Ownership

- **D-08: The positioning sentence (HOME-01) is the user's to write.** Phase 3 ships the
  layout and typography around a clearly-marked placeholder. Nothing blocks on it.
  - **Consequence:** HOME-01 cannot be verified as met at the end of Phase 3. This is
    intended, not a gap. Verification should record it as deferred-by-decision.

- **D-09: The two work-list annotations (WORK-02) are drafted for the user to edit.**
  Unlike the positioning sentence these are descriptive rather than self-positioning, and
  can be grounded by reading both live pieces. WORK-02 is therefore genuinely met by this
  phase.
  - Constraint from PROJECT.md: each annotation says what the piece is *about*, never
    what it was built with. Engineering is demonstrated, never claimed in copy.

- **D-10: The featured entry's annotation stays a placeholder until Phase 4.** Carried
  forward from the ROADMAP phase goal — the work-list *code* has no dependency on the
  case study existing; only that one line does.

### Claude's Discretion

- Navigation form — persistent header, in-page anchors, an index block, or a combination.
  Constraint: it must reach work list, backlog, writing index, CV and contact (HOME-03),
  and must not read as unfinished.
- Whether and how outbound links to independently-hosted projects are marked as leaving
  the site.
- Section ordering on the landing view below the positioning line.
- Whether the featured slot is visually distinct from the work list or is the work list's
  first entry given primacy.
- How the heading trail (Phase 1) applies to landing section headings — Phase 1 left
  trail scope open, and this is the first phase with real headings to apply it to.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream phase contracts
- `.planning/phases/01-deploy-foundation-design-system/01-CONTEXT.md` — type system,
  D-05 (`/` is a holding page this phase replaces), D-06 (holding copy is name only —
  superseded here), D-07 (`robots: index:false` until Phase 6, which is what makes
  shipping stubs safe).
- `.planning/phases/01-deploy-foundation-design-system/01-UI-SPEC.md` — the design
  contract this phase's layout must conform to.
- `.planning/phases/02-content-pipeline/02-CONTEXT.md` — D-09 (case study is a post at
  `/writing/[slug]`, which the featured slot targets), D-10 (index treatment), D-05/D-06
  (EN/DE routing and localised slugs, which the nav must accommodate).

### Design direction
- `BRIEF.md` — §5 design principles, §8 aesthetic direction and the "looks like data,
  isn't" trap, §9 anti-goals. Anti-goal #4 (reading as a wishlist) and the
  ninety-second scan constraint both bear directly on D-02.
- `.planning/PROJECT.md` — §1 allocation principle (engineering demonstrated, never
  claimed) governs every line of copy here. Out of Scope names card grids and
  three-across rows explicitly.

### Requirements
- `.planning/REQUIREMENTS.md` — WORK-01, WORK-02, HOME-01, HOME-03, HOME-04. Note
  HOME-04 was corrected from three items to two on 2026-08-29.

### Live destinations (verified 2026-08-29)
- `https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing` — EN piece.
- `https://ib-gdp.guillemgelabert.com/auf-mallorca-weiss-es-jeder` — DE piece.
- `https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing/methodology`
  — EN methodology, HTTP 200 (136KB).
- `https://ib-gdp.guillemgelabert.com/auf-mallorca-weiss-es-jeder/methodik`
  — DE methodology, HTTP 200 (140KB). Note the path segment itself is localised
  (`methodology` / `methodik`). Both languages have a full methodology, so Phase 4's
  bilingual case study has source material in both.
- `https://watchpeopledie.live` — Watch People Die, own domain.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
At planning time Phases 1 and 2 will have produced:
- The Next.js App Router scaffold, type system, and reduced-motion primitive (Phase 1).
- The heading trail component (Phase 1) — this phase is the first with real section
  headings to apply it to.
- `/writing` and `/writing/[slug]` routes plus the writing index (Phase 2) — HOME-03's
  writing-index link targets these; do not build a second index.
- The locale routing established in Phase 2 — landing navigation must work within it.

### Established Patterns
- Deploy-first increments (Phase 1 D-08): every commit leaves the Railway URL working.
- Type system is the source of truth; no competing scale.
- Copy never claims engineering (PROJECT.md).

### Integration Points
- `/` replaces Phase 1's holding page. Phase 1 D-06 deliberately kept that copy to a
  name only so nothing would need unwinding here.
- The featured slot is the contract with Phase 4 (CASE-03).
- The backlog and CV/contact stubs are the contract with Phases 5 and 6.

</code_context>

<specifics>
## Specific Ideas

- Two items is the real count, and the layout must be designed for two rather than
  degraded from a larger grid.
- Placeholder content on stub surfaces should look authored — the site is live and
  visible during a job hunt even while noindexed.
- The work list points outward to independently-hosted work; the featured slot points
  inward to the case study. That asymmetry is intentional.

</specifics>

<deferred>
## Deferred Ideas

### Positioning sentence — user-authored, no phase
HOME-01's copy. Layout ships with a placeholder in Phase 3; the sentence arrives
whenever the user writes it.

### Featured annotation — Phase 4
The one line describing the case study, per the ROADMAP phase goal.

### Widening the work list — future
Mallorca campaign site, popup simulator, Mazzucato summary and similar were considered
and excluded (D-04). D-05 keeps entries as data so adding one later is a content change.

### Third work item — future
PROJECT.md anticipated "two to three". If a third finished piece lands, the list is
already built to take it.

</deferred>

---

*Phase: 03-work-list-landing-skeleton*
*Context gathered: 2026-08-29*
