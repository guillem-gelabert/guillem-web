import type { Locale } from "./content";

export const PATH_TOKEN: Record<Locale, string> = {
  en: "writing",
  de: "texte",
};

export function indexPath(locale: Locale): string {
  return `/${PATH_TOKEN[locale]}`;
}

export function postPath(locale: Locale, slug: string): string {
  return `/${PATH_TOKEN[locale]}/${slug}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "de" : "en";
}

const DATE_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  de: "de-DE",
};

export function formatPostDate(iso: string, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return formatter.format(new Date(`${iso}T00:00:00Z`));
}

type UiCopy = {
  indexKicker: string;
  /**
   * The index's <meta name="description">. Deliberately NOT emptyBody: that
   * string is the n = 0 state's on-page copy, and reusing it told every
   * crawler and link-preview card that nothing is published regardless of how
   * many posts exist. Phase 6 flips robots to indexable, which is when a
   * stale description starts appearing in search results.
   */
  indexDescription: string;
  backLink: string;
  switchLabel: string;
  emptyHeading: string;
  emptyBody: string;
  notFoundHeading: string;
  notFoundBody: string;
  draftMarker: string;
};

export const UI: Record<Locale, UiCopy> = {
  en: {
    indexKicker: "Writing",
    indexDescription: "Essays and case studies on data journalism and visualisation.",
    backLink: "← Writing",
    switchLabel: "Auf Deutsch lesen",
    emptyHeading: "Nothing published here yet.",
    emptyBody: "The first piece is being written.",
    notFoundHeading: "Not found",
    notFoundBody: "That piece doesn't exist here.",
    draftMarker: "Draft",
  },
  de: {
    indexKicker: "Texte",
    indexDescription: "Essays und Fallstudien zu Datenjournalismus und Visualisierung.",
    backLink: "← Texte",
    switchLabel: "Read in English",
    emptyHeading: "Hier ist noch nichts veröffentlicht.",
    emptyBody: "Der erste Text entsteht gerade.",
    notFoundHeading: "Nicht gefunden",
    notFoundBody: "Diesen Text gibt es hier nicht.",
    draftMarker: "Draft",
  },
};
