# Phase 1: Deploy Foundation & Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-29
**Phase:** 1-Deploy Foundation & Design System
**Areas discussed:** Typeface & type scale, What the deployed page shows
**Areas offered but not selected:** Heading trail scope & tuning, Colour system & dark mode

---

## Area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Typeface & type scale | Humane VF or not; body face; fluid vs fixed scale; where tokens live | ✓ |
| Heading trail scope & tuning | Which headings, trail length, settle feel, reduced-motion fallback | |
| Colour system & dark mode | Constructivist palette, BRIEF §8 trap, light-only vs light+dark | |
| What the deployed page shows | Holding page, type specimen, or landing skeleton | ✓ |

---

## Typeface & Type Scale

### Q1 — Is Humane the site's display face, or was it demo material?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Humane | Already in repo, proven against the trail at 160px/0.82. Ultra-condensed structural type per BRIEF §8. Costs: freeware licence not OFL, one `wght` axis, PITFALLS #11 contrast/screen-reader risk | ✓ |
| Different condensed grotesque | Same role, clearer licence, more axes (Archivo, Anton, Oswald, Bebas). Costs: trail constants were fit to Humane's metrics | |
| Non-condensed display face | Break from big-condensed entirely. Least trend-exposed, but gives up the poster-scale headline the trail is built for | |
| You decide | Claude picks during planning | |

**User's choice:** Keep Humane
**Notes:** Font metadata read directly during discussion — Humane V2.0 by Rajesh Rajput, single `wght` axis 100–900, 85 KB. Licence permits free personal and commercial use but forbids modifying the files without written permission, which rules out subsetting. `next/font/local` is compatible since it serves the file unmodified.

### Q2 — What body/reading face pairs with Humane?

| Option | Description | Selected |
|--------|-------------|----------|
| A text serif (Recommended) | Newsreader/Literata/Source Serif/Spectral. Max contrast with Humane; the register the audience reads in; serves BRIEF axis 3; cheapest signal of editorial over dev-portfolio | ✓ |
| A grotesque that isn't Inter | Public Sans, IBM Plex Sans, Geist. Keeps constructivist all-sans discipline. Costs: reads design-studio not newsroom; 13 technical posts in undifferentiated sans | |
| Inter, as in the demo | Zero new decisions, known metrics, great screen legibility. Costs: most-used UI face on the web — the typographic form of anti-goal #5 | |
| You decide | Claude picks during planning | |

**User's choice:** A text serif
**Notes:** Specific face left to planning. PITFALLS #11 requires the body face be non-condensed regardless of the display type.

### Q3 — How should the type scale respond across viewports?

| Option | Description | Selected |
|--------|-------------|----------|
| Fluid display, fixed body (Recommended) | Humane on a `clamp()` curve; body serif at 2–3 fixed sizes so measure and rhythm stay controlled | ✓ |
| Fluid throughout | One continuous scale, no breakpoint cliffs. Costs: line length drifts, 65–75ch measure only approximate | |
| Fixed steps at breakpoints | Every size deliberate and checkable. Costs: more declarations, type snaps between breakpoints | |
| You decide | Claude picks during planning | |

**User's choice:** Fluid display, fixed body
**Notes:** Raised in the question — the demo heading is `white-space: nowrap` at a fixed 160px and will overflow a 375px viewport (BUILD-03). Must not be ported verbatim.

### Q4 — Where do the design tokens and typographic rules live?

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind v4 + CSS for type (Recommended) | `@theme` tokens, utilities for layout/spacing, `@tailwindcss/typography` for prose, `clamp()`/tracking/OpenType in a small global stylesheet. STACK.md §6's recommendation. Costs: two systems to sync | ✓ |
| Plain CSS only | globals.css + CSS Modules, custom properties as sole token layer. ARCHITECTURE §7 counts under ten components in v1. Costs: prose styling hand-written | |
| Tailwind for everything | One system, nothing to sync. Costs: exactly where research says utilities fight fine typographic control | |
| You decide | Claude picks during planning | |

**User's choice:** Tailwind v4 + CSS for type
**Notes:** Research flagged this as MEDIUM confidence with an explicit alternative, which is why it was put to the user rather than treated as settled.

---

## What the Deployed Page Shows

**Investigation before the questions:** the Railway API was queried directly. The `web` service already exists, already connected to `guillem-gelabert/guillem-web` on `master`, already on the Railpack builder, serving `web-production-9cedb.up.railway.app` with no variables set. A second service `guillem-edge` runs a different repo and already holds `guillemgelabert.com`. This changed the framing of every question below.

### Q1 — What does `/` render at the end of Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Holding page + specimen route (Recommended) | Minimal `/` carrying one trail heading and a serif paragraph, plus a non-indexed `/type` specimen showing the whole scale. Makes criterion 2 checkable; survives as the reference for Phases 2–6 | ✓ |
| Holding page only | Smallest surface, nothing to delete. Costs: criterion 2 verified against one heading and one paragraph | |
| Type specimen at `/` itself | On-brand for a type-led site, no second route. Costs: it's the live URL during a job hunt and reads unfinished | |
| Landing skeleton with placeholder copy | Build the Phase 3 layout now, fill later. Costs: moves HOME-04's scope into Phase 1 and pre-commits the landing structure | |

**User's choice:** Holding page + specimen route

### Q2 — Should the site be crawlable while half-built?

| Option | Description | Selected |
|--------|-------------|----------|
| noindex until Phase 6 (Recommended) | `robots: { index: false }` in Phase 1 root metadata, flipped by FIND-02. A half-built site indexed during a job hunt is worse than nothing; de-indexing is slow | ✓ |
| Crawlable from the start | URL isn't distributed, organic discovery near zero, no flag to remember. A forgotten noindex at launch is the worse failure | |
| You decide | Claude picks during planning | |

**User's choice:** noindex until Phase 6
**Notes:** The rejected option's argument is real and was recorded as a planner note in CONTEXT.md — Phase 6's FIND-02 plan must explicitly flip the flag.

### Q3 — Should Phase 1 gate on a verified green deploy before the design system?

| Option | Description | Selected |
|--------|-------------|----------|
| Deploy first, then design (Recommended) | Delete Dockerfile → scaffold bare Next.js → push → confirm the URL serves it → then build the type system. Retires PITFALLS #1 and #4 on day one | ✓ |
| Build locally, deploy once at the end | Fewer half-finished public states. Costs: a deploy problem surfaces with the most code to bisect — the failure the phase ordering exists to avoid | |
| You decide | Claude picks during planning | |

**User's choice:** Deploy first, then design
**Notes:** Framed by the finding that the service auto-deploys from `master` and `git.branching_strategy` is `none`, so every commit in this phase ships regardless.

### Q4 — What words go on the holding page?

| Option | Description | Selected |
|--------|-------------|----------|
| Name only, no claim (Recommended) | Heading is "Guillem Gelabert" plus a short neutral serif line. No positioning claim, so Phase 3 has nothing to unwind | ✓ |
| A draft positioning sentence | Starts the hardest copy problem early. Costs: HOME-01's substance landing in Phase 1; a weak draft on a live URL | |
| Name plus "in progress" note | Honest about state, serves BRIEF §5 principle 5. Costs: "under construction" is its own genre, reads as placeholder | |
| You decide | Claude picks during planning | |

**User's choice:** Name only, no claim

---

## Wrap-up

Offered "Explore more gray areas" (heading trail scope & tuning, colour system & dark mode) or "More questions on this area". User chose **I'm ready for context**.

## Claude's Discretion

- **Heading trail scope and tuning** — which headings carry it, whether it runs on prose pages, trail length, settle feel, reduced-motion fallback. Benchmark constants and its existing reduced-motion early-return are the starting point.
- **Colour system and dark mode** — constructivist palette, restraint level, light-only vs light+dark. Benchmark palette (`#f2eee5` / `#171714`) is a usable start.
- The specific text serif for body copy.
- `font-display` strategy per font role (`swap` vs `optional`), which drives BUILD-06.
- Code/mono face for Phase 2's technical posts.
- Vertical rhythm / baseline approach.

## Deferred Ideas

- **`guillemgelabert.com` already attached to the `guillem-edge` service** (apex and `www`, port 8080), pointed at a different repo. PROJECT.md treats the custom domain as unresolved and defers it to v2 as BUILD-07 — the real v2 task is a reassignment away from an existing service, not a fresh setup. No v1 action.
- **Flipping `robots: { index: false }`** — a dependency Phase 1 creates for Phase 6's FIND-02 plan.
- **Print stylesheet for the CV** (PITFALLS #16, v2's PROF-06) — noted only because the type scale decided here is what a print pass would later override.
