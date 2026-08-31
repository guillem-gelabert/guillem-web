---
phase: 03-work-list-landing-skeleton
verified: 2026-08-31T14:22:35Z
status: human_needed
score: 45/48 must-haves verified (1 deferred-by-decision, 2 pending human sign-off)
overrides_applied: 0
deferred:
  - truth: "SC1 / HOME-01 — Visitor can read a single positioning sentence on the landing view stating what Guillem does"
    addressed_in: "The user (blocking pre-condition on Phase 6 FIND-02)"
    evidence: "Decision D-08, recorded in 03-UI-SPEC.md:26 and :548 ('HOME-01 cannot be verified as met at the end of Phase 3 — that is intended, not a gap'). Ships as POSITIONING_PLACEHOLDER = \"Developer.\" at lib/work.ts:55. Verified present in all three tripwire channels — see Tripwire Channel Audit below."
human_verification:
  - test: "Load / at 1440px. Does the work section read as hierarchy, or as two unrelated pages?"
    expected: "The 72px Humane featured headline reads as clearly primary over the 18px Newsreader work titles; face contrast carries the distinction."
    why_human: "No assertion can prove 'reads as hierarchy'. Remedy specified in advance: more space from the existing seven tokens — NEVER a fifth type size."
  - test: "Load / at 375px. Does the ordinal-above-title stack read as one row, or as four loose lines?"
    expected: "Eye groups the '01' ordinal with its title, annotation and host as a single entry."
    why_human: "Optical grouping — not answerable by geometry. Remedy: more space above the ordinal, existing tokens only."
  - test: "Load / at 375px. Does the nameplate at its 56px floor sit comfortably above the positioning sentence?"
    expected: "The 24px (lg token) gap reads as comfortable under a 56px Humane nameplate."
    why_human: "Measured as exactly one lg token, on-grid, identical at both widths; whether that reads as comfortable is an optical judgement. Remedy: increase to the next token (32px xl), not a new value."
  - test: "Load /cv at 375px and 1440px. Does it read as an authored page rather than an unfinished site?"
    expected: "Reads as deliberately typeset (D-02), not as a broken or abandoned route."
    why_human: "This judgement is the entire point of D-02. Remedy: copy revision, not layout change."
  - test: "Load / and compare the h2 section heads against the h3 work-list titles and featured headline."
    expected: "The two levels read as distinct."
    why_human: "Identical type (14px uppercase 0.04em) separated only by a 1px rule and 48px vs 32px top margin — the thinnest hierarchy signal in the contract. Remedy: more space above h2 — NOT a fifth type size."
  - test: "Read the two WORK-02 annotations in lib/work.ts and confirm or edit them."
    expected: "Both lines say what each piece is about; the user accepts them as final or supplies replacements."
    why_human: "D-09 — they satisfy WORK-02 as written but are drafts, not confirmed final copy. Any edit must avoid naming a language/framework/library (enforced by tests/unit/work.test.ts)."
---

# Phase 3: Work List & Landing Skeleton Verification Report

**Phase Goal:** The landing view assembles its navigation surface and vertical work list. The work-list *code* has no dependency on the case study existing; only the featured entry's final annotation copy does (see Phase 4) — so this phase builds everything except that one line.
**Verified:** 2026-08-31T14:22:35Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Verification method

Every gate below was re-run by the verifier in its own process. No SUMMARY.md claim was accepted as evidence.

| Gate | Command run by verifier | Result |
|---|---|---|
| Type gate | `npx tsc --noEmit` | clean, exit 0 |
| Unit / contract | `npm run test:unit` | **47/47 pass** |
| Clean production build | `rm -rf .next && npm run build` | exit 0; `/` and `/cv` both `○ (Static)` |
| Build-tier truth | `npm run test:build` | **16/16 pass** |
| Browser/route | `npx playwright test` | **117/117 pass** (22.2s) |
| Lint | `npm run lint` | exactly 1 error — the known deferred Phase 1 `use-prefers-reduced-motion.ts:23`; zero in any Phase 3 file |
| Live deploy | `curl` on `/` and `/cv` | both HTTP 200, both `noindex`, real content served |

Built HTML was read directly from `.next/server/app/index.html` and `.next/server/app/cv.html`, and the live Railway HTML was fetched, rather than inferring behaviour from source.

## Goal Achievement

### Observable Truths

**ROADMAP Success Criteria (the contract)**

| # | Truth | Status | Evidence |
|---|---|---|---|
| SC1 | Visitor can read a single positioning sentence stating what Guillem does (HOME-01) | ⏸ DEFERRED BY DECISION | Renders as `<p class="max-w-prose text-standfirst">Developer.</p>` in built and live HTML. Decision D-08 — see Deferred Items and the Tripwire Channel Audit. Not counted as a gap; not counted as verified. |
| SC2 | Visitor can see a vertical list of interactive projects, each with a one-line annotation about what it is rather than what it was built with (WORK-01, WORK-02) | ✓ VERIFIED | Built HTML: `<ol role="list">` with 2 `<li>`, each carrying ordinal `01`/`02`, one linked title, one `text-body` annotation, one host label. Annotations name a finding, not a tool. `tests/unit/work.test.ts` banned-tool-word gate passes. |
| SC3 | Visitor can reach work list, backlog, writing index, CV and contact block from the landing view (HOME-03) | ✓ VERIFIED | `nav[aria-label="Sections"]` emits exactly 5 links in built + live HTML: `#work`, `/writing`, `#backlog`, `/cv`, `#contact`. All four `section[id]` targets exist; `/writing` and `/cv` both return 200 (`/cv` previously 404'd). |
| SC4 | Visitor sees a landing layout that stays legible with only two work items — lists and prose, no card grids or three-across rows (HOME-04) | ✓ VERIFIED | `tests/landing.spec.ts` (m)(n)(o)(t) assert computed zero border widths, `box-shadow: none`, `border-radius: 0px`, transparent background, single-column geometry, and no `img`/`svg`/`button` in `main`. `tests/landing-viewport.spec.ts` asserts no overflow at 375/1440. All pass. |

**Plan 03-01 — data module, SmearTitle widening, shared back-link string**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T5 | Two work entries, annotations, absolute destinations and host labels exist as typed data — a third entry is a change to one array and nothing else | ✓ VERIFIED | `lib/work.ts:24-38` — `WORK: readonly [WorkEntry, WorkEntry]`. `components/landing/work-list.tsx` maps over it; no markup duplication. |
| T6 | The English positioning sentence has exactly one statement in the codebase, marked in source as HOME-01 awaiting the user | ✓ VERIFIED | Single `export const POSITIONING_PLACEHOLDER` at `lib/work.ts:55` under a comment naming HOME-01 and D-08. Two consumers, both importing the constant — no second literal. |
| T7 | A trail-carrying heading can be declared as an `<h3>` without a type error | ✓ VERIFIED | `components/smear-title.tsx:6` — `as?: "h1" \| "h2" \| "h3"`. `npx tsc --noEmit` clean with `as="h3"` in use at `featured-slot.tsx`. |
| T8 | Both locales can render a site-root back link from one shared string | ✓ VERIFIED | `lib/locales.ts` — `homeLink: "← Guillem Gelabert"` in both `UI.en` and `UI.de`. Consumed by `app/(en)/writing/page.tsx:37`, `app/(de)/texte/page.tsx:44`, `app/(en)/cv/page.tsx`. |
| T9 | No annotation names a language, framework, library or technique | ✓ VERIFIED | `tests/unit/work.test.ts:55-56` banned list (`React`, `Next`, `D3`, `TypeScript`, `JavaScript`, `Svelte`, `WebGL`, `Python`, `built with`, `powered by`); suite passes 47/47. |

**Plan 03-02 — CSS contract and its executable gate**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T10 | A standalone link changes to accent + underline on hover and focus and shows a 2px accent focus ring, on every surface | ✓ VERIFIED | `app/globals.css:369-406`. `link-contract.test.ts` (a)(e)(f) pass. Applied site-wide — see Key Links. |
| T11 | Under prefers-reduced-motion the colour and underline change still happens; only the transition is removed | ✓ VERIFIED | `app/globals.css:410-420` — only `transition` declarations sit inside `@media (prefers-reduced-motion: no-preference)`. `link-contract.test.ts` (g) passes. |
| T12 | A landing section head reads as Label-role text over a 1px full-ink rule, with no prose margins | ✓ VERIFIED | `app/globals.css:358-367` — 14px/400/uppercase/0.04em, `border-bottom: 1px solid var(--color-ink)`, no margin declarations. `landing.spec.ts` (q) asserts computed `1px solid rgb(0, 0, 0)` on all four heads. |
| T13 | Introducing a fifth type size, third weight, literal hex, fourth rule weight or `!important` fails a test in under a second | ✓ VERIFIED | `link-contract.test.ts` (b)(c)(d) + `prose-contract.test.ts`. Full unit suite `duration_ms 153.48` — well under 1s. |

**Plan 03-03 — the four landing components and the de-cliented route**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T14 | A visitor loading `/` reads one positioning sentence directly beneath the nameplate | ✓ VERIFIED | Built HTML: `<h1 class="text-display">` immediately followed by `<p class="max-w-prose text-standfirst">`. `landing.spec.ts` (f) asserts count 1 at computed weight 530. |
| T15 | A single-column vertical list of exactly two projects, each with ordinal, linked title, one-line annotation and destination host | ✓ VERIFIED | Built HTML confirmed verbatim. `landing.spec.ts` (h)(i)(k)(l)(o) pass. |
| T16 | Five links in the page header reach work list, writing index, backlog, CV and contact | ✓ VERIFIED | Nav is inside `<header>` in built HTML; 5 links, correct order. `landing.spec.ts` (a) asserts exact href and label arrays. |
| T17 | The Case study section's structure does not change when Phase 4 lands real content — only copy and one anchor element do | ✓ VERIFIED | `featured-slot.tsx` returns identical `SmearTitle as="h3" className="text-heading"` + `p` shape in both branches. `landing.spec.ts` (p) asserts exactly one `h2.section-head` and one `h3.text-heading` state-agnostically. |
| T18 | The landing declares its own route metadata, including a rel=canonical it did not have | ✓ VERIFIED | `app/(en)/page.tsx:18-30`. Built HTML emits `<link rel="canonical" href="https://web-production-9cedb.up.railway.app">`. `prerender.test.ts:208` passes. |
| T19 | `/` is a Server Component — no `"use client"`, no `useSmearHeading` import — and the trail still runs on both Humane headings | ✓ VERIFIED | Verifier grep on `app/(en)/page.tsx` for both strings: no match. `link-contract.test.ts` (i) asserts this as a source fact. `landing-trail.spec.ts` proves the trail still runs. |

**Plan 03-04 — /cv and the /type specimen**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T20 | Following the CV link reaches a real page returning 200 that reads as authored | ✓ VERIFIED (structurally; optical half routed to human) | Live `curl /cv` → **HTTP 200** with `<title>CV — Guillem Gelabert</title>`. Built `cv.html` renders `h1` "CV" + a real body line. "Reads as authored" is human item 4. |
| T21 | The CV page offers a route back to the site root | ✓ VERIFIED | Built `cv.html`: `<a class="text-label link-quiet inline-block py-xs" href="/">← Guillem Gelabert</a>`. |
| T22 | The type specimen carries a reference rendering of every new typographic class | ✓ VERIFIED | `app/(en)/type/page.tsx:105-119` renders `.section-head`, `.link` and `.link-quiet` specimens. `tests/type-specimen.spec.ts` passes. |
| T23 | Neither `/cv` nor `/type` renders TODO, placeholder, Coming soon, Under construction or Lorem | ✓ VERIFIED | `tests/cv.spec.ts` no-placeholder-words gate passes; verifier grep over both sources returns no marker copy. |

**Plan 03-05 — A2 back links and A3 link-quiet sweep**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T24 | A visitor following the Writing link can get back to the site root from either index | ✓ VERIFIED | `app/(en)/writing/page.tsx:36-37` and `app/(de)/texte/page.tsx:43-44` both render `homeLink` → `/`. `writing-index.spec.ts` passes. |
| T25 | A German reader on `/texte` reaches the site root through a link declaring it leads to an English page | ✓ VERIFIED | `app/(de)/texte/page.tsx:43` carries `hrefLang="en"`. |
| T26 | Every non-prose link on the site changes to accent on hover and shows a 2px accent focus ring | ✓ VERIFIED | `link-quiet` confirmed on both indexes, both `[slug]` back links, all three `not-found` back links and `LanguageSwitch` (grep across 8 files). Playwright A3 assertions pass. |
| T27 | Under prefers-reduced-motion those links still change colour and gain their underline | ✓ VERIFIED | Same media-query structure as T11; `reduced-motion.spec.ts` passes. |

**Plan 03-06 — the landing spec**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T28 | Nav, work list and featured slot are gated by assertions reading computed values from a real render | ✓ VERIFIED | `tests/landing.spec.ts` (460 lines, 21 tests a–u) uses `getComputedStyle`/`getBoundingClientRect` throughout, not plan arithmetic. |
| T29 | A card, border box, grid, fill or fourth rule weight on the landing fails a test | ✓ VERIFIED | (m)(n)(t) assert computed border widths, box-shadow, border-radius and background. |
| T30 | The featured slot's assertions are state-agnostic — they pass in interim and will pass in Phase 4's published state with no Phase 3 file changed | ✓ VERIFIED | (p) asserts only counts of `h2.section-head` and `h3.text-heading` inside `section#case-study` — both branches of `featured-slot.tsx` satisfy it. |
| T31 | A rendered placeholder marker word on `/` fails a test | ✓ VERIFIED | (s) "D-02: nothing on / reads as unfinished" — absence assertion over the marker-word list. |
| T32 | The private `ib-gdp-evolution` repo name appearing in rendered output fails a test | ✓ VERIFIED | (j) asserts no `github.com` link and `bodyText` absence; `prerender.test.ts:328` repeats it at production tier. |

**Plan 03-07 — viewport and trail regression**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T33 | The landing stays a single column with no horizontal overflow at 375px and 1440px | ✓ VERIFIED | `tests/landing-viewport.spec.ts` passes in the 117/117 run. |
| T34 | The nameplate genuinely responds to viewport width, asserted against the real clamp() formula rather than an assumed ceiling | ✓ VERIFIED | `clampPx` appears 4× in `landing-viewport.spec.ts`, reimplementing the shipped curve. 03-09 measured 56px @375 and 139.2px @1440 — matching the formula, not a 180px guess. |
| T35 | Both Humane headings grow a multi-layer text-shadow mid-scroll and settle back to none | ✓ VERIFIED | `landing-trail.spec.ts` reads computed `textShadow` (4 occurrences) during a scripted scroll; passes. |
| T36 | A visitor arriving with prefers-reduced-motion already set sees no trail at all on `/` | ✓ VERIFIED | `emulateMedia` used 3× in `landing-trail.spec.ts`, applied before `goto`; passes. |
| T37 | The landing registers exactly two trail headings, not three and not five | ✓ VERIFIED | Asserted in `landing-trail.spec.ts`; consistent with source (`h1` + featured `h3` are the only `SmearTitle`s on `/`). |

**Plan 03-08 — production-tier gate, deploy, tripwire record**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T38 | The production build prerenders `/` and `/cv`, both carry the inherited noindex, no route restated robots | ✓ VERIFIED | Verifier's own clean build: both `○ (Static)`. Built HTML for both carries `<meta name="robots" content="noindex">`. `link-contract.test.ts` (i) asserts the string "robots" never appears in `app/(en)/page.tsx`; `prerender.test.ts:238` asserts the inheritance. |
| T39 | `/` emits a rel=canonical it did not have before this phase | ✓ VERIFIED | Confirmed in built HTML and by `prerender.test.ts:208-221`. |
| T40 | `/`'s meta description equals POSITIONING_PLACEHOLDER in production | ✓ VERIFIED | Built HTML `meta description = "Developer."`; `prerender.test.ts:223-235` asserts equality against the imported constant, not a literal. `landing.spec.ts` (g) asserts the rendered `<p>` equals the meta content. Both consumption sites are bound. |
| T41 | The featured slot ships in its interim state and the interim headline carries no link | ✓ VERIFIED | Built HTML: `<h3 class="text-heading">The case study is being written.</h3>` — no `<a>`. `prerender.test.ts:268` and `:289` pass. |
| T42 | A clean-`.next` build proves the de-clienting and the new route, not a warm cache | ✓ VERIFIED | Verifier ran `rm -rf .next && npm run build` itself; exit 0, `/cv` present in the route table and in `prerender-manifest.json`. |
| T43 | The live Railway URL serves the new landing view, `/cv` returns 200, and the site is still noindexed | ✓ VERIFIED | Verifier `curl`: `/` → 200 with the 5-link nav, both work rows and the interim headline; `/cv` → 200; both `noindex`. |
| T44 | HOME-01 is recorded by name as deferred-by-decision and carries into every subsequent phase's state | ✓ VERIFIED | Three channels confirmed — see Tripwire Channel Audit. |

**Plan 03-09 — the optical sign-off**

| # | Truth | Status | Evidence |
|---|---|---|---|
| T45 | A human has looked at `/` and `/cv` at 375px and 1440px and confirmed the three failures no assertion can see | ? PENDING HUMAN | 03-09-SUMMARY.md states plainly that the checkpoint was resolved, not waited on, and that the optical half is recorded as **open, not claimed as passed**. The measurable half was executed and its numbers reproduce. Routed to human verification, not scored as failed. |
| T46 | The work section reads as hierarchy rather than as two unrelated pages at 1440px | ? PENDING HUMAN | Same. Remedy pre-specified: more space from the existing seven tokens, never a fifth type size. |
| T47 | The two WORK-02 annotations have been surfaced to the user as editable drafts rather than shipped silently | ✓ VERIFIED | Recorded verbatim in `deferred-items.md` §2, `03-09-SUMMARY.md` §Item 4, and `STATE.md` Deferred Items row. Confirmation of the copy itself is human item 6. |
| T48 | HOME-01 has been named out loud as still outstanding at the moment the phase closes | ✓ VERIFIED | `03-09-SUMMARY.md` §Item 5 names it explicitly as a blocking pre-condition on FIND-02. |

**Score:** 45/48 truths verified · 1 deferred-by-decision (SC1/HOME-01) · 2 pending human sign-off (T45, T46)

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|---|---|---|
| 1 | SC1 / HOME-01 — the positioning sentence ships as `Developer.` | The user; blocking pre-condition on Phase 6 FIND-02 | D-08. `03-UI-SPEC.md:26` — "*`HOME-01` ships its layout and typography around a placeholder and is **deferred-by-decision** (`D-08`) — record it as deferred at verification, not as a gap*". The layout, typography and one-source binding around it are all complete and gated. |

**Verifier's own judgement on this classification.** Recording HOME-01 as deferred rather than as a gap is supported by evidence I checked directly, not by assertion: the decision predates execution (it is in the approved UI-SPEC), the constant is a single source consumed in exactly two places, both consumption sites are bound together by passing tests so a partial fix cannot ship, and the deferral is recorded in three independent channels that survive phase transitions. Everything HOME-01 needs in order to be *satisfied by a one-line edit* exists and works. What is missing is the user's sentence, which no amount of code can supply.

### Tripwire Channel Audit (explicitly requested)

All three channels exist and say so. Verified by reading each file, not by trusting the summary.

| # | Channel | Present? | Verbatim evidence |
|---|---|---|---|
| 1 | `.planning/phases/03-work-list-landing-skeleton/deferred-items.md` | ✓ YES | §1 is titled "**`HOME-01` — the positioning sentence is unwritten. THIS IS THE TRIPWIRE.**" Status: "deferred by decision (`D-08`), not a gap." Names both consumption sites, both binding tests, and the carry-forward rule: "**`HOME-01` must never reach the `FIND-02` flag flip still holding `Developer.`**" |
| 2 | `.planning/STATE.md` | ✓ YES — in **two** places | Blockers/Concerns line 96: "**`HOME-01` tripwire (Phase 3, THE TRIPWIRE)**… must never reach Phase 6's `FIND-02` robots flag flip still holding the placeholder." Deferred Items table line 105: `Copy \| HOME-01 — the positioning sentence is unwritten (Developer. placeholder); **blocks FIND-02** \| Deferred by decision (D-08) — the tripwire \| Phase 03` |
| 3 | `03-09-SUMMARY.md` | ✓ YES | §"Item 5 — HOME-01 named out loud (third of three channels)" — states the hazard is structural ("the marker is in the source and never on the screen"), and closes: "**It is a blocking pre-condition on Phase 6's FIND-02 robots flip. The site must not go indexable with `Developer.` in that slot.**" |

The tripwire is additionally enforced mechanically, which is stronger than documentation: `tests/build/prerender.test.ts:223` binds the production meta description to `POSITIONING_PLACEHOLDER` **by equality against the imported constant**, and `tests/landing.spec.ts` (g) binds the rendered `<p>` to that same meta content. Editing one consumption site without the other fails the suite.

### UI-SPEC Phase-Completion Checklist (four items, all accounted for)

| # | UI-SPEC item | Disposition | Evidence |
|---|---|---|---|
| 1 | HOME-01 recorded as deferred-by-decision, by name, in the phase verification record | ✓ DISCHARGED **by this document** | Recorded by name in frontmatter `deferred:`, in Deferred Items, and in the Tripwire Channel Audit above. |
| 2 | The two WORK-02 annotations are drafts awaiting the user's edit — surface them as editable | ✓ CARRIED FORWARD | `deferred-items.md` §2 (verbatim, with the edit constraint), `STATE.md` Deferred Items, `03-09-SUMMARY.md` §Item 4. Re-surfaced as human item 6 below. |
| 3 | The featured slot is interim; carry all four interim surfaces into Phase 4/5/6 state as blocking for FIND-02 | ✓ CARRIED FORWARD | `deferred-items.md` §3 lists all four (featured slot, backlog stub, contact stub, `/cv`). `STATE.md` row: "Four interim surfaces… **blocks FIND-02**". Mechanically gated by `prerender.test.ts:342` "launch gate" test, which must be edited when each surface fills. |
| 4 | SmearTitle's `as` union widened to `"h3"`; the featured headline renders as a real `<h3>` | ✓ COMPLETE | `components/smear-title.tsx:6`. Built HTML: `<h3 class="text-heading">The case study is being written.</h3>`. `landing.spec.ts` (r) asserts the outline is h1=1, h2=4, h3=3 and every `aria-labelledby` resolves. |

ℹ️ The four checkboxes in `03-UI-SPEC.md:570-573` are still rendered `- [ ]`. The spec's own wording allows "ticked **or** explicitly carried forward with a named owner" — all four are explicitly carried forward with named owners. Documentation hygiene only; not a gap.

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `lib/work.ts` | WorkEntry, WORK tuple, CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER | ✓ VERIFIED | All four exported. Two-tuple type makes an empty list a build error, not a UI state. |
| `tests/unit/work.test.ts` | tuple shape, absolute-https hrefs, host/href agreement, banned-tool-word absence | ✓ VERIFIED | Uses `node:test`; contributes to 47/47. |
| `components/smear-title.tsx` | `as?: "h1" \| "h2" \| "h3"` | ✓ VERIFIED | Union widened; `"h3"` present. |
| `lib/locales.ts` | `homeLink` in UiCopy and both UI entries | ✓ VERIFIED | Type field + `en` + `de` values. |
| `tests/unit/css-source.ts` | shared nesting-aware parser, NOT named `*.test.ts` | ✓ VERIFIED | 168 lines; exports `css`, `allBlocks`, `allSelectors`, `extractBlocks`, `ownDeclarationText`, `splitDeclarations`, `declarationsOf`, `valuesOf` — all 8 present. Filename correctly excludes it from `test:unit`'s glob. |
| `app/globals.css` | `.section-head`, `.link`, `.link-quiet` | ✓ VERIFIED | All seven selectors present (lines 358-420), tokens only, no hex. |
| `tests/unit/link-contract.test.ts` | executable gate incl. prefers-reduced-motion | ✓ VERIFIED | 9 tests (a)–(i); includes the A1 source-fact assertion. |
| `app/(en)/page.tsx` | async Server Component, static metadata export, ≥60 lines | ✓ VERIFIED | 101 lines; `export const metadata` present; no client directive. |
| `components/landing/work-list.tsx` | `ol role="list"` over WORK, hairline separator, host marker | ✓ VERIFIED | `role="list"` present; separator uses `border-rule` (not bare `border-t`, avoiding the Tailwind v4 preflight currentColor trap). |
| `components/landing/featured-slot.tsx` | two-state CASE-03 slot from `PostEntry \| null` | ✓ VERIFIED | Both branches present; `SmearTitle` used in each. |
| `components/landing/contents-nav.tsx` | `nav aria-label="Sections"` with exactly five links | ✓ VERIFIED | Exact string present; 5 NAV entries; confirmed in built + live HTML. |
| `components/landing/section-stub.tsx` | backlog and contact placeholders — one component, two copy sets | ✓ VERIFIED | Single component, copy passed as props from the call site. |
| `app/(en)/cv/page.tsx` | real page, real metadata, deliberately typeset | ✓ VERIFIED | `export const metadata` with own title + canonical; no restated robots. |
| `tests/cv.spec.ts` | 200, h1, back link, target size, no-placeholder-words | ✓ VERIFIED | Passes within 117/117. |
| `app/(en)/type/page.tsx` | specimen for the three new classes | ✓ VERIFIED | `section-head` specimen at :105, `.link`/`.link-quiet` at :111-119. |
| `app/(en)/writing/page.tsx`, `app/(de)/texte/page.tsx` | A2 back link (+ hrefLang on de), A3 link-quiet | ✓ VERIFIED | Both confirmed by grep. |
| `components/language-switch.tsx` | `.link-quiet` WITHOUT `inline-block py-xs` | ✓ VERIFIED | Line 26: `className="text-label link-quiet"` — correctly omits the target-size block per WCAG 2.5.8's inline exception. |
| `tests/landing.spec.ts` | ≥150 lines, `aria-label="Sections"` | ✓ VERIFIED | **460 lines**, 21 tests. |
| `tests/landing-viewport.spec.ts` | 375/1440, `clampPx` | ✓ VERIFIED | `clampPx` present ×4. |
| `tests/landing-trail.spec.ts` | `emulateMedia`, `textShadow` | ✓ VERIFIED | Present ×3 and ×4. |
| `tests/build/prerender.test.ts` | production assertions, `POSITIONING_PLACEHOLDER` | ✓ VERIFIED | Imports the real constant at :5; 16 tests pass. |
| `deferred-items.md` | four checklist items, HOME-01 first | ✓ VERIFIED | HOME-01 is §1 and titled THE TRIPWIRE; all four present plus CR-01 carry-forward. |
| `.planning/STATE.md` | HOME-01 tripwire in Deferred Items | ✓ VERIFIED | Present in both the Deferred Items table and Blockers/Concerns. |

No artifact was found MISSING, STUB or ORPHANED.

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `lib/work.ts` | `page.tsx` metadata.description + rendered `<p>` | `POSITIONING_PLACEHOLDER` — one export, two consumers | ✓ WIRED | Both consumers import the constant (`page.tsx:3`, used at `:27` and `:49`). Production HTML proves both resolve to the same string. |
| `lib/work.ts` | `lib/content.ts findBySlug` | `CASE_STUDY_SLUG` against `publishedFor("en")` | ✓ WIRED | `page.tsx:38` — `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)`. Derived state; no boolean flag anywhere. |
| `link-contract.test.ts` | `app/globals.css` | `readFileSync` via shared parser | ✓ WIRED | Imports `./css-source.ts` at :5. |
| `prose-contract.test.ts` | `tests/unit/css-source.ts` | import — parser stated once, not copied | ✓ WIRED | Imports at :3. |
| `work-list.tsx` | the two live pieces | plain `<a href={entry.href}>`, same tab, no target | ✓ WIRED | Source confirmed; built HTML confirms both absolute hrefs and the absence of any `target` attribute. |
| `contents-nav.tsx` | `/cv` | the CV entry in the five-item list | ✓ WIRED | Link present; destination resolves 200 live (previously 404). |
| `cv/page.tsx` | `lib/locales.ts UI.en.homeLink` | shared back-link string | ✓ WIRED | Imports `UI`; renders `{UI.en.homeLink}`. |
| `page.tsx` contents nav | `/writing` | Writing entry via `indexPath` | ✓ WIRED | `contents-nav.tsx:2` imports `indexPath`; A2 closes the return path on both indexes. |
| `texte/page.tsx` back link | `/` | `hrefLang="en"` | ✓ WIRED | Line 43. |
| `landing.spec.ts` | `page.tsx` + `components/landing/*` | Playwright on `npm run dev` | ✓ WIRED | 21 tests execute against a real render. |
| `landing.spec.ts` HOME-01 assertion | `meta[name="description"]` on `/` | equality with rendered `<p>` | ✓ WIRED | Test (g), "the one-source property". |
| `landing-trail.spec.ts` | `smear-heading-provider.tsx` | computed `textShadow` during scripted scroll | ✓ WIRED | Passes. |
| `landing-viewport.spec.ts` | `globals.css` clamp() curves | `clampPx()` reimplementing the real formula | ✓ WIRED | Passes; matches 03-09's measured 139.2px. |
| `prerender.test.ts` | `lib/work.ts POSITIONING_PLACEHOLDER` | relative `.ts` import vs built meta description | ✓ WIRED | `:5` import, `:235` equality assertion. |
| `STATE.md` Deferred Items | Phase 6 FIND-02 | HOME-01 must never reach the flip holding `Developer.` | ✓ WIRED | `FIND-02` named in both the STATE.md row and the Blockers entry. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `work-list.tsx` | `WORK` | `lib/work.ts` typed tuple | Yes — both entries render with real titles, annotations, absolute hrefs and hosts in built **and live** HTML | ✓ FLOWING |
| `page.tsx` (positioning) | `POSITIONING_PLACEHOLDER` | `lib/work.ts` | Yes — `"Developer."` reaches both the `<p>` and the meta description; it is a real sentence, not an empty/marker value | ✓ FLOWING (content deferred by D-08) |
| `featured-slot.tsx` | `caseStudy` | `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)` — real filesystem query in `lib/content.ts` | Correctly `null` today (the MDX file does not exist yet), which **is** the interim state by design — not a hardcoded empty | ✓ FLOWING |
| `contents-nav.tsx` | `NAV` | module-local typed array | Yes — 5 links in built and live HTML | ✓ FLOWING |
| `section-stub.tsx` | `state`, `body` props | literals at the `page.tsx` call site | Yes — both props carry real authored copy; **not** hardcoded `""`/`[]`/`null` | ✓ FLOWING |
| `cv/page.tsx` | `UI.en.homeLink` | `lib/locales.ts` | Yes — `← Guillem Gelabert` in built HTML | ✓ FLOWING |

No HOLLOW, DISCONNECTED or HOLLOW_PROP artifact found. The featured slot's `null` was checked specifically for the "hardcoded empty" failure mode and is a genuine derived query result.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Type safety across the phase | `npx tsc --noEmit` | exit 0, no output | ✓ PASS |
| Data module + CSS contract gates | `npm run test:unit` | `# pass 47 / # fail 0` | ✓ PASS |
| Clean production build, `/` and `/cv` static | `rm -rf .next && npm run build` | exit 0; `○ /` and `○ /cv` in route table | ✓ PASS |
| Production-tier truth | `npm run test:build` | `# pass 16 / # fail 0` | ✓ PASS |
| Full browser suite | `npx playwright test` | `117 passed (22.2s)`, exit 0 | ✓ PASS |
| Lint regression | `npm run lint` | exactly 1 error, in a Phase 1 file | ✓ PASS |
| `/` prerender manifest includes the new route | `node -e` on `.next/prerender-manifest.json` | `['/', '/_global-error', '/_not-found', '/cv', '/favicon.ico', '/texte', '/type', '/writing']` | ✓ PASS |
| Built `/` meta description equals the constant | read `.next/server/app/index.html` | `Developer.` | ✓ PASS |
| Live `/` serves the new landing | `curl https://web-production-9cedb.up.railway.app` | HTTP 200; 5-link nav, both work rows, interim headline all present | ✓ PASS |
| Live `/cv` no longer 404s | `curl .../cv` | HTTP 200, `<title>CV — Guillem Gelabert</title>` | ✓ PASS |
| Both live routes still noindexed | `curl` + grep robots | `content="noindex"` on both | ✓ PASS |

### Probe Execution

| Probe | Command | Result | Status |
|---|---|---|---|
| — | — | — | SKIPPED |

Step 7c skipped: `find scripts -path '*/tests/probe-*.sh'` returns nothing, and a grep of all nine PLAN files and nine SUMMARY files for probe references returns nothing. This project uses `node:test` + Playwright tiers rather than shell probes; all four tiers were executed above.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| WORK-01 | 03-01, 03-03, 03-06, 03-08 | Visitor can see a vertical list of Guillem's interactive projects | ✓ SATISFIED | `ol role="list"` with two `li` in built + live HTML; single column asserted at 375 and 1440. |
| WORK-02 | 03-01, 03-03, 03-06, 03-08, 03-09 | One-line annotation per project describing what it is about, not what it was built with | ✓ SATISFIED (copy is draft) | Both annotations render as single non-empty `text-body` lines naming a finding. Banned-tool-word gate passes. Final-copy confirmation routed to human item 6 per D-09. |
| HOME-01 | 03-01, 03-03, 03-06, 03-07, 03-08, 03-09 | Visitor can read a single positioning sentence stating what Guillem does | ⏸ DEFERRED BY DECISION | D-08. Layout, typography, one-source binding and both automated gates complete; the sentence itself is the user's. Tripwired in three channels. |
| HOME-03 | 03-02, 03-03, 03-04, 03-05, 03-06, 03-08 | Visitor can reach work list, backlog, writing index, CV and contact block from the landing view | ✓ SATISFIED | Five links, correct hrefs and order; all four `section[id]` targets exist; `/writing` and `/cv` both 200. Every link clears WCAG 2.5.8's 24px floor (26.2px measured). |
| HOME-04 | 03-02, 03-03, 03-06, 03-07, 03-08, 03-09 | Landing layout stays legible with only two work items — lists and prose, no card grids or three-across rows | ✓ SATISFIED (optical half → human) | Computed-style assertions prove no card idiom, no fourth rule weight, single column, no overflow at either width. "Reads as hierarchy" is human items 1–2 and 5. |

**Orphaned requirements check:** `REQUIREMENTS.md:138-142` maps exactly WORK-01, WORK-02, HOME-01, HOME-03, HOME-04 to Phase 3. All five are claimed by at least one plan's `requirements` frontmatter. **No orphaned requirements.**

ℹ️ `REQUIREMENTS.md` still shows all five as `Pending` in its status table and unticked in the body. That table was not updated by this phase. Documentation hygiene, not an implementation gap.

### Anti-Patterns Found

Scanned all 15 files modified by this phase (array-expanded — an initial scan using an unquoted shell variable silently matched nothing under zsh and was re-run correctly).

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| — | — | `TBD` / `FIXME` / `XXX` | — | **Zero occurrences** across all phase files. No debt-marker gate triggered. |
| `lib/work.ts` | 55 | Identifier contains `PLACEHOLDER` | ℹ️ Info | `POSITIONING_PLACEHOLDER` is an intentional, documented constant name (D-08). Its **value** is a real sentence (`"Developer."`); the word "placeholder" never reaches rendered output. Confirmed by `landing.spec.ts` (s) and `cv.spec.ts`. Not a debt marker. |
| `app/(en)/page.tsx` | 3, 20, 27, 49 | Same identifier | ℹ️ Info | Import, comment and the two sanctioned consumption sites. |
| `components/smear-heading/use-prefers-reduced-motion.ts` | 23 | `react-hooks/set-state-in-effect` lint error | ℹ️ Info | Pre-existing Phase 1 file, **not modified by this phase**. Known deferred item; `03-VALIDATION.md:29` explicitly sets the lint criterion at "exactly 1 known error", not zero. Zero new lint errors introduced. |

No `return null` / `return {}` / `return []` / `=> {}` / `console.log` stub implementations in any landing component or route. No "coming soon", "under construction", "lorem", "not yet implemented" copy anywhere. No `img`, `svg` or `button` in `main`. No hardcoded-empty props at any call site.

### Human Verification Required

#### 1. Work-section hierarchy at 1440px
**Test:** Load `/` at 1440px. Look at the Case study section against the Work section.
**Expected:** The 72px Humane featured headline reads as clearly primary over the 18px Newsreader work titles — the sections read as one hierarchy, not two unrelated pages.
**Why human:** Face contrast, not size contrast, carries the distinction. No assertion can prove "reads as hierarchy." **Remedy if it fails, specified in advance: more space using the existing seven tokens — NOT a fifth type size.** `link-contract.test.ts` and `prose-contract.test.ts` are the standing proof no budget widened.

#### 2. Ordinal-above-title grouping at 375px
**Test:** Load `/` at 375px. Look at a single work-list row.
**Expected:** The `01` ordinal, title, annotation and host read as one grouped entry, not as four loose lines.
**Why human:** Optical grouping — geometry cannot answer it. **Remedy: more space above the ordinal, existing tokens only.**

#### 3. Nameplate above the standfirst at the 56px floor
**Test:** Load `/` at 375px. Look at the gap between "Guillem Gelabert" and the sentence beneath it.
**Expected:** The 24px (`lg`) gap reads as comfortable under a 56px Humane nameplate.
**Why human:** Measured as exactly one on-grid token at both widths; whether that *reads* as comfortable is optical. **Remedy: increase to the next token (32px `xl`), not a new value.**

#### 4. `/cv` reads as authored
**Test:** Load `/cv` at 375px and 1440px.
**Expected:** Reads as a deliberately typeset page, not as an unfinished or broken site.
**Why human:** This judgement is the entire point of D-02. **Remedy: copy revision, not layout change.**

#### 5. `h2` vs `h3` read as two distinct levels
**Test:** Load `/`. Compare the four section heads against the work-list titles and the featured headline.
**Expected:** Two levels are distinguishable.
**Why human:** Identical type (14px uppercase 0.04em) separated only by a 1px rule and 48px vs 32px top margin — the thinnest hierarchy signal in the contract. **Remedy: more space above `h2` — NOT a fifth type size.**

#### 6. Confirm or edit the two WORK-02 annotations (D-09)
**Test:** Read both lines in `lib/work.ts:24-38` and either accept them or supply replacements.
- **01 — Everyone in Mallorca Knows It:** *"The Balearics stopped gaining on Europe in 1993 — while tourist arrivals went on tripling."*
- **02 — Watch People Die Live:** *"Roughly two people die every second: where they are, when it happens, and who they were."*

**Expected:** Each keeps saying what the piece is *about*.
**Why human:** They satisfy WORK-02 as written but are drafts, not confirmed final copy. Any edit naming a language, framework or library fails `tests/unit/work.test.ts` rather than shipping.

#### 7. (Standing, not a Phase 3 blocker) Supply the HOME-01 positioning sentence
**Test:** Replace `POSITIONING_PLACEHOLDER` in `lib/work.ts:55`.
**Expected:** One sentence stating what Guillem does. The rendered `<p>` and the share-preview description both update from that single edit.
**Why human:** Only the user can write it. **This must never reach Phase 6's FIND-02 robots flip still holding `Developer.`**

### Gaps Summary

**No gaps.** Every artifact exists, is substantive, is wired, and carries real data through to both the production build and the live deploy. All four ROADMAP Success Criteria are met to the extent code can meet them; all 15 declared key links are wired; all five phase requirements are claimed by plans with none orphaned; and the phase introduced zero debt markers and zero new lint errors.

Two things keep this from `passed`, and neither is a defect:

**One deferred-by-decision item.** HOME-01's positioning sentence is the user's to write (D-08, taken before execution and recorded in the approved UI-SPEC). What matters for verification is that the deferral is *safe*: the constant has exactly one statement, both consumption sites are bound together by passing tests so a partial fix cannot ship, the site remains `noindex` until Phase 6, and the deferral is recorded in three independent channels — `deferred-items.md`, `STATE.md` (twice — Deferred Items and Blockers), and `03-09-SUMMARY.md`. All three were read and confirmed. **The blocking relationship on Phase 6's FIND-02 is named explicitly in all three.**

**Five genuinely open optical items, plus draft-copy confirmation.** The 03-09 checkpoint was resolved rather than waited on, and its summary is candid about it: the measurable half was executed (and every number in it reproduces against the shipped code) while the optical half is recorded as open and explicitly not claimed as passed. That honesty is why these are human-verify items rather than gaps — the phase did not assert a human verdict it never obtained. Each carries a remedy specified in advance, and each remedy is "more space from the existing seven tokens," never a fifth type size.

**Carried forward, not rediscovered:** CR-01 from Phase 2 (localised `[slug]` 404s do not server-render without JS) remains open and deferred to Phase 6's middleware layer. Phase 3 correctly did not attempt it — no middleware was added and `dynamicParams` was not set on either `[slug]` route.

**The phase goal is achieved.** The landing view assembles its navigation surface and vertical work list, and — as the goal predicted — the work-list code carries no dependency on the case study existing: the featured slot resolves `null` from a real filesystem query and renders its interim state, with state-agnostic assertions that will still pass when Phase 4 lands.

---

_Verified: 2026-08-31T14:22:35Z_
_Verifier: Claude (gsd-verifier)_
