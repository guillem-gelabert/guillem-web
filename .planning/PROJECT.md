# Guillem Web

## Current Milestone: v1.0 Working Site

**Goal:** Ship a content-led personal site where the evidence does the talking — one written case study, the existing interactive pieces, a backlog of current work, and the migrated writing archive — with engineering demonstrated by the build rather than claimed in copy.

**Target features:**
- One positioning sentence and one featured piece: the ib-gdp-evolution case study, written during this milestone
- Short vertical list of work covering the existing interactive projects
- Backlog / currently-working-on section: item name plus rich-text description
- Writing index and content pipeline (Markdown/MDX) — the case study renders through it; the legacy 2020 posts are deferred to v2
- CV as an HTML page on the site
- A photograph of Guillem
- Contact block: obfuscated email, GitHub, LinkedIn
- Next.js application deployed to Railway on the generated URL
- Typographic tier throughout, including a scroll-driven trail on headings (stacked CSS `text-shadow`) — performative set pieces wait for v3

## What This Is

A personal site for Guillem, a developer applying for roles in data journalism, data visualization, and creative development. Its job is to prevent one specific wrong conclusion — "talented front-end dev, no editorial judgment" — which is the default reading a developer CV produces on its own.

The site works by allocation: engineering is demonstrated by the artifact working well rather than stated in copy, which frees the entire copy budget for the three things a developer CV structurally cannot show — subject knowledge, editorial judgment, and design intuition. It is content-led rather than hero-led, and it launches at the Typographic tier — motion that makes the page beautiful belongs there, while whole-page performative set pieces wait until there is work underneath to justify them.

## Core Value

A visitor scanning a shortlist can tell within ninety seconds that Guillem has editorial judgment as well as craft — enough to decide the conversation is worth opening.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

- [ ] Ship a content-led Next.js site at the Typographic tier: one positioning sentence, one featured piece, a short list of work, a backlog, and a writing index.
- [ ] Publish one written case study covering ib-gdp-evolution that shows what was expected, what the data turned out to be, and how the visual form changed in response.
- [ ] Provide a CV page, a photograph, and a contact block with obfuscated email, GitHub, and LinkedIn.
- [ ] Deploy to Railway on the generated URL.

### Out of Scope

- The scroll-driven variable-font hero and WebGL/Three.js set pieces — deferred to the v3 tier. The axis-2 staging is about ordering effort (content before fanciness), not a ban on motion: ordinary animation that makes the page beautiful is in scope at every tier.
- Migrating the 2020 legacy writing (13 posts) into the site — deferred to v2 on 2026-08-29. The Markdown source no longer exists; `guillem-gelabert.github.io` holds only rendered Hugo 0.74.3 output, so migration means HTML→Markdown conversion plus a full editorial pass over prose that is technically stale in places. That is writing time competing directly with the case study, which is the milestone's actual long pole. The content pipeline it would have ridden on still ships in Phase 2.
- Post types and tags for the writing (book summary, commentary, learning) — the taxonomy is real but premature at launch volume; v1 ships a flat index.
- "Now playing / recently played" — the most generic element proposed, and it adds nothing to the subject or judgment claims.
- Custom domain (guillemgelabert.com vs guillem.ch) — unresolved; v1 ships on the Railway URL.
- Contact form — an obfuscated email address does the same job with no backend.
- Blog-primary reverse-chronological homepage — the target configuration at v3 volume, but at three posts it reads emptier than a one-pager.
- Card grids and three-across feature rows — they look empty at low item counts, which is the launch condition.

## Context

- **Audience:** graphics editors, newsroom leads, studio principals, recruiters. Roughly ninety seconds, forty tabs open, scanning a shortlist. Their job-to-be-done is deciding whether this person has judgment as well as craft.
- **The claim, stated as a mechanism:** a developer who holds the data, the visual form, and the argument in one head — so the form can change in response to what the data turns out to be. A newsroom can hire a designer and a developer, but that pair converges on the design that was drawn; the comp becomes the spec and the data has to fit it. This is a different set of reachable outcomes, not the same work done faster.
- **Why the case study is load-bearing:** the claim is indistinguishable from a designer's mood board until the moment it happened is shown. Editorial judgment is only visible in published work with a stated point of view — nothing in the visual design substitutes for it.
- **Content inventory:** two to three interactive projects exist (ib-gdp-evolution, Watch People Die) but are not shipped or distributed. Legacy blog posts are published at guillem-gelabert.github.io from 2020: a security headers series, a Git series, and a TypeScript post.
- **Aesthetic source:** constructivism is the shared ancestor of the poster and the chart — geometric primitives, flat colour, diagonal axes, type as structural element. The site's visual language and the charts come from the same source.
- **The one aesthetic trap:** compositions that adopt chart signifiers specifically (axes, ticks, plotted points, anything implying an encoded scale) will be read as charts by this audience. If they encode nothing, the result looks like information and isn't, in front of people trained to notice. Pure geometry does not carry this risk; the dangerous middle is decoration with axes.
- **Full elicitation:** `BRIEF.md` in the repo root — repertory grid over a 24-site scan, five construct axes, design principles, evidence audit, and anti-goals.

## Constraints

- **Tech stack**: Next.js — supersedes the earlier plain-React decision, which was made when v1 was a hero and a single link.
- **Hosting**: Railway on the generated URL — deployment target already chosen; custom domain deferred.
- **Visual tier**: Typographic — the staging exists to keep effort going into content before fanciness, not to forbid motion. Animation that makes the page beautiful is expected; whole-page performative set pieces (the variable-font hero, WebGL) wait for v3.
- **Layout at low n**: must not look empty with three items. Rules out card grids and three-across rows; favours lists, a single featured piece, and prose.
- **Copy budget**: engineering is never claimed in copy, only demonstrated by the artifact. The copy belongs to subject, judgment, and design.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Re-scope v1.0 rather than start a new milestone | The original v1.0 was planned but never built — no code, no phases executed — so there was nothing to layer a milestone on top of | — Pending |
| Content-led site instead of hero-plus-GitHub-link | The "no finished data story yet" justification was stale; two pieces exist, and a performative hero over thin work produces "nice art project, can't ship" | — Pending |
| Engineering demonstrated, not stated | It is the strongest suit and the least in need of advertising — a developer CV already carries it, and the landing surface is scarce | — Pending |
| Launch at Typographic tier, defer Performative set pieces | The staging orders effort — adding content matters more than adding fanciness. It is not a motion ban: some animation is needed for the page to look beautiful, and that is in scope at every tier | — Pending |
| Headings carry a scroll-driven trail, built with stacked CSS `text-shadow` | A three-way benchmark already exists at `text_trail_demo/index.html` (WebGL sampled mask, CSS text-shadow, alpha-mask extrusion). The text-shadow version is the least performative of the three, needs no WebGL context or canvas, runs on a live DOM heading, and degrades to a plain heading — it reads as a typographic treatment rather than a set piece | — Pending |
| Next.js over plain React | v1 is content-led — writing, case study, lists, index — which a bare SPA would need hand-rolled routing and content loading to serve | — Pending |
| Write the ib-gdp-evolution case study inside this milestone | Editorial judgment was the weakest link in the evidence audit, and it is the one gap no design decision can close | — Pending |
| Defer the legacy writing migration to v2; ship the content pipeline without it | The Markdown source is gone — only rendered Hugo HTML survives — so migrating means HTML→Markdown conversion plus a full editorial pass over 13 posts, some technically stale in 2026. That is writing effort competing with the case study, which is the one artifact that closes the editorial-judgment gap. The pipeline is separable and still ships, so the migration stays cheap to add later. | — Pending |
| Reinstate CV, contact, and LinkedIn from Out of Scope | Explicit user decision. The allocation principle still holds: the CV exists as a page, it does not get landing-surface copy | — Pending |
| Backlog items carry name and rich-text description only — no dates, no states | Explicit user decision, taken against the brief's §7 advice. **Accepted risk:** without visible movement the backlog can read as a wishlist rather than a working log, which is anti-goal #4. It also forfeits the argument that the backlog is real data, which was the brief's clean resolution of the ornament problem | ⚠️ Revisit |
| Drop POSI-03 (infer curiosity from the first screen) | Subject credibility cannot be asserted, only accumulated — it was never satisfiable by a hero | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-29 after deferring the legacy writing migration to v2*
