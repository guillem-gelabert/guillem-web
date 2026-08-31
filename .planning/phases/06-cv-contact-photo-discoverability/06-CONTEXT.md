# Phase 6: CV, Contact, Photo & Discoverability - Context

**Gathered:** 2026-08-31
**Status:** Ready for planning

<domain>
## Phase Boundary

The last unbuilt surfaces are filled and the site is made findable and shareable: the
`/cv` page gains real content and a photograph, the `#contact` landing section gains real
channels, `next.config.ts` gains a real security header set, and the site gains social
metadata, a sitemap, a robots file, and — conditionally — its first indexable deploy.

This phase also runs the milestone's final integration and cross-link audit against
PROJECT.md's Out-of-Scope list.

Covers **PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, BUILD-04, FIND-01, FIND-02**.

> **Requirement-list correction.** The phase brief handed to discussion listed BUILD-01,
> BUILD-02, BUILD-03 and BUILD-05 against this phase. Those are all marked `[x]` complete
> against Phase 1 in `.planning/REQUIREMENTS.md` and in the traceability table. ROADMAP.md
> is authoritative and lists PROF-01…05, BUILD-04, FIND-01, FIND-02. The planner works
> from the ROADMAP set. BUILD-01/02/03/05 are *regression surface* for this phase's audit,
> not deliverables.

**Creates nothing that already exists.** Phase 3 shipped `/cv` as a real route (`<h1>CV`
in Humane, trail-carrying, stub body) and `#contact` as a real landing section with a stub.
Phase 6 replaces stub copy with real content on surfaces that are already routed, already
typeset, already in the contents list, and already linked from `/`.

**Explicitly NOT this phase:**
- The custom-domain cutover (BUILD-07, v2) — see D-3.4.
- A print stylesheet for the CV (PROF-06, v2) — see D-1.4.
- The positioning sentence (HOME-01) — user-authored, no phase. Re-asserted here only as
  a launch-gate row.
- The case study (Phase 4) and the backlog (Phase 5). This phase depends on both landing,
  and gates on Phase 4 specifically.

</domain>

<decisions>
## Implementation Decisions

Four grey areas, nineteen questions. Every recommendation below was auto-accepted under
the autonomous-run directive. The four decision tables as presented are reproduced
verbatim in this phase's discussion record; the accepted answers are restated here as
the binding decisions.

---

### Area 1 — The CV

- **D-1.1: The CV is an HTML page only. No PDF asset ships.** `/cv` already exists and is
  already in the contents list. A PDF is a new asset class with no build step to produce
  it, no way to keep it in sync with the page, and no design-system representation — and
  PROJECT.md's Out-of-Scope reasoning (an obfuscated email beats a contact form because it
  does the same job with no backend) applies identically here. A recruiter who wants a file
  uses Cmd-P.
  - Rejected: HTML page plus a hand-maintained PDF in `public/` (two sources of truth, and
    the PDF silently goes stale first). Rejected: PDF only (fails PROF-01's wording — "as a
    page on the site" — and is unindexable, unlinkable and unreadable on a phone).

- **D-1.2: CV content is a typed data module, not markup — `lib/cv.ts`.** Same posture as
  Phase 3 D-05 for work-list entries: adding a role later is a content change, not a layout
  change. Shape: `experience[]` (`years`, `role`, `org`, `place`, `note`), `education[]`,
  `languages[]`, `selectedWork[]`. `selectedWork` re-uses the Phase 3 work-list data and the
  Phase 4 case-study slug rather than restating them — the CV cross-links, it does not
  duplicate.

- **D-1.3: Depth is reverse-chronological roles with a one-line note each, not a duties
  list.** Years, role, organisation, place on one Label-role line; one Body-role line
  underneath saying what the work was about. This is the same "about, not built-with" rule
  WORK-02 already imposes on the work list (Phase 3 D-09), applied to employment. It is
  also the only depth the design system can express without inventing a fifth type size or
  a second column, both of which are prohibited.
  - Row rhythm reuses the work list's shipped treatment: 32px air / 1px `--color-rule` /
    32px air. No new rule weight (Phase 3 ships exactly three; a fourth is prohibited).

- **D-1.4: No print stylesheet. PROF-06 stays v2 — but the CV is built so the deferred
  work is stylesheet-only.** PITFALLS #16 is real (a recruiter hitting Cmd-P is a likely
  action), and the pull to "just add `@media print` while we're here" is exactly the scope
  creep the v2 boundary exists to stop. The compromise is structural, not stylistic: the CV
  route uses semantic sectioning, no negative margins, no background-dependent contrast, and
  no element whose legibility depends on a screen-only treatment. A later print pass is then
  a stylesheet addition with no markup change. Recorded as a v2 note, not built.

- **D-1.5: The CV is English only, and lives at `/cv` in the `(en)` group.** Already
  decided upstream — Phase 3's UI-SPEC states the landing view and `/cv` are English-only in
  v1 and that there is deliberately no `/lebenslauf`. Restated here because it has a direct
  consequence: **CV and contact copy must NOT be added to `UI` in `lib/locales.ts`.** That
  dictionary is `Record<Locale, UiCopy>` and is compile-time enforced across both locales,
  so extending it would force a German translation of every CV string into existence. For
  English-only surfaces that means inventing German copy nobody asked for. English-only
  strings live in `lib/cv.ts` / `lib/contact.ts` alongside their data.

- **D-1.6: The CV gets no landing-surface copy beyond the existing nav item.** PROJECT.md's
  Key Decisions table is explicit — "the CV exists as a page, it does not get landing-surface
  copy" — and BRIEF §1 is the reasoning ("the site says what the CV can't"). The `CV` entry
  in the five-item contents list is the entire landing footprint. No summary block, no
  "download my CV" call to action, no duplication of the employment record on `/`.

---

### Area 2 — Contact and identity

- **D-2.1: Three channels, exactly the three the requirements name — email, GitHub,
  LinkedIn.** No Twitter/X, no Mastodon, no Bluesky, no phone, no location, no CV-download
  link, no contact form (Out of Scope by name). A fourth channel is a content change to
  `lib/contact.ts`, not a layout change.

- **D-2.2: Presented as a labelled list of plain links — no icons, because there are no
  icons.** The design system ships zero icons and zero SVG site-wide; `←` (U+2190) is the
  only non-Latin character anywhere. Each channel is one line: a Label-role name (`Email`,
  `GitHub`, `LinkedIn`) and the value as a `.link-quiet` anchor, using the link primitive
  Phase 3 shipped specifically so Phases 5 and 6 would have a settled answer. Label-role
  links on their own line take `display: inline-block; padding-block: 4px` for the WCAG
  2.5.8 target size, exactly as the spec already prescribes.
  - The same block renders in two places — the `#contact` section on `/` and the foot of
    `/cv` — from one component reading one data module. It is not typed twice.

- **D-2.3: Email obfuscation is server-rendered entity encoding, with the `mailto:` href
  assembled at render time from parts.** The address ships as a real, selectable,
  screen-reader-readable text node with `@` and `.` written as HTML entities in the emitted
  markup. This is PITFALLS #5's own recommendation and it rules out the three named failure
  modes by construction: no client-side JS reassembly (defeated by any headless scraper and
  broken without JS), no CSS reversal (`direction: rtl` / pseudo-element `content`, both of
  which garble in screen readers and cannot be copied), and no image (unselectable, invisible
  to assistive tech, and OCR-readable anyway).
  - **Acceptance is the three-part test PITFALLS #5 names, and it is a required plan step:**
    tab to it with a keyboard, read it with a screen reader, select and copy it. All three
    must work. A Playwright assertion covers keyboard reachability, the accessible name, and
    that `textContent` equals the real address; the screen-reader pass is a recorded manual
    check.
  - Explicitly accepted: a determined scraper gets any address a human can reach. The goal
    is deterring cheap regex harvesting, not cryptographic protection.

- **D-2.4: One photograph, on `/cv` only, below the `<h1>`.** Not on the landing view.
  Three reasons, in order: (a) a portrait above the fold on `/` is the single most
  recognisable move of the generic developer portfolio, which is anti-goal #5 and PITFALLS
  #15's named drift; (b) it would become the LCP element on a page whose entire argument is
  that it is text-first (PITFALLS #14); (c) `/cv` is where a portrait is expected and where
  the reader who wants one is already looking. PROF-02 requires that a visitor *can* see a
  photograph, and `/cv` is one click from the contents list on `/`.
  - Rejected: portrait in the `#contact` section on `/` (same LCP and drift problems, one
    scroll further down). Rejected: portrait on both (one image site-wide is the restraint
    the rest of the system is built on).

- **D-2.5: Plain `<img>` with explicit `width`/`height`. No `next/image`, no `sharp`, no
  new dependency.** `components/mdx/figure.tsx` already made and documented exactly this
  decision for content images, for exactly this reason (Next 16 production image optimization
  requires `sharp`; the phase target was zero new runtime deps). Phase 3 continued it as a
  standing posture — "introduces no new npm dependency of any kind". Reversing it for one
  portrait would add a production runtime dependency whose absence fails silently with a 500
  (PITFALLS #4), to optimize a single asset that can simply be exported at the right size.
  - The file is a pre-sized raster committed to `public/`. Square corners, no border, no
    shadow, no radius — the `Figure` treatment, which `tests/unit/prose-contract.test.ts`
    already enforces as `border-radius: 0`.

- **D-2.6: The portrait MUST reserve its space — this is a trail-correctness requirement,
  not only a CLS one.** Phase 3's UI-SPEC names this phase directly: `documentTop` is captured
  once per registered heading after `document.fonts.ready` and is never recomputed, so any
  post-mount layout change *above* a trail-carrying heading leaves that heading smearing from
  a stale origin. The `/cv` `<h1>` carries the trail. Mitigation is belt-and-braces: the
  portrait sits *below* the `<h1>` (so even a late layout change cannot move it), **and** it
  carries explicit intrinsic `width`/`height` attributes **and** an `aspect-ratio` on its
  container. A Playwright assertion that the `/cv` heading's smear origin is unchanged before
  and after image load is the cheap way to prove it.

---

### Area 3 — Discoverability

- **D-3.1: One site-metadata module, one metadata factory — the two root layouts stop
  duplicating.** `app/(en)/layout.tsx` and `app/(de)/layout.tsx` are hand-copied and each
  hardcode `metadataBase: new URL("https://web-production-9cedb.up.railway.app")`. This phase
  introduces `lib/site.ts` (`siteUrl`, `siteName`, `siteDescription` per locale) and a small
  factory both layouts call. Every subsequent metadata concern — OG defaults, Twitter card,
  icons, canonical, the eventual domain — then has exactly one change point instead of two
  files to keep in sync.
  - Title strategy: root sets `title.template = "%s — Guillem Gelabert"` and
    `title.default = "Guillem Gelabert"`. The existing per-route titles already hand-build
    that suffix (`"Writing — Guillem Gelabert"`) and switch to bare titles under the template.
  - Description strategy: hand-written per route. The current root descriptions are
    `"Developer."` / `"Entwickler."`, which are placeholders and would ship as the Slack
    unfurl text — a direct FIND-01 failure. They are replaced with a description of the
    *site's artifacts* rather than a claim about the person, so it does not trespass on
    HOME-01's user-authored positioning sentence. Working text (replaceable, listed as a
    soft placeholder): *"Data visualisation, writing and interactive work by Guillem
    Gelabert."*

- **D-3.2: The social card is generated, not a committed raster — `ImageResponse` via
  `next/og`.** This keeps the phase's only new *committed* raster asset the photograph, uses
  a module that already ships inside Next (no new dependency), and makes the card
  automatically correct per route instead of one generic image for the whole site. One
  builder in `lib/og.tsx`, wired as four route segments: `app/(en)/opengraph-image.tsx`
  (covers `/`, `/cv`, `/writing` by segment inheritance), `app/(de)/opengraph-image.tsx`,
  and a per-post override under each `[slug]` so the case study — the URL most likely to be
  pasted — unfurls with its own title and standfirst.
  - Design: the site's own grammar, not a template. Ink `#000000` on paper `#ffffff`, the
    name in Humane, one line in the body face, one 1px ink rule. No accent (`#C1272D` is
    reserved to focus rings and link hover, and an OG card has neither). 1200×630.
  - **Two known font risks the planner must resolve, not discover.** (a) Satori needs font
    data as a buffer; `Humane-VF.ttf` is a local file at `app/fonts/` and works, but
    Newsreader arrives via `next/font/google` and has no file to read — using it in the card
    means committing a static Newsreader `.ttf` to `app/fonts/` for OG use only (OFL,
    redistribution permitted). (b) Satori renders a variable font at its default instance,
    so Humane will not come out at the design system's 530; Humane's licence forbids
    modification, so instancing it is not available. Both are acceptable — but the card must
    be rendered and *looked at* once, not assumed.
  - Documented fallback if satori's font handling misbehaves: render the card once with
    Playwright (already a devDependency) at 1200×630 and commit the PNG. Recorded so the
    planner has an exit that does not add a dependency.
  - Root metadata also gains `twitter: { card: "summary_large_image" }`. Absolute URL
    resolution is what `metadataBase` exists for and is the thing PITFALLS #8 says breaks
    invisibly in dev.

- **D-3.3: `app/sitemap.ts` and `app/robots.ts`, both generated from the same content
  module the indexes already use.** The sitemap enumerates `/`, `/cv`, `/writing`, `/texte`
  and every published post in both locales via `lib/content.ts`'s `publishedFor` — so
  `draft: true` (Phase 2 D-11) keeps a piece out of the sitemap for free, and no second
  source of truth appears. `robots.ts` allows all, disallows `/type`, and points at the
  absolute sitemap URL.
  - **Excluded from the sitemap and disallowed in robots:** `/type` (Phase 1 D-05 built it
    as a deliberately non-indexed specimen). **Deleted outright, not excluded:**
    `app/(en)/probe404/` — a two-file debug leftover currently live in the app directory.
    Also deleted: the five unused Next scaffold SVGs in `public/`.

- **D-3.4: v1 stays on the Railway URL. The apex is NOT cut over in this phase — but the
  hostname stops being hardcoded.** There is a genuine conflict upstream: Phase 2's D-03
  called the cutover "Phase 6 work", while PROJECT.md's Constraints, REQUIREMENTS.md's
  Out-of-Scope table, and BUILD-07's placement in v2 all say v1 ships on the generated URL.
  It resolves against the cutover, for a reason Phase 2 did not have: Phase 1's context
  records that **`guillemgelabert.com` is currently attached to a different Railway service
  (`guillem-edge`, a separate repo), on both apex and `www`.** Cutting over means detaching a
  live domain from a service this milestone does not own and cannot test. That is not a
  decision an autonomous run gets to take.
  - What ships instead: `siteUrl` reads `process.env.NEXT_PUBLIC_SITE_URL` and falls back to
    `https://web-production-9cedb.up.railway.app`, and the variable is set explicitly in the
    Railway production environment — which is PITFALLS #8's own prescription and the named
    "Integration Gotcha" for Railway env vars. The cutover then becomes a one-variable change
    plus a DNS move, with no code change at all.
  - Consequence for HSTS: see D-4.1.

- **D-3.5: The favicon is replaced.** `app/favicon.ico` is still the untouched Next.js
  scaffold icon. It renders in the browser tab and in most link unfurls, which puts it
  squarely inside FIND-01, and shipping the framework's default mark is the precise
  "framework-default rather than authored" tell (HOME-05) that the entire design system
  exists to avoid. Replaced with `app/icon.tsx` — a `G` in Humane, ink on paper, via the same
  `ImageResponse` mechanism as D-3.2, so it introduces no new asset class and no new
  dependency. This is not an icon in the prohibited sense: the "zero icons, zero SVG" rule
  governs page elements, and a favicon is not one.

- **D-3.6: The robots flip is the last plan in the phase and is mechanically gated.** See
  the Launch Gate below. `robots: { index: false }` sits on both root layouts and is
  inherited by every route; flipping it means editing both files, and it will **break
  `tests/build/prerender.test.ts:128`**, which asserts the noindex survived the two-root-layout
  split. That test is inverted in the same commit as the flip, never before it.

---

### Area 4 — Security headers and the final audit

- **D-4.1: A lean, fully-justified header set in `next.config.ts` `headers()`. Every header
  ships for a reason; the omissions are deliberate and documented.** `headers()` is BUILD-04's
  stated mechanism and is precisely why `output: 'export'` was ruled out in REQUIREMENTS.md.
  Not middleware — none exists, and adding one for headers alone buys nothing.

  **Ships:**
  | Header | Value | Why |
  |---|---|---|
  | `Content-Security-Policy` | see D-4.2 | The substance of BUILD-04 |
  | `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Two years, no `preload` |
  | `X-Content-Type-Options` | `nosniff` | Cheap, universally correct |
  | `Referrer-Policy` | `strict-origin-when-cross-origin` | Current default made explicit |
  | `Permissions-Policy` | `accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()` | The site uses none of them |
  | `Cross-Origin-Opener-Policy` | `same-origin` | Free; the site has no `target="_blank"` at all |

  **Deliberately omitted, and this is the interesting half:**
  - **No `preload` on HSTS.** Preload is a one-way door submitted per registrable domain, and
    the site is on a Railway-generated subdomain it does not control (D-3.4). Adding `preload`
    belongs with BUILD-07's cutover, not here.
  - **No `X-Frame-Options`.** Superseded by CSP `frame-ancestors`. Phase 2's context records
    this as the author's own updated editorial position (the 2020 post is stale on exactly
    this point).
  - **No `X-XSS-Protection`.** Deprecated and now considered harmful — again the author's own
    recorded position.
  - **No `Cross-Origin-Resource-Policy`.** `same-origin` would risk blocking a headless-browser
    link unfurler from fetching the generated OG image, which would silently defeat FIND-01 —
    the exact class of invisible failure PITFALLS #8 warns about. Not worth it for a site that
    serves no cross-origin subresources.
  - **No `X-DNS-Prefetch-Control`, no COEP.** Nothing on the site needs either.
  - The omissions matter because the audience opens dev tools. A short list where every entry
    is current reads better than a long list carrying two headers the site's own author has
    written about being obsolete.

- **D-4.2: CSP resolves the inline-style collision with `style-src 'self' 'unsafe-inline'`,
  and the same concession is required for `script-src` — both documented in place.** This is
  the decision Phase 2 explicitly deferred here (02-UI-SPEC "Forward note for Phase 6").

  Policy:
  ```
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'none';
  object-src 'none';
  upgrade-insecure-requests
  ```

  - **`style-src` — there are TWO inline-style consumers, not one.** Shiki emits a
    `style="color:#…"` attribute on *every* token span (shikijs/shiki#671, open, no clean
    fix), and `remark-gfm` emits inline `text-align` on aligned table cells. Both were
    confirmed present by Phase 2's own test assertions. Under CSP Level 2+, `style-src 'self'`
    blocks inline style *attributes*, so the visible symptom of getting this wrong is that
    every code block on the site renders as undifferentiated ink the moment the header ships.
    Rejected alternatives: `'unsafe-hashes'` plus a per-attribute hash (impractical at token
    granularity, and `'unsafe-hashes'` is itself a weakening); a rehype transformer rewriting
    Shiki's inline styles to classes (a real option, but it is a Phase 2 pipeline change and
    it does not touch remark-gfm's alignment styles, so it would not even let `style-src`
    tighten).
  - **`script-src` — Next.js App Router inlines the RSC flight payload** as
    `<script>self.__next_f.push(…)</script>`. `script-src 'self'` blocks it and hydration
    dies. The nonce route needs `middleware.ts` (does not exist), must thread a nonce through
    *two* root layouts, and forces dynamic rendering on every route — which forfeits static
    generation on a site that is entirely static content. Rejected for v1; recorded as the
    v2 improvement.
  - **The honest framing, which goes in a comment block in `next.config.ts`:** this site has
    no user input, no forms, no third-party scripts and no third-party origins of any kind.
    The XSS surface `'unsafe-inline'` guards is close to nil here, and the policy compensates
    where it costs nothing — `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`,
    `frame-ancestors 'none'`. Stating the tradeoff beats pretending it does not exist,
    particularly for a reader who came from the security-headers writing.

- **D-4.3: The CSP is built by one pure function so it can be unit-tested exactly.**
  `buildCsp({ dev })` in `lib/`, unit-tested with `node --test` against the exact production
  string. This matters because `playwright.config.ts` runs its `webServer` as `npm run dev`,
  so a Playwright test cannot observe the production policy — and dev needs relaxations
  (HMR websocket, `'unsafe-eval'`) that must never leak into production. Three-layer
  verification: unit test on the string, a Playwright test that the headers are *delivered*
  on a real response with the right directives present, and a post-deploy `curl` against the
  Railway URL recorded in the phase's verification document. PITFALLS' own prescription is
  "verified with a header-check tool post-deploy" — believing the config is not verification.
  - **One regression test is non-negotiable:** after the CSP ships, assert that a `<pre>` on
    the fixture post still carries real token colouring. Monochrome code blocks are the exact
    visible symptom of getting `style-src` wrong, and they are easy to miss.

- **D-4.4: The final audit is a written checklist with a verdict per row, executed as a
  mix of automated tests and one recorded manual pass.** PITFALLS #15's rule is the design:
  check each Out-of-Scope entry *by name*, because "does this look like generic-portfolio
  drift" is a judgment call and "is there a card grid" is not.
  1. **Cross-link integrity, automated.** Every HOME-03 destination reachable from `/`
     (`#work`, `/writing`, `#backlog`, `/cv`, `#contact`); every internal link on every route
     in both locales resolves non-404; every `alternates` / `hreflang` target resolves;
     `x-default` points at a live URL on every route.
  2. **Out-of-Scope roll-call, one row per entry, verdict + evidence.** Card grids;
     three-across feature rows; contact form; now-playing; post type/tag taxonomy;
     blog-primary reverse-chronological homepage; per-item backlog dates or states; headless
     CMS or database; `output: 'export'`; animation library, state manager, component library.
     Plus `components.json` must not exist.
  3. **Design-system roll-call.** Four type sizes and no fifth; two weights and no 600/700;
     seven spacing tokens plus the three declared off-grid exceptions and no fourth;
     `#C1272D` appearing only in focus rings and link hover; zero icons and zero in-page SVG;
     every `border-radius` 0; no `!important`. Most of this is already enforced by
     `tests/unit/prose-contract.test.ts` — the audit's job is the surfaces that test does not
     read.
  4. **BRIEF §8's trap, one gut-check.** No ornamental element anywhere gained tick marks,
     axis lines or plotted-point styling. Currently trivially true: no decorative element
     ships at all.
  5. **Live-deploy checks, not local ones.** Headers verified by `curl` against the Railway
     URL; the URL actually pasted into Slack (or a link-preview debugger) and the unfurl
     looked at. PITFALLS #8 exists because nobody pastes their own localhost link into Slack.
  6. **Housekeeping.** `/probe404` deleted, scaffold SVGs deleted, scaffold favicon replaced,
     `package.json` name still `"gw-scaffold"` (rename or consciously keep), and the
     known lint debt in `components/smear-heading/use-prefers-reduced-motion.ts` recorded in
     Phase 2's `deferred-items.md` either fixed or re-deferred with a decision.

---

### Launch Gate — Phase 6 is BLOCKED unless every row passes

The robots flip is the single irreversible act in this milestone: a half-finished site that
gets indexed and cached is a worse first impression than nothing, and de-indexing is slow.
Phase 1's D-07 created this gate and Phase 3's UI-SPEC attached a hard condition to it. It is
mechanical on purpose — no row is a judgment call, and the phase reports blocked with the
exact failing rows rather than shipping past them.

| # | Gate | Mechanically checked by |
|---|---|---|
| G1 | `/writing` is not empty — at least one non-draft post exists in EN | `publishedFor("en").length > 0` |
| G2 | HOME-01's positioning sentence is real — `POSITIONING_PLACEHOLDER` no longer renders on `/` | grep + rendered-DOM assertion |
| G3 | `lib/cv.ts` `experience` is non-empty | `experience.length > 0` |
| G4 | `lib/contact.ts` `email` is non-null | `email !== null` |
| G5 | `lib/contact.ts` `linkedin` is non-null | `linkedin !== null` |
| G6 | The portrait file exists in `public/` at its declared dimensions | file stat + `<img>` renders |
| G7 | The OG image resolves 200, `image/png`, 1200×630, at an absolute URL | fetch against the deploy |
| G8 | Security headers present on a live response | `curl` against the Railway URL |
| G9 | Code blocks still render token colour with CSP enforced | Playwright assertion |
| G10 | `/type` and `/probe404` are not in the sitemap; `/probe404` no longer exists | sitemap parse + route check |

**G1 depends on Phase 4.** If the case study has not landed when this phase reaches the flip,
the flip does not ship and the phase reports blocked. Everything upstream of the flip —
CV, photograph, contact, headers, metadata, sitemap — ships regardless, because all of it is
safe under `noindex` and none of it depends on the flip.

**G2–G6 are the user-supplied rows.** They are why the gate is mechanical: an autonomous run
must be able to build every surface without ever inventing a value for any of them.

---

### The no-fabrication rule for this phase

This is the one phase in the milestone that touches real personal facts. The rule the planner
inherits: **never synthesise a personal fact, and never let a missing one produce a broken
affordance.**

- **Established, may ship as fact:** the name `Guillem Gelabert` (already on the nameplate),
  the GitHub profile `https://github.com/guillem-gelabert` (from the repo remote and the
  legacy `guillem-gelabert.github.io` Pages site), the two live projects and their URLs
  (verified in Phase 3 D-06), the case-study slug (Phase 4), and the site itself.
- **`[USER-SUPPLIED]`, must never be invented:** the public contact email, the LinkedIn
  profile URL, every row of employment history, education, languages, and the photograph
  file. A fabricated employment history or a wrong email on a live job-hunting site is a
  serious, hard-to-detect failure; a labelled absence is not.
  - Note on the email specifically: an employer address is on record in the environment.
    It is deliberately **not** used. A work address at a current employer is the wrong
    channel for a job hunt and is not the user's to publish here by inference.
- **Absence renders as absence, not as a placeholder and not as a broken affordance.** The
  contact block renders only the channels that exist — the same pattern
  `components/language-switch.tsx` already ships, returning `null` rather than a disabled
  control, on the recorded principle that "a dead affordance is worse than no affordance."
  With `experience` empty, `/cv` renders the deliberately-typeset stub line it already has
  today (Phase 3 D-02's posture: placeholder content on a live URL must look authored, never
  lorem ipsum and never an empty element).
- **No generated portrait, under any circumstances.** If the photograph is absent, the slot
  renders nothing. A synthetic or stock face on a personal job-hunting site is an
  impersonation artifact, not a placeholder.

---

### Claude's Discretion

- The exact `lib/cv.ts` field names and whether `education` / `languages` are separate
  sections or one combined block at low row counts.
- Where the contact block sits within `/cv` (foot is the assumption; head beside the portrait
  is available).
- The portrait's aspect ratio and rendered width — nothing upstream specifies one, only that
  it must be explicit.
- OG card composition within D-3.2's constraints (ink on paper, name in Humane, one rule).
- Whether `package.json`'s name changes from `"gw-scaffold"`.
- Exact `Permissions-Policy` membership beyond the listed set, provided every entry is a
  feature the site genuinely does not use.
- Plan decomposition and wave structure, subject only to the flip being last.


### Carried in from Phase 2 (coordinator decision, 2026-08-31)

- **CR-01 — localised `[slug]` 404s must server-render.** Phase 2's code review found
  that `/writing/<unknown>` and `/texte/<unbekannt>` return `<html id="__next_error__">`
  with no `lang` and an empty body when JavaScript is disabled — a WCAG 3.1.1 Level A
  failure. The cause is framework-level in Next 16.3.3 and was isolated four ways; full
  measurements are in `.planning/phases/02-content-pipeline/deferred-items.md`.
  `dynamicParams = false` fixes the rendering but forces English error copy onto German
  URLs, contradicting `02-UI-SPEC.md`'s Error State row. **This phase must fix it in the
  Node-runtime `middleware.ts` it already builds for security headers**, by rewriting
  unmatched localised slugs to a per-locale 404 page with a 404 status. This is the only
  option that preserves the German copy and closes the accessibility defect.
  Add it to this phase's launch-gate checklist.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The gates this phase closes (already decided upstream — plan against, do not reopen)
- `.planning/phases/01-deploy-foundation-design-system/01-CONTEXT.md` — **D-07**, the
  `robots: { index: false }` flip and its "Planner note: FIND-02's plan must explicitly flip
  this flag, or launch ships noindex — the worse failure". Also the deferred note recording
  that `guillemgelabert.com` is attached to the **`guillem-edge`** service, which is what
  makes D-3.4 a reassignment rather than a setup.
- `.planning/phases/02-content-pipeline/02-UI-SPEC.md` — the **"Forward note for Phase 6
  (BUILD-04)"** on Shiki's per-token inline `style` attributes, shikijs/shiki#671, and the
  monochrome-code-block symptom. Read this before writing a single CSP directive.
- `.planning/phases/02-content-pipeline/02-05-PLAN.md` threat **T-02-24** — the same
  collision recorded as a transferred risk, naming *both* consumers (Shiki tokens and
  `remark-gfm` table alignment).
- `.planning/phases/03-work-list-landing-skeleton/03-UI-SPEC.md` — the **`documentTop`
  forward note naming PROF-02 by name** ("the photograph of Guillem lands on a surface above
  trail-carrying headings; it must reserve its space or the trail below it desyncs"), the
  five-item contents list and its fixed order, `.link` / `.link-quiet`, the `/cv` and
  `#contact` stubs this phase fills, and the launch gate wording.

### Design direction
- `BRIEF.md` — **§1** the allocation principle ("the site says what the CV can't"; the CV
  gets no landing surface), **§5** design principles, **§8** the aesthetic direction and the
  "decoration with axes" trap, **§9** anti-goals (#1 and #5 both bear on this phase). BRIEF
  says **nothing** about portraits, CV format or contact presentation — those decisions are
  original to this phase, not inherited.
- `.planning/PROJECT.md` — Constraints and Key Decisions; the **Out of Scope list is the
  named checklist** the final audit walks row by row (D-4.4, PITFALLS #15).

### Pitfalls that land in this phase
- `.planning/research/PITFALLS.md` **#5** — email obfuscation; the three failure modes and
  the three-part acceptance test. Directly constrains D-2.3.
- `.planning/research/PITFALLS.md` **#8** — OG/Slack unfurl; `metadataBase`, the env-var
  prescription, non-additive per-route `robots` merging, and "paste the live URL into Slack".
  Constrains D-3.1/3.2/3.4.
- `.planning/research/PITFALLS.md` **#14** — the photograph as uncontrolled LCP. Constrains
  D-2.4/2.5/2.6. (Its `next/image` + `sharp` prescription is knowingly declined per D-2.5;
  the CLS half is honoured in full.)
- `.planning/research/PITFALLS.md` **#15** — generic-portfolio drift; "check against the
  Out-of-Scope list *by name* — if a section matches an explicitly excluded pattern, that's
  the signal, not a judgment call". This is the audit's design.
- `.planning/research/PITFALLS.md` **#16** — CV under print. Deferred per D-1.4, mitigated
  structurally.
- `.planning/research/PITFALLS.md` **#17** — preview deploys getting indexed. Not a v1
  blocker (single production service) but relevant the moment the flip lands.

### Requirements
- `.planning/REQUIREMENTS.md` — PROF-01…05, BUILD-04, FIND-01, FIND-02; the Out-of-Scope
  table; and **PROF-06 at line 94** (print stylesheet, v2) and **BUILD-07 at line 103**
  (custom domain, v2), both of which this phase must decline.
- `.planning/ROADMAP.md` § Phase 6 — the five success criteria this phase is verified against.

### Code this phase must not break
- `tests/build/prerender.test.ts:128` — asserts the noindex survives on both indexes. It is
  inverted in the same commit as the flip.
- `tests/unit/prose-contract.test.ts` — two font sizes, two weights, one tracking value, all
  `border-radius: 0`, no `!important`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`/cv` and `#contact` already exist.** `app/(en)/cv` ships an `<h1>CV` via `SmearTitle`
  with a typeset stub body; `#contact` is a real landing section with a `.section-head` and
  a stub. This phase replaces copy inside existing, already-linked structure.
- **`components/mdx/figure.tsx`** — the shipped answer to "how does this site render a
  raster". Plain `<img loading="lazy" decoding="async">` with explicit `width`/`height`, an
  `eslint-disable` for `@next/next/no-img-element`, and a comment at `:10-16` recording why
  `next/image` was declined (Next 16 production optimization needs `sharp`; zero new runtime
  deps). The portrait follows this precedent.
- **`components/language-switch.tsx`** — the null-rather-than-disabled pattern the contact
  block copies for absent channels.
- **`.link` (Phase 3)** — shipped unused, explicitly "so Phase 5/6 have a settled answer".
  This is that phase. `.link-quiet` covers standalone links; `.link` covers links inside
  running body copy.
- **`lib/content.ts`** — `publishedFor`, `allPosts`, `isVisible` (drafts dev-only). The
  sitemap reads these, so `draft: true` excludes from the sitemap with no extra mechanism.
- **`SmearTitle`** — the shipped server/client boundary. It is the pattern that lets a page
  stay a Server Component while a heading carries the trail, and it is the fix for the
  landing page's metadata problem below.

### Established Patterns
- Content as typed data modules, not markup (Phase 3 D-05). `lib/cv.ts` and
  `lib/contact.ts` continue it.
- Zero new npm dependencies, sustained across Phases 1–3. `next/og` ships inside Next, so
  D-3.2 holds the line.
- Type roles applied as raw CSS class strings (`text-label`, `text-body`, …) directly on
  elements; spacing from the `@theme` scale. There is no generic link, list or heading
  component other than `SmearTitle`, and this phase should not invent one for two surfaces.
- Deploy-first increments (Phase 1 D-08): every commit leaves the Railway URL working.

### Integration Points and Friction
- **`app/(en)/page.tsx` and `app/(en)/type/page.tsx` are `"use client"`, so they cannot
  export `metadata`.** The landing view therefore has no route-specific title, description
  or canonical today — a direct FIND-01 problem, since `/` is the URL most likely pasted.
  The fix is already proven in this codebase: de-client `page.tsx` and let `SmearTitle`
  carry the only client concern, exactly as the post routes do.
- **Two hand-copied root layouts.** `app/(en)/layout.tsx` and `app/(de)/layout.tsx` are
  byte-identical except `lang` and the description string, and each hardcodes
  `metadataBase` (lines 9 in both — the only two occurrences of the Railway hostname in
  shipped code). Every shared metadata concern must either be edited twice or factored once
  (D-3.1 factors it once).
- **`UI` in `lib/locales.ts` is `Record<Locale, UiCopy>` and compile-time enforced across
  both locales.** Adding a key forces a German string into existence. English-only CV and
  contact copy must not go there (D-1.5).
- **`next.config.ts` has no `headers()`, no `redirects()`, no `images` block, and there is
  no `middleware.ts`.** BUILD-04 starts from zero, which is why `output: 'export'` was ruled
  out in the first place.
- **No `app/sitemap.ts`, `app/robots.ts`, `public/robots.txt`, `opengraph-image.*` or
  `icon.*` exist.** All four are new files.
- **`app/not-found.tsx` re-declares `<html>`, `<body>`, the three font variables and the
  provider** because the two-root-layout split leaves Next no single root. Any global head
  concern added in this phase has *three* places to land, not two.

### To Delete
- `app/(en)/probe404/page.tsx` and `app/(en)/probe404/not-found.tsx` — debug leftovers, live
  in the app directory, would be crawlable the moment the flip lands.
- `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` — unused Next
  scaffold assets.
- `app/favicon.ico` — replaced per D-3.5.

</code_context>

<specifics>
## Specific Ideas

- **`[USER-SUPPLIED]` values — the complete list.** Every one is a real personal fact that
  must come from the user, and each is a launch-gate row. Nothing here may be inferred,
  synthesised, or filled with a plausible-looking value:
  1. `[USER-SUPPLIED]` **Public contact email** (PROF-03, gate G4). The employer address on
     record in the environment is deliberately not used.
  2. `[USER-SUPPLIED]` **LinkedIn profile URL** (PROF-05, gate G5).
  3. `[USER-SUPPLIED]` **Employment history** — every row of `lib/cv.ts` `experience`
     (PROF-01, gate G3). Also `education` and `languages`.
  4. `[USER-SUPPLIED]` **The photograph** — the image file itself (PROF-02, gate G6).
  5. `[USER-SUPPLIED]` **The HOME-01 positioning sentence** (gate G2), carried forward from
     Phase 3 D-08. It is a placeholder *in source* (`POSITIONING_PLACEHOLDER`), never on
     screen, precisely so a live job-hunting site never shows `[goes here]`.
  - Soft placeholder, replaceable but not blocking: the site meta description (D-3.1). It
    describes the site's artifacts rather than making a claim about the person, so it does
    not pre-empt the positioning sentence.
- **The `/cv` stub already reads well enough to survive the gate failing.** Phase 3 D-02
  required placeholder content to look authored rather than pending, which means an
  incomplete CV is embarrassing but not broken — and it is unindexed. That is the whole
  reason the gate can be strict without stalling the build.
- **Two inline-style consumers, not one.** Worth restating because it is the single detail
  most likely to be lost between reading Phase 2's forward note and writing the CSP: fixing
  Shiki alone would still leave `remark-gfm`'s table alignment, so `style-src` cannot tighten
  even if Shiki's tokens were moved to classes.
- **The photograph is the first raster image on the entire site.** Everything shipped so far
  is type, rules, and two SVG test fixtures. It is therefore simultaneously the first CLS
  risk, the first LCP candidate, the first `documentTop` desync risk, and the first asset
  with a licensing/consent question.
- **The audit is a deliverable, not a ritual.** It is the milestone's last artifact and the
  place where "did we actually build what PROJECT.md described" is answered on the record,
  row by row, with evidence.

</specifics>

<deferred>
## Deferred Ideas

### Custom domain cutover — v2 (BUILD-07)
`guillemgelabert.com` is chosen and live, but is currently attached to the **`guillem-edge`**
Railway service from a different repo, on both apex and `www`. The cutover is a domain
*reassignment* away from a live service, not a fresh setup. D-3.4 makes it a one-variable
change (`NEXT_PUBLIC_SITE_URL`) plus DNS, with no code change. Adding `preload` to HSTS
belongs with it.

### Print stylesheet for the CV — v2 (PROF-06)
Deferred per D-1.4. The CV's markup is built so this is a stylesheet-only addition.

### Nonce-based CSP — v2
Would let `script-src` and `style-src` drop `'unsafe-inline'`. Requires `middleware.ts`,
threading a nonce through two root layouts plus `app/not-found.tsx`, and forces dynamic
rendering on every route. Only worth it if the site stops being entirely static. Note it
would still not fix Shiki (shikijs/shiki#671 needs a nonce on style *attributes*, which CSP
does not offer) — a rehype transformer rewriting tokens to classes would be needed first,
plus a fix for `remark-gfm`'s alignment styles.

### `/writing` index treatment beyond n≈5 — v2
Carried forward unchanged from Phase 2 D-10.

### Lint debt — `components/smear-heading/use-prefers-reduced-motion.ts`
`react-hooks/set-state-in-effect` at line 23, recorded in Phase 2's `deferred-items.md`;
`npm run lint` exits 1 for this reason alone. Phase 6's audit either fixes it or re-defers
it with a decision, but does not leave it undecided at milestone close.

### `package.json` name is still `"gw-scaffold"`
Cosmetic, invisible to visitors, but it is the kind of thing a reader who opens the repo
notices. Flagged in the audit; renaming is at Claude's discretion.

### Preview-deploy indexing — not a v1 concern
PITFALLS #17. Relevant only if Railway preview environments are added; there is one
production service today.

</deferred>

---

*Phase: 06-cv-contact-photo-discoverability*
*Context gathered: 2026-08-31*
