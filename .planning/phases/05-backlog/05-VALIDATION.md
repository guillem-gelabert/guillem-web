---
phase: 5
slug: backlog
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-31
---

# Phase 5 — Validation Strategy

> From `05-RESEARCH.md` § Validation Architecture. Research executed all five branches of the
> git guard against real fixtures rather than reasoning about them, and located every breaking
> assertion by file:line.

## Coordinator decisions on the four open questions (2026-08-31)

All four research recommendations accepted:

1. **`pudding-pudding` ships**, described as a corpus study and **never as a pitch** — it may be a
   live pitch and describing it as one on a public site could cost the user the pitch. Flagged for
   one-edit veto in the user's copy review.
2. **Item names render as `<h3>`.** This requires updating `landing.spec.ts:389`'s `h3: 3` to `6`.
3. **The launch-gate test is re-pointed, not shrunk** — at the three outstanding copy-review items,
   via a `COPY_REVIEWED = false` source-scrape.
4. **Do not name real Zürich house names.** Read from `data/derived/` or omit.

## Two blockers research resolved — do not re-derive

- **`node --test` cannot import `.tsx`** (`ERR_UNKNOWN_FILE_EXTENSION`, reproduced on Node 22.20).
  D-05 locks `lib/backlog.tsx`; D-09 locks a unit check reading `LAST_TOUCHED` from it. Resolution:
  **read the module as source text**, exactly as `tests/unit/link-contract.test.ts:265-267` already
  does against `app/(en)/page.tsx`. The repo has the shared non-`*.test.ts` reader idiom twice
  (`css-source.ts`, `case-study-source.ts`). No dependency, no module split, no decision reopened.
- **The git guard has two false-skip modes.** In a `--depth 1` clone `git log -1 --format=%cs -- <path>`
  returns **HEAD's date, not the file's** (proved with a fixture). `--is-shallow-repository` must be a
  skip condition. And `.git` is a **file**, not a directory, in a linked worktree — and executors run
  in one — so `existsSync(".git")` detection would skip in exactly the environment the phase executes
  in. The dirty branch falls back to file mtime, which is what keeps the guard non-vacuous during the
  phase's own execution. The Railway concern is misdirected: `next build` never runs tests.

## Two rendering traps research verified

- Tailwind v4 preflight ships `b,strong{font-weight:bolder}`, so a `<strong>` **outside** `.prose-site`
  renders **700** — a third weight on screen — while every `globals.css` source-budget test stays green.
- React 19.2.8 emits `<time dateTime="...">` camelCase in prerendered HTML, so a build-tier
  `includes('datetime="...")` check fails while Playwright passes.

---

### Test Framework

| Property | Value |
|----------|-------|
| Unit framework | `node:test` + `node:assert/strict` (Node 22.20.0 built-in type stripping) |
| Build-tier framework | `node:test` over real `next build` output in `.next/server/app` |
| Browser framework | `@playwright/test` 1.62.1, chromium project only |
| Config files | `playwright.config.ts` (testDir `./tests`, testMatch `**/*.spec.ts`, `webServer: npm run dev`, baseURL `http://localhost:3000`) |
| Quick run command | `npm run test:unit` |
| Build-tier command | `rm -rf .next && npm run build && npm run test:build` |
| Browser command | `npm test` |
| Full suite command | `npm run test:all` |
| Type check | `npx tsc --noEmit` |
| Lint | `npx eslint` — **baseline is exactly 1 error** (see below) |

**Lint baseline (measured this session):**
`components/smear-heading/use-prefers-reduced-motion.ts:23:5` —
`react-hooks/set-state-in-effect`. Total: `✖ 1 problem (1 error, 0 warnings)`.
The criterion is **no NEW errors**: any run that reports more than this one error, or reports
an error in a different file, is a regression.

### Phase Requirements → Test Map

| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|--------------|
| BACK-01 | `lib/backlog.tsx` holds 1–4 items, each with a non-empty `name` and a `description` node | unit (source-scrape) | `npm run test:unit` → `tests/unit/backlog.test.ts` | ❌ Wave 0 |
| BACK-01 | `section#backlog` renders one `<ul role="list">` with N `<li>`, N = item count | e2e | `npx playwright test tests/landing.spec.ts -g "backlog list"` | ⚠️ new test in existing file |
| BACK-01 | Each row: one name at `.text-standfirst`, one `p.max-w-prose.text-body`; **zero ordinals, zero host lines, zero `<a>` on the name** (`D-11`) | e2e | same | ⚠️ new test |
| BACK-01 | Row separator computes `border-top: 1px solid rgba(0, 0, 0, 0.12)` on rows 2..N and `0px` on row 1 — **MEASURED**, mirroring `landing.spec.ts:297-304` | e2e | same | ⚠️ new test |
| BACK-01 | Inter-row gap computes `32px`; name→description gap `8px`; `max-width` `65ch` on the description — **MEASURED** | e2e | same | ⚠️ new test |
| BACK-01 | Every computed `font-weight` inside `section#backlog` ∈ {400, 530}; every computed `font-size` ∈ {14px, 18px} (Pitfall 1) | e2e | same | ⚠️ new test |
| BACK-01 | Item copy names no tool/language/framework — the `work.test.ts:56-58` banned list, applied to rendered text | build | `npm run test:build` | ⚠️ new test in `prerender.test.ts` |
| BACK-01 | Production HTML: no `href*="github.com"`, no `target="_blank"`, no marker word | build | same | ✅ existing assertions, now covering new copy |
| BACK-02 | `LAST_TOUCHED` matches `YYYY-MM-DD`, is a real calendar date, and is not in the future | unit | `npm run test:unit` → `tests/unit/backlog.test.ts` | ❌ Wave 0 |
| BACK-02 | `isStale()` orders ISO dates correctly (pure; **always runs**) | unit | same | ❌ Wave 0 |
| BACK-02 | Git freshness: module's last change ≤ `LAST_TOUCHED`; skips **with a stated reason** on no-git / shallow / no-history | unit | `npm run test:unit` → `tests/unit/backlog-freshness.test.ts` | ❌ Wave 0 |
| BACK-02 | Rendered `<time dateTime="…">` in production HTML **equals** the source `LAST_TOUCHED` (by equality, not literal — the `POSITIONING_PLACEHOLDER` technique) | build | `npm run test:build` | ⚠️ new test |
| BACK-02 | The date line is `p.text-label` and sits **above** the first `<li>` — assert `getBoundingClientRect().y` ordering (`D-12`) | e2e | `npx playwright test tests/landing.spec.ts` | ⚠️ new test |
| BACK-02 | Rendered date text equals `formatPostDate(LAST_TOUCHED, "en")` — no second formatter | build | `npm run test:build` | ⚠️ new test |
| D-13 | The Phase 3 stub strings appear **nowhere** in production HTML | build | `npm run test:build` | ⚠️ **inverted** from `prerender.test.ts:486-487,539` |
| D-14 | `lib/backlog.tsx` still exports `COPY_REVIEWED = false` → the launch gate is still open | build (source-scrape) | `npm run test:build` | ⚠️ replaces the deleted `:539` assertion |
| Regression | Section count 4, section-head text/order, heading outline, no card idiom, no `main button`, no `img` | e2e | `npm test` | ✅ existing (`:82`, `:347`, `:373`, `:427`) — `:389` needs its `h3` count updated |
| Regression | `app/(en)/page.tsx` stays a Server Component with no `robots:` | unit | `npm run test:unit` | ✅ `link-contract.test.ts:270-291` |
| Regression | `globals.css` budget unchanged (4 sizes, 2 weights, no literal colour, `{1px,2px,4px}` rules) | unit | `npm run test:unit` | ✅ `prose-contract` (m)(n)(o) |

### Three rules that carry, restated

1. **Assert MEASURED computed values, never derived arithmetic.** Phase 1 learned this the
   expensive way (the Display clamp reads 139.2px at 1440px, not the plan's assumed ≈180px).
   Every spacing, colour and weight assertion above reads `getComputedStyle` /
   `getBoundingClientRect` from a real render. `toHaveCount()` cannot see a wrong rule colour.
2. **`page.emulateMedia({ reducedMotion: "reduce" })` BEFORE `page.goto()`.** Playwright's
   `reducedMotion` *context/test option* does not reliably affect
   `matchMedia('(prefers-reduced-motion: reduce)')` in this environment (1.62.1 / Chromium) —
   recorded in `STATE.md` from Phase 1 and honoured by `tests/reduced-motion.spec.ts:20`.
   This phase ships no motion, so no new reduced-motion spec is needed; the rule is restated so
   nobody adds one the wrong way.
3. **Production truth lives in `tests/build/`; dev truth lives in Playwright.** Playwright runs
   against `npm run dev`, where `NODE_ENV=development` and `showDrafts()` is always true — it
   structurally cannot prove what a production build omits. Copy assertions and
   `<time dateTime>` string matching belong in `tests/build/prerender.test.ts`; computed styles
   and geometry belong in Playwright. Do not cross them.

### Sampling Rate

- **Per task commit:** `npm run test:unit` (fast; must stay fast — do not put build-output reads
  in `tests/unit/`) and `npx tsc --noEmit`.
- **Per wave merge:** `rm -rf .next && npm run build && npm run test:build && npm test`, plus
  `npx eslint` compared against the 1-error baseline.
- **Phase gate:** full `npm run test:all` green, `npx tsc --noEmit` clean, `npx eslint` at
  exactly the known 1 error, then `/gsd:verify-work`.

### Wave 0 Gaps

- [ ] `tests/unit/backlog-source.ts` — shared source reader; **must not** be named `*.test.ts`
- [ ] `tests/unit/backlog.test.ts` — `BACKLOG` shape/count, `LAST_TOUCHED` shape/validity,
      `COPY_REVIEWED` present — covers BACK-01, BACK-02
- [ ] `tests/unit/backlog-freshness.test.ts` — pure `isStale` cases + the five-branch git probe
      — covers BACK-02 (`D-09.2`)
- [ ] `tests/build/prerender.test.ts` — **edits, not a new file:** delete `:486`, `:487`, `:539`;
      retitle and re-comment the launch-gate test at `:517`; add the rendered-date-equality,
      item-count, banned-tool-word and `COPY_REVIEWED` assertions
- [ ] `tests/landing.spec.ts` — **edits:** narrow test (u) at `:445` to `["contact"]`; update
      `h3` count at `:389` if names render as `<h3>`; add the backlog structure, geometry,
      separator-colour, weight/size-budget and date-above-list tests
- [ ] Framework install: **none** — every framework is present

