---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Working Site
status: milestone-complete
stopped_at: v1.0 complete — every surface ships, held at noindex by the copy gate (see .planning/phases/06-cv-contact-photo-discoverability/HANDOFF-user-supplied.md)
last_updated: "2026-09-03T10:07:19+02:00"
last_activity: 2026-09-03 - Completed quick task 260903-e0l: move the playground seam pivot toward the bottom-left corner
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 42
  completed_plans: 42
  percent: 100
---

# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-08-29)

**Core value:** A visitor scanning a shortlist can tell within ninety seconds that Guillem has editorial judgment as well as craft — enough to decide the conversation is worth opening.
**Current focus:** v1.0 complete. Next action is the user's: fill the five placeholder values, do the three copy reviews, then follow the FIND-02 flip procedure in `06-.../launch-gate.md`.

## Current Position

Phase: 06 (CV, Contact, Photo & Discoverability) — COMPLETE
Plan: 12 of 12
Status: v1.0 milestone closed 2026-09-01
Last activity: 2026-09-03 - Completed quick task 260903-e0l: move the playground seam pivot toward the bottom-left corner

**The site is structurally complete and deliberately not indexed.** Every surface the milestone
promised ships and is live at `guillemgelabert.com`. Five of the values those surfaces render are
lorem ipsum, by the owner's instruction, so the layout could be judged before the copy exists — and
the launch gate holds the site at `noindex` for exactly that reason. There is no engineering work
left between here and an indexed site; everything blocking is copy, and all of it is the user's.

Finish it from one page: `.planning/phases/06-cv-contact-photo-discoverability/HANDOFF-user-supplied.md`

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
- [Phase 06]: The five outstanding user-supplied values were filled with lorem ipsum and a generated tone panel (never a face) on the owner's explicit instruction, so every surface renders at full length before the copy exists — and a fourteenth launch-gate row, PLACEHOLDER_CONTENT in lib/placeholder.ts, was added because the fill silently disarmed the other five: G2-G6 test "filled", which stopped implying "real"
- [Phase 06]: The marker-word ban split in two rather than being relaxed — "todo"/"coming soon"/"under construction"/"tbd" stay banned in every state because they tell a reader the page is broken; "lorem"/"placeholder" are banned only once PLACEHOLDER_CONTENT goes false, which is what turns "the placeholders are gone" from a claim into an assertion
- [Phase 06]: Two source-mutating test fixtures (cv-portrait-fixture.ts, contact.spec.ts's inline equivalent, plus the cross-process file lock they shared) were deleted rather than updated — they existed to simulate a populated /cv and contact block, that state now ships, and the absence half of D-2.1 keeps better coverage in tests/unit/contact.test.ts against all four null combinations than a browser spec observing one at a time
- [Phase 06]: The per-post OG cards were built, committed and never served for the life of commit c85eb18 — an explicit openGraph.images entry also overrides the opengraph-image file convention for its segment. Found by curling the live deploy during the phase's own audit, not by a test: the assertion compared the EN post's card to the DE post's and to /'s, and those differ by LOCALE whether or not the override fires. The transferable lesson is that asserting two things DIFFER is much weaker than asserting what each IS, and it fails silently in exactly the case it was written for
- [Phase 06]: Both localised 404s served a doubled title ("Not found — Guillem Gelabert — Guillem Gelabert") from the moment plan 06-07 introduced title.template, because both routes hardcode a literal suffix. Every existing title assertion passed throughout — they checked presence and non-emptiness, never single assembly
- [Phase 06]: playwright.config.ts's port is now a variable. Port 3000 is not this machine's to assume: another project in the same vault runs its own next dev there, and reuseExistingServer adopted it mid-run, reporting 404s on every route rather than "this is not my server"
- [Phase 06]: package.json renamed gw-scaffold -> guillem-web at milestone close. Cosmetic and invisible to visitors, but this milestone's audience opens repos
- [post-v1.0, 2026-09-01]: REQUIREMENTS.md's "headless CMS or database" exclusion is REVERSED by explicit decision — a Railway Postgres now backs POST/GET/DELETE /api/backlog. Scope is one table and three endpoints, not a CMS. The exclusion row is amended in place with the date and reason rather than deleted
- [post-v1.0]: The site must still build and render with NO database, and this is load-bearing rather than a nicety: next build runs without DATABASE_URL locally and in CI, tests/build/prerender.test.ts asserts against that build's HTML, and 173 Playwright specs run against next dev. lib/backlog.tsx's BACKLOG is therefore the seed AND the fallback, and getBacklog() never throws
- [post-v1.0]: BACK-02's freshness date is now DERIVED (max(created_at)) rather than hand-maintained, and seeded rows carry created_at = LAST_TOUCHED rather than now() — seeding with now() would make a fresh deploy of three-week-old items claim they were touched today, the exact overclaim the section-level date exists to prevent
- [post-v1.0]: The backlog freshness guard was NARROWED, not satisfied. It asked "when did lib/backlog.tsx last change?", which stopped implying "did the backlog change?" once the module became a seed with plumbing. Re-encoding descriptions from JSX to strings moved every byte and not one word; bumping LAST_TOUCHED to satisfy it would have been the overclaim the guard exists to prevent. It now consults BACKLOG_CONTENT_SHA256, a hash of the normalised item text
- [post-v1.0]: BacklogItem.description is a plain string, no longer a ReactNode. No shipped description ever used the JSX the type was chosen for; a JSON body cannot carry a ReactNode; and rendering caller-supplied markup would be a real injection surface where rendering text is not. lib/backlog.tsx keeps its .tsx path regardless — three test readers scrape it by literal path

### Pending Todos

None pending.

### Blockers/Concerns

**All four are copy, none is engineering, and all four are the user's.** Full record:
`.planning/phases/06-cv-contact-photo-discoverability/deferred-items.md` (T1–T4) and
`launch-gate.md`. The hand-off that resolves them is `HANDOFF-user-supplied.md`.

- **T1 — HOME-01's positioning sentence (gate G2).** Still unwritten. The stand-in changed from
  `Developer.` to lorem ipsum on 2026-09-01, which is a stronger tripwire, not a weaker one:
  `Developer.` looked like a terse but finished choice at every optical pass, and lorem cannot be
  mistaken for a decision. It is the site's single most important sentence and doubles as `/`'s
  share-preview description.
- **T2 — the case-study editorial pass (gate G12).** Both pieces are live, bylined and `draft: false`
  in two languages, and **no human has read either**. Phase 4's `fact-check.md` audited 83 claims
  with zero unsourced; that reduces factual risk only and says nothing about voice, or about whether
  the German reads like German. Cannot be mechanised — it is a signature row in `launch-gate.md`.
- **T3 — backlog copy (gate G11).** `COPY_REVIEWED = false`. "The Pudding, read as a corpus" carries
  a one-edit veto: never describe it as a pitch.
- **T4 — NEW: five values are placeholder copy (gate G14).** `PLACEHOLDER_CONTENT = true` in
  `lib/placeholder.ts`. The CV, the contact email and LinkedIn URL, the portrait file and T1's
  sentence are all lorem ipsum or a placeholder asset. **This row exists because the fill silently
  disarmed the other five:** G2–G6 test whether a value is *filled*, a sound proxy for *real* only
  while the states were absent and authored, and without G14 the launch gate's biconditional would
  have started demanding `index: true` over a lorem-ipsum CV.

**NEW BLOCKER, not copy — `/api/*` is unreachable on the apex.**
`guillemgelabert.com/api/backlog` returns 404 while
`web-production-9cedb.up.railway.app/api/backlog` returns 401 as designed. The apex is fronted by
the `guillem-edge` Cloudflare Worker, which lives in a DIFFERENT repository and does not forward
`/api/*` to this service. It was deliberately not changed — `audit.md` § 2.5 records that this
milestone attaches and detaches nothing. Until that Worker forwards the path, the write API is
usable at the Railway origin only. Owner: user (the `guillem-edge` repo).

**Resolved during Phase 6, previously listed here:** the backlog risk (Phase 5) stays "Revisit
post-launch" as logged, unchanged. The legacy source-repo concern (Phase 2) is moot — the archive
migration is deferred to v2 and no migration was performed.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260903-d9k | Responsive `/style-playground` with a corner-aligned conical-gradient seam and scalable blue/red boxes | 2026-09-03 | 9a094b5 | [260903-d9k-build-a-responsive-style-playground-rout](./quick/260903-d9k-build-a-responsive-style-playground-rout/) |
| 260903-dmw | Correct `/style-playground` seam anchors to A bottom-right and B top-left | 2026-09-03 | 012ff04 | [260903-dmw-correct-the-style-playground-conical-gra](./quick/260903-dmw-correct-the-style-playground-conical-gra/) |
| 260903-dsd | Enlarge `/style-playground` boxes and mirror the seam across the vertical axis | 2026-09-03 | a1f2c7e | [260903-dsd-make-the-style-playground-boxes-substant](./quick/260903-dsd-make-the-style-playground-boxes-substant/) |
| 260903-dwc | Enlarge and tighten the `/style-playground` boxes to match the supplied sketch | 2026-09-03 | 9d5fdf9 | [260903-dwc-make-the-style-playground-boxes-larger-a](./quick/260903-dwc-make-the-style-playground-boxes-larger-a/) |
| 260903-e0l | Move the `/style-playground` seam pivot toward the bottom-left boundary | 2026-09-03 | f44524f | [260903-e0l-move-the-style-playground-conic-gradient](./quick/260903-e0l-move-the-style-playground-conic-gradient/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Content | CR-01 — localised `[slug]` 404s do not server-render without JS | **CLOSED Phase 06** — `proxy.ts` + two reserved routes; verified in production with JS disabled, correct `lang` in both locales | Phase 02 |
| Copy | `HOME-01` — the positioning sentence is unwritten; **blocks `FIND-02`** | Deferred by decision (`D-08`) — the tripwire. Stand-in changed `Developer.` → lorem ipsum at Phase 06 | Phase 03 |
| Copy | `WORK-02` — the two work-list annotations are drafts awaiting the user's edit (`D-09`) | Deferred by decision — requirement is met, copy is not final | Phase 03 |
| Content | Two interim surfaces remain (contact stub, `/cv`) — none may be the public launch condition; **blocks `FIND-02`** | **CLOSED Phase 06** — both are real surfaces now: `/cv` renders the portrait, three CV sections and the contact block; the landing's `#contact` renders the same shared component. Their *content* is placeholder, which is T4's row, not an interim surface | Phase 03 |
| Copy | The user's editorial pass over both case studies has not happened (English and German, both `draft: false`); **blocks `FIND-02`** | Carried at equal weight to `HOME-01`; D-19's accuracy gate reduces factual risk only, not voice/register | Phase 04 |
| Copy | `BACK-01` item copy is drafted from repository evidence and unreviewed by the author (`COPY_REVIEWED = false`) | Deferred by decision (D-14) — the third tripwire | Phase 05 |
| Copy | **NEW —** five user-supplied values ship as lorem ipsum / a placeholder panel (`PLACEHOLDER_CONTENT = true`); **blocks `FIND-02` via G14** | Deferred by owner instruction — fill the surfaces now, write the words after. The gate row exists because the fill disarmed G2–G6 | Phase 06 |
| Build | BUILD-07 — attach `guillemgelabert.com` to the `web` service, and add HSTS `preload` with it | v2. This milestone changed the *declared* canonical only; nothing was attached or detached | Phase 06 |
| Build | PROF-06 — print stylesheet | v2. `/cv`'s markup was built for it, so it stays a stylesheet addition, not a markup change | Phase 06 |
| Build | Nonce-based CSP | v2, and recorded as *not* the fix for `style-src` — Shiki's per-token inline `style` attributes are not noncible | Phase 06 |
| Debt | Lint error at `use-prefers-reduced-motion.ts:23` | Re-deferred with reasoning: `components/smear-heading/` has an empty diff across the whole milestone and its reduced-motion coverage was hard-won | Phase 06 |
| Process | `_pm/kanban.md` and `.planning/` are two tracking surfaces for one project | Flagged for the user, not resolved | Phase 06 |

## Session Continuity

Last session: 2026-09-01T14:30:00.000Z
Stopped at: v1.0 complete. Phase 6 closed; every surface ships; the site is deliberately noindex.
Resume file: .planning/phases/06-cv-contact-photo-discoverability/HANDOFF-user-supplied.md

The next action belongs to the user, not to an executor: fill five values, do three copy reviews,
set `PLACEHOLDER_CONTENT = false`, then follow the flip procedure in `launch-gate.md`. Running
`npm run test:unit` at any point names exactly which rows are still outstanding.
