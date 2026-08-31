# Phase 5: Backlog - Context

**Gathered:** 2026-08-31
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase fills the backlog section that Phase 3 built as a stub on the landing view.
Concretely: a curated set of in-motion work as name plus rich-text description, a single
section-level "last touched" date, and the data module both live in.

It is a content-and-curation phase wearing a thin layer of markup. The section element,
its heading, its anchor, its `scroll-margin-top` and its slot in the contents nav all
already exist from Phase 3 — Phase 5 replaces what is inside it and nothing else.

**Locked by explicit user decision, not reopened here:** the date is section-level only.
No per-item dates, no per-item states, no status badges, no progress indicators, no
state machine. `RICH-02` (reading the backlog as encoded data or a chart) is v2 and
depends on exactly the per-item data that is ruled out.

**Not in this phase:** the case study (Phase 4), CV and contact content (Phase 6), any
change to the writing pipeline or `content/`, any change to the work list, a German
backlog (the landing view is English-only — Phase 3 UI-SPEC §*Locale posture*).

</domain>

<decisions>
## Implementation Decisions

### Curation — what qualifies and how much

- **D-01: An item qualifies only if it satisfies both conditions — in motion *and*
  range-widening.** In motion means Guillem has actually touched it recently, not that it
  exists as a repo. Range-widening means it extends past what the two work-list pieces
  already show, on subject, medium, or kind of thinking. Either condition alone fails:
  something in motion that repeats a shipped piece's subject adds nothing to the range
  claim, and something that would widen the range but has not been touched is an
  intention — and intentions are precisely `BRIEF` §9 anti-goal #4, the wishlist read.

- **D-02: Three items. Hard ceiling of four.** Two reads as thin sitting directly beneath
  a two-item work list and invites the "is that all?" conclusion; five or more stops
  being a curation and becomes a task list, which is the wishlist failure by volume
  rather than by tone. Three is the smallest count that can demonstrate range across two
  axes of difference. The ceiling is a contract: a fourth item entering means an existing
  one leaves.
  - **Honest degradation, and the one permitted exception:** if only two items can be
    grounded in real current work, the section ships with two and the gap is recorded.
    A third item is never invented. This is a public page during a job hunt making a
    claim about a real person's current work; a fabricated item is a liability, not a
    placeholder.

- **D-03: Four exclusions, named so the list stays a curation.**
  1. Client and employer work that cannot be described publicly.
  2. Maintenance, chores, config and infrastructure work — true, and it argues for
     nothing the audience is deciding on.
  3. Anything whose honest verb is "would like to" rather than "am".
  4. This site itself, and its own v2 backlog. A site that lists itself as
     work-in-progress tells the reader it is unfinished, in a section whose whole job is
     to read as deliberate.
  - **Plus, carried from Phase 3 `D-04`:** the finished-but-excluded repositories
    (Mallorca campaign site, popup simulator, Mazzucato summary) do not re-enter here.
    The backlog is not an overflow shelf for work the work list turned down. If one of
    them is genuinely in motion again it qualifies under `D-01` on its own merits, not by
    consolation.

- **D-04: Order is a fixed hand-set editorial order, widest-range-first — and it is just
  the array order in the data module.** Not alphabetical (arbitrary, and it reads as
  machine-sorted). Not recency: recency is a per-item date wearing a different hat and is
  ruled out. The first item is the one that most extends the range beyond the two
  work-list pieces, because a ninety-second scan may read only the first. The order is
  editorial, not a ranking, and it is not rendered as ordinals — see `D-11`.

### Content shape and source of truth

- **D-05: Items live in a single typed data module, `lib/backlog.tsx`. Not in
  `content/`, not in the component.** Phase 3 `D-05` already set this precedent for
  `lib/work.ts` and its principle applies verbatim: adding or dropping an item must be a
  content change, not a layout change.
  - **Why not Phase 2's content pipeline, explicitly.** `lib/content.ts` enumerates every
    `content/*.md(x)` file and everything it finds surfaces in the writing index. Backlog
    items are not writing pieces: they have no `title`/`standfirst`/`date`/`lang`/
    `translationKey`, and three of them landing in a one-entry editorial front page would
    wreck Phase 2 `D-10`'s index treatment. Routing them through it means either
    polluting the index or bolting an exclusion filter onto a shipped, tested loader —
    a change to working code for content that shares none of its schema.
  - **`.tsx`, not `.ts`, and that is the whole reason:** the description field is a React
    node (see `D-07`). `content/` and `lib/content.ts` are not touched by this phase.

- **D-06: Each item carries exactly two fields — `name` and `description`. That is the
  entire schema.** `BACK-01`'s wording is the contract and nothing is added to it. No
  date, no status, no state, no tag, no progress value, no ordinal field (order is array
  order per `D-04`).

- **D-07: No `href` field on an item, deliberately.** If a link is warranted it lives
  inline inside the description as running prose. Two reasons: an optional href produces
  two visual states for an item name — linked and unlinked — which is a per-item status
  indicator by another route, exactly what the user ruled out; and a title-as-link on
  unfinished work invites a click that disappoints, which is worse than no link.

- **D-08: "Rich text" means one paragraph of inline-only content.** Body role at the
  `65ch` measure, two to three sentences, authored as JSX in the data module and
  restricted by contract to `<em>`, `<strong>` and `<a className="link">`. No block
  elements: no headings, no lists, no figures, no code, no second paragraph. An item that
  needs any of those is a piece of writing and belongs in `content/`, not here.
  - **`.link` is already the settled answer** — Phase 3's UI-SPEC shipped that class
    explicitly naming "Phase 5's backlog descriptions" as its first real consumer. Do not
    invent link styling; do not reach for `.prose-site`.
  - **Copy rule, inherited and non-negotiable:** each description says what the thing is
    about and what question it is pursuing. Never what it is built with (`PROJECT.md`
    allocation principle), never a plan, never a date, never a completion estimate.

- **D-09: The section date is a hand-set `LAST_TOUCHED` ISO constant in the same module,
  guarded two ways so it cannot quietly become a lie.**
  1. **Build-time validation**, mirroring `assertFrontmatter`'s fail-loud posture in
     `lib/content.ts`: it must match `YYYY-MM-DD` and must not be in the future, or
     `next build` fails.
  2. **A repo test** at `tests/unit/` (the `node --test` suite already exists) that reads
     `git log -1 --format=%cs -- lib/backlog.tsx` and fails when the newest commit
     touching the module is later than `LAST_TOUCHED`. It skips cleanly when git metadata
     is unavailable, so it never breaks a Railway build.
  - **Effect:** the items cannot change without the check catching a stale date, while
    the date can still be advanced by hand when the *work* moved but the copy did not —
    which is what "last touched" actually means.
  - **Rejected: deriving the date from git entirely.** It would silently redefine the
    field as "when I last edited this file", which is a subtler lie than a stale date,
    and it breaks under shallow clones.
  - **Rejected: the honour system.** This is the single field `BACK-02` exists for. A
    stale freshness claim is worse than no freshness claim.

### Presentation inside Phase 3's slot

- **D-10: A vertical list using the work list's row grammar.** `<ul role="list">` (the
  `list-style: none` / Safari semantics reason from Phase 3's accessibility contract),
  one item per row, `gap-xl` between rows, rows separated by the shipped 1px
  `--color-rule` separator with `padding-top: xl`. Within a row: name at `.text-standfirst`,
  `gap-sm`, description at `.text-body max-w-prose`. No card, no grid, no box, no border,
  no background tint — `PROJECT.md` Out of Scope names card grids directly.

- **D-11: The backlog is distinguished from the work list by three subtractions and no
  additions.**
  1. **No ordinals.** The work list's `01`/`02` are what mark it as a finished, ranked
     set. The backlog is unranked and gets none.
  2. **No destination host line.** Backlog items go nowhere; there is no host to name.
  3. **The name is plain text, not `.link-quiet`.** It is not a link.
  - So the backlog reads as the same list grammar with its affordances stripped, which is
    what "in progress" looks like without anyone having to say it. **No new type role, no
    new colour, no new rule weight, no badge, no icon.** This is also the load-bearing
    reason nothing here is a per-item status marker: the absence *is* the marker, and it
    is uniform across all items.

- **D-12: The date sits directly beneath the section head's rule, above the first item.**
  One `.text-label` line, `<time dateTime={LAST_TOUCHED}>` wrapping
  `formatPostDate(LAST_TOUCHED, "en")` exactly as `components/post-meta.tsx` does.
  Structure: the existing `<section class="flex flex-col gap-lg">` keeps its `<h2>`, then
  holds one `<div class="flex flex-col gap-lg">` carrying the date line and the list — so
  head→date and date→list are both `lg`. On-grid, no new token.
  - **Above the items, not below them, and that is the whole point.** `BACK-02` is the
    mitigation the user accepted in place of per-item dates (`REQUIREMENTS.md` Out of
    Scope: "partially mitigated by the section-level date"). A freshness signal only
    mitigates the wishlist read if it is read *before* the list, not discovered after it.
  - **Copy:** `Last touched 30 August 2026` — Label role renders it uppercase.
  - **Absolute date, not relative.** A build-time relative string ("three weeks ago")
    freezes at deploy and turns false as the deployment ages; a client-side one costs JS
    for one line on a page that ships none. An absolute date stays true forever and the
    reader does the arithmetic.

- **D-13: There is no empty state — by construction, exactly as Phase 3 ruled for the
  work list.** `lib/backlog.tsx` ships with real items; an empty array fails the build.
  Phase 3's backlog stub copy (`Nothing listed here yet.` / `The current work is being
  written up.`) is **deleted from the backlog section rather than kept as a fallback** —
  a branch that can never render is dead code that a later reader will mistake for a
  supported state. `SectionStub` itself stays in the tree for `#contact` until Phase 6.
  - **Launch gate:** Phase 3's UI-SPEC blocks `FIND-02` if any of its four interim
    surfaces is still interim. Phase 5 clears the backlog leg and must say so by name in
    its verification record, so Phase 6 inherits an accurate gate.

### Copy ownership

- **D-14: Item copy is drafted by the executor, not blocked on the user** — the Phase 3
  `D-09` posture (work-list annotations were drafted for the user to edit), not the
  `D-08` posture (the positioning sentence, which only the user can write). Backlog
  descriptions are descriptive rather than self-positioning and can be grounded by
  reading what is actually in the repos.
  - **Grounding is mandatory.** Every item must trace to real, checkable current work.
    Where evidence runs out, `D-02`'s honest degradation applies — ship two, never invent
    a third.
  - **Tripwire, in the shape Phase 3 established for `HOME-01`:** drafted item copy is
    marked as drafted-for-review in source, and it must be re-asserted in carried-forward
    state until the user has reviewed it. It must not reach Phase 6's `FIND-02` flag flip
    unreviewed. This is the same failure mode as the positioning-sentence tripwire — the
    section *looks* finished, so no visual pass will catch it.

### Claude's Discretion

- The specific three items, their names, and their description prose — subject to `D-01`
  qualification, `D-03` exclusions, `D-08`'s inline-only shape, and `D-14`'s grounding
  requirement.
- The initial `LAST_TOUCHED` value (the date the phase ships is the correct default).
- Whether the row separator is a `<hr>` or a CSS `border-top`, matching whatever Phase 3
  chose for the work list — consistency with the adjacent list wins over either form.
- Whether `lib/backlog.tsx` exports one object or two named exports (items and date).
- Exact wording of the build-time validation error message.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The slot this phase fills
- `.planning/phases/03-work-list-landing-skeleton/03-UI-SPEC.md` — **read before writing
  any markup.** The `<section id="backlog">` skeleton and its `gap-lg` shape; the
  `SectionStub` component and the stub copy this phase removes; the `.link` class, shipped
  naming this phase as its consumer; the `.link-quiet` class this phase deliberately does
  *not* use; the spacing table, typography table and the four-role budget; the
  accessibility contract (`role="list"`, focus rings, 24×24 targets); the launch gate.
- `.planning/phases/03-work-list-landing-skeleton/03-CONTEXT.md` — `D-02` (stubs are real
  surfaces later phases *fill*, they do not create them), `D-05` (entries are data, not
  markup), `D-04` (curation, and which repos are excluded), `D-09` (drafted-copy
  precedent).

### The shipped design system
- `app/globals.css` — the `@theme` block is the source of truth. Four type roles, two
  weights, seven spacing tokens, and exactly five colours: `paper`, `ink`, `accent`,
  `surface-code`, `rule`. **There is no muted-ink token** — a greyed date is not
  available and must not be invented. Accent stays on focus rings and link hover.
- `.planning/phases/01-deploy-foundation-design-system/01-UI-SPEC.md` — the design
  contract every surface conforms to.
- `.planning/phases/02-content-pipeline/02-UI-SPEC.md` — the prose contract, and the
  rule-weight budget `D-11` must not extend.

### Code this phase reads or mirrors
- `components/post-meta.tsx` — the `<time dateTime>` + `formatPostDate` pattern `D-12`
  reuses.
- `lib/locales.ts` — `formatPostDate`. Note the `UI` copy map is for the *bilingual*
  writing surfaces; landing copy does not go there (Phase 3 UI-SPEC: the landing is
  English-only, so its copy lives in the landing modules).
- `lib/content.ts` — `assertFrontmatter` is the fail-loud validation posture `D-09`
  mirrors. **The module itself is not modified by this phase.**
- `lib/work.ts` (Phase 3) — the data-module shape `lib/backlog.tsx` copies.
- `tests/unit/` + `package.json` `test:unit` (`node --test`) — where `D-09`'s freshness
  check lands.

### Requirements and direction
- `.planning/REQUIREMENTS.md` — `BACK-01`, `BACK-02`. Out of Scope names "per-item backlog
  dates or states" as an explicit user decision. `RICH-02` is v2 and is the thing that
  would need them.
- `.planning/PROJECT.md` — the Key Decisions row *"Backlog items carry name and rich-text
  description only — no dates, no states"*, flagged ⚠️ Revisit with the accepted risk
  written out. This phase's job is to make that risk not materialise through curation and
  the section date, **not** by reopening the decision.
- `BRIEF.md` — §9 anti-goal #4 (reading as a wishlist) is the single failure mode this
  phase is designed against; §5 design principles; §8 the "looks like data, isn't" trap,
  which is why no item gets a progress bar, meter, or any mark implying an encoded scale.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SectionStub` (Phase 3) — currently renders the backlog placeholder. This phase stops
  using it at `#backlog` and leaves it serving `#contact` until Phase 6.
- `lib/work.ts` (Phase 3) — the exact analogue for `lib/backlog.tsx`.
- `formatPostDate` (`lib/locales.ts`) and the `<time dateTime>` markup in
  `components/post-meta.tsx`.
- `.link` (Phase 3) — shipped for these descriptions; `.text-standfirst`, `.text-body`,
  `.text-label`, `max-w-prose`, and Phase 3's `.section-head` are all already in place.
- `assertFrontmatter` (`lib/content.ts`) — the build-time validation shape to mirror.
- `tests/unit/` under `node --test`, plus the Playwright suite in `tests/` for a rendered
  assertion of the section.

### Established Patterns
- Content is data modules or files in the repo; no CMS, no backend, no second source of
  truth (Phase 2 `D-11`).
- Entries are data, layout is fixed (Phase 3 `D-05`).
- Landing surfaces are Server Components; **no `<button>` ships on any landing surface**
  and nothing on this section is interactive.
- `<ul>`/`<ol>` carry `role="list"` because `list-style: none` drops list semantics in
  Safari.
- Malformed content fails `next build` rather than a visitor's request; there is no
  runtime error state on the landing view.
- Deploy-first increments (Phase 1 `D-08`) — every commit leaves the Railway URL working.
- Copy never claims engineering.

### Integration Points
- `app/(en)/page.tsx`, `<section id="backlog">` — the only mount point. Its `id`,
  `aria-labelledby`, `scroll-margin-top` and contents-nav entry (`Backlog → #backlog`)
  already exist. **No navigation change is needed and none should be made.**
- `lib/backlog.tsx` — new, and the only new module this phase should need.
- The Phase 3 launch gate — Phase 5 clears the backlog leg for Phase 6's `FIND-02`.
- **No touchpoint with `content/` or `lib/content.ts`.** If a plan proposes editing the
  writing pipeline, it has taken a wrong turn.

</code_context>

<specifics>
## Specific Ideas

- The backlog is the work list with its affordances subtracted — same row grammar, no
  ordinals, no host, no link. The visitor should feel the difference without being told
  it, and nothing needs a badge to say "in progress".
- The section date goes above the list because it is the accepted substitute for per-item
  dates, and a substitute that is only discovered after the reader has already formed the
  wishlist impression has not substituted for anything.
- `.link` exists because Phase 3 anticipated this exact copy. Using it is conformance,
  not a new decision.
- Three items, each differing on a real axis, is the whole argument. A hiring manager
  should be able to pick one and ask about it in an interview.
- Absolute dates over relative ones, everywhere on this site: a static build cannot keep
  a relative date honest.

</specifics>

<deferred>
## Deferred Ideas

### Per-item dates, states, and progress — permanently out for v1
Explicit user decision, logged in `PROJECT.md` Key Decisions and `REQUIREMENTS.md` Out of
Scope. Not reopened by this phase, and not to be reintroduced as badges, meters, ordering
by recency, or an optional link that only some items carry.

### `RICH-02` — the backlog as encoded data or a chart — v2
Depends entirely on the per-item data above. Recorded so the dependency stays visible: if
the user ever reverses the per-item decision, `RICH-02` becomes reachable and not before.

### German backlog (`/startseite`) — deferred with the German landing
`I18N-01` is scoped to writing and is complete. Phase 3 recorded `/startseite` as the
cheap future shape for a German landing; a German backlog rides along with it if it ever
happens. Nothing here should be pre-localised into `lib/locales.ts`'s `UI` map.

### A fourth and fifth item — future
`D-02`'s ceiling is four. Past that the section needs a different treatment, the same way
Phase 2 `D-10` recorded that the writing index's front-page treatment does not scale past
roughly five entries.

### Linking a backlog item to a live artifact — future
When an item ships it stops being backlog and becomes work-list or writing. That
migration path exists and costs nothing; it is not a Phase 5 feature.

</deferred>

---

*Phase: 05-backlog*
*Context gathered: 2026-08-31*
