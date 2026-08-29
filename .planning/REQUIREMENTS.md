# Requirements: Guillem Web

**Defined:** 2026-08-29
**Milestone:** v1.0 Working Site
**Core Value:** A visitor scanning a shortlist can tell within ninety seconds that Guillem has editorial judgment as well as craft — enough to decide the conversation is worth opening.

> Category IDs restart for this milestone. The previous v1.0 scope (`LAND`, `INTX`,
> `POSI`, `LINK`, `TECH`) described a hero-plus-GitHub-link site that was never built;
> reusing those IDs for a different product would make traceability ambiguous.

## v1 Requirements

Requirements for milestone v1.0. Each maps to exactly one roadmap phase.

### Landing View

- [ ] **HOME-01**: Visitor can read a single positioning sentence on the landing view stating what Guillem does.
- [ ] **HOME-02**: Visitor can see one featured piece given clear visual primacy on the landing view.
- [ ] **HOME-03**: Visitor can reach the work list, backlog, writing index, CV, and contact block from the landing view.
- [ ] **HOME-04**: Visitor sees a landing layout that stays legible with only three work items — lists and prose, no card grids or three-across rows.
- [ ] **HOME-05**: Visitor sees a deliberate typographic system that reads as authored rather than framework-default.

### Case Study

- [ ] **CASE-01**: Visitor can read a published case study covering ib-gdp-evolution.
- [ ] **CASE-02**: Visitor can follow the case study through six parts: the question, Guillem's stated prior expectation, what the data actually showed, how the visual form changed in response, the shipped result, and a methodology note.
- [ ] **CASE-03**: Visitor can reach the case study from the landing view's featured slot.

### Work List

- [ ] **WORK-01**: Visitor can see a vertical list of Guillem's interactive projects.
- [ ] **WORK-02**: Visitor can read a one-line annotation per project describing what it is about rather than what it was built with.

### Backlog

- [ ] **BACK-01**: Visitor can see a backlog of work in progress, each item carrying a name and a rich-text description.
- [ ] **BACK-02**: Visitor can see a single "last touched" date for the backlog section as a whole.

### Writing Archive

- [ ] **WRIT-01**: Visitor can browse an index of Guillem's writing hosted on the site.
- [ ] **WRIT-02**: Visitor can see the archive grouped as two completed series — security headers and Git — plus standalone posts, rather than a flat chronological list.
- [ ] **WRIT-03**: Visitor can read any migrated post in full on the site, with code samples rendering correctly.

### Profile and Contact

- [ ] **PROF-01**: Visitor can read Guillem's CV as a page on the site.
- [ ] **PROF-02**: Visitor can see a photograph of Guillem.
- [ ] **PROF-03**: Visitor can obtain Guillem's email address, obfuscated against scrapers while remaining reachable by keyboard and screen reader.
- [ ] **PROF-04**: Visitor can open Guillem's GitHub profile.
- [ ] **PROF-05**: Visitor can open Guillem's LinkedIn profile.

### Foundation and Deployment

- [ ] **BUILD-01**: The site runs as a Next.js application.
- [ ] **BUILD-02**: The site is deployed on Railway and reachable at a stable public URL.
- [ ] **BUILD-03**: Visitor can use the site on both desktop and mobile browsers.
- [ ] **BUILD-04**: Visitor loading the site receives real security response headers, demonstrating in practice what the migrated series describes.
- [ ] **BUILD-05**: Visitor with a reduced-motion preference set is not shown motion that ignores it.
- [ ] **BUILD-06**: Fonts are self-hosted and the page does not shift layout as they load.

### Discoverability

- [ ] **FIND-01**: Visitor pasting the site URL into Slack or a DM sees a correct title, description, and preview image.
- [ ] **FIND-02**: Search engines can index the site through a sitemap and robots file.

## v2 Requirements

Deferred to a future milestone. Tracked but not in this roadmap.

### Writing

- **WRIT-04**: Visitor can filter writing by type or tag (case study, book summary, commentary, learning, how-to).
- **WRIT-05**: Visitor can read book summaries, commentary and learnings as posts within the writing.
- **WRIT-06**: Visitor following a 2020 URL from the old GitHub Pages site is redirected to the equivalent post here. *(Deferred deliberately. Research flags URL preservation as a one-way door — retrofitting redirects after migration costs more than deciding the slug scheme up front.)*
- **WRIT-07**: Visitor sees a framing line atop the writing index acknowledging the archive is carried-over writing.

### Case Study

- **CASE-04**: Visitor can see one rejected alternative chart form beside the shipped one. *(Research called this the clearest single visible signal of editorial judgment available.)*
- **CASE-05**: Visitor can open the live ib-gdp-evolution piece from the case study.

### Landing

- **HOME-06**: Visitor sees case studies surfaced directly on the landing view once there is more than one.

### Profile

- **PROF-06**: Visitor can print the CV page cleanly to PDF via a print stylesheet.

### Richer Interaction

- **RICH-01**: Visitor experiences Performative-tier motion — scroll-driven variable-font hero, WebGL or Three.js elements.
- **RICH-02**: Visitor can read the backlog as encoded data or a chart. *(Requires per-item dates or states, which are out of scope for v1.)*

### Infrastructure

- **BUILD-07**: Site is served from a custom domain.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Performative-tier motion, incl. the scroll-driven variable-font hero | Deferred to the v3 tier. Fancy is earned when it arrives after the work rather than instead of it |
| Post type and tag taxonomy | Real, but premature at launch volume — v1 ships a flat index grouped by series |
| "Now playing / recently played" | The most generic element proposed; adds nothing to the subject or judgment claims |
| Blog-primary reverse-chronological homepage | The target configuration at v3 volume; at 13 posts it reads emptier than a one-pager |
| Card grids and three-across feature rows | They look empty at three items, which is the launch condition |
| Contact form | An obfuscated email address does the same job with no backend |
| Custom domain | Unresolved (guillemgelabert.com vs guillem.ch); v1 ships on the Railway URL |
| Per-item backlog dates or states | Explicit user decision. Accepted risk logged in PROJECT.md; partially mitigated by the section-level date in BACK-02 |
| Headless CMS or database | Disproportionate at roughly fifteen content files, single author |
| Static export (`output: 'export'`) | Forecloses `next.config` `headers()`, which BUILD-04 depends on |
| Animation library, state manager, component library | No surface in v1 earns the weight |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUILD-01 | Phase 1 | Pending |
| BUILD-02 | Phase 1 | Pending |
| BUILD-03 | Phase 1 | Pending |
| BUILD-05 | Phase 1 | Pending |
| BUILD-06 | Phase 1 | Pending |
| HOME-05 | Phase 1 | Pending |
| WRIT-01 | Phase 2 | Pending |
| WRIT-02 | Phase 2 | Pending |
| WRIT-03 | Phase 2 | Pending |
| WORK-01 | Phase 3 | Pending |
| WORK-02 | Phase 3 | Pending |
| HOME-01 | Phase 3 | Pending |
| HOME-03 | Phase 3 | Pending |
| HOME-04 | Phase 3 | Pending |
| CASE-01 | Phase 4 | Pending |
| CASE-02 | Phase 4 | Pending |
| CASE-03 | Phase 4 | Pending |
| HOME-02 | Phase 4 | Pending |
| BACK-01 | Phase 5 | Pending |
| BACK-02 | Phase 5 | Pending |
| PROF-01 | Phase 6 | Pending |
| PROF-02 | Phase 6 | Pending |
| PROF-03 | Phase 6 | Pending |
| PROF-04 | Phase 6 | Pending |
| PROF-05 | Phase 6 | Pending |
| BUILD-04 | Phase 6 | Pending |
| FIND-01 | Phase 6 | Pending |
| FIND-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-29*
*Last updated: 2026-08-29 after roadmap creation (6 phases, full v1 coverage)*
