import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { POSITIONING_PLACEHOLDER } from "../../lib/work.ts";

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

/**
 * The draft marker as PostMeta actually renders it: the last item on the
 * Label-role meta line, separated by a middle dot from the <time> (or from
 * the language-switch link), with React 19's text-node separator comment
 * optionally between them.
 *
 * A bare `html.includes("Draft")` substring check was the earlier form, and
 * it would fail on any legitimately published post whose title or standfirst
 * contained "Draft", "Drafting" or "Draftsman" — plausible words for a data
 * journalism site — for a reason entirely unrelated to what it claims to
 * prove. Matching the rendered shape cannot be triggered by prose.
 */
function draftMarkerLine(marker: string): RegExp {
  return new RegExp(`(?:</time>|</a>)\\s*·\\s*(?:<!--\\s*-->\\s*)?${marker}`, "u");
}

test("no dev-only chrome leaked into either index's meta line", async () => {
  const routes = await getRoutes();
  const writing = routes.get("writing")!;
  const texte = routes.get("texte")!;

  // Production has zero visible entries on either index (all fixtures are
  // draft), so neither locale's marker may appear on a meta line at all.
  // Both markers are checked against both routes: "Draft" appearing on
  // /texte would mean UI.de.draftMarker had regressed to the untranslated
  // English string, which no other test would notice.
  for (const [routeKey, html] of [
    ["writing", writing],
    ["texte", texte],
  ] as const) {
    for (const marker of ["Draft", "Entwurf"]) {
      assert.doesNotMatch(
        html,
        draftMarkerLine(marker),
        `route "${routeKey}" must not render a "${marker}" draft marker`,
      );
    }
  }
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

test("the global 404 is one valid document with a non-empty title (CR-01/WR-01)", async () => {
  const routes = await getRoutes();
  const notFound = routes.get("_not-found");
  assert.ok(notFound, 'route "_not-found" must be prerendered');

  // WCAG 2.1 SC 2.4.2 Page Titled (Level A). Before app/global-not-found.tsx
  // + experimental.globalNotFound, /_not-found was the ONLY one of the seven
  // prerendered routes with zero <title>: app/not-found.tsx could not export
  // metadata, and Next's injected default root layout declared none either.
  // document.title was "" on every unmatched URL.
  assert.match(
    notFound!,
    /<title>[^<]+<\/title>/,
    "/_not-found must carry a non-empty page title",
  );

  // The same fix's second half (WR-01): with the default layout injected,
  // this file's own <html>/<body> rendered INSIDE the stub's, so the served
  // bytes carried two of each. Browsers recover, which is why the Playwright
  // lang assertion passed over the top of it — validators, link-preview
  // fetchers and sanitisers do not.
  assert.equal(notFound!.match(/<html/g)?.length, 1, "/_not-found must have exactly one <html>");
  assert.equal(notFound!.match(/<body/g)?.length, 1, "/_not-found must have exactly one <body>");

  // The premise the file's header comment now states, asserted rather than
  // claimed: global-not-found owns the document, so lang and the three font
  // variables are its own, not a browser's error-recovery repair.
  assert.match(notFound!, /<html lang="en"/, "/_not-found must declare its language (SC 3.1.1)");

  // Exactly one — Next injects noindex for any status above 400, so
  // global-not-found.tsx deliberately declares no robots of its own. Two
  // tags here means that decision was reverted; zero means Next stopped
  // injecting it and the 404 needs its own declaration back.
  assert.equal(
    (notFound!.match(/name="robots"\s+content="[^"]*noindex[^"]*"/gi) ?? []).length,
    1,
    "/_not-found must carry exactly one noindex robots meta",
  );
});

test("every prerendered route carries a title — /_not-found was the one that did not", async () => {
  const routes = await getRoutes();
  for (const [routeKey, html] of routes) {
    assert.match(
      html,
      /<title>[^<]+<\/title>/,
      `route "${routeKey || "/"}" must carry a non-empty <title>`,
    );
  }
});

test("Phase 1's routes still prerender after the route-group restructure, and Phase 3's landing/cv change class survives a clean build", async () => {
  const routes = await getRoutes();
  assert.ok(routes.has(""), "root route \"/\" must still exist");
  assert.ok(routes.has("type"), "route \"/type\" must still exist");
  assert.ok(routes.has("cv"), "route \"/cv\" must exist — Phase 3 adds it");
});

// --- Phase 3 production-tier assertions -----------------------------------
//
// Every *.spec.ts in this repo runs against `npm run dev`, where
// showDrafts() is always true. The three content/ fixtures are all
// draft: true, so in a production build publishedFor("en") === [] and
// findBySlug([], CASE_STUDY_SLUG) === null — the featured slot ships in its
// INTERIM state. Playwright already proves the slot's structure is
// state-agnostic (tests/landing.spec.ts test (p)); the tests below prove
// what actually ships: the interim copy, in real prerendered HTML.

test("/'s production HTML emits a canonical it did not have before this phase", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // The measured gap (03-RESEARCH.md C-2): before this phase / inherited a
  // title and description from the root layout but emitted no canonical and
  // could not declare one, because "use client" makes the metadata export
  // illegal. Asserting "a title appears on /" would have passed before this
  // phase too and would prove nothing — the canonical is the actual delta.
  assert.ok(root.includes('rel="canonical"'), '/ must emit a rel="canonical" link');
  const match = root.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(match, "the canonical link tag must carry an href");
  assert.equal(new URL(match![1]).pathname, "/", '/\'s canonical must resolve to pathname "/"');
});

test("/'s meta description is bound to POSITIONING_PLACEHOLDER by equality, not a hardcoded literal", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // Pitfall 6: the failure this prevents is the user writing the real
  // positioning sentence into the rendered <p> while the meta description
  // still holds the old placeholder value — which is what Slack, LinkedIn
  // and eventually Google quote once Phase 6 flips FIND-02. Comparing
  // against the imported constant rather than a literal means this keeps
  // passing when the real sentence lands and fails the moment the two drift.
  const match = root.match(/<meta name="description" content="([^"]*)"/);
  assert.ok(match, "/ must carry a meta description");
  assert.equal(match![1], POSITIONING_PLACEHOLDER);
});

test("the inherited noindex reaches both new surfaces — neither route restates robots", async () => {
  const routes = await getRoutes();

  // Neither route declares `robots` in its own source: Next merges metadata
  // parent -> child, the two root layouts are the only declarations
  // site-wide, and Phase 6's FIND-02 flips it in exactly those two places
  // (Pitfall 5).
  for (const key of ["", "cv"]) {
    const html = routes.get(key)!;
    assert.match(
      html,
      /name="robots"\s+content="[^"]*noindex[^"]*"/i,
      `route "${key || "/"}" must carry an inherited noindex`,
    );
  }
});

test("/cv's production HTML carries its own title and its own canonical", async () => {
  const routes = await getRoutes();
  const cv = routes.get("cv")!;

  // Tolerate the literal em dash and both entity forms rather than assuming
  // which React emits.
  assert.match(cv, /<title>CV\s*(?:—|&#x2014;|&mdash;)\s*Guillem Gelabert<\/title>/);
  assert.ok(cv.includes('rel="canonical"'), "/cv must emit a rel=\"canonical\" link");
  const match = cv.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(match, "the canonical link tag must carry an href");
  assert.equal(new URL(match![1]).pathname, "/cv");
});

test("the featured slot ships its interim copy in production", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // This assertion belongs HERE and not in Playwright: the moment Phase 4
  // creates content/the-chart-therefore-changes.mdx with draft: true,
  // findBySlug starts returning an entry in dev only, so a Playwright copy
  // assertion would go red during Phase 4 authoring with no Phase 3 file
  // changed (Pitfall 2).
  //
  // Forward note: when Phase 4 publishes the case study, this test is
  // expected to be updated to assert the published state instead — that is
  // a real change in what ships, not a flaky test.
  assert.ok(root.includes("The case study is being written."));
  assert.ok(
    root.includes(
      "On the Mallorca piece: what was expected, what the data showed, and how the visual form changed in response.",
    ),
  );
});

test("the interim featured headline carries no link", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // There is nowhere honest for the interim headline to point — the case
  // study does not exist and /writing is at n=0 — so a link would be a
  // circular dead end into an empty index. Extract the h3.text-heading
  // block specifically, not a whole-document anchor count, which would
  // fail on the nav.
  const match = root.match(/<h3[^>]*class="[^"]*text-heading[^"]*"[^>]*>[\s\S]*?<\/h3>/);
  assert.ok(match, "the featured h3.text-heading block must be present");
  assert.doesNotMatch(match![0], /<a/, "the interim featured headline must not contain a link");
});

test("the backlog and contact stubs ship their real, deliberately typeset copy — no marker word leaks into production", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // D-02 requires placeholder content to be deliberately typeset because
  // the site is on a live URL during a job hunt. Pitfall 7's warning sign
  // is exactly one of the banned words below reaching rendered output.
  for (const stub of [
    "Nothing listed here yet.",
    "The current work is being written up.",
    "No contact details here yet.",
    "Email, GitHub and LinkedIn are being added.",
  ]) {
    assert.ok(root.includes(stub), `/ must render the stub copy "${stub}"`);
  }

  for (const banned of ["TODO", "Coming soon", "Under construction", "Lorem"]) {
    assert.doesNotMatch(
      root,
      new RegExp(banned, "i"),
      `/ must not render the marker word "${banned}"`,
    );
  }
});

test("the private repository stays private in production", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // D-06: the ib-gdp-evolution GitHub repository is private and must never
  // be linked to as source. Both work-list entries link to their own
  // independently-hosted domain, same tab, no target="_blank".
  assert.ok(root.includes("https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing"));
  assert.ok(root.includes("https://watchpeopledie.live"));
  assert.doesNotMatch(root, /href="[^"]*github\.com[^"]*"/i);
  assert.equal(root.includes("ib-gdp-evolution"), false);
  assert.doesNotMatch(root, /target="_blank"/);
});

test("launch gate: the featured slot, the backlog stub and the contact stub are all still interim", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // If the featured slot, the backlog stub, the contact stub or /cv is
  // still in its interim state when Phase 6 goes to flip the robots flag,
  // Phase 6 is blocked. This test passing today is the record that all
  // four are interim (the /cv route's own interim body is asserted by
  // tests/cv.spec.ts); when Phases 4, 5 and 6 fill them, THIS test is the
  // thing that must be updated, which is where the gate gets noticed
  // rather than forgotten.
  assert.ok(root.includes("The case study is being written."));
  assert.ok(root.includes("Nothing listed here yet."));
  assert.ok(root.includes("No contact details here yet."));
});

// Forward note for Phase 6 (FIND-02): when sitemap.ts is added, it must call
// publishedFor() from lib/content.ts rather than re-deriving the draft rule
// from front-matter directly. This file is otherwise the only place that
// rule is asserted; stating the draft predicate a second, independent way
// in sitemap.ts would let the two silently drift apart.
