import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * This file allows crawling — it is not what makes the site indexable, and it
 * is not the FIND-02 flip. That flip is the `index: false` value of the
 * `robots` metadata key in `app/(en)/layout.tsx` and `app/(de)/layout.tsx`,
 * which every route inherits and which the meta tag wins on: a search engine
 * that reads `Allow: /` here still honours a page-level `noindex`. This file
 * only prepares the ground — the flip stays the user's, made after their own
 * review (06-VALIDATION.md).
 *
 * `Disallow: /type` stops crawling of that route but does NOT stop indexing
 * of a URL a crawler already knows about from elsewhere (06-RESEARCH.md
 * Pitfall 6) — `/type` is a Client Component today and inherits the layout's
 * noindex only by accident of never being crawled. Plan 06-07 owns the real
 * fix: de-clienting `/type` so it can export its own `index: false` `robots`
 * metadata directly. Until then, treat this Disallow line as a crawl fence,
 * not a search-result guarantee.
 *
 * `/api` is fenced for the same reason and with the same caveat. It is not a
 * security control — the endpoints are token-gated in lib/api-auth.ts, which
 * is what actually protects them, and a crawler that ignores this file gets a
 * 401 rather than a backlog. What the line buys is that a well-behaved crawler
 * does not spend requests on a route that can only ever answer 401, and that
 * the endpoint does not turn up in a search result as a URL worth poking at.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/type", "/api"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
