---
phase: 06-cv-contact-photo-discoverability
plan: 03
subsystem: content-and-launch-safety
tags: [node-test, typed-data-module, launch-gate, no-fabrication, robots, next-metadata]

# Dependency graph
requires:
  - phase: 03-work-list-landing-skeleton
    provides: "POSITIONING_PLACEHOLDER (lib/work.ts), the placeholder-marked-in-source-never-on-screen pattern, /cv and #contact as already-routed stub surfaces"
  - phase: 05-backlog
    provides: "COPY_REVIEWED (lib/backlog.tsx), tests/unit/backlog-source.ts's shared .tsx-as-text reader, the three-channel tripwire pattern"
provides:
  - "lib/cv.ts — CvRole/CvEducation/CvLanguage types, EXPERIENCE/EDUCATION/LANGUAGES (empty), PortraitAsset type, PORTRAIT (null), CV_STUB_BODY, selectedWork"
  - "lib/contact.ts — EMAIL/LINKEDIN (null), GITHUB (established fact), ContactChannel type, channels() assembly helper"
  - "tests/unit/launch-gate.test.ts — the biconditional binding G2/G3/G4/G5/G6/G11 to robots: { index: false } on both root layouts, proven red in both directions"
affects: ["06-04 (renders /cv and #contact from these two modules)", "06-11 (writes launch-gate.md, which un-skips this plan's G12 test)", "06-12 (the eventual FIND-02 flip this test gates)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "[USER-SUPPLIED] doc-comment tag: tag + requirement ID + gate row + shipped state + never-invent instruction, on every user-supplied export (third instance of the pattern POSITIONING_PLACEHOLDER and COPY_REVIEWED established)"
    - "Biconditional launch gate: a single node:test file asserting BOTH branches (noindex while unfilled, indexable once filled) so 'flip the flag' and 'the values are real' are the same commit by construction"
    - "Cross-reference, don't restate: lib/cv.ts's selectedWork holds { work: WORK, caseStudySlug: CASE_STUDY_SLUG } rather than copying any string from lib/work.ts"
    - "Parameterised assembly helper: channels(email, linkedin, github) defaults to the module's own shipped state but accepts overrides, so the omission contract is testable across all four null/set combinations independent of today's state"

key-files:
  created:
    - lib/cv.ts
    - lib/contact.ts
    - tests/unit/cv.test.ts
    - tests/unit/contact.test.ts
    - tests/unit/launch-gate.test.ts
  modified: []

key-decisions:
  - "lib/cv.ts's import of lib/work.ts uses an explicit .ts extension — Node's native type-stripping resolver (used by node --test and by this plan's own raw `node --input-type=module` verify command) does not resolve extensionless relative specifiers the way next build's bundler resolution does; tests/unit/work.test.ts already established this convention for the same reason"
  - "selectedWork is { work: WORK, caseStudySlug: CASE_STUDY_SLUG }, not a restated array — plan 06-04 destructures from it rather than importing lib/work.ts a second time"
  - "channels() is a pure function with defaulted parameters reading EMAIL/LINKEDIN/GITHUB, not a plain exported array — this is what let tests/unit/contact.test.ts prove the omission contract across all four combinations without mutating module state"
  - "CvEducation uses {years, qualification, institution, place}; CvLanguage uses {language, level} — Claude's Discretion per 06-CONTEXT.md, not separately decided upstream"

requirements-completed: [PROF-01, PROF-03, PROF-04, PROF-05, FIND-02]

# Metrics
duration: 22min
completed: 2026-09-01
---

# Phase 6 Plan 3: CV/Contact Placeholders and the Biconditional Launch Gate Summary

**Five user-supplied personal facts (email, LinkedIn, employment history, photograph, positioning sentence) now ship as typed null/empty placeholders bound to `robots: { index: false }` by a single node:test biconditional, proven red in both directions and reverted clean.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-09-01T09:23:00Z
- **Completed:** 2026-09-01T09:44:47Z
- **Tasks:** 3
- **Files modified:** 5 (all newly created)

## Accomplishments

- `lib/cv.ts` and `lib/contact.ts` ship every one of the five user-supplied facts as `null`/`[]`, each with a `[USER-SUPPLIED]` doc comment naming its requirement ID, gate row, and an explicit never-invent instruction — GitHub is distinguished as established fact (from `git remote -v`), never gated.
- `tests/unit/cv.test.ts` and `tests/unit/contact.test.ts` assert both modules' shape contracts, including the omission rule (`channels()`) proven across all four `EMAIL`/`LINKEDIN` null/set combinations by passing values in rather than mutating the module.
- `tests/unit/launch-gate.test.ts` is a true biconditional (both an `index: false` branch and an `index: true` branch exist in the file) binding G2/G3/G4/G5/G6/G11 to both root layouts' `robots` field, with a failure message that enumerates the exact unfilled rows by gate ID and source file.
- The gate was demonstrated red in both directions — a six-row failure with all values unfilled, and a five-row failure with `EMAIL` alone filled — both captured verbatim below, both reverted; the working tree carries zero diff on either root layout, `lib/work.ts`, or `lib/backlog.tsx` at the end.
- A second `launch-gate.test.ts` test asserts `robots:` is declared in exactly the two root layouts a FIND-02 flip must edit, with `/type`'s future permanent noindex (plan 06-07) exempted by name. A third test records G12 (the case-study editorial pass) against the phase's not-yet-written `launch-gate.md`, explicitly skipped with plan 06-11 named as owner.

## Task Commits

1. **Task 1: lib/cv.ts and lib/contact.ts — the typed placeholders** - `a1c3867` (feat)
2. **Task 2: tests/unit/cv.test.ts and tests/unit/contact.test.ts — the shape and absence contracts** - `5ecbe60` (test)
3. **Task 3: tests/unit/launch-gate.test.ts — the mechanical link to the robots flag** - `d5cee9e` (test)

**Plan metadata:** SUMMARY.md committed separately (STATE.md/ROADMAP.md not touched — parallel worktree constraint; orchestrator updates those after merge).

## Files Created/Modified

- `lib/cv.ts` — `CvRole`/`CvEducation`/`CvLanguage` types, `EXPERIENCE`/`EDUCATION`/`LANGUAGES` (empty), `PortraitAsset` type, `PORTRAIT` (null), `CV_STUB_BODY`, `selectedWork` cross-reference to `lib/work.ts`
- `lib/contact.ts` — `EMAIL`/`LINKEDIN` (null), `GITHUB` (established fact), `ContactChannel` type, `channels()` assembly helper
- `tests/unit/cv.test.ts` — shape/contract tests for `lib/cv.ts`, including the empty-state contract as a named test
- `tests/unit/contact.test.ts` — shape/contract tests for `lib/contact.ts`, all four null/set combinations of the assembly helper
- `tests/unit/launch-gate.test.ts` — the biconditional gate, the two-root-layouts-only assertion, and the skipped G12 record test

## Decisions Made

- **Extension-qualified relative import.** `lib/cv.ts` imports `./work.ts` (not `./work`) because this plan's own Task 1 verify command loads `lib/cv.ts` via raw `node --input-type=module`, and Node's native type-stripping resolver — unlike `next build`'s bundler resolution or `tsc`'s `moduleResolution: bundler` — does not add extensions to a relative specifier. `tests/unit/work.test.ts` already established this convention (`import("../../lib/work.ts")`); this plan extends it to a source module, not just a test file.
- **`selectedWork` as a cross-reference object**, not a restated array: `{ work: WORK, caseStudySlug: CASE_STUDY_SLUG }`. Verified no title/annotation/host/URL string from `lib/work.ts`'s `WORK` appears literally in `lib/cv.ts`.
- **`channels()` as a parameterised pure function** rather than a plain exported list, specifically so `tests/unit/contact.test.ts` could assert the omission contract across all four `EMAIL`/`LINKEDIN` combinations without mutating the module — the plan's stated requirement.
- **Field names for `CvEducation`/`CvLanguage`** (`qualification`/`institution`/`place`, `language`/`level`) — Claude's Discretion per `06-CONTEXT.md`, no upstream decision existed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `lib/contact.ts`'s own doc comments used the literal words the source-scan test bans**
- **Found during:** Task 2, first `npm run test:unit` run after writing `tests/unit/contact.test.ts`
- **Issue:** `lib/contact.ts`'s doc comments described the null-rather-than-disabled pattern and the absence of a "disabled"/"coming soon" branch using those literal words — which then tripped the new source-scan test (`lib/contact.ts contains no disabled/coming-soon branch anywhere in the assembly path`) against itself.
- **Fix:** Reworded both comments to convey the identical meaning without the banned literals (e.g. "null-rather-than-greyed-out pattern", "no branch here ever returns a greyed-out or 'not yet available' entry").
- **Files modified:** `lib/contact.ts`
- **Verification:** `npm run test:unit` — 118/118 pass after the reword.
- **Committed in:** `5ecbe60` (Task 2 commit)

**2. [Rule 3 - Blocking] Type predicate too wide under `strict`**
- **Found during:** Task 2, pre-commit `npx tsc --noEmit`
- **Issue:** `tests/unit/contact.test.ts`'s `.filter((label): label is string => ...)` failed TS2677 — a type predicate narrowing a `"Email" | "GitHub" | "LinkedIn" | null` union to plain `string` is not assignable to its parameter type.
- **Fix:** Narrowed the predicate to `label is "Email" | "GitHub" | "LinkedIn"`.
- **Files modified:** `tests/unit/contact.test.ts`
- **Verification:** `npx tsc --noEmit` exits 0.
- **Committed in:** `5ecbe60` (Task 2 commit)

**3. [Rule 3 - Blocking] Extensionless relative import unresolvable by Node's native TS resolver**
- **Found during:** Task 1, running the plan's own verify command (`node --input-type=module -e "import ... from './lib/cv.ts'; ..."`)
- **Issue:** `lib/cv.ts`'s initial `import { CASE_STUDY_SLUG, WORK } from "./work"` failed with `ERR_MODULE_NOT_FOUND` under raw `node` — extensionless relative specifiers resolve fine under `next build`'s bundler and `tsc`'s `moduleResolution: bundler`, but not under Node's own ESM resolver.
- **Fix:** Added the explicit `.ts` extension, matching `tests/unit/work.test.ts`'s existing convention for the same constraint.
- **Files modified:** `lib/cv.ts`
- **Verification:** The plan's exact verify command now prints the expected JSON; `npx tsc --noEmit` exits 0 (permitted by `allowImportingTsExtensions` in `tsconfig.json`).
- **Committed in:** `a1c3867` (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All three were necessary for the plan's own stated verify commands and acceptance criteria to pass. No scope creep — no file outside `lib/cv.ts`, `lib/contact.ts`, and `tests/unit/contact.test.ts` was touched.

## The Two Required Red-Direction Demonstrations (Task 3), Verbatim

**1. `app/(en)/layout.tsx` flipped to `robots: { index: true }`, all six values unfilled:**

```
app/(en)/layout.tsx must read robots: { index: false } while any blocking value is unfilled — blocked — unfilled rows: G2 (lib/work.ts), G3 (lib/cv.ts), G4 (lib/contact.ts), G5 (lib/contact.ts), G6 (lib/cv.ts), G11 (lib/backlog.tsx)
```

**2. Same flip, with `EMAIL` additionally set to a probe value in `lib/contact.ts` (G4 now filled):**

```
app/(en)/layout.tsx must read robots: { index: false } while any blocking value is unfilled — blocked — unfilled rows: G2 (lib/work.ts), G3 (lib/cv.ts), G5 (lib/contact.ts), G6 (lib/cv.ts), G11 (lib/backlog.tsx)
```

G4 is correctly absent from the five-row list — the message tracks the real gate state, not a hardcoded row count.

**3. (Task 2) `PORTRAIT` set to an asset missing `height` (cast through `as PortraitAsset` to bypass the compile-time check, since the probe exercises the runtime test, not the type system):**

```
error: 'height must be a positive integer'
```

All three probes were reverted immediately after capture; `git diff` on `app/(en)/layout.tsx`, `app/(de)/layout.tsx`, and `lib/contact.ts` was confirmed empty before the corresponding task's commit.

## Exported Shapes Plan 06-04 Consumes

```ts
// lib/cv.ts
export type CvRole = { years: string; role: string; org: string; place: string; note: string };
export type CvEducation = { years: string; qualification: string; institution: string; place: string };
export type CvLanguage = { language: string; level: string };
export const EXPERIENCE: readonly CvRole[];       // []
export const EDUCATION: readonly CvEducation[];   // []
export const LANGUAGES: readonly CvLanguage[];    // []
export type PortraitAsset = { src: string; width: number; height: number; alt: string };
export const PORTRAIT: PortraitAsset | null;      // null
export const CV_STUB_BODY: string;                // "The CV is being written up as a page."
export const selectedWork: { work: typeof WORK; caseStudySlug: string };

// lib/contact.ts
export const EMAIL: string | null;                // null
export const LINKEDIN: string | null;              // null
export const GITHUB: string;                       // "https://github.com/guillem-gelabert"
export type ContactChannel = { label: "Email" | "GitHub" | "LinkedIn"; value: string };
export function channels(
  email?: string | null,   // defaults to EMAIL
  linkedin?: string | null, // defaults to LINKEDIN
  github?: string,          // defaults to GITHUB
): readonly ContactChannel[];  // channels() -> [{ label: "GitHub", value: GITHUB }] today
```

## Issues Encountered

None beyond the three auto-fixed deviations above.

## User Setup Required

None — no external service configuration required.

## Confirmation: Both Root Layouts Unchanged

```
$ git diff "app/(en)/layout.tsx" "app/(de)/layout.tsx" lib/work.ts lib/backlog.tsx
(empty)
```

`robots: { index: false }` still reads on both root layouts at the end of this plan. `git diff --stat components/smear-heading/` is also empty. `npm run lint` reports exactly the one pre-existing deferred error (`use-prefers-reduced-motion.ts:23`), unchanged.

## Next Phase Readiness

- Plan 06-04 can now import `lib/cv.ts` and `lib/contact.ts` directly to render `/cv` and `#contact` around the shapes documented above — no data-layer work remains for those surfaces.
- `tests/unit/launch-gate.test.ts` is live in the fast tier (`npm run test:unit`, ran on every commit) from this commit forward — any future plan that fills G2–G6 or G11 will have this test flip in the same commit as robots itself is inverted, and any plan that touches `robots:` outside the two root layouts (e.g. plan 06-07's shared metadata factory) will fail the second test unless it is `/type`'s own declaration.
- G12 remains an explicitly skipped test until plan 06-11 writes `.planning/phases/06-cv-contact-photo-discoverability/launch-gate.md` — no action needed here, just a known dependency for that later plan.
- No blockers. Working tree is clean; only the three task commits plus this SUMMARY exist on this worktree branch beyond the corrected base.

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*

## Self-Check: PASSED

All five created files confirmed present on disk (`lib/cv.ts`, `lib/contact.ts`,
`tests/unit/cv.test.ts`, `tests/unit/contact.test.ts`, `tests/unit/launch-gate.test.ts`) and all
three task commits confirmed present in `git log --oneline --all` (`a1c3867`, `5ecbe60`,
`d5cee9e`).
