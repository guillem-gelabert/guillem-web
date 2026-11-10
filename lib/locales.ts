import type { Locale, PostEntry } from "./content";

export const PATH_TOKEN: Record<Locale, string> = {
  en: "writing",
  de: "texte",
  ca: "escrits",
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
  ca: "no-trobat",
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

/** Every locale, in PATH_TOKEN's declaration order (en, de, ca). */
export const ALL_LOCALES = Object.keys(PATH_TOKEN) as Locale[];

export function otherLocales(locale: Locale): Locale[] {
  return ALL_LOCALES.filter((other) => other !== locale);
}

/** The locale whose writing index lives at /<segment>, if any. */
export function localeForSegment(segment: string | undefined): Locale | null {
  return ALL_LOCALES.find((locale) => PATH_TOKEN[locale] === segment) ?? null;
}

/** hreflang alternates for the three writing indexes. */
export function indexAlternates(): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of ALL_LOCALES) languages[locale] = indexPath(locale);
  languages["x-default"] = indexPath("en");
  return languages;
}

/**
 * hreflang alternates for a post and its twins. x-default is the English
 * twin when there is one, otherwise the post's own URL, so it never points
 * at a path that would 404.
 */
export function postAlternates(entry: PostEntry, twins: PostEntry[]): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const post of [entry, ...twins]) {
    languages[post.frontmatter.lang] = postPath(post.frontmatter.lang, post.slug);
  }
  languages["x-default"] = languages.en ?? postPath(entry.frontmatter.lang, entry.slug);
  return languages;
}

/** PostMeta's language links for a post's twins. */
export function translationLinks(twins: PostEntry[]): { locale: Locale; href: string }[] {
  return twins.map((twin) => ({
    locale: twin.frontmatter.lang,
    href: postPath(twin.frontmatter.lang, twin.slug),
  }));
}

const DATE_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  de: "de-DE",
  ca: "ca-ES",
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
  /** The link to this locale's version, written in this locale. */
  readIn: string;
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
    readIn: "Read in English",
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
    readIn: "Auf Deutsch lesen",
    emptyHeading: "Hier ist noch nichts veröffentlicht.",
    emptyBody: "Der erste Text entsteht gerade.",
    notFoundHeading: "Nicht gefunden",
    notFoundBody: "Diesen Text gibt es hier nicht.",
    draftMarker: "Entwurf",
    homeLink: "← Guillem Gelabert",
  },
  ca: {
    indexKicker: "Escrits",
    indexDescription: "Assaigs i estudis de cas sobre periodisme de dades i visualització.",
    backLink: "← Escrits",
    readIn: "Llegeix-ho en català",
    emptyHeading: "Encara no hi ha res publicat.",
    emptyBody: "S'està escrivint el primer text.",
    notFoundHeading: "No trobat",
    notFoundBody: "Aquest text no existeix.",
    draftMarker: "Esborrany",
    homeLink: "← Guillem Gelabert",
  },
};
