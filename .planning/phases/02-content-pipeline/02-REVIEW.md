---
phase: 02-content-pipeline
reviewed: 2026-08-31T09:21:08Z
depth: standard
files_reviewed: 37
files_reviewed_list:
  - app/(de)/layout.tsx
  - app/(de)/texte/[slug]/page.tsx
  - app/(de)/texte/not-found.tsx
  - app/(de)/texte/page.tsx
  - app/(en)/layout.tsx
  - app/(en)/writing/[slug]/page.tsx
  - app/(en)/writing/not-found.tsx
  - app/(en)/writing/page.tsx
  - app/fonts/ibm-plex-mono.ts
  - app/fonts/newsreader.ts
  - app/globals.css
  - components/language-switch.tsx
  - components/mdx/aside.tsx
  - components/mdx/figure.tsx
  - components/post-meta.tsx
  - components/prose.tsx
  - components/smear-title.tsx
  - lib/content.ts
  - lib/locales.ts
  - mdx-components.tsx
  - next.config.ts
  - package.json
  - playwright.config.ts
  - tsconfig.json
  - tests/build/prerender.test.ts
  - tests/draft-visibility.spec.ts
  - tests/fixture-viewport.spec.ts
  - tests/font-cls.spec.ts
  - tests/i18n-routing.spec.ts
  - tests/prose-code.spec.ts
  - tests/prose-typography.spec.ts
  - tests/unit/content.test.ts
  - tests/unit/dates.test.ts
  - tests/unit/prose-contract.test.ts
  - tests/writing-index.spec.ts
  - tests/writing-not-found.spec.ts
  - tests/writing-routing.spec.ts
findings:
  critical: 3
  warning: 14
  info: 6
  total: 23
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-08-31T09:21:08Z
**Depth:** standard
**Files Reviewed:** 37
**Status:** issues_found

## Summary

Thirty-seven source files across the EN/DE route trees, the content layer, the MDX
pipeline, the Prose Contract CSS and the fourteen-file test suite. Review was not
read-only-by-inspection: `npx tsc --noEmit` (clean), `npm run test:unit` (24/24),
`rm -rf .next && npm run build` (clean, 7 routes), `npm run test:build` (7/7),
`npm run lint`, plus a live dev server and a live `next start` production server were
used to measure the claims the code makes about itself. Several findings below are
measured facts, not readings.

**The four focus areas that were asked about, and what actually held:**

1. **Allowlist ordering (ASVS V4) — holds, in both locales.** `findBySlug(await
   publishedFor(locale), slug)` precedes `loadPostModule` in both
   `app/(en)/writing/[slug]/page.tsx:64-67` and `app/(de)/texte/[slug]/page.tsx:67-70`;
   the DE copy is not subtly wrong. Verified at the HTTP layer against both a dev and a
   production server: `/writing/nur-auf-deutsch` → 404, `/texte/fixture` → 404,
   `/writing/%2e%2e%2fmusterseite` → 404, `/writing/..%2f..%2fpackage.json` → 400. The
   *ordering* is correct; see **WR-02** for the fact that nothing but a comment enforces it.
2. **Draft handling — holds end to end.** A real production build prerenders
   `index.html`, `texte.html`, `type.html`, `writing.html`, `_not-found.html` and nothing
   else; no draft route, no draft title anywhere in `.next/server/app`, and no draft
   title anywhere in `.next/static` (the MDX tree never crosses to the client). Under
   `next start`, `/writing/fixture`, `/texte/musterseite` and `/texte/nur-auf-deutsch`
   all return 404 and `/writing` renders the empty state. The `NODE_ENV` branch is not
   invertible from outside. See **WR-07** and **WR-11** for how that property is stated
   twice and gated by no single command.
3. **EN/DE divergence — no asymmetry found in `robots`, `metadataBase`, hreflang
   emission, the switcher's absent branch, or the not-found boundaries.** Both layouts
   are byte-identical apart from `lang`/`description`; both indexes emit
   canonical + `en` + `de` + `x-default`; `/texte/nur-auf-deutsch` correctly emits no
   `en` alternate. The one deliberate difference (`x-default` on a German-only post
   falls back to its own URL) is documented in-line and is defensible. The divergence
   that *does* exist is between EN/DE and the *global* 404 — see **WR-14**.
4. **Server/client boundary — holds.** `components/smear-title.tsx` is the only file in
   the post render path carrying `"use client"`. `components/prose.tsx`, both `[slug]`
   routes, both indexes and both not-found files are Server Components. Confirmed
   structurally by grep and empirically by the absence of any fixture prose in
   `.next/static`.

**What is wrong.** Three Critical findings, none of which the existing suite can catch:
the localised not-found boundaries never server-render (a production 404 with JS off is
a literally blank page with no `lang`); `<Figure wide>` is clipped 61px off the left edge
of the viewport at every desktop width while the overflow test passes; and front-matter
date validation is shape-only, so `2026-02-31` silently publishes as "3 March 2026".
Fourteen Warnings follow, concentrated in `lib/content.ts`'s error handling and in gaps
between what the tests assert and what the UI-SPEC requires.

---

## Critical Issues

### CR-01: The localised not-found boundaries never server-render — a production 404 is a blank page with no `lang`

**File:** `app/(en)/writing/[slug]/page.tsx:16-20,65`, `app/(de)/texte/[slug]/page.tsx:16-20,68`, `app/(en)/writing/not-found.tsx:5-10`, `app/(de)/texte/not-found.tsx:5-10`

**Issue:** Measured against a real `next build` + `next start`, `GET /texte/gibt-es-nicht`
returns HTTP 404 with this document:

```
<html id="__next_error__">
  ...<title>Guillem Gelabert</title>...
  <body><div hidden=""><!--$--><!--/$--></div>...
```

No `lang` attribute, no `<h1>`, and the entire body is inside `<div hidden>`. Measured
with Playwright at two JS settings against the production server:

| | `lang` | `<h1>` | visible text |
|---|---|---|---|
| JS enabled | `de` | `Nicht gefunden` | `Nicht gefunden / Diesen Text gibt es hier nicht. / ← TEXTE` |
| JS disabled | `(none)` | `(no h1)` | `""` |

The localised copy exists only in the RSC flight payload and paints after hydration. The
same shape occurs in dev, and on `/writing/fixture` and `/texte/musterseite` in
production (the draft 404 path).

Consequences: WCAG 2.1 SC 3.1.1 *Language of Page* (Level A) fails on every 404 the site
serves; a visitor without JS, a crawler, a link-preview fetcher or reader mode gets a
blank page; and the entire `not-found.tsx` localisation work in both locale trees is
server-side inert. The three identical code comments asserting this arrangement is
"unambiguous either way" are contradicted by measurement.

`tests/writing-not-found.spec.ts` and `tests/writing-routing.spec.ts:36-46` pass because
Playwright always runs with JS enabled and waits for hydration — the suite structurally
cannot see this.

**Fix:** Add a root `app/not-found.tsx` so the two-root-layout arrangement has a boundary
React can render into the shell, and add a no-JS assertion so the property is defended:

```ts
// playwright.config.ts — new project
{
  name: "chromium-nojs",
  use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
  testMatch: "**/writing-not-found.spec.ts",
}
```

```ts
// tests/writing-not-found.spec.ts — add inside the loop
test(`${locale.path} renders its localised copy without JavaScript`, async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  const response = await page.goto(locale.path);
  expect(response?.status()).toBe(404);
  expect(await page.evaluate(() => document.documentElement.lang)).toBe(locale.lang);
  await expect(page.locator("h1")).toHaveText(locale.heading);
  await ctx.close();
});
```

If a root `not-found.tsx` does not restore SSR (Next may still bail the shell), the
fallback is to serve the localised 404 from an optional catch-all
(`app/(en)/writing/[[...slug]]/page.tsx`) that renders the not-found UI directly and
sets the status, instead of throwing `notFound()`.

---

### CR-02: `<Figure wide>` is clipped 61px off the left edge of the viewport at every desktop width

**File:** `app/globals.css:260-265`

**Issue:** The breakout assumes the prose column is centred in the viewport. It is not —
`app/(en)/writing/[slug]/page.tsx:71` (and the DE twin at `:74`) renders
`<main className="flex flex-col gap-3xl px-lg py-3xl">` with no `mx-auto` and no
`items-center`, so `.prose-site` (`max-width: 65ch`) is a stretched flex item pinned to
the left edge. `margin-left: 50%; transform: translateX(-50%)` therefore centres the
832px figure on the *column's* centre, not the viewport's.

Measured on `/writing/fixture` with Playwright at three widths:

```
1280px: prose { left: 24, right: 687 }  wideFigure { left: -61, right: 771, width: 832 }
1440px: prose { left: 24, right: 687 }  wideFigure { left: -61, right: 771, width: 832 }
1920px: prose { left: 24, right: 687 }  wideFigure { left: -61, right: 771, width: 832 }
```

61px of the image and its caption sit left of x=0. In LTR, negative overflow is not
scrollable — the content is clipped and unreachable, at every desktop width, on the
fixture whose entire job is to prove the Prose Contract renders.

`tests/fixture-viewport.spec.ts:115` cannot catch it: it asserts
`document.documentElement.scrollWidth <= innerWidth + 1`, and `scrollWidth` was measured
at exactly `innerWidth` (1280/1440/1920) because left-side overflow never contributes to
`scrollWidth`. The test passes on broken output.

**Fix:** Note that *any* symmetric breakout overflows here — the column is pinned to the
left, so centring the figure on it always pushes half the growth off-screen. Two correct
options.

**(a) Anchor the breakout to the column's left edge and grow rightward** (smallest change,
keeps the 52rem wide measure exactly):

```css
.prose-site figure[data-wide] {
  width: min(52rem, calc(100vw - 48px));
  max-width: none;
  margin-left: 0;
  transform: none;
}
```

At 1440px this renders `left: 24, right: 856` — inside the viewport, still 832px wide.

**(b) Centre the whole page composition and keep the existing breakout**, which then
becomes correct by construction — the header, standfirst and meta line centre with the
prose rather than the prose drifting away from them:

```tsx
// both [slug] routes
<main className="mx-auto flex w-full max-w-[52rem] flex-col gap-3xl px-lg py-3xl">
```

(b) is the larger visual change and should go past the UI-SPEC before it ships; (a) is the
minimal correction.

Either way, add to `tests/fixture-viewport.spec.ts`:

```ts
const wide = await page.locator(".prose-site figure[data-wide]").boundingBox();
expect(wide!.x).toBeGreaterThanOrEqual(0);
expect(wide!.x + wide!.width).toBeLessThanOrEqual(viewport.width + 1);
```

---

### CR-03: Front-matter date validation is shape-only — an impossible date silently publishes under a different date

**File:** `lib/content.ts:44-46`, `lib/locales.ts:29-30`

**Issue:** `assertFrontmatter` validates `date` against `/^\d{4}-\d{2}-\d{2}$/` and nothing
else. Measured through the exact `Intl.DateTimeFormat` configuration
`lib/locales.ts:24-31` uses:

```
2026-02-31   →  "3 March 2026"                      (silently wrong, no error)
2026-13-01   →  RangeError: Invalid time value
0000-00-00   →  RangeError: Invalid time value
9999-99-99   →  RangeError: Invalid time value
```

Two distinct defects from one gap:

- **Silent corruption.** `date: "2026-02-31"` passes validation and renders as
  `<time dateTime="2026-02-31">3 March 2026</time>` — a published date the author never
  wrote, an invalid `datetime` attribute, and a sort key
  (`lib/content.ts:93`, `:126`) that orders the index by the typo rather than the intent.
- **Unattributable build crash.** `2026-13-01` throws a bare
  `RangeError: Invalid time value` out of `Intl`, with no filename and no field name —
  the exact opposite of the ASVS V5 contract this module documents at `lib/content.ts:26-32`
  ("fails the build loudly instead of shipping"). The error surfaces from
  `formatPostDate`, three modules away from the file that caused it.

This is the focus area 5 item: malformed front-matter is caught for *shape*, not for
*validity*.

**Fix:**

```ts
// lib/content.ts, replacing the date branch in assertFrontmatter
if (typeof f.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(f.date)) {
  problems.push("date must be an ISO date (YYYY-MM-DD)");
} else {
  const parsed = new Date(`${f.date}T00:00:00Z`);
  // Round-trip: rejects both unparseable dates and calendar rollovers
  // (2026-02-31 parses to 2026-03-03 and must not be accepted as written).
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== f.date) {
    problems.push(`date "${f.date}" is not a real calendar date`);
  }
}
```

Add to `tests/unit/content.test.ts`'s malformed-shape table:

```ts
{ file: "rollover-date.mdx", fm: { ...validFrontmatter, date: "2026-02-31" }, expectField: /date/ },
{ file: "impossible-month.mdx", fm: { ...validFrontmatter, date: "2026-13-01" }, expectField: /date/ },
```

---

## Warnings

### WR-01: `loadPostModule`'s bare `catch` masks every MDX evaluation error as a missing `.md` file

**File:** `lib/content.ts:76-82`

**Issue:** The catch has no predicate. Any error thrown while *evaluating*
`content/{slug}.mdx` — a broken relative import inside the MDX, a component that throws
at module scope, a plugin failure specific to that file — is swallowed and replaced by
the `.md` fallback's resolution failure. The build then fails with
`Cannot find module '@/content/{slug}.md'`, pointing at a file that was never the problem
and hiding the real stack. This is the single most likely way a future content bug wastes
an hour.

**Fix:** Only fall through on a resolution failure:

```ts
export async function loadPostModule(slug: string) {
  try {
    return await import(`@/content/${slug}.mdx`);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    const isMissing =
      code === "MODULE_NOT_FOUND" ||
      code === "ERR_MODULE_NOT_FOUND" ||
      /Cannot find module/.test(String((error as Error)?.message));
    if (!isMissing) throw error;
    return await import(`@/content/${slug}.md`);
  }
}
```

---

### WR-02: The ASVS V4 allowlist is enforced only by comment convention, not by the function it protects

**File:** `lib/content.ts:70-82`

**Issue:** `loadPostModule` is exported with no internal guard and feeds a
caller-supplied string straight into a bundler context module
(`` import(`@/content/${slug}.mdx`) ``), whose generated request pattern
(`^\./.*\.mdx$` rooted at `content/`) also matches `./../…` shapes. The only thing keeping
that safe today is that both call sites happen to run `findBySlug(await
publishedFor(locale), slug)` first. The ordering *is* correct in both files and holds at
the HTTP layer — but the module defends it with prose ("Do not reorder",
`lib/content.ts:109-113`) rather than with code, and `tests/unit/content.test.ts:171-181`
tests `findBySlug` in isolation, never that `loadPostModule` refuses a bad slug. One
refactor that inlines a "convenience" loader loses the phase's only security control
silently.

**Fix:** Make the guard structural, so the property survives a careless edit:

```ts
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function loadPostModule(slug: string) {
  if (!SAFE_SLUG.test(slug)) {
    throw new Error(`Refusing to import unsafe slug: ${JSON.stringify(slug)}`);
  }
  // ...existing body
}
```

and assert it in `tests/unit/content.test.ts` alongside the existing traversal table.

---

### WR-03: A `.md`/`.mdx` basename collision produces a duplicated post, a duplicate React key and duplicate static params

**File:** `lib/content.ts:63-66`

**Issue:** `slugsOnDisk()` strips both extensions and does not de-duplicate. With
`content/foo.md` and `content/foo.mdx` both present, `allPosts()` returns two entries with
slug `foo`, both resolving to the `.mdx` module (`loadPostModule` tries `.mdx` first).
The index then renders the same post twice under `key={entry.slug}`
(`app/(en)/writing/page.tsx:42`) — a duplicate React key — and `generateStaticParams()`
returns `[{ slug: "foo" }, { slug: "foo" }]`. Given the phase deliberately ships both
formats and a v2 archive migration is planned, this collision is likely, not theoretical.

**Fix:** Detect it and fail the build with the filename:

```ts
async function slugsOnDisk(): Promise<string[]> {
  const files = await readdir(CONTENT_DIR, { withFileTypes: true });
  const seen = new Map<string, string>();
  for (const file of files) {
    if (!file.isFile() || !/\.mdx?$/.test(file.name)) continue;
    const slug = file.name.replace(/\.mdx?$/, "");
    const previous = seen.get(slug);
    if (previous) {
      throw new Error(`content/: "${previous}" and "${file.name}" resolve to the same slug "${slug}"`);
    }
    seen.set(slug, file.name);
  }
  return [...seen.keys()];
}
```

(This also closes IN-01.)

---

### WR-04: Both index pages ship the empty-state copy as their permanent `<meta name="description">`

**File:** `app/(en)/writing/page.tsx:13`, `app/(de)/texte/page.tsx:13`

**Issue:** `description: UI.en.emptyBody` / `UI.de.emptyBody`. Measured on a live server:

```
/writing  <meta name="description" content="The first piece is being written."/>
/texte    <meta name="description" content="Der erste Text entsteht gerade."/>
```

Those strings are the `n = 0` state copy (02-UI-SPEC "n = 0 — the interim state"), reused
as the index's description regardless of how many posts exist. The moment Phase 4's case
study lands, `/writing` will render a headline and simultaneously tell every crawler and
link-preview card that nothing is published — and Phase 6 is the phase that flips
`robots` to indexable, so this ships to search results. Reusing a UI copy key for two
unrelated purposes is also what makes it invisible: `tests/unit/dates.test.ts:43-61`
asserts the key is non-empty, which it is.

**Fix:** Add a dedicated key rather than overloading `emptyBody`:

```ts
// lib/locales.ts — extend UiCopy
indexDescription: string;
// en: "Essays and case studies on data journalism and visualisation."
// de: "Essays und Fallstudien zu Datenjournalismus und Visualisierung."
```

then use `UI[locale].indexDescription` in both `generateMetadata` functions.

---

### WR-05: Two identical `role="region" aria-label="Code sample"` landmarks on one page

**File:** `mdx-components.tsx:16-18`

**Issue:** Every `<pre>` gets the same static accessible name. Measured on
`/writing/fixture`:

```
2  role="region" aria-label="Code sample"
```

Landmarks of the same role must have unique accessible names — a screen-reader user's
landmark list shows two indistinguishable "Code sample region" entries and cannot tell
the JSON block from the bash block (axe-core `landmark-unique`, WCAG technique ARIA13).
02-UI-SPEC requires "an accessible name", which is satisfied literally but not usefully.
`tests/prose-code.spec.ts:91` asserts only `expect(pre.ariaLabel).toBeTruthy()`, so the
suite cannot see the collision.

**Fix:** Derive the name from the language Shiki already puts on the element:

```tsx
pre: ({ style: _shikiBackground, className, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1];
  return (
    <pre
      {...props}
      className={className}
      role="region"
      aria-label={language ? `Code sample: ${language}` : "Code sample"}
    />
  );
},
```

and tighten the test to assert the set of `aria-label` values has no duplicates.

---

### WR-06: The index separator `<hr>` renders full-ink black, not the spec's `--color-rule` hairline

**File:** `app/(en)/writing/page.tsx:43`, `app/(de)/texte/page.tsx:43`, `app/globals.css:284-288`

**Issue:** `.prose-site hr` is scoped to prose, so the `<hr>` the index emits between
entries falls through to Tailwind preflight's `currentColor`. Measured on `/texte`
(two entries in dev):

```
main > hr        border-top: 1px solid rgb(0, 0, 0)
.prose-site hr   border-top: 1px solid rgba(0, 0, 0, 0.12)
```

02-UI-SPEC's `n ≥ 2` section requires additional entries be "separated by **the existing
`<hr>` rule**", and the Color table binds `<hr>` to `--color-rule`. The index separator is
a different, heavier rule than the approved one — an 8× darker line at the most visually
prominent moment on the page. `tests/writing-index.spec.ts:93` asserts only
`toHaveCount(1)`.

**Fix:** Hoist the rule out of the prose scope; the 48px margins already come from the
container's `gap-2xl`, so only the stroke needs declaring:

```css
hr {
  border: 0;
  border-top: 1px solid var(--color-rule);
}
```

and assert the computed colour in `tests/writing-index.spec.ts`:

```ts
const hrColor = await page.locator("main > hr").evaluate((el) => getComputedStyle(el).borderTopColor);
expect(hrColor).toBe("rgba(0, 0, 0, 0.12)");
```

---

### WR-07: The draft-visibility rule is stated twice, independently, in two modules

**File:** `lib/content.ts:85-87`, `components/post-meta.tsx:14`

**Issue:** `isVisible()` reads `process.env.NODE_ENV === "development"`, and
`PostMeta` re-derives the identical predicate inline. Two independent statements of D-11
that can drift apart — precisely the failure mode
`tests/build/prerender.test.ts:167-171` writes a forward note about for Phase 6's
`sitemap.ts`. If the rule ever changes (a `SHOW_DRAFTS` env flag, a preview mode), one
site will be updated and the other will not, and the visible symptom would be a draft
marker on a published post or a published post with no marker in dev.

**Fix:** One exported predicate, two callers:

```ts
// lib/content.ts
export function showDrafts(): boolean {
  return process.env.NODE_ENV === "development";
}
export function isVisible(entry: PostEntry): boolean {
  return showDrafts() || entry.frontmatter.draft !== true;
}
```

```tsx
// components/post-meta.tsx
import { showDrafts } from "@/lib/content";
const showDraftMarker = draft === true && showDrafts();
```

---

### WR-08: `findTranslation` picks the newest cross-locale match before checking visibility, so a draft twin can hide a published one

**File:** `lib/content.ts:98-107`, `lib/content.ts:130-133`

**Issue:** `translationOf` calls `findTranslation(entry, await allPosts())`. `allPosts()`
includes drafts and is sorted date-descending, so `Array.prototype.find` returns the
*newest* candidate sharing the `translationKey` in the other locale; `translationOf` then
discards it if it is not visible. If a locale ever has two posts with the same
`translationKey` and the newer one is a draft, production loses the language switch even
though a published twin exists — a silent I18N-01 regression whose only symptom is a
missing link.

The unit test at `tests/unit/content.test.ts:159-169` covers the same-locale guard but
not the draft-shadowing case.

**Fix:** Filter before finding, so visibility is part of the selection rather than a
post-hoc veto:

```ts
export async function translationOf(entry: PostEntry): Promise<PostEntry | null> {
  const visible = (await allPosts()).filter(isVisible);
  return findTranslation(entry, visible);
}
```

---

### WR-09: Same-date posts order non-deterministically across machines

**File:** `lib/content.ts:89-94`, `lib/content.ts:117-127`

**Issue:** Both sorts compare only `b.frontmatter.date.localeCompare(a.frontmatter.date)`.
For two posts sharing a date the comparator returns 0 and the stable sort preserves
`readdir` order, which is filesystem- and platform-dependent. The rendered index order
and the order of `generateStaticParams()` can therefore differ between a developer's
machine and the deploy build, with no error and no test failure. `content/fixture.mdx` and
`content/musterseite.mdx` already share `2026-08-30` (different locales today, so the
symptom is latent).

**Fix:** Add a deterministic tiebreak in both places:

```ts
.sort(
  (a, b) =>
    b.frontmatter.date.localeCompare(a.frontmatter.date) || a.slug.localeCompare(b.slug),
);
```

---

### WR-10: `metadataBase` is a hardcoded Railway preview hostname, duplicated across both root layouts

**File:** `app/(en)/layout.tsx:9`, `app/(de)/layout.tsx:9`

**Issue:** `new URL("https://web-production-9cedb.up.railway.app")` appears verbatim in
both files. Measured: every `rel="canonical"` and every `hreflang` alternate on all four
routes resolves against that hostname. This is a magic value that has to change in two
places simultaneously on the first custom domain, with nothing asserting the two copies
match — and canonical/hreflang URLs are exactly the class of value where a stale
hostname is silently wrong rather than loudly broken. Phase 6 flips `robots` to
indexable, which is when it starts to matter.

**Fix:** One source, env-overridable:

```ts
// lib/site.ts
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-production-9cedb.up.railway.app",
);
```

```ts
// both layouts
import { SITE_URL } from "@/lib/site";
export const metadata: Metadata = { metadataBase: SITE_URL, /* ... */ };
```

---

### WR-11: The production draft-exclusion gate is not reachable from any single command

**File:** `package.json:10-12`, `playwright.config.ts:23-27`

**Issue:** `npm test` runs Playwright only, and `playwright.config.ts:24` always boots
`npm run dev`, where `NODE_ENV` is `development` and `isVisible()` returns `true` for
every draft. The only test that proves the production half of D-11 —
`tests/build/prerender.test.ts` — requires an out-of-band `rm -rf .next && npm run build`
followed by a separate `npm run test:build`, and nothing in the repo sequences those.
There is no CI config either.

I ran the full chain manually and it is green (build clean; 7/7 build tests; `next start`
404s all three draft routes; no draft title in `.next/server/app` or `.next/static`) — the
implementation is correct. The gap is that nothing makes anyone run it, which is how a
draft leaks the first time someone edits `selectForLocale`.

**Fix:**

```json
"test:all": "npm run test:unit && rm -rf .next && npm run build && npm run test:build && npm run test"
```

and make that the documented pre-commit / pre-deploy gate.

---

### WR-12: `npm run lint` emits 9,198 problems and is unusable as a gate

**File:** `package.json:9` (`"lint": "eslint"`)

**Issue:** `npm run lint` reports **589 errors and 8,609 warnings**. Grouped by top-level
directory, the file paths reported break down as:

```
156  .claude/          (the agent worktree at .claude/worktrees/agent-…, a full second copy of the tree)
  2  components/
  1  tests/
  1  mdx-components.tsx
```

`eslint.config.mjs`'s `globalIgnores` re-declares the four `eslint-config-next` defaults
and adds nothing, so ESLint walks the checked-out worktree and lints every source file
twice plus its vendored dependencies. The four findings that actually belong to this
repo — `mdx-components.tsx:15` `'_shikiBackground' is defined but never used`,
`tests/unit/content.test.ts:96-97` unused destructure bindings, and the known Phase 1
`use-prefers-reduced-motion.ts:23` error — are unreadable in that volume. The phase's own
`deferred-items.md` had to work around this by scoping `npx eslint` to a hand-written file
list, which is the symptom.

**Fix:**

```js
globalIgnores([
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
  ".claude/**",
  "test-results/**",
  "playwright-report/**",
]);
```

The three real warnings then become fixable: prefix-ignore the intentional discards via
`"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]`.

---

### WR-13: The Prose Contract conformance gate is blind to CSS nesting

**File:** `tests/unit/prose-contract.test.ts:24-56`, `:82`

**Issue:** `proseBlocks` keeps only blocks whose *own* selector starts with `.prose-site`.
When `extractBlocks` recurses into a nested body it pushes the child with its bare
selector — a nested `.prose-site { … .foo { font-size: 20px } }` yields a child block
with selector `.foo`, which fails the `startsWith(".prose-site")` filter — while the
parent's `declarationsOf` (a naive split on `;`) produces the key `".foo { font-size"`,
which never matches `"font-size"` either. A fifth type size, a third weight, a second
tracking value or a rounded corner authored with CSS nesting passes tests (a)–(d)
silently. The gate holds today only because `app/globals.css` happens to use no nesting,
and Tailwind v4 actively encourages nesting.

Secondary: `declarationsOf` splitting on `;` also mis-parses any value containing a
semicolon (`url(data:image/svg+xml;base64,…)`, `content: "\;"`).

**Fix:** Thread the ancestor selector through the recursion so nested blocks inherit
scope:

```ts
function extractBlocks(text: string, parent = ""): Block[] {
  // ...
  const selector = text.slice(start, i).trim();
  const qualified = parent && !selector.startsWith("@") ? `${parent} ${selector}` : selector;
  blocks.push({ selector: qualified, body });
  if (body.includes("{")) {
    blocks.push(...extractBlocks(body, qualified.startsWith("@") ? parent : qualified));
  }
}
```

---

### WR-14: There is no root `app/not-found.tsx` — unmatched URLs get Next's untranslated default 404 with no `lang`

**File:** `app/(en)/layout.tsx`, `app/(de)/layout.tsx` (two root layouts, no global boundary)

**Issue:** Measured on both dev and production, `GET /nope` returns:

```
<html>                                   ← no lang attribute
...This page could not be found          ← Next's built-in English default
```

No root layout, therefore no fonts, no `robots: { index: false }`, no localised copy, and
no `lang`. Both `not-found.tsx` files carry a comment stating "there is no global
not-found with two root layouts" — the observation is correct, but it was recorded as a
constraint rather than fixed, so every URL outside `/writing/*` and `/texte/*` (typos,
stale inbound links, `/blog`, `/de/texte`) lands on an unbranded, unlocalised, unlabelled
page. Same WCAG 3.1.1 failure as CR-01, on a different path.

**Fix:** Add `app/not-found.tsx` rendering the English boundary (the site's default
locale, matching `x-default`), reusing `UI.en`:

```tsx
import Link from "next/link";
import { indexPath, UI } from "@/lib/locales";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col justify-center gap-md px-lg">
          <h1 className="text-heading">{UI.en.notFoundHeading}</h1>
          <p className="text-body">{UI.en.notFoundBody}</p>
          <Link href={indexPath("en")} className="text-label">{UI.en.backLink}</Link>
        </main>
      </body>
    </html>
  );
}
```

and add `expect(await page.evaluate(() => document.documentElement.lang)).toBe("en")` for
`/nope` to `tests/writing-not-found.spec.ts`.

---

## Info

### IN-01: `slugsOnDisk` trusts every `.md`/`.mdx` name `readdir` returns, including directories

**File:** `lib/content.ts:63-66`

**Issue:** `readdir` is called without `withFileTypes`, so a directory named
`content/notes.mdx/`, an editor lock symlink (`content/.#draft.mdx`) or any non-file entry
matching the extension becomes a "slug" whose import fails the build with a
`Cannot find module` message that WR-01 then attributes to the wrong extension.

**Fix:** Covered by WR-03's replacement, which switches to `withFileTypes: true` and
filters on `entry.isFile()`.

---

### IN-02: `UI.de.draftMarker` is the untranslated English string `"Draft"`

**File:** `lib/locales.ts:66`

**Issue:** Every other key in the German block is translated; this one reads `"Draft"`
rather than `"Entwurf"`. It is dev-only chrome, but it sits in the locale copy table of
an i18n phase and no test would notice — `tests/unit/dates.test.ts:43-61` asserts only
non-emptiness.

**Fix:** Translate it, and update `tests/build/prerender.test.ts:144-145`, which asserts
the literal string `"Draft"` is absent from production HTML, to check both markers.

---

### IN-03: `tests/build/prerender.test.ts`'s bare `"Draft"` substring assertion is a future false positive

**File:** `tests/build/prerender.test.ts:137-146`

**Issue:** `assert.equal(writing.includes("Draft"), false)` will fail on any legitimately
published post whose title or standfirst contains "Draft", "Drafting" or "Draftsman" —
a plausible word for a data-journalism site. The test would then fail for a reason
entirely unrelated to what it claims to prove.

**Fix:** Assert the meta line's actual shape rather than a bare substring, e.g. match
`/·\s*Draft/` or count `p.text-label` elements containing the marker.

---

### IN-04: `content/fixture.mdx` imports `Figure` explicitly, so the shipped component map is only half-exercised

**File:** `content/fixture.mdx:11`, `mdx-components.tsx:14`

**Issue:** The explicit `import { Figure } from "@/components/mdx/figure"` shadows the
`MDXComponents` map, so the fixture proves `Figure` *the component* works but never
proves `Figure` *the map entry* is wired. `<Aside>` (line 69) is the only map entry any
test actually covers, and neither German fixture uses either. If the `Figure` key were
deleted from `mdx-components.tsx`, nothing would fail.

**Fix:** Drop the import line from the fixture so it resolves through the map, matching
how `<Aside>` is already used.

---

### IN-05: `mdx-components.tsx`'s `img` throw is documented as a build-time failure but is a render-time throw

**File:** `mdx-components.tsx:31-40`

**Issue:** The comment states "This throws at prerender, so `next build` fails". That is
true only for routes reached through `generateStaticParams`. With `dynamicParams = true`
on both `[slug]` routes, a post that is not prerendered would surface the same error as a
runtime 500 for the visitor instead. Harmless today (drafts 404 before rendering, and all
MDX is bundled at build time), but the guarantee is narrower than the comment claims and
the comment is what a future author will rely on.

**Fix:** Either narrow the comment, or add a build-time check in `allPosts()` that greps
each source file for bare `![...](...)` and throws with the filename.

---

### IN-06: `next-env.d.ts` is tracked and rewritten by both `next dev` and `next build`

**File:** `tsconfig.json:26-33` (include list), `next-env.d.ts`

**Issue:** Already self-declared in `02-01-SUMMARY.md:115`. The file toggles between
`./.next/types/*` and `./.next/dev/types/*` depending on which command ran last, so
whichever variant is committed, the other command dirties the working tree — noise on
every `git status` during normal development, and a spurious diff in any commit made
after a `dev` run. `tsconfig.json` already includes both `.next/types/**/*.ts` and
`.next/dev/types/**/*.ts`, so the reference is redundant in either state.

**Fix:** Add `next-env.d.ts` to `.gitignore` and `git rm --cached` it; the `tsconfig`
include list already covers both generated type trees.

---

_Reviewed: 2026-08-31T09:21:08Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
