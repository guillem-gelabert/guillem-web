---
phase: 06-cv-contact-photo-discoverability
plan: 05
subsystem: infra
tags: [seo, sitemap, robots, next-metadata-routes, findable]

requires:
  - phase: 06-01
    provides: "NOT_FOUND_SLUG / notFoundPath constants (CR-01 reserved 404 routes) that this plan's exclusion filter references"

provides:
  - "app/sitemap.ts — MetadataRoute.Sitemap built from publishedFor() in both locales plus the four static routes"
  - "app/robots.ts — MetadataRoute.Robots: allow /, disallow /type, absolute sitemap URL derived from SITE_URL"
  - "Trailing-slash spelling decision for the site root (no trailing slash), binding on plans 06-07 and 06-09"
  - "Five unused Next scaffold SVGs removed from public/"

affects: [06-07, 06-09, 06-11]

tech-stack:
  added: []
  patterns:
    - "Metadata routes (app/sitemap.ts, app/robots.ts) enumerate FROM the content module (publishedFor) rather than restating the draft/visibility rule — the pattern this phase's sitemap follows and 06-09 will assert against"

key-files:
  created:
    - app/sitemap.ts
    - app/robots.ts
  modified:
    - tests/global-setup.ts

key-decisions:
  - "Site root spelled without a trailing slash in the sitemap, matching what Next already emits for the landing's own rel=canonical (alternates.canonical: \"/\" resolves to the bare origin). new URL(\"/\", SITE_URL).toString() disagrees by default, so the sitemap normalises explicitly via SITE_URL.origin. Plans 06-07 (canonicals) and 06-09 (the build-tier assertion binding both surfaces) must use the same bare-origin spelling."
  - "The reserved 404 routes are excluded from the sitemap via an explicit filter keyed on notFoundPath(\"en\")/notFoundPath(\"de\"), even though today's post-entry enumeration (built from publishedFor, not from generateStaticParams on the [slug] segment) would never actually produce them — the filter is there so a future refactor that changes how post entries are derived cannot silently start emitting them."
  - "robots.txt allows crawling site-wide and disallows /type, but does not flip indexing: robots: { index: false } stays untouched on both root layouts. This file is documented in-source as preparation for the user's own FIND-02 flip, not the flip itself."

patterns-established:
  - "New metadata/utility routes that Playwright's global-setup warms must be added to tests/global-setup.ts's ROUTES list per that file's own binding comment ('every new route this phase adds goes in this list')."

requirements-completed: [FIND-02]

duration: ~15min
completed: 2026-09-01
---

# Phase 6 Plan 5: Sitemap and robots.txt Summary

**`app/sitemap.ts` enumerates six routes straight from `publishedFor()` (drafts and reserved 404s excluded by construction, not by restated rule); `app/robots.ts` allows the site, disallows `/type`, and points at an absolute `SITE_URL`-derived sitemap URL — five unused Next scaffold SVGs deleted, `robots: { index: false }` on both root layouts untouched.**

## Performance

- **Duration:** ~15 min (npm ci + four clean builds/verifications + one Rule 1 fix)
- **Completed:** 2026-09-01
- **Tasks:** 2/2
- **Files modified:** 8 (2 created, 5 deleted, 1 modified)

## Accomplishments
- `app/sitemap.ts` builds every URL with `new URL(path, SITE_URL)`, enumerates the four static routes plus `publishedFor(locale)`'s output for both locales, and was verified end to end against a real build: exactly six `<loc>` entries, byte-for-byte matching the prototype output recorded in `06-RESEARCH.md`.
- Demonstrated the draft rule holds without restatement: flipping `content/the-chart-therefore-changes.mdx` to `draft: true` and rebuilding dropped exactly that one entry from the sitemap (its German twin, an independent post, was unaffected); reverted, `git diff content/` confirmed clean.
- `app/robots.ts` emits `User-Agent: *` / `Allow: /` / `Disallow: /type` / a `Sitemap:` line resolved against `SITE_URL` — verified byte-for-byte against the prototype's recorded output.
- Deleted `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` after confirming zero references across `app/`, `components/`, `lib/`, `content/`, `tests/`; all five now 404 in a running production server. `public/case-study/` and `public/fixture/` untouched.
- `robots: { index: false }` on `app/(en)/layout.tsx` and `app/(de)/layout.tsx` is untouched (`git diff` empty) — the site remains noindex. `app/robots.ts` documents in comments that this file is not the flip and that `Disallow` is not `noindex`, naming plan 06-07 as the owner of `/type`'s own metadata fix.

## Task Commits

Each task was committed atomically:

1. **Task 1: app/sitemap.ts** - `75f0120` (feat)
2. **Task 2: app/robots.ts, delete five scaffold SVGs** - `6b2dc6a` (feat)
3. **tests/global-setup.ts warm-up list** - `1ba731f` (chore, deviation — see below)

_No plan-metadata commit: per objective instructions, STATE.md and ROADMAP.md are not updated by this executor._

## Files Created/Modified
- `app/sitemap.ts` - Default async function returning `MetadataRoute.Sitemap`; four static routes plus `publishedFor(locale)` per locale, filtered against the reserved-404 constants, site root spelled without a trailing slash
- `app/robots.ts` - Default function returning `MetadataRoute.Robots`; allow `/`, disallow `/type`, `sitemap` field resolved against `SITE_URL`
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` - deleted (unreferenced Next scaffold assets)
- `tests/global-setup.ts` - added `/sitemap.xml` and `/robots.txt` to the Playwright warm-up `ROUTES` list

## Decisions Made
- Trailing-slash spelling for the site root: no trailing slash, via `SITE_URL.origin`, to match Next's own canonical resolution. Recorded as a comment in `app/sitemap.ts` and binding on plans 06-07 and 06-09 (see frontmatter `key-decisions`).
- The reserved-404 exclusion is implemented as an explicit `Set`-based filter over `notFoundPath("en")`/`notFoundPath("de")` even though it is currently a no-op against `publishedFor`'s output, per the plan's instruction to make "adding a route without deciding its sitemap status" visible rather than silent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Reworded `app/robots.ts` comments to avoid tripping `launch-gate.test.ts`'s flip-declaration scan**
- **Found during:** Task 2 verification (`npm run test:unit`)
- **Issue:** The first draft of `app/robots.ts` documented the FIND-02 flip using the literal text `` `robots: { index: false }` `` in two comments. `tests/unit/launch-gate.test.ts` (shipped by plan 06-03) scans every `.ts`/`.tsx` file under `app/` and `lib/` for the pattern `\brobots\s*:` and asserts it appears in *exactly* the two root layout files (plus, optionally, `/type`'s page once 06-07 lands). The literal comment text matched that pattern, so `app/robots.ts` itself became a third, unexpected "declaring" file and the test failed (1 fail out of 131).
- **Fix:** Reworded both comments to describe the same fact — "the `index: false` value of the `robots` metadata key" instead of the literal `` `robots: { index: false }` `` — which carries no `robots:`-shaped substring. Verified with a direct regex test against the file content.
- **Files modified:** `app/robots.ts`
- **Verification:** `npm run test:unit` returned to 130 pass / 1 skip (the skip is the pre-existing, unrelated G12 launch-gate.md row pending plan 06-11); `npx tsc --noEmit` clean; `npm run lint` shows only the one pre-existing deferred error at `use-prefers-reduced-motion.ts:23`.
- **Committed in:** `6b2dc6a` (Task 2 commit, folded into the same commit since caught before commit)

**2. [Rule 2 - Missing Critical] Added `/sitemap.xml` and `/robots.txt` to `tests/global-setup.ts`'s warm-up list**
- **Found during:** Post-task review, following the orchestrator's critical_notes ("If you add a route, add it to `tests/global-setup.ts`'s warm-up list") and the file's own binding in-source comment ("every new route this phase adds goes in this list" — established by plan 06-01's CR-01 routes)
- **Issue:** Not strictly required for correctness (neither route is locator-tested by an existing Playwright spec), but the file's own documented invariant is that every new route this phase adds is listed here, and skipping it would silently break that invariant for the next plan that adds a route.
- **Fix:** Appended both paths to the `ROUTES` array with a comment noting they are metadata routes, not locator-tested pages.
- **Files modified:** `tests/global-setup.ts`
- **Verification:** File change is additive only; no existing route removed or reordered.
- **Committed in:** `1ba731f`

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing-invariant addition)
**Impact on plan:** Both fixes necessary to keep the shipped test suite green and the warm-up list's own documented contract intact. No scope creep — no other files touched.

## Issues Encountered
- Port 3000 was held by the concurrently-running 06-04 executor's dev server for the entire session. Per the parallel-execution guidance ("WAIT rather than report a spurious failure"), the full `npm run test:all` Playwright pass was not run against that shared port. This plan's own `<verification>` block (steps 1–7: clean build, curl-based route checks, `test:unit`, `test:build`, `tsc --noEmit`, `lint`, and the two `git diff` emptiness checks) was run in full and passed — Playwright specifically for `/sitemap.xml`/`/robots.txt` was not exercised, since no spec targets those two routes today. Flagging this rather than resolving it silently, per instructions.
- `next-env.d.ts` toggled between its dev-mode and build-mode import paths on every `next build`/`next start` cycle (a documented artifact of this worktree, per critical_notes). Reverted with `git checkout -- next-env.d.ts` before every commit; final working tree is clean.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `app/sitemap.ts` and `app/robots.ts` are ready for plan 06-07 (canonicals — must use the same bare-origin trailing-slash spelling) and plan 06-09 (the build-tier assertion binding sitemap entries to `publishedFor()` output and both canonical/sitemap URL surfaces to the same spelling).
- `/type`'s own `robots: { index: false }` metadata is still owed by plan 06-07 — `app/robots.ts`'s `Disallow: /type` prevents crawling only, not indexing of a URL linked from elsewhere, and this is documented in-source.
- The FIND-02 flip itself (removing `robots: { index: false }` from both root layouts) remains entirely undone by this plan, as required — it is the user's own action after clearing the three blocking copy items recorded in `06-VALIDATION.md`.

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*

## Self-Check: PASSED

- FOUND: app/sitemap.ts
- FOUND: app/robots.ts
- CONFIRMED DELETED: public/file.svg, public/globe.svg, public/next.svg, public/vercel.svg, public/window.svg
- FOUND commit: 75f0120
- FOUND commit: 6b2dc6a
- FOUND commit: 1ba731f
