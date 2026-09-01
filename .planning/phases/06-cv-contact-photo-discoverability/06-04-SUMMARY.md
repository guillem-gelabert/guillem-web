---
phase: 06-cv-contact-photo-discoverability
plan: 04
subsystem: ui
tags: [react-server-components, dangerouslySetInnerHTML, next-img, cls, tailwind-v4]

# Dependency graph
requires:
  - phase: 06-cv-contact-photo-discoverability
    plan: "03"
    provides: "lib/cv.ts and lib/contact.ts's typed placeholders (EXPERIENCE/EDUCATION/LANGUAGES/PORTRAIT/CV_STUB_BODY/selectedWork, EMAIL/LINKEDIN/GITHUB/channels()), each null/empty and bound to the biconditional launch gate"
provides:
  - "components/contact-block.tsx — the one ContactBlock rendering EMAIL/GITHUB/LINKEDIN as a labelled link list, used by both / and /cv; the site's only dangerouslySetInnerHTML"
  - "components/portrait.tsx — plain <img> with self-start + explicit rendered width + inline aspect-ratio, returns null when PORTRAIT is null"
  - "components/cv/cv-sections.tsx — Experience/Education/Languages/Selected work, each section-gated on its own array length"
  - "app/(en)/cv/page.tsx — the CV surface: one h1, portrait below it, the EXPERIENCE-branched body, ContactBlock at the foot"
  - "app/(en)/page.tsx's #contact section now renders ContactBlock instead of the interim stub"
  - "components/landing/section-stub.tsx deleted (D-13) — its last call site closed"
affects: ["06-09 (owns updating tests/build/prerender.test.ts's now-red assertions and tests/landing.spec.ts's now-red assertion, and owns the D-2.3 Playwright accessibility spec against a real EMAIL)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "dangerouslySetInnerHTML confined to one component (components/contact-block.tsx), guarded by a grep-provable invariant and an in-file safety comment — the only escape from React's automatic escaping anywhere on the site"
    - "Section-level self-gating: components/cv/cv-sections.tsx renders Education/Languages only when their own array is non-empty, independent of the EXPERIENCE gate that decides whether CvSections renders at all"
    - "Inline aspect-ratio derived from an asset's own intrinsic pixels via the style prop, not a Tailwind arbitrary-value class — keeps the CSS budget-gate greps (which read app/globals.css and JSX literals) blind to nothing, because there is no literal to hide"

key-files:
  created:
    - components/contact-block.tsx
    - components/portrait.tsx
    - components/cv/cv-sections.tsx
  modified:
    - app/(en)/cv/page.tsx
    - app/(en)/page.tsx
  deleted:
    - components/landing/section-stub.tsx

key-decisions:
  - "ContactBlock's value anchors and Selected work's Portrait-adjacent Label lines all reuse the text-label link-quiet inline-block py-xs shape already shipped by components/landing/contents-nav.tsx and components/language-switch.tsx, rather than inventing a new link treatment for the three contact channels"
  - "Portrait's rendered width is a named constant (240px) chosen at implementation time — 06-CONTEXT.md and 06-RESEARCH.md both state nothing upstream specifies one, only that it must be explicit — with the aspect-ratio computed from the asset's real width/height via inline style rather than a Tailwind arbitrary class, so budget-gate greps for literal pixel/hex/font arbitrary values stay meaningful"
  - "CV Selected work renders only lib/cv.ts's selectedWork.work (the two real WORK-tuple entries) using the work-list row rhythm verbatim; selectedWork.caseStudySlug is exported but not consumed by this plan — using it would mean either fabricating the case study's title/standfirst inline or fetching it asynchronously via findBySlug/publishedFor, and no acceptance criterion or read_first file required either path. Left for a future plan if the CV should cross-link the case study by its own real title."
  - "The landing route's #contact section branches on channels().length rather than calling <ContactBlock /> and inspecting its return value, so the check lives on plain data (avoids calling a component as a function outside JSX)"
  - "The all-channels-null fallback on the landing route uses fresh copy ('No contact channel is available yet.' / 'Email, GitHub and LinkedIn appear here as each one is added.'), not the deleted stub's exact strings — per D-13, the interim stub is deleted rather than kept reachable, and reusing its literal copy for a different, currently-unreachable branch would blur that distinction"

patterns-established:
  - "Grep-provable single-instance patterns: dangerouslySetInnerHTML (T-06-22), no-target-blank (T-06-23), no-next/image-in-portrait — each is asserted directly against the file's own text rather than only against rendered output"

requirements-completed: [PROF-01, PROF-02, PROF-03, PROF-04, PROF-05]

# Metrics
duration: 40min
completed: 2026-09-01
---

# Phase 6 Plan 4: CV and Contact Surfaces Summary

**`/cv` and the landing's `#contact` now render from `lib/cv.ts`/`lib/contact.ts` through one shared `ContactBlock` (entity-encoded `mailto:` via `dangerouslySetInnerHTML`, the site's only instance) and a new `Portrait` component that reserves its box via `self-start` + an inline `aspect-ratio`; `components/landing/section-stub.tsx` is deleted.**

## Performance

- **Duration:** ~40 min
- **Started:** approx. 2026-09-01T10:05:00Z (not captured via an explicit timestamp at session start; anchored against the first task commit at 10:27:00Z and the session's own tool-call history)
- **Completed:** 2026-09-01T10:41:00Z
- **Tasks:** 3
- **Files modified:** 6 (3 created, 2 modified, 1 deleted)

## Accomplishments

- `components/contact-block.tsx` renders `lib/contact.ts`'s `channels()` output as a labelled link list; absent channels are omitted entirely (never a disabled row); the component returns `null` when zero channels exist. The email row is the only `dangerouslySetInnerHTML` on the site — the safety reasoning (module-constant input, no user input anywhere on the site, cheap-scraper-deterrence-not-cryptography) is written directly above the call, per D-2.3.
- `components/portrait.tsx` and `components/cv/cv-sections.tsx` give `/cv` its real shape: a plain `<img>` (no `next/image`, no `sharp`) that reserves its box before the file decodes, and four independently-gated sections (Experience/Education/Languages/Selected work) using the work list's shipped row rhythm verbatim.
- `app/(en)/cv/page.tsx` now branches on `EXPERIENCE.length`: `CV_STUB_BODY` while empty, `CvSections` once filled — with the portrait always below the `h1` and `ContactBlock` at the foot under its own `Contact` heading.
- `app/(en)/page.tsx`'s `#contact` section renders real channels; `components/landing/section-stub.tsx` is deleted (D-13) rather than left as an unreachable fallback, closing its last remaining call site.
- Verified end to end against a running dev server and a clean production build: `tsc`/lint clean, `tests/cv.spec.ts` and `tests/landing.spec.ts` both green except the intentionally-broken interim-state assertions, `test:unit` 130/130, and the production build-tier failures captured verbatim below for plan 06-09.

## Task Commits

1. **Task 1: components/contact-block.tsx — three channels, entity-encoded email, absence as absence** - `e01dcea` (feat)
2. **Task 2: the /cv surface — portrait, sections, contact block** - `e7c137a` (feat)
3. **Task 3: the landing view's real #contact, and the deletion of the dead stub component** - `a521e6b` (feat)

**Plan metadata:** SUMMARY.md committed separately (STATE.md/ROADMAP.md not touched — parallel worktree constraint; orchestrator updates those after merge).

## Files Created/Modified

- `components/contact-block.tsx` — `ContactBlock`, the shared channel list; `EmailRow`'s `dangerouslySetInnerHTML` is the site's only instance
- `components/portrait.tsx` — `Portrait`, plain `<img>` with `self-start` + explicit rendered width + inline `aspect-ratio`; returns `null` when `PORTRAIT` is `null`
- `components/cv/cv-sections.tsx` — `CvSections`: Experience (always, once called), Education/Languages (gated on own length), Selected work (`selectedWork.work`, always non-empty by type)
- `app/(en)/cv/page.tsx` — portrait below the `h1`, `EXPERIENCE`-branch body, `ContactBlock` at the foot; `metadata` export untouched
- `app/(en)/page.tsx` — `#contact` renders `ContactBlock` (or inline fallback copy, currently unreachable); `SectionStub` import removed
- `components/landing/section-stub.tsx` — deleted; its only remaining call site (`#contact`) is closed

## Decisions Made

See `key-decisions` in the frontmatter above for the four decisions with rationale (value-anchor styling reuse, portrait rendered-width/aspect-ratio approach, Selected work scope, landing `#contact` branch shape and fallback copy).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `next/image` mentioned in a portrait.tsx comment tripped its own acceptance grep**
- **Found during:** Task 2, running the plan's own `grep -c 'next/image' components/portrait.tsx` acceptance check
- **Issue:** The file-level comment explaining why `next/image` is deliberately unused contained the literal string `next/image`, so the grep count came back 1 instead of the required 0 — the same self-referential trap 06-03 hit with the word "disabled" in `lib/contact.ts`.
- **Fix:** Reworded the comment to "the framework's built-in image component", mirroring the exact phrasing `components/mdx/figure.tsx` already uses for the identical reason.
- **Files modified:** `components/portrait.tsx`
- **Verification:** `grep -c 'next/image' components/portrait.tsx` returns 0; `tsc --noEmit` still exits 0.
- **Committed in:** `e7c137a` (Task 2 commit)

**2. [Rule 1 - Bug] "SectionStub" named in a page.tsx comment tripped its own acceptance grep**
- **Found during:** Task 3, running the plan's own `grep -rn 'SectionStub' app components lib` acceptance check after deleting the component file
- **Issue:** The inline comment explaining the fallback branch's rationale referenced the deleted component by name, so the grep still found one match even after the file itself was gone.
- **Fix:** Reworded the comment to describe the deleted component functionally ("the interim stub component this plan deletes") instead of naming it.
- **Files modified:** `app/(en)/page.tsx`
- **Verification:** `grep -rn 'SectionStub' app components lib` returns no matches.
- **Committed in:** `a521e6b` (Task 3 commit)

**3. [Rule 3 - Blocking] Worktree had no `node_modules`; Turbopack dev cache corrupted under load**
- **Found during:** Start of Task 1 verification (missing `node_modules`) and mid-Task-2 Playwright run (dev server returned `SyntaxError: Unexpected non-whitespace character after JSON` on every route, including `/`, `/cv` and the writing routes)
- **Issue:** The worktree had no local `node_modules` (Node module resolution was silently walking up to the main repo's `node_modules` instead). Separately, after `npm ci` and starting a local dev server, Turbopack's dev-mode manifest cache became corrupted under the combined load of `npm ci`, `tsc`, `eslint` and a first Playwright run, breaking every route with an identical JSON-parse error at the same byte offset.
- **Fix:** Ran `npm ci` in the worktree (per this plan's own parallel-execution instructions). For the cache corruption, killed the dev server, `rm -rf .next`, and restarted — the clean cache served every route correctly on the next run, and the corruption did not recur.
- **Files modified:** None (environment-only; no source changes)
- **Verification:** `curl -s -w '%{http_code}' localhost:3000/cv` returned 200 with well-formed HTML after the restart; `npx playwright test tests/cv.spec.ts --repeat-each=2` then passed 12/12.
- **Committed in:** N/A (no file changes)

---

**Total deviations:** 3 auto-fixed (2 bugs — both self-referential grep traps in explanatory comments — and 1 blocking environment issue)
**Impact on plan:** All three were necessary for the plan's own stated acceptance criteria and verification steps to pass. No scope creep — no file outside the plan's `files_modified` list was touched.

## Task 3's Production Build-Tier Handoff to Plan 06-09

Per the plan's own instruction, two assertions in `tests/build/prerender.test.ts` were predicted to fail as proof the interim landing state ended (`:491`, `:591`). Measured against a clean `rm -rf .next && npm run build && npm run test:build`, **three** assertions fail, not two — the threat model row T-06-22...T-06-27 already named the third one explicitly ("The blanket `github.com` ban at `:540` is deliberately broken by this plan and is narrowed — not deleted — by plan 06-09"), so this is the threat model's own prediction landing, not a new discovery. `test:build` result: **19 pass, 3 fail** (up from the plan's stated "exactly two").

**1. `tests/build/prerender.test.ts:491`** (assertion inside the test starting at `:484`, "the contact stub ships its real, deliberately typeset copy"):
```
error: '/ must render the stub copy "No contact details here yet."'
expected: true
actual: false
```

**2. `tests/build/prerender.test.ts:540`** (assertion inside the test starting at `:531`, "the private repository stays private in production"):
```
error: The input was expected to not match the regular expression /href="[^"]*github\.com[^"]*"/i.
```
The `#contact` section now emits `<a class="text-label link-quiet inline-block py-xs" href="https://github.com/guillem-gelabert">https://github.com/guillem-gelabert</a>` in the landing's production HTML — the first `github.com` href the landing has ever rendered. `tests/build/prerender.test.ts:541` (`root.includes("ib-gdp-evolution") === false`) and the `target="_blank"` assertion on the same test both still pass; only the blanket host-ban regex fails.

**3. `tests/build/prerender.test.ts:591`** (assertion inside the test starting at `:545`, "launch gate: the contact stub is still interim..."):
```
error: |-
  The expression evaluated to a falsy value:
    assert.ok(root.includes("No contact details here yet."))
```

All other build-tier tests pass (19/22 total, `1..22`, `# pass 19`, `# fail 3`). `npm run test:unit` passes 130/130 (1 pre-existing skip, the G12 launch-gate record test owned by plan 06-11).

**tests/landing.spec.ts** (dev tier, Playwright) mirrors the same interim-state break as two of its own tests, both already named in this plan's `read_first`:
- `tests/landing.spec.ts:191` ("(j) the private repo stays private: no github.com link...") — same root cause as build-tier `:540`.
- `tests/landing.spec.ts:453` ("(u) the contact stub renders one standfirst and one body line...") — same root cause as build-tier `:491`/`:591`.

`npx playwright test tests/cv.spec.ts tests/landing.spec.ts --repeat-each=2` result: **56 passed, 4 failed** (2 tests × 2 repeats, both named above; all 24 `cv.spec.ts` runs green).

## Portrait Measurements (recorded per this plan's `<output>` instruction)

Verified with a temporary 300×400 (3:4) test PNG wired into `PORTRAIT` (`public/.probe-portrait.png`, removed and `lib/cv.ts` reverted to `PORTRAIT: null` before the Task 2 commit — `git diff lib/cv.ts` confirmed empty):

- **Chosen rendered width:** 240px (a named constant in `components/portrait.tsx`, `RENDERED_WIDTH_PX`) — nothing upstream specifies a display size (06-CONTEXT.md:451, 06-RESEARCH.md:79), only that width/height must be explicit.
- **Aspect ratio:** derived from the asset's own intrinsic pixels via inline `style` (`aspect-ratio: 300 / 400` for the probe asset), not hardcoded — it will track whatever the real committed portrait's actual dimensions are.
- **Measured `<img>` computed width against `<main>`:** `imgWidth: 240`, `mainWidth: 1280` (Chromium, default viewport) — 240 is strictly less than 1280, proving `self-start` plus the explicit width defeats `/cv`'s `flex flex-col` stretch (Pitfall 10).
- **`border-radius`:** computed `0px` (no explicit rule needed — the site ships no rounding anywhere it would inherit from).
- **Attributes confirmed present:** `width="300"`, `height="400"`, `loading="eager"`, `fetchpriority="high"` (read via `img.getAttribute("fetchpriority")`, case-normalized by the DOM as HTML attribute names are case-insensitive).

## Confirmation: smear-heading and Both Root Layouts Untouched

```
$ git diff --stat components/smear-heading/
(empty)

$ git diff --stat "app/(en)/layout.tsx" "app/(de)/layout.tsx"
(empty)
```

`robots: { index: false }` still reads on both root layouts. No `ResizeObserver` was added anywhere.

## Issues Encountered

None beyond the three auto-fixed deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 06-09 owns updating the three now-red `tests/build/prerender.test.ts` assertions (`:491`, `:540`, `:591`) and the two now-red `tests/landing.spec.ts` assertions (`:191`, `:453`) to describe the shipped state rather than the interim one — all five are named above with verbatim failure output.
- Plan 06-09 also owns the D-2.3 three-part accessibility Playwright spec (tab to the email, read it, select and copy it) against a real address — `ContactBlock`'s `email`/`linkedin`/`github` props are already exercisable for exactly this, proven in this plan's own throwaway SSR verification (entity-encoded `mailto:`, no bare `@` in the address, no `target="_blank"`, no `rel=`).
- `lib/cv.ts`'s `selectedWork.caseStudySlug` remains unconsumed by `/cv` — available for a future plan to cross-link the case study by its real, fetched title if desired (see key-decisions above for why this plan did not do so).
- No blockers. Working tree is clean; only the three task commits plus this SUMMARY exist on this worktree branch beyond the corrected base.

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*

## Self-Check: PASSED

All six claimed files confirmed present on disk (`components/contact-block.tsx`,
`components/portrait.tsx`, `components/cv/cv-sections.tsx`, `app/(en)/cv/page.tsx`,
`app/(en)/page.tsx`, this SUMMARY.md), `components/landing/section-stub.tsx` confirmed
deleted, and all three task commits confirmed present in `git log --oneline --all`
(`e01dcea`, `e7c137a`, `a521e6b`).
