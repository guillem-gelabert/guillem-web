# Phase 4: The Case Study - Context

**Gathered:** 2026-08-31
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase writes and publishes one piece of long-form editorial prose — the
ib-gdp-evolution case study — as an MDX file in `content/`, and lets the already-built
featured slot resolve to it.

It is a **writing phase**. The pipeline exists (Phase 2), the slot exists (Phase 3), and
the slot's state is derived from `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)` —
so publishing the file flips the landing view with no layout, role, gap or ordering change.
The only code this phase may touch is the `CASE_STUDY_SLUG` constant, the committed figure
assets, and whatever capture script produces them.

Covers **CASE-01, CASE-02, CASE-03 and HOME-02**. (The task brief named only the three
CASE requirements; `ROADMAP.md` § Phase 4 and `REQUIREMENTS.md`'s traceability table both
also map **HOME-02** — "one featured piece given clear visual primacy" — to this phase.
HOME-02 is satisfied by the slot resolving to a real entry, not by new design work.)

**Explicitly NOT this phase:** the backlog (Phase 5); CV, contact, photo, security headers,
sitemap/OG metadata and the `robots` noindex flip (Phase 6); the positioning sentence
(user-authored, no phase); any change to the writing pipeline, the prose contract or the
landing layout. Two v2 requirements sit adjacent and stay deferred — **CASE-04** (a rejected
alternative chart form shown beside the shipped one) and **CASE-05** (a visitor-facing
affordance to open the live piece from the case study).

</domain>

<decisions>
## Implementation Decisions

### Subject — established, not invented

**The subject was recovered in full and requires no fabrication.** This is the single most
important finding of this discussion and it overturns the premise the phase was handed.

- **D-00: "IB" is *Illes Balears* — the Balearic Islands. It is NOT the International
  Baccalaureate.** The phase brief guessed the latter. The piece is a D3 scrollytelling
  essay on Balearic GDP per capita, 1900–2025, against tourist arrivals. Every downstream
  agent must take this as settled; writing "International Baccalaureate" anywhere is a
  factual error that invalidates the artifact.

- **D-01: The complete source material exists in the user's vault and is the writing
  substrate.** Verified present on 2026-08-31. Nothing in this case study may be invented;
  everything traces to these files or to the live pages:

  | File | Size | What it gives Phase 4 |
  |------|------|-----------------------|
  | `/Users/guillem/vault/projects/personal/ib-gdp-evolution/en_with_charts.md` | 11.5 KB | The shipped English text. **Authoritative for every number and claim.** |
  | `…/ib-gdp-evolution/de_with_charts.md` | 13.3 KB | The shipped German text. The voice reference for the DE translation. |
  | `…/ib-gdp-evolution/methodology.md` | 17.8 KB | Sources, chaining, deflators (Catalan; mirrored in `i18n/locales/en.json` under `methodology`). |
  | `…/ib-gdp-evolution/act2.md` | 7.8 KB | Step-by-step scrollytelling script with per-step chart-state directions — **the record of form following data.** |
  | `…/ib-gdp-evolution/app/utils/routes.ts` | 2.4 KB | The live `SLUG_MAP`; the localised-slug convention in code. |
  | `/Users/guillem/vault/projects/personal/data-story-ib-gdp/ARTICLE_PLAN.md` | 8.8 KB | **The abandoned earlier thesis** — this is CASE-02's "stated prior expectation". |

### Argument & Structure

- **D-02: The piece argues the mechanism from `BRIEF` §2, demonstrated once, concretely.**
  Not a build write-up, and not a re-run of the Mallorca argument. The thesis is that holding
  the data, the visual form and the argument in one head let the form change when the data
  turned out to be something other than expected. The Balearic finding is the *evidence*;
  the subject of the case study is the moment the form had to change.
  - The rejected alternative was to make the economics the thesis — that duplicates the live
    piece, and `03-UI-SPEC.md:336` already warns that the same project appearing twice reads
    as duplication or padding.

- **D-03: The real six-beat spine, recovered from source. This is the phase's spine and it
  is factual.**
  1. **The question** — did tourism make the Balearics rich? "From developers to campaigners,
     left and right agree that tourism rescued the islands from poverty." Tourism is 45.5% of
     the economy.
  2. **The prior expectation — two distinct records, and the piece should use both.**
     (a) The *published* statement of the prior, from the live methodology page, which is the
     cleanest single quote on the whole site: *"This project began with a widely shared
     suspicion: tourist arrivals keep breaking records, but life for local people stopped
     improving long ago and may be getting worse. I wanted to know whether that impression
     would survive contact with the data."*
     (b) The *abandoned article structure* — a five-symptom Dutch-disease indictment titled
     *"The Balearic Paradox: Is Tourism Mallorca's Dutch Disease?"*, built on wages (≈€23,100
     salary vs ≈€31,600 needed), Catalan language decline, early school leaving (20.1%, worst
     in Spain, against 4th–5th highest GDP), housing (60.8 years to buy vs 29.7 nationally),
     and the environment.
     These are different moments — (a) is the question as published, (b) is the shape the
     answer was expected to take — and conflating them would misrepresent both.
  3. **What the data showed — the reversal is sharper than "the thesis failed".** The
     suspicion *did* survive; the popular explanation for it did not. Two specific inversions:
     **Extremadura is the control case** (Spain's poorest region, landlocked, no resorts) and
     grew tenfold over the same two generations — as did Andalusia, Portugal, France and
     Ireland — so tourism was the Balearics' route into a continental boom, not its cause.
     And, once measured against Europe, *"the islands were not exceptionally poor throughout
     the first half of the century"* — the pre-1960 line is not flat at all, it *"rises and
     falls, moving above and below the European average."* The first half of the myth
     dissolves; what survives is narrower and stranger.
  4. **How the visual form changed** — the measure changes on screen, mid-scroll. The shipped
     text says it outright: *"The chart therefore changes. Instead of plotting income in
     dollars, it expresses each economy as a percentage of the EU average."* In the shipped
     piece this is **Act 2, step 6**, where the axis mode switches from `real-eur` (2011 PPP$
     per head) to `pct-eu27` (% of the EU-27 average, 100 baseline), calibrated on screen with
     Ireland at 158% and Bulgaria at 54%. The working script marks the same moment *"the
     single most important chart transition in the piece — it should be a held moment."*
  5. **The shipped result** — a scrollytelling piece in which the measure change is the
     reveal, landing on the finding: **the Balearics stopped gaining ground on Europe in 1993
     and have fallen behind since, while arrivals tripled.** Coda: 25 years passed between the
     end of the relative rise and the first mass anti-tourism protests; youth out-migration is
     3× its 2009 level.
  6. **Methodology** — see D-12.

- **D-04: Six `<h2>` sections, one per CASE-02 part, in CASE-02's order.** This makes the
  requirement literally checkable (six section marks, six `rehype-slug` ids) rather than a
  judgement call. The prose contract's `h2` — uppercase Label at 14px with a 1px full-ink
  rule — is exactly the longform section mark this needs. Working section marks: `The
  question` / `What I expected` / `What the data showed` / `Where the chart changed` / `What
  shipped` / `Methodology`.
  - **The contract stops at `h3`.** No `h4`–`h6` anywhere; if a fourth level seems needed the
    structure is wrong, not the type scale.

- **D-05: 1,200–1,800 words in English.** Roughly 200–300 words per section. Long enough to
  carry six beats with real detail; short enough that a reader who skims the six section marks
  and reads one still gets the argument. **The first two paragraphs must carry the whole
  argument on their own** — the audience is a 90-second scanner with forty tabs open.

- **D-06: The piece ends on the methodology note, per CASE-02's order — receipts last, no
  pitch.** No call to action of any kind. Phase 3's copywriting contract is explicit that
  there is no labelled CTA anywhere on the site, and that rule extends here: no "get in
  touch", no "hire me", no closing summary paragraph that restates the argument.

### Evidence & Figures

- **D-07: Three figures, every one a screenshot of a real state of the live published
  piece.** No invented charts, no redrawn data, no reconstructed series. This is what keeps
  the fabrication risk at zero. Each figure proves exactly one beat:

  Step numbers below are the **shipped** Act 2 configuration, read out of the live JS bundle —
  not `act2.md`'s draft numbering (see D-19 trap 1):

  | # | Shipped state | What it proves | Width |
  |---|---------------|----------------|-------|
  | F1 | **Act 2, step 3** — absolute 2011 PPP$ per head; Balearics + Extremadura + Andalusia + Portugal + Ireland + France | The control case: the climb was common, so tourism did not cause it | default |
  | F2 | **Act 2, step 6 or 7** — the same data after the axis switch to % of EU-27, 100 baseline | The pivot: the pre-1960 line is not flat, and the myth's first half dissolves | default |
  | F3 | **Act 2, step 12** — relative income flat/falling with tourist arrivals re-added on the right axis | The finding: arrivals tripled while the islands stopped gaining ground | `wide` |

  - **F1 and F2 must be captured at identical width and framing.** They are a before/after of
    the same data; a width change between them destroys the comparison that is the whole point.
  - **This does not breach CASE-04's deferral.** Both F1 and F2 are *shipped* states of the
    published piece — a measure change within the live work, not a rejected alternative form
    shown beside the chosen one. Nothing here shows a discarded chart.

- **D-08: Figures are produced by Playwright screenshot of the public live piece.** Playwright
  is already installed (Phase 1). Capture at a fixed viewport (1440×900 CSS px suggested),
  commit under `public/case-study/`, and pass the asset's true pixel dimensions to
  `<Figure width height>`. Rationale: `public/` currently holds only Next.js logos and two
  fixture SVGs, and the `ib-gdp-evolution` GitHub repo is **private** — there is no existing
  image to reuse and no public source to link. Screenshots of the user's own published work
  are the only honest source.
  - **The charts render client-side and the SSR SVG is empty.** A naive fetch or a screenshot
    taken too early captures a blank chart stage. The capture must load the page, drive the
    scrollytelling to the target step, and wait for the transition to settle before shooting.
    The piece implements **keyboard step navigation (`↑`/`↓`)**, which is the cleanest way to
    land on an exact step; series animations are staggered by ~200 ms, so allow settle time.
  - **The live piece's palette will not match the case study's page.** It is set on a pale
    blue-grey ground (`rgb(238 242 246)`) with a deep-blue accent, inside a site whose paper is
    pure `#ffffff` and whose only accent is reserved red. This is expected and must **not** be
    "fixed" by recolouring the user's published work. Let the figures read as embedded
    reproductions of another artifact — which is what they are. Do not add a border, frame,
    shadow or card to reconcile them; the prose contract forbids all four.
  - `<Figure>` is a plain `<img>` (deliberately not `next/image` — no `sharp` runtime
    dependency). Explicit `width`/`height` are what satisfy BUILD-06's no-layout-shift posture.
  - **Bare Markdown `![]()` throws at prerender by design.** Every image is a `<Figure>`.

- **D-09: Alt text is substantive; the caption states what the figure proves.** Alt text
  describes what the chart shows including its shape and finding — never "chart of GDP".
  Captions are `<Figure>` children, render in the Label role, and name the data source.

- **D-10: No live or embedded React chart. Static figures only.** Phase 2's D-08 allows MDX to
  import arbitrary components, and its own accepted-risk note warns this is exactly where
  Phase 4 drifts from a writing job into a build job. The ROADMAP calls this phase "writing
  effort, not technical effort". `Figure` and `Aside` are the only components used.

### Voice & Framing

- **D-11: First person singular, throughout.** CASE-02 requires "Guillem's stated prior
  expectation", and `BRIEF` §2 states the artifact's form directly: *"here is what I expected,
  here is what the data actually was, here is how the visual form changed because of it."*
  That sentence is the piece's brief.

- **D-12: Technical about data and form; silent about stack.** Projections, chained series,
  deflators, per-capita normalisation, relative-to-average measures, encodings and chart types
  are all in scope and should be discussed precisely. **Naming a library, framework or build
  tool is a scope violation** — `PROJECT.md`'s allocation principle is that engineering is
  demonstrated by the artifact, never claimed in copy. No "built with", no stack list, no
  performance notes.

- **D-13: The implied reader is a graphics editor who reads charts for a living.** Assume they
  know what a log scale, an index-to-100 and a small multiple are — do not explain chart types.
  Do **not** assume they know Balearic or Spanish regional economics. Explain the subject,
  never the craft.

- **D-14: Roughly 60% the decision moment, 40% subject and outcome.** The expectation → data →
  form-change sequence is the only part no other artifact on the site can carry; the outcome is
  already visible in the live piece. No self-deprecation, no hedging, no "I'm passionate about".
  `BRIEF` §5.5 (honest in-progress over polished-and-frozen) licenses saying plainly that the
  first thesis was abandoned.

### Scope & Publication

- **D-15: Slug and title are locked here, because Phase 3's code references the slug.**

  | | EN | DE |
  |---|---|---|
  | Title | `The Chart Therefore Changes` | `Die Grafik ändert sich` |
  | Slug / file | `the-chart-therefore-changes` | `die-grafik-aendert-sich` |
  | URL | `/writing/the-chart-therefore-changes` | `/texte/die-grafik-aendert-sich` |

  `CASE_STUDY_SLUG = "the-chart-therefore-changes"` in `lib/work.ts`.
  - The title is **verbatim from the shipped English text** — the sentence that marks the
    pivot. That is the strongest possible provenance: it is the author's own published prose,
    it names the editorial move exactly, and it cannot be accused of being invented for the
    portfolio.
  - **Provenance correction, recorded so it is not re-introduced:** an earlier candidate,
    "Same Data, Different Question", was drawn from `act2.md` — the *draft working script*,
    not the published piece. It is still the author's phrase but it was never shipped, so the
    published sentence wins.
  - The title deliberately does **not** name the finding. The live piece's rendered headline is
    "Everyone in Mallorca Knows It" and that is work-list entry `01`; a case-study title built
    from the finding would read as the same project listed twice, which Phase 3's `D-07` exists
    to prevent. Four words also sit well in Humane at the featured slot's 32–72px.
  - **The DE title must be taken verbatim from the corresponding sentence in
    `de_with_charts.md`** if it differs from the provisional wording above. The DE slug
    transliterates per the live convention (`weiss`, not `weiß`; `ae` for `ä`), matching
    `auf-mallorca-weiss-es-jeder`.
  - Only the **EN** slug is a hard code contract — the featured slot resolves through
    `publishedFor("en")`. The DE slug may be finalised during execution.

- **D-16: `date: "2026-08-31"`, `draft: false`, `type: "case-study"`.** The date is the real
  publication date and is schema-validated. `type: "case-study"` is an existing, validated
  front-matter field that the Phase 2 spec records as *"reserved for Phase 4"* — it renders
  identically in v1 and exists for the v2 archive's grouping. `draft: false` is what closes
  Phase 2's n=0 launch gate.

- **D-17: The German translation ships in this phase.** Phase 2's D-07 recorded the accepted
  cost explicitly — *"this makes Phase 4 a two-language writing job. Flagged during discussion
  and chosen deliberately."* The risk is far lower than it first appears: the user has a real
  published German text (`de_with_charts.md`, 13.3 KB) to match register against, and the
  German is a translation of locked English rather than independent composition. Both files
  share `translationKey`, which is the only thing pairing them.
  - **Escape hatch, and it must be used rather than shipping bad German:** if the translation
    cannot be produced to a standard the executor is confident in, ship it `draft: true`. The
    Phase 2 spec states that a German index at n=0 renders its empty state *"which is correct
    and honest, not a bug"*, and the launch gate names only `/writing`. An empty German index
    is a smaller failure than clumsy German on a job-hunt site.

- **D-18: "Done" is a mechanical gate, since nobody proofreads before it goes live.** All of:
  - `next build` passes — front-matter validation throws on any malformed field.
  - `draft: false`; six `<h2>` ids present in CASE-02's order; no `h4`–`h6`; no bare Markdown
    image; `Figure` and `Aside` are the only components used.
  - Every `<Figure>` has real intrinsic `width`/`height` and non-empty, substantive `alt`.
  - The featured slot resolves and renders the post's `title` and `standfirst`, and the
    headline is the only link in the slot.
  - **Fact-check pass (D-19) has been run.**
  - No engineering claim anywhere in the prose.

- **D-19: Accuracy gate — every number and claim traces to the shipped text, the methodology,
  or the live pages.** Three specific traps found during this discussion:
  1. **`act2.md` is a draft script, not the shipped piece.** It says the peak is "around 1990",
     the measure is "% of EU-15 average", and the axis switch is step 13; the shipped piece
     says *"stopped gaining ground on Europe in 1993"*, uses **% of EU-27**, and puts the axis
     switch at **Act 2 step 6**. The script also names a step-17 "hinge" state that does not
     correspond to the shipped 12-step configuration. **Where the script and the shipped piece
     disagree, the shipped piece wins — always.**
  2. **Do not claim the relative measure was invented mid-project.** `ARTICLE_PLAN.md`'s
     Chart 1 was already "GDP per capita (relative to EU regional average) vs tourist
     arrivals". The honest and more interesting claim is that the relative measure was
     **promoted from one exhibit among five to the narrative spine** — it stopped being an
     opening statistic and became the reveal.
  3. **Do not assert a language count.** guillem-web's planning assumes the live piece is
     bilingual EN/DE. It is not: the `original` edition ships **en / ca / de** (all three
     verified HTTP 200, Catalan at `/a-mallorca-ho-sap-tothom`) and a second `eldiario` edition
     ships es/ca, implying a syndication path. Say "in several languages" or name the ones
     actually checked; do not count.
  4. **The rendered headline is not the slug.** The live EN page's `<h1>` reads **"Everyone in
     Mallorca Knows It"**; "agrees on one thing" survives only in the URL. Quote the headline,
     not the slug. (Phase 3's work-list entry already has this right.)
  5. **Do not write that the author "did not anticipate" the anchoring result.** The
     methodology says the simpler single-year method *"is actually closer"* to Rosés-Wolf up to
     2020 — the word "actually" is the only signal, and the page never claims surprise.
     Report what it says, not an inferred emotional state.
  6. **Citation years differ between sources.** The live methodology gives Valdivielso &
     Moranta as *J. Sustainable Tourism* **27(12), 2019**; a vault file gives 28(12), 2020.
     **Prefer the live methodology page** for every citation.
  7. **No World Bank data and no IBO statistical bulletin exist in this project.** Both were
     plausible guesses in the phase brief. Writing either is a fabrication.

- **D-20: The live piece is linked inline in prose, once, in "What shipped".** A plain `<a>`
  in a sentence — not a labelled affordance, not a button, not a "view the piece" block.
  **This does not satisfy CASE-05, which remains v2**: that requirement asks for a
  visitor-facing affordance to open the live piece, and none is built here. A case study about
  a piece that never lets the reader see it is a worse artifact, and one prose link costs
  nothing and breaks no locked rule.

### Claude's Discretion

- Sentence-level prose in both languages, and the exact standfirst wording — constrained by
  D-19's accuracy gate, by the "no adjectives about the work" voice rule, and by the standfirst
  being **plain text** (no bold, no links, no inline markup; it is already weight 530).
- The precise capture viewport, device scale factor and file format for the three figures, and
  whether F3 is in fact the strongest third figure once the live states are inspected.
- Exact section-mark wording for the six `<h2>`s, in both languages.
- Where the single `<Aside>` sits within the methodology section and what caveat it carries
  (the chained arrivals series is the strongest candidate — see `<specifics>`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or writing.**

### The subject — read these first, they are the substrate
- `/Users/guillem/vault/projects/personal/ib-gdp-evolution/en_with_charts.md` — the shipped
  English text. **Authoritative for every number and claim** (D-19).
- `/Users/guillem/vault/projects/personal/ib-gdp-evolution/de_with_charts.md` — the shipped
  German text. Voice reference for the DE translation.
- `/Users/guillem/vault/projects/personal/ib-gdp-evolution/act2.md` — the scrollytelling
  script, and the clearest record of form following data. **Its step numbers are draft
  numbering and do not match the shipped piece** — in the script the axis switch is step 13; in
  the shipped Act 2 it is step 6. Read it for the reasoning, never for a number, and let the
  shipped piece win on any conflict.
- `/Users/guillem/vault/projects/personal/ib-gdp-evolution/methodology.md` — sources, chaining,
  deflators. Catalan; mirrored in `i18n/locales/en.json` under `methodology`.
- `/Users/guillem/vault/projects/personal/data-story-ib-gdp/ARTICLE_PLAN.md` — the abandoned
  Dutch-disease thesis. This is CASE-02's "prior expectation" beat.
- `/Users/guillem/vault/projects/personal/ib-gdp-evolution/app/utils/routes.ts` — the live
  `SLUG_MAP`.

### Live pages (verified 2026-08-31)
- `https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing` — EN piece.
  Rendered `<h1>` is **"Everyone in Mallorca Knows It"**, not the slug.
- `https://ib-gdp.guillemgelabert.com/auf-mallorca-weiss-es-jeder` — DE piece.
- `https://ib-gdp.guillemgelabert.com/a-mallorca-ho-sap-tothom` — CA piece (HTTP 200).
- `.../everyone-in-mallorca-agrees-on-one-thing/methodology` and `.../auf-mallorca-weiss-es-jeder/methodik`
  — **authoritative for every citation** (D-19 trap 6). Carries 8 further interactive charts and
  is URL-addressable, e.g. `?series=ES53&denom=spain#final-series`. `ES53` is the NUTS-2 code
  for Illes Balears and is the corroboration that settles D-00.
- **The `ib-gdp-evolution` GitHub repo is private — never link to source** (Phase 3 D-06).
- The article's shipped chart configuration is readable from the live JS bundle; the Act 2 step
  numbering in D-07 came from there, not from the draft script.

### Pipeline contracts this phase writes against
- `.planning/phases/02-content-pipeline/02-UI-SPEC.md` — the **Prose Contract** is normative.
  Supported elements, the `h3` ceiling, the standfirst-is-plain-text rule, the date formats,
  and the Copywriting Contract's voice paragraph.
- `lib/content.ts` — the validated front-matter schema. `assertFrontmatter` throws at build.
- `mdx-components.tsx` — the `img` override that throws on bare Markdown images.
- `components/mdx/figure.tsx`, `components/mdx/aside.tsx` — the two available components and
  their exact props.
- `content/fixture.mdx` — a working example exercising every supported element.

### The slot this phase fills
- `.planning/phases/03-work-list-landing-skeleton/03-UI-SPEC.md` § *Featured slot contract* —
  the published-state markup, and the rule that **Phase 4 changes copy and adds an `<a>`, and
  changes no layout, no role, no gap and no order.**

### Governing direction
- `BRIEF.md` §1 (allocation), §2 (the claim, and the evidence requirement this piece
  discharges), §5 (design principles), §9 (anti-goals), §10 (evidence audit — this artifact is
  the "weakest link" row).
- `.planning/PROJECT.md` — Out of Scope is the checklist every surface is checked against.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`<Figure src alt width height wide?>`** (`components/mdx/figure.tsx`) — a plain `<img>`,
  deliberately not `next/image` (production image optimization in Next 16 needs `sharp` as a
  runtime dependency, and Phase 2's stated outcome was zero new runtime dependencies). Caption
  is `children`, rendered as `<figcaption>`.
- **`<Aside kicker?>`** (`components/mdx/aside.tsx`) — renders `<aside>` with an optional
  Label-role kicker. Built in Phase 2 specifically because CASE-02 requires a methodology note.
- **`lib/content.ts`** — `allPosts`, `publishedFor`, `findBySlug`, `findTranslation`,
  `assertFrontmatter`. Slug comes from the filename; drafts are visible in dev, invisible in a
  production build.
- **`content/fixture.mdx`** — the reference for front-matter shape and every supported element.

### Established Patterns
- **The slot is derived, not flagged.** `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)`
  returning non-null *is* the published state. There is no boolean to flip.
- **Front-matter is validated at build.** A malformed field fails `next build` loudly rather
  than shipping as visible prose or an empty `<html lang>`.
- **Deploy-first increments** (Phase 1 D-08): every commit leaves the Railway URL working.
- **Copy never claims engineering** (`PROJECT.md`, `BRIEF` §1).

### Integration Points
- `content/the-chart-therefore-changes.mdx` → `/writing/the-chart-therefore-changes`.
- `content/die-grafik-aendert-sich.mdx` → `/texte/die-grafik-aendert-sich`.
- `CASE_STUDY_SLUG` in `lib/work.ts` — the one code constant this phase depends on. If Phase 3
  ships a placeholder value, this phase corrects it to D-15's slug.
- `public/case-study/` — new directory for the three committed figure assets.
- Publishing the EN file simultaneously closes Phase 2's `/writing` n=0 launch gate and
  Phase 3's featured-slot interim state, both of which block Phase 6's `robots` flip.

### A trap that cost the research agent a false negative
- **`grep` in this shell is gitignore-aware, and `.planning/` is gitignored** (`.gitignore:3`)
  while still being tracked. A plain `grep -r` over `.planning/` returned 3 hits where
  `/usr/bin/grep` returned ~60. Use the absolute binary or `--no-ignore` when searching
  planning docs, and remember `git add -f` when committing them.

</code_context>

<specifics>
## Specific Ideas

- **The methodology page documents three chaining approaches, two of them rejected — this is
  the richest editorial-judgement material in the whole project and it was nearly missed.**
  Rosés-Wolf and Maddison report constant 2011 international PPP dollars; Eurostat reports
  current PPS per person, which is not inflation-adjusted. Chaining them is the hard problem.
  - *Single-year anchor* — rejected: it assumes the PPP-to-PPS relationship never changes,
    which "would amount to assuming zero inflation—clearly unrealistic." **"Using 2000 rather
    than 2022 changes the estimate by more than 20%."** A 20% swing from an arbitrary choice is
    exactly the kind of thing that decides whether a chart is honest.
  - *Two-point log-linear* — rejected: works only if the relationship changes steadily.
  - *Adopted*: keep every Rosés-Wolf observation as an anchor, express each community's
    Eurostat PPS relative to Spain between anchors, apply it to Spain's GDP per head in 2011
    int'l $, and rescale to meet the Rosés-Wolf values at both ends.
  - And the honest sting: **"Up to 2020, the simpler single-year method is actually closer to
    Rosés-Wolf's real GDP figures."** The more sophisticated method does not win outright, and
    the piece says so in public. That is the single most credible sentence available.
- **Three further methodology decisions worth naming**, each a visible judgement call:
  *2020 and 2021 are excluded* ("a large but temporary external shock… would obscure rather
  than clarify the 125-year trend"); *no regional deflator is used* because the Balearic CPI
  stayed within 1% of Spain's from 2002–2024, stated with the caveat that this is "an
  approximation: living costs are higher in the Balearics"; and an explicit *sensitivity test* —
  **"Even if Cirer-Costa's estimate for 1920 were wrong by a factor of ten… the article's
  conclusion would not change."**
- **The live EN standfirst, verbatim, for reference when writing the case study's own:**
  *"Tourism made the islands rich—or so the story goes. The data tells a more complicated
  story."* The case study's standfirst must not echo this; it describes a different artifact.
- **The best single methodology detail for the `<Aside>` is the chained arrivals series.** No continuous series
  of Balearic tourist arrivals exists, so four sources are chained: Cirer-Costa (2020) for
  1900–1936, Barceló Pons (1966) for 1925–1965, Valdivielso & Moranta (2020) for 1959–2019,
  and AETIB/ATIB anuaris plus FRONTUR for 1998–2025, preferring the official series wherever
  years overlap. That is a real editorial-judgement decision with a visible cost, and it is the
  strongest candidate for the single `<Aside>`.
- **GDP sources, for the methodology section:** Rosés-Wolf regional GDP database v7 (173
  European NUTS-2 regions, 1900–2022, 2011 international PPP dollars); Maddison Project
  Database 2023 for EU-27 country levels and a population-weighted EU-27 average; Eurostat
  `nama_10_pc` (growth, not level) and `nama_10r_2gdp`; Funcas 2025 regional index (Balearics
  at 111.3, España=100); INE regional IPC as a deflator sanity check. **There is no World Bank
  data and no IBO statistical bulletin — do not write either.**
- **The strongest sentence in the source material is already the author's own:** *"The chart
  therefore changes. Instead of plotting income in dollars, it expresses each economy as a
  percentage of the EU average."* Quote it rather than paraphrasing it — a `<blockquote>` gets
  the pull-quote treatment (italic between two hairlines), and Phase 2 explicitly named
  case-study pull quotes as the reason Newsreader was chosen for its true italic.
- **The causal posture must be preserved.** `act2.md:64` records it: *"At no point does the
  piece claim tourism caused the climb, or caused the fall."* The defensible claim is "the
  climb was common, the fall is ours." A case study that overstates the live piece's causal
  claim undermines the judgement it is meant to demonstrate.
- **Ireland is the counter-argument neutraliser.** The script notes it shows post-1990 climbing
  was possible, so Balearic flatness is not a continental ceiling. Worth a sentence — it is
  precisely the kind of anticipated objection that reads as editorial judgement.
- The existing work-list annotation — *"The Balearics stopped gaining on Europe in 1993 — while
  tourist arrivals went on tripling"* — is a near-verbatim compression of the piece's own
  conclusion and is accurate. The case study's standfirst must not simply restate it; the
  annotation describes the *piece*, the standfirst describes the *case study*.

</specifics>

<deferred>
## Deferred Ideas

### CASE-04 — the rejected chart form, shown beside the shipped one (v2)
Research called this "the clearest single visible signal of editorial judgment available", and
this phase now has the material for it: `ARTICLE_PLAN.md` describes the discarded scatterplot
of Spanish regions (GDP per capita vs early school leaving, Balearics as the outlier) that the
five-symptom thesis was built on. It stays v2 — but the source is now identified, so it is
cheap to add later.

### CASE-05 — open the live piece from the case study (v2)
D-20 ships one inline prose link, which is not the affordance CASE-05 asks for. Unchanged.

### The Catalan edition and the apparent syndication
The live piece ships **en / ca / de** on its `original` edition (all three verified HTTP 200),
plus an `eldiario` edition in es/ca implying syndication to eldiario.es. Every guillem-web
planning document assumes EN/DE only. Not in scope for v1 — the personal site is EN/DE
(I18N-01) — but a syndicated data story is a real journalism credential that **no surface on
the site currently mentions**, and it is worth revisiting when the work list is widened. Verify
the syndication before ever claiming it.

### A second case study — Watch People Die
Work-list entry `02` has no case study. HOME-07 (case studies surfaced on the landing view once
there is more than one) is already v2 and anticipates this.

### The user's editorial pass
This piece is drafted autonomously and ships without human proofreading, in both languages.
That is a deliberate, directive-sanctioned trade, not an oversight — but the residual risk is
real and belongs on the record: **the prose should get one editorial pass from the user before
Phase 6 flips `robots` to indexable.** D-19's accuracy gate reduces factual risk; it does not
substitute for the author's ear, particularly in German.

</deferred>

---

*Phase: 04-the-case-study*
*Context gathered: 2026-08-31*
