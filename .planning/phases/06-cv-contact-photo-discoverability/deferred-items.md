# Deferred Items — Phase 6

Items discovered during execution that are out of scope for the plan that found them. Format
follows `.planning/phases/03-work-list-landing-skeleton/deferred-items.md`.

## 1. [CLOSED 2026-09-01] `og:image` does not reach `/cv`, `/writing`, `/texte` or `/type` — 06-06-SUMMARY.md's
   "segment inheritance" claim is measurably false

**Status:** discovered by plan 06-09 (Task 2), out of scope — `files_modified: [tests/build/prerender.test.ts]`
only, and the fix lives in files plan 06-06/06-07 own (`app/(en)/opengraph-image.png`, or a
`generateMetadata` override per route), which this plan cannot touch under the parallel-worktree
constraint.

**What was claimed.** `06-06-SUMMARY.md`'s accomplishments line reads: *"Site-wide EN/DE
opengraph-image.png + opengraph-image.alt.txt cards (covers /, /cv, /writing, /type, /texte, /type
by segment inheritance)."*

**What is actually true, measured against a real `rm -rf .next && npm run build`.** `og:image` and
`twitter:image*` are present ONLY on `/` and on the two `[slug]` post routes
(`/writing/the-chart-therefore-changes`, `/texte/die-darstellung-aendert-sich`) — the three routes
that each have their own `opengraph-image` file convention artifact at their EXACT segment
(`app/(en)/opengraph-image.png` beside `app/(en)/page.tsx`; `app/(en)/writing/[slug]/opengraph-image.tsx`
beside `app/(en)/writing/[slug]/page.tsx`; and the German twins). `/cv`, `/writing`, `/texte` and
`/type` — each one segment deeper than the file that was meant to cover them — carry ZERO `og:image`
tags. Next's own docs describe the convention as setting *"a route segment's shared image"*: scoped
to the segment the file lives in, not inherited by nested segments the way an ordinary metadata
OBJECT field is (unlike `app/icon.png`, which DOES cascade to every route, confirmed separately).

As a direct consequence, `twitter:card` on the four affected routes reads `"summary"` (Next's own
default when no image is resolvable), not `"summary_large_image"`.

**Where this is now asserted, not silently assumed.** `tests/build/prerender.test.ts`'s
`OG_TARGET_ROUTES` table and its two related tests (og:* sweep, og:image test) assert the TRUE
current state per route — `hasOwnOgImage: false` on `/cv`, `/writing`, `/texte`, with an inline
comment pointing back to this file — so the gap is provable and will go red the moment a future
plan closes it (at which point the test's `hasOwnOgImage` flags should flip to `true` and the
now-passing "must NOT carry og:image" assertions should be removed).

**Suggested fix for whichever plan picks this up.** Either commit a duplicate site-wide PNG at each
of the three segments (`app/(en)/cv/opengraph-image.png`, `app/(en)/writing/opengraph-image.png`,
`app/(de)/texte/opengraph-image.png`, plus `/type`'s own if desired), or add an explicit
`openGraph.images` array to `lib/metadata.ts`'s `routeOpenGraph()` pointing at the same committed
asset URL. The second option is one change point instead of four new files, but needs the asset's
absolute URL resolved at metadata-build time rather than relying on the file convention.

**Not launch-blocking.** The launch gate's G7 row ("the OG image resolves 200, image/png, 1200×630,
at an absolute URL") is about the OG image resolving at all, not about every single route carrying
its own — `/`'s card (the one most link-preview surfaces will actually unfurl, since it's the
canonical entry point) is unaffected by this gap.


---

### Resolution (coordinator, 2026-09-01)

**Closed.** `routeOpenGraph()` in `lib/metadata.ts` now supplies an explicit `images` entry
pointing at a stable public path (`/og/site-en.png`, `/og/site-de.png` — copies of the two
convention cards) rather than relying on cascade. Measured against a clean production build:

| route | og:image | twitter:card |
|---|---|---|
| `/` | convention artifact | `summary_large_image` |
| `/cv` | `/og/site-en.png` | `summary_large_image` |
| `/writing` | `/og/site-en.png` | `summary_large_image` |
| `/texte` | `/og/site-de.png` | `summary_large_image` |
| `/type` | `/og/site-en.png` | `summary_large_image` |

`prerender.test.ts:1105` was rewritten from asserting the gap to asserting the fix, and its
disk-existence check now accepts either a build artifact or a `public/` file, since the two
sources land in different places. The per-post `[slug]` overrides are unaffected and still prove
they fire per post.
