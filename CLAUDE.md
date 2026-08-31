# guillem-web

My personal website. I'll be looking for a job soon and I want to improve my visibility.

## Key context
- Goal: Land a job in data journalism / data visualisation / creative dev
- Created: 2026-05-04

## Working agreements
- MVP first. No polishing until the core works.
- Update _pm/kanban.md when completing tasks.

## Test gate
`npm run test:all` is the pre-commit / pre-deploy gate. Run it — not
`npm test` — before committing anything that touches content, routing or the
draft rule.

`npm test` runs Playwright only, and Playwright always boots `npm run dev`,
where `NODE_ENV` is `development` and every draft is visible. That
environment structurally cannot prove what a production build omits. The only
test that covers the production half of the draft rule is
`tests/build/prerender.test.ts`, which reads the HTML `next build` writes to
disk and therefore needs a real build first. `test:all` sequences the whole
chain — unit, clean build, build assertions, then Playwright — so nothing has
to be remembered in the right order.
