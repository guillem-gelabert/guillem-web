# The five facts only you can supply

**One page. Nothing else lives in this file.**

Every value below currently ships as **lorem ipsum or a placeholder asset**, tagged `[PLACEHOLDER]`
in source. They were tagged `[USER-SUPPLIED]` and shipped empty until 2026-09-01; the tag changed
with the fill, but the meaning did not — a `[PLACEHOLDER]` value is a USER-SUPPLIED fact that is
still outstanding, now occupying its own space instead of leaving a hole.

The fill is deliberate: it lets every surface render at full length so the site can be laid out and
judged before the words exist. It also means **nothing on the site is unfinished-looking** —
and that is exactly why this file has to be explicit, because no visual pass will catch it.

The site is held at `noindex` until all five are real. `PLACEHOLDER_CONTENT` in `lib/placeholder.ts`
is gate row **G14**, and while it is `true` the launch gate refuses to let the site be indexed
however full the pages look. See `launch-gate.md` for the flip procedure.

**Nothing here was invented.** No value below resembles a real employer, a real address or a real
face. Where a placeholder had to look structurally plausible, it was built out of reserved,
unreachable strings — `example.com` is RFC 2606 reserved and can never accept mail; the LinkedIn
slug is four lorem words no profile holds.

---

## 1 · Public contact email

| | |
|---|---|
| **File** | `lib/contact.ts` |
| **Export** | `EMAIL` |
| **Requirement** | PROF-03 · **gate G4** |
| **Ships now** | `"lorem.ipsum@example.com"` |

```ts
export const EMAIL: string | null = "you@yourdomain.example";
```

**On screen:** the Email row in the contact block, on **both** `/` and `/cv` (one component, two
call sites). The address is entity-encoded (`@` → `&#64;`, `.` → `&#46;`) in the emitted bytes and
decodes in the browser, so it reads and copies normally while resisting cheap regex harvesting.

**Tests that move:** `tests/unit/launch-gate.test.ts` G4 stops counting this as unfilled.
`tests/contact.spec.ts`'s three PROF-03 tests re-point at the new address automatically — they read
`EMAIL` from the module rather than hardcoding it. `tests/build/prerender.test.ts` G4 asserts the
served bytes carry the entities and never the double-escaped `&amp;#` signature.

> **Your `@liip.ch` address is on record in this environment and was deliberately not used.** A
> current-employer address is the wrong channel for a job hunt and is not yours to publish here by
> inference.

---

## 2 · LinkedIn profile URL

| | |
|---|---|
| **File** | `lib/contact.ts` |
| **Export** | `LINKEDIN` |
| **Requirement** | PROF-05 · **gate G5** |
| **Ships now** | `"https://www.linkedin.com/in/lorem-ipsum-dolor-sit-amet"` |

```ts
export const LINKEDIN: string | null = "https://www.linkedin.com/in/your-slug";
```

**On screen:** the LinkedIn row, same two surfaces. Rendered as its own link text, so its length is
part of the block's rhythm — which is why the placeholder kept the real host rather than pointing at
`example.com`.

**Tests that move:** G5 in the launch gate; `tests/contact.spec.ts`'s PROF-05 block;
`tests/unit/contact.test.ts` already asserts the shape (an `https://` URL whose host ends
`linkedin.com`).

---

## 3 · Employment history, education, languages

| | |
|---|---|
| **File** | `lib/cv.ts` |
| **Exports** | `EXPERIENCE`, `EDUCATION`, `LANGUAGES` |
| **Requirement** | PROF-01 · **gate G3** (one row, all three exports) |
| **Ships now** | 3 lorem roles, 2 lorem education rows, 3 lorem languages |

The shapes, verbatim from source:

```ts
export type CvRole = {
  years: string;  // a label, e.g. "2023–present" — not a parsed date range
  role: string;
  org: string;
  place: string;
  note: string;   // ONE line: what the work was ABOUT, never a duties list
};

export type CvEducation = { years: string; qualification: string; institution: string; place: string };
export type CvLanguage  = { language: string; level: string };
```

**A worked example. Every value in it is fictional and none of it may be committed:**

```ts
// ILLUSTRATIVE ONLY — Ruritania does not exist. Do not commit this row.
{
  years: "2021–2024",
  role:  "Staff Cartographer",
  org:   "The Ruritanian Gazette",
  place: "Strelsau",
  note:  "Election-night mapping for a paper that had never published a map before.",
}
```

**The `note` rule matters more than it looks.** One line, and it says what the work was **about** —
never a duties list, never what it was built with. This is the same rule WORK-02 (D-09) already
imposes on the work list, applied to employment, and it is the difference between a CV that
demonstrates judgment and one that lists tools.

**On screen:** `/cv`'s Experience section, and Education and Languages beneath it. Each of the
latter two is gated on its **own** length — an `<h2>` never renders over an empty list — so you can
fill Experience alone and the other two simply will not appear. With `EXPERIENCE` empty, `/cv` falls
back to `CV_STUB_BODY` ("The CV is being written up as a page."), never an empty section and never a
visible marker.

**Tests that move:** G3 in the launch gate; `tests/build/prerender.test.ts` G3 (asserts the stub is
gone and the first row's `org` renders); `tests/cv.spec.ts` (n) derives the expected section
headings from the data, so it follows whatever you fill without an edit.

---

## 4 · The photograph

| | |
|---|---|
| **Files** | the image into `public/`, then `lib/cv.ts` |
| **Export** | `PORTRAIT` |
| **Requirement** | PROF-02 · **gate G6** |
| **Ships now** | `/portrait.png` — 960×1280, a flat tone panel with a hairline border |

```ts
export const PORTRAIT: PortraitAsset | null = {
  src: "/your-photo.jpg",
  width: 0,   // the file's REAL intrinsic pixels — read them, do not guess
  height: 0,
  alt: "…",   // describes the photograph; never the name alone
};
```

> ### No generated portrait, under any circumstances.
>
> The rule, stated so it can be grepped for: **no generated portrait**, not now and not as a
> stopgap.
>
> A synthetic or stock face on a personal job-hunting site is an impersonation artifact, not a
> placeholder. What ships today is a **tone panel** — no face, no figure, no silhouette — written by
> `scripts/make-placeholder-portrait.mjs` from the two colours in `app/globals.css`. It occupies the
> box so `/cv`'s rhythm and CLS behaviour can be judged, and it does nothing else.

**Read the real dimensions, do not estimate them** (`file your-photo.jpg` prints them).
`components/portrait.tsx` renders `<img>` with those exact attributes and the browser derives the
reserved aspect ratio from them — that reservation is what keeps cumulative layout shift near zero
(BUILD-06 / D-2.6), and wrong numbers reserve the wrong box. The image renders at 240px wide
regardless; the intrinsic values are for the aspect ratio, not the display size.

**When it lands:** delete `public/portrait.png` **and** `scripts/make-placeholder-portrait.mjs`. A
placeholder generator left in the tree outlives its reason.

**Tests that move:** G6 in the launch gate and `tests/unit/cv.test.ts`'s disk-existence check;
`tests/cv.spec.ts` (h)–(m) re-measure against the new file automatically, including the CLS
assertion; `tests/build/prerender.test.ts` G6 checks the rendered `<img>` carries the declared
dimensions.

---

## 5 · The positioning sentence

| | |
|---|---|
| **File** | `lib/work.ts` |
| **Export** | `POSITIONING_PLACEHOLDER` |
| **Requirement** | HOME-01 · **gate G2** |
| **Ships now** | `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."` |

**This is the one that matters most.** It is the sentence under your name on the landing page — the
single most important sentence on the site, and the one a reader with forty tabs open will decide
on. It is also `/`'s `metadata.description`, so it is what a shared link says about you: **one line
changes both.**

It used to read `Developer.` — a word that had the specific failure mode of looking like a finished,
if terse, choice at every optical pass. Lorem ipsum cannot be mistaken for a decision, and it
occupies roughly the length the real sentence should have, so the landing view is already laid out
against the right measure.

**Tests that move:** G2 in the launch gate; `tests/unit/work.test.ts` re-checks it against the
marker-word ban; `tests/landing.spec.ts` and `tests/build/prerender.test.ts` assert it renders.

---

# The three copy reviews

Not values — **judgments**. All three block the flip, and none can be delegated.

### A · The positioning sentence
Same as row 5 above. Listed twice on purpose: it is both a missing value and an unmade judgment.

### B · Both case studies — **gate G12**

`/writing/the-chart-therefore-changes` and `/texte/die-darstellung-aendert-sich` are **live and
bylined**. 1,788 words EN, 1,764 DE, both `draft: false`.

Phase 4's `fact-check.md` audited **83 claims with zero unsourced**, and checked all twelve named
traps in both languages. **That reduces factual risk only — it does not substitute for your ear**,
and it says nothing at all about whether the German reads like German.

**A live, bylined piece that no human has read is the standing risk of this milestone.** The escape
hatch is one line: set `draft: true` in either file's front-matter and it disappears from the index,
the sitemap and the featured slot with no other change.

### C · Backlog copy — **gate G11**

`COPY_REVIEWED = false` in `lib/backlog.tsx`. Three items, drafted from repository evidence, never
read by you. Set it to `true` when you have read them.

> ⚠️ **"The Pudding, read as a corpus" carries a one-edit veto.** It is described strictly as a
> **corpus study** and must **never** be described as a pitch — it may be a live pitch elsewhere in
> your own planning, and getting that wrong in public could cost it.

### Also drafted, not reviewed — not gated

The two work-list annotations in `lib/work.ts`. They are one line each, they ship, and they are
fine. They have never had your edit.

---

## Order of operations

1. Fill rows 1–5.
2. Do reviews A, B, C.
3. Set `PLACEHOLDER_CONTENT = false` in `lib/placeholder.ts`.
4. Delete `public/portrait.png` and `scripts/make-placeholder-portrait.mjs`.
5. `npm run test:unit` — it will now **demand** the flip and name any row still outstanding.
6. Follow `launch-gate.md`'s flip procedure from step 5 (re-measure F3 first).
