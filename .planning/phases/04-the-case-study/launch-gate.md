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

---

## Closure — what Phase 4 closed, and why it cost zero production code

**Net production code change for the phase: zero.** The featured slot's state is derived from
`findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)` in `components/landing/featured-slot.tsx`,
and `CASE_STUDY_SLUG` was already correct in `lib/work.ts` before this phase began (set in Phase 3).
Publishing `content/the-chart-therefore-changes.mdx` with `draft: false` (Plan 03) is the entire
mechanism — the slot was written to branch on the pipeline's own resolved state, not on a flag
anyone had to remember to flip. A future reader looking for the commit that "wired up" the featured
slot will not find one, because there isn't one; the record of *why* is this file plus `tests/
build/prerender.test.ts`'s two positive assertions (lines 417 and 456), which prove the wiring by
running it against a real production build rather than asserting it in prose.

**Condition 1 — CLOSED. `/writing` at `n = 0` must never be the public launch condition (Phase 2,
`02-UI-SPEC.md` § Launch gate).**
Proven by: `tests/build/prerender.test.ts` → `"both /writing and /texte render one real published
entry, not their empty state"` (line 115). `/writing` prerenders one real `<article>` in production
as of Plan 03's publish; `/texte` does too as of Plan 04's `draft: false` decision. Confirmed live
in Task 2 above (check 9).

**Condition 2 — CLOSED. The featured slot's interim state (Phase 3, `03-UI-SPEC.md` § Featured
slot contract).**
Proven by: `tests/build/prerender.test.ts` → `"the featured slot ships the published case study's
own title and standfirst in production (HOME-02)"` (line 417) and `"the featured headline is a
link to the case study and the slot's only link (CASE-03)"` (line 456). The slot resolves to a
real entry with a real link; the retired interim headline ("The case study is being written.") is
asserted absent by the same test. Confirmed live in Task 2 above (checks 7, 8).

Both closures are also the reason `tests/build/prerender.test.ts`'s own launch-gate test was
**narrowed**, not deleted, by Plan 05: `"launch gate: the backlog stub and the contact stub are
still interim — the featured slot closed on 2026-08-31"` (line 517). The test's own inline comment
records the narrowing explicitly — removing the interim-headline assertion from that gate test *is*
the gate mechanism working: an interim state ended, and the test that proved it was interim was
updated rather than silently left passing on a state that no longer exists.

---

## Open items — what remains, and who owns closing it

Four items remain interim or unresolved. Two are structural stubs with a clear owning phase; two
are carried tripwires that must be re-asserted at the top of every subsequent phase's state until
resolved, per `.planning/phases/03-work-list-landing-skeleton/deferred-items.md`'s own
carry-forward rule.

| Item | Status | Owning phase | Gate |
|---|---|---|---|
| The backlog stub (`section#backlog`) | Interim — "Nothing listed here yet." | **Phase 5** | Blocks `FIND-02` until filled |
| The contact stub (`section#contact`) | Interim — "No contact details here yet." | **Phase 6** | Blocks `FIND-02` until filled |
| `/cv`'s interim body | Interim | **Phase 6** | Blocks `FIND-02` until filled |
| `HOME-01` — the positioning sentence | Unwritten, `Developer.` | User, before **Phase 6**'s `FIND-02` | Blocks `FIND-02` — see full restatement below |
| The user's editorial pass over both case studies | Not yet done | User, before **Phase 6**'s `FIND-02` | Recommended by `04-CONTEXT.md`'s deferred section — see full restatement below |

Both backlog and contact stubs are still asserted interim by `tests/build/prerender.test.ts`'s
narrowed launch-gate test (line 517), confirmed passing in this phase's own verification run.
`/cv`'s interim body is asserted separately by `tests/cv.spec.ts`, unchanged by this phase.

### HOME-01 — the positioning sentence, restated in full

The site's positioning sentence still ships as `Developer.` behind the exported
`POSITIONING_PLACEHOLDER` constant in `lib/work.ts`. It is marked in source only and never on
screen — there is no rendered `[positioning sentence goes here]` marker, by design (Phase 3's
`D-02`) — so the landing view *looks finished* at every viewport, in every optical pass, at every
phase gate that has run so far, including this one. No visual pass at any breakpoint can catch that
the site's single most important sentence is still `Developer.`; that is precisely the defect class
that survives review, because it is correct-looking while still outstanding.

It is consumed from three places, all three from the one constant (per the Phase 3 code-review
correction on 2026-08-31): the rendered `<p className="text-standfirst">` in `app/(en)/page.tsx`,
that same route's `metadata.description` export, and `app/(en)/layout.tsx`'s `metadata.description`
— the default every `(en)` route inherits, which is what `/cv` and `/type` actually serve. Supplying
the real sentence is a one-line edit to `lib/work.ts`; no second file needs to change, because all
three consumption sites now read from the same constant.

**`HOME-01` must never reach Phase 6's `FIND-02` robots flip still holding `Developer.`** Flipping
`robots` to indexable while the positioning sentence is still the placeholder would put an
unfinished central claim in front of Slack, LinkedIn and Google previews and search results at the
exact moment the site becomes discoverable. This tripwire has now survived Phases 3 and 4 unwritten
and must be re-asserted at the top of Phase 5's and Phase 6's carried-forward state exactly as it
is here, until the user supplies the sentence.

### The user's editorial pass — new to this phase, carried with the same weight as HOME-01

Both case-study files shipped without a human proofread, in two languages, by directive — the
prose ships without review because nobody else is proofreading it, and the fact-check gate
(`fact-check.md`, this phase's Task 1) is the compensating control for factual accuracy, not for
voice, register or readability. `04-CONTEXT.md`'s deferred section is explicit that the prose
should get one editorial pass from the user before Phase 6 flips `robots` to indexable, and this is
particularly true for the German file: `04-04-SUMMARY.md` records that the German translation
carries its own orthography decision (consistent Swiss-style German, no `ß`) made by the executor
rather than the author, and no native speaker has read the finished piece.

D-19's accuracy gate (this phase's `fact-check.md`) reduces **factual** risk — every quotation
verified verbatim, every number traced to a named source, all twelve identified traps checked and
passed in both languages. It does **not** substitute for the author's ear. A live, indexable,
bylined piece that no human has read is the risk this phase creates by publishing without that
pass; it did not exist before this phase, because there was nothing published to read. This item is
therefore recorded here at the same weight as `HOME-01` — both are blocking pre-conditions on
Phase 6's `FIND-02`, and both must be re-asserted, not silently dropped, in Phase 5's and Phase 6's
carried-forward state.

**Additional note carried from `fact-check.md`'s Table F:** the German case study omits one true,
non-quoted sentence present in the English file (the "four stepped intro charts" form-change
detail in beat 3) — nothing false is asserted, the sentence is simply absent. This is a completeness
question for the editorial pass above, not an accuracy defect, and is recorded here so the pass has
a concrete starting point rather than a blank page.

---

## Requirements this phase verified against the live deployment

`CASE-01` (the case study is live and reachable), `CASE-03` (the featured slot resolves with a real
link) and `HOME-02` (the featured slot carries visual primacy with the post's own title and
standfirst) are all confirmed against the actual production build and the actual live URL in this
file's "Live deployment confirmation" section above — not against `next dev`, and not asserted from
the source alone.
