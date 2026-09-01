---
phase: 06-cv-contact-photo-discoverability
plan: "09"
subsystem: testing
tags: [nextjs, metadata, opengraph, sitemap, robots, node-test, production-truth]

# Dependency graph
requires:
  - phase: 06-cv-contact-photo-discoverability
    plan: "01"
    provides: "the two reserved 404 routes (notFoundPath) and the proxy's noindex-on-404 behaviour this plan proves at the production tier"
  - phase: 06-cv-contact-photo-discoverability
    plan: "04"
    provides: "the closed contact stub and PROF-04's real GitHub profile link — the two assertions this plan narrows"
  - phase: 06-cv-contact-photo-discoverability
    plan: "05"
    provides: "app/sitemap.ts and app/robots.ts, and the trailing-slash decision this plan proves against the canonical"
  - phase: 06-cv-contact-photo-discoverability
    plan: "07"
    provides: "lib/metadata.ts's factory, SITE_URL's apex fallback, and every route's own title/description/OG set this plan asserts"
provides:
  - "tests/build/prerender.test.ts as the production-truth tier for the whole phase: five narrowed assertions, sitemap/robots/OG/icon production assertions (FIND-01/FIND-02), and three named skipped tests for the unfillable gate rows (G3/G4/G6)"
  - "the flip's inversion points, documented by test title in a comment block, without the flip being performed"
  - ".planning/phases/06-cv-contact-photo-discoverability/deferred-items.md — the measured og:image segment-scoping gap on /cv, /writing, /texte, /type, out of this plan's scope to fix"
affects: ["06-10 (cross-links + design budget, ran concurrently)", "06-11/06-12 (whichever plan eventually performs the FIND-02 flip — the inversion-points comment block is written for it)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Production-tier assertions read .next/server/app/{sitemap.xml,robots.txt}.body directly (not *.html) — walkHtmlRoutes/getRoutes never sees non-HTML build artifacts"
    - "selectForLocale() + assertFrontmatter() against content/ read from disk, NOT publishedFor() — publishedFor()'s allPosts() calls loadPostModule's import(`@/content/${slug}.mdx`), a bundler-only alias specifier that throws ERR_MODULE_NOT_FOUND under plain `node --test` (the same substitution tests/unit/proxy-slugs.test.ts's own header comment already documents)"
    - "og:image asset existence proven via existsSync against `${APP_DIR}${pathname}.body`, never a hardcoded per-build-hash literal"

key-files:
  created:
    - .planning/phases/06-cv-contact-photo-discoverability/deferred-items.md
  modified:
    - tests/build/prerender.test.ts

key-decisions:
  - "The four og:* assertions research and the plan's own action text assumed would cascade to /cv, /writing, /texte from app/(en|de)/opengraph-image.png ('by segment inheritance', per 06-06-SUMMARY.md) do NOT, measured against a real production build. Next's file convention scopes an image to the exact route segment it lives in, not to nested descendant segments (unlike ordinary metadata object fields, and unlike app/icon.png, which does cascade). Rather than assert a false state to match the plan's original wording, the test asserts the TRUE current state per route (og:image present on /, both post routes; absent on /cv, /writing, /texte, /type) and documents the gap in the phase's new deferred-items.md — the fix needs files outside this plan's files_modified list."
  - "The sitemap's post-entries-vs-publishedFor() assertion (Task 2's own wording) is written against selectForLocale()+assertFrontmatter() reading content/ from disk instead, mirroring tests/unit/proxy-slugs.test.ts's already-documented substitution — publishedFor() itself cannot be called under `node --test` (ERR_MODULE_NOT_FOUND on the @/content/* bundler alias). This is the exact same measured limitation that file already worked around, not a new or weaker test."
  - "The induced-red trailing-slash demonstration (Task 2's own verification instruction) was performed as a manual, reverted probe against app/sitemap.ts rather than as a permanent embedded test — app/sitemap.ts is outside this plan's files_modified list, and the probe's purpose (proving the canonical-agreement assertion is genuinely red-provable) is a one-time verification act, not a standing mechanism. git diff app/sitemap.ts is empty after the revert."

patterns-established:
  - "A route sweep table (OG_TARGET_ROUTES) with a measured boolean flag (hasOwnOgImage) rather than a uniform loop, when the plan's assumed uniform behaviour turns out false on measurement — the flag and its adjacent comment are the single place a future plan flips once the gap in deferred-items.md #1 is closed."

requirements-completed: [PROF-01, PROF-02, PROF-03, PROF-04, FIND-01, FIND-02]

# Metrics
duration: ~55min
completed: 2026-09-01
---

# Phase 6 Plan 9: Production Truth (the `tests/build/prerender.test.ts` Tier) Summary

**Narrowed the five assertions Phase 6 broke, added FIND-01/FIND-02 production assertions for the sitemap, robots.txt, the full per-route OG set and the icon, and named the three unfillable gate rows (G3/G4/G6) as skipped tests carrying their gate IDs — `npm run test:build` goes from 18/22 to 34 pass + 3 skip / 37 total, zero failures.**

## Performance

- **Duration:** ~55 min (context reading across nine `read_first` files plus the two owning SUMMARYs, three task commits, one induced-red probe)
- **Started:** approx. 2026-09-01T12:50:00Z (not captured via an explicit timestamp at session start; anchored against the first task commit at 13:34:08+02:00 and the session's own tool-call history)
- **Completed:** 2026-09-01T13:45:07+02:00 (last task commit)
- **Tasks:** 3
- **Files modified:** 1 (`tests/build/prerender.test.ts`), plus 1 new file (`deferred-items.md`)

## Accomplishments

- All five assertions Phase 6 broke (identified in the exact red set: `:337`, `:484`/`:491`, `:531`/`:540`, `:545`/`:591`) narrowed or repurposed, never deleted — each retitled to describe what it now proves, matching Phase 4's and Phase 5's precedent for this same file.
- `tests/build/prerender.test.ts` gained 15 new tests proving FIND-01/FIND-02's production surface: the sitemap's post entries bound to the real published selection by set comparison, robots.txt's body, the site-root canonical/sitemap agreement (Pitfall 8, induced red once and reverted), the full seven-tag OG set across all six discoverability routes, exactly-one-icon, mutually-distinct titles/descriptions, and hreflang's positive/negative split.
- The three unfillable gate rows (G3 experience, G4 email, G6 portrait) each got a current-state assertion plus a named, skipped test — `npm run test:build`'s own output is now a readable gate report.
- A comment block (not a test) above the protected `:160` assertion names all three of the eventual FIND-02 flip's inversion cases by test title, and states plainly the flip is not this phase's act.
- Discovered and documented (not fixed — out of this plan's `files_modified` scope) that `og:image` does not reach `/cv`, `/writing`, `/texte` or `/type`, contradicting 06-06-SUMMARY.md's "segment inheritance" claim — logged to the phase's new `deferred-items.md`.

## Task Commits

1. **Task 1: narrow the five assertions this phase broke** - `e8e4bfa` (test)
2. **Task 2: FIND-01 and FIND-02 production assertions** - `a0ac5dd` (test)
3. **Task 3: the user-supplied rows in the production tier, and naming the flip's inversion points** - `b81050e` (test)

**Plan metadata:** SUMMARY.md committed separately (STATE.md/ROADMAP.md not touched — parallel worktree constraint; orchestrator updates those after merge).

## Files Created/Modified

- `tests/build/prerender.test.ts` — the whole plan's output; see the table below for every assertion changed and the full list of additions
- `.planning/phases/06-cv-contact-photo-discoverability/deferred-items.md` — the measured og:image segment-scoping gap, logged per the Scope Boundary rule (out of this plan's `files_modified`)

## Every Assertion Changed (Task 1)

| Test title (before) | Asserted before | Test title (after) | Asserts now |
|---|---|---|---|
| `every (en) route's meta description is bound to POSITIONING_PLACEHOLDER by equality, not a hardcoded literal` | loop `["", "cv", "type"]` all equal `POSITIONING_PLACEHOLDER` | `/'s meta description is bound to POSITIONING_PLACEHOLDER by equality, not a hardcoded literal — /cv and /type now carry their own` | loop narrowed to `[""]`; `/cv`/`/type` asserted non-empty, distinct, ≠ `POSITIONING_PLACEHOLDER`; new assertion: no `(en)` route falls back to `SITE_DESCRIPTION.en` |
| `the inherited noindex reaches both new surfaces — neither route restates robots` | loop `["", "cv"]` carry noindex | `robots noindex reaches all three (en) surfaces — / and /cv inherit it, /type declares its own permanent one` | `["", "cv"]` still inherit; `"type"` added, asserted to carry its own permanent noindex |
| `the contact stub ships its real, deliberately typeset copy — no marker word leaks into production` | both contact-stub strings asserted **present** | `both closed stubs' deleted copy — contact and backlog alike — is absent from production, and no marker word leaks in` | both contact-stub strings moved into the **absent** loop alongside the two backlog-stub strings |
| `the private repository stays private in production` | blanket `doesNotMatch(/href=.*github\.com.*/i)` | `the private repository stays private in production — the blanket github.com ban is narrowed to the profile root (PROF-04)` | every `github.com` href asserted to equal `GITHUB` (the profile root) exactly, no repo path; `ib-gdp-evolution` absence and `target="_blank"` ban untouched |
| `launch gate: the contact stub is still interim and three copy items are still unreviewed — the backlog stub closed on 2026-08-31` | `assert.ok(root.includes("No contact details here yet."))` + `COPY_REVIEWED` scrape | `launch gate: /cv is still interim and three copy items are still unreviewed — the contact stub closed on 2026-09-01` | contact-stub assertion removed; new positive assertion `root.includes(GITHUB)`; `COPY_REVIEWED` scrape unchanged |

## New Production Assertions (Task 2 — FIND-01/FIND-02)

- Sitemap post entries == real published selection, compared as sets with a differing-entry diagnostic
- Sitemap's four static routes present; `/type` and both reserved 404 routes (`notFoundPath()`) absent; every `loc` on the canonical host
- `robots.txt`: `Allow: /`, `Disallow: /type`, absolute `Sitemap:` line sharing `SITE_URL`'s origin
- `/`'s canonical and the sitemap's site-root `loc` are string-identical (Pitfall 8)
- All six discoverability routes carry `og:title`/`description`/`url`/`type`/`site_name`/`locale`, on the canonical host, with the right `og:locale`
- `og:image` parsed from the meta tag (never hardcoded); asset existence checked against build output; per-post override proven distinct from `/`'s and from the other locale's post
- Exactly one `rel="icon"` on `/`; `app/favicon.ico` confirmed absent from disk
- All six routes: non-empty, mutually distinct titles and descriptions; "Guillem Gelabert" never doubles in a title
- `/writing`/`/texte` emit `x-default`; `/`, `/cv`, `/type` emit none (positive statement)

## The Three Skipped Tests, Verbatim

```
ok 33 - G4: /'s production HTML carries the real, correctly entity-encoded address, once EMAIL is filled # SKIP blocked by G4 (lib/contact.ts) — EMAIL is still null; unblocks when the user supplies a real address
ok 35 - G3: /cv's production HTML carries EXPERIENCE's first row and the stub line is gone, once EXPERIENCE is filled # SKIP blocked by G3 (lib/cv.ts) — EXPERIENCE is still empty; unblocks when the user supplies real employment history
ok 37 - G6: /cv's production HTML carries exactly one <img> at PORTRAIT's declared dimensions, once PORTRAIT is filled # SKIP blocked by G6 (lib/cv.ts) — PORTRAIT is still null; unblocks when the user supplies a real photograph
```

## The Induced-Red Demonstration (Task 2, Pitfall 8)

Temporarily changed `app/sitemap.ts`'s `SITE_ROOT` from `SITE_URL.origin` (no trailing slash) to `SITE_URL.origin + "/"`, rebuilt, and reran the canonical-agreement test:

```
not ok 26 - /'s canonical and the sitemap's site-root loc are the exact same spelling of one page (Pitfall 8)
  error: |-
    /'s canonical href and the sitemap's site-root loc must be the exact same string
    + actual - expected
    + 'https://guillemgelabert.com'
    - 'https://guillemgelabert.com/'
```

Reverted via `git checkout -- app/sitemap.ts`; `git diff --stat app/sitemap.ts` confirmed empty; rebuilt clean and reran — 31/31 pass at that point in the plan (Task 3 later added 6 more).

## Final `npm run test:all` Counts, All Three Tiers

```
unit:       # tests 131  # pass 130  # fail 0  # skipped 1   (pre-existing G12 skip, unrelated)
build:      # tests 37   # pass 34   # fail 0  # skipped 3   (G3, G4, G6 — this plan's own)
playwright: 155 passed (29.2s)
```

`npx tsc --noEmit`: exit 0. `npm run lint`: the one pre-existing deferred error (`use-prefers-reduced-motion.ts:23`), no new errors. `git diff --stat components/smear-heading/`: empty. `git diff --stat "app/(en)/layout.tsx" "app/(de)/layout.tsx"`: empty — the flip was not performed.

## Decisions Made

See `key-decisions` in the frontmatter above — the most consequential is the og:image measured-gap decision (asserting true production state rather than the plan's inherited assumption) and the `publishedFor()`-under-`node --test` substitution (matching an already-established pattern in this codebase, not a new one).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `publishedFor()` cannot be called under `node --test` — ERR_MODULE_NOT_FOUND on the `@/content/*` bundler alias**
- **Found during:** Task 2, first `test:build` run after writing the sitemap-vs-`publishedFor()` assertion exactly as the plan's action text describes it
- **Issue:** `publishedFor()` delegates to `allPosts()`, which calls `loadPostModule`'s `import(\`@/content/${slug}.mdx\`)` — a bundler-only path alias that plain Node ESM resolution cannot resolve (`Cannot find package '@/content'`). This is not a new discovery: `tests/unit/proxy-slugs.test.ts`'s own header comment already documents the identical failure and its substitution.
- **Fix:** Replaced the direct `publishedFor()` call with the same substitution `proxy-slugs.test.ts` already established: `selectForLocale()` (the exact, unmodified selection algorithm `publishedFor()` delegates to) fed with entries read directly from `content/`'s real front-matter via a local `parseFrontmatterBlock()`/`postEntriesOnDisk()` pair, each entry validated through the real `assertFrontmatter()`. This exercises `lib/content.ts`'s real, unforked selection rule — everything `publishedFor()` does except the MDX component load, which the slug-set question never touches.
- **Files modified:** `tests/build/prerender.test.ts`
- **Verification:** `rm -rf .next && npm run build && npm run test:build` — the sitemap test passes; `npx tsc --noEmit` exit 0.
- **Committed in:** `a0ac5dd` (Task 2 commit)

**2. [Rule 1 - Bug, documented not fixed — out of scope] `og:image` does not reach `/cv`, `/writing`, `/texte`, `/type`, contradicting 06-06-SUMMARY.md's "segment inheritance" claim**
- **Found during:** Task 2, drafting the six-route OG sweep exactly as the plan's action text describes ("For each of /, /cv, /writing, /texte and both post routes, assert the presence of ... og:image")
- **Issue:** Measured against a real production build: `og:image` (and `twitter:card=summary_large_image`) is present ONLY on `/` and the two `[slug]` post routes — each has its own `opengraph-image` file-convention artifact at its EXACT segment. `app/(en)/opengraph-image.png` sits beside `app/(en)/layout.tsx`, one segment above `/cv`, `/writing`, `/type`, so it does not reach them — Next's own docs describe the convention as scoping "a route segment's shared image" to the segment the file lives in, not inheriting to nested segments the way ordinary metadata object fields do.
- **Fix:** NOT fixed — this plan's `files_modified` is `tests/build/prerender.test.ts` only, and the parallel-worktree constraint (06-10 running concurrently) prohibits touching files outside that list. The test asserts the TRUE current state (`hasOwnOgImage: false` on the three affected routes, with the gap explained inline) rather than a false one, and the gap is logged to the phase's new `.planning/phases/06-cv-contact-photo-discoverability/deferred-items.md` for whichever future plan closes it.
- **Files modified:** `tests/build/prerender.test.ts` (assertion), `.planning/phases/06-cv-contact-photo-discoverability/deferred-items.md` (new, documentation only)
- **Verification:** `rm -rf .next && npm run build && npm run test:build` — the og:image test passes against the measured true state.
- **Committed in:** `a0ac5dd` (Task 2 commit); `deferred-items.md` committed in the same commit

---

**Total deviations:** 2 (1 auto-fixed bug — the `publishedFor()` substitution — and 1 documented-not-fixed pre-existing gap, out of scope by `files_modified`)
**Impact on plan:** The `publishedFor()` substitution was necessary for the plan's own acceptance criteria to be satisfiable at all under `node --test`. The og:image gap is a genuine, measured production defect from a prior plan (06-06), correctly out of scope for this plan to fix under the parallel-worktree constraint — asserting it honestly (rather than writing a test that would either fail or lie) is what this file's own stated purpose ("what production emits") requires.

## Known Stubs

None introduced by this plan — it is test-only. The og:image gap documented above is a pre-existing production gap (not a stub this plan created), now provable rather than silently assumed.

## Threat Flags

None. This plan added no new network endpoints, auth paths, file-access patterns or schema changes — it added assertions against existing build output.

## Issues Encountered

None beyond the two deviations documented above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Whoever performs the eventual FIND-02 flip should read the comment block above `tests/build/prerender.test.ts`'s `"robots noindex survived the two-root-layout split..."` test first — it names every inversion point by test title.
- `deferred-items.md` #1 (the og:image segment-scoping gap) is available for a future plan; the fix is either four new committed images at each affected segment, or an `openGraph.images` override added to `lib/metadata.ts`'s `routeOpenGraph()`.
- G3/G4/G6's skipped tests are the durable, gate-ID-named record of what remains unfilled; when the user supplies any of EXPERIENCE/EMAIL/PORTRAIT, that skipped test starts running (and should pass) without any test-file change required.
- No blockers. Working tree is clean; only the three task commits plus this SUMMARY exist on this worktree branch beyond the corrected base.

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*

## Self-Check: PASSED

`tests/build/prerender.test.ts` confirmed present and modified on disk;
`.planning/phases/06-cv-contact-photo-discoverability/deferred-items.md` confirmed present; all
three task commits confirmed present in `git log --oneline --all` (`e8e4bfa`, `a0ac5dd`, `b81050e`).
