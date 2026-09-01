# Milestone Audit — v1.0 Working Site

**Written:** 2026-09-01, plan 06-11 Tasks 1–2, extended by plan 06-12 Task 1.
**Scope:** the whole milestone, not this phase. D-4.4 makes the audit a deliverable, not a ritual:
it is where "did we build what PROJECT.md described" is answered on the record, row by row, with
evidence. Evidence is a test name, a command with its output, or a file path. Never a claim.

**Commits audited:** `7e7909a` (placeholder fill) · `315518d` (per-post OG cards, package rename,
test port) · `ff5eb40` (localised 404 titles). Live origin at time of audit: `ff5eb40`.

---

## Section 0 — the state this audit describes

The site is **complete in structure and placeholder in copy**. Every surface the milestone promised
renders at full length; five of the values it renders are lorem ipsum, by the owner's explicit
instruction, and the site is held at `noindex` for exactly that reason. Read every verdict below
with that distinction in mind: **"delivered" means the surface works, not that the words are
final.** The rows where that gap matters name it.

---

## Section 1 — cross-link integrity

**Evidence:** `tests/cross-links.spec.ts`, 4 tests, all passing in the run recorded at the foot of
this document. The spec crawls seven routes and derives its href lists from the rendered DOM rather
than from a hardcoded table, so a new link is covered the moment it ships.

| # | Property | Verdict | Evidence |
|---|---|---|---|
| 1.1 | HOME-03's five destinations reachable from `/` | ✅ | `tests/cross-links.spec.ts` — the contents nav's five hrefs resolve non-404 |
| 1.2 | Every internal href on every route, both locales, resolves non-404 | ✅ | "every internal href across all seven routes, deduplicated, resolves to a non-404 status" |
| 1.3 | Every fragment href has a matching `id` in that route's own DOM | ✅ | "every fragment href on every route has a matching id in that route's own rendered DOM" |
| 1.4 | Every `hreflang` and `x-default` target resolves | ✅ | "every route's link[rel=alternate] tags resolve non-404 by pathname, with x-default present and live where alternates exist" |
| 1.5 | `/`, `/cv`, `/type` emit no alternates — English-only by design | ✅ | Same test's negative half; also asserted at build tier in `prerender.test.ts` ("/writing and /texte still emit hreflang alternates including x-default; /, /cv and /type deliberately emit none") |
| 1.6 | No external href carries `target` | ✅ | "every external href is absolute https, carries no target attribute, and never references the private ib-gdp-evolution repository" |

---

## Section 2 — the Out-of-Scope roll-call

PITFALLS #15's rule: check each entry **by name**, mechanically. "Does this look like generic-
portfolio drift" is a judgment call; "is there a card grid" is not. Twelve entries across
`PROJECT.md:45-52` and `REQUIREMENTS.md`'s table, plus a thirteenth row this audit adds.

| # | Out-of-scope entry | Mechanical check | Verdict |
|---|---|---|---|
| 2.1 | Variable-font hero, WebGL/Three.js | `package.json` has no three/`@react-three`/GSAP/framer dependency; the only motion is the `text-shadow` trail driven by one shared rAF loop in `components/smear-heading/` | ✅ absent |
| 2.2 | 2020 archive migration (13 posts) | `ls content/` — 5 files: 2 case-study locales, 2 fixture locales, 1 draft. No legacy post | ✅ absent |
| 2.3 | Post types and tags | `lib/content.ts`'s `PostFrontmatter` has no `type` or `tags` field; `assertFrontmatter` rejects unknown keys | ✅ absent |
| 2.4 | "Now playing / recently played" | No such component, no such data module, no third-party API client anywhere in `package.json` | ✅ absent |
| 2.5 | Custom domain | ⚠️ **needs the distinction, see below** | ⚠️ nuanced |
| 2.6 | Contact form | `grep -rn "<form" app/ components/` → zero matches. `lib/contact.ts` is three links | ✅ absent |
| 2.7 | Blog-primary reverse-chronological homepage | `app/(en)/page.tsx` renders the landing view — positioning line, contents nav, work list, featured slot, backlog, contact. Posts appear only via the featured slot | ✅ absent |
| 2.8 | Card grids, three-across feature rows | `tests/landing.spec.ts` "(t) no card idiom anywhere on the page: no button, no img, no svg, no rounded corners, no shadow"; `tests/writing-index.spec.ts` "the article is not a card" | ✅ absent |
| 2.9 | Per-item backlog dates or states | `lib/backlog.tsx`'s `BacklogItem` is exactly `{ name, description }`; `tests/unit/backlog.test.ts` asserts the two-field shape | ✅ absent |
| 2.10 | Headless CMS or database | No client, no driver, no connection string in `package.json` or `.env`. Content is 5 files on disk | ✅ absent |
| 2.11 | Static export (`output: 'export'`) | `grep -n "output" next.config.ts` → no `output` key. `next build` emits a server, and `headers()` works, which export would foreclose | ✅ absent |
| 2.12 | Animation library, state manager, component library | Full dependency list: `@mdx-js/loader`, `@mdx-js/react`, `@next/mdx`, `@shikijs/rehype`, `@tailwindcss/typography`, `@types/mdx`, `next`, `react`, `react-dom`, `rehype-slug`, `remark-frontmatter`, `remark-gfm`, `remark-mdx-frontmatter`, `shiki`. Zero of the three categories | ✅ absent |
| 2.13 | `components.json` (shadcn's marker file) | `ls components.json` → `No such file or directory` | ✅ absent |

### 2.5 — the custom-domain row, stated precisely

Getting this row wrong in either direction misreports the milestone, so it is spelled out rather
than ticked.

- **No domain was attached** to the `web` service by this milestone. `railway status` lists two
  services: `web` (on `web-production-9cedb.up.railway.app`) and `guillem-edge` (on
  `guillemgelabert.com`). The apex belongs to `guillem-edge`, a different repository.
- **No domain was detached** from `guillem-edge`, and no DNS record was changed. `railway domain`
  was never run — bare, it *creates* a domain, and research deliberately avoided it. The only
  Railway mutation this phase performed is recorded in §5.1.
- **What did change:** the canonical hostname the application *declares*. Research finding F3 found
  the apex already serving this exact application byte-identically via the `guillem-edge`
  Cloudflare Worker, while `rel=canonical` pointed at the Railway URL — two hostnames, one origin,
  and the wrong one nominated for consolidation. `lib/site.ts` now reads `NEXT_PUBLIC_SITE_URL`
  with the apex as its fallback.
- **BUILD-07 remains open.** Attaching the domain to the `web` service (and adding HSTS `preload`,
  which belongs with it) is still v2 work. Recorded in `deferred-items.md`.

---

## Section 3 — the design-system roll-call

The two tiers read different surfaces, and the division is the point.

- **`tests/unit/prose-contract.test.ts`** reads `app/globals.css` from disk. It can see every
  declaration in that file and **nothing else** — not JSX, not Tailwind utility classes, and not
  values Tailwind v4's preflight injects into the compiled stylesheet.
- **`tests/design-budget.spec.ts`** reads computed values out of a live browser. It is the only
  tier that can see the preflight-derived ones. The concrete case: preflight ships
  `b,strong{font-weight:bolder}` in the *compiled* CSS, so a `<strong>` outside `.prose-site`
  renders at 700 — a third weight on screen — with every source-level gate green.

| # | Constraint | Verdict | Evidence |
|---|---|---|---|
| 3.1 | Two weights only (400, 530) | ✅ | `design-budget.spec.ts` "(weight/size) …computes a budget-legal weight" on every route; `cv.spec.ts` (o) for `/cv` specifically |
| 3.2 | At most four type sizes per route | ✅ | Same test — "the route's distinct font-size set has cardinality <= 4" |
| 3.3 | Zero border-radius | ✅ | `design-budget.spec.ts` "(radius) every computed border-radius inside `<main>` … is 0px on all four corners"; `cv.spec.ts` (k) for the portrait |
| 3.4 | Accent reserved to focus and hover | ✅ | `design-budget.spec.ts` "(accent) reserved to focus and hover — absent at rest on /, /cv and /type; present on a focused and a hovered link" |
| 3.5 | Zero icons, zero in-page SVG | ✅ | `design-budget.spec.ts` "(icons) zero `<svg>` and zero `<use>` anywhere in the rendered DOM" |
| 3.6 | One non-Latin character site-wide | ✅ | `design-budget.spec.ts` "(non-Latin) the union … is exactly {U+2190}" — the back-link arrow |
| 3.7 | Seven spacing tokens, no eighth | ✅ | `app/globals.css:15-21` — `xs 4 · sm 8 · md 16 · lg 24 · xl 32 · 2xl 48 · 3xl 64`. `design-budget.spec.ts` "(source sweep) no arbitrary Tailwind value … outside a dated, reasoned allowlist" is what forbids an eighth appearing as `p-[13px]` |
| 3.8 | Three declared off-grid exceptions, no fourth | ✅ | The allowlist in the same source sweep. Adding a fourth requires a dated, reasoned entry, which is the gate |
| 3.9 | Three rule weights, no fourth | ✅ | `prose-contract.test.ts` reads the three from `app/globals.css`. The failure mode is documented at `components/cv/cv-sections.tsx:7-11`: a bare `border-t` falls through to `currentColor` and renders full ink, 8× darker than `--color-rule` |
| 3.10 | No `!important` | ✅ | `prose-contract.test.ts` — asserted against the CSS source |
| 3.11 | One image now ships (`/cv`'s portrait), against 3.5's zero-SVG rule | ✅ consistent | 3.5 bans `<svg>`/`<use>`, not `<img>`. `landing.spec.ts` (t) still asserts zero `<img>` on `/`; the portrait is `/cv`-only, PROF-02's whole point |

---

## Section 4 — BRIEF §8's "decoration with axes" trap

**Verdict:** ✅ passed, and trivially so — stated that way deliberately, because a row that reads as
reassurance is worse than no row.

BRIEF §8 warns against ornament that borrows the *appearance* of data — tick marks, axis lines,
plotted-point styling on elements that plot nothing. The condition that makes this trivially true
today is that **no decorative element ships at all**. The site has zero icons, zero in-page SVG
(§3.5), zero background images, and one raster (`/cv`'s portrait, a real content image). There is
nothing on the page that could have been given axes.

This makes the row **falsifiable rather than reassuring**: the moment any ornamental element is
added, this verdict stops being free and has to be re-earned. The three real charts on the case
study are content, not ornament — they are the subject.

---

## Section 5 — live verification (Task 1)

Every check below ran against the live deploy. Believing the config is not verification.

### 5.1 — the one Railway mutation, and the redeploy it triggered

```
$ railway status
Project:     guillem-web (f6be1197-bc33-469e-8f16-d528e44c9f0f)
Environment: production
Services:    web:          ● Online · https://web-production-9cedb.up.railway.app
             guillem-edge: ● Online · https://guillemgelabert.com

$ railway variables --set "NEXT_PUBLIC_SITE_URL=https://guillemgelabert.com"
Set variables NEXT_PUBLIC_SITE_URL
```

Confirmed present afterwards in `railway variables`. `NEXT_PUBLIC_*` is inlined at **build** time,
so this took effect on the redeploy the change triggered, not on a restart — confirmed by the
`last-modified: Tue, 01 Sep 2026 13:20:55 GMT` on a `/_next/static/` asset fetched after the change.

**Commands run against Railway, in full:** `railway status`, `railway variables`,
`railway variables --set`. **`railway domain` was never run**, with or without arguments.

This is belt-and-braces, not the mechanism: `lib/site.ts` already falls back to the apex, so a
local build, a CI build and `npm run test:build` all emit the same canonical production does. Both
exist on purpose — a future reader needs to know which is load-bearing.

### 5.2 — G8, the six security headers on a live response

```
$ curl -sI https://guillemgelabert.com/
HTTP/2 200
strict-transport-security: max-age=63072000; includeSubDomains
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'; upgrade-insecure-requests
cross-origin-opener-policy: same-origin
permissions-policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
server: cloudflare
x-railway-edge: zrh1
x-powered-by: Next.js
```

**The delivered CSP is byte-identical** to plan 06-02's recorded production string and to the one
`tests/unit/csp.test.ts` asserts against `buildCsp({ dev: false })`. This is D-4.3's third
verification layer: the pure function, the delivered header, and the rendered consequence (G9).

`X-Frame-Options` and `X-XSS-Protection` are **absent by design** (D-4.1) — superseded by
`frame-ancestors` and deprecated respectively. Asserted in
`tests/security-headers.spec.ts`.

**Headers reach static assets too.** The asset was discovered from the page, not hardcoded:

```
$ curl -sI https://guillemgelabert.com/_next/static/chunks/310vm2bl3xxpt.js
HTTP/2 200
content-type: application/javascript; charset=UTF-8
strict-transport-security / content-security-policy / cross-origin-opener-policy /
permissions-policy / referrer-policy / x-content-type-options   — all six present, CSP identical
```

### 5.3 — G7, the OG cards, parsed from the page rather than hardcoded

| Route | `og:image` | Result |
|---|---|---|
| `/` | `…/opengraph-image-35z9bs.png?opengraph-image.0neqxvyfi01yd.png` | 200 · `image/png` · 17,648 B · decoded **1200×630** |
| `/writing/the-chart-therefore-changes` | `…/og/the-chart-therefore-changes.png` | 200 · `image/png` · 15,773 B · decoded **1200×630** |
| `/texte/die-darstellung-aendert-sich` | `…/og/die-darstellung-aendert-sich.png` | 200 · `image/png` · 15,397 B · decoded **1200×630** |

All absolute, all on `guillemgelabert.com`, `twitter:card` = `summary_large_image` on each. The
three cards are three distinct files of three distinct byte lengths.

> ⚠️ **This row failed when first measured, and the failure is the most useful thing in this audit.**
> Both case studies were serving the *site-wide* card — `/og/site-en.png` and `/og/site-de.png`,
> byte-identical to `/`'s — while their own captured PNGs sat committed and unreferenced. Cause:
> `c85eb18` gave every route an explicit `openGraph.images` entry to close the routes that had none,
> and a declared `openGraph` object also overrides the `opengraph-image` **file convention** for its
> segment. The two segments whose convention route was doing real work were the two the fix broke.
>
> Nothing failed loudly. The capture script kept producing cards, the convention routes kept
> building at hashed URLs nobody referenced, and `f7b072e`'s assertion — written in the same breath
> as the bug — passed throughout, because it compared the English post's card with the German
> post's and with `/`'s, and those differ by **locale** whether or not the per-post override fires.
> Difference was never the property worth asserting.
>
> Fixed in `315518d`: `postOpenGraph()` names the card by slug; both dead convention routes deleted;
> the assertion now requires the pathname to **be** `/og/{slug}.png`. This audit found it by curling
> the live deploy, which is the entire argument for PITFALLS #8.

### 5.4 — canonical, declared identically from both hostnames

```
apex   /     rel="canonical" href="https://guillemgelabert.com"
apex   /cv   rel="canonical" href="https://guillemgelabert.com/cv"
railway /    rel="canonical" href="https://guillemgelabert.com"
railway /cv  rel="canonical" href="https://guillemgelabert.com/cv"
```

Both hostnames nominate the same canonical, which is the whole point: whichever hostname a crawler
arrives on, it is told to consolidate onto the apex.

### 5.5 — sitemap and robots, verbatim from the live origin

```
$ curl -s https://guillemgelabert.com/robots.txt
User-Agent: *
Allow: /
Disallow: /type

Sitemap: https://guillemgelabert.com/sitemap.xml
```

```
$ curl -s https://guillemgelabert.com/sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://guillemgelabert.com</loc></url>
<url><loc>https://guillemgelabert.com/cv</loc></url>
<url><loc>https://guillemgelabert.com/writing</loc></url>
<url><loc>https://guillemgelabert.com/texte</loc></url>
<url><loc>https://guillemgelabert.com/writing/the-chart-therefore-changes</loc><lastmod>2026-08-31</lastmod></url>
<url><loc>https://guillemgelabert.com/texte/die-darstellung-aendert-sich</loc><lastmod>2026-08-31</lastmod></url>
</urlset>
```

**G10 holds:** six URLs, all on the canonical host. `/type` and both reserved 404 targets
(`/writing/not-found-page`, `/texte/nicht-gefunden`) are absent — asserted at build tier in
`prerender.test.ts` as well as observable here.

### 5.6 — smoke, and CR-01 on the deploy

| Route | Status | | Route | Status | `lang` | `<title>` |
|---|---|---|---|---|---|---|
| `/` | 200 | | `/writing/does-not-exist` | **404** | `en` | `Not found — Guillem Gelabert` |
| `/cv` | 200 | | `/texte/gibt-es-nicht` | **404** | `de` | `Nicht gefunden — Guillem Gelabert` |
| `/writing` | 200 | | `/nope` | **404** | `en` | `Not found — Guillem Gelabert` |
| `/texte` | 200 | | | | | |
| both posts | 200 | | | | | |
| `/type` | 200 | | | | | |
| `/robots.txt`, `/sitemap.xml` | 200 | | | | | |

CR-01 holds in production: unmatched slugs 404 with the requesting segment's own language, server-
rendered, no JavaScript required.

> ⚠️ **The two localised 404 titles were wrong when first measured** — they served
> `Not found — Guillem Gelabert — Guillem Gelabert` and the German equivalent. Both routes hardcode
> a title (a 404 falling back to the layout default is a WCAG 2.4.2 regression), which was correct
> until plan 06-07 gave the root layouts `title.template: "%s — Guillem Gelabert"`; the literal
> suffix then composed with the template. Fixed in `ff5eb40`, titles now read from
> `UI[locale].notFoundHeading`. `app/global-not-found.tsx` keeps its literal suffix — it renders
> outside both locale layouts, so no template reaches it. The existing assertion checked only that a
> title was *present and non-empty*, which stayed true throughout; the missing half (no title may
> contain `SITE_NAME` twice) is now asserted.

### 5.7 — still `noindex`, on every surface

| `/` | `/cv` | `/writing` | `/texte` | case study | `/type` |
|---|---|---|---|---|---|
| `noindex` | `noindex` | `noindex` | `noindex` | `noindex` | `noindex` |

**This is the intended end state of the milestone.** Every surface ships; nothing is indexed. See
`launch-gate.md` for the flip procedure and why this phase did not perform it.

### 5.8 — F3 re-measured at close (2026-09-01)

Research marks F3 valid for roughly 7 days because it depends on live third-party routing this
milestone does not own. Re-measured:

```
$ dig +short guillemgelabert.com        → 104.21.40.220, 172.67.157.37   (Cloudflare)
$ dig +short www.guillemgelabert.com    → same pair
$ curl -sI https://www.guillemgelabert.com/
HTTP/2 301 · location: https://guillemgelabert.com/
apex edge headers: server: cloudflare · x-railway-edge: zrh1 · x-powered-by: Next.js
```

**Unchanged.** Cloudflare fronts the `guillem-edge` Worker, which forwards the apex to this Railway
service; `www.` 301s to the apex. **G13 passes.** It carries the same ~7-day shelf life going
forward and must be re-measured immediately before any FIND-02 flip.

---

## Section 6 — housekeeping

| # | Item | Decision | Evidence |
|---|---|---|---|
| 6.1 | `/probe404` | Already deleted before this phase | `curl` → 404; no such path in `app/` |
| 6.2 | Five scaffold SVGs | Deleted by plan 06-05 | Live: `file.svg` 404 · `globe.svg` 404 · `next.svg` 404 · `vercel.svg` 404 · `window.svg` 404 |
| 6.3 | Scaffold favicon | Deleted by plan 06-06 | Live `/`: exactly one `<link rel="icon">`; `/favicon.ico` → 404 |
| 6.4 | `package.json` name | **Decided and acted: renamed `gw-scaffold` → `guillem-web`** | Cosmetic and invisible to visitors, but it is the first thing a reader who opens the repo sees, and this milestone's audience opens repos. Nothing keys on it — the only other occurrences were `package-lock.json`'s two self-references, updated with it. Full suite re-run green after the rename |
| 6.5 | Lint debt, `use-prefers-reduced-motion.ts:23` | **Decided: re-deferred, with reasoning** | See below |
| 6.6 | `_pm/kanban.md` | **Recorded, not resolved — flagged for the user** | See below |
| 6.7 | Test port hardcoded at 3000 | **Fixed** (`315518d`) | Not on any plan's list; found the hard way. `playwright.config.ts` now reads `PORT`. Another project in the same vault runs its own `next dev` on 3000, and `reuseExistingServer` adopted it mid-run — the suite reported 404s on every route rather than "this is not my server". Cost two debugging sessions |

### 6.5 — the lint re-deferral, decided

`npm run lint` exits 1 on exactly one error: `react-hooks/set-state-in-effect` at
`components/smear-heading/use-prefers-reduced-motion.ts:23`. One warning also stands
(`hasOwnOgImage` unused in `prerender.test.ts`, a leftover of §5.3's rewrite).

**Re-deferred.** `components/smear-heading/` must come out of this phase with an empty diff — every
plan in the phase asserts that, and `git diff --stat components/smear-heading/` is empty across the
whole milestone. The module's behaviour is covered by measured Playwright specs whose
reduced-motion handling was itself hard-won: Playwright's `reducedMotion` context option does not
reliably affect `matchMedia` in this environment, and the working approach
(`page.emulateMedia({ reducedMotion: "reduce" })` before `goto`) was arrived at empirically.
Touching that module at milestone close to satisfy a lint rule trades a real regression risk for a
cosmetic gain.

**Unblocking condition:** fix it in a change that also re-runs `tests/reduced-motion.spec.ts` and
`tests/smear-heading.spec.ts`, in a commit that touches nothing else. Owner: whoever next has
reason to open that module.

### 6.6 — the `_pm/kanban.md` discrepancy

`CLAUDE.md` states the working agreement: *"Update `_pm/kanban.md` when completing tasks."* The
file **does exist** (`_pm/kanban.md`, last updated 2026-08-31 at Phase 5's close) — research
assumption A10 recorded it as absent, which was true when written and is no longer.

**Recorded, not silently resolved.** The real discrepancy is that `_pm/kanban.md` and `.planning/`
are two tracking surfaces for one project, and `.planning/` has been the load-bearing one for all
six phases. `_pm/kanban.md` is updated at Phase 6's close (plan 06-12) so it is not left stale, but
whether to keep two surfaces is the user's call, not this audit's.

---

## Verdict

**The milestone delivered:** a live, deployed, typographically deliberate site at
`guillemgelabert.com` with a real content pipeline (5 files, 2 locales, draft rule proven on both
sides of the `NODE_ENV` boundary), a bylined case study in two languages, a curated backlog, a work
list, a CV page with a portrait slot, a three-channel contact block with an entity-encoded email, six
real security headers whose CSP string is identical across a pure function, a unit test and a live
response, a sitemap, a robots file, per-post social cards, server-rendered localised 404s, and 342
assertions across three tiers.

**What remains open, and who owns it:**

| Open item | Owner | Blocks |
|---|---|---|
| Five placeholder values → real (email, LinkedIn, CV, photograph, positioning sentence) | **User** | G2–G6, G14, and therefore FIND-02 |
| Editorial pass over both bylined case studies | **User** | G12 |
| Backlog copy review (`COPY_REVIEWED`) | **User** | G11 |
| Two work-list annotations, drafted not reviewed | **User** | Nothing mechanically — quality only |
| The FIND-02 robots flip | **User**, after the above | — |
| Slack unfurl, screen-reader pass, optical sign-off | **User** — see §7 for what was pre-verified | Nothing |
| BUILD-07: attach the domain to `web`, add HSTS `preload` | v2 | — |
| PROF-06: print stylesheet | v2 | — |
| Lint debt at `use-prefers-reduced-motion.ts:23` | Deferred, §6.5 | — |
| Whether `_pm/` and `.planning/` should both exist | **User**, §6.6 | — |

**Suite at close:** 131 unit · 38 build-tier (0 skipped) · 173 Playwright · `npx tsc --noEmit`
clean · `npm run lint` at its one known deferred error.

---

## Section 7 — the three manual rows (plan 06-12, Task 1)

Three checks no automated tier can make. Each is recorded below with **what was mechanically
pre-verified**, so the human pass is a judgment on appearance rather than a hunt for facts, and with
an explicit statement of what remains outstanding.

| Row | Requirement | Status | Date |
|---|---|---|---|
| 7.1 Slack unfurl | FIND-01, G7 | ⚠️ **Pre-verified mechanically; owner's visual judgment outstanding** | 2026-09-01 |
| 7.2 Screen-reader email pass | PROF-03 | ⚠️ **Mechanism verified; the address is a placeholder, so the row is deferred** | 2026-09-01 |
| 7.3 Optical sign-off, 375px and 1440px | D-02 | ⚠️ **Agent-verified at both widths; owner's sign-off outstanding** | 2026-09-01 |

### 7.1 — the unfurl

Everything an unfurl reads was fetched and checked from the live origin (§5.3): all three cards
resolve 200 as `image/png`, decode to exactly 1200×630, are absolute URLs on the canonical host, and
are three distinct files. Every route carries `twitter:card="summary_large_image"`, a title and a
description, and no two of the six routes share a description
(`prerender.test.ts` asserts that last one).

**What a human still has to do, and why it is not optional:** paste
`https://guillemgelabert.com` and `https://guillemgelabert.com/writing/the-chart-therefore-changes`
into Slack and look. Every assertion above can pass while the card *looks* wrong — Humane failing to
render, the name cropped, the ink-on-paper treatment reading as a blank rectangle at thumbnail size.
That is a judgment about appearance, and it is exactly the class of thing PITFALLS #8 exists for.

**Note for that pass:** the site is `noindex`, which does not affect Slack unfurling (Slackbot reads
OG tags regardless), so this can be done now rather than after the flip.

### 7.2 — the screen-reader pass

`EMAIL` is currently `lorem.ipsum@example.com`, a deliberate placeholder on RFC 2606's reserved
domain. The **mechanism** is fully verified: `tests/contact.spec.ts` asserts the mailto anchor is
reachable by Tab, shows the measured 2px accent focus ring, resolves to exactly one element by
accessible name, and has `textContent` and `href` both equal to the un-escaped address — which is
what proves the entity obfuscation decodes correctly rather than leaking `&#64;` into the accessible
name. `prerender.test.ts` separately asserts the served **bytes** carry `&#64;`/`&#46;` and never the
double-escaped `&amp;#` signature.

**Deferred**, and deliberately: reading `lorem.ipsum@example.com` aloud in VoiceOver would prove the
mechanism a third time and tell you nothing about the address you will actually publish. Blocked on
`HANDOFF-user-supplied.md` row 1. Do this pass **after** the real address lands, before the flip.

### 7.3 — the optical sign-off

Performed by the agent at 375×667 and 1440×900 against the live origin, with rendered geometry
measured rather than eyeballed. Findings recorded in `06-12-optical.md`.

**This is not a substitute for the owner's eye**, and is not recorded as one. What it can establish
— that nothing overflows, that the contact rows sit in the landing's rhythm, that `/cv` reads as a
laid-out page, that no third weight or rounded corner appeared — it establishes. What it cannot
establish is whether the page reads as *authored*, which is the actual question and is why every
prior phase closed with this row.

**Standing caveat for that pass:** the CV, the positioning line and the contact values are lorem
ipsum. Judge the **typography, rhythm and hierarchy**; the words are placeholders by design and
their being placeholders is not a defect to report.
