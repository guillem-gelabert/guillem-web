# Phase 5: Backlog - Research

**Researched:** 2026-08-31
**Domain:** Static content curation in a shipped React Server Component landing view; build-time and repo-level data validation
**Confidence:** HIGH (every load-bearing claim below was measured in this repo or in a purpose-built git fixture during this session; see Sources)

## Summary

This phase has almost no unknown technology in it. Every class, token, component shape and
test harness it needs is already shipped and already gated. The research effort therefore
went almost entirely into three places where the phase can silently fail: a **hard blocker**
between two locked decisions, the **cost of removing the Phase 3 stub**, and the **actual
grounding** for the three items.

The hard blocker, found by measurement and confirmed with a reproduction: **`node --test`
cannot import a `.tsx` file.** `D-05` locks the module as `lib/backlog.tsx` (JSX is the whole
reason) and `D-09` locks a `tests/unit/` `node --test` check that reads `LAST_TOUCHED` from
that module. Node 22.20's type stripping registers `.ts`/`.mts`/`.cts` only; importing
`.tsx` throws `ERR_UNKNOWN_FILE_EXTENSION`. Both decisions survive intact if the test reads
the module as **source text** rather than importing it — which is already this repo's
established pattern for asserting facts about `.tsx` files
(`tests/unit/link-contract.test.ts:265-311` reads `app/(en)/page.tsx` with `readFileSync`).
No new dependency, no module split, no change to a locked decision.

The git guard works, but only with three explicit skip conditions, one of which is
non-obvious and was proven with a fixture: **in a shallow clone,
`git log -1 --format=%cs -- <path>` returns HEAD's date, not the file's** — a guaranteed
false positive in any `--depth 1` CI clone. The Railway risk `D-09` worries about does not
actually exist (the build script never runs tests), but the shallow-clone and
uncommitted-file cases do, and a guard that skips on all of them without saying so is the
"silently never runs" failure. A five-branch probe covering clean, dirty, shallow, non-repo
and git-absent was written and all five branches verified.

The three items are grounded in real, checkable current work. Two are strongly in motion
(one touched **today**), one is twelve days old. Two projects that looked like candidates by
directory timestamp turned out to be `.DS_Store` noise or superseded by the user's own
written record, and are excluded with evidence rather than by taste.

**Primary recommendation:** Read `LAST_TOUCHED` out of `lib/backlog.tsx` as source text in a
shared `tests/unit/backlog-source.ts` helper (mirroring `css-source.ts` / `case-study-source.ts`);
gate the git comparison on `rev-parse --is-inside-work-tree`, `rev-parse --is-shallow-repository`
and `status --porcelain`, falling back to the file's mtime when the module is dirty so the guard
is non-vacuous during the phase's own execution; ship three items — the Swiss commodity-market
thesis, the Zürich house-name story, and the Pudding corpus study — in that order.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Curation — what qualifies and how much**

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

**Content shape and source of truth**

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

**Presentation inside Phase 3's slot**

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

**Copy ownership**

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

### Deferred Ideas (OUT OF SCOPE)

- **Per-item dates, states, and progress — permanently out for v1.** Explicit user
  decision, logged in `PROJECT.md` Key Decisions and `REQUIREMENTS.md` Out of Scope. Not
  reopened by this phase, and not to be reintroduced as badges, meters, ordering by
  recency, or an optional link that only some items carry.
- **`RICH-02` — the backlog as encoded data or a chart — v2.** Depends entirely on the
  per-item data above.
- **German backlog (`/startseite`) — deferred with the German landing.** `I18N-01` is
  scoped to writing and is complete. Nothing here should be pre-localised into
  `lib/locales.ts`'s `UI` map.
- **A fourth and fifth item — future.** `D-02`'s ceiling is four.
- **Linking a backlog item to a live artifact — future.** When an item ships it stops
  being backlog and becomes work-list or writing.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BACK-01 | Visitor can see a backlog of work in progress, each item carrying a name and a rich-text description. | *Standard Stack* (zero new dependencies); *Architecture Patterns* → `lib/backlog.tsx` shape and `<BacklogList>` markup; *Q4* → the three grounded items with evidence; *Q3* → how inline rich text is authored in `.tsx` and what preflight does to `<strong>` |
| BACK-02 | Visitor can see a single "last touched" date for the backlog section as a whole. | *Q1* → the complete two-guard mechanism, five verified branches, the `.tsx`/`node --test` blocker and its resolution; *Code Examples* → the `<time dateTime>` line and the `datetime` vs `dateTime` prerender trap |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

| Directive | Source | Bearing on this phase |
|-----------|--------|----------------------|
| MVP first. No polishing until the core works. | `./CLAUDE.md` | Do not add a `.text-body strong` rule, a `<hr>` variant, or a fourth item "while we're in there". |
| Update `_pm/kanban.md` when completing tasks. | `./CLAUDE.md` | Phase 5 must add a `## Done` entry. `_pm/kanban.md:9-27` shows the format; Phases 1–4 all have one. |
| Goal: land a job in data journalism / dataviz / creative dev. | `./CLAUDE.md` | The three items are chosen to be legible to that specific hiring audience, not to be a complete inventory. |
| Questions are questions, not action requests; surfaced problems are proposed as questions. | `~/.claude/CLAUDE.md` | The open questions in this document are questions. The autonomous directive covers execution, not the editorial calls flagged in *Open Questions*. |

**No CLAUDE.md directive conflicts with any locked decision.**

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Backlog item content (name + description) | Build-time data module (`lib/backlog.tsx`) | — | `D-05`. Same tier as `lib/work.ts`. No runtime fetch, no filesystem read, no CMS. |
| Backlog list rendering | Frontend Server (RSC) | — | `app/(en)/page.tsx` is a Server Component with no client directive (asserted by `tests/unit/link-contract.test.ts:270-291`). Nothing here is interactive; no `"use client"` may be introduced. |
| `LAST_TOUCHED` shape/not-future validation | Build-time module evaluation | — | `D-09.1`. Runs when `next build` prerenders `/` and imports the module. Never at request time — there is no runtime error state on the landing view. |
| `LAST_TOUCHED` freshness vs. git history | Repo test tier (`tests/unit/`, `node --test`) | Filesystem mtime (dirty-worktree fallback) | `D-09.2`. Deliberately *not* build-time: git metadata is absent or misleading in build environments (see *Q1*). |
| Date formatting | Build-time (`formatPostDate` in `lib/locales.ts`) | — | Absolute, UTC-pinned, rendered once at build. `D-12` rules out any client-side relative formatting. |
| Stub removal + launch-gate bookkeeping | Test tier + planning records | — | The Phase 3 stub is deleted from `#backlog` only; `SectionStub` stays mounted at `#contact`. See *Q2*. |

**No capability in this phase belongs to the browser tier.** The landing view ships zero JS
for this section, and `tests/landing.spec.ts:427` (`main button` count 0) plus `:194`
(`a[href*="github.com"]` count 0) are the standing gates.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| — | — | — | **This phase installs nothing.** |

Every capability is already present: React 19.2.8 + Next 16.3.3 for the Server Component,
Tailwind v4 for the utility classes, `node:test` + `node:assert/strict` for the unit tier,
`node:child_process.spawnSync` for the git probe, `@playwright/test` 1.62.1 for the rendered
tier. `[VERIFIED: package.json read this session]`

### Supporting (already shipped, all used by this phase)

| Asset | Location | Purpose | Verified |
|-------|----------|---------|----------|
| `formatPostDate(iso, locale)` | `lib/locales.ts` | Renders `31 August 2026`; UTC-pinned so `process.env.TZ` cannot shift it (`tests/unit/dates.test.ts:22-27`) | `[VERIFIED: file read]` |
| `<time dateTime={date}>` pattern | `components/post-meta.tsx:29` | The exact markup `D-12` reuses | `[VERIFIED: file read]` |
| `.link` | `app/globals.css:~330` | Underlined inline link outside `.prose-site`; `.prose-site a` verbatim | `[VERIFIED: file read + compiled CSS]` |
| `.text-standfirst` / `.text-body` / `.text-label` | `app/globals.css` | The three type roles this section uses | `[VERIFIED: file read]` |
| `.section-head` | `app/globals.css` | Already on `#backlog`'s `<h2>`; untouched | `[VERIFIED: prerendered HTML]` |
| `max-w-prose` → `max-width: 65ch` | Tailwind v4 default | The `D-08` measure | `[VERIFIED: compiled CSS `.max-w-prose{max-width:65ch}`]` |
| `gap-xl` / `gap-lg` / `gap-sm` / `pt-xl` / `border-rule` | Tailwind v4 + `@theme` | 32 / 24 / 8 px, and `border-color: var(--color-rule)` | `[VERIFIED: compiled CSS]` |
| `assertFrontmatter` posture | `lib/content.ts:34-76` | Collect `problems[]`, then one `throw new Error(\`file: …\`)` naming every problem | `[VERIFIED: file read]` |
| `css-source.ts` / `case-study-source.ts` | `tests/unit/` | Non-`*.test.ts` shared source-reader helpers, deliberately excluded from the `test:unit` glob | `[VERIFIED: files read]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Source-scraping `LAST_TOUCHED` from `lib/backlog.tsx` | A TS/TSX loader (`tsx`, `ts-node`, `esbuild-register`) so `node --test` could import it | New runtime dependency, a changed `test:unit` command for all 88 existing tests, and a fresh supply-chain surface — to solve a problem the repo already solves twice with `readFileSync`. **Rejected.** |
| Source-scraping | Splitting `LAST_TOUCHED` into a sibling `lib/backlog-date.ts` | Contradicts `D-09` ("in the same module") and `CONTEXT` code-context ("`lib/backlog.tsx` — the only new module this phase should need"). **Rejected.** |
| `git log -1 --format=%cs` | `--format=%as` (author date) | `%as` survives rebase/cherry-pick; `%cs` jumps forward when a commit is rewritten. `D-09` writes `%cs` explicitly and this repo merges worktrees rather than rebasing, so `%cs` is correct here. Noted as a one-token change if it ever false-positives. |
| `border-top` row separator | `<hr>` | The work list uses `border-t border-rule pt-xl` (`components/landing/work-list.tsx:17-18`). `D-10`+discretion say match the adjacent list. **Use `border-top`.** |
| `<h3 className="text-standfirst">` for item names | `<p className="text-standfirst">` | See *Pitfall 3*. `<h3>` is recommended; either choice changes `tests/landing.spec.ts:389`. |

**Installation:** none. Do not add a dependency in this phase.

## Package Legitimacy Audit

**Not applicable — this phase installs zero external packages.**

The Package Legitimacy Gate was not run because there is nothing to check. `package.json`
was read this session and confirmed to already contain every capability the phase needs
(`node:test`, `node:child_process`, `@playwright/test@^1.62.1`, `next@16.3.3`,
`react@19.2.8`). `[VERIFIED: package.json read this session]`

**If a plan proposes adding a dependency, it has taken a wrong turn.** The only plausible
temptation is a TS/TSX loader to work around the `node --test` `.tsx` limitation, and
*Q1 §D* shows why that is unnecessary.

---

## Q1 — The git-based `LAST_TOUCHED` guard

This is the phase's only genuinely novel mechanism and it has one hard blocker, one
non-obvious false-positive mode, and one way to be vacuous. All three were reproduced.

### A. The blocker: `node --test` cannot import `.tsx`

```
$ node --test t.test.ts     # t.test.ts does: await import("./mod.tsx")
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".tsx" for …/mod.tsx
    at Object.getFileProtocolModuleFormat [as file:] (node:internal/modules/esm/get_format:219:9)
Node.js v22.20.0
```

`[VERIFIED: reproduced this session in a scratch fixture, Node v22.20.0]`

Node's built-in type stripping registers `.ts`, `.mts` and `.cts`. JSX requires
transformation, not erasure, so `.tsx` is not and will not be handled by the stripper. This
is why the existing suite gets away with `await import("../../lib/work.ts")`
(`tests/unit/work.test.ts:12`) and `import { POSITIONING_PLACEHOLDER } from "../../lib/work.ts"`
(`tests/build/prerender.test.ts:5`) — both are `.ts`. **Neither technique is available for
`lib/backlog.tsx`.**

`D-05` (module must be `.tsx`) and `D-09.2` (test must be `node --test` in `tests/unit/`)
are therefore in direct conflict *as literally written*. They are both satisfiable.

### B. The resolution: read the module as source text

The repo already asserts facts about a `.tsx` file from `node --test` this exact way:

```ts
// tests/unit/link-contract.test.ts:265-267 — the shipped precedent
const LANDING_PAGE_PATH = path.join(process.cwd(), "app/(en)/page.tsx");
const landingPageSource = readFileSync(LANDING_PAGE_PATH, "utf8");
```

…and the repo already has the "shared reader, deliberately not `*.test.ts`" idiom twice:
`tests/unit/css-source.ts` (reads `app/globals.css`) and `tests/unit/case-study-source.ts`
(reads `content/*.mdx`). `case-study-source.ts:8-9` states the naming rule explicitly:
*"Deliberately NOT named \*.test.ts — `npm run test:unit` globs `tests/unit/*.test.ts`, and
Node exits non-zero on a suite with zero tests."*

**Recommendation:** add `tests/unit/backlog-source.ts` exporting the raw source plus a parsed
`LAST_TOUCHED`. It is a `.ts` file, so `tests/build/prerender.test.ts` can import it too —
which is what lets the build tier bind the rendered `<time>` to the source constant by
equality, exactly the technique the `HOME-01` gate uses for `POSITIONING_PLACEHOLDER`.

**The parse must fail loud, not fall through to a skip.** A regex that stops matching after
a refactor and yields `null` is a vacuous pass:

```ts
const match = source.match(/export const LAST_TOUCHED\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/);
if (!match) {
  throw new Error(
    'tests/unit/backlog-source.ts could not find `export const LAST_TOUCHED = "YYYY-MM-DD"` ' +
    "in lib/backlog.tsx — if the declaration was reformatted, fix this reader, do not delete it.",
  );
}
```

### C. The non-obvious false positive: shallow clones

Built a three-commit fixture where `backlog.tsx` was last changed in commit 1 (2026-01-01)
and two later commits touched a different file (2026-06-01, 2026-08-30), then cloned it at
`--depth 1`:

```
FULL:    backlog.tsx last change = [2026-01-01]     <- correct
is-shallow = true
SHALLOW: backlog.tsx last change = [2026-08-30]     <- HEAD's date, wrong
```

`[VERIFIED: fixture built and run this session, git 2.54.0]`

In a shallow clone, history simplification treats every file as *added* in the grafted root
commit, so `git log -1 -- <path>` reports HEAD's date for a file HEAD never touched. Any
`--depth 1` CI clone would therefore compare `LAST_TOUCHED` against today and fail
permanently. **`git rev-parse --is-shallow-repository` must be a skip condition.**

### D. The Railway concern is real but misdirected

`D-09` skips on unavailable git metadata "so it never breaks a Railway build". Measured:
**the Railway build never runs this test at all.** `package.json` has no `railway.json`,
`railway.toml` or `nixpacks.toml` alongside it, the build script is exactly `next build`,
and `test:unit` is a separate script never invoked by `build` or `test:all`'s build step.
`[VERIFIED: package.json + repo root listing read this session]`

The skip branch still matters — for shallow CI clones (§C), for a tarball/export directory
with no `.git` at all, and for the moment during this phase's own execution when
`lib/backlog.tsx` exists but has never been committed. Keep it; just do not justify it with
Railway, and **do not put git anywhere near the build-time validator** — that is what would
actually break a build.

### E. Detecting availability: use `git rev-parse`, never `fs.existsSync(".git")`

**In a linked git worktree, `.git` is a file, not a directory.** This repo has one right now:

```
$ file .claude/worktrees/agent-a569251ee23bdd09a/.git
… : ASCII text
$ cat .claude/worktrees/agent-a569251ee23bdd09a/.git
gitdir: /Users/…/guillem-web/.git/worktrees/agent-a569251ee23bdd09a
```

`[VERIFIED: `git worktree list` + `file` this session]`

Executors in this project run inside those worktrees. A guard written as
`existsSync(".git") && statSync(".git").isDirectory()` would skip in exactly the environment
where the phase is executed — the "silently never runs" failure, in its purest form.
`git rev-parse --is-inside-work-tree` returns `true` in a linked worktree (verified) and is
the correct probe.

### F. The vacuity problem, and the mtime fallback that fixes it

`git log -1 --format=%cs -- lib/backlog.tsx` on an **untracked or uncommitted** file exits
**0 with empty stdout** — verified against `lib/backlog.tsx` in this repo right now (the file
does not exist yet; exit 0, no output). So during the phase's own execution, before the first
commit, a naive guard has nothing to compare and would skip. It would also skip on every
later *uncommitted* edit — which is the single most likely way the date goes stale.

`git status --porcelain -- lib/backlog.tsx` distinguishes the cases cleanly (` M backlog.tsx`
verified against the fixture). When the module is dirty, compare against the file's own
**mtime date** instead. mtime is unreliable in general (a fresh clone stamps every file with
clone time), which is exactly why it must be consulted *only* when git has already confirmed
the file is dirty — a fresh clone is never dirty.

### G. The complete mechanism — probed, five branches, all verified

```ts
// tests/unit/backlog-freshness.test.ts (sketch; ROOT = process.cwd(), MODULE = "lib/backlog.tsx")
function git(args: string[]) {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (r.error) return { ok: false as const, reason: `git not runnable (${(r.error as NodeJS.ErrnoException).code})` };
  if (r.status !== 0) return { ok: false as const, reason: (r.stderr || "").trim() || `git exited ${r.status}` };
  return { ok: true as const, out: r.stdout.trim() };
}

type Verdict = { skip: string } | { source: string; date: string };

function lastChangeDate(): Verdict {
  const inRepo = git(["rev-parse", "--is-inside-work-tree"]);
  if (!inRepo.ok || inRepo.out !== "true")
    return { skip: `no git work tree: ${inRepo.ok ? inRepo.out : inRepo.reason}` };

  const shallow = git(["rev-parse", "--is-shallow-repository"]);
  if (!shallow.ok) return { skip: `shallow probe failed: ${shallow.reason}` };
  if (shallow.out === "true")
    return { skip: "shallow clone — `git log -- <path>` reports HEAD's date, not the file's" };

  const dirty = git(["status", "--porcelain", "--", MODULE]);
  if (!dirty.ok) return { skip: `status failed: ${dirty.reason}` };
  if (dirty.out !== "")
    return {
      source: "worktree mtime (module has uncommitted changes)",
      date: new Date(statSync(path.join(ROOT, MODULE)).mtime).toISOString().slice(0, 10),
    };

  const log = git(["log", "-1", "--format=%cs", "--", MODULE]);
  if (!log.ok) return { skip: `log failed: ${log.reason}` };
  if (log.out === "") return { skip: "clean, but no commit touches the module yet" };
  return { source: "git log -1 --format=%cs", date: log.out };
}
```

Probe results, run this session:

| Environment | Branch taken | Output |
|-------------|--------------|--------|
| This repo, `lib/work.ts`, clean | `git log -1 --format=%cs` | `2026-08-31` |
| Fixture, clean full clone | `git log -1 --format=%cs` | `2026-01-01` (correct) |
| Fixture, uncommitted edit | worktree mtime | `2026-08-31`, porcelain `M backlog.tsx` |
| Fixture, `--depth 1` clone | **skip** | *"shallow clone — git log -- \<path\> reports HEAD's date"* |
| Directory with no `.git` | **skip** | *"not a git repository (or any of the parent directories)"* |
| `PATH` without a `git` binary | **skip** | *"git not runnable (ENOENT)"* |

`[VERIFIED: all six rows executed this session]`

### H. Making the guard audibly non-vacuous

Three requirements, all cheap:

1. **Split pure logic from environment probing.** Put the comparison in a pure
   `isStale(lastTouched: string, lastChange: string): boolean` — ISO `YYYY-MM-DD` strings
   compare lexicographically as chronologically, so it is `lastChange > lastTouched`.
   Unit-test that function with fixed inputs so it is covered on **every** run, including
   runs where the environment branch skips. This mirrors how `assertFrontmatter` is tested
   (`tests/unit/content.test.ts:93-136` tests the function directly; no test proves that
   `next build` fails).
2. **Never `t.skip()` silently.** Node's test runner supports `t.skip(reason)` and
   `t.diagnostic(msg)`. Emit the verdict's `skip` string so a reader of the TAP output can
   see *which* branch fired. A skip with no reason is indistinguishable from a pass.
3. **Do not let the source-scrape skip.** §B's `throw` on a failed regex is what guarantees
   at least one hard assertion runs regardless of git.

### I. Two independent gates on the same fact — by design

`D-09` asks for two guards, and the `.tsx` blocker makes them genuinely independent
implementations rather than a duplication smell:

- **Build-time** (`lib/backlog.tsx`, module scope): shape + real-calendar-date + not-future.
  Mirrors `assertFrontmatter` — collect `problems[]`, one `throw new Error` naming all of
  them and the file. This runs because `app/(en)/page.tsx` is prerendered at build and
  imports the module; a top-level function call is a webpack side effect and `package.json`
  declares no `sideEffects: false`, so it cannot be tree-shaken. `[VERIFIED: package.json has
  no sideEffects field]` `[ASSUMED: that a module-scope throw fails `next build` with a
  non-zero exit — consistent with Next's prerender error handling but not reproduced this
  session; see Assumptions Log A1]`
- **Repo test** (`tests/unit/`): independently re-validates the literal from source text and
  adds the git/mtime freshness comparison the build cannot do.

---

## Q2 — The Phase 3 stub deletion: every assertion that breaks

Phase 4's research flagged its equivalent step as the phase's biggest hidden cost. Here is the
measured inventory. `[VERIFIED: every line below read this session]`

### Production source — 1 file, 1 line

| File:line | Current | Change |
|-----------|---------|--------|
| `app/(en)/page.tsx:83` | `<SectionStub state="Nothing listed here yet." body="The current work is being written up." />` | Replace with `<BacklogSection />` (or the date `<div>` + `<BacklogList />` inline). **`SectionStub` import at `:8` stays** — `:94` still serves `#contact`. |

Everything else on that page — `id="backlog"`, `aria-labelledby="backlog-head"`,
`scroll-mt-xl flex flex-col gap-lg`, the `<h2 id="backlog-head" class="section-head">`, and
the contents-nav entry at `components/landing/contents-nav.tsx:19` — is untouched.

### Build tier — `tests/build/prerender.test.ts`, 2 tests, 3 lines

| Line | Assertion | Why it breaks | Required change |
|------|-----------|---------------|-----------------|
| `:486` | `"Nothing listed here yet."` in the stub-copy loop | String no longer in the HTML | **Delete this array entry** |
| `:487` | `"The current work is being written up."` in the same loop | Same | **Delete this array entry** |
| `:539` | `assert.ok(root.includes("Nothing listed here yet."));` inside *"launch gate: the backlog stub and the contact stub are still interim"* | Same | **Delete the line; retitle the test; extend the header comment** |

`:517`'s test name and `:521-538`'s comment both assert *in prose* that the backlog stub is
still interim. Phase 4 already established the required treatment at `:531-538`
("NARROWED 2026-08-31 … Removing the interim headline's assertion from this assertion IS the
gate mechanism working"). **Follow that precedent exactly:** retitle to name only the contact
stub, add a dated NARROWED paragraph recording that the backlog leg closed, and — per
*Q5 §Tripwire* — add the replacement assertion for the new unreviewed-copy item so the gate
does not shrink to nothing.

`:494`'s banned-marker loop (`TODO`, `Coming soon`, `Under construction`, `Lorem`) is
**unchanged and now applies to the new item copy.**

### Playwright tier — `tests/landing.spec.ts`, 2 tests

| Line | Assertion | Why it breaks | Required change |
|------|-----------|---------------|-----------------|
| `:445-457` test **(u)** `"both stubs render one standfirst and one body line, standfirst at weight 530"` | Loops `["backlog", "contact"]`, asserting `p.text-standfirst` count **1** and `p.text-body` count **1** per section | After Phase 5, `#backlog` has three `.text-standfirst` names (or zero, if names are `<h3>` — either way not one `<p>`) and three `.text-body` descriptions | **Narrow the loop to `["contact"]`**, retitle to "the contact stub renders…", and add a new backlog-specific test (see *Validation Architecture*) |
| `:389` test **(r)** `expect(counts).toEqual({ h1: 1, h2: 4, h3: 3, … })` | Counts every `h3` in the document | Breaks **only if** item names render as `<h3>` — three more → `h3: 6` | **If `<h3>` is chosen (recommended): change `h3: 3` → `h3: 6`.** If `<p>` is chosen, no change. This is the decision fork; see *Pitfall 3* |

### Assertions that survive unchanged but now constrain the new content

These do **not** break — they are the standing gates the new markup must satisfy:

| Line | Constraint on Phase 5 |
|------|----------------------|
| `tests/landing.spec.ts:82-85` | Exactly 4 `section[id]`, ids `["case-study","work","backlog","contact"]` — do not add a section |
| `tests/landing.spec.ts:347-351` | Exactly 4 `h2.section-head` reading `["Case study","Work","Backlog","Contact"]` |
| `tests/landing.spec.ts:363-370` | Every section head keeps `1px solid rgb(0, 0, 0)` bottom rule |
| `tests/landing.spec.ts:409-412` | No `todo`/`placeholder`/`coming soon`/`under construction`/`lorem`/`tbd` in `body.innerText` — **binds the D-14 tripwire to source-only marking** |
| `tests/landing.spec.ts:427-429` | Zero `main button`, zero `img`, zero `main svg` |
| `tests/landing.spec.ts:431-440` | Every `main section, main div` — **including the new date/list `<div>`** — must compute `border-radius: 0px` and `box-shadow: none` |
| `tests/landing.spec.ts:194` | **Zero `a[href*="github.com"]` anywhere on `/`** — a backlog description may not link to GitHub |
| `tests/build/prerender.test.ts:~514` | `assert.doesNotMatch(root, /href="[^"]*github\.com[^"]*"/i)` and `assert.doesNotMatch(root, /target="_blank"/)` — same rule, production tier |
| `tests/unit/prose-contract.test.ts` (m)(n)(o) | Any CSS this phase adds to `globals.css` must stay inside four sizes / two weights / one tracking / `border-radius: 0` / no literal colour / `{1px,2px,4px}` rule widths with a `var(--color-*)` colour |
| `tests/unit/link-contract.test.ts:270-291` | `app/(en)/page.tsx` must keep no `"use client"`, no `useSmearHeading`, no `robots:` |
| `tests/type-specimen.spec.ts:29-30` | `/type` keeps exactly one `.link` and one `.link-quiet` — scoped to `/type`, unaffected by `/` |

### Non-test carried state that must also be updated

| Record | What it currently says | Required |
|--------|------------------------|----------|
| `.planning/STATE.md` → Deferred Items table | *"Four interim surfaces (featured slot, backlog stub, contact stub, `/cv`) — … blocks `FIND-02`"* | Narrow to three (contact stub, `/cv`, and the surfaces' remaining copy items) |
| `.planning/STATE.md` → Blockers/Concerns | HOME-01 tripwire + case-study editorial pass, both re-asserted | **Re-assert both, add the third (backlog copy unreviewed)** |
| `.planning/phases/03-…/deferred-items.md` §3 | Lists all four interim surfaces | Superseded for the backlog leg by Phase 5's own record — do not edit Phase 3's history; record the closure in `.planning/phases/05-backlog/` |
| `_pm/kanban.md` | Phases 1–4 in `## Done` | Add a Phase 5 entry per `CLAUDE.md`'s working agreement |

**Total honest cost of the deletion:** 1 production line, 3 build-tier lines + 2 comment
rewrites, 1 Playwright test narrowed + possibly 1 count changed, 4 planning records. Not
large — but every one of them is a *silent* failure if missed (a stale launch gate that
passes is worse than one that fails).

---

## Q3 — The `.link` class

### It exists, and it names this phase

`app/globals.css` ships it, in the `/* Link and section-head contract (03-UI-SPEC.md) */`
block: `[VERIFIED: file read + compiled CSS chunk read]`

```css
.link { color: inherit; text-decoration: underline; text-decoration-thickness: 1px;
        text-underline-offset: 0.12em; text-decoration-color: currentColor; }
.link:hover, .link:focus-visible { color: var(--color-accent); text-decoration-color: var(--color-accent); }
.link:focus-visible, .link-quiet:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
@media (prefers-reduced-motion: no-preference) { .link { transition: color 120ms ease-out, text-decoration-color 120ms ease-out; } }
```

`03-UI-SPEC.md:497` confirms the intent verbatim: *"**No Phase 3 surface currently needs
it** — the class ships so that the next phase to write a linked sentence outside
`.prose-site` (Phase 5's backlog descriptions, Phase 6's contact block) has a settled answer
rather than inventing one."*

### The budget gates already cover it — no new gate needed

| Gate | Covers `.link` | Where |
|------|----------------|-------|
| `prose-contract` (f) required-selector list | `".link"` and `".link-quiet"` are listed | `tests/unit/prose-contract.test.ts:~117-118` |
| `prose-contract` (m)(n)(o) whole-file budget | Derived by **exclusion**, so `.link` is inside it | `tests/unit/prose-contract.test.ts:~240+` |
| `link-contract` (a) | Asserts all seven `.section-head`/`.link`/`.link-quiet` selectors present | `tests/unit/link-contract.test.ts:36-49` |
| `link-contract` (b) | `.link` adds no size, weight or tracking | `:58+` |
| `link-contract` (f) | 2px accent `focus-visible` outline; `outline: none` appears nowhere | `:198+` |
| `link-contract` (g) | Every `transition` sits inside `@media (prefers-reduced-motion: no-preference)` | `:221+` |

**Phase 5 must add nothing to `globals.css` for links.** Using `.link` is conformance.

### Authoring an inline link in `.tsx`

The description is a `ReactNode`, so a link is a JSX literal in the data module:

```tsx
description: (
  <>
    Before street numbers, houses in Zürich were known by name. The question is
    how many survived — see <a className="link" href="https://example.org/thing">the source</a>.
  </>
),
```

Rules that carry over from the work list and are enforced by shipped tests:

- **No `target="_blank"`, and therefore no `rel`.** `work-list.tsx:34-40` states the reasoning
  (no new window ⇒ no `window.opener` ⇒ no reverse-tabnabbing surface to harden against) and
  `tests/build/prerender.test.ts` asserts `doesNotMatch(root, /target="_blank"/)`.
- **No `github.com` href, ever.** `tests/landing.spec.ts:194` asserts zero page-wide, and
  the production tier repeats it. This is Phase 3 `D-06`'s private-repo rule generalised to
  the whole landing view.
- **`https` only** in practice — the work-list unit test enforces it for `WORK`; nothing
  enforces it here, but a mixed-content `http` link on an HTTPS deploy would be blocked.

### Honest finding: none of the three recommended items has a public URL to link to

The Swiss commodity thesis, the Zürich house-name story and the Pudding corpus study are all
pre-publication. `D-08` says *"if a link is warranted"* — for grounded in-progress work with
no public artifact, **no link is warranted**, and `D-07`'s reasoning (a link on unfinished
work invites a click that disappoints) argues actively against manufacturing one.

**Recommendation: ship zero `<a className="link">` in Phase 5.** `.link` remains demonstrated
only on `/type` (Amendment A4). Do **not** invent a link to justify the class — that is the
tail wagging the dog, and it would put a disappointing click on the page.

### `.tsx` is still justified — by `<em>`, not by `<a>`

`D-05` says the `.tsx` extension exists because `description` is a React node. If no
description used JSX at all, that would be an unearned extension. It is earned: at least one
description legitimately needs `<em>` for a book title (*Rohstoff*), and `D-08` permits it.

**But `<strong>` is a trap — see Pitfall 1.** Tailwind v4 preflight ships
`b,strong{font-weight:bolder}` in the production CSS, which resolves to **700** against a 400
parent. `.prose-site strong { font-weight: 530 }` neutralises it *inside* prose; outside
prose there is nothing. A `<strong>` in a backlog description renders a **third weight on
screen** while every `globals.css` source-budget test stays green, because `bolder` lives in
preflight, not in `globals.css`. `[VERIFIED: `b,strong{font-weight:bolder}` found in the
compiled chunk `.next/static/chunks/449_6-5tlm8v4.css`]`

`<em>` is safe: preflight does **not** reset `font-style` on `em`, and Newsreader ships a
real italic face (`@font-face{font-family:Newsreader;font-style:italic;…}` present in the same
chunk). `[VERIFIED: compiled CSS]`

**Recommendation: `<em>` only in v1; do not use `<strong>`.** Add a Playwright assertion that
every computed `font-weight` inside `section#backlog` is `400` or `530`. If a future
description genuinely needs `<strong>`, the fix is one budget-legal line
(`.text-body strong { font-weight: 530 }`, 530 is already in `TYPE_WEIGHTS`) — but do not add
it speculatively (`CLAUDE.md`: MVP first).

---

## Q4 — What the three items actually are

### Method

Enumerated all 71 directories under `~/vault/projects/personal/`, ranked the 30 git-tracked
ones by last commit date, then corrected for two distortions: directory `mtime` is contaminated
by `.DS_Store` writes, and commit count understates notebook-heavy projects whose real work is
uncommitted. Cross-checked each surviving candidate against its own `CLAUDE.md` / `README.md` /
`planning/` records — the user's written statements about a project's status outrank inference
from timestamps.

`[VERIFIED: `git log` across 30 repos + targeted `find -newermt` + file reads, this session]`

### Evidence table

| Project | Last commit | Real last activity | Verdict |
|---------|-------------|--------------------|---------|
| `guillem-web` | 2026-08-31 | today | **Excluded — `D-03.4`** (this site itself) |
| `watch-people-die-live` | 2026-08-31 | today | **Excluded** — shipped, already work-list item 02 |
| `ib-gdp-evolution` | 2026-08-26 | — | **Excluded** — shipped, already work-list item 01 (and private) |
| **`masterarbeit`** | **2026-08-25** | **2026-08-31** (`planning/book-map.md`), 35 files since Aug 17 | **INCLUDE — item 1** |
| **`data-story-hausnamen`** | 2026-08-21 | **2026-08-26**, 5 notebooks + 7 OCR scripts touched since Aug 24 | **INCLUDE — item 2** |
| `mallorca-pools` | 2026-08-21 | Jul 29 (code) | **Excluded** — `masterarbeit/CLAUDE.md` calls it *"the **superseded topic** … frozen … kept for reference only"*. Fails `D-01` on the author's own record, not on taste. |
| `data-story-skills` | 2026-08-21 | Aug 21 | **Excluded — `D-03.2`** (own-workflow tooling; a "control layer", not work the audience is deciding on) |
| **`pudding-pudding`** | 2026-08-02 | **2026-08-19**, 425 KB generated report | **INCLUDE — item 3** (weakest on "in motion") |
| `data-story-pistachio` | — (no git) | Aug 19 | **Excluded — `D-03.3`.** Its own `notes.md`: *"Not started; deprioritised behind the disposition (15 Sep)."* The honest verb is "would like to". |
| `transport-public-ib` | 2026-08-07 | Aug 7 | **Excluded** — it is `balearic-transit-client`, an unofficial API client library. `D-03.2` (tooling/infrastructure) plus subject overlap with work-list item 01's geography. **Best alternate.** |
| `car-energy-history` | — (no git) | **2026-07-14** (code); the 4 "recent" files were all `.DS_Store` | **Excluded** — fails `D-01`'s in-motion test once the timestamp noise is removed. Genuinely range-widening; revisit if it restarts. |
| `guillem-edge` | 2026-07-23 | Jul 23 | **Excluded — `D-03.2`** (Cloudflare Worker edge router — infrastructure) |
| `value-mazzucato` | 2026-07-17 | — | **Excluded** — named in Phase 3 `D-04`'s carried exclusions |
| `rohstoff` | 2026-07-08 | — | **Not separate** — subsumed into `masterarbeit` (its notes were filed there on 2026-08-25) |
| `popup-simulator` | 2026-03-30 | — | **Excluded** — Phase 3 `D-04` |

### The three items

Each satisfies `D-01` on both legs, and the three differ from the two work-list pieces (a
Balearic economic time series; a global real-time mortality feed) and from each other on
subject, sources and kind of thinking.

**Item 1 — the Swiss commodity market data portrait** (`~/vault/projects/personal/masterarbeit`)

- *In motion:* file touched **today**; 35 files since Aug 17; hard deadline **15 Sep 2026** for
  the disposition; thesis period Oct 2026 – Jan 2027. Strongest in-motion evidence in the set.
- *Range-widening:* new country (Switzerland), new sector (physical commodity trading), new
  medium (a thesis + visual report), new kind of thinking (measuring a subject that is
  structurally unmeasured, rather than plotting a series that exists).
- *Grounded in:* `masterarbeit/CLAUDE.md` (*"A **data portrait of the Swiss commodity market**:
  an exploratory data analysis plus a visual report"*), `planning/research-notes.md` (the five
  2011 baseline claims; *"The sector is structurally opaque — private partnerships, no
  disclosure duty"*, *"There is no regulator. Banks have FINMA; traders have nobody."*).
- *Draft name:* **A data portrait of the Swiss commodity trade**
- *Draft description (`D-14`: drafted, not reviewed):*
  > The physical commodity trade runs through Switzerland in private partnerships with no
  > disclosure duty and no regulator of their own. The question is what can actually be
  > measured about a business whose defining feature is that it is not.
- *Accuracy caveats the executor must respect:* the research question is **not yet fixed** —
  `writeup/disposition.md` is empty and `research-notes.md` flags an unresolved framing
  conflict. Copy must not claim a settled question. **Do not put a year on the *Rohstoff*
  book:** `CLAUDE.md` says 2012, `research-notes.md` says 2011, the source filename says 2012.
  **Do not name the supervisor or any interview contact** (`meetings/18 agost - Bleisch.md`,
  `planning/interviews.md`) — those are private third parties.

**Item 2 — the house names of Zürich** (`~/vault/projects/personal/data-story-hausnamen`)

- *In motion:* 5 Jupyter notebooks, an OCR-tier comparison harness (7 scripts, 5 model agents)
  and all 7 `planning/` files touched **since 2026-08-24**; explicitly *"Unblocked 2026-08-21"*.
- *Range-widening:* historical/archival sources (a 1796 Reutlinger print source, Denkmalpflege
  records, `swissNAMES3D`), OCR of period type, geodata — none of which either work-list piece
  touches.
- *Grounded in:* `data-story-hausnamen/CLAUDE.md` (*"a data-driven story based on the naming
  patterns of Swiss Hausnamen (house names)"*; *"an 18th→21st-century survival rate for Zürich
  house names, or a dated extinction series of demolished named houses"*; scope is *"step 1 …
  the city of Zürich, houses that still exist"*).
- *Draft name:* **The house names of Zürich**
- *Draft description (`D-14`: drafted, not reviewed):*
  > Before street numbers, houses in Zürich were known by name. The question is how many of
  > those names survived from the eighteenth century into the present — and whether what
  > disappeared was the houses or only the naming.
- *Accuracy caveats:* the claim under test is explicitly *"not yet"* fixed (blocked on Q-2), so
  do not state a finding or a rate. **Do not name individual houses** unless the executor pulls
  two genuinely attested names out of `data/derived/` first — inventing a plausible-sounding
  house name would be exactly the fabrication `D-02` forbids.

**Item 3 — the Pudding, read as a corpus** (`~/vault/projects/personal/pudding-pudding`)

- *In motion:* last substantive work **2026-08-19** (12 days); a 425 KB generated report exists
  at `report/index.html`; the pipeline runs (catalogue → rendered DOM → corpus/graphics/language/
  topics → report). Weakest of the three on recency but unambiguously built, not intended.
- *Range-widening:* the subject is the field's own body of work rather than a dataset about the
  world; the method is corpus analysis; the output is criticism rather than a chart. The most
  different *kind of thinking* in the set.
- *Grounded in:* `pudding-pudding/README.md` (*"Research archive for a meta-story about The
  Pudding: its recurring subjects, storytelling patterns, and editorial conventions"*; *"the 224
  numbered stories"*; *"the analysis works from the **rendered DOM** … because most Pudding
  charts are drawn on scroll and a print capture never sees them"*).
- *Draft name:* **The Pudding, read as a corpus**
- *Draft description (`D-14`: drafted, not reviewed):*
  > Two hundred-odd visual essays by one publication, read together instead of one at a time.
  > The question is whether a house style is visible in the aggregate — which subjects recur,
  > which forms get reused, and what the publication has quietly stopped doing.
- *Accuracy caveats:* "two hundred-odd" is safe against the README's 224. The copy must not
  describe this as a pitch (see *Open Questions* Q-2). Do not name The Pudding's staff.

### Recommended order (`D-04`, widest-range-first)

1. **A data portrait of the Swiss commodity trade** — furthest from both work-list pieces on
   every axis, and the item most likely to start an interview conversation.
2. **The house names of Zürich** — the most different *sources*; also the second-strongest
   in-motion evidence, which matters because slot 2 is still inside a ninety-second scan.
3. **The Pudding, read as a corpus** — the most different *kind of thinking*, placed last where
   its slightly older activity date matters least.

*Alternative ordering worth one sentence of consideration:* swapping 2 and 3 leads with the
most method-distinct item. Recommended order wins because `D-04`'s tie-breaker is "most extends
the range", and a new country + a new sector extends further than a new method.

### The `LAST_TOUCHED` value

The honest definition of a section-level "last touched" is **max(item last-touch)**. Measured:
`masterarbeit` 2026-08-31, `data-story-hausnamen` 2026-08-26, `pudding-pudding` 2026-08-19.
**Setting `LAST_TOUCHED` to the phase's ship date is honest specifically because item 1 was
touched that day** — not merely because it is the default. If item 1 were dropped, the honest
value would fall back to 2026-08-26. State this in the module comment so a later editor knows
what they are asserting when they bump it.

---

## Architecture Patterns

### System Architecture Diagram

```
  BUILD TIME                                                    REPO TIME
  ─────────────────────────────────────────────────             ─────────────────────────

  lib/backlog.tsx  ──── module evaluation ────┐                 tests/unit/backlog-source.ts
   ├── BACKLOG: readonly Item[]               │                   │  readFileSync("lib/backlog.tsx")
   │     { name, description: ReactNode }     │                   │  regex → LAST_TOUCHED
   ├── LAST_TOUCHED: "YYYY-MM-DD"             │                   │  (no match ⇒ THROW, never skip)
   └── assertLastTouched(...)  ── fail ──► next build FAILS       ▼
          │ shape? real date? not future?     │            tests/unit/backlog-freshness.test.ts
          │ BACKLOG non-empty? ≤ 4?           │             ├─ isStale(a,b) pure  ── always runs
          ▼ pass                              │             └─ lastChangeDate()
  app/(en)/page.tsx  (Server Component)       │                  ├ git missing / not a repo → SKIP(reason)
   └── <section id="backlog">   ← Phase 3     │                  ├ shallow clone            → SKIP(reason)
        ├── <h2 class=section-head>  ← Phase 3│                  ├ module DIRTY  → file mtime date
        └── <div class="flex flex-col gap-lg">│                  └ module CLEAN  → git log -1 --format=%cs
             ├── <p class=text-label>         │                          │
             │     <time dateTime=LAST_TOUCHED│                          ▼
             │       >{formatPostDate(…,"en")}│                  assert !isStale(LAST_TOUCHED, date)
             └── <ul role=list … gap-xl>      │
                  └── <li>  (border-t border-rule pt-xl when i>0)
                       ├── <h3 class=text-standfirst>{name}</h3>     ← no link, no ordinal
                       └── <p  class="max-w-prose text-body">{description}</p>   ← no host line
                                              │
                                              ▼
                              .next/server/app/index.html
                                              │
                                              ▼
                       tests/build/prerender.test.ts   ← PRODUCTION TRUTH
                        (rendered date == source LAST_TOUCHED, item count,
                         no banned tool word, no github href, stub copy GONE)
                                              │
                              npm run dev ────┴──► tests/landing.spec.ts   ← DEV TRUTH
                                                    (MEASURED computed styles only)
```

### Recommended Project Structure

```
lib/
└── backlog.tsx              # NEW — the only new production module (D-05)
components/landing/
├── work-list.tsx            # unchanged — the grammar being mirrored
├── section-stub.tsx         # unchanged — still serves #contact
└── backlog-list.tsx         # NEW (optional) — or inline in page.tsx
app/(en)/
└── page.tsx                 # 1 line changed at :83
tests/unit/
├── backlog-source.ts        # NEW — shared reader, NOT *.test.ts (see css-source.ts:8)
└── backlog-freshness.test.ts# NEW — D-09.2
tests/build/
└── prerender.test.ts        # 3 lines deleted, 2 comments rewritten, new assertions added
tests/
└── landing.spec.ts          # test (u) narrowed, test (r) count updated, new backlog tests
```

### Pattern 1: The data module (mirrors `lib/work.ts`)

```tsx
// lib/backlog.tsx — Source: lib/work.ts (Phase 3, D-05), lib/content.ts:34-76 (assertFrontmatter)
import type { ReactNode } from "react";

export type BacklogItem = {
  name: string;        // what the thing is called — NOT a repo name
  description: ReactNode; // one paragraph, inline-only: <em>, <strong>, <a className="link"> (D-08)
};

/**
 * D-14 TRIPWIRE — item copy below is DRAFTED, not reviewed by the author.
 * Marked here in source and NOWHERE on screen: tests/landing.spec.ts (s) bans
 * "todo"/"placeholder"/"tbd" from rendered text, and D-02 forbids a visible marker
 * on a live URL during a job hunt. Flip to true only after the author's editorial
 * pass. Must not reach Phase 6's FIND-02 robots flip while false.
 */
export const COPY_REVIEWED = false;

/**
 * D-02: three items, hard ceiling of four. D-04: array order IS the editorial
 * order, widest-range-first. D-13: an empty array fails the build below.
 */
export const BACKLOG: readonly BacklogItem[] = [ /* … */ ];

/**
 * BACK-02 / D-09. The honest definition is max(item last-touch), not "when I last
 * edited this file". Bump it when the WORK moves, not when the copy does.
 */
export const LAST_TOUCHED = "2026-08-31";

// D-09.1 — fail-loud at build, mirroring assertFrontmatter's collect-then-throw shape.
// NO GIT HERE: git metadata is absent or misleading in build environments (05-RESEARCH Q1 §D).
{
  const problems: string[] = [];
  if (BACKLOG.length === 0) problems.push("BACKLOG must not be empty (D-13: there is no empty state)");
  if (BACKLOG.length > 4) problems.push(`BACKLOG holds ${BACKLOG.length} items; the ceiling is 4 (D-02)`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(LAST_TOUCHED)) {
    problems.push(`LAST_TOUCHED "${LAST_TOUCHED}" must be an ISO date (YYYY-MM-DD)`);
  } else {
    const parsed = new Date(`${LAST_TOUCHED}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== LAST_TOUCHED) {
      problems.push(`LAST_TOUCHED "${LAST_TOUCHED}" is not a real calendar date`);
    } else if (parsed.getTime() > Date.now() + 36 * 60 * 60 * 1000) {
      // +36h, not 0: LAST_TOUCHED is authored in local time (CEST = UTC+2) and the
      // build runs in UTC. A same-evening edit would otherwise fail its own build.
      problems.push(`LAST_TOUCHED "${LAST_TOUCHED}" is in the future`);
    }
  }
  if (problems.length) throw new Error(`lib/backlog.tsx: ${problems.join("; ")}`);
}
```

### Pattern 2: The list component (the work list minus three affordances)

```tsx
// components/landing/backlog-list.tsx — Source: components/landing/work-list.tsx
import { BACKLOG } from "@/lib/backlog";

export function BacklogList() {
  return (
    // <ul> not <ol>: D-11.1, the backlog is unranked. role="list" is required and not
    // redundant — Safari drops list semantics when list-style: none is applied.
    <ul role="list" className="flex list-none flex-col gap-xl">
      {BACKLOG.map((item, index) => (
        // border-rule is NOT optional: Tailwind v4 preflight emits `border: 0 solid`
        // with no colour, so a bare border-t falls through to currentColor and renders
        // full ink — an 8x darker line and a fourth rule weight the Prose Contract
        // forbids (Pitfall 1 / WR-06). No clsx: this repo has no class-composition
        // helper and must not gain one.
        <li key={item.name}
            className={"flex flex-col gap-sm" + (index > 0 ? " border-t border-rule pt-xl" : "")}>
          {/* No ordinal (D-11.1). No .link-quiet — the name is plain text (D-11.3). */}
          <h3 className="text-standfirst">{item.name}</h3>
          <p className="max-w-prose text-body">{item.description}</p>
          {/* No host line (D-11.2). */}
        </li>
      ))}
    </ul>
  );
}
```

### Pattern 3: The date line (`D-12`)

```tsx
// In app/(en)/page.tsx, replacing the SectionStub at :83.
// Structure per D-12: the section keeps its <h2>, then ONE div carries date + list,
// so head→date and date→list are both `lg`. No new token.
<div className="flex flex-col gap-lg">
  <p className="text-label">
    {/* Exactly components/post-meta.tsx:29. Absolute, not relative (D-12). */}
    Last touched <time dateTime={LAST_TOUCHED}>{formatPostDate(LAST_TOUCHED, "en")}</time>
  </p>
  <BacklogList />
</div>
```

### Anti-Patterns to Avoid

- **Adding a per-item date, status, badge, meter, icon or ordinal.** Explicit user decision,
  logged twice (`PROJECT.md` Key Decisions, `REQUIREMENTS.md` Out of Scope). The *absence* of
  the work list's affordances is the marker (`D-11`).
- **Keeping the stub copy as an unreachable fallback.** `D-13`: dead code a later reader will
  mistake for a supported state.
- **Touching `lib/content.ts` or `content/`.** Zero touchpoints. If a plan proposes editing
  the writing pipeline, it has taken a wrong turn.
- **Adding `"use client"` to `app/(en)/page.tsx`.** `tests/unit/link-contract.test.ts:270-291`
  fails, and the metadata export becomes illegal.
- **Putting git anywhere in the build path.** The one thing that would genuinely break Railway.
- **Adding a class-composition helper (`clsx`/`cn`).** `work-list.tsx:11-13` says so explicitly.
- **`<hr>` for the row separator.** The work list uses `border-t border-rule pt-xl`; consistency
  with the adjacent list wins (`D-10` + discretion).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Formatting `2026-08-31` as `31 August 2026` | A month-name array or `toLocaleDateString` call | `formatPostDate` (`lib/locales.ts`) | Already UTC-pinned against `process.env.TZ` drift and already tested (`dates.test.ts:22-27`). A second formatter is a second truth. |
| Validating an ISO date string | A bare `/^\d{4}-\d{2}-\d{2}$/` | The `assertFrontmatter` round-trip shape (`lib/content.ts:46-61`) | Shape is not validity. `2026-02-31` passes the regex and silently rolls to 2026-03-03; `2026-13-01` reaches `Intl` and throws a bare `RangeError` three modules away. |
| Detecting whether git is usable | `existsSync(".git")` | `git rev-parse --is-inside-work-tree` | `.git` is a **file** in a linked worktree — which is where this project's executors run. Verified. |
| Detecting a shallow clone | Counting commits, or nothing | `git rev-parse --is-shallow-repository` | Proven false positive otherwise; §Q1 C. |
| Deciding whether the module changed | `git log` alone | `git status --porcelain` first, then mtime, then `git log` | `git log` cannot see uncommitted edits — the most likely way the date goes stale. |
| Parsing `globals.css` in a test | A new parser | `tests/unit/css-source.ts` | Nesting-aware, semicolon-in-value-safe, already covered by `prose-contract` (k) and (l). |
| Reading a `.tsx` module in `node --test` | A TS/TSX loader dependency | `readFileSync` + an assert-or-throw regex | Established twice in this repo; zero new supply-chain surface. |
| Inline link styling outside `.prose-site` | New CSS | `.link` | Shipped in Phase 3 naming this phase as its consumer. |

**Key insight:** every "new" problem in this phase already has a shipped, tested answer four
metres away in the same repo. The failure mode here is not picking the wrong library — it is
writing a second copy of something that already exists and then having two truths.

## Runtime State Inventory

*Included because this phase deletes a shipped surface and closes a launch-gate leg. A grep
finds the strings; it does not find the bookkeeping.*

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **None** — no database, no CMS, no cache. Verified: `PROJECT.md` Out of Scope names "Headless CMS or database"; the repo has no data store. | none |
| Live service config | **None** — Railway zero-config Node builder, no `railway.json`/`railway.toml`/`nixpacks.toml` in the repo root (verified by listing). No dashboard-side config encodes backlog copy. | none |
| OS-registered state | **None** — no scheduled tasks, no daemons, no pm2. Verified by repo-root listing and `package.json` scripts. | none |
| Secrets / env vars | **None consumed by this phase.** `.env` exists but nothing in the backlog path reads it. `PLAYWRIGHT_BASE_URL` is the only env var the test tier reads (`playwright.config.ts:4`). | none |
| Build artifacts | **`.next/`** holds prerendered HTML containing the stub copy. `test:all` already does `rm -rf .next && npm run build`; `test:build` against a stale `.next` would pass the deleted assertions and prove nothing. | Rebuild before `test:build` — never run the build tier against a stale `.next` |
| **Planning / gate records** | `.planning/STATE.md` (Deferred Items row naming four interim surfaces; Blockers/Concerns re-assertions), `.planning/phases/04-…/launch-gate.md` (the current carry-forward record), `_pm/kanban.md` (`## Done`), `tests/build/prerender.test.ts:517-540` (the launch-gate test itself) | **Update all four.** This is the category that a grep for "backlog" *does* find but that an executor focused on markup will skip. |

## Common Pitfalls

### Pitfall 1: `<strong>` renders a third weight, and no source-level gate catches it
**What goes wrong:** a `<strong>` in a backlog description renders at **700**, breaking the
two-weight budget on screen, while `prose-contract` (m)(n)(o) stay green.
**Why it happens:** Tailwind v4 preflight ships `b,strong{font-weight:bolder}` in the compiled
CSS. `.prose-site strong { font-weight: 530 }` cancels it *inside* prose only. The budget tests
read `app/globals.css` from disk; preflight is not in that file.
**How to avoid:** use `<em>` only in v1 (preflight does not touch `em`, and Newsreader has a
real italic face — both verified). Add a Playwright assertion that every computed `font-weight`
under `section#backlog` is `400` or `530`.
**Warning signs:** a description reads visibly heavier than the item name above it.

### Pitfall 2: the prerendered HTML says `dateTime`, not `datetime`
**What goes wrong:** a build-tier assertion `root.includes('datetime="2026-08-31"')` fails, and
the obvious diagnosis ("the date didn't render") is wrong.
**Why it happens:** React 19.2.8 emits the JSX prop name verbatim. Measured in the shipped
build: `.next/server/app/writing/the-chart-therefore-changes.html` contains
`<time dateTime="2026-08-31">`. `[VERIFIED: grepped this session]` Browsers ASCII-lowercase
attribute names during HTML parsing, so `getAttribute("datetime")` works in Playwright and the
markup is valid — but the raw file string is camelCase.
**How to avoid:** in `tests/build/`, match `/dateTime="(\d{4}-\d{2}-\d{2})"/` (or match
case-insensitively). In Playwright, use `getAttribute("datetime")` normally.
**Warning signs:** the Playwright tier is green and the build tier is red on the same assertion.

### Pitfall 3: the `<h3>` decision silently breaks the heading-outline test
**What goes wrong:** rendering item names as `<h3 className="text-standfirst">` (parity with
`work-list.tsx:27`) takes the document from three `<h3>` to six, and
`tests/landing.spec.ts:389` `expect(counts).toEqual({ h1: 1, h2: 4, h3: 3, … })` fails.
**Why it happens:** the count is a whole-document assertion, not scoped to a section.
**How to avoid:** decide the element deliberately and update `:389` in the same commit.
**Recommendation: use `<h3>`.** `D-10` says "the work list's row grammar" and `D-11` names
exactly three subtractions (ordinal, host, link). Downgrading `<h3>` to `<p>` would be an
unstated fourth subtraction, and it would cost screen-reader users a navigable outline for a
section that is otherwise pure prose. Change `h3: 3` → `h3: 6`, and keep the comment at
`:382-386` (its point — that the featured `<h3>` renders larger than its `<h2>` — still holds).
**Warning signs:** test (r) fails with a clean-looking diff of one number.

### Pitfall 4: the not-future check fires on a legitimate same-day edit
**What goes wrong:** the author sets `LAST_TOUCHED` to their local date at 00:30 CEST; the
build runs in UTC where it is still the previous day; `next build` fails on a date that is not
actually in the future.
**Why it happens:** `LAST_TOUCHED` is authored in local time (CEST = UTC+2) and compared
against a UTC clock. Railway builds in UTC.
**How to avoid:** allow a bounded grace — `parsed.getTime() > Date.now() + 36h` — rather than a
strict `> Date.now()`. 36h still rejects a genuinely wrong date (a month ahead) and absorbs any
real-world timezone offset.
**Warning signs:** a build that fails only for late-evening commits.

### Pitfall 5: the git guard skips silently and nobody notices
**What goes wrong:** the freshness test reports "ok" (skipped) forever. The date rots, and the
one requirement `BACK-02` exists for is unguarded.
**Why it happens:** four of the five branches are skips, and `t.skip()` with no message is
indistinguishable from a pass in TAP output.
**How to avoid:** (a) always emit the skip reason via `t.skip(reason)`/`t.diagnostic`; (b) put
the comparison in a pure `isStale()` and unit-test it with fixed inputs so *something* always
runs; (c) `throw` — never skip — when the source scrape finds no `LAST_TOUCHED`; (d) keep the
dirty-worktree/mtime branch, which is the branch that actually fires during this phase's own
execution.
**Warning signs:** `npm run test:unit` grows by one test and the assertion count does not grow.

### Pitfall 6: `test:build` run against a stale `.next`
**What goes wrong:** the deleted stub assertions still pass because `.next/server/app/index.html`
predates the change.
**Why it happens:** `test:build` reads build output; it does not produce it. Only `test:all`
does `rm -rf .next && npm run build` first.
**How to avoid:** always `rm -rf .next && npm run build && npm run test:build`. The harness
already throws a legible `NO_BUILD_MESSAGE` when `.next/server/app` is *missing* — it cannot
detect *stale*.
**Warning signs:** a build-tier test that should be red is green immediately after an edit.

### Pitfall 7: a bare `border-t` renders an 8× too-dark rule
**What goes wrong:** the row separator renders full ink instead of `rgba(0,0,0,0.12)` — a fourth
rule weight the Prose Contract forbids, and the exact defect Phase 2's WR-06 fixed for `<hr>`.
**Why it happens:** Tailwind v4 preflight emits `border: 0 solid` with **no colour**, so a width
without a colour falls through to `currentColor`.
**How to avoid:** always `border-t border-rule` together. `work-list.tsx:11-13` documents this.
**Warning signs:** `toHaveCount()` cannot see it — only a computed-style assertion can. Assert
`borderTopColor === "rgba(0, 0, 0, 0.12)"`, as `tests/landing.spec.ts:301` already does for the
work list.

### Pitfall 8: the D-14 tripwire rendered on screen
**What goes wrong:** a "draft" / "TBD" marker in the item copy reaches production.
**Why it happens:** the instinct to mark unreviewed copy visibly.
**How to avoid:** mark it in **source only** — a `COPY_REVIEWED = false` export and a comment.
`tests/landing.spec.ts:409-412` bans `todo`/`placeholder`/`coming soon`/`under construction`/
`lorem`/`tbd` from `body.innerText`, and `tests/build/prerender.test.ts:494` repeats four of
them against production HTML. Both will catch it — but the design rule (`D-02`, Phase 3
Pitfall 7) is that they should never have to.

## Code Examples

### Source-scraping `LAST_TOUCHED` (the `.tsx` workaround)

```ts
// tests/unit/backlog-source.ts
// Source: tests/unit/case-study-source.ts:1-12 and tests/unit/link-contract.test.ts:265-267.
// Deliberately NOT named *.test.ts — `npm run test:unit` globs tests/unit/*.test.ts and Node
// exits non-zero on a suite with zero tests. Do not rename it. (Precedent: ./css-source.ts)
//
// This file exists because `node --test` CANNOT import a .tsx module:
//   TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".tsx"
// Node's type stripping registers .ts/.mts/.cts only; JSX needs transformation, not erasure.
// lib/backlog.tsx is .tsx by D-05 and its LAST_TOUCHED is asserted by D-09. Reading the
// source text satisfies both without a loader dependency or a module split.
import { readFileSync } from "node:fs";
import path from "node:path";

export const BACKLOG_MODULE = "lib/backlog.tsx";
export const backlogSource = readFileSync(path.join(process.cwd(), BACKLOG_MODULE), "utf8");

function parseLastTouched(source: string): string {
  const match = source.match(/export const LAST_TOUCHED\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/);
  // THROW, never return null: a regex that silently stops matching turns every assertion
  // downstream into a vacuous pass, which is the failure this whole guard exists to prevent.
  if (!match) {
    throw new Error(
      'tests/unit/backlog-source.ts could not find `export const LAST_TOUCHED = "YYYY-MM-DD"` ' +
        "in lib/backlog.tsx. If the declaration was reformatted, fix this reader — do not delete it.",
    );
  }
  return match[1];
}

export const LAST_TOUCHED = parseLastTouched(backlogSource);
```

### Extracting the rendered backlog section in the build tier

```ts
// tests/build/prerender.test.ts — the prerendered markup is clean and sliceable.
// Measured shape (with the Phase 3 stub still in place):
//   <section id="backlog" aria-labelledby="backlog-head" class="scroll-mt-xl flex flex-col gap-lg">
//     <h2 id="backlog-head" class="section-head">Backlog</h2>…</section>
function backlogSectionOf(root: string): string {
  const start = root.indexOf('<section id="backlog"');
  assert.ok(start !== -1, '/ must render <section id="backlog">');
  const end = root.indexOf("</section>", start);
  assert.ok(end !== -1, "the backlog section must be closed");
  return root.slice(start, end);
}
```

### The pure staleness predicate (always runs, even when the environment branch skips)

```ts
// ISO YYYY-MM-DD strings order lexicographically exactly as they order chronologically,
// so no Date construction is needed — and none of its timezone hazards apply.
export function isStale(lastTouched: string, lastChange: string): boolean {
  return lastChange > lastTouched;
}

test("isStale compares ISO dates without constructing a Date", () => {
  assert.equal(isStale("2026-08-31", "2026-09-01"), true);   // module changed after the claim
  assert.equal(isStale("2026-08-31", "2026-08-31"), false);  // same day is fine
  assert.equal(isStale("2026-08-31", "2026-08-30"), false);  // claim is newer — allowed (D-09)
  assert.equal(isStale("2026-09-01", "2026-08-31"), false);
});
```

## State of the Art

| Old approach | Current approach | When changed | Impact here |
|--------------|------------------|--------------|-------------|
| `ts-node` / `tsx` loader to run TypeScript tests | Node's built-in type stripping (`node --test 'tests/unit/*.test.ts'`) | Node 22.18 enabled it by default | Works for `.ts`; **`.tsx` is still unsupported and will remain so** — JSX needs transformation, not erasure. This is the phase's blocker, not a version-lag problem. |
| React mapping `dateTime` → `datetime` in server output | React 19 emits the prop name as written | React 19.x | Build-tier string matching must expect `dateTime=`; see Pitfall 2. |
| Tailwind v3 `border` defaulting to a colour | Tailwind v4 preflight `border: 0 solid` with no colour | Tailwind v4 | A bare `border-t` renders full ink; see Pitfall 7. |

**Deprecated/outdated — do not reach for:**
- `output: 'export'` — forecloses `next.config` `headers()`, which `BUILD-04` depends on
  (`REQUIREMENTS.md` Out of Scope).
- `.prose-site` for backlog descriptions — `D-08` rules it out; the correct classes are
  `.text-body max-w-prose` plus `.link`.

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | everything | ✓ | v22.20.0 | — |
| `git` binary | `D-09.2` freshness guard | ✓ | 2.54.0 | Guard skips with a stated reason (verified branch) |
| Non-shallow repo | `git log -1 -- <path>` correctness | ✓ | `is-shallow-repository` = `false` | Guard skips with a stated reason (verified branch) |
| `%cs` format specifier | `D-09.2` | ✓ | git ≥ 2.21; 2.54.0 present | none needed |
| `npx playwright` / Chromium | Playwright tier | ✓ | `@playwright/test` ^1.62.1 | — |
| `next build` output in `.next/server/app` | build tier | ✓ (present, **rebuild before use**) | Next 16.3.3 | Harness throws `NO_BUILD_MESSAGE` when absent |
| Railway deploy target | deploy-first increment | ✓ (Phases 1–4 all deployed) | zero-config Node builder | — |
| `~/vault/projects/personal/*` | `D-14` grounding evidence | ✓ | 71 dirs, 30 git-tracked | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Unit framework | `node:test` + `node:assert/strict` (Node 22.20.0 built-in type stripping) |
| Build-tier framework | `node:test` over real `next build` output in `.next/server/app` |
| Browser framework | `@playwright/test` 1.62.1, chromium project only |
| Config files | `playwright.config.ts` (testDir `./tests`, testMatch `**/*.spec.ts`, `webServer: npm run dev`, baseURL `http://localhost:3000`) |
| Quick run command | `npm run test:unit` |
| Build-tier command | `rm -rf .next && npm run build && npm run test:build` |
| Browser command | `npm test` |
| Full suite command | `npm run test:all` |
| Type check | `npx tsc --noEmit` |
| Lint | `npx eslint` — **baseline is exactly 1 error** (see below) |

**Lint baseline (measured this session):**
`components/smear-heading/use-prefers-reduced-motion.ts:23:5` —
`react-hooks/set-state-in-effect`. Total: `✖ 1 problem (1 error, 0 warnings)`.
The criterion is **no NEW errors**: any run that reports more than this one error, or reports
an error in a different file, is a regression.

### Phase Requirements → Test Map

| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|--------------|
| BACK-01 | `lib/backlog.tsx` holds 1–4 items, each with a non-empty `name` and a `description` node | unit (source-scrape) | `npm run test:unit` → `tests/unit/backlog.test.ts` | ❌ Wave 0 |
| BACK-01 | `section#backlog` renders one `<ul role="list">` with N `<li>`, N = item count | e2e | `npx playwright test tests/landing.spec.ts -g "backlog list"` | ⚠️ new test in existing file |
| BACK-01 | Each row: one name at `.text-standfirst`, one `p.max-w-prose.text-body`; **zero ordinals, zero host lines, zero `<a>` on the name** (`D-11`) | e2e | same | ⚠️ new test |
| BACK-01 | Row separator computes `border-top: 1px solid rgba(0, 0, 0, 0.12)` on rows 2..N and `0px` on row 1 — **MEASURED**, mirroring `landing.spec.ts:297-304` | e2e | same | ⚠️ new test |
| BACK-01 | Inter-row gap computes `32px`; name→description gap `8px`; `max-width` `65ch` on the description — **MEASURED** | e2e | same | ⚠️ new test |
| BACK-01 | Every computed `font-weight` inside `section#backlog` ∈ {400, 530}; every computed `font-size` ∈ {14px, 18px} (Pitfall 1) | e2e | same | ⚠️ new test |
| BACK-01 | Item copy names no tool/language/framework — the `work.test.ts:56-58` banned list, applied to rendered text | build | `npm run test:build` | ⚠️ new test in `prerender.test.ts` |
| BACK-01 | Production HTML: no `href*="github.com"`, no `target="_blank"`, no marker word | build | same | ✅ existing assertions, now covering new copy |
| BACK-02 | `LAST_TOUCHED` matches `YYYY-MM-DD`, is a real calendar date, and is not in the future | unit | `npm run test:unit` → `tests/unit/backlog.test.ts` | ❌ Wave 0 |
| BACK-02 | `isStale()` orders ISO dates correctly (pure; **always runs**) | unit | same | ❌ Wave 0 |
| BACK-02 | Git freshness: module's last change ≤ `LAST_TOUCHED`; skips **with a stated reason** on no-git / shallow / no-history | unit | `npm run test:unit` → `tests/unit/backlog-freshness.test.ts` | ❌ Wave 0 |
| BACK-02 | Rendered `<time dateTime="…">` in production HTML **equals** the source `LAST_TOUCHED` (by equality, not literal — the `POSITIONING_PLACEHOLDER` technique) | build | `npm run test:build` | ⚠️ new test |
| BACK-02 | The date line is `p.text-label` and sits **above** the first `<li>` — assert `getBoundingClientRect().y` ordering (`D-12`) | e2e | `npx playwright test tests/landing.spec.ts` | ⚠️ new test |
| BACK-02 | Rendered date text equals `formatPostDate(LAST_TOUCHED, "en")` — no second formatter | build | `npm run test:build` | ⚠️ new test |
| D-13 | The Phase 3 stub strings appear **nowhere** in production HTML | build | `npm run test:build` | ⚠️ **inverted** from `prerender.test.ts:486-487,539` |
| D-14 | `lib/backlog.tsx` still exports `COPY_REVIEWED = false` → the launch gate is still open | build (source-scrape) | `npm run test:build` | ⚠️ replaces the deleted `:539` assertion |
| Regression | Section count 4, section-head text/order, heading outline, no card idiom, no `main button`, no `img` | e2e | `npm test` | ✅ existing (`:82`, `:347`, `:373`, `:427`) — `:389` needs its `h3` count updated |
| Regression | `app/(en)/page.tsx` stays a Server Component with no `robots:` | unit | `npm run test:unit` | ✅ `link-contract.test.ts:270-291` |
| Regression | `globals.css` budget unchanged (4 sizes, 2 weights, no literal colour, `{1px,2px,4px}` rules) | unit | `npm run test:unit` | ✅ `prose-contract` (m)(n)(o) |

### Three rules that carry, restated

1. **Assert MEASURED computed values, never derived arithmetic.** Phase 1 learned this the
   expensive way (the Display clamp reads 139.2px at 1440px, not the plan's assumed ≈180px).
   Every spacing, colour and weight assertion above reads `getComputedStyle` /
   `getBoundingClientRect` from a real render. `toHaveCount()` cannot see a wrong rule colour.
2. **`page.emulateMedia({ reducedMotion: "reduce" })` BEFORE `page.goto()`.** Playwright's
   `reducedMotion` *context/test option* does not reliably affect
   `matchMedia('(prefers-reduced-motion: reduce)')` in this environment (1.62.1 / Chromium) —
   recorded in `STATE.md` from Phase 1 and honoured by `tests/reduced-motion.spec.ts:20`.
   This phase ships no motion, so no new reduced-motion spec is needed; the rule is restated so
   nobody adds one the wrong way.
3. **Production truth lives in `tests/build/`; dev truth lives in Playwright.** Playwright runs
   against `npm run dev`, where `NODE_ENV=development` and `showDrafts()` is always true — it
   structurally cannot prove what a production build omits. Copy assertions and
   `<time dateTime>` string matching belong in `tests/build/prerender.test.ts`; computed styles
   and geometry belong in Playwright. Do not cross them.

### Sampling Rate

- **Per task commit:** `npm run test:unit` (fast; must stay fast — do not put build-output reads
  in `tests/unit/`) and `npx tsc --noEmit`.
- **Per wave merge:** `rm -rf .next && npm run build && npm run test:build && npm test`, plus
  `npx eslint` compared against the 1-error baseline.
- **Phase gate:** full `npm run test:all` green, `npx tsc --noEmit` clean, `npx eslint` at
  exactly the known 1 error, then `/gsd:verify-work`.

### Wave 0 Gaps

- [ ] `tests/unit/backlog-source.ts` — shared source reader; **must not** be named `*.test.ts`
- [ ] `tests/unit/backlog.test.ts` — `BACKLOG` shape/count, `LAST_TOUCHED` shape/validity,
      `COPY_REVIEWED` present — covers BACK-01, BACK-02
- [ ] `tests/unit/backlog-freshness.test.ts` — pure `isStale` cases + the five-branch git probe
      — covers BACK-02 (`D-09.2`)
- [ ] `tests/build/prerender.test.ts` — **edits, not a new file:** delete `:486`, `:487`, `:539`;
      retitle and re-comment the launch-gate test at `:517`; add the rendered-date-equality,
      item-count, banned-tool-word and `COPY_REVIEWED` assertions
- [ ] `tests/landing.spec.ts` — **edits:** narrow test (u) at `:445` to `["contact"]`; update
      `h3` count at `:389` if names render as `<h3>`; add the backlog structure, geometry,
      separator-colour, weight/size-budget and date-above-list tests
- [ ] Framework install: **none** — every framework is present

## Security Domain

### Applicable ASVS Categories

| ASVS category | Applies | Standard control |
|---------------|---------|------------------|
| V2 Authentication | no | No auth surface anywhere on the site |
| V3 Session Management | no | No sessions, no cookies set by this phase |
| V4 Access Control | no | Fully static public page |
| V5 Input Validation | **yes** | The only untrusted-ish input is `LAST_TOUCHED`, author-controlled and validated fail-loud at build (`D-09.1`), mirroring `lib/content.ts:29-32`'s stated ASVS V5 control. Item copy is compile-time JSX, not runtime data — no `dangerouslySetInnerHTML`, no `innerHTML`, no user input |
| V6 Cryptography | no | Nothing cryptographic |
| V7 Error Handling / Logging | partial | Errors are build-time only. `lib/backlog.tsx`'s throw names the file and every problem, exactly as `assertFrontmatter` does. There is **no runtime error state on the landing view** |
| V14 Configuration | partial | `robots: { index: false }` stays on until Phase 6's `FIND-02`; `app/(en)/page.tsx` must declare no `robots:` of its own (`link-contract.test.ts:288-291`) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard mitigation | Status here |
|---------|--------|---------------------|-------------|
| XSS via rich text | Tampering | Render as JSX, never `dangerouslySetInnerHTML` | `description` is a `ReactNode` written in source; React escapes text children. **Do not introduce `dangerouslySetInnerHTML`** |
| Reverse tabnabbing | Tampering | No `target="_blank"` ⇒ no `window.opener` | Already enforced: `prerender.test.ts` asserts `doesNotMatch(root, /target="_blank"/)` |
| Information disclosure — private repo | Info disclosure | Never link or name `ib-gdp-evolution`; zero `github.com` hrefs page-wide | Enforced at `landing.spec.ts:194,199` and in `prerender.test.ts`. **Extends to backlog copy** |
| Information disclosure — third parties | Info disclosure | Curation rule | The `masterarbeit` evidence includes supervisor and interview-contact names (`meetings/`, `planning/interviews.md`). **Copy must name no private individual** |
| Command injection via the git probe | Tampering | `spawnSync` with an **argv array**, never a shell string | Use `spawnSync("git", [...], { cwd, encoding: "utf8" })`. Never `execSync` with interpolation, and never `shell: true` |
| Supply chain | Tampering | Add no dependency | Zero installs this phase |
| Premature indexing | Info disclosure | `robots: index: false` until `FIND-02` | Unchanged by this phase; the launch gate is the control |

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|-------|---------|---------------|
| A1 | A module-scope `throw` in `lib/backlog.tsx` fails `next build` with a non-zero exit, because `app/(en)/page.tsx` prerenders and imports it. Consistent with Next's prerender error handling and with `lib/content.ts`'s shipped posture, but **not reproduced this session** (would require a deliberately-broken build). | Q1 §I, Pattern 1 | `D-09.1` would be a no-op and only the repo test would guard the date. **Recommended: one plan task proves it by temporarily setting an invalid `LAST_TOUCHED` and confirming the build exits non-zero, then reverting.** Low cost, closes the last unverified link. |
| A2 | Webpack/Turbopack will not tree-shake the module-scope validation block. `package.json` declares no `sideEffects: false` (verified), so modules are treated as side-effectful — but this is inference from bundler defaults, not a measurement. | Pattern 1 | Same as A1; the same probe task closes both. |
| A3 | Railway's build environment does not include `.git`. Not probed — and **it does not matter**, because `next build` never invokes git and `test:unit` is never run by the build script (both verified). Stated only so nobody designs around an assumed `.git`. | Q1 §D | None, given the design. Would matter only if a future phase moved the guard into the build. |
| A4 | The item names and description prose are drafted from repository evidence but **have not been reviewed by the author**. `D-14` requires exactly this posture; the copy is grounded, not verified as the author's voice. | Q4 | The `D-14` tripwire exists for this. Must be re-asserted in carried state and must block Phase 6's `FIND-02`. |
| A5 | `data-story-hausnamen`'s and `masterarbeit`'s research questions are still open (both records say so). The drafted copy is worded to state a *question*, not a finding — if the executor tightens the prose into a claim, it becomes an unsourced assertion. | Q4 | A published, bylined page asserting a finding the work has not reached. |

## Open Questions

1. **Should the third item be `pudding-pudding` at all, given it may be a live pitch?**
   - *What we know:* `data-story-pistachio/CLAUDE.md` describes both it and `pudding-pudding` as
     "candidate Pudding pitch" for the same portfolio slot. The work is real and built.
   - *What's unclear:* whether publicly describing an in-flight analysis of a specific
     publication is strategically fine or awkward during a job hunt.
   - *Recommendation:* **ship it**, described as what it is — a corpus study of one
     publication's body of work — and never as a pitch. The drafted copy already does this. Flag
     it explicitly in the phase's verification record so the user can veto it in one edit
     (removing an item is an array-element deletion, per `D-05`). If vetoed, `D-02`'s honest
     degradation applies and the section ships with two.

2. **`<h3>` or `<p>` for item names?**
   - *What we know:* `work-list.tsx:27` uses `<h3 className="text-standfirst">`; `D-11` names
     exactly three subtractions and element type is not one of them; `landing.spec.ts:389` counts
     `h3` document-wide.
   - *Recommendation:* `<h3>`, and update `:389` from `h3: 3` to `h3: 6` in the same commit.
     Stated as a question because it is a genuine markup decision the planner should make
     deliberately rather than inherit.

3. **Should the launch-gate test at `prerender.test.ts:517` shrink or be re-pointed?**
   - *What we know:* Phase 4 narrowed it and documented the narrowing (`:531-538`). After Phase 5
     only the contact stub remains, so the test shrinks toward triviality — while **three**
     copy-review items (HOME-01, the case-study editorial pass, backlog copy) are outstanding and
     all three block `FIND-02`.
   - *Recommendation:* re-point it. Keep the contact-stub assertion, add a source-scrape assertion
     that `lib/backlog.tsx` still exports `COPY_REVIEWED = false`, and name all three copy items
     in the test's comment. That keeps the gate load-bearing instead of letting it decay into a
     one-line check that nobody reads.

4. **Does the executor have enough evidence to name real Zürich house names?**
   - *What we know:* the drafted copy deliberately names none; `data/derived/` holds the cleaned
     series but is large and partly gitignored.
   - *Recommendation:* leave the copy without specific names. If the executor wants one for
     colour, it must be read out of `data/derived/` first and cited in the verification record —
     never recalled.

## Sources

### Primary (HIGH confidence — measured in this repo or a purpose-built fixture this session)

- `git log`/`git rev-parse`/`git status` behaviour — three-commit fixture + `--depth 1` clone,
  git 2.54.0, all five guard branches executed
- `node --test` + `.tsx` — reproduction yielding `ERR_UNKNOWN_FILE_EXTENSION`, Node v22.20.0
- Git worktree `.git`-is-a-file — `git worktree list` + `file` against the live
  `.claude/worktrees/agent-a569251ee23bdd09a`
- `app/globals.css`, `lib/work.ts`, `lib/content.ts`, `lib/locales.ts`,
  `components/landing/work-list.tsx`, `components/landing/section-stub.tsx`,
  `components/post-meta.tsx`, `app/(en)/page.tsx`, `next.config.ts`, `playwright.config.ts`,
  `package.json` — read in full
- `tests/landing.spec.ts`, `tests/build/prerender.test.ts`, `tests/unit/prose-contract.test.ts`,
  `tests/unit/link-contract.test.ts`, `tests/unit/work.test.ts`, `tests/unit/dates.test.ts`,
  `tests/unit/case-study-source.ts`, `tests/type-specimen.spec.ts`, `tests/landing-trail.spec.ts`
  — read for the breakage inventory
- Compiled CSS `.next/static/chunks/449_6-5tlm8v4.css` — `b,strong{font-weight:bolder}`,
  `.max-w-prose{max-width:65ch}`, `.gap-xl/.gap-lg/.gap-sm/.pt-xl/.border-rule`, Newsreader
  italic `@font-face`, preflight's `h1..h6{font-size:inherit;font-weight:inherit}`
- Prerendered `.next/server/app/index.html` and `.../writing/the-chart-therefore-changes.html` —
  the `#backlog` section shape and `<time dateTime="2026-08-31">`
- `npx eslint` — the 1-error baseline
- `~/vault/projects/personal/` — 71 directories enumerated, 30 git repos ranked by last commit,
  candidate `CLAUDE.md`/`README.md`/`planning/` files read

### Secondary (HIGH confidence — this project's own governing documents)

- `.planning/phases/05-backlog/05-CONTEXT.md`, `.planning/phases/03-…/03-UI-SPEC.md`,
  `.planning/phases/03-…/03-CONTEXT.md`, `.planning/phases/03-…/deferred-items.md`,
  `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/config.json`,
  `./CLAUDE.md`, `~/.claude/CLAUDE.md`, `_pm/kanban.md`

### Tertiary (LOW confidence — flagged, not relied upon)

- None. No WebSearch, Context7 or external documentation was consulted: every question this
  phase raises is answerable against this repository, and a general answer about Next.js or git
  would have been weaker than the measurement.

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — nothing to install; every asset read in source and confirmed in the
  compiled output
- Architecture: **HIGH** — mirrors a shipped, tested analogue (`lib/work.ts` + `WorkList`) line
  for line
- The git guard (Q1): **HIGH** — all five branches executed; the shallow-clone false positive was
  reproduced rather than reasoned about
- The `.tsx` / `node --test` blocker: **HIGH** — reproduced with the exact error
- Stub-deletion inventory (Q2): **HIGH** — every line cited was read this session
- `.link` (Q3): **HIGH** — class read in source and in the compiled chunk; all six covering gates
  located by file and test id
- Item grounding (Q4): **HIGH for existence and activity** (git + filesystem + the user's own
  written records); **MEDIUM for the drafted prose**, which is `D-14` drafted-not-reviewed by
  construction
- Build-time throw failing `next build` (A1/A2): **MEDIUM** — consistent with the shipped
  `assertFrontmatter` posture and with bundler defaults, but not reproduced; one cheap plan task
  closes it
- Pitfalls: **HIGH** — every one either reproduced or read directly out of shipped code and tests

**Research date:** 2026-08-31
**Valid until:** 2026-09-30 — the codebase facts are stable; the **item grounding decays
fastest**. If Phase 5 executes more than about a week from now, re-run the `git log` sweep across
`~/vault/projects/personal/` before fixing `LAST_TOUCHED`, because `D-01`'s "in motion" and the
honest max(item last-touch) date both move.
