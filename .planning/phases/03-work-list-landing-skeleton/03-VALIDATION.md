---
phase: 3
slug: work-list-landing-skeleton
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-31
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Lifted verbatim from `03-RESEARCH.md` § Validation Architecture, which measured
> every value it asserts against the running app rather than deriving it.

`workflow.nyquist_validation` is `true` in `.planning/config.json`.

### Test framework

| Property | Value |
|----------|-------|
| Framework (browser/route) | Playwright **1.62.1**, `chromium` project only |
| Framework (unit / contract / build) | `node:test` + `node:assert` — no config file; Node 22.20 strips TS natively |
| Config file | `playwright.config.ts` — `testDir: ./tests`, `testMatch: **/*.spec.ts`, `webServer: npm run dev` on :3000, `reuseExistingServer` off-CI |
| Quick run command | `npx playwright test tests/<file>.spec.ts` · `node --test tests/unit/<file>.test.ts` |
| Full suite command | `npm run test:unit && npx playwright test` |
| Production-truth command | `rm -rf .next && npm run build && npm run test:build` (= `npm run test:all` minus the final Playwright pass) |
| Type gate | `npx tsc --noEmit` |
| Lint gate | `npm run lint` — **expects exactly 1 known error** (deferred item, `use-prefers-reduced-motion.ts:23`). Do not write a criterion of "0 errors". |
| Estimated runtime | Playwright ~6 s current; unit <1 s; clean build ~30–60 s |

**Framework install needed: none.**

### Phase requirements → test map

| Req ID | Behavior | Test type | Automated command | File exists? |
|---|---|---|---|---|
| **WORK-01** | `/` renders one `<ol role="list">` under `#work` with exactly 2 `<li>`, each with exactly one `<a>` (the title) | integration | `npx playwright test tests/landing.spec.ts` | ❌ Wave 0 |
| **WORK-01** | Both hrefs are the two absolute D-06 URLs; neither is a `github.com` URL (repo is private) | integration | same spec | ❌ Wave 0 |
| **WORK-01/D-05** | `WORK` is a non-empty tuple of exactly 2 well-formed `WorkEntry`s; every `href` is absolute https; every `host` is the href's hostname | unit | `node --test tests/unit/work.test.ts` | ❌ Wave 0 |
| **WORK-02** | Each row renders exactly one Body-role annotation line | integration | `tests/landing.spec.ts` | ❌ Wave 0 |
| **WORK-02/D-09** | No annotation names a tool. Absence assertion over a fixed banned list (`React`, `Next`, `D3`, `TypeScript`, `JavaScript`, `Svelte`, `WebGL`, `Python`, `built with`, `powered by`) | unit | `node --test tests/unit/work.test.ts` | ❌ Wave 0 |
| **WORK-02** | `ib-gdp-evolution` appears nowhere in the rendered page | integration | `tests/landing.spec.ts` (`body.innerText` absence) | ❌ Wave 0 |
| **HOME-01** | `<p>` under the nameplate renders `POSITIONING_PLACEHOLDER` at computed `font-weight: 530` | integration | `tests/landing.spec.ts` | ❌ Wave 0 |
| **HOME-01** | `/`'s `<meta name="description">` **equals** `POSITIONING_PLACEHOLDER` (one source — Pitfall 6) | build | `npm run test:build` | ⚠️ extend `tests/build/prerender.test.ts` |
| **HOME-01/D-02** | Rendered `body.innerText` of `/` and `/cv` contains none of `TODO`, `placeholder`, `Coming soon`, `Under construction`, `Lorem` | integration | `tests/landing.spec.ts`, `tests/cv.spec.ts` | ❌ Wave 0 |
| **HOME-03** | `nav[aria-label="Sections"]` holds exactly 5 links with hrefs `#work`, `/writing`, `#backlog`, `/cv`, `#contact` in that order | integration | `tests/landing.spec.ts` | ❌ Wave 0 |
| **HOME-03** | `/cv` responds **200** and renders an `<h1>` (it 404s today) | integration | `tests/cv.spec.ts` | ❌ Wave 0 |
| **HOME-03** | Each `section[id]` computes `scroll-margin-top: 32px` | integration | `tests/landing.spec.ts` (`getComputedStyle`) | ❌ Wave 0 |
| **HOME-03** | Every one of the 5 nav links has a computed target box ≥24 CSS px tall (WCAG 2.5.8) | integration | `tests/landing.spec.ts` (`getBoundingClientRect().height`) | ❌ Wave 0 |
| **HOME-04** | `#work` and its `<li>`s are not cards: all four border widths `0px` on `<li>` except the separator's `border-top`, `box-shadow: none`, background transparent/paper | integration | `tests/landing.spec.ts` — copy the pattern at `tests/writing-index.spec.ts:35-58` | ❌ Wave 0 |
| **HOME-04** | Separator computes `borderTopColor: rgba(0, 0, 0, 0.12)`, width `1px`, style `solid` (Pitfall 1) | integration | `tests/landing.spec.ts` — pattern at `tests/writing-index.spec.ts:100-106` | ❌ Wave 0 |
| **HOME-04** | No horizontal page overflow at **375** and **1440**; the work list stays one column at both | integration | `tests/landing-viewport.spec.ts` — pattern at `tests/fixture-viewport.spec.ts` | ❌ Wave 0 |
| **A1 (structural)** | `/` prerenders to `index.html` **and** emits `<link rel="canonical">` (the measured gap) | build | `npm run test:build` | ⚠️ extend |
| **A1 (structural)** | `app/(en)/page.tsx` contains no `"use client"` and no `useSmearHeading` import | unit | `node --test tests/unit/link-contract.test.ts` (source read) | ❌ Wave 0 |
| **CASE-03 slot** | `section#case-study` holds exactly one `h2.section-head` and exactly one `h3.text-heading` — **state-agnostic** (Pitfall 2) | integration | `tests/landing.spec.ts` | ❌ Wave 0 |
| **CASE-03 slot** | Interim copy present in **production** HTML; no `<a>` inside the interim `<h3>` | build | `npm run test:build` | ⚠️ extend |
| **HOME-06 regression** | `/` registers exactly **2** trail headings; both grow a multi-layer `text-shadow` mid-scroll and settle to `none` | integration | `tests/landing-trail.spec.ts` — pattern at `tests/smear-heading.spec.ts` | ❌ Wave 0 |
| **BUILD-05 regression** | Under `page.emulateMedia({ reducedMotion: 'reduce' })` **before** `goto`, both `/` headings stay `none` across a full scroll | integration | `tests/landing-trail.spec.ts` | ❌ Wave 0 |
| **BUILD-05** | Link hover/focus transitions live inside `@media (prefers-reduced-motion: no-preference)`; the colour/underline change does **not** | unit | `node --test tests/unit/link-contract.test.ts` | ❌ Wave 0 |
| **BUILD-06 regression** | `/` cumulative layout shift stays near zero with the much larger page (Pitfall 4) | integration | `npx playwright test tests/font-cls.spec.ts` | ✅ exists, route `/` already parameterised |
| **HOME-05 conformance** | `.section-head`/`.link`/`.link-quiet` introduce no fifth size, no third weight, no literal hex, no fourth rule weight, no `!important`; both `clamp()` curves still appear exactly once | unit | `node --test tests/unit/link-contract.test.ts` | ❌ Wave 0 |
| **A2** | `/writing` and `/texte` each render a `← Guillem Gelabert` link to `/`; the `/texte` one carries `hrefLang="en"` | integration | `npx playwright test tests/writing-index.spec.ts` (extend) | ⚠️ extend |
| **A3** | Every non-prose link on `/writing`, `/texte`, both `← Writing`/`← Texte` back links, **all three** `not-found` back links, and `LanguageSwitch` carry `.link-quiet` | integration | extend `tests/writing-index.spec.ts` + `tests/writing-not-found.spec.ts` | ⚠️ extend |
| **A4** | `/type` renders one `.section-head`, one `.link` and one `.link-quiet` specimen | integration | `npx playwright test tests/type-specimen.spec.ts` (extend) | ⚠️ extend |
| **Regression** | Every existing spec still green after de-clienting `/` and adding `/cv` | integration | `npx playwright test` | ✅ |
| **Build gate** | `rm -rf .next && npm run build` clean; route keys include `""` and `cv` | build | `npm run test:build` | ⚠️ extend `prerender.test.ts:190-194` |

### Sampling rate

- **Per task commit:** the single spec covering that task **plus** `npx tsc --noEmit`.
  For any task touching `app/globals.css` or `lib/work.ts`, also `npm run test:unit` (<1 s).
- **Per wave merge:** `npm run test:unit && npx playwright test`.
- **Phase gate:** `rm -rf .next && npm run build && npm run test:build && npx playwright test`,
  all green, **plus** `npm run lint` showing exactly the one known deferred error.
- **Max feedback latency:** 10 s for the commit-level loop.

**The clean-`.next` build is not optional at the phase gate.** Converting `/` from Client to
Server Component and adding `app/(en)/cv/page.tsx` are exactly the change class that stale
generated route types mask (`02-VALIDATION.md`, Phase 2's route-group lesson).

### Assertion-style rules — load-bearing, from Phase 1's scar tissue

Both are recorded in `STATE.md` § Decisions and restated in `02-VALIDATION.md`. They apply
directly here:

1. **Assert MEASURED computed values, not values assumed from the plan.**
   `tests/viewport.spec.ts:8-22` had to assert the real `clamp()` output (139.2 px at 1440 px)
   rather than the plan's "≈180 px near-ceiling" assumption. Concretely for Phase 3:
   - The nameplate at 1440 px is **139.2 px**, not 180 px. Reuse `viewport.spec.ts`'s
     `clampPx()` helper rather than hardcoding.
   - The featured `<h3>` **does** saturate its 72 px ceiling by 1440 px.
   - A Label-role link's line box is **18.2 px**; with `py-xs` it is **26.2 px**. Assert the
     measured `getBoundingClientRect().height`, not the arithmetic.
   - The separator colour is `rgba(0, 0, 0, 0.12)` as a computed string — assert that exact
     form, as `tests/writing-index.spec.ts:104` already does.
2. **`page.emulateMedia({ reducedMotion: 'reduce' })` called BEFORE `page.goto()`.**
   Playwright's `reducedMotion` context/test option was found unreliable for `matchMedia` in
   this environment (1.62.1 / Chromium). `tests/reduced-motion.spec.ts:20` is the reference.
   Ordering matters: the app reads `matchMedia(...).matches` at mount, so emulation applied
   after navigation tests the `change`-listener path rather than the visitor-arrives-with-the-
   preference path.

A third rule, earned in this research and worth adding to the phase's record:

3. **Assert production truth in `tests/build/`, dev truth in Playwright.** Every `*.spec.ts`
   runs against `npm run dev` where `showDrafts()` is `true`. Any assertion whose result
   depends on draft visibility — which now includes the featured slot's state — belongs in
   `tests/build/prerender.test.ts`, reading real HTML from `.next/server/app`. Playwright
   asserts structure; the build test asserts copy. (Pitfall 2.)

### Wave 0 gaps

Files that must exist before the implementation waves can be verified:

- [ ] `lib/work.ts` — the unit under test for `WORK-01`/`WORK-02`/`D-05`
- [ ] `tests/unit/work.test.ts` — tuple shape, absolute https hrefs, host↔href agreement, banned-tool-word absence
- [ ] `tests/unit/link-contract.test.ts` — the `globals.css` gate for the three new classes, reusing the parser from `tests/unit/prose-contract.test.ts` (extract `extractBlocks` / `declarationsOf` / `valuesOf` to a shared helper, or import them)
- [ ] `tests/landing.spec.ts` — `HOME-01`/`03`/`04`, `WORK-01`/`02`, slot structure, target size, no-placeholder-words
- [ ] `tests/landing-viewport.spec.ts` — 375 / 1440, no horizontal overflow, single column
- [ ] `tests/landing-trail.spec.ts` — 2 registered headings, smear-and-settle, reduced-motion
- [ ] `tests/cv.spec.ts` — 200, `<h1>`, back link, no placeholder words
- [ ] Extend `tests/build/prerender.test.ts` — route keys `""` and `cv`; `/`'s canonical; `description === POSITIONING_PLACEHOLDER`; interim slot copy; no `<a>` in the interim `<h3>`
- [ ] Extend `tests/writing-index.spec.ts`, `tests/writing-not-found.spec.ts`, `tests/type-specimen.spec.ts` — A2/A3/A4
- [ ] Update the stale comments in `tests/smear-heading.spec.ts:5-9` and `tests/reduced-motion.spec.ts:21-25` (they assert `/` has nothing to scroll — no longer true)

**Framework install:** none.

### Manual-only verifications

| Behavior | Requirement | Why manual | Instructions |
|---|---|---|---|
| The work section reads as hierarchy, not as two unrelated pages | UI-SPEC Dimension-2 flag #1 | Optical. 18 px Newsreader titles at n=2 beneath a 72 px Humane headline. No assertion can prove "reads as hierarchy". | Load `/` at **1440 px**. If the work section reads thin, the remedy is **more space and the existing rules — not a fifth type size**. |
| The 375 px pass | UI-SPEC designated optical checkpoint | Three specific failures are visual: whether the 5-item contents list wraps to a readable 2–3 rows rather than a ragged column; whether the ordinal-above-title stack reads as one row rather than four loose lines; whether the nameplate at its 56 px floor sits comfortably above the positioning sentence. | Load `/` and `/cv` at **375 px**. |
| The two `WORK-02` annotations are drafts | `D-09` | They satisfy the requirement as written but are not final copy. | Surface both lines to the user as editable at phase close. |
| `HOME-01` is still outstanding | `D-08`, UI-SPEC checklist item 1 | **The tripwire.** The placeholder is marked in source, not on screen, so the landing *looks finished* while the site's central sentence is unwritten. No visual pass can catch it. | Record as **deferred-by-decision** by name in the phase verification record, and carry it into every subsequent phase's state until the user supplies the sentence. It must never reach the `FIND-02` flag flip still holding `Developer.` |

### Validation sign-off criteria

- [ ] Every map row has a passing command
- [ ] No 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all ❌ rows
- [ ] No watch-mode flags
- [ ] Commit-level feedback latency < 10 s
- [ ] The four UI-SPEC phase-completion checklist items are carried into the verification record

---

