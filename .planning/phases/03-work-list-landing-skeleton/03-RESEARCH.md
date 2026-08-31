# Phase 3: Work List & Landing Skeleton — Research

**Researched:** 2026-08-31
**Domain:** Next.js 16 App Router composition (server/client boundary, route metadata), Tailwind v4 utility generation, an already-shipped scroll-driven `text-shadow` trail system
**Confidence:** HIGH — almost every claim below was **measured in this repo today**, against the running dev server, a real Chromium page, and a direct Tailwind v4 compile. Where a claim is only reasoned, it is tagged.

> **Method note.** This phase has an *approved* UI-SPEC (`03-UI-SPEC.md`, status `approved`) and a
> locked CONTEXT. Research here is therefore **how**, not **whether**. Four measurement passes were
> run: (1) a Chromium benchmark of the smear driver's per-frame cost at N registered headings,
> (2) an A/B test of the `documentTop` staleness claim, (3) a direct `@tailwindcss/postcss` compile
> to prove every utility class the spec names actually generates CSS, and (4) HTTP inspection of
> `/`, `/cv`, `/nope`, `/writing/does-not-exist` against `npm run dev`.
>
> **Two spec claims did not survive measurement.** They are named in *Corrections to the approved
> UI-SPEC* and in *Common Pitfalls*. Neither changes a visual rule; both change what the planner
> should build and test.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

Copied verbatim from `03-CONTEXT.md` `## Implementation Decisions`.

**Landing Structure**

- **D-01: Hybrid — the landing scrolls, long-form content is routed.** The positioning
  line, featured piece, work list, backlog and contact live as sections on `/`. Writing
  and the case study are real routes (`/writing`, `/writing/[slug]`) per Phase 2.
  Rationale: at two work items and one case study, several thin pages read emptier than
  one substantial page, which is PROJECT.md's stated launch risk — while long-form
  content still needs to be linkable and shareable on its own URL.

- **D-02: Unbuilt sections ship as real stub routes/sections, not omitted and not
  disabled.** `/cv` exists as a real page; backlog and contact exist as real landing
  sections. All carry placeholder content and correct metadata. Nothing 404s and nothing
  renders as visibly greyed-out or pending — a visitor in a ninety-second scan reads
  disabled navigation as an unfinished site, which is anti-goal territory.
  - Phases 5 and 6 *fill* these surfaces; they do not create them.
  - Safe to ship thin because Phase 1's `robots: { index: false }` (Phase 1 D-07) stays
    on until Phase 6.
  - **Planner note:** placeholder content must be deliberately typeset, not lorem ipsum
    and not an empty element. It is on a live URL during a job hunt.

**Work List**

- **D-03: The work list has exactly two items.** ib-gdp-evolution and Watch People Die.
  PROJECT.md's "two to three interactive projects" is resolved: it is two. HOME-04 and
  the Phase 3 success criterion were both corrected from "three" to "two" on 2026-08-29.
  - This makes the thin-layout risk sharper, not softer, and is part of why D-01 keeps
    the landing scrolling rather than routing everything out.

- **D-04: The list stays curated — finished, live work only.** Other repositories
  (Mallorca campaign site, popup simulator, the Mazzucato summary, and similar) are
  deliberately excluded. PROJECT.md's core risk is reading as a dev portfolio, and a
  longer list of uneven pieces pulls directly toward it.

- **D-05: Work-list entries are data, not markup.** Adding a third item later must be a
  content change, not a layout change.

- **D-06: Destinations are the live pieces, hosted independently.** Verified:
  - ib-gdp-evolution → `https://ib-gdp.guillemgelabert.com/<localised-slug>`
    (EN: `everyone-in-mallorca-agrees-on-one-thing`,
    DE: `auf-mallorca-weiss-es-jeder` — both HTTP 200)
  - Watch People Die → `https://watchpeopledie.live` (HTTP 200, its own domain)
  - **Hosting is per-project and has no uniform pattern.** One is an apex subdomain, the
    other is a separate domain entirely. Do not derive URLs from a rule; use these.
  - The `ib-gdp-evolution` GitHub repo is **private**. Never link to source for it.

- **D-07: The work-list entry and the featured slot point at different things.** The
  work-list entry links to the live piece on its own host. The featured slot (CASE-03)
  links to the case study at `/writing/[slug]`. They do not duplicate each other.

**Copy Ownership**

- **D-08: The positioning sentence (HOME-01) is the user's to write.** Phase 3 ships the
  layout and typography around a clearly-marked placeholder. Nothing blocks on it.
  - **Consequence:** HOME-01 cannot be verified as met at the end of Phase 3. This is
    intended, not a gap. Verification should record it as deferred-by-decision.

- **D-09: The two work-list annotations (WORK-02) are drafted for the user to edit.**
  Unlike the positioning sentence these are descriptive rather than self-positioning, and
  can be grounded by reading both live pieces. WORK-02 is therefore genuinely met by this
  phase.
  - Constraint from PROJECT.md: each annotation says what the piece is *about*, never
    what it was built with. Engineering is demonstrated, never claimed in copy.

- **D-10: The featured entry's annotation stays a placeholder until Phase 4.** Carried
  forward from the ROADMAP phase goal — the work-list *code* has no dependency on the
  case study existing; only that one line does.

### Claude's Discretion

Verbatim from CONTEXT. **All five were resolved by the approved `03-UI-SPEC.md` and are
therefore no longer open** — the resolution is recorded beside each.

- Navigation form — persistent header, in-page anchors, an index block, or a combination.
  Constraint: it must reach work list, backlog, writing index, CV and contact (HOME-03),
  and must not read as unfinished.
  → **Resolved:** in-flow contents list inside the page header. Not sticky, not fixed, no footer repeat, no skip link.
- Whether and how outbound links to independently-hosted projects are marked as leaving
  the site.
  → **Resolved:** the destination host on its own Label-role line. No arrow glyph, no icon, no `target="_blank"`.
- Section ordering on the landing view below the positioning line.
  → **Resolved:** Case study → Work → Backlog → Contact.
- Whether the featured slot is visually distinct from the work list or is the work list's
  first entry given primacy.
  → **Resolved:** a distinct section *above* the work list, not row one.
- How the heading trail (Phase 1) applies to landing section headings — Phase 1 left
  trail scope open, and this is the first phase with real headings to apply it to.
  → **Resolved:** Humane trails, Newsreader never. Two trail headings on `/`, one on `/cv`.

### Deferred Ideas (OUT OF SCOPE)

- **Positioning sentence — user-authored, no phase.** HOME-01's copy. Layout ships with a
  placeholder in Phase 3; the sentence arrives whenever the user writes it.
- **Featured annotation — Phase 4.** The one line describing the case study, per the ROADMAP phase goal.
- **Widening the work list — future.** Mallorca campaign site, popup simulator, Mazzucato
  summary and similar were considered and excluded (D-04). D-05 keeps entries as data so
  adding one later is a content change.
- **Third work item — future.** PROJECT.md anticipated "two to three". If a third finished
  piece lands, the list is already built to take it.

Additionally out of scope, from the UI-SPEC's own resolutions: a German landing view
(`/startseite`), any new npm dependency, any new type role/size/weight/face, any new
spacing or colour token, any icon or SVG, any `<button>`, Phase 1's ornamental rule grid.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

### Correction to the requirement list supplied in the task brief

The brief named **HOME-01, HOME-03, HOME-04, HOME-05, HOME-06, WORK-01, WORK-02, FIND-02**.
`ROADMAP.md` § *Phase 3: Work List & Landing Skeleton* is authoritative and reads:

> **Requirements**: WORK-01, WORK-02, HOME-01, HOME-03, HOME-04

`REQUIREMENTS.md` § Traceability agrees exactly. Three of the brief's IDs do not belong to
this phase:

| ID | Brief said | Authoritative allocation | Evidence |
|----|-----------|--------------------------|----------|
| HOME-05 | Phase 3 | **Phase 1, already complete** | `REQUIREMENTS.md` marks it `[x]`; Traceability row `HOME-05 \| Phase 1 \| Complete` |
| HOME-06 | Phase 3 | **Phase 1, already complete** | `[x]`; Traceability row `HOME-06 \| Phase 1 \| Complete`; shipped in `components/smear-heading/` |
| FIND-02 | Phase 3 | **Phase 6** | Traceability row `FIND-02 \| Phase 6 \| Pending`; ROADMAP Phase 6 Requirements line lists it |

**This matters, and not only pedantically.** FIND-02 is the `robots: { index: false }` →
indexable flip plus sitemap/robots.txt. Treating it as Phase 3 work would ship a
noindex-off site whose featured slot reads *"The case study is being written."* — the exact
condition `03-UI-SPEC.md`'s launch gate exists to prevent. **Do not touch the robots flag in
this phase.** HOME-05/HOME-06 are inherited assets to *conform to*, not to rebuild.

### The five requirements this phase actually owns

| ID | Description | Research support |
|----|-------------|------------------|
| **WORK-01** | Visitor can see a vertical list of Guillem's interactive projects. | `lib/work.ts` data module + a single-column `<ol role="list">`. Both destinations re-verified HTTP 200 today (see *Environment Availability*). Layout, markup and separator geometry in *Code Examples*. |
| **WORK-02** | Visitor can read a one-line annotation per project describing what it is about rather than what it was built with. | Both annotations are drafted in `03-UI-SPEC.md` § *The two entries and their annotations*. Both live page titles re-verified today. Voice constraint is testable as an absence assertion — see *Validation Architecture*. |
| **HOME-01** | Visitor can read a single positioning sentence on the landing view stating what Guillem does. | **Deferred-by-decision (D-08).** Ships as `POSITIONING_PLACEHOLDER = "Developer."`. See *Pitfall 6* for the one architectural change that makes the eventual real sentence a one-line edit rather than a three-file hunt. |
| **HOME-03** | Visitor can reach the work list, backlog, writing index, CV, and contact block from the landing view. | Five links: `#work`, `/writing`, `#backlog`, `/cv`, `#contact`. `/cv` **currently 404s** (measured today) — creating it is in scope. `scroll-mt-xl` verified to compile. |
| **HOME-04** | Visitor sees a landing layout that stays legible with only two work items — lists and prose, no card grids or three-across rows. | Single-column `<ol>` at every viewport. `tests/writing-index.spec.ts`'s "is not a card" computed-style assertion is the reusable proof pattern. |

Also in scope but *not* a v1 requirement of this phase: the featured **slot** (the container
for `HOME-02` / `CASE-03`, which are Phase 4's), `/cv` as a stub (`D-02`), and four bounded
amendments to shipped Phase 1/2 surfaces (`A1`–`A4`).
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

`./CLAUDE.md` (project) is short and yields three actionable directives:

| Directive | Consequence for this phase |
|-----------|----------------------------|
| **"MVP first. No polishing until the core works."** | Reinforces the UI-SPEC's own restraint. Do not add the viewport-culling guard to the smear driver (measured unnecessary — see *The smear trail at the landing view's heading count*), do not add a fifth type size, do not add `/startseite`. |
| **"Update `_pm/kanban.md` when completing tasks."** | `_pm/kanban.md` **does not exist** in this repo (verified: no `_pm/` directory). The instruction is inert. Flag it; do not create the file speculatively, and do not let a task fail its acceptance criteria on it. |
| **Goal: data journalism / data visualisation / creative dev job** | Underwrites `PROJECT.md`'s allocation principle. Every copy string in this phase is subject to "engineering is demonstrated, never claimed." |

From `~/.claude/CLAUDE.md` (user global), one directive binds output rather than code:
**answer first, no preamble, no closing recap.** Applied to this document's structure.

---

## Summary

Phase 3 is an **assembly and de-clienting** phase, not a build-new-machinery phase. Every
primitive it needs already ships: the four type roles and seven spacing tokens in
`app/globals.css`, the `SmearTitle` client leaf that lets a Server Component carry the
scroll trail, the `publishedFor` / `findBySlug` content selectors, `PostMeta`, and the
`SmearHeadingProvider` mounted in both root layouts. The phase adds exactly one data module
(`lib/work.ts`), three CSS classes whose every declaration is copied from a value already in
`app/globals.css`, one new route (`/cv`), and **zero npm dependencies**.

The single genuinely structural change is `app/(en)/page.tsx`. It is `"use client"` today,
which makes it the one page in the repo that cannot export route metadata. The fix is
already proven in-repo — Phase 2 shipped `SmearTitle` for precisely this — and the shipped
post route (`app/(en)/writing/[slug]/page.tsx`) is a working template for "async Server
Component that reads the filesystem and still carries a Humane trail." **Measurement
correction:** `/` is not metadata-less today. It inherits `title: "Guillem Gelabert"` and
`description: "Developer."` from `app/(en)/layout.tsx`; what it lacks is a
`<link rel="canonical">` and any *route-level* override, and what it *cannot do* is declare
either. That is a smaller hole than "no title, description or canonical at all" but the fix
is identical and the phase should still do it.

Two claims in the approved UI-SPEC's *"Two properties of the shipped smear system"* section
were tested and did not hold. The trail's per-frame cost is real but ~40× smaller than the
section implies (measured 0.4 ms at two headings against an 8.33 ms budget), and the
`documentTop` staleness has **no observable effect at all** because `documentTop` cancels
algebraically in every expression `draw()` consumes. Both corrections *reduce* work: no
mitigation is needed now, and Phase 6's photograph must reserve its space for `BUILD-06`
(layout shift), not for trail correctness. Details and the measurement traces are below.

**Primary recommendation:** de-client `app/(en)/page.tsx` into an `async` Server Component
that exports `metadata`, composes `SmearTitle` + `lib/work.ts` + a null-safe
`findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)`, and add a fourth `node --test`
CSS-contract gate modelled on `tests/unit/prose-contract.test.ts` for `.section-head` /
`.link` / `.link-quiet`. Ship no new dependency, no new token, and no change to
`components/smear-heading/`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Work-list content (titles, annotations, hrefs, hosts) | **Build-time module** (`lib/work.ts`) | — | `D-05`: data, not markup. A plain TS export needs no fetch, no CMS, no client state. Adding a third entry stays a content change. |
| Featured-slot state resolution | **API/data tier — server, build-time** (`lib/content.ts`) | — | Requires `node:fs` `readdir` + dynamic `import()`. Structurally impossible in a Client Component; this is *the* reason `app/(en)/page.tsx` must stop being one. |
| Route metadata (`title`, `description`, `canonical`) | **Frontend server (SSR/RSC)** | — | Next's `metadata` export is a server-only convention. Cannot be declared from a `"use client"` module. |
| Landing layout, sections, contents nav, stubs | **Frontend server (RSC)** | — | Pure static markup + Tailwind utilities. No interactivity, no `<button>`, no state. |
| Scroll trail on the two Humane headings | **Browser / client** (`SmearTitle` → `useSmearHeading` → `SmearHeadingProvider`) | — | `requestAnimationFrame`, `window.scrollY`, `document.fonts.ready`, `matchMedia`. Already isolated to a 4-line client leaf; the boundary must stay there and not creep back up to the page. |
| Link hover / focus / focus-visible affordances | **CDN / static (CSS)** | — | `.link` / `.link-quiet` in `app/globals.css`. No JS. Reduced-motion gating is a `@media` query, not a hook — the state change is CSS, only the transition is gated. |
| In-page anchor navigation (`#work`, `#backlog`, `#contact`) | **Browser (native)** | CSS (`scroll-mt-xl`) | Native fragment navigation. Explicitly **not** JS and explicitly **not** `scroll-behavior: smooth` — smooth scroll fires a long burst of `scroll` events, each of which advances `trailHue`. |
| Anything requiring the case study to exist | **Phase 4** | — | Out of tier and out of phase. The slot resolves to `null` and renders interim copy. |

**Two tier misassignments this map exists to prevent**, both of which the current code or a
naive reading invites:

1. **Putting the featured-slot resolution in the browser tier.** It reads the filesystem. A
   `"use client"` page importing `lib/content.ts` fails at build with a `node:fs` resolution
   error, not with a helpful message.
2. **Putting the trail in the page tier.** That is what Phase 1 did (`app/(en)/page.tsx:1`,
   `app/(en)/type/page.tsx:1`) and it is exactly what blocks metadata. `SmearTitle` moved the
   boundary down one level in Phase 2; Phase 3 must adopt it for `/`, not re-raise it.

---

## Standard Stack

### Core — everything already installed, versions read from `package.json` today

| Library | Version | Purpose | Why standard |
|---------|---------|---------|--------------|
| `next` | `16.3.3` | App Router, RSC, `metadata` export, static prerender | Locked by `BUILD-01`, shipped in Phase 1 [VERIFIED: package.json] |
| `react` / `react-dom` | `19.2.8` | RSC + the one client leaf | Pinned by Next 16 [VERIFIED: package.json] |
| `tailwindcss` + `@tailwindcss/postcss` | `^4` | Every utility this phase writes | Shipped Phase 1; `@theme` tokens are the design system's source of truth [VERIFIED: package.json, postcss.config.mjs] |
| `@playwright/test` | `^1.62.1`, chromium project only | Route/integration specs | `playwright.config.ts` [VERIFIED: repo] |
| `node:test` + `node:assert` | Node 22.20, built in | Unit + CSS-contract + build-output gates | No config file; Node strips TS natively [VERIFIED: `npm run test:unit` script] |

### Supporting — modules this phase composes, not installs

| Module | Purpose | When to use |
|--------|---------|-------------|
| `components/smear-title.tsx` | The **only** sanctioned client boundary for a trail-carrying heading | Nameplate `<h1>`, featured `<h3>`, `/cv` `<h1>`. Widen `as` to include `"h3"`. |
| `lib/content.ts` → `publishedFor`, `findBySlug` | Featured-slot state derivation | Exactly once, in `app/(en)/page.tsx`. Never `loadPostModule` from the landing. |
| `lib/locales.ts` → `UI`, `indexPath` | The shared `homeLink` string for amendment A2 | Only for strings that appear in **both** locales. All landing-only copy stays in the landing modules (the landing is EN-only). |
| `components/post-meta.tsx` | Featured slot's published (Phase 4) state | `switchHref={null}`. Not used in the interim state. |
| `lib/site.ts` → `SITE_URL` | `metadataBase`, already env-overridable via `NEXT_PUBLIC_SITE_URL` | Do not re-derive an origin anywhere. Already wired into both root layouts. |

### Alternatives considered

| Instead of | Could use | Tradeoff |
|------------|-----------|----------|
| De-clienting `/` | Keep `"use client"`, move the `<h1>` into a child component and put metadata in a co-located `layout.tsx` for `/` | Works, but requires a *third* layout file whose only job is metadata, and leaves the page unable to `await publishedFor()` — which the featured slot needs. Strictly worse. **Rejected.** |
| `lib/work.ts` as a TS module | JSON in `content/`, or MDX front-matter | `D-05` only asks that entries be data. A TS module gets compile-time type checking of `WorkEntry` and an empty-array build error for free; JSON gets neither, MDX drags the content loader in for two objects. **TS module wins.** |
| `.section-head` / `.link` / `.link-quiet` as plain CSS in `globals.css` | Tailwind `@utility` / `@apply`, or inline utility strings | The spec requires them to be reusable and auditable by a `node --test` gate that parses `globals.css` (the `tests/unit/prose-contract.test.ts` pattern). Inline utility strings are invisible to that gate. **Plain CSS wins**, and matches how `.text-standfirst` and the whole Prose Contract already ship. |
| Native fragment anchors | `next/link` with hash, or a JS scroll handler | `next/link` to a same-page hash is fine but buys nothing; a JS handler is motion the reduced-motion gate would then have to cover. Plain `<a href="#work">` + `scroll-mt-xl`. |

**Installation:** none.

```bash
# Phase 3 adds zero dependencies. This is the correct command:
# (no-op)
```

**Version verification:** `npm view` was **not** run and is not required — this phase
installs nothing. Versions above are read from the committed `package.json` and
`package-lock.json`, which is a stronger source than the registry for "what this repo runs."

---

## Package Legitimacy Audit

**Not applicable — this phase installs no external package.**

`03-UI-SPEC.md` § Registry Safety is explicit: *"Phase 3 introduces no new npm dependency of
any kind."* `REQUIREMENTS.md` Out of Scope bans an animation library, a state manager and a
component library. `components.json` does not exist and must not be created; the shadcn init
gate must not be run.

| Package | Registry | Disposition |
|---------|----------|-------------|
| *(none)* | — | No install task belongs in any Phase 3 plan. |

**Planner instruction:** if any plan in this phase contains an `npm install`, that is a
scope violation, not a legitimate dependency discovery. Route it back through the UI-SPEC.

---

## Architecture Patterns

### System architecture diagram

```
                          BUILD TIME (next build / next dev prerender)
                          ─────────────────────────────────────────────

  content/*.md(x) ──► slugsOnDisk() ──► loadPostModule(slug) ──► assertFrontmatter()
                                                                       │
                                                              allPosts(): PostEntry[]
                                                                       │
                                                      selectForLocale(entries, "en")
                                                       · lang === "en"
                                                       · isVisible()  ── showDrafts()?
                                                                       │        (NODE_ENV)
                                                             publishedFor("en")
                                                                       │
   lib/work.ts                                       findBySlug(…, CASE_STUDY_SLUG)
   · CASE_STUDY_SLUG                                                   │
   · WORK: [entry01, entry02]                             ┌────────────┴────────────┐
   · POSITIONING_PLACEHOLDER                          null │                        │ PostEntry
          │                                     ┌──────────▼─────────┐   ┌──────────▼──────────┐
          │                                     │  INTERIM STATE     │   │  PUBLISHED STATE    │
          │                                     │  (ships Phase 3)   │   │  (arrives Phase 4)  │
          │                                     │  h3 = plain text   │   │  h3 = <a> to        │
          │                                     │  body = Body role  │   │   /writing/{slug}   │
          │                                     │  no PostMeta       │   │  + standfirst+meta  │
          │                                     └──────────┬─────────┘   └──────────┬──────────┘
          │                                                └────────┬───────────────┘
          ▼                                                         ▼
   ┌──────────────────────────────────────────────────────────────────────────┐
   │  app/(en)/page.tsx   —  async SERVER COMPONENT                           │
   │  export const metadata = { title, description, alternates.canonical }    │◄── only possible
   │                                                                          │    once "use client"
   │  <main>                                                                  │    is removed
   │    header: SmearTitle h1 · positioning · ContentsNav (5 links)           │
   │    #case-study : h2.section-head + FeaturedSlot(SmearTitle h3)           │
   │    #work       : h2.section-head + WorkList(<ol> over lib/work.ts)       │
   │    #backlog    : h2.section-head + SectionStub                           │
   │    #contact    : h2.section-head + SectionStub                           │
   │  </main>                                                                 │
   └──────────────────────────────┬───────────────────────────────────────────┘
                                  │ prerendered HTML → .next/server/app/index.html
                                  ▼
                          RUNTIME (browser)
                          ─────────────────
   root layout (en) ──► <SmearHeadingProvider>   ← ONE rAF driver, mounted once
                                  │
              ┌───────────────────┴────────────────────┐
              │ registry: Map<HTMLElement, HeadingState>│
              └───────────────────┬────────────────────┘
                                  │ register(el, documentTop) after document.fonts.ready
        SmearTitle h1 ────────────┤
        SmearTitle h3 ────────────┘        scroll / pointer events
                                                    │
                                       handleScroll() → trailHue += …
                                       start() → [ prefers-reduced-motion? → RETURN ]
                                                    │
                                       frame(): for each registered heading
                                                  targetY = documentTop − scrollY
                                                  lagY    ← smoothed, clamped ±MAX_TRAIL
                                                  draw(): ≤240 text-shadow layers
                                                  settles → textShadow: none, loop stops

   Native fragment nav (#work / #backlog / #contact) — no JS, scroll-margin-top: 32px
   Outbound work links → ib-gdp.guillemgelabert.com · watchpeopledie.live (same tab)
```

**Trace of the primary use case** (a recruiter lands on `/`): prerendered HTML arrives
title-first; `SmearHeadingProvider` hydrates and registers two headings after
`document.fonts.ready`; the visitor reads the nameplate, the positioning line and five nav
labels without any JS having mattered; scrolling starts the single rAF loop, which smears
the nameplate and then the featured `<h3>` and settles both to `none` when the scroll stops;
clicking `Work` jumps natively to `#work` with a 32px top margin; clicking an entry title
leaves for an independently-hosted piece in the same tab.

### Recommended structure — what this phase adds

```
app/
├── (en)/
│   ├── page.tsx          # REPLACED. "use client" removed → async Server Component (A1)
│   ├── cv/
│   │   └── page.tsx      # NEW. Stub route, D-02
│   ├── type/page.tsx     # AMENDED. One specimen section for the 3 new classes (A4)
│   └── writing/page.tsx  # AMENDED. Site-root back link + .link-quiet (A2, A3)
├── (de)/texte/page.tsx   # AMENDED. Same, hrefLang="en" on the back link (A2, A3)
├── not-found.tsx         # AMENDED. .link-quiet on its back link (A3 — see correction below)
└── globals.css           # AMENDED. + .section-head, .link, .link-quiet
components/
├── smear-title.tsx       # AMENDED. as?: "h1" | "h2" | "h3"
└── landing/              # NEW (suggested — `planner may override` on placement)
    ├── contents-nav.tsx
    ├── featured-slot.tsx
    ├── work-list.tsx
    └── section-stub.tsx
lib/
├── work.ts               # NEW. WorkEntry[], CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER
└── locales.ts            # AMENDED. + homeLink in UiCopy and both UI entries
tests/
├── landing.spec.ts       # NEW
├── landing-viewport.spec.ts  # NEW (375 / 1440)
├── landing-trail.spec.ts     # NEW
├── cv.spec.ts                # NEW
├── unit/link-contract.test.ts    # NEW — the globals.css gate
├── unit/work.test.ts             # NEW — the data-module gate
└── build/prerender.test.ts       # AMENDED — landing/cv production assertions
```

All four landing components are Server Components with no props-from-state, so they may
equally live as functions inside `app/(en)/page.tsx`. The split above exists for
readability and for per-component testability; it is a judgement call, not a contract.

### Pattern 1 — de-clienting a page while keeping its trail

**What:** move the `"use client"` boundary from the page module down to the leaf heading.
**When to use:** any page that needs `metadata`, `async`/`await`, or `node:fs`, and also
wants a Humane heading to trail.
**Already proven in-repo:** `app/(en)/writing/[slug]/page.tsx` does exactly this and carries
an in-file comment explaining why.

```tsx
// BEFORE — app/(en)/page.tsx as it ships today (verbatim, lines 1-16)
"use client";
import { useSmearHeading } from "@/components/smear-heading/use-smear-heading";
export default function Home() {
  const headingRef = useSmearHeading<HTMLHeadingElement>();
  return (
    <main className="flex min-h-screen flex-col justify-center gap-md px-lg">
      <h1 ref={headingRef} className="text-display">Guillem Gelabert</h1>
      <p className="text-body">Developer.</p>
    </main>
  );
}

// AFTER — the shape Phase 3 needs. No hook, no directive, metadata now legal.
import type { Metadata } from "next";
import { SmearTitle } from "@/components/smear-title";
import { findBySlug, publishedFor } from "@/lib/content";
import { CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER, WORK } from "@/lib/work";

export const metadata: Metadata = {
  title: "Guillem Gelabert",
  description: POSITIONING_PLACEHOLDER,   // one source for HOME-01 — see Pitfall 6
  alternates: { canonical: "/" },         // the real gap measured today
};

export default async function Landing() {
  const caseStudy = findBySlug(await publishedFor("en"), CASE_STUDY_SLUG);
  return (
    <main className="flex flex-col gap-3xl px-lg py-3xl">
      <header className="flex flex-col gap-lg">
        <SmearTitle as="h1" className="text-display">Guillem Gelabert</SmearTitle>
        <p className="max-w-prose text-standfirst">{POSITIONING_PLACEHOLDER}</p>
        {/* ContentsNav */}
      </header>
      {/* sections */}
    </main>
  );
}
```

**`robots: { index: false }` is inherited and must not be repeated.** Next merges metadata
parent→child; fields absent from the child come from `app/(en)/layout.tsx`.
[VERIFIED: measured — `/` and `/writing` both emit `<meta name="robots" content="noindex">`
today while only the layout declares it, and `tests/build/prerender.test.ts` asserts the same
against production HTML.]

### Pattern 2 — the derived (never flagged) featured slot

**What:** the slot's state is a function of what exists in `content/`, not of a boolean.
**Verified against the current `lib/content.ts`** (line numbers are today's file):

```
publishedFor("en")                                   // :236
  └─ selectForLocale(await allPosts(), "en")         // :195
       ├─ allPosts()                                 // :224  readdir → loadPostModule → assertFrontmatter
       └─ .filter(lang === "en" && isVisible(e))     // :197
            └─ isVisible = showDrafts() || draft !== true   // :176  (D-11, ONE exported predicate — WR-07)
                 └─ showDrafts = NODE_ENV === "development" // :171
findBySlug(entries, CASE_STUDY_SLUG)                 // :220  → PostEntry | null
```

```ts
// lib/work.ts — Phase 4 D-15 locks this value; it is a hard code contract.
export const CASE_STUDY_SLUG = "the-chart-therefore-changes";
```

**What it renders today, exactly.** `content/` holds three files, all `draft: true`:
`fixture.mdx` (en), `musterseite.mdx` (de), `nur-auf-deutsch.md` (de). Therefore:

| Environment | `publishedFor("en")` | `findBySlug(…, CASE_STUDY_SLUG)` | Slot renders |
|---|---|---|---|
| production build | `[]` | `null` | **interim** |
| `next dev` | `[fixture]` (drafts visible) | `null` | **interim** |

[VERIFIED: read from `lib/content.ts` + `ls content/` + the `draft: true` assertions in
`tests/build/prerender.test.ts`.]

Three properties worth stating because each closes a plausible wrong turn:

1. **`CASE_STUDY_SLUG` never reaches `loadPostModule`.** The landing calls only
   `publishedFor` and `findBySlug`, both of which operate on already-loaded front-matter.
   The ASVS V4 ordering rule (`lib/content.ts:215-219`) is satisfied vacuously. Do not
   "optimise" by importing the module directly.
2. **`the-chart-therefore-changes` passes `SAFE_SLUG`** (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`,
   `lib/content.ts:122`) — lowercase ASCII, single hyphens, no umlaut. The German
   counterpart `die-grafik-aendert-sich` also passes; that is why Phase 4 D-15 transliterates.
   [VERIFIED: regex tested against both strings.]
3. **`getCaseStudy()` must tolerate `null` forever, not just this phase.** If Phase 4's file
   is ever renamed, reverted or set `draft: true`, the slot silently returns to interim
   rather than throwing. That is the correct failure mode and the reason the slot is derived.

### Pattern 3 — the CSS contract as an executable gate

`tests/unit/prose-contract.test.ts` is a 300-line `node --test` file that parses
`app/globals.css` with a brace-depth-aware, CSS-nesting-aware extractor and asserts the
type/weight/tracking/radius budgets as source facts. It already contains the exact parser
Phase 3 needs, including the WR-13 nesting fix and the semicolon-in-value fix.

**Reuse it, do not re-write it.** Extract the parser (`extractBlocks`, `declarationsOf`,
`valuesOf`) into a shared helper, or import from the existing file. Then assert Phase 3's
own budget:

- `.section-head`, `.link`, `.link-quiet` all exist.
- Every `font-size` across all three is `14px` (they are Label-role only) or absent.
- Every `color` / `text-decoration-color` / `outline-color` value is `inherit`,
  `currentColor`, `var(--color-accent)` or `var(--color-ink)` — never a literal hex.
- Every `transition` sits inside an `@media (prefers-reduced-motion: no-preference)` block.
- `.link-quiet` has **no** `text-decoration-line: underline` in its rest state and **does**
  in its `:hover` / `:focus` state.
- No fourth rule weight: every `border-*-width` in the three classes is `1px` or `2px`
  (the focus outline), and every `border-*-color` is `var(--color-ink)` or `var(--color-rule)`.
- The existing invariants still hold — `!important` absent, both `clamp()` curves appear
  exactly once (test `(j)` already guards this and will catch an accidental retune).

This is the cheapest possible enforcement of the UI-SPEC's central promise
(*"every declaration is a value already shipped"*) and it runs in well under a second.

### Anti-patterns to avoid

- **Re-raising the client boundary.** Adding `"use client"` back to `app/(en)/page.tsx` to
  "fix" a hook error. If a hook is needed, the component is in the wrong tier.
- **A second rAF driver.** `03-UI-SPEC.md` and `02-UI-SPEC.md` both forbid it; the provider
  owns the only `requestAnimationFrame` in the tree.
- **Retuning `MAX_TRAIL` / `MAX_SHADOWS` / `SCROLL_STOP_DELAY` / `HUE_SPEED`.** Forbidden,
  and — per the benchmark below — unnecessary.
- **`border-t` without a colour utility.** Tailwind v4 preflight emits `border: 0 solid` with
  no colour, so border-color falls through to `currentColor` = full ink. This is precisely
  the WR-06 defect that shipped in Phase 2's `<hr>`. See *Pitfall 1*.
- **`scroll-behavior: smooth`.** Banned by the Motion Contract for two concrete reasons.
- **A rendered placeholder marker.** `[positioning sentence goes here]` on a live URL is what
  `D-02` exists to prevent. The marker is a source comment.
- **A second statement of the draft rule.** `isVisible` is exported (WR-07 fix); import it.
- **Restating the site origin.** `lib/site.ts` is the one place (WR-10 fix).

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---------|-------------|-------------|-----|
| A heading that trails on scroll | A ref + `useSmearHeading` in the page | `<SmearTitle as=… className=…>` | Keeps the page a Server Component. This is the entire reason `SmearTitle` exists (`components/smear-title.tsx:11-16`). |
| "Is the case study published?" | A `FEATURED_ENABLED` boolean, a front-matter `featured: true`, an env flag | `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)` | Derived state cannot drift from reality. Phase 4 `04-CONTEXT.md` § Established Patterns states the same rule independently. |
| "Should drafts show?" | `process.env.NODE_ENV === "development"` inline | `isVisible(entry)` / `showDrafts()` from `lib/content.ts` | WR-07 collapsed two independent statements into one exported predicate. Re-inlining it re-opens the bug. |
| The site's own origin | `new URL("https://web-production-…")` | `SITE_URL` from `lib/site.ts` | WR-10. Already env-overridable via `NEXT_PUBLIC_SITE_URL`. |
| Reading-measure width | `max-w-[65ch]` or a new token | `max-w-prose` | Compiles to exactly `max-width: 65ch` [VERIFIED: direct Tailwind compile today]. |
| Anchor offset | JS scroll handler, `scroll-padding` on `<html>`, a spacer div | `scroll-mt-xl` on each `section[id]` | Compiles to `scroll-margin-top: var(--spacing-xl)` [VERIFIED: direct Tailwind compile]. |
| List semantics with no markers | `<div>` stack, or `<ul>` + `list-none` alone | `<ol role="list" class="list-none …">` | Safari drops list semantics when `list-style: none` is applied. `role="list"` restores them. |
| Date formatting in the published slot | `toLocaleDateString` in the component | `<PostMeta locale="en" date={…} switchHref={null} />` | Already handles `<time datetime>`, the `·` separator, the dev-only draft marker, and locale. |
| A styled global 404 | A third root layout built from scratch | `app/not-found.tsx` — **already exists** | Shipped 2026-08-31 under WR-14. See *Corrections*. |

**Key insight for this domain:** the expensive mistakes in this phase are all *boundary*
mistakes, not implementation mistakes. Every visual element is ten lines of markup against
tokens that already exist. What can actually go wrong is putting a capability in the wrong
tier (client vs server), restating a rule that is already exported once, or introducing a
value that is not in the shipped budget. All three are catchable by a gate, and two of the
three gates already exist in `tests/unit/`.

---

## Corrections to the approved UI-SPEC

The UI-SPEC is normative on **visual contract**. These four items are technical findings that
supersede specific *technical* statements inside it. Each was measured today. None changes a
visual rule.

### C-1 — `app/not-found.tsx` exists; the Phase 6 forward note is overtaken

`03-UI-SPEC.md` Copywriting Contract, *Error state* row, says:

> *"For an unknown URL, Next.js's default 404 remains acceptable through Phase 5… **Forward
> note for Phase 6:** adding a styled root `not-found` is not free — with two root layouts
> … there is no global not-found boundary, so a root one requires a third root layout.
> Phase 6 (`FIND-02`) should plan for that rather than discover it."*

**What is now true.** `app/not-found.tsx` shipped in Phase 2's code-review fix WR-14
(commit `39d35aa`). It does exactly what the forward note anticipated: owns its own
`<html lang="en">`/`<body>`, re-declares all three font variables, mounts
`SmearHeadingProvider`, and renders `SmearTitle as="h1"` + `UI.en.notFoundHeading`. The
"third root layout" is built, and it server-renders correctly — the review measured
`/nope` → **404, `lang="en"`, `<h1>Not found</h1>` with JS disabled** under `next start`.

Three consequences for this phase:

1. **Next.js's default 404 no longer serves any unmatched URL.** The Error-state row's
   premise is stale. Phase 6 should not plan the work; it is done.
2. **`app/not-found.tsx` is a Phase 3 amendment surface.** Amendment A3 says *"both
   `not-found` back links"* — written when there were two. There are now **three**:
   `app/(en)/writing/not-found.tsx:18`, `app/(de)/texte/not-found.tsx`, and
   `app/not-found.tsx:36`. All three render `className="text-label"` with no `.link-quiet`,
   so all three currently have no accent hover and only a browser-default focus ring.
   **A3 covers three files, not two.**
3. **What remains genuinely open is CR-01 only** — `/writing/<unknown>` and
   `/texte/<unbekannt>` still render `<html id="__next_error__">` with no `lang` and no
   heading. Re-measured today against `npm run dev`: `/nope` → 404 with the real boundary;
   `/writing/does-not-exist` → 404 with `id="__next_error__"`. It is a framework-level
   defect in Next 16.3.3's app-render HTTP-access-fallback path, deferred to Phase 6's
   middleware layer by coordinator decision. **Do not attempt it here**, and do not add a
   no-JS assertion for those two paths — `tests/writing-not-found.spec.ts` already carries a
   comment recording that trade.

### C-2 — `/` is not metadata-less; it is *canonical*-less and *override*-less

The task brief states the landing view "has no title, description or canonical at all."
Measured against `npm run dev` today:

```
GET /            <title>Guillem Gelabert</title>
                 <meta name="description" content="Developer."/>
                 <meta name="robots" content="noindex"/>
                 (no <link rel="canonical">)

GET /writing     <title>Writing — Guillem Gelabert</title>
                 <meta name="description" content="Essays and case studies …"/>
                 <link rel="canonical" href="https://web-production-9cedb.up.railway.app/writing"/>
```

`/` inherits title and description from `app/(en)/layout.tsx:9-14`. The real defects are:
**no `rel="canonical"`**, **no route-level override capability**, and a description string
(`"Developer."`) duplicated in the layout rather than sourced from the placeholder constant.
The fix is unchanged — de-client and export `metadata` — but the planner should not write an
acceptance criterion of the form "a title appears on `/`", because that passes today and
proves nothing. Assert the **canonical** and assert that `description` equals
`POSITIONING_PLACEHOLDER`.

### C-3 — the trail's per-heading cost is real but ~40× smaller than the spec implies

See *The smear trail at the landing view's heading count* for the numbers. The spec's
constraint #1 is directionally right (cost is linear in *registered*, not *visible*,
headings) and its conclusion is right (cap the landing at two). Its framing — *"an off-screen
heading … still writes up to 240 `text-shadow` layers per frame"* — reads as alarming, and
the measured cost of that is **0.085 ms per heading per frame**. The viewport guard is
correctly marked `planner may override`; the measurement says **do not add it**.

### C-4 — the `documentTop` staleness has no observable effect

The spec's constraint #2 says a post-mount layout change above a registered heading *"leaves
its trail anchored to a stale document offset, and the heading will smear from the wrong
origin."* **Measured: it does not.** `documentTop` is gauge-invariant in this algorithm — it
cancels in every expression `draw()` consumes. Full analysis and the A/B trace are in
*What actually breaks when landing content reflows*. Phase 6's photograph must still reserve
its space, but for `BUILD-06` (cumulative layout shift), not for trail correctness.

---

## The smear trail at the landing view's heading count

*(Answers specific question 3.)*

### Measurement

Chromium (headless, Playwright 1.62.1), 1440×900, against `npm run dev` on the live `/type`
route, which registers **5** trail headings today. Two passes:

**(a) End-to-end frame deltas during a continuous 60-step scripted scroll on `/type`:**

| p50 | p90 | p99 | max | samples |
|-----|-----|-----|-----|---------|
| **8.30 ms** | 10.0 ms | 16.9 ms | 25.0 ms | 168 |

A p50 of 8.30 ms is the 120 Hz vsync interval (8.33 ms). **The shipped 5-heading page holds
120 fps under continuous scroll with the trail fully active.**

**(b) Isolated `draw()` cost — the exact ported function, pinned at the 240-layer clamp, with
a forced style/layout flush per iteration, elements positioned off-screen so paint is culled
(i.e. the worst case the spec worries about):**

| Registered headings | median ms/frame | p95 | max |
|---|---|---|---|
| 1 | 0.30 | 0.40 | 0.40 |
| **2** *(the landing)* | **0.40** | 0.40 | 0.70 |
| **5** *(shipped `/type`)* | **0.70** | 0.80 | 0.90 |
| 10 | 1.30 | 1.60 | 3.50 |
| 20 | 1.90 | 2.00 | 2.00 |
| 40 | 3.60 | 4.90 | 5.50 |

Marginal cost ≈ **0.085 ms per additional registered heading**.

### Answer

**No, it is not a real problem at the landing view's heading count, and no mitigation should
be added.**

- The landing registers **two** trail headings — the Display nameplate `<h1>` and the
  featured `<h3>`. The section heads (*Case study / Work / Backlog / Contact*) are Newsreader
  Label-role and carry no trail; work-list titles, contents links, annotations, host labels
  and stub copy likewise. So the landing is **less than half** the shipped `/type`.
- At two headings, `draw()` costs **0.40 ms** of an 8.33 ms budget (120 Hz) or 16.67 ms
  (60 Hz) — **5% and 2.4%** respectively.
- To saturate a 120 Hz budget on `draw()` alone you would need roughly **95 registered
  headings**. That is not a v1 shape.
- The premise "the landing view adds several headings at once" is true of *headings* but not
  of *registered* headings. Only Humane gets the trail, and the landing has two Humane
  elements by design.

### If it ever does become a problem — the cheapest correct mitigation, with a caveat

The UI-SPEC's proposal is right: *skip the `draw()` DOM write when the element's rect lies
outside the viewport by more than `MAX_TRAIL`, and nothing else.* Two constraints on how:

1. **The `anyActive` bookkeeping must stay driven by `distance > 0.15`.** If a culled heading
   also stops setting `anyActive`, the loop can stop while an on-screen heading is still
   settling. Cull the *write*, not the *state update*.
2. **The guard must read a live `getBoundingClientRect()`, not `state.documentTop`.** This is
   a finding, not a restatement: today `documentTop` can be arbitrarily stale with zero
   consequence (see C-4), because it only ever appears inside differences where it cancels.
   A culling guard would be the **first** consumer of `documentTop` as an *absolute* value,
   and would therefore convert a currently-harmless staleness into a real bug — headings culled
   or un-culled at the wrong scroll position. If the guard is ever added, it must either read
   the rect live or a `ResizeObserver`/`fonts.ready` recompute must land with it.

A cheaper, zero-risk optimisation exists and is worth knowing about even though it is not
needed: skip the assignment when the generated string is identical to the previous frame's.
It removes the style invalidation without touching any constant. Also not needed at n=2.

---

## What actually breaks when landing content reflows after `documentTop` is captured

*(Answers specific question 4.)*

### The claim under test

`use-smear-heading.ts:30-36` registers a heading with
`register(current, rect.top + window.scrollY)` inside `document.fonts.ready.then(…)`. There
is no `ResizeObserver`, no `resize` listener, no recompute. The UI-SPEC concludes that a
post-mount layout change above a registered heading makes it *"smear from the wrong origin."*

### The algebra

`documentTop` appears in exactly two places, and cancels in both:

```
register:   state.lagY = documentTop − window.scrollY          // provider :271
frame:      targetY    = state.documentTop − scrollY           // provider :137
            state.lagY += (targetY − state.lagY) * smoothing   // :139
            state.lagY  = targetY + clamp(state.lagY − targetY, ±MAX_TRAIL)  // :141-143
            distance    = |state.lagY − targetY|               // :145
draw:       difference  = lagY − targetY                       // :111
            shadows.push(`0 ${difference * t}px 0 ${color}`)   // :122
```

Every consumer is a **difference** between `lagY` and `targetY`, and `lagY` was initialised
from the same `documentTop`. Adding a constant *k* to `documentTop` adds *k* to both terms
and cancels. And `text-shadow` offsets are relative to the element's own glyph box, so the
rendered trail never depends on an absolute document coordinate. `documentTop` is a **gauge**.

### The measurement (A/B, identical scroll, same page)

`/type`, 1440×900. Variant A: no reflow. Variant B: a 400 px `<div>` prepended to `<main>`
after registration (measured `documentTop` drift for the `<h1>`: **+464 px**, 90.19 → 554.19).
Then 12 identical 100 px scroll steps, sampling `getComputedStyle(h1).textShadow` after each:

```
A (no reflow)   layers: 172,240,240,240,240,240,240,240,240,240,240,240   settled: none
                first-layer y-offset: 85.9 139.6 175.3 219.9 219.8 255.3 259.6 240.3 240.9 237.9 204.9 163.5

B (464px drift) layers: 200,240,240,240,240,240,240,240,240,240,240,240   settled: none
                first-layer y-offset: 100.0 172.6 234.7 259.8 240.9 240.9 223.8 239.9 259.8 224.0 258.5 240.9
```

The two traces are the same distribution. **There is no 464 px systematic offset and no
persistent artefact.** Both settle to `none`.

### What *does* happen, and it is not this

A layout shift that occurs **while the loop is running** (mid-scroll) moves the element by
464 px relative to the viewport in one frame. `targetY` jumps by 464 while `lagY` is frozen
(during an active scroll `inputHeld` is true, so the smoothing step at `:139` is skipped and
only the `±MAX_TRAIL` clamp applies). Measured: the heading pins at the full **240-layer,
280 px** trail for the duration of the gesture and then settles to `none`:

```
mid-scroll reflow, per-frame layer count over 25 consecutive frames:
[240 ×25]   then, after SCROLL_STOP_DELAY + settle:  textShadow === "none"
```

**Crucially, recomputing `documentTop` at that instant would produce the identical jump** —
the element genuinely moved. The artefact is a property of layout shift, not of caching.

### Answer

**Nothing breaks.** For Phase 3 specifically the question is moot twice over: the landing has
no images, no lazy content and no post-mount client layout, and even if it did, a stale
`documentTop` is unobservable.

**For Phase 6's photograph (`PROF-02`) the mitigation is unchanged but the reason is
different, and the difference matters.** The photo must reserve its space with explicit
intrinsic dimensions or an `aspect-ratio` because:

- **`BUILD-06`** — an unreserved image is a cumulative layout shift, full stop. This is the
  real and sufficient reason, and `tests/font-cls.spec.ts` is the existing gate for it.
- **A transient trail artefact** — a one-gesture 280 px smear burst on the heading below,
  which self-heals. Cosmetic, bounded, not a desync.

It should **not** be justified as "otherwise the trail anchors to a stale offset," because
that is not what happens, and a later phase acting on that belief would add a
`ResizeObserver` recompute to `use-smear-heading.ts` for no benefit — touching the one module
every UI-SPEC since Phase 1 has told it not to touch.

---

## `SmearTitle`'s `as` union — verified impact of widening it

*(Answers specific question 2.)*

**Current state, `components/smear-title.tsx:5-9`, verbatim:**

```ts
type SmearTitleProps = {
  as?: "h1" | "h2";
  className?: string;
  children: React.ReactNode;
};
```

**Every consumer in the repo** (grep across `app/`, `components/`, `tests/`, excluding the
component itself) — 7 call sites, 0 outside these:

| File | Line | `as` value |
|---|---|---|
| `app/(en)/writing/[slug]/page.tsx` | 77 | `"h1"` |
| `app/(de)/texte/[slug]/page.tsx` | 80 | `"h1"` |
| `app/(en)/writing/not-found.tsx` | 14 | `"h1"` |
| `app/(de)/texte/not-found.tsx` | 14 | `"h1"` |
| `app/not-found.tsx` | 32 | `"h1"` |
| `app/(en)/writing/page.tsx` | 45 | `"h2"` |
| `app/(de)/texte/page.tsx` | 45 | `"h2"` |

**Nothing else depends on the narrow union.** Checked for all four ways it could:

1. **No exhaustive `switch` or conditional on `as`.** The prop is destructured with a default
   (`as: Tag = "h1"`) and used directly as a JSX tag name (`:17`, `:21`). Widening a union
   used only as a JSX intrinsic name is additive.
2. **No test asserts the prop type or its cardinality.** No `.spec.ts` or `.test.ts`
   references `SmearTitle`. The specs assert rendered elements (`document.querySelector("h1")`
   on `/type`, `article h2` on `/writing`), not the component's API.
3. **The `ref` type is unaffected.** `useSmearHeading<HTMLHeadingElement>()` already covers
   `h3` — `HTMLHeadingElement` is the DOM interface for `h1`–`h6`. TypeScript resolves
   `<Tag ref={ref}>` over a union of intrinsic names by intersecting their prop types;
   `h1`, `h2` and `h3` are structurally identical
   (`DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>`), so the
   intersection is unchanged. This is the same mechanism that already makes `"h1" | "h2"` work.
4. **No re-export, no barrel file, no `Pick`/`Extract` over `SmearTitleProps`.** The type is
   not exported at all — it is module-local.

**Verdict:** the change is one line, source-compatible with all 7 call sites, and requires no
other edit. `npx tsc --noEmit` is a sufficient gate. Note the UI-SPEC's phase-completion
checklist correctly insists the featured headline be a real `<h3>` — an `<h2>` there would
put two `<h2>`s inside `<section id="case-study">`, one of them the section head, silently
breaking the heading outline that `aria-labelledby` depends on.

---

## Runtime State Inventory

Included because this phase de-clients a shipped page and amends four live surfaces. Every
category was checked explicitly.

| Category | Items found | Action required |
|----------|-------------|-----------------|
| **Stored data** | **None.** No database, no Chroma/Mem0/Redis, no KV. All content is files in `content/` and TS modules in `lib/`. Verified: `package.json` has no DB client; `lib/content.ts` reads only `path.join(process.cwd(), "content")`. | None |
| **Live service config** | **One: Railway.** The deployed service at `web-production-9cedb.up.railway.app` (HTTP 200 today). Phase 3 changes only application code — no Railway variable, service setting or domain changes. `NEXT_PUBLIC_SITE_URL` may or may not be set in the Railway environment; `lib/site.ts:16` falls back to the Railway origin either way, so **either state is correct and neither needs touching.** | None. Do **not** set or unset `NEXT_PUBLIC_SITE_URL` in this phase — that is Phase 6/`BUILD-07` territory. |
| **OS-registered state** | **None.** No cron, no launchd, no Task Scheduler, no pm2. Deployment is Railway's zero-config Node builder (`next build` + `next start`). | None |
| **Secrets / env vars** | `.env` exists and is gitignored (`.gitignore:1`); `next dev` logs `- Environments: .env`. The only env var the app reads is `NEXT_PUBLIC_SITE_URL` (`lib/site.ts`) plus `NODE_ENV` (`lib/content.ts:172`). Phase 3 introduces **no new env var**. | None. `NODE_ENV` is set by the framework, never by the app — do not read or set it outside `showDrafts()`. |
| **Build artifacts** | `.next/` is gitignored and rebuilt. `next-env.d.ts` is tracked and rewritten by both `next dev` and `next build` (IN-06, deferred). **Relevant risk:** the route-group restructure lesson from Phase 2 — `02-VALIDATION.md` records *"the clean-`.next` build is not optional"*. Adding `app/(en)/cv/page.tsx` and changing `/` from client to server changes generated route types. | **Run `rm -rf .next && npm run build` before `test:build` and before the phase gate.** Do not trust an incremental build to prove the de-clienting worked. |

---

## Common Pitfalls

### Pitfall 1 — `border-t` renders full-ink black, not `--color-rule`

**What goes wrong:** the work-list row separator (`li + li { border-top: 1px … }`) ships as a
heavy black rule instead of the 12%-alpha hairline, introducing a fourth rule weight the
Prose Contract forbids.

**Why it happens:** Tailwind v4's preflight emits, verbatim from a direct compile today:

```css
*, ::after, ::before, ::backdrop, ::file-selector-button {
  box-sizing: border-box; margin: 0; padding: 0;
  border: 0 solid;          /* ← width and style, but NO colour */
}
```

With no `border-color` declared, CSS's initial value `currentColor` applies — which on this
site is `--color-ink`, `#000000`. Tailwind v3 defaulted to `gray-200`; **v4 changed this**,
and it is the single most common v3→v4 regression. This is exactly the WR-06 defect that
shipped in Phase 2 (`<hr>` rendered 8× too dark) and was fixed by hoisting an `hr` rule out
of `.prose-site`.

**How to avoid:** pair every border utility with a colour. `border-rule` compiles to
`border-color: var(--color-rule)` and `border-ink` to `var(--color-ink)`
[VERIFIED: direct Tailwind compile today]. Or write the separator as plain CSS beside
`.section-head`.

**Warning signs:** a visibly black hairline between work-list rows at any viewport; a
computed `borderTopColor` of `rgb(0, 0, 0)` instead of `rgba(0, 0, 0, 0.12)`.
`tests/writing-index.spec.ts:100-106` already asserts exactly this shape for the `<hr>` —
copy the assertion for the row separator.

### Pitfall 2 — a Playwright assertion of the interim featured slot will break in Phase 4

**What goes wrong:** a spec asserting `The case study is being written.` on `/` passes in
Phase 3 and fails during Phase 4 authoring, for a reason that is not a defect.

**Why it happens:** every Playwright spec in this repo runs against `npm run dev`
(`playwright.config.ts:23-27`), where `NODE_ENV === "development"`, so `showDrafts()` returns
`true` and `isVisible()` admits drafts. The moment Phase 4 creates
`content/the-chart-therefore-changes.mdx` with `draft: true` — the normal way to author —
`findBySlug` starts returning an entry **in dev only**, so the landing renders the *published*
state in dev while production still renders *interim*.

**How to avoid:** split the assertion by tier, which is what `02-VALIDATION.md` already does
for drafts:

- **Playwright (`tests/landing.spec.ts`)** asserts *structure*: `section#case-study` exists,
  contains exactly one `h2.section-head`, and exactly one `h3.text-heading`. True in both states.
- **`tests/build/prerender.test.ts`** asserts the *interim copy* against real production HTML
  from `.next/server/app/index.html`. True only in the state that ships.

This is the same division the repo already uses (`tests/draft-visibility.spec.ts` for dev,
`tests/build/prerender.test.ts` for production) and it is the reason `test:build` exists.

**Warning signs:** a green Phase 3 suite that turns red in Phase 4 with no Phase 3 file changed.

### Pitfall 3 — an incremental build hides the de-clienting

**What goes wrong:** `npm run build` succeeds against a warm `.next`, `/` still prerenders,
and the metadata export appears to work — then a clean CI build fails, or the deploy serves
stale generated types.

**Why it happens:** `02-VALIDATION.md` records this from Phase 2's route-group move:
*"The clean-`.next` build is not optional — the route-group restructure is exactly the change
stale generated types break on."* Converting a page from Client to Server Component and
adding a route are the same class of change.

**How to avoid:** `rm -rf .next && npm run build && npm run test:build`. The repo already has
`npm run test:all` which does exactly this.

**Warning signs:** a build that succeeds locally and fails on Railway; `test:build` route keys
that do not include `cv`.

### Pitfall 4 — `tests/font-cls.spec.ts` now measures a much larger page

**What goes wrong:** `BUILD-06` regresses silently, or the CLS spec starts flaking.

**Why it happens:** `tests/font-cls.spec.ts:18` parameterises over `ROUTES = ["/", "/writing/fixture"]`.
Today `/` is two elements (`app/(en)/page.tsx:9-14`). After Phase 3 it is a nameplate, a
standfirst, a five-item nav, four section heads, a poster `<h3>`, two work rows and two stubs
— **overwhelmingly Newsreader**, which loads with `display: 'swap'` (`app/fonts/newsreader.ts:6`).
Humane is `display: 'optional'` and cannot shift; Newsreader can, and there is now far more of it.

**How to avoid:** keep the existing `/` case in `font-cls.spec.ts` — it is now a *meaningful*
test rather than a near-trivial one — and treat any non-zero cumulative shift as a real
finding, not noise. `next/font/google` auto-generates a metric-adjusted fallback
(`size-adjust`, `ascent-override`), so near-zero is achievable; if it is not, the remedy is a
font-loader `adjustFontFallback` setting, **not** loosening the threshold.

**Warning signs:** a cumulative shift value on `/` that is clearly above zero rather than
measurement noise.

### Pitfall 5 — `/cv` inheriting `robots` looks like a bug and gets "fixed"

**What goes wrong:** someone adds `robots: { index: false }` to `/cv`'s own metadata "to be
safe", creating a second statement of a rule that Phase 6 must then flip in two places.

**Why it happens:** the inheritance is invisible in the source of `app/(en)/cv/page.tsx`.

**How to avoid:** Next merges metadata parent→child; unspecified fields come from
`app/(en)/layout.tsx:13`. [VERIFIED: measured — `/writing`'s `generateMetadata` sets only
title/description/alternates, and `tests/build/prerender.test.ts:128-135` asserts noindex is
present on the built `/writing` HTML anyway.] Declare only `title` and (recommended)
`alternates.canonical` on `/cv`.

**Warning signs:** the string `robots` appearing anywhere outside the two root layouts.

### Pitfall 6 — `HOME-01` arrives and has to be changed in three places

**What goes wrong:** the user writes the positioning sentence, it lands in
`app/(en)/page.tsx`'s `<p>`, and the `<meta name="description">` on `/` still says
`Developer.` — which is what Slack, LinkedIn and eventually Google will quote once Phase 6
flips `FIND-02`.

**Why it happens:** the string `"Developer."` exists in **three** places today:
`app/(en)/layout.tsx:12` (`description`), `app/(en)/page.tsx:13` (the rendered `<p>`), and
`app/(de)/layout.tsx:12` as `"Entwickler."`. The UI-SPEC introduces a fourth, named
`POSITIONING_PLACEHOLDER`.

**How to avoid:** make `POSITIONING_PLACEHOLDER` the *only* English statement of it. Export it
from `lib/work.ts` (or a small `lib/landing.ts`), render it in the `<p>`, **and** use it as
`app/(en)/page.tsx`'s `metadata.description` — the page-level export overrides the layout's
for `/` while leaving `/writing`'s own description intact. The German layout's
`"Entwickler."` stays as-is; the landing is EN-only and `/texte` overrides its own description.
This makes `HOME-01` arriving a genuine one-line edit and strengthens the UI-SPEC's tripwire,
which currently relies entirely on a source comment.

**Warning signs:** more than one occurrence of the positioning string in `git grep`.

### Pitfall 7 — a rendered placeholder marker

**What goes wrong:** `[positioning sentence — TODO]` or a greyed-out stub ships to a live URL
during a job hunt.

**Why it happens:** `D-08` says "clearly-marked placeholder" and `D-02` says "deliberately
typeset". Read separately they conflict.

**How to avoid:** they resolve exactly one way and the UI-SPEC states it — **the placeholder
is marked in the source, not on the screen.** A named exported constant with a comment naming
`HOME-01`. Nothing on screen says "placeholder", "coming soon", "TBD" or "under construction".
The same applies to the backlog stub, the contact stub and `/cv`, whose copy is already
drafted in the Copywriting Contract.

**Warning signs:** any of those four words in the rendered `body.innerText` of `/` or `/cv`.
This is directly assertable — see *Validation Architecture*.

---

## Code Examples

All snippets below compose only shipped primitives. Class names were verified to generate CSS
by a direct `@tailwindcss/postcss` compile of `app/globals.css` today.

### Verified Tailwind v4 output for every utility this phase needs

```
.scroll-mt-xl  { scroll-margin-top: var(--spacing-xl); }     /* 32px  — anchor offset   */
.py-xs         { padding-block: var(--spacing-xs); }         /* 4px   — target-size fix */
.gap-x-lg      { column-gap: var(--spacing-lg); }            /* 24px  — nav row         */
.gap-y-md      { row-gap: var(--spacing-md); }               /* 16px  — nav wrap        */
.gap-3xl       { gap: var(--spacing-3xl); }                  /* 64px  — section rhythm  */
.pt-xl         { padding-top: var(--spacing-xl); }           /* 32px  — separator air   */
.px-lg         { padding-inline: var(--spacing-lg); }        /* 24px  — page gutter     */
.max-w-prose   { max-width: 65ch; }                          /* the reading measure     */
.flex-wrap     { flex-wrap: wrap; }
.inline-block  { display: inline-block; }
.list-none     { list-style-type: none; }
.border-t      { border-top-style: var(--tw-border-style); border-top-width: 1px; }
.border-rule   { border-color: var(--color-rule); }          /* REQUIRED with border-t  */
.border-ink    { border-color: var(--color-ink); }
```

Named `--spacing-*` tokens **do** drive `scroll-mt-*` and `py-*` in Tailwind v4 — this was the
one thing worth checking, because the v4 docs describe `scroll-mt-<number>` as resolving via
`calc(var(--spacing) * n)`, and this repo defines named keys rather than a `--spacing` base.
It works. [VERIFIED: direct compile]

### The three new CSS classes

```css
/* app/globals.css — append beneath the existing role classes.
   Every value below already appears in this file. */

.section-head {                                    /* == .prose-site h2, minus prose margins */
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.3;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-ink);
}

.link {                                            /* == .prose-site a, verbatim */
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.12em;
  text-decoration-color: currentColor;
}
.link:hover, .link:focus-visible {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.link-quiet { color: inherit; text-decoration: none; }
.link-quiet:hover, .link-quiet:focus-visible {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.12em;
  text-decoration-color: var(--color-accent);
}

.link:focus-visible, .link-quiet:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* The state change is NOT motion — only the transition is gated. */
@media (prefers-reduced-motion: no-preference) {
  .link       { transition: color 120ms ease-out, text-decoration-color 120ms ease-out; }
  .link-quiet { transition: color 120ms ease-out; }
}
```

### `lib/work.ts`

```ts
// Work-list entries are data, not markup (D-05). Adding a third item is a
// change to WORK and nothing else.
export type WorkEntry = {
  title: string;       // the piece's PUBLISHED headline — never a repo name (D-06)
  annotation: string;  // one line. What it is ABOUT, never what it was built with (WORK-02, D-09)
  href: string;        // absolute URL to the live piece (D-06)
  host: string;        // the destination host, rendered as the outbound marker
};

// A non-empty tuple: an empty work list is a build error, not a UI state (D-03).
export const WORK: readonly [WorkEntry, WorkEntry] = [
  {
    title: "Everyone in Mallorca Knows It",
    annotation:
      "The Balearics stopped gaining on Europe in 1993 — while tourist arrivals went on tripling.",
    href: "https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing",
    host: "ib-gdp.guillemgelabert.com",
  },
  {
    title: "Watch People Die Live",
    annotation:
      "Roughly two people die every second: where they are, when it happens, and who they were.",
    href: "https://watchpeopledie.live",
    host: "watchpeopledie.live",
  },
] as const;

// Phase 4 D-15 locks this. The featured slot resolves it through publishedFor("en");
// a null result IS the interim state. There is no boolean to flip.
export const CASE_STUDY_SLUG = "the-chart-therefore-changes";

// HOME-01 — awaiting the user's sentence (D-08). Marked HERE, in source, and never
// on screen (D-02). Also serves as app/(en)/page.tsx's metadata.description so the
// real sentence is a ONE-LINE change when it arrives.
export const POSITIONING_PLACEHOLDER = "Developer.";
```

Both titles were verified against the live pages today: the ib-gdp EN page's `<title>` is
`Everyone in Mallorca Knows It · IB GDP`, and `watchpeopledie.live`'s `<title>` is
`Watch People Die Live`. (Note: WPD's rendered `<h1>` is `Every flash is a death.` — the
UI-SPEC's choice of the `<title>` string as the entry title is the right one; it is the
piece's name, not its opening line.)

### The work-list row, with the separator done correctly

```tsx
<ol role="list" className="flex list-none flex-col gap-xl">
  {WORK.map((entry, i) => (
    <li
      key={entry.href}
      className={
        "flex flex-col gap-sm" +
        (i > 0 ? " border-t border-rule pt-xl" : "")  // border-rule is NOT optional — Pitfall 1
      }
    >
      <p className="text-label" aria-hidden="true">
        {String(i + 1).padStart(2, "0")}
      </p>
      <h3 className="text-standfirst">
        <a className="link-quiet" href={entry.href}>{entry.title}</a>
      </h3>
      <p className="max-w-prose text-body">{entry.annotation}</p>
      <p className="text-label">{entry.host}</p>
    </li>
  ))}
</ol>
```

`gap-xl` (32px) between rows plus `pt-xl` (32px) on the bordered row puts the hairline exactly
midway: 32px air / 1px rule / 32px air. No `target="_blank"`, therefore no `window.opener` and
no `rel="noopener"` needed.

### The featured slot, both states

```tsx
export function FeaturedSlot({ entry }: { entry: PostEntry | null }) {
  if (!entry) {
    return (
      <>
        {/* NOT a link: the case study does not exist and /writing is at n=0. */}
        <SmearTitle as="h3" className="text-heading">
          The case study is being written.
        </SmearTitle>
        <p className="max-w-prose text-body">
          On the Mallorca piece: what was expected, what the data showed, and how the
          visual form changed in response.
        </p>
      </>
    );
  }
  // Phase 4 turns this on by adding content/the-chart-therefore-changes.mdx.
  // Same roles, same gaps, same order — only copy and one <a> change.
  return (
    <>
      <SmearTitle as="h3" className="text-heading">
        <a className="link-quiet" href={postPath("en", entry.slug)}>
          {entry.frontmatter.title}
        </a>
      </SmearTitle>
      <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
      <PostMeta locale="en" date={entry.frontmatter.date} switchHref={null} />
    </>
  );
}
```

The interim branch uses `gap-lg` between the two children; the published branch uses `gap-lg`
then `gap-md`. Because the parent is a flex column with a single `gap`, express the
headline→body distance as `gap-lg` on the section and let `PostMeta` sit inside a nested
`flex flex-col gap-md` wrapper — the exact shape `app/(en)/writing/page.tsx:48-62` already uses.

### The `A2` locale addition

```ts
// lib/locales.ts — add to UiCopy and to BOTH UI entries.
// Identical in both locales: it is a proper noun. On /texte it carries hrefLang="en"
// (the one declared locale crossing — the landing genuinely only exists in English).
homeLink: "← Guillem Gelabert",
```

---

## State of the Art

| Old approach | Current approach | When changed | Impact on this phase |
|---|---|---|---|
| Page-level `"use client"` to reach `useSmearHeading` | `SmearTitle` leaf; page stays a Server Component | Phase 2, `02-03-PLAN.md` | The whole basis of amendment A1. `app/(en)/page.tsx` and `app/(en)/type/page.tsx` are the last two pages still on the old pattern. |
| Draft rule restated inline in `PostMeta` | One exported `isVisible` / `showDrafts` in `lib/content.ts` | WR-07 fix, 2026-08-31 | Import it. Never re-derive `NODE_ENV === "development"`. |
| `metadataBase` hardcoded in both root layouts | `SITE_URL` in `lib/site.ts`, env-overridable via `NEXT_PUBLIC_SITE_URL` | WR-10 fix, 2026-08-31 | Never write an origin literal. |
| No slug allowlist; ordering enforced by comment | `SAFE_SLUG` regex rejects non-ASCII and enforces the ordering structurally | WR-02 fix, 2026-08-31 | German slugs transliterate (`ue`/`ae`/`oe`/`ss`). `CASE_STUDY_SLUG` complies. |
| No global 404; Next's untranslated default | `app/not-found.tsx` — a third root layout, `lang="en"`, server-rendered | WR-14 fix, `39d35aa`, 2026-08-31 | Adds a **third** file to amendment A3. Supersedes the UI-SPEC's Phase 6 forward note. |
| `<hr>` styled only inside `.prose-site` → full-ink | `hr` rule hoisted to the top level, `--color-rule` | WR-06 fix, 2026-08-31 | The precedent for *Pitfall 1*. |
| `npm run lint` = 9,198 problems | 1 error, 0 warnings (`.claude/**` + Playwright output ignored) | WR-12 fix, 2026-08-31 | `npm run lint` is now a usable gate. **The 1 remaining error is a known deferred item** (`use-prefers-reduced-motion.ts:23`, `react-hooks/set-state-in-effect`). Do not fix it here — `03-UI-SPEC.md` and every prior spec forbid touching `components/smear-heading/`. Any lint acceptance criterion must be written to tolerate exactly that one error. |
| Tailwind v3 default `border-color: gray-200` | v4 preflight `border: 0 solid`, colour falls to `currentColor` | Tailwind v4 | *Pitfall 1.* |

**Deprecated / outdated in this repo's own docs:**

- `03-UI-SPEC.md`'s *Error state* row and its Phase 6 forward note — superseded by WR-14 (C-1).
- `03-UI-SPEC.md`'s *"Two properties of the shipped smear system"* framing — see C-3 and C-4.
- Phase 1's holding-page rationale (`D-05`/`D-06`) — spent; this phase is the replacement it
  was designed for.
- `tests/smear-heading.spec.ts:5-9` and `tests/reduced-motion.spec.ts:21-25` both carry
  comments explaining that they run against `/type` because *"the holding page is capped at
  name-only copy … a visitor has nothing to scroll there until Phase 3 gives it content."*
  Phase 3 gives it content. **Update those comments** and add `/` coverage; leaving them is a
  small but real documentation lie.

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node | build, `node --test` | ✓ | 22.20.0 | — |
| npm + `node_modules` | everything | ✓ | installed | — |
| Playwright chromium | route specs | ✓ | 1.62.1 | — |
| `next dev` on :3000 | every `*.spec.ts` (`webServer`) | ✓ | started and torn down during this research | — |
| Tailwind v4 compile | the three new CSS classes | ✓ | `@tailwindcss/postcss` ^4 | — |
| `ib-gdp.guillemgelabert.com` EN piece | `WORK-01`/`D-06` entry 01 href | ✓ | HTTP **200** (2026-08-31) | — |
| `ib-gdp.guillemgelabert.com` DE piece | `D-06` reference (not linked from `/`) | ✓ | HTTP **200** (2026-08-31) | — |
| `watchpeopledie.live` | `WORK-01`/`D-06` entry 02 href | ✓ | HTTP **200** (2026-08-31) | — |
| Railway deploy `web-production-9cedb.up.railway.app` | `BUILD-02`, deploy-first increments | ✓ | HTTP **200** (2026-08-31) | — |
| `content/the-chart-therefore-changes.mdx` | featured slot *published* state | ✗ | — | **The interim state is the fallback, by design.** Phase 4 supplies it. |
| `/cv` route | `HOME-03` nav target | ✗ | currently **404** (measured) | None — creating it is in scope (`D-02`). |
| `_pm/kanban.md` (CLAUDE.md directive) | task bookkeeping | ✗ | no `_pm/` directory | Note only; do not create speculatively. |

**Missing dependencies with no fallback:** none that block execution.
**Missing with fallback:** the case-study MDX (interim state), `/cv` (built this phase).

---

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`.

### Test framework

| Property | Value |
|----------|-------|
| Framework (browser/route) | Playwright **1.62.1**, `chromium` project only |
| Framework (unit / contract / build) | `node:test` + `node:assert` — no config file; Node 22.20 strips TS natively |
| Config file | `playwright.config.ts` — `testDir: ./tests`, `testMatch: **/*.spec.ts`, `webServer: npm run dev` on :3000, `reuseExistingServer` off-CI |
| Quick run command | `npx playwright test tests/<file>.spec.ts` · `node --test tests/unit/<file>.test.ts` |
| Full suite command | `npm run test:unit && npx playwright test` |
| Production-truth command | `rm -rf .next && npm run build && npm run test:build` (= `npm run test:all` minus the final Playwright pass) |
| Type gate | `npx tsc --noEmit` |
| Lint gate | `npm run lint` — **expects exactly 1 known error** (deferred item, `use-prefers-reduced-motion.ts:23`). Do not write a criterion of "0 errors". |
| Estimated runtime | Playwright ~6 s current; unit <1 s; clean build ~30–60 s |

**Framework install needed: none.**

### Phase requirements → test map

| Req ID | Behavior | Test type | Automated command | File exists? |
|---|---|---|---|---|
| **WORK-01** | `/` renders one `<ol role="list">` under `#work` with exactly 2 `<li>`, each with exactly one `<a>` (the title) | integration | `npx playwright test tests/landing.spec.ts` | ❌ Wave 0 |
| **WORK-01** | Both hrefs are the two absolute D-06 URLs; neither is a `github.com` URL (repo is private) | integration | same spec | ❌ Wave 0 |
| **WORK-01/D-05** | `WORK` is a non-empty tuple of exactly 2 well-formed `WorkEntry`s; every `href` is absolute https; every `host` is the href's hostname | unit | `node --test tests/unit/work.test.ts` | ❌ Wave 0 |
| **WORK-02** | Each row renders exactly one Body-role annotation line | integration | `tests/landing.spec.ts` | ❌ Wave 0 |
| **WORK-02/D-09** | No annotation names a tool. Absence assertion over a fixed banned list (`React`, `Next`, `D3`, `TypeScript`, `JavaScript`, `Svelte`, `WebGL`, `Python`, `built with`, `powered by`) | unit | `node --test tests/unit/work.test.ts` | ❌ Wave 0 |
| **WORK-02** | `ib-gdp-evolution` appears nowhere in the rendered page | integration | `tests/landing.spec.ts` (`body.innerText` absence) | ❌ Wave 0 |
| **HOME-01** | `<p>` under the nameplate renders `POSITIONING_PLACEHOLDER` at computed `font-weight: 530` | integration | `tests/landing.spec.ts` | ❌ Wave 0 |
| **HOME-01** | `/`'s `<meta name="description">` **equals** `POSITIONING_PLACEHOLDER` (one source — Pitfall 6) | build | `npm run test:build` | ⚠️ extend `tests/build/prerender.test.ts` |
| **HOME-01/D-02** | Rendered `body.innerText` of `/` and `/cv` contains none of `TODO`, `placeholder`, `Coming soon`, `Under construction`, `Lorem` | integration | `tests/landing.spec.ts`, `tests/cv.spec.ts` | ❌ Wave 0 |
| **HOME-03** | `nav[aria-label="Sections"]` holds exactly 5 links with hrefs `#work`, `/writing`, `#backlog`, `/cv`, `#contact` in that order | integration | `tests/landing.spec.ts` | ❌ Wave 0 |
| **HOME-03** | `/cv` responds **200** and renders an `<h1>` (it 404s today) | integration | `tests/cv.spec.ts` | ❌ Wave 0 |
| **HOME-03** | Each `section[id]` computes `scroll-margin-top: 32px` | integration | `tests/landing.spec.ts` (`getComputedStyle`) | ❌ Wave 0 |
| **HOME-03** | Every one of the 5 nav links has a computed target box ≥24 CSS px tall (WCAG 2.5.8) | integration | `tests/landing.spec.ts` (`getBoundingClientRect().height`) | ❌ Wave 0 |
| **HOME-04** | `#work` and its `<li>`s are not cards: all four border widths `0px` on `<li>` except the separator's `border-top`, `box-shadow: none`, background transparent/paper | integration | `tests/landing.spec.ts` — copy the pattern at `tests/writing-index.spec.ts:35-58` | ❌ Wave 0 |
| **HOME-04** | Separator computes `borderTopColor: rgba(0, 0, 0, 0.12)`, width `1px`, style `solid` (Pitfall 1) | integration | `tests/landing.spec.ts` — pattern at `tests/writing-index.spec.ts:100-106` | ❌ Wave 0 |
| **HOME-04** | No horizontal page overflow at **375** and **1440**; the work list stays one column at both | integration | `tests/landing-viewport.spec.ts` — pattern at `tests/fixture-viewport.spec.ts` | ❌ Wave 0 |
| **A1 (structural)** | `/` prerenders to `index.html` **and** emits `<link rel="canonical">` (the measured gap) | build | `npm run test:build` | ⚠️ extend |
| **A1 (structural)** | `app/(en)/page.tsx` contains no `"use client"` and no `useSmearHeading` import | unit | `node --test tests/unit/link-contract.test.ts` (source read) | ❌ Wave 0 |
| **CASE-03 slot** | `section#case-study` holds exactly one `h2.section-head` and exactly one `h3.text-heading` — **state-agnostic** (Pitfall 2) | integration | `tests/landing.spec.ts` | ❌ Wave 0 |
| **CASE-03 slot** | Interim copy present in **production** HTML; no `<a>` inside the interim `<h3>` | build | `npm run test:build` | ⚠️ extend |
| **HOME-06 regression** | `/` registers exactly **2** trail headings; both grow a multi-layer `text-shadow` mid-scroll and settle to `none` | integration | `tests/landing-trail.spec.ts` — pattern at `tests/smear-heading.spec.ts` | ❌ Wave 0 |
| **BUILD-05 regression** | Under `page.emulateMedia({ reducedMotion: 'reduce' })` **before** `goto`, both `/` headings stay `none` across a full scroll | integration | `tests/landing-trail.spec.ts` | ❌ Wave 0 |
| **BUILD-05** | Link hover/focus transitions live inside `@media (prefers-reduced-motion: no-preference)`; the colour/underline change does **not** | unit | `node --test tests/unit/link-contract.test.ts` | ❌ Wave 0 |
| **BUILD-06 regression** | `/` cumulative layout shift stays near zero with the much larger page (Pitfall 4) | integration | `npx playwright test tests/font-cls.spec.ts` | ✅ exists, route `/` already parameterised |
| **HOME-05 conformance** | `.section-head`/`.link`/`.link-quiet` introduce no fifth size, no third weight, no literal hex, no fourth rule weight, no `!important`; both `clamp()` curves still appear exactly once | unit | `node --test tests/unit/link-contract.test.ts` | ❌ Wave 0 |
| **A2** | `/writing` and `/texte` each render a `← Guillem Gelabert` link to `/`; the `/texte` one carries `hrefLang="en"` | integration | `npx playwright test tests/writing-index.spec.ts` (extend) | ⚠️ extend |
| **A3** | Every non-prose link on `/writing`, `/texte`, both `← Writing`/`← Texte` back links, **all three** `not-found` back links, and `LanguageSwitch` carry `.link-quiet` | integration | extend `tests/writing-index.spec.ts` + `tests/writing-not-found.spec.ts` | ⚠️ extend |
| **A4** | `/type` renders one `.section-head`, one `.link` and one `.link-quiet` specimen | integration | `npx playwright test tests/type-specimen.spec.ts` (extend) | ⚠️ extend |
| **Regression** | Every existing spec still green after de-clienting `/` and adding `/cv` | integration | `npx playwright test` | ✅ |
| **Build gate** | `rm -rf .next && npm run build` clean; route keys include `""` and `cv` | build | `npm run test:build` | ⚠️ extend `prerender.test.ts:190-194` |

### Sampling rate

- **Per task commit:** the single spec covering that task **plus** `npx tsc --noEmit`.
  For any task touching `app/globals.css` or `lib/work.ts`, also `npm run test:unit` (<1 s).
- **Per wave merge:** `npm run test:unit && npx playwright test`.
- **Phase gate:** `rm -rf .next && npm run build && npm run test:build && npx playwright test`,
  all green, **plus** `npm run lint` showing exactly the one known deferred error.
- **Max feedback latency:** 10 s for the commit-level loop.

**The clean-`.next` build is not optional at the phase gate.** Converting `/` from Client to
Server Component and adding `app/(en)/cv/page.tsx` are exactly the change class that stale
generated route types mask (`02-VALIDATION.md`, Phase 2's route-group lesson).

### Assertion-style rules — load-bearing, from Phase 1's scar tissue

Both are recorded in `STATE.md` § Decisions and restated in `02-VALIDATION.md`. They apply
directly here:

1. **Assert MEASURED computed values, not values assumed from the plan.**
   `tests/viewport.spec.ts:8-22` had to assert the real `clamp()` output (139.2 px at 1440 px)
   rather than the plan's "≈180 px near-ceiling" assumption. Concretely for Phase 3:
   - The nameplate at 1440 px is **139.2 px**, not 180 px. Reuse `viewport.spec.ts`'s
     `clampPx()` helper rather than hardcoding.
   - The featured `<h3>` **does** saturate its 72 px ceiling by 1440 px.
   - A Label-role link's line box is **18.2 px**; with `py-xs` it is **26.2 px**. Assert the
     measured `getBoundingClientRect().height`, not the arithmetic.
   - The separator colour is `rgba(0, 0, 0, 0.12)` as a computed string — assert that exact
     form, as `tests/writing-index.spec.ts:104` already does.
2. **`page.emulateMedia({ reducedMotion: 'reduce' })` called BEFORE `page.goto()`.**
   Playwright's `reducedMotion` context/test option was found unreliable for `matchMedia` in
   this environment (1.62.1 / Chromium). `tests/reduced-motion.spec.ts:20` is the reference.
   Ordering matters: the app reads `matchMedia(...).matches` at mount, so emulation applied
   after navigation tests the `change`-listener path rather than the visitor-arrives-with-the-
   preference path.

A third rule, earned in this research and worth adding to the phase's record:

3. **Assert production truth in `tests/build/`, dev truth in Playwright.** Every `*.spec.ts`
   runs against `npm run dev` where `showDrafts()` is `true`. Any assertion whose result
   depends on draft visibility — which now includes the featured slot's state — belongs in
   `tests/build/prerender.test.ts`, reading real HTML from `.next/server/app`. Playwright
   asserts structure; the build test asserts copy. (Pitfall 2.)

### Wave 0 gaps

Files that must exist before the implementation waves can be verified:

- [ ] `lib/work.ts` — the unit under test for `WORK-01`/`WORK-02`/`D-05`
- [ ] `tests/unit/work.test.ts` — tuple shape, absolute https hrefs, host↔href agreement, banned-tool-word absence
- [ ] `tests/unit/link-contract.test.ts` — the `globals.css` gate for the three new classes, reusing the parser from `tests/unit/prose-contract.test.ts` (extract `extractBlocks` / `declarationsOf` / `valuesOf` to a shared helper, or import them)
- [ ] `tests/landing.spec.ts` — `HOME-01`/`03`/`04`, `WORK-01`/`02`, slot structure, target size, no-placeholder-words
- [ ] `tests/landing-viewport.spec.ts` — 375 / 1440, no horizontal overflow, single column
- [ ] `tests/landing-trail.spec.ts` — 2 registered headings, smear-and-settle, reduced-motion
- [ ] `tests/cv.spec.ts` — 200, `<h1>`, back link, no placeholder words
- [ ] Extend `tests/build/prerender.test.ts` — route keys `""` and `cv`; `/`'s canonical; `description === POSITIONING_PLACEHOLDER`; interim slot copy; no `<a>` in the interim `<h3>`
- [ ] Extend `tests/writing-index.spec.ts`, `tests/writing-not-found.spec.ts`, `tests/type-specimen.spec.ts` — A2/A3/A4
- [ ] Update the stale comments in `tests/smear-heading.spec.ts:5-9` and `tests/reduced-motion.spec.ts:21-25` (they assert `/` has nothing to scroll — no longer true)

**Framework install:** none.

### Manual-only verifications

| Behavior | Requirement | Why manual | Instructions |
|---|---|---|---|
| The work section reads as hierarchy, not as two unrelated pages | UI-SPEC Dimension-2 flag #1 | Optical. 18 px Newsreader titles at n=2 beneath a 72 px Humane headline. No assertion can prove "reads as hierarchy". | Load `/` at **1440 px**. If the work section reads thin, the remedy is **more space and the existing rules — not a fifth type size**. |
| The 375 px pass | UI-SPEC designated optical checkpoint | Three specific failures are visual: whether the 5-item contents list wraps to a readable 2–3 rows rather than a ragged column; whether the ordinal-above-title stack reads as one row rather than four loose lines; whether the nameplate at its 56 px floor sits comfortably above the positioning sentence. | Load `/` and `/cv` at **375 px**. |
| The two `WORK-02` annotations are drafts | `D-09` | They satisfy the requirement as written but are not final copy. | Surface both lines to the user as editable at phase close. |
| `HOME-01` is still outstanding | `D-08`, UI-SPEC checklist item 1 | **The tripwire.** The placeholder is marked in source, not on screen, so the landing *looks finished* while the site's central sentence is unwritten. No visual pass can catch it. | Record as **deferred-by-decision** by name in the phase verification record, and carry it into every subsequent phase's state until the user supplies the sentence. It must never reach the `FIND-02` flag flip still holding `Developer.` |

### Validation sign-off criteria

- [ ] Every map row has a passing command
- [ ] No 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all ❌ rows
- [ ] No watch-mode flags
- [ ] Commit-level feedback latency < 10 s
- [ ] The four UI-SPEC phase-completion checklist items are carried into the verification record

---

## Security Domain

`security_enforcement` is not set in `.planning/config.json`; absent = enabled.

### Applicable ASVS categories

| ASVS category | Applies | Standard control |
|---|---|---|
| V2 Authentication | **no** | No accounts, no login, no session. |
| V3 Session Management | **no** | No session; the site is statically prerendered. |
| V4 Access Control | **yes, inherited** | `lib/content.ts:215-219` — route handlers must call `findBySlug(await publishedFor(locale), slug)` **before** `loadPostModule`. Phase 3 calls only the first half, so the boundary is satisfied vacuously. Do not add a `loadPostModule` call to the landing. |
| V5 Input Validation | **yes, but no new surface** | Phase 3 accepts **zero visitor input**: no forms, no query params, no route params, no `searchParams`. `SAFE_SLUG` (`lib/content.ts:122`) and `assertFrontmatter` (`:34`) remain the build-time validators; `CASE_STUDY_SLUG` is a module constant, not input. |
| V6 Cryptography | **no** | No secrets handled in application code. |
| V12 File & Resource | **yes, inherited** | `CONTENT_DIR` is a fixed module-scope constant (`lib/content.ts:25`); no caller-supplied path reaches `readdir`. Unchanged by this phase. |
| V14 Configuration | **yes** | `robots: { index: false }` must stay on (Phase 1 D-07). `NEXT_PUBLIC_SITE_URL` is the only env var; it is a public origin, not a secret, and the `NEXT_PUBLIC_` prefix correctly signals that. |

### Known threat patterns for this stack

| Pattern | STRIDE | Standard mitigation | Status in Phase 3 |
|---|---|---|---|
| Reverse tabnabbing via `target="_blank"` | Tampering | `rel="noopener noreferrer"` | **Structurally absent.** The UI-SPEC mandates same-tab outbound links, so no `window.opener` is ever created. If a planner adds `target="_blank"` they must also add `rel="noopener"`. |
| Path traversal into the content loader | Info disclosure | `SAFE_SLUG` allowlist before dynamic `import()` | Inherited and unreached — Phase 3 never calls `loadPostModule`. |
| XSS via unescaped content | Tampering | React escapes by default; no `dangerouslySetInnerHTML` anywhere | Phase 3 renders only literal strings and typed module data. **Do not introduce `dangerouslySetInnerHTML`** for the "rich-text" backlog descriptions — that is Phase 5, and MDX is the answer there. |
| Premature indexing of an in-progress site | Info disclosure | `robots: { index: false }` in both root layouts | In force and inherited by `/cv`. **Phase 3 must not touch it.** |
| Leaking a private repo | Info disclosure | Never link to `ib-gdp-evolution` source (`D-06`) | Assertable: no `github.com` href on `/`. Added to the test map. |
| CSP blocking Shiki's inline token styles | DoS (visual) | `style-src 'self' 'unsafe-inline'` | **Phase 6's problem, recorded in `02-UI-SPEC.md`.** Phase 3 surfaces have no `<pre>`, so nothing here changes the calculus. |

**Nothing in this phase widens the attack surface.** The landing accepts no input, performs no
mutation, calls no third-party script, and ships no new dependency.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | Widening `SmearTitle`'s `as` union to include `"h3"` type-checks with no other edit. Verified by grep over all 7 call sites and by TypeScript's JSX-intrinsic-union rule; **not** verified by running `tsc` against the edited file (the edit is Phase 3's to make). | *`SmearTitle`'s `as` union* | Very low. `npx tsc --noEmit` after the one-line change is the gate; it takes seconds. |
| A2 | `next/font/google`'s auto-generated metric-adjusted fallback keeps `/`'s CLS near zero at the landing's much larger Newsreader volume. Reasoned from the loader's documented behaviour, not measured against the not-yet-built page. | *Pitfall 4* | Medium. `tests/font-cls.spec.ts` already covers `/` and will catch it. Remedy is `adjustFontFallback`, not a looser threshold. |
| A3 | Splitting the landing into `components/landing/*.tsx` versus inlining the sections in `app/(en)/page.tsx` is a readability judgement with no functional difference. | *Recommended structure* | None. Marked `planner may override`. |
| A4 | `/cv` should also declare `alternates: { canonical: "/cv" }`. The UI-SPEC specifies only `title`. This is a consistency recommendation with `/writing`, not a spec requirement. | *Pitfall 5* | None. If declined, Phase 6 adds it with the rest of `FIND-01`/`FIND-02`. |
| A5 | Making `POSITIONING_PLACEHOLDER` serve as `/`'s `metadata.description` is an improvement on the UI-SPEC, which does not mention metadata for the placeholder. | *Pitfall 6* | None functionally; it removes a duplicate rather than adding one. Worth a moment of planner judgement because it slightly extends A1's scope. |
| A6 | The German root layout's `description: "Entwickler."` should stay untouched. The landing is EN-only (`I18N-01` is writing-scoped), `/texte` overrides its own description, so the German layout default is only ever seen by a hypothetical future `/startseite`. | *Pitfall 6* | Low. Leaving it costs nothing today. |
| A7 | `npm run lint` will still show exactly 1 error after this phase (the deferred `use-prefers-reduced-motion.ts` finding), assuming no new lint rule activates from a lockfile change. | *Validation Architecture* | Low. Any acceptance criterion should be "no NEW lint errors", not "0 errors". |
| A8 | The banned-tool-word list for the `WORK-02` voice assertion is my construction, not a project artefact. It is a heuristic and could produce a false positive on a legitimate future annotation. | *Validation Architecture* | Low. It is a unit test over a 2-entry module; a false positive is a 10-second fix and the test is documenting an editorial rule that would otherwise have no gate at all. |

Everything else in this document is `[VERIFIED]` by measurement in this repo today, or
`[CITED]` from `03-UI-SPEC.md` / `03-CONTEXT.md` / `ROADMAP.md` / `02-REVIEW.md` /
`deferred-items.md` / `04-CONTEXT.md`.

---

## Open Questions

1. **Does the UI-SPEC's `A3` list extend to `app/not-found.tsx`?**
   - What we know: A3 names *"both `not-found` back links"*. There are three files, and
     `app/not-found.tsx:36` renders a bare `className="text-label"` link with no accent hover
     and only the browser-default focus ring — the exact defect A3 exists to close.
   - What's unclear: whether "both" was deliberate scoping or was written before WR-14 landed
     the same day.
   - **Recommendation: include it.** A3's own justification — *"Phase 2's Color section already
     reserves the accent for link hover/focus on **any** link, so this is conformance with the
     shipped contract, not a change to it"* — applies verbatim to the third file. Leaving one
     of three 404 pages with a different affordance is a worse outcome than a one-line overreach.
     Note it in the plan as an extension, not a silent addition.

2. **Should the landing get an `<h2>` before the section heads, or is a single `<h1>` plus four
   `<h2>`s the final outline?**
   - What we know: the UI-SPEC's Accessibility contract is explicit — one `<h1>` (nameplate),
     four `<h2>` section heads, `<h3>` for the featured headline and each work title. No level
     skipped.
   - What's unclear: nothing, actually. This is settled. Recorded only because the visual
     inversion (an `<h3>` far larger than its `<h2>`) reliably prompts a "fix" during review.
   - **Recommendation:** put the UI-SPEC's own justification in a source comment beside the
     featured `<h3>`, exactly as `app/(en)/writing/page.tsx:50-55` does for `switchHref`.

3. **`/type` remains a Client Component. Should Phase 3 de-client it too?**
   - What we know: `app/(en)/type/page.tsx:1` is `"use client"` and calls `useSmearHeading`
     five times. Amendment A4 already touches this file. After A1, it is the last page on the
     old pattern.
   - What's unclear: whether the cleanup is worth the diff, given `/type` is a specimen route
     with no metadata need and no server data.
   - **Recommendation: no.** Out of scope, no requirement behind it, and `/type` is the
     calibration reference for the trail at 5 registered headings — changing how those five
     register while also changing `/`'s trail muddies the one measurement the phase can fall
     back on. Log it as a future cleanup.

4. **Does `/` need `alternates.languages` / `x-default` like `/writing` does?**
   - What we know: `/writing` and `/texte` emit `en`, `de` and `x-default` because both exist.
     The landing is English-only for v1 by explicit UI-SPEC decision; there is no `/startseite`.
   - What's unclear: whether an `x-default` pointing at itself adds anything before `FIND-02`.
   - **Recommendation:** emit `canonical: "/"` only. Adding language alternates for a language
     that does not exist would be a lie in the markup. Revisit if `/startseite` is ever built.

---

## Sources

### Primary (HIGH confidence — measured in this repo, 2026-08-31)

- **Chromium/Playwright benchmark of `components/smear-heading/smear-heading-provider.tsx`** —
  real rAF frame deltas on `/type` (5 registered headings, 168 samples) and isolated `draw()`
  cost at N ∈ {1,2,5,10,20,40} at the 240-layer clamp.
- **A/B `documentTop` staleness test** — 464 px induced drift, 12 identical scroll steps,
  layer counts and first-layer offsets compared; plus a mid-scroll-reflow trace over 25 frames.
- **Direct `@tailwindcss/postcss` compile of `app/globals.css`** — generated CSS for
  `scroll-mt-xl`, `py-xs`, `gap-x-lg`, `gap-y-md`, `gap-3xl`, `pt-xl`, `px-lg`, `max-w-prose`,
  `flex-wrap`, `inline-block`, `list-none`, `border-t`, `border-rule`, `border-ink`,
  `text-ink`, `text-accent`, `bg-paper`, `outline-accent`, and the v4 preflight border reset.
- **HTTP inspection against `npm run dev`** — head metadata for `/` and `/writing`; status and
  markup for `/nope` (404, real boundary), `/cv` (404, does not exist), and
  `/writing/does-not-exist` (404, `id="__next_error__"` — CR-01 still open).
- **Live destination checks** — `ib-gdp.guillemgelabert.com` EN + DE, `watchpeopledie.live`,
  and the Railway deploy, all HTTP 200; `<title>` strings read from the two live pieces.
- **Repo source, read in full:** `app/(en)/page.tsx`, `app/(en)/layout.tsx`,
  `app/(de)/layout.tsx`, `app/not-found.tsx`, `app/(en)/writing/page.tsx`,
  `app/(en)/writing/[slug]/page.tsx`, `app/(en)/writing/not-found.tsx`,
  `app/(de)/texte/page.tsx`, `app/(en)/type/page.tsx`, `app/globals.css`, `lib/content.ts`,
  `lib/locales.ts`, `lib/site.ts`, `components/smear-title.tsx`, `components/post-meta.tsx`,
  `components/language-switch.tsx`, `components/prose.tsx`, all three
  `components/smear-heading/*`, all three `app/fonts/*`, `next.config.ts`, `package.json`,
  `playwright.config.ts`, `eslint.config.mjs`, `.gitignore`, and the full `tests/` tree.
- **Context7 → `/websites/nextjs`** — confirmation that `metadata` and `generateMetadata`
  exports are unsupported in Client Components (documented for `global-error`, which is the
  same constraint: *"because error boundaries must be Client Components, metadata and
  generateMetadata exports are not supported"*).
- **Context7 → `/tailwindlabs/tailwindcss.com`** — `scroll-margin` utility reference and the
  spacing-scale customisation model.

### Secondary (HIGH confidence — project documents of record)

- `.planning/ROADMAP.md` § Phase 3 — the authoritative requirement list.
- `.planning/REQUIREMENTS.md` — traceability table, Out of Scope.
- `.planning/PROJECT.md` — allocation principle, Out of Scope, the "looks like data, isn't" trap.
- `.planning/phases/03-work-list-landing-skeleton/03-CONTEXT.md` — D-01…D-10, discretion, deferred.
- `.planning/phases/03-work-list-landing-skeleton/03-UI-SPEC.md` (status `approved`) — the design contract.
- `.planning/phases/02-content-pipeline/02-UI-SPEC.md` (Revision 2) — Prose Contract, Motion Contract, three-rule-weight budget, accent reservation.
- `.planning/phases/02-content-pipeline/02-REVIEW.md` — CR-01…CR-03, WR-01…WR-14, IN-01…IN-06.
- `.planning/phases/02-content-pipeline/deferred-items.md` — CR-01 disposition; the lint deferral.
- `.planning/phases/02-content-pipeline/02-VALIDATION.md` — the validation-doc format, the clean-`.next` rule, the two assertion-style rules.
- `.planning/phases/04-the-case-study/04-CONTEXT.md` — D-15 (`CASE_STUDY_SLUG = "the-chart-therefore-changes"`), D-16, integration points.
- `.planning/STATE.md` — the two Phase 1 assertion lessons, accumulated decisions.
- `./CLAUDE.md`, `~/.claude/CLAUDE.md` — project and global directives.

### Tertiary (needs validation)

- None. Every claim above is either measured in this repo, cited from a project document of
  record, or explicitly listed in the *Assumptions Log*.

---

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|---|---|---|
| Standard stack | **HIGH** | Zero new dependencies; every version read from the committed lockfile-backed `package.json`. Nothing to be wrong about. |
| Architecture / composition | **HIGH** | The de-clienting pattern is already shipped and working on two routes. The featured-slot resolution was traced line-by-line through the current `lib/content.ts` and its state today was derived and cross-checked against the existing production build tests. |
| Smear-trail performance | **HIGH** | Directly benchmarked in Chromium against the shipped code at six heading counts plus an end-to-end frame-delta trace. |
| `documentTop` staleness | **HIGH** | Algebraic argument **and** a controlled A/B measurement **and** a mid-scroll-reflow trace, all agreeing. This contradicts the approved UI-SPEC, so it was tested three ways rather than one. |
| Tailwind v4 utility generation | **HIGH** | Direct compiler output, not documentation inference. |
| `SmearTitle` union widening | **HIGH** | All 7 call sites enumerated; four independent failure modes checked. Only `tsc` itself is unrun (see A1). |
| Pitfalls | **HIGH → MEDIUM** | Pitfalls 1, 2, 3, 5, 6, 7 are measured or derived from recorded review findings in this repo. Pitfall 4 (CLS on the enlarged landing) is reasoned, not measured — the page does not exist yet (A2). |
| Validation architecture | **HIGH** | Every command in the map runs today; every ⚠️ row names the exact existing file to extend and, where useful, the exact line range of the pattern to copy. |

**Research date:** 2026-08-31
**Valid until:** 2026-09-30 for the stack and pattern claims (nothing here is fast-moving —
no new dependency, and the framework is version-pinned). **Valid until the next commit** for
the measured claims about `app/(en)/page.tsx` and `app/(en)/cv/page.tsx`, which this phase
exists to change.
