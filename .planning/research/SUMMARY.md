# Project Research Summary

**Project:** guillem-web — v1.0 "Working Site"
**Domain:** Content-led personal/portfolio site (Next.js App Router), migrating a 2020 Jekyll archive, deployed to Railway, Typographic-tier visual system
**Researched:** 2026-08-29
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a small, fully static-at-build-time content site — a case study, a 3-item work list, a backlog, a ~13-post migrated writing archive, a CV, and a contact block — built to prove editorial judgment to a job-search audience that scans in ~90 seconds. Every researcher converges on the same core technical shape: Next.js 16 App Router, filesystem content (no CMS, no database), a hand-rolled component set (no UI library), and zero performative motion. The four research files disagree on deployment mechanics and content-rendering mechanics in ways this summary resolves explicitly below — those were the two places researchers made different assumptions in parallel, not real architectural ambiguity.

The recommended path: delete the existing `Dockerfile`/`nginx.conf.template` entirely, deploy via Railway's zero-config Node builder (`next build` + `next start`, no `output` override), and split the content pipeline by file extension — plain Markdown for the 13 migrated legacy posts, full MDX (via `next-mdx-remote-client`, since the obvious `next-mdx-remote` package is now archived upstream) for new writing including the case study. This choice is not arbitrary: it's the one combination that lets the site set its own security-response-headers via native `next.config` `headers()` — directly relevant because one of the migrated post series is *about* security headers, and shipping a site that doesn't demonstrate them is a credibility failure in front of exactly the audience most likely to check.

The two biggest risks are not technical. First, the migrated archive currently shows only 10 of 13 posts on the live site's homepage (pagination hides 3, including the two most-linkable security-header posts) — the authoritative post list and original Markdown source must come from the GitHub repo, not the rendered site, before migration starts. Second, the backlog's "name + description, no dates, no states" decision is a knowingly accepted risk (logged in PROJECT.md) that every piece of prior art this research found treats as load-bearing — the mitigation available (curation, voice, placement) is real but partial, and a section-level "last touched" timestamp is raised here as an open decision for you, not a default we've applied.

## Key Findings

### Recommended Stack

Next.js 16.3.3 (App Router, TypeScript, React 19.2.8, Node ≥20.9) is the converged recommendation across all four files — current, well-documented, and the only path with first-class MDX/`next/font`/nested-layout support. Content lives entirely in the filesystem; no CMS, no database, no state-management library, no component library, no animation library — all explicitly ruled out as disproportionate to a ~15-file, single-author, no-performative-motion site.

**Core technologies:**
- Next.js 16.3.3, App Router — nested layouts + per-route metadata fit the multi-section structure directly; Pages Router gets no new features.
- gray-matter 4.0.3 — frontmatter parsing across all content, zero bundler-compatibility surface.
- next-mdx-remote-client 2.1.12 — MDX rendering for new writing/case study. **Note:** the obvious choice, `next-mdx-remote` (HashiCorp), is archived (confirmed via GitHub API, last push 2026-03-26) — use the maintained fork.
- Tailwind CSS v4.3.3 (CSS-first `@theme`) + `@tailwindcss/typography` for prose, plain CSS custom properties for the fine typographic control (fluid `clamp()` scales, optical spacing) Tailwind utilities fight.
- `next/font` (built-in) — self-hosted fonts; also closes a real GDPR exposure (Google Fonts CDN loading was ruled a violation by a German court in Jan 2022 — relevant given the target audience includes European newsroom contacts).

**What was explicitly ruled out and why:** Contentlayer (unmaintained since late 2024), Velite/Content Collections (real, but Velite's Turbopack incompatibility and schema-validation overhead aren't earned at ~15 files), any headless CMS, any database, `output: 'standalone'` + custom Docker image (see Rendering & Deployment below), any animation library (v3-tier concern, not v1).

### Rendering & Deployment — resolved

The three research files each modeled this differently: STACK.md argued for static export (`output: 'export'`) served by the existing Dockerfile+nginx, updated; ARCHITECTURE.md argued for plain `next build`+`next start` on Railway's zero-config Node builder with the Dockerfile deleted outright; PITFALLS.md assumed a custom-Docker `output: 'standalone'` path and listed `sharp`/asset-copying as required steps. These aren't compatible defaults — pick one.

**Resolution: plain `next build` + `next start`, no `output` override, deployed via Railway's zero-config Railpack/Nixpacks Node builder. Delete `Dockerfile` and `nginx.conf.template` entirely.**

Why this wins over the alternatives:
- It's the only option that lets `next.config.js`'s native `headers()` API set real CSP/HSTS/X-Content-Type-Options response headers — which directly defuses the Security Mistakes pitfall (a security-headers blog series shipping on a site with no security headers set is a checkable, visible contradiction for the exact audience reading it). Static export cannot use `headers()` at all (Next.js explicitly disallows `headers`/`rewrites`/`redirects`/i18n under `output: 'export'`); getting equivalent header control back would mean re-adding and maintaining an nginx layer.
- It avoids the entire `output: 'standalone'` failure surface PITFALLS.md documents in detail (missing `sharp` → images 500 in production; forgetting to copy `public/`/`.next/static` → CSS/fonts/images 404; hardcoded port) — those failures are specific to hand-rolling a custom Docker multi-stage build. Railway's default Node buildpack (no Dockerfile present) runs `npm install && npm run build && npm start` and handles `node_modules`/`public/` correctly without a manual copy step, so that entire class of pitfall doesn't apply if no Dockerfile is introduced.
- It sidesteps Pitfall 1 outright (the existing `Dockerfile` currently ships a static prototype HTML file via nginx and — because Railway auto-prioritizes any root-level `Dockerfile` over its zero-config builder with no override — would silently deploy the wrong app in production if not deleted). Deleting it is the first concrete task of the deploy-infra phase, before any content work lands.

**What this costs relative to static export:** one live Node process stays running on Railway instead of the site being served as static files — for a personal site on Railway this is a non-issue operationally (Railway runs a container/service either way), but it's worth naming as the trade explicitly since STACK.md's static-export analysis is otherwise sound: nothing in v1's feature set needs a server *at request time*. If header control or the server process is ever unwanted, static export + a slim nginx layer (STACK.md's alternative) remains available — it would need the nginx config rebuilt to set headers explicitly and `images.unoptimized: true` added back.

### Content Pipeline — resolved

STACK.md recommended MDX (via `next-mdx-remote-client`) uniformly for all content, including the migrated legacy posts. PITFALLS.md separately found that MDX's stricter parsing (bare `{`/`<` treated as JS) will build-error on Jekyll Liquid-syntax artifacts (`{% highlight %}`, `{% raw %}`) that may be embedded in the 13 legacy posts' code samples, and recommended plain Markdown for the migrated archive specifically. ARCHITECTURE.md's content model assumed one MDX collection for everything.

**Resolution: one shared collection and one shared `WritingEntry` type (per ARCHITECTURE §2a/§3), but two renderers dispatched by file extension** — `.md` files (the 13 migrated legacy posts) render through a plain Markdown pipeline (remark/rehype, no MDX compiler), `.mdx` files (the case study and any future writing that wants embedded components) render through `next-mdx-remote-client`. This keeps the "one collection, one route template, discriminated by `type` for case-study-vs-post" architecture fully intact — extension only decides *how the body compiles*, not which template or route it uses. Regardless of renderer, every legacy post still needs its Liquid tags found and stripped/converted during migration (`{% highlight %}`, `{% raw %}`/`{% endraw %}`, `{% include %}`, `{% post_url %}`) — that's a migration-content task independent of which renderer is chosen, since even plain Markdown will show literal `{% %}` text if not stripped.

### Expected Features (from FEATURES.md — see file for full per-surface tables)

**Must have (table stakes), essentially matching PROJECT.md's committed scope:**
- Case study for ib-gdp-evolution, structured as **question → stated prior expectation → what the data actually showed → the pivot (concrete before/after) → shipped link → short methodology note**. This exact 6-part shape is triangulated across three independent traditions (The Pudding's methodology convention, Data Sketches' sketch-then-revise process, FlowingData's process-post series) — it is the single highest-stakes surface in the whole site, the only artifact that can address the "no editorial judgment" reading a bare developer CV produces.
- Work list (n=3): vertical list, generous type, no thumbnails, no grid — ordered by significance not chronology, annotated with what-it's-about copy (not stack-tag copy).
- Writing index: **13 legacy posts grouped by series** (an 8-part security-headers series, a 4-part Git series, one standalone TypeScript post) rather than flat reverse-chron — this reframes "13 posts, all 2020, nothing since" (reads as abandoned) into "two completed technical deep-dives" (reads as depth). This is a near-zero-cost reframe (no new content, only grouping/framing copy) and should be treated as an essential v1 requirement, not a nice-to-have.
- CV as HTML + a print/PDF path; contact block (obfuscated email + copy affordance, direct GitHub/LinkedIn links); one photograph.

**Should have (differentiators):** showing one rejected alternative chart form next to the shipped one in the case study (the single clearest visible evidence of judgment on the page); a one-line framing sentence atop the writing index acknowledging the archive is carried-over writing; series-grouping itself (above) is really both table-stakes-adjacent and a differentiator — it's cheap and high-value enough to not defer.

**Defer (v2+):** post-type taxonomy/tags for writing, backlog-as-encoded-chart (BRIEF's original resolution to the chart-signifier trap — only viable once dates/states exist), case studies surfaced directly on the landing view, any Performative-tier motion.

**Two build-order dependencies from FEATURES.md that materially affect phase sequencing:**
1. The work list's top/featured entry is a link *into* the case study, not a parallel description — its one-line annotation copy should be finalized only after the case study prose exists, to avoid writing and then reconciling duplicate content. The work-list *code* (skeleton, styling, the other 1-2 entries) has no such dependency and can be built earlier.
2. The writing index's series-grouping decision (flat vs. grouped) must be made **before or during** migration, since each migrated post needs series-name/part-number metadata added while its file is already being touched — deciding this after migration means re-touching all 13 files.

### Architecture Approach

Everything in v1 is knowable at build time. The whole site renders as static HTML from `next build`; there is no API layer, no runtime data fetching, and (per the resolved rendering strategy above) no client-component boundary is required anywhere in the tree — even the obfuscated email can be done with a server-rendered inline `<script>` rather than a React Client Component. Content is modeled as three distinct shapes rather than one generic abstraction: a `writing` collection (frontmatter + body, covers both legacy posts and the case study, discriminated by a `type: "post" | "case-study"` field), two structured-data files with no prose pipeline (`work.ts`, `cv-data.ts`), and a backlog whose *source* is deliberately left open (content file is the recommended default; a build-time-only GitHub API fetch is a viable v2 option if the list already lives elsewhere — never fetch it at request time).

**Major components:**
1. `lib/content/writing.ts` — fs + gray-matter loader, frontmatter-only fast pass for indexes, dynamic per-slug MDX/Markdown compile for full bodies; feeds `generateStaticParams`.
2. `mdx-components.tsx` + `<Prose>` — one shared place defining how headings/links/blockquotes/code render across every post and the case study; built once, reused everywhere.
3. `site-config.ts` — single point of truth for the featured-case-study slug and positioning copy; the one file that changes when case-study promotion moves from an explicit constant (v1, n=1) to a `type === 'case-study'` query (v2, n>1) — a deliberately small, well-bounded future phase.
4. Purpose-built list components (`<WritingIndexRow>`, `<WorkListItem>`, `<BacklogItem>`) rather than a generic `<Card>`/content-framework abstraction — matches the actual surface area (under ten UI patterns, no complex widgets).

### Critical Pitfalls

1. **Stale `Dockerfile` silently wins the Railway deploy** — the existing root `Dockerfile` serves a static prototype file via nginx; Railway prioritizes any root `Dockerfile` over its zero-config builder with no override. Deploying without deleting it ships the wrong app with a "green" build and no error. *Avoid: delete `Dockerfile`/`nginx.conf.template` as the first task of the deploy-infra phase* (this is now moot as a *choice* per the resolution above — it's simply the correct action either way).
2. **Jekyll Liquid syntax and Rouge-highlighted code blocks corrupt migrated content** — `{% highlight %}`/`{% raw %}` tags and Pygments-specific CSS classes don't survive a naive copy into Next.js/MDX; MDX in particular will hard-fail the build on bare `{`/`<`. *Avoid: migrate from original Markdown source (never scraped rendered HTML), strip Liquid tags explicitly, re-render every code block through the new site's own highlighter from scratch* — reconciled into the two-renderer content pipeline above.
3. **URL/permalink drift loses inbound links and search equity** — the live legacy site's homepage only surfaces 10 of 13 posts (pagination hides the CSP/HSTS posts, the two most likely to have inbound links). *Avoid: pull the authoritative 13-post list and slugs from the source GitHub repo/sitemap, not the rendered site; decide the new URL scheme (e.g., reuse the old slug under `/writing/[slug]`) before any migration code is written — this is a one-way door.*
4. **The dateless, stateless backlog reads as a wishlist** — corroborated independently by both FEATURES.md's prior-art survey (every genre that works without dates either shows a date/state or explicitly reframes as a graveyard — neither applies here) and PITFALLS.md. This is a **named, accepted risk already logged in PROJECT.md**, not something for this research to resolve. The available mitigation is progress-report copy voice, aggressive curation, and subordinate placement below the case study/work list — plus one option worth raising with you directly: a single section-level "last touched" timestamp (one date for the whole section, not per item) would close most of the gap without contradicting the per-item no-dates/no-states decision. This is presented here as an open decision, not a default applied.
5. **Broken OG/Twitter metadata previews badly when pasted into Slack** — the single most common real-world use of this site during a job search. `metadataBase` must resolve to the live Railway URL (via an explicit env var, not `localhost`/unset) for OG images to unfurl correctly. *Avoid: set `NEXT_PUBLIC_SITE_URL` in the Railway dashboard for production, generate real OG images, and manually paste the live production URL into an actual Slack message before calling this done.*

## Implications for Roadmap

Based on combined research, suggested phase structure (reconciling ARCHITECTURE §8's build order with PITFALLS' phase-ownership mapping and FEATURES' two build-order dependencies):

### Phase 1: Deploy Foundation & Design System
**Rationale:** Retire deployment risk and typographic-system risk before any content exists — both are one-time setup work with well-documented failure modes that are cheap to catch early and expensive to retrofit.
**Delivers:** Next.js (App Router, TS) scaffolded; `Dockerfile`/`nginx.conf.template` deleted; a "hello world" page proven live on Railway via the zero-config Node builder; typographic tokens (`globals.css`), self-hosted fonts (`next/font`), base layout/nav shell; `prefers-reduced-motion` gating wired in from the first component, not retrofitted.
**Avoids:** Pitfall 1 (stale Dockerfile), Pitfall 4-equivalent failures (moot given no custom Docker build), Pitfall 11 (letter-spacing/contrast accessibility), Pitfall 12 (motion without reduced-motion gate), Pitfall 13 (font-loading regressions + GDPR exposure).
**Uses:** Next.js 16.3.3, `next/font`, Tailwind v4 `@theme`.

### Phase 2: Content Pipeline
**Rationale:** Nothing downstream (writing index, case study, backlog) can be built without this; validate the mechanism before committing real content to it.
**Delivers:** `lib/content/writing.ts` (gray-matter frontmatter parsing, slug enumeration), `WritingEntry`/`WritingMeta` types, `mdx-components.tsx`, `<Prose>`, the two-renderer dispatch (plain Markdown for `.md`, `next-mdx-remote-client` MDX for `.mdx`) proven against one stub post of each kind.
**Uses:** gray-matter, next-mdx-remote-client, remark/rehype.

### Phase 3: Writing Archive Migration
**Rationale:** Validate the content pipeline against the safest dataset (already-written prose) before the hardest one (unwritten case-study prose); URL scheme and series-grouping are one-way doors that must be decided here, not retrofitted.
**Delivers:** Authoritative 13-post list + original Markdown pulled from the `guillem-gelabert.github.io` source repo (not the rendered homepage, which only shows 10); Liquid tags stripped; URL slug scheme decided (`/writing/[slug]`); series-grouping metadata (security-headers, Git, standalone TS) added per file; `/writing` index built grouped by series with a framing line; `/writing/[slug]` route with `generateStaticParams`.
**Addresses:** FEATURES.md's series-grouping differentiator (essential, near-zero cost).
**Avoids:** Pitfalls 2, 3, 9, 10 (Liquid/Rouge corruption, URL drift, frontmatter/date mismatch).

### Phase 4: Work List & Landing Skeleton
**Rationale:** Landing-page structure and the work-list *code* have no dependency on the case study existing — only the featured entry's *copy* does (see Phase 5). Build the shell now, finalize that one line later.
**Delivers:** `content/work.ts`, landing page assembling positioning sentence + vertical work list (no thumbnails, no grid) + placeholder featured slot + entry point into `/writing`.
**Implements:** ARCHITECTURE's `WorkItem` type; `site-config.ts` `featuredSlug` pointed at a placeholder for now.

### Phase 5: The Case Study
**Rationale:** The long pole of the milestone (writing effort, not technical) and the single highest-stakes artifact per FEATURES.md — the only thing that can close the "no editorial judgment" gap. Once it exists, loop back and finalize Phase 4's featured-entry annotation so it links in rather than duplicates.
**Delivers:** ib-gdp-evolution case study, structured question → expectation → data reveal → pivot (with one shown rejected alternative) → shipped link → methodology note; `type: "case-study"` frontmatter; `site-config.featuredSlug` wired to it; Phase 4's work-list copy finalized.
**Addresses:** FEATURES.md's Surface 1 (deepest-researched surface); the case-study-as-post architectural pattern from ARCHITECTURE §3.

### Phase 6: Backlog
**Rationale:** Pure static content, zero dependency on any other surface — but carries the one open product decision this research surfaces rather than resolves.
**Delivers:** Backlog data source implemented (content file recommended default per ARCHITECTURE §4), 3-5 curated entries written in progress-report voice, placed subordinate to the case study/work list.
**Open decision to raise with you before/during this phase:** add a single section-level "last touched" timestamp, or ship exactly as scoped (no dates/states at all, per-item or section-level)? PROJECT.md logs the current scope as an accepted risk (⚠️ Revisit) — this phase should surface, not silently resolve, that flag.

### Phase 7: CV, Contact, Photo & Final Assembly
**Rationale:** Lowest-dependency surfaces plus the final integration/QA pass; groups naturally since they're what completes the landing page.
**Delivers:** CV page (structured data + print stylesheet, tested via an actual print-to-PDF); contact block using a progressive-enhancement obfuscation pattern — real, accessible, selectable text as the server-rendered baseline (satisfies the screen-reader/no-JS accessibility bar PITFALLS.md insists on), enhanced via an inline `<script>` (not a client component) into a working `mailto:` link plus a copy-to-clipboard button once JS runs (satisfies FEATURES.md's low-friction/copy-to-ATS recommendation) — verified with the keyboard/screen-reader/copy-paste three-part test; photograph via `next/image` with explicit dimensions and `priority`; `next.config` `headers()` set to actually demonstrate the security headers the migrated post series describes; SEO/metadata pass (`metadataBase` via Railway env var, real OG images, `sitemap.ts`/`robots.ts`, a real Slack-paste test of the live production URL); final cross-link audit against PROJECT.md's Out-of-Scope list as a review gate.
**Avoids:** Pitfalls 5, 8, 14, 15, 16.

### Phase Ordering Rationale

- Deploy and design-system risk are retired first (Phase 1) because their failure modes are invisible in local dev and expensive to discover late — matches both ARCHITECTURE §8 and PITFALLS' phase mapping exactly.
- Content pipeline (Phase 2) precedes any content because every downstream surface depends on it; migrating the legacy archive (Phase 3) before writing the case study (Phase 5) validates that pipeline against low-risk, already-written content first.
- The work-list/landing skeleton (Phase 4) is deliberately split from its own content finalization — code has no dependency on the case study, its copy does. This reconciles ARCHITECTURE's code-first ordering with FEATURES' explicit copy-dependency note without restructuring anything.
- Backlog and contact block are the two fully independent surfaces (no dependency on anything else); they're scheduled late here to align with final landing assembly, but either could be pulled forward as an early, low-risk win if useful for morale/momentum — nothing else in the roadmap depends on that choice.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Content Pipeline):** the extension-dispatched dual-renderer approach (plain Markdown vs. MDX in one collection) is a reconciliation made in this synthesis, not a documented pattern from any single source — worth a short spike/prototype before committing the loader's shape.
- **Phase 3 (Writing Archive Migration):** confirm against the actual source repo (not just the live site) exactly which of the 13 posts contain Liquid-syntax code fences before finalizing the migration script — PITFALLS.md's finding here is MEDIUM confidence (verified against the live site, not the repo).

Phases with standard, well-documented patterns (safe to skip research-phase):
- **Phase 1 (Deploy Foundation):** Railway's zero-config Next.js Node deployment is officially documented and HIGH confidence.
- **Phase 7 (Contact block, obfuscation mechanism):** the accessible-obfuscation pattern (real text baseline + progressive JS enhancement) is a well-trodden, HIGH-confidence pattern (A List Apart, Cloudflare docs).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH (mechanics) / MEDIUM (library-choice framing) | Framework/runtime versions verified via npm registry + GitHub API directly. TypeScript 7.0.2 and ESLint 10 are unusually large version jumps — flagged, with a safe fallback (5.x) if tooling friction appears. |
| Features | MEDIUM | WebSearch-sourced, cross-corroborated by 2-3 independent sources per finding; no single canonical source for the exact 13-post staleness problem or the case-study structure, but multiple independent traditions converge on the same shapes. |
| Architecture | HIGH (Next.js/Railway mechanics) / MEDIUM (content-pipeline ecosystem) | Verified against current official Next.js docs via Context7 and Railway's own guide. Backlog *source* is explicitly an open decision by design, not a confidence gap. |
| Pitfalls | HIGH (Next.js/Railway deployment) / MEDIUM (Jekyll migration specifics, accessibility/font claims) | Jekyll findings verified against the live legacy site directly, not yet against the source repo — flagged as a pre-migration task, not a resolved fact. |

**Overall confidence:** MEDIUM-HIGH.

### Gaps to Address

- **Legacy source repo not yet directly inspected** — all Jekyll/permalink/pagination findings come from crawling the *live rendered site*, not the `guillem-gelabert.github.io` GitHub repo or its Markdown source/sitemap. Pulling the authoritative 13-post list and raw Markdown from the repo is a concrete Phase 3 pre-migration task, not yet done.
- **Backlog data source** — architecturally resolved to "content file, recommended default" (ARCHITECTURE §4), but not yet confirmed with you; revisit if a GitHub Issues/Projects board already holds this list elsewhere.
- **Backlog risk (no dates/states)** — deliberately left as an open decision in this summary rather than defaulted: whether to add a single section-level "last touched" timestamp. PROJECT.md already logs the underlying risk as accepted (⚠️ Revisit) — this should be surfaced again during Phase 6 planning, not silently resolved either way.
- **Custom domain (deferred per PROJECT.md)** — affects `metadataBase`/OG-image configuration and any future redirect strategy from the old GitHub Pages URLs; the metadata pass in Phase 7 should be built to point at the Railway URL now and be revisited (not rebuilt) once a domain is chosen.
- **Contact-block obfuscation mechanism** — the progressive-enhancement synthesis proposed in Phase 7 reconciles three files' differing recommendations but hasn't been prototyped; validate it against the full keyboard/screen-reader/copy-paste test early in that phase, not at the end.

## Sources

### Primary (HIGH confidence)
- Context7 `/vercel/next.js` — static export limitations, `output: 'standalone'`/`headers()` behavior, `generateStaticParams`, MDX + App Router setup, `next/font`, Server/Client Component boundaries.
- npm registry + GitHub API direct queries — current package versions; confirmed `hashicorp/next-mdx-remote` archived (2026-03-26), `ipikuka/next-mdx-remote-client` active.
- [Railway Next.js deployment guide](https://docs.railway.com/guides/nextjs) and [Railpack Node.js docs](https://railpack.com/languages/node) — zero-config builder detection and Railway's own suggested pattern.
- [Next.js sharp-missing-in-production](https://nextjs.org/docs/messages/sharp-missing-in-production) / [install-sharp](https://nextjs.org/docs/messages/install-sharp) messages.
- Repo inspection — `Dockerfile`, `nginx.conf.template` read directly (current deployment state).

### Secondary (MEDIUM confidence)
- [ContentLayer has been Abandoned — What are the Alternatives?](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives)
- [Velite — Integration with Next.js](https://velite.js.org/guide/with-nextjs) (Turbopack incompatibility, documented workaround).
- The Pudding's methodology-footer convention, *Data Sketches* documented process, FlowingData's "process" series — triangulated case-study structure.
- Derek Sivers' `/now` page guidance, `nownownow.com`/IndieWeb, My Dead Projects — backlog/now-page prior art.
- A List Apart's "Graceful E-Mail Obfuscation," Cloudflare Scrape Shield docs, spencermortensen.com's 2026 obfuscation survey.
- Live fetch of `guillem-gelabert.github.io` — permalink structure, pagination gap (10 of 13 posts visible) — **flagged for re-verification against the source repo**.
- Adrian Roselli / Accessible Website Services — letter-spacing and screen-reader pronunciation.
- Munich court GDPR ruling on Google Fonts (Jan 2022) — corroborated across multiple independent tech-press sources.

### Tertiary (LOW confidence, flagged)
- TypeScript 7.0.2 / ESLint 10 as current npm `latest` — accurate as of research date but an unusually large jump from what most tooling/tutorials assume; safe fallback to 5.x/8.x noted in STACK.md.
- Velite/`next-mdx-remote-client` behavior specifically under `output: 'export'` — not officially documented; moot given the resolved rendering strategy (Node server, not static export), but would need re-verification if that decision is ever revisited.

---
*Research completed: 2026-08-29*
*Ready for roadmap: yes*
