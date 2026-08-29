---
phase: 1
slug: deploy-foundation-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-29
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `01-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (`@playwright/test` 1.62.1) — not yet installed; Wave 0 installs it (repo has no `package.json` yet) |
| **Config file** | `playwright.config.ts` — none yet; Wave 0 creates it (`webServer` → `next dev` for local runs) |
| **Quick run command** | `npx playwright test --project=chromium tests/<spec-for-this-task>.spec.ts` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~10s quick (single spec, chromium) / ~60s full suite |

**Why Playwright and not a unit-test framework:** every success criterion in this phase is a
DOM/runtime/visual behavior — computed `text-shadow` mid-scroll, `prefers-reduced-motion`
branching, viewport-dependent `clamp()` values, cumulative layout shift on font load. None are
exercisable by a pure unit test against isolated functions; they require a real browser context.
Keep the suite small and tied directly to the 7 requirement IDs below — the project's working
agreement is "MVP first," and a sprawling suite for a two-route holding page is disproportionate.

---

## Sampling Rate

- **After every task commit:** Run the single most relevant spec for the task just completed
  (e.g. after wiring fonts → `font-cls.spec.ts`; after porting the trail → `smear-heading.spec.ts`)
- **After every plan wave:** Run `npx playwright test` (full suite)
- **Before `/gsd:verify-work`:** Full suite green, plus the live-URL smoke test (BUILD-02) run
  against the actual deployed Railway URL post-push — not just a local dev server
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

Populated during execution as each plan's tasks are committed. Requirement → spec mapping is
fixed by the table below; the Task ID column is filled in from the PLAN.md task IDs.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _tbd_ | _tbd_ | _tbd_ | BUILD-01 | — | N/A | build check | `npm run build` | ❌ W0 | ⬜ pending |
| _tbd_ | _tbd_ | _tbd_ | BUILD-02 | T-01-03 (stale Dockerfile deploys wrong artifact) | Live URL serves the Next.js app, not the old static prototype | smoke (post-deploy) | `npx playwright test tests/deploy-smoke.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| _tbd_ | _tbd_ | _tbd_ | BUILD-03 | — | N/A | e2e | `npx playwright test tests/viewport.spec.ts` | ❌ W0 | ⬜ pending |
| _tbd_ | _tbd_ | _tbd_ | BUILD-05 | — | N/A | e2e | `npx playwright test tests/reduced-motion.spec.ts` | ❌ W0 | ⬜ pending |
| _tbd_ | _tbd_ | _tbd_ | BUILD-06 | — | N/A | e2e (PerformanceObserver via `page.evaluate`) | `npx playwright test tests/font-cls.spec.ts` | ❌ W0 | ⬜ pending |
| _tbd_ | _tbd_ | _tbd_ | HOME-05 | — | N/A | e2e + manual visual review | `npx playwright test tests/type-specimen.spec.ts` | ❌ W0 | ⬜ pending |
| _tbd_ | _tbd_ | _tbd_ | HOME-06 | — | N/A | e2e | `npx playwright test tests/smear-heading.spec.ts` | ❌ W0 | ⬜ pending |

**Behavior asserted per requirement:**

| Req ID | Behavior under test |
|--------|---------------------|
| BUILD-01 | `next build` completes without error |
| BUILD-02 | Live Railway URL returns 200 and the real app's markup (not the old prototype) |
| BUILD-03 | Type scale renders within expected bounds at mobile (375px) and desktop (1440px) viewports |
| BUILD-05 | With `reducedMotion: 'reduce'` emulated, heading's computed `text-shadow` stays `'none'` throughout a scroll |
| BUILD-06 | Cumulative Layout Shift ≈ 0 across the font-load window |
| HOME-05 | `/type` specimen route renders every declared type role at its specified face/size/weight (spot-checked via computed style, not full visual regression) |
| HOME-06 | Heading's `text-shadow` is non-`'none'` with multiple layers mid-scroll, and returns to `'none'` after `SCROLL_STOP_DELAY` (120ms) + settle |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` + Next.js scaffold — nothing below can run until the app exists (this is the
      phase's own first deliverable, and the literal blocking dependency for every spec)
- [ ] Framework install: `npm install -D @playwright/test && npx playwright install chromium`
- [ ] `playwright.config.ts` — base config, `webServer` pointing at `next dev` for local runs
- [ ] `tests/deploy-smoke.spec.ts` — covers BUILD-02 (parametrized `baseURL` for the live URL)
- [ ] `tests/viewport.spec.ts` — covers BUILD-03
- [ ] `tests/reduced-motion.spec.ts` — covers BUILD-05
- [ ] `tests/font-cls.spec.ts` — covers BUILD-06
- [ ] `tests/type-specimen.spec.ts` — covers HOME-05
- [ ] `tests/smear-heading.spec.ts` — covers HOME-06

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live deploy serves the new app at a stable Railway URL | BUILD-02 | The automated smoke spec needs a real deployed URL — it cannot be produced by a local dev server. The URL is only known after the first successful Railway deploy. | Push to the deploy branch, wait for the Railway build to go green, then run `PLAYWRIGHT_BASE_URL=<railway-url> npx playwright test tests/deploy-smoke.spec.ts` |
| `/type` specimen reads as a deliberate, authored type system | HOME-05 | The specimen route *is* the reference artifact by design — computed-style spot checks prove the values are applied, but whether the scale reads as intentional is a human judgment, not an assertion. | Open `/type` at 375px and 1440px; confirm every declared role renders at its specified face/size/weight and the scale reads as authored, not framework-default |
| Smear trail feels correct in motion | HOME-06 | The spec asserts multi-layer `text-shadow` mid-scroll and settle-to-`none`; it cannot assert that the smear *looks* like the benchmark. | Scroll the home page and compare against `text_trail_demo/index.html` side by side |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
