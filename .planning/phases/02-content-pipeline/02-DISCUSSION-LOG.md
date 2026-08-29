# Phase 2: Content Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-29
**Phase:** 02-content-pipeline
**Areas discussed:** Source fidelity (abandoned), Index structure (abandoned), Scope
deferral, Domain and subdomains, Internationalisation, MDX capability, Case study
route, Index at n=1, Authoring flow

> **Note on shape.** This discussion changed the phase mid-flight. It opened against
> "Content Pipeline & Writing Archive Migration" and two areas were discussed under
> that scope before the user chose to defer the migration. Those two areas are recorded
> below for the record, marked ABANDONED — their conclusions were carried into the
> deferred-ideas section of CONTEXT.md rather than into decisions.

---

## Pre-discussion scouting

Findings that shaped the options presented, gathered before any question was asked:

- The Markdown source for the 13 legacy posts does not exist. The GitHub Pages repo has
  one branch holding rendered Hugo 0.74.3 output only.
- RSS confirms 13 posts but the tree has 14 post URLs — `posts/amend/` duplicates
  `posts/git-amend/` and is not in the feed.
- Code blocks carry no language hints and no highlight classes.
- The two series interleave chronologically.
- Posts contain real HTML tables and a hardcoded series footer line.

---

## Source fidelity — ABANDONED

| Option | Description | Selected |
|--------|-------------|----------|
| Fix errors, preserve voice | Correct outright mistakes, leave voice untouched | |
| Verbatim — archive as-is | Convert mechanically, typos and dated jokes intact | |
| Full editorial pass | Re-read and revise all 13 for clarity and currency | ✓ |

**User's choice:** Full editorial pass.

### Follow-up: who does the pass

| Option | Description | Selected |
|--------|-------------|----------|
| Claude drafts, you review per post | One commit per post, diffed against the original | |
| Claude converts, you revise | Mechanical work ships; editing becomes the user's | |
| Claude drafts, review at the end | All 13 revised, then one read-through | ✓ |
| Claude drafts, no review | Unattended | |

**User's choice:** Claude drafts, review at the end.

### Follow-up: technically stale advice

| Option | Description | Selected |
|--------|-------------|----------|
| Dated note per affected post | Fix writing, annotate aged technical claims | |
| Writing only — leave the tech alone | Archive reads as a 2020 record | |
| Rewrite to be correct in 2026 | Posts stand as current reference material | ✓ |

**User's choice:** Rewrite to be correct in 2026.

**Notes:** Immediately after this answer the user said "I want to defer the migration",
which retired the whole area. The three choices above are preserved in CONTEXT.md's
deferred section as the editorial intent for whenever the migration is picked up.

---

## Scope deferral

**Raised by:** the user, mid-discussion.

Surfaced before asking: the pipeline is load-bearing for Phase 4's case study while the
13-post migration is not, and Phases 3, 4 and 6 all declare `Depends on: Phase 2`, so
dropping the phase wholesale breaks the dependency chain while dropping only the archive
does not.

| Option | Description | Selected |
|--------|-------------|----------|
| Keep the pipeline, defer the 13 posts | Phase 2 becomes Content Pipeline; WRIT to v2 | ✓ |
| Defer all of Phase 2 | Re-point Phases 3/4/6; case study rendering moves to Phase 4 | |
| Migrate verbatim now, defer the editorial pass | Archive ships as a dated record | |

**User's choice:** Keep the pipeline, defer the 13 posts.

### Knock-on: HOME-03

Surfaced: HOME-03 requires a reachable writing index, which would have nothing behind it.

| Option | Description | Selected |
|--------|-------------|----------|
| Writing index exists, lists the case study | Index is real, holds one entry at launch | ✓ |
| Drop "writing index" from HOME-03 | Amend the requirement | |
| Keep HOME-03 as-is, defer it to v2 | Move it out of Phase 3 with the archive | |

**User's choice:** Writing index exists, lists the case study.

**Notes:** This also preserved WRIT-01 in v1 — only WRIT-02 and WRIT-03 are
archive-specific. BUILD-04's "demonstrating in practice what the migrated series
describes" clause was trimmed in the same edit, as it pointed at posts that will not
exist in v1.

---

## Index structure — ABANDONED

Selected by the user in the opening area choice, but retired by the deferral before it
was discussed — grouping and ordering are moot at one entry. The underlying findings
(interleaved series, no canonical reading order within the security-headers series) are
preserved in CONTEXT.md's deferred section.

---

## Domain and subdomains

**Raised by:** the user, as a free-text addition to the area selection —
"Routing: projects are on separate subdomains".

Surfaced before asking: this collided with PROJECT.md's Out of Scope line, "Custom
domain (guillemgelabert.com vs guillem.ch) — unresolved; v1 ships on the Railway URL".
Subdomains imply an apex exists and is chosen.

| Option | Description | Selected |
|--------|-------------|----------|
| Domain is settled — projects already on subdomains | Apex chosen and live | ✓ |
| Projects on subdomains, main site on Railway URL | Apex question stays deferred | |
| Subdomains are the plan, not the current state | Future work | |

**User's choice:** Domain is settled.

**Verification:** `guillemgelabert.com` resolves behind Cloudflare; `guillem.ch` does
not resolve. The user supplied two live URLs, both confirmed HTTP 200:
`ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing` (`lang="en-GB"`)
and `.../auf-mallorca-weiss-es-jeder` (`lang="de-DE"`).

### Follow-up: where the site itself launches

| Option | Description | Selected |
|--------|-------------|----------|
| Apex — guillemgelabert.com | Would require stopping the running Phase 1 plan | |
| Railway URL for v1, apex later | No disruption; projects stay on subdomains | ✓ |
| Apex, but wire it in Phase 6 | Deploy to Railway, cut over with discoverability work | |

**User's choice:** Railway URL for v1, apex later.

**Notes:** Chosen partly because Phase 1 was being planned in the background against the
Railway URL at the time. No change to BUILD-02 or Phase 1's deploy target.

---

## Internationalisation

Surfaced by the two URLs the user supplied: the same piece exists in EN and DE under
different slugs, not under a locale prefix.

| Option | Description | Selected |
|--------|-------------|----------|
| English only, but don't design it out | Locale-agnostic slugs, lang in front-matter | |
| English only, ignore i18n entirely | Simplest; rebuild routing later if needed | |
| Build EN/DE routing now | Full locale routing in Phase 2 | ✓ |

**User's choice:** Build EN/DE routing now.

**Notes:** Flagged at the time as meaningfully more Phase 2 work and a doubling of the
Phase 4 writing job. Chosen deliberately. The localised-slug convention was taken from
the live project rather than invented.

---

## MDX capability

| Option | Description | Selected |
|--------|-------------|----------|
| Vetted component set | Fixed curated set — figure, comparison, quote, chart embed | |
| Arbitrary React in MDX | Any component importable in any post | ✓ |
| Images and code only | Plain Markdown semantics; link out for the visual argument | |

**User's choice:** Arbitrary React in MDX.

**Notes:** The stated risk — that Phase 4 drifts from a writing job into a build job,
and that per-post styling diverges — was presented in the option description and
accepted. CONTEXT.md D-08 asks the planner to keep a zero-component default prose path
so that reaching for React stays a deliberate act.

---

## Case study route

| Option | Description | Selected |
|--------|-------------|----------|
| A post at /writing/[slug] | Case study lives with the writing | ✓ |
| Its own /work/[slug] route | Distinct template and metadata; reopens HOME-03 | |
| Both — /work template, listed in /writing | Cross-listed | |

**User's choice:** A post at /writing/[slug].

---

## Index at n=1

| Option | Description | Selected |
|--------|-------------|----------|
| Full-bleed single entry | Editorial front page; one piece takes the surface | ✓ |
| Dated list that happens to have one row | Identical at n=1 and n=14; zero rework later | |
| You decide during planning | Leave to the planner against the UI-SPEC | |

**User's choice:** Full-bleed single entry.

**Notes:** Does not scale past roughly five entries — recorded in CONTEXT.md as a known
limit and a v2 problem.

---

## Authoring flow

| Option | Description | Selected |
|--------|-------------|----------|
| Files in repo, draft via front-matter | `draft: true` hides from index and sitemap | ✓ |
| Files in repo, drafts on a branch | No draft flag; no deployed preview either | |
| Add a CMS | Edit without a deploy; second source of truth | |

**User's choice:** Files in repo, draft via front-matter.

---

## Claude's Discretion

Not discussed; left to research and planning:

- Syntax highlighter choice and mono face (explicitly handed forward from Phase 1).
- Default locale and root URL behaviour, EN prefixing, and `hreflang` emission.
- Front-matter schema, including how translation identity is expressed.
- Prose styling specifics against the Phase 1 UI-SPEC.
- Language switcher placement and behaviour.

Two areas were selected by the user in the reopened area list and then answered by the
batch above rather than explored further: authoring flow and the n=1 index.

## Deferred Ideas

- The 13-post archive migration, with all scouting findings and the editorial intent
  captured — v2 (WRIT-02, WRIT-03).
- A second index treatment for when the archive lands — v2.
- Custom domain cutover to `guillemgelabert.com` — Phase 6.

## Open Item Flagged, Not Resolved

No requirement ID covers EN/DE routing. WRIT-01 is the only requirement mapped to this
phase, and it says nothing about locales. Raised for the user to decide whether to add
one before planning.
