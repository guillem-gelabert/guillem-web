import type { MetadataRoute } from "next";
import { LOCALES, publishedFor } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { indexPath, notFoundPath, postPath } from "@/lib/locales";

/**
 * Trailing-slash decision (06-RESEARCH.md Pitfall 8 / plan 06-05 interfaces
 * §"Measured trailing-slash mismatch"): Next resolves the landing's own
 * `alternates.canonical: "/"` to the BARE ORIGIN — no trailing slash — while
 * `new URL("/", SITE_URL).toString()` always emits one. That is two spellings
 * of the same page. This sitemap normalises the site-root entry to the
 * canonical's spelling (no trailing slash) so the two surfaces agree. Plan
 * 06-07 keeps every canonical on this same spelling and plan 06-09 asserts
 * both surfaces agree.
 */
const abs = (path: string) => new URL(path, SITE_URL).toString();
const SITE_ROOT = SITE_URL.origin; // no trailing slash — see decision above

/**
 * Routes that must never appear here even though they are real, reachable
 * routes — named through the constants that own them, not hardcoded, so a
 * rename cannot leave a stale entry silently in or out:
 *
 * - `/type` is not filtered here because it is never a candidate in the
 *   first place: this file only enumerates the four static routes below and
 *   `publishedFor`'s output, and `/type` is neither. It is Phase 1 D-05's
 *   deliberately non-indexed specimen and is disallowed in robots.ts instead.
 * - Both reserved 404 routes from plan 06-01 (CR-01's proxy rewrite target)
 *   ARE real prerendered pages under the same `[slug]`-shaped paths a post
 *   could occupy, so they are filtered explicitly by `notFoundPath("en")` /
 *   `notFoundPath("de")` rather than assumed absent.
 * - Drafts need no entry here at all: `publishedFor` already excludes them
 *   (lib/content.ts D-11 — draft !== true), so restating the rule would be a
 *   second, driftable source of truth. Plan 06-09 asserts this sitemap's post
 *   entries equal `publishedFor()`'s output for both locales, compared as
 *   sets rather than by count.
 */
const RESERVED_PATHS = new Set<string>(LOCALES.map((locale) => notFoundPath(locale)));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_ROOT },
    { url: abs("/cv") },
    { url: abs(indexPath("en")) },
    { url: abs(indexPath("de")) },
  ];

  const postEntries = (
    await Promise.all(
      LOCALES.map(async (locale) => {
        const posts = await publishedFor(locale);
        return posts
          .map((post) => ({ path: postPath(locale, post.slug), date: post.frontmatter.date }))
          .filter((entry) => !RESERVED_PATHS.has(entry.path))
          .map((entry) => ({ url: abs(entry.path), lastModified: entry.date }));
      }),
    )
  ).flat();

  return [...staticEntries, ...postEntries];
}
