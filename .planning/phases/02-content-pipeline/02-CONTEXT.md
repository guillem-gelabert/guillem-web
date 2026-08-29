# Phase 2: Content Pipeline - Context

**Gathered:** 2026-08-29
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the machinery that renders long-form written content, and nothing
that fills it. Concretely: front-matter parsing, a Markdown + MDX loader, `/writing`
routing with EN/DE locale support, a writing index, prose styled on Phase 1's
typographic system, and syntax-highlighted code.

It exists so Phase 4's case study has somewhere to live. Success is a fixture post and
a real route, not a body of content.

**Re-scoped on 2026-08-29.** The phase was originally "Content Pipeline & Writing
Archive Migration" and carried WRIT-01, WRIT-02, WRIT-03. The migration of the 13
legacy 2020 posts is now deferred to v2 (see `<deferred>`). WRIT-01 is retained
because the index still ships and is browsable — it holds the case study at launch.

**Not in this phase:** the case study itself (Phase 4), the landing view and its
navigation (Phase 3), the custom domain (deferred), the 2020 archive (v2).

</domain>

<decisions>
## Implementation Decisions

### Scope

- **D-01: The 2020 archive migration is deferred to v2; the pipeline ships without it.**
  Discovered during discussion: the Markdown source for the 13 posts no longer exists.
  `guillem-gelabert/guillem-gelabert.github.io` has a single branch (`master`) holding
  only rendered Hugo 0.74.3 output — no `content/`, no theme source, and no other repo
  in the account contains it. Migration therefore means HTML→Markdown conversion plus a
  full editorial pass, which is writing time competing directly with the Phase 4 case
  study. The pipeline is separable from the content, so it ships now and the migration
  stays cheap to add later.

- **D-02: WRIT-01 is satisfied in v1 by an index holding the case study.** The writing
  index is real and browsable from launch; it simply has one entry. This keeps HOME-03
  ("visitor can reach ... the writing index ... from the landing view") intact rather
  than requiring it to be amended or deferred.

### Domain and Deployment

- **D-03: v1 launches on the Railway generated URL; the apex is deferred.** The apex
  domain question is in fact settled — `guillemgelabert.com` exists, is live behind
  Cloudflare (`kyree`/`nena.ns.cloudflare.com`), and already serves the project
  subdomains. PROJECT.md's "custom domain unresolved" line is stale on the *choice* but
  the *cutover* is deliberately deferred: the site still ships on
  `web-production-9cedb.up.railway.app` for v1, and pointing the apex at it is Phase 6
  work alongside the `robots` noindex flip (Phase 1 D-07) and social metadata.
  - **Planner note:** do NOT change Phase 1's deploy target. BUILD-02 is unchanged.

- **D-04: Interactive projects are hosted independently and linked to absolutely,
  never proxied or re-hosted.** Hosting is per-project and NOT uniformly under the apex —
  `ib-gdp` is a subdomain of `guillemgelabert.com`, but Watch People Die runs on its own
  domain, `watchpeopledie.live` (verified live, HTTP 200, different edge). Do not assume
  a subdomain pattern. Confirmed live example:
  `https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing`
  (`lang="en-GB"`) and `.../auf-mallorca-weiss-es-jeder` (`lang="de-DE"`), both HTTP 200.
  The personal site never hosts project code; the work list (Phase 3) and the case study
  (Phase 4) link out.

### Internationalisation

- **D-05: EN/DE locale routing is built in this phase, not retrofitted.** Locale routing
  is a one-way door for a content pipeline in the same way the slug scheme was, and the
  published work is already bilingual.

- **D-06: Slugs are localised per language, not a shared slug under a locale prefix.**
  This follows the convention the existing project already uses — the same piece is
  `everyone-in-mallorca-agrees-on-one-thing` in EN and `auf-mallorca-weiss-es-jeder` in
  DE, not `/en/x` and `/de/x`. A piece therefore needs a stable identity in front-matter
  that is independent of its per-locale slug, so the two can be linked as translations
  of each other.
  - **Nested route segments are localised too, not just the top-level slug.** Verified on
    the live project: `.../everyone-in-mallorca-agrees-on-one-thing/methodology` and
    `.../auf-mallorca-weiss-es-jeder/methodik` — both HTTP 200, `lang="en-GB"` and
    `lang="de-DE"`. If the writing pipeline ever nests a route under a post, the child
    segment is translated as well. Do not build routing that assumes a shared,
    untranslated sub-path.

- **D-07: A piece may exist in one locale only.** The pipeline must not assume every
  post has every translation, and must not render a broken language switcher or an
  empty page when a translation is absent.
  - **Accepted cost:** this makes Phase 4 a two-language writing job. Flagged during
    discussion and chosen deliberately.

### Content Pipeline

- **D-08: MDX may import and use arbitrary React components.** Not a fixed vetted set.
  Chosen for maximum expressive range on CASE-02's "how the visual form changed in
  response", where the argument may need a live chart rather than a screenshot.
  - **Accepted risk:** flagged during discussion — this lets Phase 4 drift from a
    writing job into a build job, and lets per-post styling diverge. The planner should
    keep a default prose path that requires no custom components, so that reaching for
    React is a deliberate act rather than the baseline.

- **D-09: The case study is a post at `/writing/[slug]`.** Not a separate `/work/`
  route and not cross-listed. Case studies and posts share one template and one index.
  This is what makes the n=1 index non-empty by construction.

- **D-10: The writing index renders the single launch entry full-bleed.** Large type,
  standfirst, date — an editorial front page rather than a list with one row. It must
  not read as an empty shelf, and card grids and three-across rows are already ruled
  out by PROJECT.md's Out of Scope list.
  - **Known limit:** this treatment does not scale past roughly five entries. When the
    archive lands in v2 the index needs a second treatment. Accepted — v2's problem.

- **D-11: Content is Markdown/MDX files committed to the repo; draft state is a
  front-matter flag.** `draft: true` keeps a piece out of the index and out of the
  sitemap while still rendering at its URL in development. No CMS, no backend, no
  second source of truth. The fixture post required by success criterion 5 uses this
  same mechanism rather than a special case.

### Claude's Discretion

- **Syntax highlighter and mono face.** Phase 1 explicitly left the code face to this
  phase. Pick the highlighter (build-time preferred over client-side, to protect the
  no-layout-shift and performance posture Phase 1 establishes) and a mono that sits with
  the Humane/serif pairing.
- **Default locale and root URL behaviour.** Whether `/` is EN or negotiates, whether EN
  is bare (`/writing/x`) or prefixed (`/en/writing/x`), and how `hreflang` is emitted.
  Constraint: whatever is chosen must still be correct when FIND-02 turns on indexing in
  Phase 6.
- **Front-matter schema.** Required versus optional fields, and how translation identity
  (D-06) is expressed.
- **Prose styling specifics.** Measure, vertical rhythm, table and blockquote treatment —
  resolved against Phase 1's UI-SPEC and `@tailwindcss/typography` (Phase 1 D-04).
- **Language switcher placement and behaviour.**

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 output — this phase builds directly on it
- `.planning/phases/01-deploy-foundation-design-system/01-CONTEXT.md` — locked type
  decisions. D-02 (body serif carries the reading load for long-form), D-03 (fluid
  display / fixed body), D-04 (Tailwind v4 `@theme` + `@tailwindcss/typography` supplies
  the prose defaults this phase consumes), D-07 (`robots: index:false` until Phase 6).
- `.planning/phases/01-deploy-foundation-design-system/01-UI-SPEC.md` — the design
  contract. Prose rendering must conform to it rather than introducing a parallel system.
- `.planning/phases/01-deploy-foundation-design-system/01-RESEARCH.md` — stack versions,
  `next/font` behaviour, and the Validation Architecture section.

### Design direction
- `BRIEF.md` — §5 design principles, §8 aesthetic direction and the "looks like data,
  isn't" trap, §9 anti-goals. Governs the index treatment (D-10).
- `.planning/PROJECT.md` — Constraints and Out of Scope. The Out of Scope list is the
  checklist each surface is checked against; card grids and three-across rows are named
  there and are the reason D-10 exists.

### Requirements
- `.planning/REQUIREMENTS.md` — WRIT-01 is this phase. WRIT-02/WRIT-03 moved to v2 on
  2026-08-29. Note BUILD-04's rationale clause was trimmed in the same edit.
- `.planning/ROADMAP.md` — Phase 2 section, rewritten 2026-08-29.

### Live external references
- `https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing` — the
  published EN piece the Phase 4 case study is about. Establishes the localised-slug
  convention (D-06).
- `https://ib-gdp.guillemgelabert.com/auf-mallorca-weiss-es-jeder` — the DE counterpart.

### Deferred-migration source material (v2, not this phase)
- `https://guillem-gelabert.github.io/posts/index.xml` — the RSS feed enumerating all 13
  posts with `pubDate`. The authoritative post list and the only surviving structured
  record of publication dates.
- `github.com/guillem-gelabert/guillem-gelabert.github.io` — rendered Hugo output on
  `master`. Post bodies are inside `<div class="post-content">`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

The repository contains no application code yet — Phase 1 scaffolds it. At planning
time the following will exist and must be built on, not duplicated:

- Phase 1's Next.js App Router scaffold, `next/font/local` setup, and Tailwind v4
  `@theme` token layer.
- `@tailwindcss/typography`, installed in Phase 1 explicitly so this phase can consume
  it (Phase 1 D-04).
- The reduced-motion gating primitive Phase 1 establishes (BUILD-05) — any motion in the
  index or post templates must route through it rather than re-implementing the check.

### Established Patterns

- **Deploy-first increments** (Phase 1 D-08). Every commit should leave the deployed
  Railway URL working.
- **Type system as the source of truth.** Prose styling reads the CSS variables `@theme`
  defines; it does not introduce a competing scale.

### Integration Points

- `/writing` and `/writing/[slug]` are new routes alongside Phase 1's `/` holding page
  and its non-indexed `/type` specimen route.
- The index is what Phase 3's landing-view navigation links to (HOME-03).
- The post template is what Phase 4 writes into. Its front-matter schema is the contract
  between the two phases.

</code_context>

<specifics>
## Specific Ideas

- The bilingual slug pattern is taken directly from the live project rather than
  invented: `everyone-in-mallorca-agrees-on-one-thing` / `auf-mallorca-weiss-es-jeder`.
  Titles there carry a `· IB GDP` suffix; the personal site need not copy that.
- The index at n=1 should read like an editorial front page, not a directory listing.
- The fixture post should exercise every supported element — headings, code, table,
  list, blockquote, links, images, and at least one embedded React component — so that
  D-08's capability is proven rather than assumed, at both mobile and desktop widths.

</specifics>

<deferred>
## Deferred Ideas

### Legacy writing archive migration — v2
The 13 posts from `guillem-gelabert.github.io` (8 security headers, 4 Git, 1
TypeScript, published 20 Aug – 3 Dec 2020). Deferred on 2026-08-29 as WRIT-02 and
WRIT-03. Findings captured here so the work does not need re-discovering:

- **The Markdown source is gone.** Only rendered Hugo 0.74.3 HTML survives. Migration
  means HTML→Markdown conversion, not moving files.
- **13 posts, 14 URLs.** `posts/amend/` is a stale near-duplicate of `posts/git-amend/`
  (6028 vs 6044 bytes) and is absent from the RSS feed. Any future slug map needs a
  decision on it.
- **No language hints on code blocks.** Hugo emitted bare `<pre><code>` with no
  highlight classes, so every block needs a language assigned by hand or inference
  before it can be highlighted.
- **The two series interleave chronologically.** Git posts (30 Aug – 6 Sep) sit inside
  the security-headers run (20 Aug – 8 Sep), so "grouped by series" and
  "reverse-chronological" actively conflict on the index.
- **Posts contain real HTML tables.** Referrer-Policy carries an 8×5 policy matrix that
  must survive conversion and be styled.
- **Series membership is hardcoded in the prose.** Each post ends with a literal line
  ("This entry is part of the Security Headers series."), which should become metadata
  rather than body text.
- **Editorial intent, captured before the deferral:** a full editorial pass was chosen —
  fix errors, and rewrite technically stale advice to be correct in 2026 rather than
  annotating it. Several posts have genuinely aged (`X-XSS-Protection` is deprecated and
  now considered harmful; `X-Frame-Options` is superseded by CSP `frame-ancestors`;
  browser `Referrer-Policy` defaults changed after publication). Review was to happen
  once, at the end, across all 13.

### Index treatment beyond n=1 — v2
D-10's full-bleed single entry does not scale past roughly five items. The archive
landing in v2 requires a second index treatment, and revives the series-grouping
question (WRIT-02).

### Custom domain cutover — Phase 6
Pointing `guillemgelabert.com` at the site. The domain is chosen and live; only the
cutover is deferred. Belongs with FIND-01/FIND-02 and the `robots` noindex flip.

</deferred>

---

*Phase: 02-content-pipeline*
*Context gathered: 2026-08-29*
