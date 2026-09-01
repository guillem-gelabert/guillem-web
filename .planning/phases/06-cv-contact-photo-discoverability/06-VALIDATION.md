---
phase: 6
slug: cv-contact-photo-discoverability
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-01
---

# Phase 6 — Validation Strategy

> From `06-RESEARCH.md` § Validation Architecture. Nearly every claim there was measured
> against a real `next build` + `next start`, including the CR-01 fix end to end.

## USER DECISIONS (2026-09-01) — asked and answered, do not re-open

**1. Canonical host: `guillemgelabert.com`.**
Research measured that the apex is ALREADY serving this exact site, byte-identical to the Railway
URL with all paths passing through, while `rel="canonical"` still points at
`web-production-9cedb.up.railway.app`. The user chose the apex. `lib/site.ts` already reads
`NEXT_PUBLIC_SITE_URL`, so this is a one-variable change, not a cutover. Every canonical,
hreflang, sitemap entry and OG URL must resolve against the apex.

**2. The copy gate STAYS BLOCKING. Phase 6 must NOT flip robots.**
The user explicitly chose to keep all three copy items blocking. Phase 6 therefore
**builds every surface and leaves `robots: { index: false }` in place.** FIND-02 is delivered as a
one-line, documented flip the user makes after their own review — not as something this phase
performs.

The three blocking items, all of which must be cleared by the user first:
- **HOME-01** — the landing positioning sentence still ships literally as `Developer.`
- **The case-study editorial pass** — both pieces are live and bylined; no human has read them.
- **Backlog copy** — `COPY_REVIEWED = false`; and "The Pudding, read as a corpus" must never be
  described as a pitch.

This is what the three-channel tripwires built across Phases 3, 4 and 5 exist to enforce. A phase
that flipped robots here would defeat all of them.

## Coordinator decisions on research's remaining open questions

**3. OG images: committed PNGs captured with Playwright, in Humane.**
Not optional. Research reproduced that `next/og` crashes at `parseFvarAxis` on *any* variable font
— `Humane-VF.ttf` plus two unrelated variable TTFs, all failing `next build` outright, with a
static control TTF proving it is font-class-specific. A committed variable Newsreader would hit the
same crash. So D-3.2 and D-3.5 as written in CONTEXT are not implementable.

**4. The proxy learns the published slug set by `fs` scan PLUS a unit test binding it to
`publishedFor()`.** The locale filter is not optional. Research measured the `fs` option working;
the three alternatives were reasoned about only, so the unit-test binding is what keeps the two
sources from silently diverging.

**5. Email obfuscation: entity-encoded via `dangerouslySetInnerHTML`.**
Research measured that React SSR escapes `&` in both text nodes and attributes, so entity encoding
cannot survive a normal render. The encoded string is a compile-time constant in our own source,
never user input, so `dangerouslySetInnerHTML` carries no injection risk here — and it preserves a
real `mailto:` link, which `[at]`/`[dot]` plain text does not. Record the reasoning in-file so it
does not read as carelessness.

## Corrections to CONTEXT that the planner must honour

- **The launch gate is 13 rows, not 10.** Phase 5 added the `COPY_REVIEWED` row, Phase 4 the
  unreviewed-case-study row, and research's F3 the canonical-host row.
- **G9 has no production surface** — no published post contains a code fence or a table, so the
  CSP-vs-inline-styles gate cannot be proven against shipped content. Research proposes a
  three-part proof; use it.
- **`middleware.ts` is renamed `proxy.ts` in Next 16** and emits a build-time deprecation warning
  under the old name. `proxy`'s runtime is nodejs and is NOT configurable.
- **D-4.1 ("not middleware — none exists") contradicts CR-01's premise.** The proxy exists solely
  for CR-01; the security headers ride along with it.
- **CONTEXT's line references are stale** (`:128` → `:159/:160`).

## CR-01 — solved and measured, do not re-derive

A `proxy.ts` returning `NextResponse.rewrite(url, { status: 404 })` to a real per-locale 404 route
produces **404 + `<html lang="de">` + `Nicht gefunden` in the server HTML with JavaScript disabled**,
measured on both locales. Published routes and the global 404 are unaffected, static generation is
intact, cost ~1–2 ms. Next injects `noindex` for any >=400 response *including* a proxy-set status,
so these pages stay unindexed after the eventual FIND-02 flip for free. The self-rewrite alternative
was measured and does **not** work.

---

---
