---
phase: 01-deploy-foundation-design-system
plan: 01
subsystem: infra
tags: [nextjs, railway, railpack, playwright, tailwindv4, deploy]

# Dependency graph
requires: []
provides:
  - Bare Next.js 16.3.3 App Router scaffold at repo root (TypeScript, Tailwind v4, ESLint)
  - Retired Dockerfile-based deploy path; Railway now deploys via Railpack zero-config builder
  - Live, stable Railway URL (web-production-9cedb.up.railway.app) serving the real Next.js app
  - Playwright test harness (playwright.config.ts, baseURL parametrized) + first spec (deploy-smoke)
affects: [01-02, 01-03, 01-04, phase-2, phase-3, phase-6]

# Tech tracking
tech-stack:
  added: [next@16.3.3, react@19.2.8, react-dom@19.2.8, tailwindcss@4, "@tailwindcss/postcss@4", eslint@9, eslint-config-next@16.3.3, "@playwright/test@1.62.1"]
  patterns:
    - "Zero-config Railpack deploy: package.json scripts are next build / next start only, no Dockerfile, no output override"
    - "playwright.config.ts baseURL reads PLAYWRIGHT_BASE_URL, defaulting to localhost:3000 — same spec runs local or against live Railway URL"

key-files:
  created:
    - package.json
    - next.config.ts
    - app/layout.tsx
    - app/page.tsx
    - app/globals.css
    - playwright.config.ts
    - tests/deploy-smoke.spec.ts
  modified:
    - .gitignore
    - AGENTS.md

key-decisions:
  - "Deleted Dockerfile/nginx.conf.template/prototype-stack.html as the literal first action, before scaffolding anything (D-08)"
  - "next.config.ts carries no output field — plain next build + next start on Railpack, preserving headers() for Phase 6's BUILD-04"
  - "Scaffold's own dependency versions (TypeScript ^5, eslint ^9) kept as-is rather than force-installing bleeding-edge latest, per RESEARCH.md Pitfall 9"
  - "deploy-smoke.spec.ts asserts a /_next/static/ script tag + '__next_f' string instead of the plan's specified __NEXT_DATA__ marker — that marker is a Pages Router convention absent from Next.js 16 App Router's actual output"

patterns-established:
  - "Every later plan in this phase adds dependencies but must never modify the package.json build/start scripts or add an output field to next.config.ts (locked interface contract)"

requirements-completed: [BUILD-01, BUILD-02]

# Metrics
duration: 8min
completed: 2026-08-29
---

# Phase 1 Plan 1: Deploy Foundation Summary

**Retired the Dockerfile-based Railway deploy path and shipped a live Next.js 16.3.3 App Router scaffold at web-production-9cedb.up.railway.app, confirmed via an automated Playwright smoke test run against the real deployed URL.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-29T20:13:31Z
- **Completed:** 2026-08-29T20:21:31Z
- **Tasks:** 3
- **Files modified:** 20 (18 created/moved, 2 deleted alongside Dockerfile/nginx, 2 gitignore-touched)

## Accomplishments
- Deleted `Dockerfile`, `nginx.conf.template`, `prototype-stack.html` — the artifacts that were silently overriding Railway's Railpack builder (PITFALLS #1)
- Scaffolded a bare Next.js 16.3.3 App Router project (TypeScript, Tailwind v4, ESLint) at the repo root, `npm run build` clean
- Installed Playwright, wrote `playwright.config.ts` (baseURL parametrized via `PLAYWRIGHT_BASE_URL`) and `tests/deploy-smoke.spec.ts`
- Pushed to `origin master`, confirmed the Railway `web` service rebuilt via Railpack and now serves the real Next.js app (not the old static prototype) at `https://web-production-9cedb.up.railway.app`
- Ran the deploy-smoke spec against the live URL and confirmed it passes

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete stale deploy artifacts and scaffold Next.js 16** - `57fb61b` (feat)
2. **Task 2: Install Playwright and wire the Wave 0 test harness + deploy-smoke spec** - `792bc99` (test)
3. **Task 3: Push and confirm the live Railway URL serves the new app** - no new commit (git push + live verification only; both prior commits were the pushed payload)

**Plan metadata:** (recorded below, this commit)

## Files Created/Modified
- `package.json` / `package-lock.json` - Next.js 16.3.3 App Router scaffold + `@playwright/test` devDependency
- `next.config.ts` - plain config, no `output` override (Railpack-compatible, preserves `headers()` for Phase 6)
- `tsconfig.json`, `next-env.d.ts`, `eslint.config.mjs`, `postcss.config.mjs` - scaffold-generated config
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/favicon.ico` - default App Router scaffold pages (to be replaced by 01-02/01-03's design system and holding page)
- `public/*.svg` - default scaffold assets (unused, harmless; will be removed or replaced in a later plan)
- `.gitignore` - added `.next/`, `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`
- `playwright.config.ts` - `testDir: './tests'`, single `chromium` project, `use.baseURL` reads `PLAYWRIGHT_BASE_URL`, `webServer` runs `npm run dev`
- `tests/deploy-smoke.spec.ts` - asserts HTTP 200 + a Next.js-specific hydration marker
- `AGENTS.md` - Next.js 16's own auto-generated "This is NOT the Next.js you know" agent-guidance block (framework writes this on `next dev`/`next build` and instructs committing it)
- `Dockerfile`, `nginx.conf.template`, `prototype-stack.html` - deleted

## Decisions Made
- Kept the scaffold's own TypeScript (`^5`) and ESLint (`^9`) versions instead of forcing the bleeding-edge `latest` (TypeScript 7.0.2, ESLint 10.9.1) that RESEARCH.md flagged as a friction risk on a brand-new major (Pitfall 9) — `create-next-app@16.3.3` chose peer-compatible versions itself.
- Omitted `--src-dir=false` from the `create-next-app` invocation (the plan's literal command): the current CLI's `--src-dir` is a boolean presence flag with no `=false` form, and its default is already "no `src/` directory" — passing the unsupported syntax caused the CLI to misparse it as the project name. Same outcome (`app/`, `public/`, etc. at repo root, no `src/`), reached via the flag's actual supported syntax.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] deploy-smoke.spec.ts's `__NEXT_DATA__` marker does not exist in Next.js 16 App Router output**
- **Found during:** Task 2 (writing and first-running the deploy-smoke spec)
- **Issue:** The plan specified asserting on a `script#__NEXT_DATA__` tag / `"__NEXT_DATA__"` string to distinguish the real Next.js app from the old static prototype. That marker is a Pages Router (`getServerSideProps`) convention. Next.js 16's App Router (with Turbopack) does not emit it at all — confirmed by fetching the actual rendered HTML from both `next dev` and a production `next start` build, neither of which contains the string. The test failed immediately (0 elements found) against a correctly-scaffolded app, which would have made every future deploy-smoke run a false negative.
- **Fix:** Replaced the assertion with two checks that are actually present in every App Router response and confirmed absent from the deleted `prototype-stack.html` (`git show HEAD~1:prototype-stack.html | grep -c "__next"` → `0`): a `script[src*="/_next/static/"]` element is attached, and the page HTML contains the string `"__next_f"` (the RSC hydration-payload push array Next.js 16 actually uses). Same intent as the plan (a marker that proves "real Next.js app," absent from the old prototype), adapted to the framework's current actual output.
- **Files modified:** `tests/deploy-smoke.spec.ts`
- **Verification:** Spec passes against local `next dev`, local production `next start`, and the live Railway URL post-deploy.
- **Committed in:** `792bc99` (Task 2 commit)

**2. [Rule 2 - Missing critical] Playwright's own generated output directories were untracked and would have leaked into future commits**
- **Found during:** Task 2, after first local spec run
- **Issue:** Running `npx playwright test` created `test-results/` (per-run artifacts, screenshots/traces on failure) at the repo root with no `.gitignore` entry — left unhandled, this generated, non-deterministic output would eventually get committed by an incautious `git add`.
- **Fix:** Added `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/` to `.gitignore` alongside the plan's required `.next/` entry.
- **Files modified:** `.gitignore`
- **Verification:** `git status --short` no longer lists `test-results/` as untracked after a spec run.
- **Committed in:** `792bc99` (Task 2 commit)

**3. [Rule 3 - Blocking / tooling side effect] `AGENTS.md` was modified by Next.js 16's own tooling**
- **Found during:** Task 2, after running `next dev`/`next build` locally
- **Issue:** Next.js 16 automatically appends an "agent guidance" block to `AGENTS.md` (`node_modules/next/dist/server/lib/generate-agent-files.js`) every time `next dev` or `next build` runs, and the block's own comment states it is re-added on every run and should be committed to keep the tree clean. This left `AGENTS.md` as an uncommitted modification with no task in the plan owning it.
- **Fix:** Committed the change alongside Task 2's other files, following the framework's own stated guidance rather than leaving it as permanent local drift.
- **Files modified:** `AGENTS.md`
- **Verification:** `git status --short` shows no pending `AGENTS.md` diff after the commit; the block will be silently re-added (no-op, since content is identical) on any future local `next dev`/`next build`.
- **Committed in:** `792bc99` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 1 missing-critical, 1 blocking/tooling side effect)
**Impact on plan:** All three were necessary corrections to keep the automated test suite trustworthy and the working tree clean. No scope creep — no new features, routes, or dependencies beyond what the plan specified.

## Issues Encountered
- Railway's first poll returned HTTP 200 within seconds of the push, but the response body was still the *old* static prototype (`Kumbh Sans`/scroll-convergence markup) — Railway keeps the previous container serving traffic (zero-downtime deploy) while the new Railpack build runs in the background. `railway status` showed `web: ● Online · Building (Ns)` for roughly 60 seconds before flipping to a plain `Online` state; only then did the live URL start serving the new Next.js app. This matches RESEARCH.md's warning that a fast-returning 200 alone isn't sufficient proof — confirmed via `railway status` polling and a content check (`__next_f` marker + real page title) before treating the deploy as verified, not just the HTTP status code.

## User Setup Required

None - no external service configuration required. Railway's `web` service and its auto-deploy-on-push-to-master behavior were already configured prior to this plan (per 01-CONTEXT.md ground truth).

## Next Phase Readiness

- The deploy foundation is retired-Dockerfile-clean and known-good: every subsequent commit in this phase is now a verified increment on a live, correct base.
- `package.json` scripts (`dev`/`build`/`start`/`lint`) and `next.config.ts`'s no-`output` contract are locked interfaces — Plans 02-04 must add dependencies without touching these.
- `playwright.config.ts` and `tests/deploy-smoke.spec.ts` are the reusable test harness Plans 03-04 will add spec files alongside (`viewport.spec.ts`, `reduced-motion.spec.ts`, `font-cls.spec.ts`, `type-specimen.spec.ts`, `smear-heading.spec.ts` per 01-VALIDATION.md's Wave 0 Requirements — none of those are yet created; they belong to later plans in this phase).
- The default scaffold's `app/page.tsx`, `app/globals.css`, and `public/*.svg` placeholder assets are intentionally still framework-default — 01-02 (design system/tokens) and later plans replace them with the real holding page, `/type` specimen route, and the ported heading trail. No blocker; this is the expected state after a "deploy first, then design" plan.

---
*Phase: 01-deploy-foundation-design-system*
*Completed: 2026-08-29*

## Self-Check: PASSED

All claimed files found (`package.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `playwright.config.ts`, `tests/deploy-smoke.spec.ts`, `.gitignore`) and all claimed commits (`57fb61b`, `792bc99`) verified present in `git log --oneline --all`.
