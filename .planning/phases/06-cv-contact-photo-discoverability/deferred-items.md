# Deferred Items — Phase 6

Items discovered during execution that are out of scope for the plan that found them. Format
follows `.planning/phases/03-work-list-landing-skeleton/deferred-items.md`.

---

# ⚠️ THE CARRIED COPY TRIPWIRES — re-asserted at Phase 6 close

`HOME-01`'s carry-forward rule (Phase 3 `deferred-items.md` § 1) requires these be restated at the
top of every subsequent phase's carried state until the user resolves them. Phase 6 is the last
phase of the milestone, so this is where they land for the milestone close.

**All of them look finished on screen. That is the whole reason they need a written tripwire.**

### T1 — the positioning sentence (`HOME-01`, gate G2)

`POSITIONING_PLACEHOLDER` in `lib/work.ts`. It no longer reads `Developer.`; as of 2026-09-01 it
reads lorem ipsum, which is a **better** tripwire — `Developer.` had the specific failure mode of
looking like a finished, if terse, choice at every optical pass, and lorem cannot be mistaken for a
decision. It is still the site's single most important sentence and it is still unwritten. It is
also `/`'s `metadata.description`, so it is what a shared link says about the user.

### T2 — the editorial pass over both case studies (gate G12)

`content/the-chart-therefore-changes.mdx` and `content/die-darstellung-aendert-sich.mdx`, both
`draft: false`, both live and bylined, 1,788 words EN and 1,764 DE. **No human has read either.**
Phase 4's `fact-check.md` audited 83 claims with zero unsourced and checked twelve named traps in
both languages — that reduces factual risk only, and says nothing about voice, register, or whether
the German reads like German. The escape hatch (`draft: true`) remains one line in either file.

### T3 — the backlog copy (`BACK-01`, gate G11)

`COPY_REVIEWED = false` in `lib/backlog.tsx`. Three items drafted from repository evidence, never
read by the author. **"The Pudding, read as a corpus" carries a one-edit veto**: described strictly
as a corpus study, never as a pitch, because it may be a live pitch elsewhere in the user's own
planning and getting that wrong publicly could cost it.

### T4 — NEW at Phase 6 close: five values are placeholder copy (gate G14)

`PLACEHOLDER_CONTENT = true` in `lib/placeholder.ts`. The CV's employment history, education and
languages; the contact email and LinkedIn URL; the portrait file; and T1's sentence are all lorem
ipsum or a placeholder asset, by the owner's explicit instruction, so every surface renders at full
length before the real words exist.

**This tripwire exists because the fill silently disarmed the other five.** G2–G6 each test whether
a value is *filled*, which was a sound proxy for *real* while the only states were absent and
authored. Lorem satisfies filled and fails real, and without G14 the launch gate's biconditional
would have started **demanding** `index: true` over a lorem-ipsum CV. Full record: `launch-gate.md`
§ "Why G14 exists". Hand-off for resolving it: `HANDOFF-user-supplied.md`.

**None of T1–T4 may reach the FIND-02 flip unresolved.** Three of the four are mechanically
enforced by `tests/unit/launch-gate.test.ts`; T2 cannot be, and is a signature row in
`launch-gate.md`.

---

# Deferred to v2 or later

## A. BUILD-07 — attach the domain to the `web` service

**Deferred to v2.** This milestone changed which hostname the application *declares* as canonical,
not which service owns it. `guillemgelabert.com` is attached to the `guillem-edge` service (a
different repository), whose Cloudflare Worker forwards the apex to this Railway service. Nothing
was attached and nothing was detached; `railway domain` was never run. Full reasoning in
`audit.md` § 2.5.

What remains: attach the domain to `web` directly, and add `preload` to the HSTS header. **These
belong together** — HSTS preload is a one-way door at the browser-vendor level and should not be
submitted while the apex still routes through a third-party Worker this repo does not control.

**Unblocking condition:** a decision that `guillemgelabert.com` is permanently this application's
apex, not `guillem-edge`'s. Owner: user.

## B. PROF-06 — the print stylesheet

**Deferred to v2**, as scoped. Worth recording *why it stays cheap*: `/cv`'s markup was built for
it. Semantic sectioning, no negative margins, no background-dependent contrast, and nothing that
depends on a screen-only treatment for legibility (`components/cv/cv-sections.tsx`'s own header
comment records this deliberately). A later print pass is therefore **a stylesheet addition, not a
markup change**.

## C. Nonce-based CSP

**Deferred to v2.** The delivered policy carries `'unsafe-inline'` in `script-src` and `style-src`.
A nonce-based policy is the textbook improvement and **would not fix the actual reason**
`style-src` needs it: Shiki emits per-token inline `style` attributes, and attribute-level inline
styles are not noncible — only `<style>` elements are. Removing `'unsafe-inline'` from `style-src`
means replacing Shiki's inline colouring with a class-based theme, which is a content-pipeline
change, not a header change. Recorded so a future reader does not attempt the nonce expecting it to
close both directives.

## D. The lint debt at `use-prefers-reduced-motion.ts:23`

**Re-deferred at milestone close, with a decision rather than a shrug.** `npm run lint` exits 1 on
exactly one error: `react-hooks/set-state-in-effect`.

**Reasoning.** `components/smear-heading/` must come out of this phase with an empty diff — every
plan in the phase asserts it, and `git diff --stat components/smear-heading/` is empty across the
whole milestone. The module's behaviour is covered by measured Playwright specs whose
reduced-motion handling was itself hard-won: Playwright's `reducedMotion` context option does not
reliably affect `matchMedia` in this environment, and the working approach
(`page.emulateMedia({ reducedMotion: "reduce" })` before `goto`) was arrived at empirically. Editing
that module at milestone close to satisfy a lint rule trades real regression risk for a cosmetic
gain.

**Unblocking condition:** fix it in a commit that touches nothing else and re-runs
`tests/reduced-motion.spec.ts` and `tests/smear-heading.spec.ts`. Owner: whoever next has reason to
open that module.

A second, smaller item rides with it: one lint *warning*, `hasOwnOgImage` assigned but never used in
`tests/build/prerender.test.ts` — a leftover of the og:image rewrite. Harmless; clear it with the
above.

## E. The `_pm/kanban.md` discrepancy

`CLAUDE.md`'s working agreement says "Update `_pm/kanban.md` when completing tasks". Research
assumption A10 recorded the file as absent; **it exists** (last updated 2026-08-31 at Phase 5's
close) and is updated again at Phase 6's close, so it is not left stale.

**The real discrepancy is that the project has two tracking surfaces** — `_pm/kanban.md` and
`.planning/` — and `.planning/` has been the load-bearing one for all six phases. Whether to keep
both is the user's call, not the audit's. **Flagged, not resolved.** Owner: user.

---

# Closed during Phase 6


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


---

## 2. [CLOSED 2026-09-01] The per-post OG cards were built, committed, and never served

**Found by** `audit.md` § 5.3 — by curling the live deploy, not by a failing test.

Both case studies served the locale's site-wide card. The cause was item 1's own fix: giving every
route an explicit `openGraph.images` entry also overrides the `opengraph-image` file convention for
its segment, and the two `[slug]` segments were the only ones whose convention route was doing real
work. Item 1's resolution note above ends "The per-post `[slug]` overrides are unaffected and still
prove they fire per post" — **that sentence was false when written**, and is left standing above
rather than edited, because a resolution note that quietly corrects itself teaches nothing.

The assertion meant to catch it compared the English post's card with the German post's and with
`/`'s. Those differ by **locale** whether or not the override fires, so it passed throughout.

**Fixed** in `315518d`: `postOpenGraph()` in `lib/metadata.ts` names the card by slug with an
`existsSync` fallback to the site card; both dead convention routes deleted; the assertion now
requires each post's `og:image` pathname to **be** `/og/{slug}.png`. Verified live: three distinct
cards, three distinct byte lengths, all 1200×630.

**The transferable lesson:** an assertion that two things *differ* is much weaker than one that
names what each *is*, and it fails silently in exactly the case you wrote it for.

## 3. [CLOSED 2026-09-01] Both localised 404s rendered the site name twice in their `<title>`

**Found by** `audit.md` § 5.6, also by curling the deploy.

`/writing/does-not-exist` served `Not found — Guillem Gelabert — Guillem Gelabert`, and
`/texte/gibt-es-nicht` the German equivalent. Both routes hardcode a title because a 404 falling
back to the layout default is a WCAG 2.4.2 regression — correct when written, and it stopped being
correct when plan 06-07 gave the root layouts `title.template: "%s — Guillem Gelabert"`. The literal
suffix then composed with the template.

**Fixed** in `ff5eb40`: both titles now read from `UI[locale].notFoundHeading`, so the tab title and
the rendered heading cannot drift apart. `app/global-not-found.tsx` keeps its literal suffix — it
renders outside both locale layouts and no template reaches it.

The existing assertions checked that a title was *present and non-empty*, which stayed true. The
missing half — no title may contain `SITE_NAME` more than once — is now asserted in
`tests/build/prerender.test.ts`.

## 4. [CLOSED 2026-09-01] Playwright's port was hardcoded, and adopted another project's dev server

Not on any plan's list. `playwright.config.ts` pinned port 3000 with
`reuseExistingServer: !process.env.CI`. Another project in the same vault (`watch-people-die-live`,
Next 16.2.10) was running its own `next dev` there, so the suite silently ran against **a different
application** and reported 404s on every route this repo owns — twice, costing two debugging
sessions before the cause was traced with `lsof`.

**Fixed** in `315518d`: the port is now `Number(process.env.PORT ?? 3000)` and the webServer command
passes it through, so `PORT=3111 npm run test:all` moves server and client together. Default
unchanged at 3000, because every recorded measurement in `.planning/` was taken there.
