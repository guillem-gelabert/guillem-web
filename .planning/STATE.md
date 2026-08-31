---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Working Site
status: executing
stopped_at: Completed 05-04-PLAN.md
last_updated: "2026-08-31T19:29:13.959Z"
last_activity: 2026-08-31
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 30
  completed_plans: 30
  percent: 83
---

# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-08-29)

**Core value:** A visitor scanning a shortlist can tell within ninety seconds that Guillem has editorial judgment as well as craft — enough to decide the conversation is worth opening.
**Current focus:** Phase 05 — Backlog

## Current Position

Phase: 05 (Backlog) — EXECUTING
Plan: 4 of 4
Status: Phase 5 complete
Last activity: 2026-08-31

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
| Phase 04 P06 | 55min | 3 tasks | 3 files |
| Phase 05 P04 | 11min | 3 tasks | 4 files |

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
- [Phase 04]: The D-19 accuracy gate (fact-check.md) audited every quotation and numeral in both case-study languages against the live-text snapshots and ARTICLE_PLAN.md; 83 claims audited, 0 with no traceable source, all twelve named traps passed in both languages, no prose fix required
- [Phase 04]: Phase 4's launch-gate closure was structural, not code: the featured slot was already wired to findBySlug(publishedFor(en), CASE_STUDY_SLUG) since Phase 3; publishing content/the-chart-therefore-changes.mdx with draft:false was the entire mechanism, net production code change was zero
- [Phase 04]: New carried item alongside HOME-01: the user's editorial pass over both case studies has not happened; CONTEXT D-18 recommends it before Phase 6 flips robots, and it is carried at equal weight to HOME-01 as a blocking pre-condition on FIND-02
- [Phase 05]: The launch gate was re-pointed, not shrunk -- the deleted backlog-stub assertion was replaced by a COPY_REVIEWED = false source-scrape (D-14's second tripwire channel), naming all three outstanding copy items in the comment rather than leaving a one-line check nobody reads
- [Phase 05]: The new production test matches dateTime (camelCase), not datetime -- React 19.2.8 emits the JSX prop name verbatim in the raw prerendered file; re-confirmed this session against the real build
- [Phase 05]: The live deploy check used the already-live origin/master tip (e76b6d8, from Plan 01) rather than requiring a push of this plan's own test-tier/documentation-only commits, since they carry zero production-code delta

### Pending Todos

None pending.

### Blockers/Concerns

- Backlog (Phase 5) — RESOLVED, not closed: PROJECT.md logged the dateless/stateless-per-item backlog as an accepted risk (⚠️ Revisit). The mitigation shipped as designed in Phase 05: curation to three items (D-02), the section-level `LAST_TOUCHED` date above the list rather than per-item dates (BACK-02), and progress-report copy voice (D-08's copy rule). The risk itself stays **Revisit post-launch**, not Closed — it should be re-examined if the backlog reads as stale after the site has been live for a while. Full record: `.planning/phases/05-backlog/launch-gate.md`.
- Legacy source repo (Phase 2): all Jekyll/permalink/pagination findings in research come from crawling the *live rendered* `guillem-gelabert.github.io` site, not yet verified against the source GitHub repo. Confirm the authoritative 13-post list and check for Liquid-syntax (`{% highlight %}`, `{% raw %}`) code fences against the repo before finalizing the migration plan.
- **`HOME-01` tripwire (Phase 3, THE TRIPWIRE):** the positioning sentence still ships as `Developer.` behind `POSITIONING_PLACEHOLDER` in `lib/work.ts`. It is marked in source only, never on screen, so the landing view looks finished at every optical pass while the site's single most important sentence is unwritten. Must be re-asserted at the top of every subsequent phase's carried-forward state until the user supplies the sentence, and must never reach Phase 6's `FIND-02` robots flag flip still holding the placeholder. Full record: `.planning/phases/03-work-list-landing-skeleton/deferred-items.md`.
- HOME-01 tripwire, re-asserted after Phase 4 and again after Phase 5 (per deferred-items.md's carry-forward rule): the positioning sentence still ships as Developer. behind POSITIONING_PLACEHOLDER in lib/work.ts. Marked in source only, never on screen, so the landing view looks finished at every optical pass while the site's single most important sentence is unwritten. Must be re-asserted at the top of every subsequent phase's carried-forward state until the user supplies the sentence, and must never reach Phase 6's FIND-02 robots flip still holding the placeholder. Full record: .planning/phases/04-the-case-study/launch-gate.md.
- The user's editorial pass over both case studies has not happened, re-asserted after Phase 5 at the same weight as HOME-01: Both content/the-chart-therefore-changes.mdx and content/die-darstellung-aendert-sich.mdx shipped draft:false without a human proofread, in two languages, by directive. CONTEXT D-18 recommends this pass occur before Phase 6 flips robots to indexable. The D-19 accuracy gate (fact-check.md) reduces factual risk only; it does not substitute for the author's ear. A live, indexable, bylined piece that no human has read is the risk this phase creates. Must be re-asserted alongside HOME-01 until the user completes the pass. Full record: .planning/phases/04-the-case-study/launch-gate.md.
- NEW carried item from Phase 5, same weight as HOME-01 and the case-study editorial pass: the backlog item copy is drafted from repository evidence and has NOT been reviewed by the author (`COPY_REVIEWED = false` in `lib/backlog.tsx`). The backlog section looks finished at every optical pass — three real items, a real date, real prose, no visible marker — so no visual review will catch that the copy is unreviewed, the same failure mode as HOME-01. Item 3 ("The Pudding, read as a corpus") carries an additional one-edit veto flag: it is described strictly as a corpus study and never as a pitch, because it may be a live pitch elsewhere in the user's own planning, and getting that wrong publicly could cost it. D-14's tripwire has three independent channels (source constant, build-tier test, this record) so the risk stays visible until the author's editorial pass. Must not reach Phase 6's FIND-02 robots flip while COPY_REVIEWED is false. Full record: .planning/phases/05-backlog/launch-gate.md.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Content | CR-01 — localised `[slug]` 404s do not server-render without JS | Open, deferred to Phase 6 (middleware layer) | Phase 02 |
| Copy | `HOME-01` — the positioning sentence is unwritten (`Developer.` placeholder); **blocks `FIND-02`** | Deferred by decision (`D-08`) — the tripwire | Phase 03 |
| Copy | `WORK-02` — the two work-list annotations are drafts awaiting the user's edit (`D-09`) | Deferred by decision — requirement is met, copy is not final | Phase 03 |
| Content | Two interim surfaces remain (contact stub, `/cv`) — none may be the public launch condition; **blocks `FIND-02`** | Deliberately typeset (`D-02`), safe under `noindex`. Narrowed from four: the featured slot closed Phase 04, the backlog stub closed Phase 05 | Phase 03 |
| Copy | The user's editorial pass over both case studies has not happened (English and German, both `draft: false`); **blocks `FIND-02`** | Carried at equal weight to `HOME-01`; D-19's accuracy gate reduces factual risk only, not voice/register | Phase 04 |
| Copy | `BACK-01` item copy is drafted from repository evidence and unreviewed by the author (`COPY_REVIEWED = false`) | Deferred by decision (D-14) — the third tripwire | Phase 05 |

## Session Continuity

Last session: 2026-08-31T19:29:13.952Z
Stopped at: Completed 05-04-PLAN.md
Resume file: None
