# Stack Research

**Domain:** Content-led personal/portfolio site (Next.js), Typographic tier, deployed to Railway
**Researched:** 2026-08-29
**Confidence:** HIGH on framework/runtime versions and static-export mechanics (verified via Context7 + npm registry + GitHub API). MEDIUM on library-choice framing (content layer, styling) — verified current maintenance status directly, but "best fit" judgment is opinion informed by that data. LOW/flagged individually where noted (TypeScript 7, ESLint 10 major-version jumps; Velite/next-mdx-remote-client static-export behavior not officially documented).

## Answers to the seven questions, in brief

1. **Next.js 16.3.3, App Router.** Pages Router is legacy-maintenance only; all current docs, MDX support, and `next/font` live under the App Router tree. A multi-section content site (writing index, case study, backlog, CV) needs nested layouts and per-route metadata — the App Router's `layout.tsx`/`page.tsx` model fits directly; Pages Router would need manual workarounds for the same structure.
2. **Content layer:** `gray-matter` (frontmatter) + `next-mdx-remote-client` (MDX body, RSC-native) over local `.mdx` files. Contentlayer is confirmed unmaintained (no commits since late 2024). **Also confirmed during this research: `next-mdx-remote` itself — the obvious fallback — is now archived by HashiCorp** (archived, last push March 2026). Its actively maintained fork, `next-mdx-remote-client`, is the correct current choice. Velite is real and actively published but its Turbopack incompatibility (Next 16's default bundler) adds friction disproportionate to ~15 total content files.
3. **Backlog rich text:** a content file (MDX) per item, same pipeline as writing posts. At ~3 items with no dates/states, nothing beyond a markdown/MDX file is warranted — a CMS or structured schema library would be solving a problem this project doesn't have.
4. **Rendering strategy: static export (`output: 'export'`).** Nothing in the milestone's feature set requires a running server: no contact form (explicitly out of scope), no auth, no database, and the obfuscated email is a client-side JS pattern that needs no backend. The only cost is losing `next/image`'s on-the-fly Optimization API, addressed with `images.unoptimized: true`.
5. **Images:** `next/image` works under static export only with `images.unoptimized: true` (verified: Next.js throws a build error otherwise) or a custom loader. At one photograph plus a few thumbnails, pre-sizing/compressing source images and using `unoptimized: true` is simpler and cheaper than standing up a Node server or third-party image CDN for the sake of automatic resizing five images.
6. **Styling:** Tailwind CSS v4.3.3 (CSS-first `@theme` config) for layout/spacing/tokens, `@tailwindcss/typography` for long-form MDX prose, plain CSS custom properties (via `next/font` variables and a small global stylesheet) for the constructivist type scale where utility classes get in the way. No component library.
7. **Railway deployment:** the existing `Dockerfile` + `nginx.conf.template` pattern still applies and is the right shape for static export — it needs updating (build stage added, 404 handling fixed), not discarding. Railway's zero-config builder (Railpack) can also auto-detect `output: 'export'` and serve `out/` directly, which is a valid simpler alternative; keeping the Dockerfile is a deliberate choice for explicit response-header control, not a technical requirement.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.3.3 | Framework, App Router, static export | Current stable; Turbopack is now the default bundler for both `next dev` and `next build` (stable as of v16). App Router is where all current documentation, MDX guidance, and `next/font` live — Pages Router receives no new features. |
| React | 19.2.8 | UI runtime | Next.js 16's peer dependency; matches `react-dom` 19.2.8. |
| TypeScript | 7.0.2 | Type checking | Next.js 16 requires TypeScript ≥5.1.0 — 7.0.2 is current npm `latest` as of this research (verified directly against the registry). **Flag:** this is a large jump from the 5.x line most training data and tutorials assume; if any editor/tooling friction appears, dropping to the latest 5.x is a safe fallback since 5.1+ is all Next.js requires. |
| Node.js | ≥20.9.0 (recommend 22 LTS) | Runtime for build step | Next.js 16 dropped Node 18 support; minimum is now 20.9.0. Use `node:22-alpine` as the Docker build-stage base image. |

### Content Layer

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| gray-matter | 4.0.3 | Parse YAML frontmatter (title, date, excerpt) out of `.mdx` files | Stable, zero-dependency-on-a-bundler parsing library — not a webpack/Turbopack plugin, so it has no bundler-compatibility surface at all. Mature since 2016, no maintenance risk. |
| next-mdx-remote-client | 2.1.12 | Compile and render MDX bodies as async React Server Components (`next-mdx-remote-client/rsc`) | Maintained fork of `next-mdx-remote`. **Verified during this research that `hashicorp/next-mdx-remote` is archived** (GitHub API: `archived: true`, last push 2026-03-26) — the "obvious" choice for this pattern is dead upstream. This fork (`ipikuka/next-mdx-remote-client`) is active (pushed 2026-08-18, 3 open issues), supports `parseFrontmatter`, and exposes an RSC-native `MDXRemote` import path built for the App Router. |
| @mdx-js/mdx | 3.1.1 | Underlying MDX compiler | Transitive dependency of next-mdx-remote-client; pin only if you need to control the exact compiler version directly. |
| remark-gfm | 4.0.1 | GitHub-Flavored Markdown (tables, strikethrough, task lists) in remark pipeline | Only add if the migrated 2020 posts actually use tables/strikethrough — check the source posts before installing. Cheap either way. |
| rehype-slug + rehype-autolink-headings | 6.0.0 / 7.1.0 | Auto-generate heading `id`s and anchor links | Optional nicety for the case study and longer posts (deep-linkable subheadings). Not required for v1; add only if the case study is long enough to want a table of contents. |

**Do not use for content:** Contentlayer/Contentlayer2, Velite, Content Collections — see "What NOT to Use" below.

### Styling

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Tailwind CSS | 4.3.3 | Utility layer + design tokens | v4's CSS-first `@theme` directive (no `tailwind.config.js` needed) is a natural fit for defining a small, deliberate constructivist token set — a restrained color palette, a type scale, a spacing scale — as CSS variables that both Tailwind utilities and hand-written CSS can reference. Integrates with `next/font`'s CSS-variable output directly. |
| @tailwindcss/postcss | 4.3.3 | PostCSS plugin that wires Tailwind into Next.js's build | Standard v4 integration path (replaces the old `tailwindcss` PostCSS plugin registration from v3). |
| @tailwindcss/typography | 0.5.20 | `prose` classes for long-form MDX content | The writing index and case study are prose-heavy; this plugin gives sane baseline vertical rhythm for headings/lists/blockquotes inside MDX without hand-styling every markdown element. Override `prose-*` theme keys to match the site's own type scale rather than accepting Tailwind's defaults verbatim. |
| next/font (built-in, no separate package) | ships with Next.js | Self-hosted variable font loading | Works identically under static export and Node server — it's a build-time optimization, not a runtime API. No separate font-loading library needed; `next/font/local` covers a custom constructivist display face if one is used, `next/font/google` covers a body face. |
| clsx | 2.1.1 | Conditional className composition | Tiny (∼240B), only worth adding if conditional classes get genuinely hard to read as template strings — a "when to reach for it," not a default install. |

**Where Tailwind utility classes fight fine typographic control** (e.g., a precise `clamp()`-based fluid type scale, optical letter-spacing per breakpoint, OpenType feature settings) — put those specific rules in a small global stylesheet or CSS Module using the same CSS variables Tailwind's `@theme` defines, rather than forcing them through arbitrary-value utility syntax. Mixing the two is normal in Tailwind v4 and cheaper than picking one system exclusively.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| eslint 10.9.1 + eslint-config-next 16.3.3 | Linting matched to the installed Next.js version | Install `eslint-config-next` at the exact Next.js version to avoid rule-set drift. |
| Railway CLI / Railway MCP | Deploy, inspect logs, manage domains | Already available in this environment; use for the Railway-specific mechanics below rather than the dashboard where scriptable. |

## Installation

```bash
# Core
npm install next@16.3.3 react@19.2.8 react-dom@19.2.8

# Content layer
npm install gray-matter next-mdx-remote-client

# Styling
npm install tailwindcss@4 @tailwindcss/postcss @tailwindcss/typography

# Optional, add only if the migrated posts need them
npm install remark-gfm rehype-slug rehype-autolink-headings

# Dev dependencies
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next
```

## Rendering strategy — resolved

**Recommendation: `output: 'export'` (static export), not `output: 'standalone'` / `next start`.**

Walked through every feature in the milestone against what actually requires a live Node process:

| Feature | Needs a server at request time? | Notes |
|---|---|---|
| Writing index, case study, backlog, CV | No | All content is known at build time; render with `generateStaticParams` for any dynamic segments (e.g. `/writing/[slug]`). Static export forbids `dynamicParams: true`, which is irrelevant here since every slug is enumerable at build time from the filesystem. |
| Obfuscated email | No | Client-side JS pattern (reconstruct the address in a Client Component `useEffect`/on-render), not a server-side redirect or API call. No library needed — a few lines of code. |
| GitHub / LinkedIn links | No | Static anchors. |
| Photograph, project thumbnails | No (with a caveat — see Images) | `next/image` needs the Image Optimization API for on-the-fly resizing, which static export does not have. |
| Contact form | N/A | Explicitly out of scope for this milestone. |

Consequences of choosing static export, verified against current Next.js docs:
- All dynamic routes must be fully enumerated via `generateStaticParams`; `dynamicParams: true` throws a build error under `output: 'export'`. Not a constraint in practice here — every route (writing posts, the one case study, backlog items) has a small, fully-known slug list at build time.
- Route Handlers must be `force-static` (or have `generateStaticParams`) — no `force-dynamic` API routes. Nothing in this milestone needs one.
- `app/not-found.tsx` is automatically copied to `out/404.html` (and `out/404/index.html` if `trailingSlash: true`) during export — this is the file the deployment's web server should be pointed at for real 404s (see Deployment below).
- `next/font` is unaffected either way — it's a build-time, self-hosted mechanism regardless of output mode.

**The one thing static export gives up:** `next/image`'s built-in resize/format-negotiation server. At the actual image count here (one photograph, a handful of project thumbnails), pre-processing source images once and setting `images.unoptimized: true` is far cheaper than keeping an always-on Node process alive on Railway for that one capability. If the photo/thumbnail count grows into the dozens, revisit — see Stack Patterns by Variant.

## Images under static export

```js
// next.config.ts
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // required: default loader + output:'export' throws a build error otherwise
  },
}
```

Verified directly from Next.js source (`packages/next/src/export/index.ts`): if `next/image` is imported, the default loader is active, and `unoptimized` is not `true`, `next build` throws `ExportError` pointing at exactly this fix. `next/image` still gives layout stability (explicit width/height, lazy loading, `srcSet` generation from a source image you provide at the sizes you specify) — it just won't resize server-side on request. Pre-export images (e.g. via `sharp` in a one-off script, or exporting a couple of fixed sizes from whatever tool produced the photograph) to the 1–2 sizes actually used in the layout.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| gray-matter + next-mdx-remote-client | Velite 0.4.0 | If the content volume grows to the point where Zod-validated, typed content collections earn their setup cost (e.g., dozens of posts with enforced schema fields) — but note its `VeliteWebpackPlugin` doesn't work under Turbopack (Next 16's default); the documented workaround is running Velite programmatically from `next.config.mjs` rather than via the plugin. Extra moving part not worth it at ~15 files. |
| gray-matter + next-mdx-remote-client | @next/mdx (page-route MDX, `pageExtensions: ['mdx', ...]`) | If pages were meant to be authored as MDX files that *are* routes directly (no listing/index page needed). Doesn't fit here because the writing index needs to enumerate and sort a collection with metadata — that requires reading frontmatter across files programmatically regardless, so standardizing on one filesystem-collection approach (gray-matter + next-mdx-remote-client) for all content types is simpler than running two content mechanisms side by side. |
| Static export (`output: 'export'`) | `output: 'standalone'` + `next start` (Node server) | If a genuine server-side feature appears later — a real contact-form API route, on-the-fly image transforms at real scale, per-request personalization. None of that is in this milestone; Railway's official Next.js guide assumes this path by default (its guide is written around a Postgres-backed app), which is why it's easy to reach for reflexively — resist it here. |
| Tailwind CSS v4 | Plain CSS Modules / hand-written CSS | If the constructivist type system ends up needing so much bespoke `clamp()`/optical-alignment work that Tailwind's utility layer is doing little beyond spacing — a legitimate call for a highly typographic site, and not mutually exclusive with keeping Tailwind for layout scaffolding. |
| CV as a hand-coded TSX page | CV authored as MDX/markdown | If the CV needs to be edited as prose by someone non-technical, or needs a print/PDF export path where markdown-to-PDF tooling is easier to script than hand-built print CSS. For a single self-authored page, structured TSX + print stylesheet is less code, not more. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Contentlayer / Contentlayer2 | Original project has had no commits since late 2024 (unmaintained upstream). The community fork (Contentlayer2) is a viable production path in general, but it's a full schema-validated content pipeline built for sites with dozens-to-hundreds of documents — disproportionate to ~13 migrated posts, 1 case study, and a handful of backlog entries. | gray-matter + next-mdx-remote-client |
| next-mdx-remote (the original HashiCorp package, not the fork) | **Confirmed archived** during this research: `hashicorp/next-mdx-remote` on GitHub shows `archived: true`, last push 2026-03-26. It's the package every existing tutorial and most training data will point you toward — check before installing it. | next-mdx-remote-client (`ipikuka/next-mdx-remote-client`), actively maintained fork with an equivalent RSC API |
| Velite / Content Collections | Real, actively published projects, but they solve a schema-validation-at-scale problem this site doesn't have yet, and Velite's build-time plugin has a documented Turbopack incompatibility requiring a workaround under Next.js 16's default bundler. | gray-matter + next-mdx-remote-client; revisit if content volume grows substantially |
| A headless CMS (Sanity, Contentful, Payload, etc.) | Content is authored by one person, in a code editor, shipped via git. A CMS adds an external service, an API surface, and a content-sync step for zero editorial-workflow benefit at this scale — and every field (case study, writing post, backlog item) is already comfortably expressed as a file. | Filesystem content (`.mdx` files in the repo) |
| A database (Postgres, etc.) | Nothing in this milestone needs persisted, mutable application state. The backlog explicitly ships with no dates/states (an accepted-risk decision already logged in PROJECT.md) — it's static content, not application data. | Filesystem content |
| State management (Redux, Zustand, Jotai, Recoil) | The whole site is server-rendered static content plus, at most, one or two small Client Components (email obfuscation, maybe a mobile nav toggle). `useState` inside those components is enough; there is no cross-component client state to coordinate. | React `useState` / plain props |
| Animation library (Framer Motion, GSAP, React Spring) | The Typographic tier is explicitly no performative motion — that's a v3 decision already made in PROJECT.md. Installing an animation library now pre-loads both the dependency weight and the temptation to use it before the work underneath justifies it. | CSS transitions for the few small interactive states (hover, focus) the Typographic tier does call for |
| A component library (shadcn/ui, MUI, Chakra, Radix UI wholesale) | The entire UI surface is under ten distinct patterns (nav, list item, backlog entry, prose block, footer/contact), all list- and typography-based, with no complex accessible widgets (dialogs, comboboxes, date pickers) in scope. A component library's value proposition doesn't apply; hand-rolled semantic HTML is less code, not more, at this surface area. | Hand-written components styled with Tailwind + the site's own CSS tokens |
| Contact-form backend (Formspree, Resend, a custom API route) | Explicitly out of scope for this milestone — an obfuscated email address does the same job with zero backend. | Client-side email obfuscation pattern |
| `output: 'standalone'` + always-on Node server on Railway | No feature in this milestone performs request-time server work. Keeping a Node process alive to serve what is otherwise static HTML is unnecessary operational surface (memory footprint, restart/health-check behavior, cold-start on deploy) for a personal site with no dynamic backend need. | `output: 'export'` + nginx (or Railway's zero-config static serving) |
| i18n routing (`next-intl`, built-in Next.js i18n) | Single-language site. Next.js's built-in i18n routing is also explicitly documented as incompatible with `next export`/static export in the classic export path. | Not applicable |

## Stack Patterns by Variant

**If the backlog or writing archive grows past roughly 20–30 items, or a non-technical collaborator needs to edit content:**
- Reconsider Velite or Content Collections for schema-validated, typed content collections.
- Because at that volume, catching a malformed frontmatter field at build time (rather than a runtime rendering error) starts paying for its setup cost, and the Turbopack workaround becomes worth the one-time friction.

**If the site moves to the v3 "Performative" tier (per PROJECT.md's staged roadmap):**
- Revisit Framer Motion or a lighter CSS-driven approach (View Transitions API, scroll-driven CSS animations) at that point, scoped to the specific pieces that earn it.
- Because the Typographic-tier constraint is explicitly time-boxed to this milestone, not permanent — but it should stay out of the dependency tree until that phase actually starts.

**If a genuine server-side feature appears later (contact form with spam filtering, on-the-fly image transforms at real scale, A/B testing, analytics requiring server logic):**
- Switch `output: 'export'` to `output: 'standalone'`, update the Dockerfile to run `node .next/standalone/server.js`, and drop the nginx layer (or keep nginx only as a TLS/edge layer in front of the Node process).
- Because that's the point where the operational cost of a live server actually buys something the site doesn't already have.

**If images grow beyond a handful of hand-optimized assets (e.g., a photo-heavy project gallery):**
- Reconsider either `output: 'standalone'` (to regain the Image Optimization API) or a custom `next/image` loader pointing at a third-party image CDN (Cloudinary, imgix) that works under static export.
- Because manually pre-sizing images stops being cheap once there are more than a handful of them.

## Deployment mechanics on Railway

**The existing `Dockerfile` + `nginx.conf.template` pattern in the repo still applies — it needs updating, not discarding.**

Current state (read from the repo): the Dockerfile copies a single static HTML prototype file into an `nginx:alpine` image, and `nginx.conf.template` does a plain SPA-style fallback (`try_files $uri $uri/ /index.html`). Two things need to change for a real Next.js static export:

1. **Add a build stage.** The current Dockerfile has no build step at all (it copies a pre-existing HTML file). A Next.js static export needs a Node build stage first:
   ```dockerfile
   FROM node:22-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build   # produces ./out with output: 'export'

   FROM nginx:alpine
   COPY --from=builder /app/out /usr/share/nginx/html
   COPY nginx.conf.template /etc/nginx/templates/default.conf.template
   ```
2. **Fix the 404 handling.** The current `try_files $uri $uri/ /index.html;` fallback is a single-page-app pattern — it would silently serve the homepage for any broken or mistyped URL instead of a real 404. A static export produces a real `404.html` (from `app/not-found.tsx`, confirmed via Next.js export source). Replace the fallback with something that serves that file on a genuine miss, e.g.:
   ```nginx
   location / {
       try_files $uri $uri.html $uri/index.html /404.html;
   }
   error_page 404 /404.html;
   ```
   The exact `try_files` pattern depends on the `trailingSlash` config choice (default `false` → `/about.html`; `trailingSlash: true` → `/about/index.html`) — match whichever is set in `next.config.ts`.

The `${PORT}` templating already in `nginx.conf.template` (via nginx:alpine's `envsubst` entrypoint mechanism) is correct for Railway's dynamically assigned port and should be kept as-is.

**Alternative: drop the Dockerfile, let Railway's Railpack builder handle it.** Verified via Railway's own docs/station threads: Railpack detects `next` as a dependency plus `output: 'export'` in the Next.js config, and defaults to serving the `out/` directory with zero configuration — no Dockerfile needed at all. This is simpler to maintain. The tradeoff is giving up explicit control over response headers (cache-control, security headers like CSP/`X-Content-Type-Options`) to Railpack's default static file server. Given this site's author has previously written specifically about security headers (one of the migrated legacy posts), keeping the nginx layer for that explicit control is a defensible, small bit of extra maintenance — but it is a preference, not a technical requirement. Either path deploys a working static site on Railway.

**Do not** reach for `output: 'standalone'` + Railway's officially-documented Next.js guide pattern (`node .next/standalone/server.js`) by default — that guide is written around a Postgres-backed, server-rendering app and is the reflexive path Railway steers you toward, but nothing in this milestone needs a live server (see "Rendering strategy — resolved" above).

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@16.3.3 | react@^19.0.0, react-dom@^19.0.0 | Peer dependency range confirmed from Next.js's own `package.json` (`engines`/`peerDependencies`). |
| next@16.3.3 | typescript@≥5.1.0 | Minimum stated in the official v16 upgrade guide; 7.0.2 (current npm latest) exceeds this comfortably. |
| next@16.3.3 | node@≥20.9.0 | Node 18 support dropped in v16; use Node 22 (current LTS) for the Docker build stage. |
| next-mdx-remote-client@2.1.12 | react@≥19.1.0, react-dom@≥19.1.0 | Confirmed via npm `peerDependencies` — compatible with the React 19.2.8 this stack installs. |
| tailwindcss@4.3.3 | @tailwindcss/postcss@4.3.3, @tailwindcss/typography@0.5.20 | Keep the Tailwind core and its PostCSS plugin on matching major.minor; typography plugin is compatible with v4. |
| velite@0.4.0 | next.js + Turbopack (default in v16) | **Not** compatible via its default `VeliteWebpackPlugin` integration path — only via the documented programmatic `next.config.mjs` workaround. Listed here as a documented incompatibility, not a recommendation. |

## Sources

- Context7 `/vercel/next.js` — static export limitations, `next/image` + `output: 'export'` behavior, `@next/mdx` App Router setup, `next/font` App Router usage, Node/TypeScript version requirements for v16, Turbopack default-bundler status.
- npm registry (`npm view`, direct queries run during this research) — current published versions of `next`, `react`, `react-dom`, `typescript`, `gray-matter`, `next-mdx-remote`, `next-mdx-remote-client`, `@mdx-js/mdx`, `velite`, `contentlayer2`, `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/typography`, `clsx`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `eslint`, `eslint-config-next`. High confidence — this is the authoritative source for "what version is current."
- GitHub API (`api.github.com/repos/...`) — direct, load-bearing verification that `hashicorp/next-mdx-remote` is archived (`archived: true`, last push 2026-03-26) and that `ipikuka/next-mdx-remote-client` is active (last push 2026-08-18). This contradicts what most tutorials and training data recommend as of this research date — flagged explicitly because it changes the recommendation.
- [ContentLayer has been Abandoned - What are the Alternatives?](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) — MEDIUM confidence, corroborates Contentlayer's unmaintained status and surveys alternatives (Velite, Content Collections, next-mdx-remote).
- [Velite — Integration with Next.js](https://velite.js.org/guide/with-nextjs) — official docs, HIGH confidence on the documented Turbopack incompatibility and the `next.config.mjs` workaround.
- [Railway Station — Deploying a Static Next.js Site to Railway](https://station.railway.com/questions/deployment-crashing-due-to-next-start-5b078052) and [Railpack Node.js docs](https://railpack.com/languages/node) — MEDIUM confidence, community/official-adjacent sources confirming Railpack's zero-config detection of `output: 'export'` and default serving of the `out/` directory.
- [Railway Guides — Deploy a Next.js App with Postgres](https://docs.railway.com/guides/nextjs) — official, HIGH confidence on the `output: 'standalone'` pattern Railway documents by default (cited here specifically to explain why it's *not* the right default for this milestone).
- Repo inspection (`Dockerfile`, `nginx.conf.template` read directly) — HIGH confidence on current deployment state and what concretely needs to change.

---
*Stack research for: content-led Next.js personal site, Typographic tier, Railway deployment*
*Researched: 2026-08-29*
