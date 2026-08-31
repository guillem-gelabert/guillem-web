# Deferred Items — Phase 3

Items discovered or carried during execution that are out of scope for the plan that found
them, or are deliberate deferrals recorded per the UI-SPEC's phase-completion checklist. Format
follows `.planning/phases/02-content-pipeline/deferred-items.md`.

## 1. `HOME-01` — the positioning sentence is unwritten. THIS IS THE TRIPWIRE.

**Status:** deferred by decision (`D-08`), not a gap.

The site's positioning sentence ships as `Developer.` behind the exported `POSITIONING_PLACEHOLDER`
constant in `lib/work.ts`. `D-08` is explicit: Phase 3 ships the layout and typography around a
clearly-marked placeholder, nothing blocks on it, and `HOME-01` cannot be verified as met at the
end of Phase 3 — that is intended, not a gap. The user writes this sentence; nothing in this
phase or any later one blocks on it existing first.

**Why this needs a written record rather than a note.** The placeholder is marked in source only
and never on screen — there is no rendered `[positioning sentence goes here]` marker, by design
(`D-02`). The landing view *looks finished* at every viewport, in every optical pass, at every
phase gate. No 375px or 1440px visual pass can catch that the site's single most important
sentence is still `Developer.` That is precisely the defect class that survives review: it is
correct-looking while still outstanding.

**Where it is consumed.** Exactly two places, both from the one constant:
- The rendered `<p className="text-standfirst">` in `app/(en)/page.tsx`.
- That same route's `metadata.description` export.

Because both read from `POSITIONING_PLACEHOLDER`, supplying the real sentence is a one-line edit
to `lib/work.ts` (Pitfall 6) — no second file to remember.

**The gate that catches a partial fix.** Two automated tests bind the two consumption sites
together so editing one without the other fails:
- `tests/build/prerender.test.ts` asserts the built `<meta name="description">` on `/` equals
  `POSITIONING_PLACEHOLDER` by equality, not by literal string.
- `tests/landing.spec.ts` asserts the rendered `<p>`'s text equals `meta[name="description"]`'s
  content — the one-source property, proven by equality rather than assumed.

**Carry-forward rule, stated explicitly:** `HOME-01` must be re-asserted at the top of every
subsequent phase's carried-forward state until the user supplies the sentence. It must appear in
Phase 6's pre-launch check alongside the `robots` flag. **`HOME-01` must never reach the
`FIND-02` flag flip still holding `Developer.`** — flipping `robots` to indexable while the
positioning sentence is still the placeholder would put an unfinished central claim in front of
Slack, LinkedIn and Google at the exact moment the site becomes discoverable.

---

## 2. The two `WORK-02` annotations are drafts awaiting the user's edit (`D-09`).

**Status:** genuinely satisfies the requirement as written; not final copy.

Both lines were written after reading the live pieces on 2026-08-31 and describe what each piece
is *about*, never what it was built with. They live in `lib/work.ts` as the `annotation` field of
the `WORK` tuple:

- **`01` — Everyone in Mallorca Knows It:** "The Balearics stopped gaining on Europe in 1993 —
  while tourist arrivals went on tripling."
- **`02` — Watch People Die Live:** "Roughly two people die every second: where they are, when it
  happens, and who they were."

**Constraint on any edit:** each annotation must keep saying what the piece is about, never
naming a language, framework, library or technique — `PROJECT.md`'s allocation principle
(engineering is demonstrated, never claimed in copy). `tests/unit/work.test.ts` enforces this with
a banned-tool-word list (`React`, `Next`, `D3`, `TypeScript`, `JavaScript`, `Svelte`, `WebGL`,
`Python`, `built with`, `powered by`). That list is a heuristic and could false-positive on a
legitimate future annotation; if it does, the fix is a ten-second edit to the list, not deleting
the test.

---

## 3. Four surfaces ship in an interim state — all four are blocking pre-conditions on `FIND-02`.

**Status:** deliberately typeset per `D-02`; safe to ship because `robots: { index: false }` stays
on until Phase 6.

- **The featured slot** (`section#case-study`) — Phase 4 fills it, once
  `content/the-chart-therefore-changes.mdx` exists and is not `draft: true`.
- **The backlog stub** (`section#backlog`) — Phase 5 fills it.
- **The contact stub** (`section#contact`) — Phase 6 fills it.
- **`/cv`** — Phase 6 fills it.

**The gate: none of the four may be the public launch condition.**
`tests/build/prerender.test.ts`'s launch-gate test ("launch gate: the featured slot, the backlog
stub and the contact stub are all still interim") records the current state as a single,
must-be-updated checkpoint — when Phases 4, 5 and 6 fill their surfaces, that test is the thing
that has to change, which is where the gate gets noticed rather than silently going stale.

---

## 4. `SmearTitle`'s `as` union was widened to include `"h3"` — done, not deferred.

**Status:** complete. Recorded here because it was on the UI-SPEC's phase-completion checklist,
not because it is outstanding.

The featured headline renders as a real `<h3>` (`components/landing/featured-slot.tsx`), not as
an `<h2>` that happens to look right. The reason it was on the checklist: an `<h2>` there would
put two `<h2>`s inside `section#case-study` — one of them the section head — silently breaking
the heading outline `aria-labelledby` depends on. `tests/landing.spec.ts`'s heading-outline test
is the standing gate against regression.

---

## 5. Two `03-RESEARCH.md` corrections to the approved UI-SPEC.

Recorded so a later phase does not act on the superseded reasoning in `03-UI-SPEC.md` itself.

**(i) `documentTop` is gauge-invariant — the UI-SPEC's stated reason for reserving space above the
trail is wrong.** `03-UI-SPEC.md`'s smear-system constraint #2 claims a post-mount layout change
above a registered heading leaves its trail anchored to a stale `documentTop`. Measured in
`03-RESEARCH.md`: it does not — `documentTop` cancels in every expression `draw()` consumes, so it
is gauge-invariant. **Phase 6's photograph (`PROF-02`) must still reserve its space with explicit
intrinsic dimensions or an `aspect-ratio` — but for `BUILD-06` (cumulative layout shift), not for
trail correctness.** Acting on the UI-SPEC's original reasoning would justify putting a
`ResizeObserver` into `components/smear-heading/` to solve a problem that measurement shows does
not exist there; the actual justification is CLS, which needs no observer, only reserved space.

**(ii) The off-screen `draw()` viewport guard was measured, not skipped by default.**
`03-UI-SPEC.md`'s constraint #1 marks the guard as `planner may override`. Measured in
`03-RESEARCH.md`: the cost is 0.085ms per heading per frame against an 8.33ms budget, and the
shipped 5-heading `/type` holds 120fps. The guard was deliberately not added at this heading count
(the landing registers 2, `/cv` registers 1, `/type` registers 5) and should not be added now —
adding it would be unmeasured complexity solving a cost that has been measured as negligible.

---

## CR-01 — remains open, deferred to Phase 6 (unchanged)

Carried from `.planning/phases/02-content-pipeline/deferred-items.md`. Phase 3 did not attempt
it: no middleware was added, `dynamicParams` was not set to `false` on either `[slug]` route, and
no no-JS assertion was added for `/writing/<unknown>` or `/texte/<unbekannt>` — such an assertion
would fail today, exactly as the Phase 2 record states. See the Phase 2 file for the full
root-cause analysis and chosen disposition (Phase 6 middleware layer).
