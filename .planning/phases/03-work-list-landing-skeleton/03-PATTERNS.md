# Phase 3: Work List & Landing Skeleton — Pattern Map

**Mapped:** 2026-08-31
**Files analysed:** 25 (12 new, 13 modified)
**Analogs found:** 23 / 25 (2 partial — no analog for `<ol role="list">` or `<nav aria-label>`)

> **How to use this file.** Every excerpt below is copied verbatim from a file that is
> shipped and green today. Line numbers are as of 2026-08-31 (post Phase-2 code review,
> 16 WR fixes landed). When a plan says "follow the shipped pattern", it means *these
> lines*, not a paraphrase.

---

## House rules extracted from the shipped code

These hold across every file in `app/`, `components/` and `lib/`. They are not negotiable
per-file conventions; they are what the repo looks like.

| Rule | Evidence |
|------|----------|
| **Import order:** `import type { Metadata } from "next"` → react → `next/link` → `@/lib/*` → `@/components/*` | `app/(en)/writing/page.tsx:1-8` |
| **Every non-obvious decision carries a block comment naming its ID** (`D-05`, `WR-07`, `ASVS V4`, `WR-13`) and explaining the failure it prevents, not what the code does | `lib/content.ts:20-24`, `:113-121`, `:164-170`; `components/post-meta.tsx:14`; `components/language-switch.tsx:10-13` |
| **Internal links are `next/link` `<Link>`; `href` comes from a helper (`indexPath`/`postPath`), never a literal path string** | 8 call sites, all via `Link`; `app/(en)/writing/page.tsx:46`, `app/(en)/writing/[slug]/page.tsx:73` |
| **`<main>` shell for a full page:** `className="flex flex-col gap-3xl px-lg py-3xl"` — verbatim, twice already | `app/(en)/writing/[slug]/page.tsx:71`, `app/(en)/type/page.tsx:13` |
| **Tailwind class order is alphabetical-ish within a group, `max-w-prose` before `text-*`** | `app/(en)/writing/page.tsx:37,38,49` — always `"max-w-prose text-standfirst"`, never the reverse |
| **Server Components by default.** Only three files carry `"use client"`: `smear-title.tsx`, `use-smear-heading.ts`, `smear-heading-provider.tsx` — plus the two Phase-1 pages this phase de-clients | `grep -rn '"use client"' app components` |
| **Test files open with a `// Covers <REQ-ID>:` comment** stating the requirement and *why the assertion is shaped the way it is* — usually recording a defect the naive version missed | every `tests/*.spec.ts` and `tests/unit/*.test.ts` |

---

## File Classification

### New files

| New file | Role | Data flow | Closest analog | Match |
|---|---|---|---|---|
| `lib/work.ts` | data module | build-time constant | `lib/locales.ts` | **exact** |
| `app/(en)/cv/page.tsx` | route/page (RSC) | static request-response | `app/(en)/writing/[slug]/page.tsx` | **exact** |
| `components/landing/work-list.tsx` | component (RSC) | list render over data | `app/(en)/writing/page.tsx:41-65` | role-match |
| `components/landing/featured-slot.tsx` | component (RSC) | derived two-state branch | `app/(en)/writing/page.tsx:35-66` | **exact** |
| `components/landing/section-stub.tsx` | component (RSC) | static copy | `app/(en)/writing/page.tsx:36-39` | **exact** |
| `components/landing/contents-nav.tsx` | component (RSC) | static nav | `components/language-switch.tsx` | partial (no `<nav>` exists) |
| `tests/landing.spec.ts` | test (playwright) | integration | `tests/writing-index.spec.ts` | **exact** |
| `tests/landing-viewport.spec.ts` | test (playwright) | integration, parameterised | `tests/fixture-viewport.spec.ts` + `tests/viewport.spec.ts` | **exact** |
| `tests/landing-trail.spec.ts` | test (playwright) | integration, motion | `tests/smear-heading.spec.ts` + `tests/reduced-motion.spec.ts` | **exact** |
| `tests/cv.spec.ts` | test (playwright) | integration | `tests/type-specimen.spec.ts` | **exact** |
| `tests/unit/work.test.ts` | test (node --test) | pure data assertions | `tests/unit/dates.test.ts` | **exact** |
| `tests/unit/link-contract.test.ts` | test (node --test) | source-parse gate | `tests/unit/prose-contract.test.ts` | **exact** |

### Modified files

| Modified file | Role | Data flow | Change | Pattern source |
|---|---|---|---|---|
| `app/(en)/page.tsx` | route/page | client → **async RSC** | full replacement (A1) | `app/(en)/writing/[slug]/page.tsx:10-14, 54-95` |
| `app/globals.css` | stylesheet/config | — | +3 classes | itself: `:46-57`, `:70-93`, `:294-304` |
| `components/smear-title.tsx` | component (client leaf) | — | one-line union widen | itself `:5-9` |
| `lib/locales.ts` | data module | — | `+homeLink` in `UiCopy` + both `UI` entries | itself `:35-77` |
| `app/(en)/writing/page.tsx` | route/page | — | A2 back link, A3 `.link-quiet` | `app/(en)/writing/[slug]/page.tsx:72-75` |
| `app/(de)/texte/page.tsx` | route/page | — | A2 + `hrefLang="en"`, A3 | same; `components/language-switch.tsx:20` for `hrefLang` |
| `app/(en)/writing/not-found.tsx` | route boundary | — | A3 `.link-quiet` | itself `:18-20` |
| `app/(de)/texte/not-found.tsx` | route boundary | — | A3 `.link-quiet` | itself `:18-20` |
| `app/not-found.tsx` | root boundary | — | A3 `.link-quiet` | itself `:36-38` |
| `components/language-switch.tsx` | component (RSC) | — | A3 `.link-quiet`, **no** `inline-block py-xs` | itself `:20` |
| `app/(en)/type/page.tsx` | route/page | — | A4 one specimen section | itself `:14-24` |
| `tests/build/prerender.test.ts` | test (node --test) | build-output read | extend | itself `:177-194` |
| `tests/smear-heading.spec.ts` · `tests/reduced-motion.spec.ts` | test | — | comment-only update (`:5-9` / `:21-25` say `/` has nothing to scroll — no longer true) | — |

---

## Pattern Assignments

### `lib/work.ts` (data module, build-time constant)

**Analog:** `lib/locales.ts` — the shipped "typed const map exported from `lib/`, no
runtime, no fetch, no fs" module. `lib/content.ts` supplies the doc-comment register.

**Module shape** (`lib/locales.ts:35-66`) — a local `type` declaring the record, then a
single `export const` typed by it. The `type` is **not exported**; only the data is:

```ts
type UiCopy = {
  indexKicker: string;
  /**
   * The index's <meta name="description">. Deliberately NOT emptyBody: that
   * string is the n = 0 state's on-page copy, and reusing it told every
   * crawler and link-preview card that nothing is published regardless of how
   * many posts exist. Phase 6 flips robots to indexable, which is when a
   * stale description starts appearing in search results.
   */
  indexDescription: string;
  backLink: string;
  ...
};

export const UI: Record<Locale, UiCopy> = {
  en: {
    indexKicker: "Writing",
    indexDescription: "Essays and case studies on data journalism and visualisation.",
    backLink: "← Writing",
    ...
  },
```

**Note the deviation `lib/work.ts` must make:** `WorkEntry` **is** exported (the UI-SPEC's
contract block declares `export type WorkEntry`), unlike `UiCopy`. Justify it inline — the
components import it for their props type.

**Per-field trailing comment naming the decision ID** — this is the house register for a
data module. `lib/content.ts:8-16`:

```ts
export type PostFrontmatter = {
  title: string;
  standfirst: string;
  date: string; // ISO 8601, e.g. "2026-08-29"
  lang: Locale;
  translationKey: string;
  draft?: boolean;
  type?: "post" | "case-study";
};
```

**Constant-with-rationale pattern** — for `CASE_STUDY_SLUG` and `POSITIONING_PLACEHOLDER`,
copy the register of `lib/site.ts:1-17`, which is the repo's only other "one place a value
is written down" module:

```ts
/**
 * The one place the site's own origin is written down.
 *
 * It used to be `new URL("https://web-production-9cedb.up.railway.app")`
 * verbatim in both root layouts, and every rel="canonical" and every hreflang
 * alternate on every route resolves against it — exactly the class of value
 * where a stale hostname is silently wrong rather than loudly broken, with
 * nothing asserting the two copies matched.
 */
export const SITE_URL = new URL(...)
```

`POSITIONING_PLACEHOLDER` needs exactly this treatment (Pitfall 6: the string
`"Developer."` currently exists in `app/(en)/layout.tsx:12` and `app/(en)/page.tsx:13`).

---

### `app/(en)/page.tsx` (route/page — client → async Server Component)

**Analog:** `app/(en)/writing/[slug]/page.tsx`. Phase 2 shipped this exact migration and
left the reasoning in-file. Copy the comment as well as the shape.

**The de-clienting comment, verbatim** (`app/(en)/writing/[slug]/page.tsx:10-14`) — a
Phase-3 variant of this belongs at the top of the new `app/(en)/page.tsx`:

```tsx
// This route carries no client directive. Phase 1 marked whole pages as
// Client Components to reach the scroll-trail hook; doing that here would
// drag the compiled MDX module, its component imports and every Shiki token
// span into the client bundle and break `fs`. SmearTitle is the one client
// leaf that carries the trail instead.
```

**The current file, for reference on what is being removed** (`app/(en)/page.tsx:1-16`,
all 16 lines):

```tsx
"use client";

import { useSmearHeading } from "@/components/smear-heading/use-smear-heading";

export default function Home() {
  const headingRef = useSmearHeading<HTMLHeadingElement>();

  return (
    <main className="flex min-h-screen flex-col justify-center gap-md px-lg">
      <h1 ref={headingRef} className="text-display">
        Guillem Gelabert
      </h1>
      <p className="text-body">Developer.</p>
    </main>
  );
}
```

Three things go: `"use client"`, the `useSmearHeading` import + ref, and
`min-h-screen ... justify-center` (UI-SPEC *Aesthetic guardrails*).

**Static `metadata` export pattern.** The repo has both forms. Use the **static** one
(`app/(en)/layout.tsx:9-14`) since `/` takes no params:

```tsx
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: "Guillem Gelabert",
  description: "Developer.",
  robots: { index: false },
};
```

…but take the **`alternates.canonical` shape** from the function form
(`app/(en)/writing/page.tsx:10-23`) — this is the measured gap on `/` (C-2):

```tsx
export function generateMetadata(): Metadata {
  return {
    title: `${UI.en.indexKicker} — Guillem Gelabert`,
    description: UI.en.indexDescription,
    alternates: {
      canonical: indexPath("en"),
      languages: {
        en: indexPath("en"),
        de: indexPath("de"),
        "x-default": indexPath("en"),
      },
    },
  };
}
```

For `/`: `alternates: { canonical: "/" }` only — **no `languages` map** (the landing is
EN-only, UI-SPEC *Localisation*), **no `robots`** (inherited — Pitfall 5), **no
`metadataBase`** (the layout owns it).

**Async page + null-safe derived state** (`app/(en)/writing/[slug]/page.tsx:54-68`) — the
`await publishedFor` → `findBySlug` → branch shape the featured slot needs:

```tsx
export default async function WritingPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // SECURITY (ASVS V4): the allowlist runs before the dynamic import. Never
  // reorder — findBySlug against publishedFor("en") must resolve, and
  // notFound() must throw, before loadPostModule ever touches the slug.
  const entry = findBySlug(await publishedFor("en"), slug);
  if (!entry) notFound();
```

For the landing: same two calls, but **`null` is a valid state, not a 404** — never call
`notFound()`, and never call `loadPostModule` (RESEARCH Pattern 2, property 1).

**Page shell + header block** (`app/(en)/writing/[slug]/page.tsx:70-90`) — the `<main>`
class string and the nested `<header>` / `flex flex-col gap-*` composition:

```tsx
  return (
    <main className="flex flex-col gap-3xl px-lg py-3xl">
      <header className="flex flex-col gap-2xl">
        <Link href={indexPath("en")} className="text-label">
          {UI.en.backLink}
        </Link>
        <div className="flex flex-col gap-lg">
          <SmearTitle as="h1" className="text-heading">
            {entry.frontmatter.title}
          </SmearTitle>
          <div className="flex flex-col gap-md">
            <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
```

The landing's `<header>` is `gap-lg` (UI-SPEC), not `gap-2xl` — but the *nesting idiom*
(one flex column per gap value, never a margin) is exactly this.

---

### `components/landing/work-list.tsx` (component RSC, list render over data)

**Analog:** `app/(en)/writing/page.tsx:41-65` — the shipped `.map()` over entries with an
interposed separator and headline-as-link.

**The list + separator + headline-as-link pattern, verbatim:**

```tsx
        entries.map((entry, index) => (
          <Fragment key={entry.slug}>
            {index > 0 ? <hr /> : null}
            <article className="flex flex-col gap-lg">
              <SmearTitle as="h2" className="text-display">
                <Link href={postPath(locale, entry.slug)}>{entry.frontmatter.title}</Link>
              </SmearTitle>
              <div className="flex flex-col gap-md">
                <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
                {/* switchHref is always null here: the always-present
                    index-level language switch on the kicker line already
                    satisfies I18N-01's "index switcher always rendered"
                    rule. A second link inside the article would put a
                    competing affordance under a poster-scale headline —
                    the headline is the only link inside an <article>. */}
```

Four properties to carry over: `index > 0 ? … : null` for the separator; the
headline-wraps-the-link (never link-wraps-the-headline); the `key` on the outer element;
and the in-JSX comment stating *why the headline is the only link in the row*. The work
list keeps all four and swaps `<Fragment>`+`<hr>` for `<li>` + a `border-t` class
(UI-SPEC), and `<Link>` for a plain `<a>` (outbound absolute URL — see *No Analog Found*).

**Class-string composition for the conditional separator.** No shipped file conditionally
composes `className`; the repo has no `clsx`/`cn` helper and must not gain one. Use the
`+` concatenation shown in `03-RESEARCH.md` *The work-list row*:

```tsx
      className={
        "flex flex-col gap-sm" +
        (i > 0 ? " border-t border-rule pt-xl" : "")  // border-rule is NOT optional
      }
```

---

### `components/landing/featured-slot.tsx` (component RSC, derived two-state branch)

**Analog:** `app/(en)/writing/page.tsx:35-66` — the shipped `n === 0` / `n >= 1` branch.
Same structural problem: one component, two states, derived from the content pipeline, no
boolean flag anywhere.

```tsx
      {entries.length === 0 ? (
        <div className="flex flex-col gap-md">
          <p className="max-w-prose text-standfirst">{UI[locale].emptyHeading}</p>
          <p className="max-w-prose text-body">{UI[locale].emptyBody}</p>
        </div>
      ) : (
        entries.map((entry, index) => (
```

**Null-prop branch inside a component** (`components/language-switch.tsx:10-23`) — the
early-return shape, and the comment register for *why the absent state is absent rather
than disabled*:

```tsx
// Absent from the DOM entirely when no translation exists (D-07) — not
// greyed out, not disabled via an ARIA attribute, not a tooltip. A dead
// affordance advertises something that does not exist and is a known
// screen-reader trap.
export function LanguageSwitch({ from, href }: LanguageSwitchProps) {
  if (href === null) {
    return null;
  }
```

The featured slot's interim branch is the mirror image — it renders *instead of* returning
null — but the props type (`PostEntry | null`) and the `if (!entry) return (…)` guard-first
shape are the same.

**Published-state composition** (`components/post-meta.tsx:5-19`) — the props type and the
`switchHref: string | null` convention the published branch passes `null` to:

```tsx
type PostMetaProps = {
  locale: Locale;
  date: string;
  switchHref: string | null;
  draft?: boolean;
};

// Date, language switch and dev-only draft marker on one Label-role line.
export function PostMeta({ locale, date, switchHref, draft }: PostMetaProps) {
  // One predicate, imported — never a second inline copy of D-11 (WR-07).
  const showDraftMarker = draft === true && showDrafts();
```

---

### `components/landing/section-stub.tsx` (component RSC, static copy)

**Analog:** `app/(en)/writing/page.tsx:36-39` — the UI-SPEC prescribes *"the exact shape the
shipped `/writing` empty state already uses"*. It is these four lines:

```tsx
        <div className="flex flex-col gap-md">
          <p className="max-w-prose text-standfirst">{UI[locale].emptyHeading}</p>
          <p className="max-w-prose text-body">{UI[locale].emptyBody}</p>
        </div>
```

Two props (state line, body line), Standfirst then Body, both `max-w-prose`, wrapped in one
`flex flex-col gap-md`. **Copy strings live in the landing module, not `lib/locales.ts`** —
UI-SPEC *Localisation*: the landing is EN-only and only `homeLink` crosses into `UI`.

---

### `app/(en)/cv/page.tsx` (route/page RSC, static)

**Analog:** `app/(en)/writing/[slug]/page.tsx:70-90` for the shell (back link → `gap-2xl`
→ `SmearTitle as="h1" className="text-heading"` → body), plus `app/(en)/layout.tsx:9-14` for
the static `metadata` export form. The UI-SPEC's `/cv` block is a direct trace of that
header.

Excerpts already given above. Two `/cv`-specific rules from RESEARCH:
- **Declare only `title` and `alternates.canonical`.** `robots` is inherited (Pitfall 5:
  *"the string `robots` appearing anywhere outside the two root layouts"* is the warning sign).
- The back link is `← Guillem Gelabert` from `UI.en.homeLink`, `.link-quiet inline-block py-xs`.

---

### `app/globals.css` (stylesheet — add `.section-head`, `.link`, `.link-quiet`)

**Analog: the file itself.** The UI-SPEC's promise is *"every declaration is a value already
shipped in this file."* Here are the three source rules to copy from.

**`.section-head` ← `.prose-site h2` minus the two prose margins** (`app/globals.css:46-57`):

```css
.prose-site h2 {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.3;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 48px;      /* DROP — the landing's flex gap owns spacing */
  margin-bottom: 16px;   /* DROP */
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-ink);
}
```

**`.link` ← `.prose-site a`, verbatim including the reduced-motion wrapper**
(`app/globals.css:70-93`):

```css
.prose-site a {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.12em;
  text-decoration-color: currentColor;
}

.prose-site a:hover,
.prose-site a:focus-visible {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.prose-site a:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .prose-site a {
    transition: color 120ms ease-out, text-decoration-color 120ms ease-out;
  }
}
```

Note the **ordering**: rest → `:hover, :focus-visible` → `:focus-visible` outline →
`@media` transition block last, at file top level (not nested). `.link-quiet` is this with
`text-decoration: none` at rest and the underline restored in the hover block.

**The `border-t` full-ink trap, and the shipped fix** (`app/globals.css:294-304`) — this is
WR-06's scar tissue and Pitfall 1 verbatim. Read the comment before writing any border:

```css
/* The separator stroke, hoisted out of the prose scope. It used to live only
   under .prose-site, so the <hr> both indexes emit between entries fell
   through to Tailwind preflight's currentColor and rendered full-ink black —
   an 8x darker line than --color-rule, at the most visually prominent moment
   on the page, and a fourth rule weight the Prose Contract does not allow.
   Stroke only: the 48px margins are the prose scope's below, and on the
   indexes they come from the container's gap-2xl. */
hr {
  border: 0;
  border-top: 1px solid var(--color-rule);
}
```

**Consequence for the work-list separator:** `border-t` alone on the `<li>` reproduces the
exact defect. It must be `border-t border-rule` (utility) or a plain-CSS rule beside
`.section-head` written as `border-top: 1px solid var(--color-rule)`.

**Token reference** (`app/globals.css:4-22`) — the complete budget. Nothing new:

```css
@theme {
  --font-display: var(--font-humane), Impact, sans-serif;
  --font-body: var(--font-newsreader), serif;
  --font-mono: var(--font-ibm-plex-mono), ui-monospace, monospace;

  --color-paper: #ffffff;
  --color-ink: #000000;
  --color-accent: #C1272D;
  --color-surface-code: rgba(0, 0, 0, 0.04);
  --color-rule: rgba(0, 0, 0, 0.12);

  --spacing-xs: 4px;   --spacing-sm: 8px;   --spacing-md: 16px;  --spacing-lg: 24px;
  --spacing-xl: 32px;  --spacing-2xl: 48px; --spacing-3xl: 64px;
}
```

**Placement:** append after `.text-standfirst` (`:342-347`) and before the `body` rule
(`:349-352`). The role classes are the file's last content block; the three new classes
belong with them, not inside the prose section.

---

### `components/smear-title.tsx` (client leaf — one-line union widen)

**Analog: itself.** Current state, `:5-9` and `:11-17`:

```tsx
type SmearTitleProps = {
  as?: "h1" | "h2";
  className?: string;
  children: React.ReactNode;
};

// The only new client boundary in this phase. Phase 1 marked whole page
// files as Client Components to reach the scroll-trail hook; repeating
// that on a post route would drag the compiled MDX module, its component
// imports, and every Shiki token span into the client bundle. This
// four-line leaf keeps the page above it a Server Component while its
// Humane title still carries the trail.
export function SmearTitle({ as: Tag = "h1", className, children }: SmearTitleProps) {
```

The entire change is `"h1" | "h2"` → `"h1" | "h2" | "h3"` on line 6. RESEARCH verified all
7 call sites are source-compatible and no test asserts the prop type. `npx tsc --noEmit` is
the sufficient gate.

---

### `lib/locales.ts` (data module amendment — `homeLink`)

**Analog: itself.** Add one key to `UiCopy` (`:35-52`) and one entry to each of `UI.en`
(`:55-65`) and `UI.de` (`:66-76`). The value is identical in both locales — a proper noun —
so it deviates from every other key, which needs a comment saying so. The existing
`indexDescription` doc-comment (`:37-43`) is the register to match:

```ts
  /**
   * The index's <meta name="description">. Deliberately NOT emptyBody: that
   * string is the n = 0 state's on-page copy, and reusing it told every
   * crawler and link-preview card that nothing is published regardless of how
   * many posts exist. …
   */
  indexDescription: string;
```

**Downstream gate to update:** `tests/unit/dates.test.ts:43-62` asserts *"all nine copy
keys"* by name. Adding `homeLink` without adding it to that array leaves the new key
untested; the test title says nine and will need to say ten.

```ts
test("UI defines all nine copy keys with non-empty strings for both locales", () => {
  const keys = [
    "indexKicker", "indexDescription", "backLink", "switchLabel",
    "emptyHeading", "emptyBody", "notFoundHeading", "notFoundBody", "draftMarker",
  ] as const;

  for (const locale of ["en", "de"] as const) {
    for (const key of keys) {
      const value = UI[locale][key];
      assert.equal(typeof value, "string");
      assert.ok(value.length > 0, `UI.${locale}.${key} must be non-empty`);
    }
  }
});
```

---

### A2/A3 amendments to shipped surfaces

**A2 back-link position** — `app/(en)/writing/[slug]/page.tsx:72-75` is the exact position
the UI-SPEC says to match ("on its own line above the kicker row"):

```tsx
      <header className="flex flex-col gap-2xl">
        <Link href={indexPath("en")} className="text-label">
          {UI.en.backLink}
        </Link>
```

The index (`app/(en)/writing/page.tsx:30-34`) has no `<header>` today — the kicker row sits
directly under `<main className="flex flex-col gap-2xl …">`:

```tsx
    <main className="flex flex-col gap-2xl px-lg py-3xl">
      <div className="flex flex-row items-baseline gap-md">
        <h1 className="text-label">{UI[locale].indexKicker}</h1>
        <LanguageSwitch from={locale} href={indexPath(otherLocale(locale))} />
      </div>
```

**`hrefLang` attribute spelling** (`components/language-switch.tsx:20`) — the shipped form,
for the `/texte` → `/` crossing:

```tsx
    <Link href={href} className="text-label" hrefLang={otherLocale(from)}>
```

Note `tests/build/prerender.test.ts:184-187` records that **React SSR emits the DOM property
spelling `hrefLang`, not the lowercase HTML attribute** — match case-insensitively in any
assertion.

**A3 — the three `not-found` back links, all identical** (`app/(en)/writing/not-found.tsx:18-20`;
`app/(de)/texte/not-found.tsx:18-20` differs only in `UI.de`; `app/not-found.tsx:36-38`):

```tsx
      <Link href={indexPath("en")} className="text-label">
        {UI.en.backLink}
      </Link>
```

All three become `className="text-label link-quiet inline-block py-xs"`.
`LanguageSwitch` gets `link-quiet` **only** — no `inline-block py-xs` (UI-SPEC *Accessibility
contract*: it sits inline in `PostMeta`'s text line, WCAG 2.5.8's inline exception, and
padding there would change the shipped meta-line height on `/writing` and every post).

**A4 — `/type` specimen section** (`app/(en)/type/page.tsx:14-24`) is the repeated shape:

```tsx
      <section className="flex flex-col gap-sm">
        <p className="text-label">Display</p>
        <h1 ref={displayRef} className="text-display">
          Guillem Gelabert
        </h1>
        <p className="max-w-prose text-body">
          Humane, variable weight 530, tracked at 0.035em, on a fluid curve
          from 3.5rem to 11.25rem. The curve is what lets poster-scale type
          survive down to a 375px viewport without a separate mobile size.
        </p>
      </section>
```

`<section>` → Label-role `<p>` caption → the specimen → a `max-w-prose text-body` sentence
explaining it. **`/type` stays a Client Component** — de-clienting it is not in Phase 3
scope; the new section is static JSX inside the existing file.

---

## Test Patterns

Three kinds, three different house styles. Do not mix them.

### Kind 1 — Playwright integration (`tests/*.spec.ts`, runs against `npm run dev`)

**Analog:** `tests/writing-index.spec.ts`. Config context: `playwright.config.ts:6-27` —
`testDir: "./tests"`, `testMatch: "**/*.spec.ts"`, chromium only, `webServer: npm run dev`
on :3000.

**Header comment naming the requirement AND the assertion-shape lesson**
(`tests/writing-index.spec.ts:3-14`):

```ts
// Covers WRIT-01 (SC2): /writing and /texte read as an editorial front page
// rather than a directory listing — the featured entry's headline is the
// only link inside its <article>, there is no card/border/fill/"Read more",
// and a second entry … repeats the same <article> markup unchanged, separated
// by <hr>, proving the n>=2 fallback costs no second render mode.
//
// Two Phase 1 lessons apply (STATE.md, 02-VALIDATION.md): assert computed
// values measured from a real render (the "not a card" assertion below
// reads getComputedStyle rather than assuming Tailwind's default box), and
// page.emulateMedia({ reducedMotion: 'reduce' }) isn't needed here — this
// spec measures static markup, not motion.
```

**Setup: always `await page.evaluate(() => document.fonts.ready)` after `goto`**
(`:16-19`) — registration is deferred until fonts resolve (`use-smear-heading.ts:30`):

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/writing");
  await page.evaluate(() => document.fonts.ready);
});
```

**The "not a card" computed-style assertion** (`:35-58`) — copy this wholesale for the
`#work` `<li>` (HOME-04):

```ts
test("the article is not a card: no border, no shadow, transparent or paper background", async ({
  page,
}) => {
  const style = await page.locator("article").first().evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      borderTopWidth: s.borderTopWidth,
      borderRightWidth: s.borderRightWidth,
      borderBottomWidth: s.borderBottomWidth,
      borderLeftWidth: s.borderLeftWidth,
      boxShadow: s.boxShadow,
      backgroundColor: s.backgroundColor,
    };
  });

  expect(style.borderTopWidth).toBe("0px");
  expect(style.borderRightWidth).toBe("0px");
  expect(style.borderBottomWidth).toBe("0px");
  expect(style.borderLeftWidth).toBe("0px");
  expect(style.boxShadow).toBe("none");
  expect(["rgba(0, 0, 0, 0)", "transparent", "rgb(255, 255, 255)"]).toContain(
    style.backgroundColor,
  );
});
```

*(For the work list, row 2 legitimately has `borderTopWidth: 1px` — assert the other three
are `0px` and the top one is the hairline, per the next excerpt.)*

**The hairline-colour assertion — Pitfall 1's direct gate** (`:95-106`):

```ts
  // "the existing <hr> rule" means the Prose Contract's hairline, not a
  // second, heavier one. Scoping the stroke to .prose-site left the index's
  // separator on Tailwind preflight's currentColor — full-ink black, 8x
  // darker than --color-rule. toHaveCount(1) could not see that; the
  // computed colour can.
  const hrStyle = await page.locator("main > hr").evaluate((el) => {
    const s = getComputedStyle(el);
    return { color: s.borderTopColor, width: s.borderTopWidth, style: s.borderTopStyle };
  });
  expect(hrStyle.color).toBe("rgba(0, 0, 0, 0.12)");
  expect(hrStyle.width).toBe("1px");
  expect(hrStyle.style).toBe("solid");
```

**Absence assertion over `body.innerText`** (`:60-64`) — the shape for the
no-placeholder-words and no-`ib-gdp-evolution` checks:

```ts
test("the page body contains neither Read more nor Weiterlesen", async ({ page }) => {
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toContain("Read more");
  expect(bodyText).not.toContain("Weiterlesen");
});
```

**Computed font-weight assertion** (`:75-83`) — for the positioning line's 530:

```ts
  const fontWeight = await page
    .locator("article").first().locator(".text-standfirst").first()
    .evaluate((el) => getComputedStyle(el).fontWeight);
  expect(fontWeight).toBe("530");
```

**Trail assertions** (`tests/smear-heading.spec.ts:41-82`) — the poll-then-settle shape, and
the layer-count trap:

```ts
  const readShadow = () =>
    page.evaluate(() => {
      const heading = document.querySelector("h1");
      return heading ? getComputedStyle(heading).textShadow : null;
    });

  expect(await readShadow()).toBe("none");
  await page.evaluate(() => window.scrollBy(0, 1200));

  let midScrollShadow: string | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    midScrollShadow = await readShadow();
    if (midScrollShadow && midScrollShadow !== "none") break;
    await page.waitForTimeout(16);
  }
  ...
  // Count actual shadow layers, not commas. getComputedStyle normalises the
  // trail hue to `rgb(r, g, b)`, which carries two commas of its own, so a
  // naive split(",") reports 3 for a single layer and any "> 1" assertion
  // passes trivially. Count the colour functions instead — one per layer.
  const layerCount = ((midScrollShadow as string).match(/rgba?\(/g) ?? []).length;
  expect(layerCount).toBeGreaterThan(10);

  await page.waitForTimeout(1500);
  expect(await readShadow()).toBe("none");
```

`tests/landing-trail.spec.ts` must generalise `document.querySelector("h1")` to *both*
registered headings (the `h1` nameplate and the featured `h3.text-heading`).

**Reduced motion — `emulateMedia` BEFORE `goto`** (`tests/reduced-motion.spec.ts:8-20`).
This ordering is load-bearing and the comment says why:

```ts
// Uses `page.emulateMedia({ reducedMotion: 'reduce' })` (a real
// `matchMedia('(prefers-reduced-motion: reduce)')` match, not a manual CSS
// override), applied BEFORE navigation so the app's own mount-time read of
// `matchMedia(...).matches` sees the emulated value from the very first
// effect run … (Playwright's `reducedMotion` context/test option was tried
// first and found unreliable for `matchMedia` in this environment/version.)
test("heading text-shadow stays 'none' throughout a full scroll under reduced-motion emulation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/type");
```

**Viewport parameterisation + measured clamp values** (`tests/viewport.spec.ts:23-53`) —
reuse `clampPx()`, do not hardcode. The nameplate is **139.2px at 1440px**, not 180px:

```ts
const ROOT_PX = 16;
const TOLERANCE_PX = 4;

function clampPx(minRem, preferredRem, preferredVw, maxRem, viewportWidth) {
  const min = minRem * ROOT_PX;
  const max = maxRem * ROOT_PX;
  const preferred = preferredRem * ROOT_PX + (preferredVw / 100) * viewportWidth;
  return Math.min(Math.max(preferred, min), max);
}

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
];
```

**Page-overflow assertion** (`tests/fixture-viewport.spec.ts:61-62`) — the two values to
compare for `tests/landing-viewport.spec.ts`:

```ts
      pageScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
```

**Table-driven cases with a loop** (`tests/writing-not-found.spec.ts:12-29`) — the house
style when a spec covers more than one locale/route:

```ts
// A one-entry table today, looped over rather than hand-written once, so
// Plan 06 can add the German /texte case without restructuring this file.
const LOCALE_CASES = [
  { path: "/writing/does-not-exist", heading: "Not found", body: "…",
    backLinkText: "← Writing", backLinkHref: "/writing" },
  ...
];
```

### Kind 2 — `node --test` unit (`tests/unit/*.test.ts`, `npm run test:unit`)

**Analog for `tests/unit/work.test.ts`: `tests/unit/dates.test.ts`** — pure module import,
no fixtures, no DOM. Note the **`.ts` extension in the relative import** and the
`../../lib/` path (not `@/`, which is a bundler alias Node cannot resolve):

```ts
import assert from "node:assert/strict";
import { test } from "node:test";

// Covers I18N-01: formatPostDate produces the UI-SPEC's exact date strings …
const locales = await import("../../lib/locales.ts");
const { formatPostDate, indexPath, postPath, otherLocale, UI } = locales;
```

`tests/unit/content.test.ts:1-11` uses the static form instead — either is fine:

```ts
import {
  assertFrontmatter, findBySlug, findTranslation, isVisible, loadPostModule, selectForLocale,
} from "../../lib/content.ts";
import type { PostEntry, PostFrontmatter } from "../../lib/content.ts";
```

`tests/unit/content.test.ts:26-32` records the boundary of what belongs in a unit test —
`lib/work.ts` is pure and has no such caveat, but the *convention of stating the boundary*
should carry:

```ts
// allPosts, publishedFor and translationOf are deliberately NOT exercised
// here — they depend on the bundler's @/ alias and on content/ existing on
// disk, and are covered end-to-end by the Playwright specs in Plans 04/05
// instead.
```

**Analog for `tests/unit/link-contract.test.ts`: `tests/unit/prose-contract.test.ts`** —
the CSS-source gate. Read the file's own header (`:6-16`):

```ts
const CSS_PATH = path.join(process.cwd(), "app/globals.css");
const rawCss = readFileSync(CSS_PATH, "utf8");

// Strip comments before anything else touches the text, so a comment can
// never satisfy or break an assertion below.
const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
```

The parser to reuse is `extractBlocks` (`:34-73`, nesting-aware via the `parent` arg —
WR-13), `ownDeclarationText` (`:80-101`), `splitDeclarations` (`:108-137`, semicolon-in-value
safe), `declarationsOf` (`:139-147`), `valuesOf` (`:149-157`), plus the two derived
constants (`:159-168`):

```ts
const allBlocks = extractBlocks(css);
const proseBlocks = allBlocks.filter((b) => b.selector.startsWith(".prose-site"));
const allSelectors = new Set(
  allBlocks.flatMap((b) => b.selector.split(",").map((s) => s.trim())),
);
```

**Two concrete facts the planner needs:**
1. **None of those five functions is exported today** — they are module-local. Extracting
   them to a shared helper requires editing `tests/unit/prose-contract.test.ts` to `export`
   them, or moving them into a new module both files import.
2. **`npm run test:unit` is `node --test 'tests/unit/*.test.ts'`.** A shared helper placed
   in `tests/unit/` must NOT be named `*.test.ts` or Node will execute it as a zero-test
   suite. Name it e.g. `tests/unit/css-source.ts`.

**Assertion register** (`:170-179`, `:215-239`, `:271-277`) — three shapes to copy:

```ts
test("(a) .prose-site uses only the two fixed font sizes, plus inherit", () => {
  const sizes = new Set(valuesOf("font-size", proseBlocks));
  assert.ok(sizes.size > 0, "expected at least one font-size declaration");
  for (const size of sizes) {
    assert.ok(
      size === "14px" || size === "18px" || size === "inherit",
      `unexpected font-size "${size}" in .prose-site — the type budget is exactly 14px and 18px`,
    );
  }
});

test("(f) every required Prose Contract selector is present", () => {
  const required = [".prose-site p", ".prose-site h2", /* … */ ".text-standfirst"];
  for (const selector of required) {
    assert.ok(allSelectors.has(selector), `missing required selector: ${selector}`);
  }
});

test("(j) the edit was additive — Phase 1's clamp() curves are untouched", () => {
  const display = "clamp(3.5rem, 1.5rem + 8vw, 11.25rem)";
  const heading = "clamp(2rem, 1rem + 4vw, 4.5rem)";
  const countOccurrences = (needle: string) => css.split(needle).length - 1;
  assert.equal(countOccurrences(display), 1, "Display clamp() curve must appear exactly once");
  assert.equal(countOccurrences(heading), 1, "Heading clamp() curve must appear exactly once");
});
```

Tests `(a)`–`(d)` scope to `proseBlocks`; the new gate scopes to blocks whose selector
starts with `.section-head`, `.link` or `.link-quiet`. Test `(j)` already guards the phase's
"no retune" promise and needs no change. Test `(f)` should gain the three new selectors.

### Kind 3 — `node --test` build-output (`tests/build/*.test.ts`, `npm run test:build`)

**Analog:** `tests/build/prerender.test.ts`. Its header (`:6-19`) states the tier rule that
RESEARCH's assertion-rule #3 restates:

```ts
// Covers WRIT-01 (SC5) / D-11: the production half of "a draft prerenders
// nowhere and appears in no index". tests/draft-visibility.spec.ts (Playwright)
// covers the development half — every Playwright spec in this repo runs
// against `npm run dev`, where NODE_ENV is always "development" and
// isVisible() deliberately returns true for a draft. That environment
// structurally cannot prove what a production build omits. This file reads
// the real prerendered HTML that `next build` writes to `.next/server/app`
// instead …
//
// Requires a completed `next build` first (`rm -rf .next && npm run build`).
// Run via `npm run test:build`, NOT `npm run test:unit` …
```

**The route map** is already built and memoised (`:21`, `:36-71`) — new assertions just call
`getRoutes()`. `walkHtmlRoutes` normalises `index.html` → `""`, so `/` is the key `""`:

```ts
const APP_DIR = path.join(process.cwd(), ".next", "server", "app");
...
let routesPromise: Promise<Map<string, string>> | null = null;
function getRoutes(): Promise<Map<string, string>> {
  if (!routesPromise) routesPromise = walkHtmlRoutes(APP_DIR, APP_DIR);
  return routesPromise;
}
```

**The route-key test to extend** (`:190-194`) — add `"cv"`:

```ts
test("Phase 1's routes still prerender after the route-group restructure", async () => {
  const routes = await getRoutes();
  assert.ok(routes.has(""), "root route \"/\" must still exist");
  assert.ok(routes.has("type"), "route \"/type\" must still exist");
});
```

**The canonical/metadata assertion shape** (`:177-188`) — the model for `/`'s new canonical
and `description === POSITIONING_PLACEHOLDER`:

```ts
  assert.ok(writing.includes('rel="canonical"'));
  // React SSR emits the DOM property name (hrefLang), not the HTML
  // attribute's lowercase spelling — match case-insensitively.
  assert.match(writing, /hreflang="x-default"/i);
```

**Interim-copy assertion shape** (`:101-112`) — exactly what the featured slot's interim
state needs (Pitfall 2: this copy assertion belongs *here*, not in Playwright):

```ts
  assert.ok(writing!.includes("Nothing published here yet."));
  assert.ok(writing!.includes("The first piece is being written."));
```

**Substring-check trap** (`:137-151`) — read before writing any `html.includes(…)`:

```ts
/**
 * A bare `html.includes("Draft")` substring check was the earlier form, and
 * it would fail on any legitimately published post whose title or standfirst
 * contained "Draft", "Drafting" or "Draftsman" … Matching the rendered shape
 * cannot be triggered by prose.
 */
function draftMarkerLine(marker: string): RegExp {
  return new RegExp(`(?:</time>|</a>)\\s*·\\s*(?:<!--\\s*-->\\s*)?${marker}`, "u");
}
```

---

## Shared Patterns

### 1. Derived state, never a flag

**Source:** `lib/content.ts:164-178` + `components/post-meta.tsx:14-15`
**Apply to:** `components/landing/featured-slot.tsx`, `app/(en)/page.tsx`

```ts
/**
 * D-11, stated once. PostMeta needs the same predicate to decide whether to
 * print the draft marker, and used to re-derive it inline — two independent
 * statements of one rule that could drift apart the moment it changes (a
 * SHOW_DRAFTS flag, a preview mode), with the visible symptom being a draft
 * marker on a published post or a published post with no marker in dev.
 */
export function showDrafts(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Drafts are visible in dev, invisible in a production build. D-11. */
export function isVisible(entry: PostEntry): boolean {
  return showDrafts() || entry.frontmatter.draft !== true;
}
```

Never re-derive `NODE_ENV === "development"`. Never add a `FEATURED_ENABLED` boolean. The
slot's state is `findBySlug(await publishedFor("en"), CASE_STUDY_SLUG) === null`.

### 2. One statement of any shared value

**Source:** `lib/site.ts:15-17`
**Apply to:** `POSITIONING_PLACEHOLDER` (rendered `<p>` **and** `metadata.description` on `/`)

```ts
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-production-9cedb.up.railway.app",
);
```

Pitfall 6's warning sign is literal: *more than one occurrence of the positioning string in
`git grep`.* After Phase 3, `"Developer."` should appear in `lib/work.ts` only —
`app/(en)/layout.tsx:12` is overridden for `/` by the page-level export and stays as the
layout default for any future EN route.

### 3. Focus-visible + reduced-motion gating

**Source:** `app/globals.css:84-93`
**Apply to:** `.link`, `.link-quiet`, therefore every link on every Phase 3 surface

```css
.prose-site a:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .prose-site a {
    transition: color 120ms ease-out, text-decoration-color 120ms ease-out;
  }
}
```

The **state change is not motion** — only the `transition` sits inside the media query.
`outline: none` must never appear.

### 4. Metadata inheritance — declare nothing the layout already declares

**Source:** `app/(en)/layout.tsx:9-14` vs `app/(en)/writing/page.tsx:10-23`
**Apply to:** `app/(en)/page.tsx`, `app/(en)/cv/page.tsx`

The layout declares `metadataBase`, `title`, `description`, `robots`. A route page declares
only `title`, `description`, `alternates`. **`robots` appears in exactly two files
site-wide** (`app/(en)/layout.tsx:13`, `app/(de)/layout.tsx`) and must stay that way —
Phase 6 `FIND-02` flips it in those two places (Pitfall 5).

### 5. Comment the failure, not the code

**Source:** `lib/content.ts:180-193` is the archetype

```ts
/**
 * Reverse-chronological, then alphabetical by slug. The slug tiebreak is not
 * cosmetic: comparing dates alone returns 0 for two posts sharing a date, and
 * a stable sort then preserves readdir order, which is filesystem- and
 * platform-dependent. The rendered index order and the order of
 * generateStaticParams() could differ between a developer's machine and the
 * deploy build with no error and no test failure.
 */
```

Every Phase 3 file with a non-obvious constraint (the `border-rule` requirement, the
interim headline not being a link, the `aria-hidden` ordinals, `role="list"` for Safari)
gets a comment in this register naming the failure mode, not restating the code.

---

## No Analog Found

Three constructs have no shipped precedent. The planner should take them from
`03-UI-SPEC.md` / `03-RESEARCH.md` directly rather than hunting for a repo analog.

| Construct | Role | Data flow | Evidence of absence | Where to take it from |
|---|---|---|---|---|
| `<ol role="list">` + `list-none` | list markup | list render | `grep -rn '<ol\|<ul\|role="list"' app components` → **zero hits**. The only lists in the repo are inside MDX prose, styled by `.prose-site ul/ol` (`app/globals.css:104-129`). | `03-RESEARCH.md` § *The work-list row*; the `role="list"` rationale (Safari drops list semantics under `list-style: none`) is in UI-SPEC § *Work list contract*. |
| `<nav aria-label="Sections">`, `<section aria-labelledby>`, `aria-hidden` | landmark / a11y attributes | static | `grep -rn 'aria-' app components` → **zero hits**. No `<nav>` and no `<section aria-*>` anywhere; `<section>` appears only as an unlabelled grouping in `app/(en)/type/page.tsx`. | UI-SPEC § *Routes & Layout* markup block and § *Accessibility contract*. |
| Outbound `<a href="https://…">` | link | request-response | `grep -rn 'href="http\|<a ' app components` → **zero hits**. Every link in `app/`/`components/` is a `next/link` `<Link>` to an internal path. The only external links live in `content/fixture.mdx:31`, i.e. MDX prose. | UI-SPEC § *Outbound link marking*: plain `<a>` (not `Link`), same tab, **no `target="_blank"`**, therefore no `rel`; the destination host on its own Label-role line is the marker. |

**Partial analog note for the contents nav:** the closest shipped "small server component
rendering a link with a className and an accessibility-motivated absence rule" is
`components/language-switch.tsx` (24 lines). Copy its props-type placement, its comment
register and its `<Link … className=…>` form; the `<nav>`/`<ul>`/`<li>` skeleton is new.

---

## Metadata

**Analog search scope:** `app/(en)/`, `app/(de)/`, `app/`, `components/`, `components/mdx/`,
`components/smear-heading/`, `lib/`, `tests/`, `tests/unit/`, `tests/build/`,
`playwright.config.ts`, `package.json`
**Files scanned:** 45 source files (all of `app`, `components`, `lib`, `tests`);
20 read in full, 4 read in part, 6 grepped for absence
**Pattern extraction date:** 2026-08-31
**Repo state at extraction:** master @ `3bec574`, Phase 1 + Phase 2 shipped, 16 WR review
fixes landed the same day (WR-02, WR-06, WR-07, WR-10, WR-12, WR-13, WR-14 all referenced
above)
