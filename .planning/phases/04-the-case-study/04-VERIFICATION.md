---
phase: 04-the-case-study
verified: 2026-08-31T17:51:31Z
status: human_needed
score: 14/15 must-haves verified
overrides_applied: 0
re_verification: null
human_verification:
  - test: "Read both case studies end to end — content/the-chart-therefore-changes.mdx at /writing/the-chart-therefore-changes and content/die-darstellung-aendert-sich.mdx at /texte/die-darstellung-aendert-sich — as the author, for register, rhythm and anything you would not put your name to."
    expected: "You accept both pieces as publishable under your byline, or you edit them."
    why_human: "Two AI-drafted, bylined pieces are live at draft: false in two languages and no human has read them. The D-19 fact-check (fact-check.md, 83 claims, 0 unsourced) reduces factual risk only — it cannot judge an author's ear. CONTEXT D-18 sequences this pass before Phase 6 flips robots to indexable; the phase created this risk deliberately under an explicit user directive to unblock, and it must not silently survive the FIND-02 flip."
  - test: "Decide how Roadmap Success Criterion 4 is to be read, then either accept it as closed or change lib/work.ts. Load / and scroll from the Case study section into the Work section."
    expected: "Either (a) you accept the structural discharge already shipped — the featured slot's annotation copy IS the post standfirst and the featured headline links into the case study — or (b) you want the work-list entry 'Everyone in Mallorca Knows It' to itself carry a path into the case study, which is a change to lib/work.ts that this phase did not make."
    why_human: "SC-4's literal wording ('Visitor reading the work list sees the featured entry's annotation copy link into the case study rather than duplicate its content') is ambiguous. The work list's annotation for the ib-gdp entry is unchanged from Phase 3, is not a link, and is a near-verbatim compression of the case study's own finding — which the literal reading forbids. See F-001 below. Only you can say which reading the roadmap meant."
  - test: "Load /writing/the-chart-therefore-changes at 375px and at 1440px and look at the three figures."
    expected: "The three 2400x1640 chart PNGs are legible at phone width — axis labels, legend and the 100-baseline readable, not a smear."
    why_human: "Tests assert naturalWidth 2400 and that the bitmaps decode. No test asserts that a downscaled 2400px chart is readable at 375px. Legibility is a visual judgement."
  - test: "Read the German case study as a German speaker, especially §Methodik and the standfirst."
    expected: "The register matches your own published German rather than reading as translated-from-English."
    why_human: "19 of 20 German quoted spans match de-story.txt / de-methodology.txt verbatim (independently reproduced), which proves provenance of the quotations but not the quality of the connective prose written around them."
  - test: "Decide whether to correct REQUIREMENTS.md — CASE-02 is still `- [ ]` at line 27 and 'Pending' at line 144 while Phase 4 is marked Complete."
    expected: "CASE-02 marked complete, or an explicit reason recorded for leaving it open."
    why_human: "The codebase satisfies CASE-02 (six h2 sections in CASE-02's order, both locales, proven in prerendered HTML and by 9 Playwright + 2 unit assertions). The closure commit 08f79d9 marked CASE-01, CASE-03 and HOME-02 complete and silently omitted CASE-02. This is a tracking correction, not code — but /gsd:audit-milestone will read it as an unmet v1.0 requirement."
warnings:
  - "REQUIREMENTS.md CASE-02 left Pending while its evidence is verified in the codebase (tracking defect introduced by commit 08f79d9)."
  - "Roadmap SC-4 discharged structurally rather than literally; lib/work.ts was not touched by any Phase 4 plan."
  - "HOME-01 still ships as POSITIONING_PLACEHOLDER = 'Developer.' — confirmed live. Carried from Phase 3, blocks Phase 6 FIND-02. Not a Phase 4 gap."
  - "npm run lint reports exactly one error, components/smear-heading/use-prefers-reduced-motion.ts:23 (react-hooks/set-state-in-effect). Pre-existing from Phase 1, no Phase 4 file involved."
deferred:
  - truth: "The positioning sentence behind POSITIONING_PLACEHOLDER is written and shipped (HOME-01)."
    addressed_in: "Phase 6"
    evidence: "Phase 6 goal: 'the site is ready to be found and shared' — FIND-02's robots flip is the gate HOME-01 blocks; tracked in .planning/STATE.md:100-101 and launch-gate.md as a carried tripwire, not Phase 4 scope."
  - truth: "Localised [slug] 404s server-render without JS (CR-01)."
    addressed_in: "Phase 6"
    evidence: "Known open item carried from Phase 2, deferred to Phase 6's middleware. Out of Phase 4 scope."
---

# Phase 4: The Case Study — Verification Report

**Phase Goal:** The ib-gdp-evolution case study is written and published, and the landing view's featured slot is wired to it. This is the milestone's long pole — writing effort, not technical effort — and per the evidence audit it is the only artifact that can close the "talented developer, no editorial judgment" gap. It is scoped on its own, not bundled with unrelated technical work.

**Verified:** 2026-08-31T17:51:31Z
**Status:** human_needed
**Re-verification:** No — initial verification

**Method note.** Every green result below was reproduced by this verifier in its own process, not read from a SUMMARY. `rm -rf .next && npm run build`, `npm run test:build`, `npx playwright test`, `npm run test:unit`, `npx tsc --noEmit` and `npm run lint` were all run here. The fact-check's central claim was re-derived from scratch with an independent extraction probe rather than accepted from `fact-check.md`. The live deployment was fetched directly.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | **SC-1** Visitor can read a published case study covering ib-gdp-evolution. | ✓ VERIFIED | `content/the-chart-therefore-changes.mdx`, 80 lines, **1,695 prose words**, `draft: false`, `type: case-study`. Prerenders as `●` SSG to `.next/server/app/writing/the-chart-therefore-changes.html` (42 KB). `/writing` prerenders **1 `<article>`** — the case study with its standfirst — and the Phase 2 empty state (`Nothing published here yet` / `The first piece is being written`) is **absent** from both `/writing` and `/texte`. Live 200 at the public URL. |
| 2 | **SC-2** Visitor can follow the case study through six parts in CASE-02's order. | ✓ VERIFIED | Extracted from the **prerendered HTML**, not the source. EN: `the-question` → `what-i-expected` → `what-the-data-showed` → `where-the-chart-changed` → `what-shipped` → `methodology`. DE: `die-frage` → `was-ich-erwartet-hatte` → `was-die-daten-zeigten` → `wo-sich-die-darstellung-ändert` → `was-veröffentlicht-wurde` → `methodik`. Exactly 6 `<h2>` with `rehype-slug` ids, **0** `h4`–`h6`, 1 `<aside>` (after `#methodology`), 3 `<figure>`, 1 `<blockquote>`, in both locales. Locked by `tests/case-study.spec.ts` (9 passing) and `case-study-content.test.ts` tests 11–13. |
| 3 | **SC-3** Visitor can reach the case study from the featured slot, which carries clear visual primacy over a real piece. | ✓ VERIFIED | Prerendered `section#case-study` contains `<h3 class="text-heading"><a class="link-quiet" href="/writing/the-chart-therefore-changes">The Chart Therefore Changes</a></h3>` plus the post's own standfirst — **exactly one link in the slot**. Primacy is measurable, not asserted: `.text-heading` = `clamp(2rem, 1rem + 4vw, 4.5rem)` display face vs. the work list's `.text-standfirst` = 18px body face — a 1.8×–4× ratio. Interim copy (`The case study is being written.`) returns **0 matches** in production. Confirmed identically on the live URL. |
| 4 | **SC-4** Visitor reading the work list sees the featured entry's annotation copy link into the case study rather than duplicate its content. | **? UNCERTAIN** | See **F-001**. Discharged *structurally* (featured slot standfirst = post front-matter, headline links in) and asserted as such at `tests/build/prerender.test.ts:431`. Not discharged *literally*: `lib/work.ts` was untouched by every Phase 4 plan (`git log -- lib/work.ts` → last commit `5f12d8b`, Phase 3), the work-list annotation is not a link by design, and it compresses the case study's own finding near-verbatim. |
| 5 | Three PNG figures of real settled states of the live piece are committed, free of the step prose card. | ✓ VERIFIED | Three distinct SHA-256 hashes, all `2400x1640` (read from PNG IHDR bytes), 129–176 KB. Two inspected visually: `f2-eu-average.png` renders a real EU-average-as-100 chart with the Balearics/Bulgaria/Ireland comparator set the prose names; `f3-arrivals-diverge.png` renders the dual-axis divergence after 1993. No overlay card in either. |
| 6 | The verbatim text of all four live source pages is on disk; nothing in the build fetches the live site. | ✓ VERIFIED | `live-text/{en,de}-{story,methodology}.txt`, 19–24 KB each. No `fetch`/network call to `ib-gdp.guillemgelabert.com` in `app/`, `lib/` or `components/` — the only two occurrences (`lib/work.ts:27,28`) are a static `href` and a host label. The clean build I ran succeeded with no network dependency. |
| 7 | Every mechanical rule in D-18's done-gate exists as an executable assertion. | ✓ VERIFIED | 36 case-study unit assertions (`case-study-content.test.ts` 396 lines / 28 tests, `case-study-figures.test.ts` 213 lines / 8 tests) plus 9 rendered-DOM Playwright tests. They lock the six section marks, front-matter schema, the 1,200–1,800 word band, the banned-token list, the component allowlist, the single outbound link's *position*, and — test 22 — that `International Baccalaureate` never appears. |
| 8 | Every number and quoted sentence traces to the author's own published work. | ✓ VERIFIED | **Re-derived independently.** An extraction probe written here pulled every straight-double-quoted span ≥15 chars from the EN body and every `„…“` span from the DE body and `.includes()`-matched them against the concatenated live-text snapshots. EN: 28 spans, **19/19 prose quotations matched**; the 9 non-matches are an import path, three `src` attributes, three `alt` attributes, one `kicker`, and the abandoned-plan title. DE: 20 spans, **19/20 matched**; the one non-match is the same abandoned-plan title. Both pivot blockquotes matched verbatim. The abandoned-plan title is present verbatim in `/Users/guillem/vault/projects/personal/data-story-ib-gdp/ARTICLE_PLAN.md` (confirmed on disk, `grep -c` → 1), the one licensed non-live source per D-01. |
| 9 | A German reader gets the same case study, paired by `translationKey`, switch resolving both ways. | ✓ VERIFIED | `content/die-darstellung-aendert-sich.mdx`, 1,666 prose words (98% of EN). Both files carry `translationKey: ib-gdp-case-study`. Prerendered HTML: EN carries `Auf Deutsch lesen → /texte/die-darstellung-aendert-sich`, DE carries `Read in English → /writing/the-chart-therefore-changes`. Slug uses the `ae` transliteration `SAFE_SLUG` requires. |
| 10 | Publishing `draft: false` flips the featured slot with zero production code change. | ✓ VERIFIED | `app/(en)/page.tsx:36` → `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)`; `featured-slot.tsx` branches on `entry === null`. `git log --name-only` over the whole phase shows **no commit touching `app/`, `lib/` or `components/`** — the slot flipped from content alone. |
| 11 | Both case studies prerender as real production HTML, not only in dev. | ✓ VERIFIED | Clean `rm -rf .next && npm run build` run here: exit 0, route table shows `● /writing/the-chart-therefore-changes` and `● /texte/die-darstellung-aendert-sich` as SSG. `npm run test:build` **21/21** against that build. |
| 12 | The launch gate narrows from three interim surfaces to two. | ✓ VERIFIED | `tests/build/prerender.test.ts` — the gate test is now titled *"the backlog stub and the contact stub are still interim — the featured slot closed on 2026-08-31"* and asserts only `Nothing listed here yet.` and `No contact details here yet.` The narrowing rationale is written into the test body, not just into a planning doc. `launch-gate.md` (176 lines) is the matching record. |
| 13 | The full suite is green. | ✓ VERIFIED | Re-run here: `npx tsc --noEmit` exit 0 · `npm run test:unit` **88/88** · `npm run test:build` **21/21** (twice — once against the pre-existing build, once against my own clean build) · `npx playwright test` **124/124** in 21.1s. |
| 14 | The case study is live: a stranger can read it and reach it from the landing view. | ✓ VERIFIED | Fetched directly from `https://web-production-9cedb.up.railway.app`: `/`, `/writing`, `/texte`, `/writing/the-chart-therefore-changes`, `/texte/die-darstellung-aendert-sich` all **200**. Live `/` HTML carries the featured `<a href="/writing/the-chart-therefore-changes">The Chart Therefore Changes</a>` and the post standfirst. |
| 15 | The HOME-01 tripwire and the missing editorial pass are carried forward, unresolved and visible. | ✓ VERIFIED | Live `/` still serves `<meta name="robots" content="noindex"/>` and the positioning `<p>` reads exactly `Developer.` `STATE.md:100-102` re-asserts HOME-01 and adds the editorial-pass item at the same weight. `_pm/kanban.md` records both. `STATE.md` frontmatter reads `status: executing` with `completed_phases: 4 / total_phases: 6 / percent: 67` — internally consistent. |

**Score: 14/15 truths verified** (1 uncertain, 0 failed)

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `content/the-chart-therefore-changes.mdx` | EN case study, 6 h2, 3 Figures, 1 Aside, 1 blockquote, 1 outbound link | ✓ VERIFIED | 1,695 prose words. `min_lines: 90` heuristic reports "Only 80 lines" — a **false positive**: MDX paragraphs are single long lines. Substance confirmed by word count and by rendered structure. |
| `content/die-darstellung-aendert-sich.mdx` | DE twin, same shape | ✓ VERIFIED | 1,666 prose words. Same `min_lines` false positive. |
| `public/case-study/f1-constant-dollars.png` | F1, six comparators in constant dollars | ✓ VERIFIED | 2400×1640, 176 KB, distinct hash |
| `public/case-study/f2-eu-average.png` | F2, EU-27 average as 100 | ✓ VERIFIED | 2400×1640, 129 KB. Visually confirmed: Balearics / Bulgaria / Ireland against a 100 baseline. |
| `public/case-study/f3-arrivals-diverge.png` | F3, income vs arrivals, wide | ✓ VERIFIED | 2400×1640, 130 KB. Visually confirmed: dual axis, divergence after 1993. |
| `scripts/capture-case-study-figures.mjs` | One-shot capture at DSF 2 | ✓ VERIFIED | 290 lines, contains `waitForChartIdle`, `data-animation-state`, `public/case-study` |
| `scripts/snapshot-live-text.mjs` | Offline verbatim source | ✓ VERIFIED | 153 lines, contains `innerText` |
| `live-text/{en,de}-{story,methodology}.txt` | Verbatim live prose | ✓ VERIFIED | 4 files, 19–24 KB. Independently used as the match corpus for truth 8. |
| `tests/unit/case-study-content.test.ts` | Source-level gate | ✓ VERIFIED | 396 lines (need 120), 28 tests, all passing |
| `tests/unit/case-study-figures.test.ts` | Figure/PNG-byte gate | ✓ VERIFIED | 213 lines (need 60), 8 tests, all passing |
| `tests/case-study.spec.ts` | Rendered-DOM gate | ✓ VERIFIED | 214 lines (need 80), 9 tests, all passing |
| `tests/build/prerender.test.ts` | Production-tier featured-slot proof | ✓ VERIFIED | Contains `the-chart-therefore-changes`; 21/21 |
| `tests/writing-index.spec.ts` | Dev-tier index counts updated | ✓ VERIFIED | Now asserts 2 EN articles / 3 DE articles + 2 hrs; passing |
| `.planning/.../fact-check.md` | Per-claim D-19 record | ✓ VERIFIED | 226 lines (need 40). Twelve named trap checks + per-claim tables. **Independently re-derived** — see truth 8. |
| `.planning/.../launch-gate.md` | Closure record | ✓ VERIFIED | 176 lines (need 25). 16-check live deployment table, and it self-corrects the plan's own wrong "two entries on /writing" framing rather than papering over it. |
| `_pm/kanban.md` | Project tracking (CLAUDE.md agreement) | ✓ VERIFIED | Phase 4 entry present, both carried blockers named |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `app/(en)/page.tsx` | `lib/work.ts` `CASE_STUDY_SLUG` | `findBySlug(await publishedFor("en"), …)` | ✓ WIRED | line 36; resolves in production |
| `featured-slot.tsx` | `/writing/the-chart-therefore-changes` | `next/link` `postPath("en", entry.slug)` | ✓ WIRED | one `<a>` in the prerendered `h3.text-heading` |
| `content/*.mdx` filename stem | `CASE_STUDY_SLUG` | filename **is** the slug | ✓ WIRED (manual) | SDK reported "Source file not found" — the `from` is a description, not a path. Asserted by `case-study-content.test.ts:86-89`. |
| `tests/build/prerender.test.ts` | `.next/server/app/index.html` | reads real prerendered HTML | ✓ WIRED (manual) | SDK reported "Target not referenced" — the path is built by `path.join(process.cwd(), ".next","server","app")` at line 23, so the literal string is absent. `getRoutes()` walks it; used by every test in the file. |
| both `.mdx` files | `public/case-study/*.png` | `<Figure src width height>` | ✓ WIRED | 3 each; declared dims match IHDR bytes |
| DE `.mdx` ↔ EN `.mdx` | shared `translationKey` | `ib-gdp-case-study` | ✓ WIRED | switch resolves both directions in prerendered HTML |
| EN `.mdx` | live piece | one inline prose link (D-20) | ✓ WIRED | `https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing`, inside *What shipped*, asserted by test 27 |
| `fact-check.md` | `live-text/en-story.txt` | per-claim string search | ✓ WIRED | and independently reproduced by this verifier |
| **`lib/work.ts` WORK[0].annotation** | **the case study** | — | **⚠ NOT WIRED** | No link. See F-001. |

### Data-Flow Trace (Level 4)

| Artifact | Data variable | Source | Produces real data | Status |
|---|---|---|---|---|
| `FeaturedSlot` | `entry: PostEntry \| null` | `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)` — filesystem read at build | Yes — resolves to the real MDX front-matter; title and standfirst appear in prerendered and live HTML | ✓ FLOWING |
| `/writing` index | published post list | `publishedFor("en")` | Yes — 1 real `<article>` in production, empty state gone | ✓ FLOWING |
| `/texte` index | published post list | `publishedFor("de")` | Yes — 1 real `<article>` (dev fixtures correctly hidden as drafts) | ✓ FLOWING |
| `<Figure>` in both `.mdx` | `src`/`width`/`height` | real PNG bytes on disk | Yes — IHDR-verified 2400×1640, `naturalWidth` 2400 from the loaded bitmap in Playwright | ✓ FLOWING |
| `WorkList` | `WORK` tuple | `lib/work.ts` static const | Yes (by design — a fixed tuple, not a query) | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Clean production build succeeds, both posts SSG | `rm -rf .next && npm run build` | exit 0; `● /writing/the-chart-therefore-changes`, `● /texte/die-darstellung-aendert-sich` | ✓ PASS |
| Type check | `npx tsc --noEmit` | exit 0 | ✓ PASS |
| Unit gates | `npm run test:unit` | 88 pass / 0 fail | ✓ PASS |
| Production-tier gates | `npm run test:build` | 21 pass / 0 fail | ✓ PASS |
| End-to-end | `npx playwright test` | 124 passed (21.1s) | ✓ PASS |
| Lint | `npm run lint` | 1 error — `use-prefers-reduced-motion.ts:23`, pre-existing, no Phase 4 file | ✓ PASS (known deferred) |
| Live URL reachable, 5 routes | `curl -o /dev/null -w '%{http_code}'` × 5 | 200 × 5 | ✓ PASS |
| Live featured slot wired | fetch `/`, extract `section#case-study` | real title + standfirst + `href="/writing/the-chart-therefore-changes"` | ✓ PASS |
| Live robots still noindex | fetch `/`, match robots meta | `<meta name="robots" content="noindex"/>` | ✓ PASS (FIND-02 not flipped) |
| **EN quotation provenance, re-derived** | independent extraction probe vs `live-text/*.txt` | 19/19 prose quotations matched verbatim; blockquote matched | ✓ PASS |
| **DE quotation provenance, re-derived** | same, `„…“` spans | 19/20 matched; the 1 non-match is the EN-language abandoned-plan title, sourced from `ARTICLE_PLAN.md` | ✓ PASS |
| `International Baccalaureate` absent from the shipped artifact | `grep -rniE "baccalaure\|diploma programme"` over `content/ app/ lib/ components/ tests/` | Only hit is the *guard assertion itself* at `case-study-content.test.ts:318-322`. Zero occurrences in either `.mdx`. Zero bare `IB` tokens in content. | ✓ PASS |

### Probe Execution

| Probe | Command | Result | Status |
|---|---|---|---|
| — | — | — | **SKIPPED** — no `scripts/*/tests/probe-*.sh` exist and no PLAN or SUMMARY in this phase declares a probe. Probe-equivalent coverage is the four suites above, all re-run here. |

### Requirements Coverage

| Requirement | Source plan | Description | Status | Evidence |
|---|---|---|---|---|
| CASE-01 | 04-01, 04-03, 04-05, 04-06 | Visitor can read a published case study covering ib-gdp-evolution | ✓ SATISFIED | Truth 1. REQUIREMENTS.md correctly marked Complete. |
| CASE-02 | 04-02, 04-03, 04-04 | Six parts in order | ✓ SATISFIED **in code** / ✗ **stale in tracking** | Truth 2 — verified in prerendered HTML, both locales, plus 9 e2e + 2 unit assertions. **But REQUIREMENTS.md:27 still reads `- [ ]` and :144 reads "Pending".** Closure commit `08f79d9` updated CASE-01/CASE-03/HOME-02 and omitted CASE-02; no plan or summary explains the omission. Tracking correction needed. |
| CASE-03 | 04-02, 04-05, 04-06 | Visitor can reach the case study from the featured slot | ✓ SATISFIED | Truth 3, truth 10. REQUIREMENTS.md correctly marked Complete. |
| HOME-02 | 04-03, 04-05, 04-06 | One featured piece with clear visual primacy | ✓ SATISFIED | Truth 3 — one `h3.text-heading` in `section#case-study`, type-scale ratio 1.8×–4× over the work list. REQUIREMENTS.md correctly marked Complete. |

No orphaned requirements: REQUIREMENTS.md maps exactly CASE-01, CASE-02, CASE-03, HOME-02 to Phase 4, and all four appear in plan `requirements` fields.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `tests/build/prerender.test.ts` | 5, 331, 356-357, 365, 537 | `POSITIONING_PLACEHOLDER` | ℹ️ Info | Not a debt marker — an exported const from `lib/work.ts` under deliberate assertion. |
| `tests/build/prerender.test.ts` | 494 | `"TODO"` | ℹ️ Info | Not a debt marker — a member of the test's own *banned-string* list, asserting `TODO` never reaches production HTML. |
| `.planning/REQUIREMENTS.md` | 27, 144 | CASE-02 left unchecked / "Pending" | ⚠️ Warning | Tracking contradicts verified code. Would read as an unmet v1.0 requirement at milestone audit. |

**No `TBD`, `FIXME`, `XXX`, `HACK` or unreferenced `TODO` in any file this phase created or modified.** The debt-marker gate passes.

### Editorial Judgement Assessment

The phase goal claims this artifact is "the only artifact that can close the 'talented developer, no editorial judgement' gap." Prose quality cannot be verified by assertion, but the four specific things that *demonstrate* judgement can be checked against the text. Reading `content/the-chart-therefore-changes.mdx` directly:

**1. States a prior expectation — PRESENT, and unusually specific.** Not a vague "I wondered whether". §1 states the prior with its direction and its expected outcome: *"I set out to test that claim against 125 years of data, expecting it to survive only in a diminished, more troubling form."* §2 then goes further and names an **abandoned earlier article by its title** — *"The Balearic Paradox: Is Tourism Mallorca's Dutch Disease?"* — with its five constituent symptoms and their numbers.

**2. Records where it was wrong — PRESENT, and it argues against its own flattery.** This is the strongest signal in the piece. §2 line 27 opens: *"One detail is worth stating precisely, since this reversal is easy to overstate in the flattering direction. The relative measure that eventually became the piece's spine … was not a discovery I made partway through. It was already there, as the abandoned plan's opening exhibit."* Volunteering that the good idea was already on the page — that only its *position in the argument* changed — costs the author the more impressive version of the story. Reinforced by §3's *"The suspicion behind the abandoned plan survived; its explanation did not"* and §2's reason for abandonment: not that any symptom was false, but that none answered the causal question.

**3. Distinguishes correlation from causation — PRESENT, and structurally, not just rhetorically.** Extremadura is deployed as an explicit control case (§3: landlocked, no coast, no resorts — and the same tenfold rise), which is a causal-inference move, not a hedge. §3 states the posture as a negation of the author's own claim: *"At no point does the piece assert that tourism was responsible for the climb, or responsible for what comes after it."* §2 names the discipline directly — whether tourism *"was the cause of the pattern, rather than merely present alongside it."* §5 then anticipates the obvious objection with Ireland on the same axis, so post-1993 flatness cannot be dismissed as a continental ceiling. Confirmed mechanically: `proves`, `caused` and `debunks` appear nowhere as the piece's own claim.

**4. Shows the form-change decision rather than asserting it — PARTIALLY PRESENT.** What is shown: the pivot is a verbatim pull quote from the author's own published page, not a paraphrase; the mechanics are given concretely (axis switches from constant 2011 PPP dollars to % of EU-27 with 100 as baseline, calibrated against Ireland 158 / Bulgaria 54); the *timing* is argued rather than stated (*"a chart appended at the bottom reads as a footnote, not an argument"*); and §4 volunteers a precision that most writeups would omit — that the comparator set changes too, *"because the new scale needs calibrating rather than populating."* Both endpoints of the change are on the page as real figures (F1 constant dollars, F2 EU-average).

**What is not shown.** Three things:
- **The transition itself.** The piece's whole thesis is that the change must happen *mid-scroll, under the same reader*. On this page it cannot: F1 and F2 are static PNGs separated by an entire section boundary and ~18 lines of prose. The reader is told the transition is the point and must click through to the live piece to experience it. The claim is argued well; it is not demonstrated on the artifact making it.
- **The rejected alternative.** CASE-04 — the discarded scatterplot of Spanish regions the five-symptom thesis was built on — is deferred to v2 (`04-CONTEXT.md § Deferred`). Research called it *"the clearest single visible signal of editorial judgment available."* Its absence is a deliberate, recorded scope choice, not an oversight.
- **A losing decision that stayed lost.** Every recorded reversal in the piece resolves in the author's favour: the prior was right, the abandoned plan's chart was promoted, the method chosen is defended. §6 (Methodology) is the one place this breaks — it concedes *"the simpler single-year method is actually closer to Rosés-Wolf's real GDP figures"* and that the EU-27 benchmark's composition shifts before 1985 *"exactly where the pre-1960 claim rests hardest."* That concession is the highest-value epistemic content in the piece and it is in the last section, where fewest readers reach it.

**Assessment:** three of four criteria are clearly met, the fourth is met in argument but not in demonstration. The piece does the specific things that constitute editorial judgement rather than claiming to have it, and it does the hardest one — self-correction against the flattering reading — without being asked. Whether the prose *reads* well remains a human judgement (see human verification item 1).

### Human Verification Required

#### 1. The author's editorial pass over both pieces

**Test:** Read `/writing/the-chart-therefore-changes` and `/texte/die-darstellung-aendert-sich` end to end, as the author.
**Expected:** You accept both under your byline, or you edit them.
**Why human:** Two AI-drafted, bylined pieces are live at `draft: false` in two languages and **no human has read them.** The D-19 fact-check reduces factual risk only. CONTEXT D-18 sequences this pass before Phase 6 flips robots to indexable. The phase created this risk deliberately under your explicit directive to unblock — it must not silently survive the FIND-02 flip.

#### 2. Decide how Roadmap SC-4 is to be read

**Test:** Load `/`, scroll from the Case study section into the Work section. See F-001 below.
**Expected:** Either you accept the structural discharge already shipped, or you want the work-list entry to itself carry a path into the case study — a change to `lib/work.ts` this phase did not make.
**Why human:** The criterion's wording is genuinely ambiguous and only you can say which reading the roadmap meant.

#### 3. Figure legibility at phone width

**Test:** Load the EN case study at 375px and 1440px; look at the three figures.
**Expected:** Axis labels, legend and the 100-baseline readable at 375px.
**Why human:** Tests assert the bitmaps decode at 2400 `naturalWidth`. Nothing asserts a downscaled 2400px chart is *readable* at 375px.

#### 4. German register

**Test:** Read `Die Darstellung ändert sich`, especially §Methodik and the standfirst.
**Expected:** Reads as your own published German, not as translated-from-English.
**Why human:** Quotation provenance is proven (19/20 verbatim). The connective prose written around the quotations is not.

#### 5. REQUIREMENTS.md CASE-02 tracking

**Test:** Decide whether to mark CASE-02 complete.
**Expected:** Corrected, or a reason recorded for leaving it open.
**Why human:** The code satisfies it; the tracking says otherwise. A one-line decision, but `/gsd:audit-milestone` will read it as an unmet v1.0 requirement.

### Findings

#### F-001: Roadmap SC-4 is discharged structurally, not literally — `lib/work.ts` was never touched

**Status:** UNCERTAIN (⚠️ WARNING — human decision requested)

**Evidence.** Roadmap SC-4 reads: *"Visitor reading the work list sees the featured entry's annotation copy link into the case study rather than duplicate its content — the loop left open at the end of Phase 3 is closed here."* Phase 3's goal names the deferred item as *"the featured entry's final annotation copy … that one line."*

Observable facts:
- `git log --oneline -- lib/work.ts` returns exactly one commit, `5f12d8b` (Phase 3). **No Phase 4 plan lists `lib/work.ts` in `files_modified`.**
- `WORK[0].annotation` is `"The Balearics stopped gaining on Europe in 1993 — while tourist arrivals went on tripling."` The case study's own §5 finding is `"The Balearics stopped gaining ground on Europe in 1993 and have fallen behind ever since, even as arrivals have tripled."` These are near-verbatim — which is what SC-4's "rather than duplicate its content" clause appears to forbid.
- `work-list.tsx` renders the annotation as an unlinked `<p>` by explicit Phase 3 design (*"the annotation is not linked and the host label is not linked"*). The work-list row's only link is the title, pointing **outward** to `ib-gdp.guillemgelabert.com` — not into the case study.
- There is therefore **no path from the work list into the case study** anywhere on the landing view.

**The counter-argument, which is documented and pre-dates execution.** `04-RESEARCH.md:69` records the structural reading with a `[VERIFIED]` citation: *"the featured entry's annotation copy* is *the post's front-matter `standfirst`, and the headline links to `/writing/{slug}`. It requires no edit to `WORK` in `lib/work.ts`."* This traces back to `03-UI-SPEC.md:368` (D-10) and `:426` (*"Phase 4 SC4 closes the loop by having the case study's own standfirst carry the link into the piece"*). `04-CONTEXT.md:467` resolves the duplication clause the same way: the work-list annotation describes the *piece*, the standfirst describes the *case study* — so the two surfaces on the landing view do not duplicate each other. `tests/build/prerender.test.ts:431` encodes this reading in an assertion message that names SC4 explicitly.

**Why this is not marked FAILED.** The deviation is documented, reasoned, pre-dates execution, traces to a prior phase's approved UI spec, and is under test. Nothing is broken and the case study is reachable.

**Why this is not marked VERIFIED.** The roadmap contract says *"Visitor reading the work list"*. A visitor reading the work list gets neither a link into the case study nor non-duplicating annotation copy. The verifier will not silently substitute the implementer's reading of a criterion for the criterion's own words.

**This looks intentional.** To accept the deviation, add to this file's frontmatter:

```yaml
overrides:
  - must_have: "Visitor reading the work list sees the featured entry's annotation copy link into the case study rather than duplicate its content"
    reason: "Discharged structurally per 03-UI-SPEC D-10: the featured slot's annotation copy IS the post's front-matter standfirst and the featured headline links into the case study. The work-list annotation deliberately stays unlinked (Phase 3 headline-is-the-only-link rule) and describes the live piece, not the case study."
    accepted_by: "guillem"
    accepted_at: "<ISO timestamp>"
```

Then re-run verification. Alternatively, change `WORK[0].annotation` in `lib/work.ts` to copy that points at the case study.

#### F-002: REQUIREMENTS.md CASE-02 left "Pending" against verified code

**Status:** ⚠️ WARNING (tracking defect, not a code gap)

`REQUIREMENTS.md:27` is `- [ ] **CASE-02**` and `:144` is `| CASE-02 | Phase 4 | Pending |`, while the phase is marked Complete and CASE-02's evidence is verified above at truth 2. Closure commit `08f79d9` flipped CASE-01, CASE-03 and HOME-02 and skipped CASE-02; `grep` finds no mention of CASE-02 in `04-06-PLAN.md`, `04-06-SUMMARY.md` or `launch-gate.md`. Root cause: `04-06-PLAN.md`'s `requirements` field is `[CASE-01, CASE-03, HOME-02]`, and the earlier plans that carried CASE-02 never updated REQUIREMENTS.md. One-line fix; needs your decision, not a re-plan.

### Gaps Summary

**No blockers. The phase goal is achieved.**

The long pole is genuinely delivered, and the delivery is stronger than the SUMMARY narrative required it to be. Both case studies exist as substantial prose (1,695 / 1,666 words), prerender as SSG in a build this verifier ran from a clean `.next`, and are live and reachable at the public URL. The featured slot flipped from placeholder to a real linked headline **with no production code change at all** — `git log --name-only` across the entire phase touches no file under `app/`, `lib/` or `components/`, which is exactly the architecture Phase 3 claimed to have built and is the single most falsifiable claim in the phase. It held.

The fact-check was not taken on trust. An independent extraction probe written during this verification re-derived its central result from scratch: every prose quotation in the English piece (19/19) and every German quotation but one (19/20) matches the live-text snapshots byte for byte, and the one exception is the English-language title of an unpublished draft that exists verbatim on disk in the vault. The premise trap holds — `International Baccalaureate` appears nowhere in the repository except in the assertion that guards against it, no bare `IB` token appears in either `.mdx`, and both pieces are unambiguously about the Balearic Islands.

Two items block nothing today but must not be lost:

1. **F-001 (SC-4)** — a criterion-interpretation question, not a defect. It needs a one-line decision from you: accept the structural discharge with an override, or edit `lib/work.ts`.
2. **F-002 (CASE-02 tracking)** — REQUIREMENTS.md contradicts verified code.

Status is `human_needed` rather than `passed` because of item 1 in the human verification list. Two bylined pieces are live, in two languages, that no human has read. That is not a code gap and this phase was directed to accept it — but it is the risk this phase created, it is correctly recorded in `STATE.md`, `launch-gate.md` and `_pm/kanban.md` at the same weight as the HOME-01 tripwire, and marking this phase `passed` would let it pass out of view before Phase 6 makes the site indexable.

---

_Verified: 2026-08-31T17:51:31Z_
_Verifier: Claude (gsd-verifier)_
