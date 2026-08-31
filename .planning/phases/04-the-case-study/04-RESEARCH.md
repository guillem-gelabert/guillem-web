# Phase 4: The Case Study - Research

**Researched:** 2026-08-31
**Domain:** Long-form editorial writing against an existing MDX pipeline; deterministic screenshot capture of a live D3 scrollytelling artifact
**Confidence:** HIGH

## Summary

Every source artifact named in `04-CONTEXT.md` exists, at the exact byte sizes CONTEXT records, and says what CONTEXT claims it says. The critical premise holds: **IB is Illes Balears**, the piece is a D3 scrollytelling essay on Balearic GDP per capita 1900–2025 against tourist arrivals, and nothing in this phase needs to be invented. The abandoned earlier thesis — CASE-02's hardest beat — is real, is titled *"The Balearic Paradox: Is Tourism Mallorca's Dutch Disease?"*, and contains all five symptoms with the exact figures CONTEXT quotes. `[VERIFIED: filesystem + live HTTP]`

The phase is smaller in code than CONTEXT assumed and larger in test maintenance. `CASE_STUDY_SLUG` in `lib/work.ts` **already equals** `"the-chart-therefore-changes"` — there is no code change at all. `FeaturedSlot` is fully built and switches on a null check. But publishing the MDX files breaks **six existing assertions** across two test files, because Playwright runs against `npm run dev` where drafts are visible and the case study (dated 2026-08-31) sorts newest in both indexes. That is the single biggest under-estimated item in this phase.

Figure capture is a solved problem, better than CONTEXT hoped. The live piece exposes a deterministic animation-lifecycle oracle (`svg[data-animation-state="idle"]` plus a generation counter) and ships a complete, production-tested Playwright story driver in its own repo. I drove the live site end to end and captured all three figure states: the step numbers in D-07 are correct, and F3 is decisively the strongest third figure. Keyboard navigation is **not** how to do this — scroll-and-settle is.

**Primary recommendation:** Port the ~60-line settle-driver subset from `ib-gdp-evolution/tests/e2e/helpers/story-driver.ts` into a one-shot capture script, walk Act 2 with `settleEachStep`, hide `.step` before shooting, and write the three PNGs at 1200×820 (DSF 1) or 2400×1640 (DSF 2). Then write against the **live pages**, not the vault drafts — the vault files are near-final working copies that differ from what shipped.

## User Constraints (from CONTEXT.md)

### Locked Decisions

Copied from `04-CONTEXT.md` § Implementation Decisions. These are settled; research did not explore alternatives to any of them.

- **D-00:** "IB" is *Illes Balears* — the Balearic Islands, NOT the International Baccalaureate. Writing "International Baccalaureate" anywhere is a factual error that invalidates the artifact.
- **D-01:** The complete source material exists in the user's vault and is the writing substrate. Nothing may be invented.
- **D-02:** The piece argues the mechanism from `BRIEF` §2 — holding data, visual form and argument in one head let the form change when the data turned out other than expected. The subject is the moment the form had to change, not the economics.
- **D-03:** The six-beat spine, recovered from source (question / prior expectation / what the data showed / how the form changed / the shipped result / methodology).
- **D-04:** Six `<h2>` sections, one per CASE-02 part, in CASE-02's order. The contract stops at `h3`; no `h4`–`h6`.
- **D-05:** 1,200–1,800 words in English, ~200–300 per section. The first two paragraphs must carry the whole argument alone.
- **D-06:** Ends on the methodology note — receipts last, no pitch, no CTA, no closing summary paragraph.
- **D-07:** Three figures, each a screenshot of a real state of the live published piece. F1 = Act 2 step 3 (default width), F2 = Act 2 step 6 or 7 (default width), F3 = Act 2 step 12 (`wide`). F1 and F2 must be captured at identical width and framing.
- **D-08:** Figures produced by Playwright screenshot of the public live piece, fixed viewport, committed under `public/case-study/`, true pixel dimensions passed to `<Figure width height>`. Do not recolour the user's published work; do not add border, frame, shadow or card. Bare Markdown `![]()` throws at prerender by design.
- **D-09:** Alt text is substantive (shape and finding, never "chart of GDP"); the caption states what the figure proves and names the data source.
- **D-10:** No live or embedded React chart. Static figures only. `Figure` and `Aside` are the only components used.
- **D-11:** First person singular, throughout.
- **D-12:** Technical about data and form; silent about stack. **Naming a library, framework or build tool is a scope violation.** No "built with", no stack list, no performance notes.
- **D-13:** The implied reader is a graphics editor who reads charts for a living. Do not explain chart types. Do not assume they know Balearic or Spanish regional economics.
- **D-14:** Roughly 60% the decision moment, 40% subject and outcome. No self-deprecation, no hedging.
- **D-15:** Slug and title locked. EN title `The Chart Therefore Changes`, slug `the-chart-therefore-changes`, URL `/writing/the-chart-therefore-changes`. DE provisional title `Die Grafik ändert sich`, slug `die-grafik-aendert-sich`, URL `/texte/die-grafik-aendert-sich`. **The DE title must be taken verbatim from the corresponding sentence in `de_with_charts.md` if it differs from the provisional wording.** Only the EN slug is a hard code contract; the DE slug may be finalised during execution.
- **D-16:** `date: "2026-08-31"`, `draft: false`, `type: "case-study"`.
- **D-17:** The German translation ships in this phase. **Escape hatch, and it must be used rather than shipping bad German:** if the translation cannot be produced to a standard the executor is confident in, ship it `draft: true`.
- **D-18:** "Done" is a mechanical gate, since nobody proofreads before it goes live. (Full checklist reproduced in Validation Architecture below.)
- **D-19:** Accuracy gate — every number and claim traces to the shipped text, the methodology, or the live pages. Seven specific traps, all reproduced and re-verified in § Accuracy Gate below.
- **D-20:** The live piece is linked inline in prose, once, in "What shipped". A plain `<a>` in a sentence — not a labelled affordance, not a button, not a "view the piece" block. Does not satisfy CASE-05.

### Claude's Discretion

- Sentence-level prose in both languages, and the exact standfirst wording — constrained by D-19's accuracy gate, by the "no adjectives about the work" voice rule, and by the standfirst being **plain text** (no bold, no links, no inline markup; it is already weight 530).
- The precise capture viewport, device scale factor and file format for the three figures, and whether F3 is in fact the strongest third figure once the live states are inspected.
- Exact section-mark wording for the six `<h2>`s, in both languages.
- Where the single `<Aside>` sits within the methodology section and what caveat it carries (the chained arrivals series is the strongest candidate).

### Deferred Ideas (OUT OF SCOPE)

- **CASE-04** — the rejected alternative chart form shown beside the shipped one (v2). Source now identified: `ARTICLE_PLAN.md`'s discarded scatterplot of Spanish regions (GDP per capita vs early school leaving, Balearics as outlier).
- **CASE-05** — a visitor-facing affordance to open the live piece from the case study (v2). D-20's single inline prose link does not satisfy it.
- **The Catalan edition and the apparent syndication** — live piece ships en/ca/de on its `original` edition plus an `eldiario` edition in es/ca. Not in scope for v1. Verify the syndication before ever claiming it.
- **A second case study — Watch People Die.** HOME-07 is already v2.
- **The user's editorial pass.** Drafted autonomously, ships without human proofreading, in both languages. The prose should get one editorial pass from the user **before Phase 6 flips `robots` to indexable.** D-19's accuracy gate reduces factual risk; it does not substitute for the author's ear, particularly in German.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CASE-01 | Visitor can read a published case study covering ib-gdp-evolution. | § Source Artifact Audit (substrate verified), § Publication Mechanics (front-matter schema, slug validation) |
| CASE-02 | Visitor can follow the case study through six parts: the question, Guillem's stated prior expectation, what the data actually showed, how the visual form changed in response, the shipped result, and a methodology note. | § The Six-Part Spine — every beat mapped to verified source text with verbatim quotes |
| CASE-03 | Visitor can reach the case study from the landing view's featured slot. | § Publication Mechanics — `CASE_STUDY_SLUG` already correct, `FeaturedSlot` already built, zero code change |
| HOME-02 | Visitor can see one featured piece given clear visual primacy on the landing view. | § Publication Mechanics — satisfied structurally by the slot resolving to a real entry; Phase 3 built the primacy treatment |

Roadmap SC4 adds: *"Visitor reading the work list sees the featured entry's annotation copy link into the case study rather than duplicate its content."* This is discharged **structurally** by 03-UI-SPEC D-10 — the featured entry's annotation copy *is* the post's front-matter `standfirst`, and the headline links to `/writing/{slug}`. It requires no edit to `WORK` in `lib/work.ts`. `[VERIFIED: .planning/phases/03-work-list-landing-skeleton/03-UI-SPEC.md § Featured slot contract]`

## Project Constraints (from CLAUDE.md)

- **MVP first. No polishing until the core works.** `[CITED: ./CLAUDE.md]`
- **Update `_pm/kanban.md` when completing tasks.** The file exists and already carries a Phase 4 line under `## Next` seeded from ROADMAP.md. `[VERIFIED: _pm/kanban.md]`
- Project goal is a data-journalism / dataviz / creative-dev job hunt — which is why D-12's "no engineering claims" rule and D-14's "no self-deprecation" rule are load-bearing rather than stylistic.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Case-study prose | Content (MDX in `content/`) | — | The pipeline reads the filesystem; the slug comes from the filename. No route, no component, no data layer touches this. |
| Front-matter validation | Build (`assertFrontmatter`, inside `allPosts`, inside `generateStaticParams`) | — | Already built. Throws during `next build`; this phase only supplies conforming input. |
| Featured-slot state | Frontend Server (RSC, `publishedFor("en")` → `findBySlug`) | — | Derived, not flagged. Publishing the file *is* the state change. No client tier involved. |
| Figure assets | CDN / Static (`public/case-study/`) | — | Plain `<img>` served from `public/`. Deliberately not `next/image` — no `sharp` runtime dependency. |
| Figure capture | Build-time tooling (one-shot Node/Playwright script) | External service (the live `ib-gdp.guillemgelabert.com`) | Runs once, offline from the app. Output is committed. Nothing at request time depends on the live piece. |
| Live-piece link (D-20) | Content (a plain `<a>` in prose) | — | An outbound href in Markdown. No tier owns it beyond the prose renderer. |

**Tier hazard to avoid:** the capture script is build-time tooling and must never become a runtime dependency. Nothing in `app/` may fetch `ib-gdp.guillemgelabert.com`. The three PNGs are committed artifacts.

## Source Artifact Audit

This is the single most valuable section of this research: the whole phase rests on this material being real. **It is.** All six artifacts exist, at the exact sizes CONTEXT records.

| File | CONTEXT claims | Actual | Status |
|------|---------------|--------|--------|
| `/Users/guillem/vault/projects/personal/ib-gdp-evolution/en_with_charts.md` | 11.5 KB | 11,501 bytes | ✅ exists, readable |
| `…/ib-gdp-evolution/de_with_charts.md` | 13.3 KB | 13,262 bytes | ✅ exists, readable |
| `…/ib-gdp-evolution/methodology.md` | 17.8 KB | 17,788 bytes | ✅ exists, readable (Catalan, as claimed) |
| `…/ib-gdp-evolution/act2.md` | 7.8 KB | 7,847 bytes | ✅ exists, readable |
| `…/ib-gdp-evolution/app/utils/routes.ts` | 2.4 KB | 2,389 bytes | ✅ exists, `SLUG_MAP` present as described |
| `/Users/guillem/vault/projects/personal/data-story-ib-gdp/ARTICLE_PLAN.md` | 8.8 KB | 8,847 bytes | ✅ exists, readable |

`[VERIFIED: filesystem stat + full read of each file]`

### Live pages — all reachable

| URL | Status |
|-----|--------|
| `https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing` | HTTP 200 |
| `https://ib-gdp.guillemgelabert.com/auf-mallorca-weiss-es-jeder` | HTTP 200 |
| `…/everyone-in-mallorca-agrees-on-one-thing/methodology` | HTTP 200, 136 KB |

`[VERIFIED: curl 2026-08-31]`

### Three artifacts CONTEXT did not name, and they matter

1. **`ib-gdp-evolution/app/story/act2-steps.ts`** — the **shipped** Act 2 step configuration as code: `ACT2_STEPS`, twelve entries keyed `s0`–`s11`, each with an `axisMode` and an explicit series list. This is a far better authority than the live JS bundle CONTEXT cites, and it resolves the step-numbering ambiguity outright. `[VERIFIED: file read]`

2. **`ib-gdp-evolution/tests/e2e/helpers/story-driver.ts`** — a complete, production-tested Playwright driver for exactly this piece, with a deterministic settle oracle. This is the answer to specific question 3 and it removes essentially all the capture risk CONTEXT anticipated. `[VERIFIED: file read + executed against live site]`

3. **`ib-gdp-evolution/i18n/locales/en.json` → `methodology`** (22 keys, ~22 KB) and its `de.json` sibling — **the authoritative English and German wording of the methodology page.** CONTEXT mentions the mirror in passing ("Catalan; mirrored in `i18n/locales/en.json` under `methodology`") but does not draw the consequence: the case study's methodology section can quote the author's own *published English and German*, not a translation of the Catalan. This eliminates a whole class of translation risk in both locales. `[VERIFIED: parsed JSON, extracted quotes]`

### Corrections to CONTEXT — read these before writing

Everything below was checked against the live pages, which D-19 makes authoritative.

| # | CONTEXT says | Verified reality | Impact |
|---|-------------|------------------|--------|
| C-1 | The DE title is provisionally `Die Grafik ändert sich`, slug `die-grafik-aendert-sich`. | **The shipped German pivot sentence is "Dafür ändert sich die Darstellung."** `Die Grafik ändert sich` appears **nowhere** on the live DE page. The subject is *Darstellung*, not *Grafik*. | D-15's own rule ("must be taken verbatim … if it differs") **mandates a change.** Recommend title `Die Darstellung ändert sich`, slug `die-darstellung-aendert-sich`. Both pass `SAFE_SLUG`. D-15 explicitly permits this: the DE slug is not a code contract. |
| C-2 | The live EN standfirst is *"…The data tells a more complicated story."*, quoted from `en_with_charts.md`. | The **live page** says exactly that. **`en_with_charts.md` says "The data tell a more complex story."** The vault file and the shipped page differ. | `en_with_charts.md` is a near-final working copy, not the shipped text. **For any sentence quoted verbatim, verify against the live page.** All other load-bearing quotes were checked and do match (see § Verified Quote Bank). |
| C-3 | D-03 beat 3: Extremadura "grew tenfold over the same two generations — **as did** Andalusia, Portugal, France and Ireland". | The shipped text says only Extremadura's *"GDP per head … also increased tenfold within two generations."* Of the others it says *"The same **pattern** appears in Andalusia, Portugal, France, Ireland and much of Europe."* | Writing "all grew tenfold" is an **overstatement not supported by the source**. Say the *shape* was common; reserve "tenfold" for Extremadura (and for the Balearics, of which the text says the economy per person "is now ten times larger"). |
| C-4 | D-19 trap 1: *"in the script the axis switch is step 13; in the shipped Act 2 it is step 6"* — presented as a conflict where the shipped piece wins. | Not a conflict. **`act2.md` numbers steps globally; Act II opens at step 8.** Script step 13 − 7 = Act 2 local step 6. They agree exactly. The script does diverge on "% of EU-15" (shipped: EU-27), "around 1990" (shipped: 1993), and its 10 Act-2 steps vs the shipped 12. | The rule "shipped wins" still holds and is still right. But do not describe the step numbering as an error in the script — it is a different origin. |
| C-5 | D-07 F2 shows *"the same data after the axis switch"*, forming a before/after pair with F1. | **No shipped step shows F1's six comparators in `pct-eu27`.** The axis-switch step (`s5`) drops Extremadura/Andalusia/Portugal/France and substitutes Bulgaria, as the *calibration* of the new scale (Ireland 158%, Bulgaria 54%). | The captures are still the right ones and the identical-framing rule still holds. But **the caption and alt text must not claim "the same data"** — the shipped narrative is that the *measure* changed, and the comparator set changed with it. The EN text frames it exactly that way. |
| C-6 | Sources: Barceló Pons (1966) covers 1925–1965. | The live methodology's facts table says **1925-1965** ✅. But its own prose sentence a few lines later says *"They cover 1930–65."* The live page is internally inconsistent. | Prefer the facts table, or avoid the range entirely. Low stakes. |
| C-7 | D-19 trap 6: live methodology gives Valdivielso & Moranta as *J. Sustainable Tourism* **27(12), 2019**. | Confirmed — live page renders *"Journal of Sustainable Tourism, 27(12), 1876–1892"* with DOI `10.1080/09669582.2019.1660670`. **But the same live page's section heading reads "Valdivielso and Moranta (2020)".** Three variants now exist (27(12)/2019 live citation, (2020) live heading, 28(12)/2020 in `methodology.md`). | Classic online-first vs issue-year split. **Recommendation: give author names and the DOI, or author names and year only. Do not print a volume/issue** — every choice contradicts one of the author's own surfaces. |

Nothing else in CONTEXT failed verification. D-19's traps 2, 3, 4, 5 and 7 all hold as written.

## The Six-Part Spine — beat-by-beat source map

D-04 fixes six `<h2>`s in CASE-02's order. Each beat below names exactly where its material lives, so the planner can assign concrete text per section.

### Beat 1 — The question
**Working section mark:** `The question`

| Source | What it gives |
|--------|---------------|
| Live EN page, opening ¶¶ (mirrored `en_with_charts.md` ¶¶1–6) | *"Tourism accounts for 45.5% of the Balearic economy."* — `[VERIFIED: live page]` |
| Same | *"From developers to campaigners, left and right agree that tourism rescued the islands from poverty."* — the myth stated in one line. `[VERIFIED: live page]` |
| Same | *"This is Mallorca's accepted economic history. Politicians repeat it. Hoteliers rely on it. Even critics of mass tourism, while condemning the damage it causes, tend to accept its central claim."* |

### Beat 2 — Guillem's stated prior expectation
**Working section mark:** `What I expected` · **This is CASE-02's hardest beat and it is fully documented.**

CONTEXT D-03 is right that there are **two distinct records** and that conflating them misrepresents both.

**(a) The published prior** — `i18n/locales/en.json` → `methodology.intro`, rendered on the live methodology page:

> "This project began with a widely shared suspicion: tourist arrivals keep breaking records, but life for local people stopped improving long ago and may be getting worse. I wanted to know whether that impression would survive contact with the data."

`[VERIFIED: en.json methodology.intro, verbatim — matches CONTEXT exactly]`

**(b) The abandoned article structure** — `data-story-ib-gdp/ARTICLE_PLAN.md`. **Every claim CONTEXT makes about this file is verbatim true.** `[VERIFIED: full file read]`

| CONTEXT claim | Verified in ARTICLE_PLAN.md |
|---|---|
| Titled *"The Balearic Paradox: Is Tourism Mallorca's Dutch Disease?"* | ✅ Line 1, verbatim |
| Five-symptom Dutch-disease indictment | ✅ SYMPTOM 1 WAGES, 2 LANGUAGE, 3 EDUCATION, 4 HOUSING, 5 ENVIRONMENT |
| Wages ≈€23,100 salary vs ≈€31,600 needed | ✅ *"average salary ~€23,100/year vs ~€31,600 needed for basic expenses"* |
| Catalan language decline | ✅ SYMPTOM 2 in full |
| Early school leaving 20.1%, worst in Spain, against 4th–5th highest GDP | ✅ *"Spain's worst early school leaving rate (20.1%) despite being the 4th-5th richest region by GDP"* |
| Housing 60.8 years to buy vs 29.7 nationally | ✅ *"60.8 years to buy (vs 29.7 nationally)"* |
| The environment | ✅ SYMPTOM 5, with water/waste/energy figures |

**(c) A third record CONTEXT missed** — `en.json` → `methodology.wishlist`, heading *"The data I was looking for"*, listing two items: a long-run Balearic GDP-per-head series comparable with other Spanish regions and European countries, and a long-run arrivals series beginning before mass tourism. This is the *data* prior rather than the *thesis* prior — a smaller, quieter piece of material, useful if beat 2 needs a third register. `[VERIFIED: en.json]`

**D-19 trap 2, re-verified and strengthened.** ARTICLE_PLAN's INTRO lists *"Chart 1: GDP per capita (relative to EU regional average) vs tourist arrivals over time."* The relative measure was **already there**, as the first exhibit. The honest claim is promotion, not invention — and it is stronger than CONTEXT states: what was the abandoned plan's *opening* exhibit became the shipped piece's *closing* reveal (shipped `s11` is that exact chart). `[VERIFIED: ARTICLE_PLAN.md vs act2-steps.ts s11]`

**⚠️ Trap for beat 2.** ARTICLE_PLAN's richest form-change material sits in its "Tech decisions" section, which is expressed almost entirely in library names — Observable Plot, D3, scrollytelling deferred to V3. **D-12 forbids naming any of these.** The usable, library-free phrasing is ARTICLE_PLAN's own V3 line: *"merge 4 stepped intro charts into one scroll-driven animated timeline."* Use that shape of sentence; do not name the tools.

### Beat 3 — What the data showed
**Working section mark:** `What the data showed`

CONTEXT is right that the reversal is sharper than "the thesis failed": the suspicion survived, the popular explanation did not.

| Source | Verified quote / fact |
|--------|----------------------|
| Live EN page | *"Extremadura remains Spain's poorest region, yet its economy began growing at much the same time as the Balearics'. … With no Magaluf, no s'Arenal, no beach resorts and not even a coast, GDP per head in Extremadura also increased tenfold within two generations."* |
| Live EN page | *"Tourism was the Balearics' route into that wider boom, but it was not the boom's underlying cause."* |
| Live EN page | *"…the islands were not exceptionally poor throughout the first half of the century."* `[VERIFIED verbatim]` |
| Live EN page | *"It rises and falls, moving above and below the European average."* `[VERIFIED verbatim]` |
| `act2.md` craft notes | *"the climb was common, the fall is ours."* `[VERIFIED verbatim]` — the empirically defensible claim |
| `act2.md` craft notes | *"At no point does the piece claim tourism caused the climb, or caused the fall."* `[VERIFIED verbatim]` — **the causal posture the case study must preserve** |

See correction **C-3** above before writing the Extremadura sentence.

### Beat 4 — How the visual form changed
**Working section mark:** `Where the chart changed` · **This is the piece's centre (D-14's 60%).**

The pivot sentence, verbatim from the live EN page — and the source of the title:

> "The chart therefore changes. Instead of plotting income in dollars, it expresses each economy as a percentage of the EU average."

`[VERIFIED: live page + en_with_charts.md, identical]`

CONTEXT's `<specifics>` recommends quoting rather than paraphrasing this, in a `<blockquote>` for the pull-quote treatment. That is well-founded: the Prose Contract's blockquote is *"italic between two hairlines"*, and 02-UI-SPEC records that Newsreader was chosen partly for its true italic with case-study pull quotes named as the reason. The `blockquote em { font-style: normal }` reset exists and is exercised by `content/fixture.mdx`. `[VERIFIED: 02-UI-SPEC.md Prose Contract; app/globals.css:149]`

The shipped mechanics of the moment, from `app/story/act2-steps.ts`:

- Axis mode goes `real-eur` → `pct-eu27` at step key **`s5`**.
- The new scale is calibrated on screen against Ireland and Bulgaria: *"In 2022, for instance, Ireland stood at 158%, while Bulgaria, the EU's poorest country, stood at 54%."* `[VERIFIED: live page]`
- `ACT2_PCT_RANGE = [30, 240]`, 100 baseline rendered as `eu27_avg`.
- `act2.md` (draft) marks the same moment: *"This is the single most important chart transition in the piece — it should be a held moment."* `[VERIFIED verbatim]`

**Unit trap.** The code identifier is `real-eur`, and `act2.md`'s draft says the axis relabels to *"GDP per capita, real € (2025)"*. **Both are wrong for the shipped piece.** The shipped EN prose says *"constant dollars"*; the shipped German says *"Der Vergleich in konstanten Dollar"*; the methodology says *"dòlars internacionals constants de 2011 PPP"*. **The unit is 2011 international PPP dollars. Never write euros.** Note also that the live chart's own y-axis title reads only `GDP per capita`, with tick labels `0`–`55k` and no currency mark — so the caption must *supply* the unit from the methodology rather than describe it as displayed. `[VERIFIED: act2-steps.ts, live DOM y-axis title, live EN + DE prose, methodology.md:22]`

### Beat 5 — The shipped result
**Working section mark:** `What shipped` · **D-20's single inline `<a>` to the live piece belongs here.**

| Source | Verified quote / fact |
|--------|----------------------|
| Live EN page | *"The Balearics stopped gaining ground on Europe in 1993 and have fallen behind ever since, even as arrivals have tripled."* `[VERIFIED verbatim]` |
| Live EN page | *"It took 25 years from the end of the Balearics' relative economic rise to the first mass protests against tourism."* `[VERIFIED verbatim]` |
| Live EN page | *"More young people are leaving the islands for work—three times as many as in 2009"* `[VERIFIED verbatim]` |
| `act2.md` craft notes | Ireland as counter-argument neutraliser: it shows post-1990 climbing was possible, so Balearic flatness is not a continental ceiling. `[VERIFIED]` |

**D-19 trap 4 re-verified:** the live EN `<h1>` is **"Everyone in Mallorca Knows It"**. The slug (`everyone-in-mallorca-agrees-on-one-thing`) is not the headline. Quote the headline. `lib/work.ts`'s `WORK[0].title` already has this right. `[VERIFIED: live page text extraction; lib/work.ts]`

**D-19 trap 3 re-verified:** the `original` edition ships **en / ca / de** (`SLUG_MAP` in `app/utils/routes.ts` declares `en | ca | de | es`), and an `eldiario` edition serves es/ca. Say "in several languages" or name only the ones checked. **Do not assert a count.** `[VERIFIED: routes.ts + live 200s on en/de]`

### Beat 6 — Methodology
**Working section mark:** `Methodology` · **The single `<Aside>` lives here (D-06: receipts last, no pitch).**

Every quotation below is verbatim from `i18n/locales/en.json` → `methodology`, which is the authoritative English wording rendered on the live methodology page.

| Claim | Verbatim English | Status |
|---|---|---|
| Single-year anchor rejected | *"This approach assumes that the relationship between PPP dollars and PPS never changes. Because PPS is not adjusted for inflation, that would amount to assuming zero inflation—clearly unrealistic."* | ✅ verbatim, matches CONTEXT |
| The 20% swing | *"The result also depends heavily on the base year. Using 2000 rather than 2022 changes the estimate by more than 20%."* | ✅ verbatim, matches CONTEXT exactly |
| Two-point log-linear rejected | *"This works only if the relationship between PPP dollars and PPS changes steadily—for example, if inflation is constant."* | ✅ verbatim |
| **The honest sting** | *"Up to 2020, the simpler single-year method is actually closer to Rosés-Wolf's real GDP figures, because Rosés-Wolf and Eurostat follow similar paths. Their treatment of the post-pandemic recovery then diverges: Eurostat's rebound begins earlier, which pushes the reconstructed values for previous years down. Adding a second anchor does not remove the sensitivity to the chosen years, and it still discards Rosés-Wolf's observations between them."* | ✅ verbatim, and **richer than CONTEXT quoted** — the full sentence gives the reason, so it can be used without misrepresenting. **D-19 trap 5 holds: the page never claims surprise. Report what it says.** |
| 2020/2021 excluded | *"I exclude 2020 and 2021 where sources report them. The pandemic was a large but temporary external shock, and plotting those years would obscure rather than clarify the 125-year trend."* | ✅ verbatim (CONTEXT paraphrased accurately) |
| No regional deflator | Catalan original: a quick INE regional-CPI calculation shows *"una desviació de menys de l'1% entre el 2002 i el 2024"*, with the stated caveat that life in the Balearics is more expensive than in Castile or Extremadura. | ✅ verified; note the comparison named is Castile/Extremadura, not "Spain" generally |
| Cirer-Costa sensitivity test | Catalan original: even if the estimates were off by an order of magnitude — so 1920 saw 2,000 or 200,000 rather than ~20,000 tourists — *"L'angle de pujada a partir de 1960 no canviaria"* and the article's conclusion would not change. | ✅ verified; **~20,000 tourists in 1920** is a usable concrete number |

**Arrivals chaining — the strongest `<Aside>` candidate (CONTEXT's recommendation, confirmed).** No continuous series exists, so four sources are chained, preferring the official series where years overlap. Coverage ranges read from the live methodology's own facts tables:

| Source | Coverage |
|--------|----------|
| Cirer-Costa: estimates of pre-tourism tourism | 1900-1936 |
| Barceló Pons (1966) | 1925-1965 (but see C-6) |
| Valdivielso and Moranta | 1959-2019 |
| AETIB/FRONTUR yearbooks and border movements | 1998-2025 |

`[VERIFIED: en.json methodology facts tables]`

**A second `<Aside>` candidate CONTEXT did not surface.** The EU-27 average is computed, not published: it is built from Maddison, population-weighted across the 27 countries that form the EU today, and *"La cobertura no és completa fins al 1985"* — before 1985 the composition changes with available data, and that is marked in the generated data. A benchmark whose own membership shifts under the early half of the series is a real, visible judgement call, and it sits closer to the piece's thesis (the measure is the argument) than the arrivals chaining does. Offered as an alternative, not a replacement. `[VERIFIED: methodology.md:62]`

**GDP sources for the methodology section**, all confirmed: Rosés-Wolf regional GDP database (173 European regions across 16 countries, 1900-2022, 2011 international PPP dollars); Maddison Project Database (169 countries, for EU-27 country levels and the population-weighted average); Eurostat `nama_10_pc` (1975-2025, growth not level) and `nama_10r_2gdp` (2000-2024); Funcas 2025 regional index (Balearics **111.3**, España=100); INE regional CPI as a deflator sanity check. **D-19 trap 7 re-verified: there is no World Bank data and no IBO statistical bulletin anywhere in this project.** `[VERIFIED: en.json facts tables + methodology.md:211]`

## Figures — capture is a solved problem

### The step numbers in D-07 are correct, and triple-verified

I resolved the numbering three independent ways and they agree. `data-step` in the DOM is **1-indexed**; `data-active-step` and the `ACT2_STEPS` key are **0-indexed** (`story-driver.ts:138` — `const stepIndex = dataStep - 1`).

| Figure | D-07 says | `ACT2_STEPS` key | Shipped config | Live DOM (measured) | Live step prose (measured) |
|--------|-----------|------------------|----------------|---------------------|---------------------------|
| **F1** | Act 2 step 3 | `s2` | `axisMode: "real-eur"`, `REAL_COMPARISON_ENTRY` = all six `ACT2_COMPARATORS` | 6 `path.series-path`; y-title `GDP per capita`; legend reads Balearics · Extremadura · Andalucia · Portugal · Ireland · France | *"The same pattern appears in Andalusia, Portugal, F…"* |
| **F2** | Act 2 step 6 or 7 | `s5` | `axisMode: "pct-eu27"`, balearics + bulgaria + ireland + eu27_avg | 4 `path.series-path`; y-title `GDP per capita as a % of the EU average`; 100 baseline | *"The EU average is fixed at 100%. A value of 50% me…"* |
| **F3** | Act 2 step 12 | `s11` | `pct-eu27`, balearics + eu27_avg + `tourist_arrivals` with `axisMode:"real-eur", yRight:true` | 3 `path.series-path`; right-axis title **`Tourist arrivals`**, 0–20M | *"Even if we credit tourism with most of the Baleari…"* |

`[VERIFIED: app/story/act2-steps.ts + live DOM probe via Playwright + live step text, 2026-08-31]`

**Take step 6 for F2, not 7.** `s5` is the axis switch *and* the Ireland/Bulgaria calibration the prose describes; `s6` drops back to Balearics + EU average alone and shows nothing about the new scale. See correction **C-5** on how to caption it.

**F3 is decisively the strongest third figure** — CONTEXT left this to discretion; the answer is unambiguous. The divergence is the whole thesis rendered in two lines: navy relative income flat and falling after ~1990, blue arrivals rocketing to 20M, on a shared x-axis. `[VERIFIED: visual inspection of capture]`

### The capture recipe

CONTEXT suggests keyboard `↑`/`↓` navigation. **Do not use it.** The live piece's own test suite drives the story by scroll-and-settle, and it exposes a deterministic animation oracle that removes all timing guesswork:

- `.explainer-root[data-active-step]` — the active step (`-1` before the first). Act 1 is `nth(0)`, **Act 2 is `nth(1)`**.
- `svg[data-animation-generation][data-animation-state]` — each `update()` opens a generation; `state` reaches `"idle"` only once every transition that generation scheduled has ended, been interrupted or been cancelled.

`[VERIFIED: line-chart.vue:100-124 (createChartAnimationTracker / trackT); story-driver.ts]`

**Port the driver subset — do not invent one.** `ib-gdp-evolution/tests/e2e/helpers/story-driver.ts` is ~250 lines; the needed subset is ~60. It cannot be imported (different repo, and it imports `../../../app/utils/routes`), so copy `readLifecycle`, `waitForNewerGeneration`, `waitForChartIdle`, `waitForActiveStep`, `scrollStepIntoView` and `scrollToStep`.

Five constraints the driver encodes that a fresh implementation would get wrong:

1. **The chart is path-dependent.** `walkToStep`'s own comment: *"a reveal grows or draws depending on the step before it, so the order matters."* You cannot jump to step 12. Walk 1→N. Because the *subject* of each capture is a settled intermediate state, use the `settleEachStep` path, not the fast one.
2. **Never `page.goto("/")`.** The app root is a client-side language redirect; navigating to it races `location.replace` and aborts with `net::ERR_ABORTED`. Go straight to the story slug.
3. **`scrollStepIntoView` must dispatch a synthetic `scroll` event** after `window.scrollTo({behavior:"instant"})` — an instant programmatic scroll does not always emit one, and the step never activates.
4. **Act 2 sits below the outro** — scroll `#outro` into view before driving Act 2's steps.
5. **`SETTLE_TIMEOUT_MS = 10_000` is a failure ceiling, not a wait.** A settle can legitimately run ~2.1s (full-width domain rescale) or ~1.4s (the Act II mode tween) plus up to ~1.2s of per-series stagger (`staggerDelay`, 200ms × 6 positions).

**The one thing the driver does not solve, and it is essential.** In desktop layout the chart panel is a **full-screen overlay** and the step prose card sits *on top of the chart*. I measured a visible, `opacity: 1` `.step` element intersecting the SVG bounding box at all three target steps — at F3 it covers the 1930–1990 stretch of the Balearic line, which is exactly the region the figure exists to show. An element screenshot captures whatever is painted in the box, so the card lands in the PNG.

Fix, applied after settling and before shooting:

```js
await page.addStyleTag({ content: ".explainer-root .step { opacity: 0 !important }" });
```

`opacity` rather than `display:none` or `visibility:hidden` deliberately: it preserves layout, so step activation and any subsequent scrolling still work. Verified — after injection the overlap probe returns `[]` and the captures are clean. `[VERIFIED: measured overlap before/after, then visual inspection]`

### Real dimensions

| Measurement | Value |
|---|---|
| Viewport used | 1440 × 900 |
| Desktop layout query | `(min-width: 1025px) and (min-height: 500px)` — 1440×900 qualifies |
| SVG `viewBox` | `0 0 928 634` (stable across all three steps) |
| **SVG rendered box** | **1200 × 820 CSS px** |
| `.chart-panel` box | 1440 × 900 (full viewport — do not screenshot this; it is the overlay) |
| **PNG at DSF 1** | **1200 × 820** |
| **PNG at DSF 2** | **2400 × 1640**, 132–180 KB per file |
| Aspect ratio | 1.463 : 1 |
| Ground colour | pale blue-grey, as D-08 predicted |

`[VERIFIED: measured via getBoundingClientRect() and sips on the actual PNGs]`

Note `DESKTOP_DIMS` in `use-chart-layout-mode.ts` declares `{chartWidth: 928, chartHeight: 400}`, but the shipped height is computed from the measured pane (`computeChartHeight`), which is why the live `viewBox` is 634 not 400. **Use the measured 1200×820, not the constant.**

**Screenshot the `svg` locator, not `.chart-panel`.** The SVG box is the chart; the panel is the whole viewport.

### Fitting the Prose Contract

`<Figure width height>` supplies the **true intrinsic pixel dimensions of the file** — that is what reserves layout space and satisfies BUILD-06. CSS then scales it: `.prose-site figure img { width: 100%; height: auto }`. `[VERIFIED: app/globals.css:241-249]`

| Slot | CSS width | 1.463:1 renders at |
|---|---|---|
| Default (`<Figure>`) | the 65ch prose measure | ≈ 430–450px tall |
| Wide (`<Figure wide>`) | `min(52rem, calc(100vw - 48px))` = up to **832px** | ≈ 568px tall |

`[VERIFIED: app/globals.css:29-31, 271-275]`

D-07's F1/F2 identical-framing requirement is satisfied **automatically** — all three states render at the same 1200×820 box, so any consistent capture produces identical framing. Only F3's `wide` flag makes it render larger, which is intended.

DSF choice is genuine discretion. DSF 2 (2400×1640) is ~2.9× the widest display size — future-proof, 132–180 KB each, ~450 KB committed. DSF 1 (1200×820) is 1.4–1.9× — a reasonable retina compromise at roughly a third the bytes. Either is defensible; **the hard rule is that `width`/`height` must match the file exactly.**

Reference implementation from `content/fixture.mdx`, which is the shape to copy:

```mdx
<Figure src="/case-study/f2-eu-average.png" alt="…" width={2400} height={1640}>
  Caption in the Label role, naming the data source.
</Figure>

<Figure src="/case-study/f3-arrivals.png" alt="…" width={2400} height={1640} wide>
  Caption.
</Figure>
```

`public/case-study/` does not exist yet — `public/` currently holds five Next.js/Vercel SVGs and `public/fixture/{figure-default,figure-wide}.svg`. `[VERIFIED: ls public/]`

### Alt text has an honest source

D-09 requires substantive alt text describing shape and finding. **The author's own published chart descriptions are exactly that, in both languages**, and they map one-to-one onto the three figures. From the live EN page:

- **F1:** *"The comparison in constant dollars adds Extremadura, Andalusia, Portugal, Ireland and France to the Balearic series. Their income levels differ, but many lines share the same broad shape: a relatively flat first half of the century followed by sustained growth after 1950."*
- **F2:** *"The vertical axis now uses the EU average as its benchmark. The horizontal line at 100% is the average; values above it are richer and those below it poorer. Ireland appears well above the line and Bulgaria far below it."*
- **F3:** *"The final view combines two series. Balearic income relative to Europe rises through the 1960s, 1970s and 1980s, but stops gaining ground around 1993 and then stagnates or falls. Tourist arrivals continue to rise. The two lines, once moving together, diverge."*

`de_with_charts.md` carries the same three as `*Grafikbeschreibung:*` blocks in the same positions — so the German alt text has the same verbatim source. `[VERIFIED: live EN page + de_with_charts.md:47,55,71]`

These are the author's words about the author's charts. Adapt for the case study's framing rather than pasting (the case study is a different artifact), but the factual content needs no invention.

## Publication Mechanics

### The code contract is already satisfied

```
lib/work.ts:  export const CASE_STUDY_SLUG = "the-chart-therefore-changes";
```

**This already equals D-15's slug.** Phase 3 did not ship a placeholder. `[VERIFIED: lib/work.ts]`

`components/landing/featured-slot.tsx` switches on `entry === null` and renders the published branch with `<a className="link-quiet" href={postPath("en", entry.slug)}>{entry.frontmatter.title}</a>` plus `standfirst` and `<PostMeta … switchHref={null} />`. `postPath("en", slug)` → `/writing/{slug}`; `postPath("de", slug)` → `/texte/{slug}`. `[VERIFIED: featured-slot.tsx, lib/locales.ts]`

**Net code change for this phase: zero.** Only content, figure assets, the capture script, and test updates.

### Slug validation

`SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/` in `lib/content.ts`. Executed against the candidates:

| Slug | Result |
|---|---|
| `the-chart-therefore-changes` | **PASS** |
| `die-grafik-aendert-sich` | **PASS** |
| `die-darstellung-aendert-sich` (recommended, per C-1) | **PASS** |
| `die-grafik-ändert-sich` | **FAIL** — confirms `ae` transliteration is required, not stylistic |

`[VERIFIED: executed the actual regex from lib/content.ts]`

The failure path is a thrown error in `loadPostModule` whose message already names the convention: *"German slugs transliterate umlauts: 'ue', 'ae', 'oe', 'ss'."* The live piece follows the same convention — its DE headline is *"Auf Mallorca weiss es jeder"* with `ss`, confirmed on the live page. `[VERIFIED]`

### Required front-matter

`assertFrontmatter` throws during `next build` on any violation. `[VERIFIED: lib/content.ts]`

| Field | Rule |
|---|---|
| `title` | non-empty string, **required** |
| `standfirst` | non-empty string, **required**. Plain text only — no bold, no links, no inline markup (02-UI-SPEC: it is already weight 530) |
| `date` | **required**, `YYYY-MM-DD`, and must be a *real calendar date* — round-tripped through `Date`, so `2026-02-31` fails |
| `lang` | **required**, `"en"` or `"de"` |
| `translationKey` | non-empty string, **required**. The only thing pairing the two files — both must share one value |
| `draft` | optional boolean |
| `type` | optional, `"post"` or `"case-study"`. **`"case-study"` is accepted** |

Working front-matter for the EN file:

```yaml
---
title: "The Chart Therefore Changes"
standfirst: "…"
date: "2026-08-31"
lang: en
translationKey: ib-gdp-case-study
draft: false
type: case-study
---
```

`draft: false` is what flips the slot: `publishedFor("en")` → `selectForLocale` → `isVisible`, which in a production build (`showDrafts()` is false when `NODE_ENV !== "development"`) excludes drafts. `[VERIFIED: lib/content.ts]`

Two build-failure modes worth knowing: `slugsOnDisk` throws if `content/foo.md` and `content/foo.mdx` both exist, naming both filenames; and `loadPostModule`'s try/catch only falls back to `.md` on a genuine *resolution* failure, so an error thrown while evaluating the MDX propagates with its real stack. `[VERIFIED: lib/content.ts]`

### German

The escape hatch (D-17) is unlikely to be needed. `de_with_charts.md` is 13.3 KB of genuinely professional German — *"Der Tourismus erwirtschaftet 45,5 Prozent der balearischen Wirtschaftsleistung"*, *"Die Hacke wich der Maurerkelle, das Feld der Stadt"* — and it is a full, register-matched translation of the same argument, not notes. Three things make the DE job substantially smaller than CONTEXT feared:

1. **The voice reference is a complete parallel text**, sentence for sentence, including all six `*Grafikbeschreibung:*` blocks for the figure alt text.
2. **The methodology has an authoritative German mirror** at `i18n/locales/de.json` → `methodology` (46 KB file), so beat 6's German needs no translation either.
3. **The German is a translation of locked English**, not independent composition.

The residual German risk is not vocabulary, it is the DE title (correction **C-1**) — and that is a decision, not a writing problem.

Note the source's orthography is mixed: the headline uses `weiss` while the body uses `ß` (`schließlich`, `größten`). Match the body's normal German orthography in prose; transliterate only in the slug. `[VERIFIED: de_with_charts.md, live DE page]`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Knowing when the live chart has finished animating | `waitForTimeout(3000)` after each scroll | `svg[data-animation-state="idle"]` + generation counter | The attributes exist precisely for this. Fixed sleeps are flaky (a settle legitimately spans 1.4–3.3s) and silently capture mid-transition frames. |
| Driving the scrollytelling to a step | A fresh scroll/keyboard implementation | Port `scrollToStep` from `story-driver.ts` | Encodes five non-obvious constraints (path dependence, the synthetic scroll event, the `#outro` prelude, the no-`goto("/")` rule, generation ordering) each of which is a silent wrong capture. |
| Removing the step prose from the shot | Cropping the PNG afterwards, or `display:none` | `addStyleTag` with `opacity: 0` on `.step` | Cropping breaks D-07's identical-framing rule; `display:none` collapses layout and breaks step activation. |
| Figure layout stability | `next/image` | `<Figure src alt width height>` | Deliberate Phase 2 decision — production image optimization in Next 16 needs `sharp` as a runtime dependency; the pipeline's stated outcome was zero new runtime dependencies. |
| Any image in MDX | Bare Markdown `![]()` | `<Figure>` | The `img` override in `mdx-components.tsx` **throws at prerender by design**. This is not a lint rule; it fails `next build`. |
| Front-matter validation | Hand-checking fields | `assertFrontmatter` (already runs) | Throws at build with the filename and every problem listed. |
| Flipping the featured slot | Any boolean, flag or constant edit | Publish the file with `draft: false` | The slot is derived. `CASE_STUDY_SLUG` is already correct. |
| Deciding the DE methodology wording | Translating the Catalan `methodology.md` | `i18n/locales/de.json` → `methodology` | The author's own published German already exists. |

**Key insight:** almost every hand-rolled solution in this phase is a *capture* problem, and every one of them has already been solved inside `ib-gdp-evolution`'s own test suite. Read that suite before writing a line of capture code.

## Common Pitfalls

### Pitfall 1: Publishing breaks six existing assertions
**What goes wrong:** `npm test` and `npm run test:build` go red on files this phase never opened.
**Why it happens:** Playwright specs run against `npm run dev`, where `showDrafts()` is always true — so **both** MDX files become visible in dev regardless of the `draft` flag. And `date: "2026-08-31"` is newer than all three fixtures (2026-08-29/30), so the case study sorts **first** in both indexes.
**How to avoid:** treat the updates below as planned tasks, not regressions. Full list in § Validation Architecture.
**Warning signs:** a strict-mode violation on `page.locator("main > hr")` is the tell that `/texte` gained an entry.

### Pitfall 2: Writing from the vault drafts instead of the live pages
**What goes wrong:** a "verbatim" quote that was never published.
**Why it happens:** `en_with_charts.md` is a near-final working copy. Its standfirst differs from the shipped one (correction **C-2**), and `act2.md` differs on the measure (EU-15 vs EU-27), the date ("around 1990" vs 1993) and the step count.
**How to avoid:** every sentence presented as a quotation gets checked against the live page before it ships. Every citation gets checked against the live methodology page (D-19 trap 6).
**Warning signs:** a quote sourced only to `act2.md`. That file is a draft script; read it for reasoning, never for a number.

### Pitfall 3: Naming the stack
**What goes wrong:** an instant D-12 scope violation, and it undercuts `PROJECT.md`'s allocation principle that engineering is demonstrated by the artifact, never claimed in copy.
**Why it happens:** the richest form-change material in `ARTICLE_PLAN.md` is written in library names, and the natural way to describe the change is "moved from Observable Plot to D3".
**How to avoid:** describe the *form*, not the tooling — ARTICLE_PLAN's own library-free phrasing, *"merge 4 stepped intro charts into one scroll-driven animated timeline"*, is the model.
**Warning signs:** any of `D3`, `Observable Plot`, `React`, `Next`, `Vue`, `Nuxt`, `TypeScript`, `SVG`, `built with`, `powered by` in the prose. `tests/unit/work.test.ts:54` already implements exactly this check for the work list — reuse the pattern.

### Pitfall 4: The step card in the figure
**What goes wrong:** all three PNGs ship with a bordered prose card over the chart, duplicating text that is already in the case study and hiding the line the figure exists to show.
**Why it happens:** the desktop chart panel is a full-screen overlay; an element screenshot captures everything painted in the box.
**How to avoid:** the `opacity: 0` style injection, applied after settle, before shoot.
**Warning signs:** none at runtime — this only shows up on visual inspection, so **look at the three PNGs before committing them.**

### Pitfall 5: Overstating the finding
**What goes wrong:** the case study claims more than the live piece does, which destroys the editorial judgement it exists to demonstrate.
**Why it happens:** the compressed version of the argument is more dramatic than the careful one.
**How to avoid:** three specific guards, all from source — the piece never claims tourism *caused* the climb or the fall (`act2.md:64`); only Extremadura is described as growing tenfold, the others share the *pattern* (correction **C-3**); and the methodology never claims surprise at the anchoring result (D-19 trap 5).
**Warning signs:** the words "proves", "caused", "debunks"; any sentence about the author's emotional state.

### Pitfall 6: Mislabelling the unit as euros
**What goes wrong:** F1's caption says "euros"; every number in the figure is wrong by a conversion factor.
**Why it happens:** the shipped code identifier is literally `real-eur`, and `act2.md` says "real € (2025)".
**How to avoid:** the unit is **2011 international PPP dollars**. The shipped EN says "constant dollars", the shipped DE says "konstanten Dollar", the methodology says "dòlars internacionals constants de 2011 PPP". The chart itself displays no unit, so the caption must supply it.
**Warning signs:** a `€` anywhere near a figure caption.

### Pitfall 7: Treating F1 and F2 as "the same data"
**What goes wrong:** a caption that is factually false about the author's own work.
**Why it happens:** D-07 describes them as a before/after pair, which is true of the *measure* but not of the *series*.
**How to avoid:** see correction **C-5**. F1 shows six comparators in absolute dollars; F2 shows the new scale calibrated against Ireland and Bulgaria. The change is the measure.

### Pitfall 8: `grep` cannot see `.planning/`
**What goes wrong:** a false negative that looks like missing material.
**Why it happens:** the shell's `grep` is gitignore-aware and `.planning/` is gitignored (while still tracked).
**How to avoid:** use `/usr/bin/grep` or `--no-ignore` when searching planning docs or the vault, and `git add -f` when committing them. Confirmed during this research — `zsh` also mangles bare `--include=*.vue` globs; quote them.

## Runtime State Inventory

This phase adds content; it renames and migrates nothing. Included for completeness because it publishes to a live deployment.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **None** — the site has no database, no CMS and no datastore. Content is files in `content/`, read at build time by `readdir` over a fixed module-scope `CONTENT_DIR`. | none |
| Live service config | **None** — Railway zero-config Node builder, no custom Dockerfile (deleted in Phase 1). No dashboard-held config encodes the slug. The one external dependency, `ib-gdp.guillemgelabert.com`, is read **only** by the offline capture script. | none |
| OS-registered state | **None** — no scheduled task, daemon or service registration references this project. | none |
| Secrets / env vars | **None** — the capture script needs no credential; the live piece is public. No new env var. | none |
| Build artifacts | `.next/` must be rebuilt before `npm run test:build`, because `tests/build/prerender.test.ts` reads real prerendered HTML from `.next/server/app`. `rm -rf .next && npm run build` is already the documented sequence in `package.json`'s `test:all`. | rebuild before build-tier assertions |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@playwright/test` | Figure capture + the e2e suite | ✅ | 1.62.1 | — |
| Chromium browser binary | Figure capture | ✅ | `chromium-1234` in `~/Library/Caches/ms-playwright/` | — |
| Node | Capture script, `node --test` | ✅ | v22.20.0 | — |
| `ib-gdp.guillemgelabert.com` (EN + DE + methodology) | Figure capture, quote verification | ✅ | HTTP 200 on all three | **None, and none is needed** — once the three PNGs are committed the dependency is discharged permanently |
| `next` / `react` | Build | ✅ | 16.3.3 / 19.2.8 | — |
| `sharp` | — | ❌ | — | Not required, deliberately: `<Figure>` is a plain `<img>` |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none.

**One-time-window note:** the live piece is the only source for the figures. Capture and commit them early in the phase, so a later outage cannot block it.

## Package Legitimacy Audit

**This phase installs no external packages.** Playwright 1.62.1 and its Chromium binary are already present from Phase 1; the capture script uses only `@playwright/test` and Node built-ins (`node:fs/promises`, `node:path`).

| Package | Registry | Disposition |
|---------|----------|-------------|
| *(none)* | — | No installs in this phase |

**Packages removed due to slopcheck [SLOP] verdict:** none — none were proposed.
**Packages flagged as suspicious [SUS]:** none.

If a plan later proposes an image-optimisation or screenshot-diffing dependency, it is out of scope: D-10 caps this phase at `Figure` and `Aside`, and Phase 2's stated outcome was zero new runtime dependencies.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `@playwright/test` 1.62.1 (e2e, against `npm run dev`) + `node --test` (units and build-tier) |
| Config file | `playwright.config.ts`; unit/build globs in `package.json` |
| Quick run command | `npm run test:unit` |
| Full suite command | `npm run test:all` (`test:unit` → `rm -rf .next` → `build` → `test:build` → `test`) |

Current baseline: 18 Playwright spec files, 5 unit test files, 1 build-tier file. `[VERIFIED: ls]`

### Three assertion rules carried forward

1. **Assert MEASURED computed values**, from `getBoundingClientRect()` / `getComputedStyle()` against a real render — never values derived from the plan's or the spec's arithmetic. (`tests/landing.spec.ts` records the Phase 1 lesson: a heading measured 139.2px where the plan assumed "≈180px".)
2. **`page.emulateMedia({ reducedMotion: 'reduce' })` BEFORE `page.goto()`** — load-bearing, because the app reads the preference at mount. `tests/landing-trail.spec.ts:163` states this explicitly. Specs that measure only static markup skip it and say so.
3. **Production truth lives in `tests/build/`, dev truth in Playwright.** Playwright runs against dev where `showDrafts()` is always true and structurally cannot prove what a production build omits.

### Phase Requirements → Test Map

Much of "done" here is editorial and cannot be asserted. What follows is D-18's mechanical gate expressed as commands. **Where a check is not mechanisable, it is marked `manual` rather than faked.**

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CASE-01 | Both MDX files satisfy the front-matter schema; `next build` passes | build | `rm -rf .next && npm run build` | ✅ (schema throws) |
| CASE-01 | The EN post prerenders at `/writing/the-chart-therefore-changes` | build | `node --test tests/build/prerender.test.ts` | ❌ Wave 0 |
| CASE-02 | Exactly six `<h2>` elements, each with a `rehype-slug` id, in CASE-02's order | e2e | `npx playwright test tests/case-study.spec.ts` | ❌ Wave 0 |
| CASE-02 | No `h4`–`h6` anywhere in the rendered post | e2e | same spec | ❌ Wave 0 |
| CASE-02 | The methodology section is last and contains the single `<aside>` | e2e | same spec | ❌ Wave 0 |
| CASE-03 | Featured slot resolves: `<h3>` contains an `<a href="/writing/the-chart-therefore-changes">` and it is the slot's only link | build | `node --test tests/build/prerender.test.ts` | ⚠️ exists, asserts the **interim** state — must be updated |
| CASE-03 | The slot renders the post's `title` and `standfirst` | build | same | ⚠️ same |
| HOME-02 | Exactly one section head and one Heading-role `<h3>` in `section#case-study` | e2e | `tests/landing.spec.ts` (p) | ✅ already state-agnostic, no change needed |
| D-08 | Every `<Figure>` has real intrinsic `width`/`height` matching the file on disk, and non-empty `alt` | unit | `node --test tests/unit/case-study-figures.test.ts` | ❌ Wave 0 |
| D-08 | No bare Markdown image | build | covered free — `mdx-components.tsx` `img` override throws at prerender | ✅ |
| D-10 | `Figure` and `Aside` are the only components used | unit | source scan of the two MDX files | ❌ Wave 0 |
| D-12 | No engineering claim anywhere in the prose | unit | banned-token scan over both MDX bodies | ❌ Wave 0 — **port the regex from `tests/unit/work.test.ts:54`** |
| D-15 | Both slugs match `SAFE_SLUG`; EN slug equals `CASE_STUDY_SLUG` | unit | `node --test tests/unit/work.test.ts` (extend) | ⚠️ partial — asserts the shape, not the file's existence |
| I18N-01 | Both locales build; the pair shares one `translationKey` | build | `npm run build` + prerender test | ⚠️ update |
| D-19 | Fact-check pass against live pages | **manual** | — | not mechanisable |
| D-05 | 1,200–1,800 words EN | unit | word count over the EN body | ❌ Wave 0 — cheap, worth having |

### Assertions that WILL break, and must be updated

This is the concrete maintenance cost of publishing. Six assertions across two files. **All are expected changes in what ships, not flaky tests** — `tests/build/prerender.test.ts:278` already carries a forward note saying so.

**`tests/build/prerender.test.ts` — four tests**

| Line | Test | Why it breaks | Update |
|---|---|---|---|
| 102 | *"both /writing and /texte render their empty state"* — asserts `Nothing published here yet.` / `The first piece is being written.` and the German equivalents | `/writing` gains a published entry | Assert `/writing` now lists the case study. **`/texte`'s half only changes if the DE ships `draft: false`** — under D-17's escape hatch it stays as is |
| 268 | *"the featured slot ships its interim copy in production"* — asserts `The case study is being written.` | slot resolves | Assert the published title and standfirst |
| 289 | *"the interim featured headline carries no link"* — `assert.doesNotMatch(match[0], /<a/)` | the published headline **is** a link | Invert: assert exactly one `<a>`, pointing at `/writing/the-chart-therefore-changes` |
| 342 | *"launch gate: the featured slot, the backlog stub and the contact stub are all still interim"* | the featured slot is no longer interim | **Narrow the gate to the two remaining stubs (backlog, contact).** This test exists to fail when the interim state ends — closing the featured-slot third of it is this phase's job, and Phase 6 still needs the other two |

**`tests/writing-index.spec.ts` — two tests, both dev-visible regardless of `draft`**

| Line | Test | Why it breaks | Update |
|---|---|---|---|
| 21 | *"/writing renders exactly one article whose h2 is the sole link"* — `toHaveCount(1)` | the EN case study makes it 2 in dev | `toHaveCount(2)` |
| 85 | *"/texte renders two articles separated by hr, reverse-chronological…"* — `toHaveCount(2)`, `hr` `toHaveCount(1)`, and an exact title list | the DE file makes it 3 articles / 2 hrs **even at `draft: true`**, and it sorts first (2026-08-31) | `toHaveCount(3)`, `hr` `toHaveCount(2)`, prepend the DE title. **`page.locator("main > hr").evaluate(…)` will throw a strict-mode violation with two hrs** — scope it to `.first()` |

Also verify (expected to pass, worth an explicit check): `tests/landing.spec.ts:428` asserts `page.locator("img")` `toHaveCount(0)` on the landing page. The three figures live on `/writing/{slug}`, not `/`, so this holds. `[VERIFIED: reading the spec]`

### Sampling Rate

- **Per task commit:** `npm run test:unit`
- **Per wave merge:** `npm run test:all`
- **Phase gate:** full suite green, plus the manual D-19 fact-check pass, before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/case-study.spec.ts` — six `<h2>` ids in order, no `h4`–`h6`, methodology last, one `<aside>`, one outbound prose link (CASE-02, D-04, D-06, D-20)
- [ ] `tests/unit/case-study-content.test.ts` — reads both MDX files from disk: word count (D-05), banned engineering tokens (D-12, regex ported from `work.test.ts:54`), only `Figure`/`Aside` used (D-10), no bare Markdown image (D-08), shared `translationKey`
- [ ] `tests/unit/case-study-figures.test.ts` — every `<Figure>`'s `width`/`height` matches the real PNG dimensions on disk, and `alt` is non-empty and longer than a threshold (D-08, D-09)
- [ ] Update `tests/build/prerender.test.ts` — four tests, per the table above
- [ ] Update `tests/writing-index.spec.ts` — two tests, per the table above
- [ ] Capture script (`scripts/capture-case-study-figures.mjs` or similar) — not a test, but Wave 0 work that everything else depends on

No framework install is needed.

## Security Domain

`security_enforcement` is absent from `.planning/config.json`, so it is enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface exists anywhere on the site |
| V3 Session Management | no | No sessions, no cookies |
| V4 Access Control | **yes** | `findBySlug(await publishedFor(locale), slug)` **before** `loadPostModule` — the ordering is the boundary and `lib/content.ts` documents it as such. Publishing with `draft: false` is the deliberate access change this phase makes. Do not reorder the route's calls. |
| V5 Input Validation | **yes** | `assertFrontmatter` — throws at build on any malformed field. This phase supplies input to it; it adds no new parser. |
| V6 Cryptography | no | Nothing is signed, hashed or encrypted |
| V12 Files & Resources | **yes** | `CONTENT_DIR` is a fixed module-scope constant and `SAFE_SLUG` gates every dynamic import. Adding files to `content/` changes no boundary. The capture script writes only to `public/case-study/`. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via slug into the MDX context module | Tampering | `SAFE_SLUG` allowlist — already enforced, both new slugs pass |
| Draft content leaking to production | Information Disclosure | `isVisible` / `showDrafts` — publishing is the intended change here; the **German escape hatch relies on this working**, and `tests/build/prerender.test.ts` is what proves it |
| Reverse tabnabbing on the outbound live-piece link (D-20) | Tampering | **Not applicable** — the site uses no `target="_blank"` anywhere, so no `rel="noopener"` is needed. Do not add one; it would be the only instance on the site. `[VERIFIED: repo-wide grep found zero occurrences]` |
| XSS via MDX | Injection | MDX compiles at build time from repo-controlled files. No user input reaches the renderer. |
| Committing a screenshot that leaks non-public information | Information Disclosure | The three figures are captures of a **public** page. **Do not capture the `/review` route** that `routes.ts` exposes — it is an internal content-review surface, not published editorial. |
| Linking the private repo | Information Disclosure | The `ib-gdp-evolution` GitHub repo is **private**. `tests/unit/work.test.ts:37` already asserts no entry links to or names it — the same rule binds this phase's prose. |

**Forward note (not this phase):** 02-UI-SPEC records that Shiki emits an inline `style` attribute on every token span, which a Phase 6 CSP of `style-src 'self'` would block. This phase adds no code blocks to the case study, so it neither worsens nor fixes that.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Capture scroll-driven charts with fixed `waitForTimeout` sleeps | Wait on an explicit animation-lifecycle attribute exposed by the chart | Already shipped in `ib-gdp-evolution` | Deterministic captures; no flake; no guessed settle duration |
| `next/image` for every image | Plain `<img>` with explicit intrinsic `width`/`height` | Phase 2 decision, Next 16 | Avoids `sharp` as a runtime dependency; `height: auto` + intrinsic dims satisfy CLS |
| Two renderers for `.md` and `.mdx` | One `@next/mdx` plugin chain with `extension: /\.(md|mdx)$/` | Phase 2, 02-UI-SPEC Revision 1 | The "dispatch" is a six-line try/catch. **The `extension` option cannot be omitted** — it builds cleanly and fails at prerender. |
| A boolean flag to publish the featured entry | State derived from `publishedFor("en")` | Phase 3 | There is nothing to flip. Do not add one. |

**Deprecated / outdated within this phase's sources:**

- `act2.md`'s numbers — "% of EU-15", "around 1990", step 13, a 10-step Act II, and a "step 17 hinge" with no shipped counterpart. Shipped is EU-27, 1993, `s5`, twelve steps. Read the script for reasoning only.
- `ARTICLE_PLAN.md`'s entire thesis — superseded, which is precisely why it is beat 2's material.
- `use-chart-layout-mode.ts`'s `DESKTOP_DIMS.chartHeight = 400` — the shipped `viewBox` height is computed (634 measured). Use measured values.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 1440×900 / DSF 2 is a good capture default. The *measurements* are verified; the *choice* is discretion CONTEXT explicitly delegated. | Figures — Real dimensions | Low. Any consistent viewport works; only internal consistency across F1/F2 is a hard rule. |
| A2 | The recommended DE title is `Die Darstellung ändert sich`. The shipped **sentence** is verified verbatim; converting it to a title requires dropping the connective *"Dafür"* and restoring canonical word order. | Corrections C-1 | Low. D-15 permits finalising the DE slug during execution, and the DE slug is not a code contract. The alternative, `Dafür ändert sich die Darstellung`, is more literally verbatim but reads awkwardly as a title. |
| A3 | The default `<Figure>` renders at roughly 630–660px (65ch of 18px Newsreader). The **CSS rule** is verified; the resolved pixel width was not measured against a running dev server. | Figures — Fitting the Prose Contract | Very low. Nothing depends on it — `width: 100%` scales whatever is supplied, and only the intrinsic ratio must be right. |
| A4 | `tests/landing.spec.ts:428`'s `img` count of 0 keeps passing. Verified by reading the spec and knowing the figures live on the post route, but not re-run post-publication. | Validation Architecture | Low. Caught immediately by the suite. |
| A5 | The EU-27-composition caveat is a stronger `<Aside>` than the arrivals chaining. This is an editorial opinion; both facts are verified. | Beat 6 | None — CONTEXT delegates the choice explicitly. |

## Open Questions

1. **Does the DE file ship `draft: false` or `draft: true`?**
   - What we know: D-17 ships German with an escape hatch; the source German is genuinely strong and a full methodology mirror exists in `de.json`, so the translation is far lower-risk than CONTEXT assumed.
   - What's unclear: only the executor can judge their own confidence, and nobody proofreads before publication.
   - Recommendation: **plan for `draft: false`** and treat `draft: true` as a documented fallback. The test-update surface differs between the two — `draft: false` additionally changes `/texte`'s prerendered empty-state assertion (`prerender.test.ts:102`), while `writing-index.spec.ts:85` breaks either way. The plan should name both branches so neither is a surprise.

2. **Which DE title?**
   - What we know: the shipped sentence is *"Dafür ändert sich die Darstellung."*; CONTEXT's provisional `Die Grafik ändert sich` is not in the shipped German.
   - What's unclear: whether to keep the connective (maximally verbatim, awkward as a title) or drop it (clean title, one word's distance from verbatim).
   - Recommendation: `Die Darstellung ändert sich` / `die-darstellung-aendert-sich`. It mirrors the EN title's relationship to its own sentence, and D-15 permits finalising the DE slug during execution.

3. **DSF 1 or DSF 2 for the figures?**
   - What we know: DSF 1 → 1200×820 PNGs; DSF 2 → 2400×1640 at 132–180 KB each (~450 KB committed). Widest render is 832px.
   - What's unclear: nothing factual — this is a bytes-vs-sharpness trade CONTEXT delegated.
   - Recommendation: DSF 2. The file sizes are modest, and a chart with 14px axis labels benefits visibly from the oversampling.

4. **Is one `<Aside>` enough for beat 6?**
   - What we know: D-06/CONTEXT specify a single `<Aside>`; there are now two equally strong candidates (arrivals chaining; the shifting EU-27 composition before 1985).
   - Recommendation: keep one, per CONTEXT. Put the losing caveat in running prose — beat 6 has 200–300 words to spend and both facts are worth stating.

## Sources

### Primary (HIGH confidence)

- `ib-gdp-evolution/app/story/act2-steps.ts` — shipped `ACT2_STEPS`, `ACT2_COMPARATORS`, `ACT2_DOMAIN`, `ACT2_PCT_RANGE`, `staggerDelay`
- `ib-gdp-evolution/tests/e2e/helpers/story-driver.ts` — the settle driver and its five encoded constraints
- `ib-gdp-evolution/app/components/line-chart.vue:100-124` — the animation tracker and `trackT`
- `ib-gdp-evolution/app/composables/use-chart-layout-mode.ts` — desktop breakpoint and declared dims
- `ib-gdp-evolution/app/utils/routes.ts` — `SLUG_MAP`, locale set
- `ib-gdp-evolution/i18n/locales/en.json` → `methodology` (22 keys) and `de.json` — authoritative EN/DE methodology wording
- `ib-gdp-evolution/methodology.md` — Catalan original (units, chaining, sensitivity tests)
- `ib-gdp-evolution/{en,de}_with_charts.md`, `act2.md` — body text and draft script
- `data-story-ib-gdp/ARTICLE_PLAN.md` — the abandoned thesis
- **Live pages, fetched and text-extracted 2026-08-31** — EN story, DE story, EN methodology
- **Live DOM + geometry, measured via Playwright 1.62.1 / Chromium against the production site** — step→series mapping, axis titles, SVG box, overlap detection, three captures
- `guillem-web`: `lib/content.ts`, `lib/work.ts`, `lib/locales.ts`, `mdx-components.tsx`, `components/mdx/{figure,aside}.tsx`, `components/landing/featured-slot.tsx`, `app/globals.css`, `content/fixture.mdx`, `package.json`, `tests/**`
- `.planning/`: `04-CONTEXT.md`, `02-UI-SPEC.md` (Prose Contract), `03-UI-SPEC.md` (Featured slot contract), `REQUIREMENTS.md`, `ROADMAP.md`, `config.json`, `CLAUDE.md`

### Secondary (MEDIUM confidence)

- `SAFE_SLUG` behaviour — executed the actual regex from `lib/content.ts` in Node against five candidate slugs.

### Tertiary (LOW confidence)

None. No claim in this document rests on an unverified web search. No external documentation lookup was required: the phase installs nothing and every contract is readable in one of the two repositories or on the live site.

## Metadata

**Confidence breakdown:**

- Source artifact audit: **HIGH** — every file stat'd and read in full; every live URL fetched; every load-bearing quote string-matched against extracted live page text.
- Six-part spine: **HIGH** — every beat traced to a verbatim, re-verified quote. Three CONTEXT inaccuracies found and corrected (C-2, C-3, C-7).
- Figures: **HIGH** — step mapping verified three independent ways (shipped source, live DOM series counts and axis titles, live step prose); dimensions and file sizes measured from actual captures; the prose-overlay hazard found by measurement and its fix verified.
- Publication mechanics: **HIGH** — regex executed, schema read line by line, `CASE_STUDY_SLUG` confirmed already correct, featured slot read in full.
- German: **HIGH** on the facts (pivot sentence confirmed present on the live DE page and CONTEXT's provisional title confirmed absent), **MEDIUM** on the title recommendation, which is a judgement call (A2).
- Validation architecture: **HIGH** — every breaking assertion located by line number and read in context.
- Pitfalls: **HIGH** — six of eight were encountered directly during this research.

**Research date:** 2026-08-31
**Valid until:** 2026-09-30 for the pipeline contracts and test inventory (stable, in-repo). **The live-piece dependency is the volatile one** — the three captures should be taken early; if `ib-gdp.guillemgelabert.com` is redeployed with a changed Act 2 configuration, the step→figure mapping needs re-verification against `act2-steps.ts` before capture.
