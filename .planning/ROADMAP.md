# Roadmap: guillem-web — v1.0 Working Site

## Overview

Six phases take the repo from its current state (a leftover static-prototype Dockerfile, no Next.js code) to a shipped, content-led site: a live deploy with the typographic design system in place, the legacy writing archive migrated under one domain, the landing view and work list, the ib-gdp-evolution case study that closes the "no editorial judgment" gap, the backlog, and finally the CV/contact/photo surfaces plus discoverability. Deployment and content-migration risk are retired early; the case study — the long pole, and the only artifact that can prove editorial judgment — gets its own phase, sized for writing effort rather than technical effort.

**Departure from research's suggested 7-phase structure:** SUMMARY.md's "Implications for Roadmap" proposed a separate Phase 2 ("Content Pipeline") ahead of Phase 3 ("Writing Archive Migration"). This roadmap merges them into one phase. Reasoning: the content-pipeline loader/renderer has no requirement of its own — its only observable proof is the migrated writing itself — so splitting "build the plumbing" from "prove the plumbing with real content" into two separate roadmap phases reproduces the horizontal-layer anti-pattern (a phase nothing can be verified against until the next phase lands). Folding them into one phase keeps every phase's success criteria checkable by a human and still lets the phase's *plan* sequence a stub-post proof before the real 13-post migration, per ARCHITECTURE §8 and PITFALLS' migration guidance. Every other phase boundary, and the ordering rationale, follows SUMMARY.md directly.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Deploy Foundation & Design System** - Delete the stale Dockerfile, stand up Next.js on Railway, and lay down the typographic system and accessibility defaults before any content exists.
- [ ] **Phase 2: Content Pipeline & Writing Archive Migration** - Build the frontmatter/MDX loader and migrate all 13 legacy posts, grouped into two series, at a deliberately chosen URL scheme.
- [ ] **Phase 3: Work List & Landing Skeleton** - Assemble the landing view's positioning sentence, navigation, and vertical work list; leave the featured slot pointed at a placeholder.
- [ ] **Phase 4: The Case Study** - Write and publish the ib-gdp-evolution case study and wire the landing view's featured slot to it.
- [ ] **Phase 5: Backlog** - Ship the curated, section-dated backlog of work in progress.
- [ ] **Phase 6: CV, Contact, Photo & Discoverability** - Complete the CV page, photograph, contact block, real security headers, and search/social metadata.

## Phase Details

### Phase 1: Deploy Foundation & Design System
**Goal**: The site exists as a live, deployed Next.js application with its typographic design system and accessibility defaults in place before any content is built. The first task of this phase is deleting the repo's existing `Dockerfile` and `nginx.conf.template` — Railway auto-prioritizes a root Dockerfile over its zero-config builder with no override, so leaving it in place would silently deploy the wrong app behind a green build.
**Depends on**: Nothing (first phase)
**Requirements**: BUILD-01, BUILD-02, BUILD-03, BUILD-05, BUILD-06, HOME-05
**Success Criteria** (what must be TRUE):
  1. Visitor can load a live Next.js site at a stable Railway URL — not the old static prototype (the pre-existing `Dockerfile`/`nginx.conf.template` are deleted before the first deploy).
  2. Visitor sees a deliberate, authored typographic system (type scale, self-hosted fonts) rather than framework-default styling, correctly on both a mobile-width and a desktop-width viewport.
  3. Visitor loading any page sees no layout shift as fonts load.
  4. Visitor with `prefers-reduced-motion` set is shown no motion that ignores it, gated from the first component built rather than retrofitted later.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Content Pipeline & Writing Archive Migration
**Goal**: The legacy 2020 writing lives on the site under one domain and one design, proven through a real content pipeline (plain Markdown for migrated posts, MDX available for new writing) rather than a stub. The URL slug scheme and the series-grouping metadata are both one-way-door decisions and must be settled in this phase, while all 13 files are already being touched — not retrofitted later.
**Depends on**: Phase 1
**Requirements**: WRIT-01, WRIT-02, WRIT-03
**Success Criteria** (what must be TRUE):
  1. Visitor can browse a writing index listing all 13 migrated posts, grouped as two completed series (security headers, Git) plus standalone posts — not a flat chronological list.
  2. Visitor can open any migrated post at its new `/writing/[slug]` URL and read it in full, with every code sample rendered through real syntax highlighting — no literal Liquid tags, no unstyled text.
  3. A documented old→new slug map exists covering all 13 posts, mapping each original `/posts/[slug]` path to its new URL — decided once, now, so the deferred v2 redirect requirement (WRIT-06) stays cheap to add later instead of requiring every file to be re-touched.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Work List & Landing Skeleton
**Goal**: The landing view assembles its navigation surface and vertical work list. The work-list *code* has no dependency on the case study existing; only the featured entry's final annotation copy does (see Phase 4) — so this phase builds everything except that one line.
**Depends on**: Phase 1, Phase 2
**Requirements**: WORK-01, WORK-02, HOME-01, HOME-03, HOME-04
**Success Criteria** (what must be TRUE):
  1. Visitor can read a single positioning sentence on the landing view stating what Guillem does.
  2. Visitor can see a vertical list of Guillem's interactive projects, each with a one-line annotation describing what it's about rather than what it was built with.
  3. Visitor can reach the work list, backlog, writing index, CV, and contact block from the landing view.
  4. Visitor sees a landing layout that stays legible with only three work items — lists and prose, no card grids or three-across rows.
**Plans**: TBD
**UI hint**: yes

### Phase 4: The Case Study
**Goal**: The ib-gdp-evolution case study is written and published, and the landing view's featured slot is wired to it. This is the milestone's long pole — writing effort, not technical effort — and per the evidence audit it is the only artifact that can close the "talented developer, no editorial judgment" gap. It is scoped on its own, not bundled with unrelated technical work.
**Depends on**: Phase 2, Phase 3
**Requirements**: CASE-01, CASE-02, CASE-03, HOME-02
**Success Criteria** (what must be TRUE):
  1. Visitor can read a published case study covering ib-gdp-evolution.
  2. Visitor can follow the case study through six parts: the question, Guillem's stated prior expectation, what the data actually showed, how the visual form changed in response, the shipped result, and a methodology note.
  3. Visitor can reach the case study from the landing view's featured slot, which now carries clear visual primacy over a real piece rather than a placeholder.
  4. Visitor reading the work list sees the featured entry's annotation copy link into the case study rather than duplicate its content — the loop left open at the end of Phase 3 is closed here.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Backlog
**Goal**: Visitors can see what Guillem is currently working on, as curated evidence of range rather than a wishlist. Per explicit user decision, this is a section-level "last touched" date only — per-item dates and states stay out of scope and are not reintroduced here.
**Depends on**: Phase 3
**Requirements**: BACK-01, BACK-02
**Success Criteria** (what must be TRUE):
  1. Visitor can see a backlog of work in progress, each item carrying a name and a rich-text description.
  2. Visitor can see a single "last touched" date for the backlog section as a whole, not per item.
**Plans**: TBD
**UI hint**: yes

### Phase 6: CV, Contact, Photo & Discoverability
**Goal**: The remaining low-dependency surfaces are complete and the site is ready to be found and shared: CV, photograph, contact block, real security response headers, and search/social metadata. This phase also serves as the final integration and cross-link audit against PROJECT.md's Out-of-Scope list.
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4, Phase 5
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, BUILD-04, FIND-01, FIND-02
**Success Criteria** (what must be TRUE):
  1. Visitor can read Guillem's CV as an HTML page on the site.
  2. Visitor can see a photograph of Guillem.
  3. Visitor can obtain Guillem's email address — obfuscated against scrapers, reachable by keyboard and screen reader — and open his GitHub and LinkedIn profiles.
  4. Visitor loading the site receives real security response headers, demonstrating in practice what the migrated security-headers series describes.
  5. Visitor pasting the site URL into Slack or a DM sees a correct title, description, and preview image; search engines can index the site through a sitemap and robots file.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Deploy Foundation & Design System | 0/TBD | Not started | - |
| 2. Content Pipeline & Writing Archive Migration | 0/TBD | Not started | - |
| 3. Work List & Landing Skeleton | 0/TBD | Not started | - |
| 4. The Case Study | 0/TBD | Not started | - |
| 5. Backlog | 0/TBD | Not started | - |
| 6. CV, Contact, Photo & Discoverability | 0/TBD | Not started | - |

---
*Roadmap created: 2026-08-29*
