import type { Metadata } from "next";
import type { Locale } from "./content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

const OG_LOCALE: Record<Locale, string> = {
  en: "en_GB",
  de: "de_DE",
};

/**
 * The site card, as a stable public path rather than the file-convention
 * artifact at app/(en)/opengraph-image.png.
 *
 * The file convention scopes an image to the EXACT segment the file sits in
 * — it is not inherited by nested segments the way an ordinary metadata
 * object field is (app/icon.png DOES cascade; opengraph-image does not).
 * Measured against a real build by plan 06-09: /cv, /writing, /texte and
 * /type each carried ZERO og:image tags, and twitter:card consequently fell
 * back to "summary" instead of "summary_large_image". Since routeOpenGraph
 * already replaces the parent openGraph object wholesale, every leaf route
 * has to name its own image, and it needs a path that does not depend on
 * Next's content-hashed convention output.
 */
const SITE_CARD: Record<Locale, { url: string; alt: string }> = {
  en: {
    url: "/og/site-en.png",
    alt: "Guillem Gelabert — data visualisation, writing and interactive work.",
  },
  de: {
    url: "/og/site-de.png",
    alt: "Guillem Gelabert — Datenvisualisierung, Texte und interaktive Arbeiten.",
  },
};

/**
 * The factory both root layouts call — title template, OG defaults, and
 * locale. Everything a metadata concern needs that is common to every route
 * under a given locale, in one change point instead of two hand-copied
 * files.
 *
 * ⚠️ Deliberately does NOT include the noindex field. Phase 3 (via
 * tests/unit/link-contract.test.ts:298) and plan 06-03 (via
 * tests/unit/launch-gate.test.ts) both fix that field's location: it stays
 * declared LITERALLY in exactly the two root layouts, so the eventual
 * FIND-02 flip is a two-file edit a test can police. Absorbing it into this
 * factory would make that flip invisible — a shared default that silently
 * applies everywhere and can no longer be grepped for. Do not "finish" this
 * factory by adding it; each root layout adds its own index-false value for
 * that field, as a literal object, after spreading this result.
 */
export function rootMetadata(locale: Locale): Metadata {
  return {
    metadataBase: SITE_URL,
    title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
    description: SITE_DESCRIPTION[locale],
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      url: SITE_URL,
    },
  };
}

/**
 * Every leaf route's own `og:url`, without hand-restating `og:type`,
 * `og:site_name` or `og:locale`. Next does not derive `og:url` from
 * `alternates.canonical` (06-RESEARCH.md Q1, measured), so it needs its
 * own declaration per route — but per Next's own docs ("Merging >
 * Overwriting fields"), a route that declares ANY `openGraph` field
 * replaces the parent's WHOLE `openGraph` object rather than merging into
 * it. A route that wrote only `openGraph: { url: "/cv" }` would therefore
 * silently drop `type`/`siteName`/`locale` from rootMetadata's factory
 * default — measured directly against a real build. This helper re-supplies
 * those three from the one source (rootMetadata's own values, never
 * hand-typed a second time in a route file) alongside the route's own path,
 * so no leaf route restates them literally.
 */
export function routeOpenGraph(
  locale: Locale,
  path: string,
): NonNullable<Metadata["openGraph"]> {
  const card = SITE_CARD[locale];
  return {
    type: "website",
    siteName: SITE_NAME,
    locale: OG_LOCALE[locale],
    url: new URL(path, SITE_URL).toString(),
    images: [
      {
        url: new URL(card.url, SITE_URL).toString(),
        width: 1200,
        height: 630,
        alt: card.alt,
      },
    ],
  };
}
