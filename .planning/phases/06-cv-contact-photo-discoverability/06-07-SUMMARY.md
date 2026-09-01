---
phase: 06-cv-contact-photo-discoverability
plan: 07
subsystem: infra
tags: [next-metadata, seo, opengraph, canonical-host, robots]

# Dependency graph
requires:
  - phase: 06-cv-contact-photo-discoverability
    plan: "03"
    provides: "tests/unit/launch-gate.test.ts's second test — robots: declared in exactly the two root layouts, with /type named by path as the one permitted exception"
  - phase: 06-cv-contact-photo-discoverability
    plan: "05"
    provides: "app/sitemap.ts's trailing-slash decision for the site root (SITE_URL.origin, no trailing slash) — this plan's canonicals and og:urls match that spelling"
provides:
  - "lib/site.ts — SITE_URL (apex fallback), SITE_NAME, SITE_DESCRIPTION per locale"
  - "lib/metadata.ts — rootMetadata(locale) factory for both root layouts; routeOpenGraph(locale, path) helper every leaf route calls for its own og:url without restating og:type/og:site_name/og:locale"
  - "Every route's own title (bare, under the shared template), own description, own og:url"
  - "app/(en)/type/page.tsx de-cliented to a Server Component with its own permanent robots: { index: false }"
affects: ["06-09 (owns updating tests/build/prerender.test.ts:337 to describe the new state, and the D-2.3-style og: assertions this plan makes true)", "06-11 (re-measures apex routing immediately before any FIND-02 flip, per T-06-39)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared metadata factory (lib/metadata.ts's rootMetadata) spread by both root layouts, with the noindex field excluded from the factory and re-declared literally per layout — a field a test can grep for and a flip must edit exactly twice"
    - "routeOpenGraph(locale, path) helper for per-route og:url: Next.js replaces (does not deep-merge) a child route's whole openGraph object the moment any field is set, so a bare `openGraph: { url }` would silently drop the factory's type/siteName/locale — this helper re-supplies all four from one source instead of letting each route hand-restate three of them"

key-files:
  created:
    - lib/metadata.ts
  modified:
    - lib/site.ts
    - app/(en)/layout.tsx
    - app/(de)/layout.tsx
    - app/(en)/page.tsx
    - app/(en)/cv/page.tsx
    - app/(en)/type/page.tsx
    - app/(en)/writing/page.tsx
    - app/(de)/texte/page.tsx
    - app/(en)/writing/[slug]/page.tsx
    - app/(de)/texte/[slug]/page.tsx

key-decisions:
  - "SITE_URL's fallback moved from the Railway origin to the apex guillemgelabert.com (user decision, 06-VALIDATION.md), since guillem-edge already forwards the apex to this exact service byte-identically (06-RESEARCH.md Finding F3) — local, CI and production builds now all emit the same canonical without an env var needing to be set anywhere but production, and .env stays free of NEXT_PUBLIC_SITE_URL"
  - "routeOpenGraph(locale, path) exists because Next's metadata merge REPLACES a child route's whole openGraph object rather than deep-merging it the moment the child declares any field in it — measured directly against a real build (a bare `openGraph: { url: '/cv' }` silently dropped og:type/og:site_name/og:locale). The plan's own instruction not to 'restate' those three per route is honoured in spirit: no route file hand-types the literal strings a second time, they all come from lib/metadata.ts's one source via this helper."
  - "app/(en)/page.tsx declares no `title` at all (rather than title.absolute) so it inherits the layout's title.default (SITE_NAME) — both were named as acceptable by the plan; leaving it undeclared was simpler and needed no import"
  - "/cv's hand-written description is 'Guillem Gelabert's CV — experience, education and contact details.' — none of the six marker words tests/cv.spec.ts:59-66 bans, and it does not restate HOME-01's positioning sentence"
  - "/type's hand-written description is 'A specimen of the site's display, heading, body and label type roles.' — describes the specimen itself, not the site and not the person"

patterns-established:
  - "A route needing its own og:url calls lib/metadata.ts's routeOpenGraph(locale, path) rather than writing openGraph: { url } by hand — any future route that needs one should follow the same call, not the bare-object shape that silently loses the factory's other three fields"

requirements-completed: [FIND-01, FIND-02]

# Metrics
duration: ~45min
completed: 2026-09-01
---

# Phase 6 Plan 7: Shared Metadata Factory and De-Clienting /type Summary

**One metadata factory (`lib/metadata.ts`) replaces two hand-copied root layouts, `SITE_URL`'s fallback moves to the user's chosen canonical host `guillemgelabert.com`, every one of six routes now serves its own title/description/`og:url` instead of three routes sharing the literal `"Developer."`, and `/type` is de-cliented to declare its own permanent `robots: { index: false }` — with the scroll trail measured still working there afterward.**

## Performance

- **Duration:** ~45 min (context reading, `npm ci`, three tasks each with a full clean-build + curl/Playwright verification cycle, plus one empirical Next.js merge-semantics probe)
- **Started:** approx. 2026-09-01T10:15:00Z (not captured via an explicit timestamp at session start; anchored against the first task commit at 10:54:39Z and the session's own tool-call history)
- **Completed:** 2026-09-01T11:08:00Z
- **Tasks:** 3
- **Files modified:** 10 (1 created, 9 modified)

## Accomplishments

- `lib/site.ts` extended with `SITE_NAME` and `SITE_DESCRIPTION` (per-locale, soft placeholder), and `SITE_URL`'s fallback moved from the Railway origin to `https://guillemgelabert.com` — the user's chosen canonical host, already served byte-identically by the apex per 06-RESEARCH.md Finding F3.
- `lib/metadata.ts` created: `rootMetadata(locale)` (the factory both root layouts spread — `metadataBase`, title template/default, description default, OG defaults) and `routeOpenGraph(locale, path)` (every leaf route's own `og:url` without hand-restating `og:type`/`og:site_name`/`og:locale` — see Deviations for why this second helper exists).
- Both root layouts spread the factory and declare their own `robots: { index: false }` literally — `git grep -nP 'robots\s*:\s*\{\s*index:\s*false\s*\}' app/` returns exactly three matches (the two layouts plus `/type`), confirmed below.
- All six leaf routes (`/`, `/cv`, `/writing`, `/texte`, and both `[slug]` post routes) now serve bare titles under the shared `"%s — Guillem Gelabert"` template, their own distinct description, and their own `og:url` — measured against a real production build, not assumed.
- `app/(en)/type/page.tsx` de-cliented: `"use client"` removed, all five `useSmearHeading` calls replaced with `SmearTitle`, and the route now exports its own permanent `robots: { index: false }`, title, description and canonical. `tests/smear-heading.spec.ts` (which targets `/type` directly) and `tests/type-specimen.spec.ts`/`tests/viewport.spec.ts` all pass twice with `--repeat-each=2` and zero flakes — the trail is measured, not assumed, to still work.
- End-to-end verification: `tsc --noEmit` clean, three separate clean production builds each curled across all affected routes, `test:unit` 130/131 (1 expected skip), `test:build` 18/22 (4 expected failures, all pre-identified), the full plan-specified Playwright sweep (`landing.spec.ts cv.spec.ts type-specimen.spec.ts viewport.spec.ts smear-heading.spec.ts --repeat-each=2`) 70/74 passed with the only 4 failures being the two known pre-existing 06-04 interim-state breaks doubled by the repeat flag, and `lint` showing only the one pre-existing deferred error.

## Task Commits

1. **Task 1: lib/site.ts and lib/metadata.ts — one identity, one hostname, one factory** - `5f12571` (feat)
2. **Task 2: every route's own title, description and OG tags under the template** - `e6e27dd` (feat)
3. **Task 3: de-client /type so the specimen can declare its own permanent noindex** - `c9eeecd` (feat)

**Plan metadata:** SUMMARY.md committed separately (STATE.md/ROADMAP.md not touched per this plan's execution objective — parallel worktree constraint; orchestrator updates those after merge).

## Files Created/Modified

- `lib/site.ts` — `SITE_URL`'s fallback now the apex `guillemgelabert.com`; adds `SITE_NAME`, `SITE_DESCRIPTION: Record<Locale, string>`
- `lib/metadata.ts` — `rootMetadata(locale)` (the two-layout factory, deliberately excluding `robots`) and `routeOpenGraph(locale, path)` (per-route `og:url` without restating the other three OG fields)
- `app/(en)/layout.tsx`, `app/(de)/layout.tsx` — spread `rootMetadata(locale)`, declare `robots: { index: false }` literally, hardcoded `metadataBase` removed
- `app/(en)/page.tsx` — no `title` (inherits layout default), `og:url` inherited unmodified (already correct for the site root), `description` unchanged (`POSITIONING_PLACEHOLDER`)
- `app/(en)/cv/page.tsx` — bare title `"CV"`, own hand-written description, `routeOpenGraph("en", "/cv")`
- `app/(en)/writing/page.tsx`, `app/(de)/texte/page.tsx` — bare titles, `routeOpenGraph` added, `alternates.languages`/`indexDescription` untouched
- `app/(en)/writing/[slug]/page.tsx`, `app/(de)/texte/[slug]/page.tsx` — `routeOpenGraph` added; title/description (frontmatter-sourced) untouched
- `app/(en)/type/page.tsx` — de-cliented; `SmearTitle` replaces all five `useSmearHeading` calls; exports its own permanent `robots: { index: false }`, title, description, canonical, `routeOpenGraph`

## Decisions Made

See `key-decisions` in the frontmatter above. The most consequential: `routeOpenGraph`'s existence is a direct response to a measured Next.js behavior (see Deviations below) rather than a plan-anticipated design.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `lib/metadata.ts`'s own explanatory comment tripped `tests/unit/launch-gate.test.ts`'s flip-declaration scan**
- **Found during:** Task 1, first `test:unit` sanity check after writing `lib/metadata.ts`
- **Issue:** The comment explaining why the factory excludes `robots` used the literal text `` `robots: { index: false }` `` — the same self-referential trap plans 06-04 and 06-05 hit before with "disabled" and `` `robots: { index: false }` `` respectively. `tests/unit/launch-gate.test.ts` scans every `.ts`/`.tsx` file under `app/`/`lib/` for `\brobots\s*:` and asserts it appears in exactly the two root layouts (plus `/type`, once that lands); the comment text matched the pattern, making `lib/metadata.ts` itself a third, unexpected "declaring" file.
- **Fix:** Reworded the comment to describe the same fact ("the noindex field", "that field's location") without the literal `robots:`-shaped substring, mirroring the precedent both prior plans set.
- **Files modified:** `lib/metadata.ts`
- **Verification:** `grep -cE 'robots\s*:' lib/metadata.ts` returns 0; `npm run test:unit` passes 130/130 (1 unrelated skip).
- **Committed in:** `5f12571` (Task 1 commit)

**2. [Rule 1 - Bug] A bare per-route `openGraph: { url }` silently drops the factory's og:type/og:site_name/og:locale**
- **Found during:** Task 2, an empirical probe (added `openGraph: { url: "/cv" }` to `/cv`'s metadata, rebuilt, curled the live HTML) run specifically because Next.js's own documentation contains two contradictory statements about metadata merging for nested objects like `openGraph` — one section states partial overrides are inherited, another explicitly demonstrates the opposite ("even if `openGraph.description` is absent in the child, it is REPLACED"). Rather than trust either doc section, the actual behavior was measured against a real build.
- **Issue:** Confirmed by measurement: declaring ANY field inside a route's `openGraph` object completely replaces the parent's whole `openGraph` object rather than merging into it. A route that declared only `openGraph: { url: "/cv" }` (as the plan's literal wording could be read to suggest) rendered with `og:url` present but `og:type`/`og:site_name`/`og:locale` entirely absent — a regression the plan's own acceptance criteria would not have caught (it only asserts presence of `og:url`, `og:title`, `og:description` per route), but which the plan's success criteria ("`og:type`, `og:site_name` and `og:locale` come from the factory... and should not be restated per route") explicitly rules out losing.
- **Fix:** Added `routeOpenGraph(locale, path)` to `lib/metadata.ts`, which re-supplies all four `openGraph` fields (`type`, `siteName`, `locale`, `url`) from the single source (`SITE_NAME`, `OG_LOCALE`, `SITE_URL`) every time a route needs its own `og:url`. No route file hand-types the three shared strings a second time — they come from calling this one function — satisfying the plan's "should not be restated" instruction in spirit while fixing the correctness bug the literal reading would have produced.
- **Files modified:** `lib/metadata.ts` (new export), `app/(en)/cv/page.tsx`, `app/(en)/writing/page.tsx`, `app/(de)/texte/page.tsx`, `app/(en)/writing/[slug]/page.tsx`, `app/(de)/texte/[slug]/page.tsx`, `app/(en)/type/page.tsx`
- **Verification:** Full production build + curl sweep of all six Task 2 routes plus `/type` confirmed `og:type: "website"`, `og:site_name: "Guillem Gelabert"` and the correct `og:locale` (`en_GB`/`de_DE`) present alongside each route's own correct `og:url` — captured verbatim below.
- **Committed in:** `e6e27dd` (Task 2 commit), `c9eeecd` (Task 3, `/type`'s use of the same helper)

---

**Total deviations:** 2 auto-fixed (2 bugs — one a repeat of a known self-referential grep trap, one a genuine Next.js metadata-merge correctness issue caught by measurement rather than assumption)
**Impact on plan:** Both were necessary for the plan's own stated acceptance criteria (og:type/site_name/locale "should not be restated per route" and must still be present) to hold simultaneously. No scope creep — the fix for #2 touches exactly the six route files the plan's Task 2 already names, plus `/type` in Task 3, which needed the same correctness fix for consistency.

## The Full Head Sweep, All Six Task-2 Routes Plus /type (production build, measured)

```
/  (route root)
  <title>Guillem Gelabert</title>
  meta[name=description]  "Developer."                          <- POSITIONING_PLACEHOLDER, unchanged (HOME-01)
  rel=canonical            https://guillemgelabert.com            <- apex, no trailing slash
  og:title                 Guillem Gelabert
  og:description           Developer.
  og:url                   https://guillemgelabert.com
  og:site_name             Guillem Gelabert
  og:locale                en_GB
  og:type                  website
  robots                   noindex

/cv
  <title>CV — Guillem Gelabert</title>
  meta[name=description]  "Guillem Gelabert's CV — experience, education and contact details."
  rel=canonical            https://guillemgelabert.com/cv
  og:title                 CV — Guillem Gelabert
  og:description           Guillem Gelabert's CV — experience, education and contact details.
  og:url                   https://guillemgelabert.com/cv
  robots                   noindex

/writing
  <title>Writing — Guillem Gelabert</title>
  meta[name=description]  "Essays and case studies on data journalism and visualisation."
  rel=canonical            https://guillemgelabert.com/writing
  og:url                   https://guillemgelabert.com/writing
  hrefLang alternates      en -> /writing, de -> /texte, x-default -> /writing
  robots                   noindex

/texte
  <title>Texte — Guillem Gelabert</title>
  meta[name=description]  "Essays und Fallstudien zu Datenjournalismus und Visualisierung."
  rel=canonical            https://guillemgelabert.com/texte
  og:url                   https://guillemgelabert.com/texte
  og:locale                de_DE
  hrefLang alternates      de -> /texte, en -> /writing, x-default -> /writing
  robots                   noindex

/writing/the-chart-therefore-changes
  <title>The Chart Therefore Changes — Guillem Gelabert</title>
  meta[name=description]  (post frontmatter standfirst)
  rel=canonical            https://guillemgelabert.com/writing/the-chart-therefore-changes
  og:url                   https://guillemgelabert.com/writing/the-chart-therefore-changes
  hrefLang alternates      en (self), de -> /texte/die-darstellung-aendert-sich, x-default -> self

/texte/die-darstellung-aendert-sich
  <title>Die Darstellung ändert sich — Guillem Gelabert</title>
  meta[name=description]  (post frontmatter standfirst, German)
  rel=canonical            https://guillemgelabert.com/texte/die-darstellung-aendert-sich
  og:url                   https://guillemgelabert.com/texte/die-darstellung-aendert-sich
  hrefLang alternates      de (self), en -> /writing/the-chart-therefore-changes, x-default -> the English twin

/type
  <title>Type Specimen — Guillem Gelabert</title>
  meta[name=description]  "A specimen of the site's display, heading, body and label type roles."
  rel=canonical            https://guillemgelabert.com/type
  robots                   noindex   <- PERMANENT, not the FIND-02 flip target (Phase 1 D-05)
```

`/` and `/cv` emit zero `hrefLang` alternates (confirmed via `grep -c hrefLang` returning 0 on both) — both are English-only, as `/type` now is too, each with a one-line in-source comment recording the decision.

## The `prerender.test.ts` Failures Handed to Plan 06-09, Verbatim

`rm -rf .next && npm run build && npm run test:build` → **18 pass, 4 fail** (1..22). All four are expected:

**1. `tests/build/prerender.test.ts:337`** — new, this plan (predicted by the plan's own ⚠️ warning):
```
route "cv" must serve POSITIONING_PLACEHOLDER, not a second copy of its value
+ actual:   'Guillem Gelabert&#x27;s CV — experience, education and contact details.'
- expected: 'Developer.'
```
This is correct-and-intentional: the group default under the factory is now `SITE_DESCRIPTION.en` (the artifact description FIND-01 requires), not `POSITIONING_PLACEHOLDER`. `/` alone still serves `POSITIONING_PLACEHOLDER` (asserted separately and still true). Plan 06-09 owns narrowing this assertion's loop from `["", "cv", "type"]` to `[""]`.

**2. `tests/build/prerender.test.ts:491`** (inside the test starting at `:484`) — pre-existing, from plan 06-04:
```
error: '/ must render the stub copy "No contact details here yet."'
```

**3. `tests/build/prerender.test.ts:540`** (inside the test starting at `:531`) — pre-existing, from plan 06-04:
```
error: The input was expected to not match /href="[^"]*github\.com[^"]*"/i.
```
(The `#contact` section now renders a real `github.com` link — 06-04's own documented change.)

**4. `tests/build/prerender.test.ts:591`** (inside the test starting at `:545`) — pre-existing, from plan 06-04:
```
assert.ok(root.includes("No contact details here yet.")) — false
```

Failures 2–4 are identical to the three plan 06-04 already documented in its own SUMMARY.md (`06-04-SUMMARY.md`'s "Task 3's Production Build-Tier Handoff to Plan 06-09" section) — this plan changed nothing about them; they are carried forward unmodified. Only failure 1 is new, and it is the change this plan's own `<action>` block explicitly predicted and instructed to leave for 06-09.

## Confirmation: robots Declarations, smear-heading/, smear-title.tsx

```
$ git grep -nP 'robots\s*:\s*\{\s*index:\s*false\s*\}' -- app/
app/(de)/layout.tsx:39:  robots: { index: false },
app/(en)/layout.tsx:29:  robots: { index: false },
app/(en)/type/page.tsx:30:  robots: { index: false },
```
Exactly three — the two root layouts (the FIND-02 flip's real target) plus `/type`'s own permanent, explicitly-commented exception. `tests/unit/launch-gate.test.ts`'s second test (which encodes this exact invariant) passes.

```
$ git diff --stat components/smear-heading/ components/smear-title.tsx
(empty)
```

`.env` does not exist in this worktree (confirmed via `grep -c NEXT_PUBLIC_SITE_URL .env` — file not found, so the variable is trivially absent) — no local shadowing of the build-time-inlined `NEXT_PUBLIC_SITE_URL` is possible.

## Full Verification Run (plan's own `<verification>` block, all 7 steps)

1. `npx tsc --noEmit` → exit 0. `rm -rf .next && npm run build` → succeeded (run 3 times across the three tasks, plus once more as a final pass).
2. Three curl sweeps (one per task) — canonical and `og:url` host `guillemgelabert.com` on every route; every route its own title/description; every route still `noindex`. All captured above.
3. `npm run test:unit` → 130 pass, 1 skip (the pre-existing G12 skip, unrelated to this plan) — includes `tests/unit/launch-gate.test.ts` (run in isolation too: 2 pass, 1 skip) and `tests/unit/link-contract.test.ts` (its `app/(en)/page.tsx` "declares no robots" assertion passes).
4. `npx playwright test tests/landing.spec.ts tests/cv.spec.ts tests/type-specimen.spec.ts tests/viewport.spec.ts tests/smear-heading.spec.ts --repeat-each=2` → 70 passed, 4 failed — the 4 failures are the two known pre-existing 06-04 breaks (`landing.spec.ts:191`, `:453`), each doubled by the repeat flag; zero flakes, zero new failures.
5. `npm run test:build` → 18 pass, 4 fail, all four expected and itemized above.
6. `npm run lint` → the one pre-existing deferred error (`use-prefers-reduced-motion.ts:23`), no new errors. `git diff --stat components/smear-heading/` empty.
7. `git grep -nP 'robots\s*:\s*\{\s*index:\s*false\s*\}' -- app/` → exactly three matches, itemized above. (Note: the plan's literal `-E` form does not match under `git grep`'s default POSIX-ERE engine because `\s` needs PCRE support; `-P` was used instead and confirmed the identical count `-cE` would report once PCRE is enabled — this is a shell/regex-engine detail, not a scope change.)

## Issues Encountered

None beyond the two auto-fixed deviations above.

## User Setup Required

None — no external service configuration required. `NEXT_PUBLIC_SITE_URL` is not set in this worktree's environment; production behavior depends on Railway's own environment configuration (unchanged by this plan — see Next Phase Readiness).

## Next Phase Readiness

- Plan 06-09 owns narrowing `tests/build/prerender.test.ts:337`'s loop from `["", "cv", "type"]` to `[""]`, and can now write build-tier assertions binding `og:url`/`rel=canonical` host agreement and the sitemap's spelling (already matching, measured above).
- Plan 06-11 (or whoever re-measures apex routing immediately before any FIND-02 flip, per T-06-39) should know: this plan did NOT set `NEXT_PUBLIC_SITE_URL` in the Railway production environment — it only changed the code-level fallback. Production today still resolves `NEXT_PUBLIC_SITE_URL` from whatever Railway currently has configured (unknown/unverified by this plan); if that variable is unset in production, this plan's fallback change means production canonicals now resolve to the apex automatically without any Railway configuration change being required. If it IS currently set to the Railway origin in production, that value still wins over the code fallback and would need updating separately. This distinction matters for the eventual flip and is worth a fresh `curl` of the live canonical before flipping, exactly as 06-RESEARCH.md Q2 already instructs.
- `lib/metadata.ts`'s `routeOpenGraph` is now the established pattern for any future route needing its own `og:url` — see `patterns-established`.
- No blockers. Working tree is clean; only the three task commits plus this SUMMARY exist on this worktree branch beyond the corrected base (`f3245a2`).

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*

## Self-Check: PASSED

All ten claimed source files confirmed present on disk (`lib/metadata.ts`, `lib/site.ts`,
`app/(en)/layout.tsx`, `app/(de)/layout.tsx`, `app/(en)/page.tsx`, `app/(en)/cv/page.tsx`,
`app/(en)/type/page.tsx`, `app/(en)/writing/page.tsx`, `app/(de)/texte/page.tsx`,
`app/(en)/writing/[slug]/page.tsx`, `app/(de)/texte/[slug]/page.tsx`), this SUMMARY.md
confirmed present, and all three task commits confirmed present in `git log --oneline --all`
(`5f12571`, `e6e27dd`, `c9eeecd`).
