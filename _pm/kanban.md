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

## In Progress

- (none)

## Next

- **Phase 6: CV, Contact, Photo & Discoverability** — CV, photo, contact block, security
  headers, search/social metadata.

---
Seeded from `.planning/ROADMAP.md` on 2026-08-31 (Phase 2 Plan 7, `02-07-PLAN.md` Task 3).
