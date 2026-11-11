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

/** The locale whose posts live under /<segment>, if any. */
export function localeForSegment(segment: string | undefined): Locale | null {
  return ALL_LOCALES.find((locale) => PATH_TOKEN[locale] === segment) ?? null;
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
  /** The link to this locale's version, written in this locale. */
  readIn: string;
  notFoundHeading: string;
  notFoundBody: string;
  draftMarker: string;
  /**
   * The site-root back link (`← Guillem Gelabert`), added by Phase 3
   * Amendment A2. Deliberately identical in both locales — unlike every
   * other key here, this is a proper noun, and a translated variant would
   * be a different affordance for no gain. On German and Catalan pages the link carries
   * hrefLang="en", the one declared locale crossing: the landing genuinely
   * only exists in English (UI-SPEC § Localisation).
   */
  homeLink: string;
};

export const UI: Record<Locale, UiCopy> = {
  en: {
    readIn: "Read in English",
    notFoundHeading: "Not found",
    notFoundBody: "That piece doesn't exist here.",
    draftMarker: "Draft",
    homeLink: "← Guillem Gelabert",
  },
  de: {
    readIn: "Auf Deutsch lesen",
    notFoundHeading: "Nicht gefunden",
    notFoundBody: "Diesen Text gibt es hier nicht.",
    draftMarker: "Entwurf",
    homeLink: "← Guillem Gelabert",
  },
  ca: {
    readIn: "Llegeix-ho en català",
    notFoundHeading: "No trobat",
    notFoundBody: "Aquest text no existeix.",
    draftMarker: "Esborrany",
    homeLink: "← Guillem Gelabert",
  },
};
