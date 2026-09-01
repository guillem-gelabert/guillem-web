# Context Handoff — paused 2026-09-01

**Milestone:** v1.0 Working Site · **Phases 1–5 complete and live** · **Phase 6 at 10/12 plans**

Everything built so far is merged, pushed, deployed and verified in production.
Working tree clean. Full suite green: **130 unit · 34 build-tier (3 skip) · 173 Playwright**.
`npm run lint` reports exactly one known deferred error (see Open Debt).

---

## Resume with

```
/gsd:execute-phase 6
```

Two plans remain: **06-11** (live verification, milestone audit, user hand-off artifact) and
**06-12** (three manual gate rows + milestone close — the phase's only `autonomous: false` plan).

`.planning/STATE.md` frontmatter reads `status: executing`, `completed_phases: 5`.

---

## THE SITE IS DELIBERATELY NOT INDEXED

`robots: { index: false }` is still declared in `app/(en)/layout.tsx` and `app/(de)/layout.tsx`.
**This is a decision you made, not an oversight.** You chose to keep the copy gate blocking until
you have reviewed three items.

`tests/unit/launch-gate.test.ts` enforces it as a **biconditional**: while any user-supplied value
is unfilled it *demands* `index: false`; once all are filled it *demands* `index: true`. So the flag
and the values cannot drift apart — flipping the flag with a placeholder still in place fails the
suite by construction.

`/type` declares its own permanent noindex and is excluded from the flip.

---

## What you need to supply — the five facts I would not invent

Each has a typed placeholder in source, is invisible on screen (a live job-hunting site must never
render `[goes here]`), and is bound to a named gate row.

| # | Value | Where | Requirement |
|---|---|---|---|
| 1 | Public contact email | `lib/contact.ts` | PROF-03 |
| 2 | LinkedIn profile URL | `lib/contact.ts` | PROF-05 |
| 3 | Employment history, education, languages | `lib/cv.ts` | PROF-01 |
| 4 | The photograph file | `lib/cv.ts` / `components/portrait.tsx` | PROF-02 |
| 5 | The positioning sentence | `POSITIONING_PLACEHOLDER` in `lib/work.ts` | HOME-01 |

Your `@liip.ch` address was deliberately **not** used — a current-employer address is the wrong
channel for a job hunt and is not yours to publish by inference. Your name and the GitHub handle
`guillem-gelabert` were treated as established fact.

**Item 5 is the one that matters most.** The landing page currently reads `Developer.` under your
name. Everything around it is finished, which is exactly why it needs a tripwire — the page *looks*
done.

## Three copy items awaiting your review

All three block the robots flip:

1. **The positioning sentence** — still `Developer.`
2. **Both case studies** — live and bylined at `/writing/the-chart-therefore-changes` and
   `/texte/die-darstellung-aendert-sich`. 1,788 words EN / 1,764 DE, 83 claims fact-checked against
   snapshots of your own live pages with zero unsourced, twelve named traps checked in both
   languages. **But no human has read them.** German shipped `draft: false`; the escape hatch to
   `draft: true` remains if you would rather it did not.
3. **Backlog copy** — `COPY_REVIEWED = false` in `lib/backlog.tsx`. Three items drafted from
   repository evidence. **"The Pudding, read as a corpus" must never be described as a pitch** — it
   may be a live pitch and getting that wrong publicly could cost it. Flagged for one-edit veto.

Also drafted, not reviewed: the two work-list annotations in `lib/work.ts`.

---

## Decisions you made this run

- **Canonical host is `guillemgelabert.com`.** Research found your apex was *already* serving this
  exact site byte-identically while `rel=canonical` pointed at the Railway URL. `lib/site.ts` reads
  `NEXT_PUBLIC_SITE_URL` with the apex as fallback, so it is one variable.
- **Keep the copy gate blocking.** Build everything; do not flip robots.

## Corrections worth remembering

- **"IB" is *Illes Balears*, not International Baccalaureate.** I had this wrong in a brief; the
  research agent caught it. The whole case study depends on it.
- Your landing page was never metadata-less, as I once said — it inherited title and description
  from the layout. The real gap was a missing canonical, now fixed.
- Phase 3 carries five requirements, not the eight I first stated. FIND-02 is Phase 6.

---

## Open debt, all recorded

| Item | Where | Status |
|---|---|---|
| One lint error, `use-prefers-reduced-motion.ts:23` (`react-hooks/set-state-in-effect`) | Phase 1 code | Deliberately untouched since Phase 2; re-deferred at each phase close |
| Five optical sign-offs (does the work section read as hierarchy at 1440px, etc.) | `03-09-SUMMARY.md` | Open — remedies pre-specified: **more space from the existing seven tokens, never a fifth type size** |
| CR-01 | — | **CLOSED.** Localised 404s now server-render with correct `lang` and German copy, JS disabled, verified in production |
| `og:image` not cascading | `06/deferred-items.md` | **CLOSED 2026-09-01** — every route now carries a card and `summary_large_image` |

---

## Things that will bite whoever picks this up

- **`.planning/` is gitignored but tracked.** Every commit of a planning file needs `git add -f`,
  and shell `grep` is gitignore-aware — use `/usr/bin/grep` when searching `.planning/`.
- **Worktree executors repeatedly fork off stale `master`.** Every executor prompt carries a
  base-assertion guard that corrects it. Keep that guard.
- **Port 3000 contention between parallel executors is real** and produced spurious failures twice.
  `tests/global-setup.ts` warms every route to kill a measured 1-in-3 cold-compile flake; add any
  new route to its list.
- **`next-env.d.ts` toggles between dev and build type paths** and dirties the tree, which aborts a
  merge. `git checkout --` it before merging.
- **Plans' own acceptance-criteria greps scan comments too**, so writing a banned literal in an
  explanatory comment trips the plan's own gate. This caught six different executors.
- **Tailwind v4 preflight makes `<strong>` outside `.prose-site` render 700** — a third weight on
  screen that source-level budget gates cannot see. Only a rendered-value assertion catches it.

---

## Live

`https://web-production-9cedb.up.railway.app` (and `guillemgelabert.com`, already serving it)

`/` · `/cv` · `/writing` · `/texte` · `/type` — all 200. Security headers, sitemap, robots.txt,
OG cards, and server-rendered localised 404s all verified in production.
