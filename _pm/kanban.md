# Kanban

A lightweight, human-scannable task board — seeded from `.planning/ROADMAP.md`'s phase list.
`.planning/` (STATE.md, ROADMAP.md, REQUIREMENTS.md) remains the single source of truth for
detailed execution state; this file exists only to honour the working agreement in `CLAUDE.md`
("Update `_pm/kanban.md` when completing tasks") with something simple and obvious, not to
duplicate `.planning/`'s detail. Update the three lists below when a phase or plan completes.

## Done

- **Phase 1: Deploy Foundation & Design System** (2026-08-29) — live Next.js on Railway, the
  typographic design system, the scroll-driven heading trail.
- **Phase 2: Content Pipeline** (2026-08-31) — MDX/Markdown loader, `/writing` + `/texte` routes
  and indexes, the prose layer, i18n (hreflang/canonical/hreflang), draft visibility proven on
  both sides of the `NODE_ENV` boundary, full production-build test gate green. Live deploy
  confirmation is **pending** a push of the merged phase to `origin/master` — this plan's
  executor ran in an isolated worktree and did not push directly; see `02-07-SUMMARY.md`
  "Checkpoint decisions taken autonomously" for why.
- **Phase 3: Work List & Landing Skeleton** (2026-08-31) — landing view navigation and vertical
  work list, the featured slot's interim state, the backlog and contact stubs, `/cv` stub route.
- **Phase 4: The Case Study** (2026-08-31) — the ib-gdp-evolution case study shipped in both
  locales (`draft: false`), three committed figures, the featured slot now resolves to the real
  post with zero production code change, `/writing`'s `n = 0` launch gate closed. D-19 accuracy
  gate run on both languages (`fact-check.md`: 83 claims audited, 0 unsourced, all twelve named
  traps checked and passed). Live deployment confirmed directly against the Railway URL
  (`launch-gate.md`). Carried forward, unresolved: `HOME-01`'s positioning sentence and the
  user's editorial pass over both case studies — both block Phase 6's `FIND-02`.
- **Phase 5: Backlog** (2026-08-31) — curated backlog of three in-motion, range-widening items
  ("A data portrait of the Swiss commodity trade", "The house names of Zürich", "The Pudding,
  read as a corpus") shipped via `lib/backlog.tsx`, rendered by `BacklogList` in the work list's
  row grammar minus its affordances (no ordinal, no host line, no link), with a section-level
  `LAST_TOUCHED` date guarded two ways (build-time validator + repo-tier git/mtime freshness
  check). Phase 3's backlog stub is deleted, not kept as a dead fallback (D-13), proven absent
  from production HTML. Full suite green from a clean build: 102 unit / 22 build-tier / 127
  Playwright, `npx tsc --noEmit` clean, lint at its one known deferred error. Live deployment
  confirmed directly against the Railway URL — three item names, the date, and the absence of
  both stub strings all verified in the fetched production HTML (`launch-gate.md`). Carried
  forward, unresolved: the backlog item copy is drafted, not reviewed (`COPY_REVIEWED = false`,
  D-14's third tripwire, with a one-edit veto flag on item 3) — joins `HOME-01` and the
  case-study editorial pass as a blocker on Phase 6's `FIND-02`. Two interim surfaces remain
  (contact stub, `/cv`), both Phase 6's.

- **Phase 6: CV, Contact, Photo & Discoverability** (2026-09-01) — the milestone's last phase, and
  the one that closes v1.0. Shipped: localised server-rendered 404s (`CR-01`, closed), six real
  security headers whose delivered CSP is byte-identical to the unit-tested string, `/cv` with a
  portrait slot and three CV sections, a three-channel contact block with an entity-encoded email
  rendered from one component on two surfaces, `sitemap.xml` and `robots.txt`, per-route metadata on
  the `guillemgelabert.com` canonical, committed OG cards including one per post, and the replaced
  favicon.

  Then, by the owner's instruction, **every outstanding user-supplied value was filled with lorem
  ipsum** and a generated tone panel (never a face) so the whole site renders at full length before
  the copy exists. That required a fourteenth launch-gate row: `PLACEHOLDER_CONTENT` in
  `lib/placeholder.ts`. Without it the gate's biconditional — which had been testing whether values
  are *filled* as a proxy for whether they are *real* — would have started **demanding** an indexable
  site over a lorem-ipsum CV.

  Three defects were found by curling the live deploy during the phase's own audit rather than by any
  test: the per-post OG cards were built, committed and never served; both localised 404s rendered
  the site name twice in their `<title>`; and the test suite had been silently adopting another
  project's dev server on port 3000. All three fixed, with the assertions that missed them
  strengthened.

  **The site is deliberately not indexed.** Everything still blocking is copy and all of it is the
  user's: five placeholder values and three copy reviews. There is no engineering work left between
  here and an indexed site. One page finishes it —
  `.planning/phases/06-cv-contact-photo-discoverability/HANDOFF-user-supplied.md`.

## In Progress

- (none)

## Done since v1.0

- **Landing: the story replaces the case study** (2026-09-09) — the landing slot showed
  `components/landing/featured-slot.tsx`'s interim copy ("The case study is being written"), a
  promise rather than a piece of work. It now shows what is published.

  The bottom-right corner is one object: a **disc** that is the story's own thumbnail, masked to a
  circle (`object-fit: cover` + `border-radius: 50%`), sized `min(100cqw, 100cqh)` of the box's
  content box so it crosses none of the padding edges. The **headline rings it from outside** on an
  SVG `textPath` — the only `<svg>` the site ships, and the one sanctioned exception to the
  zero-icons rule, because there is no CSS for type on a curve and a picture of the words would
  stop being text. **The whole disc is the link**, via a stretched `::after` on the headline's own
  anchor, so the accessible tree still holds one link named by its headline. The **disc carries the
  scroll trail** — the shared driver in `smear-heading-provider.tsx` now writes either
  `text-shadow` or `box-shadow`, and because `box-shadow` respects `border-radius` a round element
  smears as a trail of circles. The headline itself stays flat.

  `lib/work.ts` gained a `shot` field (`WorkShot | null`) and is the one source for the disc and
  for *Watch People Die Live*, which sits under it as a second title link. **The case studies are
  deferred, not dropped**: `featured-slot.tsx`, `CASE_STUDY_SLUG` and both case-study MDX files all
  stay put, and `/writing/the-chart-therefore-changes` still ships — only the landing stopped
  resolving them, so the route is no longer async and reads nothing from `content/`.

  Three things found by measuring rather than by looking. The second link was a **14px-tall target**
  (under WCAG 2.5.8's 24px floor), now a block anchor whose 3px padding does that job and the
  visual separation in one declaration. The picture was **swallowing every click** on the disc —
  it is a positioned element after the headline in DOM order, so it painted over the hit area;
  `pointer-events: none` on it and on the arc's own box, with only the disc's `::after` and the
  glyphs' own fill opting back in. And the trail was **clipped flat at the fold**: the scene's
  `overflow: hidden` became `overflow-x: clip` + `overflow-y: visible` (the one legal pairing, and
  the pattern `#scroll-root` already uses), plus a `z-index` so the mirrored scene below cannot
  paint over what escapes. That lift then leaked the thing the scene's clip was really holding:
  `.seam-grain-field` is `250vmax` square — 4868px tall at 1440x900 — and its box started counting
  toward the scroller, growing the page from 1800px to 3478px, i.e. 1678px of empty scroll under
  the composition. The clip belongs on `.grain` (which is `inset: 0`, so its box IS the scene's),
  where it holds the field without closing the scene to the trail. `tests/landing-trail.spec.ts`
  now asserts the page is exactly as tall as its two scenes; "taller than one viewport" was green
  throughout.

  **Test debt paid down as a side effect**, not by choice: six Playwright tests were **failing on
  HEAD** before any of this, all describing the pre-seam landing — a work list, an obfuscated
  email, `zero <section>/<img>` in `<main>`, an `h1.text-display` the nameplate no longer carries,
  a `h2.section-head`/`#work` sweep resolving to `null`. Retargeted at what the seam actually
  ships. 23 Playwright failures down to 17, no regressions in any tier.

  **Two things still open.** The copy over the disc is white on a light chart and unreadable — the
  thumbnail is being remade (square, 1600x1600, important content inside the inscribed circle,
  since the mask hides the corners). And the copy overhangs the disc onto the seam's light paper
  side on phones, where white type disappears; it predates this change and this change shrank it at
  every narrow viewport measured, but it is not fixed.

### iPhone: the glass behind the status bar, and the story over the tagline — 2026-09-12

Two defects from an iPhone 17 Pro: **white slabs** behind the Dynamic Island and the URL bar, and
the featured story's curved title printed **through the tagline**.

The first was the **fifth pass at the same bug**, and the reason it kept coming back is that none
of the previous four left a record — `.planning/` had nothing on the status bar, safe areas,
`viewport-fit` or the app-shell, so each attempt was re-derived from Chrome, which
**structurally cannot reproduce any of it** (`env(safe-area-inset-*)` is `0px` there and lvh, svh
and dvh all resolve the same). `.planning/quick/260912-ios-…/` is the record this time.

The two bands were never one bug. The bottom one is `.scene { height: 100dvh }` stopping short of
the screen, fixed by `100lvh` in `6085eee`; the top one is the canvas, which only shows at rest.
**`fb8613d` and `7f4f771` undid both on the same day** — the first locking the document and
deleting `--color-seam-canvas` on the reasoning that the lock made colour irrelevant (it makes
colour the *only* thing that shows), the second setting the scene back to `100dvh`. Invisible then:
`--gradient-tint` was `#ffefe0`, and the same day's repaint to grey riso is what turned white-on-
cream into a slab.

**The document scrolls again**, so the strip shows the page through the glass — which is what
`viewport-fit=cover`'s own comment has claimed all along, and what `fb8613d` named while
implementing its opposite. The moving tone while scrolling is the accepted cost of see-through.
`#scroll-root` and `scroll-root.ts` are gone; `window.scrollY` is the origin again.

The rule that replaces the lock: **paint reaches `lvh`, geometry sits in `svh`**. The grain covers
the safe-area bands; the gradient's origin and every box stay in the viewport that does not move
when iOS collapses its toolbar. `dvh` was only ever stable *because* the lock prevented that
collapse. And since the scene's bottom edge is now behind the URL bar, `--edge-bottom` carries
`--chrome-bottom: calc(100lvh - 100svh)` so content stops at the bar while paint runs past it.

The story's cap divides the room it has by **`(--arc-scale + 1) / 2`, not `--arc-scale`** — the
ring of type is centred on the box, so only half its excess hangs above — and the box's own padding
supplies the gap, since cq units resolve against the content box. Disc 163px on the reported
device, 27px clear of the tagline.

**The load-bearing change is testability.** `env()` and `calc(100lvh - 100svh)` now sit behind
`--safe-*` and `--chrome-bottom`, so `tests/landing-phone-portrait.spec.ts` can set what a device
reports. Verified as a negative control: with the cap removed it fails at **−119px of overlap**,
and at 0px insets it passes by 120px — without the indirection the spec would have been vacuous,
which is precisely how this bug survived four fixes. Playwright 185/15 against a 181/15 baseline:
same fifteen pre-existing failures, four new passes.

**One thing still open**, and only a phone can close it: `fb8613d` says the strip shows the root
colour at `scrollY === 0`, `d8bc1f3` says the grain shows through. Never settled — `e7745c2`
overrode `d8bc1f3` fourteen minutes later, verifying by sampling pixels rather than on a device.
This follows `d8bc1f3` and paints no canvas colour.

### The status-bar strip at rest: a scroll runway — 2026-09-12

Follow-up to the fix above, from the device. Three of its four counts were right; the fourth was
the strip behind the Dynamic Island **at the top of the page only** — white before you scroll,
correct the moment you do.

I had called that strip unavoidably flat, and said the only question was which colour to paint it.
**Wrong, and wrong in a way that would have shipped a worse fix.** Safari composites real page
pixels behind the status area once the document has **non-zero scroll**; the flat colour is only
the `scrollY === 0` fallback (Safari 26 takes it from a fixed/sticky element near the viewport
edge, else `<body>`). So the answer is not a better colour — it is not being at zero.

**A scroll runway**: `1rem` of paper above the composition, scrolled past on load. The offset and
the scroll cancel, so nothing moves on screen — `#seam-scene` still measures `top: 0` — but the
document is at non-zero scroll from the first paint and the strip has pixels to composite. The
other half of the technique was already in place: the scene is `100lvh` with `.grain` at
`inset: 0`, so the composition bleeds past the visual viewport.

Two things the implementation had to get right that the plan did not anticipate. The runway is the
scene's **sibling**, so it inherits nothing `.scene` declares — neither `--runway` nor the paper
colour. `--runway` moved onto `.runway` itself (and `use-scroll-runway.ts` reads the resolved
height off that element, so layout and JS cannot drift), and the paper literal moved up to a
`.landing` class on `<main>` that `.scene` and `.runway` both read, rather than being written
twice. The runway is painted paper rather than left transparent for the one case where it is ever
seen: if a device ignores `overscroll-behavior: none`, a pull-down should reveal more of the
composition, not the white canvas this whole thread is about.

`tests/landing-trail.spec.ts`'s exact-page-height assertion now names the runway as its one
legitimate extra rather than widening its tolerance to swallow it — the 1678px of empty scroll it
once caught is exactly what a looser slack would stop catching. The new assertions in
`tests/landing-phone-portrait.spec.ts` are both halves of the mechanism (`scrollY` equals the
runway; the hero's top is still viewport `0`), and they are load-bearing: commenting the effect out
fails them at `scrollY` 0 against an expected 16.

Suite unchanged at 185/15 Playwright, 153/3 unit, 30/4 build, lint 1 error + 1 warning — all the
same pre-existing failures.

**One state stays imperfect**, and it is a real gesture: tapping the status bar scrolls to top,
which returns to `scrollY === 0` and the white strip until the next scroll. The sources pair the
runway with a fallback canvas colour for exactly that; deliberately not added, per the standing
decision not to paint it.

**Sourcing caveat.** The primary write-ups on Safari 26's Liquid Glass tinting were blocked by the
session's egress proxy, so this is search-result synthesis corroborated across two queries and
consistent with `fb8613d`'s and `8b0003e`'s own on-device notes. The phone is the only real test.

### Landing: the featured story loses its standfirst — 2026-09-12

The story's annotation printed between the arc and the disc; it is gone. The corner is the picture
and its headline now. The data is untouched — `lib/work.ts` still carries `annotation` and the
"More work" pairs still print it below the fold; only this slot stopped rendering it.

Three things depended on it, and the interesting one is that **the component's own comment
predicted it**: that `<p>` was the landing's last `.max-w-prose`, kept partly so
`tests/landing-viewport.spec.ts`'s "the measure holds" sweep had something to read. That check
moved to `/cv` rather than being relaxed to tolerate zero matches — a sweep that passes on a page
with nothing to sweep is the failure mode `03-VALIDATION.md`'s rule 1 exists to prevent, and the
measure is a site-wide contract, not a landing one.

`tests/landing-trail.spec.ts`'s "the body face does not trail" went red on `null` rather than
quietly passing, because its `read()` helper returns null instead of throwing — the same property
that caught three stale selectors when the seam first shipped, earning its keep a second time. The
standfirst was swapped for the badge there rather than deleted: that list proves everything in the
box except the disc stays flat, and dropping a line shrinks what it proves.

Geometry unchanged, measured: disc 163px, 27px clear of the tagline, arc type 17.4px on a 17 Pro —
everything in that corner is absolutely positioned, so removing an in-flow sibling moved nothing.
Badge clearance above the URL bar 34px on the notched phones, 9px on an SE. Suite back at its
baseline 185/15 after the two fixes (one run showed a third failure at 393x852; 16/16 on repeat, a
flake).

## Next

- **v1.0 is complete.** The next action is the user's, not an executor's: fill the five values, do
  the three copy reviews, set `PLACEHOLDER_CONTENT = false`, then follow the `FIND-02` flip
  procedure in `.planning/phases/06-cv-contact-photo-discoverability/launch-gate.md`.
  `npm run test:unit` names the outstanding rows at any point.

---
Seeded from `.planning/ROADMAP.md` on 2026-08-31 (Phase 2 Plan 7, `02-07-PLAN.md` Task 3).
