/**
 * The CV's entire content (D-1.2): a typed data module, not markup — the
 * same posture Phase 3 D-05 set for lib/work.ts and Phase 5 continued for
 * lib/backlog.tsx. Adding a role later is a content change to EXPERIENCE
 * below and nothing else.
 *
 * This is the one phase in the milestone that touches real personal facts.
 * Every [USER-SUPPLIED] export below ships null or empty and carries the
 * tag, its requirement ID, its launch-gate row and an explicit instruction
 * never to invent it (06-CONTEXT.md's no-fabrication rule). Nothing in this
 * file may contain a plausible-looking example value, even commented out —
 * a commented-out fake employer is the failure mode this file exists to
 * prevent.
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
 * [USER-SUPPLIED] — PROF-01, launch gate G3. Empty is the shipped state.
 * NEVER invent a role, an employer or a date range: a fabricated
 * employment history on a live job-hunting site is a serious,
 * hard-to-detect failure — a labelled absence is not. With EXPERIENCE
 * empty, /cv renders CV_STUB_BODY below, never an empty <section> and
 * never a visible marker (D-02's posture; plan 06-04 implements the
 * branch, tests/cv.spec.ts proves it in the browser).
 */
export const EXPERIENCE: readonly CvRole[] = [];

/**
 * [USER-SUPPLIED] — PROF-01, launch gate G3 (same row as EXPERIENCE).
 * Empty is the shipped state. NEVER invent a qualification or institution.
 */
export const EDUCATION: readonly CvEducation[] = [];

/**
 * [USER-SUPPLIED] — PROF-01, launch gate G3 (same row as EXPERIENCE).
 * Empty is the shipped state. NEVER invent a language or a level.
 */
export const LANGUAGES: readonly CvLanguage[] = [];

export type PortraitAsset = {
  src: string; // a path under public/, e.g. "/portrait.jpg"
  width: number; // the file's REAL intrinsic pixel width — not a guess
  height: number; // the file's REAL intrinsic pixel height — not a guess
  alt: string; // non-empty; not the person's name alone (D-2.6)
};

/**
 * [USER-SUPPLIED] — PROF-02, launch gate G6. null is the shipped state.
 * NO GENERATED PORTRAIT, UNDER ANY CIRCUMSTANCES: a synthetic or stock
 * face on a personal job-hunting site is an impersonation artifact, not a
 * placeholder. If the file is absent the slot renders nothing — that is
 * plan 06-04's job, not licence to invent one here.
 *
 * width/height are part of the user-supplied fact, not a guess: they must
 * be the file's real intrinsic pixels, because plan 06-04 renders <img>
 * with these exact attributes and the browser derives the aspect ratio
 * from them (D-2.6 — CLS and, per 03-RESEARCH.md's correction, only CLS,
 * not trail correctness).
 */
export const PORTRAIT: PortraitAsset | null = null;

/**
 * The line /cv already ships today (app/(en)/cv/page.tsx) while
 * EXPERIENCE is empty. Moving it here is what lets /cv branch on
 * EXPERIENCE.length without the copy living at the call site. Already
 * proven to pass tests/cv.spec.ts's marker-word ban (no "todo",
 * "placeholder", "coming soon", "under construction", "lorem", "tbd") —
 * D-02 requires placeholder content on a live URL to read as authored,
 * never as a pending marker.
 */
export const CV_STUB_BODY = "The CV is being written up as a page.";

/**
 * D-1.2: the CV cross-references lib/work.ts's WORK and CASE_STUDY_SLUG —
 * it does not restate any title, annotation, href or host. plan 06-04's
 * /cv component reads this rather than importing lib/work.ts directly, so
 * there is exactly one place that decides what the CV selects.
 */
export const selectedWork = { work: WORK, caseStudySlug: CASE_STUDY_SLUG };
