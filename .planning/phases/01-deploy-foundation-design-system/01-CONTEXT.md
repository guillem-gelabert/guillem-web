# Phase 1: Deploy Foundation & Design System - Context

**Gathered:** 2026-08-29
**Status:** Ready for planning

<domain>
## Phase Boundary

A live, deployed Next.js application at a stable Railway URL, carrying an authored
typographic system, self-hosted fonts, accessibility/motion defaults, and the
scroll-driven heading trail — all standing before any real content exists.

Covers BUILD-01, BUILD-02, BUILD-03, BUILD-05, BUILD-06, HOME-05, HOME-06.

**Explicitly NOT this phase:** the positioning sentence (HOME-01), navigation to
other surfaces (HOME-03), the landing layout at low item count (HOME-04), the work
list (WORK-01/02) — all Phase 3. The content pipeline and writing migration are
Phase 2. Real security headers (BUILD-04), robots/sitemap and OG metadata
(FIND-01/02) are Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Typeface & Type Scale

- **D-01: Humane V2.0 stays as the display face.** Already in the repo at
  `text_trail_demo/assets/Humane-VF.ttf` (85 KB, single `wght` axis 100–900), and
  already proven against the trail effect at 160px / 0.82 line-height. Ultra-condensed
  big type as structural element is the constructivist move in BRIEF §8.
  - **Licence constraint:** freeware for personal and commercial use, but the files
    **may not be modified without written permission** from Rajesh Rajput. This rules
    out subsetting. `next/font/local` serves the file as-is and only generates fallback
    metric overrides, so it is compatible — do not add a subsetting step.
  - **Accepted risk:** ultra-condensed at heavy weight is exactly PITFALLS #11. Every
    heading style must be run through a contrast checker at its actual rendered
    size/weight, and letter-spacing must stay capped on real words.

- **D-02: Body/reading face is a text serif.** Newsreader / Literata / Source Serif /
  Spectral class — the specific face is Claude's pick during planning. Rationale: it
  is the register the audience (graphics editors, newsroom leads) reads in, it serves
  BRIEF axis 3 (subject-led / narrative), and it is the cheapest available signal of
  editorial rather than dev-portfolio. Inter was explicitly rejected as the typographic
  equivalent of the default (anti-goal #5).
  - Must be non-condensed regardless of what the display type does (PITFALLS #11).
  - This face carries the real reading load: 13 migrated posts, the case study, the CV.

- **D-03: Fluid display, fixed body.** Humane headings on a `clamp()` curve so
  poster-scale type survives to a 375px viewport; body serif locked to two or three
  fixed sizes so measure and vertical rhythm stay controlled. Note the demo heading is
  `white-space: nowrap` at a fixed 160px — that will overflow on mobile and must not
  be ported verbatim. (The `text-shadow` technique, unlike the WebGL one, does not
  require `nowrap`; shadows render correctly on wrapped lines.)

- **D-04: Tailwind v4 `@theme` for tokens and layout; plain CSS for the typographic
  rules.** `@tailwindcss/typography` supplies prose defaults for the 13 migrated posts
  (Phase 2 consumes this). The `clamp()` curves, optical tracking and OpenType feature
  settings go in a small global stylesheet reading the same CSS variables that `@theme`
  defines. This is research's recommendation in STACK.md §6; the alternative
  (plain CSS only, no Tailwind) was considered and declined.

### Deployed Surface

- **D-05: `/` is a holding page; a non-indexed `/type` specimen route sits alongside it.**
  The holding page carries one heading (exercising the trail at poster scale) and a
  paragraph of the serif. The specimen shows every level of the scale, a prose block,
  and the trail at each heading level — it makes success criterion 2 ("a deliberate
  authored typographic system") actually checkable, and survives as the reference that
  Phases 2–6 check new components against.

- **D-06: Holding page copy is name only — no positioning claim.** The heading is
  "Guillem Gelabert" plus a short neutral line of serif body. HOME-01's real positioning
  sentence belongs to Phase 3; nothing here should need unwinding, and no half-formed
  argument should sit on a live URL during a job hunt.

- **D-07: `robots: { index: false }` ships in Phase 1's root metadata and is flipped in
  Phase 6 as part of FIND-02.** Without it the site is crawlable by default through
  Phases 1–5. A holding page or half-migrated archive getting indexed and cached is a
  worse first impression than nothing, and de-indexing is slow.
  - **Planner note:** this creates a required action in Phase 6. FIND-02's plan must
    explicitly flip this flag, or launch ships noindex — the worse failure.

- **D-08: Deploy first, then design.** Task order is: delete `Dockerfile` and
  `nginx.conf.template` → scaffold bare Next.js → push → confirm
  `web-production-9cedb.up.railway.app` serves it → only then build the type system.
  This retires PITFALLS #1 and #4 on day one, which is the phase's stated reason for
  existing. Every later commit is then a known-good increment.

### Claude's Discretion

Two gray areas were surfaced and deliberately left undiscussed. Research and planning
resolve them:

- **Heading trail scope and tuning.** Which headings carry the trail (all `h1`–`h6`,
  only `h1`/`h2`, only the landing view), whether it runs on writing/post pages where
  prose readability matters, trail length and settle feel, and the reduced-motion
  fallback. Start from the benchmark's own constants (`MAX_TRAIL = 280`,
  `MAX_SHADOWS = 240`, `SCROLL_STOP_DELAY = 120`, smoothing `1 - exp(-elapsed * 0.009)`,
  strength `min(1, distance / 3)`) and its early-return-on-reduced-motion behaviour —
  which yields a plain, entirely static heading, satisfying BUILD-05.
- **Colour system and dark mode.** The constructivist palette, how restrained it is,
  and whether the site ships light-only or light + dark. The benchmark already runs
  `#f2eee5` warm off-white on `#171714` near-black with horizontal rules every 12.5vh,
  which is a usable starting point. BRIEF §8's trap applies: keep geometry unmistakably
  ornamental, avoid anything implying an encoded scale. Dark mode doubles every contrast
  check against the heavy display type (PITFALLS #11) — weigh that cost before adding it.

Also at Claude's discretion: the specific serif (D-02), `font-display` strategy per font
role (`swap` vs `optional` — drives BUILD-06's no-layout-shift criterion), the code/mono
face for Phase 2's technical posts, and vertical rhythm / baseline approach.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design direction (load-bearing — this is the project's point of view)
- `BRIEF.md` — full elicitation. §5 design principles, §8 aesthetic direction and the
  "looks like data, isn't" trap, §9 anti-goals. §1 (the allocation principle: engineering
  is demonstrated, never claimed in copy) governs all copy on the holding page.
- `.planning/PROJECT.md` — Constraints and Key Decisions tables; the Out of Scope list is
  the named checklist each surface is checked against (PITFALLS #15).

### The heading trail (port, do not rebuild)
- `text_trail_demo/index.html` — three-way technique benchmark.
  - `createTextShadowEffect` at `:648-688` — the adopted implementation.
  - Shared rAF driver `frame()` at `:827-882` — lag integration, strength curve,
    settle-and-stop logic.
  - Constants at `:324-328` — `MAX_TRAIL`, `MAX_SHADOWS`, `SCROLL_STOP_DELAY`,
    `reducedMotion` matcher.
  - `start()` at `:877` — the `prefers-reduced-motion` early return that satisfies BUILD-05.
  - Heading style at `:88-99` — note `white-space: nowrap` and the fixed 160px, neither of
    which survives contact with D-03.
- `text_trail_demo/assets/Humane-VF.ttf` — the display face. Move into the Next.js app;
  do not modify or subset (D-01).

### Stack and architecture
- `.planning/research/STACK.md` — versions, install commands, Tailwind v4 and `next/font`
  guidance. **§4 and §7 are superseded — see the stale-research note below.**
- `.planning/research/ARCHITECTURE.md` §1 — the route and file tree this phase establishes
  (`app/layout.tsx`, `app/globals.css`, `app/mdx-components.tsx`).
- `.planning/research/ARCHITECTURE.md` §7 — what to extract now vs. what is premature.
  No `<Card>`/`<Badge>`/`<Tag>` system in v1.
- `.planning/research/ARCHITECTURE.md` §9 — fate of the existing Dockerfile/nginx config.

### Pitfalls that land in this phase
- `.planning/research/PITFALLS.md` #1 — the root Dockerfile silently wins the Railway
  deploy. **Confirmed live** against the Railway API: the `web` service is set to the
  Railpack builder, and Railpack loses to a root Dockerfile with no override.
- `.planning/research/PITFALLS.md` #11 — extreme weights/condensed widths break
  screen-reader pronunciation and contrast. Directly constrains D-01.
- `.planning/research/PITFALLS.md` #12 — motion sneaking in without a
  `prefers-reduced-motion` check. Gate from the first component, not retrofitted (BUILD-05).
- `.planning/research/PITFALLS.md` #13 — font loading undermining the design argument.
  Drives BUILD-06 and the `font-display` choice.

### Requirements
- `.planning/REQUIREMENTS.md` — BUILD-01/02/03/05/06, HOME-05/06 and the Out of Scope table.
- `.planning/ROADMAP.md` § Phase 1 — the five success criteria this phase is verified against.

### Stale research — do NOT follow
- `.planning/research/STACK.md` §4 ("Rendering strategy — resolved") and §7 (Deployment
  mechanics) recommend `output: 'export'` plus an updated Dockerfile + nginx. **Both are
  overturned.** `output: 'export'` forecloses `next.config` `headers()`, which BUILD-04
  (Phase 6) depends on, and it is listed under Out of Scope in REQUIREMENTS.md. The
  resolved path is plain `next build` + `next start` on Railway's zero-config Railpack
  builder, with the root `Dockerfile` and `nginx.conf.template` deleted. STATE.md's
  Accumulated Context records this; ARCHITECTURE.md §9 and PITFALLS #1 are consistent
  with it. STACK.md is the only stale document.

</canonical_refs>

<code_context>
## Existing Code Insights

There is no application code yet — this is a greenfield Next.js scaffold. What exists is
one benchmark, one dead prototype, and a live Railway service.

### Reusable Assets

- **`text_trail_demo/index.html` `createTextShadowEffect` (`:648-688`)** — the adopted
  HOME-06 implementation, ~35 lines. Reads a heading's `getBoundingClientRect()`, tracks a
  lagging `lagY`, and emits a stacked `text-shadow` string (`0 {offset}px 0 {color}` × N
  layers, N = `min(240, max(2, ceil(distance * 2)))`). Port this; do not rebuild.
- **`text_trail_demo/index.html` `frame()` (`:827-882`)** — the shared rAF driver. Contains
  the exponential smoothing, the trail clamp, the strength curve, and the
  settle-below-0.15px-then-stop logic that satisfies "settles when scrolling stops".
- **`text_trail_demo/index.html` `start()` (`:877`)** — `if (reducedMotion.matches ...) return;`.
  The reduced-motion gate already exists in the source being ported; carry it across rather
  than adding one later (PITFALLS #12).
- **`text_trail_demo/assets/Humane-VF.ttf`** — the display face (D-01). Move to the app,
  load via `next/font/local`, no subsetting.
- **Benchmark palette (`:15-45`)** — `#f2eee5` on `#171714`, horizontal rules every 12.5vh.
  A usable starting point for the undiscussed colour decision.

### Established Patterns

None — there is no prior application code to be consistent with. The constraints come from
documents rather than from code: BRIEF.md's principles, PROJECT.md's Out of Scope list, and
ARCHITECTURE.md §1/§7's file tree and "premature at this size" list.

### To Delete

- **`Dockerfile`** (root) — copies `prototype-stack.html` into `nginx:alpine`. Overrides
  Railpack on Railway. **First task of this phase.**
- **`nginx.conf.template`** (root) — SPA-style `try_files` fallback, obsolete with the
  Dockerfile.
- **`prototype-stack.html`** — the dead static prototype the Dockerfile shipped. Nothing
  references it once the Dockerfile is gone.

### Integration Points — Railway (verified against the live API, 2026-08-29)

Ground truth differs from what the planning docs assume. The service **already exists**;
this phase does not create one.

- Project `guillem-web` — id `f6be1197-bc33-469e-8f16-d528e44c9f0f`, one environment:
  `production` (`d6c7e845-df3b-496c-b061-4976fbaf5084`).
- Service **`web`** — id `1ee326d6-e9fd-4087-8a01-da28701501a2`. Source:
  `guillem-gelabert/guillem-web` branch `master`. Builder: **RAILPACK** (already the
  decided path). Region `europe-west4-drams3a`, 1 replica. **No environment variables set.**
  - Stable URL for BUILD-02: **`web-production-9cedb.up.railway.app`**
  - Auto-deploys on push to `master`; `git.branching_strategy` is `none`, so every commit
    in this phase ships. D-08's ordering exists because of this.
- Service **`guillem-edge`** — id `fc6f7663-3f84-4dfe-9f87-3a970b6ce3bb`. A **different
  repo** (`guillem-gelabert/guillem-edge`, branch `main`). Not part of this milestone.
  Touch nothing on it.

</code_context>

<specifics>
## Specific Ideas

- The trail is a **port, not a reimplementation**. The benchmark at
  `text_trail_demo/index.html` was built to compare three techniques (WebGL sampled mask,
  CSS `text-shadow`, alpha-mask extrusion); `text-shadow` won because it needs no WebGL
  context or canvas, runs on a live DOM heading, and degrades to a plain heading. It reads
  as a typographic treatment rather than a set piece — which is what keeps HOME-06 inside
  the Typographic tier rather than deferred to v3 with RICH-01.
- The `/type` specimen route is not throwaway scaffolding. It is the reference artifact
  later phases check new components against, and the thing that makes "a deliberate,
  authored typographic system" a checkable claim rather than a judgment call.
- Inter was named and rejected for body copy. The reasoning is on the record: it is the
  most-used UI face on the web, which makes it the typographic form of anti-goal #5.

</specifics>

<deferred>
## Deferred Ideas

- **`guillemgelabert.com` is already attached to the `guillem-edge` service** (both apex
  and `www`, on port 8080) — pointed at a different repo. PROJECT.md lists the custom
  domain as unresolved and defers it to v2 as BUILD-07. That framing is now slightly wrong:
  when BUILD-07 is picked up it is a **domain reassignment away from an existing service**,
  not a fresh setup. Recorded here so v2 planning starts from the real state. No action in
  v1 — v1 ships on the Railway URL, per the locked constraint.
- **Flipping `robots: { index: false }`** (D-07) is a required action in Phase 6's FIND-02
  plan. Not a new capability; a dependency this phase creates.
- **Print stylesheet for the CV** (PITFALLS #16, v2's PROF-06) — out of scope; noted only
  because the type scale decided here is what a print pass would later have to override.

</deferred>

---

*Phase: 1-Deploy Foundation & Design System*
*Context gathered: 2026-08-29*
