# Phase 2: Content Pipeline - Research

**Researched:** 2026-08-30
**Domain:** Markdown/MDX rendering in Next.js 16 App Router; build-time syntax highlighting; prefix-free bilingual routing
**Confidence:** HIGH — the load-bearing claims were verified by building and running them in this repo, not read from docs

> **Verification method note.** Rather than reason from documentation, this research built four
> working spikes inside the actual repo at the actual installed version (Next.js 16.3.3, React
> 19.2.8, Turbopack), ran `next build` on each, inspected the prerendered HTML, measured the
> resulting bundles, and ran the existing Phase 1 Playwright suite against the proposed route
> restructure. The repo was restored to its original state afterwards (`git status` clean apart
> from pre-existing `.planning` edits and the untracked `text_trail_demo/`). Claims marked
> `[VERIFIED: built in repo]` were observed in build output or generated HTML in this session.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scope**

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

**Domain and Deployment**

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

**Internationalisation**

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

**Content Pipeline**

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

> **All five discretion items were already resolved by the approved `02-UI-SPEC.md`
> (status: approved, reviewed 2026-08-30).** They are therefore treated as locked here.
> This research resolves only the *technical mechanism* for each, and flags the two
> places where the UI-SPEC's technical premise did not survive verification (Shiki theme
> contrast; the "two-renderer dispatch" shape).

### Deferred Ideas (OUT OF SCOPE)

- **Legacy writing archive migration — v2.** The 13 posts from
  `guillem-gelabert.github.io` (8 security headers, 4 Git, 1 TypeScript, published
  20 Aug – 3 Dec 2020). The Markdown source is gone; only rendered Hugo 0.74.3 HTML
  survives. 13 posts, 14 URLs (`posts/amend/` is a stale near-duplicate of
  `posts/git-amend/`). No language hints on code blocks. The two series interleave
  chronologically. Posts contain real HTML tables. Series membership is hardcoded in
  the prose. Editorial intent: a full editorial pass, rewriting technically stale
  advice rather than annotating it.
- **Index treatment beyond n=1 — v2.** D-10's full-bleed single entry does not scale
  past roughly five items.
- **Custom domain cutover — Phase 6.** Pointing `guillemgelabert.com` at the site.

**Do not research, plan, or build any of the above.** The `.md` half of the renderer
still ships (the pipeline must accept both extensions), but no legacy content, no slug
map, no redirects, and no HTML→Markdown tooling belong in this phase.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **WRIT-01** | Visitor can browse an index of Guillem's writing hosted on the site. *(At v1 launch the index holds the case study; the 2020 archive is deferred to v2.)* | § Architecture Pattern 2 (content loader over `content/`), Pattern 4 (index at n=0/n=1/n≥2), Pattern 6 (draft exclusion via `generateStaticParams` + `NODE_ENV`). Verified: `fs.readdir` + per-file front-matter read + dynamic `import()` produces `● (SSG)` prerendered routes with no per-post wiring. |
| **I18N-01** | Visitor can read any piece of writing in English or German wherever a translation exists, at a language-appropriate URL, and can switch between them. *(Slugs localised per language; a piece may exist in one locale only.)* | § Architecture Pattern 1 (two root layouts via `(en)`/`(de)` route groups — **verified building, `<html lang="de">` observed in prerendered HTML**), Pattern 5 (translation pairing via `translationKey`, switcher omitted when absent), Pattern 7 (`hreflang` + `x-default` via `alternates.languages` — `x-default` confirmed present in Next's own type definitions). Date formatting verified via `Intl.DateTimeFormat`. |

**Success criteria coverage:**

| SC | Criterion | Where addressed |
|----|-----------|-----------------|
| 1 | Drop a file in, get a URL, no per-post wiring | Pattern 2 + Pattern 3 (dual-extension dynamic import) |
| 2 | `/writing` is a real index, deliberate at n=1 | Pattern 4 (UI-SPEC-locked layout; nothing new researched — it is a layout, not a technology) |
| 3 | Prose uses Phase 1's type system, not plugin defaults | Pattern 8 (unlayered `.prose-site` beats `@tailwindcss/typography`; **no `tailwind.config.js`, no `@config` needed**) |
| 4 | Real syntax highlighting in a chosen mono | Pattern 9 (Shiki at build time — **verified**), plus the **theme contrast finding** below |
| 5 | Fixture post exercising every element, excluded from index | Pattern 6 + § Validation Architecture |

</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

`./CLAUDE.md` (project) is short. Its actionable directives:

| Directive | Consequence for this phase |
|-----------|---------------------------|
| **"MVP first. No polishing until the core works."** | Do not add a validation library, a date library, an i18n library, or a component library. Every one of those has a zero-dependency equivalent verified below. Do not build the `n ≥ 2` index treatment (UI-SPEC already forbids it). |
| **"Update `_pm/kanban.md` when completing tasks."** | `_pm/` **does not exist** in the repo `[VERIFIED: filesystem]`. The planner should either create it as a one-line task or treat this directive as stale. Flag rather than silently ignore. |
| Goal context: "Land a job in data journalism / data visualisation / creative dev" | Reinforces BRIEF §8's "looks like data, isn't" trap — the UI-SPEC's aesthetic guardrails are the operative form of this. |

`AGENTS.md` additionally carries a Next.js-injected block:

> **"This is NOT the Next.js you know … Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."**

This research did exactly that; the bundled 16.3.3 docs are cited throughout and are the
authoritative source over any web result. **The planner and executors must do the same** —
`node_modules/next/dist/docs/01-app/` is the version-exact documentation and it differs from
training data in several ways this phase touches (Turbopack default, `params` as a Promise,
`proxy.ts` replacing `middleware.ts` naming, `global-not-found`).

**No project skills exist.** `.claude/skills/`, `.agents/skills/` are both absent
`[VERIFIED: filesystem]`.

---

## Summary

Phase 2 is a well-bounded problem with one genuinely open technical decision, two
UI-SPEC premises that did not survive verification, and one architectural change to
Phase 1 that has to happen and is safe.

**The open decision is which MDX renderer.** The UI-SPEC and STATE.md both assume a
"two-renderer dispatch" using `next-mdx-remote-client` for `.mdx` and something else
for `.md`. Both candidate architectures were built and shipped through `next build` in
this repo. Both work. `@next/mdx` — the bundler-compiled, officially documented path —
wins decisively: it produces a **4.8 MB** server output against
`next-mdx-remote-client`'s **8.6 MB** (the difference is the MDX compiler and Shiki's
grammar set being dragged into the server *runtime* rather than staying at build time),
and it is the only one of the two where D-08's "MDX may **import** arbitrary React
components" is literally true — `import { Badge } from "@/components/badge"` inside an
`.mdx` file resolves and renders. With `next-mdx-remote-client` that import throws
`Cannot find module`, because it is evaluated at runtime against the filesystem, where no
compiled `.tsx` exists; components can only arrive via a `components` prop map. The
"two-renderer dispatch" also collapses: `@next/mdx` with `extension: /\.(md|mdx)$/`
detects format from the file extension automatically, so there is exactly **one**
plugin configuration and the only dispatch left is a six-line try/catch over two dynamic
import specifiers.

**The two UI-SPEC premises that failed verification are both fixable and both matter.**
First, the Shiki theme: the spec locks `github-light` and asserts its comment token
"measures ≈4.6:1 and passes" against `--color-surface-code`. It does not. Computed
against `#F5F5F5` (which is what `rgba(0,0,0,0.04)` over white resolves to), the comment
token is **4.42:1** — a fail — and it is not alone: `keyword`/`storage` at 4.20:1,
`entity.name.tag` at 4.24:1, and `variable` at **3.20:1** all fail 4.5:1 as well.
`github-light-high-contrast`, from the same family, passes every real code scope with a
worst case of 4.62:1. The UI-SPEC pre-authorised a remedy ("substitute full ink at 60%
rather than accepting a failing grey"); swapping to the sibling theme is a strictly
better version of that remedy and costs one string. Second, Shiki emits
`style="background-color:#ffffff;color:#0e1116"` inline on every `<pre>`, and under
Turbopack the `transformers` option that would strip it **cannot be used** with
`@next/mdx` (Turbopack requires serializable plugin options — functions cannot cross into
Rust). The verified workaround is a `pre` component override in `mdx-components.tsx`,
which also supplies the `role`/`aria-label` the UI-SPEC requires for the keyboard-
scrollable code block.

**The architectural change is the root layout.** The UI-SPEC requires `<html lang>` to be
per-route with no locale prefix in the URL. In the App Router that is only achievable with
**multiple root layouts** — which means deleting `app/layout.tsx` and moving Phase 1's `/`
and `/type` into an `app/(en)/` route group alongside a new `app/(de)/`. This was built:
`next build` succeeds, `/` and `/type` still prerender as static, `<html lang="de">`
appears in `/texte/*` output, and **all nine existing Phase 1 Playwright specs pass
unchanged**.

**Primary recommendation:** Use `@next/mdx` with `extension: /\.(md|mdx)$/`, Turbopack
string-named plugins (`remark-gfm`, `remark-frontmatter`, `remark-mdx-frontmatter`,
`rehype-slug`, `@shikijs/rehype` with theme `github-light-high-contrast`), a dual-extension
try/catch dynamic import in `app/(en)/writing/[slug]/page.tsx` and its `(de)` twin, two
root layouts via `(en)`/`(de)` route groups, an unlayered `.prose-site` block in
`app/globals.css`, and zero new runtime dependencies beyond the MDX toolchain.

---

## Architectural Responsibility Map

This is a statically prerendered site. Every capability in this phase must land in the
**build** tier or the **server-render** tier; only one capability legitimately reaches the
browser.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Markdown/MDX → React | **Build (bundler loader)** | — | `@next/mdx` compiles at build. Zero runtime compiler, zero client JS. `[VERIFIED: built in repo]` |
| Syntax highlighting | **Build (rehype pass)** | — | CONTEXT's discretion note demands build-time over client-side to protect Phase 1's CLS/perf posture. Shiki as a rehype plugin runs in the same pass as everything else. `[VERIFIED: built in repo]` |
| Front-matter parsing | **Build** | — | `remark-frontmatter` + `remark-mdx-frontmatter` produce a `frontmatter` export on the compiled module. `[VERIFIED: built in repo]` |
| Content enumeration (index) | **Server Component (build-time prerender)** | — | `fs.readdir` over `content/`, executed during `generateStaticParams` / index render. Never client. |
| Route → locale mapping | **Routing (file system)** | — | Literal `writing/` and `texte/` segments. No proxy, no middleware, no negotiation. |
| `<html lang>` | **Server Component (root layout)** | — | Two root layouts. There is no other App Router mechanism for a prefix-free per-route lang. |
| `hreflang` / canonical | **Server Component (`generateMetadata`)** | — | Emitted into `<head>` at prerender. |
| Date localisation | **Server Component** | — | `Intl.DateTimeFormat` at render, inside `<time datetime>`. Deterministic given an explicit `timeZone`. |
| Language switcher | **Server Component** | — | It is a `<a href>`. No state, no client JS. Absent entirely when there is no translation (D-07). |
| Prose typography | **Build (CSS)** | — | Static CSS in `app/globals.css`. |
| **Heading smear trail** | **Browser (client)** | Server (renders the tag) | The *only* client boundary this phase adds. Confined to `SmearTitle`, a leaf wrapper. The page and the whole MDX tree stay Server Components. |

**The tier error this phase is most likely to make:** repeating Phase 1's shortcut of
marking the whole page `"use client"` to reach `useSmearHeading()`. On `/` that was
free (STATE.md: *"no server-only data fetching existed on either route, so this is
cost-free"*). On `/writing/[slug]` it is not free — it would push the compiled MDX
module, its component imports, and every Shiki-highlighted token span into the client
bundle, and `fs` would stop resolving. The `SmearTitle` boundary in the UI-SPEC's
component inventory exists precisely to prevent this and is non-negotiable.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@next/mdx` | `16.3.3` | Bundler-level MDX/Markdown loader wired into `next.config.ts` | The officially documented Next.js path (`node_modules/next/dist/docs/01-app/02-guides/mdx.md`). Version-locked to `next` itself. Turbopack support is first-class in 16. `[VERIFIED: built in repo]` |
| `@mdx-js/loader` | `3.1.1` | The webpack/Turbopack loader `@next/mdx` delegates to | Required peer of `@next/mdx`; named in the bundled Next docs install line. `[VERIFIED: built in repo]` |
| `@mdx-js/react` | `3.1.1` | `MDXProvider` / `useMDXComponents` context used by `mdx-components.tsx` | Required by the bundled Next docs install line for App Router. `[VERIFIED: built in repo]` |
| `@types/mdx` | `2.0.14` | `MDXComponents` type for `mdx-components.tsx` | Required for the typed component map. `[VERIFIED: built in repo]` |
| `remark-gfm` | `4.0.1` | Tables, strikethrough, autolinks, task lists | The UI-SPEC's Prose Contract requires `<table>`/`<th>`/`<td>` styling; GFM tables are not in CommonMark. `[VERIFIED: built in repo]` — emitted `<table><thead><tr><th>…` with `style="text-align:right"` on aligned columns |
| `remark-frontmatter` | `5.0.0` | Parses the YAML block so it is not rendered as `<hr>` + `<h2>` | Without it, front-matter renders as visible prose. `[VERIFIED: built in repo]` — reproduced the failure, then the fix |
| `remark-mdx-frontmatter` | `5.2.0` | Turns the parsed YAML into `export const frontmatter = {…}` | Makes front-matter readable by `await import()` alongside the default export. Options (`{ name: 'frontmatter' }`) are serializable, so it works under Turbopack. `[VERIFIED: built in repo]` |
| `rehype-slug` | `6.0.0` | `id` on every heading | UI-SPEC Prose Contract: *"Gets an `id` (rehype-slug) for deep links."* String-nameable, no options. `[VERIFIED: built in repo]` — `<h2 id="a-heading">` observed |
| `shiki` | `4.4.3` | Grammar/theme engine | Peer of `@shikijs/rehype`. `[VERIFIED: npm registry + built in repo]` |
| `@shikijs/rehype` | `4.4.3` | Shiki as a rehype plugin | The UI-SPEC's chosen highlighter, and the reason one config can serve both formats: it operates on hast, downstream of the md/mdx format decision. `[VERIFIED: built in repo]` — `.md` bash block and `.mdx` ts block both highlighted from one plugin entry |

**No new *runtime* dependency is added by this stack.** Every package above either runs
at build time (loaders, remark/rehype) or is a type-only import. `.next/static` (client
JS) measured **840 KB in both spikes — identical to the Phase 1 baseline**
`[VERIFIED: built in repo]`.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/font/google` → `IBM_Plex_Mono` | bundled with `next@16.3.3` | The code face | Already available. `weight` is **required** (static-weight-only family) — matches the UI-SPEC's `400`-only instruction. `[VERIFIED: node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts:6665]` |
| `next/font/google` → `Newsreader` | bundled | Extend with `style: ['normal','italic']` | `style?: 'normal' \| 'italic' \| Array<…>` present in the typed signature. `[VERIFIED: …/index.d.ts:10473]` |
| `Intl.DateTimeFormat` | Node 22 built-in | `29 August 2026` / `29. August 2026` | Use `en-GB` (not `en-US`) and `de-DE`, with `timeZone: 'UTC'`. `[VERIFIED: built in repo]` — exact UI-SPEC strings reproduced |
| `node:test` + `node:assert` | Node 22.20.0 built-in | Unit tests for the content loader | Runs `.test.ts` directly via native type stripping, no transpiler, no config. `[VERIFIED: ran a TS test file in this session]` |
| `image-size` | `2.0.2` | Build-time intrinsic dimensions for bare Markdown `![]()` | **Only if** bare Markdown images are allowed. If images are restricted to `<Figure width height>`, skip it entirely. `[ASSUMED — registry-confirmed only, not exercised]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@next/mdx` | `next-mdx-remote-client@2.1.12` | **Rejected.** Both build cleanly under Next 16.3.3 + Turbopack `[VERIFIED: built in repo]`, but nmrc costs **+3.8 MB of server output** (8.6 MB vs 4.8 MB, `.next/server`) because the MDX compiler and Shiki's grammars ship into the runtime, and it **cannot resolve `import` statements to `.tsx` components** — its own README states *"Imported modules in MDX with relative path should be transpiled into javascript before or during build process, otherwise will not work"*, and a spike confirmed `Cannot find module '…/components/chart.js'`. That breaks D-08's literal wording. Its one genuine advantage — function-valued rehype `transformers`, which Turbopack forbids in `next.config.ts` — is neutralised by the `pre` component override. **Keep it on the shelf** for one narrow reason: if a future phase needs MDX from outside the repo (a CMS, a fetched file), it is the correct tool and the `format: 'md' \| 'mdx'` switch on one shared plugin array is verified to work. |
| `@shikijs/rehype` theme `github-light` | `github-light-high-contrast` | **Switch.** See the contrast audit under Pitfalls. Same family, near-identical hue relationships, passes 4.5:1 on every real code scope. |
| `@shikijs/rehype` | `rehype-pretty-code@0.14.5` | Rejected, and the UI-SPEC already rejected it: it adds line numbers, line highlighting and diff notation, none of which this phase needs. |
| `@shikijs/rehype` | `@shikijs/rehype/core` + `createHighlighterCore` | A real bundle-slimming option (avoids loading all of `@shikijs/langs`, 11 MB on disk) and **verified working** in a standalone spike. **Not needed with `@next/mdx`**, because Turbopack's string-plugin form cannot receive a pre-created highlighter object, and highlighting is a build-time cost that does not reach the server output anyway. Revisit only if build time becomes a problem. |
| `gray-matter@4.0.3` | the compiled module's `frontmatter` export | Prefer the export. `gray-matter` has not been published since **2023-07-12** `[VERIFIED: npm registry, time.modified]`, and reading front-matter from the same compiled module the page renders keeps one source of truth. Keep `gray-matter` as a documented fallback only if index build time becomes measurable (it will not at n ≤ 15). |
| `gray-matter` | `next-mdx-remote-client/utils` → `getFrontmatter` | Works standalone and cheaply — `{ frontmatter, strippedSource }` `[VERIFIED: built in repo]` — but pulling in a whole MDX renderer for one helper is not justified when `@next/mdx` is the chosen path. |
| `next-intl` / `next-international` | literal `writing/` + `texte/` segments | Rejected by D-06 and the UI-SPEC. Those libraries assume a shared slug under a locale prefix or a middleware rewrite; both are exactly what D-06 forbids. There are two locales and roughly a dozen UI strings — a `const` object is enough. |
| `date-fns` / `dayjs` | `Intl.DateTimeFormat` | Rejected. Both UI-SPEC formats are reproduced exactly by the platform. `[VERIFIED: built in repo]` |
| `zod` for front-matter | a hand-written type guard | Rejected on CLAUDE.md's "MVP first". A ~30-line guard that throws inside `generateStaticParams` fails `next build` loudly, which is the entire requirement. |

**Installation:**

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx \
            remark-gfm remark-frontmatter remark-mdx-frontmatter \
            rehype-slug shiki @shikijs/rehype
```

All ten resolve and build together against the repo's existing `next@16.3.3` /
`react@19.2.8` tree with **0 npm audit vulnerabilities** `[VERIFIED: npm install in repo]`.

**Version verification** — all checked against the npm registry on 2026-08-30:

```
@next/mdx            16.3.3   (modified 2026-08-28)   ← tracks next itself
@mdx-js/loader        3.1.1   (modified 2025-08-29)
@mdx-js/react         3.1.1   (modified 2025-08-29)
@types/mdx           2.0.14   (modified 2026-06-06)
remark-gfm            4.0.1   (modified 2025-02-10)
remark-frontmatter    5.0.0   (modified 2023-11-20)
remark-mdx-frontmatter 5.2.0  (modified 2025-06-04)
rehype-slug           6.0.0   (modified 2023-11-20)
shiki                 4.4.3   (modified 2026-08-10)
@shikijs/rehype       4.4.3   (modified 2026-08-10)
```

> Note on `@next/mdx@16.3.3`: it must stay pinned to the installed `next` version. A
> floating `^16.3.3` is fine; a major drift is not.

---

## Package Legitimacy Audit

`slopcheck` was available on PATH and run against every candidate before any
recommendation was written. **Caveat for the record: `slopcheck install` performs a real
`npm install` as part of its check.** It modified `package.json` and `package-lock.json`
in this repo; both were restored with `git checkout` + `npm ci`, and `git status` is back
to its pre-session state. The planner should be aware of this side effect if a task
re-runs it.

| Package | Registry | Age (last publish) | Source Repo | slopcheck | Disposition |
|---------|----------|--------------------|-------------|-----------|-------------|
| `@next/mdx` | npm | 2026-08-28 | github.com/vercel/next.js | `[OK]` | **Approved** — recommended |
| `@mdx-js/loader` | npm | 2025-08-29 | github.com/mdx-js/mdx | `[OK]` | **Approved** — recommended |
| `@mdx-js/react` | npm | 2025-08-29 | github.com/mdx-js/mdx | `[OK]` | **Approved** — recommended |
| `@types/mdx` | npm | 2026-06-06 | DefinitelyTyped | `[OK]` | **Approved** — recommended |
| `remark-gfm` | npm | 2025-02-10 | github.com/remarkjs/remark-gfm | `[OK]` | **Approved** — recommended |
| `remark-frontmatter` | npm | 2023-11-20 | github.com/remarkjs/remark-frontmatter | `[OK]` | **Approved** — recommended |
| `remark-mdx-frontmatter` | npm | 2025-06-04 | github.com/remcohaszing/remark-mdx-frontmatter | `[OK]` | **Approved** — recommended |
| `rehype-slug` | npm | 2023-11-20 | github.com/rehypejs/rehype-slug | `[OK]` | **Approved** — recommended |
| `shiki` | npm | 2026-08-10 | github.com/shikijs/shiki | `[OK]` | **Approved** — recommended |
| `@shikijs/rehype` | npm | 2026-08-10 | github.com/shikijs/shiki | `[OK]` | **Approved** — recommended |
| `next-mdx-remote-client` | npm | 2026-08-11 | github.com/ipikuka/next-mdx-remote-client | `[OK]`¹ | **Not recommended** — see Alternatives. Legitimate, just outcompeted. |
| `rehype-pretty-code` | npm | 2026-07-25 | github.com/rehype-pretty/rehype-pretty-code | `[OK]` | **Not needed** — UI-SPEC already rejected it |
| `gray-matter` | npm | 2023-07-12 | github.com/jonschlinkert/gray-matter | `[OK]` | **Fallback only** — stale (3 yrs), superseded by the module `frontmatter` export |

¹ slopcheck note, verbatim: *"Name ends with '-client' — classic LLM naming pattern. Name
looks like LLM bait but package is established."* This is a false-positive heuristic; the
package is a real, actively maintained fork of `next-mdx-remote` (which was **archived in
April 2026**) and is referenced from the Next.js 15 official docs. Not a concern.

**Packages removed due to slopcheck `[SLOP]` verdict:** none.
**Packages flagged `[SUS]`:** none.

**Ecosystem verification:** every package above was confirmed on the **npm** registry via
`npm view <pkg> version` and then actually installed and built. No cross-ecosystem
confusion is possible here — this is a Node/TypeScript phase end to end.

**Postinstall audit:** `npm install` of all thirteen produced *"added 189 packages … found
0 vulnerabilities"* with no postinstall warnings `[VERIFIED: npm install in repo]`.

---

## Architecture Patterns

### System Architecture Diagram

```
 ┌──────────────── BUILD TIME (next build, Turbopack) ────────────────────────┐
 │                                                                            │
 │   content/*.mdx  ─┐                                                        │
 │   content/*.md   ─┤                                                        │
 │                   │                                                        │
 │                   ▼                                                        │
 │        ┌──────────────────────┐   extension decides format                 │
 │        │  @mdx-js/loader      │   .mdx → JSX + expressions allowed         │
 │        │  (via @next/mdx)     │   .md  → JSX/braces are literal text       │
 │        └──────────┬───────────┘                                            │
 │                   │  ONE plugin chain, both formats                        │
 │                   ▼                                                        │
 │    remark-frontmatter ─► remark-mdx-frontmatter ─► remark-gfm              │
 │                   │            (→ export const frontmatter)                │
 │                   ▼  mdast → hast                                          │
 │          rehype-slug ─► @shikijs/rehype (github-light-high-contrast)       │
 │                   │                                                        │
 │                   ▼                                                        │
 │        compiled ES module:  { default: <Post/>, frontmatter }              │
 │                   │                                                        │
 └───────────────────┼────────────────────────────────────────────────────────┘
                     │
 ┌───────────────────┼──── SERVER RENDER (prerendered at build) ──────────────┐
 │                   │                                                        │
 │  fs.readdir(content/)                                                      │
 │        │                                                                   │
 │        ├──► generateStaticParams()  ── filters lang + draft(NODE_ENV) ──┐   │
 │        │                                                                │   │
 │        └──► /writing index  ◄── frontmatter of every visible post       │   │
 │                   │                                                     │   │
 │                   ▼                                                     ▼   │
 │        app/(en)/layout.tsx                          app/(de)/layout.tsx     │
 │        <html lang="en">                             <html lang="de">        │
 │            │                                              │                 │
 │            ├─ /            (Phase 1 holding page)         ├─ /texte         │
 │            ├─ /type        (Phase 1 specimen)             └─ /texte/[slug]  │
 │            ├─ /writing                                                      │
 │            └─ /writing/[slug]                                               │
 │                   │                                                         │
 │                   ├─ generateMetadata() ──► <link rel=alternate hreflang>   │
 │                   │                          + canonical + x-default        │
 │                   ├─ <SmearTitle>  ····► CLIENT ISLAND (only one)           │
 │                   ├─ <PostMeta> ──► <time> (Intl) + <LanguageSwitch>?       │
 │                   └─ <Prose class="prose prose-site"> ──► <Post/>           │
 │                                                                             │
 └─────────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
        static HTML + 840 KB client JS (unchanged from Phase 1)
```

Trace of the primary use case — *a visitor opens `/writing/some-slug`*: Turbopack has
already compiled `content/some-slug.mdx` into a module carrying both a React component and
a `frontmatter` object, with Shiki's spans baked into the markup. At build, the `(en)` root
layout emits `<html lang="en">`, the page's `generateStaticParams` has confirmed
`some-slug` is a non-draft `lang: en` post, `generateMetadata` has emitted the `hreflang`
pair, and the page renders title → standfirst → meta → `<Prose>`. The visitor receives
static HTML. The only JavaScript that runs is the smear trail attaching to the `<h1>`.

### Recommended Project Structure

```
app/
├── (en)/                          # EN route group — root layout, <html lang="en">
│   ├── layout.tsx                 # MOVED from app/layout.tsx, lang="en"
│   ├── page.tsx                   # MOVED from app/page.tsx (Phase 1 holding page)
│   ├── type/page.tsx              # MOVED from app/type/page.tsx (Phase 1 specimen)
│   └── writing/
│       ├── page.tsx               # WRIT-01 index
│       ├── not-found.tsx          # EN "Not found" copy (UI-SPEC Copywriting Contract)
│       └── [slug]/page.tsx        # post template
├── (de)/                          # DE route group — root layout, <html lang="de">
│   ├── layout.tsx                 # NEW, lang="de"
│   └── texte/
│       ├── page.tsx
│       ├── not-found.tsx          # DE "Nicht gefunden" copy
│       └── [slug]/page.tsx
├── fonts/
│   ├── humane.ts                  # unchanged
│   ├── newsreader.ts              # EDIT: style: ['normal','italic']
│   └── ibm-plex-mono.ts           # NEW
├── globals.css                    # EDIT: --font-mono, two ink tints, .prose-site
└── favicon.ico
components/
├── smear-heading/                 # unchanged — do not touch
├── smear-title.tsx                # NEW, "use client", the ONLY new client boundary
├── prose.tsx                      # NEW, Server Component
├── post-meta.tsx                  # NEW, Server Component
├── language-switch.tsx            # NEW, Server Component
└── mdx/
    ├── figure.tsx                 # NEW, MDX component
    └── aside.tsx                  # NEW, MDX component
content/
├── fixture.mdx                    # draft: true, exercises every Prose Contract element
└── (Phase 4 writes the case study here)
lib/
├── content.ts                     # NEW: enumerate, load, pair translations
└── locales.ts                     # NEW: the ~12 UI strings + path tokens per locale
mdx-components.tsx                 # NEW, project root — REQUIRED by @next/mdx App Router
next.config.ts                     # EDIT: pageExtensions + withMDX
```

`mdx-components.tsx` must sit at the project root, beside `app/`. The bundled Next docs
are explicit: *"`mdx-components.tsx` is **required** to use `@next/mdx` with App Router and
will not work without it."*

---

### Pattern 1: Two root layouts via route groups — the only prefix-free `<html lang>`

**What:** Delete `app/layout.tsx`. Create `app/(en)/layout.tsx` and `app/(de)/layout.tsx`,
each rendering its own `<html>`/`<body>` and its own `SmearHeadingProvider`.
Move Phase 1's `page.tsx` and `type/page.tsx` into `(en)/`.

**When to use:** This phase, unconditionally. It is the only App Router mechanism that
yields a correct per-route `lang` without putting a locale in the URL. The official i18n
guide's `app/[lang]/` shape is explicitly ruled out by D-06.

**Verified:** `next build` succeeds; `/` and `/type` still report `○ (Static)`;
`grep '<html lang=' .next/server/app/texte/hallo-welt.html` → `<html lang="de"`;
`.../writing/hello-world.html` → `<html lang="en"`. **All nine Phase 1 Playwright specs
pass unchanged** (`9 passed (5.4s)`) `[VERIFIED: built in repo]`.

```tsx
// app/(de)/layout.tsx — the (en) twin is identical apart from lang, metadata and copy
import type { Metadata } from "next";
import { humane } from "../fonts/humane";
import { newsreader } from "../fonts/newsreader";
import { ibmPlexMono } from "../fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://web-production-9cedb.up.railway.app"),
  title: "Guillem Gelabert",
  robots: { index: false }, // Phase 1 D-07 — Phase 6 flips this
};

export default function DeRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${humane.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <SmearHeadingProvider>{children}</SmearHeadingProvider>
      </body>
    </html>
  );
}
```

**Three details the planner must carry into tasks:**

1. **`LayoutProps<"/">` must be replaced.** Phase 1's layout is typed
   `RootLayout({ children }: LayoutProps<"/">)`. With two root layouts both nominally at
   `/`, use an explicit `{ children: React.ReactNode }` instead. `[VERIFIED: built in repo]`
   — this substitution is what made the spike typecheck.
2. **`.next/` must be deleted after the move.** The first build after restructuring failed
   with `TS2307: Cannot find module '../../../app/page.js'` from stale generated types in
   `.next/dev/types/validator.ts`. `rm -rf .next` fixed it completely.
   `[VERIFIED: built in repo]` This will bite on Railway too if a build cache survives —
   worth an explicit verification step on the deploy.
3. **Cross-locale navigation is a full page load, not a client transition.** The bundled
   docs state this plainly for multiple root layouts. That is *correct* behaviour for a
   language switch (the document language genuinely changes) and needs no mitigation — but
   do not use `<Link>` prefetch expectations in a test.

---

### Pattern 2: Filesystem content loader — one file, one URL, no wiring (SC1)

**What:** A `lib/content.ts` module that enumerates `content/`, reads each file's
front-matter, validates it, and answers three questions: *what slugs exist for locale L?*,
*what is the front-matter for slug S?*, and *does slug S have a translation?*

**When to use:** By `generateStaticParams`, the index page, and the post page. It is the
single place `fs` is touched.

```ts
// lib/content.ts
import { readdir } from "node:fs/promises";
import path from "node:path";

export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export type PostFrontmatter = {
  title: string;
  standfirst: string;
  date: string;          // ISO 8601, e.g. "2026-08-29"
  lang: Locale;
  translationKey: string;
  draft?: boolean;
  type?: "post" | "case-study";
};

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Throws during `next build` if a post's front-matter is malformed. That is the point. */
function assertFrontmatter(fm: unknown, file: string): asserts fm is PostFrontmatter {
  const f = fm as Partial<PostFrontmatter> | undefined;
  const problems: string[] = [];
  if (!f || typeof f !== "object") problems.push("missing front-matter block");
  else {
    for (const key of ["title", "standfirst", "translationKey"] as const) {
      if (typeof f[key] !== "string" || !f[key]) problems.push(`${key} must be a non-empty string`);
    }
    if (typeof f.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(f.date))
      problems.push("date must be an ISO date (YYYY-MM-DD)");
    if (!LOCALES.includes(f.lang as Locale)) problems.push(`lang must be one of ${LOCALES.join(", ")}`);
    if (f.draft !== undefined && typeof f.draft !== "boolean") problems.push("draft must be a boolean");
    if (f.type !== undefined && f.type !== "post" && f.type !== "case-study")
      problems.push("type must be 'post' or 'case-study'");
  }
  if (problems.length) throw new Error(`content/${file}: ${problems.join("; ")}`);
}

async function slugsOnDisk(): Promise<string[]> {
  const files = await readdir(CONTENT_DIR);
  return files.filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, ""));
}

/** Loads the compiled module — the SAME module the page renders. One source of truth. */
async function loadModule(slug: string) {
  try {
    return await import(`@/content/${slug}.mdx`);
  } catch {
    return await import(`@/content/${slug}.md`);
  }
}

export type PostEntry = { slug: string; frontmatter: PostFrontmatter };

export async function allPosts(): Promise<PostEntry[]> {
  const slugs = await slugsOnDisk();
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const { frontmatter } = await loadModule(slug);
      assertFrontmatter(frontmatter, slug);
      return { slug, frontmatter };
    }),
  );
  return entries.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

/** Drafts are visible in dev, invisible in a production build. D-11. */
export function isVisible(entry: PostEntry): boolean {
  return process.env.NODE_ENV === "development" || entry.frontmatter.draft !== true;
}

export async function publishedFor(lang: Locale): Promise<PostEntry[]> {
  return (await allPosts()).filter((e) => e.frontmatter.lang === lang && isVisible(e));
}

/** D-06/D-07: the translation is the entry sharing translationKey in the other locale — or none. */
export async function translationOf(entry: PostEntry): Promise<PostEntry | null> {
  const other = entry.frontmatter.lang === "en" ? "de" : "en";
  const candidates = await publishedFor(other);
  return candidates.find((e) => e.frontmatter.translationKey === entry.frontmatter.translationKey) ?? null;
}
```

**Verified:** the `fs.readdir` → per-slug load → filter → `generateStaticParams` shape
produced `● (SSG)` prerendered routes for both locales in this repo, with zero per-post
route files `[VERIFIED: built in repo]`.

---

### Pattern 3: Dual-extension dynamic import — what the "two-renderer dispatch" actually is

**What:** The post page loads its module through a template-literal dynamic import with an
explicit extension, wrapped in a try/catch for the second extension.

**When to use:** Both post routes, and `lib/content.ts` above.

```tsx
// app/(en)/writing/[slug]/page.tsx
import { notFound } from "next/navigation";
import { publishedFor } from "@/lib/content";

export const dynamicParams = true; // see Pitfall 6

export async function generateStaticParams() {
  return (await publishedFor("en")).map(({ slug }) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // SECURITY: allowlist the slug before it ever reaches import(). See Security Domain.
  const entry = (await publishedFor("en")).find((e) => e.slug === slug);
  if (!entry) notFound();

  const { default: Post } = await (async () => {
    try { return await import(`@/content/${slug}.mdx`); }
    catch { return await import(`@/content/${slug}.md`); }
  })();

  return (/* … header, SmearTitle, standfirst, PostMeta, <Prose><Post/></Prose> … */);
}
```

**Two hard-won facts, both verified by making them fail first:**

1. **The extension cannot be omitted.** `import(\`@/content/${slug}\`)` builds fine and
   then fails at prerender with `Error: Cannot find module '@/content/imported'`
   `[VERIFIED: built in repo]`. The bundled Next docs say the same: *"Ensure you specify
   the `.mdx` file extension in your import."*
2. **The try/catch over two specifiers works.** Turbopack creates a context module for
   each specifier pattern; a `.md` file and a `.mdx` file both resolved from the same page
   in one build `[VERIFIED: built in repo]`. This is the whole of the "two-renderer
   dispatch" — six lines, no second plugin config, no second renderer.

**Format detection is automatic.** With `extension: /\.(md|mdx)$/`, `@mdx-js/loader`
derives the format from the file suffix. A `.md` file containing `{like this}` and
`<Aside>` rendered as `<p>Curly braces {like this} and a tag <!-- --> should be literal in
.md.</p>` — braces literal, JSX tag dropped as raw HTML — while the `.mdx` file in the same
build rendered `<Badge>` and `<Aside>` as real components `[VERIFIED: built in repo]`.
That is exactly the behaviour a mixed archive needs.

---

### Pattern 4: One `next.config.ts`, one plugin chain, Turbopack-safe

**What:** All remark/rehype plugins declared as **strings** with **serializable** options.

**When to use:** Always, in this project. Turbopack is the default bundler for both
`next dev` and `next build` in Next 16, and *"remark and rehype plugins without
serializable options cannot be used yet with Turbopack, because JavaScript functions can't
be passed to Rust"* (bundled Next docs).

```ts
// next.config.ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,          // <- makes ONE chain serve .md and .mdx
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
    ],
    rehypePlugins: [
      "rehype-slug",
      ["@shikijs/rehype", {
        theme: "github-light-high-contrast", // NOT github-light — see Pitfall 1
        inline: false,                       // inline <code> stays unhighlighted (UI-SPEC)
        fallbackLanguage: "text",            // see Pitfall 3
      }],
    ],
  },
});

export default withMDX(nextConfig);
```

`[VERIFIED: built in repo]` — this exact config compiled and prerendered both a `.md` and
an `.mdx` post, with slugged headings, GFM tables and Shiki-highlighted `<pre>`.

**Do not set `experimental.mdxRs`.** Setting `mdxRs: false` explicitly triggered
`"Expected process result to be a module, but it could not be processed"` in Next 16 beta
(vercel/next.js#84748), and `mdxRs: true` silently disables remark/rehype plugins
altogether — which would kill Shiki, GFM and front-matter in one line. Leave the key
absent.

---

### Pattern 5: `SmearTitle` — the only client boundary

**What:** A four-line `"use client"` leaf that owns the ref, so the page above it stays a
Server Component.

**When to use:** `/writing` featured-entry title (Display), `/writing/[slug]` post title
(Heading), `not-found` heading (Heading) — the three Humane titles in the UI-SPEC's trail
table. Never on Newsreader text.

```tsx
// components/smear-title.tsx
"use client";

import { useSmearHeading } from "@/components/smear-heading/use-smear-heading";

type Tag = "h1" | "h2";

export function SmearTitle({
  as: Tag = "h1",
  className,
  children,
}: {
  as?: Tag;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useSmearHeading<HTMLHeadingElement>();
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
```

**Why this is safe and cheap:** `children` here is a front-matter string, trivially
serialisable across the RSC boundary. `useSmearHeading` already defers its
`getBoundingClientRect()` until `document.fonts.ready` and never writes `text-shadow`
from server markup, so no hydration mismatch is possible
`[VERIFIED: read components/smear-heading/use-smear-heading.ts`]. `SmearHeadingProvider`
must be present in **both** root layouts — the hook throws
`"useSmearHeadingRegistry must be used within a SmearHeadingProvider"` otherwise.

**Do not** re-tune `MAX_TRAIL`, `MAX_SHADOWS`, `SCROLL_STOP_DELAY`, `HUE_SPEED` or
`INITIAL_HUE`, add a second `requestAnimationFrame` driver, or re-implement the hook.
The provider already owns the only rAF loop in the tree and iterates a registry, so
N registered headings cost one loop.

---

### Pattern 6: Draft posts — one mechanism, three places

**What:** `draft: true` in front-matter drives visibility, and nothing else does.

```ts
// visible in dev, invisible in a production build — D-11
process.env.NODE_ENV === "development" || entry.frontmatter.draft !== true
```

Applied in exactly three places: (a) `generateStaticParams` — so a production build never
prerenders a draft URL; (b) the index listing; (c) Phase 6's `sitemap.ts`, which must reuse
`publishedFor()` rather than re-deriving the rule. The draft marker in `PostMeta` is the
inverse of the same predicate.

**The fixture post is not a special case** — it is `draft: true`, English, slug `fixture`,
and therefore reachable at `/writing/fixture` in `next dev` and absent from production.
This is what makes success criterion 5 testable without a test-only code path.

---

### Pattern 7: `hreflang`, canonical, and `x-default` from `generateMetadata`

**What:** Each post page emits `canonical` for itself, `alternate` for every locale in
which the piece exists, and `x-default` → the English URL.

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const entry = (await publishedFor("en")).find((e) => e.slug === slug);
  if (!entry) return {};
  const twin = await translationOf(entry);

  const languages: Record<string, string> = { en: `/writing/${entry.slug}` };
  if (twin) languages.de = `/texte/${twin.slug}`;
  languages["x-default"] = `/writing/${entry.slug}`;

  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.standfirst, // UI-SPEC: standfirst doubles as meta description
    alternates: { canonical: `/writing/${entry.slug}`, languages },
  };
}
```

**Verified:** `'x-default'` is a first-class key in Next's own metadata typing —
`type UnmatchedLang = 'x-default'` in
`node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts:2`
`[VERIFIED: node_modules]`. Relative paths compose against `metadataBase`, which **must**
be set in each root layout or *"using a relative path in a URL-based metadata field
without configuring a `metadataBase` will cause a build error"* (bundled Next docs).

**Phase 6 hand-off:** `metadataBase` is the single line that changes at the domain cutover.
Setting it to the Railway URL now and swapping it later is correct and cheap; leaving it
unset is a build error.

---

### Pattern 8: Beating `@tailwindcss/typography` without a `tailwind.config.js`

**What:** Write `.prose-site` as **plain, unlayered CSS** in `app/globals.css`, after the
`@import "tailwindcss"` / `@plugin` lines.

**Why it works — and why it is the cheap path:** the plugin's element rules are generated
as `.prose :where(p):not(:where([class~="not-prose"], …))`. `:where()` contributes **zero**
specificity, so those rules carry only `.prose`'s (0,1,0). More decisively, they are
emitted through `addComponents`, which lands them inside a cascade layer, and
**unlayered CSS always beats layered CSS regardless of specificity**. Phase 1 already
relies on this: `.text-display` and friends are unlayered rules that override Tailwind's
preflight. `[CITED: node_modules/@tailwindcss/typography/src/index.js:20-23, :118]`

The alternative the plugin README documents for v4 — `@config "./tailwind.config.js"` plus
a `theme.extend.typography.DEFAULT.css` object — reintroduces a v3-style JS config file
that this project deliberately does not have. **Do not take that path.**

```css
/* app/globals.css — after @import "tailwindcss"; @plugin "@tailwindcss/typography"; */

@theme {
  /* ... existing Phase 1 tokens, unchanged ... */
  --font-mono: var(--font-ibm-plex-mono), ui-monospace, monospace;
  --color-surface-code: rgba(0, 0, 0, 0.04);
  --color-rule: rgba(0, 0, 0, 0.12);
}

/* Unlayered — wins over every .prose rule without !important. */
.prose-site {
  color: var(--color-ink);
  max-width: 65ch;
}
.prose-site p { font-family: var(--font-body); font-size: 18px; line-height: 1.6; margin-top: 16px; }
.prose-site h2 {
  font-family: var(--font-body); font-size: 14px; line-height: 1.3;
  text-transform: uppercase; letter-spacing: 0.04em;
  margin-top: 48px; margin-bottom: 16px;
  padding-bottom: 8px; border-bottom: 1px solid var(--color-ink);
}
.prose-site h3 { /* identical to h2, no rule, margin-top: 32px; margin-bottom: 8px; */ }
.prose-site strong { font-weight: 530; }
.prose-site em { font-style: italic; font-weight: 400; }
.prose-site blockquote { font-style: italic; border: 0;
  border-top: 1px solid var(--color-rule); border-bottom: 1px solid var(--color-rule);
  padding: 24px 0; margin: 32px 0; }
.prose-site blockquote em { font-style: normal; }   /* UI-SPEC required reset */
.prose-site code { font-family: var(--font-mono); font-size: 18px;
  background: var(--color-surface-code); padding: 2px 4px; border-radius: 0; }
.prose-site pre { font-family: var(--font-mono); font-size: 18px; line-height: 1.5;
  background: var(--color-surface-code); border-radius: 0;
  padding: 16px 24px; margin: 32px 0; overflow-x: auto; white-space: pre; }
.prose-site pre code { background: none; padding: 0; font-size: inherit; }
/* … the remaining ~12 selectors from the UI-SPEC Prose Contract … */
```

Apply as `<div className="prose prose-neutral max-w-none prose-site">`. The plugin remains
the element-selection engine (it is what makes `not-prose` and the `prose-*` variants
available); `.prose-site` supplies every visible value.

**The UI-SPEC's escape hatch is unlikely to be needed.** It permits dropping the plugin if
the override layer *"exceeds roughly eighty lines"*. The Prose Contract has ~20 element
rules; unlayered CSS means no `!important` and no `:where()` gymnastics, so ~70 lines is a
realistic estimate. Keep the plugin.

---

### Pattern 9: Shiki, stripped and named, via the `pre` component override

**What:** Override `pre` in `mdx-components.tsx` to drop Shiki's inline background style
and add the accessible name the UI-SPEC requires.

```tsx
// mdx-components.tsx — project root, required by @next/mdx
import type { MDXComponents } from "mdx/types";
import { Figure } from "@/components/mdx/figure";
import { Aside } from "@/components/mdx/aside";

const components: MDXComponents = {
  Figure,
  Aside,
  // Shiki emits style="background-color:#ffffff;color:#0e1116" on <pre>.
  // Turbopack forbids function-valued `transformers` in next.config.ts, so strip it here.
  // Shiki already sets tabindex="0"; role + aria-label complete WCAG 2.1.1 / 4.1.2.
  pre: ({ style: _shikiBackground, ...props }: React.ComponentPropsWithoutRef<"pre">) => (
    <pre {...props} role="region" aria-label="Code sample" />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

**Verified in prerendered HTML:**
`<pre class="shiki github-light-high-contrast" style="background-color:#ffffff;color:#0e1116" tabindex="0" role="region" aria-label="Code sample">`
— the `role`/`aria-label` override landed on both a `.md` and an `.mdx` post
`[VERIFIED: built in repo]`. The `style` destructure was not exercised in the spike (the
spike deliberately kept it, to prove the style *is* emitted); it is standard React prop
handling. Confidence: HIGH on the mechanism, MEDIUM that no other consumer needs `style`.

**Fallback if the destructure misbehaves:** one unlayered CSS rule, `!important` required
because it is fighting an inline attribute:

```css
.prose-site pre.shiki { background-color: transparent !important; color: var(--color-ink) !important; }
```

**Shiki already gives you `tabindex="0"` for free** `[VERIFIED: built in repo]` — the
UI-SPEC's *"give it `tabindex=\"0\"` and an accessible name, or it fails WCAG 2.1.1"*
is half-satisfied by the library. Only the name needs adding.

---

### Anti-Patterns to Avoid

- **`"use client"` on `app/(en)/writing/[slug]/page.tsx`.** Phase 1 did this on `/` and
  `/type` and STATE.md records it as cost-free *there*. Here it would push the compiled
  MDX module and every Shiki token span into the client bundle and break `fs`. Use
  `SmearTitle`.
- **`app/[lang]/…` with a locale prefix.** The official i18n guide's shape. Directly
  contradicts D-06, which cites the live project's own prefix-free localised segments.
- **`proxy.ts` / middleware with `Accept-Language` redirects.** Rejected by the UI-SPEC on
  its merits: negotiation on a CDN-cached static site produces `Vary` fragmentation and a
  canonical-URL problem that FIND-02 inherits in Phase 6.
- **`experimental.mdxRs`.** `true` silently disables remark/rehype; `false` triggered a
  Turbopack module error in Next 16. Leave it unset.
- **`rehype-raw`.** Would let raw HTML through from `.md`. Not needed (nothing in scope
  authors raw HTML) and it converts a content pipeline into an XSS surface. Note that
  `format: 'md'` currently *drops* raw HTML — verified — which is the desired behaviour.
- **A second index render mode for `n ≥ 2`.** The UI-SPEC forbids it explicitly: repeat the
  `<article>` markup, separated by `<hr>`. Do not cost a component for it.
- **A fifth type size, a third weight, a fourth face, or a rounded corner.** All named in
  the UI-SPEC's Inheritance Summary as hard caps.
- **Client-side highlighting (Prism-in-the-browser, `react-shiki`, `highlight.js`).**
  Explicitly ruled out by CONTEXT's discretion note on performance/CLS posture.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown → HTML | A regex/`marked` pipeline | `@next/mdx` + `@mdx-js/loader` | CommonMark + GFM has hundreds of edge cases (nested lists, reference links, HTML blocks, tight/loose lists, table alignment). The compiler is already required for `.mdx`. |
| GFM tables | Custom table parsing | `remark-gfm` | Alignment, escaped pipes, inline markup in cells. UI-SPEC requires styled tables with a numeric column. |
| Heading anchors | `title.toLowerCase().replace(/ /g,'-')` | `rehype-slug` | Unicode, punctuation, duplicate-heading disambiguation (`-1`, `-2`). The naive version silently collides. |
| Syntax highlighting | Regex tokenisation, or a client highlighter | `@shikijs/rehype` | Real TextMate grammars, build-time, zero client JS. Anything hand-rolled is wrong on template literals, JSX, regex literals and nested strings within a week. |
| Front-matter | Hand-parsing the `---` block | `remark-frontmatter` + `remark-mdx-frontmatter` | YAML has multi-line strings, quoting rules, type coercion. **Verified:** without a front-matter plugin the block renders as a visible `<hr>` + `<h2>title: Test</h2>`. |
| Localised dates | A month-name lookup table, or `date-fns` | `Intl.DateTimeFormat` | `en-GB` → `29 August 2026`, `de-DE` → `29. August 2026` — the UI-SPEC's exact strings, from the platform. **Pass `timeZone: 'UTC'`** or a date-only string drifts a day. |
| Locale routing | Middleware rewrites, `next-intl` | Two literal route segments | Two locales, two path tokens, no shared slugs. A library here adds a rewrite layer that D-06 forbids. |
| `hreflang` tags | Hand-written `<link>` in a `<head>` block | `metadata.alternates.languages` | Next's Metadata API dedupes and streams head elements; the bundled docs warn against manual `<head>` in root layouts. `x-default` is a typed key. |
| Prose typography | A parallel type scale | Phase 1's `@theme` tokens + unlayered `.prose-site` | CONTEXT's *"Type system as the source of truth"*. A competing scale is exactly what success criterion 3 forbids. |
| The scroll trail | A second rAF driver, or a rewritten hook | The shipped `SmearHeadingProvider` + `useSmearHeading` | One shared loop already iterates a registry, handles reduced-motion live-toggling, waits for `document.fonts.ready`, and settles below 0.15px. Re-implementing it re-introduces every pitfall Phase 1 already solved. |
| Reduced-motion gating | `matchMedia` at module scope | `usePrefersReducedMotion` | Already handles SSR safety and live OS toggles. BUILD-05. |
| Unit test runner | Adding vitest/jest | `node --test` | Node 22.20 runs `.test.ts` directly via native type stripping. **Verified in this session.** Zero config, zero dependency, satisfies "MVP first". |

**Key insight:** every problem in this phase has an *already-installed or built-in*
solution. The phase's net new runtime dependency count is **zero** — the ten packages are
build-time loaders and AST transforms. That is what makes the "no polishing" constraint and
the performance posture compatible with a real content pipeline.

---

## Runtime State Inventory

This phase is not a rename, but it **does** relocate Phase 1's shipped routes into a route
group and change the root layout topology. That is structural enough to warrant the audit.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | **None.** No database, no CMS, no KV. D-11 makes content files-in-repo. `.env` exists but holds no content-pipeline state. | None — verified by reading `.gitignore`, `package.json` and the full file tree |
| **Live service config** | **Railway service `web-production-9cedb.up.railway.app`.** Deploy config is zero-config Node builder (STATE.md), so nothing to patch — but a **stale Turbopack/`.next` build cache on Railway can reproduce the `TS2307: Cannot find module '../../../app/page.js'` failure** observed locally after the route move. Next 16 enables `experimental.turbopackFileSystemCacheForBuild` by default. | Verify the first post-restructure deploy is a clean build; if it fails on stale generated types, clear the Railway build cache |
| **OS-registered state** | **None.** No cron, no scheduler, no daemons. | None — verified: no `railway.toml`, `Procfile`, or scheduler config in the repo |
| **Secrets / env vars** | `.env` exists and is gitignored. This phase introduces **no new env var**. `metadataBase` is a literal in the layout, deliberately, so Phase 6's cutover is a visible one-line diff rather than a silent env change. | None |
| **Build artifacts** | **`.next/` must be deleted after the route move.** `.next/dev/types/validator.ts` retains generated route types pointing at `app/page.js` and `app/layout.js`, which no longer exist. This produced a hard `Failed to type check` on the first build. `[VERIFIED: reproduced and fixed in repo]` Also: `test-results/.last-run.json` is stale Playwright state, harmless. | Add `rm -rf .next` to the restructure task; verify the Railway build too |

**Route-move specifics the planner must sequence:** `app/page.tsx` → `app/(en)/page.tsx`,
`app/type/page.tsx` → `app/(en)/type/page.tsx`, `app/layout.tsx` → `app/(en)/layout.tsx`
(with relative imports `./fonts/…` → `../fonts/…`, `./globals.css` → `../globals.css`, and
`LayoutProps<"/">` → an explicit props type). Use `git mv` for the two pages so history
survives. **URLs do not change** — which is why all nine Playwright specs pass unchanged.

---

## Common Pitfalls

### Pitfall 1: `github-light` fails WCAG AA on the code surface — the UI-SPEC's number is wrong

**What goes wrong:** The UI-SPEC locks theme `github-light` and states *"`github-light`'s
comment grey `#6A737D` measures ≈4.6:1 and passes"* against `--color-surface-code`. It does
not. `rgba(0,0,0,0.04)` over `#ffffff` resolves to `#F5F5F5`, and the audit against that
surface is:

| Token colour | Scope | vs `#F5F5F5` | vs `#ffffff` | 4.5:1? |
|---|---|---|---|---|
| `#6a737d` | comment | **4.42** | 4.82 | **FAIL** |
| `#d73a49` | keyword, storage | **4.20** | 4.57 | **FAIL** |
| `#22863a` | entity.name.tag | **4.24** | 4.63 | **FAIL** |
| `#e36209` | variable | **3.20** | 3.49 | **FAIL (both)** |
| `#005cc5` | constant | 5.77 | 6.29 | pass |
| `#6f42c1` | entity.name | 5.97 | 6.51 | pass |
| `#032f62` | string | 12.14 | 13.23 | pass |
| `#24292e` | default fg | 13.45 | 14.67 | pass |

The ≈4.6:1 figure appears to have been computed against pure white, where the comment token
does pass — but the code surface is not white, it is tinted, and `variable` fails even
against white.

**Why it happens:** GitHub's light palette is tuned for `#ffffff`. Any tint, however small,
drops every borderline token below AA.

**How to avoid:** Set `theme: "github-light-high-contrast"`. An audit of every bundled
light theme found it is the **only** GitHub-family theme where every real code scope clears
4.5:1 against `#F5F5F5` — worst real scope is `comment` `#66707b` at **4.62:1**
`[VERIFIED: computed from node_modules/@shikijs/themes/dist/*.mjs in this session]`.
For comparison: `github-light-default` fails on one scope (comment, 4.17), `light-plus`
fails on 11, `vitesse-light` on 23, `min-light` on 6.

**Two alternatives, both legitimate, both worse:**
- Shiki's `colorReplacements` option accepts a plain `{ '#6a737d': '#5c646d', … }` map — it
  is serializable, so it survives Turbopack — letting you keep `github-light` and patch the
  four failing hexes. `[CITED: shiki.style/guide/theme-colors]` More moving parts for the
  same result.
- Strip the tint and set the code block on pure paper with a rule instead. Still leaves
  `variable` at 3.49. Rejected.

**Warning signs:** any accessibility audit run in Phase 6, or an axe/Lighthouse contrast
check on the fixture post.

**Planner note:** this is a *technical* correction to a UI-SPEC decision, which the spec's
own `planner may override` framing and its explicit *"if the theme's published value has
moved, substitute full ink at 60% rather than accepting a failing grey"* instruction both
authorise. The visual contract — a light GitHub-family theme, single theme, tokens only
inside `<pre>` — is unchanged.

---

### Pitfall 2: Turbopack silently forbids function-valued plugin options

**What goes wrong:** You write `transformers: [{ pre(node) { … } }]` in `next.config.ts`
because that is how every Shiki tutorial does it. Turbopack cannot serialise a function
into Rust, so the option is dropped or the build errors — and you discover it as an
un-stripped white background behind every code block.

**Why it happens:** Next 16 made Turbopack the default for `next dev` **and**
`next build`. The bundled docs state the constraint plainly.

**How to avoid:** Keep every plugin option JSON-serializable, and do node-level surgery in
`mdx-components.tsx` instead (Pattern 9). `theme`, `inline`, `fallbackLanguage`,
`colorReplacements` and `remark-mdx-frontmatter`'s `{ name }` are all serializable and all
verified working.

**Warning signs:** `style="background-color:#ffffff"` in the prerendered `<pre>`; any
proposed task that puts a function inside `createMDX({ options: … })`.

**Escape hatch, deliberately not recommended:** `next build --webpack` restores function
support, at the cost of opting out of the default bundler for the whole project.

---

### Pitfall 3: An unknown code-block language degrades silently, not loudly

**What goes wrong:** ` ```wat-lang ` produces a bare `<pre><code class="language-wat-lang">`
— no Shiki class, no `tabindex`, no highlighting `[VERIFIED: built in repo]`. It does not
throw, so a typo'd language ships as a plain unstyled block that still gets the
`.prose-site pre` tint and therefore looks *almost* right.

**How to avoid:** Set `fallbackLanguage: "text"`, which routes unknown languages through
Shiki so at least the wrapper markup is consistent `[VERIFIED: built in repo]`. Then add a
Playwright assertion on the fixture that **every** `pre` inside `.prose-site` carries the
`shiki` class.

**Warning signs:** a code block with the surface tint but black monospace and no `tabindex`.

---

### Pitfall 4: Front-matter renders as visible prose if the plugin is missing

**What goes wrong:** Without `remark-frontmatter`, `---\ntitle: Test\n---` compiles to
`<hr/><h2>title: Test</h2>` `[VERIFIED: built in repo]`. On a page whose `h2` carries a
1px ink rule, this looks like an intentional section head.

**How to avoid:** `remark-frontmatter` **and** `remark-mdx-frontmatter` — the first parses,
the second exports. Then make `assertFrontmatter` throw for a missing block, so an author
who forgets the `---` fences fails `next build` instead of shipping the artefact.

**Warning signs:** an `<hr>` as the first element of a post.

---

### Pitfall 5: `<Component>` in a `.md` file vanishes without a word

**What goes wrong:** In `format: 'md'`, JSX is not parsed — it is raw HTML, and `@mdx-js/mdx`
drops raw HTML rather than passing it through. `<Aside>text</Aside>` in a `.md` file renders
as an empty comment placeholder with the inner text escaping into the surrounding paragraph
`[VERIFIED: built in repo]`. Braces stay literal, which is correct and useful.

**How to avoid:** Treat this as **desired** behaviour (it is the safety property that makes
`.md` a safe format for imported archive content) and document the rule: *components require
`.mdx`*. The fixture post is `.mdx`, so it is unaffected. Add a `.md` fixture only if the
planner wants the format asserted — recommended, since v2's archive will use it.

---

### Pitfall 6: `dynamicParams = false` bypasses your localised `not-found.tsx`

**What goes wrong:** With `export const dynamicParams = false`, an ungenerated slug 404s at
the *routing* layer — the segment never renders, so the writing segment's `not-found.tsx`
(with its `Nicht gefunden` / `← Texte` copy) is not what the visitor sees. Combined with two
root layouts there is **no global `not-found` either**: the bundled docs list
*"Your app has multiple root layouts … so there's no single layout to compose a global 404
from"* as the exact case `global-not-found.js` (experimental) exists for.

**How to avoid:** Use `dynamicParams = true` and call `notFound()` explicitly after the slug
allowlist check (Pattern 3). The segment renders, `notFound()` throws, and the nearest
`not-found.tsx` boundary — yours, in the right language — handles it.

**Confidence:** MEDIUM on the precise `dynamicParams = false` boundary behaviour (inferred
from the docs' *"accessing a route not defined in `generateStaticParams` will 404"* plus the
`not-found` composition rules; **not** empirically confirmed in this session). The
recommended `dynamicParams = true` + explicit `notFound()` shape sidesteps the ambiguity
entirely and should be the plan. **Add a verification step** that hits
`/writing/does-not-exist` and `/texte/gibt-es-nicht` and asserts the localised copy.

---

### Pitfall 7: `params` is a Promise, and the dynamic import needs its extension

**What goes wrong:** Two independent Next 16 gotchas that surface as one confusing error.
`params` must be awaited (`const { slug } = await params`), and
`import(\`@/content/${slug}\`)` — extension omitted — compiles fine and then fails during
static generation with `Cannot find module` `[VERIFIED: built in repo]`.

**How to avoid:** Always `await params`; always include `.mdx` / `.md` in the specifier.
The bundled docs call the second one out: *"Ensure you specify the `.mdx` file extension in
your import."*

**Warning signs:** `MODULE_NOT_FOUND` with a `digest` during `Generating static pages`.

---

### Pitfall 8: `style: ['normal','italic']` doubles the Newsreader payload

**What goes wrong:** The UI-SPEC makes the Newsreader italic structural (`<em>`, and the
blockquote treatment). Adding `style: ['normal','italic']` loads a **second variable font
file**. Combined with the new IBM Plex Mono 400, this phase adds two font files to a
BUILD-06 posture that Phase 1 fought for.

**How to avoid:** Keep `display: 'swap'` on both (unchanged from Phase 1), keep
`subsets: ['latin']`, keep IBM Plex Mono to a single weight with no italic, and **re-run
`tests/font-cls.spec.ts` against `/writing/fixture`** rather than assuming the home page's
result transfers. The existing spec measures CLS across the font-load window and is the
right instrument.

**Warning signs:** CLS regression on the post route; `next build` output showing more font
files than expected.

---

### Pitfall 9: Shiki's inline styles will collide with BUILD-04's CSP in Phase 6

**What goes wrong:** Shiki emits `style="color:#…"` on **every** token span. A
`Content-Security-Policy` with `style-src 'self'` — the natural reading of BUILD-04's
*"real security response headers"* — blocks inline style *attributes* under CSP Level 2+,
so every code block renders as undifferentiated ink.

**Why it happens:** This is a known, open Shiki issue (shikijs/shiki#671). Generating a
hash per style attribute is impractical; `'unsafe-hashes'` is the CSP3 mechanism for
attributes and is itself a weakening.

**How to avoid — in Phase 2, not Phase 6:** record the constraint now, so BUILD-04 is
planned with it in view. Three options, in order of preference:
1. `style-src 'self' 'unsafe-inline'` — pragmatic, and the site has no user input, no forms
   and no third-party scripts, so the XSS surface it guards is essentially nil.
2. A build-time post-process converting token colours to classes plus one stylesheet.
   Real work; defer.
3. Shiki's `createCssVariablesTheme`, which emits `var(--shiki-token-*)` — still via inline
   style attributes, so it does **not** solve CSP, but it *would* move token colours into
   `globals.css` and make the contrast question a first-class design decision rather than a
   theme-file lottery. `[CITED: shiki.style/guide/theme-colors]`

**Warning signs:** monochrome code blocks appearing the moment Phase 6 ships headers.

---

### Pitfall 10: `pageExtensions` turns every `.md` under `app/` into a route

**What goes wrong:** `pageExtensions: ["ts","tsx","md","mdx"]` is required for `@next/mdx`.
It also means any `.md` file placed under `app/` becomes a page.

**How to avoid:** Keep all content in `content/` (outside `app/`). No `.md` currently lives
under `app/` `[VERIFIED: filesystem]`, and `.planning/`, `BRIEF.md`, `AGENTS.md`,
`notes.md` and `CLAUDE.md` are all outside `app/`, so nothing is at risk today. Add it to
the conventions note so a future phase does not drop a README into a route folder.

---

## Code Examples

### Loading the mono face

```ts
// app/fonts/ibm-plex-mono.ts
import { IBM_Plex_Mono } from "next/font/google";

export const ibmPlexMono = IBM_Plex_Mono({
  weight: "400",          // REQUIRED — static-weight-only family, no 'variable' option
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});
```
`[VERIFIED: node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts:6665-6674]`

### Extending Newsreader with the italic

```ts
// app/fonts/newsreader.ts — EDIT, one line added
import { Newsreader } from "next/font/google";

export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],   // <- NEW; <em> and blockquote depend on it structurally
  display: "swap",
  variable: "--font-newsreader",
});
```
`[VERIFIED: …/index.d.ts:10473 — style accepts an array]`

### Localised dates, no dependency

```ts
// lib/locales.ts
const DATE_LOCALE = { en: "en-GB", de: "de-DE" } as const;

export function formatPostDate(iso: string, lang: "en" | "de"): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    day: "numeric", month: "long", year: "numeric",
    timeZone: "UTC",              // without this, a date-only string can drift a day
  }).format(new Date(`${iso}T00:00:00Z`));
}
// "2026-08-29" → en: "29 August 2026"   de: "29. August 2026"
```
`[VERIFIED: run in this session — exact UI-SPEC strings]`
**Use `en-GB`, not `en-US`** — `en-US` yields `August 29, 2026`.

### The language switcher (D-07: absent, not disabled)

```tsx
// components/language-switch.tsx — Server Component
import Link from "next/link";
import type { Locale } from "@/lib/content";

const LABEL = { en: "Auf Deutsch lesen", de: "Read in English" } as const;

export function LanguageSwitch({ from, href }: { from: Locale; href: string | null }) {
  if (!href) return null;                     // D-07 — no dead affordance, no aria-disabled
  return (
    <Link href={href} hrefLang={from === "en" ? "de" : "en"} className="text-label">
      {LABEL[from]}
    </Link>
  );
}
```

### Verified Shiki output shape (for writing assertions against)

```html
<!-- from .next/server/app/texte/hallo-welt.html, a .md post -->
<pre class="shiki github-light-high-contrast" tabindex="0" role="region" aria-label="Code sample"><code><span class="line"><span style="color:#023B95">echo</span><span style="color:#032563"> &quot;hallo&quot;</span><span style="color:#66707B"> # kommentar</span></span></code></pre>
```
`[VERIFIED: built in repo]` — note `#66707B` is `github-light-high-contrast`'s comment
token at 4.62:1 on the tinted surface.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Webpack default for `next build` | **Turbopack default** for `next dev` **and** `next build` | Next.js 16.0 | remark/rehype plugins must be **string-named with serializable options**. Kills the common `transformers: [fn]` Shiki recipe. `--webpack` opts out. |
| `params` a plain object | `params` is a **Promise** | Next.js 15 | `const { slug } = await params` everywhere. |
| `middleware.ts` | `proxy.ts` | Next.js 16 | Not used here (no negotiation), but rules out copy-pasted i18n middleware recipes from older tutorials. |
| `experimental.turbopack` | top-level `turbopack` key | Next.js 16 | Not needed here — no custom Turbopack config. |
| `next-mdx-remote` | **archived April 2026** | 2026 | Any tutorial recommending it is stale. `next-mdx-remote-client` is the maintained fork; `@next/mdx` is the official path. |
| `tailwind.config.js` | CSS-first `@theme` / `@plugin` | Tailwind v4 | Typography plugin customisation via `theme.extend.typography` now needs a `@config` file. **Avoid** — unlayered CSS overrides are simpler and are already the Phase 1 pattern. |
| Shiki v1/v3 | **Shiki v4** (`4.4.3`, Aug 2026) | 2026 | `@shikijs/rehype` API is stable across the change for the options used here (`theme`, `inline`, `fallbackLanguage`, `transformers`). `@shikijs/langs` is now 11 MB on disk — a reason to keep highlighting at build time. |
| vitest/jest for unit tests | `node --test` with native TS stripping | Node 22.18+ | Zero-dependency `.test.ts` execution. `[VERIFIED: run in this session on Node 22.20.0]` |
| `First Load JS` in build output | removed | Next.js 16 | Bundle-size assertions must measure `.next/static` on disk, not parse build output. |

**Deprecated / outdated:**
- `next-mdx-remote` — archived. Do not use.
- `experimental.mdxRs` — Rust MDX compiler; explicitly *"not recommended for production"*
  in the bundled docs, disables remark/rehype, and `mdxRs: false` triggered a Turbopack
  module error in Next 16.
- `output: 'export'` — already ruled out by REQUIREMENTS Out of Scope (forecloses
  `headers()` for BUILD-04). Nothing in this phase reopens it.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `pre` override's `{ style: _shikiBackground, ...props }` destructure cleanly removes Shiki's inline background in the final markup | Pattern 9 | LOW. The `role`/`aria-label` half of the same override **is** verified; the destructure is ordinary React prop handling. A one-line CSS `!important` fallback is documented. Verify by grepping the built HTML for `background-color` inside `<pre>`. |
| A2 | `dynamicParams = false` renders the *root* 404 rather than the writing segment's localised `not-found.tsx` | Pitfall 6 | MEDIUM. Inferred from the docs, not built. Mitigated by recommending `dynamicParams = true` + explicit `notFound()`, which is unambiguous either way. Needs a Playwright assertion regardless. |
| A3 | Shiki's `colorReplacements` is serializable and therefore Turbopack-compatible | Pitfall 1 alternative | LOW. Cited from shiki.style; not exercised (the Shiki packages were uninstalled during repo restore). Only matters if the planner rejects the theme swap. |
| A4 | `image-size@2.0.2` is the right tool for probing intrinsic dimensions of bare Markdown images | Supporting stack | LOW. Registry-confirmed only, never exercised. The recommended path (`<Figure width height>` with author-supplied dimensions) avoids it entirely. |
| A5 | Two font files for Newsreader (normal + italic) will not regress BUILD-06's CLS budget | Pitfall 8 | MEDIUM. `display: 'swap'` plus Next's automatic size-adjust fallback should hold, but this is the phase's most plausible silent regression. `tests/font-cls.spec.ts` must be re-pointed at the post route. |
| A6 | Railway's zero-config Node builder will not serve a stale `.next` after the route restructure | Runtime State Inventory | MEDIUM. Reproduced locally as a hard build failure; Next 16 enables Turbopack filesystem build caching by default. Needs a deploy-time verification step, not an assumption. |
| A7 | `next build` compiling every post module for the index is negligible at launch volume | Pattern 2 | LOW at n=1–5. Revisit in v2 when 13 archive posts land; `gray-matter` is the documented fallback. |

Everything else in this document is tagged `[VERIFIED: built in repo]`,
`[VERIFIED: node_modules]`, `[VERIFIED: npm registry]`, or `[CITED: …]`.

---

## Open Questions

1. **Does the German path token stay `/texte`?**
   - What we know: the UI-SPEC marks it `planner may override` on editorial grounds and
     names `/artikel` and `/schreiben` as alternatives. The load-bearing part of the
     contract is *no prefix, fully localised segments*.
   - What's unclear: purely editorial. `/texte` is idiomatic, short, and symmetric with
     `Texte` as the back-link label.
   - Recommendation: keep `/texte`. Changing it later is a directory rename plus one
     `locales.ts` constant — genuinely cheap, unlike the routing shape itself.

2. **Does `_pm/kanban.md` still exist as a project convention?**
   - What we know: `CLAUDE.md` requires updating it; the directory does not exist.
   - Recommendation: surface it to the user in the plan rather than silently creating or
     ignoring the file.

3. **How should bare Markdown `![alt](/img.png)` reserve its space?**
   - What we know: the UI-SPEC is emphatic that every image must reserve space before load
     ("not optional… `BUILD-06`'s no-layout-shift posture applied to content") but leaves
     the mechanism to the planner.
   - What's unclear: whether bare Markdown images are needed at all in v1. The fixture
     needs two `<Figure>`s; Phase 4 will author `.mdx`.
   - Recommendation: **forbid bare `![]()`** for v1 — map `img` in `mdx-components.tsx` to
     a component that throws a build-time error directing authors to `<Figure>`, which
     takes `width`/`height` as required props. Revisit in v2 when the archive (which is
     full of bare Markdown images) lands; that is when a build-time `image-size` probe
     earns its dependency.

4. **Will Phase 6's CSP be written with `'unsafe-inline'` for `style-src`?**
   - What we know: Shiki's inline token styles make a strict `style-src` incompatible
     (shikijs/shiki#671).
   - Recommendation: record the constraint in this phase's output so BUILD-04 is planned
     against it. Do not attempt to solve it here.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | everything | ✓ | 22.20.0 (≥ 20.9 required by Next 16) | — |
| npm | package install | ✓ | 10.9.3 | — |
| Next.js | the app | ✓ | 16.3.3 (Turbopack) | — |
| React / React DOM | the app | ✓ | 19.2.8 (nmrc peer needs ≥ 19.1) | — |
| Tailwind CSS | styling | ✓ | v4 via `@tailwindcss/postcss` | — |
| `@tailwindcss/typography` | prose | ✓ | 0.5.20 — **already installed by Phase 1 for this phase** (D-04) | hand-roll ~20 selectors |
| Playwright | route + viewport tests | ✓ | 1.62.1, chromium project configured | — |
| `node --test` + TS stripping | content-loader unit tests | ✓ | built into Node 22.20 — **verified by running a `.test.ts`** | add vitest (avoid) |
| `slopcheck` | package legitimacy gate | ✓ | on PATH at `/opt/homebrew/bin/slopcheck` | mark all `[ASSUMED]` |
| Internet / npm registry | installing 10 packages | ✓ | install of all candidates succeeded, 0 vulnerabilities | — |
| Railway | deploy target | ✓ (per STATE.md, `web-production-9cedb.up.railway.app`) | zero-config Node builder | — |
| `sharp` | `next/image` optimisation | not installed | — | Not needed. Bundled docs: image optimisation *"works self-hosted with zero configuration when deploying using `next start`"*. Recommended path is explicit-dimension images, not runtime optimisation. |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none blocking.

---

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework (browser/route) | Playwright `1.62.1`, `chromium` project only |
| Config file | `playwright.config.ts` — `testDir: ./tests`, `webServer: npm run dev` on :3000, `reuseExistingServer` off-CI |
| Framework (unit) | `node:test` + `node:assert`, **no config file needed** — Node 22.20 strips TS natively `[VERIFIED: ran a .test.ts]` |
| Quick run command | `npx playwright test tests/<file>.spec.ts` (single spec, ~1s) / `node --test tests/unit/<file>.test.ts` |
| Full suite command | `npx playwright test && node --test 'tests/unit/*.test.ts'` (current Playwright suite: `9 passed (5.4s)`) |

**Existing suite — all 9 pass against the proposed route restructure** `[VERIFIED: run in
this session]`: `deploy-smoke`, `font-cls`, `reduced-motion`, `smear-heading` ×2,
`type-specimen`, `viewport` ×3.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SC1 | A new `content/*.mdx` file is served at `/writing/{slug}` with no route file added | integration | `npx playwright test tests/writing-routing.spec.ts` | ❌ Wave 0 |
| SC1 | Title / date / standfirst come from front-matter; slug comes from filename | unit | `node --test tests/unit/content.test.ts` | ❌ Wave 0 |
| SC1 | Malformed front-matter fails the build rather than rendering | unit | `node --test tests/unit/content.test.ts` (assert `assertFrontmatter` throws) | ❌ Wave 0 |
| WRIT-01 / SC2 | `/writing` renders the index; the featured entry title is Display-role and is the only link | integration | `npx playwright test tests/writing-index.spec.ts` | ❌ Wave 0 |
| WRIT-01 / D-10 | No card, border, fill or "Read more" in the index markup | integration | same spec (assert absence) | ❌ Wave 0 |
| SC3 | Prose `<p>` computes to Newsreader 18px / 1.6; `h2`/`h3` to 14px uppercase 0.04em — i.e. Phase 1 tokens, not plugin defaults | integration | `npx playwright test tests/prose-typography.spec.ts` | ❌ Wave 0 |
| SC4 | Every `pre` in `.prose-site` carries the `shiki` class, has no inline `background-color`, and has `tabindex="0"` + an accessible name | integration | `npx playwright test tests/prose-code.spec.ts` | ❌ Wave 0 |
| SC4 | Inline `<code>` is **not** token-coloured | integration | same spec | ❌ Wave 0 |
| SC5 | Fixture post renders every Prose Contract element at 375px and 1440px; no horizontal page overflow (code/table may scroll internally) | integration | `npx playwright test tests/fixture-viewport.spec.ts` | ❌ Wave 0 |
| SC5 / D-11 | Fixture is absent from `/writing` in a production build, present in dev | integration | `npx playwright test tests/draft-visibility.spec.ts` | ❌ Wave 0 |
| I18N-01 | `/writing/*` serves `<html lang="en">`; `/texte/*` serves `<html lang="de">` | integration | `npx playwright test tests/i18n-routing.spec.ts` | ❌ Wave 0 |
| I18N-01 | Switcher renders with the target-language label when a translation exists | integration | same spec | ❌ Wave 0 |
| I18N-01 / D-07 | Switcher is **absent from the DOM** (not disabled, not `aria-disabled`) when no translation exists | integration | same spec | ❌ Wave 0 |
| I18N-01 | `link[rel=alternate][hreflang]` pairs plus `x-default` and a canonical are emitted | integration | same spec | ❌ Wave 0 |
| I18N-01 | Dates render `29 August 2026` / `29. August 2026` inside `<time datetime>` | unit | `node --test tests/unit/dates.test.ts` | ❌ Wave 0 |
| D-06/D-07 | `translationOf()` pairs by `translationKey`, returns `null` for a lone post, never pairs same-locale | unit | `node --test tests/unit/content.test.ts` | ❌ Wave 0 |
| Regression | `/` and `/type` still work after the route-group move | integration | `npx playwright test` (existing 9 specs) | ✅ exists — **verified passing** |
| BUILD-06 | Post route CLS stays near zero with the added italic + mono faces | integration | extend `tests/font-cls.spec.ts` to `/writing/fixture` | ⚠️ exists, needs a second case |
| Build gate | `next build` succeeds from a clean `.next` | build | `rm -rf .next && npx next build` | ❌ Wave 0 (script) |
| Error path | `/writing/nope` and `/texte/nope` render the localised not-found copy | integration | `npx playwright test tests/writing-not-found.spec.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** the single spec covering that task, plus `npx tsc --noEmit`
  (fast; catches the `LayoutProps` and `params`-Promise classes of error).
- **Per wave merge:** `npx playwright test && node --test 'tests/unit/*.test.ts'`.
- **Phase gate:** `rm -rf .next && npx next build` clean, then the full suite green, then
  `/gsd:verify-work`. **The clean-`.next` build is not optional** — the route restructure
  is exactly the change stale generated types break on.

### Wave 0 Gaps

- [ ] `content/fixture.mdx` — the fixture post itself; every SC5 assertion depends on it
- [ ] `content/` second-locale fixture (a DE post sharing a `translationKey`) — required to
      test the switcher's *present* branch; the EN fixture alone only tests the absent branch
- [ ] `lib/content.ts` + `lib/locales.ts` — the units under test
- [ ] `tests/unit/content.test.ts` — covers SC1, D-06, D-07
- [ ] `tests/unit/dates.test.ts` — covers I18N-01 date formats
- [ ] `tests/writing-routing.spec.ts`, `tests/writing-index.spec.ts`,
      `tests/writing-not-found.spec.ts` — cover WRIT-01, SC1, SC2
- [ ] `tests/prose-typography.spec.ts`, `tests/prose-code.spec.ts` — cover SC3, SC4
- [ ] `tests/fixture-viewport.spec.ts`, `tests/draft-visibility.spec.ts` — cover SC5, D-11
- [ ] `tests/i18n-routing.spec.ts` — covers I18N-01
- [ ] `package.json` scripts: `"test": "playwright test"`, `"test:unit": "node --test 'tests/unit/*.test.ts'"`
- [ ] Extend `tests/font-cls.spec.ts` with a `/writing/fixture` case (BUILD-06 under two new font files)

*Framework install needed: none. Playwright is installed and configured; `node --test` is
built in.*

**A note on assertion style, from Phase 1's own scar tissue.** STATE.md records that
`viewport.spec.ts` had to assert the *real* `clamp()` output (139.2px at 1440px) rather than
the plan's assumed near-ceiling value, and that Playwright's `reducedMotion` test option did
not affect `matchMedia` in this environment — `page.emulateMedia({ reducedMotion: 'reduce' })`
before `page.goto()` was required. Both lessons apply here: assert computed values measured
from a real render, and prefer `emulateMedia` over context options.

---

## Security Domain

`security_enforcement` is not set to `false` in `.planning/config.json`, so this section
applies. This is a static, read-only, form-free, auth-free site; most ASVS chapters are
genuinely inapplicable, and saying so explicitly is more useful than padding the table.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture & Threat Modelling | yes | Content is repo-committed and code-reviewed (D-11). The trust boundary is the git repo, not the request. |
| V2 Authentication | no | No accounts, no login, no session. |
| V3 Session Management | no | No session, no cookies. |
| V4 Access Control | **yes (one case)** | The `[slug]` param reaches a dynamic `import()`. Allowlist it against `publishedFor(locale)` **before** the import — see below. |
| V5 Input Validation | **yes** | Two inputs: the URL `slug` (allowlist) and front-matter YAML (`assertFrontmatter`, throwing at build). No `zod` — a type guard that fails `next build` is the correct enforcement point. |
| V6 Cryptography | no | Nothing is encrypted, signed or hashed. |
| V7 Error Handling & Logging | partial | The UI-SPEC is explicit that there is **no runtime error state**: a malformed post or broken MDX import fails `next build`, not a visitor's request. Do not add an error boundary that would swallow it. |
| V12 File & Resource Handling | **yes** | `fs.readdir` over `content/` and a template-literal dynamic import. Both are constrained to a fixed directory; the slug allowlist closes the traversal path. |
| V14 Configuration | **yes** | BUILD-04's response headers (Phase 6) must be planned against the Shiki inline-style CSP constraint. `robots: { index: false }` must be carried into **both** new root layouts, or Phase 1's D-07 silently regresses. |

### Known Threat Patterns for Next.js 16 + MDX

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via `[slug]` into `import(\`@/content/${slug}.mdx\`)` | Tampering / Information disclosure | **Allowlist the slug against the enumerated post list before importing** (Pattern 3). Turbopack's context module is directory-scoped, and a single dynamic segment cannot contain `/`, so this is defence in depth rather than a live hole — but it costs one line and removes the class entirely. |
| Arbitrary code execution from MDX (JSX + JS expressions + ESM) | Elevation of privilege | Content is repo-committed and reviewed (D-11). **Never render MDX from a fetched or user-supplied source.** If a future phase needs that, `next-mdx-remote-client`'s `disableImports`/`disableExports` plus `remark-mdx-remove-expressions` is the documented control — not `@next/mdx`. |
| XSS via raw HTML in Markdown | Tampering | `@mdx-js/mdx` **drops** raw HTML in `format: 'md'` `[VERIFIED: built in repo]`. **Do not add `rehype-raw`** — it would reopen this. |
| Draft content leaking to production | Information disclosure | `publishedFor()` filters on `NODE_ENV`; the same predicate must gate Phase 6's `sitemap.ts`. Verified by `tests/draft-visibility.spec.ts`. |
| Premature indexing before Phase 6 | Information disclosure | `robots: { index: false }` must appear in **both** `(en)` and `(de)` root layouts. Splitting one root layout into two is exactly how this kind of setting gets dropped. |
| CSP `style-src` blocking Shiki's inline token styles | Availability (of the feature) / security-usability tradeoff | See Pitfall 9. Decide in Phase 6 with this constraint on the table. |
| Supply-chain (10 new packages) | Tampering | slopcheck `[OK]` on all 13 candidates; `npm audit` reports 0 vulnerabilities; every package traces to a well-known org repo (vercel, mdx-js, remarkjs, rehypejs, shikijs). |

---

## Sources

### Primary (HIGH confidence)

- **Built and run in this repo** — four `next build` spikes at Next.js 16.3.3 + Turbopack,
  plus prerendered-HTML inspection, bundle measurement, and a full Playwright run.
  This is the source for every `[VERIFIED: built in repo]` claim.
- `node_modules/next/dist/docs/01-app/02-guides/mdx.md` — `@next/mdx` install, `extension`
  option, `mdx-components.tsx` requirement, dynamic-import pattern, Turbopack string-plugin
  constraint, frontmatter guidance, `mdxRs` experimental warning
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` — Turbopack default
  for dev and build, `--webpack` opt-out, filesystem build caching
- `node_modules/next/dist/docs/01-app/02-guides/internationalization.md` — the prefix-based
  official pattern (and therefore why it is rejected here)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`
  and `.../layout.md` — multiple root layouts, full-page-load caveat, top-level root layout rule
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` —
  segment vs global 404, the multiple-root-layouts case for `global-not-found`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` —
  `alternates.languages`, `metadataBase`, relative-URL build error
- `node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts` — `x-default` typing
- `node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts` — `IBM_Plex_Mono`
  (line 6665) and `Newsreader` (line 10471) signatures
- `node_modules/@shikijs/themes/dist/*.mjs` — every bundled light theme's token colours,
  audited numerically for WCAG contrast against `#F5F5F5`
- `node_modules/@shikijs/rehype/dist/types-*.d.mts` — `RehypeShikiExtraOptions`
  (`inline`, `fallbackLanguage`, `onError`, `lazy`, `cache`)
- `node_modules/next-mdx-remote-client/README.md` + `package.json` — import limitations,
  `format` option, `getFrontmatter`, React 19 peer range
- `node_modules/@tailwindcss/typography/src/index.js` + `README.md` — `:where()` selector
  generation, `addComponents`, v4 `@config` customisation path
- `.planning/phases/02-content-pipeline/02-UI-SPEC.md` (approved 2026-08-30) and
  `02-CONTEXT.md` — the locked contract
- Repo source read directly: `package.json`, `app/layout.tsx`, `app/page.tsx`,
  `app/type/page.tsx`, `app/globals.css`, `app/fonts/*`, `components/smear-heading/*`,
  `playwright.config.ts`, `next.config.ts`, `tsconfig.json`, `CLAUDE.md`, `AGENTS.md`,
  `.gitignore`

### Secondary (MEDIUM confidence)

- Context7 `/websites/shiki_style` — `createCssVariablesTheme`, arbitrary colour values,
  colour replacements
- https://github.com/vercel/next.js/issues/84748 — Turbopack + `mdxRs: false` module error
  in Next 16
- https://github.com/vercel/next.js/issues/63318 — `next-mdx-remote` + Turbopack
  `ModuleBuildError` and the `transpilePackages` workaround (does **not** reproduce with
  `next-mdx-remote-client` at 2.1.12; the spike built cleanly without it)
- https://github.com/shikijs/shiki/issues/671 — CSP vs Shiki inline styles
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src
  — `style-src` governs inline style attributes; `'unsafe-hashes'` is the attribute mechanism
- npm registry metadata (`npm view <pkg> version`, `time.modified`) for all 14 candidates

### Tertiary (LOW confidence — flagged, not relied on)

- Web search result asserting `next-mdx-remote` was archived in April 2026 — consistent with
  the maintained-fork framing in `next-mdx-remote-client`'s own README, but not independently
  confirmed against the GitHub repo. It does not affect the recommendation either way.

---

## Metadata

**Confidence breakdown:**

- **Standard stack: HIGH** — every recommended package was installed and built together in
  this repo at the exact installed Next/React versions, with the resulting HTML inspected.
- **Architecture: HIGH** — the two root layouts, the dual-extension dynamic import, the
  shared plugin chain and the `pre` override were all built and their output verified. The
  Phase 1 regression risk was measured, not estimated: all nine existing specs pass.
- **Renderer choice: HIGH** — both candidates were built; the 4.8 MB vs 8.6 MB server-output
  difference and the `import`-resolution failure are measurements, not opinions.
- **Shiki theme / contrast: HIGH** — computed from the installed theme files with the WCAG
  relative-luminance formula, across every bundled light theme.
- **Pitfalls: HIGH for 1–5, 7, 8, 10** (each reproduced or measured); **MEDIUM for 6**
  (`dynamicParams` 404 composition, inferred from docs); **MEDIUM for 9** (CSP interaction is
  well-documented upstream but is a Phase 6 concern not exercisable here).
- **Validation architecture: HIGH** — both runners verified executing in this environment.

**Repo state:** restored. `git status` shows only the pre-existing `.planning/STATE.md` and
`.planning/config.json` modifications and the untracked `text_trail_demo/` that were present
at session start. `npm ci` reinstalled the original dependency tree; `package.json` and
`package-lock.json` are unmodified.

**Research date:** 2026-08-30
**Valid until:** 2026-09-29 (30 days). Next.js 16.x and Shiki 4.x are both moving fast —
re-verify `@next/mdx`'s version pin against `next` and re-run the theme contrast audit if
either minor version advances before execution.
