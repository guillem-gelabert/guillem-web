# guillem-web — Design Brief

**Status:** Brief only. Elicited 2026-08-28. No design or build authorised by this document.
**Gate:** `goals.md` — "don't build the site before the work exists." ib-gdp-evolution and
Watch People Die exist but are not shipped or distributed. The gate is *shipping*, not existence.

---

## 1. The allocation principle

**The site says what the CV can't.**

Development is the strongest suit and the least in need of advertising — there is already a
developer CV that carries it. Spending scarce landing-page surface on engineering claims is
spending it on the one thing already proven elsewhere.

So engineering moves from *stated* to *demonstrated*: a site that is well built demonstrates
the dev skill without a sentence about it. That frees the entire copy budget for the three
things a developer CV structurally cannot show:

- subject knowledge (economics, commodities, environment, geography)
- editorial judgment (what's worth asking, what the angle is)
- design intuition (visual form, typography, restraint)

This principle overrides the earlier axis-3 answer of "Subject + Engineer." Engineer is the
substrate, not the message.

---

## 2. The claim

Not "generalist" — that word reads as no depth anywhere, and it is exactly what a skill list
looks like when someone is bluffing. Nobody in the reference scan who pulls this off uses it.

The claim, stated as a mechanism:

> A developer who holds the data, the visual form and the argument in one head — so the form
> can change in response to what the data turns out to be.

Why this survives scrutiny: a newsroom can hire a designer *and* a developer, but that pair
converges on the design that was drawn. The comp becomes the spec and the data has to fit it.
One person doing both discovers the form while exploring the data. That is not the same work
done faster — it is a different set of reachable outcomes, and it cannot be replicated by
hiring two people.

The weaker version to avoid: "fewer round trips, fewer pitfalls." That is a procurement
argument. It is the case for a cheaper contractor, and a newsroom optimising for cost will
hire the cheaper specialist instead.

**Evidence requirement:** this claim is not believable as an assertion — it is indistinguishable
from a designer's mood board until the moment it happened is shown. The artifact that carries
it is the case study: here is what I expected, here is what the data actually was, here is how
the visual form changed because of it. This is why the writing is load-bearing rather than
decorative.

---

## 3. Audience

Graphics editors, newsroom leads, studio principals, recruiters. Roughly 90 seconds, forty
tabs open, scanning a shortlist.

Their job-to-be-done: *when I'm shortlisting for a viz role, I want to tell quickly whether
this person has editorial judgment as well as craft, so I can decide whether to open a longer
conversation.*

---

## 4. Elicited constructs (repertory grid, own vocabulary)

Five bipolar axes, generated from triads of real sites rather than supplied.

| # | Axis | Position |
|---|------|----------|
| 1 | page must earn attention ↔ reputation already earned it | **Forced to "earn"** — not a free choice |
| 2 | static ↔ fancy | Launch **Typographic**, move to Responsive, then Performative |
| 3 | technical / scientific ↔ narrative / journalistic | **Subject-led**, engineering implicit (see §1) |
| 4 | work first ↔ person first | **Person as lens** |
| 5 | blog buried ↔ blog surfaced | Target **Primary**; launch constrained by volume (see §6) |

**On axis 1.** Samora ships nine words because pudding.cool carries him; Xaquín has been stale
since 2017 because the Guardian byline is the argument. Both spend reputation they already
hold. Applying *into* those rooms rather than from inside them means the "you know who I am"
pole is a posture that can be imitated but not funded — it reads as aloof rather than
confident. This is a constraint, not a preference.

**On axis 2.** The four levels: Plain (Samora) → Typographic (Corum, Muth) → Responsive
(Will Chase) → Performative (itssharl.ee, p5aholic). The current `REQUIREMENTS.md` hero —
full-screen condensed type expanding on scroll — is Performative, i.e. the end state specified
as the starting state.

The staged answer resolves the "fancy" problem by itself: *fancy is earned when it arrives
after the work rather than instead of it.* Same adjective, opposite verdicts, depending on
whether there is something underneath.

---

## 5. Design principles

Each is a genuine trade-off — the discarded half is also good.

1. **Legibility at low n over impressiveness at high n.** The layout must not look empty with
   three items. This disqualifies card grids and three-across feature rows, and favours lists,
   a single featured piece, and prose.
2. **Demonstrated over stated.** Engineering and design intuition are shown by the artifact
   working well; they are never claimed in copy.
3. **Earned motion over introduced motion.** Visual sophistication arrives after the work that
   justifies it, not before.
4. **Subject range over skill range.** Breadth of curiosity is the differentiator; breadth of
   tooling is what every dev portfolio already lists.
5. **Honest in-progress over polished-and-frozen.** A visible working state beats a static
   portfolio that hasn't moved in a year.

---

## 6. The content constraint

The site is content-limited, and the axes move as the content grows. Any design that only
works at high volume is disqualified at launch; any design that only works at low volume is
disqualified later.

**Current inventory:** 2–3 interactive projects. 2–3 case studies planned, none written.
A large backlog of started/intended work. Legacy blog posts (security headers series, Git
series, TypeScript) plus planned TILs, case studies, article commentary, how-tos.

This directly qualifies the axis-5 answer. A blog-primary homepage in the Grossenbacher mould
works because his is years deep; the same structure with three posts reads emptier than a
one-pager with three projects. Blog-primary is the *target* configuration, not the launch one.

### Staged configuration

| | Content state | Structure | Axis 2 |
|---|---|---|---|
| **v1** | ~3 projects, 0–1 case studies | One sentence, one featured piece, short vertical list of work, backlog section, legacy writing index | Typographic |
| **v2** | ~6–8 items, 2–3 case studies | Case studies surfaced on the landing view; writing gains categories | Responsive |
| **v3** | 12+ items, regular cadence | Blog-primary, reverse-chron, Grossenbacher structure | Performative elements, earned |

---

## 7. Two proposed sections

**Backlog / currently working on.** Rare — almost nobody in the 24-site scan does this — and it
solves the exact structural problem: breadth of interest is the claim, and there is a lot of
started work and little finished work. A backlog converts an inventory of unfinished things
into evidence of range.

- *Risk:* a backlog that never moves becomes evidence of not finishing — the worst available
  reading. Mitigate with visible state changes, dates, or a shipped column, so it reads as a
  working log rather than a wishlist.
- *Opportunity:* a backlog with states is real data. It is the one object on the site that can
  legitimately be rendered as a chart, which resolves the ornament problem in §8 without
  needing decoration to pretend.

**Now playing / recently played.** Cheap, serves axis 4 (person as lens), and proves the site
is maintained. Also the most generic element proposed — it is a well-worn dev-portfolio trope
and adds nothing to the subject or judgment claims. Mildly in tension with "not distracting."
Keep small, or defer to v2.

---

## 8. Aesthetic direction

### Principle (carries weight)

Constructivism is the shared ancestor of the poster and the chart — geometric primitives, flat
colour, diagonal axes, type as structural element. *Beat the Whites with the Red Wedge* is
essentially a chart. The tradition was explicitly about information as a public instrument,
which is about as close to a data journalist's premise as an art movement gets.

Stated as one line: **the site's visual language and the charts come from the same source.**

### Constraints (real, but not a point of view)

Familiar aesthetics; easy geometric forms and type; easy to animate; easy to generate; not
distracting. These are cost arguments — decision principle #1, "minimise effort for the
result" — and belong in the brief as constraints, not as design rationale.

### The one trap

Compositions that adopt *chart signifiers specifically* — axes, ticks, plotted points, anything
implying an encoded scale — invite being read as charts by this audience. If they encode
nothing, the result is something that looks like information and isn't, in front of people
trained to notice. Pure geometry (wedges, diagonals, planes, type) does not carry this risk.

Two clean resolutions: make generative work encode something real (see the backlog, §7), or
keep geometry unmistakably ornamental. The dangerous middle is decoration with axes.

---

## 9. Anti-goals

The specific wrong conclusions, in order of likelihood:

1. **"Talented front-end dev, no editorial judgment."** The default reading given the CV, and
   the one the site exists to prevent.
2. **"Nice art project, can't ship."** What a performative hero over thin work produces.
3. **"Looks like data, isn't."** Chart signifiers with nothing encoded (§8).
4. **"Started a lot, finished nothing."** The backlog failure mode (§7).
5. **Generic developer portfolio.** Already identified in `notes.md`; the weakest of the five
   because it's the easiest to avoid.

---

## 10. Evidence audit

Every quality to be conveyed, paired with the artifact that proves it.

| Claim | Proof artifact | Status |
|---|---|---|
| Technical craft | The site itself, working well | Available at build time |
| Design intuition | The site itself, plus visual form of the pieces | Available at build time |
| Can ship interactive data work | 2–3 live projects | Exists, not distributed |
| Form responds to data | Case-study posts | **None written** |
| Subject knowledge / curiosity | Volume and range of writing; backlog | Thin — accumulates over time |
| Editorial judgment | A published piece with a stated angle | **Weakest link** |

The two gaps are the same gap: judgment is only visible in published work with a point of view.
Nothing in the visual design can substitute for it.

Consequence for `REQUIREMENTS.md`: **`POSI-03`** asks a visitor to infer curiosity across
economics and the environment from a first-screen experience. That was never satisfiable by a
hero — subject credibility cannot be asserted, only accumulated. Either move it out of v1 or
change the v1 surface to something that can carry it.

---

## 11. Conflicts with current planning docs

- `REQUIREMENTS.md` MVP = hero + GitHub link only, justified by "no finished data story yet."
  Two pieces exist; the justification is stale.
- Blog is under Out of Scope / `BLOG-01` (v2). The elicited answers make writing the engine of
  the site, not a later addition.
- `INTX-01` (scroll-driven hero transformation) is a Performative-tier feature specified for
  v1, against the staged axis-2 answer.
- `POSI-03` is unsatisfiable as scoped — see §10.

None of these are resolved here. They are listed so the conflict is deliberate rather than
discovered mid-build.

---

## 12. Open questions

- Domain and folder — `guillem-web` vs `guillemgelabert`, `guillemgelabert.com` vs
  `guillem.ch`. Already on the kanban.
- Does a Pudding byline, if it lands, change the positioning enough to redo §2?
- Does "now playing" survive contact with the restraint principle?
- What is the first case study, and which of the two existing pieces does it cover?

---

## Method

Repertory grid (Kelly) over four triads drawn from a 24-site scan of data journalists, viz
developers, and creative developers; laddering on the aesthetic decision; positioning by
mechanism rather than attribute. Constructs are in Guillem's own words, not supplied.

*Scan caveat:* Federica Fragapane and Krisztina Szűcs block automated fetching and were not
verified. Xaquín G.V. is at `xocas.com` (HTTP only). Russell Goldenberg now publishes as
**Russell Samora** at `russellsamora.github.io`; the old domain is stale. Treat the scan as a
map, not as verified ground truth — spot-check before leaning on any single entry.
