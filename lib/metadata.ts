import type { Metadata } from "next";
import type { Locale } from "./content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

const OG_LOCALE: Record<Locale, string> = {
  en: "en_GB",
  de: "de_DE",
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
