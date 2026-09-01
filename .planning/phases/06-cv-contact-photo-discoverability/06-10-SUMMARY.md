---
phase: 06-cv-contact-photo-discoverability
plan: 10
subsystem: testing
tags: [playwright, cross-links, hreflang, design-budget, getComputedStyle, tailwind-v4, source-sweep]

# Dependency graph
requires:
  - phase: 06-cv-contact-photo-discoverability
    provides: "06-04 (CV/contact/portrait surfaces), 06-07 (metadata factory, alternates.languages)"
provides:
  - "tests/cross-links.spec.ts — D-4.4 section 1, cross-link integrity across every route in both locales"
  - "tests/design-budget.spec.ts — D-4.4 section 3, the DOM-tier design-system roll-call"
affects: [06-11 (the milestone's final written audit, which cites both specs as evidence)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared crawl pass via a browser.newPage() in test.beforeAll, read by multiple assertion-only tests, instead of re-navigating per test"
    - "Deduplicate-then-Promise.all fetch pattern for internal-href reachability, keeping a 7-route crawl inside a 60s budget"
    - "Resolve link[rel=alternate]/canonical hrefs by URL.pathname against the local server, never by their literal absolute metadataBase URL (avoids reaching the real production domain from a test run)"
    - "getComputedStyle sweep scoped to elements with a direct text-node child (house pattern from tests/landing.spec.ts (u)/(x)), reused for the weight/size DOM-tier assertion"
    - "Read expected token values (--color-accent) from app/globals.css via tests/unit/css-source.ts's shared parser, converted to rgb(), never hardcoded as a hex literal in a Playwright spec"
    - "Source-tree grep sweep for arbitrary Tailwind bracket values, with a dated allowlist built from what is actually in app/+components/ at execution time"

key-files:
  created:
    - tests/cross-links.spec.ts
    - tests/design-budget.spec.ts
  modified: []

key-decisions:
  - "The non-Latin-character filter measures Basic Latin (ASCII) as the pass-through set but ALSO allowlists Latin-1 Supplement letters (U+00C0-U+00FF, e.g. Zurich's u-umlaut) and common prose punctuation (em/en dash, curly quotes, ellipsis, nbsp) rather than the plan's literal outside-Basic-Latin wording — measured content on / (lib/work.ts's WORK annotations, lib/backlog.tsx's Zurich entry) contains both an em dash and u-umlaut and neither is decoration; a literal ASCII-only filter would have made the union assertion fail on legitimate copy rather than on a decorative glyph, which is the actual failure mode D-4.4 sec.3 names"
  - "The design-budget sweep includes /type as a third target (the plan permits this 'only if it stays fast') because the combined 24-test run completed in 12.6s with zero flakes, and /type is a useful control that exercises all four type roles"
  - "npm run test:all was deliberately NOT run as part of this plan's verification, despite CLAUDE.md's general pre-commit gate rule — the parallel executor's own briefing states tests/build/prerender.test.ts carries four assertions that are red BY DESIGN under the concurrently-running plan 06-09, and the plan's own <verification> block explicitly lists npm test (not test:all) for this reason. npm test (173 tests, full Playwright suite) was run instead and passed."

requirements-completed: [FIND-02, PROF-01]

# Metrics
duration: ~35min
completed: 2026-09-01
---

# Phase 06 Plan 10: Cross-Links and Design-Budget Audit Summary

**Two Playwright specs — a 7-route/both-locale link-reachability crawl and a DOM-tier design-budget sweep — that prove what `tests/unit/prose-contract.test.ts`'s source-only gate structurally cannot: every href resolves, and a `<strong>` outside `.prose-site` resolving to 700 under Tailwind preflight is caught red.**

## Performance

- **Duration:** ~35 min
- **Started:** ~2026-09-01T11:05Z (estimated — see note below)
- **Completed:** 2026-09-01T11:40Z
- **Tasks:** 2/2 completed
- **Files modified:** 2 (both new)

*Note: `PLAN_START_TIME` was not captured at the very start of the session; the started timestamp above is estimated from the amount of file-reading/exploration performed before the first Edit/Write action, and the completed timestamp is exact (from `git log`).*

## Accomplishments

- `tests/cross-links.spec.ts` crawls all seven routes (`/`, `/cv`, `/type`, `/writing`, `/texte`, `/writing/the-chart-therefore-changes`, `/texte/die-darstellung-aendert-sich`) in one shared pass, and proves: every deduplicated internal href resolves non-404 (concurrent fetches, not sequential); every fragment href (`#work`, `#backlog`, `#contact`) has a matching DOM id; every external href is absolute `https://`, carries no `target`, and never references the private `ib-gdp-evolution` repository; every `hreflang`/`x-default` alternate resolves by pathname; `/`, `/cv` and `/type` are asserted to emit zero alternates (English-only, by design); HOME-03's five destinations are reachable in the nav's declared order with no sixth; and the two CR-01 reserved 404 routes are asserted positively 404 by name.
- `tests/design-budget.spec.ts` sweeps `/`, `/cv` and `/type` at a fixed 1440px viewport and proves, at the DOM tier: every text-bearing element inside `<main>` computes `fontWeight` in `{400, 530}`; the distinct rendered `fontSize` set per route has cardinality ≤ 4 (measured: 4 on `/`, 3 on `/cv`, 4 on `/type`); every `border-radius` is `0px` on all four corners; zero `<svg>`/`<use>` anywhere; the union of non-ASCII/non-prose-punctuation characters across `/` and `/cv` is exactly `{U+2190}`; the accent (`#C1272D`, read from `app/globals.css`'s `@theme`, never hardcoded) is absent at rest and proven present on both a keyboard-focused and a hovered link; and a source-tree sweep of every `.tsx` under `app/` and `components/` finds zero arbitrary Tailwind bracket values and zero non-zero `rounded-*` utilities.
- Both plan-mandated induced-red demonstrations were run against real (temporary) breakage, captured verbatim, and reverted before either commit — `git diff` on both touched files (`components/landing/contents-nav.tsx`, `app/(en)/cv/page.tsx`) is clean.

## Task Commits

Each task was committed atomically:

1. **Task 1: tests/cross-links.spec.ts — every link, every alternate, every locale** - `d90d827` (test)
2. **Task 2: tests/design-budget.spec.ts — the rendered-value roll-call** - `6105924` (test)

_No feat/fix commits — this plan is test-only by design; both files are net-new specs, not implementation changes._

## Files Created/Modified

- `tests/cross-links.spec.ts` - D-4.4 §1 cross-link integrity audit across all 7 routes, both locales
- `tests/design-budget.spec.ts` - D-4.4 §3 DOM-tier design-system roll-call

## Decisions Made

- **Non-Latin character filter refined from the plan's literal wording, based on measured content.** See `key-decisions` above — em dashes and "Zürich"'s ü are legitimate rendered copy on `/`, not decoration, so the filter allowlists Basic Latin, Latin-1 Supplement letters, and common prose punctuation, then asserts the remaining union is exactly `{U+2190}`. This is documented at length in the spec file's own header comment for the non-Latin test, citing this SUMMARY.
- **`/type` included as a bonus third sweep target** for weight/size/radius/icons/resting-accent (not for the non-Latin union, which the plan scopes explicitly to "both pages" — `/` and `/cv`). Runtime stayed well under budget (24 tests / 12.6s), so the plan's "only if it stays fast" condition is satisfied.
- **`npm run test:all` not run** — deliberately scoped to the plan's own `<verification>` block (`npm test`), because the concurrently-running plan 06-09 owns `tests/build/prerender.test.ts` with four assertions that are red by design right now. Running `test:all` would have failed for a reason entirely outside this plan's scope. `npm test` (full 173-test Playwright suite) was run instead and passed with zero failures.

## Deviations from Plan

None — plan executed exactly as written. The non-Latin-character filter refinement above is a test-authoring judgment call within this task's own scope (writing the spec correctly against measured reality, per this repo's own standing rule to assert measured values), not a deviation from a plan instruction — it directly implements the plan's own stated goal ("assert the resulting set is exactly {U+2190}"), which the literal "outside Basic Latin" wording would have contradicted against real, correct site content.

## Cross-Link Audit Results (recorded per the plan's Output spec)

**Deduplicated internal hrefs (9 unique), all 200:**

| Href | Referenced from |
|---|---|
| `/writing` | `/`, `/texte`, `/writing/the-chart-therefore-changes` |
| `/cv` | `/` |
| `/writing/the-chart-therefore-changes` | `/`, `/writing`, `/texte/die-darstellung-aendert-sich` |
| `/` | `/cv`, `/type` (×2 — both demo links), `/writing`, `/texte` |
| `/texte` | `/writing`, `/texte/die-darstellung-aendert-sich` |
| `/writing/fixture` | `/writing` (dev-mode draft visibility — `showDrafts()` is always true under `npm run dev`) |
| `/texte/die-darstellung-aendert-sich` | `/texte`, `/writing/the-chart-therefore-changes` |
| `/texte/musterseite` | `/texte` (dev-mode draft) |
| `/texte/nur-auf-deutsch` | `/texte` (dev-mode draft) |

**Deduplicated external hrefs (4 unique), all absolute `https://`, no `target`, none containing `ib-gdp-evolution`:**

| Href | Referenced from |
|---|---|
| `https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing` | `/`, `/writing/the-chart-therefore-changes` |
| `https://watchpeopledie.live` | `/` |
| `https://github.com/guillem-gelabert` | `/`, `/cv` |
| `https://ib-gdp.guillemgelabert.com/auf-mallorca-weiss-es-jeder` | `/texte/die-darstellung-aendert-sich` |

The private `ib-gdp-evolution` GitHub repository does not appear anywhere in the crawl — confirmed by the passing assertion, not merely by inspection.

**Alternates:** `/writing`, `/texte`, `/writing/the-chart-therefore-changes`, `/texte/die-darstellung-aendert-sich` each resolve their `hreflang`/`x-default` targets by pathname; `/`, `/cv`, `/type` emit zero `link[rel="alternate"]` tags (asserted positively, English-only by design).

**HOME-03:** `#work`, `/writing`, `#backlog`, `/cv`, `#contact` — exactly five, in that order, all reachable.

## Design-Budget Audit Results (recorded per the plan's Output spec)

**Distinct rendered `fontSize` set per route, at 1440px (all ≤ 4):**

| Route | Set | Count |
|---|---|---|
| `/` | `139.2px, 18px, 14px, 72px` | 4 |
| `/cv` | `14px, 72px, 18px` | 3 |
| `/type` | `14px, 139.2px, 18px, 72px` | 4 |

(139.2px is the Display clamp curve's uncapped value at 1440px; 72px is the Heading clamp curve's ceiling, already reached at 1440px — both measured, not assumed, matching this repo's standing rule.)

**Non-Latin/non-prose-punctuation union across `/` and `/cv`:** `{"/":[],"/cv":["U+2190"]}` → union is exactly `{U+2190}`.

**Arbitrary-Tailwind-value / non-zero-`rounded-` source sweep:** 0 occurrences found across every `.tsx` under `app/` and `components/`. Allowlist is empty (built from the tree at execution time — verified 2026-09-01 via `grep -rnoE "(text-\[|font-\[|bg-\[#|w-\[|rounded-[a-z0-9]*)" app components --include="*.tsx"`, which returned nothing).

**Accent (`#C1272D` / `rgb(193, 39, 45)`, read from `app/globals.css`):** absent at rest on `/`, `/cv` and `/type`; present as `outlineColor` on a Tab-focused nav link and as `color` on a hovered nav link.

## Induced-Red Demonstrations (captured verbatim, then reverted)

**1. Cross-links — CV nav entry temporarily pointed at `/cvv`** (`components/landing/contents-nav.tsx`, reverted, `git diff` clean):

```
Error: internal href "/cvv" (linked from /) returned 404, expected non-404
```

and, from the HOME-03 test in the same run:

```
Error: expect(received).toEqual(expected) // deep equality
- Expected  - 1
+ Received  + 1
  Array [
    "#work",
    "/writing",
    "#backlog",
-   "/cv",
+   "/cvv",
    "#contact",
  ]
```

**2. Design-budget — a temporary `<strong>` wrapped a word in `/cv`'s stub line** (`app/(en)/cv/page.tsx`, reverted, `git diff` clean):

```
Error: third weight found on /cv — offending elements:
[
  {
    "tag": "strong",
    "classes": "",
    "text": "written",
    "fontWeight": "700",
    "fontSize": "18px"
  }
]
```

## Spec Runtimes

- `npx playwright test tests/cross-links.spec.ts --repeat-each=2` — 12 tests (6 × 2), **14.8s**, zero flakes.
- `npx playwright test tests/design-budget.spec.ts --repeat-each=2` — 24 tests (12 × 2), **12.6s**, zero flakes.
- Combined `npx playwright test tests/cross-links.spec.ts tests/design-budget.spec.ts --repeat-each=2` — 36 tests, **16.0s**, zero flakes.
- `npm test` (full suite, both new specs included) — **173 tests, 40.9s**, zero failures.

## Verification Performed

1. `npx playwright test tests/cross-links.spec.ts tests/design-budget.spec.ts --repeat-each=2` — 36/36 passed, zero flakes, both well under 60s. ✅
2. Both induced-red demonstrations captured verbatim (above) and reverted — `git status` and `git diff` on both touched files clean before either commit. ✅
3. `npm test` — 173/173 passed. ✅
4. `git status` clean of demonstration edits at commit time. ✅
5. `npm run lint` — exactly one error, the pre-existing known deferred `components/smear-heading/use-prefers-reduced-motion.ts:23` `react-hooks/set-state-in-effect` finding (not touched, per this plan's explicit instruction not to fix it). `npx tsc --noEmit` — exits 0, no output. ✅
6. `git diff app/(en)/layout.tsx app/(de)/layout.tsx` — empty. `git diff --stat components/smear-heading/` — empty. ✅

## Issues Encountered

None. Both specs passed on first full run after authoring, with zero flakes across `--repeat-each=2`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both automated halves of D-4.4 are shipped and green, ready to be cited as evidence by the milestone's written final-audit plan (06-11), which owns D-4.4's remaining sections (the Out-of-Scope roll-call, the BRIEF §8 gut-check, live-deploy header/unfurl checks, and housekeeping) plus the manual verification rows this plan does not cover.
- No blockers. The private `ib-gdp-evolution` repository is confirmed, mechanically, not to leak from any of the seven crawled routes.
- `robots` was not touched (per this plan's explicit constraint) — `components/smear-heading/` diff is empty, both root layouts' diffs are empty.

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*

## Self-Check: PASSED

- FOUND: tests/cross-links.spec.ts
- FOUND: tests/design-budget.spec.ts
- FOUND: .planning/phases/06-cv-contact-photo-discoverability/06-10-SUMMARY.md
- FOUND: commit d90d827 (Task 1: tests/cross-links.spec.ts)
- FOUND: commit 6105924 (Task 2: tests/design-budget.spec.ts)
