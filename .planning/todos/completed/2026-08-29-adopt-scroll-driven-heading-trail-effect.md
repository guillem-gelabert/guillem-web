---
created: 2026-08-29T13:15:53.694Z
title: Adopt scroll-driven heading trail effect
area: ui
resolves_phase: 1
files:
  - text_trail_demo/index.html
  - text_trail_demo/index.html:827-882
  - text_trail_demo/index.html:481-646
  - text_trail_demo/index.html:648-688
  - text_trail_demo/index.html:690-826
  - text_trail_demo/index.html:89-99
  - text_trail_demo/assets/Humane-VF.ttf
---

## Problem

Headings across the site should carry a scroll-driven trailing / smear effect. This is a
settled design intent, not an idea to explore — a working three-way benchmark of the effect
already exists in the repo at `text_trail_demo/index.html` (1071 lines, fully self-contained,
with a self-hosted `Humane-VF.ttf` variable font under `text_trail_demo/assets/`). It needs to
be carried into the Next.js build rather than rediscovered.

### What the demo is

Titled "Text-smear technique benchmark". A tabbed comparison of three implementations of the
same effect: a heading that lags behind the scroll position and smears along the vertical axis
between its resting position and its lagged position. Includes live FPS and lag-distance
meters, plus sliders for size / weight / letter-spacing.

### Shared driver — one rAF loop (`index.html:827-882`)

- `targetY = documentTop - scrollY`; `lagY` chases `targetY` with exponential smoothing
  (`1 - Math.exp(-elapsed * 0.009)`), clamped to `MAX_TRAIL = 280px`
- `strength = min(1, distance / 3)`
- The loop parks itself when `distance < 0.15px` and restarts on scroll — it is **not** a
  permanent rAF, which matters for battery and for the performance budget
- Trail colour cycles hue at `HUE_SPEED = 110`
- Gated on `prefers-reduced-motion`: `start()` returns early when it matches
- Pointer-held state freezes the trail; `scrollend` plus a `SCROLL_STOP_DELAY = 120ms`
  fallback settle it

### The three candidate techniques

| # | Technique | Function | Notes from the demo |
|---|-----------|----------|---------------------|
| 1 | WebGL sampled mask | `createShaderEffect` (`:481-646`) | Heading rendered to an SVG-embedded canvas texture; one draw call, 56 mask samples interpolated between origin and lag position taking max alpha; `gl.scissor` limits the render region to the swept bounding box. Demo calls it "smoothest at long trail lengths". |
| 2 | CSS `text-shadow` | `createTextShadowEffect` (`:648-688`) | A stack of solid text-shadows at 0.5px spacing, capped at `MAX_SHADOWS = 240` layers to bound paint cost. Simplest — pure CSS on a live DOM heading, no canvas, no WebGL context. |
| 3 | Alpha-mask extrusion | `createAlphaMaskEffect` (`:690-826`) | Raster glyph mask expanded by a per-column sliding maximum, producing a true swept silhouette. |

**Which technique to ship is still open.** The benchmark exists precisely to settle it, but no
decision has been recorded.

### Typography in the demo (`index.html:89-99`, `@font-face` at `:8-14`)

`font-family: "Humane"` (self-hosted variable TTF, weight axis 100-900), `font-size: 160px`,
`font-weight: 800`, `line-height: 0.82`, `white-space: nowrap`.

Note the demo's headings are `white-space: nowrap` at 160px — the effect has not been tested
against wrapping headings or narrow viewports.

## Solution

Lands on **Phase 1 (Deploy Foundation & Design System)**, since it is a heading treatment and
therefore part of HOME-05 (deliberate typographic system) and appears on every heading built
after it. Two existing requirements already cover parts of the work:

- **BUILD-05** (reduced-motion respected) — the demo already gates on `prefers-reduced-motion`,
  so port that gate rather than rebuilding it
- **BUILD-06** (self-hosted fonts, no layout shift) — Humane-VF is already self-hosted; moving
  it to `next/font` covers this

### Scope question — RESOLVED 2026-08-29

This conflicts with scope decisions locked during the v1.0 re-scope, and the conflict is
recorded here rather than resolved:

- `BRIEF.md` §4 axis 2 stages the site **Typographic → Responsive → Performative**, and the
  milestone is locked at **Typographic**
- `PROJECT.md` lists "Performative-tier motion" under **Out of Scope**, with `RICH-01`
  (Performative-tier motion) deferred to v2 in `REQUIREMENTS.md`
- A scroll-reactive smear is at minimum **Responsive** tier and, in its WebGL form, arguably
  **Performative**

`BRIEF.md` §5 principle 3 is the specific tension: "earned motion over introduced motion —
visual sophistication arrives after the work that justifies it, not before." Anti-goal #2
("nice art project, can't ship") is what a performative treatment over thin work produces.

**Decision (Guillem, 2026-08-29): ship the CSS `text-shadow` version in v1.**

The axis-2 staging was reinterpreted rather than overridden. It exists to say that *adding
content matters more than adding fanciness* — it orders effort, it does not ban motion. Some
animation has to be there for the page to look beautiful. So the heading trail is in scope at
the Typographic tier; what stays deferred to v3 is the performative *set pieces* — the
scroll-driven variable-font hero, WebGL and Three.js.

Recorded as:
- `REQUIREMENTS.md` → new **HOME-06** (v1), mapped to Phase 1
- `REQUIREMENTS.md` → `RICH-01` narrowed to set pieces only, explicitly excluding the trail
- `PROJECT.md` → Out of Scope, Constraints and Key Decisions all reworded from "no
  performative motion" to "no performative set pieces"
- `ROADMAP.md` → Phase 1 gains HOME-06 and a fifth success criterion

The demo file and its font asset are now load-bearing — Phase 1 ports `createTextShadowEffect`
and the shared rAF driver from them rather than rebuilding. They must not be lost.
