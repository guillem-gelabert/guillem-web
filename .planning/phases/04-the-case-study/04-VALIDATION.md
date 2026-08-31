---
phase: 4
slug: the-case-study
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-31
---

# Phase 4 — Validation Strategy

> Lifted from `04-RESEARCH.md` § Validation Architecture. Research drove the live story site
> with Playwright and located every breaking assertion by line number, so the numbers here are
> measured rather than estimated.

## Coordinator decisions on the four open questions (2026-08-31)

All four research recommendations accepted, so the planner is not blocked:

1. **DE ships `draft: false`.** `draft: true` remains a documented fallback if the executor
   judges the German not publishable. The two branches differ in test surface — `draft: false`
   additionally changes `/texte`'s prerendered empty-state assertion
   (`prerender.test.ts:102`); `writing-index.spec.ts:85` breaks either way. Plan both.
2. **DE title `Die Darstellung ändert sich`, slug `die-darstellung-aendert-sich`.**
   CONTEXT's provisional `Die Grafik ändert sich` appears nowhere in the shipped German; the
   live pivot sentence is *"Dafür ändert sich die Darstellung."* `SAFE_SLUG` rejects `ä`, so the
   `ae` transliteration is required, not stylistic.
3. **Figures captured at DSF 2** — 2400×1640, 132–180 KB each, ~450 KB committed.
4. **One `<Aside>`**, per CONTEXT. The losing caveat (shifting EU-27 composition before 1985)
   goes into running prose in beat 6.

**The live pages are authoritative, not the vault drafts** — `en_with_charts.md` differs from
the shipped page in its standfirst.

---

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `@playwright/test` 1.62.1 (e2e, against `npm run dev`) + `node --test` (units and build-tier) |
| Config file | `playwright.config.ts`; unit/build globs in `package.json` |
| Quick run command | `npm run test:unit` |
| Full suite command | `npm run test:all` (`test:unit` → `rm -rf .next` → `build` → `test:build` → `test`) |

Current baseline: 18 Playwright spec files, 5 unit test files, 1 build-tier file. `[VERIFIED: ls]`

### Three assertion rules carried forward

1. **Assert MEASURED computed values**, from `getBoundingClientRect()` / `getComputedStyle()` against a real render — never values derived from the plan's or the spec's arithmetic. (`tests/landing.spec.ts` records the Phase 1 lesson: a heading measured 139.2px where the plan assumed "≈180px".)
2. **`page.emulateMedia({ reducedMotion: 'reduce' })` BEFORE `page.goto()`** — load-bearing, because the app reads the preference at mount. `tests/landing-trail.spec.ts:163` states this explicitly. Specs that measure only static markup skip it and say so.
3. **Production truth lives in `tests/build/`, dev truth in Playwright.** Playwright runs against dev where `showDrafts()` is always true and structurally cannot prove what a production build omits.

### Phase Requirements → Test Map

Much of "done" here is editorial and cannot be asserted. What follows is D-18's mechanical gate expressed as commands. **Where a check is not mechanisable, it is marked `manual` rather than faked.**

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CASE-01 | Both MDX files satisfy the front-matter schema; `next build` passes | build | `rm -rf .next && npm run build` | ✅ (schema throws) |
| CASE-01 | The EN post prerenders at `/writing/the-chart-therefore-changes` | build | `node --test tests/build/prerender.test.ts` | ❌ Wave 0 |
| CASE-02 | Exactly six `<h2>` elements, each with a `rehype-slug` id, in CASE-02's order | e2e | `npx playwright test tests/case-study.spec.ts` | ❌ Wave 0 |
| CASE-02 | No `h4`–`h6` anywhere in the rendered post | e2e | same spec | ❌ Wave 0 |
| CASE-02 | The methodology section is last and contains the single `<aside>` | e2e | same spec | ❌ Wave 0 |
| CASE-03 | Featured slot resolves: `<h3>` contains an `<a href="/writing/the-chart-therefore-changes">` and it is the slot's only link | build | `node --test tests/build/prerender.test.ts` | ⚠️ exists, asserts the **interim** state — must be updated |
| CASE-03 | The slot renders the post's `title` and `standfirst` | build | same | ⚠️ same |
| HOME-02 | Exactly one section head and one Heading-role `<h3>` in `section#case-study` | e2e | `tests/landing.spec.ts` (p) | ✅ already state-agnostic, no change needed |
| D-08 | Every `<Figure>` has real intrinsic `width`/`height` matching the file on disk, and non-empty `alt` | unit | `node --test tests/unit/case-study-figures.test.ts` | ❌ Wave 0 |
| D-08 | No bare Markdown image | build | covered free — `mdx-components.tsx` `img` override throws at prerender | ✅ |
| D-10 | `Figure` and `Aside` are the only components used | unit | source scan of the two MDX files | ❌ Wave 0 |
| D-12 | No engineering claim anywhere in the prose | unit | banned-token scan over both MDX bodies | ❌ Wave 0 — **port the regex from `tests/unit/work.test.ts:54`** |
| D-15 | Both slugs match `SAFE_SLUG`; EN slug equals `CASE_STUDY_SLUG` | unit | `node --test tests/unit/work.test.ts` (extend) | ⚠️ partial — asserts the shape, not the file's existence |
| I18N-01 | Both locales build; the pair shares one `translationKey` | build | `npm run build` + prerender test | ⚠️ update |
| D-19 | Fact-check pass against live pages | **manual** | — | not mechanisable |
| D-05 | 1,200–1,800 words EN | unit | word count over the EN body | ❌ Wave 0 — cheap, worth having |

### Assertions that WILL break, and must be updated

This is the concrete maintenance cost of publishing. Six assertions across two files. **All are expected changes in what ships, not flaky tests** — `tests/build/prerender.test.ts:278` already carries a forward note saying so.

**`tests/build/prerender.test.ts` — four tests**

| Line | Test | Why it breaks | Update |
|---|---|---|---|
| 102 | *"both /writing and /texte render their empty state"* — asserts `Nothing published here yet.` / `The first piece is being written.` and the German equivalents | `/writing` gains a published entry | Assert `/writing` now lists the case study. **`/texte`'s half only changes if the DE ships `draft: false`** — under D-17's escape hatch it stays as is |
| 268 | *"the featured slot ships its interim copy in production"* — asserts `The case study is being written.` | slot resolves | Assert the published title and standfirst |
| 289 | *"the interim featured headline carries no link"* — `assert.doesNotMatch(match[0], /<a/)` | the published headline **is** a link | Invert: assert exactly one `<a>`, pointing at `/writing/the-chart-therefore-changes` |
| 342 | *"launch gate: the featured slot, the backlog stub and the contact stub are all still interim"* | the featured slot is no longer interim | **Narrow the gate to the two remaining stubs (backlog, contact).** This test exists to fail when the interim state ends — closing the featured-slot third of it is this phase's job, and Phase 6 still needs the other two |

**`tests/writing-index.spec.ts` — two tests, both dev-visible regardless of `draft`**

| Line | Test | Why it breaks | Update |
|---|---|---|---|
| 21 | *"/writing renders exactly one article whose h2 is the sole link"* — `toHaveCount(1)` | the EN case study makes it 2 in dev | `toHaveCount(2)` |
| 85 | *"/texte renders two articles separated by hr, reverse-chronological…"* — `toHaveCount(2)`, `hr` `toHaveCount(1)`, and an exact title list | the DE file makes it 3 articles / 2 hrs **even at `draft: true`**, and it sorts first (2026-08-31) | `toHaveCount(3)`, `hr` `toHaveCount(2)`, prepend the DE title. **`page.locator("main > hr").evaluate(…)` will throw a strict-mode violation with two hrs** — scope it to `.first()` |

Also verify (expected to pass, worth an explicit check): `tests/landing.spec.ts:428` asserts `page.locator("img")` `toHaveCount(0)` on the landing page. The three figures live on `/writing/{slug}`, not `/`, so this holds. `[VERIFIED: reading the spec]`

### Sampling Rate

- **Per task commit:** `npm run test:unit`
- **Per wave merge:** `npm run test:all`
- **Phase gate:** full suite green, plus the manual D-19 fact-check pass, before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/case-study.spec.ts` — six `<h2>` ids in order, no `h4`–`h6`, methodology last, one `<aside>`, one outbound prose link (CASE-02, D-04, D-06, D-20)
- [ ] `tests/unit/case-study-content.test.ts` — reads both MDX files from disk: word count (D-05), banned engineering tokens (D-12, regex ported from `work.test.ts:54`), only `Figure`/`Aside` used (D-10), no bare Markdown image (D-08), shared `translationKey`
- [ ] `tests/unit/case-study-figures.test.ts` — every `<Figure>`'s `width`/`height` matches the real PNG dimensions on disk, and `alt` is non-empty and longer than a threshold (D-08, D-09)
- [ ] Update `tests/build/prerender.test.ts` — four tests, per the table above
- [ ] Update `tests/writing-index.spec.ts` — two tests, per the table above
- [ ] Capture script (`scripts/capture-case-study-figures.mjs` or similar) — not a test, but Wave 0 work that everything else depends on

No framework install is needed.

