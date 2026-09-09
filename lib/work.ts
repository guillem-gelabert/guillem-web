/**
 * The work list's entire content (D-05): a fixed two-entry tuple, not markup.
 * Adding a third piece later is a change to WORK below and nothing else.
 */

/**
 * A screenshot of the piece itself. Same four-field contract as lib/cv.ts's
 * PortraitAsset, for the same reason: the intrinsic pixels have to reach the
 * <img> so its box is reserved before the bytes arrive, and an asset with no
 * committed file is null rather than a placeholder.
 */
export type WorkShot = {
  src: string;
  width: number; // the committed file's REAL intrinsic pixels, not a rendered size
  height: number;
  alt: string; // describes what the chart shows — the piece already carries its own title
};

/**
 * Unlike lib/locales.ts's UiCopy, WorkEntry IS exported — the landing
 * components import it for their props type.
 */
export type WorkEntry = {
  title: string; // the piece's PUBLISHED headline — never a repo name (D-06)
  annotation: string; // one line: what the piece is ABOUT, never what it was built with (WORK-02, D-09)
  href: string; // absolute URL to the live piece (D-06)
  host: string; // the destination host, rendered as the outbound marker
  shot: WorkShot | null; // null is a state, not a gap: the entry renders as a line of type
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
    // The chart the annotation is about, lifted from the piece itself rather
    // than drawn again for the landing: the reader sees the actual artefact.
    //
    // Cropped to the plot area — the rotated y-axis title and the year
    // labels are trimmed off. At the ~356px the landing slot measures it
    // into, both were mush, and dropping them lets the lines themselves
    // read at that size. 900px wide is roughly twice that column, so it
    // holds on a 2x screen without shipping the full 2368px capture.
    shot: {
      src: "/work/mallorca-eu-average.png",
      width: 900,
      height: 410,
      // Describes the crop, not the whole chart: the years are not in the
      // frame, so the alt does not claim them. It does not repeat the
      // title either — the linked headline above it already says that.
      alt:
        "A detail from the piece: GDP per capita as a percentage of the EU average, three " +
        "lines against a dashed line at 100. The Balearics climb above the average, peak, " +
        "and fall back to it.",
    },
  },
  {
    title: "Watch People Die Live",
    annotation:
      "Roughly two people die every second: where they are, when it happens, and who they were.",
    href: "https://watchpeopledie.live",
    host: "watchpeopledie.live",
    // No screenshot: the piece is a live global map that reads as a dark
    // rectangle at thumbnail scale, and the landing slot has room for one
    // image. It renders as its title and annotation instead.
    shot: null,
  },
] as const;

/**
 * Locked by Phase 4 D-15. Still exported for lib/cv.ts's selectedWork and
 * the content gate in tests/unit/case-study-content.test.ts, but the landing
 * no longer resolves it: the case studies are deferred, so
 * app/(en)/page.tsx renders the published pieces (WORK, above) rather than
 * components/landing/featured-slot.tsx's "being written" interim copy.
 * That component and content/the-chart-therefore-changes.mdx both stay put
 * for when the case studies come back.
 */
export const CASE_STUDY_SLUG = "the-chart-therefore-changes";

/** One source for the landing's visible descriptor and metadata description. */
export const POSITIONING_PLACEHOLDER = "Data Visualisation Journalism";
