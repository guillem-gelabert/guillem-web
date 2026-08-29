# Architecture Research

**Domain:** Content-led personal site (Next.js App Router, Railway hosting) — greenfield
**Researched:** 2026-08-29
**Confidence:** HIGH (Next.js/Railway mechanics verified against current official docs); MEDIUM (content-pipeline library ecosystem, verified by one secondary source); backlog source is an open decision by design, not a confidence gap.

## Executive Answer

Everything in v1 is knowable at build time — 13 migrated posts, one new case study, a handful of
work-list entries, a CV, a short backlog. Nothing in the surface list needs a database, a CMS, or
a runtime API. The whole site should render as static HTML from a `next build`, served by a plain
Next.js Node process (`next start`) that Railway runs with zero configuration. The only place a
"v2 will not require a rewrite" guarantee has to be engineered deliberately is the **content
frontmatter schema** (types/tags must be additive) and the **case-study promotion path** (must be
a query change, not a content migration) — both are addressed below with concrete schemas.

The existing `Dockerfile` / `nginx.conf.template` do not survive. They were written to serve one
static prototype HTML file and have no role in a Next.js Node deployment on Railway — see §9.

---

## 1. Route and File Structure

App Router, TypeScript, no route groups needed at this size (route groups solve multi-team /
multi-layout problems this project doesn't have yet — see Anti-Patterns).

```
guillem-web/
├── app/
│   ├── layout.tsx              # root layout: <html>/<body>, fonts, nav shell, footer
│   ├── page.tsx                 # landing view — assembles all v1 surfaces
│   ├── globals.css              # type scale, colour tokens (Typographic tier)
│   ├── mdx-components.tsx       # global MDX component map (h1-h6, a, blockquote, img, pull-quote)
│   ├── writing/
│   │   ├── page.tsx             # writing index — flat, reverse-chron list (v1)
│   │   └── [slug]/
│   │       └── page.tsx         # shared template: legacy post OR case study
│   └── cv/
│       └── page.tsx             # CV as an HTML page
│
├── content/
│   ├── writing/
│   │   ├── security-headers-x-xss-protection.mdx
│   │   ├── security-headers-csp.mdx
│   │   ├── ...                  # 13 legacy posts, migrated as-is
│   │   └── ib-gdp-evolution.mdx # the case study — SAME collection (see §3)
│   ├── work.ts                  # structured work-list entries (not prose)
│   ├── backlog.ts               # placeholder — source TBD by phase planning (see §4)
│   └── cv-data.ts                # structured CV entries (roles, dates, skills)
│
├── lib/
│   ├── content/
│   │   ├── writing.ts            # fs + gray-matter loader → typed WritingMeta[] / full entry
│   │   └── types.ts               # WritingEntry, WorkItem, BacklogItem, CvData types
│   └── site-config.ts            # positioning sentence, featuredSlug, contact link targets
│
├── components/
│   ├── prose.tsx                  # typographic wrapper around rendered MDX output
│   ├── writing-index-row.tsx
│   ├── work-list-item.tsx
│   ├── backlog-item.tsx
│   ├── contact-block.tsx          # obfuscated email + GitHub + LinkedIn (server, see §6)
│   └── site-footer.tsx
│
├── public/
│   ├── photo.jpg
│   └── favicon, etc.
│
├── next.config.js                 # plain config — no output:'export', no output:'standalone' (see §9)
├── package.json
└── tsconfig.json
```

**Not built in v1, deliberately absent from the tree:** `app/(work)/[slug]/page.tsx` for
individual project pages (BRIEF §6 promotes case studies to the landing view at v2, not to
dedicated project routes), any `/tags/[tag]` or `/category/[category]` route (that's the v2
taxonomy surface — see §2), any `app/api/*` route handler (nothing in v1 needs a request-time
endpoint).

---

## 2. Content Model

Three shapes, not one generic "content" abstraction — a generic collection framework is overkill
at n=15ish items (see Anti-Patterns).

### 2a. Writing (posts + case study — one collection)

Frontmatter, v1:

```yaml
---
title: "Fixing typing issues locally with `paths`"
date: "2020-06-12"
type: "post"          # enum, forced to exist now because the case study needs a second value
summary: "One-line dek used in the index and any teaser."
draft: false
---
```

`type: "post" | "case-study"`. The slug is the filename (`typescript-paths.mdx` → `/writing/typescript-paths`) — no separate `slug` field, nothing to keep in sync.

**Why `type` exists at v1 and `tags`/`category` don't:** `type` is a *structural* discriminator —
it decides which template treatment and which query the case study participates in, and it's
already forced into existence by shipping one case study alongside 13 posts. `tags`/`category`
(BRIEF §6: "book summary, commentary, learning") are an *editorial taxonomy*, explicitly out of
scope for v1 per PROJECT.md. Because they're a different axis, adding them in v2 is additive:

```yaml
tags: ["typescript", "tooling"]   # v2 — optional string[], absent = [] 
category: "how-to"                 # v2 — optional, absent = uncategorised
featured: false                    # v2 — optional, only needed once >1 item competes for landing space
```

No v1 file needs to be touched to add these fields in v2 — every loader function should treat them
as optional with defaults, so old frontmatter stays valid unchanged. This is the whole answer to
"design it so v2 is additive, not a migration."

### 2b. Work list (structured data, not prose)

`content/work.ts` — a plain typed array, not MDX. The vertical work list is name + one line +
a link, not long-form writing:

```ts
type WorkItem = {
  title: string
  description: string       // one line
  url: string                 // external interactive piece, or an internal /writing/[slug]
  caseStudySlug?: string      // present once a case-study writeup exists for this item
}
```

`ib-gdp-evolution` gets `caseStudySlug: "ib-gdp-evolution"` pointing at the writing entry;
`Watch People Die` (no case study yet) only gets `url`. Adding a fourth/fifth work item in v2 is
appending to this array — no schema change.

### 2c. Backlog (name + rich-text description only)

Source is deferred (see §4), but the consumed shape is fixed regardless of source:

```ts
type BacklogItem = {
  name: string
  description: string   // rich text — rendered through the same markdown pipeline as writing
}
```

Deliberately no `date`/`status`/`order` (explicit v1 decision, PROJECT.md flags this as an
accepted risk). The shape doesn't preclude adding `status` later — that would also be additive,
not a migration, for the same reason as §2a.

### 2d. CV

`content/cv-data.ts` — structured data (roles, dates, skills as arrays), not a markdown file. A
CV is not a prose collection: no slug routing, no index, exactly one page. Running it through the
MDX pipeline would buy nothing and adds a dependency for no reason. Keep data and layout markup
separate (data file + `app/cv/page.tsx` template) purely so future edits don't require touching
JSX, not because it needs the same machinery as writing.

---

## 3. Is the Case Study a Post or Its Own Type?

**A post, discriminated by `type`, in the same collection and route as the legacy writing.** Not a
separate content collection, not a separate route namespace (`/case-studies/[slug]` or
`/work/[slug]`).

Reasoning:
- Building a second loader + second dynamic route for a collection of exactly one item is pure
  overhead today, and BRIEF §6 confirms the promotion is additive (2–3 case studies at v2, not a
  restructure).
- `/writing/ib-gdp-evolution` is a perfectly good URL for it. Nothing about "featured on the
  landing page" requires a different route — featuring is a landing-page *query*, not a URL
  concern.
- The writing index can legitimately also list the case study (it is, after all, writing) —
  simplest v1 index query is "all entries, sorted by date," no type-filtering logic to write or
  get wrong. If that reads as redundant once there's more than one case study, excluding
  `type: "case-study"` from the index is a one-line filter change, not a restructure.

**How promotion to v2 is "a config change, not a rewrite":**

- **v1:** `site-config.ts` names one explicit slug — `featuredSlug: "ib-gdp-evolution"`. The
  landing page reads that one entry directly. Correct model for n=1: no query, no sort, no
  "what if none are marked featured" edge case.
- **v2:** replace the single constant with a query: `getWritingEntries().filter(e => e.type ===
  "case-study").sort(byDate).slice(0, N)`. The frontmatter needed for this (`type`) already
  exists — nothing in `content/writing/*.mdx` changes. Only `lib/site-config.ts` and the landing
  page's data-fetching line change.

This is the concrete mechanism the roadmapper can point a phase at later: "swap `featuredSlug`
constant for a `type === 'case-study'` query" is a small, well-bounded phase on its own.

---

## 4. Backlog Data — Options for Phase Planning

Shape is fixed (§2c); source is not. Three realistic options, with architectural consequences:

### Option A — Content file in repo (recommended default)

`content/backlog.ts` (typed array) or `content/backlog/*.mdx` (one file per item, richer
formatting). Parsed/loaded at build time exactly like `work.ts` / `writing/`.

- **Consequences:** zero external dependency, zero auth/secrets, no network call at build or
  request time, works identically regardless of whether the eventual deploy is static export or
  a Node server (see §9). Updating the backlog requires editing a file and redeploying — for a
  personal backlog touched occasionally, this is not friction, it's the same loop as writing a
  post. Git history becomes a de facto (if invisible) audit trail, which partially offsets the
  "no dates/no states" risk PROJECT.md already flags without contradicting that decision.
- **Recommended unless** Guillem already actively tracks this list somewhere else (see B) and
  duplicate entry would actively cause drift.

### Option B — GitHub API (Issues, or a Projects board), fetched at build time

A build-time `fetch()` against the GitHub REST/GraphQL API, executed inside
`lib/content/backlog.ts`, normalized into the same `BacklogItem[]` shape.

- **Consequences:** single source of truth if the list already lives in a GitHub Projects board
  or a repo's issues — avoids double-entry. Requires a `GITHUB_TOKEN` as a Railway env var
  (unauthenticated GitHub API is rate-limited to 60 req/hr, tight but survivable for a
  once-per-deploy build-time call; a token raises this substantially and is trivial to add).
  Introduces a **build-time** network dependency: a GitHub outage or rate-limit at the exact
  moment of a Railway build fails the deploy, which a content file never can. Description text
  arrives as GitHub-flavoured markdown and needs mapping into the same render pipeline used for
  writing/backlog elsewhere — a real but small normalization layer.
- **Only fetch at build time, not request time.** Fetching per-request (or via ISR) turns the
  backlog into the site's one dynamic surface, which is a meaningfully different rendering
  boundary (client component or Server Component with `revalidate`) for a feature the brief never
  asked to be "live." If freshness-without-redeploy is ever wanted, that's a deliberate v2+
  upgrade, not a v1 default.

### Option C — Third-party headless source (Notion, Airtable, etc.)

Technically possible, not recommended. For "name + rich-text description" at single-digit-to-teens
volume maintained by one person, a hosted CMS adds an external service, an auth token, and a
network dependency for no authoring-friction win over Option A. Only worth it if Guillem is
already using one of these tools for reasons unrelated to this site.

**Architectural invariant regardless of choice:** whatever the source, normalize to
`BacklogItem[]` at **build time**. This keeps the backlog section exactly as static as the rest of
the page and means the source decision never touches the rendering boundary question (§6) — it's
purely a `lib/content/backlog.ts` implementation swap.

---

## 5. Data Flow

No API layer, no database, no CMS client at request time. Everything is a direct, synchronous
(from React's perspective, `async`) function call from a Server Component into a `lib/content/*`
module that reads the filesystem (or, for backlog Option B, calls an external API once at build
time).

```
next build
   │
   ├─ lib/content/writing.ts
   │     reads content/writing/*.mdx (fs.readdirSync)
   │     gray-matter → frontmatter-only metadata (fast, no MDX compile)
   │     used by: app/writing/page.tsx (index), generateStaticParams for app/writing/[slug]
   │
   ├─ app/writing/[slug]/page.tsx
   │     generateStaticParams() enumerates every slug from the metadata list
   │     dynamicParams = false        → unknown slugs 404 loudly, not silently
   │     per-page: dynamic import(`@/content/writing/${slug}.mdx`) compiles+renders that one body
   │
   ├─ content/work.ts, content/cv-data.ts, content/backlog(.ts|/*)
   │     imported directly by their pages/components — plain module reads, no loader needed
   │
   └─ app/page.tsx (landing)
         site-config.featuredSlug → look up that one writing entry directly (v1)
         work.ts, backlog source → rendered as lists
```

Everything above happens once, at `next build` — the output is static HTML for every route in the
tree (App Router's default for routes with no dynamic/runtime API use, whether or not
`output: 'export'` is set — see §9). There is no scenario in v1 that needs a Route Handler.

---

## 6. Rendering Boundaries — Client vs Server

**Default: server, for everything.** This is not just "the App Router default" applied lazily —
walking every v1 surface, none of them need interactivity beyond `<a>` hover states:

| Surface | Boundary | Why |
|---|---|---|
| Landing page | Server | Static composition of server data |
| Writing index | Server | Static list |
| Post / case-study page | Server (MDX body) | Static per-page render; see below for embeds |
| CV page | Server | Pure static markup, no interactivity requested |
| Backlog section | Server | Static list regardless of §4 source choice |
| Contact block (GitHub/LinkedIn links) | Server | Plain `<a href>` |
| **Obfuscated email** | **Assessed below — does not need to be client** | |

**The obfuscated email — the one surface flagged for a client boundary — doesn't need one.**
Three ways to obfuscate, only the weakest architecturally requires 'use client':

1. **CSS/markup trick** (reversed text + `unicode-bidi`, or split into non-adjacent DOM nodes
   reassembled visually via CSS) — zero JS, fully server-rendered.
2. **Build-time encode + inline vanilla `<script>`** (e.g., the address is base64/rot13'd in the
   server-rendered HTML, and a small inline `<script>` — plain HTML, not a React client component
   — decodes it into an `href` on load). This is still 100% inside a Server Component's JSX; a
   `<script>` tag is not a client-component boundary, it's an HTML element.
3. **A React client component** (`'use client'`, decode on mount or reveal-on-click) — the only
   option of the three that actually requires hydration.

Recommend **option 2**. It matches the "no performative motion, minimise effort" brief without
introducing the one thing that would otherwise force this Typographic-tier site to ship any client
JS bundle for interactivity. Net result: **v1 can plausibly ship with zero `'use client'`
boundaries anywhere in the tree.** If a "click to copy" micro-interaction is wanted later, that
specific leaf button is the legitimate client-component candidate — defer it, it's polish, not a
requirement (the brief asks for "obfuscated," not "copy to clipboard").

**Where a client boundary *will* eventually be needed (not v1):** any Performative-tier
scroll-driven/WebGL work at v3 (the `prototype-stack.html` and `text_trail_demo/` prototypes in
the repo root today are previews of that — see §9). Nothing in v1 or v2 as scoped requires it.

---

## 7. Component Decomposition

**Worth extracting now:**
- `mdx-components.tsx` (root-level, Next.js convention) — one place defining how `h1`–`h6`, `a`,
  `blockquote`, `img` render inside any MDX body. Shared by every post and the case study from day
  one; skipping this means restyling prose per-file.
- `<Prose>` — typographic wrapper around rendered MDX/markdown output, reused by writing pages
  and (if CV ever grows prose sections) the CV page.
- `<WritingIndexRow>`, `<WorkListItem>`, `<BacklogItem>` — thin, list-item-shaped components. All
  three lists (work, backlog, writing index) are structurally similar (name/title + one line +
  optional link) — a single generic `<EntryRow>` parametrized by props is defensible given how
  small and obvious the pattern is, but don't force it before writing the three concrete versions;
  extract the shared shape only once duplication is actually felt.
- `<ContactBlock>` — isolates the email-obfuscation mechanism (§6) in one place so it's audited
  once, not reasoned about per usage site.

**Premature at this size — do not build yet:**
- A generic `<Card>` / `<Badge>` / `<Tag>` component system. There are no cards in v1 (explicitly
  out of scope — card grids read empty at n=3) and no tags until v2. Building the chrome before
  the content that needs it produces components with no real usage to validate against.
  `<Badge>`/`<Tag>` becomes relevant exactly when §2a's `tags` field ships in v2 — build it then.
- A generic `collection()` content-framework abstraction (à la Contentlayer/Velite's schema
  layer) covering "any content type." Three concrete, purpose-built loader functions
  (`getWritingEntries`, `getWorkItems`, `getBacklogItems`) are simpler to read, debug, and hand to
  a future contributor than a generic content framework built for collections that don't exist yet.
- Route groups (`(marketing)`, `(work)`, etc.). They solve "different root layouts per section" —
  this site has one layout for everything at v1/v2 scale. Introduce a route group only if/when a
  section genuinely needs a structurally different shell.

---

## 8. Build Order

Sequenced to retire infrastructure risk first, validate the content pipeline on the *safest*
dataset (already-written legacy posts) before the *hardest* one (unwritten case-study prose), and
keep low-dependency surfaces (CV, contact) floatable to wherever they fit in phase planning.

1. **Scaffold + deploy pipeline.** Next.js (App Router, TypeScript) project init, base
   `app/layout.tsx`, typographic tokens (`globals.css`), delete `Dockerfile` /
   `nginx.conf.template` (§9), push a "hello world" `app/page.tsx` to Railway to prove the
   zero-config Node deploy works *before* any content exists. Retires deploy risk early instead
   of at the end.
2. **Content pipeline.** `lib/content/writing.ts` loader (gray-matter frontmatter parsing +
   per-slug dynamic MDX import), `WritingEntry`/`WritingMeta` types, root `mdx-components.tsx`,
   `<Prose>`. Nothing downstream can be built without this.
3. **Writing surfaces.** Migrate the 13 legacy posts into `content/writing/*.mdx`. Build
   `/writing` index and `/writing/[slug]` with `generateStaticParams`. This is the pipeline's
   real-world proof: content that already exists, no new prose required, lowest-risk validation
   of the whole MDX → route → static HTML path.
4. **Work list + landing skeleton.** `content/work.ts`, landing page assembling positioning
   sentence (static copy) + work list + link into `/writing`. Doesn't depend on the case study
   existing — can point `featuredSlug` at a placeholder/first post and swap later.
5. **The case study.** Write the ib-gdp-evolution prose itself (the actual long pole of this
   milestone), add it to `content/writing/` with `type: "case-study"`, point
   `site-config.featuredSlug` at it. Depends on steps 2–3 already existing — it is "just another
   writing entry" per §3, so nothing new is built for it structurally, only content is authored.
6. **Backlog.** Resolve the §4 source decision in phase planning, implement
   `lib/content/backlog.ts` against the fixed `BacklogItem[]` shape, add the backlog section to
   the landing page reusing the list pattern from step 3/4.
7. **CV page.** Low-dependency, can slot in any time after step 1–2. Static data file +
   dedicated page.
8. **Contact block + photograph.** Trivial in isolation (§6 resolves the only design question);
   naturally lands near the end because it completes the landing page.
9. **Final landing assembly + cross-link audit.** Wire featured case-study excerpt, work list,
   backlog, writing-index entry point, contact block, and photo into one `app/page.tsx`; verify
   the Railway deploy end-to-end.

---

## 9. Fate of the Existing Dockerfile / nginx.conf.template

**Delete both.** They do not adapt.

They were written to serve exactly one static file (`prototype-stack.html`, a Performative-tier
scroll-hero prototype, itself out of scope for v1 per PROJECT.md) via nginx on Railway — a
pre-Next.js artifact from before the framework decision, exactly as the milestone context flags.

**Verified against Railway's own Next.js guide:** Railway builds and deploys Next.js apps via
Railpack/Nixpacks with zero configuration by detecting `package.json` — no Dockerfile required.
Railway's guide's own recommendation is `output: "standalone"` in `next.config.js` with a
`"start": "node .next/standalone/server.js"` script — but `output: 'standalone'` requires a manual
post-build copy of `public/` and `.next/static/` into the standalone folder (confirmed against
current Next.js docs) or those assets silently fail to serve. That's an avoidable extra moving
part for a v1 with a trivial dependency footprint.

**Recommendation for v1:** skip `output: 'standalone'` entirely. Plain `next build` + `next start`,
zero-config Nixpacks/Railpack detection, no Dockerfile, no nginx, no manual copy step. This is the
least-configuration path and matches "MVP first, no polishing." Revisit `output: 'standalone'` (or
a slim custom Dockerfile) later purely as a build-size/deploy-speed optimization — one Railway
case study found a custom Dockerfile shrinking a Next.js image from 1.3GB to ~77MB — but that's a
v2+ infra improvement, not a v1 blocker.

**`prototype-stack.html` and `text_trail_demo/`:** not deleted, not integrated. Both are
Performative-tier motion previews (variable-font scroll hero; a WebGL/canvas text-trail demo) —
exactly the tier explicitly deferred to v3. They sit outside `app/` and `public/`, so a Next.js
build never touches them; no action is required beyond leaving them out of the App Router tree
until a v3 phase deliberately promotes one into a real component.

---

## Standard Architecture (Reference Summary)

### System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                      Build time (next build)                       │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌───────────┐ │
│  │ content/    │   │ content/    │   │ content/    │   │ content/  │ │
│  │ writing/*.mdx│  │ work.ts     │   │ backlog(.ts)│   │ cv-data.ts│ │
│  └──────┬─────┘   └──────┬─────┘   └──────┬─────┘   └─────┬─────┘ │
│         │                │                │                │       │
│         ▼                ▼                ▼                ▼       │
│  lib/content/*.ts  (typed loaders — fs + gray-matter, no network)   │
│         │                │                │                │       │
│         ▼                ▼                ▼                ▼       │
│  app/writing/*     app/page.tsx     app/page.tsx      app/cv/page  │
│  (generateStaticParams enumerates every route → static HTML output)│
├───────────────────────────────────────────────────────────────────┤
│                Runtime (Railway, next start, Node)                  │
│              serves prerendered static HTML for every route         │
└───────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `lib/content/writing.ts` | Frontmatter parsing + slug enumeration | `fs.readdirSync` + `gray-matter` |
| `app/writing/[slug]/page.tsx` | Full MDX compile + render for one entry | `generateStaticParams` + dynamic `import()` |
| `mdx-components.tsx` | Consistent prose styling across all MDX | Next.js global MDX component map |
| `site-config.ts` | Single point of truth for featured-slug/positioning copy | Plain exported object/constants |
| `<ContactBlock>` | Isolates the one obfuscation mechanism | Server component, inline `<script>` |

## Scaling Considerations (mapped to BRIEF §6 stages, not user counts — this is a content-volume problem, not a traffic problem)

| Concern | v1 (~3 work items, 0–1 case study, 13 posts) | v2 (~6–8 items, 2–3 case studies) | v3 (12+ items, regular cadence) |
|---|---|---|---|
| Landing "featured" | Explicit `featuredSlug` constant | Query: `type === 'case-study'`, sorted, sliced | Blog-primary reverse-chron homepage (structural change, out of this milestone) |
| Writing taxonomy | Flat index, `type` enum only | `tags`/`category` added (additive, §2a) | Tag/category index routes become worth building |
| Backlog | File or build-time API fetch (§4) | Same, possibly with `status` added (additive) | May warrant request-time freshness if it becomes a "working log" people check often |
| Motion tier | None (Typographic) | None (Responsive per BRIEF axis 2) | Performative — first legitimate client-component-heavy surface |

## Anti-Patterns to Avoid at This Size

### Anti-Pattern 1: Building a generic content framework before there are 2 collections that need one
**What people do:** Reach for Contentlayer/Velite/a custom `defineCollection()` abstraction on day
one "for scalability."
**Why it's wrong:** Contentlayer is unmaintained (no commits since late 2024, verified via
community sources); a generic schema layer adds a dependency and an abstraction for exactly two
real collections (writing, work) plus two data files (backlog, CV) — the concrete loader
functions in §5 are simpler to read and debug at this volume.
**Instead:** Three small, purpose-built functions. Reach for Velite or `next-mdx-remote` (both
actively maintained) only if the content model grows enough real cross-cutting structure to
justify it — not before.

### Anti-Pattern 2: Route groups / multiple root layouts before there's a section that needs a different shell
**What people do:** Pre-emptively wrap everything in `(marketing)`/`(writing)` route groups.
**Why it's wrong:** Route groups exist to give different sections different root layouts; this
site has one visual language for every surface at v1 and v2. Introducing them now adds an
indirection with no payoff and a real caveat (mixing multiple root layouts triggers full page
reloads on navigation between them, confirmed in current Next.js docs).
**Instead:** One `app/layout.tsx`. Introduce a route group only when a specific section
genuinely diverges.

### Anti-Pattern 3: Fetching the backlog (or anything) at request time "to keep it fresh" without being asked to
**What people do:** Default to ISR/`revalidate` or a client-side fetch for anything that might
change, out of habit.
**Why it's wrong:** Introduces a runtime dependency, a loading/error state, and a genuinely
different rendering boundary for a feature the brief never asked to be live-updating. It also
quietly reopens the "does this need a client component" question that §6 closes for the rest of
the site.
**Instead:** Build-time fetch/read, always, until a specific future requirement (not present in
this milestone) asks for live freshness.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---|---|---|
| Railway (hosting) | Zero-config Node/Nixpacks-Railpack detection of `package.json` | No Dockerfile; confirmed via Railway's own Next.js guide |
| GitHub API (only if §4 Option B is chosen) | Build-time `fetch()`, token via Railway env var | Never request-time — see Anti-Pattern 3 |
| GitHub/LinkedIn (contact links) | Plain `<a href>` | No API, no OAuth, just links |

### Internal Boundaries

| Boundary | Communication | Notes |
|---|---|---|
| `content/*` ↔ `lib/content/*` | Direct filesystem read at build time | No network, no API route |
| `lib/content/*` ↔ `app/**/page.tsx` | Direct async function call (Server Component) | Idiomatic App Router pattern for local content; no data-fetching library needed |
| `site-config.ts` ↔ landing page | Import + direct read | The one place that changes when the case study is promoted (§3) |

## Sources

- Next.js docs (via Context7, `/vercel/next.js`, canary branch — current as of research date):
  `generateStaticParams`, dynamic MDX imports, `output: 'export'` restrictions (headers/rewrites/
  redirects/i18n unsupported, route handlers GET-only and must be statically configured, dynamic
  params must be fully enumerated), route groups, Server/Client Component boundary rules (`'use
  client'` placement, event handlers cannot cross server→client), `output: 'standalone'` manual
  asset-copy requirement.
- [Railway Next.js deployment guide](https://docs.railway.com/guides/nextjs) — zero-config
  Railpack/Nixpacks detection; `output: 'standalone'` + custom start script as Railway's own
  suggested pattern (verified via WebFetch of the live doc).
- [Comparing deployment methods in Railway](https://blog.railway.com/p/comparing-deployment-methods-in-railway) and [custom Docker image for Next.js on Railway](https://apvarun.com/blog/custom-docker-for-next-app-on-railway) — image-size case study (1.3GB → 76.8MB with a custom standalone Dockerfile), cited as the v2+ optimization path, not a v1 requirement. MEDIUM confidence (single blog source, directionally consistent with Next.js's own standalone-output docs).
- [Contentlayer has been Abandoned — What are the Alternatives?](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) — Contentlayer unmaintained since late 2024; Velite and `next-mdx-remote` as actively maintained alternatives. MEDIUM confidence (WebSearch-sourced, not an official announcement, but consistent across multiple results).
- Repo inspection: `Dockerfile`, `nginx.conf.template`, `prototype-stack.html`, `text_trail_demo/` (read directly to establish current state and confirm the "predates the Next.js decision" framing in the milestone context).

---
*Architecture research for: guillem-web v1.0 "Working Site" milestone*
*Researched: 2026-08-29*
