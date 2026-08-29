# Phase 1: Deploy Foundation & Design System - Research

**Researched:** 2026-08-29
**Domain:** Next.js App Router deployment on Railway (zero-config Railpack builder) + self-hosted variable-font typography (`next/font`) + a hand-rolled scroll-driven CSS `text-shadow` trail effect, ported from an existing benchmark
**Confidence:** HIGH

## Summary

This phase has three technically independent risk areas, and research closes all three with direct, verifiable evidence rather than inference.

**Deployment.** The project's own `web` Railway service is already on the Railpack builder — confirmed live against the Railway API (recorded in CONTEXT.md, 2026-08-29). Railpack's Node provider is generic: it runs whatever `build`/`start` scripts exist in `package.json`, and only switches to static-site serving mode if `next.config` sets `output: 'export'` — which this project must never set (it forecloses `next.config` `headers()`, needed by Phase 6's BUILD-04, and is explicitly out of scope per REQUIREMENTS.md). A plain `next build` + `next start` therefore works with zero extra config: `next start` has read the `PORT` environment variable automatically since Next.js 11, defaults its bind host to `0.0.0.0`, and Railway auto-injects `PORT` for Railpack (non-Dockerfile) builds. The one hazard — a root `Dockerfile` unconditionally winning over Railpack, with no `railway.json`/`railway.toml` override — is confirmed directly against Railway's own config-as-code reference: deleting the file is the only fix, exactly as CONTEXT.md's D-08 already concluded.

**Fonts.** `next/font/local` accepts the `.ttf` file as-is (no woff2 conversion, no subsetting — satisfying Humane's no-modification licence term) and computes its CLS-eliminating fallback metrics (`ascent-override`/`descent-override`/`size-adjust`) by reading the actual font file's own metrics table at build time — a materially different, more reliable mechanism than `next/font/google`'s approach, which looks up the font family *name* in a static, pre-computed metrics database (`@capsizecss/metrics`) and silently fails to generate an override if the name isn't in it. This matters because "Humane" is a small, non-mainstream freeware face that would never be in such a database — but because `next/font/local` doesn't need a name lookup, BUILD-06's zero-CLS requirement is mechanically sound for it. Newsreader (Google Fonts) does depend on that name-lookup path; it's a well-established face very likely present in the database, but per UI-SPEC's own hedge, confirm at implementation time.

**The trail port.** The benchmark's `createTextShadowEffect` (`text_trail_demo/index.html:648-688`) and shared driver `frame()` (`:827-882`) were read directly, line by line (see Code Examples). The algorithm is fully specified below with exact constants. The one real porting risk — not a copy-paste risk, a *design* risk — is that the benchmark only ever drives **one** active heading at a time (a tab-switcher compares three techniques), while Phase 1's `/type` specimen route needs the trail running simultaneously on **every** Humane-set heading level, sharing **one** rAF loop, per the phase's own stated goal. This requires generalizing the single-instance state (`documentTop`, `lagY`) into a registry the shared loop iterates — a real architectural step, covered in Architecture Patterns.

**Primary recommendation:** Scaffold Next.js 16.3.3 (App Router, TypeScript) with `create-next-app`, delete `Dockerfile`/`nginx.conf.template` and push a "hello world" page first to retire deploy risk before any design work (per D-08); wire fonts and Tailwind v4 `@theme` tokens; then port the trail as a Client Component with a single shared rAF driver, gated by a `usePrefersReducedMotion` hook read before any frame is ever scheduled.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01: Humane V2.0 stays as the display face.** Already in the repo at `text_trail_demo/assets/Humane-VF.ttf` (85 KB, single `wght` axis 100–900), and already proven against the trail effect at 160px / 0.82 line-height. Ultra-condensed big type as structural element is the constructivist move in BRIEF §8. Licence forbids modification/subsetting without written permission — `next/font/local` serves the file as-is and only generates fallback metric overrides, so it is compatible; do not add a subsetting step. Accepted risk: ultra-condensed at heavy weight is exactly PITFALLS #11 — every heading style must be run through a contrast checker at its actual rendered size/weight, and letter-spacing must stay capped on real words.
- **D-02: Body/reading face is a text serif** (Newsreader/Literata/Source Serif/Spectral class — specific face is Claude's pick during planning, already resolved to **Newsreader** in `01-UI-SPEC.md`). Must be non-condensed regardless of what the display type does. Carries the real reading load: 13 migrated posts, the case study, the CV.
- **D-03: Fluid display, fixed body.** Humane headings on a `clamp()` curve so poster-scale type survives to a 375px viewport; body serif locked to two or three fixed sizes. The demo heading is `white-space: nowrap` at a fixed 160px — that overflows on mobile and must not be ported verbatim. The `text-shadow` technique, unlike WebGL, does not require `nowrap`; shadows render correctly on wrapped lines.
- **D-04: Tailwind v4 `@theme` for tokens and layout; plain CSS for the typographic rules.** `@tailwindcss/typography` supplies prose defaults for the 13 migrated posts (Phase 2). The `clamp()` curves, optical tracking and OpenType feature settings go in a small global stylesheet reading the same CSS variables that `@theme` defines. The alternative (plain CSS only, no Tailwind) was considered and declined.
- **D-05: `/` is a holding page; a non-indexed `/type` specimen route sits alongside it.** The holding page carries one heading (exercising the trail at poster scale) and a paragraph of the serif. The specimen shows every level of the scale, a prose block, and the trail at each heading level.
- **D-06: Holding page copy is name only — no positioning claim.** Heading "Guillem Gelabert" plus a short neutral line of serif body ("Developer." suggested in UI-SPEC). HOME-01's real positioning sentence belongs to Phase 3.
- **D-07: `robots: { index: false }` ships in Phase 1's root metadata and is flipped in Phase 6 as part of FIND-02.** Planner note: this creates a required action in Phase 6 — FIND-02's plan must explicitly flip this flag, or launch ships noindex.
- **D-08: Deploy first, then design.** Task order: delete `Dockerfile` and `nginx.conf.template` → scaffold bare Next.js → push → confirm `web-production-9cedb.up.railway.app` serves it → only then build the type system. Every later commit is a known-good increment (the service auto-deploys on every push to `master`; `git.branching_strategy` is `none`).

### Claude's Discretion (resolved in UI-SPEC.md — treat as locked for this phase)

- **Heading trail scope and tuning** — resolved: applies to every Humane-set heading (Display/Heading roles) on both routes; does not apply to in-prose Newsreader subheadings (standing rule for Phase 2+ too). Constants unchanged from the benchmark: `MAX_TRAIL = 280`, `MAX_SHADOWS = 240`, `SCROLL_STOP_DELAY = 120`, smoothing `1 - exp(-elapsed * 0.009)`, strength `min(1, distance / 3)`. Reduced motion → the ported `start()` early-return, fully static heading, no separate CSS gate needed for the trail itself.
- **Trail color** — resolved: monochrome ink `#171714`, solid, no alpha. The demo's rainbow hue-cycling (`trailColor()`, `HUE_SPEED`) is explicitly **not** ported — required deviation from the source.
- **Colour system and dark mode** — resolved: light-only for v1. Palette: `#f2eee5` (dominant, 60%), `#171714` (secondary/ink, 30%), `#C1272D` (accent, 10%, reserved for focus rings/link states — zero accent pixels may ship in Phase 1, that's not a violation).
- **Specific serif (D-02 resolution)** — resolved: Newsreader, variable (`opsz`+`wght`), `next/font/google`, `display: 'swap'`.
- **`font-display` strategy per role** — resolved: `optional` for Humane (self-hosted, same-origin, 85KB — a fallback substitution at poster scale would look broken, not just different), `swap` for Newsreader (must always end up in the correct face even at the cost of a brief FOUT).
- **Code/mono face** — not decided in Phase 1, deferred to Phase 2.
- **Vertical rhythm/baseline approach** — at Claude's discretion during planning; UI-SPEC's spacing scale (4px-multiple tokens, xs–3xl) is the locked starting point.

### Deferred Ideas (OUT OF SCOPE)

- `guillemgelabert.com` custom domain — already attached to the *different* `guillem-edge` service/repo. No action in v1; v1 ships on the Railway URL. Recorded so v2's BUILD-07 planning starts from the real state (a domain reassignment, not a fresh setup).
- Flipping `robots: { index: false }` back — Phase 6's FIND-02 responsibility, not this phase's.
- Print stylesheet for the CV — v2's PROF-06, out of scope; noted only because this phase's type scale is what a print pass would later override.
- Real security response headers (BUILD-04), robots/sitemap and OG metadata (FIND-01/02) — Phase 6.
- The positioning sentence (HOME-01), navigation (HOME-03), landing layout at low item count (HOME-04), work list (WORK-01/02) — Phase 3.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUILD-01 | The site runs as a Next.js application | Standard Stack (Next.js 16.3.3 App Router, verified npm registry); Architecture Patterns (project structure) |
| BUILD-02 | The site is deployed on Railway and reachable at a stable public URL | Railpack builder detection, Dockerfile-priority hazard, PORT binding — all verified against Railway/Railpack official docs and this project's live service state (CONTEXT.md ground truth) |
| BUILD-03 | Visitor can use the site on both desktop and mobile browsers | `clamp()`-based fluid type scale (D-03/UI-SPEC), Validation Architecture viewport test matrix |
| BUILD-05 | Visitor with a reduced-motion preference set is not shown motion that ignores it | `prefers-reduced-motion` gating pattern (Common Pitfalls #4, Code Examples); the ported `start()` early-return already gates the trail in JS before any frame runs |
| BUILD-06 | Fonts are self-hosted and the page does not shift layout as they load | `next/font/local` and `next/font/google` fallback-metric mechanism (Summary, Code Examples); the local-vs-google metric-computation distinction is the load-bearing finding |
| HOME-05 | Visitor sees a deliberate typographic system that reads as authored rather than framework-default | Tailwind v4 `@theme` + plain-CSS split (D-04), `/type` specimen route (D-05) as the checkable artifact |
| HOME-06 | Visitor scrolling the page sees headings trail behind the scroll position with a smear effect that settles when scrolling stops | Full algorithm extraction from `text_trail_demo/index.html` (Code Examples), single-shared-rAF-loop generalization (Architecture Patterns) |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Next.js app / build (BUILD-01) | Frontend Server (SSR) | — | App Router Server Components render the two routes; no API/backend tier exists in this phase |
| Deployment / hosting (BUILD-02) | Frontend Server (SSR) | CDN/Static | Railway runs the Next.js Node process (`next start`); Next.js serves its own static assets (`_next/static`) from the same process — there is no separate CDN tier in this milestone |
| Responsive viewports (BUILD-03) | Browser/Client | Frontend Server (SSR) | CSS media queries / `clamp()` resolve at paint time in the browser; the server renders identical markup for every viewport (no server-side device detection) |
| Self-hosted fonts, zero CLS (BUILD-06) | Frontend Server (SSR) | Browser/Client | `next/font` computes fallback metrics and emits `@font-face`/CSS at build time, inlined into SSR'd HTML; the browser paints using those metrics |
| Reduced-motion gating (BUILD-05) | Browser/Client | — | `matchMedia` is a runtime browser API reading a live OS/user preference; there is no server-side equivalent to gate on |
| Typographic system / design tokens (HOME-05) | Frontend Server (SSR) | Browser/Client | Tailwind `@theme` tokens and the global stylesheet are build output shipped as CSS; the browser renders using them |
| Heading scroll trail (HOME-06) | Browser/Client | — | `getBoundingClientRect()`, `scrollY`, `requestAnimationFrame`, and the imperative DOM style writes are all client-only; the server renders only the static heading markup the effect later animates |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.3.3 | Framework, App Router, build/dev server | Current stable `latest` on npm (verified 2026-08-29); Turbopack is the default bundler for both `next dev` and `next build` as of v16 |
| react | 19.2.8 | UI runtime | Next.js 16's required peer version |
| react-dom | 19.2.8 | DOM renderer | Matches `react` |
| typescript | 7.0.2 | Type checking | Next.js 16 requires only `>=5.1.0`; 7.0.2 is current npm `latest` but is a very new major (native/Go-based compiler rewrite) — see Assumptions Log |
| tailwindcss | 4.3.3 | Utility layer + CSS-first design tokens (`@theme`) | Locked by D-04; v4's `@theme` directive needs no `tailwind.config.js`, integrates directly with `next/font`'s CSS-variable output |
| @tailwindcss/postcss | 4.3.3 | PostCSS plugin wiring Tailwind into Next.js's build | v4's PostCSS plugin moved out of the `tailwindcss` package itself — this is the required companion package, not optional |
| @tailwindcss/typography | 0.5.20 | `prose` classes for long-form content | Locked by D-04 for Phase 2's migrated posts; safe/cheap to install now so the loader in v4 is `@plugin`-registered from day one |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/node | 26.4.0 | TypeScript types for Node APIs | Dev dependency, standard with any Next.js + TS project |
| @types/react | 19.2.18 | TypeScript types for React 19 | Dev dependency |
| @types/react-dom | 19.2.5 | TypeScript types for react-dom 19 | Dev dependency |
| eslint | 10.9.1 | Linting | Paired with `eslint-config-next` at the matching Next.js version |
| eslint-config-next | 16.3.3 | Next.js's recommended lint ruleset | Install at the exact Next.js version installed to avoid rule-set drift |
| @playwright/test | 1.62.1 | Browser-behavior test runner | See Validation Architecture — this phase's success criteria are fundamentally DOM/runtime behaviors (viewport rendering, reduced-motion, scroll-driven effect), which unit tests cannot exercise |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `next build` + `next start` (zero-config Railpack) | `output: 'standalone'` + a custom Dockerfile (Railway's own official Next.js guide pattern) | Smaller final image, faster cold starts — but requires a manual post-build copy of `public/`/`.next/static` into the standalone folder (a documented footgun if forgotten) and reintroduces exactly the Dockerfile-priority hazard this phase exists to retire. Rejected: D-08/ARCHITECTURE.md §9 already resolved this against the standalone+Docker path for v1; revisit only as a v2+ build-size optimization |
| `next/font/google` for the display face | Self-host Humane manually via a hand-written `@font-face` | Would require manually computing fallback-override metrics (error-prone, exactly what `next/font/local` automates) and risks accidentally re-subsetting/modifying the font file, violating D-01's licence constraint |
| Client-side rAF driver (hand-rolled) | A scroll-animation library (Lenis, GSAP ScrollTrigger, Framer Motion) | Explicitly out of scope — REQUIREMENTS.md's Out-of-Scope table lists "Animation library... No surface in v1 earns the weight," and HOME-06 is specified as a *port* of the existing benchmark, not a library-driven rebuild |

**Installation:**
```bash
npx create-next-app@16.3.3 --typescript --app --tailwind --eslint --src-dir=false --import-alias "@/*"
npm install @tailwindcss/typography
npm install -D @playwright/test
```

**Version verification:** All versions above were verified directly against the npm registry on 2026-08-29 (`npm view <package> version`), the same day as this research, and cross-checked against `.planning/research/STACK.md` (researched independently, same day, same versions). `create-next-app@16.3.3` is recommended over hand-assembling `package.json` so that peer-dependency-compatible versions of TypeScript/eslint tooling are chosen consistently, rather than manually pinning every dependency to today's bleeding-edge `latest` (see TypeScript 7.0.2 flag in Assumptions Log).

## Package Legitimacy Audit

All packages below were checked with `slopcheck scan --pkg npm <name>` (v0.6.1) on 2026-08-29. All returned `OK` with no flags. Postinstall scripts were checked via `npm view <name> scripts.postinstall` — none of the core packages define one.

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| next | npm | 10+ yrs | github.com/vercel/next.js | OK | Approved |
| react | npm | 10+ yrs | github.com/facebook/react | OK | Approved |
| react-dom | npm | 10+ yrs | github.com/facebook/react | OK | Approved |
| typescript | npm | 10+ yrs | github.com/microsoft/TypeScript | OK | Approved |
| tailwindcss | npm | 8+ yrs | github.com/tailwindlabs/tailwindcss | OK | Approved |
| @tailwindcss/postcss | npm | new in v4 line (2025) | github.com/tailwindlabs/tailwindcss | OK | Approved |
| @tailwindcss/typography | npm | 6+ yrs | github.com/tailwindlabs/tailwindcss-typography | OK | Approved |
| eslint | npm | 10+ yrs | github.com/eslint/eslint | OK | Approved |
| eslint-config-next | npm | tracks Next.js | github.com/vercel/next.js | OK | Approved |
| @playwright/test | npm | 6+ yrs | github.com/microsoft/playwright | OK | Approved |

**Packages removed due to slopcheck `[SLOP]` verdict:** none.
**Packages flagged as suspicious `[SUS]`:** none.

Per the package-name-provenance rule: these packages were discovered via Context7 (official Next.js/Tailwind docs) and existing project research (STACK.md, itself npm-registry-verified), not via unverified WebSearch/training-data guesses, and all passed slopcheck — they qualify for `[VERIFIED: npm registry]` status throughout this document.

## Architecture Patterns

### System Architecture Diagram

```
Visitor's browser
      │  GET /  or  GET /type
      ▼
Railway edge (public domain: web-production-9cedb.up.railway.app)
      │  routes to the "web" service's single replica
      ▼
Railway service "web"  ──────────────────────────────────────────────┐
  │  runtime: `next start`, bound to 0.0.0.0:$PORT (Railway-injected) │
  │  builder: Railpack (Node provider) ── DECISION POINT ─────────────┤
  │    IF a root Dockerfile exists → Railway builds THAT instead,      │
  │    silently, with no override (Phase 1's first task deletes it)   │
  └──────────────────────────────────────────────────────────────────┘
      │
      ▼
Next.js App Router route resolution
      │
      ├─ app/layout.tsx (Server Component)
      │     ├─ next/font/local("Humane-VF.ttf")  → self-hosted @font-face
      │     │     + computed fallback metrics (ascent/descent/size-adjust)
      │     ├─ next/font/google("Newsreader")    → self-hosted @font-face
      │     │     + fallback metrics IF Newsreader is in @capsizecss/metrics
      │     ├─ app/globals.css: Tailwind @theme tokens + clamp() type scale
      │     └─ metadata: robots: { index: false }  (D-07)
      │
      ├─ app/page.tsx (Server Component) ──────► "Guillem Gelabert" <h1>
      └─ app/type/page.tsx (Server Component) ──► every type role demoed
      │
      ▼
HTML streamed to browser, hydration begins
      │
      ▼
Client Component: SmearHeadingProvider (mounted once, near root)
      │
      ├─ DECISION POINT: matchMedia('(prefers-reduced-motion: reduce)').matches?
      │     ├─ YES → never register scroll listener, never schedule rAF.
      │     │         Headings render fully static. (BUILD-05 satisfied)
      │     └─ NO  → attach `scroll`/`scrollend`/pointer listeners,
      │               registry of {ref, documentTop, lagY} per mounted heading
      │
      ▼  (one shared loop, not one per heading)
requestAnimationFrame(frame)
      │  for each registered heading:
      │    targetY = documentTop - scrollY
      │    lagY += (targetY - lagY) * smoothing         [exponential catch-up]
      │    distance = |lagY - targetY|; strength = min(1, distance/3)
      │    IF distance > 0.15px → write stacked text-shadow layers to heading.style
      │    ELSE                 → snap lagY = targetY, clear text-shadow, stop loop
      ▼
Heading DOM node's `style.textShadow` mutated directly (no React re-render)
```

### Recommended Project Structure

```
guillem-web/
├── app/
│   ├── layout.tsx              # root layout: <html>/<body>, next/font wiring, robots metadata
│   ├── page.tsx                 # "/" holding page (D-05, D-06)
│   ├── type/
│   │   └── page.tsx             # "/type" non-indexed specimen route (D-05)
│   ├── globals.css              # Tailwind @theme tokens + clamp() type scale + OpenType features (D-04)
│   └── fonts/
│       └── Humane-VF.ttf        # colocated per Next.js convention; read at build time via next/font/local import
├── components/
│   └── smear-heading/
│       ├── smear-heading-provider.tsx   # 'use client' — the single shared rAF driver + registry
│       ├── use-smear-heading.ts         # hook: registers a heading ref with the provider on mount
│       └── use-prefers-reduced-motion.ts # standalone hook, reusable for any future motion (standing rule)
├── next.config.ts                # plain config — no output:'export', no output:'standalone'
├── package.json
├── postcss.config.mjs            # @tailwindcss/postcss plugin registration
└── tsconfig.json
```

**Not built in Phase 1:** `content/`, `lib/content/*` (Phase 2's content pipeline), any `app/writing/*` route, any component library primitives (`<Card>`/`<Badge>`/`<Tag>` — explicitly premature per ARCHITECTURE.md §7 and REQUIREMENTS.md's Out-of-Scope table).

### Pattern 1: Zero-config Railpack deploy (no Dockerfile, no `output` override)

**What:** `package.json` scripts are `"build": "next build"` and `"start": "next start"`. Nothing else.
**When to use:** Always, for this project. Railpack's Node provider (per railpack.com/languages/node, read directly) executes the `build` script during the build phase, then determines the start command by priority: `start` script → `main` field → `index.js`/`index.ts`. It only treats a Next.js app as a *static* site if `next.config` sets `output: 'export'` — otherwise it is handled as a generic Node app, which is exactly the plain `next start` path this project needs.
**Example:**
```json
// Source: railpack.com/languages/node (VERIFIED, read directly 2026-08-29) + Next.js CLI docs (Context7 /vercel/next.js)
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```
`next start` reads `PORT` from the environment automatically (supported since Next.js 11) and binds host `0.0.0.0` by default — matching Railway's requirement exactly, with zero extra flags or a custom `server.js`.

### Pattern 2: `next/font/local` for a licence-restricted variable font

**What:** Load `Humane-VF.ttf` as-is; do not subset, do not convert format.
**When to use:** Any local font file, especially one under a no-modification licence (D-01).
**Example:**
```tsx
// Source: Context7 /vercel/next.js, next/font API reference — verified pattern
// app/fonts/humane.ts
import localFont from 'next/font/local'

export const humane = localFont({
  src: './Humane-VF.ttf',
  weight: '100 900',      // variable font axis range syntax
  display: 'optional',    // resolved in UI-SPEC — no visible swap flash, zero shift
  variable: '--font-humane',
})
```
`next/font/local` accepts `.ttf` directly (confirmed via Context7's own example using a `.ttf` file, not just `.woff2`). Its automatic fallback (`adjustFontFallback`, default `'Arial'`) computes `ascent-override`/`descent-override`/`size-adjust` by parsing the actual font file's metrics table at build time (Turbopack's Rust `next-core` crate, `font_fallback.rs`) — it does **not** depend on a name-lookup database, unlike the Google loader. This is why BUILD-06's zero-CLS requirement holds for an obscure face like Humane.

### Pattern 3: Single shared rAF driver for N heading instances (generalizing the ported benchmark)

**What:** The benchmark drives exactly one active effect at a time (a tab-switcher). The `/type` specimen route needs the trail on every Humane-set heading simultaneously, with one shared loop — not one `requestAnimationFrame` call per heading.
**When to use:** Any time more than one trail-carrying heading exists on a page (which happens starting with `/type`).
**Example (synthesized pattern, grounded in the verified algorithm below — not copy-pasted from a doc):**
```tsx
// Provider mounted once near the root layout
'use client'
// registry: Map<HTMLElement, { documentTop: number; lagY: number }>
// one requestAnimationFrame loop iterates the registry each tick,
// exactly as the benchmark's frame() does for its single activeEffect —
// generalized from "one effect" to "for (const [el, state] of registry)"
```
Each heading registers itself via a `useSmearHeading(ref)` hook on mount (`useLayoutEffect`, so `getBoundingClientRect()` runs after paint) and unregisters on unmount. The provider's rAF callback is the *only* place `requestAnimationFrame` is called in the whole tree.

### Anti-Patterns to Avoid

- **Driving the trail through React state (`useState`/`setTextShadow`) instead of a direct DOM write:** would trigger a re-render on every animation frame (~60/sec), tanking performance. The vanilla original writes `heading.style.textShadow` directly (`text_trail_demo/index.html:680`) — the port must do the same via a ref, bypassing React's render cycle entirely for this specific value.
- **One `requestAnimationFrame` call per heading instance:** works, but violates the phase's explicit "single shared rAF loop" requirement and wastes battery/CPU with N redundant callbacks scheduled per frame instead of one.
- **Setting an initial inline `text-shadow` style from server-rendered markup:** creates an SSR/hydration mismatch risk if the value differs between server and first client paint. Leave the shadow unset in SSR output; only the post-mount `useLayoutEffect`/rAF loop ever writes it.
- **Constructing `matchMedia(...)` at module top-level or during render:** `window` doesn't exist during SSR — this throws or silently misbehaves. Only call `matchMedia` inside a Client Component's effect/event handler.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font-loading CLS elimination | Manual `@font-face` + hand-computed fallback `ascent-override`/`size-adjust` | `next/font/local` / `next/font/google` | Next.js computes these automatically at build time (from the actual font file for local fonts, from a metrics database for Google fonts) — a hand-computed value is exactly the kind of arithmetic that's easy to get subtly wrong and never re-verified |
| Fluid type scale | A JS-based fluid-typography library | Native CSS `clamp()` | Already locked by D-03/UI-SPEC; `clamp()` needs no dependency and no client JS |
| Reduced-motion detection | A `useMediaQuery`-style npm package | A ~10-line native `matchMedia` hook | One query, reused by exactly one feature in this phase (and, per the Motion Contract's standing rule, by any future motion) — a full library is disproportionate |
| Tailwind theme config | A `tailwind.config.js` with a `theme.extend` object (v3-style) | v4's CSS-first `@theme` block in `globals.css` | This is the current, documented v4 mechanism (verified via Context7 `/tailwindlabs/tailwindcss.com`) — writing a v3-shaped config file works against the framework's own current model |
| `robots` metadata | A hand-written `<meta name="robots">` tag in JSX | Next.js Metadata API (`export const metadata = { robots: { index: false } }`) | The framework handles per-route resolution and avoids a manual tag that could drift out of sync with what Next.js itself would emit |

**Exception, stated explicitly so it doesn't read as inconsistent:** the heading trail itself (HOME-06) *is* a hand-rolled scroll-driven animation — REQUIREMENTS.md's Out-of-Scope table bans reaching for an animation *library*, but the trail is explicitly specified as a **port** of an existing, already-validated implementation, not a build-from-scratch decision. Don't reach for Lenis/GSAP/Framer Motion to build it; don't rebuild it from first principles either — port the exact algorithm below.

## Common Pitfalls

### Pitfall 1: Root Dockerfile silently wins the Railway deploy (already flagged in PITFALLS.md #1 — reconfirmed)
**What goes wrong:** Railway detects a root `Dockerfile` and builds it instead of using Railpack, with the build finishing green and the health check passing — the live URL serves the wrong app.
**Why it happens:** Railway's builder-selection logic has no override for this: `railway.json`'s `builder` field cannot force Railpack when a Dockerfile is present (confirmed directly against `docs.railway.com/config-as-code/reference`).
**How to avoid:** Delete `Dockerfile` and `nginx.conf.template` as the literal first commit of this phase, before scaffolding anything else (D-08).
**Warning signs:** A Railway deploy that finishes in well under the time a real Next.js build takes; the live URL showing no Next.js hydration script in dev tools.

### Pitfall 2: Adding `output: 'standalone'` or `output: 'export'` "for best practice"
**What goes wrong:** `output: 'standalone'` is Railway's *own* official guide pattern — but it's designed for Dockerfile-based deploys (`node .next/standalone/server.js`) and requires a manual copy of `public/`/`.next/static` into the standalone folder, a well-documented footgun if skipped. `output: 'export'` changes Railpack's detection to static-site mode, forecloses `next.config` `headers()` (needed by Phase 6's BUILD-04), and is explicitly listed in REQUIREMENTS.md's Out of Scope table.
**Why it happens:** Both are the *first* things most Next.js/Railway tutorials and Railway's own guide recommend, making them a natural but wrong reflex here.
**How to avoid:** Leave `next.config` with no `output` field at all. Plain `next build` + `next start`, zero Dockerfile, is the resolved path (D-08, ARCHITECTURE.md §9).

### Pitfall 3: Driving the trail's per-frame update through React state
**What goes wrong:** A naive React port stores `lagY`/`textShadow` in `useState` and calls the setter every animation frame, causing 60 re-renders/sec on a Client Component tree.
**Why it happens:** `useState` + effects is the default React mental model; the vanilla original's direct `element.style.textShadow = ...` write doesn't have an obvious React equivalent unless you deliberately reach for a ref.
**How to avoid:** Keep the imperative DOM write exactly as the source does it (`headingRef.current.style.textShadow = ...` inside the shared rAF callback), never through component state.
**Warning signs:** Visible jank/frame drops while scrolling; React DevTools showing re-renders on every scroll frame.

### Pitfall 4: One `requestAnimationFrame` loop per heading instead of one shared loop
**What goes wrong:** The `/type` specimen route needs the trail on multiple headings at once (Display + every Heading-role level demonstrated). A naive per-component `useEffect` that calls its own `requestAnimationFrame` "just works" visually but violates the phase's explicit single-shared-loop requirement and schedules N redundant callbacks per frame.
**Why it happens:** The benchmark itself only ever drives one active effect (a tab-switcher for comparing three techniques) — there's no single-instance-to-many-instances example to copy from directly.
**How to avoid:** Build one provider/driver (Architecture Patterns, Pattern 3) that owns the only `requestAnimationFrame` call, iterating a registry of mounted heading instances.

### Pitfall 5: SSR/hydration mismatch on the trail's initial style
**What goes wrong:** If any inline `text-shadow` value is computed differently between server render and first client paint (e.g., computed from `window`-dependent data during SSR by mistake), React logs a hydration warning and may discard/re-render the subtree.
**Why it happens:** Server-rendered JSX has no `window`/`scrollY`/`getBoundingClientRect()` — any code path that tries to compute an initial shadow value at render time (rather than post-mount) will fail or diverge.
**How to avoid:** Server-rendered heading markup carries no `text-shadow` at all; the effect only ever writes it after mount, inside a Client Component's effect.

### Pitfall 6: `prefers-reduced-motion` checked once instead of watched for change
**What goes wrong:** Reading `matchMedia(...).matches` only at mount misses a user toggling the OS-level setting while the tab stays open.
**Why it happens:** Easy to write `if (matchMedia(...).matches) return` once and consider the requirement satisfied.
**How to avoid:** Mirror the benchmark's own pattern — it adds a `change` listener (`reducedMotion.addEventListener('change', () => resize(true))`, `text_trail_demo/index.html:1066`) so a live toggle is respected without a page reload. `MediaQueryList.addEventListener('change', ...)` is universally supported in current evergreen browsers as of 2026.

### Pitfall 7: `robots` metadata silently un-inheriting on a future route
**What goes wrong:** Next.js's metadata merge logic does **not** deep-merge `robots` across route segments — a child route's explicit `robots` field fully *overwrites* the parent's (confirmed directly from Next.js source, `mergeMetadata`'s `case 'robots'` branch). Today this is safe: `/type` inherits root's `noindex` because it declares no `robots` field of its own. But if a future contributor adds page-specific metadata to `/type` (e.g., a custom title) and "helpfully" includes `robots: {}` or omits the intent to keep noindex, it can silently flip the route indexable.
**Why it happens:** The non-merging behavior is not obvious from the API surface — most developers assume metadata composes additively across layouts.
**How to avoid:** If any future page under this phase's routes ever exports its own `metadata`, either omit `robots` entirely (inherits correctly) or explicitly re-declare `{ index: false }` — never assume partial metadata objects merge.

### Pitfall 8: Humane run through any optimization/subsetting tool
**What goes wrong:** Tools like `glyphhanger`/`fonttools` would shrink the file, but Humane's licence explicitly forbids modification without written permission (D-01).
**Why it happens:** Subsetting a large variable font is a very common, usually-correct performance optimization — easy to apply reflexively.
**How to avoid:** `next/font/local` never modifies the source binary; it only generates *additional* fallback CSS. Serve `Humane-VF.ttf` exactly as committed to the repo.

### Pitfall 9: TypeScript 7.0.2 tooling friction
**What goes wrong:** TypeScript 7 is a very recent major version (a native/Go-based compiler rewrite), a large jump from the 5.x line most tutorials and tooling assume. Editor/build friction is plausible on a brand-new major.
**Why it happens:** `npm install -D typescript` with no version pin grabs `latest`, which is 7.0.2 as of this research.
**How to avoid:** Prefer letting `create-next-app@16.3.3` choose its own scaffolded TypeScript version rather than force-installing `latest` separately; if friction appears, the safe fallback is the newest TypeScript 5.x line (Next.js only requires `>=5.1.0`).

### Pitfall 10: Newsreader's Google Fonts axis metadata assumed without confirming against `next/font/google`'s current typed export
**What goes wrong:** Newsreader's `opsz`/`wght`/`ital` axis ranges cited here (6–72, 200–800, 0–1) come from cross-referenced WebSearch results (font specimen pages), not a direct fetch of the live Google Fonts metadata or `next/font/google`'s generated font list.
**Why it happens:** No official, stable Context7-indexed source enumerates the exact current axis ranges per Google Font.
**How to avoid:** Confirm the exact axis values and italic availability directly against `next/font/google`'s typed import (`import { Newsreader } from 'next/font/google'`) at implementation time — this is already flagged as a to-verify item in UI-SPEC.md, carried forward here (see Assumptions Log, A1).

## Code Examples

Verified patterns, either from official sources or from direct reading of the file being ported (line numbers cited).

### The trail algorithm, extracted verbatim from the benchmark (read directly, 2026-08-29)

```js
// Source: text_trail_demo/index.html:648-688 (createTextShadowEffect) + :827-882 (frame)
// Constants: text_trail_demo/index.html:324-327
const MAX_TRAIL = 280;
const MAX_SHADOWS = 240;
const SCROLL_STOP_DELAY = 120; // ms, debounce before treating scroll as "stopped"

// Per-frame (frame(time), :827-882):
const elapsed = Math.min(time - (previousTime || time), 40);           // ms, capped
const smoothing = 1 - Math.exp(-elapsed * 0.009);                       // exponential ease
const targetY = documentTop - scrollY;                                  // where the heading "should" be
if (!inputHeld) lagY += (targetY - lagY) * smoothing;                   // frozen during an active touch/pen drag
lagY = targetY + Math.max(-MAX_TRAIL, Math.min(MAX_TRAIL, lagY - targetY)); // clamp trail length

const distance = Math.abs(lagY - targetY);
const strength = Math.min(1, distance / 3);

// draw(targetY, lagY, strength, color)  — createTextShadowEffect.draw, :663-681
const difference = lagY - targetY;
if (strength <= 0) {
  heading.style.textShadow = 'none';
} else {
  const layers = Math.min(MAX_SHADOWS, Math.max(2, Math.ceil(distance * 2)));
  const shadows = [];
  for (let index = layers; index >= 1; index--) {
    const t = index / layers;
    shadows.push(`0 ${difference * t}px 0 ${color}`); // color: fixed '#171714' ink per UI-SPEC, NOT the benchmark's rainbow trailColor()
  }
  heading.style.textShadow = shadows.join(',');
}

// Settle condition (:859-873): when distance <= 0.15px, snap and stop the loop —
// it does NOT keep scheduling requestAnimationFrame once settled; the next scroll
// event's start() call is what restarts it.
if (distance > 0.15) {
  requestAnimationFrame(frame);
} else {
  lagY = targetY;
  heading.style.textShadow = 'none';
  // loop stops here — no further rAF scheduled until the next scroll/pointer event
}

// Reduced-motion gate (start(), :876-881) — checked BEFORE any frame is ever scheduled:
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function start() {
  if (reducedMotion.matches || animationFrame || !activeEffect?.ready) return;
  animationFrame = requestAnimationFrame(frame);
}
```

**Behavior notes verified by direct read, not to be lost in the port:**
- `layout(reset)` (`:656-661`) reads `heading.getBoundingClientRect()` once per heading (on mount, resize, and reduced-motion change) and stores `documentTop = rect.top + scrollY` — an absolute document-space position recomputed only on those events, not every frame. `targetY` is derived from it fresh every frame using the live `scrollY`.
- Touch/pen drags (`pointerdown`/`pointerup`/`pointercancel`) freeze the smoothing interpolation (`inputHeld = true`) so the smear tracks the drag 1:1 rather than easing; non-touch (wheel/trackpad) scrolling is debounced via the 120ms `SCROLL_STOP_DELAY` timer, with a native `scrollend` listener as a redundant/complementary stop-detection path.
- `document.fonts.ready.then(() => activate...)` (`:1067`) — the benchmark waits for fonts to finish loading before ever measuring `getBoundingClientRect()`, avoiding a stale rect measured against a fallback font. Carry this into the port: only run the initial `layout()` measurement after both mount and `document.fonts.ready` resolve.

### `next/font/local` for the display face

```tsx
// Source: Context7 /vercel/next.js, next/font API reference (font.mdx) — pattern verified,
// weight/display values per UI-SPEC's locked decisions
import localFont from 'next/font/local'

export const humane = localFont({
  src: './Humane-VF.ttf',
  weight: '100 900',
  display: 'optional',
  variable: '--font-humane',
})
```

### `next/font/google` for the body face

```tsx
// Source: Context7 /vercel/next.js — pattern verified; confirm exact axis/style list at implementation (Pitfall 10)
import { Newsreader } from 'next/font/google'

export const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
})
```

### Tailwind v4 `@theme` wired to `next/font` CSS variables

```css
/* Source: Context7 /tailwindlabs/tailwindcss.com, theme.mdx + font-family.mdx */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-display: var(--font-humane), Impact, sans-serif;
  --font-body: var(--font-newsreader), serif;
}
```

### `robots` metadata, root layout

```tsx
// Source: Context7 /vercel/next.js, generate-metadata.mdx — object form resolves to noindex
export const metadata: Metadata = {
  robots: { index: false },
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Nixpacks (Railway's original zero-config builder) | Railpack | Railpack is described by Railway's own docs as "the successor to Nixpacks" | Some older community threads/tutorials still reference Nixpacks by name; behavior described in this research (build/start script detection, `output:'export'` static-site special case) is Railpack-current as of 2026-08-29 |
| `tailwind.config.js` with `theme.extend` | CSS-first `@theme` directive in the stylesheet itself | Tailwind v4.0 | No JS config file needed; design tokens live as CSS custom properties, directly consumable by hand-written CSS too (matches D-04's split) |
| Tailwind v3 PostCSS plugin (`tailwindcss` package itself) | Dedicated `@tailwindcss/postcss` package | Tailwind v4.0 | `postcss-import` and `autoprefixer` are also no longer needed — v4 handles both automatically |
| Railway's own official Next.js guide default (`output: 'standalone'` + Dockerfile) | Zero-config Railpack, no `output` override, no Dockerfile | This project's own D-08 decision, not an industry-wide shift | Deliberately diverges from Railway's first-party guide; documented here so a future contributor doesn't "fix" it back toward the guide's pattern |

**Deprecated/outdated:** `next-mdx-remote` (the original HashiCorp package) is archived — not relevant to Phase 1 (no content pipeline yet), flagged here only because it will matter starting Phase 2; see `.planning/research/STACK.md`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Newsreader's Google Fonts variable axes are `opsz 6–72`, `wght 200–800`, with a true italic (`ital 0–1`) | Summary, Pitfall 10 | If the axis range or italic availability differs, the `next/font/google` call's `weight`/`style` options may need adjustment; low blast radius — caught immediately at build time if the requested axis doesn't exist (Next.js throws) |
| A2 | TypeScript 7.0.2 (npm `latest`) works cleanly with `create-next-app@16.3.3`'s scaffolded config with no manual adjustment | Standard Stack, Pitfall 9 | If incompatible, build/type-check errors appear immediately at `npm install`/first build — cheap to detect, cheap to fix (drop to latest TS 5.x, Next.js only requires ≥5.1.0) |
| A3 | Railway's Dockerfile-vs-Railpack PORT-injection caveat (PORT is injected for Railpack builds but historically reported as *not* injected for Dockerfile builds in a community bug-report thread) is accurate | Summary | Moot for this project specifically — the plan deletes the Dockerfile entirely — but if a future phase reintroduces a Dockerfile for any reason, this should be re-verified against current Railway docs, not assumed from a single community thread |

## Open Questions

1. **Exact colocation path for `Humane-VF.ttf` — `app/fonts/` vs `public/fonts/`**
   - What we know: UI-SPEC.md leaves both options open ("move to `public/fonts/` or `app/fonts/`"); Next.js's own font.mdx examples colocate font files inside `app/` and import them directly (build-time, fingerprinted asset URL, not a public static path).
   - What's unclear: whether there's a project-specific reason to prefer a directly-linkable `public/` path (e.g., reuse by the `/type` specimen route via plain CSS `@font-face` outside `next/font`, which this research does not recommend).
   - Recommendation: use `app/fonts/Humane-VF.ttf`, consistent with the Next.js-idiomatic colocation convention shown in official docs (Architecture Patterns' Recommended Project Structure) — this is a planner decision with no technical blocker either way.

2. **Whether the `/type` specimen route's multiple simultaneous trail instances have any real-world perf ceiling worth pre-testing**
   - What we know: the benchmark caps at 240 shadow layers per heading, one heading active at a time. `/type` will run the trail on multiple headings concurrently (Display + each Heading-role level).
   - What's unclear: whether stacking up to 240 `text-shadow` layers on multiple simultaneous headings causes visible jank on a low-end device — the benchmark's own comment notes "capped at 240 layers to bound paint cost" for a *single* heading, not N.
   - Recommendation: keep the constants unchanged for v1 as UI-SPEC directs ("do not retune"), but flag this as something to actually scroll-test on `/type` once built, specifically on a throttled/mobile profile — not a blocker, a verification step (see Validation Architecture).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Local dev, build tooling | ✓ | v22.20.0 | — (comfortably exceeds Next.js 16's ≥20.9.0 minimum) |
| npm | Package management | ✓ | 10.9.3 | — |
| git | Version control, Railway auto-deploy trigger | ✓ | 2.54.0 | — |
| Railway CLI | Manual deploy inspection/log tailing (optional; auto-deploy on push doesn't require it) | ✓ | 5.45.7 | — |
| Docker | Not required — this phase's deploy path has no Dockerfile | ✓ (present but unused) | 29.6.1 | N/A — deliberately not part of the deploy path (D-08) |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none — every tool this phase needs is already present in the local environment.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (`@playwright/test` 1.62.1) — none currently installed; this is a Wave 0 gap (repo has no `package.json` yet) |
| Config file | none — see Wave 0 Gaps |
| Quick run command | `npx playwright test --project=chromium tests/smear-heading.spec.ts` (single spec, fast feedback per task commit) |
| Full suite command | `npx playwright test` |

**Why Playwright and not a unit-test framework:** every success criterion in this phase is a DOM/runtime/visual behavior — computed `text-shadow` mid-scroll, `prefers-reduced-motion` branching, viewport-dependent `clamp()` values, cumulative layout shift on font load. None of these are exercisable by a pure unit test against isolated functions; they require a real browser context. Keep the suite small and directly tied to the 7 requirement IDs below — this phase's own working agreement is "MVP first," and a sprawling test suite for a two-route holding page would be disproportionate.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUILD-01 | `next build` completes without error | build check | `npm run build` | ❌ Wave 0 |
| BUILD-02 | Live Railway URL returns 200 and the real app's markup (not the old prototype) | smoke (post-deploy) | `npx playwright test tests/deploy-smoke.spec.ts --project=chromium` (parametrized `baseURL`, run against the live Railway URL after each deploy) | ❌ Wave 0 |
| BUILD-03 | Type scale renders within expected bounds at mobile (375px) and desktop (1440px) viewports | e2e | `npx playwright test tests/viewport.spec.ts` | ❌ Wave 0 |
| BUILD-05 | With `reducedMotion: 'reduce'` emulated, heading's computed `text-shadow` stays `'none'` throughout a scroll | e2e | `npx playwright test tests/reduced-motion.spec.ts` | ❌ Wave 0 |
| BUILD-06 | Cumulative Layout Shift ≈ 0 across the font-load window | e2e (Performance Observer via `page.evaluate`) | `npx playwright test tests/font-cls.spec.ts` | ❌ Wave 0 |
| HOME-05 | `/type` specimen route renders every declared type role at its specified face/size/weight (spot-checked via computed style, not full visual regression) | e2e + manual visual review | `npx playwright test tests/type-specimen.spec.ts` (manual: eyeball `/type` itself, since it's the reference artifact by design) | ❌ Wave 0 |
| HOME-06 | Heading's `text-shadow` is non-`'none'` with multiple layers mid-scroll, and returns to `'none'` after `SCROLL_STOP_DELAY` (120ms) + settle | e2e | `npx playwright test tests/smear-heading.spec.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** the single most relevant spec file for the task just completed (e.g., after wiring fonts, run `font-cls.spec.ts`; after porting the trail, run `smear-heading.spec.ts`).
- **Per wave merge:** `npx playwright test` (full suite).
- **Phase gate:** full suite green, plus the one inherently-manual check (BUILD-02's live-URL smoke test run against the actual deployed Railway URL post-push, not just a local dev server) before `/gsd:verify-work`.

### Wave 0 Gaps

- [ ] `package.json` + Next.js scaffold itself — nothing below can run until the app exists (this is the phase's own first deliverable, not strictly a "test gap," but the literal blocking dependency)
- [ ] `playwright.config.ts` — base config, `webServer` pointing at `next dev` for local runs
- [ ] `tests/deploy-smoke.spec.ts` — covers BUILD-02
- [ ] `tests/viewport.spec.ts` — covers BUILD-03
- [ ] `tests/reduced-motion.spec.ts` — covers BUILD-05
- [ ] `tests/font-cls.spec.ts` — covers BUILD-06
- [ ] `tests/type-specimen.spec.ts` — covers HOME-05
- [ ] `tests/smear-heading.spec.ts` — covers HOME-06
- [ ] Framework install: `npm install -D @playwright/test && npx playwright install chromium`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No authentication surface exists anywhere in this phase (two static, unauthenticated routes) |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No access-controlled resources; both routes are intentionally public (one non-indexed, not access-restricted) |
| V5 Input Validation | No | Zero user input anywhere in this phase — no forms, no query-param handling, no interactive elements |
| V6 Cryptography | No | No secrets, tokens, or cryptographic operations in this phase |
| V14 Configuration (headers, dependency hygiene) | Partially — dependency hygiene only | Real HTTP security response headers are explicitly deferred to Phase 6 (BUILD-04) per REQUIREMENTS.md's traceability table — do not add `headers()` config in this phase, it would be redundant work re-touched in Phase 6. Dependency-hygiene is covered by this document's Package Legitimacy Audit |

**Why so few categories apply:** this phase ships a holding page and a non-indexed specimen route with zero forms, zero authentication, zero user-generated content, and zero server-side data handling. The realistic security surface for a static two-route Next.js app is supply-chain hygiene (already addressed above) — everything else in the standard ASVS checklist requires a feature (auth, input, stored data) this phase doesn't have.

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious/typosquatted npm dependency introduced during scaffold | Tampering | Package Legitimacy Audit (above) — slopcheck + registry verification before any `npm install`; commit the lockfile |
| Default `X-Powered-By: Next.js` header disclosing framework/version | Information Disclosure | Deferred to Phase 6 (BUILD-04) per requirements traceability — `poweredByHeader: false` is a one-line fix, but adding it piecemeal now would be redone/re-audited in Phase 6's dedicated headers pass; do not add it in this phase to avoid scope creep into work that phase owns |
| Stale Dockerfile deploying an unintended artifact to a public URL | Tampering (of the deployed artifact, not the code) | Delete `Dockerfile`/`nginx.conf.template` as this phase's first task (D-08, Pitfall 1) |

## Sources

### Primary (HIGH confidence)
- Context7 `/vercel/next.js` — `next/font/local` and `next/font/google` API reference (`src`, `weight`, `display`, `adjustFontFallback`, `.ttf` support), `next start` CLI PORT/hostname defaults, `robots` metadata resolution and non-merge behavior (read directly from Next.js source via Context7: `resolve-basics.ts`, `metadata-resolution-primitives.ts`), Turbopack's local-font fallback computation (`font_fallback.rs`, `FontAdjustment`) vs the Google loader's `@capsizecss/metrics` name-lookup (`get-fallback-font-override-metrics.ts`)
- Context7 `/tailwindlabs/tailwindcss.com` — v4 `@theme` directive, `@plugin` directive for `@tailwindcss/typography`, Next.js installation guide (`@tailwindcss/postcss`, `@import "tailwindcss"`)
- `railpack.com/languages/node` (fetched directly, 2026-08-29) — Node provider package-manager/build/start-command detection order, Next.js `output:'export'` static-site special case, runtime env vars
- `docs.railway.com/config-as-code/reference` (fetched directly) — confirms no `builder` override can force Railpack over a detected root Dockerfile
- `docs.railway.com/networking/troubleshooting/application-failed-to-respond` (fetched directly) — confirms Railway auto-injects `PORT`, requires binding `0.0.0.0`
- `text_trail_demo/index.html` (read directly, full file) — the entire trail algorithm: `createTextShadowEffect` (`:648-688`), shared driver `frame()`/`start()`/`handleScroll()` (`:827-1026`), constants (`:324-327`), heading style (`:88-99`)
- npm registry (`npm view`, run directly 2026-08-29) — current published versions of every package in Standard Stack
- `slopcheck` v0.6.1 (run directly, 2026-08-29) — Package Legitimacy Audit
- `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md` — prior project research, independently version-verified the same day; cross-checked, not contradicted

### Secondary (MEDIUM confidence)
- WebSearch, Railway/Railpack builder-priority behavior (multiple results, cross-referenced against the primary sources above and against this project's own live-API-verified service state in CONTEXT.md)
- WebSearch, Newsreader Google Fonts axis metadata (fontsinuse.com, csstypestudio.com, Google Fonts specimen page reference) — cross-referenced across independent sources but not directly confirmed against `next/font/google`'s live typed export (Assumptions Log A1)

### Tertiary (LOW confidence)
- None retained without escalation — all WebSearch-only findings above were either cross-verified against an official source or explicitly logged in the Assumptions Log.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified directly against the npm registry the same day, cross-checked against independently-researched STACK.md
- Architecture: HIGH — Railway/Railpack mechanics confirmed via official docs fetched directly; the trail algorithm confirmed via direct, complete read of the source file being ported; Next.js/Tailwind patterns confirmed via Context7
- Pitfalls: HIGH — each pitfall traces to a specific, cited verification (official docs, direct source read, or Next.js internals via Context7), not inference

**Research date:** 2026-08-29
**Valid until:** 30 days for the Next.js/Tailwind/font mechanics (stable, well-documented APIs). Re-verify Railway/Railpack builder behavior specifically if execution is delayed more than ~14 days — Railpack is a young, actively-evolving product and its documented behavior could shift faster than the rest of this stack.
