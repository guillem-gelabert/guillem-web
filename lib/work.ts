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
export type WorkShotSource = {
  src: string;
  width: number; // the committed file's REAL intrinsic pixels, not a rendered size
  height: number;
};

export type WorkShot = WorkShotSource & {
  alt: string; // describes what the chart shows — the piece already carries its own title
  // An optional full-colour source revealed over a display treatment (such
  // as the dithered globe) while the visitor hovers the whole work pair.
  reveal?: WorkShotSource;
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
  // The two tags a "More work" pair prints under its annotation
  // (components/landing/more-work.tsx). Nouns, not sentences — .text-label
  // sets them in caps at 14px, where a clause stops reading. Both required:
  // a pair with one tag missing renders a gap where the grammar promises two.
  domain: string; // the field the piece is about: Economy, Demography, ...
  contentType: string; // the form the piece takes: Chart essay, Live map, ...
  // Two paragraphs on what the piece is and what it finds, for the pair's
  // square. Exactly two, not "some": the square is laid out for two blocks
  // of running copy under a title, and a third would push the tags off its
  // foot. Like the annotation, these describe the piece, never the tools
  // (WORK-02, D-09); the tools have their own field below.
  body: readonly [string, string];
  // The stack, as tags after the domain and content-type ones. This is the
  // one place a tool is NAMED on the landing — a deliberate exception to
  // D-09's "demonstrated, never claimed", by the owner's call on
  // 2026-09-09, and confined to the tag row so the copy stays about the
  // work. Empty where the stack is not on record.
  stack: readonly string[];
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
    domain: "Economy",
    contentType: "Chart essay",
    body: [
      "A scroll-driven history of the Balearic economy over 125 years, set against the " +
        "story everyone on the islands agrees on: that tourism rescued a poor, rural place " +
        "from poverty. In absolute income the story holds. Against the European average it " +
        "does not — the islands were never exceptionally poor, and their climb after 1960 " +
        "was shared by Extremadura, Andalusia, Portugal and Ireland, none of them beach " +
        "economies.",
      "Mid-scroll the chart changes what it measures, from income in constant dollars to a " +
        "share of the EU average, because only that view shows what is distinctly the " +
        "Balearics' own: they stopped gaining on Europe in 1993 and have fallen behind since, " +
        "while arrivals tripled and three times as many young people leave for work as in 2009.",
    ],
    // Not on record here; the hero does not print tags. Fill when known.
    stack: [],
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
    title: "Real-Time Defunction Predictive Model",
    annotation:
      "Roughly two people die every second: where they are, when it happens, and who they were.",
    href: "https://watchpeopledie.live",
    host: "watchpeopledie.live",
    domain: "Demography",
    contentType: "Live map",
    body: [
      "A live globe maps deaths worldwide at roughly two per second.",
      "Each event uses WHO mortality estimates for age, sex, cause and location, placed with population density and seasonal timing.",
    ],
    stack: ["three.js", "d3", "pandas"],
    // The globe itself, captured from the live piece rather than redrawn for
    // the landing, with the flashes that define it. Its monochrome dither is
    // a deliberate display treatment: it preserves the Europe/North Africa
    // face and its mortality flashes while letting the disc sit cleanly in
    // the landing's black-and-white field. The original full-colour capture
    // remains beside it as watch-people-die-earth.png.
    shot: {
      src: "/work/watch-people-die-earth-dither.png",
      width: 1254,
      height: 1254,
      reveal: {
        src: "/work/watch-people-die-earth.png",
        width: 980,
        height: 980,
      },
      alt:
        "The piece's globe, seen from above the Atlantic: Europe, North Africa and the " +
        "Middle East under scattered cloud, with nine white flashes over Europe and the " +
        "Mediterranean, each one a death at the moment it happened.",
    },
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
