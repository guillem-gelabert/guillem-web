import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

// Covers WRIT-01 (SC5) / D-11: the production half of "a draft prerenders
// nowhere and appears in no index". tests/draft-visibility.spec.ts (Playwright)
// covers the development half — every Playwright spec in this repo runs
// against `npm run dev`, where NODE_ENV is always "development" and
// isVisible() deliberately returns true for a draft. That environment
// structurally cannot prove what a production build omits. This file reads
// the real prerendered HTML that `next build` writes to `.next/server/app`
// instead — the same technique 02-RESEARCH.md used to verify `<html lang>`
// and the Shiki output shape.
//
// Requires a completed `next build` first (`rm -rf .next && npm run build`).
// Run via `npm run test:build`, NOT `npm run test:unit` — test:unit sweeps
// tests/unit/*.test.ts on every task commit and must stay fast; this file
// depends on build output that does not exist at that point in the cycle.

const APP_DIR = path.join(process.cwd(), ".next", "server", "app");

const NO_BUILD_MESSAGE =
  `tests/build/prerender.test.ts requires a completed \`next build\` first — ` +
  `${APP_DIR} does not exist. Run \`rm -rf .next && npm run build\`, then ` +
  `\`npm run test:build\`.`;

/**
 * Route-to-file mapping under .next/server/app is a Next internal, so this
 * walks for every *.html file and normalises each relative path (strips the
 * .html suffix; a bare "index" or a trailing "/index" segment normalises to
 * the segment root) rather than hardcoding "writing.html". Route-group
 * segments like "(en)" never appear here — Next flattens them when it
 * writes prerendered HTML to disk.
 */
async function walkHtmlRoutes(dir: string, base: string): Promise<Map<string, string>> {
  const routes = new Map<string, string>();
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(NO_BUILD_MESSAGE);
    }
    throw err;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkHtmlRoutes(fullPath, base);
      for (const [key, value] of nested) routes.set(key, value);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

    const relative = path.relative(base, fullPath).replace(/\\/g, "/");
    let routeKey = relative.replace(/\.html$/, "");
    if (routeKey === "index") routeKey = "";
    else if (routeKey.endsWith("/index")) routeKey = routeKey.slice(0, -"/index".length);

    routes.set(routeKey, await readFile(fullPath, "utf8"));
  }
  return routes;
}

let routesPromise: Promise<Map<string, string>> | null = null;
function getRoutes(): Promise<Map<string, string>> {
  if (!routesPromise) routesPromise = walkHtmlRoutes(APP_DIR, APP_DIR);
  return routesPromise;
}

// The three draft fixtures from Plan 04/06 (content/fixture.mdx,
// content/musterseite.mdx, content/nur-auf-deutsch.md) — all draft: true,
// so a production build must contain none of them anywhere.
const DRAFT_ROUTE_KEYS = ["writing/fixture", "texte/musterseite", "texte/nur-auf-deutsch"];
const DRAFT_TITLES = [
  "A Working Fixture for the Prose Contract",
  "Eine Musterseite für die Textvorlage",
  "Nur auf Deutsch: ein Text ohne Übersetzung",
];

test("no draft route was prerendered and no draft title appears anywhere in the build output", async () => {
  const routes = await getRoutes();

  for (const key of DRAFT_ROUTE_KEYS) {
    assert.equal(routes.has(key), false, `draft route "${key}" must not be prerendered`);
  }

  for (const [routeKey, html] of routes) {
    for (const title of DRAFT_TITLES) {
      assert.equal(
        html.includes(title),
        false,
        `route "${routeKey}" must not contain the draft title "${title}"`,
      );
    }
  }
});

test("both /writing and /texte render their empty state — all three fixtures are draft: true, so zero public entries is correct here", async () => {
  const routes = await getRoutes();
  const writing = routes.get("writing");
  const texte = routes.get("texte");
  assert.ok(writing, "route \"writing\" must exist in the production build");
  assert.ok(texte, "route \"texte\" must exist in the production build");

  assert.ok(writing!.includes("Nothing published here yet."));
  assert.ok(writing!.includes("The first piece is being written."));
  assert.ok(texte!.includes("Hier ist noch nichts veröffentlicht."));
  assert.ok(texte!.includes("Der erste Text entsteht gerade."));
});

test("per-route language: html lang=en on writing, html lang=de on texte, no locale prefix in either route key", async () => {
  const routes = await getRoutes();
  const writing = routes.get("writing")!;
  const texte = routes.get("texte")!;

  assert.ok(writing.includes('html lang="en"'));
  assert.ok(texte.includes('html lang="de"'));

  // The I18N Contract is explicit: no locale prefix, anywhere. A prefixed
  // key here would mean the route-group split leaked into the URL shape.
  assert.equal(routes.has("de/texte"), false);
  assert.equal(routes.has("en/writing"), false);
});

test("robots noindex survived the two-root-layout split — present on both writing and texte", async () => {
  const routes = await getRoutes();
  const writing = routes.get("writing")!;
  const texte = routes.get("texte")!;

  assert.match(writing, /name="robots"\s+content="[^"]*noindex[^"]*"/);
  assert.match(texte, /name="robots"\s+content="[^"]*noindex[^"]*"/);
});

test("no dev-only chrome leaked into either index's meta line", async () => {
  const routes = await getRoutes();
  const writing = routes.get("writing")!;
  const texte = routes.get("texte")!;

  // Production has zero visible entries on either index (all fixtures are
  // draft), so the Draft marker string must not appear at all.
  assert.equal(writing.includes("Draft"), false);
  assert.equal(texte.includes("Draft"), false);
});

test("locale metadata is emitted from Phase 2, not deferred — canonical plus an x-default alternate on both indexes", async () => {
  const routes = await getRoutes();
  const writing = routes.get("writing")!;
  const texte = routes.get("texte")!;

  assert.ok(writing.includes('rel="canonical"'));
  assert.ok(texte.includes('rel="canonical"'));
  // React SSR emits the DOM property name (hrefLang), not the HTML
  // attribute's lowercase spelling — match case-insensitively.
  assert.match(writing, /hreflang="x-default"/i);
  assert.match(texte, /hreflang="x-default"/i);
});

test("Phase 1's routes still prerender after the route-group restructure", async () => {
  const routes = await getRoutes();
  assert.ok(routes.has(""), "root route \"/\" must still exist");
  assert.ok(routes.has("type"), "route \"/type\" must still exist");
});

// Forward note for Phase 6 (FIND-02): when sitemap.ts is added, it must call
// publishedFor() from lib/content.ts rather than re-deriving the draft rule
// from front-matter directly. This file is otherwise the only place that
// rule is asserted; stating the draft predicate a second, independent way
// in sitemap.ts would let the two silently drift apart.
