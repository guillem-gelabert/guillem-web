---
phase: 06-cv-contact-photo-discoverability
plan: 08
subsystem: testing
tags: [playwright, accessibility, cls, performance-observer, fixture-mutation, email-obfuscation]

# Dependency graph
requires:
  - phase: 06-cv-contact-photo-discoverability
    plan: "04"
    provides: "components/contact-block.tsx, components/portrait.tsx, components/cv/cv-sections.tsx, app/(en)/cv/page.tsx and app/(en)/page.tsx's real #contact section — the shipped surfaces this plan proves in the browser, plus the two now-red tests/landing.spec.ts assertions (:191, :453) named for this plan to fix"
provides:
  - "tests/contact.spec.ts — PROF-03's three-part accessibility test (keyboard reachability, accessible name, copyable text/href) against a real fixture address, plus channel-presence/absence proofs on both / and /cv"
  - "tests/cv.spec.ts extended — the portrait's decode/sizing/CLS/document-order proofs against a fixture asset, the shipped null-portrait zero-<img> proof, and a font-weight sweep over /cv's <main> that catches a <strong> resolving to 700"
  - "tests/landing.spec.ts extended — #contact's real channel block proven (not the deleted interim stub), the private-repo ban narrowed to allow exactly the one legitimate GitHub profile link"
  - "tests/landing-trail.spec.ts extended — D-2.6's smear-origin invariance proven across the portrait's load, with 03-UI-SPEC.md's superseded reasoning corrected in place"
  - "tests/fixtures/cv-portrait-fixture.ts and tests/fixtures/file-lock.ts — a reusable, locked technique for exercising lib/cv.ts's populated state against the real dev server without ever committing a fixture value"
affects: ["06-09 (owns tests/build/prerender.test.ts's production-tier equivalents and does not need to touch the dev-tier assertions this plan already fixed)", "06-10 (site-wide design-budget sweep — this plan's font-weight sweeps on /cv and #contact are its precedent, not its replacement)", "06-11 (the screen-reader leg of PITFALLS #5's three-part test, and the real portrait/EXPERIENCE/EMAIL hand-off)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Source-file fixture mutation, locked: tests/fixtures/cv-portrait-fixture.ts and tests/contact.spec.ts's own installContactFixture() both temporarily rewrite a lib/*.ts module on disk, wait for Turbopack's dev-mode HMR to recompile (polled via fetch against the real served HTML, not a fixed sleep), then restore the exact original bytes. tests/fixtures/file-lock.ts (mkdirSync-based atomic mutex) serializes this across Playwright worker processes and --repeat-each's duplicated test tree, since fullyParallel: true can schedule concurrent mutators of the same file onto different workers"
    - "Dependency-free PNG generation via node:zlib: tests/fixtures/cv-portrait-fixture.ts hand-encodes a real, valid, decodable PNG (IHDR/IDAT/IEND with CRC32) using only node:zlib's deflateSync — no image library, so naturalWidth/naturalHeight in the browser prove a genuine decode rather than a mocked response"
    - "Rendered-value font-weight sweeps as the only tier that catches a <strong> resolving to 700 under Tailwind v4 preflight's compiled (not source) b,strong{font-weight:bolder} — applied to /cv's whole <main> (tests/cv.spec.ts) and to #contact (tests/landing.spec.ts), following tests/landing.spec.ts (x)'s existing #backlog precedent"

key-files:
  created:
    - tests/contact.spec.ts
    - tests/fixtures/file-lock.ts
    - tests/fixtures/cv-portrait-fixture.ts
  modified:
    - tests/cv.spec.ts
    - tests/landing.spec.ts
    - tests/landing-trail.spec.ts

key-decisions:
  - "The fixture-mutation technique (not a new test-only app route, not react-dom/server rendered outside Next's own pipeline) was chosen for getting fixture EMAIL/LINKEDIN/PORTRAIT/EXPERIENCE onto a real page, because it is the one technique already proven against this exact dev server/Turbopack setup (plan 06-04's own manual verification did the identical thing by hand) and it measures the REAL compiled CSS/fonts rather than a hand-assembled document that could silently drift from the real render"
  - "tests/contact.spec.ts's lib/contact.ts mutation and tests/cv.spec.ts's/tests/landing-trail.spec.ts's lib/cv.ts mutation never need to coordinate with each other (different files, independent state) — only cv.spec.ts and landing-trail.spec.ts, which both mutate lib/cv.ts, share tests/fixtures/cv-portrait-fixture.ts's lock"
  - "tests/fixtures/file-lock.ts extracted as its own module (used by both tests/contact.spec.ts and tests/fixtures/cv-portrait-fixture.ts) rather than duplicating the mkdirSync retry loop in two places — proven necessary in this same session: the first run without a lock on tests/contact.spec.ts raced --repeat-each's duplicated fixture window and failed on repeat 2"
  - "Every fixture-dependent test.describe uses mode: \"serial\" so a shipped-state assertion is guaranteed to run either fully before or fully after a fixture window opens, rather than relying on Playwright's fullyParallel scheduling to happen to keep them apart"

requirements-completed: [PROF-01, PROF-02, PROF-03, PROF-04, PROF-05]

# Metrics
duration: ~40min (anchored against the first task commit at 13:09:43+02:00; session start not captured via an explicit timestamp)
completed: 2026-09-01
---

# Phase 6 Plan 8: Browser-Tier Proofs for CV, Contact and the Portrait's Load Summary

**Playwright now proves PROF-01 through PROF-05 against real fixture data — a real (obviously-fake) email address tabbed to, read by accessible name, and copied byte-for-byte; a real decoded portrait sized against `/cv`'s `<main>`; a measured near-zero layout-shift score; and the `/cv` heading's smear origin proven invariant across the image's load — via a locked, self-reverting source-mutation technique that leaves `lib/cv.ts` and `lib/contact.ts` byte-identical to their shipped null state on every run.**

## Performance

- **Duration:** ~40 min (anchored against the first task commit at 2026-09-01T13:09:43+02:00; exact session start not captured)
- **Completed:** 2026-09-01T13:15Z
- **Tasks:** 3
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- `tests/contact.spec.ts` proves PITFALLS #5's browser-testable two-thirds (keyboard reachability with a measured focus ring, accessible-name resolution, and byte-exact `textContent`/`href`) against a fixture address (`fixturecontact@example.test`) temporarily written into `lib/contact.ts` and reverted, plus the shipped absent-channel state, `[disabled]`/`[aria-disabled]` absence, same-component-on-both-surfaces, and the WCAG 2.5.8 24px target floor.
- `tests/cv.spec.ts` extends the existing six assertions (all still pass, byte-unmodified) with the portrait's populated-state proofs — `naturalWidth > 0`, intrinsic `width`/`height` attributes, computed width strictly less than `<main>`'s content width (measured 240px vs 1232px, Pitfall 10), `border-radius: 0px`, document order after the `<h1>` — a `PerformanceObserver` CLS measurement reusing `tests/font-cls.spec.ts`'s own `< 0.1` threshold (measured: `0`), and a font-weight sweep over `/cv`'s whole `<main>` that is the only tier able to catch a `<strong>` resolving to 700.
- `tests/landing.spec.ts` (j) is narrowed, not deleted: the private repo still never leaks, but the blanket zero-`github.com`-links ban now allows exactly the one legitimate contact-profile link plan 06-04 shipped. (u) is rewritten from the stale `SectionStub` description to real assertions against `ContactBlock`'s rendered output, plus a `#contact`-scoped font-weight sweep.
- `tests/landing-trail.spec.ts` gains D-2.6's smear-origin invariance test (measured: `138.1875px` before and after the fixture portrait's `decode()`), with the record corrected in place: `documentTop` is gauge-invariant (cited at the four exact provider line numbers), the reservation requirement is CLS-driven rather than trail-driven, and `03-UI-SPEC.md:232`'s superseded reasoning is named and corrected rather than silently inherited.
- `tests/fixtures/cv-portrait-fixture.ts` and `tests/fixtures/file-lock.ts` give both `tests/cv.spec.ts` and `tests/landing-trail.spec.ts` a shared, cross-process-locked way to exercise `/cv`'s populated state without ever letting a fixture value reach `lib/cv.ts`'s committed bytes — verified via `git diff --stat lib/cv.ts` (and `lib/contact.ts`, and `components/smear-heading/`) reading empty after every run in this session, including the full four-file `--repeat-each=3` concurrent run.

## Task Commits

1. **Task 1: tests/contact.spec.ts — PROF-03's three-part test, and channel presence on both surfaces** - `fc352dc` (test)
2. **Task 2: tests/cv.spec.ts — the portrait, the CLS guard, and the sections** - `3627e81` (test)
3. **Task 3: the landing's real #contact, and the smear-origin invariance across image load** - `dc955b3` (test)

**Plan metadata:** SUMMARY.md committed separately (STATE.md/ROADMAP.md not touched — parallel worktree constraint; orchestrator updates those after merge).

## Files Created/Modified

- `tests/contact.spec.ts` — PROF-03's browser-tier accessibility test and channel presence/absence proofs on `/` and `/cv`
- `tests/fixtures/file-lock.ts` — a minimal `mkdirSync`-based cross-process mutex, shared by `tests/contact.spec.ts` and `tests/fixtures/cv-portrait-fixture.ts`
- `tests/fixtures/cv-portrait-fixture.ts` — installs/removes a fixture `PORTRAIT`+`EXPERIENCE` state into `lib/cv.ts` on disk, including a dependency-free PNG encoder
- `tests/cv.spec.ts` — extended with the portrait's decode/sizing/CLS/document-order proofs, the shipped zero-`<img>` proof, and the `/cv` `<main>` font-weight sweep
- `tests/landing.spec.ts` — (j) narrowed to allow the one legitimate GitHub profile link; (u) rewritten against the real `ContactBlock`, replacing the stale interim-stub description
- `tests/landing-trail.spec.ts` — extended with D-2.6's smear-origin invariance test and its corrected reasoning

## Decisions Made

See `key-decisions` in the frontmatter above for the four decisions (fixture-mutation technique choice, lock scoping, the shared `file-lock.ts` extraction and why it was necessary, and serial `describe` scoping for every fixture-dependent block).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `tests/contact.spec.ts`'s fixture install/remove needed a cross-process lock, not just `tests/fixtures/cv-portrait-fixture.ts`'s**
- **Found during:** Task 1's own `--repeat-each=3` verification run
- **Issue:** The first version of `installContactFixture()`/`removeContactFixture()` had no lock. `--repeat-each=3` duplicates the whole test file's tree, and Playwright's `fullyParallel: true` scheduled two duplicates of the "populated" serial `describe` block onto different worker processes concurrently — the second worker's `beforeAll` tried to match `lib/contact.ts`'s null-state lines while the first worker's fixture window was still open, found no match (the file was already mutated), and threw. 22 of 27 tests passed on the first attempt; the fixture-dependent ones failed.
- **Fix:** Extracted the lock logic already written for `tests/fixtures/cv-portrait-fixture.ts` into a shared `tests/fixtures/file-lock.ts` module, and used it in both `tests/contact.spec.ts` (guarding `lib/contact.ts`) and `tests/fixtures/cv-portrait-fixture.ts` (guarding `lib/cv.ts`, refactored to use the shared module instead of its own inline copy).
- **Files modified:** `tests/fixtures/file-lock.ts` (new), `tests/contact.spec.ts`, `tests/fixtures/cv-portrait-fixture.ts`
- **Verification:** `npx playwright test tests/contact.spec.ts --repeat-each=3` — 27/27 pass, zero flakes, on the corrected run. The full four-file `--repeat-each=3` combined run (165 tests) also passed with zero flakes, confirming `tests/cv.spec.ts` and `tests/landing-trail.spec.ts` — which both mutate `lib/cv.ts` independently and could run in different workers — never raced each other either.
- **Committed in:** `fc352dc` (Task 1 commit) and `3627e81` (Task 2 commit, for the `cv-portrait-fixture.ts` refactor)

**2. [Rule 1 - Bug] The literal string "ResizeObserver" in a warning comment would have tripped the plan's own acceptance grep**
- **Found during:** Writing `tests/landing-trail.spec.ts`'s D-2.6 comment, before running any test
- **Issue:** The plan's action text says to warn that nobody should later "fix" the trail with a `ResizeObserver" — but its own acceptance criteria requires `grep -c ResizeObserver tests/landing-trail.spec.ts` to return 0, which a comment using that literal word would fail, regardless of the surrounding "don't do this" framing. The same self-referential grep trap plan 06-04's SUMMARY documented twice (the `next/image` comment, and the `SectionStub` comment).
- **Fix:** Reworded the warning to "a browser API that watches an element's box for size changes" — same meaning, no literal match.
- **Files modified:** `tests/landing-trail.spec.ts`
- **Verification:** `/usr/bin/grep -c ResizeObserver tests/landing-trail.spec.ts components/smear-heading/*.ts*` returns 0 for every file.
- **Committed in:** `dc955b3` (Task 3 commit)

**3. [Rule 1 - Bug] The corrected comment at `tests/landing.spec.ts` (u) still named the deleted component literally, tripping the plan's own `SectionStub` grep**
- **Found during:** Writing the replacement comment for (u), before running any test
- **Issue:** First draft explained what the deleted component *used to do* by naming it ("SectionStub, no longer exists"), which itself matched `grep -c SectionStub tests/landing.spec.ts`'s required-zero check — the exact trap 06-04's SUMMARY documented for the identical word in a different file.
- **Fix:** Reworded to describe the deleted component functionally ("the interim stub component this comment used to describe") rather than by name.
- **Files modified:** `tests/landing.spec.ts`
- **Verification:** `/usr/bin/grep -c SectionStub tests/landing.spec.ts` returns 0.
- **Committed in:** `dc955b3` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking — the missing lock — and 2 bugs, both self-referential grep traps in explanatory comments, both instances of a pattern this same phase's prior plan already documented twice)
**Impact on plan:** All three were necessary for the plan's own stated acceptance criteria and verification commands to pass. No scope creep — every file touched is either in the plan's declared `files_modified` list or is a new `tests/fixtures/*` helper module required to implement the plan's own explicitly-described fixture technique (see Task 2's action text: "against a fixture asset the spec controls").

## Measured Values (per this plan's `<output>` instruction)

- **CLS, `/cv` with the fixture portrait:** `0` (measured), against `tests/font-cls.spec.ts`'s own reused threshold of `< 0.1` — not a new number.
- **Portrait computed width vs `<main>`'s content width (Pitfall 10):** `imgWidth: 240px`, `mainContentWidth: 1232px`, at the default 1280x720 viewport — 240 strictly less than 1232.
- **Smear-origin, `/cv`'s `<h1>`, before vs after the fixture portrait's `decode()`:** `138.1875px` both times — identical.
- **`git diff --stat lib/cv.ts`, `lib/contact.ts`, `components/smear-heading/`, `app/(en)/layout.tsx`, `app/(de)/layout.tsx`:** empty after every test run performed in this session, including the full four-file `--repeat-each=3` concurrent run (165 tests, zero flakes).

## Issues Encountered

None beyond the three auto-fixed deviations above.

## User Setup Required

None — no external service configuration required.

## Verification Performed

- `npx playwright test tests/contact.spec.ts --repeat-each=3` — 27/27 pass, zero flakes.
- `npx playwright test tests/cv.spec.ts --repeat-each=3` — 45/45 pass, zero flakes; `git diff --stat lib/cv.ts` empty.
- `npx playwright test tests/landing.spec.ts tests/landing-trail.spec.ts --repeat-each=2` — 62/62 pass, zero flakes; `git diff --stat components/smear-heading/` empty.
- `npx playwright test tests/contact.spec.ts tests/cv.spec.ts tests/landing.spec.ts tests/landing-trail.spec.ts --repeat-each=3` — 165/165 pass, zero flakes (the real cross-file concurrency test for the shared `lib/cv.ts` lock).
- `npm test` (full Playwright suite) — 155/155 pass.
- `npm run test:unit` — 130 pass, 1 skipped (pre-existing G12 skip, owned by plan 06-11), 0 fail.
- `npx tsc --noEmit` — exits 0.
- `npm run lint` — exactly the one pre-existing deferred error (`use-prefers-reduced-motion.ts:23`), unchanged; zero new errors or warnings.
- `git status --short` — clean after every run in this session.

## Next Phase Readiness

- Plan 06-09 can proceed directly to `tests/build/prerender.test.ts`'s production-tier equivalents — this plan's dev-tier fixes (the two assertions plan 06-04's SUMMARY named at `:191` and `:453`) are already in place and do not need to be revisited.
- Plan 06-10's site-wide `tests/design-budget.spec.ts` has two working precedents to extend rather than invent: the `/cv`-wide font-weight sweep (`tests/cv.spec.ts` (o)) and the `#contact`-scoped one (`tests/landing.spec.ts` (u)).
- `tests/fixtures/cv-portrait-fixture.ts` and `tests/fixtures/file-lock.ts` are available for any future plan that needs to exercise `lib/cv.ts`'s populated state against a real dev server render — the technique is proven safe under full concurrent load.
- No blockers. Working tree is clean; only the three task commits plus this SUMMARY exist on this worktree branch beyond the corrected base.

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*

## Self-Check: PASSED

All six claimed files confirmed present on disk (`tests/contact.spec.ts`,
`tests/fixtures/file-lock.ts`, `tests/fixtures/cv-portrait-fixture.ts`,
`tests/cv.spec.ts`, `tests/landing.spec.ts`, `tests/landing-trail.spec.ts`,
this SUMMARY.md), and all three task commits confirmed present in
`git log --oneline --all` (`fc352dc`, `3627e81`, `dc955b3`).
