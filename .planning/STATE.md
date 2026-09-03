---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Working Site
status: milestone-complete
stopped_at: v1.0 complete — every surface ships, held at noindex by the copy gate (see .planning/phases/06-cv-contact-photo-discoverability/HANDOFF-user-supplied.md). Test suite is red by decision after 260903-hb4; see Blockers/Concerns
last_updated: "2026-09-03T15:10:00+02:00"
last_activity: 2026-09-03 - Completed quick task 260903-kk1: default to hue, luminosity, and no noise mask
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
Last activity: 2026-09-03 - Completed quick task 260903-kk1: default to hue, luminosity, and no noise mask

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
- [quick-260903-hb4]: The landing's featured slot no longer renders PostMeta, which retires the draft marker on `/`. Phase 3 wired `draft={entry.frontmatter.draft}` through precisely so `/` and `/writing` could not print contradictory answers for one file; they cannot contradict now because `/` no longer answers. `/writing` is the single surface that answers "is this published?" from here. The date went with it by intent — it was the only thing between the pitch and the fold
- [quick-260903-hb4]: The featured headline moved to `.text-heading-serif`, the class `6cc7c43` had already added to app/globals.css and left with no caller. Same clamp, weight and tracking as `.text-heading`; only the family differs, so the case-study headline stops competing with the "GUILLEM GELABERT" nameplate directly above it for the one Humane voice

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

**NEW BLOCKER, not copy — the test suite is red by decision (quick task 260903-hb4).**
`npm run test:all` cannot pass. Committed knowingly on 2026-09-03 at the owner's instruction: the
design change shipped, the contracts it contradicts were deliberately NOT rewritten to match, so the
red tests stand as the open question rather than being quietly retuned. Two groups, with different
owners:

- **Two failures caused by 260903-hb4.** `tests/unit/post-meta-contract.test.ts` asserts at least
  five `<PostMeta>` call sites (four remain) and that the featured slot renders one passing
  `draft={entry.frontmatter.draft}` (WR-02). Both encode Phase 2/3 decisions that the design change
  supersedes. Three Playwright specs — `landing.spec.ts:351`, `landing-trail.spec.ts:44,59`,
  `landing-viewport.spec.ts:79` — select `h3.text-heading`, which matches nothing now that the
  element carries `.text-heading-serif`. **Note the disagreement worth resolving:**
  `tests/build/prerender.test.ts:642` still PASSES against the same element, because it matches
  `class="[^"]*text-heading[^"]*"` as a substring. Two assertions over one element now disagree about
  whether it exists.
- **Four failures that predate it, inherited from `6cc7c43`.** The `robots:` root-layout count, and
  prose-contract `(m)`, `(n)`, `(o)`: that commit added `.text-nameplate` and `.text-heading-serif`
  to `app/globals.css`, putting the stylesheet past the four-size/two-weight budget those three
  enforce. `.text-nameplate`'s own comment in the stylesheet says as much. The budget is the real
  question — widen it to admit a fifth size, or fold the additions back into four.

Full record: `.planning/quick/260903-hb4-set-the-featured-slot-in-the-body-serif/260903-hb4-SUMMARY.md`

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
| 260903-e4l | Set a black/white `/style-playground` gradient centered 15% from the left and bottom | 2026-09-03 | 82a5727 | [260903-e4l-change-the-style-playground-conic-backgr](./quick/260903-e4l-change-the-style-playground-conic-backgr/) |
| 260903-eef | Make `/style-playground` boxes transparent with inverse Humane text | 2026-09-03 | e052ada | [260903-eef-make-the-style-playground-boxes-transpar](./quick/260903-eef-make-the-style-playground-boxes-transpar/) |
| 260903-ezm | Add Leva controls for all non-typographic `/style-playground` parameters | 2026-09-03 | d453381 | [260903-ezm-add-leva-controls-to-style-playground-fo](./quick/260903-ezm-add-leva-controls-to-style-playground-fo/) |
| 260903-fbc | Stack the `/style-playground` boxes vertically at aspect ratios of 1:1 and narrower | 2026-09-03 | d6c7bab | [260903-fbc-stack-the-style-playground-boxes-vertica](./quick/260903-fbc-stack-the-style-playground-boxes-vertica/) |
| 260903-fdq | Add controllable minimum widths and heights to the `/style-playground` boxes | 2026-09-03 | f74996f | [260903-fdq-add-controllable-minimum-widths-and-heig](./quick/260903-fdq-add-controllable-minimum-widths-and-heig/) |
| 260903-fi1 | Keep the portrait gradient seam between the stacked boxes by moving its conic center to their midpoint | 2026-09-03 | a696233 | [260903-fi1-keep-the-portrait-gradient-seam-between-](./quick/260903-fi1-keep-the-portrait-gradient-seam-between-/) |
| 260903-fl6 | Make the portrait seam point diagonally upward and to the right | 2026-09-03 | 1e31628 | [260903-fl6-make-the-portrait-seam-point-diagonally-](./quick/260903-fl6-make-the-portrait-seam-point-diagonally-/) |
| 260903-fqd | Move the portrait conic center toward the bottom-left and make the seam more vertical | 2026-09-03 | 16d5b25 | [260903-fqd-move-the-portrait-conic-center-toward-th](./quick/260903-fqd-move-the-portrait-conic-center-toward-th/) |
| 260903-ft0 | Reduce portrait spacing between the boxes to match the viewport edge inset | 2026-09-03 | 1d7d971 | [260903-ft0-reduce-portrait-spacing-between-the-boxe](./quick/260903-ft0-reduce-portrait-spacing-between-the-boxe/) |
| 260903-ghg | Remove Leva from the style playground while preserving its current visual defaults | 2026-09-03 | 4567f8a | [260903-ghg-remove-leva-from-the-style-playground-wh](./quick/260903-ghg-remove-leva-from-the-style-playground-wh/) |
| 260903-gn5 | Update the main page to use the style playground design and responsive seam logic | 2026-09-03 | 6cc7c43 | [260903-gn5-update-the-main-page-to-use-the-style-pl](./quick/260903-gn5-update-the-main-page-to-use-the-style-pl/) |
| 260903-gy7 | Add desktop and mobile seam modes with rotated mobile landscape behavior and more dynamic desktop angles | 2026-09-03 | 88cfed3 | [260903-gy7-add-desktop-and-mobile-seam-modes-with-r](./quick/260903-gy7-add-desktop-and-mobile-seam-modes-with-r/) |
| 260903-h61 | Reverse the desktop seam aspect response so wider screens produce a flatter angle | 2026-09-03 | 39cfbdd | [260903-h61-reverse-the-desktop-seam-aspect-response](./quick/260903-h61-reverse-the-desktop-seam-aspect-response/) |
| 260903-hb4 | Set the featured slot in the body serif and drop its meta line | 2026-09-03 | 3b1a3b4 | [260903-hb4-set-the-featured-slot-in-the-body-serif](./quick/260903-hb4-set-the-featured-slot-in-the-body-serif/) |
| 260903-ic4 | Make the desktop landing seam panels wider and shorter | 2026-09-03 | 09fb8aa | [260903-ic4-on-desktop-make-the-two-landing-seam-pan](./quick/260903-ic4-on-desktop-make-the-two-landing-seam-pan/) |
| 260903-ied | Add a /noise-gradient route with a monochrome Gaussian noise PNG layer, a red-to-yellow conic-gradient layer, and a dropdown that changes their blend mode | 2026-09-03 | b124afd | [260903-ied-add-a-noise-gradient-route-with-a-monoch](./quick/260903-ied-add-a-noise-gradient-route-with-a-monoch/) |
| 260903-ijg | Move the /noise-gradient conic-gradient center to the bottom-center of the square, inset by 5px | 2026-09-03 | bb86214 | [260903-ijg-move-the-noise-gradient-conic-gradient-c](./quick/260903-ijg-move-the-noise-gradient-conic-gradient-c/) |
| 260903-ilj | Update the /noise-gradient conic gradient to yellow at full opacity, orange at 50% opacity, then red at full opacity | 2026-09-03 | 753c9f9 | [260903-ilj-update-the-noise-gradient-conic-gradient](./quick/260903-ilj-update-the-noise-gradient-conic-gradient/) |
| 260903-iof | Place the /noise-gradient conic-gradient layer above the noise layer on the z-axis while preserving the blend-mode control | 2026-09-03 | 827d925 | [260903-iof-place-the-noise-gradient-conic-gradient-](./quick/260903-iof-place-the-noise-gradient-conic-gradient-/) |
| 260903-ins | Align the desktop landing seam from its lower-left pivot through the inter-panel gap | 2026-09-03 | 30305f7 | [260903-ins-fix-the-desktop-landing-seam-so-it-begin](./quick/260903-ins-fix-the-desktop-landing-seam-so-it-begin/) |
| 260903-irk | Add three color pickers to /noise-gradient for its yellow, orange, and red gradient stops, and move the gradient center to 30% inset from the bottom | 2026-09-03 | 94b9f96 | [260903-irk-add-three-color-pickers-to-noise-gradien](./quick/260903-irk-add-three-color-pickers-to-noise-gradien/) |
| 260903-ivi | Add independent alpha controls to the /noise-gradient color selectors | 2026-09-03 | 5f37535 | [260903-ivi-add-per-color-alpha-controls-to-the-nois](./quick/260903-ivi-add-per-color-alpha-controls-to-the-nois/) |
| 260903-j3j | Texture the landing with a hard-light black, orange, and white conic gradient | 2026-09-03 | 0cb518e | [260903-j3j-restyle-the-desktop-and-responsive-landi](./quick/260903-j3j-restyle-the-desktop-and-responsive-landi/) |
| 260903-jaj | Update /noise-gradient to match the interaction behavior of the referenced CodePen while retaining the page controls | 2026-09-03 | 4e7f96b | [260903-jaj-update-noise-gradient-to-match-the-inter](./quick/260903-jaj-update-noise-gradient-to-match-the-inter/) |
| 260903-jee | Remove all controls from /noise-gradient while preserving the static composition | 2026-09-03 | 426e3ce | [260903-jee-remove-all-controls-from-noise-gradient-](./quick/260903-jee-remove-all-controls-from-noise-gradient-/) |
| 260903-jis | Replace /noise-gradient PNG noise with the CSS-Tricks SVG feTurbulence grain technique | 2026-09-03 | 4b81f82 | [260903-jis-svg-turbulence-grain](./quick/260903-jis-svg-turbulence-grain/) |
| 260903-jl1 | Change /noise-gradient to an opaque black-to-yellow conic gradient via orange | 2026-09-03 | 6f4d134 | [260903-jl1-black-orange-yellow-grain](./quick/260903-jl1-black-orange-yellow-grain/) |
| 260903-jmr | Correct /noise-gradient to an opaque black-to-white conic gradient via orange | 2026-09-03 | 81145f2 | [260903-jmr-black-orange-white-grain](./quick/260903-jmr-black-orange-white-grain/) |
| 260903-jnk | Apply multiply blending directly to an inline SVG turbulence layer on /noise-gradient | 2026-09-03 | 53e7fa2 | [260903-jnk-svg-layer-mix-blend-mode](./quick/260903-jnk-svg-layer-mix-blend-mode/) |
| 260903-jvh | Restructure /noise-gradient to match the CSS-Tricks isolated noise-background and blended-overlay example | 2026-09-03 | a0c9f9f | [260903-jvh-match-grainy-gradient-example](./quick/260903-jvh-match-grainy-gradient-example/) |
| 260903-jx2 | Embed an adapted version of the supplied ground-shadow SVG grain recipe on /noise-gradient | 2026-09-03 | cb9b992 | [260903-jx2-embed-adapted-ground-shadow-noise](./quick/260903-jx2-embed-adapted-ground-shadow-noise/) |
| 260903-jy6 | Add background-blend-mode and mix-blend-mode controls to /noise-gradient | 2026-09-03 | a9083b6 | [260903-jy6-add-blend-mode-controls](./quick/260903-jy6-add-blend-mode-controls/) |
| 260903-jzh | Remove the radial noise mask so /noise-gradient uses conic gradients only | 2026-09-03 | 6316175 | [260903-jzh-remove-radial-noise-mask](./quick/260903-jzh-remove-radial-noise-mask/) |
| 260903-k1t | Set /noise-gradient background orange and simplify the visible conic overlay to white-to-black | 2026-09-03 | cb0c168 | [260903-k1t-orange-background-white-black-conic](./quick/260903-k1t-orange-background-white-black-conic/) |
| 260903-k2q | Put solid orange on the gradient overlay and the white-to-black conic on the SVG-noise layer | 2026-09-03 | f3b4833 | [260903-k2q-orange-overlay-white-black-noise-conic](./quick/260903-k2q-orange-overlay-white-black-noise-conic/) |
| 260903-k4q | Stack the solid orange base below separate SVG-noise and white-to-black conic layers | 2026-09-03 | eb4f119 | [260903-k4q-stack-orange-below-noise-and-gradient](./quick/260903-k4q-stack-orange-below-noise-and-gradient/) |
| 260903-k7f | Express the visible conic as orange from 0% to 100% lightness | 2026-09-03 | 0309d58 | [260903-k7f-orange-lightness-conic](./quick/260903-k7f-orange-lightness-conic/) |
| 260903-k9f | Remove colored feTurbulence speckles by forcing the SVG-noise layer to grayscale | 2026-09-03 | 537571c | [260903-k9f-force-monochrome-svg-noise](./quick/260903-k9f-force-monochrome-svg-noise/) |
| 260903-ka4 | Lock normal/soft-light as the optimal /noise-gradient blend and remove the temporary controls | 2026-09-03 | c3818c4 | [260903-ka4-lock-optimal-blend-remove-controls](./quick/260903-ka4-lock-optimal-blend-remove-controls/) |
| 260903-kci | Restore background-blend-mode and mix-blend-mode controls for continued /noise-gradient tuning | 2026-09-03 | 3af9a53 | [260903-kci-restore-blend-mode-controls](./quick/260903-kci-restore-blend-mode-controls/) |
| 260903-keg | Change the /noise-gradient base layer from orange to bright pink | 2026-09-03 | 6129d1e | [260903-keg-pink-background-layer](./quick/260903-keg-pink-background-layer/) |
| 260903-kgc | Add a checkbox to toggle the conic noise mask while retaining SVG turbulence | 2026-09-03 | fbf0bc4 | [260903-kgc-toggle-noise-mask](./quick/260903-kgc-toggle-noise-mask/) |
| 260903-khp | Add contrast and brightness sliders for /noise-gradient SVG-noise intensity | 2026-09-03 | ee82c86 | [260903-khp-add-noise-intensity-sliders](./quick/260903-khp-add-noise-intensity-sliders/) |
| 260903-kj1 | Expand /noise-gradient contrast to 0–1000% and brightness to 0–3000% | 2026-09-03 | 14ed055 | [260903-kj1-expand-noise-control-ranges](./quick/260903-kj1-expand-noise-control-ranges/) |
| 260903-kk1 | Default /noise-gradient to hue background mode, luminosity mix mode, and no noise mask | 2026-09-03 | a96d3a9 | [260903-kk1-default-hue-luminosity-no-mask](./quick/260903-kk1-default-hue-luminosity-no-mask/) |

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

Last session: 2026-09-03T15:10:00+02:00
Stopped at: v1.0 complete. Phase 6 closed; every surface ships; the site is deliberately noindex.
Post-milestone design work continues as quick tasks; the latest is 260903-kk1.
Resume file: .planning/phases/06-cv-contact-photo-discoverability/HANDOFF-user-supplied.md

The next action belongs to the user, not to an executor: fill five values, do three copy reviews,
set `PLACEHOLDER_CONTENT = false`, then follow the flip procedure in `launch-gate.md`.

**Caveat added 2026-09-03:** `npm run test:unit` used to name exactly which gate rows were still
outstanding, and it no longer does on its own — six failures now sit alongside the gate rows, none
of them a gate row (see Blockers/Concerns). Read the launch-gate rows out of the run; do not read a
red run as "the gate is failing".
