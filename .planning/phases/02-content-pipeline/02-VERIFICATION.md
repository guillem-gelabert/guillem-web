---
phase: 02-content-pipeline
verified: 2026-08-31T09:16:31Z
status: human_needed
score: 9/9 must-haves verified
overrides_applied: 0
re_verification: null
gaps: []
deferred:
  - truth: "SC2 clause: the index 'lists one entry (the Phase 4 case study)'"
    addressed_in: "Phase 4"
    evidence: "Phase 4 Success Criterion 1: 'Visitor can read a published case study covering ib-gdp-evolution.' The case study is Phase 4's deliverable, so /writing is legitimately at n=0 in production today. The n=1 treatment itself is built and proven — see Truth 2."
  - truth: "Launch gate — /writing must not still render n=0 when robots is flipped to indexable"
    addressed_in: "Phase 6"
    evidence: "Phase 6 Requirements include FIND-02 ('search engines can index the site through a sitemap and robots file'). 02-UI-SPEC.md line 298 makes this an explicit blocker on Phase 6."
human_verification:
  - test: "Load /writing/fixture (dev server) at 375px and again at 1440px. Find the adjacent h2/h3 pair under 'Section headings, side by side'. In one glance, decide whether they read as two distinct hierarchy levels."
    expected: "The h2 and the h3 read as two levels. If they do not — particularly at 375px — the UI-SPEC remedy is more space above h2, never a fifth type size."
    why_human: "h2 and h3 are byte-for-byte identical type (both 14px uppercase 0.04em Newsreader 400, measured identical at both viewports). The only differences are a 1px full-ink rule and 48px vs 32px top margin. No assertion can prove 'reads as two levels'. 02-VALIDATION.md designates this manual; 02-07-SUMMARY.md explicitly did NOT claim it passed."
  - test: "Read /writing/fixture end to end at 1440px with /type open in a second tab."
    expected: "The prose reads as one authored typographic system continuous with Phase 1's specimen — not as a framework default that happens to have had its numbers changed."
    why_human: "The computed-value assertions prove the tokens applied (every prose element resolves to 14px or 18px, nothing else). They cannot prove the result is typographically coherent. 02-VALIDATION.md designates this manual; 02-07-SUMMARY.md explicitly did NOT claim it passed."
  - test: "With the dev server running, load /writing (which renders n=1 against the draft fixture) and judge whether it reads as a deliberate editorial front page rather than an empty shelf."
    expected: "One poster-scale Display headline over a standfirst and a date line reads as intentional at a single entry."
    why_human: "SC2's wording is 'must read as deliberate at n=1'. The measurable half is fully asserted (no card, no border, no shadow, no fill, no 'Read more', headline is the only link, Display role). The editorial judgement is optical, and the n=1 render exists only in dev today because the sole entry is a draft fixture."
---

# Phase 2: Content Pipeline Verification Report

**Phase Goal:** The site renders long-form written content from Markdown/MDX through a real pipeline — front-matter, `/writing` routing, an index, prose styled on Phase 1's type system, and syntax-highlighted code. It exists so Phase 4's case study has somewhere to live. The 2020 archive migration is deferred to v2; the `/writing/[slug]` URL shape is still settled here so that migration stays cheap to add later.

**Verified:** 2026-08-31T09:16:31Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Method

Every claim below was re-derived from the codebase or from a live run. SUMMARY.md assertions were treated as hypotheses to falsify, not as evidence. Specifically, this verification independently:

- ran `rm -rf .next && npm run build` (clean, 7 routes)
- ran `npm run test:build` (7/7), `npm run test:unit` (24/24), `npx playwright test` (57/57)
- ran `npx tsc --noEmit` (clean) and scoped `npx eslint app components lib tests mdx-components.tsx next.config.ts`
- **dropped a brand-new `content/verifier-drop-test.mdx` into the content directory and hit its URL on a live dev server** — the only real proof of SC1's "no per-post wiring"
- **dropped a deliberately malformed front-matter file and ran `next build`** — to confirm the validation control actually fails the build rather than shipping
- probed the live Railway deployment directly with `curl`, including traversal-shaped slugs
- confirmed `origin/master == local HEAD == 3f299c9`, so the deployment corresponds to the verified tree

All temporary files were removed and the working tree was restored (`git status` matches its pre-verification state).

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | **SC1** — A Markdown/MDX file dropped into `content/` is served at `/writing/[slug]` with no per-post wiring; title, date and description come from front-matter; the slug comes from the filename | ✓ VERIFIED | Live drop test: created `content/verifier-drop-test.mdx`, `GET /writing/verifier-drop-test` → **200**, rendered its front-matter title and standfirst, `<time dateTime="2026-08-31">31 August 2026</time>`, `class="shiki"` on its fence, and it appeared on `/writing` — **with zero route files added**. `find "app/(en)/writing" -type f` returns exactly three files (`page.tsx`, `[slug]/page.tsx`, `not-found.tsx`) before and after. Mechanism read in `lib/content.ts:65-68` (`readdir` over a fixed `CONTENT_DIR`) and `app/(en)/writing/[slug]/page.tsx:22-24` (`generateStaticParams` from `publishedFor`). File removed; tree clean. |
| 2 | **SC2** — `/writing` is a real index that reads as deliberate at n=1 — no empty-shelf layout, no card grid | ✓ VERIFIED (n=1 treatment built and proven; the *content* that fills it is Phase 4's) | `tests/writing-index.spec.ts` — 6 passing specs measured against a real render: exactly one `<article>`, its `h2` carries `text-display` and is **the only `<a>` inside the article**; `getComputedStyle` reads all four border widths `0px`, `box-shadow: none`, background transparent/paper (**not** assumed from source); body text contains neither "Read more" nor "Weiterlesen"; `/texte` renders the n≥2 case as two identical `<article>`s separated by one `<hr>` with byte-identical `h2` class lists. Source confirms one render path with an `index > 0 ? <hr/> : null` separator — no second mode. **In production the index is at n=0** (all three fixtures are `draft: true` and the case study does not exist yet) — see Deferred Items. |
| 3 | **SC3** — A rendered post shows Phase 1's typographic system, not unstyled `@tailwindcss/typography` defaults | ✓ VERIFIED | `tests/prose-typography.spec.ts` — 7 passing specs, all `getComputedStyle` reads off a live Chromium render: `p` = Newsreader 18px/400, line-height **28.8px** (the computed pixel value, not the authored `1.6`); `strong` = 530; `em` = italic 400 Newsreader; blockquote italic between two hairlines with `border-left: 0`; `blockquote em` resets to `normal`; `th`/`td` at 14px with the uppercase-vs-sentence-case distinction and `tabular-nums`. The decisive negative assertion: walking **every** element under `.prose-site` (excluding Shiki token spans), the set of distinct computed font sizes is `{14px, 18px}` and nothing else — the plugin's own `0.875em`/`1.25em` scale is provably not in force. `app/globals.css:28-282` is a 254-line unlayered `.prose-site` block; `tests/unit/prose-contract.test.ts` gates it (24/24). |
| 4 | **SC4** — Code blocks render with real syntax highlighting in a chosen mono face; tables, headings, lists, blockquotes and links are deliberately styled | ✓ VERIFIED | `tests/prose-code.spec.ts` — 10 passing specs: every `<pre>` carries `shiki` **and** `github-light-high-contrast` (an unknown language would silently drop both); `pre.getAttribute("style")` is `null`, proving `mdx-components.tsx:15` strips Shiki's inline background rather than merely overriding it; at least one token span carries an inline `color` (highlighting is real, not a class name); `pre` computes to **IBM Plex Mono** 18px, line-height 27px, `border-radius: 0px`, `white-space: pre`, background `rgba(0, 0, 0, 0.04)`; inline `<code>` has **no** coloured span descendant and is full ink on the tint. Independent confirmation: the drop-test file I created got `class="shiki"` on its fence with no configuration. Tables/headings/lists/blockquotes/links each have explicit rules in `app/globals.css` and are asserted in Truth 3's spec and `tests/fixture-viewport.spec.ts`. |
| 5 | **SC5** — A fixture exercising every supported element renders correctly at mobile and desktop widths and is excluded from the public index | ✓ VERIFIED | `tests/fixture-viewport.spec.ts` — 6 passing specs at **375px and 1440px**, asserting presence of `h2`, `h3`, `p`, `strong`, `em`, `blockquote`, `blockquote em`, inline `code`, `ul`, `ol`, a nested list, `table`/`th`/`td`, `figcaption`, `aside`, `hr`, an internal link, an external link, exactly 2 `pre`, exactly 2 `figure`, exactly 1 `figure[data-wide]`; plus `documentElement.scrollWidth <= innerWidth + 1` (no page-level horizontal overflow) while separately requiring ≥1 element to scroll *internally*. Exclusion proven at the production boundary, not assumed: `tests/build/prerender.test.ts` (7/7) walks real `.next/server/app` output — none of `writing/fixture`, `texte/musterseite`, `texte/nur-auf-deutsch` prerendered, and no draft title string appears in **any** prerendered HTML. Confirmed live: `GET https://web-production-9cedb.up.railway.app/writing/fixture` → **404**. |
| 6 | **I18N-01** — `/writing/*` serves `lang="en"`, `/texte/*` serves `lang="de"` with no locale prefix; switcher present when a translation exists and absent from the DOM when it does not; canonical + hreflang incl. `x-default`; localised dates | ✓ VERIFIED | `tests/i18n-routing.spec.ts` — 8 passing specs including a real cross-locale round trip (click → `/texte/musterseite`, `documentElement.lang === "de"` → click back → `/writing/fixture`, `lang === "en"`). Absent branch asserts `toHaveCount(0)` on both labels **and** on `[aria-disabled]` — absence, not disabled-ness (D-07). `components/language-switch.tsx:16` returns `null`. Dates: `tests/unit/dates.test.ts` pins `29 August 2026` / `29. August 2026` with `timeZone: "UTC"`, verified independent of `process.env.TZ`. Confirmed live in production: `/writing` → `<html lang="en"`, `/texte` → `<html lang="de"`, `rel="canonical"` present, `hrefLang` set = `{en, de, x-default}`, `/texte` carries a working "Read in English" → `/writing`. |
| 7 | Malformed front-matter fails the build rather than rendering; the URL slug is allowlisted **before** the dynamic `import()` | ✓ VERIFIED | Executed, not read: dropped a file with an empty title, `date: "not-a-date"`, `lang: fr` and ran `npm run build` → **exit 1**, `Error: content/verifier-bad-frontmatter: title must be a non-empty string; standfirst must be a non-empty string; translationKey must be a non-empty string; date must be an ISO date (YYYY-MM-DD); lang must be one of en, de` — names the file and every invalid field, as specified. Allowlist ordering read directly in both post routes: `findBySlug(await publishedFor(locale), slug)` then `if (!entry) notFound()` **precedes** `loadPostModule(slug)`. Live traversal probes against production — `../../etc/passwd`, `..%2F..%2Fpackage.json`, `%2e%2e%2fpackage` — all **404**. |
| 8 | A clean `next build` from a wiped `.next` succeeds and Phase 1's routes/specs are unregressed | ✓ VERIFIED | Ran `rm -rf .next && npm run build` → compiled in 6.0s, TypeScript clean, 7 routes generated (`/`, `/_not-found`, `/texte`, `/texte/[slug]`, `/type`, `/writing`, `/writing/[slug]`). `npx tsc --noEmit` exit 0. Full Playwright suite **57/57 passed** including Phase 1's `viewport.spec.ts`, `smear-heading.spec.ts`, `reduced-motion.spec.ts`, `type-specimen.spec.ts`, `deploy-smoke.spec.ts`. `tests/font-cls.spec.ts` runs on both `/` and `/writing/fixture` — the added italic and mono faces did not regress BUILD-06. `app/layout.tsx` is gone; `app/(en)/layout.tsx` and `app/(de)/layout.tsx` are the two roots. |
| 9 | The deployed Railway URL serves this build, not a stale one | ✓ VERIFIED | `git rev-parse HEAD` == `git rev-parse origin/master` == `3f299c945a07499a490a70953daf5a0d93fd6ba4`, `git diff HEAD origin/master` empty. Live probe: `/` 200, `/writing` 200, `/texte` 200, `/type` 200, `/writing/fixture` 404, `/writing/does-not-exist` 404 with localised copy ("Not found" / "That piece doesn't exist here."), `/texte/gibt-es-nicht` 404 with "Nicht gefunden" / "Diesen Text gibt es hier nicht.", `name="robots" content="noindex"` present. **This closes 02-07-SUMMARY.md's one self-declared open item** ("the live Railway URL does not yet serve Phase 2"), which was true when that summary was written and is no longer true. RESEARCH Assumption A6 (Railway build-cache risk after the route-group restructure) is now provably resolved. |

**Score:** 9/9 truths verified

### Deferred Items

Items not yet met but explicitly addressed in later milestone phases. These are informational and do **not** block Phase 2.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | SC2's clause "at launch it lists one entry (the Phase 4 case study)" — production `/writing` is at n=0 today | Phase 4 | Phase 4 SC1: "Visitor can read a published case study covering ib-gdp-evolution." The case study is Phase 4's deliverable and D-09 makes it a post at `/writing/[slug]` sharing this exact template. The n=1 *treatment* is built and proven (Truth 2); only the content is outstanding. |
| 2 | Launch gate: `/writing` must not still be n=0 when `robots` flips to indexable | Phase 6 | 02-UI-SPEC.md:298 — "if `/writing` still renders `n = 0` when Phase 6 goes to flip that flag, Phase 6 is blocked. This empty state must never be the public launch condition." Phase 6 carries FIND-02. Verified present in production today: `/writing` serves "Nothing published here yet." under `robots: noindex`. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `next.config.ts` | pageExtensions + `@next/mdx` chain with Shiki | ✓ VERIFIED | 30 lines. `withMDX(nextConfig)` default export; `github-light-high-contrast`; remark-gfm/frontmatter/mdx-frontmatter; rehype-slug + `@shikijs/rehype`. Proven working by the drop test. |
| `mdx-components.tsx` | `useMDXComponents` with pre/table/img overrides + Figure/Aside map | ✓ VERIFIED | 39 lines. `pre` destructures `style` off and adds `role="region"` + `aria-label`; `img` **throws** at prerender to enforce `<Figure>` (BUILD-06); `table` wrapped in a `.prose-table` scroll container. All three asserted by passing specs. |
| `app/fonts/ibm-plex-mono.ts` | IBM Plex Mono 400 → `--font-ibm-plex-mono` | ✓ VERIFIED | Present, `weight: '400'`, wired via `ibmPlexMono.variable` in both root layouts. Computed `font-family` on `pre` contains "IBM Plex Mono" in a real render. |
| `app/fonts/newsreader.ts` | Newsreader with italic | ✓ VERIFIED | `style: ['normal', 'italic']`. Proven loaded: `em` computes to `font-style: italic`, weight 400, Newsreader. |
| `app/(en)/layout.tsx` | English root, three font vars, metadataBase, `robots: noindex` | ✓ VERIFIED | 26 lines, `lang="en"`, all three `.variable`s, `SmearHeadingProvider`. `noindex` confirmed in production HTML. |
| `app/(de)/layout.tsx` | German root — the second `<html lang>` | ✓ VERIFIED | 26 lines, `lang="de"`, German `description`, same provider. Confirmed in production HTML. |
| `lib/content.ts` | Schema, validation, enumeration, locale selection, translation pairing | ✓ VERIFIED | 139 lines. All 10 declared exports present and exercised. `assertFrontmatter` proven to fail a real build. |
| `lib/locales.ts` | Path tokens, UI copy, Intl date formatting | ✓ VERIFIED | 67 lines. All 6 declared exports present. `formatPostDate` pinned to `timeZone: "UTC"`. |
| `app/globals.css` | `--font-mono`, two ink tints, unlayered `.prose-site`, `.text-standfirst` | ✓ VERIFIED | 332 lines (was Phase 1's ~78). `.prose-site` block covers p/h2/h3/a/strong/em/ul/ol/li/blockquote/code/pre/table/th/td/figure/figcaption/aside/hr. Phase 1's `clamp()` curves confirmed untouched by `tests/unit/prose-contract.test.ts` case (j). |
| `components/prose.tsx` | The single typographic wrapper | ✓ VERIFIED | 8 lines — short by design, not a stub. Emits `prose prose-neutral max-w-none prose-site` exactly as the key-link pattern requires; `max-w-none` cancels the plugin measure so `.prose-site`'s `65ch` wins. Used by both post routes. |
| `components/smear-title.tsx` | The only new client boundary | ✓ VERIFIED | `"use client"` + `useSmearHeading` ref. Keeps both post routes as Server Components (neither carries a client directive — confirmed by reading both files). |
| `components/post-meta.tsx` | Date, switch, dev-only draft marker on one Label line | ✓ VERIFIED | `<time dateTime>` + conditional switch + `NODE_ENV === "development"`-gated Draft marker. Asserted by `tests/draft-visibility.spec.ts` and proven absent from production output. |
| `components/language-switch.tsx` | Rendered only when a translation exists | ✓ VERIFIED | `if (href === null) return null` — genuine D-07 absence, asserted as `toHaveCount(0)` plus no `[aria-disabled]` anywhere. |
| `components/mdx/figure.tsx` / `aside.tsx` | Figure with intrinsic dimensions; Aside with kicker | ✓ VERIFIED | Both present and consumed by `content/fixture.mdx`; both asserted present in the render at 375px and 1440px, incl. `figure[data-wide]`. |
| `app/(en)/writing/[slug]/page.tsx` | Single English post template | ✓ VERIFIED | 96 lines. `generateStaticParams`, `generateMetadata` with canonical + hreflang, allowlist-before-import, `<Prose><Post /></Prose>`. |
| `app/(de)/texte/[slug]/page.tsx` | German twin | ✓ VERIFIED | 99 lines. Same shape; additionally falls `x-default` back to its own URL for a German-only piece rather than pointing at a 404. |
| `app/(en)/writing/page.tsx` / `app/(de)/texte/page.tsx` | Both indexes with n=0 / n=1 / n≥2 | ✓ VERIFIED | 69 lines each. All three renderings exercised: n=0 in production build output, n=1 on `/writing` in dev, n≥2 on `/texte` in dev. |
| `app/(en)/writing/not-found.tsx` / `app/(de)/texte/not-found.tsx` | Localised not-found with a recovery link | ✓ VERIFIED | Both present; both confirmed **live in production** with the correct localised copy at 404. |
| `content/fixture.mdx` | Draft fixture exercising every Prose Contract element | ✓ VERIFIED | 87 lines, `draft: true`. Contains every element UI-SPEC:328 enumerates, including the `<em>` inside a blockquote, the `{`-containing fence, and the deliberately overflowing `curl` line. |
| `content/musterseite.mdx` | German twin sharing `translationKey: fixture-post` | ✓ VERIFIED | Present; drives the switcher's *present* branch. |
| `content/nur-auf-deutsch.md` | Plain-Markdown German post, no translation | ✓ VERIFIED | Present; drives the switcher's *absent* branch **and** the `.md`-format proofs (literal braces, raw HTML dropped) — both asserted by a passing spec. |
| `tests/build/prerender.test.ts` | Production-branch D-11 + lang/robots/hreflang from real build output | ✓ VERIFIED | 171 lines (min_lines: 60). Ran it: 7/7 pass against a freshly wiped-and-rebuilt `.next`. |
| `package.json` | `test:build` script | ✓ VERIFIED | `"test:build": "node --test 'tests/build/*.test.ts'"` present and executed successfully. |
| `_pm/kanban.md` | Working-agreement board (CLAUDE.md) | ✓ VERIFIED | Present, 1694 bytes. Resolves the checkpoint question raised in Plan 07. |

No artifact was found MISSING, STUB, or ORPHANED.

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `next.config.ts` | `@next/mdx` | `withMDX(nextConfig)` default export | ✓ WIRED | Pattern present; end-to-end proof is the drop test rendering a brand-new `.mdx` file. |
| `app/(en)/layout.tsx`, `app/(de)/layout.tsx` | `app/fonts/ibm-plex-mono.ts` | `ibmPlexMono.variable` in the `<html>` className | ✓ WIRED | Both layouts. Measured downstream: `pre` computes to IBM Plex Mono. |
| `mdx-components.tsx` | Shiki `<pre>` output | `pre` override stripping the inline background, adding `aria-label` | ✓ WIRED | Measured, not assumed: `pre.getAttribute("style") === null` in a real render (RESEARCH A1 confirmed). |
| `lib/content.ts` | `content/` directory | `readdir` over a fixed `CONTENT_DIR` | ✓ WIRED | `CONTENT_DIR` is module-scope and constant — no caller-supplied path reaches `readdir`. Drop test proves the enumeration is live. |
| `lib/content.ts` | Compiled MDX modules | Dual-extension dynamic import with explicit suffix | ✓ WIRED | `@/content/${slug}.mdx` with a `.md` fallback. Both formats render — `.mdx` (fixture, musterseite) and `.md` (nur-auf-deutsch). |
| `lib/locales.ts` | `lib/content.ts` | `import type { Locale }` (erased at runtime) | ✓ WIRED | Type-only import confirmed on line 1 — this is why `node --test` can load the module without a bundler. 24/24 unit tests run. |
| `components/prose.tsx` | `app/globals.css .prose-site` | `className` on the wrapper div | ✓ WIRED | Exact string `prose prose-neutral max-w-none prose-site`. Downstream measurement proves the override actually beats the plugin. |
| `components/smear-title.tsx` | `use-smear-heading.ts` | `useSmearHeading` ref on the heading | ✓ WIRED | Phase 1's smear specs still pass on the new routes. |
| `mdx-components.tsx` | `components/mdx/figure.tsx` | Component map entry consumed by MDX | ✓ WIRED | Both `Figure`s render in the fixture at both viewports. |
| `app/(en)/writing/[slug]/page.tsx` | `lib/content.ts findBySlug` | Allowlist **before** `loadPostModule` | ✓ WIRED | Ordering read directly; both routes correct. Live traversal probes 404. |
| `app/(en)/writing/[slug]/page.tsx` | `components/prose.tsx` | `<Prose>` wrapping the compiled MDX default export | ✓ WIRED | `<Prose><Post /></Prose>` in both post routes. |
| `content/fixture.mdx` | `components/mdx/figure.tsx` | Explicit ESM import inside MDX (D-08) | ✓ WIRED | `import { Figure } from "@/components/mdx/figure";` on line 11. |
| `app/(en)/writing/page.tsx` | `lib/content.ts publishedFor` | Server-side enumeration at prerender | ✓ WIRED | Both indexes. Draft filtering proven on both sides of the `NODE_ENV` boundary. |
| `app/(de)/layout.tsx` | `smear-heading-provider.tsx` | Provider wrapping children in the second root layout | ✓ WIRED | Present in both roots. |
| `tests/build/prerender.test.ts` | `.next/server/app` | Reading prerendered HTML from disk after a clean build | ✓ WIRED | `APP_DIR = path.join(process.cwd(), ".next", "server", "app")`; 7/7 pass. |
| `package.json` | `tests/build/*.test.ts` | `test:build` script | ✓ WIRED | Executed. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `app/(en)/writing/page.tsx` | `entries` | `await publishedFor("en")` → `allPosts()` → `readdir(CONTENT_DIR)` | Yes — filesystem read, not a literal | ✓ FLOWING |
| `app/(de)/texte/page.tsx` | `entries` | `await publishedFor("de")` | Yes — renders 2 real entries in dev | ✓ FLOWING |
| `app/(en)/writing/[slug]/page.tsx` | `entry`, `Post` | `findBySlug(await publishedFor("en"), slug)` + `loadPostModule(slug)` | Yes — title/standfirst/date rendered from the file; body from the compiled module | ✓ FLOWING |
| `app/(de)/texte/[slug]/page.tsx` | `entry`, `Post`, `twin` | same + `translationOf(entry)` | Yes — `twin` resolves to `content/fixture.mdx` and drives a working round-trip link | ✓ FLOWING |
| `components/post-meta.tsx` | `date`, `switchHref`, `draft` | Props from the route, sourced from front-matter | Yes — no hardcoded empty props at any call site | ✓ FLOWING |
| `components/prose.tsx` | `children` | The compiled MDX default export | Yes — `<Post />`, never a literal | ✓ FLOWING |

No HOLLOW or HOLLOW_PROP findings. The one prop deliberately passed as a constant — `switchHref={null}` on the index — carries an in-file rationale (the index-level switcher already satisfies I18N-01; a second link under a poster-scale headline would compete) and is asserted by a spec ("the h2 is the sole link"). This is a design decision, not a disconnected wire.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| A brand-new content file is served with no per-post wiring | Create `content/verifier-drop-test.mdx`, `npm run dev`, `curl -w '%{http_code}' /writing/verifier-drop-test` | `200`, front-matter title + standfirst rendered, `class="shiki"` present, listed on `/writing`, zero route files added | ✓ PASS |
| Malformed front-matter fails the build | Create a file with empty title / bad date / `lang: fr`, `npm run build` | exit **1**, `Error: content/verifier-bad-frontmatter: title must be a non-empty string; standfirst …; translationKey …; date must be an ISO date (YYYY-MM-DD); lang must be one of en, de` | ✓ PASS |
| Clean production build | `rm -rf .next && npm run build` | Compiled in 6.0s, TS clean, 7 routes, zero draft prerenders | ✓ PASS |
| Production build-output assertions | `npm run test:build` | 7/7 pass | ✓ PASS |
| Unit suite | `npm run test:unit` | 24/24 pass | ✓ PASS |
| Browser/route suite | `npx playwright test` | **57/57 pass** in 13.9s | ✓ PASS |
| Typecheck | `npx tsc --noEmit` | exit 0 | ✓ PASS |
| Live deployment serves this commit | `curl` `/`, `/writing`, `/texte`, `/type`, `/writing/fixture`, `/writing/does-not-exist` | 200, 200, 200, 200, **404**, **404**; `lang="en"` / `lang="de"`; `noindex`; canonical + `hrefLang` en/de/x-default; localised 404 copy in both locales | ✓ PASS |
| Slug allowlist resists traversal (production) | `curl /writing/../../etc/passwd`, `..%2F..%2Fpackage.json`, `%2e%2e%2fpackage` | all **404** | ✓ PASS |
| Deployed commit matches verified tree | `git rev-parse HEAD` vs `origin/master` | both `3f299c9`, `git diff` empty | ✓ PASS |

### Probe Execution

| Probe | Command | Result | Status |
|-------|---------|--------|--------|
| — | — | No `scripts/*/tests/probe-*.sh` convention exists in this repo and no PLAN or SUMMARY declares a probe path. This is not a migration or CLI-tooling phase. | ? SKIPPED (no probe contract) |

The equivalent role is played by the project's own runnable gates (`npm run test`, `test:unit`, `test:build`, `next build`), every one of which was executed by this verifier in its own process — see Behavioral Spot-Checks. No SUMMARY-reported pass count was accepted as a substitute.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| **WRIT-01** | 02-01 … 02-07 (all seven) | Visitor can browse an index of Guillem's writing hosted on the site. *(At v1 launch the index holds the case study; the 2020 archive is deferred to v2.)* | ✓ SATISFIED (mechanism) — content pending Phase 4 | `/writing` and `/texte` exist, are prerendered, and are live in production. All three cardinalities render: n=0 (production, asserted by `tests/build/prerender.test.ts`), n=1 (`/writing` in dev, asserted by `tests/writing-index.spec.ts`), n≥2 (`/texte` in dev, asserted in the same spec). The requirement's own parenthetical scopes launch content to the case study, which is Phase 4's deliverable. |
| **I18N-01** | 02-01, 02-02, 02-03, 02-04, 02-06, 02-07 | Visitor can read any piece of writing in English or German wherever a translation exists, at a language-appropriate URL, and can switch between them. A piece may exist in one locale only. | ✓ SATISFIED | Localised URL shapes `/writing/{slug}` and `/texte/{slug}` with **no locale prefix** (asserted, and confirmed absent from build output route keys). Per-route `<html lang>` from two root layouts — confirmed live. Round-trip switch asserted with real navigation. One-locale-only case handled by DOM absence, not a disabled control. `hreflang` + `x-default` + canonical emitted from Phase 2 so Phase 6 only flips `robots`. Localised dates unit-tested and timezone-pinned. |

**Orphaned requirements:** none. `.planning/REQUIREMENTS.md` maps exactly `WRIT-01` and `I18N-01` to Phase 2; both appear in the `requirements:` frontmatter of the phase's plans and both are accounted for above.

**Note:** `.planning/REQUIREMENTS.md` still shows WRIT-01 and I18N-01 as `Pending` / unchecked in both the checklist and the traceability table. That is a bookkeeping update for the orchestrator, not a code gap.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | `TBD` / `FIXME` / `XXX` | — | **None found.** Grepped across `app/`, `components/`, `lib/`, `content/`, `tests/`, `mdx-components.tsx`, `next.config.ts`, `package.json`, `playwright.config.ts`. The debt-marker gate is clean. |
| — | — | `TODO` / `HACK` / `PLACEHOLDER` / "coming soon" / "not yet implemented" | — | **None found.** |
| — | — | `console.log`-only implementations | — | **None found** anywhere in source or tests. |
| — | — | `test.skip` / `test.only` / `.todo(` | — | **None found.** No test is disabled to make the suite green. |
| `components/language-switch.tsx` | 16 | `return null` | ℹ️ Info | Not a stub — this **is** the D-07 specification (absent from the DOM, not disabled). Asserted by a passing spec. |
| `app/(en)/writing/[slug]/page.tsx`, `app/(de)/texte/[slug]/page.tsx` | 33 | `return {}` | ℹ️ Info | `generateMetadata` for a slug the route is about to `notFound()`. Correct, not empty-implementation. |
| `components/smear-heading/use-prefers-reduced-motion.ts` | 23 | `react-hooks/set-state-in-effect` **error** | ⚠️ Warning (pre-existing, out of scope) | Phase 1 output (commit `9b98e08`). Logged in `deferred-items.md`; `02-03-PLAN.md` Task 3 explicitly forbids touching `components/smear-heading/`. Scoped lint over the Phase 2 source tree returns **exactly this one error** and 3 harmless unused-var warnings. Does not affect any Phase 2 truth. |
| `.claude/worktrees/agent-a569251ee23bdd09a` | — | Stale 700 MB git worktree still registered (`git worktree list`), left over from executor merges | ⚠️ Warning (repo hygiene, not Phase 2 code) | `eslint.config.mjs` does not ignore `.claude/**`, and `npm run lint` takes no path argument — so the repo-wide `npm run lint` reports **589 errors / 8609 warnings**, of which **588 errors come from this stale worktree copy**, not from the project. `npm run lint` is therefore currently unusable as a quality gate. Suggested fixes (not applied): `git worktree remove .claude/worktrees/agent-a569251ee23bdd09a` and/or add `.claude/**` to `globalIgnores`. |
| `.planning/phases/02-content-pipeline/02-VALIDATION.md` | frontmatter | `status: draft`, `nyquist_compliant: false`, `wave_0_complete: false`; sign-off checklist unchecked; "Approval: pending" | ℹ️ Info | Stale planning doc. Every row of its Per-Task Verification Map now has a passing automated command (independently re-run here), and every Wave 0 item exists on disk. The document simply was never updated to reflect that. |

### Human Verification Required

Three items. The first two are designated manual by `02-VALIDATION.md`'s "Manual-Only Verifications" table and were **explicitly not claimed as passed** by `02-07-SUMMARY.md` — which is the correct behaviour and the reason this report is `human_needed` rather than `passed`.

#### 1. Do `h2` and `h3` read as two distinct hierarchy levels?

**Test:** Run `npm run dev`. Load `http://localhost:3000/writing/fixture` at 375px, then at 1440px. Find the adjacent pair under "Section headings, side by side" — an `h2` with two paragraphs under it, then an `h3` with two paragraphs under it.
**Expected:** In a single glance, they read as two levels.
**Why human:** The measurable half is fully verified and passes: both are 14px, uppercase, `letter-spacing: 0.56px` (= 0.04em), Newsreader 400, `line-height: 18.2px` — **identical at both viewports**. The only differences are a 1px full-ink bottom rule on `h2` and `margin-top` 48px vs 32px. No assertion can prove "reads as two levels."
**If it fails:** UI-SPEC Dimension 4 flag #2 prescribes the remedy — *more space above `h2`, never a fifth type size*.

#### 2. Does the prose read as Phase 1's system rather than as re-numbered plugin defaults?

**Test:** Read `http://localhost:3000/writing/fixture` end to end at 1440px, with `http://localhost:3000/type` open in a second tab for comparison.
**Expected:** One coherent authored typographic system, continuous with the Phase 1 specimen.
**Why human:** The computed-value assertions prove the tokens applied and that the plugin's scale is provably not in force (every prose element resolves to 14px or 18px, nothing else). They cannot prove typographic coherence. `02-VALIDATION.md` is explicit about this.

#### 3. Does `/writing` read as deliberate at n=1?

**Test:** With the dev server running, load `http://localhost:3000/writing` — it renders n=1 against the draft fixture, which is the launch shape.
**Expected:** A poster-scale Display headline over a standfirst and a date line reads as an editorial front page, not as an empty shelf with one item on it.
**Why human:** SC2's own wording is "must **read** as deliberate at n=1." Everything measurable is asserted and passing (no card, no border, no shadow, no fill, no "Read more", headline is the only link, `text-display` role, 530-weight standfirst). The remaining judgement is editorial. Note this shape is currently visible **only in dev** — production is at n=0 until Phase 4 lands the case study.

### Gaps Summary

**No gaps.** All nine must-have truths are verified against the codebase and against live runs, not against SUMMARY narrative.

The adversarial starting hypothesis — "tasks completed, goal missed" — did not survive contact with the code. Every place a stub could plausibly hide was probed directly:

- **The strongest claim, SC1's "no per-post wiring", was tested by actually doing it.** A file that did not exist when this phase was planned was dropped into `content/` and served at its URL with title, standfirst, date and syntax highlighting, with zero route files added.
- **The validation control was tested by breaking it on purpose.** Malformed front-matter fails `next build` with a message naming the file and every invalid field — this is a real gate, not a comment claiming one.
- **The typography claim survives its own negative assertion.** Walking every element under `.prose-site`, the set of distinct computed font sizes is exactly `{14px, 18px}`. `@tailwindcss/typography`'s scale is provably defeated, not merely partially overridden.
- **The Shiki background strip was measured, not assumed** — `pre.getAttribute("style")` is `null`, which is a stronger result than "contains no background-color".
- **The draft-exclusion claim is proven at the production boundary**, by reading real `.next/server/app` output, and confirmed live (`/writing/fixture` → 404 in production).
- **Test-suite integrity was checked, not assumed:** no `test.skip`, no `test.only`, no `.todo(`. 57/57 Playwright, 24/24 unit, 7/7 build — all re-run here.
- **`02-07-SUMMARY.md`'s one self-declared open item is now closed.** It stated "the live Railway URL does not yet serve Phase 2." That was true when written. It is no longer: `origin/master == HEAD == 3f299c9` and production serves it correctly in both locales. RESEARCH Assumption A6 is resolved.

Two items are **deferred by design, not missed**: SC2's "lists one entry (the Phase 4 case study)" cannot be satisfied in Phase 2 because the case study is Phase 4's deliverable. The n=1 *treatment* — which is what Phase 2 owes — is built and proven. The production n=0 empty state is the correct, documented interim condition, and the launch gate protecting it (Phase 6 is blocked if `/writing` is still n=0 when `robots` flips) is recorded in UI-SPEC and carried forward here.

Two items are **repo hygiene, outside the phase goal**: the pre-existing Phase 1 lint error in `use-prefers-reduced-motion.ts`, and the stale 700 MB executor worktree under `.claude/worktrees/` that makes repo-wide `npm run lint` report 588 spurious errors. Neither affects any Phase 2 truth. Both are worth a small cleanup task before the next phase, since `npm run lint` is currently not usable as a gate.

**Status is `human_needed`, not `passed`, solely because three optical judgements remain.** Every automated check that could be run, was run, and passed. Phase 3 depends on Phase 2's code and routes, which are complete — it is not blocked by the outstanding human items.

---

_Verified: 2026-08-31T09:16:31Z_
_Verifier: Claude (gsd-verifier)_
