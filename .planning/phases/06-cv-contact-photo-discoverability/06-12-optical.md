# Optical pass — 375px and 1440px, against the live deploy

**Performed:** 2026-09-01 by the agent, against `https://guillemgelabert.com` at commit `ff5eb40`,
using Chrome DevTools device emulation (`375×667×1, mobile, touch` and `1440×900×1`) with rendered
geometry read out of the live DOM.

**This is not the owner's sign-off and is not recorded as one.** See `audit.md` §7.3. What it
establishes is that nothing is broken, misaligned or over-budget. What it cannot establish is
whether the page reads as *authored*, which is the actual question the row exists to answer.

**Standing caveat:** the CV rows, the positioning line and the contact values are lorem ipsum by
design. Judge typography, rhythm and hierarchy. The words being placeholders is not a defect.

Screenshots regenerated on demand; `test-results/` is gitignored, so they are not committed.

---

## Measured — `/` (landing)

| Property | 375px | 1440px | Verdict |
|---|---|---|---|
| Horizontal overflow | **0px** | **0px** | ✅ |
| Elements past the viewport | none | none | ✅ |
| Computed font-weights in `<main>` | `400`, `530` | `400`, `530` | ✅ two, as budgeted |
| Distinct font-sizes in `<main>` | `14 · 18 · 36 · 64` | `14 · 18 · 36 · 72` | ✅ four, at the ceiling |
| Computed border-radius | `0px` everywhere | `0px` everywhere | ✅ |
| `<svg>` / `<img>` count | 0 / 0 | 0 / 0 | ✅ card idiom absent |
| Measure (`max-w-prose`) | column width | **663px** | ✅ capped, not full-bleed |
| Contact row target heights | 26 / 26 / 44px | 26 / 26 / 26px | ✅ all ≥ 24px (WCAG 2.5.8) |
| Document height | 2608px | 2122px | — |

## Measured — `/cv`

| Property | 375px | 1440px | Verdict |
|---|---|---|---|
| Horizontal overflow | **0px** | **0px** | ✅ |
| Portrait rendered size | 240×320 | 240×320 | ✅ fixed, not stretched |
| Portrait fits inside the column | yes (327px column) | yes | ✅ Pitfall 10 held — `align-items: stretch` did not balloon it |
| Portrait border-radius | `0px` | `0px` | ✅ |
| Section headings, in order | Experience · Education · Languages · Selected work · Contact | same | ✅ all three CV sections render |
| Experience rows | 3 | 3 | ✅ |
| Experience label lines | 2 | 1 | — wraps on mobile, expected |
| Experience note lines | 3 | 1–2 | — |
| Computed font-weights | `400`, `530` | `400`, `530` | ✅ no `<strong>` leaking to 700 |
| Distinct font-sizes | `14 · 18 · 36` | `14 · 18 · 72` | ✅ three |

---

## Looked at, not just measured

**The portrait panel reads as a deliberate empty frame, not a failed image load.** This was the
open risk in generating it at all. At 240px on a paper ground, the one-step-off-white fill with its
hairline border and inset rule reads as a reserved space someone meant to leave. It does not read
as a broken `<img>`, and it does not read as a person.

**The positioning line sits exactly where the real sentence goes**, at standfirst weight under the
name, running to two lines at both widths. The lorem is close enough to the right length that the
landing's opening block is already laid out against a realistic measure — which was the point of
filling it rather than leaving `Developer.`

**The landing's vertical rhythm holds at 1440.** Section head, full-bleed hairline, then content in
a 663px measure: the horizontal structure is strong enough that the eye tracks down the section
heads without the page feeling like a column of text stranded on the left.

---

## One observation for the owner's pass

**The section rules run the full 1377px while all content sits in a 663px measure.** On `/cv` at
1440 this leaves roughly 700px of bare rule extending to the right of every section head and every
row divider. On `/` the same treatment reads as deliberate editorial structure; on `/cv`, where the
rows are shorter and there are more of them, there is more bare rule per screen.

**This is not filed as a defect** — a full-bleed rule over a left-aligned measure is a legitimate
and consistent choice, it is the same treatment on both pages, and it is exactly the kind of call
that belongs to the owner rather than to an audit. It is filed because it is the one thing at 1440
that a reader might want to look at twice, and because it is the live instance of the open optical
item Phase 3 recorded ("does the work section read as hierarchy at 1440px",
`03-09-SUMMARY.md`).

**If it does want changing, the remedy is pre-specified** and has not changed: more space from the
existing seven spacing tokens — never a fifth type size, and never a fourth rule weight.

---

## Nothing found in these categories

Explicitly checked and clean, so their absence is on the record rather than merely unmentioned:

- No third font weight at either width, on either page — including inside the CV's own note text,
  which is where a stray `<strong>` would have resolved to 700 through Tailwind preflight.
- No rounded corner anywhere in `<main>`.
- No icon, no in-page SVG.
- No horizontal scroll at 375, which is where it would appear first.
- No element rendering past the viewport edge at either width.
- No visible apology marker — "todo", "coming soon", "under construction", "tbd" — on either page.
  ("lorem" is expected and present, by design.)
