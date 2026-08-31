# Launch gate — state after Phase 4

This record has three parts: what Task 2 confirmed live, what Phase 4 closed and why closing it
was structural rather than a code change, and what remains open with its owning phase. Read this
before Phase 5 or Phase 6 touch anything the gate covers. (Task 3 adds the closure and open-items
sections below the deployment confirmation.)

---

## Live deployment confirmation (Task 2)

**Commit deployed:** `49566b49ecb927cbd907fdd03a6fdbc32938255a` — `docs(phase-04): update tracking
after wave 5`, committer date `2026-08-31T19:10:47+02:00`. This is the tip of `origin/master` at
the time this plan started (per the execution notes, everything was already merged and pushed
before this executor began — no push happened from this worktree).

**Checked:** `2026-08-31T17:25:24Z`, against `https://web-production-9cedb.up.railway.app` directly
(never localhost). Every check below fetched the live response and inspected it; a bare 200 was
never treated as sufficient on its own.

| # | Check | Method | Result |
|---|---|---|---|
| 1 | `tests/deploy-smoke.spec.ts` passes against the live URL | `PLAYWRIGHT_BASE_URL=https://web-production-9cedb.up.railway.app npx playwright test tests/deploy-smoke.spec.ts` | **PASS** — 1/1, real Next.js App Router response (`__next_f` + `/_next/static/` script) |
| 2 | `/` responds 200 | `curl -o /dev/null -w "%{http_code}"` | **200** |
| 3 | `/writing` responds 200 | same | **200** |
| 4 | `/writing/the-chart-therefore-changes` responds 200 | same | **200** |
| 5 | `/texte` responds 200 | same | **200** |
| 6 | `/texte/die-darstellung-aendert-sich` responds 200 | same | **200** (German shipped `draft: false` — see Plan 04's own decision record; not held back) |
| 7 | Featured slot renders the case study's title and standfirst, headline links to the post | `grep -c` on fetched `/` HTML for `"The Chart Therefore Changes"`, the standfirst sentence, and `href="/writing/the-chart-therefore-changes"` | **All present** (1 line-match each — HTML is unminified onto few lines, so `grep -c` counts lines not occurrences; multiple real occurrences confirmed separately with `grep -o`) |
| 8 | Interim featured copy is gone from `/` | `grep -c "The case study is being written"` on fetched `/` HTML | **0** — absent |
| 9 | `/writing` index lists the case study | `curl` + inspect; cross-checked against `tests/build/prerender.test.ts:115` (`"both /writing and /texte render one real published entry, not their empty state"`) | **Confirmed** — production build prerenders exactly 1 `<article>` on `/writing`, the published case study (see note below on the plan's "two entries" wording) |
| 10 | English case study HTML contains all six section-mark ids and all three `/case-study/` image paths | `grep -c` for each of `the-question`, `what-i-expected`, `what-the-data-showed`, `where-the-chart-changed`, `what-shipped`, `methodology`, and each of the three PNG paths, on the fetched page | **All present** — 6/6 ids, 3/3 image paths (2 occurrences each: `src` + preload) |
| 11 | Each of the three PNGs responds 200, `content-type: image/png`, `content-length` equal to the byte size recorded in `04-01-SUMMARY.md` | `curl -D -` per file | **All three match exactly**: `f1-constant-dollars.png` 180335 bytes, `f2-eu-average.png` 132071 bytes, `f3-arrivals-diverge.png` 133264 bytes — all `image/png`, all 200 |
| 12 | German index reflects the shipped branch (three entries if `draft: false`, two if `draft: true`) | `grep -c "Die Darstellung ändert sich"` on fetched `/texte` HTML + `<article>` count | **`draft: false` branch confirmed live** — the German title appears on `/texte`, and the route prerenders exactly 1 `<article>` in production (the second/third dev-fixture entries are drafts, correctly hidden) |
| 13 | German case study route responds 200 and carries its six German section marks | `grep -c` for `Die Frage`, `Was ich erwartet hatte`, `Was die Daten zeigten`, `Wo sich die Darstellung ändert`, `Was veröffentlicht wurde`, `Methodik` on the fetched page | **6/6 present** |
| 14 | `tests/case-study.spec.ts` passes against the live URL, both locales | `PLAYWRIGHT_BASE_URL=... npx playwright test tests/case-study.spec.ts` | **PASS** — 9/9, including the three `<img>` elements measuring 2400 `naturalWidth` from the actually-loaded bitmap (proof the figures decode, not just serve headers) and the blockquote/`em` computed-style reset in both locales |
| 15 | `/` still carries `noindex` in its robots meta | `grep -o '<meta name="robots"[^>]*>'` | **`<meta name="robots" content="noindex"/>`** — unchanged, `FIND-02` has not happened |
| 16 | `/` contains no `github.com` href, no `ib-gdp-evolution` string, no `target="_blank"` | `grep -c` for each on fetched `/` HTML | **0 / 0 / 0** — all absent |

**Note on check 9's "two entries" wording.** The interface note in this plan's own `<context>`
describes `/writing` as showing "two entries, the case study first" — that describes the *design
target* once a second work item is published (Phase 5's backlog work), not the state after this
phase. What Phase 4 actually closes is narrower and is stated correctly by `tests/build/
prerender.test.ts:115`'s own title: "both /writing and /texte render one real published entry, not
their empty state." One real entry is what ends `n = 0`; it is not yet `n = 2`. The gate this
phase closes is exactly the `n = 0` gate, not a specific entry count — see Closure below.

**Bonus corroboration, not a required check.** `tests/writing-index.spec.ts` was also run against
the live URL as an extra signal. Both of its tests fail there by design: they assert dev-mode
counts (2 articles on `/writing`, 3 on `/texte`, because `npm run dev`'s `showDrafts()` is always
true and shows the unpublished fixtures alongside the real entry). Against production, `/writing`
and `/texte` each prerender exactly 1 `<article>` — confirmed directly with `grep -c "<article"` —
which is the correct, expected divergence and is itself evidence that draft-visibility is working
in production exactly as designed. This is not a failure of this phase; it is `tests/writing-
index.spec.ts` doing what its own file header says it does (dev-tier only).

**Suite state at the time of this deploy check:** `npm run test:unit` 88/88 pass (see `fact-check
.md`'s Verification section — unchanged by the accuracy audit). `npm run lint` retains exactly the
one pre-existing deferred error at `use-prefers-reduced-motion.ts:23`.
