---
phase: 2
slug: content-pipeline
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-30
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `02-RESEARCH.md` § Validation Architecture. Every "VERIFIED" claim below was
> run in this repo during research, not read from docs.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (browser/route)** | Playwright `1.62.1`, `chromium` project only |
| **Framework (unit)** | `node:test` + `node:assert` — no config file; Node 22.20 strips TS natively |
| **Config file** | `playwright.config.ts` — `testDir: ./tests`, `webServer: npm run dev` on :3000, `reuseExistingServer` off-CI |
| **Quick run command** | `npx playwright test tests/<file>.spec.ts` (~1s) / `node --test tests/unit/<file>.test.ts` |
| **Full suite command** | `npx playwright test && node --test 'tests/unit/*.test.ts'` |
| **Estimated runtime** | ~6 seconds (current suite: 9 passed in 5.4s) |

**Framework install needed: none.** Playwright is installed and configured; `node --test` is built in.

---

## Sampling Rate

- **After every task commit:** the single spec covering that task, plus `npx tsc --noEmit`
  (fast; catches the `LayoutProps` and `params`-Promise error classes).
- **After every plan wave:** `npx playwright test && node --test 'tests/unit/*.test.ts'`
- **Before `/gsd:verify-work`:** `rm -rf .next && npx next build` clean, then full suite green.
  **The clean-`.next` build is not optional** — the route-group restructure is exactly the
  change stale generated types break on.
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Requirement | Behavior | Test Type | Automated Command | File Exists |
|-------------|----------|-----------|-------------------|-------------|
| SC1 | A new `content/*.mdx` file is served at `/writing/{slug}` with no route file added | integration | `npx playwright test tests/writing-routing.spec.ts` | ✅ |
| SC1 | Title / date / standfirst come from front-matter; slug comes from filename | unit | `node --test tests/unit/content.test.ts` | ✅ |
| SC1 | Malformed front-matter fails the build rather than rendering | unit | `node --test tests/unit/content.test.ts` (assert `assertFrontmatter` throws) | ✅ |
| WRIT-01 / SC2 | `/writing` renders the index; featured entry title is Display-role and is the only link | integration | `npx playwright test tests/writing-index.spec.ts` | ✅ |
| WRIT-01 / D-10 | No card, border, fill or "Read more" in the index markup | integration | same spec (assert absence) | ✅ |
| SC3 | Prose `<p>` computes to Newsreader 18px / 1.6; `h2`/`h3` to 14px uppercase 0.04em — Phase 1 tokens, not plugin defaults | integration | `npx playwright test tests/prose-typography.spec.ts` | ✅ |
| SC4 | Every `pre` in `.prose-site` carries the `shiki` class, has no inline `background-color`, has `tabindex="0"` + accessible name | integration | `npx playwright test tests/prose-code.spec.ts` | ✅ |
| SC4 | Inline `<code>` is **not** token-coloured | integration | same spec | ✅ |
| SC5 | Fixture renders every Prose Contract element at 375px and 1440px; no horizontal page overflow (code/table may scroll internally) | integration | `npx playwright test tests/fixture-viewport.spec.ts` | ✅ |
| SC5 / D-11 | Fixture absent from `/writing` in a production build, present in dev | integration | `npx playwright test tests/draft-visibility.spec.ts` | ✅ |
| I18N-01 | `/writing/*` serves `<html lang="en">`; `/texte/*` serves `<html lang="de">` | integration | `npx playwright test tests/i18n-routing.spec.ts` | ✅ |
| I18N-01 | Switcher renders with the target-language label when a translation exists | integration | same spec | ✅ |
| I18N-01 / D-07 | Switcher **absent from the DOM** (not disabled, not `aria-disabled`) when no translation exists | integration | same spec | ✅ |
| I18N-01 | `link[rel=alternate][hreflang]` pairs plus `x-default` and a canonical are emitted | integration | same spec | ✅ |
| I18N-01 | Dates render `29 August 2026` / `29. August 2026` inside `<time datetime>` | unit | `node --test tests/unit/dates.test.ts` | ✅ |
| D-06 / D-07 | `translationOf()` pairs by `translationKey`, returns `null` for a lone post, never pairs same-locale | unit | `node --test tests/unit/content.test.ts` | ✅ |
| V4 (ASVS) | `[slug]` is allowlisted against `publishedFor(locale)` **before** the dynamic `import()` | unit | `node --test tests/unit/content.test.ts` | ✅ |
| Error path | `/writing/nope` and `/texte/nope` render the localised not-found copy | integration | `npx playwright test tests/writing-not-found.spec.ts` | ✅ |
| Regression | `/` and `/type` still work after the route-group move | integration | `npx playwright test` (existing 9 specs) | ✅ **verified passing** |
| BUILD-06 | Post-route CLS stays near zero with the added italic + mono faces | integration | extend `tests/font-cls.spec.ts` to `/writing/fixture` | ✅ second case added |
| Build gate | `next build` succeeds from a clean `.next` | build | `rm -rf .next && npx next build` | ✅ |

---

## Wave 0 Requirements

- [x] `content/fixture.mdx` — the fixture post itself; every SC5 assertion depends on it
- [x] `content/` second-locale fixture (a DE post sharing a `translationKey`) — required to test
      the switcher's *present* branch; the EN fixture alone only tests the absent branch
- [x] `lib/content.ts` + `lib/locales.ts` — the units under test
- [x] `tests/unit/content.test.ts` — covers SC1, D-06, D-07, ASVS V4
- [x] `tests/unit/dates.test.ts` — covers I18N-01 date formats
- [x] `tests/writing-routing.spec.ts`, `tests/writing-index.spec.ts`, `tests/writing-not-found.spec.ts`
- [x] `tests/prose-typography.spec.ts`, `tests/prose-code.spec.ts`
- [x] `tests/fixture-viewport.spec.ts`, `tests/draft-visibility.spec.ts`
- [x] `tests/i18n-routing.spec.ts`
- [x] `package.json` scripts: `"test": "playwright test"`, `"test:unit": "node --test 'tests/unit/*.test.ts'"`
- [x] Extend `tests/font-cls.spec.ts` with a `/writing/fixture` case

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `h2` vs `h3` read as two distinct levels | UI-SPEC D4 flag | Optical judgement — identical type (14px uppercase 0.04em) separated only by a 1px rule and 48px vs 32px top margin. No assertion can prove "reads as two levels". | Load `/writing/fixture` at 375px and 1440px. An `h2` and an `h3` sit close enough to compare in one glance with two paragraphs under each. If they do not read as two levels at 375px, the fix is **more space above `h2` — not a fifth type size**. |
| Prose reads as Phase 1's system, not plugin defaults | SC3 | The computed-value assertions prove the tokens applied; they cannot prove the result is typographically coherent. | Read the fixture end to end at 1440px against `/type`. |

---

## Assertion-Style Rules (from Phase 1's scar tissue)

STATE.md records two Phase 1 lessons that apply directly here:

1. **Assert computed values measured from a real render, not values assumed from the plan.**
   `viewport.spec.ts` had to assert the actual `clamp()` output (139.2px at 1440px), not the
   near-ceiling value the plan assumed.
2. **Use `page.emulateMedia({ reducedMotion: 'reduce' })` before `page.goto()`.** Playwright's
   `reducedMotion` *test option* did not affect `matchMedia` in this environment.

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-30 — every map row has a passing command; all Wave 0 items exist. Two Manual-Only items remain open by design (h2/h3 optical read, prose coherence against /type).
