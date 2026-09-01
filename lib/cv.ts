/**
 * The CV's entire content (D-1.2): a typed data module, not markup — the
 * same posture Phase 3 D-05 set for lib/work.ts and Phase 5 continued for
 * lib/backlog.tsx. Adding a role later is a content change to EXPERIENCE
 * below and nothing else.
 *
 * This is the one phase in the milestone that touches real personal facts,
 * and every one of them is still outstanding. What ships below is lorem
 * ipsum, tagged [PLACEHOLDER], by the owner's explicit instruction: fill
 * every surface so the site can be laid out and reviewed at full length,
 * and write the real words afterwards.
 *
 * The no-fabrication rule from 06-CONTEXT.md survives that change intact,
 * because lorem ipsum is not a fabrication — it makes no claim that could
 * be believed. What remains forbidden here, exactly as before, is a
 * PLAUSIBLE-LOOKING value: a real-sounding employer, a real-sounding
 * qualification, a face. Those are the failure mode this file exists to
 * prevent, and a placeholder that could be mistaken for a fact is worse
 * than no placeholder at all.
 *
 * Every [PLACEHOLDER] export is bound to lib/placeholder.ts's
 * PLACEHOLDER_CONTENT flag, which holds both root layouts at
 * `index: false` in both root layouts until the real values land — so none of this can
 * quietly become the indexed public record of anybody's career.
 */
// Explicit .ts extension (allowImportingTsExtensions in tsconfig.json):
// Node's native type-stripping resolver does not add extensions to a
// relative specifier the way `next build`'s bundler resolution does, and
// this module's own value import must resolve when loaded directly by
// `node --input-type=module` (this file's Task 1 verify command does
// exactly that) — the same reason tests/unit/work.test.ts imports
// "../../lib/work.ts" rather than "../../lib/work".
import { CASE_STUDY_SLUG, WORK } from "./work.ts";

/**
 * D-1.3: years/role/org/place on one Label-role line; `note` is one Body-
 * role line underneath saying what the work was ABOUT — the same
 * "about, not built-with" rule WORK-02 already imposes on the work list
 * (D-09), applied here to employment. Never a duties list.
 */
export type CvRole = {
  years: string; // a label, e.g. "2023–present" — not a parsed date range
  role: string;
  org: string;
  place: string;
  note: string; // single line, what the work was ABOUT, never a duties list
};

export type CvEducation = {
  years: string;
  qualification: string;
  institution: string;
  place: string;
};

export type CvLanguage = {
  language: string;
  level: string;
};

/**
 * [PLACEHOLDER] — PROF-01, launch gate G3, held at noindex by G14
 * (lib/placeholder.ts). The no-fabrication rule has NOT been relaxed: not
 * one string below names a real employer, a real role or a real date
 * range, and none may ever be read as doing so. Lorem ipsum is the point
 * — it fills the section to its true length so the CV can be laid out and
 * reviewed against real measure, while remaining unmistakably not a claim
 * about anyone's employment.
 *
 * The years are the one field kept in a realistic FORMAT rather than
 * lorem, because the row is typeset as "years: role, org, place" and a
 * lorem string in the leading position would collapse the line's rhythm —
 * the very thing this placeholder exists to let the owner judge. They are
 * spans, not history.
 */
export const EXPERIENCE: readonly CvRole[] = [
  {
    years: "2023–present",
    role: "Lorem ipsum dolor",
    org: "Consectetur Adipiscing",
    place: "Elit",
    note: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam.",
  },
  {
    years: "2020–2023",
    role: "Quis nostrud exercitation",
    org: "Ullamco Laboris",
    place: "Nisi",
    note: "Ut aliquip ex ea commodo consequat, duis aute irure dolor in reprehenderit in voluptate.",
  },
  {
    years: "2018–2020",
    role: "Velit esse cillum",
    org: "Dolore Eu Fugiat",
    place: "Nulla",
    note: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.",
  },
];

/**
 * [PLACEHOLDER] — PROF-01, launch gate G3 (same row as EXPERIENCE), held
 * at noindex by G14. No real qualification, no real institution. Two rows
 * so the section renders its second-row hairline rule, which is the only
 * way to see whether the rule reads correctly here.
 */
export const EDUCATION: readonly CvEducation[] = [
  {
    years: "2014–2018",
    qualification: "Lorem ipsum dolor sit",
    institution: "Amet Consectetur Adipiscing",
    place: "Elit",
  },
  {
    years: "2012–2014",
    qualification: "Sed do eiusmod tempor",
    institution: "Incididunt Ut Labore",
    place: "Magna",
  },
];

/**
 * [PLACEHOLDER] — PROF-01, launch gate G3 (same row as EXPERIENCE), held
 * at noindex by G14. Neither the languages nor the levels are real: a
 * claimed language level is a checkable assertion about a person, so the
 * placeholder must not resemble one even loosely.
 */
export const LANGUAGES: readonly CvLanguage[] = [
  { language: "Lorem", level: "Ipsum dolor" },
  { language: "Consectetur", level: "Adipiscing elit" },
  { language: "Tempor", level: "Incididunt" },
];

export type PortraitAsset = {
  src: string; // a path under public/, e.g. "/portrait.jpg"
  width: number; // the file's REAL intrinsic pixel width — not a guess
  height: number; // the file's REAL intrinsic pixel height — not a guess
  alt: string; // non-empty; not the person's name alone (D-2.6)
};

/**
 * [PLACEHOLDER] — PROF-02, launch gate G6, held at noindex by G14.
 *
 * NO SYNTHETIC OR STOCK FACE, UNDER ANY CIRCUMSTANCES. That rule is
 * unchanged and is not what this is: a generated face on a personal
 * job-hunting site is an impersonation artifact, and no placeholder policy
 * makes one acceptable. public/portrait.png is a flat tone panel with a
 * hairline border — no face, no figure, no silhouette — written by
 * scripts/make-placeholder-portrait.mjs from the two colours in
 * app/globals.css. It exists so the portrait's box is occupied at its true
 * size and aspect while /cv is laid out, and for no other reason.
 *
 * width/height are the file's real intrinsic pixels, read back from the
 * written PNG (`file public/portrait.png` → 960 x 1280), not guessed:
 * components/portrait.tsx renders <img> with these exact attributes and
 * the browser derives the reserved aspect ratio from them (D-2.6 — CLS
 * and, per 03-RESEARCH.md's correction, only CLS, not trail correctness).
 * The real photograph will almost certainly have different dimensions;
 * they must be re-measured then, never inherited from this line.
 */
export const PORTRAIT: PortraitAsset | null = {
  src: "/portrait.png",
  width: 960,
  height: 1280,
  alt: "A blank tone panel holding the place of the photograph, which is not yet taken.",
};

/**
 * /cv's empty-state fallback, unrendered as of the placeholder fill above
 * but deliberately kept: EXPERIENCE going back to empty is a legitimate
 * state (the owner may clear the lorem rows before writing the real ones),
 * and the branch in app/(en)/cv/page.tsx must have something to render
 * that is neither an empty <section> nor a visible marker word. Holding
 * the copy here rather than at the call site is what lets that branch stay
 * a one-line conditional.
 *
 * Free of every apology marker ("todo", "coming soon", "under
 * construction", "tbd" — lib/placeholder.ts's ALWAYS_BANNED_MARKERS) and
 * must stay so whatever the placeholder flag says: D-02 requires an
 * unfinished section on a live URL to read as authored, never as a pending
 * marker.
 */
export const CV_STUB_BODY = "The CV is being written up as a page.";

/**
 * D-1.2: the CV cross-references lib/work.ts's WORK and CASE_STUDY_SLUG —
 * it does not restate any title, annotation, href or host. plan 06-04's
 * /cv component reads this rather than importing lib/work.ts directly, so
 * there is exactly one place that decides what the CV selects.
 */
export const selectedWork = { work: WORK, caseStudySlug: CASE_STUDY_SLUG };
