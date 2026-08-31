---
phase: 03-work-list-landing-skeleton
reviewed: 2026-08-31T14:32:36Z
depth: standard
files_reviewed: 31
files_reviewed_list:
  - app/(en)/page.tsx
  - app/(en)/cv/page.tsx
  - app/(en)/type/page.tsx
  - app/(en)/writing/page.tsx
  - app/(en)/writing/[slug]/page.tsx
  - app/(en)/writing/not-found.tsx
  - app/(de)/texte/page.tsx
  - app/(de)/texte/[slug]/page.tsx
  - app/(de)/texte/not-found.tsx
  - app/not-found.tsx
  - app/globals.css
  - components/landing/contents-nav.tsx
  - components/landing/featured-slot.tsx
  - components/landing/section-stub.tsx
  - components/landing/work-list.tsx
  - components/language-switch.tsx
  - components/smear-title.tsx
  - lib/work.ts
  - lib/locales.ts
  - tests/unit/css-source.ts
  - tests/unit/link-contract.test.ts
  - tests/unit/work.test.ts
  - tests/unit/prose-contract.test.ts
  - tests/landing.spec.ts
  - tests/landing-viewport.spec.ts
  - tests/landing-trail.spec.ts
  - tests/cv.spec.ts
  - tests/smear-heading.spec.ts
  - tests/reduced-motion.spec.ts
  - tests/build/prerender.test.ts
findings:
  critical: 1
  warning: 6
  info: 11
  total: 18
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-08-31T14:32:36Z
**Depth:** standard
**Files Reviewed:** 31
**Status:** issues_found

## Summary

The de-clienting of `app/(en)/page.tsx` (focus area 1) is clean and holds up under
scrutiny: no `"use client"`, no `useSmearHeading` import, `SmearTitle` is the only new
client boundary in the landing render path, `SmearHeadingProvider` is still owned by the
root layouts, `/` prerenders statically (`.next/server/app/index.html` exists), and
`tests/landing-trail.spec.ts` proves both registered headings trail and settle.
`components/smear-heading/` is untouched. No security issues were found anywhere in
scope: no `eval`, no `innerHTML`/`dangerouslySetInnerHTML`, no `as any`, no debug
artifacts, no secrets, `.env` is gitignored and untracked, and every slug that reaches a
rendered `href` has already passed `lib/content.ts`'s `SAFE_SLUG` allowlist.

Three substantive problems survived the phase.

**The global not-found boundary is broken in production.** `app/not-found.tsx` was added
in response to Phase 2's WR-14 and its header comment asserts "no layout wraps this file".
That premise is false: with `experimental.globalNotFound` off (the default), Next 16.3.3
injects `next/dist/client/components/builtin/layout.js` — a bare `<html><body>` stub — as
the root layout for `/_not-found`, so the file's own `<html>`/`<body>` render *inside* it.
Measured against `next start` on the shipped build, `GET /nope` returns 404 with two
`<html>` tags, two `<body>` tags and **zero `<title>` elements**. Every other route in the
build carries a title. The browser's parser error-recovery merges the nested tags (so
`lang` and the font classes do survive — verified), which is why
`tests/writing-not-found.spec.ts` passes over the top of it, but the missing `<title>` is
an unrecovered WCAG 2.4.2 Level A failure on the one surface a stranger reaches first.

**The type/spacing budget gate does not gate the budget.** Focus area 4's nesting-awareness
question checks out — WR-13's `parent` argument survived the extraction into
`tests/unit/css-source.ts` intact and is directly exercised by prose-contract test (k).
But both gates are *selector-scoped*: prose-contract filters `.prose-site*`, link-contract
filters `.section-head`/`.link*`. Proven empirically in a sandbox copy of the two suites: a
new `.text-caption` class carrying a fifth type size (12px), a third weight (700), a
literal hex (`#333333`), a new tracking value, a 6px border-radius and a colourless
`border-top: 3px solid` passes all 21 tests; and mutating the shipped `.text-body` to 20px
and `.text-label` to `font-weight: 700 ! important` also passes all 21. The four role
classes that *define* the four-size/two-weight budget are ungated, and `03-09-SUMMARY.md`
explicitly names these two suites as "the proof no budget widened" when specifying the
remedy for the open optical items.

**The featured slot's third state is under-wired.** It handles absent/draft-in-dev/
published correctly as far as *which* branch renders, and the dev/prod divergence is
intentional and correctly tested (Playwright asserts state-agnostic structure,
`prerender.test.ts` asserts the interim copy against real build output). But the published
branch drops the `draft` prop and uses a raw `<a>` for an internal route — the two things
Phase 4 will trip over.

Cross-surface divergence (focus area 2) is otherwise good. All thirteen `link-quiet` back
links across both locales carry `inline-block py-xs` and every one of them has a measured
`>= 24px` height assertion somewhere in the suite (`landing.spec` b, `cv.spec` e,
`writing-index.spec` A3, `writing-routing.spec`, `writing-not-found.spec`). The one gap is
that the A2 site-root home-link sweep reached `/cv`, `/writing`, `/texte` and `/type` but
not `app/not-found.tsx`, whose only exit points at an index that is empty in production.

Test quality (focus area 5) is good on measured values — the nameplate is asserted against
the real 139.2px curve, not the 180px ceiling, and `page.emulateMedia({reducedMotion})` is
called before `page.goto()` in all three places it is used. The Wave 3 `expect.poll()` flake
fix is sound rather than masking: it still requires the trail to grow past 10 layers *and*
to settle back to `none`, so a broken trail still fails. It does widen the timing contract
from ~160ms to 5s, which is recorded below as Info rather than a defect.

Out of scope as instructed and deliberately not flagged: `POSITIONING_PLACEHOLDER` /
`Developer.` (D-08), the four-size/two-weight budget itself, the absence of icons, `/cv`
being a stub, `use-prefers-reduced-motion.ts:23`'s deferred lint error, and Phase 2's open
CR-01.

---

## Critical Issues

### CR-01: The production 404 page has no `<title>` — WCAG 2.4.2 (Level A) failure on every unmatched URL

**File:** `app/not-found.tsx:23-43` (root cause), `next.config.ts:4-6` (missing wiring)

**Issue:** `app/not-found.tsx` renders its own `<html>`/`<body>` but cannot export
`metadata`, and the Next-injected default root layout for `/_not-found` declares no title
either. The result, measured against the shipped build:

```
$ for f in .next/server/app/*.html; do grep -c '<title' $f; done
_global-error.html  1
_not-found.html     0     <-- the only route with no title
cv.html             1
index.html          1
texte.html          1
type.html           1
writing.html        1
```

Confirmed at runtime against `npx next start` on the production build:

```
GET http://localhost:3111/nope  ->  404
document.title  === ""
document.documentElement.lang === "en"      (survives via parser error recovery)
```

`document.title` being empty means the browser tab, the history entry, the bookmark title
and every assistive-technology page announcement fall back to the raw URL. WCAG 2.1 SC
2.4.2 *Page Titled* is Level A — the same conformance level as SC 3.1.1, which is the
failure this file's own header comment cites as its reason to exist. The site already
holds itself to 2.5.8 (AA) and 1.4.11 across the whole phase, so this is below the
project's own stated bar, and Phase 6's `FIND-02` makes it publicly indexable.

No test covers it: `tests/writing-not-found.spec.ts:60-69` asserts `lang`, the `h1`, the
body copy and the back link, but never the title; `tests/build/prerender.test.ts`'s
`walkHtmlRoutes` reads `_not-found.html` into its route map and only scans it for draft
titles.

**Fix:** Next 16.3.3 ships the mechanism for exactly this case
(`node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js:286-312`):
`global-not-found` replaces the injected default layout with an empty stub, so the file
owns the document and can export route metadata.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  experimental: { globalNotFound: true },
};
```

```tsx
// app/global-not-found.tsx  (renamed from app/not-found.tsx)
export const metadata: Metadata = {
  title: `${UI.en.notFoundHeading} — Guillem Gelabert`,
  robots: { index: false },
};
```

If the experimental flag is unacceptable, the fallback is to delete the `<html>`/`<body>`
from `app/not-found.tsx` and accept Next's default layout — but that loses `lang` and the
three font variables entirely, which is strictly worse. Do not ship the current shape.

Add the missing gates alongside the fix:

```ts
// tests/build/prerender.test.ts
test("the global 404 carries a title and exactly one <html>/<body>", async () => {
  const html = (await getRoutes()).get("_not-found")!;
  assert.match(html, /<title>[^<]+<\/title>/, "/_not-found must carry a page title");
  assert.equal(html.match(/<html/g)?.length, 1);
  assert.equal(html.match(/<body/g)?.length, 1);
});
```

```ts
// tests/writing-not-found.spec.ts, inside the UNMATCHED_PATHS loop
expect(await page.title()).not.toBe("");
```

---

## Warnings

### WR-01: Every served 404 is invalid HTML — nested `<html>` and `<body>`, on a false premise stated in the file's own comment

**File:** `app/not-found.tsx:16-17` (the comment), `:25-41` (the markup)

**Issue:** The header comment states:

> It owns its own `<html>`/`<body>` and re-declares the font variables, because with two
> root layouts under (en)/ and (de)/ no layout wraps this file.

The second clause is false. With `experimental.globalNotFound` off — the default, and this
repo's setting — `next-app-loader` inserts `defaultLayoutPath` for the `/_not-found` route
whenever no root layout applies. That module is literally:

```js
function DefaultLayout({ children }) {
  return <html><body>{children}</body></html>;   // no lang, no className
}
```

So the shipped bytes are:

```html
<!DOCTYPE html><html><head>…</head><body><div hidden></div>
  <html lang="en" class="humane_… newsreader_… ibm_plex_mono_…">
    <body><main class="flex min-h-screen …">…</main></body>
  </html>
</body></html>
```

`.next/server/app/_not-found.html` is the only one of the seven prerendered routes with
`<html` and `<body` counts of 2. Browsers recover: the HTML parser's "in body" rules copy
the nested element's attributes onto the existing root, so `document.documentElement.lang`
does read `"en"` and the fonts do resolve (measured: `h1` computes to
`humane, "humane Fallback", Impact, sans-serif` at 67.2px). That recovery is why
`tests/writing-not-found.spec.ts:62`'s `lang` assertion passes over the top of the defect —
the test measures the repaired DOM, not the served document. Anything that is not a full
HTML5 parser (validators, link-preview fetchers, HTML sanitisers, `curl | xmllint`) sees
nested `html`/`body`, and the recovery is error handling rather than a contract.

**Fix:** Same fix as CR-01 — `experimental.globalNotFound: true` plus renaming the file to
`app/global-not-found.tsx`, which swaps the injected layout for an empty stub. Then correct
the header comment: the premise to state is "`global-not-found` replaces the default root
layout, so this file owns the document", not "no layout wraps this file". Assert the tag
counts in `tests/build/prerender.test.ts` (snippet in CR-01) so the premise cannot silently
become false again.

---

### WR-02: `FeaturedSlot` drops the `draft` prop, so a draft case study renders on `/` with no draft marker in dev

**File:** `components/landing/featured-slot.tsx:50`

**Issue:**

```tsx
<PostMeta locale="en" date={entry.frontmatter.date} switchHref={null} />
```

`draft` is omitted. Every other call site passes it —
`app/(en)/writing/page.tsx:73`, `app/(de)/texte/page.tsx:80`,
`app/(en)/writing/[slug]/page.tsx:91`, `app/(de)/texte/[slug]/page.tsx:89` — all
`draft={entry.frontmatter.draft}`. `PostMeta` computes
`draft === true && showDrafts()`, so an omitted prop is `undefined` and the marker never
prints.

This is precisely the state focus area 3 asks about. The featured slot resolves through
`publishedFor("en")`, and in dev `showDrafts()` is always `true`, so the moment Phase 4
creates `content/the-chart-therefore-changes.mdx` with `draft: true` — which
`tests/landing.spec.ts:326-337` and `tests/build/prerender.test.ts:272-275` both name as
the normal authoring path — the landing renders the case study as if it were published
while `/writing` renders the identical entry with a "Draft" marker beside it. The author
sees two contradictory answers on two pages for the same file, on the surface where it
matters most.

Phase 2's WR-07 fix exists to make the draft rule a single exported predicate. That is
undermined not by restating the predicate but by simply not feeding it its input.

**Fix:**

```tsx
<PostMeta
  locale="en"
  date={entry.frontmatter.date}
  switchHref={null}
  draft={entry.frontmatter.draft}
/>
```

Consider also making `draft` a required prop on `PostMetaProps` so omission is a type
error rather than a silent `undefined`:

```ts
type PostMetaProps = {
  locale: Locale;
  date: string;
  switchHref: string | null;
  draft: boolean | undefined;   // required key, optional value
};
```

---

### WR-03: `FeaturedSlot` uses a raw `<a>` for an internal route — the one link Phase 4 activates does a full document load

**File:** `components/landing/featured-slot.tsx:41`

**Issue:**

```tsx
<a className="link-quiet" href={postPath("en", entry.slug)}>
```

This is internal navigation to `/writing/<slug>` written as a bare anchor. Every other
internal link in the repo uses `next/link`: both indexes, both `[slug]` templates, all
three not-found boundaries, `/cv`, `/type`, `LanguageSwitch`, and `ContentsNav`'s
`kind: "route"` branch. The only other raw `<a>` elements are `work-list.tsx:30` (external
absolute URLs — correct) and `contents-nav.tsx:49` (hash fragments — correct and
documented).

This is not a house-style question: `03-04-SUMMARY.md:89-95` records ESLint's
`@next/next/no-html-link-for-pages` flagging exactly this bug in `/type` during Wave 2, and
the executor fixing it to `Link` before commit. It went undetected here because the href is
a computed expression (`postPath("en", entry.slug)`), which the rule cannot statically
resolve — `npx eslint` is clean today.

Consequence when Phase 4 publishes: no route prefetch, a full document navigation instead
of a client transition, and the trail/provider state torn down and rebuilt. This is the
slot's only interactive affordance and the whole reason it was built ahead of the content.

**Fix:**

```tsx
import Link from "next/link";
…
<Link className="link-quiet" href={postPath("en", entry.slug)}>
  {entry.frontmatter.title}
</Link>
```

`tests/build/prerender.test.ts:289-301` (`the interim featured headline carries no link`)
is unaffected — it asserts the *absence* of `<a` in the interim state, and `Link` still
renders an `<a>` in the published state.

---

### WR-04: The type/spacing budget gate is blind to the four classes that define the budget — proven, not theorised

**File:** `tests/unit/link-contract.test.ts:22-29, 51-73`, `tests/unit/prose-contract.test.ts:17, 19-58`

**Issue:** Both suites derive their block set by selector prefix:

```ts
// prose-contract.test.ts:17
const proseBlocks = allBlocks.filter((b) => b.selector.startsWith(".prose-site"));

// link-contract.test.ts:22-29
const linkBlocks = allBlocks.filter((b) => … s.startsWith(".section-head")
  || s.startsWith(".link-quiet") || s.startsWith(".link"));
```

Nothing in either suite inspects `.text-display`, `.text-heading`, `.text-body` or
`.text-label` — the four classes that *are* the four-size/two-weight budget. Only
`.text-standfirst` has a check (prose-contract test (i)) and only the two `clamp()` curves
are pinned (tests (h)/(j)).

Verified empirically against sandbox copies of `app/globals.css` plus both suites, run with
`node --test`:

*Probe 1 — a new class:* appending

```css
.text-caption {
  font-size: 12px;          /* fifth type size   */
  font-weight: 700;         /* third weight      */
  color: #333333;           /* literal hex       */
  letter-spacing: 0.09em;   /* third tracking    */
  border-radius: 6px;       /* rounded corner    */
  border-top: 3px solid;    /* third rule weight, no colour token */
}
```

→ **21/21 pass, 0 fail.**

*Probe 2 — mutating the shipped classes:* `.text-body { font-size: 20px }` and
`.text-label { font-weight: 700 ! important }` → **21/21 pass, 0 fail.**

link-contract test (b) is titled *"type budget: four sizes and two weights, Phase 3 adds
none"* and its failure message reads *"the budget is four sizes total"* — both claims are
broader than what the test inspects. This matters beyond the test name:
`03-09-SUMMARY.md`'s open-item table specifies the remedy for three unresolved optical
questions as "more space, using the existing seven tokens. **NOT a fifth type size.**
`tests/unit/link-contract.test.ts` + `tests/unit/prose-contract.test.ts` are the proof no
budget widened." That proof does not exist.

The nesting-awareness half of the extraction is fine — `extractBlocks`'s `parent` argument
survived intact and prose-contract test (k) exercises it directly against a synthetic
nested violation. The gap is scope, not parsing.

**Fix:** Add one whole-file budget test that starts from `allBlocks` with an explicit
exclusion for `@theme` (where literal values belong) rather than an inclusion list of
selectors:

```ts
// tests/unit/prose-contract.test.ts
test("(m) the whole stylesheet stays inside the four-size / two-weight budget", () => {
  const styleBlocks = allBlocks.filter((b) => !b.selector.startsWith("@"));
  const SIZES = new Set([
    "14px", "18px", "inherit",
    "clamp(3.5rem, 1.5rem + 8vw, 11.25rem)",
    "clamp(2rem, 1rem + 4vw, 4.5rem)",
  ]);
  const WEIGHTS = new Set(["400", "530", "inherit"]);
  const TRACKING = new Set(["0.04em", "0.035em", "0", "normal"]);

  for (const block of styleBlocks) {
    for (const [prop, value] of declarationsOf(block)) {
      if (prop === "font-size") {
        assert.ok(SIZES.has(value), `fifth type size "${value}" in "${block.selector}"`);
      }
      if (prop === "font-weight") {
        assert.ok(WEIGHTS.has(value), `third weight "${value}" in "${block.selector}"`);
      }
      if (prop === "letter-spacing") {
        assert.ok(TRACKING.has(value), `new tracking "${value}" in "${block.selector}"`);
      }
      if (prop === "border-radius") {
        assert.equal(value, "0", `rounded corner in "${block.selector}"`);
      }
      assert.ok(
        !/#[0-9a-fA-F]{3,8}\b/.test(value),
        `literal hex "${value}" outside @theme in "${block.selector}"`,
      );
    }
  }
});
```

and retitle link-contract test (b) to what it actually checks (`.section-head`/`.link`/
`.link-quiet` are Label-role only).

---

### WR-05: The global 404's only exit is `/writing`, which is empty in production — the A2 home-link sweep skipped this surface

**File:** `app/not-found.tsx:36`

**Issue:**

```tsx
<Link href={indexPath("en")} className="text-label link-quiet inline-block py-xs">
  {UI.en.backLink}          {/* "← Writing" */}
</Link>
```

This is the *global* boundary. It is reached by `/nope`, `/blog`, `/de/texte`, every typo
and every stale inbound link — by definition, visitors who were not looking for the writing
index. Amendment A2 added `← Guillem Gelabert` → `/` to `/cv`, `/writing`, `/texte` and
`/type` precisely to close dead ends created by one-way navigation. The one surface where
the visitor has *no* other context, no nav and no header got the segment-scoped back link
instead.

Compounding it: in production all three content fixtures are `draft: true`, so
`tests/build/prerender.test.ts:102-113` asserts `/writing` ships `"Nothing published here
yet."`. The shipped journey is therefore: mistyped URL → *Not found* → click the only link
→ an empty page → still no route to the site root.

The two segment boundaries (`app/(en)/writing/not-found.tsx`,
`app/(de)/texte/not-found.tsx`) are correct as they stand: a visitor there *was* reading
that index. Only the global one is wrong.

**Fix:**

```tsx
<Link href="/" className="text-label link-quiet inline-block py-xs">
  {UI.en.homeLink}
</Link>
```

`UI.en.homeLink` already exists (`lib/locales.ts:74`) and is documented as the site-root
back link. Update `tests/writing-not-found.spec.ts`'s `UNMATCHED_PATHS` assertions
(`:66-69`) and remove the `/nope` row from `LOCALE_CASES` (`:35-41`), which currently
asserts the wrong destination twice — see IN-07.

---

### WR-06: `POSITIONING_PLACEHOLDER` is not the single source it is documented to be — `/cv` and `/type` ship a hardcoded duplicate

**File:** `app/(en)/layout.tsx:12`, `lib/work.ts:47-55`,
`.planning/phases/03-work-list-landing-skeleton/deferred-items.md:24-29`

**Issue:** `lib/work.ts`'s doc comment, `app/(en)/page.tsx:19-27`'s comment and
`deferred-items.md` §1 all state the same invariant. The deferred-items record is the most
explicit:

> **Where it is consumed.** Exactly two places, both from the one constant […] supplying
> the real sentence is a one-line edit to `lib/work.ts` (Pitfall 6) — no second file to
> remember.

There is a third place, and it is a hardcoded literal:

```tsx
// app/(en)/layout.tsx:12
description: "Developer.",
```

Measured against the shipped build:

```
index    <meta name="description" content="Developer."   <- from POSITIONING_PLACEHOLDER
cv       <meta name="description" content="Developer."   <- from the layout literal
type     <meta name="description" content="Developer."   <- from the layout literal
```

`/cv` sets its own title but no description, and `/type` is a Client Component so it can
export no metadata at all — both inherit the layout's literal. When the user writes the
real positioning sentence into `lib/work.ts`, `/` updates and `/cv` and `/type` keep
serving `"Developer."` as their share-preview text. `app/(de)/layout.tsx:12` carries a
fourth copy, `"Entwickler."`, which is what `/texte` would fall back to if its own
description were ever removed.

The two gates that exist (`tests/landing.spec.ts:125-143` equality,
`tests/build/prerender.test.ts:223-236` equality against the imported constant) both scope
to `/` only, so neither notices. The HOME-01 tripwire is therefore only two-thirds
effective at exactly the moment `FIND-02` flips `robots` to indexable.

**Fix:** Point the layout at the constant so there really is one source:

```tsx
// app/(en)/layout.tsx
import { POSITIONING_PLACEHOLDER } from "@/lib/work";
export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: "Guillem Gelabert",
  description: POSITIONING_PLACEHOLDER,
  robots: { index: false },
};
```

then extend the production gate to the routes that inherit it:

```ts
// tests/build/prerender.test.ts
for (const key of ["", "cv", "type"]) {
  const match = routes.get(key)!.match(/<meta name="description" content="([^"]*)"/);
  assert.ok(match, `route "${key || "/"}" must carry a meta description`);
  assert.equal(match![1], POSITIONING_PLACEHOLDER);
}
```

and correct `deferred-items.md` §1's "Exactly two places" to name every consumer. Decide
explicitly whether `app/(de)/layout.tsx`'s German default should track the constant or stay
independent — right now it is neither documented nor gated.

---

## Info

### IN-01: The `!important` gate misses the spaced form, which is valid CSS

**File:** `tests/unit/prose-contract.test.ts:61`, `tests/unit/link-contract.test.ts:236`

**Issue:** Both suites check `!css.includes("!important")`. `font-weight: 700 ! important`
is valid CSS (whitespace between `!` and the keyword is permitted by the grammar) and
browsers honour it. Confirmed in the WR-04 probe: 21/21 pass with
`.text-label { font-weight: 700 ! important }` in the stylesheet.

**Fix:** `assert.ok(!/!\s*important/i.test(css), "…")` in both places.

---

### IN-02: The Amendment A1 source-fact gate uses literal substring matching

**File:** `tests/unit/link-contract.test.ts:255-276`

**Issue:** Test (i) asserts `!landingPageSource.includes('"use client"')`. There is no
Prettier config or `.editorconfig` in the repo, so nothing normalises quote style —
`'use client'` with single quotes is a valid directive that this assertion accepts. The
mirror problem: `!landingPageSource.includes("robots")` fails if the word ever appears in a
comment in `app/(en)/page.tsx`, which is a brittle way to state "declares no robots field".

**Fix:** Match the directive shape rather than one spelling, and scope the robots check to
a declaration:

```ts
assert.ok(!/^\s*["']use client["']/m.test(landingPageSource), "…");
assert.ok(!/\brobots\s*:/.test(landingPageSource), "…");
```

---

### IN-03: link-contract's property matchers are broader than the properties they name

**File:** `tests/unit/link-contract.test.ts:22-29, 118-119, 84-91`

**Issue:** Three over-broad matchers, none of which fires today but each of which produces
a wrong message the first time it does:

- `widthPropertyPattern = /^border(-[a-z]+)?(-width)?$/` matches `border-radius` and
  `border-collapse`. A legitimate `border-radius: 0` inside `.link-quiet` would fail with
  `"border-radius: 0" declares no length component`.
- The `linkBlocks` filter's `s.startsWith(".link")` matches any future class beginning
  `.link…` (`.linkedin-badge`), silently dragging it under the link contract's budget.
- Test (c)'s `background` allowlist has no `none` entry, so `background: none` — a value
  already shipped at `app/globals.css:281` — would be rejected as a "literal".

**Fix:** Anchor the width matcher to real width properties
(`/^border(-(top|right|bottom|left))?(-width)?$/`), use exact-selector or word-boundary
matching for `.link`, and add `"none"` and `"transparent"` to the allowed colour values.

---

### IN-04: `tests/cv.spec.ts` navigates to `/cv` twice for the status assertion

**File:** `tests/cv.spec.ts:9-17`

**Issue:** `beforeEach` runs `page.goto("/cv")`, then test (a) runs `page.goto("/cv")`
again purely to capture the response object the first navigation discarded. Two full
navigations per run for one status code.

**Fix:** Capture the response in `beforeEach` into a describe-scoped variable, or move test
(a) out of the `beforeEach`'s scope with `test.describe`.

---

### IN-05: `ROOT_PX = 16` is an assumed value in the file whose header disclaims assumed values

**File:** `tests/landing-viewport.spec.ts:20-34`

**Issue:** The header comment states values are "asserted against the real `clamp()`
formula via `clampPx()`, never against a ceiling assumed from the plan", but `clampPx`
converts `rem` using a hardcoded `16`. It is correct for Chromium's default, so the test
passes, but the root font size is the one input the spec measures nothing about. It is a
smaller instance of the exact class of error Phase 1's `viewport.spec.ts` was corrected for.

**Fix:**

```ts
const rootPx = await page.evaluate(
  () => parseFloat(getComputedStyle(document.documentElement).fontSize),
);
```

and thread it into `clampPx` instead of the module constant.

---

### IN-06: The `expect.poll()` flake fix widens the trail's timing contract from ~160ms to 5s

**File:** `tests/smear-heading.spec.ts:74-79, 89-94`, `tests/landing-trail.spec.ts:96-127`

**Issue:** The fix is sound, not masking — both polls still require the trail to grow past
10 layers *and* to settle back to `none`, so a trail that never draws or never settles
still fails, and polling the live DOM is the right shape for a CPU-time-bound rAF loop
under parallel workers. The cost is that the assertion no longer constrains *when*: a
regression that delayed the first smeared frame by three seconds — obviously broken to a
visitor — now passes. `03-07-SUMMARY.md:94-101` documents the change honestly, including
the acceptance-criteria conflict.

**Fix (optional):** Keep the poll but bound it, e.g. record `Date.now()` before
`scrollBy` and assert the resolving sample landed within ~1s, while leaving the poll
timeout generous so contention does not flake it.

---

### IN-07: `/nope` is asserted twice, once through a table that does not describe it

**File:** `tests/writing-not-found.spec.ts:20-42, 48`

**Issue:** `/nope` appears in `UNMATCHED_PATHS` (JS-disabled, the global boundary) *and* as
a third row of `LOCALE_CASES`, where it is run by a test titled `"an unknown slug at /nope
renders the localised not-found copy"`. `/nope` is not a slug, has no locale and reaches no
localised boundary; the comment at `:15-19` acknowledges this and justifies it by the copy
happening to coincide. Two of the three assertions in the `LOCALE_CASES` test are then
duplicates of the `UNMATCHED_PATHS` test. If WR-05 is fixed, the `LOCALE_CASES` row becomes
actively wrong (it asserts `href="/writing"`).

**Fix:** Drop the `/nope` row from `LOCALE_CASES` and move its one unique assertion (the
back link's `link-quiet` class and 24px target height) into the `UNMATCHED_PATHS` loop.

---

### IN-08: `prerender.test.ts` scans raw HTML for banned words and uses opaque non-null assertions

**File:** `tests/build/prerender.test.ts:319-325, 245-252, 116-117, 180-181`

**Issue:** Two small robustness gaps in an otherwise strong build-tier suite:

- The banned-marker loop runs `new RegExp(banned, "i")` over the entire prerendered
  document, which includes the RSC flight payload, chunk filenames and every class name —
  not the rendered copy the rule is about. The Playwright twin
  (`tests/landing.spec.ts:403-414`) correctly uses `innerText`. A match here would report a
  "marker word in production" for a `_next/static/chunks/…` filename.
- `routes.get(key)!` is used in eight places. `getRoutes()` only produces the crafted
  `NO_BUILD_MESSAGE` when `.next/server/app` is entirely absent; a build that succeeded but
  failed to emit `/cv` yields `TypeError: Cannot read properties of undefined (reading
  'match')` with no route name.

**Fix:** Strip tags (or scope to a `<main>…</main>` slice) before the marker scan, and add
a small `mustGet(routes, key)` helper that throws a named error.

---

### IN-09: `/type` is still a whole-page Client Component, bypassing the `SmearTitle` leaf this phase established

**File:** `app/(en)/type/page.tsx:1-11`

**Issue:** Plan 03-01 widened `SmearTitle`'s `as` union to `h1 | h2 | h3` specifically so
pages need not become Client Components to carry the trail, and 03-03 applied that to `/`.
`/type` still opens with `"use client"` and calls `useSmearHeading` five times directly.
Two ways to register a trail heading now coexist, and link-contract test (i)'s source-fact
gate covers only `app/(en)/page.tsx`. The concrete consequence is that `/type` can export no
`metadata`, so it has no canonical and inherits the description discussed in WR-06.

**Fix (optional, or record as deliberate):** Replace the five `useSmearHeading` refs with
`<SmearTitle as="h1"|"h2">` and drop the directive, which also lets `/type` declare its own
title and canonical. If it is deliberately left as the low-level calibration reference, say
so in the file header — right now nothing distinguishes it from an unconverted leftover.

---

### IN-10: The target-size class string and its justification are duplicated nine times

**File:** `app/(en)/cv/page.tsx:26`, `app/(en)/writing/page.tsx:36`,
`app/(de)/texte/page.tsx:43`, `app/(en)/writing/[slug]/page.tsx:78`,
`app/(de)/texte/[slug]/page.tsx:76`, `app/(en)/writing/not-found.tsx:18`,
`app/(de)/texte/not-found.tsx:18`, `app/not-found.tsx:36`,
`components/landing/contents-nav.tsx:32`

**Issue:** `"text-label link-quiet inline-block py-xs"` appears verbatim nine times, and the
"18.2px line box → 26.2px with py-xs" WCAG 2.5.8 justification is copy-pasted as a comment
in five of them. Only `contents-nav.tsx` names it (`LINK_CLASSNAME`). The margin is 2.2px,
so dropping `py-xs` on any one surface is a silent conformance regression.

Noted as Info rather than Warning because the risk is genuinely gated: every one of the
thirteen resulting links has a measured `getBoundingClientRect().height >= 24` assertion in
`landing.spec.ts` (b), `cv.spec.ts` (e), `writing-index.spec.ts` (A3),
`writing-routing.spec.ts` and `writing-not-found.spec.ts`. Coverage is complete.

**Fix:** Export the constant once — e.g. `export const QUIET_LABEL_LINK` in `lib/locales.ts`
or a small `lib/ui.ts` — and let the justification comment live with it.

---

### IN-11: Two small naming / derivable-state smells in the landing components

**File:** `components/landing/contents-nav.tsx:4-8, 42-59`, `components/landing/section-stub.tsx:1-4, 12`

**Issue:**

- `NavEntry.kind: "anchor" | "route"` duplicates information already carried by `href` —
  `href.startsWith("#")` is the same predicate. A future entry with a mismatched pair
  (`{ href: "#work", kind: "route" }`) would render `<Link href="#work">`, which behaves
  differently from the native fragment navigation the file's comment argues for.
- `SectionStubProps.state: string` reads like a state-machine value but holds standfirst
  copy. `standfirst` (matching the class it renders into) says what it is.

**Fix:** Derive the branch (`entry.href.startsWith("#") ? <a> : <Link>`) and drop `kind`;
rename `state` to `standfirst`. Both are two-line changes with no rendered-output effect —
`tests/landing.spec.ts` (a) and (u) cover the result.

---

_Reviewed: 2026-08-31T14:32:36Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
