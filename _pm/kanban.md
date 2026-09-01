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

## Next

- **v1.0 is complete.** The next action is the user's, not an executor's: fill the five values, do
  the three copy reviews, set `PLACEHOLDER_CONTENT = false`, then follow the `FIND-02` flip
  procedure in `.planning/phases/06-cv-contact-photo-discoverability/launch-gate.md`.
  `npm run test:unit` names the outstanding rows at any point.

---
Seeded from `.planning/ROADMAP.md` on 2026-08-31 (Phase 2 Plan 7, `02-07-PLAN.md` Task 3).
