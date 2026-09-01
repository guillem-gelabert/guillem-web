import type { Locale } from "./content";

/**
 * The one place the site's own identity and canonical hostname are written
 * down. Every rel="canonical" and every hreflang alternate on every route
 * resolves against SITE_URL — exactly the class of value where a stale
 * hostname is silently wrong rather than loudly broken.
 *
 * This fallback used to be the Railway origin
 * (`https://web-production-9cedb.up.railway.app`) verbatim in both root
 * layouts. 06-RESEARCH.md's Finding F3 (measured 2026-08-31) found that the
 * apex `guillemgelabert.com` already serves this exact application
 * byte-identically: the `guillem-edge` Cloudflare Worker forwards every
 * path — including /robots.txt and /sitemap.xml — from the apex to this
 * same Railway service. Both hostnames reach one origin today; nothing is
 * detached and no DNS changes. Whichever hostname is canonical is the one
 * an eventual index consolidates onto (06-VALIDATION.md § USER DECISIONS,
 * item 1: the user chose `guillemgelabert.com`), so the apex is now the
 * fallback rather than the Railway origin — a local build, a CI build and
 * `npm run test:build` all now emit the same canonical production does,
 * rather than that assertion depending on an environment variable being
 * set anywhere but production.
 *
 * The Railway origin the service also still answers on directly:
 * https://web-production-9cedb.up.railway.app
 *
 * Env-overridable so a future hostname change is a deploy variable, not a
 * code change: set NEXT_PUBLIC_SITE_URL in the hosting environment.
 *
 * ⚠️ `NEXT_PUBLIC_*` variables are INLINED AT BUILD TIME, not read at
 * runtime (06-RESEARCH.md Q2) — changing this variable in production
 * requires a redeploy, not a restart. Never add NEXT_PUBLIC_SITE_URL to the
 * local `.env`: a local value would silently shadow the deploy's and bake
 * the wrong canonical into every local/CI build without anyone setting it
 * on purpose there.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://guillemgelabert.com",
);

export const SITE_NAME = "Guillem Gelabert";

/**
 * The site's own share-preview description — the (en)/(de) root layouts'
 * default, inherited by any route that declares no `description` of its
 * own. Deliberately describes the site's ARTIFACTS, not the person, so it
 * does not trespass on HOME-01's user-authored positioning sentence
 * (lib/work.ts's POSITIONING_PLACEHOLDER), which only `/` serves.
 *
 * [SOFT PLACEHOLDER] Working text (D-3.1), replaceable at any time — unlike
 * POSITIONING_PLACEHOLDER this is not a blocking launch-gate row.
 */
export const SITE_DESCRIPTION: Record<Locale, string> = {
  en: "Data visualisation, writing and interactive work by Guillem Gelabert.",
  de: "Datenvisualisierung, Texte und interaktive Arbeiten von Guillem Gelabert.",
};
