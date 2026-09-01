# v1.0 is done — and deliberately not indexed

**Milestone:** v1.0 Working Site · **All six phases complete** · **Closed 2026-09-01**

Everything is merged, pushed, deployed and verified against the live origin. Suite green from a
clean build: **132 unit (0 skipped) · 38 build-tier · 173 Playwright**. `npx tsc --noEmit` clean.
`npm run lint` reports exactly one re-deferred error.

Live: `https://guillemgelabert.com` (and the Railway origin, `web-production-9cedb.up.railway.app`,
which declares the same canonical).

---

## Read this first

**The site is structurally finished and full of lorem ipsum.**

Every surface v1.0 promised renders at full length. Five of the values those surfaces render are
placeholders — the CV, the contact email and LinkedIn URL, the portrait, and the positioning
sentence — because you asked for the layout to be finishable before the copy existed. That was the
right call and it worked: `/` and `/cv` are laid out against realistic measure, and the optical pass
at 375 and 1440 came back clean.

It also creates the exact failure mode this project has been guarding against for four phases: **the
site looks done.** No visual review will catch that the CV is lorem, because it reads as a CV.

So the gate grew a row. `PLACEHOLDER_CONTENT` in `lib/placeholder.ts` is **G14**, and while it is
`true` the launch gate refuses to let the site be indexed however full the pages look. Without it,
`tests/unit/launch-gate.test.ts` would have started *demanding* an indexable site over a lorem-ipsum
CV — because G2–G6 test whether a value is **filled**, which was a fine proxy for **real** right up
until lorem satisfied it.

---

## Finish it from one page

**`.planning/phases/06-cv-contact-photo-discoverability/HANDOFF-user-supplied.md`**

Five values, five files, each with its export, its gate row, what changes on screen, and which tests
move. Plus the three copy reviews. Then:

1. Set `PLACEHOLDER_CONTENT = false` in `lib/placeholder.ts`.
2. Delete `public/portrait.png` and `scripts/make-placeholder-portrait.mjs`.
3. `npm run test:unit` — it names any row still outstanding, and once all are filled it **demands**
   the flip.
4. Follow the flip procedure in
   `.planning/phases/06-cv-contact-photo-discoverability/launch-gate.md` (re-measure F3 first — it
   has a ~7-day shelf life).

At no point can the flag and the values drift apart. That is what the biconditional is for.

---

## What still blocks an indexed site — all copy, all yours

| Row | What | Where |
|---|---|---|
| **G2** | The positioning sentence | `POSITIONING_PLACEHOLDER`, `lib/work.ts` |
| **G3** | Employment history, education, languages | `lib/cv.ts` |
| **G4/G5** | Email, LinkedIn URL | `lib/contact.ts` |
| **G6** | The photograph | `public/` + `PORTRAIT` in `lib/cv.ts` |
| **G11** | Backlog copy review | `COPY_REVIEWED`, `lib/backlog.tsx` |
| **G12** | Editorial pass over both case studies | Not mechanisable — signature row in `launch-gate.md` |
| **G14** | The placeholder content itself | `lib/placeholder.ts` |

**Six of fourteen rows pass outright. There is no engineering work left between here and an indexed
site.**

> **Two things worth your attention specifically.**
>
> **The positioning sentence** is the site's single most important line and doubles as `/`'s
> share-preview description. It used to read `Developer.`, which looked like a terse but finished
> choice at every optical pass; lorem cannot be mistaken for a decision, which is why the swap made
> it a better tripwire rather than a worse one.
>
> **Both case studies are live and bylined, in two languages, and no human has read either.** 1,788
> words EN, 1,764 DE. Phase 4 fact-checked 83 claims with zero unsourced — that reduces factual risk
> only, and says nothing about whether the German reads like German. `draft: true` is one line in
> either file if you would rather they did not stand.

---

## Three defects this phase found by curling the live deploy

None was caught by a test. All three had assertions that passed throughout, because each checked a
**weaker property** than the one that mattered. That pattern is the most useful thing this milestone
learned.

| Defect | The assertion that missed it | Fixed |
|---|---|---|
| Both case studies served the **site-wide OG card**; their own committed PNGs were never referenced | Compared the EN post's card to the DE post's and to `/`'s — those differ by **locale** whether or not the per-post override fires | `315518d` — the assertion now requires each pathname to *be* `/og/{slug}.png` |
| Both localised 404s rendered `Not found — Guillem Gelabert — Guillem Gelabert` | Checked that a `<title>` was present and non-empty. It was | `ff5eb40` — no title may contain the site name twice |
| The test suite silently ran against **another project's dev server** on port 3000 | `reuseExistingServer` has no idea whose server it found | `315518d` — `PORT` is now a variable |

The OG bug was introduced by the fix for the *previous* OG bug, and its own resolution note in
`deferred-items.md` claims the per-post cards were unaffected. That sentence is left standing and
corrected beneath, rather than quietly edited.

---

## Things that will bite whoever picks this up

- **`.planning/` is gitignored but tracked.** Every commit of a planning file needs `git add -f`,
  and shell `grep` is gitignore-aware — use `/usr/bin/grep` when searching it.
- **Port 3000 is not yours to assume.** `PORT=3111 npm run test:all` if another project is running.
- **`npm run test:all`, never `npm test`.** Playwright always boots `next dev`, where every draft is
  visible; only `tests/build/prerender.test.ts` covers the production half of the draft rule, and it
  needs a real build first.
- **A plan's own acceptance greps scan comments too.** Writing a banned literal in an explanatory
  comment trips the gate. This caught six executors — and caught this session once more, when the
  string `robots:` in a new comment broke "robots is declared in exactly two files".
- **`zsh` ties `$path` to `$PATH`.** A `for path in ...` loop in a shell script destroys `PATH`
  mid-run and every subsequent command reports "command not found".
- **Tailwind v4 preflight makes `<strong>` outside `.prose-site` render 700** — a third weight that
  source-level gates cannot see. Only a rendered-value assertion catches it.
- **`next-env.d.ts` toggles between dev and build type paths** and dirties the tree.

---

## Deferred, all recorded

`.planning/phases/06-cv-contact-photo-discoverability/deferred-items.md` — BUILD-07 (attach the
domain, then HSTS `preload`, together), PROF-06 (print stylesheet; `/cv`'s markup was built so it
stays stylesheet-only), the nonce CSP (recorded as *not* the fix for `style-src` — Shiki's inline
`style` attributes are not noncible), the lint debt at `use-prefers-reduced-motion.ts:23`
(re-deferred with reasoning), and the `_pm/` vs `.planning/` question, which is yours.

One optical observation, also yours: at 1440 the section rules run the full width while content sits
in a 663px measure. Consistent and legitimate; filed in `06-12-optical.md` because it is the one
thing at desktop width a reader might look at twice. Remedy if wanted is pre-specified — more space
from the existing seven tokens, never a fifth type size.
