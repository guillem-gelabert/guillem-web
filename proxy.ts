// proxy.ts — Next 16's file convention. NOT middleware.ts: that name is
// deprecated in Next 16.3.3 and prints
// "⚠ The 'middleware' file convention is deprecated. Please use 'proxy'
// instead." on every build. `proxy`'s runtime is nodejs and is NOT
// configurable — no `runtime` key here.
// [CITED: nextjs.org/docs — 01-app/02-guides/upgrading/version-16.mdx, via Context7]
//
// CR-01: the accessibility defect this file exists to close.
// /writing/<unknown> and /texte/<unbekannt> reach [slug]/page.tsx's explicit
// notFound() call, and Next 16.3.3 never server-renders a thrown
// notFound()'s boundary — it emits <html id="__next_error__"> with an empty
// hidden body and paints the copy on hydration only (measured, both
// locales; see .planning/phases/02-content-pipeline/deferred-items.md and
// 06-RESEARCH.md § "CR-01 — SOLVED AND MEASURED"). NextResponse.rewrite to a
// REAL per-locale page with an explicit 404 status is the only measured-
// working fix that also preserves the German copy — a self-rewrite to the
// same URL still resolves to the same notFound() throw and does not work
// (measured); dynamicParams = false always serves the English global 404.
//
// D-4.1 explicitly declines middleware for the security headers this phase
// also ships ("Not middleware — none exists, and adding one for headers
// alone buys nothing."). Those live in next.config.ts headers() instead
// (plan 06-02). This file exists SOLELY for CR-01 — it is not a free rider
// on infrastructure the headers already needed.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
// Relative imports throughout this file, not the @/ alias every other module
// uses: tests/unit/proxy-slugs.test.ts imports this file directly under
// plain `node --test`, which understands neither tsconfig's `paths` map nor
// a bare "next/server" specifier missing its extension (Next's package.json
// carries no "exports" field, so Node's ESM resolver — unlike Turbopack's
// bundler resolution, which built this file successfully — requires the
// literal file). Both read identically once Turbopack bundles them; this is
// resolution-only, not a behaviour change.
import { NextResponse, type NextRequest } from "next/server.js";
import type { Locale } from "./lib/content.ts";
import { NOT_FOUND_SLUG, PATH_TOKEN } from "./lib/locales.ts";

export const config = {
  // One segment only, so /writing/a/b matches no route here and correctly
  // falls through to the global 404, exactly as it does today. Next expands
  // this to also cover the .rsc / .segments request variants, so
  // client-side navigations are intercepted the same way as a hard load
  // (verified in .next/server/functions-config-manifest.json).
  matcher: ["/writing/:slug", "/texte/:slug"],
};

// ASVS V12: a fixed, module-scope directory constant derived from
// process.cwd(), exactly matching the lib/content.ts:25 posture — never a
// request-derived path component.
const CONTENT_DIR = path.join(process.cwd(), "content");

// Restated from lib/content.ts's own SAFE_SLUG, not imported: that
// module-scope constant is not exported there, and this predicate is a
// proxy-tier concern reading the filesystem directly rather than going
// through lib/content.ts's loaders. tests/unit/proxy-slugs.test.ts is the
// sole guarantee this regex and lib/content.ts's published-slug set never
// diverge.
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FRONTMATTER_FENCE = /^---\r?\n([\s\S]*?)\r?\n---/;

function readField(block: string, field: string): string | undefined {
  const match = block.match(new RegExp(`^${field}:\\s*(.+?)\\s*$`, "m"));
  return match?.[1]?.replace(/^["']|["']$/g, "");
}

/**
 * CR-01's published-slug predicate. Reads content/ with node:fs at request
 * time — the measured-working option (06-RESEARCH.md): Next's file tracing
 * adds content/*.mdx to the proxy's .nft.json automatically, so no manifest
 * step is required.
 *
 * Admits a slug only when it is SAFE_SLUG-shaped, a file with that stem
 * exists in content/, its front-matter `lang` equals the requested locale,
 * AND its `draft` is not `true`. The locale filter is not optional: without
 * it /writing/die-darstellung-aendert-sich would serve German content under
 * an English layout with a 200.
 *
 * Exported so tests/unit/proxy-slugs.test.ts can assert this predicate and
 * lib/content.ts's publishedFor() return identical slug sets per locale —
 * the binding test that stops the two from silently diverging. Deleting
 * that test re-opens the failure mode where a published post 404s or a
 * draft becomes reachable.
 *
 * Synchronous fs, matching the measured-working option (06-RESEARCH.md
 * § "How the proxy learns the published slug set"): fs.readdirSync(content/)
 * plus a front-matter read, at request time, inside proxy.ts.
 */
export function isPublished(locale: Locale, slug: string): boolean {
  if (!SAFE_SLUG.test(slug)) return false;

  let entries;
  try {
    entries = readdirSync(CONTENT_DIR, { withFileTypes: true });
  } catch {
    return false;
  }

  const fileName = entries.find(
    (entry) =>
      entry.isFile() && /\.mdx?$/.test(entry.name) && entry.name.replace(/\.mdx?$/, "") === slug,
  )?.name;
  if (!fileName) return false;

  const raw = readFileSync(path.join(CONTENT_DIR, fileName), "utf8");
  const fence = raw.match(FRONTMATTER_FENCE);
  if (!fence) return false;

  const block = fence[1];
  return readField(block, "lang") === locale && readField(block, "draft") !== "true";
}

export function proxy(request: NextRequest) {
  const [segment, slug = ""] = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale: Locale = segment === PATH_TOKEN.de ? "de" : "en";

  if (isPublished(locale, slug)) return NextResponse.next();

  // ASVS V5/V12: the rewrite target is built entirely from the fixed
  // NOT_FOUND_SLUG / PATH_TOKEN constants — never by interpolating any part
  // of the request path. No error boundary, no logging of the requested
  // path, and the slug is never echoed into the rendered document.
  const url = request.nextUrl.clone();
  url.pathname = `/${PATH_TOKEN[locale]}/${NOT_FOUND_SLUG[locale]}`;
  // The status is the entire point: it reaches the wire (measured on both
  // locales), and Next injects <meta name="robots" content="noindex"> for
  // any response at or above 400 — so these pages stay unindexed after the
  // eventual FIND-02 flip, with no extra code.
  return NextResponse.rewrite(url, { status: 404 });
}
