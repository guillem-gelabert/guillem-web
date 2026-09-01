# Launch Gate — v1.0

**Written:** 2026-09-01, plan 06-11 Task 3. Format follows
`.planning/phases/04-the-case-study/launch-gate.md` and `05-backlog/launch-gate.md`.

Fourteen rows. Thirteen were specified in `06-11-PLAN.md`; **G14 is new**, added when the site was
deliberately filled with placeholder copy and the gate's central assumption stopped holding. Its
row explains why.

---

## THE SITE IS DELIBERATELY NOT INDEXED

`robots: { index: false }` stands in `app/(en)/layout.tsx` and `app/(de)/layout.tsx`. Verified live
on every surface (`audit.md` §5.7). **This is a decision, not an oversight.**

---

## The rows

| # | Gate | Source | Mechanical check | Verdict |
|---|---|---|---|---|
| **G1** | `publishedFor("en").length > 0` | Phase 2 | `tests/unit/content.test.ts` + `tests/build/prerender.test.ts`'s sitemap test — the index would render `n = 0` otherwise | ✅ **pass** — 1 EN post, 1 DE twin |
| **G2** | The positioning sentence is real | HOME-01, D-08 | `tests/unit/launch-gate.test.ts` — `POSITIONING_PLACEHOLDER !== "Developer."` | ⚠️ **filled, not real** — now lorem ipsum. Blocked by **G14** |
| **G3** | `lib/cv.ts` `EXPERIENCE` is non-empty | PROF-01 | `tests/unit/launch-gate.test.ts` — `EXPERIENCE.length > 0` | ⚠️ **filled, not real** — 3 lorem rows. Blocked by **G14** |
| **G4** | `lib/contact.ts` `EMAIL` is non-null | PROF-03 | `tests/unit/launch-gate.test.ts` — `EMAIL !== null` | ⚠️ **filled, not real** — `lorem.ipsum@example.com`. Blocked by **G14** |
| **G5** | `lib/contact.ts` `LINKEDIN` is non-null | PROF-05 | `tests/unit/launch-gate.test.ts` — `LINKEDIN !== null` | ⚠️ **filled, not real** — lorem slug. Blocked by **G14** |
| **G6** | The portrait file exists at its declared dimensions | PROF-02 | `tests/unit/launch-gate.test.ts` — `existsSync(public/ + PORTRAIT.src)`; `tests/unit/cv.test.ts` — "a declared PORTRAIT resolves to a file that actually exists"; `tests/build/prerender.test.ts` G6 — the `<img>` count matches the declaration and carries the declared dimensions | ⚠️ **filled, not real** — `/portrait.png`, 960×1280, a tone panel, no face. Blocked by **G14** |
| **G7** | The OG image resolves 200, `image/png`, 1200×630, absolute | FIND-01 | `tests/build/prerender.test.ts` — "og:image is parsed from the meta tag (never hardcoded) and resolves to a real build asset on every target route", including the per-slug identity assertion; plus `audit.md` §5.3's live fetch | ✅ **pass** — all three cards, live-verified, decoded. *Was failing when first measured; see §5.3* |
| **G8** | Security headers present on a live response | BUILD-04 | `tests/security-headers.spec.ts` (6 headers + the two deliberate absences); `tests/unit/csp.test.ts` (the pure function); `audit.md` §5.2's live `curl` | ✅ **pass** — delivered CSP byte-identical to the unit-tested string, on pages and on static assets |
| **G9** | Code blocks still render token colour with CSP enforced | BUILD-04 | `tests/prose-code.spec.ts` — "token colouring survives while the CSP header is delivered — `style-src` carries `'unsafe-inline'`, then at least one span carries an inline color style (G9, part 1 of 3)" | ✅ **pass** |
| **G10** | `/type` and the reserved 404s are not in the sitemap | FIND-01 | `tests/build/prerender.test.ts`'s sitemap test; `audit.md` §5.5's live body | ✅ **pass** — 6 URLs, none of the three |
| **G11** | `COPY_REVIEWED === true` in `lib/backlog.tsx` | Phase 5, D-14 | `tests/unit/launch-gate.test.ts` reads the declaration out of source via `tests/unit/backlog-source.ts` | ❌ **false** — the backlog copy is drafted from repository evidence and unreviewed |
| **G12** | The user's editorial pass over both case studies | Phase 4, D-18 | **NOT MECHANISABLE.** `tests/unit/launch-gate.test.ts`'s third test asserts this row exists here and stays unticked | ❌ **not done** — see the sign-off box below |
| **G13** | The canonical hostname is the one that should be indexed | Research F3 | `audit.md` §5.8's `dig` + `curl` re-measurement | ✅ **pass**, with a ~7-day shelf life — **re-measure immediately before flipping** |
| **G14** | **No placeholder content ships** — `PLACEHOLDER_CONTENT === false` | 2026-09-01, this document | `tests/unit/launch-gate.test.ts` — `!PLACEHOLDER_CONTENT` from `lib/placeholder.ts`; and once false, `tests/build/prerender.test.ts`'s marker sweep re-bans "lorem"/"placeholder" across every prerendered route | ❌ **true** — the site is deliberately full of lorem ipsum |

### G12 — the one row that cannot be a code assertion

```
G12  Editorial pass over content/the-chart-therefore-changes.mdx  ......  date: __________  initials: ____
G12  Editorial pass over content/die-darstellung-aendert-sich.mdx  .....  date: __________  initials: ____
```

Both are **live and bylined** at `/writing/the-chart-therefore-changes` and
`/texte/die-darstellung-aendert-sich` — 1,788 words EN, 1,764 DE, `draft: false` in both. Phase 4's
`fact-check.md` audited 83 claims with zero unsourced and all twelve named traps checked in both
languages. **That reduces factual risk only. It does not substitute for the author's ear**, and it
says nothing about the German, which shipped without a native read. The escape hatch to
`draft: true` remains open if you would rather it did not stand.

### Why G14 exists

G2 through G6 each ask *"is this value filled?"*. That was a sound proxy for *"is this value real?"*
while the only two states were **absent** and **authored**.

Filling the site with lorem ipsum introduced a third state that satisfies "filled" and fails "real".
Left alone, the biconditional in `tests/unit/launch-gate.test.ts` would have started **demanding**
`index: true` over a page of `Lorem ipsum dolor sit amet` — inverting the gate into precisely the
thing it was built to prevent. G14 is the row that keeps the other six honest: while
`PLACEHOLDER_CONTENT` is true, every branch takes the unfilled path however full the data modules
look.

Flipping G14 is not a formality. It asserts that every `[PLACEHOLDER]`-tagged value in `lib/cv.ts`,
`lib/contact.ts` and `lib/work.ts` has been replaced, and the build-tier marker sweep then holds you
to it: with the flag false, "lorem" and "placeholder" go back to being banned words in every
prerendered route, so a premature flip fails the suite instead of publishing lorem ipsum.

---

## The FIND-02 flip — an exact, gated, one-commit procedure

> ### Phase 6 deliberately did not perform this.
>
> Every surface ships and nothing is indexed. That is the intended end state. Four rows are
> blocking — **G11**, **G12**, **G14**, and G2–G6 behind G14 — and every one of them is a *copy*
> row, not a code row. A phase that flipped here would have defeated the three-channel tripwires
> Phases 3, 4 and 5 each built for exactly this moment, and would have published a lorem-ipsum CV
> under a real person's name.

**Step 1 — fill the values.** Work through `HANDOFF-user-supplied.md`. Five values, five files.

**Step 2 — do the three copy reviews.** The positioning sentence, both case studies (G12), and the
backlog (`COPY_REVIEWED = true`).

**Step 3 — set `PLACEHOLDER_CONTENT = false`** in `lib/placeholder.ts` (G14).

**Step 4 — let the tests tell you whether you are ready.**

```
npm run test:unit
```

While any row is unfilled the biconditional *demands* `index: false` and names the exact failing
rows. Once every row is filled it *demands* `index: true` — and the suite goes red until you make
the change in step 6. **The flag and the values cannot drift apart; that is the point of the
biconditional.** Then:

```
PORT=3111 npm run test:all
```

With `PLACEHOLDER_CONTENT` false, this is also what proves no lorem string survives anywhere in the
prerendered output.

**Step 5 — re-measure F3.** It depends on live third-party routing this milestone does not control
and has roughly a 7-day shelf life. Confirm the apex still serves this application and still
declares the intended canonical (`audit.md` §5.8 has the exact commands). Flipping to indexable
while the apex points somewhere else would consolidate the wrong host.

**Step 6 — the change. Exactly two files:**

- `app/(en)/layout.tsx`: `robots: { index: false }` → `robots: { index: true }`
- `app/(de)/layout.tsx`: the same

**`app/(en)/type/page.tsx` declares its own permanent `noindex` (Phase 1 D-05) and must NOT be
touched.** `tests/unit/launch-gate.test.ts`'s second test enforces that the field appears in exactly
those two layouts plus `/type`, which is what would catch a shared metadata factory quietly
absorbing it.

**Step 7 — in the SAME commit, invert these assertions, named by test title:**

- `tests/build/prerender.test.ts` — **"robots noindex survived the two-root-layout split"**: both
  assertions.
- `tests/build/prerender.test.ts` — **"the inherited noindex reaches both new surfaces"**: the `""`
  and `"cv"` rows only. **The `"type"` row does not invert.**

**Rename both tests in that same commit.** A test called "noindex survived" that asserts the
opposite is worse than no test at all.

**Step 8 — do NOT invert these:**

- **"/_not-found must carry exactly one noindex robots meta"**
- The reserved 404 routes' equivalents (`/writing/not-found-page`, `/texte/nicht-gefunden`)

Next injects `noindex` for any response with a status at or above 400, **including a proxy-set
status** — measured, not assumed. Those routes stay unindexed for free after the flip, and the
assertions stay true as written.

**Step 9 — verify on the deploy, not locally.** After the redeploy:

```
curl -s https://guillemgelabert.com/ | grep -o 'name="robots" content="[^"]*"'
```

Expect **nothing**. Then check `/cv`, `/writing`, `/texte` and both posts the same way, confirm
`/type` still carries its own `noindex`, and submit `https://guillemgelabert.com/sitemap.xml` to
Google Search Console and Bing Webmaster Tools.

---

## Summary

| Verdict | Rows |
|---|---|
| ✅ **pass** | G1, G7, G8, G9, G10, G13 |
| ⚠️ **filled with placeholder content** | G2, G3, G4, G5, G6 — all behind G14 |
| ❌ **blocking** | G11, G12, G14 |

**Six of fourteen pass outright. Everything still blocking is copy, and all of it is the user's.**
There is no engineering work left between here and an indexed site.
