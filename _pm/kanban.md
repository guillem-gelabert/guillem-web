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

## In Progress

- (none)

## Next

- **Phase 3: Work List & Landing Skeleton** — landing view navigation and vertical work list.
- **Phase 4: The Case Study** — the ib-gdp-evolution case study, wired to the landing view's
  featured slot.
- **Phase 5: Backlog** — curated backlog of work in progress.
- **Phase 6: CV, Contact, Photo & Discoverability** — CV, photo, contact block, security
  headers, search/social metadata.

---
Seeded from `.planning/ROADMAP.md` on 2026-08-31 (Phase 2 Plan 7, `02-07-PLAN.md` Task 3).
