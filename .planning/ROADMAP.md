# Roadmap: guillem-web — v1.0 Working Site

## Overview

Six phases take the repo from its current state (a leftover static-prototype Dockerfile, no Next.js code) to a shipped, content-led site: a live deploy with the typographic design system in place, the legacy writing archive migrated under one domain, the landing view and work list, the ib-gdp-evolution case study that closes the "no editorial judgment" gap, the backlog, and finally the CV/contact/photo surfaces plus discoverability. Deployment and content-migration risk are retired early; the case study — the long pole, and the only artifact that can prove editorial judgment — gets its own phase, sized for writing effort rather than technical effort.

**Departure from research's suggested 7-phase structure:** SUMMARY.md's "Implications for Roadmap" proposed a separate Phase 2 ("Content Pipeline") ahead of Phase 3 ("Writing Archive Migration"). This roadmap merges them into one phase. Reasoning: the content-pipeline loader/renderer has no requirement of its own — its only observable proof is the migrated writing itself — so splitting "build the plumbing" from "prove the plumbing with real content" into two separate roadmap phases reproduces the horizontal-layer anti-pattern (a phase nothing can be verified against until the next phase lands). Folding them into one phase keeps every phase's success criteria checkable by a human and still lets the phase's *plan* sequence a stub-post proof before the real 13-post migration, per ARCHITECTURE §8 and PITFALLS' migration guidance. Every other phase boundary, and the ordering rationale, follows SUMMARY.md directly.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Deploy Foundation & Design System** - Delete the stale Dockerfile, stand up Next.js on Railway, and lay down the typographic system, the heading trail effect, and accessibility defaults before any content exists. (completed 2026-08-29)
- [x] **Phase 2: Content Pipeline** - Build the front-matter/Markdown+MDX loader, the `/writing` route and index, and the prose layer the case study renders through. The 2020 archive migration is deferred to v2. (completed 2026-08-31)
- [x] **Phase 3: Work List & Landing Skeleton** - Assemble the landing view's positioning sentence, navigation, and vertical work list; leave the featured slot pointed at a placeholder. (completed 2026-08-31)
- [x] **Phase 4: The Case Study** - Write and publish the ib-gdp-evolution case study and wire the landing view's featured slot to it. (completed 2026-08-31)
- [x] **Phase 5: Backlog** - Ship the curated, section-dated backlog of work in progress. (completed 2026-08-31)
- [ ] **Phase 6: CV, Contact, Photo & Discoverability** - Complete the CV page, photograph, contact block, real security headers, and search/social metadata.

## Phase Details

### Phase 1: Deploy Foundation & Design System

**Goal**: The site exists as a live, deployed Next.js application with its typographic design system and accessibility defaults in place before any content is built. The first task of this phase is deleting the repo's existing `Dockerfile` and `nginx.conf.template` — Railway auto-prioritizes a root Dockerfile over its zero-config builder with no override, so leaving it in place would silently deploy the wrong app behind a green build.
**Depends on**: Nothing (first phase)
**Requirements**: BUILD-01, BUILD-02, BUILD-03, BUILD-05, BUILD-06, HOME-05, HOME-06
**Success Criteria** (what must be TRUE):

  1. Visitor can load a live Next.js site at a stable Railway URL — not the old static prototype (the pre-existing `Dockerfile`/`nginx.conf.template` are deleted before the first deploy).
  2. Visitor sees a deliberate, authored typographic system (type scale, self-hosted fonts) rather than framework-default styling, correctly on both a mobile-width and a desktop-width viewport.
  3. Visitor loading any page sees no layout shift as fonts load.
  4. Visitor with `prefers-reduced-motion` set is shown no motion that ignores it, gated from the first component built rather than retrofitted later.
  5. Visitor scrolling sees headings trail behind the scroll position with a smear effect that settles when scrolling stops — built with stacked CSS `text-shadow`, ported from the existing benchmark at `text_trail_demo/index.html` (`createTextShadowEffect` at `:648-688`, shared rAF driver at `:827-882`), not rebuilt from scratch.

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Delete stale Dockerfile/nginx artifacts, scaffold Next.js 16, install Playwright, push and confirm the live Railway URL serves the new app

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Wire Humane/Newsreader font loaders and Tailwind v4 @theme design tokens + clamp() type scale

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Wire root layout (fonts, robots noindex) and build the holding page + /type specimen route

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04-PLAN.md — Port the scroll-driven heading trail (text-shadow smear) and wire prefers-reduced-motion gating

**UI hint**: yes

### Phase 2: Content Pipeline

**Goal**: The site renders long-form written content from Markdown/MDX through a real pipeline — front-matter, `/writing` routing, an index, prose styled on Phase 1's type system, and syntax-highlighted code. It exists so Phase 4's case study has somewhere to live. The 2020 archive migration is deferred to v2; the `/writing/[slug]` URL shape is still settled here so that migration stays cheap to add later.
**Depends on**: Phase 1
**Requirements**: WRIT-01, I18N-01
**Success Criteria** (what must be TRUE):

  1. A Markdown/MDX file dropped into the content directory is served at its `/writing/[slug]` URL with no per-post wiring — title, date and description are read from front-matter, and the slug comes from the filename.
  2. Visitor can browse `/writing` as a real index. At launch it lists one entry (the Phase 4 case study) and must read as deliberate at n=1 — no empty-shelf layout, no card grid (PROJECT.md Out of Scope).
  3. Visitor reading a rendered post sees Phase 1's typographic system — body serif, type scale, controlled measure — not unstyled `@tailwindcss/typography` defaults.
  4. Code blocks render with real syntax highlighting in a chosen mono face; tables, headings, lists, blockquotes and links are all deliberately styled.
  5. A fixture post exercising every supported element renders correctly at mobile and desktop widths and is excluded from the public index.

**Plans**: 7 plans
Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Install the @next/mdx + Shiki toolchain, add IBM Plex Mono and the Newsreader italic, and move Phase 1's routes into an `(en)` route group

**Wave 2** *(blocked on Wave 1)*

- [x] 02-02-PLAN.md — Filesystem content loader, locale module and their `node --test` suites (front-matter schema, draft visibility, translation pairing, slug allowlist, date formats)

**Wave 3** *(blocked on Wave 2)*

- [x] 02-03-PLAN.md — The `.prose-site` layer with its automated UI-SPEC conformance gate, the MDX components, and SmearTitle / PostMeta / LanguageSwitch

**Wave 4** *(blocked on Wave 3)*

- [x] 02-04-PLAN.md — The English post template and not-found boundary, the three fixture posts, and the SC1 routing specs

**Wave 5** *(blocked on Wave 4)*

- [x] 02-05-PLAN.md — Measure SC3/SC4/SC5: prose typography, Shiki code blocks, the fixture at 375px and 1440px, and the CLS guard on the post route

**Wave 6** *(blocked on Wave 5)*

- [x] 02-06-PLAN.md — The German root layout and route tree, both writing indexes, and the I18N-01 / WRIT-01 specs

**Wave 7** *(blocked on Wave 6)*

- [x] 02-07-PLAN.md — Production build-output gate, deploy confirmation, and the optical sign-off checkpoint

**UI hint**: yes

### Phase 3: Work List & Landing Skeleton

**Goal**: The landing view assembles its navigation surface and vertical work list. The work-list *code* has no dependency on the case study existing; only the featured entry's final annotation copy does (see Phase 4) — so this phase builds everything except that one line.
**Depends on**: Phase 1, Phase 2
**Requirements**: WORK-01, WORK-02, HOME-01, HOME-03, HOME-04
**Success Criteria** (what must be TRUE):

  1. Visitor can read a single positioning sentence on the landing view stating what Guillem does.
  2. Visitor can see a vertical list of Guillem's interactive projects, each with a one-line annotation describing what it's about rather than what it was built with.
  3. Visitor can reach the work list, backlog, writing index, CV, and contact block from the landing view.
  4. Visitor sees a landing layout that stays legible with only two work items — lists and prose, no card grids or three-across rows.

**Plans**: 9 plans
Plans:
**Wave 1**

- [x] 03-01-PLAN.md — lib/work.ts (entries, CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER) + its unit gate; SmearTitle `as` widened to h3; `homeLink` in lib/locales.ts
- [x] 03-02-PLAN.md — Extract the globals.css parser to a shared helper; add `.section-head` / `.link` / `.link-quiet`; the link-contract source gate

**Wave 2** *(blocked on Wave 1)*

- [x] 03-03-PLAN.md — The four landing components and the de-cliented `app/(en)/page.tsx` (A1: Client → async Server Component, own metadata, rel=canonical)
- [x] 03-04-PLAN.md — The `/cv` stub route and its spec, plus the A4 `/type` specimen for the three new classes
- [x] 03-05-PLAN.md — A2 site-root back links on both indexes and A3 `.link-quiet` across every shipped non-prose link, with spec extensions

**Wave 3** *(blocked on Wave 2)*

- [x] 03-06-PLAN.md — tests/landing.spec.ts: HOME-01/03/04, WORK-01/02 and the state-agnostic featured-slot structure
- [x] 03-07-PLAN.md — tests/landing-viewport.spec.ts (375/1440) and tests/landing-trail.spec.ts (HOME-06 + BUILD-05), plus two stale-comment corrections

**Wave 4** *(blocked on Wave 3)*

- [x] 03-08-PLAN.md — Production-tier prerender assertions, the clean-`.next` phase gate, the deploy confirmation, and the HOME-01 tripwire record

**Wave 5** *(blocked on Wave 4)*

- [x] 03-09-PLAN.md — The designated optical sign-off at 375px and 1440px, the two WORK-02 draft annotations, and naming HOME-01 outstanding

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

**Plans**: 6 plans
Plans:
**Wave 1**

- [x] 04-01-PLAN.md — The capture script and the live-text snapshot: three settled Act 2 states at 2400×1640 under `public/case-study/`, plus verbatim snapshots of all four live source pages

**Wave 2** *(blocked on Wave 1)*

- [x] 04-02-PLAN.md — The three content gates (`tests/unit/case-study-content.test.ts`, `tests/unit/case-study-figures.test.ts`, `tests/case-study.spec.ts`), which lock the six section marks, the front-matter, the banned-token list and the word bands. Ends RED by design

**Wave 3** *(blocked on Wave 2)*

- [x] 04-03-PLAN.md — The English case study: six beats in CASE-02's order, three figures, one aside, the pivot as a pull quote, one inline link to the live piece

**Wave 4** *(blocked on Wave 3)*

- [x] 04-04-PLAN.md — The German translation at `/texte/die-darstellung-aendert-sich`, paired by `translationKey`, with the D-17 draft branch recorded

**Wave 5** *(blocked on Wave 4)*

- [x] 04-05-PLAN.md — Close the six assertions publishing broke (four in `tests/build/prerender.test.ts`, two in `tests/writing-index.spec.ts`); prove CASE-03 and HOME-02 in real prerendered HTML; full suite green

**Wave 6** *(blocked on Wave 5)*

- [x] 04-06-PLAN.md — The D-19 fact check as a committed per-claim record, the live deploy confirmation, and the launch-gate closure with the HOME-01 tripwire carried forward

**UI hint**: yes

### Phase 5: Backlog

**Goal**: Visitors can see what Guillem is currently working on, as curated evidence of range rather than a wishlist. Per explicit user decision, this is a section-level "last touched" date only — per-item dates and states stay out of scope and are not reintroduced here.
**Depends on**: Phase 3
**Requirements**: BACK-01, BACK-02
**Success Criteria** (what must be TRUE):

  1. Visitor can see a backlog of work in progress, each item carrying a name and a rich-text description.
  2. Visitor can see a single "last touched" date for the backlog section as a whole, not per item.

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 05-01-PLAN.md — `lib/backlog.tsx` (three grounded items, the `COPY_REVIEWED` tripwire, the fail-loud validator), `BacklogList`, the date line, the stub's deletion from `app/(en)/page.tsx`, and the measured proof that a malformed module fails `next build`

**Wave 2** *(blocked on Wave 1)*

- [x] 05-02-PLAN.md — The repo-tier guards: `backlog-source.ts` (the `.tsx` source reader that throws rather than skipping), `backlog.test.ts`, the five-branch git/mtime freshness guard, and three red-proofs that all of them fire
- [x] 05-03-PLAN.md — `tests/landing.spec.ts`: the two located breakages (`(r)` h3 3→6, `(u)` narrowed to contact) plus the rendered proof of D-11's three subtractions, the measured hairline and gaps, and the on-screen two-weight/four-size budget

**Wave 3** *(blocked on Wave 2)*

- [x] 05-04-PLAN.md — Production truth in `tests/build/prerender.test.ts` (stub strings absent, date bound to source by equality), the re-pointed launch gate naming three unreviewed copy items, the deploy confirmation, and the backlog-leg closure record

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

**Plans**: 12 plans
Plans:
**Wave 1**

- [x] 06-01-PLAN.md — CR-01: `proxy.ts`, the two reserved localised 404 routes, the shared not-found body, and the unit test binding the proxy's slug predicate to `publishedFor()`
- [x] 06-02-PLAN.md — BUILD-04: pure `buildCsp({dev})`, `next.config.ts` `headers()`, delivery proof, and G9's three-part code-colour proof
- [x] 06-03-PLAN.md — The five `[USER-SUPPLIED]` facts as typed placeholders (`lib/cv.ts`, `lib/contact.ts`) and `tests/unit/launch-gate.test.ts`, the biconditional that gates the robots flag
- [x] 06-06-PLAN.md — FIND-01 rasters: the Playwright capture script, both site-wide OG cards, per-post cards, `app/icon.png`, and the scaffold favicon deleted

**Wave 2** *(blocked on Wave 1)*

- [ ] 06-04-PLAN.md — PROF-01…05 surfaces: the contact block with the entity-encoded email, the portrait, the CV sections, the rebuilt `/cv`, and the landing's real `#contact`
- [ ] 06-05-PLAN.md — FIND-02 plumbing: `app/sitemap.ts` from `publishedFor()`, `app/robots.ts`, and the five scaffold SVGs deleted

**Wave 3** *(blocked on Wave 2)*

- [ ] 06-07-PLAN.md — FIND-01 metadata: `lib/site.ts` on the apex, the `lib/metadata.ts` factory, per-route titles/descriptions/`og:url`, and `/type` de-cliented with its own permanent noindex
- [ ] 06-08-PLAN.md — Browser tier: `tests/contact.spec.ts`, the portrait and CLS guards in `tests/cv.spec.ts`, and the smear-origin invariance in `tests/landing-trail.spec.ts`

**Wave 4** *(blocked on Wave 3)*

- [ ] 06-09-PLAN.md — Production truth: the five narrowed assertions, the FIND-01/FIND-02 additions, and the three named skipped gate rows in `tests/build/prerender.test.ts`
- [ ] 06-10-PLAN.md — D-4.4's automated halves: `tests/cross-links.spec.ts` and `tests/design-budget.spec.ts`

**Wave 5** *(blocked on Wave 4)*

- [ ] 06-11-PLAN.md — Live-deploy verification, the six-part written audit, the 13-row launch gate, and `HANDOFF-user-supplied.md`

**Wave 6** *(blocked on Wave 5)*

- [ ] 06-12-PLAN.md — The three manual rows (Slack unfurl, screen-reader pass, optical sign-off) and the milestone tracking close

> **FIND-02 is deliberately not flipped by this phase.** By explicit user decision the copy gate stays
> blocking: HOME-01's positioning sentence, the case-study editorial pass and the backlog
> `COPY_REVIEWED` review are all outstanding. The phase builds every surface, leaves
> `robots: { index: false }` in place, and delivers the flip as a gated one-commit procedure the user
> performs after their own review. `tests/unit/launch-gate.test.ts` holds the biconditional.

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Deploy Foundation & Design System | 4/4 | Complete   | 2026-08-29 |
| 2. Content Pipeline | 7/7 | Complete   | 2026-08-31 |
| 3. Work List & Landing Skeleton | 9/9 | Complete   | 2026-08-31 |
| 4. The Case Study | 6/6 | Complete   | 2026-08-31 |
| 5. Backlog | 4/4 | Complete   | 2026-08-31 |
| 6. CV, Contact, Photo & Discoverability | 4/12 | In Progress|  |

---
*Roadmap created: 2026-08-29*
*Last updated: 2026-09-01 — Phase 6 planned into 12 plans across 6 waves*
