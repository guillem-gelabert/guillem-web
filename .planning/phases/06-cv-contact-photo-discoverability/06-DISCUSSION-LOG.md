# Phase 6: CV, Contact, Photo & Discoverability - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-31
**Phase:** 06-cv-contact-photo-discoverability
**Mode:** Autonomous smart-discuss. `AskUserQuestion` was not called. Every recommendation
below was **auto-accepted** under the run's standing directive that all six phases ship and
that placeholder content is acceptable where it would otherwise block a phase — with the
carve-out that real personal facts are never fabricated, only marked `[USER-SUPPLIED]`.
**Areas discussed:** The CV · Contact and identity · Discoverability · Security headers and
the final audit

---

## Pre-discussion scouting

Findings that changed a recommendation before the tables were built:

- **`/cv` and `#contact` already exist.** Phase 3 D-02 shipped both as real, typeset,
  already-linked stubs. This phase fills them; every "should we create X" question dissolved.
- **`app/(en)/page.tsx` is `"use client"`** and therefore cannot export `metadata`. The
  landing view — the URL most likely to be pasted into Slack — has no route-specific title,
  description or canonical at all. FIND-01 has a structural blocker nobody had recorded.
- **`tests/build/prerender.test.ts:128` asserts the noindex** that FIND-02 flips. The flip
  breaks a passing test by design; it must be inverted in the same commit.
- **`UI` in `lib/locales.ts` is `Record<Locale, UiCopy>`, compile-time enforced.** Putting
  English-only CV/contact copy there would force German strings into existence — i.e. the
  type system would demand fabricated content. This is why D-1.5 exists.
- **`guillemgelabert.com` is attached to the `guillem-edge` service**, a different repo, on
  both apex and `www` (recorded in Phase 1's context). This reframes the domain question from
  "set up a domain" to "detach a live domain from a service this milestone does not own".
- **Live debug leftovers:** `app/(en)/probe404/` (two files), five unused Next scaffold SVGs
  in `public/`, and the untouched scaffold `app/favicon.ico`. All would be published the
  moment the site becomes indexable.
- **BRIEF.md says nothing about portraits, CV format, or contact presentation.** Zero hits
  for photo/portrait/headshot. There was no upstream position to inherit on Area 1 or Area 2.
- **Requirement-list discrepancy:** the phase brief listed BUILD-01/02/03/05; all four are
  already complete against Phase 1. ROADMAP.md's set (PROF-01…05, BUILD-04, FIND-01, FIND-02)
  was taken as authoritative.

---

## Grey Area 1/4: The CV

| # | Question | ✅ Recommended (auto-accepted) | Alternative(s) considered |
|---|---|---|---|
| 1 | What form does the CV take — page, PDF, both? | **HTML page only.** `/cv` exists and is linked; a PDF is a new asset class with no build step, no sync mechanism and no design-system representation. Same reasoning that killed the contact form. | HTML + hand-maintained PDF in `public/` (two sources of truth; the PDF goes stale first); PDF only (fails PROF-01's "as a page on the site", unindexable, unreadable on a phone) |
| 2 | How is the content held? | **Typed data module `lib/cv.ts`**, mirroring Phase 3 D-05 for work-list entries — adding a role later is a content change, not a layout change. | MDX file through the Phase 2 pipeline (drags prose styling and front-matter validation onto a non-post surface); JSX in the page |
| 3 | How much history, at what depth? | **Reverse-chronological roles, Label-role meta line + one Body-role line each.** "About, not built-with", the same rule WORK-02 imposes on the work list. It is also the only depth the type system can express without a fifth size or a second column, both prohibited. | Full duties bullets per role (needs a list treatment and reads as a document, not a page); one-line-per-role with no note (loses the only thing a CV page adds over a PDF) |
| 4 | Is it downloadable / print-ready? | **Neither. PROF-06 stays v2** — but the CV is built so the deferred print pass is stylesheet-only: semantic sections, no negative margins, no background-dependent contrast. | Add `@media print` anyway (PITFALLS #16 is real, but this is scope creep against an explicit v2 deferral); add a "Download PDF" link (there is no PDF) |
| 5 | Bilingual? | **English only, `/cv` in `(en)`.** Already settled by Phase 3's UI-SPEC (no `/lebenslauf`). Consequence: CV/contact strings must NOT enter `UI` in `lib/locales.ts`, or the type system forces invented German copy. | A `(de)` twin at `/lebenslauf` (doubles a `[USER-SUPPLIED]` translation burden for a surface no German reader was promised) |
| 6 | Does the CV get landing-surface copy? | **No — the existing `CV` nav item is the entire landing footprint.** PROJECT.md: "the CV exists as a page, it does not get landing-surface copy." BRIEF §1: "the site says what the CV can't." | A short summary block on `/` (spends scarce landing surface on the one thing already proven elsewhere) |

**Result: accepted as recommended, 6/6.**

---

## Grey Area 2/4: Contact and identity

| # | Question | ✅ Recommended (auto-accepted) | Alternative(s) considered |
|---|---|---|---|
| 1 | Which channels appear? | **Exactly three: email, GitHub, LinkedIn** — the three the requirements name. No X, Mastodon, Bluesky, phone, location, or form. | Add a social handle or two (nothing in the requirements or BRIEF asks for it; each is a `[USER-SUPPLIED]` value with no gate) |
| 2 | How are they presented with no icons? | **A labelled list of plain links.** Label-role channel name, value as a `.link-quiet` anchor — the primitive Phase 3 shipped unused "so Phase 5/6 have a settled answer". Rendered once, from one module, in two places (`#contact` on `/`, foot of `/cv`). | Inline prose sentence ("reach me at …") — reads warmer but makes three links three needles in a haystack for a 90-second scan; a bordered contact card (cards are prohibited) |
| 3 | How is the email obfuscated? | **Server-rendered HTML-entity encoding; `mailto:` href assembled at render time from parts.** A real, selectable, screen-reader-readable text node. This is PITFALLS #5's own recommendation. Acceptance is its three-part test: keyboard, screen reader, copy — all three must work. | Client-side JS reassembly (defeated by any headless scraper, breaks without JS); CSS reversal / pseudo-element content (garbles in screen readers, uncopyable); rendered as an image (invisible to assistive tech, and OCR reads it anyway) |
| 4 | What is the photograph and where does it sit? | **One portrait, on `/cv` only, below the `<h1>`.** Off the landing view because a portrait above the fold is the signature generic-portfolio move (anti-goal #5, PITFALLS #15), because it would become LCP on a page whose whole argument is that it is text-first (PITFALLS #14), and because `/cv` is where a reader who wants a face is already looking. | In `#contact` on `/` (same drift and LCP problems, one scroll lower); on both (one image site-wide is the restraint everything else is built on); no photograph (fails PROF-02) |
| 5 | How is it rendered? | **Plain `<img>` with explicit `width`/`height`, pre-sized file in `public/`. No `next/image`, no `sharp`, no new dependency.** `components/mdx/figure.tsx` already made and documented this exact call; Phase 3 sustained "no new npm dependency of any kind". | `next/image` + `sharp` (PITFALLS #14's prescription — declined: it adds a production runtime dep that fails with a silent 500 when absent, to optimize a single asset that can just be exported correctly) |
| 6 | How is the trail desync avoided? | **Belt and braces: below the `<h1>`, explicit intrinsic dimensions, and an `aspect-ratio` container.** Phase 3's UI-SPEC names PROF-02 directly — `documentTop` is captured once after `fonts.ready` and never recomputed, so a late layout change above a trail-carrying heading smears it from a stale origin. Verified by asserting the smear origin is unchanged across image load. | Dimensions only (sufficient in theory; the ordering costs nothing and removes the failure mode entirely) |

**Result: accepted as recommended, 6/6.**

---

## Grey Area 3/4: Discoverability

| # | Question | ✅ Recommended (auto-accepted) | Alternative(s) considered |
|---|---|---|---|
| 1 | Title/description strategy per route? | **One `lib/site.ts` + a metadata factory both root layouts call.** Root sets `title.template = "%s — Guillem Gelabert"`; routes set bare titles. Descriptions hand-written per route. The current root descriptions `"Developer."` / `"Entwickler."` are placeholders that would ship as the Slack unfurl text — replaced with a description of the site's *artifacts*, not a claim about the person, so it does not pre-empt HOME-01. | Keep editing both layouts by hand (they are already drifting); auto-derive descriptions from content (produces boilerplate on exactly the surface that must not read as generated) |
| 2 | Open Graph / social card? | **Generated via `ImageResponse` (`next/og`) — a route, not a committed raster.** One builder, four segments: `(en)` root, `(de)` root, and a per-post override under each `[slug]` so the case study unfurls with its own title. Ink on paper, name in Humane, one 1px rule, no accent. Ships inside Next, so no new dependency. | One static 1200×630 PNG in `public/` (simpler, but one generic card for every URL, and producing it still needs a render step); no OG image (fails FIND-01 outright) |
| 3 | …and the two font risks in that? | **Resolve them in planning, do not discover them.** (a) Satori needs font buffers: `Humane-VF.ttf` is local and works; Newsreader arrives via `next/font/google` with no file, so using it means committing a static Newsreader `.ttf` (OFL) for OG use only. (b) Satori renders a variable font at its default instance, so Humane will not be at 530 — and its licence forbids instancing. Both acceptable; the card must be *looked at* once. Fallback: render once with Playwright (already a devDependency) and commit the PNG. | Assume it works and find out from a bad unfurl |
| 4 | Sitemap and robots? | **`app/sitemap.ts` + `app/robots.ts`, both generated from `lib/content.ts`.** Drafts drop out for free via `publishedFor` (Phase 2 D-11) — no second source of truth. `/type` excluded and disallowed (Phase 1 D-05 built it non-indexed). `/probe404` **deleted**, not excluded. | A static `public/robots.txt` (cannot know the content set); listing routes by hand (drifts the first time a post lands) |
| 5 | The real-domain question? | **Stay on the Railway URL; do not cut over. But stop hardcoding the hostname.** `siteUrl` reads `NEXT_PUBLIC_SITE_URL` with the Railway URL as fallback, set in the Railway production env (PITFALLS #8's own prescription). Phase 2 D-03 called the cutover Phase 6 work; PROJECT.md, REQUIREMENTS' Out-of-Scope table and BUILD-07's v2 placement all say otherwise — and the decider is that the apex is currently attached to the live `guillem-edge` service from another repo. That is not an autonomous run's call. | Cut over now (detaches a live service this milestone does not own, cannot test, and was told to leave alone); leave the hostname hardcoded (makes the v2 cutover a code change in three files instead of one variable) |
| 6 | Favicon? | **Replace it.** `app/favicon.ico` is the untouched Next scaffold mark; it shows in the tab and in most unfurls, which puts it inside FIND-01, and it is the exact "framework-default rather than authored" tell HOME-05 exists to avoid. `app/icon.tsx` — a `G` in Humane via the same `ImageResponse` mechanism. Not a prohibited icon: that rule governs page elements. | Leave it (ships the Next.js logo as Guillem's mark on a job-hunting site); commit a hand-made `.ico` (new asset class for no gain) |
| 7 | When does `robots` flip? | **Last plan in the phase, behind a ten-row mechanical gate** (G1–G10 in CONTEXT.md). Everything upstream ships regardless — all of it is safe under `noindex`. The flip touches both root layouts and inverts `tests/build/prerender.test.ts:128` in the same commit. | Flip early so the rest of the phase is tested indexed (indexing a half-built site is the one irreversible act in the milestone; de-indexing is slow) |

**Result: accepted as recommended, 7/7.**

---

## Grey Area 4/4: Security headers and the final audit

| # | Question | ✅ Recommended (auto-accepted) | Alternative(s) considered |
|---|---|---|---|
| 1 | Which headers ship? | **A lean, fully-justified set in `next.config.ts` `headers()`:** CSP, HSTS (`max-age=63072000; includeSubDomains`, **no `preload`**), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny the features the site does not use), `Cross-Origin-Opener-Policy: same-origin`. | The long conventional list including `X-Frame-Options` and `X-XSS-Protection` (see Q2) |
| 2 | And which are deliberately omitted? | **`X-Frame-Options`** (superseded by CSP `frame-ancestors`; Phase 2's context records this as the author's own updated position — the 2020 post is stale on exactly this). **`X-XSS-Protection`** (deprecated, now considered harmful — again his own recorded position). **`preload`** on HSTS (a one-way door per registrable domain, on a subdomain he does not control). **`Cross-Origin-Resource-Policy`** (`same-origin` risks blocking a headless unfurler from fetching the OG image — a silent FIND-01 failure). **`COEP`, `X-DNS-Prefetch-Control`** (nothing needs them). The audience opens dev tools; a short current list reads better than a long one carrying two headers he has written about being obsolete. | Ship them all for the score on a header-grading site |
| 3 | How does CSP resolve the inline-style problem? | **`style-src 'self' 'unsafe-inline'`, documented in place.** There are **two** consumers: Shiki's per-token `style="color:#…"` (shikijs/shiki#671, open) and `remark-gfm`'s inline `text-align` on aligned table cells. Both were confirmed present by Phase 2's own assertions. Symptom of getting it wrong: every code block on the site goes monochrome. | `'unsafe-hashes'` + per-attribute hashes (impractical at token granularity, and is itself a weakening); a rehype transformer moving Shiki tokens to classes (real, but a Phase 2 pipeline change — and it would not touch remark-gfm, so `style-src` still could not tighten) |
| 4 | …and `script-src`? | **`script-src 'self' 'unsafe-inline'`.** Next's App Router inlines the RSC flight payload as `<script>self.__next_f.push(…)</script>`; `'self'` alone kills hydration. The honest framing goes in a comment: no user input, no forms, no third-party scripts or origins, and the policy compensates where it is free — `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `frame-ancestors 'none'`. | Nonce via `middleware.ts` (does not exist; must thread through **two** root layouts *and* `app/not-found.tsx`; forces dynamic rendering on every route, forfeiting SSG on an entirely static site) — recorded as the v2 improvement |
| 5 | How is BUILD-04 verified? | **Three layers, because `playwright.config.ts` runs its webServer as `npm run dev`** and cannot observe the production policy. (a) `buildCsp({ dev })` as a pure function, unit-tested with `node --test` against the exact production string; (b) a Playwright test that the headers are *delivered* on a real response; (c) a post-deploy `curl` against the Railway URL recorded in verification. Plus one non-negotiable regression test: token colour still renders in `<pre>` with CSP enforced. | Assert in Playwright only (never sees the production CSP); trust the config (PITFALLS' own line: verified post-deploy, not believed) |
| 6 | What does the final audit actually check? | **A written checklist, verdict + evidence per row.** (1) Cross-link integrity, automated — every HOME-03 destination, every internal link in both locales, every `hreflang`/`x-default` target. (2) **Out-of-Scope roll-call by name** — one row per PROJECT.md/REQUIREMENTS entry, per PITFALLS #15's rule that "is there a card grid" is checkable and "does this feel generic" is not. (3) Design-system roll-call — four sizes, two weights, seven tokens + three exceptions, accent only in focus/hover, zero icons, all radii 0, no `!important`. (4) BRIEF §8's trap: no ornament gained ticks or axes. (5) **Live-deploy** header curl and an actual Slack paste. (6) Housekeeping — `/probe404` and scaffold assets deleted, `"gw-scaffold"` package name, and Phase 2's recorded lint debt fixed or re-deferred with a decision. | A single "does it look right" pass at the end (the exact judgment call PITFALLS #15 says to replace with a named checklist) |

**Result: accepted as recommended, 6/6.**

---

## Scope creep deflected

- **Print stylesheet for the CV.** Genuinely tempting mid-Area-1 (PITFALLS #16 is a real
  behaviour), but it is PROF-06 and explicitly v2. Deflected into a structural constraint
  instead — the CV is built so the deferred pass is stylesheet-only.
- **Custom-domain cutover.** Phase 2's context invited it into this phase. Declined against
  three locked documents and one live-service risk.
- **A styled root 404.** Phase 3's UI-SPEC notes it would need a third root layout. Out of
  scope; `app/not-found.tsx` already covers correctness.

---

## The no-fabrication carve-out

The autonomous directive permits placeholder content where it would otherwise block a phase.
This phase is the one place in the milestone where that permission had to be narrowed, and
the narrowing was applied deliberately rather than assumed:

- A fabricated employment history, a wrong email, an invented LinkedIn URL, or a synthetic
  portrait on a live job-hunting site are not placeholders — they are false statements about
  a real person, and they are hard to detect once shipped.
- So five values are marked `[USER-SUPPLIED]` and each is wired to a mechanical launch-gate
  row (G2–G6). Every surface is still **built**; only the flip to indexable is gated. Absence
  renders as absence — the contact block omits channels that do not exist, reusing the
  `language-switch.tsx` null-not-disabled pattern on the recorded principle that "a dead
  affordance is worse than no affordance."
- The employer email address available in the environment was deliberately not used. A
  current-employer address is the wrong channel for a job hunt and is not the user's to
  publish here by inference.

---

*Phase: 06-cv-contact-photo-discoverability*
*Logged: 2026-08-31*
