---
phase: 02-content-pipeline
plan: 07
subsystem: testing
tags: [playwright, node-test, next.js, build-output, i18n, railway, deployment]

# Dependency graph
requires:
  - phase: 02-content-pipeline (Plan 04)
    provides: "content/fixture.mdx, content/musterseite.mdx, content/nur-auf-deutsch.md — the three draft fixtures this plan proves are absent from a production build"
  - phase: 02-content-pipeline (Plan 06)
    provides: "app/(de)/texte/[slug]/page.tsx, app/(de)/texte/page.tsx, app/(en)/writing/page.tsx — the two locales' routes and indexes this plan's build-output assertions read from .next/server/app"
provides:
  - "tests/draft-visibility.spec.ts — the development-branch half of D-11: the fixture is reachable at /writing/fixture, /writing lists it, and its Draft marker renders exactly once at full ink, never accent"
  - "tests/build/prerender.test.ts — the production-branch half of D-11: reads .next/server/app after a clean build to prove no draft route or title, both indexes' n=0 empty state, per-route lang, noindex surviving the layout split, and canonical + x-default alternates"
  - "package.json test:build script, run separately from the fast test:unit sweep"
  - "_pm/kanban.md — resolves the CLAUDE.md/_pm discrepancy by creating a thin phase-status mirror, per the autonomous-mode directive"
  - "Measured h2/h3 optical-check values recorded in this summary (14px uppercase 0.04em, identical at 375px and 1440px, differing only by the 1px rule and the 48px/32px top margin)"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Production-only build-output assertions live in node:test reading .next/server/app from disk, never in a second Playwright project against next build && next start — keeps the Playwright suite single-project and the two environments' assertions cleanly separated"
    - "Route-to-file mapping under .next/server/app is walked and normalised (strip .html; a bare index or a trailing /index segment normalises to the segment root) rather than hardcoded per route, so a future route needs no test changes"

key-files:
  created:
    - tests/draft-visibility.spec.ts
    - tests/build/prerender.test.ts
    - _pm/kanban.md
  modified:
    - package.json

key-decisions:
  - "textContent(), not innerText(), when counting the Draft marker's occurrences in tests/draft-visibility.spec.ts — .text-label's CSS text-transform: uppercase makes innerText() return the rendered 'DRAFT', which silently broke an exact-match count against the authored string 'Draft'; textContent() reads the un-transformed DOM text"
  - "Did not push to origin/master or trigger a live Railway deploy from this isolated worktree — see 'Checkpoint decisions taken autonomously' below"
  - "Did not touch components/smear-heading/use-prefers-reduced-motion.ts's pre-existing lint error (deferred-items.md, Wave 3/02-03) — out of scope per the executor's SCOPE BOUNDARY rule and explicitly forbidden by 02-03-PLAN.md Task 3's own acceptance criteria"
  - "_pm/kanban.md created per autonomous-mode option (a) — seeded from ROADMAP.md's phase list, kept deliberately thin so .planning/ remains the single source of truth for detailed execution state"

requirements-completed: [WRIT-01, I18N-01]

# Metrics
duration: ~30min
completed: 2026-08-31
---

# Phase 2 Plan 7: Production Build Gate, Deploy Confirmation, and the Optical Sign-Off Checkpoint Summary

**A new `node:test` reader of real `next build` output proves D-11's production half (zero draft leakage, correct per-locale `lang`/`noindex`/`hreflang` on both indexes) alongside a Playwright dev-branch spec, closing the one gap every other Phase 2 spec structurally could not reach; the full local gate (build, both test suites, Playwright, `tsc`) is green, and the two Task 3 judgement calls plus one process ambiguity around the live Railway deploy were resolved autonomously with rationale recorded below.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-08-31T08:35:00Z (approx., immediately after the worktree base correction and `npm ci`)
- **Completed:** 2026-08-31T09:05:00Z (approx.)
- **Tasks:** 3 completed (Task 3 resolved as a checkpoint per autonomous-mode instructions, not paused)
- **Files modified:** 5 (3 new: `tests/draft-visibility.spec.ts`, `tests/build/prerender.test.ts`, `_pm/kanban.md`; 1 extended: `package.json`)

## Accomplishments

- `tests/draft-visibility.spec.ts`: 3 Playwright tests proving the development half of D-11 — `/writing/fixture` responds 200, `/writing` lists the fixture (a draft visible in dev is what makes it testable at all), and the fixture's meta line shows the Draft marker exactly once at full ink (`rgb(0, 0, 0)`), never the accent value (`rgb(193, 39, 45)`).
- `tests/build/prerender.test.ts`: 7 `node:test` tests reading `.next/server/app` after a real `rm -rf .next && npm run build`, proving the production half of D-11 that no Playwright spec in this repo can reach (every spec runs against `npm run dev`, where `isVisible()` deliberately returns `true` for drafts):
  - no draft route (`writing/fixture`, `texte/musterseite`, `texte/nur-auf-deutsch`) was prerendered, and no draft title string appears in any prerendered HTML
  - both `/writing` and `/texte` render their `n=0` empty state (all three fixtures are `draft: true`, so zero public entries is the correct, expected interim state — not a bug)
  - `writing.html` carries `html lang="en"`, `texte.html` carries `html lang="de"`, with no locale-prefixed route key
  - `robots` `noindex` survived the `app/(en)/layout.tsx` / `app/(de)/layout.tsx` split
  - no dev-only chrome (the `Draft` marker string) leaked into either index
  - both indexes emit `rel="canonical"` and an `hreflang="x-default"` alternate (React SSR emits the attribute as `hrefLang`; the test matches case-insensitively)
  - Phase 1's `/` and `/type` routes still prerender after the route-group restructure
  - Deliberately verified the negative: temporarily removing `draft: true` from `content/fixture.mdx` and rebuilding made `npm run test:build` fail (2 of 7 tests, exit code 1) exactly as expected; `content/fixture.mdx` was then restored and confirmed byte-identical (`git diff --stat` empty) before re-verifying green
- `package.json`: added `"test:build": "node --test 'tests/build/*.test.ts'"`, kept separate from `test:unit` (which must stay fast and cannot depend on a completed `next build`)
- Full local gate green from a clean `.next`: `rm -rf .next && npm run build` (7 routes, zero draft prerenders) → `npm run test:build` (7/7) → `npm run test:unit` (24/24) → `npx playwright test` (57/57, up from 54 — the 3 new draft-visibility specs) → `npx tsc --noEmit` (clean)
- `_pm/kanban.md` created, resolving the `CLAUDE.md`/`_pm` discrepancy Task 3 surfaced (see Checkpoint decisions below)
- The `h2`/`h3` optical-check hierarchy signal measured directly at 375px and 1440px on `/writing/fixture` (see Checkpoint decisions below)

## Task Commits

Each task was committed atomically:

1. **Task 1: Assert draft visibility on both sides of the NODE_ENV boundary** - `c661e38` (test)
2. **Task 2: Run the full gate from a clean cache and confirm the deploy** - no new files (verification-only; the full local gate was run and is green, see Checkpoint decisions below for why the live-deploy confirmation sub-step did not run from this worktree)
3. **Task 3: Optical sign-off and the `_pm/kanban.md` question** - `5b95d0b` (docs)

**Plan metadata:** (pending — final docs commit follows this summary)

## Files Created/Modified

- `tests/draft-visibility.spec.ts` (new) - the development-branch half of D-11
- `tests/build/prerender.test.ts` (new) - the production-branch half of D-11, reading real `next build` output
- `package.json` (modified) - added the `test:build` script
- `_pm/kanban.md` (new) - thin phase-status mirror, resolving the CLAUDE.md working-agreement discrepancy

## Decisions Made

- Followed the plan's interfaces contract verbatim: production assertions live in `node:test` reading `.next/server/app`, not in a second Playwright project.
- Used `textContent()` rather than `innerText()` to count the Draft marker (see Deviations below — a real bug, found and fixed before the task's commit).
- `_pm/kanban.md` is intentionally thin — a lightweight mirror of `ROADMAP.md`'s phase list, not a duplicate of `.planning/`'s detail — so there is exactly one source of truth for execution state and one simple, human-scannable board for the working agreement `CLAUDE.md` names.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `tests/draft-visibility.spec.ts`'s Draft-marker count used `innerText()`, which CSS `text-transform: uppercase` silently corrupts**
- **Found during:** Task 1, first real-browser run of the new spec (`npx playwright test tests/draft-visibility.spec.ts`)
- **Issue:** `.text-label` (the role the Draft marker renders in) declares `text-transform: uppercase`. Playwright's `innerText()` returns the browser's *rendered* text, which reflects that CSS transform — so a `<p>` containing the authored text `"... · Draft"` returns `"... · DRAFT"` from `innerText()`. The test's `lineText.split("Draft").length - 1` therefore counted zero occurrences of the exact-case string `"Draft"`, even though the locator's `hasText: "Draft"` filter (which also normalises case internally in a way that matched) had already confirmed exactly one element existed.
- **Fix:** Switched the read from `metaLine.first().innerText()` to `metaLine.first().evaluate((el) => el.textContent ?? "")`. `textContent` returns the DOM's authored text nodes, unaffected by CSS `text-transform`, so it reads `"Draft"` as written in `lib/locales.ts`'s `UI.en.draftMarker`.
- **Files modified:** `tests/draft-visibility.spec.ts`
- **Verification:** Re-ran the spec — all 3 tests pass; confirmed via a throwaway Playwright script (`page.locator("p.text-label").allInnerTexts()` → `["30 AUGUST 2026 · AUF DEUTSCH LESEN · DRAFT", "METHODOLOGY"]`, all-caps) that this was genuinely a CSS-transform artifact and not a rendering bug in `PostMeta` itself.
- **Committed in:** `c661e38` (fixed before commit, alongside the spec that surfaced it)

---

**Total deviations:** 1 auto-fixed (Rule 1 — a test-authoring bug in this plan's own new spec, found and fixed before its commit; no application code changed)
**Impact on plan:** None on runtime behavior. The fix is confined to how the test reads DOM text; `components/post-meta.tsx` and `app/globals.css` were not touched.

## Checkpoint decisions taken autonomously

Per the autonomous-mode directive, Task 3's checkpoint was not paused on. All three items below were resolved and are recorded here rather than silently applied or silently skipped.

### 1. The `h2`/`h3` optical read — automated part measured, subjective part flagged as residual

Measured directly on `/writing/fixture` via a real Chromium render at both 375px and 1440px (values identical at both widths, confirming the Label role is fixed-size, not fluid):

| Property | `h2` | `h3` |
|---|---|---|
| `fontSize` | `14px` | `14px` |
| `textTransform` | `uppercase` | `uppercase` |
| `letterSpacing` | `0.56px` (= 0.04em × 14px) | `0.56px` |
| `fontFamily` | Newsreader | Newsreader |
| `fontWeight` | `400` | `400` |
| `lineHeight` | `18.2px` | `18.2px` |
| `marginTop` | `48px` | `32px` |
| `marginBottom` | `16px` | `8px` |
| `borderBottomWidth` | `1px` | `0px` |
| `borderBottomColor` | `rgb(0, 0, 0)` | (none) |

This confirms programmatically what UI-SPEC Dimension 4 flag #2 asserts: `h2` and `h3` are byte-for-byte identical type, and the *only* differences are the 1px full-ink rule and the 48px-vs-32px top margin (`tests/fixture-viewport.spec.ts`'s existing hierarchy-signal test already covered the margin/rule pair at both viewports; this measurement additionally confirms font-size, transform, tracking, family and weight are identical, which that test did not assert).

**What no assertion can prove — flagged, not claimed:** whether this reads as *two distinct hierarchy levels* to a human eye, particularly at 375px, is a genuine optical judgement UI-SPEC and VALIDATION.md both designate as manual. It is **not** claimed to have passed here. This remains an open human-verify item: load `http://localhost:3000/writing/fixture` at 375px and 1440px and confirm the adjacent `h2`/`h3` pair (under "Section headings, side by side") reads as two levels in one glance. If it does not read at 375px, the UI-SPEC's own remedy applies: more space above `h2`, never a fifth type size.

### 2. Whether the prose reads as Phase 1's system rather than plugin defaults

Not claimable by measurement (SC3's computed-value assertions already prove the tokens applied; VALIDATION.md is explicit that they cannot prove typographic coherence). Not claimed here. Remains an open human-verify item: read `/writing/fixture` end to end at 1440px against `/type` in a second tab.

### 3. The `_pm/kanban.md` question — option (a) taken

`CLAUDE.md`'s working agreement ("Update `_pm/kanban.md` when completing tasks") named a file that has never existed in this repository. Per this plan's autonomous-mode resolution, **option (a)** was taken: `_pm/kanban.md` was created (commit `5b95d0b`), seeded from `.planning/ROADMAP.md`'s phase list in a simple Done / In Progress / Next format, and kept deliberately thin — `.planning/` remains the detailed source of truth. `CLAUDE.md` itself was not modified. This is the most reversible option available (deleting one new file undoes it entirely) and it is the option that keeps the repository consistent with its own stated working agreement, per the rationale supplied in this plan's `autonomous_mode` instructions.

### 4. The live Railway deploy was not triggered from this worktree — recorded, not silently skipped

Task 2's action text says to commit and push so Railway's zero-config builder deploys the phase, then confirm the live URL. This executor is running in an isolated git worktree on branch `worktree-agent-ac6fb56a561832361` (not `master`) — per this run's own `<parallel_execution>` instructions, "the orchestrator updates STATE.md/ROADMAP.md centrally after merge" and "the orchestrator force-removes the worktree after you return." Investigation (not assumption) confirmed:

- Railway CLI (`railway status`, `railway service web`): the `web` service auto-deploys via GitHub integration on push to **`master`**, using the RAILPACK zero-config Node builder — matching the plan's description exactly.
- The **currently live** deployment (`https://web-production-9cedb.up.railway.app`) is still built from commit `50b27e1` — Phase 1's tip. Confirmed live, not assumed: `curl -o /dev/null -w '%{http_code}'` returns `200` for `/` and `404` for both `/writing` and `/texte`, and `PLAYWRIGHT_BASE_URL=https://web-production-9cedb.up.railway.app npx playwright test tests/deploy-smoke.spec.ts` passes (the one live check that does not depend on Phase 2 routes existing).
- `origin/master` on GitHub is itself six commits behind this worktree's local `master` base (`3bec574`, "update tracking after wave 6") — Phase 2's prior waves were merged locally but have not yet been pushed to `origin`. This is evidence the project's established practice is to batch a phase's wave merges before an explicit push, not to push per-plan from an individual worktree.

**Decision:** did not run `git push` to `origin/master` from this worktree, and did not run `railway up` to deploy directly from local files. Pushing my own worktree branch would either (a) push a branch other than `master`, achieving nothing, or (b) require force-pushing onto `master` directly from an unmerged worktree, bypassing the orchestrator's centralized merge step and this project's own established batching practice. `railway up` would deploy code that is not yet on any pushed branch, decoupling the live site from git history. Neither is reversible in the same low-cost way the `_pm/kanban.md` decision is.

**Consequence — recorded, not hidden:** RESEARCH Assumption A6 (Railway build-cache risk after the route-group restructure) remains **unproven**. The live-deploy confirmation sub-step of Task 2 (smoke spec against the *post-Phase-2* deployment; `/writing`, `/texte`, `/writing/fixture` content checks against live) has **not** run, because there is no post-Phase-2 deployment yet to check against. This is a residual action for whoever performs the actual `git push origin master` once this wave is merged — the orchestrator's normal flow, or the user directly. The full **local** gate (build, both test suites, Playwright, `tsc`) is green and is the complete proof available from inside this worktree.

## Launch Gate (carried forward, UI-SPEC)

Recorded durably per this plan's critical notes: `/writing` and `/texte` currently render the `n = 0` empty state in a production build, proven by `tests/build/prerender.test.ts` above. This is correct and expected — all three fixtures are `draft: true` until Phase 4's case study lands. **If `/writing` still renders `n = 0` when Phase 6's `FIND-02` goes to flip `robots` to indexable, Phase 6 is blocked.** This must never be the public launch condition.

## Issues Encountered

**1. `next-env.d.ts` toggled to its build-mode form (`.next/types/...`) after each `npm run build` during verification, and back to its dev-mode form (`.next/dev/types/...`) after each `npx playwright test` run (which starts `npm run dev` via its `webServer`).** Same known toggle documented in `02-05-SUMMARY.md` and `02-06-SUMMARY.md`. Confirmed clean (`git status --short` empty) before every commit and before returning.

**2. `npm run lint` exits 1, solely because of the single pre-existing error in `components/smear-heading/use-prefers-reduced-motion.ts`** logged in `deferred-items.md` under "02-03 Task 2." Re-confirmed identical (same rule, same line, same message) before and after this plan's changes. Not fixed here: it is Phase 1 output, `02-03-PLAN.md` Task 3 explicitly forbids touching `components/smear-heading/`, and the executor's own SCOPE BOUNDARY rule excludes pre-existing, out-of-scope failures. Scoped `npx eslint tests/draft-visibility.spec.ts tests/build/prerender.test.ts` — zero errors, zero warnings — confirms this plan's own new files lint clean.

## User Setup Required

None - no external service configuration required. (The live Railway deploy is a residual action for the orchestrator's post-merge push, not a manual user-configuration step — see Checkpoint decisions above.)

## Next Phase Readiness

- D-11 (draft visibility) is now proven on both sides of the `NODE_ENV` boundary — the one gap every other Phase 2 spec structurally could not close, since every Playwright spec in this repo runs against `npm run dev`.
- Every row of `02-VALIDATION.md`'s Per-Task Verification Map now has a passing automated command; both items under "Manual-Only Verifications" were measured as far as measurement can go, with the remaining subjective judgement explicitly flagged rather than claimed.
- Phase 2's requirements (`WRIT-01`, `I18N-01`) are complete in code and fully test-covered.
- **Not yet true:** the live Railway URL does not yet serve Phase 2. This is the one open item blocking Phase 2's actual close-out — `origin/master` needs this wave's worktree merged and pushed, at which point Railway's existing GitHub integration will deploy it automatically (no config change needed). RESEARCH Assumption A6 (build-cache risk) will be provably resolved (or not) only once that push happens.
- Phase 6's `sitemap.ts` (`FIND-02`) must reuse `publishedFor()` from `lib/content.ts` rather than re-deriving the draft rule — noted in-file in `tests/build/prerender.test.ts` as well, so the rule is not silently stated twice.
- No blockers for Phase 3 (`Work List & Landing Skeleton`) — it depends on Phase 2's code/routes, which are complete, not on the live deploy.

## Self-Check: PASSED

All created files verified present on disk (`tests/draft-visibility.spec.ts`, `tests/build/prerender.test.ts`, `_pm/kanban.md`, this SUMMARY.md) via direct `[ -f ... ]` checks — all FOUND. Both commit hashes (`c661e38`, `5b95d0b`) verified present in `git log --oneline --all` — both FOUND. `package.json`'s `test:build` script confirmed via `node -e "..."` acceptance check above.

---
*Phase: 02-content-pipeline*
*Completed: 2026-08-31*
