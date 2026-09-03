/**
 * The work list's entire content (D-05): a fixed two-entry tuple, not markup.
 * Adding a third piece later is a change to WORK below and nothing else.
 */

/**
 * Unlike lib/locales.ts's UiCopy, WorkEntry IS exported — the landing
 * components import it for their props type.
 */
export type WorkEntry = {
  title: string; // the piece's PUBLISHED headline — never a repo name (D-06)
  annotation: string; // one line: what the piece is ABOUT, never what it was built with (WORK-02, D-09)
  href: string; // absolute URL to the live piece (D-06)
  host: string; // the destination host, rendered as the outbound marker
};

/**
 * A two-tuple, not WorkEntry[]: an empty work list is a build error, not a
 * UI state (D-03). There is no zero-state layout for this list because the
 * type does not permit a zero state.
 */
export const WORK: readonly [WorkEntry, WorkEntry] = [
  {
    title: "Everyone in Mallorca Knows It",
    annotation:
      "The Balearics stopped gaining on Europe in 1993 — while tourist arrivals went on tripling.",
    href: "https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing",
    host: "ib-gdp.guillemgelabert.com",
  },
  {
    title: "Watch People Die Live",
    annotation:
      "Roughly two people die every second: where they are, when it happens, and who they were.",
    href: "https://watchpeopledie.live",
    host: "watchpeopledie.live",
  },
] as const;

/**
 * Locked by Phase 4 D-15. Resolved through publishedFor("en") by the
 * featured slot: findBySlug(await publishedFor("en"), CASE_STUDY_SLUG). A
 * null result IS the interim state — there is no boolean to flip once the
 * case study's MDX file exists.
 */
export const CASE_STUDY_SLUG = "the-chart-therefore-changes";

/**
 * HOME-01: the positioning sentence is the user's to write (D-08). It is
 * still unwritten. What changed is the stand-in: it used to be the single
 * word "Developer.", which had the failure mode of reading as a finished
 * (if terse) choice at every optical pass. Lorem ipsum cannot be mistaken
 * for a decision, and it occupies the sentence's real length, so the
 * landing view is laid out against the measure the eventual sentence will
 * have.
 *
 * [PLACEHOLDER] — bound to lib/placeholder.ts's PLACEHOLDER_CONTENT, which
 * holds the site at noindex until this is real. Also serves as
 * app/(en)/page.tsx's metadata.description, so the real sentence remains a
 * one-line change in this file when it arrives (Pitfall 6).
 */
export const POSITIONING_PLACEHOLDER = "Data Visualisation Journalism";
