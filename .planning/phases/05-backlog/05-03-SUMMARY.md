---
phase: 05-backlog
plan: 03
subsystem: testing

tags: [playwright, e2e, computed-style-assertions, tailwind-v4-preflight, backlog]

# Dependency graph
requires:
  - phase: 05-backlog
    provides: "Plan 01's lib/backlog.tsx (3-item content module), components/landing/backlog-list.tsx (the rendered ul), and app/(en)/page.tsx's date line + list mounted in #backlog — left tests/landing.spec.ts (r) and (u) deliberately red"
provides:
  - "tests/landing.spec.ts (r) and (u) updated to assert the post-Phase-5 true state (h3 count 6, contact-only stub loop), neither deleted nor loosened"
  - "tests/landing.spec.ts (v) — real-render proof of BACK-01's structure and D-11's three subtractions (ul not ol, 3 li, one h3.text-standfirst + one p.max-w-prose.text-body each, zero ordinals, zero host lines, zero anchors, item names in D-04 order)"
  - "tests/landing.spec.ts (w) — real-render proof of BACK-02's placement (one p.text-label outside the ul, one time[datetime] in ISO shape, absolute non-relative text, geometrically above the first li, computed uppercase)"
  - "tests/landing.spec.ts (x) — measured proof of the separator hairline, the three D-10/D-12 gaps, the shared 65ch measure, and the two-weight/four-size type budget on screen — the check tests/unit/prose-contract.test.ts structurally cannot make"
affects: ["05-04 (production-tier proof of the same date/copy truths against a real next build)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rendered-value type-budget assertion: collect every element with a non-empty DIRECT text-node child inside a section, assert computed font-weight/font-size against the shipped set — catches Tailwind v4 preflight's b,strong{font-weight:bolder}, which no source-reading gate can see"
    - "Cross-render measurement comparison (no hardcoded px): compare a new element's computed max-width against an existing shipped element's computed max-width in the SAME test run, rather than hardcoding the resolved 65ch pixel value"

key-files:
  modified:
    - tests/landing.spec.ts

key-decisions:
  - "(u)'s loop narrowed from [\"backlog\", \"contact\"] to [\"contact\"] rather than deleted — the contact stub (SectionStub) still serves #contact until Phase 6, so the assertion still has something true to prove"
  - "Date-line text assertions in (w) read el.textContent, not Locator.innerText() — .text-label computes text-transform: uppercase, and innerText() returns the RENDERED (post-transform) string (\"LAST TOUCHED 31 AUGUST 2026\"), which silently breaks a literal-casing startsWith check even though the DOM and source text are correct. Caught by running the test against a real render before trusting it."

requirements-completed: [BACK-01, BACK-02]

# Metrics
duration: 29min
completed: 2026-08-31
---

# Phase 5 Plan 3: Playwright test updates for the backlog section Summary

**Updated the two Plan-01-broken assertions to prove the new true state and added three real-render Playwright tests — (v)/(w)/(x) — proving BACK-01's structure, BACK-02's placement, and a two-weight/four-size type budget on screen that no source-level gate can see.**

## Performance

- **Duration:** 29 min (estimated from session start to final commit)
- **Started:** 2026-08-31T20:34:00+02:00 (approx.)
- **Completed:** 2026-08-31T21:03:08+02:00
- **Tasks:** 3 completed
- **Files modified:** 1 (`tests/landing.spec.ts`)

## Accomplishments

- **(r)** the heading-outline test's `h3` count moved from 3 to 6 at both the assertion and the test's own name, with a comment recording why `<h3>` was chosen over `<p>` (D-11 names exactly three subtractions and element type is not a fourth).
- **(u)** narrowed from a two-section loop to `["contact"]` alone and retitled, with a dated comment pointing at the three tests below as the backlog's real replacement — none of its three inner assertions (count 1, count 1, weight 530) were removed or weakened.
- **(v)** added: a real render proves the backlog is a `<ul>` (not `<ol>`) of exactly 3 `<li>`, each with exactly one `h3.text-standfirst` + one `p.max-w-prose.text-body` and no third child, zero ordinal rows, zero bare-hostname lines, zero anchors anywhere in the section, and the three item names in D-04's editorial order.
- **(w)** added: a real render proves the date line is one `p.text-label` outside the `<ul>`, carrying one `<time datetime="YYYY-MM-DD">`, text starting `"Last touched "`, an absolute (non-relative) rendered date, positioned strictly above the first `<li>` by `getBoundingClientRect().y`, and computing `text-transform: uppercase`.
- **(x)** added: computed-style proof of the separator hairline (mirroring shipped test `(n)`), the `<ul>`'s not-a-card box (mirroring `(m)`), the three D-10/D-12 gaps, the shared 65ch prose measure (compared against a work-list element in the same run, not hardcoded), and every element with direct rendered text inside `section#backlog` computing font-weight ∈ {400, 530} and font-size ∈ {14px, 18px} — closing Pitfall 1, which `tests/unit/prose-contract.test.ts` cannot see because Tailwind v4 preflight's `b,strong{font-weight:bolder}` lives in compiled CSS, not `app/globals.css`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update the two breaking assertions to the new true state** - `06d9909` (test)
2. **Task 2: (v) BACK-01's structure and D-11's three subtractions, (w) BACK-02's placement** - `51529fa` (test)
3. **Task 3: (x) the measured separator, the measured geometry, and the type budget on screen** - `53880d3` (test)

**Plan metadata:** committed together with this SUMMARY.md (see below).

## Files Created/Modified

- `tests/landing.spec.ts` - (r) `h3: 3` → `h3: 6` (assertion and test name); (u) narrowed to `["contact"]` and retitled; three new tests `(v)`, `(w)`, `(x)` added at the end of the file

## Measured computed-value dump for `section#backlog`

Dumped this session against a real `npm run dev` render, before writing any assertion in `(x)`. Every measured value matched research's prediction exactly — no surprises, no arithmetic assumed.

| Element | fontSize | fontWeight |
|---|---|---|
| `h2.section-head` | 14px | 400 |
| `p.text-label` (date line) | 14px | 400 |
| `time` | 14px | 400 |
| `h3.text-standfirst` ×3 | 18px | 530 |
| `p.max-w-prose.text-body` ×3 | 18px | 400 |

Set of sizes found: `{14px, 18px}`. Set of weights found: `{400, 530}`. Matches prediction exactly.

| Row | borderTopWidth | borderTopStyle | borderTopColor |
|---|---|---|---|
| `<li>` 1 | `0px` | solid | `rgb(0, 0, 0)` (unused at 0px width) |
| `<li>` 2 | `1px` | solid | `rgba(0, 0, 0, 0.12)` |
| `<li>` 3 | `1px` | solid | `rgba(0, 0, 0, 0.12)` |

Matches the shipped work-list idiom `(n)` exactly. The `<ul>` itself: all four border widths `0px`, `boxShadow: none`, `borderRadius: 0px`.

| Element | rowGap |
|---|---|
| `ul[role='list']` | `32px` (`gap-xl`) |
| each `<li>` | `8px` (`gap-sm`) |
| the date/list `<div>` | `24px` (`gap-lg`) |
| `<section>` itself | `24px` (`gap-lg`) |

Matches D-12 exactly: head→date and date→list are both `lg`, no new token.

`max-width` on `p.max-w-prose.text-body` inside `#backlog` and on `section#work p.max-w-prose`: **`662.805px`**, identical in both — confirming the backlog reuses the shipped 65ch measure rather than a new one. `(x)` asserts this equality by comparing two rendered values in the same run, not by hardcoding `662.805px`.

## Measured `h3` count before the Task 1 edit

Ran `npx playwright test tests/landing.spec.ts --reporter=line` against HEAD before any edit. Test `(r)` failed with `received.h3 = 6` against `expected.h3 = 3` — exactly the count Plan 01's SUMMARY and research predicted. No investigation of the component was needed; the failure matched the documented cause (three new `h3.text-standfirst` item names from `components/landing/backlog-list.tsx`). Test `(u)` failed on `section#backlog p.text-standfirst` resolving to 0 elements, also as predicted.

## Resolved px value of `65ch` on this machine

**662.805px**, read from `getComputedStyle(el).maxWidth` on both a `section#work p.max-w-prose` element and a `section#backlog p.max-w-prose.text-body` element in the same Playwright run (Newsreader, this machine's font metrics). `(x)` asserts the two values are equal to each other, never hardcoding this number.

## Playwright spec count against the 124-spec baseline

`npx playwright test --list` before any change: **124 tests in 19 files** (confirmed baseline). `npx playwright test --reporter=line` after all three tasks: **127 passed** — the expected `124 + 3` (`(v)`, `(w)`, `(x)`), with zero regressions elsewhere in the suite.

## Decisions Made

- **(u) narrowed rather than deleted.** The plan's own rule (T-05-11 in the threat register) treats deleting or loosening a breaking assertion as tampering; narrowing the loop to the section whose interim state genuinely still holds (`#contact`, still served by `SectionStub` until Phase 6) is the correct mechanism, and the replacement coverage for `#backlog` exists in `(v)`/`(w)`/`(x)`.
- **`textContent` over `innerText()` for the date-line text checks in `(w)`.** Found during first run of `(w)`: `.text-label` computes `text-transform: uppercase`, and Playwright's `Locator.innerText()` mirrors the browser's rendered-text algorithm, which respects CSS text-transform — it returned `"LAST TOUCHED 31 AUGUST 2026"`, not the source-cased string the assertion expected. Switched both the line-prefix check and the `<time>` text checks to `el.textContent`, which reads the un-transformed DOM string. This is the same "measure before you assert" discipline the plan calls for, applied to a trap the plan's `<action>` text hadn't explicitly named.
- **Type-budget element selection.** "Every element inside `section#backlog` that has a non-empty direct text node" was implemented as: walk all descendants, keep those with at least one child `Node.TEXT_NODE` whose trimmed `textContent` is non-empty. Measured this returns exactly 9 elements (`h2`, `p.text-label`, `time`, 3× `h3.text-standfirst`, 3× `p.text-body`) — confirmed by direct probe before writing the assertion, so the set is neither too broad (catching wrapper `div`/`ul`/`li` with no own text) nor too narrow.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Reworded (u)'s dated comment to avoid tripping its own literal grep**
- **Found during:** Task 1, immediately after first draft of the comment
- **Issue:** The plan's own acceptance criteria run `grep -c '\["backlog", "contact"\]' tests/landing.spec.ts` requiring 0 matches. My first draft of the explanatory comment quoted that exact literal array (`["backlog", "contact"]`) to describe what was narrowed from, which would have made the acceptance grep fail even though the code itself was correctly narrowed.
- **Fix:** Reworded the comment to describe the change in prose ("a two-section loop (backlog plus contact)") instead of quoting the literal array syntax.
- **Files modified:** `tests/landing.spec.ts`
- **Verification:** `grep -c '\["backlog", "contact"\]' tests/landing.spec.ts` returns `0`; test still passes.
- **Committed in:** `06d9909` (Task 1)

**2. [Rule 1 - Bug] Switched (w)'s text assertions from innerText() to textContent**
- **Found during:** Task 2, first run of test `(w)`
- **Issue:** `.text-label`'s `text-transform: uppercase` makes `Locator.innerText()` return the browser-rendered (post-transform) string. The `startsWith("Last touched ")` assertion failed against the actual returned value `"LAST TOUCHED 31 AUGUST 2026"`, even though the DOM's real text content and the visual rendering were both correct.
- **Fix:** Switched `dateLine`'s and `time`'s text reads from `.innerText()` to `el.evaluate((el) => el.textContent ?? "")`, and added a comment explaining the trap for the next reader.
- **Files modified:** `tests/landing.spec.ts`
- **Verification:** `(w)` passes; full file (23/23) and full suite (127/127) pass.
- **Committed in:** `51529fa` (Task 2)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — the assertion did not prove what it was written to prove until fixed; both caught by actually running the test against a real render rather than trusting the written assertion).
**Impact on plan:** No scope creep. Both fixes are within the plan's own stated discipline ("measure before you assert" / "assert MEASURED computed values, never derived arithmetic") applied one layer further than the plan's `<action>` text spelled out.

## Issues Encountered

None beyond the deviations above. Every task's verification command passed on the first or second attempt once the two deviations above were resolved.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `tests/landing.spec.ts` is now fully green (23/23) and the full Playwright suite is green (127/127, `124 + 3`), with the unit tier (88/88), `npx tsc --noEmit`, and `npm run lint` (one known deferred error, untouched) all clean.
- `git diff --stat` across all three of this plan's commits touches exactly one file: `tests/landing.spec.ts` — matching the plan's own verification requirement.
- Plan 05-02 (repo-tier freshness guard, `tests/unit/backlog*`) and Plan 05-04 (production-tier proof against a real `next build`) are unaffected by this plan's file — no overlap, no merge conflict expected on `tests/landing.spec.ts`.
- Plan 05-04 still owns: the `<time dateTime="...">` camelCase build-tier trap (Pitfall 2), deleting `tests/build/prerender.test.ts:486`/`:487`/`:539`, retitling the launch-gate test, and adding the rendered-date-equality and `COPY_REVIEWED` build-tier assertions. None of that belongs in this Playwright-tier file, per the plan's own split (dev truth here, production truth there).
- No blockers.

---
*Phase: 05-backlog*
*Completed: 2026-08-31*

## Self-Check: PASSED

All claimed files verified present (`tests/landing.spec.ts`, this SUMMARY.md) and all claimed
commit hashes verified present in `git log --oneline --all` (`06d9909`, `51529fa`, `53880d3`).
No missing items.
