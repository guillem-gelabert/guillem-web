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

## Next

- **v1.0 is complete.** The next action is the user's, not an executor's: fill the five values, do
  the three copy reviews, set `PLACEHOLDER_CONTENT = false`, then follow the `FIND-02` flip
  procedure in `.planning/phases/06-cv-contact-photo-discoverability/launch-gate.md`.
  `npm run test:unit` names the outstanding rows at any point.

---
Seeded from `.planning/ROADMAP.md` on 2026-08-31 (Phase 2 Plan 7, `02-07-PLAN.md` Task 3).
