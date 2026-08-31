---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Working Site
status: executing
stopped_at: Phase 2 UI-SPEC approved
last_updated: "2026-08-31T11:23:23.704Z"
last_activity: 2026-08-31 -- Phase 03 execution started
progress:
  total_phases: 6
  completed_phases: 2
  total_plans: 20
  completed_plans: 11
  percent: 33
---

# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-08-29)

**Core value:** A visitor scanning a shortlist can tell within ninety seconds that Guillem has editorial judgment as well as craft — enough to decide the conversation is worth opening.
**Current focus:** Phase 03 — Work List & Landing Skeleton

## Current Position

Phase: 03 (Work List & Landing Skeleton) — EXECUTING
Plan: 1 of 9
Status: Executing Phase 03
Last activity: 2026-08-31 -- Phase 03 execution started

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01 P01 | 8min | 3 tasks | 20 files |
| Phase 01 P02 | 4min | 2 tasks | 6 files |
| Phase 01 P03 | 4min | 2 tasks | 6 files |
| Phase 01 P04 | 12min | 2 tasks | 8 files |

## Accumulated Context

### Roadmap Evolution

- Phase 2 edited: Re-scoped to Content Pipeline only; legacy 2020 writing migration (WRIT-02, WRIT-03) deferred to v2. WRIT-01 retained — index ships holding the case study. BUILD-04 rationale clause trimmed.

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Headings carry a scroll-driven trail, built with stacked CSS `text-shadow` — ported from the existing benchmark at `text_trail_demo/index.html` (`createTextShadowEffect` at `:648-688`, shared rAF driver at `:827-882`), not rebuilt. Added as HOME-06 in Phase 1.
- Axis-2 staging clarified: Typographic → Performative orders *effort* (content before fanciness), it does not ban motion. Animation needed for the page to look beautiful is in scope at every tier; what waits for v3 is performative set pieces (variable-font hero, WebGL/Three.js). PROJECT.md and REQUIREMENTS.md reworded accordingly.

- Roadmap: merged research's suggested "Content Pipeline" and "Writing Archive Migration" phases into one Phase 2 — the pipeline has no requirement of its own, only the migrated content proves it (see ROADMAP.md Overview for full reasoning).
- Roadmap: Phase 3 (Work List & Landing Skeleton) builds the featured slot's code and layout only; Phase 4 (The Case Study) finalizes the featured entry's annotation copy and wires the slot to real content, so copy is written once the case study prose exists.
- Deployment path resolved: plain `next build` + `next start` on Railway's zero-config Node builder — no `output: 'export'`, no `output: 'standalone'`, no custom Dockerfile. The existing root `Dockerfile`/`nginx.conf.template` must be deleted as the first task of Phase 1.
- Content pipeline: two-renderer dispatch by file extension — plain Markdown for the 13 migrated legacy posts, MDX (`next-mdx-remote-client`) for new writing including the case study — reconciles Phase 2's requirements with the Liquid-syntax migration risk.
- [Phase 01]: Deploy-smoke spec asserts /_next/static/ script + __next_f string instead of __NEXT_DATA__ — that marker is a Pages Router convention absent from Next.js 16 App Router output
- [Phase 01]: git mv unusable for the Humane asset move -- text_trail_demo/ was never tracked by git; used a plain filesystem mv instead (no impact on D-01's no-modify licence constraint)
- [Phase 01]: @theme block holds only tokens (font-family/color/spacing custom properties); clamp() type-scale rules, weights, and letter-spacing live as plain CSS classes beneath @theme, per D-04's split
- [Phase 01]: viewport.spec.ts asserts the Display role's 1440px size against the real clamp() formula (139.2px) instead of the plan's near-ceiling assumption — Empirically verified the Display curve (clamp(3.5rem, 1.5rem + 8vw, 11.25rem)) doesn't reach its 180px ceiling until ~1950px viewport width; app/globals.css's clamp() curves are Plan 02's locked interface and were left untouched
- [Phase 01]: Playwright's reducedMotion context/test option did not reliably affect matchMedia('(prefers-reduced-motion: reduce)') in this environment (1.62.1/Chromium) — use page.emulateMedia({ reducedMotion: 'reduce' }) called before page.goto() instead, for this and any future reduced-motion Playwright spec
- [Phase 01]: app/page.tsx and app/type/page.tsx converted from Server Components to Client Components to call useSmearHeading() and attach a ref for the scroll-driven heading trail; no server-only data fetching existed on either route, so this is cost-free
- [Phase 03]: The landing view (`/`) is English-only for v1 — `I18N-01` is scoped to writing and is complete without it. `/startseite` is the recorded future shape for a German landing (no locale prefix, fully localised segments, matching Phase 2's shipped pattern) but is not built now.
- [Phase 03]: The featured slot's state is derived, not flagged — `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)` resolves to `PostEntry | null`, and the component branches on that value. There is no boolean anywhere to flip when Phase 4 publishes the case study; the slot changes automatically once the MDX file exists and is not `draft: true`.
- [Phase 03]: Amendment A3 (`.link-quiet` conformance) was extended beyond the UI-SPEC's written list to `app/not-found.tsx` (the global not-found boundary) and both `[slug]` post-template back links, recorded here rather than made silently.

### Pending Todos

None pending.

### Blockers/Concerns

- Backlog (Phase 5): PROJECT.md logs the dateless/stateless-per-item backlog as an accepted risk (⚠️ Revisit) — mitigated only by BACK-02's section-level "last touched" date, curation, and progress-report copy voice. Not a blocker, but should be revisited if the backlog reads as stale post-launch.
- Legacy source repo (Phase 2): all Jekyll/permalink/pagination findings in research come from crawling the *live rendered* `guillem-gelabert.github.io` site, not yet verified against the source GitHub repo. Confirm the authoritative 13-post list and check for Liquid-syntax (`{% highlight %}`, `{% raw %}`) code fences against the repo before finalizing the migration plan.
- **`HOME-01` tripwire (Phase 3, THE TRIPWIRE):** the positioning sentence still ships as `Developer.` behind `POSITIONING_PLACEHOLDER` in `lib/work.ts`. It is marked in source only, never on screen, so the landing view looks finished at every optical pass while the site's single most important sentence is unwritten. Must be re-asserted at the top of every subsequent phase's carried-forward state until the user supplies the sentence, and must never reach Phase 6's `FIND-02` robots flag flip still holding the placeholder. Full record: `.planning/phases/03-work-list-landing-skeleton/deferred-items.md`.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Content | CR-01 — localised `[slug]` 404s do not server-render without JS | Open, deferred to Phase 6 (middleware layer) | Phase 02 |
| Copy | `HOME-01` — the positioning sentence is unwritten (`Developer.` placeholder); **blocks `FIND-02`** | Deferred by decision (`D-08`) — the tripwire | Phase 03 |
| Copy | `WORK-02` — the two work-list annotations are drafts awaiting the user's edit (`D-09`) | Deferred by decision — requirement is met, copy is not final | Phase 03 |
| Content | Four interim surfaces (featured slot, backlog stub, contact stub, `/cv`) — none may be the public launch condition; **blocks `FIND-02`** | Deliberately typeset (`D-02`), safe under `noindex` | Phase 03 |

## Session Continuity

Last session: 2026-08-29T22:09:24.520Z
Stopped at: Phase 2 UI-SPEC approved
Resume file: .planning/phases/02-content-pipeline/02-UI-SPEC.md
