---
phase: 02-content-pipeline
plan: 04
subsystem: content-pipeline
tags: [next.js, mdx, app-router, i18n, playwright]

# Dependency graph
requires:
  - phase: 02-content-pipeline (Plan 01)
    provides: MDX/Shiki toolchain, mdx-components.tsx, app/(en)/ route group
  - phase: 02-content-pipeline (Plan 02)
    provides: "lib/content.ts (publishedFor, findBySlug, loadPostModule, translationOf), lib/locales.ts (indexPath, postPath, formatPostDate, UI)"
  - phase: 02-content-pipeline (Plan 03)
    provides: ".prose-site CSS, Prose/SmearTitle/PostMeta/LanguageSwitch components, Figure/Aside MDX component map"
provides:
  - "app/(en)/writing/[slug]/page.tsx — the single English post template: Server Component, dynamicParams=true, generateStaticParams over publishedFor(\"en\"), generateMetadata with canonical/hreflang/x-default, allowlist-then-import ordering"
  - "app/(en)/writing/not-found.tsx — the English writing segment's localised not-found boundary"
  - "content/fixture.mdx, content/musterseite.mdx, content/nur-auf-deutsch.md — three real draft posts proving every Prose Contract element, the translation-pairing present branch, and the .md format's literal-brace/raw-HTML-drop behaviour"
  - "public/fixture/figure-default.svg, public/fixture/figure-wide.svg — the fixture's two Figure assets"
  - "tests/writing-routing.spec.ts, tests/writing-not-found.spec.ts — SC1 and error-path coverage for WRIT-01"
affects: [02-05, 02-06, 02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "app/(en)/writing/[slug]/page.tsx is the exact shape Plan 06's app/(de)/texte/[slug]/page.tsx copies: same dynamicParams, same generateStaticParams, same allowlist-then-import order, same generateMetadata, same JSX tree — only locale, path token and copy differ"
    - "The fixture post is draft: true and real, not a test-only code path — reachable at /writing/fixture in dev, absent from a production build via generateStaticParams mapping publishedFor(\"en\")"
    - "A one-entry locale table looped with a for-loop in tests/writing-not-found.spec.ts, structured so Plan 06 adds the German /texte case without restructuring the file"

key-files:
  created:
    - "app/(en)/writing/[slug]/page.tsx"
    - "app/(en)/writing/not-found.tsx"
    - content/fixture.mdx
    - content/musterseite.mdx
    - content/nur-auf-deutsch.md
    - public/fixture/figure-default.svg
    - public/fixture/figure-wide.svg
    - tests/writing-routing.spec.ts
    - tests/writing-not-found.spec.ts
  modified: []

key-decisions:
  - "Standfirst rendered with the .text-standfirst class (Plan 03's Body/530/1.5 variant) rather than the UI-SPEC layout sketch's older `text-body max-w-prose` combination — .text-standfirst is the more precise, already-shipped class for this exact treatment and postdates the sketch"
  - "Fixture's two fenced code blocks are json (contains a literal { proving MDX fences stay literal) and bash (one long unbroken line proving horizontal pre scroll) — chosen as two genuinely different, real languages rather than placeholders"
  - "writing-routing.spec.ts's German-slug-on-English-route test also asserts the not-found heading text, not just the 404 status, so the test distinguishes this segment's localised boundary from a generic framework 404"

requirements-completed: [WRIT-01, I18N-01]

# Metrics
duration: 20min
completed: 2026-08-30
---

# Phase 2 Plan 4: The English Post Template and Its Three Fixture Posts Summary

**A single `app/(en)/writing/[slug]/page.tsx` Server Component that turns any allowlisted `content/*.md(x)` file into a URL — plus three real draft posts (one sweeping every Prose Contract element, one German twin, one plain-Markdown post with no twin) that prove it end to end, and the Playwright specs that assert success criterion 1 and the error path.**

## Performance

- **Duration:** ~20 min (approx.)
- **Started:** 2026-08-30T01:44:00+02:00 (approx., immediately after the worktree base correction and `npm ci`)
- **Completed:** 2026-08-30T02:04:00+02:00 (approx.)
- **Tasks:** 3 completed
- **Files modified:** 9

## Accomplishments
- `app/(en)/writing/[slug]/page.tsx`: a Server Component (no `"use client"` anywhere) with `dynamicParams = true`, `generateStaticParams` over `publishedFor("en")` (so a production build never prerenders a draft URL), `generateMetadata` emitting `canonical`, `alternates.languages` (`en`/`de`-when-a-twin-exists/`x-default`), and the ASVS V4 allowlist ordering — `findBySlug` resolves and `notFound()` throws strictly before `loadPostModule` ever touches the slug
- `app/(en)/writing/not-found.tsx`: the segment's own localised English not-found boundary, reached because `dynamicParams = true` plus an explicit `notFound()` renders this segment rather than bypassing it at the routing layer
- `content/fixture.mdx`: a real `draft: true` English post exercising every element in the Prose Contract in one file — an adjacent `h2`/`h3` pair each with two paragraphs, `<strong>`/`<em>` in running prose, a blockquote with a nested `<em>` (the upright reset), an inline `` `code` `` span, an internal and an external link, nested unordered and ordered lists, a table with a right-aligned numeric column, two `<Figure>`s (one `wide`) with captions, one `<Aside kicker="Methodology">`, an `<hr>`, and two fenced code blocks in different languages (one containing a literal `{`, one long enough to force horizontal scroll)
- `content/musterseite.mdx`: the German twin sharing `translationKey: fixture-post` — proves the language switcher's present branch (confirmed rendering `Auf Deutsch lesen` → `/texte/musterseite` on the live fixture page, even though `/texte/*` routes don't exist until Plan 05/06)
- `content/nur-auf-deutsch.md`: a plain-Markdown German post with its own `translationKey` and no twin — the switcher's absent branch and the `.md` format's literal-brace / raw-HTML-drop proof
- `public/fixture/figure-default.svg` (800×450) and `figure-wide.svg` (1600×900): utilitarian placeholder figures, both with explicit `width`/`height`/`viewBox`
- `tests/writing-routing.spec.ts` and `tests/writing-not-found.spec.ts`: 5 new Playwright assertions covering SC1 (filesystem-driven routing, front-matter-driven content, the allowlist rejecting a German-only slug from the English route, the fixture's `Aside`/`Figure` markup, and the literal-brace fence) and the error path (localised not-found copy via a one-entry, extensible locale table)
- Full verification green: `rm -rf .next && npm run build` exits 0 with `/writing/[slug]` in the route table; `npx tsc --noEmit` clean; 14/14 Playwright specs pass (9 pre-existing + 5 new); 24/24 `node --test` unit assertions pass; `app/(en)/writing/` contains no per-post route file

## Task Commits

Each task was committed atomically:

1. **Task 1: The English post template and its not-found boundary** - `5de3db1` (feat)
2. **Task 2: The three fixture posts and their figure assets** - `33d21da` (feat)
3. **Task 3: Assert filesystem-driven routing and the error path** - `44be7e2` (test)

**Plan metadata:** (pending — final docs commit follows this summary)

## Files Created/Modified
- `app/(en)/writing/[slug]/page.tsx` (new) - the single English post template: allowlist → dynamic import → render, plus `generateMetadata`
- `app/(en)/writing/not-found.tsx` (new) - the segment's localised English not-found boundary
- `content/fixture.mdx` (new) - draft EN fixture sweeping every Prose Contract element
- `content/musterseite.mdx` (new) - draft DE twin sharing `translationKey: fixture-post`
- `content/nur-auf-deutsch.md` (new) - draft DE post, plain `.md`, no translation
- `public/fixture/figure-default.svg`, `public/fixture/figure-wide.svg` (new) - the fixture's two Figure assets
- `tests/writing-routing.spec.ts` (new) - SC1 coverage
- `tests/writing-not-found.spec.ts` (new) - error-path coverage

## Decisions Made
- Followed the interfaces contract in the plan verbatim — no renaming or reshaping of any exported symbol from `lib/content.ts`, `lib/locales.ts`, or Plan 03's components.
- Used `.text-standfirst` (the Plan 03 CSS class, Body role at weight 530/1.5) for the post template's standfirst paragraph, per the plan's own literal action text (`<p className="max-w-prose text-standfirst">`), rather than the UI-SPEC's earlier layout sketch which predates that class's addition.
- The fixture's two fenced code blocks are `json` (containing a literal `{`, proving a fenced block stays literal even in `.mdx`) and `bash` (one deliberately long, unbroken line, proving the code block itself scrolls horizontally rather than the page). Both are real, distinct languages rather than placeholders.
- `writing-routing.spec.ts`'s German-slug-on-English-route test also asserts the rendered not-found heading, not just the HTTP status, so it distinguishes this segment's own localised boundary from a generic 404.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Reworded two explanatory comments in `app/(en)/writing/[slug]/page.tsx` that accidentally satisfied/broke the plan's own literal `grep -c` acceptance checks**
- **Found during:** Task 1 (grep-based acceptance criteria, immediately after writing the file)
- **Issue:** A comment reading `No "use client" anywhere in this file...` contained the literal substring `"use client"`, making `grep -c '"use client"'` report 1 instead of the required 0. A second comment reading `dynamicParams = true (not false): ...` duplicated the literal string `dynamicParams = true`, making `grep -c 'dynamicParams = true'` report 2 instead of the required 1. Same class of issue documented in `02-03-SUMMARY.md`'s Deviations — grep-based acceptance criteria scan raw file text and do not distinguish code from comments.
- **Fix:** Reworded both comments to describe the same facts without reproducing the literal grepped substrings (`This route carries no client directive...` and `Stays true rather than false: ...`).
- **Files modified:** `app/(en)/writing/[slug]/page.tsx`
- **Verification:** `grep -c '"use client"' "app/(en)/writing/[slug]/page.tsx"` → 0; `grep -c 'dynamicParams = true' "app/(en)/writing/[slug]/page.tsx"` → 1
- **Committed in:** `5de3db1` (fixed before commit, not a separate follow-up)

---

**Total deviations:** 1 auto-fixed (Rule 1 — comment wording, no behavioural change)
**Impact on plan:** None on runtime behavior; purely textual so the plan's own grep-based acceptance criteria measure what they intend to measure.

## Issues Encountered

**1. Non-blocking: Task 1's own `<verify>` block specifies a full `rm -rf .next && npm run build && npx playwright test` command that cannot pass in isolation immediately after Task 1's two files exist**, because `content/` does not exist yet at that point (it is Task 2's file assignment) and `lib/content.ts`'s `allPosts()` calls `readdir(CONTENT_DIR)`, which throws `ENOENT` against a missing directory. Ran `npx tsc --noEmit` (clean) plus the full grep-based acceptance criteria as Task 1's gate, then ran the full `rm -rf .next && npm run build && npx tsc --noEmit && npx playwright test` sequence — exactly as Task 2's own `<verify>` block specifies — once Task 2's fixture content existed, which is the earliest point that command can succeed. No functional impact: every acceptance criterion in both tasks passed, and the plan's overall `<verification>` block (the actual gate that matters) was run in full after all three tasks completed.

**2. Non-blocking: dev-server manual verification confirmed the language switcher's present branch renders a link to `/texte/musterseite`** even though no `/texte/*` route exists yet (that segment is Plan 05/06's scope). This is expected and correct — `LanguageSwitch` only needs `translationOf()` to resolve a twin and compute the target path via `postPath("de", slug)`; the link being unreachable until Plan 05/06 ships is not a defect in this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `app/(en)/writing/[slug]/page.tsx` is the exact shape Plan 06's `app/(de)/texte/[slug]/page.tsx` copies — same `dynamicParams`, same `generateStaticParams`, same allowlist-then-import order, same `generateMetadata`, same JSX tree, only locale/path-token/copy differing.
- The three fixture posts (`content/fixture.mdx`, `content/musterseite.mdx`, `content/nur-auf-deutsch.md`) are real, committed, `draft: true` content — ready for Plan 05 (`/writing` index, `n=0`/`n=1` modes) and Plan 06 (`/texte/[slug]`, the German twin's own route and not-found page) to render against.
- `tests/writing-routing.spec.ts` already notes in-file that the German `.md` file's own format assertions (braces literal in prose, the raw `<Aside>` tag dropped) belong in Plan 06 once `/texte/[slug]` exists to serve `content/nur-auf-deutsch.md`.
- `tests/writing-not-found.spec.ts`'s locale table is a one-entry array specifically shaped so Plan 06 appends the German case (`/texte/gibt-es-nicht`) without restructuring the file.
- No blockers or concerns for the next plan in this phase.

## Self-Check: PASSED

All created files verified present on disk (`app/(en)/writing/[slug]/page.tsx`, `app/(en)/writing/not-found.tsx`,
`content/fixture.mdx`, `content/musterseite.mdx`, `content/nur-auf-deutsch.md`,
`public/fixture/figure-default.svg`, `public/fixture/figure-wide.svg`,
`tests/writing-routing.spec.ts`, `tests/writing-not-found.spec.ts`, this SUMMARY.md). All three
commit hashes (`5de3db1`, `33d21da`, `44be7e2`) verified present in `git log --oneline --all`.

---
*Phase: 02-content-pipeline*
*Completed: 2026-08-30*
