import type { Locale } from "./content";

export const PATH_TOKEN: Record<Locale, string> = {
  en: "writing",
  de: "texte",
};

/**
 * CR-01. The proxy's fixed rewrite target per locale, and the sitemap's
 * exclusion list (plan 06-05) — a path constant beside PATH_TOKEN, not UI
 * copy, so it does NOT belong in the UI map below (D-1.5 forbids growing
 * Record<Locale, UiCopy>). Both callers read this same constant so the two
 * cannot drift apart.
 */
export const NOT_FOUND_SLUG: Record<Locale, string> = {
  en: "not-found-page",
  de: "nicht-gefunden",
};

export function indexPath(locale: Locale): string {
  return `/${PATH_TOKEN[locale]}`;
}

export function notFoundPath(locale: Locale): string {
  return `/${PATH_TOKEN[locale]}/${NOT_FOUND_SLUG[locale]}`;
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
  /**
   * The site-root back link (`← Guillem Gelabert`), added by Phase 3
   * Amendment A2. Deliberately identical in both locales — unlike every
   * other key here, this is a proper noun, and a translated variant would
   * be a different affordance for no gain. On /texte the link carries
   * hrefLang="en", the one declared locale crossing: the landing genuinely
   * only exists in English (UI-SPEC § Localisation).
   */
  homeLink: string;
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
    homeLink: "← Guillem Gelabert",
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
    draftMarker: "Entwurf",
    homeLink: "← Guillem Gelabert",
  },
};
