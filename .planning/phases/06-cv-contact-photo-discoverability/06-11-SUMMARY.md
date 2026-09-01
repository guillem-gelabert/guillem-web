# 06-11 Summary — live verification, the written audit, the hand-off

**Completed:** 2026-09-01 · **Plan:** `06-11-PLAN.md` · **Requirements:** BUILD-04, FIND-01, FIND-02, PROF-03

## What shipped

| Artifact | What it is |
|---|---|
| `audit.md` | The six-part audit, plus §7 (extended by 06-12). Every row carries a verdict and evidence |
| `launch-gate.md` | **14 rows**, not the planned 13 — a verdict and a named checking assertion each, plus the FIND-02 flip as an exact gated procedure |
| `HANDOFF-user-supplied.md` | Five values and three copy reviews, one page, each naming its file, export, gate row, on-screen effect and the tests that move |
| `deferred-items.md` | Rewritten: T1–T4 tripwires at the top, five v2 items with unblocking conditions, four closed items |
| `package.json` | `gw-scaffold` → `guillem-web` |

## The audit found three defects that no test had

All three were found by **curling the live deploy**, which is the entire argument for PITFALLS #8.

1. **The per-post OG cards were never served.** Both case studies served the site-wide card while
   their own committed PNGs sat unreferenced. Cause: `c85eb18`'s explicit `openGraph.images` also
   overrides the file convention for its segment. The assertion meant to catch it compared the EN
   post's card to the DE post's and to `/`'s — those differ by **locale** whether or not the
   override fires, so it passed for the life of the bug. Fixed in `315518d`; the assertion now
   requires each pathname to **be** `/og/{slug}.png`.
2. **Both localised 404s doubled the site name in `<title>`.** A literal suffix composing with
   `title.template`, introduced when 06-07 added the template. Fixed in `ff5eb40`; new assertion:
   no title may contain `SITE_NAME` twice.
3. **The test suite had been adopting another project's dev server** on port 3000. Fixed in
   `315518d`; the port is now a variable.

**The pattern in all three:** an assertion that checked a *weaker property* than the one that
mattered — that two things differ, that a title exists, that a server answers — and passed
throughout.

## Why the gate grew a fourteenth row

The plan specified 13. G14 (`PLACEHOLDER_CONTENT`) was added because the site was deliberately
filled with lorem ipsum between the plan being written and executed, and G2–G6 all test whether a
value is *filled* — a sound proxy for *real* only while the states were absent and authored. Left
alone, the biconditional would have begun **demanding** `index: true` over a lorem-ipsum CV.

## Live verification (§5)

Railway `NEXT_PUBLIC_SITE_URL` set to the apex (belt-and-braces; `lib/site.ts` already falls back
there). **`railway domain` was never run.** All six security headers present on pages and on static
assets, delivered CSP byte-identical to the unit-tested string. Three OG cards resolving 200 as
1200×630 PNGs. Canonical identical from both hostnames. Sitemap 6 URLs, `/type` and both reserved
404s absent. CR-01 holding in production. F3 re-measured and unchanged. **Every surface still
`noindex`.**

## Deviations

- **14 gate rows, not 13** — reasoned above and recorded in `launch-gate.md`.
- **Three code commits**, where the plan anticipated documentation only. Each fixed a defect the
  audit itself surfaced; leaving a known-broken OG card and a doubled title on a live job-hunting
  site to preserve the plan's file list would have been the wrong trade.
- **Research assumption A10 was wrong**: `_pm/kanban.md` exists. Recorded as an audit row.
