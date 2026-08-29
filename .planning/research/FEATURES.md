# Feature Research

**Domain:** Personal site for a data-journalist / viz-developer job search — surface-level behavior for the v1.0 committed surfaces
**Researched:** 2026-08-29
**Confidence:** MEDIUM (WebSearch-sourced, cross-corroborated by 2–3 independent sources per finding; no Context7-relevant library questions in this research — this is a content/UX domain, not a framework question)

This file builds on `BRIEF.md` (repertory grid, 24-site scan, five construct axes, five design principles, evidence audit, anti-goals) and `.planning/PROJECT.md` (committed v1.0 surfaces). It does not re-derive positioning or re-scan the 24 sites. It answers one question per committed surface: what does table-stakes behavior look like, what differentiates a strong version, what are the anti-features — and it gives the case study, the n=3 work list, and the backlog (BRIEF's three hardest, least-precedented surfaces) the deepest treatment, per the brief.

---

## Surface 1: The Case Study (ib-gdp-evolution)

This is the highest-stakes surface — BRIEF §10 calls editorial judgment "the weakest link," and the case study is the only artifact that can close that gap. Per BRIEF §2, the load-bearing content is: *here is what I expected, here is what the data actually was, here is how the visual form changed because of it.*

### What table-stakes structure looks like, in order

Cross-referencing The Pudding's methodology-footer convention, Nadieh Bremer & Shirley Wu's *Data Sketches* documented process (sketch the expectation, then let the data revise it), and FlowingData's "process" post series (which exists specifically to document expectations vs. data), a case study that does what BRIEF §2 asks for has this shape:

1. **The question, stated in one line.** What prompted this piece — not "a project about GDP" but the actual angle. This is the equivalent of a nut graf: a 90-second scanner should be able to read this line alone and know what judgment is being demonstrated.
2. **The expectation, stated before the reveal.** What you thought the data would show, concretely enough to be falsifiable. This has to read as genuinely prior — vague hedging ("I assumed there'd be some correlation") doesn't carry evidential weight; a specific, checkable guess does.
3. **What the data actually showed.** The complication or surprise. Ideally anchored to one concrete number or an early rough view of the data, not just asserted in prose.
4. **The pivot.** How the visual form changed in response — this is the actual mechanism BRIEF §2 is trying to prove ("form can change in response to what the data turns out to be"). Concrete evidence here is a before/after: a chart type or structure tried and abandoned, shown briefly (a sketch, a rejected screenshot), next to what shipped.
5. **The shipped piece.** Prominent link/embed to the live interactive.
6. **A short methodology/data-source note.** Sources, tools, caveats. Signals rigor to a technical audience without becoming a tutorial.

### Table stakes vs. differentiators vs. anti-features

| Category | Item | Complexity | Notes |
|---|---|---|---|
| Table stakes | Stated angle/question up front | LOW | One sentence; must survive a 90-second scan alone |
| Table stakes | Working link/embed to the live piece | LOW | The case study without the artifact reachable is inert |
| Table stakes | Readable prose narrative, not a screenshot dump | LOW | Structure over volume |
| Table stakes | Short methodology/sources note | LOW | Credibility signal for a technical audience; keep to a few lines |
| Differentiator | Explicit expectation → finding → pivot arc | MEDIUM (writing effort, not technical) | This is the one thing that proves the BRIEF §2 claim; everything else is supporting |
| Differentiator | Showing one rejected alternative form, concretely | MEDIUM | A sketch or discarded chart type, shown next to the shipped one — the single clearest evidence of judgment over the whole page |
| Differentiator | A visible "before" artifact (rough sketch, first pass) | LOW–MEDIUM | Data Sketches' whole method rests on this: sketch first, publish the sketch alongside the final |
| Anti-feature | Tutorial framing ("here's how to build this") | — | Converts a judgment signal into a skills signal — exactly the wrong allocation per BRIEF §1; engineering is supposed to be demonstrated by the build, not re-explained in the case study |
| Anti-feature | Screenshot-heavy "process diary" with no argument | — | Documents *that* iteration happened, not *why* — doesn't answer the job-to-be-done (BRIEF §3) |
| Anti-feature | Heavy tool/stack enumeration | — | CV territory (see Surface 5), not case-study territory, per the allocation principle |
| Anti-feature | Long undifferentiated wall of text | — | Audience has ~90 seconds for the *whole site*; even the deep-dive piece needs scannable structure (short sections, one idea per paragraph) |

**Confidence:** MEDIUM. Triangulated from The Pudding's public methodology convention, *Data Sketches'* documented process model, and FlowingData's "process" series concept — no single canonical source states this exact structure, but three independent traditions converge on it.

**Dependency:** The case study is the destination for the top entry in the work list (Surface 2) and is the referent of "one featured piece" in the positioning sentence. It should be written and structurally finished before the work list's copy is finalized, since the list entry should point into it rather than duplicate it.

---

## Surface 2: The Work List at n=3

BRIEF's design principle #1 rules out card grids and three-across rows at this item count — both look empty and make thin content visually obvious (uniform card heights expose the gap). PROJECT.md confirms this is Out of Scope.

### What a strong n=3 list does that a weak one doesn't

Research on minimalist portfolio patterns (e.g., portfolios built as a single column of titled entries with no thumbnails, sometimes described as "ten projects in a column, no thumbnails, one micro-interaction") confirms the pattern BRIEF already points to: at low n, typographic weight and spacing carry the "substantial" feeling that a grid would otherwise try to fake with thumbnail padding. `notes.md`'s own annotation of p5aholic.me ("just a name, title, and scrolling project list") is the same pattern already in the user's reference set — worth reusing as the concrete precedent rather than a new one.

| Category | Item | Complexity | Notes |
|---|---|---|---|
| Table stakes | Title + one-line description per item | LOW | Each item scannable in under 10 seconds |
| Table stakes | Direct link to the live artifact | LOW | No placeholder/"coming soon" items — at n=3 a dead entry is proportionally costly |
| Differentiator | Vertical list, generous type, no thumbnails | LOW | Lets typography do the work a grid would do with imagery — matches BRIEF principle #1 directly |
| Differentiator | Ordering by significance, not chronology | LOW | The case-study piece leads; the list reads as a coda to the featured piece, not a parallel, competing section |
| Differentiator | One-sentence annotation that signals *what it's about*, not *what it's built with* | LOW (content effort, not technical) | "React, D3, Node" tags read as CV language and undercut the allocation principle — the annotation is judgment/subject copy, not a stack list |
| Anti-feature | Card grid / three-across row | — | Already ruled out; looks empty at n=3, exposes thin content via uniform card heights |
| Anti-feature | Metadata columns (date, role, stack) styled like a spec sheet | — | Turns the list into a résumé table; contradicts "person as lens" (BRIEF axis 4) |
| Anti-feature | Thumbnail padding sized to imitate a grid | — | Inflates visual weight without added content — the "nice art project, can't ship" anti-goal (#2) |

**Complexity:** LOW overall (no CMS/data complexity — a static list). The real cost is in the one-line annotations, which need the same judgment-signaling care as the case study, just compressed.

**Dependency:** Requires the case study (Surface 1) to exist as the destination for its top/featured entry. The other 1–2 entries (e.g. Watch People Die) only need live URLs — no case-study depth required for those at v1.

---

## Surface 3: Backlog / Currently Working On

BRIEF §7 is right that this is rare — the closest prior art comes from three distinct traditions, and the honest finding is that the version the user has committed to (name + rich-text description, no dates, no states) forfeits capabilities that *every* piece of prior art treats as load-bearing.

### Prior art surveyed

**1. The "/now page" movement (Derek Sivers, nownownow.com, IndieWeb).** A now page is explicitly "what you'd tell a friend you hadn't seen in a year" — current focus, not a task list. Sivers' own guidance for making one work rests on three things: a dedicated page, honest content, and **a visible last-updated date** — the date is treated as non-negotiable, precisely because an undated or clearly stale now page reads as neglect rather than clarity. This is direct, on-point evidence *against* the no-dates decision: the one piece of prior art built around exactly this content shape says the date is what keeps it from reading as abandoned.

**2. "Building in public" changelogs / shipped logs (e.g., indie-hacker changelog pages).** These typically pair each entry with a **shipped/state marker** — the entry exists specifically to prove momentum. Without a state, this genre collapses into an idea list.

**3. "Project graveyard" sites (e.g., mydeadprojects.com).** These explicitly own the unfinished-ness — the frame is "wear your failures like badges of honor." This works only because the reframe itself is stated content, not because the list is undated. It's a different genre (retrospective, self-aware) from a live "currently exploring" list, but it's the one prior-art example that succeeds *without* dates or states — by trading the "still working on this" claim for a "these didn't work out, and that's fine" claim, which is not what BRIEF's backlog is trying to say.

### Honest assessment of the no-dates, no-states version

**What it can still do:**
- Communicate breadth of curiosity — a well-curated list of distinct, specific angles/ideas is itself evidence of subject range (BRIEF principle #4), independent of whether any of them are dated.
- Avoid the specific failure mode of a *visibly rotting* date — a backlog item dated 2025 and still "in progress" in 2027 is worse than an undated one; removing dates removes the single most damning artifact a backlog can produce.
- Read as a curated set of interests (closer to a reading list or an idea log) rather than a task tracker, if the copy is written that way.

**What it cannot do:**
- It cannot make the "this is real data / a working log" claim — BRIEF §7's own proposed resolution to the chart-signifier trap (§8: render the backlog as an actual chart, since a chart of real backlog data can legitimately use axes) requires dates or state values as the encodable variable. A list of name + description has nothing to encode. That resolution is unavailable to the version as scoped; PROJECT.md already tags this "Accepted risk... forfeits the argument that the backlog is real data," and this research corroborates that assessment rather than overturning it.
- It cannot prove recency or maintenance the way a dated now-page or a shipped-log can — visitors have no signal for whether "currently exploring X" was written last week or two years ago.
- It cannot self-mitigate anti-goal #4 ("started a lot, finished nothing") through any visible progress signal — the entire mitigating burden falls on curation and voice, since dates/states are the only two mechanisms every piece of prior art uses for this, and both are declined.

### What's left as mitigation, given the constraints already accepted

| Category | Item | Complexity | Notes |
|---|---|---|---|
| Table stakes | Item name + rich-text description, no metadata chrome | LOW | As scoped |
| Differentiator | Short, curated list (fewer, sharper items) over a long inventory | LOW | Sprawl reads as scatter; a tight list reads as focus |
| Differentiator | Each entry written as a considered angle ("what if X were mapped against Y") rather than a task name | LOW (content effort) | Makes each item independently readable as subject curiosity even with zero state information |
| Differentiator | Placed structurally subordinate to the finished work (below the case study and work list) | LOW | Signals "also thinking about," not "tracked project board" — avoids implying a cadence that isn't being kept |
| Anti-feature | Any date or state left in in some items but not others | — | Worse than uniform — reads as an abandoned attempt at rigor |
| Anti-feature | A long list that reads as a wishlist/idea-dump | — | This is the literal anti-goal #4 failure mode; curation is the only defense available in this version |

**Complexity:** LOW technically (static content, no dynamic state, no chart). The risk here is not implementation cost — it's product risk, already flagged in PROJECT.md's Key Decisions table as "⚠️ Revisit." This research adds one concrete data point to that flag: every piece of prior art surveyed that succeeds without a "started, not finished" reading does so by either (a) showing a date/state, or (b) explicitly reframing abandonment as the point. The as-scoped version does neither, which is worth surfacing to the requirements step as a named risk rather than a resolved decision.

**Confidence:** MEDIUM–HIGH on the prior-art survey itself (Sivers' now-page writing is a primary, well-documented source; the graveyard-genre and changelog-genre pattern is corroborated across multiple examples). The risk conclusion follows directly from that evidence.

---

## Surface 4: Writing Index (~13 legacy 2020 posts)

The problem is presentation, not content: 13 posts, all dated 2020, risk reading as an archive that stopped rather than a body of work that's real. Research on archive/series presentation (grouped series-index patterns, e.g. dedicated series table-of-contents pages) supports a specific reframe: **group by series, not by date.**

### What changes the reading from "abandoned" to "depth"

The actual content, per `notes.md`, is not 13 unrelated posts — it's an 8-part security-headers series, a 4-part Git series, and one standalone TypeScript post. Presented as a flat reverse-chron list, this reads as "13 posts, one year, nothing since." Presented as two labeled series plus one note, it reads as "two completed technical deep-dives" — a depth signal instead of a volume signal. This is a free reframe: no new content is needed, only different grouping and framing copy.

| Category | Item | Complexity | Notes |
|---|---|---|---|
| Table stakes | Working links for every migrated post, one canonical URL each | MEDIUM | Migration risk: broken links undercut "lives under one domain" (PROJECT.md) |
| Table stakes | Title + one-line summary per post | LOW | |
| Differentiator | Group posts into labeled series ("An 8-part series on HTTP security headers") with a short series intro | LOW–MEDIUM | Requires series metadata on migrated content (see dependency below); reframes volume as depth |
| Differentiator | A one-line framing sentence at the top of the index acknowledging the archive is carried-over writing | LOW | Pre-empts the "did this person stop writing" read before the visitor infers it themselves from the dates |
| Anti-feature | Hiding or de-emphasizing dates entirely | — | Technical posts age (security-header guidance in particular); hiding dates erodes trust with a technical audience more than the staleness itself would |
| Anti-feature | Blog-engine chrome built for scale (pagination, category filters, "load more") at 13 posts | — | Same low-n problem as the work list — heavy list UI over a small archive exposes thinness rather than hiding it |
| Anti-feature | Fake recency signals (e.g. a site-wide "last updated" badge that doesn't reflect reality) | — | Discoverable as false, worse than the honest date |

**Complexity:** MEDIUM overall — mostly content-migration effort (moving 2020 posts to the new domain/design without breaking links) plus deciding a series-grouping data shape before migration.

**Dependency:** The series-grouping decision (flat vs. grouped) needs to be made before or during content migration, since each migrated post needs series-name/part-number metadata to support grouping later. Sequencing this after migration means re-touching 13 files.

**Confidence:** MEDIUM. The specific "13 posts, all 2020" staleness problem has no single canonical treatment in the sources found; the series-grouping mitigation is corroborated by general technical-blog series conventions (dedicated series index/table-of-contents pages, "part N of" labeling) rather than by a source addressing this exact scenario.

---

## Surface 5: CV as an HTML Page

BRIEF §1's allocation principle is the load-bearing logic here, and it resolves this surface cleanly: the site's copy budget is reserved for subject knowledge, editorial judgment, and design intuition — engineering is demonstrated by the build, not claimed in copy. The CV is the one place on the site where stating engineering credentials is not just permitted but expected, because that's what a CV is for and what its reader (a recruiter, an ATS-adjacent human, ambiguous forwarding to HR) expects to find.

Research on HTML vs. PDF resumes for developers confirms the field's converged practice: **maintain both, and expect a URL alone will not always be sufficient.** An HTML CV is "always current," linkable, and "shows front-end skill by existing" — but ATS systems parse an uploaded file, not a webpage, so many application flows still need a static artifact.

| Category | Item | Complexity | Notes |
|---|---|---|---|
| Table stakes | Reverse-chron work history, skills/tools list, education | LOW | Standard CV content — this is where "React, D3, Node" belongs, not on the work list |
| Table stakes | A way to get a static copy (print stylesheet at minimum, ideally a downloadable PDF) | LOW–MEDIUM | Many application forms require an uploadable file; a URL-only CV fails that flow |
| Differentiator | Reuses the site's type system in the print/PDF output | LOW | Consistency is itself a small craft signal; a visually disconnected CV page undercuts "demonstrated engineering" |
| Differentiator | Inline links next to relevant line items (e.g. the GDP project linked directly from its CV line) | LOW | Something a PDF alone does more awkwardly; the HTML version can do this natively |
| Anti-feature | Duplicating the site's narrative/positioning copy on the CV page | — | Redundant with the allocation principle — the CV's job is verifiable facts (where, when, what tech), not the judgment argument; that's the rest of the site's job |
| Anti-feature | No print/PDF affordance at all | — | Forces a recruiter to copy-paste a webpage into an ATS — real friction for the exact audience this site targets |

**Complexity:** LOW–MEDIUM. Mostly a content and print-stylesheet problem, not an architectural one.

**Dependency:** The CV should reference the interactive projects and the case study minimally (name + link only) rather than re-describing them at case-study depth — a content-allocation dependency on Surfaces 1–2, not a technical one.

---

## Surface 6: A Photograph

Not deeply researched here — low complexity, low ambiguity. Table stakes: one photograph of Guillem, sized and cropped consistently with the Typographic-tier visual system (BRIEF §8's constructivist geometric language), used to support "person as lens" (BRIEF axis 4) rather than as decoration. No anti-features surfaced in research beyond the general portfolio pitfall of a low-quality or inconsistent-crop headshot undercutting the craft signal the rest of the site is making.

---

## Surface 7: Contact Block (obfuscated email, GitHub, LinkedIn)

### Email obfuscation: what actually works, and how visitors experience it

Cross-referencing *A List Apart*'s "Graceful E-Mail Obfuscation," Cloudflare's Scrape Shield documentation, and a 2026-dated survey of current obfuscation methods, the field has converged on a small set of effective, low-friction techniques and has moved past several that used to be common:

**Effective, low-friction (recommended):**
- **CSS-decoy + JS-constructed mailto:** the visible HTML contains no plain address (defeats casual scrapers, which mostly parse raw HTML), and a small script constructs a normal `mailto:` link at load or on click. The visitor experiences this as an ordinary email link — no extra click, no CAPTCHA, no visible obfuscation artifact.
- **Copy-to-clipboard affordance alongside the mailto link:** a "copy email" button with a brief "copied" confirmation. Recruiters frequently want to paste an address into an ATS or CRM rather than open a mail client — offering both behaviors costs almost nothing extra and covers both use cases.

**Declining/ineffective as sole protection:**
- Plain ROT13 or ad-hoc text substitution (`name [at] domain [dot] com`) with no working link behind it: visible to humans but doesn't behave like a link, so the visitor has to retype it manually — real friction for someone clicking through a shortlist of forty tabs.
- Image-based email addresses: breaks copy-paste entirely and is an accessibility failure — a bad match for a site whose whole premise is legible typography.
- CAPTCHA-gated reveal: adds a disproportionate friction step for the payoff. BRIEF axis 1 already establishes this site cannot afford to make visitors "earn" access to anything; a CAPTCHA on the contact block is exactly that mistake applied to the one interaction the whole site exists to trigger.

| Category | Item | Complexity | Notes |
|---|---|---|---|
| Table stakes | Address not present as plaintext in initial HTML; resolves to a working mailto: link in 0–1 clicks | LOW | Solved, well-documented pattern |
| Table stakes | GitHub and LinkedIn as plain, direct links | LOW | No obfuscation needed for these |
| Differentiator | Copy-to-clipboard button alongside the mailto link | LOW | Covers the "paste into ATS" use case with near-zero added cost |
| Anti-feature | CAPTCHA or multi-step reveal | — | Disproportionate friction for a 90-second-scan audience; contradicts axis 1 |
| Anti-feature | Image-based address | — | Breaks copy-paste and accessibility |
| Anti-feature | Contact form | — | Already ruled out in PROJECT.md — an obfuscated email address does the same job with no backend |

**Complexity:** LOW. No dependencies on any other surface — this can ship independently and first, since it de-risks nothing else and blocks nothing else.

**Confidence:** HIGH. Multiple independent, technically-detailed sources (A List Apart, Cloudflare docs, a dedicated 2026 comparison of current methods) converge on the same recommendation.

---

## Feature Dependencies

```
Case Study (ib-gdp-evolution)
    └──is the destination for──> Work List's featured/top entry
    └──is the referent of──> the one positioning sentence

Work List (n=3)
    └──requires──> Case Study to exist (for its lead entry)
    └──requires nothing further for──> the other 1–2 entries (just live URLs)

Writing Index
    └──requires──> series-grouping metadata decided before/during content migration
                       └──requires──> migrated posts to preserve working canonical URLs

CV Page
    └──references, does not duplicate──> Case Study, Work List
    └──requires──> print stylesheet or PDF export path

Backlog
    (no dependencies on other surfaces — pure static content)

Contact Block
    (no dependencies — can ship first, independently)
```

### Dependency notes

- **Work List requires Case Study:** the list's top/featured entry is a link into the case study, not a parallel description of the same project — writing them out of order risks duplicating content that then has to be reconciled.
- **Writing Index requires a grouping decision before migration:** deciding flat-reverse-chron vs. grouped-by-series after the 13 posts are already migrated means re-touching every file to add series metadata; decide first.
- **CV references but does not duplicate Case Study/Work List:** a content-allocation dependency, not a technical one — CV entries for ib-gdp-evolution and Watch People Die should be a line and a link, not a re-description.
- **Backlog and Contact Block are the only two fully independent surfaces** — lowest technical risk, safest to build/ship early to de-risk the pipeline (CMS/content routing) before the harder writing problems (case study, writing index) are tackled.

---

## MVP Definition

### Launch With (v1) — matches PROJECT.md's committed scope

- [ ] Case study for ib-gdp-evolution, structured as: question → expectation → data reveal → pivot → shipped link → methodology note — essential because it is the only artifact that can address BRIEF's "weakest link" (editorial judgment)
- [ ] Work list (n=3) as a vertical, typographic list with one-line judgment-signaling annotations, no thumbnails, no grid — essential to avoid the "looks empty at low n" failure the brief already ruled out
- [ ] Backlog with name + rich-text description, curated short, placed subordinate to the finished work — essential per explicit user decision; ship with the risk named, not resolved
- [ ] Writing index with the ~13 legacy posts grouped by series (security headers, Git) plus the standalone TypeScript post, with a framing line at the top — essential to prevent "abandoned" reading at effectively zero added engineering cost
- [ ] CV as an HTML page with a print/PDF path, content scoped to verifiable facts only — essential per allocation principle and reinstated per explicit user decision
- [ ] Photograph, consistent with the visual system
- [ ] Contact block: obfuscated email via CSS-decoy + JS-constructed mailto plus copy-to-clipboard, direct GitHub/LinkedIn links — essential, lowest complexity, no dependencies

### Add After Validation (v1.x)

- [ ] Post-type taxonomy for writing (already Out of Scope per PROJECT.md — trigger: writing volume grows past the flat-index threshold)
- [ ] Backlog states/dates if the "wishlist" reading proves to be a real problem post-launch (trigger: direct feedback or the user's own discomfort with how it reads)

### Future Consideration (v2+)

- [ ] Rendering the backlog as literal encoded data/chart (BRIEF §7's original resolution to the chart-signifier trap) — only viable if dates/states are added first
- [ ] Case studies surfaced directly on the landing view (BRIEF's v2 staged configuration)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---|---|---|---|
| Case study (ib-gdp-evolution) | HIGH | HIGH (writing effort, not technical) | P1 |
| Work list (n=3) | HIGH | LOW | P1 |
| Writing index, grouped by series | MEDIUM | MEDIUM | P1 |
| CV HTML page + print path | MEDIUM | LOW–MEDIUM | P1 |
| Contact block (obfuscated email, copy button) | MEDIUM | LOW | P1 |
| Backlog (as scoped: no dates/states) | MEDIUM (accepted risk) | LOW | P1 |
| Photograph | LOW | LOW | P1 |
| Backlog with states/dates or as chart | HIGH (resolves the accepted risk) | MEDIUM | P3 |
| Post-type taxonomy for writing | LOW at current volume | MEDIUM | P3 |

## Sources

- [BRIEF.md](file:///Users/guillem/vault/projects/personal/guillem-web/BRIEF.md) — repo root, 24-site scan, repertory grid, evidence audit, anti-goals (primary context, not re-derived here)
- [.planning/PROJECT.md](file:///Users/guillem/vault/projects/personal/guillem-web/.planning/PROJECT.md) — committed v1.0 scope
- [notes.md](file:///Users/guillem/vault/projects/personal/guillem-web/notes.md) — inspiration sites with user annotations (p5aholic.me list pattern, itssharl.ee restraint)
- [The Pudding — Making Internet Things, Part 1](https://pudding.cool/process/how-to-make-dope-shit-part-1/)
- [Storybench — How The Pudding structures stories as visual essays](https://www.storybench.org/pudding-structures-stories-visual-essays/)
- [Data Sketches](https://www.datasketch.es/) and [Nightingale — Drawing Out 'Data Sketches'](https://medium.com/nightingale/drawing-out-data-sketches-58da7e6fd824)
- [FlowingData — process series, "Great expectations"](https://flowingdata.com/2026/06/18/process-393-expectations) (existence and framing confirmed via search; full text not retrievable, 403)
- [Derek Sivers — How and why to make a /now page](https://sive.rs/now2)
- [nownownow.com](https://nownownow.com/) / [IndieWeb — now](https://indieweb.org/now)
- [My Dead Projects](https://mydeadprojects.com/) — project-graveyard genre
- [A List Apart — Graceful E-Mail Obfuscation](https://alistapart.com/article/gracefulemailobfuscation/)
- [Cloudflare — Email Address Obfuscation](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/)
- [spencermortensen.com — Email address obfuscation: what works in 2026?](https://spencermortensen.com/articles/email-obfuscation/)
- General portfolio-pattern and HTML-vs-PDF-resume search synthesis (multiple sources, no single canonical citation — see WebSearch results in session)

---
*Feature research for: guillem-web v1.0 committed surfaces*
*Researched: 2026-08-29*
