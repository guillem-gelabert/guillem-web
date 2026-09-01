---
phase: 06-cv-contact-photo-discoverability
plan: 06
subsystem: ui
tags: [playwright, opengraph, favicon, humane, metadata, next-og]

# Dependency graph
requires: []
provides:
  - Playwright-driven scripts/capture-brand-images.mjs, one source of truth for every committed brand raster
  - Site-wide EN/DE opengraph-image.png + opengraph-image.alt.txt cards (covers /, /cv, /writing, /type, /texte, /type by segment inheritance)
  - app/icon.png favicon replacement; app/favicon.ico (Next scaffold mark) deleted
  - Per-post opengraph-image.tsx routes under [slug] serving committed PNGs, with a proven fallback to the site-wide card
  - public/og/README.md documenting the committed-PNG rationale and re-run instructions
affects: [06-07 (root metadata/OG completion), any future content-publishing workflow — re-run capture-brand-images.mjs after publishing a post]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Committed Playwright-rendered PNG replaces next/og's ImageResponse wherever Humane (a variable font) must appear — Satori cannot load it"
    - "Per-slug metadata route: read committed bytes from a module-scope directory constant, validate slug shape before any filesystem access, fall back to a stable default rather than ever throwing"

key-files:
  created:
    - scripts/capture-brand-images.mjs
    - "app/(en)/opengraph-image.png"
    - "app/(en)/opengraph-image.alt.txt"
    - "app/(de)/opengraph-image.png"
    - "app/(de)/opengraph-image.alt.txt"
    - app/icon.png
    - "public/og/the-chart-therefore-changes.png"
    - "public/og/die-darstellung-aendert-sich.png"
    - public/og/README.md
    - "app/(en)/writing/[slug]/opengraph-image.tsx"
    - "app/(de)/texte/[slug]/opengraph-image.tsx"
  modified: []

key-decisions:
  - "Committed PNGs, not ImageResponse, everywhere Humane appears on a brand raster — measured parseFvarAxis crash, per 06-VALIDATION.md decision 3, non-negotiable"
  - "The card's body-face line uses a serif system stack (Georgia/Times New Roman/serif) rather than the site's real Newsreader webfont: Newsreader is loaded via next/font/google and written only as a hashed .woff2 into .next/static/media at build time, not a file this standalone pre-build script can read independently of build state. Ink/paper/Humane/rule — the load-bearing half of D-3.2's grammar — is unaffected"
  - "Icon size: 512x512, square, crisp at any browser-rendered favicon/PWA-icon downscale"
  - "SAFE_SLUG regex duplicated locally in each opengraph-image.tsx (identical to lib/content.ts:122) rather than exporting it from lib/content.ts — lib/content.ts is outside this plan's declared file list and parallel sibling plans may be touching it concurrently"
  - "Card headline copy: site cards read 'Guillem Gelabert' + a locale-specific tagline; per-post cards read the post's own title + 'Guillem Gelabert' as the tagline — deliberately differing headline and tagline from the site card, per the must_have that the case study unfurls with its own identity"

requirements-completed: [FIND-01]

# Metrics
duration: 25min
completed: 2026-09-01
---

# Phase 06 Plan 06: OG Card Rasters Summary

**Playwright-rendered, committed 1200x630 PNGs in real Humane replace `next/og`'s `ImageResponse` everywhere the site's display face must appear — site-wide EN/DE cards, per-post overrides with a proven fallback, and the favicon.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-09-01T11:30Z (worktree base reset)
- **Completed:** 2026-09-01T11:52Z
- **Tasks:** 2
- **Files modified:** 12 (9 created in Task 1's commit including 1 deletion, 3 created in Task 2's commit)

## Accomplishments

- Reproduced the `parseFvarAxis` crash locally before writing any OG code (see below), turning the fallback decision into a measured local fact rather than an inherited claim.
- One re-runnable script (`scripts/capture-brand-images.mjs`) reads the real `app/fonts/Humane-VF.ttf` file via a `file://` `@font-face` and the real `--color-ink`/`--color-paper`/`.text-heading` tokens straight out of `app/globals.css`, and produces every committed brand raster from that single source of truth.
- Both site-wide cards (EN/DE) and the favicon replacement ship, with the Next scaffold `favicon.ico` deleted in the same commit — exactly one `<link rel="icon">` verified on `/`.
- Per-post cards ship for both published posts, served through `[slug]/opengraph-image.tsx` route files whose `generateStaticParams` is bound to `publishedFor(locale)`, with a genuinely demonstrated (not assumed) fallback to the site-wide card when a post has no committed PNG.

## Task Commits

1. **Task 1: the capture script, the two site-wide cards, the icon, and the scaffold favicon's deletion** - `cf5fb41` (feat)
2. **Task 2: per-post cards — the case study unfurls with its own title** - `098bbfa` (feat)

## Files Created/Modified

- `scripts/capture-brand-images.mjs` — Playwright capture script; reads Humane-VF.ttf and globals.css tokens; produces every brand raster
- `app/(en)/opengraph-image.png`, `app/(en)/opengraph-image.alt.txt` — EN site-wide card
- `app/(de)/opengraph-image.png`, `app/(de)/opengraph-image.alt.txt` — DE site-wide card
- `app/icon.png` — favicon replacement, 512x512
- `app/favicon.ico` — deleted (Next scaffold mark; coexisting with `icon.png` emitted two `rel="icon"` tags, measured)
- `public/og/the-chart-therefore-changes.png`, `public/og/die-darstellung-aendert-sich.png` — per-post cards
- `public/og/README.md` — documents the generating script and the committed-PNG rationale
- `app/(en)/writing/[slug]/opengraph-image.tsx`, `app/(de)/texte/[slug]/opengraph-image.tsx` — per-post route files serving committed bytes, with fallback

## The `parseFvarAxis` reproduction (run before writing any OG code)

```
node -e "
const fs=require('fs');
const { ImageResponse } = require('next/dist/compiled/@vercel/og/index.node.js');
const data = fs.readFileSync('app/fonts/Humane-VF.ttf');
new ImageResponse({type:'div',props:{children:'Hi',style:{fontFamily:'H',fontSize:100,display:'flex',background:'#fff',color:'#000',width:'100%',height:'100%'}}},
  {width:600,height:315,fonts:[{name:'H',data,weight:400,style:'normal'}]})
  .arrayBuffer().then(b=>console.log('OK',b.byteLength)).catch(e=>console.log('ERR',e.stack.split('\n')[1]));
"
```

Measured locally (2026-09-01):

```
ERR     at parseFvarAxis (…/node_modules/next/dist/compiled/@vercel/og/index.node.js:11887:20)
```

Confirms 06-RESEARCH.md's F2 exactly, on this machine, before a single line of OG code was written. No `ImageResponse`, no `opengraph-image.tsx`/`icon.tsx` rendering a variable font exists anywhere in this plan's output (`grep -rn 'opengraph-image.tsx\|icon.tsx' app` returns only the two committed-bytes route files added by Task 2, which import nothing from `next/og`).

## The icon's chosen size

**512x512.** Large enough that Chromium's crisp render survives the downscale to whatever a browser tab actually shows (16–32px in practice); no multi-size icon set was built — one file, one `<link rel="icon">`.

## Observation from looking at the rendered cards (once)

Viewed all four cards plus the icon after capture. The name/title renders unmistakably in the real Humane condensed display face at weight 530 (the site's real `.text-heading` weight, read from `app/globals.css`, not guessed) — tall, condensed, high-contrast letterforms, clearly not a fallback sans-serif. Legible at 120px on the 1200×630 canvas with generous margin; both real post titles ("The Chart Therefore Changes", "Die Darstellung ändert sich", including the German umlaut) render correctly on one line with room to spare. The icon's single "G" is centered and legible at 512×512, with a small amount of extra whitespace below the glyph from the line-box (cosmetic only, not corrected — per CLAUDE.md, MVP first, no polishing).

## Resolved `og:image` URLs — all three differ

Measured against `npm run build && next start`:

| Route | Resolved `og:image` |
|---|---|
| `/` | `https://web-production-9cedb.up.railway.app/opengraph-image-35z9bs.png?opengraph-image.0neqxvyfi01yd.png` |
| `/writing/the-chart-therefore-changes` | `https://web-production-9cedb.up.railway.app/writing/the-chart-therefore-changes/opengraph-image-1qp7ha?8ff932521b1071fb` |
| `/texte/die-darstellung-aendert-sich` | `https://web-production-9cedb.up.railway.app/texte/die-darstellung-aendert-sich/opengraph-image-1vr2qe?10b7bb79e609b742` |

All three distinct, confirming the per-post override actually takes effect rather than silently falling through to the site card. Each resolved URL returns HTTP 200, `content-type: image/png`, and the per-post images' bytes were verified byte-for-byte identical (`diff`, zero output) to `public/og/{slug}.png` on disk.

## Missing-PNG fallback demonstration — proven, not assumed

1. Moved `public/og/the-chart-therefore-changes.png` out of the repo.
2. `rm -rf .next && npm run build` — **succeeded**, no error, both `opengraph-image` routes under `[slug]` still prerendered.
3. `next start` and fetched `/writing/the-chart-therefore-changes`'s resolved `og:image` URL — **HTTP 200**, `content-type: image/png`, 17648 bytes.
4. `diff`'d those bytes against `app/(en)/opengraph-image.png` (the EN site-wide card) — **zero output**, i.e. byte-identical. The fallback served the site card, exactly as required, rather than a 404 or a broken image.
5. Restored the file (`mv` back), confirmed `git status` showed no diff on the PNG (byte-identical round trip), and rebuilt clean to restore the normal per-post-card state.

## Decisions Made

- Committed PNGs replace `ImageResponse` everywhere Humane appears — forced by the measured crash, not a preference.
- Card copy: EN tagline "Data visualisation, writing and interactive work.", DE "Datenvisualisierung, Texte und interaktive Arbeiten." — within Claude's discretion per CONTEXT ("OG card composition within D-3.2's constraints"); no site-wide `siteDescription` module existed yet in this worktree to import from.
- Body-face line rendered in a serif system stack rather than the real Newsreader webfont (see key-decisions above for why) — a composition simplification, not a grammar violation; ink/paper/Humane/rule are all real.
- `SAFE_SLUG` duplicated locally rather than exported from `lib/content.ts`, to respect the parallel-executor file-ownership boundary.

## Deviations from Plan

None — plan executed exactly as written. The `app/fonts/newsreader.ts` / `.next/static/media` .woff2 limitation for the tagline face was anticipated in `06-RESEARCH.md`'s Package Legitimacy Audit note (a committed Newsreader would need to be a static instance, not sourced from the build's hashed output) and resolved within Claude's discretion over composition, not as a deviation from any locked decision.

## Issues Encountered

- `next start` in this Next 16.3.3 CLI takes the directory as a positional argument, not `--dir` — corrected while driving local verification servers on ports 3194/3195; no source change required.
- `next-env.d.ts` toggles between `.next/dev/types/*` and `.next/types/*` import paths depending on whether `next dev` or `next build`/`next start` last ran. Restored via `git checkout -- next-env.d.ts` before each commit, per the parallel-execution note.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- FIND-01's visual half is complete: `/` (and by segment inheritance `/cv`, `/writing`, `/type`) now unfurls with a real card in the site's own grammar; both published posts unfurl with their own title.
- Plan 06-07 can proceed to wire the remaining metadata tags (`og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`) without touching anything this plan shipped.
- `robots: { index: false }` is untouched, as required — this plan does not flip indexability.
- Re-running `node scripts/capture-brand-images.mjs` after any future post publication (or a `lib/site.ts` `siteDescription`/`siteName` addition that should feed the card tagline) is the documented maintenance step, recorded in `public/og/README.md` and the script's own header comment.

---
*Phase: 06-cv-contact-photo-discoverability*
*Completed: 2026-09-01*

## Self-Check: PASSED

- All 11 created files confirmed tracked via `git ls-files` (scripts/capture-brand-images.mjs, both site-wide cards + alt.txt, app/icon.png, both per-post PNGs, public/og/README.md, both opengraph-image.tsx route files).
- `app/favicon.ico` confirmed no longer tracked (`git ls-files` returns nothing).
- Both task commits (`cf5fb41`, `098bbfa`) confirmed present in `git log --oneline --all`.
