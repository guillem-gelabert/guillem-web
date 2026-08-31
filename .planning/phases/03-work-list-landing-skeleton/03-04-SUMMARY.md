---
phase: 03-work-list-landing-skeleton
plan: 04
subsystem: ui
tags: [nextjs, playwright, typescript, accessibility, css, metadata]

# Dependency graph
requires:
  - phase: 03-01
    provides: "lib/locales.ts UI.en.homeLink; SmearTitle's as? union widened to include h3"
  - phase: 03-02
    provides: "app/globals.css: .section-head, .link, .link-quiet"
provides:
  - "app/(en)/cv/page.tsx: the /cv stub route — Server Component, real metadata (title + alternates.canonical only), deliberately typeset placeholder (D-02)"
  - "tests/cv.spec.ts: 200 status, single h1/Humane-heading, back-link text+href, WCAG 2.5.8 target size, and placeholder-word absence gate for /cv"
  - "app/(en)/type/page.tsx: amendment A4 — one specimen section demonstrating .section-head, .link (inside body copy) and .link-quiet (standalone) at rest, plus their hover/focus/reduced-motion behaviour in prose"
  - "tests/type-specimen.spec.ts: exactly-one-each class count assertions plus the section-head rule's computed border colour/width/style"
affects: [03-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Internal navigation inside any page (including a Client Component specimen page) uses next/link's Link, never a raw <a> — eslint's @next/next/no-html-link-for-pages rejects the raw form even for a static demonstration anchor"

key-files:
  created:
    - app/(en)/cv/page.tsx
    - tests/cv.spec.ts
  modified:
    - app/(en)/type/page.tsx
    - tests/type-specimen.spec.ts

key-decisions:
  - "The /cv route's source comments explaining the inherited noindex directive and base URL had to paraphrase rather than quote the literal words 'robots' and 'metadataBase' — Task 1's verify script scans the whole raw file (including comments) for those strings, not just the rendered/runtime shape, so a comment that named them literally would fail its own gate. Resolved by describing the mechanism ('the noindex directive', 'the base URL') instead of the property name."
  - "cv.spec.ts test (d) asserts the back link's text via toHaveText (reads textContent) rather than .innerText() — the Label role applies text-transform: uppercase, so innerText() returns the rendered uppercase string while the source string and Playwright's accessible-name matching both stay mixed-case. Matches the existing pattern in tests/writing-not-found.spec.ts."

patterns-established:
  - "A page-file verify script that bans a literal string across the whole raw file (not just runtime behaviour) forces explanatory comments to paraphrase rather than name the property/rule directly — apply this reading to any future plan's node -e verify snippets that grep raw source."

requirements-completed: [HOME-03]

# Metrics
duration: 10min
completed: 2026-08-31
---

# Phase 3 Plan 4: /cv Stub Route and /type Specimen Amendment Summary

**`/cv` now returns 200 with a real `<h1>`, real metadata and the shared site-root back link, and `/type` gains one reference specimen proving `.section-head`, `.link` and `.link-quiet` render correctly — closing the last unreachable HOME-03 destination and giving the phase's new CSS contract a checkable rendering.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-08-31T11:37:42Z
- **Completed:** 2026-08-31T11:47:57Z
- **Tasks:** 3/3
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- `app/(en)/cv/page.tsx` created: Server Component, `metadata` declaring exactly `title` and `alternates.canonical`, noindex inherited (not restated) from `app/(en)/layout.tsx`, back link using `UI.en.homeLink` at target-size-compliant `link-quiet inline-block py-xs`, `<h1>` via `SmearTitle as="h1" className="text-heading"` (Humane, trail), and the exact drafted body copy — no rendered placeholder marker word
- `tests/cv.spec.ts` created: 6 tests covering the literal 200 status, exactly-one `<h1>` reading `CV`, the Humane font-family on the heading, the back link's text+href together, the measured ≥24px target-size floor, and `body.innerText` absence of all six placeholder-marker words
- `app/(en)/type/page.tsx` amended (A4): one new `<section>` appended after the four existing role specimens — a Label caption, the `.section-head` specimen, a `.link` specimen inside a sentence of body copy, a standalone `.link-quiet` specimen (`Guillem Gelabert` → `/`), and a closing sentence naming the hover/focus/reduced-motion behaviour; `/type` stays a Client Component and still registers exactly 5 trail headings
- `tests/type-specimen.spec.ts` extended: one new test asserting exactly one `.section-head`, one `.link`, one `.link-quiet`, plus the `.section-head` rule's computed `borderBottomColor: rgb(0, 0, 0)` / `borderBottomWidth: 1px` / `borderBottomStyle: solid` — the existing test is untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: Create app/(en)/cv/page.tsx — the /cv stub route** - `eb3afe4` (feat)
2. **Task 2: Create tests/cv.spec.ts** - `5cbb50f` (test)
3. **Task 3: Amendment A4 — /type specimen + tests/type-specimen.spec.ts** - `bb06727` (feat)

_No plan-metadata commit — the orchestrator commits STATE.md/ROADMAP.md after the wave completes, per parallel-executor instructions._

## Files Created/Modified
- `app/(en)/cv/page.tsx` - New. The `/cv` stub route: metadata, back link, `<h1>CV</h1>`, placeholder body line
- `tests/cv.spec.ts` - New. 6-test gate: status, heading, font, back link, target size, copy discipline
- `app/(en)/type/page.tsx` - Modified. Appended the A4 specimen section; added a `next/link` import
- `tests/type-specimen.spec.ts` - Modified. Added the A4 class-count + computed-style test; original test untouched

## Decisions Made
- Followed the plan's markup, copy and class contracts verbatim for both routes; the only implementation choices were the two documented above (paraphrasing banned literal strings in source comments, and the `toHaveText` vs `innerText()` fix for an uppercase Label-role link)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Raw `<a>` elements in the /type specimen failed eslint's no-html-link-for-pages rule**
- **Found during:** Task 3 (amendment A4 specimen section)
- **Issue:** The plan's action block specifies `<a className="link" href="/">` and `<a className="text-label link-quiet inline-block py-xs" href="/">` literally, but both are internal navigation to `/` inside a Next.js app — eslint's `@next/next/no-html-link-for-pages` correctly flags a raw `<a>` used for in-app routing.
- **Fix:** Imported `Link` from `next/link` and used it in place of both raw `<a>` elements, keeping every class and the href identical. The rendered DOM and the class-count assertions are unaffected — `Link` renders an `<a>` at runtime.
- **Files modified:** `app/(en)/type/page.tsx`
- **Verification:** `npx eslint "app/(en)/type/page.tsx"` clean; `npx playwright test tests/type-specimen.spec.ts` still 2/2 passing; class-count grep confirmed exactly one `.link` and one `.link-quiet` className attribute.
- **Committed in:** `bb06727` (Task 3 commit — fixed before commit, not a separate commit)

**2. [Rule 1 - Bug] Task 1's verify script bans the literal strings it also asks the code to comment**
- **Found during:** Task 1 (`/cv` metadata comment)
- **Issue:** The plan's action text instructs commenting the absence of `robots` "so a later reader does not fix the inheritance by restating it," but Task 1's own machine verify script (`if(s.includes('robots')) throw ...`, `if(s.includes('metadataBase')) throw ...`) scans the whole raw file, including comments — so a comment naming either property literally fails the plan's own gate.
- **Fix:** Reworded both explanatory comments to describe the mechanism without quoting the property name (`the noindex directive` instead of `robots: { index: false }`; `the base URL` instead of `metadataBase`). Intent and the pointer to `app/(en)/layout.tsx:13` are preserved.
- **Files modified:** `app/(en)/cv/page.tsx`
- **Verification:** Task 1's full node verify script (copied from the plan) passes; `git grep -n 'robots' app/` still returns exactly the two root layouts.
- **Committed in:** `eb3afe4` (Task 1 commit — fixed before commit, not a separate commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 — both bugs surfaced by the plan's own verify scripts during initial implementation, fixed before any commit)
**Impact on plan:** Neither changes markup, copy, class contracts or metadata shape — both are implementation-detail corrections required to satisfy the plan's own machine-checkable gates. No scope creep.

## Issues Encountered

**Shared port 3000 across parallel worktree agents.** All automated verification (unit tests, the full 70-test Playwright suite, `npm run build`, `npm run test:build`) completed successfully while port 3000 was free or served by Playwright's own managed dev-server lifecycle from this worktree. Partway through the session a sibling parallel-executor worktree (`agent-afe9e7f019ba4a33d`, a different plan in this same wave) claimed port 3000 for its own `npm run dev`/test run, which caused a later manual `npm run start` smoke-check (not part of the plan's required verification, attempted only for extra confidence) to fail with `EADDRINUSE`, and a direct `curl localhost:3000/cv` after that point to hit the sibling's server (404, since that worktree doesn't have `/cv`). This did not affect correctness: the plan-required verification (Playwright suite, `tsc`, `eslint`, unit tests, the clean build, and `test:build`) had already completed and passed against this worktree's own code before the sibling claimed the port, and `npm run build`'s route table independently confirms `/cv` prerenders as static content (`○ /cv`), which is authoritative for "responds 200 with an h1" without needing a second live-server check. No files were touched to work around this; the manual smoke-check was simply abandoned once the shared-resource conflict was identified.

## Verification

- `npx tsc --noEmit` — exits 0.
- `npx eslint` on all four touched files — 0 errors.
- `npx playwright test tests/cv.spec.ts tests/type-specimen.spec.ts` — 8/8 passing.
- `npx playwright test` (full suite, run before the sibling worktree claimed port 3000) — 70/70 passing.
- `npm run lint` — exactly the one known pre-existing error in `components/smear-heading/use-prefers-reduced-motion.ts:23` (deferred Phase 1 item); zero new errors.
- `npm run test:unit` — 46/46 tests pass.
- `rm -rf .next && npm run build` — succeeds; route table lists `○ /cv` (static) and `○ /type` (static).
- `npm run test:build` — 7/7 tests pass.
- `git grep -n 'robots' app/` — returns exactly `app/(en)/layout.tsx:13` and `app/(de)/layout.tsx:13`.

## Known Stubs

None introduced beyond what the plan itself specifies as deliberate. `/cv`'s body copy (`The CV is being written up as a page.`) is a source-marked, deliberately typeset placeholder per `D-02` — the real CV is Phase 6's job. It is not a "missing wiring" stub: the route is real, returns 200, and carries real metadata; only the content is provisional, exactly as the UI-SPEC's phase-completion checklist anticipates. No `TODO`/`Coming soon`/`Under construction`/`Lorem` marker appears anywhere in either file (asserted by `tests/cv.spec.ts` (f) and by Task 1's verify script).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`/cv` is a reachable, real HOME-03 destination — `components/landing/contents-nav.tsx`'s CV link (built by the sibling plan 03-03 in this same wave) now resolves to a 200 response instead of a 404, once both plans merge. `/type` carries a live reference rendering of all three Phase-3 CSS classes, available to any later plan that needs to check its own `.section-head`/`.link`/`.link-quiet` usage against a shipped example rather than inventing one. No blockers.

**Carried forward, per the UI-SPEC's phase-completion checklist (inherited from 03-01, unchanged by this plan):** `HOME-01` remains outstanding as `POSITIONING_PLACEHOLDER = "Developer."` in `lib/work.ts`. This plan did not touch that file or that placeholder; the tripwire must continue to be re-asserted at the top of every subsequent phase's carried-forward state until the user supplies the real sentence, and must not reach Phase 6's `FIND-02` robots flag flip.

---
*Phase: 03-work-list-landing-skeleton*
*Completed: 2026-08-31*

## Self-Check: PASSED

- FOUND: app/(en)/cv/page.tsx
- FOUND: tests/cv.spec.ts
- FOUND: app/(en)/type/page.tsx
- FOUND: tests/type-specimen.spec.ts
- FOUND: eb3afe4 (feat: /cv stub route)
- FOUND: 5cbb50f (test: tests/cv.spec.ts)
- FOUND: bb06727 (feat: /type amendment A4)
