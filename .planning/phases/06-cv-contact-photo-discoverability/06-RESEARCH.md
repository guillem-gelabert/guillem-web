# Phase 6: CV, Contact, Photo & Discoverability - Research

**Researched:** 2026-08-31
**Domain:** Next.js 16.3.3 App Router — proxy/middleware routing, metadata & OG generation, response headers, static content surfaces
**Confidence:** HIGH (nearly everything below was measured in this repo against a real `next build` + `next start`, not recalled)

---

## Summary

Four of this phase's hardest questions were answerable only by running the code, and all four were run. **CR-01 is solved and proven** — a Node-runtime `proxy.ts` (Next 16 renamed `middleware.ts`; the old name now emits a build-time deprecation warning) returning `NextResponse.rewrite(url, { status: 404 })` to a real per-locale 404 route produces a genuine 404 with `<html lang="de">` and `Nicht gefunden` in the **server HTML with no JavaScript**. Measured end to end. It composes cleanly with `experimental.globalNotFound`, does not de-optimise static generation, and costs ~1–2 ms per request locally.

**Two CONTEXT decisions do not survive measurement.** (1) `next/og`'s bundled Satori **cannot load any variable font** — `Humane-VF.ttf` and two unrelated macOS variable TTFs all crash identically in `parseFvarAxis`, failing `next build` outright. D-3.2's "the name in Humane" and D-3.5's "a `G` in Humane via `ImageResponse`" are not implementable as written; the planner must take the recorded Playwright fallback or drop Humane from the card. (2) D-2.3's entity-encoded email cannot be produced by JSX — React SSR escapes `&`, so `&#64;` ships as `&amp;#64;`. `dangerouslySetInnerHTML` is the only route to entities in the emitted markup.

**One fact changes the phase's risk profile and is absent from CONTEXT: `guillemgelabert.com` is already serving this exact site**, byte-identical to the Railway URL, with `rel="canonical"` pointing at the Railway hostname. Flipping `robots` today makes the site indexable on two hostnames and tells Google to consolidate onto `web-production-9cedb.up.railway.app`. That is the single highest-value thing to get right before FIND-02, and it is a one-variable change, not a cutover.

**Primary recommendation:** Build in this order — (1) `proxy.ts` + two reserved localised 404 routes (CR-01, independent of everything else); (2) `next.config.ts` `headers()` from a pure `buildCsp({dev})`; (3) `lib/cv.ts` / `lib/contact.ts` + the `/cv` and `#contact` surfaces; (4) metadata factory, `sitemap.ts`, `robots.ts`, OG card by the *Playwright-committed-PNG* path; (5) the audit; (6) the flip, last, gated on **eleven** rows — CONTEXT's ten plus `COPY_REVIEWED`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Area 1 — The CV**
- **D-1.1: The CV is an HTML page only. No PDF asset ships.**
- **D-1.2: CV content is a typed data module, not markup — `lib/cv.ts`.** Shape: `experience[]` (`years`, `role`, `org`, `place`, `note`), `education[]`, `languages[]`, `selectedWork[]`. `selectedWork` re-uses the Phase 3 work-list data and the Phase 4 case-study slug rather than restating them.
- **D-1.3: Depth is reverse-chronological roles with a one-line note each, not a duties list.** Row rhythm reuses the work list's shipped treatment: 32px air / 1px `--color-rule` / 32px air. No new rule weight.
- **D-1.4: No print stylesheet. PROF-06 stays v2 — but the CV is built so the deferred work is stylesheet-only.** Semantic sectioning, no negative margins, no background-dependent contrast, no element whose legibility depends on a screen-only treatment.
- **D-1.5: The CV is English only, and lives at `/cv` in the `(en)` group.** **CV and contact copy must NOT be added to `UI` in `lib/locales.ts`.** English-only strings live in `lib/cv.ts` / `lib/contact.ts` alongside their data.
- **D-1.6: The CV gets no landing-surface copy beyond the existing nav item.**

**Area 2 — Contact and identity**
- **D-2.1: Three channels, exactly the three the requirements name — email, GitHub, LinkedIn.** No contact form (Out of Scope by name).
- **D-2.2: Presented as a labelled list of plain links — no icons, because there are no icons.** Label-role name + `.link-quiet` anchor; `display: inline-block; padding-block: 4px` for WCAG 2.5.8. The same block renders in two places — `#contact` on `/` and the foot of `/cv` — from one component reading one data module.
- **D-2.3: Email obfuscation is server-rendered entity encoding, with the `mailto:` href assembled at render time from parts.** Acceptance is the three-part test: tab to it, read it with a screen reader, select and copy it. Playwright covers keyboard reachability, accessible name, and `textContent` equalling the real address; the screen-reader pass is a recorded manual check.
- **D-2.4: One photograph, on `/cv` only, below the `<h1>`.** Not on the landing view.
- **D-2.5: Plain `<img>` with explicit `width`/`height`. No `next/image`, no `sharp`, no new dependency.** Pre-sized raster committed to `public/`. Square corners, no border, no shadow, no radius.
- **D-2.6: The portrait MUST reserve its space.** Portrait sits *below* the `<h1>`, **and** carries explicit intrinsic `width`/`height` **and** an `aspect-ratio` on its container. A Playwright assertion that the `/cv` heading's smear origin is unchanged before and after image load.

**Area 3 — Discoverability**
- **D-3.1: One site-metadata module, one metadata factory — the two root layouts stop duplicating.** `lib/site.ts` (`siteUrl`, `siteName`, `siteDescription` per locale) + a small factory both layouts call. Title strategy: root sets `title.template = "%s — Guillem Gelabert"` and `title.default = "Guillem Gelabert"`. Descriptions hand-written per route; the root `"Developer."` / `"Entwickler."` placeholders are replaced with a description of the *site's artifacts*. Working text: *"Data visualisation, writing and interactive work by Guillem Gelabert."*
- **D-3.2: The social card is generated, not a committed raster — `ImageResponse` via `next/og`.** One builder in `lib/og.tsx`, wired as `app/(en)/opengraph-image.tsx`, `app/(de)/opengraph-image.tsx`, and a per-post override under each `[slug]`. Design: ink `#000000` on paper `#ffffff`, name in Humane, one line in the body face, one 1px ink rule. No accent. 1200×630. **Documented fallback if satori's font handling misbehaves: render the card once with Playwright at 1200×630 and commit the PNG.**
- **D-3.3: `app/sitemap.ts` and `app/robots.ts`, both generated from the same content module the indexes already use.** Sitemap enumerates `/`, `/cv`, `/writing`, `/texte` and every published post in both locales via `publishedFor`. `robots.ts` allows all, disallows `/type`, points at the absolute sitemap URL. **Excluded:** `/type`. **Deleted outright:** `app/(en)/probe404/`, the five unused Next scaffold SVGs.
- **D-3.4: v1 stays on the Railway URL. The apex is NOT cut over in this phase — but the hostname stops being hardcoded.** `siteUrl` reads `process.env.NEXT_PUBLIC_SITE_URL`, falls back to the Railway origin, and the variable is set explicitly in the Railway production environment.
- **D-3.5: The favicon is replaced.** `app/favicon.ico` is the untouched Next scaffold icon. Replaced with `app/icon.tsx` — a `G` in Humane, ink on paper, via `ImageResponse`.
- **D-3.6: The robots flip is the last plan in the phase and is mechanically gated.** It will break `tests/build/prerender.test.ts`'s noindex assertion, which is inverted in the same commit as the flip, never before it.

**Area 4 — Security headers and the final audit**
- **D-4.1: A lean, fully-justified header set in `next.config.ts` `headers()`.** Ships: CSP, `Strict-Transport-Security: max-age=63072000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (accelerometer, camera, geolocation, gyroscope, magnetometer, microphone, payment, usb, browsing-topics all `()`), `Cross-Origin-Opener-Policy: same-origin`. **Deliberately omitted:** HSTS `preload`, `X-Frame-Options`, `X-XSS-Protection`, `Cross-Origin-Resource-Policy`, `X-DNS-Prefetch-Control`, COEP. *"Not middleware — none exists, and adding one for headers alone buys nothing."*
- **D-4.2: CSP resolves the inline-style collision with `style-src 'self' 'unsafe-inline'`, and the same concession is required for `script-src` — both documented in place.** Policy: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'; upgrade-insecure-requests`. There are TWO inline-style consumers, not one (Shiki tokens **and** `remark-gfm` table alignment). The honest framing goes in a comment block in `next.config.ts`.
- **D-4.3: The CSP is built by one pure function so it can be unit-tested exactly.** `buildCsp({ dev })` in `lib/`, unit-tested with `node --test` against the exact production string. Three-layer verification: unit test on the string, a Playwright test that the headers are *delivered*, and a post-deploy `curl` against the Railway URL recorded in the phase's verification document. **One regression test is non-negotiable:** after the CSP ships, assert that a `<pre>` on the fixture post still carries real token colouring.
- **D-4.4: The final audit is a written checklist with a verdict per row.** Six parts: cross-link integrity (automated), Out-of-Scope roll-call by name, design-system roll-call, BRIEF §8's trap gut-check, live-deploy checks (not local), housekeeping.

**Launch Gate — Phase 6 is BLOCKED unless every row passes**

| # | Gate | Mechanically checked by |
|---|---|---|
| G1 | `/writing` is not empty — at least one non-draft post exists in EN | `publishedFor("en").length > 0` |
| G2 | HOME-01's positioning sentence is real — `POSITIONING_PLACEHOLDER` no longer renders on `/` | grep + rendered-DOM assertion |
| G3 | `lib/cv.ts` `experience` is non-empty | `experience.length > 0` |
| G4 | `lib/contact.ts` `email` is non-null | `email !== null` |
| G5 | `lib/contact.ts` `linkedin` is non-null | `linkedin !== null` |
| G6 | The portrait file exists in `public/` at its declared dimensions | file stat + `<img>` renders |
| G7 | The OG image resolves 200, `image/png`, 1200×630, at an absolute URL | fetch against the deploy |
| G8 | Security headers present on a live response | `curl` against the Railway URL |
| G9 | Code blocks still render token colour with CSP enforced | Playwright assertion |
| G10 | `/type` and `/probe404` are not in the sitemap; `/probe404` no longer exists | sitemap parse + route check |

**The no-fabrication rule for this phase:** never synthesise a personal fact, and never let a missing one produce a broken affordance. Absence renders as absence, not as a placeholder and not as a broken affordance. **No generated portrait, under any circumstances.**

**Carried in from Phase 2 (coordinator decision, 2026-08-31):** CR-01 — localised `[slug]` 404s must server-render. **This phase must fix it in the Node-runtime `middleware.ts` it already builds for security headers**, by rewriting unmatched localised slugs to a per-locale 404 page with a 404 status. Add it to this phase's launch-gate checklist.

### Claude's Discretion

- The exact `lib/cv.ts` field names and whether `education` / `languages` are separate sections or one combined block at low row counts.
- Where the contact block sits within `/cv` (foot is the assumption; head beside the portrait is available).
- The portrait's aspect ratio and rendered width — nothing upstream specifies one, only that it must be explicit.
- OG card composition within D-3.2's constraints (ink on paper, name in Humane, one rule).
- Whether `package.json`'s name changes from `"gw-scaffold"`.
- Exact `Permissions-Policy` membership beyond the listed set, provided every entry is a feature the site genuinely does not use.
- Plan decomposition and wave structure, subject only to the flip being last.

### Deferred Ideas (OUT OF SCOPE)

- **Custom domain cutover — v2 (BUILD-07).** D-3.4 makes it a one-variable change (`NEXT_PUBLIC_SITE_URL`) plus DNS, with no code change. Adding `preload` to HSTS belongs with it.
- **Print stylesheet for the CV — v2 (PROF-06).**
- **Nonce-based CSP — v2.** Requires `middleware.ts`, threading a nonce through two root layouts plus the global not-found, and forces dynamic rendering on every route. Would still not fix Shiki.
- **`/writing` index treatment beyond n≈5 — v2.**
- **Lint debt — `components/smear-heading/use-prefers-reduced-motion.ts`.** Phase 6's audit either fixes it or re-defers it with a decision, but does not leave it undecided at milestone close.
- **`package.json` name is still `"gw-scaffold"`.** Flagged in the audit; renaming is at Claude's discretion.
- **Preview-deploy indexing — not a v1 concern** (PITFALLS #17).
</user_constraints>

---

<phase_requirements>
## Phase Requirements

ROADMAP.md is authoritative (verified: `.planning/ROADMAP.md:214`). The set is PROF-01…05, BUILD-04, FIND-01, FIND-02. BUILD-01/02/03/05 are marked `[x]` complete against Phase 1 in `REQUIREMENTS.md:140-156` and are regression surface only.

| ID | Description (verbatim from `REQUIREMENTS.md`) | Research Support |
|----|---------------------------------------------|------------------|
| **PROF-01** | Visitor can read Guillem's CV as a page on the site. | `/cv` exists and prerenders (`.next/server/app/cv.html`, verified). `lib/cv.ts` follows `lib/work.ts` / `lib/backlog.tsx`'s shipped data-module shape. Row rhythm: `flex list-none flex-col gap-xl` + `border-t border-rule pt-xl` (verbatim from `components/landing/work-list.tsx:19`). **`experience` is `[USER-SUPPLIED]`.** |
| **PROF-02** | Visitor can see a photograph of Guillem. | Plain `<img width height loading="lazy" decoding="async">` per `components/mdx/figure.tsx`. Tailwind v4 preflight already sets `img { max-width: 100%; height: auto }` (`node_modules/tailwindcss/preflight.css:230-234`, verified), so width/height attributes alone reserve space. `documentTop` is gauge-invariant — no `ResizeObserver`. **The file is `[USER-SUPPLIED]`.** |
| **PROF-03** | Visitor can obtain Guillem's email address, obfuscated against scrapers while remaining reachable by keyboard and screen reader. | Entity encoding requires `dangerouslySetInnerHTML` — React SSR escapes `&` (measured, § Pitfall 3). **The address is `[USER-SUPPLIED]`.** |
| **PROF-04** | Visitor can open Guillem's GitHub profile. | **Established from evidence, may ship as fact:** `https://github.com/guillem-gelabert` — `git remote -v` returns `https://github.com/guillem-gelabert/guillem-web.git`. Not user-supplied. |
| **PROF-05** | Visitor can open Guillem's LinkedIn profile. | **`[USER-SUPPLIED]`.** No evidence in the repo, the git history, the deployed site, or the DNS. |
| **BUILD-04** | Visitor loading the site receives real security response headers. | `next.config.ts` `headers()` with `source: "/:path*"` verified delivering on `/`, `/cv`, the proxy-rewritten 404, the global 404, and `/_next/static/*`. |
| **FIND-01** | Visitor pasting the site URL into Slack or a DM sees a correct title, description, and preview image. | Current `/` head measured in full (§ Specific Question 1). `opengraph-image` file convention auto-emits `og:image{,:type,:width,:height,:alt}` **and** `twitter:card=summary_large_image`. |
| **FIND-02** | Search engines can index the site through a sitemap and robots file. | `app/sitemap.ts` + `app/robots.ts` prototyped and verified against a real build. Eleven gate rows, not ten. |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

`./CLAUDE.md` is short and carries two actionable directives:

| Directive | Consequence for this phase |
|-----------|---------------------------|
| **"MVP first. No polishing until the core works."** | Ranks the plan order. CR-01 and the headers are core; OG card composition is polish. If the OG card fights Satori (it will — see F2), take the fallback rather than iterating on the card. |
| **"Update `_pm/kanban.md` when completing tasks."** | ⚠️ **`_pm/` does not exist in this repo** (verified: no `_pm` directory). The directive is unsatisfiable as written. The planner should treat `.planning/STATE.md` + `ROADMAP.md` as the tracking surface (which is what every prior phase did) and note the discrepancy rather than creating `_pm/kanban.md` unasked. |

Global rules that bind: Context7 before relying on training data for library APIs (applied throughout — `proxy.ts` and `MetadataRoute` were confirmed against `/vercel/next.js` docs); prefer Bash file reads; no emoji.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| CV content (`lib/cv.ts`) | Build-time / Server Component | — | Static typed data compiled into the prerendered `/cv` HTML. No client concern. |
| Contact channels (`lib/contact.ts`) | Build-time / Server Component | — | Same. The null-channel branch is a render-time decision, not a client one. |
| Email obfuscation | **Server render (emitted bytes)** | — | The whole point is what lands in the *served HTML*. Any client-tier reassembly is D-2.3's rejected option (1). |
| Photograph | CDN / Static (`public/`) | Browser (decode) | A pre-sized committed raster served by `next start`'s static handler. Deliberately **not** the CDN-image-optimisation tier — `next/image` needs `sharp` (D-2.5). |
| Security response headers | **Origin server (`next.config.ts` `headers()`)** | — | Not the proxy tier. D-4.1 is explicit and it is correct: `headers()` covers static assets too, which a path-matched proxy would not. |
| Localised 404 status + document | **Proxy tier (`proxy.ts`)** | Server Component (the rewritten page) | The status must be set before the render; only the proxy tier can do that in App Router. The *document* is a normal Server Component. |
| OG card image | Build-time (prerendered route) **or** committed static | — | `ImageResponse` prerenders to a static route at build; the fallback is a committed PNG in `public/`. Never request-time. |
| `sitemap.xml` / `robots.txt` | Build-time (prerendered routes) | — | Verified: both build as `○ (Static)`. |
| Canonical / hreflang / `metadataBase` | Server render (metadata resolution) | — | Resolved against `metadataBase` at render; invisible in dev (PITFALLS #8). |
| The robots flip | **Configuration, in two source files** | Search-engine index (external, slow to reverse) | The only irreversible act in the milestone. The external tier is why the gate is mechanical. |

**Tier misassignments this map exists to prevent:** putting headers in the proxy (loses `/_next/static/*`); putting the 404 status in the page (App Router pages cannot set status); putting email obfuscation in the browser (defeats the requirement); putting the photograph through `next/image` (adds a production runtime dep whose absence 500s).

---

## Standard Stack

### Core — everything already installed; **this phase adds zero npm dependencies**

| Library | Version (verified) | Purpose | Why standard |
|---------|--------------------|---------|--------------|
| `next` | **16.3.3** (`package.json`, `npx next --version`) | Framework; supplies `proxy.ts`, `headers()`, `MetadataRoute`, `next/og` | Already the stack |
| `react` / `react-dom` | 19.2.8 | SSR | Already the stack |
| `next/og` | bundled inside `next` (`node_modules/next/og.js` → `dist/server/og/image-response`) | `ImageResponse` for the OG card and `icon.*` | Ships inside Next; **but see F2 — variable fonts are unusable** |
| `@playwright/test` | ^1.62.1 (devDependency) | Header-delivery assertions, the CSP colour regression, **and rendering the OG card to a committed PNG if the fallback is taken** | Already the stack |
| `node:test` | Node 22.20.0 | `buildCsp()` string unit test | Already the test runner (`npm run test:unit`) |

### Supporting — already present, used differently this phase

| Module | Purpose | When to use |
|--------|---------|-------------|
| `lib/site.ts` | **Already exists** and already reads `process.env.NEXT_PUBLIC_SITE_URL` with the Railway fallback (verified, file read in full) | D-3.4's `siteUrl` half is **done**. The phase adds `siteName` / `siteDescription` and the factory. |
| `lib/content.ts` `publishedFor` | Sitemap enumeration; draft exclusion for free | `app/sitemap.ts`. Verified: a prototype sitemap emitted exactly the two published posts and no drafts. |
| `lib/locales.ts` `indexPath` / `postPath` / `UI` | Sitemap URLs, proxy rewrite targets, localised 404 copy | Do **not** add CV/contact copy here (D-1.5) |
| `components/smear-title.tsx` | The `SmearTitle` server/client boundary | The reserved 404 pages must use it so the trail behaves identically to the boundaries they replace |

### Alternatives Considered

| Instead of | Could use | Tradeoff |
|------------|-----------|----------|
| `proxy.ts` rewrite (CR-01) | `dynamicParams = false` | Moves the 404 to the routing layer, which *does* server-render — but always serves the English global 404 on German URLs. Contradicts `02-UI-SPEC.md`'s Error State row. Re-confirmed still true. |
| `proxy.ts` rewrite | Self-rewrite to the same URL + `{status:404}` | **Measured: does not work.** The page still calls `notFound()`, so the render is still `__next_error__`. Would additionally require deleting both `not-found.tsx` files. |
| `ImageResponse` OG card | Playwright-rendered committed PNG | The only way to get Humane onto the card. Loses per-post cards unless one PNG per post is committed (2 posts today). |
| `ImageResponse` with Humane | `ImageResponse` with a committed **static** Newsreader instance | Keeps generation and per-route correctness; loses Humane. Static instances work (measured with a control static TTF). |
| `app/icon.tsx` (`ImageResponse`) | `app/icon.png` (committed raster) | `icon.tsx` with Humane cannot build. A committed `icon.png` works — verified — but **`app/favicon.ico` must be deleted or two `<link rel="icon">` tags ship.** |
| `style-src 'self' 'unsafe-inline'` | `style-src 'self' 'unsafe-inline'; style-src-elem 'self'` in prod | Measured: **zero inline `<style>` elements** in built HTML across `/`, `/cv` and the case study. So `style-src-elem 'self'` is a free strengthening with a safe fallback in browsers that ignore CSP3 sub-directives. Must stay `'unsafe-inline'` in dev (Turbopack CSS HMR injects `<style>` at runtime). |
| `script-src 'self' 'unsafe-inline'` | …plus `script-src-attr 'none'` | Measured: **zero inline event handlers** (`on*=`) in built HTML. Free strengthening, safe fallback. |

**Installation:** none. `npm install` is not run in this phase.

**Version verification performed:**
```
npx next --version   → Next.js v16.3.3
node -v              → v22.20.0
```

---

## Package Legitimacy Audit

**This phase installs no external packages.** CONTEXT's zero-new-dependency posture (sustained across Phases 1–5) holds: `next/og` ships inside `next`, `MetadataRoute` is a Next type, `proxy.ts` needs only `next/server`, and Playwright is already a devDependency.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| *(none)* | — | — | — | — | — | No installs in this phase |

**Packages removed due to slopcheck [SLOP] verdict:** none — none proposed.
**Packages flagged as suspicious [SUS]:** none.

**If the plan ever reaches for a package** (the two temptations are a front-matter parser for the proxy's allowlist, and a font-subsetting tool for the OG card), it must be gated behind a `checkpoint:human-verify` and the audit re-run. Both temptations have dependency-free answers below.

**One non-package supply-chain note:** if the OG card path requires a committed **Newsreader** font file, it must be a **static instance** (`Newsreader-Regular.ttf` from the `google/fonts` `static/` directory, OFL), not the variable `Newsreader[opsz,wght].ttf`. `next/font/google` writes only `.woff2` to `.next/static/media/` (verified — all twelve Google font files in the build output are `.woff2`), and Satori supports `ttf`/`otf`/`woff` but not `woff2`. A committed font file is a licence-bearing artifact: record the OFL notice alongside it.

---

## What This Phase Must Close — the four carried obligations, answered

### 1. CR-01 — SOLVED AND MEASURED. Use `proxy.ts`, not `middleware.ts`.

#### Baseline re-measured (Next 16.3.3, `next build` + `next start`, curl = no JS)

| path | status | `<html>` | `<h1>` |
|---|---|---|---|
| `/nope` | 404 | `lang="en"` + font classes | `Not found` ← already fixed |
| `/writing/does-not-exist` | 404 | `<html id="__next_error__">` | *(none — empty body)* |
| `/texte/gibt-es-nicht` | 404 | `<html id="__next_error__">` | *(none — empty body)* |

Identical to Phase 2's table. `experimental.globalNotFound` (added in Phase 3, commit `92c29a5` — **after** the Phase 2 measurement) did **not** change it. Re-measuring was necessary and the Phase 2 record stands.

#### The fix, verified working

```
proxy.ts  →  NextResponse.rewrite(url, { status: 404 })  →  a real per-locale 404 page
```

| path | status | `<html lang>` | `<h1>` | back link |
|---|---|---|---|---|
| `/writing/does-not-exist` | **404** | **`en`** | **`Not found`** | `href="/writing"` |
| `/texte/gibt-es-nicht` | **404** | **`de`** | **`Nicht gefunden`** | `href="/texte"` |
| `/writing/the-chart-therefore-changes` | 200 | `en` | *(post title)* | unaffected |
| `/texte/die-darstellung-aendert-sich` | 200 | `de` | *(post title)* | unaffected |
| `/nope` | 404 | `en` | `Not found` | unaffected |

All measured in **server HTML with no JavaScript**. WCAG 3.1.1 Level A closed; the German copy `02-UI-SPEC.md` mandates is preserved.

#### Six things the planner must know, all measured

1. **`middleware.ts` is deprecated in Next 16.3.3.** `next build` prints:
   `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` with a codemod link. `proxy.ts` produces no warning. Next's own upgrade guide: *"The `edge` runtime is **NOT** supported in `proxy`. The `proxy` runtime is `nodejs`, and it cannot be configured."* [CITED: nextjs.org/docs — `01-app/02-guides/upgrading/version-16.mdx`, via Context7] — so **the "Node-runtime" half of the CR-01 disposition is free**; no `runtime` key is needed. (With `middleware.ts` + `export const config = { runtime: "nodejs" }`, `.next/server/functions-config-manifest.json` records `"/_middleware": { "runtime": "nodejs" }` — verified. `proxy.ts` gets the same for nothing.)
2. **The export must be named `proxy` (or default), not `middleware`.**
3. **`NextResponse.rewrite(url, { status: 404 })` genuinely sets the HTTP status.** `MiddlewareResponseInit extends globalThis.ResponseInit` (`node_modules/next/dist/server/web/spec-extension/response.d.ts`), and the status survives to the wire. Verified on both locales.
4. **Next injects `noindex` for any response with status ≥ 400 — including a proxy-set status.** Proof: the reserved German 404 page was given `export const metadata = { robots: { index: true } }`; its **prerendered** HTML carries `content="index"` (`.next/server/app/texte/nicht-gefunden.html`), while the **served** response for the same path carries exactly one `content="noindex"`. So the reserved 404 routes stay `noindex` for free **after** FIND-02 flips the layouts. No extra code.
5. **The reserved routes are self-guarding.** A direct visit to the rewrite target (`/texte/nicht-gefunden`) is itself matched by the proxy's `/texte/:slug` matcher, is not in the published set, and is rewritten to itself with a 404. Measured: 404 + German 404 document. So no crawlable soft-404 URL is created — but it must still be excluded from the sitemap.
6. **It does not de-optimise anything.** `/` still serves `x-nextjs-cache: HIT`, `x-nextjs-prerender: 1`. Build output still shows every route `○ (Static)` / `● (SSG)`. Measured latency: `landing≈1.5ms 404≈2.0ms post≈2.9ms` locally.

#### Two open design choices the planner owns

**(a) The rewrite target.** Verified working: a real static page per locale under the same segment (`app/(en)/writing/<reserved>/page.tsx`, `app/(de)/texte/<reserved>/page.tsx`) that renders the same body as the existing `not-found.tsx`. Extract the shared body into a component so the two `not-found.tsx` files and the two reserved pages cannot drift. **The reserved pages must export their own `metadata.title`** — in the prototype the served 404 carried `<title>Guillem Gelabert</title>` (the layout default), which is a WCAG 2.4.2 regression against what `global-not-found.tsx` achieves. Give them `Not found — Guillem Gelabert` / `Nicht gefunden — Guillem Gelabert`.

**(b) How the proxy learns the published slug set.** This is the one genuinely unresolved sub-problem. Options, measured where measurable:

| Option | Verified | Cost |
|---|---|---|
| `fs.readdirSync(content/)` + a regex for `draft: true` at request time, inside `proxy.ts` | **Works** — measured: correctly admitted `the-chart-therefore-changes`, rejected the draft `fixture`. Next's file tracing even added `content/*.mdx` to `middleware.js.nft.json` automatically. | **Restates the draft rule a second time.** `tests/build/prerender.test.ts`'s own closing forward note warns against exactly this for the sitemap. Needs a unit test binding the two predicates. Also does not filter by `lang`, so `/writing/die-darstellung-aendert-sich` would 200 with German content under an English layout. |
| Read `.next/prerender-manifest.json` at proxy module scope | Not tested | Derived from `generateStaticParams` → `publishedFor`, so **no rule duplication and locale-correct for free**. But it reads a Next internal. |
| Generate a slug manifest at build time (`prebuild` script → committed/ignored JSON) | Not tested | One source of truth, no internals. Adds a build step and a staleness mode. |
| Don't filter at all — proxy every `/writing/:slug`, `fetch()` the origin, rewrite on 404 | Not tested | Double render; loop-guard header needed. Heavy. |

**Recommendation (MEDIUM confidence):** the `fs` scan, **plus** a `node --test` unit test that asserts the proxy's predicate and `publishedFor()` return the same slug set for both locales. That test is what makes the duplication safe, and it is cheap. Note the locale filter is not optional: the proxy must reject a *German* slug on `/writing/` and vice versa, which `slugsOnDisk`-style name-only matching does not do.

#### ⚠️ The premise of the CR-01 disposition is false, and the planner must notice

CONTEXT's carry-in says *"This phase must fix it in the Node-runtime `middleware.ts` **it already builds for security headers**."* **D-4.1 explicitly declines middleware for headers**: *"Not middleware — none exists, and adding one for headers alone buys nothing."* Both decisions are individually correct — headers belong in `headers()` (measured: `headers()` covers `/_next/static/*`, which a path-matched proxy would miss) — but the CR-01 rationale's "it's arriving anyway" is not true. **The proxy exists solely for CR-01.** It is still the right call (it is the only option preserving the German copy) but the planner should record it as a standalone cost, not a free rider, and must not "consolidate" the headers into it.

---

### 2. The robots flip (FIND-02) — eleven gate rows, and one finding that outranks all of them

#### ⚠️ FINDING F3 — `guillemgelabert.com` is already serving this site

Measured 2026-08-31:

```
guillemgelabert.com/           → 200, 17386 bytes
web-production-9cedb…/         → 200, 17386 bytes   (identical)
guillemgelabert.com/cv         → byte-identical to the Railway /cv (diff: no output)
guillemgelabert.com/writing    → 200      /texte → 200      /nope → 404
www.guillemgelabert.com/       → 301 → https://guillemgelabert.com/
```

Response headers on the apex carry `server: cloudflare` **and** `x-railway-edge: zrh1`, `x-hikari-trace: zrh1.1vv1`, `x-powered-by: Next.js` — i.e. Cloudflare fronting the `guillem-edge` Cloudflare-Worker router (`05-RESEARCH.md:741` names it as such), which forwards the apex to **this** Railway service. Every path passes through, including `/robots.txt` and `/sitemap.xml` (both 404 today, identically on both hostnames).

Meanwhile `/`'s canonical is `https://web-production-9cedb.up.railway.app` — verified in the served HTML.

**Consequence:** flipping `robots` to indexable makes the site crawlable on **two** hostnames, both of which declare the Railway hostname canonical. Google honours the canonical and consolidates. The indexed, shareable, search-result URL becomes `web-production-9cedb.up.railway.app` and the good domain is dropped as a duplicate. On a job-hunting site, that is the wrong outcome and it is slow to reverse.

**The fix is one variable, not a cutover.** `lib/site.ts` already reads `NEXT_PUBLIC_SITE_URL`. Setting it to `https://guillemgelabert.com` in the Railway production environment makes every canonical, every hreflang, the sitemap, and the OG image URL absolute against the good domain — **with no code change and no DNS change and no detaching of `guillem-edge`**. D-3.4's stated reason for declining (*"detaching a live domain from a service this milestone does not own"*) does not apply, because nothing is being detached: the apex already resolves here.

**Recommendation (HIGH confidence on the measurement, MEDIUM on the disposition):** the planner should surface this as an explicit decision rather than silently inheriting D-3.4. The three live options:
1. Set `NEXT_PUBLIC_SITE_URL=https://guillemgelabert.com` before the flip. Costs one Railway variable. Requires confirming the apex routing is intended and stable.
2. Keep the Railway canonical and **do not flip** until the domain question is settled.
3. Flip with the Railway canonical and accept that the apex is a duplicate.

Option 3 is the current default and is the worst of the three. **This belongs in the launch gate as a row, whichever way it resolves.**

#### The gate is eleven rows, not ten

`lib/backlog.tsx` (shipped by Phase 5, Plan 01) carries its own tripwire, verbatim from source:

> `COPY_REVIEWED = false` — *"the copy below is DRAFTED from repository evidence and has NOT been reviewed by the author. … **Must not reach Phase 6's FIND-02 robots flip while false.**"*

This is not in CONTEXT's ten-row gate — CONTEXT was written before Phase 5 executed. Together with the two tripwires the Phase 4 launch-gate record carries at "equal weight to HOME-01" (the user's editorial pass over both case studies) and the domain question above, the real gate is:

| # | Gate | Source | Mechanically checked by |
|---|---|---|---|
| G1–G10 | *(as CONTEXT states)* | `06-CONTEXT.md` | *(as CONTEXT states)* |
| **G11** | `COPY_REVIEWED === true` in `lib/backlog.tsx` | Phase 5, `lib/backlog.tsx` | `assert.equal(COPY_REVIEWED, true)` in a `node --test` gate |
| **G12** | The user's editorial pass over both case studies has happened | Phase 4 `launch-gate.md`, D-18 | Not mechanisable — a recorded human sign-off row |
| **G13** | The canonical hostname is the one that should be indexed | **This research (F3)** | `assert` the served canonical's host equals the intended public host |

G12 is the honest odd one out: it cannot be a code assertion. Record it as a checklist row with a date and an initial, exactly as `fact-check.md` did for accuracy.

#### What else must be true before a site goes indexable, and in what order

Ordered by "what breaks if you do it in the wrong order":

1. **Canonical host settled** (F3). Everything downstream bakes it in. Do this first or you re-generate the sitemap and re-fetch every unfurl.
2. **`metadataBase` correct and absolute.** Already correct via `lib/site.ts`; verify it resolves in *production* output, not dev (PITFALLS #8's core warning).
3. **Every route has its own `<title>` and `<description>`.** Currently `/`, `/cv` and `/type` all serve `content="Developer."` — asserted by `prerender.test.ts:331`. That assertion is *correct today* and stays correct when the real sentence lands; but a site indexed with `Developer.` as its description is the FIND-01 failure CONTEXT names. Blocks the flip via G2.
4. **Canonical consistency, including trailing slashes.** ⚠️ **Measured mismatch:** `/`'s canonical renders as `https://web-production-9cedb.up.railway.app` (no trailing slash — Next resolves `alternates.canonical: "/"` to the bare origin) while a `MetadataRoute.Sitemap` entry built with `new URL("/", SITE_URL).toString()` emits `https://web-production-9cedb.up.railway.app/` **with** a slash. Two spellings of the site root. Pick one and assert it in the build tier.
5. **hreflang / `x-default` resolve.** `/writing` and `/texte` already emit `rel="canonical"` and `hreflang="x-default"` (asserted at `prerender.test.ts:203`). `/`, `/cv`, `/type` emit no `languages` at all — correct, since they are English-only, but the audit should say so on the record rather than leave it looking like an omission.
6. **OG image resolves at an absolute URL and actually returns bytes.** G7. And PITFALLS #8's non-negotiable: paste the live URL into Slack.
7. **`robots.txt` and `sitemap.xml` exist and agree.** Verified prototype output below.
8. **Nothing crawlable that should not be.** See F8 (`/type`) and the reserved 404 routes.
9. **Only then flip.**

#### The two source files, and the tests that invert

`robots: { index: false }` appears in exactly two shipped files:

```
app/(en)/layout.tsx:24    robots: { index: false },
app/(de)/layout.tsx:34    robots: { index: false },
```

(Verified by reading both files in full. `app/global-not-found.tsx` deliberately declares none — Next injects it for 4xx, and `prerender.test.ts:245-252` asserts *exactly one*.)

---

### 3. CSP vs TWO inline-style consumers — both confirmed on a real render

Measured against `npm run dev` on the fixture post (`/writing/fixture`, the only surface that has either):

```
style="color:#0E1116"    ×5   ← Shiki token spans        (shikijs/shiki#671)
style="color:#032563"    ×4
style="color:#023B95"    ×3
style="color:#024C1A"    ×2
style="color:#702C00"    ×1
style="text-align:right" ×4   ← remark-gfm table alignment
                        ─────
                         19 inline style attributes
```

Both consumers confirmed present, exactly as `02-05-PLAN.md`'s T-02-24 recorded. `content/fixture.mdx:54` carries `| --- | ---: |`, which is what produces `<th style="text-align:right">` / `<td style="text-align:right">`.

**`buildCsp({dev})` works, verified.** A prototype `headers()` with `source: "/:path*"` delivered the exact D-4.2 policy on:

| surface | CSP delivered? | status |
|---|---|---|
| `/` (prerendered static) | ✅ | 200 |
| `/cv` | ✅ | 200 |
| `/texte/gibt-es-nicht` (proxy-rewritten) | ✅ | 404 |
| `/nope` (global 404) | ✅ | 404 |
| `/_next/static/chunks/*.js` | ✅ | 200 |
| `/opengraph-image-*` | ✅ (`X-Content-Type-Options` confirmed; same rule) | 200 |

The static-asset coverage is the reason `headers()` beats the proxy for BUILD-04, and it is worth stating in the config comment.

**Two free strengthenings CONTEXT did not consider.** Measured across `/`, `/cv` and the case study's built HTML:

```
inline <style> elements : 0   (prod AND dev)
inline style attributes : 0   (on published routes — see below)
inline <script> elements: 4 on /, 2 on /cv   ← the RSC flight payload
inline on*= handlers    : 0
```

So the production policy can add `style-src-elem 'self'` and `script-src-attr 'none'` at zero cost. Browsers that do not implement the CSP3 sub-directives fall back to `style-src` / `script-src`, which already carry `'unsafe-inline'` — a **safe** fallback, not a breakage. In dev, `style-src-elem` must stay `'unsafe-inline'` (Turbopack CSS HMR injects `<style>` at runtime) — which is precisely the split `buildCsp({dev})` exists for. This is optional; if it complicates the unit test, drop it. It is recorded so it is a decision rather than an omission.

#### ⚠️ FINDING F6 — G9 cannot be tested in production, because production has no code blocks

```
content/the-chart-therefore-changes.mdx   fences=0  tables=0  draft: false
content/die-darstellung-aendert-sich.mdx  fences=0  tables=0  draft: false
content/fixture.mdx                       fences=4  tables=5  draft: true
content/musterseite.mdx                   fences=2  tables=4  draft: true
content/nur-auf-deutsch.md                fences=2  tables=0  draft: true
```

**Every code fence and every table on this site lives in a draft.** In a production build they do not prerender at all (`prerender.test.ts:97` asserts exactly that). So G9 — *"Code blocks still render token colour with CSP enforced"* — has no production surface to assert against.

The `<pre>` in the built case-study HTML: zero. Inline style attributes in built HTML: zero.

**Recommendation:** satisfy G9 as a **three-part** proof rather than one impossible one:
1. Playwright, dev tier, against `/writing/fixture`: `span[style*='color']` inside `<pre>` still has a non-default computed colour, **with the dev CSP header delivered** (`headers()` applies in `next dev` — confirmed by the same config path). This is the real browser-enforcement proof.
2. `node --test` on `buildCsp()`: assert `buildCsp({dev:false})` and `buildCsp({dev:true})` carry **identical `style-src` token sets**. That is what transfers (1)'s result to production.
3. Post-deploy `curl` recording the production CSP string verbatim in the phase's verification document (D-4.3 already requires this).

Do **not** publish a code-bearing post just to satisfy the gate — that is content scope, and D-19's editorial-pass debt is already outstanding.

---

### 4. The photograph and CLS — the UI-SPEC's reason is wrong; do not build a `ResizeObserver`

**`documentTop` is gauge-invariant. Confirmed by reading the shipped code**, not by trusting the note:

```
smear-heading-provider.tsx:271   lagY    = documentTop - window.scrollY     (at register)
smear-heading-provider.tsx:137   targetY = state.documentTop - scrollY      (each frame)
smear-heading-provider.tsx:110   difference = lagY - targetY                (what draw() consumes)
smear-heading-provider.tsx:145   distance   = |lagY - targetY|              (the settle test)
```

`documentTop` enters only as `lagY − targetY`, where it cancels: shifting it by Δ shifts both terms by Δ. `draw()` never sees an absolute document offset. A stale `documentTop` therefore does **not** desync the trail. `03-UI-SPEC.md:232`'s forward note naming PROF-02 is wrong on its stated reason; `03-RESEARCH.md`'s correction (recorded in `03-work-list-landing-skeleton/deferred-items.md` §5(i)) is right.

**Do not put a `ResizeObserver` into `components/smear-heading/`.** It would be unmeasured complexity solving a problem measurement shows does not exist. D-2.6's *requirement* (reserve the space) stands; only its *justification* changes — it is BUILD-06/CLS, and the belt-and-braces "portrait sits below the `<h1>`" makes even the CLS case a non-event for the trail.

**The CLS-safe approach, given `next/image` is deliberately unused.** Verified in `node_modules/tailwindcss/preflight.css`:

```css
/* :230-234 */  img, video { max-width: 100%; height: auto; }
```

With Tailwind v4 preflight active, an `<img width="W" height="H">` gets an implicit `aspect-ratio: W / H` and `height: auto`, so the browser reserves the correct box **before the bytes arrive**. `components/mdx/figure.tsx` already relies on this and says so at `:10-16`. That is the whole mechanism — no extra CSS is strictly required, and D-2.6's explicit container `aspect-ratio` is belt-and-braces on top of it.

**Two gotchas the plan should pre-empt:**

- **Flex stretch.** `/cv`'s `<main>` is `flex flex-col`, whose default `align-items: stretch` stretches a replaced element's *width* to the container. Dropped into that container the portrait would balloon to the full page width and `height:auto` would follow. Give it `self-start` **and** an explicit rendered width (a `w-[…]` utility or a wrapper), not just intrinsic attributes.
- **The budget gates do not read JSX.** `tests/unit/prose-contract.test.ts` (m)/(n) enforce four sizes / two weights / no literal colours **over `app/globals.css` only**. An arbitrary Tailwind value in a `.tsx` file (`text-[20px]`, `font-[700]`, `bg-[#eee]`) passes every gate silently. The design-system roll-call in D-4.4 §3 must grep the JSX, not just re-run the unit tests.

**LCP.** The portrait is on `/cv`, not `/`, so PITFALLS #14's LCP half is already handled by D-2.4's placement. Keep `loading="lazy"` only if the image is genuinely below the fold at 375px; on `/cv` the `<h1>` + back link occupy roughly 200px, so at 375×667 the portrait very likely *is* the LCP element and `loading="lazy"` will hurt it. **Recommendation:** `loading="eager"` + `fetchPriority="high"` on the portrait (both are plain HTML attributes, no dependency), and measure LCP once. This diverges from `figure.tsx`'s content-image precedent for a good reason: content figures are always below a standfirst and meta line; the portrait is not.

---

## Specific Questions — answered

### Q1. What metadata does `app/(en)/page.tsx` emit now, and what does FIND-01 still need?

`app/(en)/page.tsx` is a Server Component (Phase 3 de-cliented it; `tests/unit/link-contract.test.ts:268` asserts the source fact). It exports:

```ts
export const metadata: Metadata = {
  title: "Guillem Gelabert",
  description: POSITIONING_PLACEHOLDER,   // "Developer."
  alternates: { canonical: "/" },
};
```

**Complete `<head>` of `/` in the production build, measured:**

| Emitted today | Value |
|---|---|
| `<title>` | `Guillem Gelabert` |
| `<meta name="description">` | `Developer.` ← FIND-01 failure |
| `<meta name="robots">` | `noindex` (inherited from the layout) |
| `<link rel="canonical">` | `https://web-production-9cedb.up.railway.app` — **no trailing slash** |
| `<link rel="icon">` | `/favicon.ico?favicon.…` — the Next scaffold mark |
| font preloads ×4, stylesheet ×1 | correct |

**Absent, and needed for FIND-01:** `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale`, `twitter:*`. All of them. `/` currently unfurls as a bare link with no card at all.

**Measured for free once `opengraph-image.tsx` exists** (prototype, verified): `og:title`, `og:image`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:card=summary_large_image`, `twitter:title`, `twitter:image`, `twitter:image:alt`, `twitter:image:type`, `twitter:image:width`, `twitter:image:height` — thirteen tags, from the file convention alone.

⚠️ **Therefore D-3.1's "root metadata also gains `twitter: { card: 'summary_large_image' }`" is redundant** when an `opengraph-image` file exists. Declaring it is harmless but the planner should know it is not load-bearing.

**Still needs explicit declaration:** `og:description` (comes from `metadata.description` — currently `Developer.`), `og:url` (Next does *not* emit it from `alternates.canonical`), `og:type: "website"`, `og:site_name`, `og:locale` (`en_GB` / `de_DE`).

**The OG image route path carries a build hash:** `/opengraph-image-35z9bs?1d7b3ec36efef8be`. Not stable across builds — **never hardcode it in a test**; parse `meta[property="og:image"]` and fetch that.

---

### Q2. `NEXT_PUBLIC_SITE_URL` shape, and the domain cutover

**Shape — already shipped** (`lib/site.ts`, read in full):

```ts
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-production-9cedb.up.railway.app",
);
```

Both root layouts import it for `metadataBase` (verified in both files). It is a `URL`, not a string — so sitemap/robots code should use `new URL(path, SITE_URL).toString()` rather than string concatenation.

⚠️ **`NEXT_PUBLIC_*` is inlined at build time, not read at runtime.** Setting the Railway variable therefore requires a **rebuild**, not a restart. On Railway a variable change triggers a redeploy, so this works — but a plan step that says "set the variable and verify the canonical" must wait for the redeploy, and the verification must be a `curl` of the live canonical, not an assumption.

**A domain cutover would take:** setting `NEXT_PUBLIC_SITE_URL` (one Railway variable), redeploying, and DNS/edge-router work. Zero code changes. D-3.4 is correct that the code is ready.

**Is `guillemgelabert.com` still attached to `guillem-edge`? — Verified, with a large caveat.** The Phase 1 record (`01-CONTEXT.md:227`, service id `fc6f7663-…`) and `05-RESEARCH.md:741` (which identifies `guillem-edge` as *"Cloudflare Worker edge router — infrastructure"*) still describe the setup accurately: the domain is not attached to the `web` service. `railway status` for the linked `web` service lists only `https://web-production-9cedb.up.railway.app` — no custom domain. **But the apex nevertheless resolves to this application** (F3): the edge router forwards it. So D-3.4's *factual* premise holds (the domain is not on this service) while its *practical* conclusion — that the site is not reachable on the good domain — does not. See F3 above; this is the most consequential correction in this document.

*(Note: `railway domain` with no arguments **creates** a domain. It was deliberately not run. The apex finding is from DNS + HTTP measurement only.)*

---

### Q3. OG images via `ImageResponse` — verified, and it does not work as designed

**`ImageResponse` itself works.** A prototype `app/(en)/opengraph-image.tsx` with no custom font built cleanly and prerendered as `○ /opengraph-image-35z9bs` (static, zero request-time cost), served `200 image/png`, and wired thirteen head tags automatically. Route-group placement works: a file in `app/(en)/` covers `/`, `/cv`, `/writing` and `/type` by segment inheritance, exactly as D-3.2 assumes.

#### ⚠️ FINDING F2 — Satori in Next 16.3.3 cannot load **any** variable font

```
Error occurred prerendering page "/opengraph-image-35z9bs"
TypeError: Cannot read properties of undefined (reading '256')
Export encountered an error … exiting the build.
```

`next build` **fails outright** — this is not a degraded card, it is a broken build. Root cause pinned to the exact frame:

```
at parseFvarAxis   (next/dist/compiled/@vercel/og/index.node.js:11887:20)
at parseFvarTable  (…:11917:7)
at parseBuffer     (…:12957:29)
at addFonts        (…:19754:37)
```

```js
// index.node.js:11887 — the bundled opentype.js fork
axis.name = names[p.parseUShort()] || {};   // `names` is undefined
```

`fvar` is the variable-font axis table. Reproduced on **three** unrelated variable TTFs:

| font | result |
|---|---|
| `app/fonts/Humane-VF.ttf` (18 tables, `fvar` + `gvar` + `HVAR` + `STAT`) | `TypeError … reading '256'` |
| `/System/Library/Fonts/NewYork.ttf` | `TypeError … reading '258'` |
| `/System/Library/Fonts/SFNSMono.ttf` | `TypeError … reading '258'` |
| a **static** control TTF (Andale Mono) | **OK** — builds and renders |
| no custom font (Satori's bundled Geist) | **OK** |

This is a general defect in the bundled parser, not a Humane quirk. Humane's licence forbids modification (Phase 1 D-01), so instancing it to a static TTF is not available.

**Consequences the planner must act on, not discover:**

1. **D-3.2 as written ("the name in Humane") cannot ship via `ImageResponse`.** CONTEXT's risk (b) — *"Satori renders a variable font at its default instance, so Humane will not come out at 530"* — understates it by a wide margin. It does not render at the wrong weight; it does not render at all, and it takes the build with it.
2. **D-3.5 as written (`app/icon.tsx`, a `G` in Humane) cannot ship either.** CONTEXT records no fallback for the favicon. The planner must add one: **`app/icon.png`, a committed raster.** Verified working — but ⚠️ **`app/icon.png` and `app/favicon.ico` coexist and emit two `<link rel="icon">` tags**, so `app/favicon.ico` must be *deleted*, not merely superseded.
3. **CONTEXT's risk (a) is also worse than stated.** Newsreader has no local file — but committing the Google Fonts **variable** `Newsreader[opsz,wght].ttf` would hit the same crash. If a committed Newsreader is used, it must be a **static instance** from `google/fonts`' `static/` directory. (`next/font/google` writes only `.woff2`, which Satori also cannot read — all twelve font files in `.next/static/media/` are `.woff2`, verified.)

**Recommendation (HIGH confidence):** take **CONTEXT's own documented fallback** — render the card once with Playwright at 1200×630 and commit the PNG. It is the only path that keeps Humane, it needs no new dependency (Playwright is already a devDependency), and it turns a build-breaking risk into a build-time-zero asset. Cost: per-post cards become per-post committed PNGs (2 posts today; the site-wide card covers everything else via `app/(en)/opengraph-image.png` / `app/(de)/opengraph-image.png`, which is the same file convention and needs no code at all).

**Second-best (if generation is worth more than Humane):** `ImageResponse` with a committed **static Newsreader**, the name set in Newsreader rather than Humane, ink on paper, one rule. Keeps per-route correctness. This is a real design decision — CONTEXT gave the card's grammar as "the site's own", and the site's own display face is Humane.

**What the card costs either way:** the `ImageResponse` route prerenders at build (`○ (Static)`), served with `cache-control: public, max-age=0, must-revalidate`. No runtime cost on Railway. A committed PNG costs even less.

---

### Q4. Every assertion in `tests/build/prerender.test.ts` that must invert, by line number

Read against the current file (**note: the line numbers in CONTEXT are stale — `:128` is now `:154`**; Phase 4 and Phase 5 both grew this file).

#### Must invert with the FIND-02 flip, in the same commit

| Line | Test (line no.) | Assertion today | After the flip |
|---|---|---|---|
| **159** | `robots noindex survived the two-root-layout split` (**154**) | `assert.match(writing, /name="robots"…noindex…/)` | Invert to `assert.doesNotMatch(…)`, or assert `content="index"` positively |
| **160** | same | `assert.match(texte, /…noindex…/)` | same |
| **396-400** | `the inherited noindex reaches both new surfaces` (**387**) | loop over `["", "cv"]`, `assert.match(html, /…noindex…/i)` | Invert. **Add `"type"` to the loop** — see F8 |

Rename both test titles in the same commit. A test named *"noindex survived"* that asserts the opposite is worse than no test.

#### Must **NOT** invert — verified

| Line | Test | Why it stays |
|---|---|---|
| **250-252** | `/_not-found must carry exactly one noindex robots meta` | Next injects `noindex` for any status ≥ 400, including proxy-set statuses. **Measured.** `global-not-found.tsx` declares none by design. Unchanged by the flip. |
| **331** | `every (en) route's meta description is bound to POSITIONING_PLACEHOLDER by equality` | Compares against the imported constant, so it keeps passing when the real sentence lands. This is the tripwire's gate — leave it alone. |
| **268-296** (`link-contract.test.ts`) | `app/(en)/page.tsx … declares no robots of its own` | Stays true; the flip touches only the two layouts. |

#### Must change for the CONTACT stub (independent of the flip)

| Line | Test (line no.) | Change |
|---|---|---|
| **488** | `the backlog and contact stubs ship their real … copy` (**478**) | Remove `"No contact details here yet."` from the `for` loop |
| **489** | same | Remove `"Email, GitHub and LinkedIn are being added."` |
| **540** | `launch gate: the backlog stub and the contact stub are still interim` (**517**) | Remove `assert.ok(root.includes("No contact details here yet."))`. **When both halves are gone the test is empty — retitle and repurpose it as the positive launch-gate assertion, do not delete it.** Its whole design is that ending an interim state forces someone to look at it. |

#### Must change for the CV body (Playwright tier)

`tests/cv.spec.ts` — note the Phase 4 launch-gate record's claim that *"/cv's interim body is asserted separately by tests/cv.spec.ts"* is **wrong**: the file asserts a 200, exactly one `<h1>` reading `CV`, the Humane stack, the back link, the 24px target floor, and the absence of six marker words. It never asserts `"The CV is being written up as a page."`. So:
- ⚠️ **`tests/cv.spec.ts:20-23` asserts `toHaveCount(1)` on `h1`.** The CV's sections must be `<h2>`, never a second `<h1>`.
- The marker-word ban at `:60-71` (`"todo"`, `"placeholder"`, `"coming soon"`, `"under construction"`, `"lorem"`, `"tbd"`) constrains the real CV copy too, and constrains the `[USER-SUPPLIED]`-absent state: the stub that renders when `experience` is empty must not contain any of them. The shipped stub (`"The CV is being written up as a page."`) already passes.

#### Must change for CR-01

`tests/writing-not-found.spec.ts` — the file ends with a 14-line **"KNOWN GAP (code review CR-01), deliberately not asserted here"** comment block. When the proxy lands:
- Replace that block with the measured resolution.
- Add `javaScriptEnabled: false` variants of the two `LOCALE_CASES` tests, asserting status 404, `documentElement.lang` (`en` / `de`), a non-empty `title`, the localised `<h1>`, and the localised back-link href — the same shape the `UNMATCHED_PATHS` loop already uses.
- Add a case for a direct hit on the reserved rewrite target (404, not 200).
- Add a **cross-locale** case: `/writing/die-darstellung-aendert-sich` and `/texte/the-chart-therefore-changes` must both 404, in the right language. This is what catches a slug allowlist that forgot the locale filter.

#### Current suite state — measured, and one thing to know

```
npm run test:unit    102 / 102 pass
npm run test:build    19 /  21 pass   ← 2 failures
npm run lint          1 error (the known deferred use-prefers-reduced-motion.ts:23)
```

The two build-tier failures are at `prerender.test.ts:491` and `:539`, both `"Nothing listed here yet."` — **they belong to Phase 5's outstanding Plan 05-04**, not to Phase 6. Phase 6 must not "fix" them; it must wait for 05-04 and then edit the *contact* half of the same two tests. (The unit count is 102, not the 88 in the phase brief — Phase 5 added 14.)

⚠️ **A build-tier trap worth one line in the plan.** `next start` writes on-demand-rendered dynamic responses **into `.next/server/app/`** — after curling `/writing/does-not-exist` once, `.next/server/app/writing/does-not-exist.html` exists on disk. `walkHtmlRoutes` walks that directory, so running `next start` (or Playwright against a production server) before `npm run test:build` pollutes the route map and can trip the draft-route assertion at `:97`. `rm -rf .next && npm run build` before `test:build` — which `npm run test:all` already does — is load-bearing, not hygiene.

---

### Q5. See `## Validation Architecture` below.

---

## Architecture Patterns

### System Architecture Diagram

```
                        ┌─────────────────────────────────────────┐
   visitor / crawler ──▶│ Cloudflare (guillemgelabert.com)        │──┐
   Slack unfurler       │  → guillem-edge Worker → Railway `web`   │  │  MEASURED F3:
                        └─────────────────────────────────────────┘  │  both hostnames
   visitor / crawler ──────────────────────────────────────────────┐ │  reach the same
   (web-production-9cedb.up.railway.app)                           │ │  origin, byte-
                                                                   ▼ ▼  identically
                        ┌───────────────────────────────────────────────────┐
                        │  Railway `web` service — `next start`             │
                        └───────────────────────────────────────────────────┘
                                             │
                    ┌────────────────────────┴────────────────────────┐
                    ▼                                                 ▼
        ┌───────────────────────┐                        ┌────────────────────────┐
        │ next.config headers() │  ← BUILD-04            │  proxy.ts  (nodejs)    │  ← CR-01
        │ applies to EVERY      │    CSP/HSTS/nosniff/   │  matcher:              │
        │ response incl.        │    Referrer/Perms/COOP │   /writing/:slug       │
        │ /_next/static/*       │                        │   /texte/:slug         │
        └───────────┬───────────┘                        └───────────┬────────────┘
                    │                                                │
                    │                          slug in published set?│
                    │                          ┌─────────yes─────────┴──────no─────────┐
                    │                          ▼                                       ▼
                    │              NextResponse.next()            NextResponse.rewrite(
                    │                                               /writing/<reserved> |
                    │                                               /texte/<reserved>,
                    │                                               { status: 404 })
                    │                          │                                       │
                    ▼                          ▼                                       ▼
   ┌────────────────────────────────────────────────────────────────────────────────────┐
   │  App Router render                                                                 │
   │                                                                                    │
   │  (en) layout ── metadata factory ──┐                                               │
   │  (de) layout ── metadata factory ──┤── lib/site.ts  (SITE_URL ← NEXT_PUBLIC_…)     │
   │                                    │                                               │
   │   / ──── SmearTitle + ContentsNav + FeaturedSlot + WorkList + BacklogList          │
   │          + ContactBlock ◀──────────┐                                               │
   │   /cv ── SmearTitle + Portrait(img) + CvSections ◀── lib/cv.ts   [USER-SUPPLIED]   │
   │          + ContactBlock ◀──────────┴── lib/contact.ts            [USER-SUPPLIED]   │
   │   /writing /texte /…/[slug]  (unchanged)                                           │
   │   /type  ⚠ Client Component — cannot declare robots (F8)                           │
   │   /writing/<reserved> /texte/<reserved> ── localised 404 body (shared component)   │
   │   global-not-found ── unchanged                                                    │
   └───────────────────────────────┬────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┬───────────────────────┐
        ▼                          ▼                          ▼                       ▼
   app/sitemap.ts            app/robots.ts        opengraph-image (per group   app/icon.png
   ← publishedFor()          ← SITE_URL           + per [slug] override)       (favicon.ico
     (drafts excluded          Disallow /type     ← Playwright-committed PNG    DELETED)
      for free)                                     or ImageResponse+static font
```

Read the primary use case by following arrows: a crawler hits either hostname → one Railway origin → `headers()` stamps every response → `proxy.ts` decides published-vs-404 for post URLs only → App Router renders → the four metadata routes are ordinary prerendered static routes hanging off the same content module.

### Recommended Project Structure

```
proxy.ts                                  # NEW — CR-01. Root, beside app/. NOT middleware.ts
next.config.ts                            # + headers()  (experimental.globalNotFound stays)
lib/
├── site.ts                               # EXISTS — extend with siteName / siteDescription
├── metadata.ts                           # NEW — the factory both root layouts call (D-3.1)
├── csp.ts                                # NEW — buildCsp({ dev }); pure; node --test'd (D-4.3)
├── cv.ts                                 # NEW — experience[] education[] languages[] selectedWork[]
├── contact.ts                            # NEW — email | null, github, linkedin | null
├── content.ts  locales.ts  work.ts  backlog.tsx   # unchanged
components/
├── contact-block.tsx                     # NEW — ONE component, rendered on / and /cv
├── cv/                                   # NEW — section + row components, work-list row rhythm
├── portrait.tsx                          # NEW — plain <img>, self-start, explicit w/h
├── not-found-body.tsx                    # NEW — shared by both not-found.tsx AND both reserved pages
app/
├── sitemap.ts   robots.ts   icon.png     # NEW.  favicon.ico DELETED
├── (en)/opengraph-image.(tsx|png)        # NEW
├── (de)/opengraph-image.(tsx|png)        # NEW
├── (en)/writing/<reserved>/page.tsx      # NEW — proxy rewrite target, EN
├── (de)/texte/<reserved>/page.tsx        # NEW — proxy rewrite target, DE
├── (en)/type/page.tsx                    # de-client (F8) so it can declare robots: { index: false }
public/
├── <portrait>.<ext>                      # NEW  [USER-SUPPLIED]
├── file.svg globe.svg next.svg vercel.svg window.svg   # DELETE (scaffold)
```

### Pattern 1: The proxy rewrite (CR-01)

```ts
// proxy.ts — Next 16 file convention. `middleware.ts` is deprecated and warns at build.
// The runtime is nodejs and cannot be configured. [CITED: nextjs.org version-16 upgrade guide]
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  // One segment only. /writing/a/b matches no route and correctly falls through
  // to the global 404. Next expands this to also cover the .rsc / .segments
  // variants, so client-side navigations are intercepted too (verified in
  // .next/server/functions-config-manifest.json).
  matcher: ["/writing/:slug", "/texte/:slug"],
};

export function proxy(request: NextRequest) {
  const [segment, slug = ""] = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = segment === "texte" ? "de" : "en";

  if (isPublished(locale, slug)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = NOT_FOUND_PATH[locale];
  // The status is the entire point. Verified: it reaches the wire, AND Next
  // injects <meta name="robots" content="noindex"> because it is >= 400 —
  // so these pages stay unindexed after FIND-02 with no extra code.
  return NextResponse.rewrite(url, { status: 404 });
}
```

**Anti-pattern:** `NextResponse.rewrite(request.nextUrl, { status: 404 })` (self-rewrite). Measured: still `__next_error__`, because the page still throws `notFound()`.

### Pattern 2: Email obfuscation that actually produces entities

```tsx
// React SSR escapes `&` in BOTH text nodes and attribute values. Measured:
//   <span>{"name&#64;example.com"}</span>  →  <span>name&amp;#64;example.com</span>
//   <a href={"mailto:name&#64;…"}>          →  href="mailto:name&amp;#64;…"
// dangerouslySetInnerHTML is the ONLY way to get entities into the emitted bytes.
//
// Safe here and only here: EMAIL is a module constant from lib/contact.ts.
// There is no user input anywhere on this site. Assert that in the comment
// and assert it in a test — never let this pattern spread.
const entityEncode = (s: string) =>
  s.replace(/@/g, "&#64;").replace(/\./g, "&#46;");

export function EmailLink({ address }: { address: string }) {
  const enc = entityEncode(address);
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `<a class="link-quiet" href="mailto:${enc}">${enc}</a>`,
      }}
    />
  );
}
// Measured output:
//   <span><a class="link-quiet" href="mailto:name&#64;example&#46;com">name&#64;example&#46;com</a></span>
// The browser decodes at parse time, so href → mailto:name@example.com and
// textContent → name@example.com. D-2.3's Playwright assertion passes.
```

**If `dangerouslySetInnerHTML` is judged unacceptable**, the honest alternative is `name [at] example [dot] com` as ordinary selectable text plus a `mailto:` href assembled from parts — PITFALLS #5's *first* suggestion, equally screen-reader-safe, and it needs no dangerous escape. It costs one click of convenience. This is a real fork the planner should decide rather than default into.

### Pattern 3: Absent channels render as absence

```tsx
// components/language-switch.tsx's shipped pattern: return null, never a
// disabled control. "A dead affordance is worse than no affordance."
export function ContactBlock() {
  const channels = [
    CONTACT.email    && { label: "Email",    node: <EmailLink address={CONTACT.email} /> },
    CONTACT.github   && { label: "GitHub",   node: <a className="link-quiet" href={CONTACT.github}>{hostOf(CONTACT.github)}</a> },
    CONTACT.linkedin && { label: "LinkedIn", node: <a className="link-quiet" href={CONTACT.linkedin}>{hostOf(CONTACT.linkedin)}</a> },
  ].filter(Boolean);
  if (channels.length === 0) return null;   // and the section renders its stub instead
  …
}
```

### Pattern 4: The sitemap reads the content module — verified output

```ts
// app/sitemap.ts — prototyped and built; drafts excluded for free.
import type { MetadataRoute } from "next";
import { publishedFor } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { indexPath, postPath } from "@/lib/locales";

const abs = (p: string) => new URL(p, SITE_URL).toString();
```

Verified emitted `sitemap.xml` (6 entries, both drafts and all three fixtures absent):

```xml
<loc>https://web-production-9cedb.up.railway.app/</loc>
<loc>…/cv</loc>  <loc>…/writing</loc>  <loc>…/texte</loc>
<loc>…/writing/the-chart-therefore-changes</loc>
<loc>…/texte/die-darstellung-aendert-sich</loc>
```

Verified emitted `robots.txt`:

```
User-Agent: *
Allow: /
Disallow: /type

Sitemap: https://web-production-9cedb.up.railway.app/sitemap.xml
```

`prerender.test.ts`'s closing forward note is binding: **the sitemap must call `publishedFor()`, not re-derive the draft rule.** Also exclude both reserved 404 routes.

### Anti-Patterns to Avoid

- **`middleware.ts`** — deprecated in 16.3.3, warns on every build.
- **A `ResizeObserver` in `components/smear-heading/`** — solves a non-existent problem (gauge invariance).
- **Consolidating headers into the proxy** — loses `/_next/static/*`; `headers()` covers it (measured).
- **Hardcoding the OG image path in a test** — it carries a per-build hash.
- **Adding CV/contact strings to `UI` in `lib/locales.ts`** — `Record<Locale, UiCopy>` forces German translations into existence (D-1.5).
- **A second `<h1>` on `/cv`** — `tests/cv.spec.ts` asserts exactly one.
- **`<strong>` outside `.prose-site`** — Tailwind preflight `b, strong { font-weight: bolder }` (`preflight.css:102-105`) resolves to **700**, a third weight, invisible to the source-level budget gates.
- **Arbitrary Tailwind values in JSX** (`text-[20px]`, `bg-[#eee]`) — invisible to the CSS budget gates, which read `app/globals.css` only.
- **Shipping `app/icon.png` without deleting `app/favicon.ico`** — two `<link rel="icon">` tags (measured).

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Setting a 404 status on a rendered page | A custom error component, a `notFound()` wrapper, a route handler emitting HTML | `proxy.ts` + `NextResponse.rewrite(url, { status: 404 })` | App Router pages cannot set a status. The proxy tier is the only place. Verified. |
| Keeping the localised 404 copy in two shapes | Duplicating the JSX between `not-found.tsx` and the reserved page | One `NotFoundBody` component imported by all four files | Four copies of two locales is how the German drifts |
| Draft exclusion in the sitemap | Re-reading front-matter and re-deriving `draft !== true` | `publishedFor()` from `lib/content.ts` | `prerender.test.ts`'s own forward note requires it |
| OG image | A hand-cropped screenshot; an inline `<svg>` string | `ImageResponse` with a static font, **or** Playwright-rendered committed PNG | Both are already in the toolchain; F2 rules out variable fonts |
| Favicon | A hand-built `.ico`; an `ImageResponse` `icon.tsx` in Humane | `app/icon.png` (committed) + delete `favicon.ico` | `icon.tsx` in Humane cannot build (F2) |
| Reserving image space | `ResizeObserver`, a JS aspect-ratio shim, a fixed-height wrapper with `overflow:hidden` | `width`/`height` attributes; Tailwind preflight supplies `height:auto` | `preflight.css:230-234`, verified |
| Email entities | A build script that post-processes HTML; a client-side decoder | `dangerouslySetInnerHTML` with a module constant, **or** `[at]`/`[dot]` plain text | React escapes `&` everywhere else. Measured. |
| Absolute URL building | String concatenation with the origin | `new URL(path, SITE_URL)` | `SITE_URL` is a `URL`; concatenation is how the trailing-slash mismatch happens |
| CSP correctness | Believing the config | `buildCsp({dev})` unit-tested + Playwright delivery + post-deploy `curl` | D-4.3; and *"believing the config is not verification"* |
| Twitter card tags | Hand-declaring `twitter:*` | The `opengraph-image` file convention | It emits `twitter:card=summary_large_image` and six more tags for free (measured) |

**Key insight:** almost every capability this phase needs already exists inside Next 16 as a file convention (`proxy.ts`, `sitemap.ts`, `robots.ts`, `opengraph-image.*`, `icon.*`, `headers()`). The two places where hand-rolling is genuinely required — the proxy's published-slug predicate, and email entity encoding — are exactly the two places where the framework offers nothing, and both need a test binding them to their single source of truth.

---

## Runtime State Inventory

*Not a rename phase, but this is the milestone's only phase that changes state living outside the repository. Every category is answered explicitly.*

| Category | Items found | Action required |
|---|---|---|
| **Stored data** | None. No database, no KV, no cache with site-specific keys. Next's own on-disk render cache in `.next/` is rebuilt every deploy. | None — verified by absence of any datastore in `package.json` and `next.config.ts` |
| **Live service config** | **(a)** Railway `web` service, project `guillem-web` (`f6be1197-…`), service `1ee326d6-…` — **no variables set today**; `NEXT_PUBLIC_SITE_URL` must be added there and it is build-time-inlined, so it needs a redeploy. **(b)** The `guillem-edge` Cloudflare Worker router (`fc6f7663-…`, a different repo) currently forwards `guillemgelabert.com` and `www.` to this app — **config lives in that repo/Cloudflare, not here, and this milestone must not change it.** | (a) set one variable + redeploy + `curl` the canonical. (b) **no action; record only** — but its behaviour is what makes F3 true |
| **OS-registered state** | None. No cron, no scheduler, no daemon. | None |
| **Secrets / env vars** | `.env` at the repo root holds `CLOUDFLARE_API_TOKEN`. **Gitignored** (`.gitignore:1`) and **untracked** (`git ls-files .env` → not found), so it is not committed. It is *not* `NEXT_PUBLIC_`-prefixed, so it is not inlined into the client bundle. `next build` prints `- Environments: .env`, i.e. it is loaded at build time. | **No action, and do not add `NEXT_PUBLIC_SITE_URL` to this file** — a local `.env` value would silently override the Railway one during any local build and bake the wrong canonical into a test |
| **Build artifacts** | `next-env.d.ts` **flips between `./.next/dev/types/…` and `./.next/types/…` depending on whether the last command was `next dev` or `next build`** — measured; it shows up as a dirty tracked file. Harmless churn, but it will appear in `git status` mid-phase. | Note it; do not commit the flip, and do not "fix" it |
| **External / irreversible** | **The search index.** Once `robots` flips and a crawl lands, de-indexing is slow. Combined with F3, the specific irreversible risk is the wrong hostname becoming the consolidated canonical. | This is why the gate is mechanical, and why F3 must be settled *before* the flip, not after |

**The canonical question for this phase:** after every file in the repo is correct, what still holds the old state? Answer: the Railway environment (one variable, unset), the edge router (not ours), and — the moment the flip lands — Google's index.

---

## Common Pitfalls

### Pitfall 1: `middleware.ts` instead of `proxy.ts`
**What goes wrong:** every `next build` prints a deprecation warning, and the codemod is one release away from being mandatory.
**Why it happens:** CONTEXT says "middleware.ts" three times, and it is the name everyone knows.
**How to avoid:** `proxy.ts`, export named `proxy`. No `runtime` key — the runtime is nodejs and is not configurable.
**Warning signs:** `⚠ The "middleware" file convention is deprecated` in build output.

### Pitfall 2: assuming `ImageResponse` can render the site's display face
**What goes wrong:** `next build` fails with `TypeError: Cannot read properties of undefined (reading '256')` and the whole deploy is red.
**Why it happens:** CONTEXT frames it as a rendering-quality risk ("won't come out at 530"). It is a build-breaking parse failure, and it affects **every** variable font, not just Humane.
**How to avoid:** static instances only, or the Playwright-committed-PNG fallback. Whichever path is taken, **build once and look at the artifact** before wiring the per-post overrides.
**Warning signs:** the string `parseFvarAxis` anywhere in a stack trace.

### Pitfall 3: entity-encoded email that ships as `&amp;#64;`
**What goes wrong:** the served bytes contain `name&amp;#64;example&amp;#46;com`, the page *displays* `name&#64;example&#46;com` as literal text, the `mailto:` is broken, and the obfuscation is worse than useless.
**Why it happens:** React escapes `&` in text nodes and attribute values. JSX also decodes literal entities in *source* at compile time, so writing `&#64;` directly in JSX gives you a plain `@`. Both paths fail; neither fails loudly.
**How to avoid:** `dangerouslySetInnerHTML`, or drop entities for `[at]`/`[dot]`. Assert the **served bytes** in a build-tier test (`assert.ok(html.includes("&#64;")); assert.equal(html.includes("@example"), false)`) — a Playwright `textContent` check reads the *decoded* DOM and passes either way.
**Warning signs:** the literal `&amp;#` in `view-source`.

### Pitfall 4: the CSP ships and every code block turns black
**What goes wrong:** `style-src 'self'` blocks inline style *attributes* under CSP Level 2+, and Shiki puts one on every token span.
**Why it happens:** the two consumers are invisible on every published route (F6) — the only surface that has them is a draft.
**How to avoid:** `'unsafe-inline'` in `style-src`, and run the dev-tier Playwright colour assertion **with the CSP header actually being delivered** (`headers()` applies in `next dev`).
**Warning signs:** `Refused to apply inline style because it violates the following Content Security Policy directive` in the console; monochrome `<pre>`.

### Pitfall 5: fixing Shiki and thinking `style-src` can tighten
**What goes wrong:** a rehype transformer moves Shiki's token colours to classes, `style-src 'self'` ships, and every right-aligned table cell silently loses its alignment.
**Why it happens:** the second consumer (`remark-gfm`, `style="text-align:right"`, measured ×4 on the fixture) is easy to forget.
**How to avoid:** treat "two consumers" as the fact it is. `style-src` cannot tighten without fixing both, and the second one is upstream in `remark-gfm`.

### Pitfall 6: `/type` becomes indexable at the meta level after the flip
**What goes wrong:** `app/(en)/type/page.tsx` is `"use client"` (verified, line 1), so it **cannot export `metadata`** and cannot declare `robots: { index: false }`. It inherits from the `(en)` layout. After the flip it serves `<meta name="robots" content="index">` — the deliberately-non-indexed specimen page, indexable, carrying the landing's title and description. `Disallow: /type` in `robots.txt` prevents *crawling* but does not prevent *indexing* of a linked URL.
**Why it happens:** Phase 1 D-05 built `/type` as a non-indexed specimen and the noindex has been free ever since.
**How to avoid:** de-client `/type` exactly as Phase 3 de-cliented the landing — replace the five `useSmearHeading` calls with `SmearTitle`, then export `metadata: { robots: { index: false }, title: …, alternates: { canonical: "/type" } }`. Add `"type"` to `prerender.test.ts:394`'s loop and assert it keeps `noindex` after the flip. (Nothing links to `/type`, so the residual risk is low — but the fix is small and the assertion is the point.)

### Pitfall 7: `.next/server/app/` pollution before `test:build`
**What goes wrong:** `walkHtmlRoutes` picks up on-demand 404 renders that `next start` wrote to disk.
**How to avoid:** `rm -rf .next && npm run build` before `npm run test:build`, every time. `npm run test:all` already does.

### Pitfall 8: canonical / sitemap trailing-slash mismatch
**What goes wrong:** `/`'s canonical is the bare origin; the sitemap's is the origin plus `/`. Two URLs for one page.
**How to avoid:** pick one spelling and assert it in the build tier against both surfaces.

### Pitfall 9: `app/icon.png` next to `app/favicon.ico`
**What goes wrong:** two `<link rel="icon">` tags (measured), one of them still the Next scaffold mark that HOME-05 exists to avoid.
**How to avoid:** delete `app/favicon.ico` in the same commit. Assert exactly one `rel="icon"` in `prerender.test.ts`.

### Pitfall 10: the portrait balloons to full page width
**What goes wrong:** `/cv`'s `<main class="flex flex-col">` stretches a replaced element's width; `height:auto` follows; the portrait fills the column.
**How to avoid:** `self-start` plus an explicit rendered width on the image or its wrapper.

### Pitfall 11: `<strong>` in the CV renders at 700
**What goes wrong:** Tailwind preflight `b, strong { font-weight: bolder }` → 700 outside `.prose-site`. A third weight on screen that the source-level budget gates cannot see.
**How to avoid:** no `<strong>` outside `.prose-site`. If emphasis is genuinely needed, it is `.text-standfirst` (530) or nothing. Add a DOM-tier assertion (`getComputedStyle(...).fontWeight` over every element on `/` and `/cv` ∈ {400, 530}) — that is the only gate that would catch it.

### Pitfall 12: CONTEXT's "To Delete" list is stale
**What goes wrong:** a plan task fails because the file is not there.
**Measured current state:** `app/(en)/probe404/` **does not exist** (already deleted). `app/not-found.tsx` **does not exist** — it is now `app/global-not-found.tsx` (Phase 3, commit `92c29a5`, under `experimental.globalNotFound`), and it re-declares `<html>`/`<body>`/fonts by design, so it is a **third** place a global head concern lands. `lib/site.ts` **already exists** and already does the `NEXT_PUBLIC_SITE_URL` half of D-3.4. Still present and still to delete: `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`, and `app/favicon.ico`.

---

## Code Examples

### Verify the CR-01 fix from a shell (the acceptance test, verbatim)

```bash
rm -rf .next && npm run build && npx next start -p 3199 &
sleep 6
for p in /writing/does-not-exist /texte/gibt-es-nicht; do
  curl -s -o /tmp/b.html -w "$p status=%{http_code}\n" "http://localhost:3199$p"
  /usr/bin/grep -o '<html lang="[a-z]*"' /tmp/b.html
  /usr/bin/grep -o '<h1[^>]*>[^<]*'      /tmp/b.html | head -1
done
# MEASURED 2026-08-31:
#   /writing/does-not-exist status=404   <html lang="en"   <h1 class="text-heading">Not found
#   /texte/gibt-es-nicht    status=404   <html lang="de"   <h1 class="text-heading">Nicht gefunden
```

### `headers()` shape that was verified delivering

```ts
// next.config.ts — source "/:path*" covers HTML routes, the proxy-rewritten
// 404, the global 404, AND /_next/static/*. Measured on all five.
async headers() {
  const csp = buildCsp({ dev: process.env.NODE_ENV !== "production" });
  return [{
    source: "/:path*",
    headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ],
  }];
}
```

⚠️ `next.config.ts` is evaluated in a Node process at build **and** at `next start`, so `process.env.NODE_ENV` is the correct dev/prod discriminator there. `buildCsp` itself must stay pure (take `{dev}`) so `node --test` can assert both strings without touching the environment (D-4.3).

### Reproducing the Satori variable-font failure in ten seconds

```bash
node -e "
const fs=require('fs');
const { ImageResponse } = require('next/dist/compiled/@vercel/og/index.node.js');
const data = fs.readFileSync('app/fonts/Humane-VF.ttf');
new ImageResponse({type:'div',props:{children:'Hi',style:{fontFamily:'H',fontSize:100,display:'flex',background:'#fff',color:'#000',width:'100%',height:'100%'}}},
  {width:600,height:315,fonts:[{name:'H',data,weight:400,style:'normal'}]})
  .arrayBuffer().then(b=>console.log('OK',b.byteLength)).catch(e=>console.log('ERR',e.stack.split('\n')[1]));
"
# MEASURED: ERR     at parseFvarAxis (…/@vercel/og/index.node.js:11887:20)
```

Run this **before** committing to any OG font decision. It is faster than a build and gives the same answer.

---

## State of the Art

| Old approach | Current approach | When changed | Impact here |
|---|---|---|---|
| `middleware.ts`, `export function middleware`, `runtime: 'edge' \| 'nodejs'` | `proxy.ts`, `export function proxy`, nodejs only, not configurable | **Next 16** | CR-01's whole implementation. `middleware.ts` still works but warns. |
| `app/not-found.tsx` as the global boundary under an injected root layout | `app/global-not-found.tsx` + `experimental.globalNotFound` | Next 16 (experimental); adopted here in Phase 3 (`92c29a5`) | Already shipped. Any global head concern this phase adds has **three** landing places, not two. |
| Hand-declared `twitter:card` | Inferred from the `opengraph-image` file convention | Metadata API maturation | D-3.1's explicit declaration is redundant (harmless) |
| `next/image` everywhere | `next/image` **plus** a production `sharp` dependency | Next 13+, unchanged in 16 | Why D-2.5 declines it. `figure.tsx:10-16` already records this. |
| `X-Frame-Options` | CSP `frame-ancestors` | CSP2, ~2015 | D-4.1's omission is correct and current |
| `X-XSS-Protection` | Removed; considered harmful | ~2019 | D-4.1's omission is correct and current |

**Deprecated / outdated in this repo's own records:**
- CONTEXT's `tests/build/prerender.test.ts:128` → the assertion is now at **:159/:160**.
- CONTEXT's "`app/not-found.tsx` re-declares `<html>`…" → the file is `app/global-not-found.tsx`.
- CONTEXT's "To Delete: `app/(en)/probe404/`" → already gone.
- CONTEXT's "`next.config.ts` has no `headers()` … and there is no `middleware.ts`" → still true, but the file to create is `proxy.ts`.
- Phase 4 `launch-gate.md`'s "`/cv`'s interim body is asserted separately by `tests/cv.spec.ts`" → it is not.
- `03-UI-SPEC.md:232`'s `documentTop` forward note → superseded by `03-RESEARCH.md`; reason wrong, requirement right.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | The `guillemgelabert.com` → this-app routing measured today is **intended and stable**, not a temporary edge-router state | F3 / Q2 | If it is temporary, option 1 (canonical → apex) bakes a hostname that stops resolving. Mitigation: the variable is one Railway change and requires no code. |
| A2 | Setting `NEXT_PUBLIC_SITE_URL` on the Railway `web` service is the user's to decide, not the autonomous run's | F3 | Over-cautious → the site indexes under the Railway hostname. Under-cautious → an autonomous run changed a public identity. Surfaced as a gate row rather than resolved. |
| A3 | The `fs`-scan slug predicate for the proxy is acceptable given a binding unit test | CR-01 (b) | If the two predicates drift, a published post 404s or a draft becomes reachable. The unit test is the mitigation and is not optional. |
| A4 | Google consolidates duplicate hostnames onto the declared canonical | F3 | Standard SEO behaviour, not verified in-session. If it did not, the duplicate-content risk would be different (worse, not better). |
| A5 | HTML-entity encoding still deters a meaningful share of harvesters | Pattern 2 | D-2.3 already accepts that a determined scraper wins. If entities deter nobody, the `dangerouslySetInnerHTML` cost buys nothing and `[at]`/`[dot]` is strictly better. |
| A6 | The portrait is the LCP element on `/cv` at 375px | Pitfall / photograph | Drives the `eager` + `fetchPriority="high"` recommendation. Cheap to measure once the file exists; measure rather than assume. |
| A7 | Turbopack dev injects inline `<style>` at runtime for CSS HMR | CSS strengthenings | Only affects the optional `style-src-elem` refinement. If wrong, dev could be stricter too. Measured: **zero** inline `<style>` in the dev HTML *at first paint* — the HMR claim is about post-load injection and was not measured. |
| A8 | Google Fonts publishes a static `Newsreader-Regular.ttf` under OFL | Package Legitimacy | Only matters on the ImageResponse-with-Newsreader branch. Verify before committing a font file. |
| A9 | Railway redeploys on a variable change, so `NEXT_PUBLIC_*` re-inlines | Runtime State | If it only restarts, the variable would not take. Verify by `curl`-ing the canonical after the change — which the plan should require anyway. |
| A10 | `_pm/kanban.md` should not be created just to satisfy CLAUDE.md | Project Constraints | Low. Worst case, a tracking file the user wanted is still missing. Flag it in the audit's housekeeping row. |

---

## Open Questions

1. **Does the user want `guillemgelabert.com` to be the indexed canonical?**
   - Known: the apex already serves this exact app, byte-identically, today (measured). `lib/site.ts` already supports the switch with zero code change.
   - Unclear: whether the edge-router forwarding is deliberate and permanent, and whether the user wants v1 discovered under the good domain or under the Railway URL.
   - Recommendation: make it **gate row G13**, defaulting to *blocked*. If the run must proceed, the safe default is **do not flip** — an unindexed site is recoverable; a site indexed under the wrong canonical is slow to fix. This is the one place where the autonomous directive and the "irreversible act" framing genuinely collide, and CONTEXT's own gate language ("the phase reports blocked with the exact failing rows rather than shipping past them") is the tiebreaker.

2. **Which OG path: Humane-via-Playwright-PNG, or generated-with-static-Newsreader?**
   - Known: Humane is impossible via `ImageResponse` (measured, three fonts). Both alternatives work.
   - Unclear: whether per-route card correctness or the display face matters more to the user.
   - Recommendation: **Playwright-committed PNG**, per CONTEXT's own recorded fallback. Two posts is not a maintenance burden, and the card is the site's visual signature in the one place strangers see it first.

3. **How does the proxy learn the published slug set?**
   - Known: four workable options; the `fs` scan is measured working.
   - Unclear: whether the prerender-manifest option is stable across Next patch releases (not tested).
   - Recommendation: `fs` scan + a unit test binding it to `publishedFor()`. Include the **locale** filter — a name-only match lets a German slug 200 under the English layout.

4. **Does `dangerouslySetInnerHTML` clear the project's own bar?**
   - Known: it is the only way to emit entities (measured). The input is a module constant; the site has no user input anywhere.
   - Unclear: whether the user would rather have `[at]`/`[dot]` plain text than a dangerous escape in a repo a reader might open.
   - Recommendation: `[at]`/`[dot]` is the *safer* choice and is PITFALLS #5's first-named option; entity encoding is the one D-2.3 locked. Follow D-2.3, isolate the escape in one four-line component with the reasoning in a comment, and assert the served bytes.

5. **Is a code-bearing published post wanted, so G9 has a production surface?**
   - Known: zero published posts contain a fence or a table (measured).
   - Recommendation: no. Satisfy G9 with the three-part proof above and record the limitation.

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | everything | ✓ | v22.20.0 | — |
| Next.js | everything | ✓ | 16.3.3 | — |
| `next/og` (`ImageResponse`) | D-3.2, D-3.5 | ✓ *(partially)* | bundled | **Cannot load variable fonts** → Playwright-rendered committed PNG |
| Playwright + Chromium | header delivery, CSP colour regression, OG PNG fallback | ✓ | @playwright/test ^1.62.1 | — |
| `node --test` | `buildCsp()` unit test | ✓ | Node 22 | — |
| `railway` CLI | reading deploy state | ✓ | 5.45.10, authenticated, project linked (`guillem-web` / `web`) | Railway dashboard |
| `gh` CLI | — | ✓ | 2.93.0 | not needed |
| `curl` / `dig` | live-deploy verification (D-4.4 §5) | ✓ | system | — |
| `sharp` | *(deliberately not used)* | ✗ | — | Plain `<img>` — D-2.5, by decision |
| Humane static instance | OG card with Humane | ✗ | — | Playwright render; **modification forbidden by licence** |
| Static Newsreader TTF | OG card via `ImageResponse` | ✗ | — | Commit one from `google/fonts` (OFL), or take the Playwright path |
| **The portrait file** | PROF-02 / G6 | ✗ | — | **None. `[USER-SUPPLIED]`.** Slot renders nothing. No generated portrait, ever. |
| **The contact email** | PROF-03 / G4 | ✗ | — | **None. `[USER-SUPPLIED]`.** Channel omitted. The `@liip.ch` address on record is deliberately not used. |
| **LinkedIn URL** | PROF-05 / G5 | ✗ | — | **None. `[USER-SUPPLIED]`.** Channel omitted. |
| **Employment history** | PROF-01 / G3 | ✗ | — | **None. `[USER-SUPPLIED]`.** `/cv` keeps its shipped stub line. |
| **HOME-01 sentence** | G2 | ✗ | — | **None. `[USER-SUPPLIED]`.** `POSITIONING_PLACEHOLDER` stays. |
| GitHub profile URL | PROF-04 | ✓ | `https://github.com/guillem-gelabert` | **Established from `git remote -v`. Not user-supplied.** |

**Missing with no fallback (all five are launch-gate rows, none blocks building the surfaces around them):** the portrait, the email, the LinkedIn URL, the employment history, the positioning sentence.

**Missing with a fallback:** Humane in the OG card → Playwright PNG. `sharp` → plain `<img>`, by decision.

### The `[USER-SUPPLIED]` mechanism: placeholder-plus-gate

The pattern is already proven twice in this repo (`POSITIONING_PLACEHOLDER` in `lib/work.ts`, `COPY_REVIEWED` in `lib/backlog.tsx`) and both records say the same thing: **mark it in source, never on screen.** Applied here:

```ts
// lib/contact.ts
/**
 * [USER-SUPPLIED] — PROF-03, launch gate G4.
 * null is the shipped state. The contact block renders only the channels
 * that exist (components/language-switch.tsx's null-rather-than-disabled
 * pattern) — a dead affordance is worse than no affordance.
 * NEVER invent an address. The employer address on record is deliberately
 * not used: a current-employer address is the wrong channel for a job hunt.
 */
export const EMAIL: string | null = null;

/** [USER-SUPPLIED] — PROF-05, gate G5. */
export const LINKEDIN: string | null = null;

/** Established from the git remote — NOT user-supplied. */
export const GITHUB = "https://github.com/guillem-gelabert";
```

```ts
// lib/cv.ts
/** [USER-SUPPLIED] — PROF-01, gate G3. Empty is the shipped state; /cv keeps its stub. */
export const EXPERIENCE: readonly CvRole[] = [];
```

**The gate that makes the placeholders safe** — one `node --test` file, run by `npm run test:unit` on every commit, whose assertions are *inverted* by the flip commit:

```ts
// tests/unit/launch-gate.test.ts
test("G2-G6, G11: the launch gate is not yet open — FIND-02 must not have flipped", () => {
  // While ANY of these is unfilled, both root layouts must still carry
  // robots: { index: false }. This is the mechanical link between the
  // user-supplied values and the irreversible act.
  const filled =
    POSITIONING_PLACEHOLDER !== "Developer." &&
    EXPERIENCE.length > 0 && EMAIL !== null && LINKEDIN !== null &&
    existsSync(PORTRAIT_PATH) && COPY_REVIEWED === true;
  for (const layout of [EN_LAYOUT_SRC, DE_LAYOUT_SRC]) {
    if (!filled) assert.match(layout, /robots:\s*\{\s*index:\s*false\s*\}/);
    else         assert.match(layout, /robots:\s*\{\s*index:\s*true\s*\}/);
  }
});
```

That single test is the whole mechanism: it cannot be satisfied by editing one file, it fails loudly in the fast tier, and it makes "flip the flag" and "the values are real" the same commit by construction. It is strictly better than a checklist because nobody has to remember to read it.

---

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework (fast tier) | `node:test` via `node --test 'tests/unit/*.test.ts'` — Node 22.20.0, native TS stripping |
| Framework (build tier) | `node:test` via `node --test 'tests/build/*.test.ts'`, reading real `.next/server/app/**/*.html` |
| Framework (browser tier) | `@playwright/test` ^1.62.1, chromium only, `webServer: npm run dev`, `baseURL` overridable via `PLAYWRIGHT_BASE_URL` |
| Config files | `playwright.config.ts`; the two node tiers are npm scripts, no config file |
| Quick run command | `npm run test:unit` (102 tests, ~0.4 s) |
| Full suite command | `npm run test:all` → `test:unit && rm -rf .next && npm run build && npm run test:build && npm test` |

**Baseline measured 2026-08-31:** unit **102/102 pass**; build **19/21 pass** (both failures at `prerender.test.ts:491` and `:539`, owned by Phase 5's outstanding Plan 05-04); lint 1 known deferred error. Phase 6 must not start by "fixing" those two.

**Tier-selection rule this repo already follows, restated because it decides half this phase's tests:** every `*.spec.ts` runs against `npm run dev`, where `showDrafts()` is always `true`. A Playwright test structurally cannot prove what a production build ships. Anything about *what production emits* goes in `tests/build/`. Anything about *what a browser does with it* goes in Playwright.

### Phase Requirements → Test Map

| Req | Behaviour | Type | Automated command | File exists? |
|---|---|---|---|---|
| PROF-01 | `/cv` renders real experience rows; exactly one `<h1>`; no marker words | browser | `npx playwright test tests/cv.spec.ts` | ✅ extend |
| PROF-01 | `/cv` production HTML contains the first `experience` row's org | build | `npm run test:build` | ✅ extend `prerender.test.ts` |
| PROF-01 | `lib/cv.ts` shape validates; empty `experience` renders the stub, not an empty element | unit | `node --test tests/unit/cv.test.ts` | ❌ Wave 0 |
| PROF-02 | Portrait `<img>` present, `naturalWidth > 0` (proves decode, not just a 200) | browser | `npx playwright test tests/cv.spec.ts` | ✅ extend |
| PROF-02 | CLS: `/cv` layout-shift score ≈ 0 across image load (`PerformanceObserver`) | browser | `npx playwright test tests/cv.spec.ts` | ✅ extend |
| PROF-02 | The `/cv` `<h1>`'s smear origin is unchanged before and after image load (D-2.6) | browser | `npx playwright test tests/landing-trail.spec.ts` | ✅ extend |
| PROF-03 | Email keyboard-reachable, accessible name = the address, `textContent` = the address | browser | `npx playwright test tests/contact.spec.ts` | ❌ Wave 0 |
| PROF-03 | **Served bytes contain `&#64;` and no bare `@` in the address** | build | `npm run test:build` | ✅ extend |
| PROF-03/04/05 | Absent channel renders nothing — no empty `<li>`, no disabled control | unit | `node --test tests/unit/contact.test.ts` | ❌ Wave 0 |
| PROF-04 | `/cv` and `/` link to `https://github.com/guillem-gelabert`; **still no link to `ib-gdp-evolution`** | build | `npm run test:build` | ✅ `prerender.test.ts:503` — ⚠️ it asserts `doesNotMatch(/href="[^"]*github\.com/i)` on `/`, which **this phase deliberately breaks**. Narrow it to the private-repo name. |
| BUILD-04 | `buildCsp({dev:false})` equals the exact production string; dev and prod share identical `style-src` tokens | unit | `node --test tests/unit/csp.test.ts` | ❌ Wave 0 |
| BUILD-04 | Every header delivered on a real response | browser | `npx playwright test tests/security-headers.spec.ts` | ❌ Wave 0 |
| BUILD-04 | **G9** — token colour survives with the CSP header delivered | browser | `npx playwright test tests/prose-code.spec.ts` | ✅ extend (`:152` already asserts the colour; add the header precondition) |
| BUILD-04 | Live headers | manual | `curl -sI https://…` recorded in the phase verification doc | — |
| FIND-01 | `/`, `/cv`, `/writing`, `/texte`, both posts each carry own `<title>`, `<description>`, `og:*`, one canonical | build | `npm run test:build` | ✅ extend |
| FIND-01 | OG image URL is absolute, 200, `image/png`, 1200×630 — resolved from the meta tag, never hardcoded | build/manual | `npm run test:build` + post-deploy `curl` | ❌ Wave 0 |
| FIND-01 | Live Slack unfurl looked at | manual | recorded checklist row (PITFALLS #8) | — |
| FIND-02 | `sitemap.xml` lists exactly `publishedFor()`'s output + 4 static routes; excludes `/type` and both reserved 404s | build | `npm run test:build` | ❌ Wave 0 |
| FIND-02 | `robots.txt` allows `/`, disallows `/type`, names the absolute sitemap URL | build | `npm run test:build` | ❌ Wave 0 |
| FIND-02 | Canonical and sitemap agree on the site-root spelling | build | `npm run test:build` | ❌ Wave 0 |
| FIND-02 | **The launch gate** — noindex iff any user-supplied value is unfilled | unit | `node --test tests/unit/launch-gate.test.ts` | ❌ Wave 0 |
| FIND-02 | Exactly one `<link rel="icon">`; `favicon.ico` gone | build | `npm run test:build` | ❌ Wave 0 |
| **CR-01** | `/writing/<unknown>` and `/texte/<unbekannt>`: 404 + correct `lang` + localised `<h1>` + non-empty title, **`javaScriptEnabled: false`** | browser | `npx playwright test tests/writing-not-found.spec.ts` | ✅ extend — and delete the KNOWN GAP block |
| **CR-01** | Cross-locale slugs 404 (`/writing/<german-slug>`, `/texte/<english-slug>`) | browser | same | ❌ Wave 0 |
| **CR-01** | The proxy's published-slug predicate equals `publishedFor()` for both locales | unit | `node --test tests/unit/proxy-slugs.test.ts` | ❌ Wave 0 |
| D-4.4 | Every internal link on every route in both locales resolves non-404; every hreflang/`x-default` target resolves | browser | `npx playwright test tests/cross-links.spec.ts` | ❌ Wave 0 |
| D-4.4 | Design-system roll-call: every computed `font-weight` on `/` and `/cv` ∈ {400, 530}; every `border-radius` = 0; `#C1272D` only on focus/hover | browser | `npx playwright test tests/design-budget.spec.ts` | ❌ Wave 0 — **the only tier that catches `<strong>` = 700 and arbitrary Tailwind values** |

### Sampling Rate

- **Per task commit:** `npm run test:unit` (~0.4 s, 102 tests + the new unit files). The launch gate lives here on purpose — it is the assertion that must fire on every commit, not only at the end.
- **Per wave merge:** `rm -rf .next && npm run build && npm run test:build && npm test`.
- **Phase gate:** full `npm run test:all` green, **plus** the three manual rows that cannot be automated — live `curl` headers, the Slack unfurl, and the screen-reader email pass.

### Wave 0 Gaps

- [ ] `tests/unit/csp.test.ts` — `buildCsp()` exact-string + dev/prod `style-src` parity (BUILD-04)
- [ ] `tests/unit/launch-gate.test.ts` — G2–G6 + G11 ⇄ the robots flag, the mechanism that makes the flip safe (FIND-02)
- [ ] `tests/unit/proxy-slugs.test.ts` — proxy predicate ⇄ `publishedFor()`, both locales (CR-01)
- [ ] `tests/unit/cv.test.ts` — `lib/cv.ts` shape + empty-state behaviour (PROF-01)
- [ ] `tests/unit/contact.test.ts` — null-channel omission (PROF-03/04/05)
- [ ] `tests/contact.spec.ts` — the email's three-part accessibility test, keyboard + name + copyable text (PROF-03)
- [ ] `tests/security-headers.spec.ts` — delivery on a real response (BUILD-04)
- [ ] `tests/cross-links.spec.ts` — D-4.4 §1 cross-link integrity
- [ ] `tests/design-budget.spec.ts` — DOM-tier design-system roll-call (D-4.4 §3); the gate that catches `<strong>` and arbitrary Tailwind values
- [ ] New assertions inside existing files: `prerender.test.ts` (sitemap, robots, icon count, OG tags, canonical spelling, email bytes, `/type` noindex), `cv.spec.ts` (portrait, CLS), `prose-code.spec.ts` (CSP precondition), `writing-not-found.spec.ts` (no-JS + cross-locale)
- [ ] No framework install needed — all three tiers exist.

---

## Security Domain

`security_enforcement` is not set to `false` in `.planning/config.json`, so this section is required. This is also BUILD-04's own phase, so it is more than a formality.

### Applicable ASVS Categories

| ASVS category | Applies | Standard control |
|---|---|---|
| **V1 Architecture** | yes | Static site, no backend, no state. The threat model is small **because of** architecture choices already made (no form, no CMS, no database — all Out of Scope by name). |
| **V2 Authentication** | no | No accounts, no login, no session. |
| **V3 Session Management** | no | No cookies are set. Verified: no `Set-Cookie` on any response. |
| **V4 Access Control** | **yes** | `lib/content.ts:findBySlug` before `loadPostModule` is the shipped allowlist boundary (`content.ts:200-210` comment: *"Do not reorder"*). **The proxy adds a second gate in front of it and must not weaken it** — the proxy is defence in depth, never a replacement, and `[slug]/page.tsx` keeps its `notFound()` call. |
| **V5 Input Validation** | **yes** | `SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/` (`content.ts:120`) guards the dynamic MDX import. **New surface: `proxy.ts` handles attacker-controlled path segments.** It must never interpolate the request path into the rewrite target — build the target from a fixed constant, as Pattern 1 does. `assertFrontmatter` guards content at build. No runtime user input anywhere else. |
| **V6 Cryptography** | no | No crypto is performed. HSTS delegates transport to Railway/Cloudflare. |
| **V7 Error Handling & Logging** | yes | The localised 404s are the error surface. They leak nothing — no stack traces, no path echo. Verified in the prototype output. |
| **V12 File & Resource** | **yes** | `CONTENT_DIR` is a module-scope constant; no caller-supplied path reaches `readdir` (`content.ts:24-25`). **If the proxy reads `content/` it must reuse the same posture** — a fixed directory constant, no request-derived path component. |
| **V14 Configuration** | **yes** | This is BUILD-04. The header set, the CSP, and `NEXT_PUBLIC_SITE_URL`. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard mitigation | Status here |
|---|---|---|---|
| XSS via injected inline script | Tampering | CSP `script-src` without `'unsafe-inline'`, or a nonce | ⚠️ **Knowingly accepted** (D-4.2). No user input, no forms, no third-party origins. Compensated by `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `frame-ancestors 'none'`. Stated in the config comment. |
| XSS via `dangerouslySetInnerHTML` | Tampering | Never pass non-constant data | Applies to the email component. Input is a module constant; assert that in a test and confine the escape to one file. |
| Clickjacking | Tampering | `frame-ancestors 'none'` | ✅ (`X-Frame-Options` correctly omitted as superseded) |
| Path traversal into the MDX loader | Elevation | Allowlist before import | ✅ shipped; the proxy must not weaken it |
| Path traversal into a proxy rewrite | Elevation | Fixed rewrite targets | **New this phase.** Pattern 1 uses a constant target. |
| Open redirect | Tampering | No user-controlled redirect targets | ✅ — the proxy **rewrites**, never redirects; `NextResponse.redirect` is not used |
| Reverse tabnabbing | Tampering | No `target="_blank"` | ✅ asserted at `prerender.test.ts:512`; the contact block's outbound links must keep same-tab |
| Mixed content | Info disclosure | `upgrade-insecure-requests` + HSTS | ✅ in D-4.2's policy |
| MIME sniffing | Tampering | `X-Content-Type-Options: nosniff` | ✅; verified delivered on `/_next/static/*` too |
| Referrer leakage | Info disclosure | `strict-origin-when-cross-origin` | ✅ |
| Private repo disclosure | Info disclosure | No link to `ib-gdp-evolution` | ✅ asserted at `prerender.test.ts:503-513`; ⚠️ that test's blanket `github.com` ban must be narrowed, not deleted, when PROF-04 lands |
| Secret leaked to the client bundle | Info disclosure | Only `NEXT_PUBLIC_*` is inlined | ✅ — `.env`'s `CLOUDFLARE_API_TOKEN` is unprefixed, gitignored and untracked. **Do not put `NEXT_PUBLIC_SITE_URL` in the local `.env`** — a local value would silently override the Railway one at build. |
| HSTS `preload` on a domain you do not control | Availability | Omit `preload` | ✅ D-4.1's omission is correct, and F3 makes it *more* correct: the apex is fronted by an edge router this milestone does not own. |
| Link unfurler blocked from the OG image | Availability | No `Cross-Origin-Resource-Policy` | ✅ D-4.1's omission is correct — a `same-origin` CORP would silently defeat FIND-01 |

**One header worth reconsidering.** `Permissions-Policy` as specified is a deny-list of nine features. Since the site uses **none** of the powerful features, the terser and stricter `Permissions-Policy: interest-cohort=(), browsing-topics=()` plus a wildcard-deny is not expressible in the current syntax — so the enumerated list is right. Keep it, and make sure every entry names a feature the site genuinely does not use (D-4.1 already says so); a `Permissions-Policy` listing a feature the site *does* use is the one way this header can break something silently.

---

## Sources

### Primary (HIGH confidence) — measured in this repository, 2026-08-31

- `next build` + `next start` on Next.js 16.3.3, Node v22.20.0 — CR-01 baseline and fix, header delivery, sitemap/robots/icon output, OG head tags, cache and status behaviour, latency
- `node -e` against `next/dist/compiled/@vercel/og/index.node.js` — Satori variable-font failure, reproduced on three fonts, stack frame isolated to `parseFvarAxis:11887`
- `node -e` against `react-dom/server` — HTML entity escaping in text nodes and attribute values
- `curl` / `dig` against `guillemgelabert.com`, `www.guillemgelabert.com`, `web-production-9cedb.up.railway.app` — F3
- `railway status` (read-only; `railway domain` deliberately not run) — project `f6be1197-…`, service `1ee326d6-…`, no custom domain on `web`
- `npm run test:unit` (102/102), `npm run test:build` (19/21), suite baseline
- Files read in full: `app/(en)/layout.tsx`, `app/(de)/layout.tsx`, `app/(en)/page.tsx`, `app/(en)/cv/page.tsx`, `app/(en)/type/page.tsx`, `app/global-not-found.tsx`, both `not-found.tsx`, both `[slug]/page.tsx`, `lib/site.ts`, `lib/content.ts`, `lib/locales.ts`, `lib/work.ts`, `lib/backlog.tsx`, `components/mdx/figure.tsx`, `components/smear-title.tsx`, `components/smear-heading/use-smear-heading.ts`, `components/landing/*.tsx`, `app/globals.css`, `next.config.ts`, `playwright.config.ts`, `tests/build/prerender.test.ts`, `tests/cv.spec.ts`, `tests/writing-not-found.spec.ts`, `tests/unit/prose-contract.test.ts`, `tests/unit/link-contract.test.ts`, `node_modules/tailwindcss/preflight.css`

### Primary (HIGH confidence) — Context7

- `/vercel/next.js` — `01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.mdx` (`MetadataRoute.Sitemap` schema, localised alternates)
- `/vercel/next.js` — `.../robots.mdx` (`MetadataRoute.Robots`)
- `/vercel/next.js` — `01-app/02-guides/upgrading/version-16.mdx` (**middleware → proxy; nodejs runtime, not configurable; edge unsupported**)
- `/vercel/next.js` — `01-app/01-getting-started/16-proxy.mdx` (`proxy.ts` export shape, matcher)
- `/vercel/next.js` — `.../04-functions/next-response.mdx` (`NextResponse.rewrite` semantics)

### Secondary (MEDIUM confidence) — this repo's own records, cross-checked against code

- `.planning/phases/02-content-pipeline/deferred-items.md` — CR-01 root cause (re-measured and confirmed)
- `.planning/phases/03-work-list-landing-skeleton/deferred-items.md` — HOME-01 tripwire; `documentTop` gauge-invariance correction (independently confirmed by reading `smear-heading-provider.tsx`)
- `.planning/phases/04-the-case-study/launch-gate.md` — carried tripwires (one claim about `tests/cv.spec.ts` found to be wrong)
- `.planning/phases/01-deploy-foundation-design-system/01-CONTEXT.md:227`, `01-DISCUSSION-LOG.md:78,141` — `guillem-edge` service id and domain attachment
- `.planning/phases/05-backlog/05-RESEARCH.md:741` — `guillem-edge` identified as a Cloudflare Worker edge router
- `.planning/research/PITFALLS.md` #5, #8, #14, #15, #16, #17
- `.planning/PROJECT.md` Out of Scope (the audit's named checklist), `.planning/ROADMAP.md:210-224`, `.planning/REQUIREMENTS.md:50-68`

### Tertiary (LOW confidence) — flagged for validation

- Google's duplicate-hostname consolidation behaviour (A4) — standard, not verified in-session
- Turbopack dev's runtime `<style>` injection for CSS HMR (A7) — asserted, not measured; only affects the optional `style-src-elem` refinement
- Availability of a static `Newsreader-Regular.ttf` under OFL in `google/fonts` (A8) — verify before committing a font file

---

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|---|---|---|
| CR-01 fix (`proxy.ts` + rewrite + status) | **HIGH** | Built, deployed locally, and measured end to end on both locales, with and without JavaScript. Also measured: the two rejected alternatives failing. |
| `next/og` variable-font failure | **HIGH** | Reproduced on three unrelated fonts; stack frame isolated to a specific line of the bundled parser; control font proves the negative is font-class-specific, not `ImageResponse`-wide. |
| The apex already serving this site (F3) | **HIGH** *(measurement)* / **MEDIUM** *(what to do)* | Byte-identical responses and edge headers are unambiguous. Whether the routing is intended and permanent is not knowable from here. |
| Header delivery via `headers()` | **HIGH** | Verified on five surface classes including `/_next/static/*` and the proxy-rewritten 404. |
| Both inline-style consumers | **HIGH** | Counted on a real dev render: 15 Shiki token colours, 4 gfm alignments. |
| React entity escaping | **HIGH** | Four variants rendered through `react-dom/server` and compared. |
| Sitemap / robots / icon behaviour | **HIGH** | Prototyped, built, served, output captured verbatim. |
| `documentTop` gauge invariance | **HIGH** | Derived from the four shipped lines that consume it. |
| CLS mechanism (preflight `height:auto`) | **HIGH** | Read from `node_modules/tailwindcss/preflight.css:230-234`. |
| Test-inversion line numbers | **HIGH** | Read from the current file. ⚠️ They will shift again if Phase 5's Plan 05-04 lands first — re-grep, do not trust the numbers blindly. |
| Proxy slug-allowlist design | **MEDIUM** | The `fs` option is measured working; the other three are reasoned, not tested. The locale-filter requirement is certain. |
| LCP behaviour of the portrait | **LOW** | No file exists to measure. Measure once it does. |
| Whether the user wants the apex canonical | **LOW** | Not knowable from here. Surfaced as a gate row and an open question. |

**Research date:** 2026-08-31
**Valid until:** ~2026-09-30 for the framework findings (Next 16.x is moving — `proxy` is one release old and `globalNotFound` is still experimental); **~7 days** for F3, which depends on live third-party routing that this milestone does not control. **Re-measure F3 immediately before the flip.**
