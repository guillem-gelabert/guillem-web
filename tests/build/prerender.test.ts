import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { POSITIONING_PLACEHOLDER } from "../../lib/work.ts";
import { formatPostDate, indexPath, notFoundPath, postPath, UI } from "../../lib/locales.ts";
// PROF-04: the established (not user-supplied) GitHub profile fact — see
// lib/contact.ts's own comment for why it is never gated by the launch gate.
// Imported here (not retyped) so the private-repo test and the launch-gate
// test below can assert against it by equality, the same technique
// POSITIONING_PLACEHOLDER already uses.
// EMAIL: [USER-SUPPLIED], launch gate G4, null is the shipped state.
import { EMAIL, GITHUB } from "../../lib/contact.ts";
// EXPERIENCE/PORTRAIT: [USER-SUPPLIED], launch gates G3/G6, empty/null is
// the shipped state. CV_STUB_BODY: the copy /cv already ships while
// EXPERIENCE is empty (not user-supplied — established stub text).
import { CV_STUB_BODY, EXPERIENCE, PORTRAIT } from "../../lib/cv.ts";
// FIND-01 (plan 06-07): the (en) layout's own default description, read
// from source rather than retyped, so the "nothing falls back to it" test
// below cannot silently drift from the real value.
import { SITE_DESCRIPTION, SITE_URL } from "../../lib/site.ts";
// FIND-01/FIND-02: the sitemap test below binds to lib/content.ts's real
// selection rule rather than a second, driftable statement of it — the
// forward note this file used to carry. It binds to selectForLocale() +
// assertFrontmatter(), NOT the literal publishedFor(): publishedFor() =
// selectForLocale(await allPosts(), lang), and allPosts() loads every post
// via loadPostModule's import(`@/content/${slug}.mdx`) — a bundler-only
// alias specifier that tests/unit/proxy-slugs.test.ts's own header comment
// already documents as ERR_MODULE_NOT_FOUND under plain `node --test`
// (confirmed here too, before this substitution). selectForLocale is the
// exact, unmodified selection algorithm publishedFor() delegates to; this
// file supplies it with entries read from the same content/ files' real
// front-matter, validated through the real assertFrontmatter() — the same
// substitution proxy-slugs.test.ts already made, not a weaker one.
import { assertFrontmatter, LOCALES, selectForLocale } from "../../lib/content.ts";
import type { Locale, PostEntry, PostFrontmatter } from "../../lib/content.ts";
// BACK-02 (Phase 5, Plan 04): the source-binding technique HOME-01's gate
// uses for POSITIONING_PLACEHOLDER, applied to lib/backlog.tsx. That
// module is .tsx, and node --test cannot import a .tsx file
// (ERR_UNKNOWN_FILE_EXTENSION — 05-RESEARCH.md Q1 §A), so this imports the
// shared source-reader instead of the module itself.
import { LAST_TOUCHED as BACKLOG_LAST_TOUCHED, backlogSource } from "../unit/backlog-source.ts";

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
//
// `rm -rf .next && npm run build` before `npm run test:build` is
// load-bearing, not hygiene: `next start` writes on-demand-rendered
// dynamic responses (e.g. a curled 404) into .next/server/app/, and
// walkHtmlRoutes below picks up whatever is on disk, drafts included.
// `npm run test:all` already sequences this correctly.

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
//
// content/die-darstellung-aendert-sich.mdx (the German case study) is
// deliberately NOT in either array below: Plan 04 shipped it with
// draft: false (the "DRAFT BRANCH TAKEN" decision recorded in
// 04-04-SUMMARY.md), so it is a published entry, not a draft — it IS
// expected to prerender and its title IS expected to appear in build
// output. That expectation is asserted positively by the
// "both /writing and /texte render one real published entry" test below
// and by the I18N-01 test at the end of this file, not by exclusion here.
// Had Plan 04 instead taken the draft: true escape hatch, this file's own
// forked history would have required adding "texte/die-darstellung-aendert-sich"
// and its title to these two arrays instead.
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

test("both /writing and /texte render one real published entry, not their empty state", async () => {
  const routes = await getRoutes();
  const writing = routes.get("writing");
  const texte = routes.get("texte");
  assert.ok(writing, "route \"writing\" must exist in the production build");
  assert.ok(texte, "route \"texte\" must exist in the production build");

  // /writing: Plan 03 published content/the-chart-therefore-changes.mdx
  // with draft: false, so the English index left n=0 first.
  assert.ok(writing!.includes("The Chart Therefore Changes"));
  assert.equal(writing!.includes("Nothing published here yet."), false);
  assert.equal(writing!.includes("The first piece is being written."), false);

  // /texte: Plan 04 shipped content/die-darstellung-aendert-sich.mdx with
  // draft: false too — see the DRAFT_ROUTE_KEYS/DRAFT_TITLES comment above
  // for the recorded decision. Had Plan 04 instead taken the draft: true
  // escape hatch, this half would stay asserting the empty state exactly
  // as it did before this test was rewritten — an empty German index would
  // still be the correct and honest production state under that branch,
  // not a bug.
  assert.ok(texte!.includes("Die Darstellung ändert sich"));
  assert.equal(texte!.includes("Hier ist noch nichts veröffentlicht."), false);
  assert.equal(texte!.includes("Der erste Text entsteht gerade."), false);
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

/**
 * FLIP INVERSION POINTS (Phase 6's FIND-02) — named by test title, not line
 * number, because line numbers move as this file grows. This phase does
 * NOT perform the flip (06-VALIDATION.md § USER DECISIONS, item 2 — the
 * copy gate stays blocking); it is the user's to make after their own
 * review, gated by tests/unit/launch-gate.test.ts's biconditional.
 * Recorded here so whoever performs it later knows exactly what changes
 * and what does not:
 *
 * - "robots noindex survived the two-root-layout split — present on both
 *   writing and texte" (the test directly below): BOTH assertions invert
 *   with the flip, in the same commit, and the test is renamed in that
 *   same commit. A test named "noindex survived" that asserts the
 *   opposite is worse than no test.
 * - "robots noindex reaches all three (en) surfaces — / and /cv inherit
 *   it, /type declares its own permanent one": the "" and "cv" rows
 *   invert; the "type" row does NOT — /type declares its own permanent
 *   noindex (Phase 1 D-05) that the flip must never touch.
 * - "the global 404 is one valid document with a non-empty title
 *   (CR-01/WR-01)" (its noindex assertion, and the two reserved-404-route
 *   assertions it was extended with in plan 06-09): NONE of these invert.
 *   Next injects noindex for any status >= 400, including a proxy-set one
 *   (CR-01, measured), so the global 404 and both reserved rewrite targets
 *   stay unindexed after the flip with no extra code.
 *
 * The flip itself is a two-file edit (app/(en)/layout.tsx,
 * app/(de)/layout.tsx) gated by tests/unit/launch-gate.test.ts's
 * biconditional — not this file's concern, and not this phase's act.
 */
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

  // Extended, not duplicated (plan 06-09 Task 3): the same measured
  // behaviour — Next injects noindex for any status >= 400, including a
  // proxy-set one (CR-01) — makes both reserved 404 routes (plan 06-01's
  // proxy rewrite targets) safe after the eventual FIND-02 flip with no
  // extra code. This does NOT invert when that flip lands; see the comment
  // block above "robots noindex survived the two-root-layout split" below.
  for (const [locale, routeKey] of [
    ["en", notFoundPath("en").slice(1)],
    ["de", notFoundPath("de").slice(1)],
  ] as const) {
    const html = routes.get(routeKey);
    assert.ok(html, `the reserved 404 route "${routeKey}" (${locale}) must be prerendered`);
    assert.equal(
      (html!.match(/name="robots"\s+content="[^"]*noindex[^"]*"/gi) ?? []).length,
      1,
      `the reserved 404 route "${routeKey}" (${locale}) must carry exactly one noindex robots meta`,
    );
  }
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

// --- Phase 3/4 production-tier assertions ----------------------------------
//
// Every *.spec.ts in this repo runs against `npm run dev`, where
// showDrafts() is always true, so a Playwright copy assertion cannot prove
// what a production build actually ships. Phase 4 published
// content/the-chart-therefore-changes.mdx with draft: false, so in a
// production build publishedFor("en") now contains it and
// findBySlug(await publishedFor("en"), CASE_STUDY_SLUG) resolves — the
// featured slot ships its PUBLISHED state. Playwright already proved the
// slot's structure is state-agnostic (tests/landing.spec.ts test (p)); the
// tests below prove what actually ships: the published title and
// standfirst, the headline as the slot's only link, in real prerendered
// HTML.

// CASE-01/HOME-02: read once here and pointed at the content file that owns
// them, rather than retyped inline where they could silently drift —
// content/the-chart-therefore-changes.mdx front-matter's `title` and
// `standfirst` fields, verbatim.
const CASE_STUDY_TITLE = "The Chart Therefore Changes";
const CASE_STUDY_STANDFIRST =
  "I began this project expecting to confirm that tourism had stopped paying off for the Balearics. The data forced a different kind of honesty: not a different verdict, but a different chart.";

// CASE-01: the six rehype-slug ids in CASE-02's locked order — the same
// list tests/case-study.spec.ts's EN_SECTION_IDS asserts in the dev-tier
// DOM, restated here so the production build is checked independently.
const CASE_STUDY_SECTION_IDS = [
  "the-question",
  "what-i-expected",
  "what-the-data-showed",
  "where-the-chart-changed",
  "what-shipped",
  "methodology",
];

// D-07: the three committed figures, in document order — the third is the
// wide one, but this test only needs to prove all three shipped.
const CASE_STUDY_FIGURE_SRCS = [
  "/case-study/f1-constant-dollars.png",
  "/case-study/f2-eu-average.png",
  "/case-study/f3-arrivals-diverge.png",
];

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

test("/'s meta description is bound to POSITIONING_PLACEHOLDER by equality, not a hardcoded literal — /cv and /type now carry their own", async () => {
  const routes = await getRoutes();

  // Pitfall 6: the failure this prevents is the user writing the real
  // positioning sentence into the rendered <p> while / 's meta description
  // still holds the old placeholder value — which is what Slack, LinkedIn
  // and eventually Google quote once Phase 6 flips FIND-02. Comparing
  // against the imported constant rather than a literal means this keeps
  // passing when the real sentence lands and fails the moment the two drift.
  //
  // NARROWED 2026-09-01 (Phase 6, Plan 07/09): this gate used to sweep
  // ["", "cv", "type"] — code review WR-06's fix for app/(en)/layout.tsx
  // hardcoding the literal "Developer." as the group default, which made
  // /cv and /type (neither able to declare its own description at the
  // time) serve the same sentence from a second, undocumented source. Plan
  // 06-07 superseded that fix rather than merely preserving it: /cv and
  // /type each now declare their own real description (FIND-01), so the
  // group default they used to fall back to is no longer what they serve.
  // The loop narrows back to what the constant actually has exactly one
  // rendered consumer and one metadata consumer for — / alone — and the
  // assertions below lock in what replaced the old three-route sweep.
  for (const key of [""]) {
    const html = routes.get(key);
    assert.ok(html, `route "${key || "/"}" must exist in the production build`);
    const match = html!.match(/<meta name="description" content="([^"]*)"/);
    assert.ok(match, `route "${key || "/"}" must carry a meta description`);
    assert.equal(
      match![1],
      POSITIONING_PLACEHOLDER,
      `route "${key || "/"}" must serve POSITIONING_PLACEHOLDER, not a second copy of its value`,
    );
  }

  // FIND-01 (plan 06-07): /cv and /type each carry their own non-empty
  // description now, neither equal to POSITIONING_PLACEHOLDER — this is
  // the replacement guarantee for the two routes the loop above dropped.
  const ownDescriptions = new Map<string, string>();
  for (const key of ["cv", "type"]) {
    const html = routes.get(key);
    assert.ok(html, `route "/${key}" must exist in the production build`);
    const match = html!.match(/<meta name="description" content="([^"]*)"/);
    assert.ok(match, `route "/${key}" must carry a meta description`);
    assert.notEqual(match![1], "", `route "/${key}" must carry a non-empty description`);
    assert.notEqual(
      match![1],
      POSITIONING_PLACEHOLDER,
      `route "/${key}" must not serve POSITIONING_PLACEHOLDER — it now has its own description`,
    );
    ownDescriptions.set(key, match![1]);
  }

  // No (en) route serves the (en) layout's own default description
  // (lib/site.ts's SITE_DESCRIPTION.en, the group fallback lib/metadata.ts's
  // rootMetadata() supplies) — mirrors the German shape the very next test
  // below already asserts for "Entwickler.". Every (en) route declares its
  // own description today, so the fallback is a value nothing reaches; this
  // is a positive statement of that fact, not an inference from its absence
  // being merely unobserved.
  for (const [routeKey, html] of routes) {
    assert.equal(
      html.includes(`<meta name="description" content="${SITE_DESCRIPTION.en}"`),
      false,
      `route "${routeKey || "/"}" fell back to the (en) layout's default description`,
    );
  }
});

test("the German layout's default description reaches no shipped route (WR-06)", async () => {
  const routes = await getRoutes();

  // app/(de)/layout.tsx deliberately does NOT track POSITIONING_PLACEHOLDER
  // — that constant is HOME-01's English sentence and the landing view is
  // English-only in v1, so a lang="de" document must not inherit it. The
  // guarantee that replaces "tracks the constant" is this one: every (de)
  // route declares its own description, so the layout default is a fallback
  // nothing reaches. If a German route ever loses its own description this
  // fails, rather than silently serving the layout's line.
  const texte = routes.get("texte");
  assert.ok(texte, 'route "texte" must exist in the production build');
  const match = texte!.match(/<meta name="description" content="([^"]*)"/);
  assert.ok(match, "/texte must carry a meta description");
  assert.equal(match![1], UI.de.indexDescription);

  for (const [routeKey, html] of routes) {
    assert.doesNotMatch(
      html,
      /<meta name="description" content="Entwickler\."/,
      `route "${routeKey || "/"}" fell back to the (de) layout's default description`,
    );
  }
});

test("robots noindex reaches all three (en) surfaces — / and /cv inherit it, /type declares its own permanent one", async () => {
  const routes = await getRoutes();

  // NARROWED 2026-09-01 (Phase 6, Plan 07/09): retitled — "neither route
  // restates robots" stopped being true the moment plan 06-07 de-cliented
  // /type and gave it its own metadata export. Two claims now, not one:
  //
  // 1. / and /cv declare no `robots` in their own source: Next merges
  //    metadata parent -> child, the two root layouts are the only
  //    declarations backing them, and Phase 6's eventual FIND-02 flip
  //    changes exactly those two files — which is what these two routes'
  //    noindex would invert to if that flip landed (it has not).
  for (const key of ["", "cv"]) {
    const html = routes.get(key)!;
    assert.match(
      html,
      /name="robots"\s+content="[^"]*noindex[^"]*"/i,
      `route "${key || "/"}" must carry an inherited noindex`,
    );
  }

  // 2. /type declares its OWN noindex directly (Phase 1 D-05, Pitfall 6) —
  //    a de-clienting fix, not an inheritance. This is not a FIND-02
  //    inversion target: the eventual flip must NOT touch /type, and this
  //    assertion is what would catch a flip that mistakenly did.
  const typeHtml = routes.get("type")!;
  assert.match(
    typeHtml,
    /name="robots"\s+content="[^"]*noindex[^"]*"/i,
    'route "/type" must carry its own permanent noindex',
  );
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

test("the featured slot ships the published case study's own title and standfirst in production (HOME-02)", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // This assertion belongs HERE and not in Playwright: Playwright runs
  // against `npm run dev`, where showDrafts() is always true, and could not
  // have distinguished the slot's interim state from its published one
  // during Phase 4 authoring (Pitfall 2). Now that
  // content/the-chart-therefore-changes.mdx ships draft: false,
  // findBySlug(await publishedFor("en"), CASE_STUDY_SLUG) resolves in a
  // production build too — no code in lib/work.ts or
  // components/landing/featured-slot.tsx changed to make this happen, the
  // slot was already written to branch on it.
  assert.ok(root.includes(CASE_STUDY_TITLE), "the featured slot must render the post's own title");
  assert.ok(
    root.includes(CASE_STUDY_STANDFIRST),
    "the featured slot must render the post's own standfirst — the entry's annotation copy IS the standfirst, so it links into the case study instead of duplicating it (Roadmap SC4)",
  );
  // Checked via a substring of the retired interim headline rather than the
  // full sentence verbatim — "case study is being written" is a fragment of
  // that headline, so absence of the shorter fragment is a STRICTLY
  // STRONGER guarantee that the full interim sentence is gone (and keeps
  // this file from re-quoting a sentence that no longer ships, now that
  // components/landing/featured-slot.tsx's interim branch is dead code in
  // production).
  assert.equal(
    root.includes("case study is being written"),
    false,
    "the interim headline must not survive publication",
  );
  assert.equal(
    root.includes(
      "On the Mallorca piece: what was expected, what the data showed, and how the visual form changed in response.",
    ),
    false,
    "the interim body sentence must not survive publication",
  );
});

test("the featured headline is a link to the case study and the slot's only link (CASE-03)", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // Extract the h3.text-heading block specifically, not a whole-document
  // anchor count, which would be defeated by the nav — same technique the
  // interim version of this test used.
  const match = root.match(/<h3[^>]*class="[^"]*text-heading[^"]*"[^>]*>[\s\S]*?<\/h3>/);
  assert.ok(match, "the featured h3.text-heading block must be present");

  const links = match![0].match(/<a\b[^>]*>/g) ?? [];
  assert.equal(
    links.length,
    1,
    'the featured headline must contain exactly one link — a second would be the "Read the case study" affordance the contract exists to prevent',
  );
  assert.ok(
    links[0].includes('href="/writing/the-chart-therefore-changes"'),
    'the featured headline\'s href must be postPath("en", CASE_STUDY_SLUG)',
  );
});

test("both closed stubs' deleted copy — contact and backlog alike — is absent from production, and no marker word leaks in", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // NARROWED 2026-09-01 (Phase 6, Plan 04/09): the contact stub closed.
  // components/landing/section-stub.tsx is deleted (D-13's precedent
  // applied a second time) and app/(en)/page.tsx's #contact section now
  // renders ContactBlock's real channels. Both of the contact stub's
  // strings move from a "must render" assertion (this test's prior form)
  // into the "must NOT render" loop below, alongside the backlog stub's —
  // D-13's own reasoning: the difference between "not rendered" and "not
  // present" is exactly the dead-code branch a later reader would
  // otherwise mistake for a supported state. This inversion proves
  // absence, not merely that dev never showed it (dev always shows
  // drafts, but neither stub's copy was ever draft-gated — both were
  // simply deleted from the render tree).
  for (const removedStub of [
    "No contact details here yet.",
    "Email, GitHub and LinkedIn are being added.",
    "Nothing listed here yet.",
    "The current work is being written up.",
  ]) {
    assert.equal(
      root.includes(removedStub),
      false,
      `/ must NOT render the deleted stub copy "${removedStub}"`,
    );
  }

  for (const banned of ["TODO", "Coming soon", "Under construction", "Lorem"]) {
    assert.doesNotMatch(
      root,
      new RegExp(banned, "i"),
      `/ must not render the marker word "${banned}"`,
    );
  }
});

/**
 * D-10: the prerendered markup is clean and sliceable — slice from the
 * opening <section id="backlog"> tag to the next </section>, asserting
 * both indices are found so a shifted section boundary fails loud rather
 * than silently scoping to the wrong (or zero-length) substring.
 */
function backlogSectionOf(root: string): string {
  const start = root.indexOf('<section id="backlog"');
  assert.notEqual(start, -1, 'root HTML must contain <section id="backlog">');
  const end = root.indexOf("</section>", start);
  assert.notEqual(end, -1, "the backlog <section> must close with </section>");
  return root.slice(start, end);
}

test("the private repository stays private in production — the blanket github.com ban is narrowed to the profile root (PROF-04)", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // D-06: the ib-gdp-evolution GitHub repository is private and must never
  // be linked to as source. Both work-list entries link to their own
  // independently-hosted domain, same tab, no target="_blank".
  assert.ok(root.includes("https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing"));
  assert.ok(root.includes("https://watchpeopledie.live"));

  // NARROWED 2026-09-01 (Phase 6, Plan 04/09): PROF-04 deliberately breaks
  // the blanket github.com ban — the #contact section now renders the real
  // GitHub profile link (lib/contact.ts's GITHUB, an established fact, not
  // user-supplied). The ban is narrowed, not deleted: every github.com href
  // on / must equal the profile root exactly, with no repository path
  // segment beyond it — which is what would leak a private repo's name via
  // a link rather than via the literal string check below.
  const githubHrefs = [...root.matchAll(/href="([^"]*github\.com[^"]*)"/gi)].map((m) => m[1]);
  assert.ok(githubHrefs.length > 0, "/ must render at least one github.com link (PROF-04)");
  for (const href of githubHrefs) {
    assert.equal(
      href,
      GITHUB,
      `every github.com href on / must be the profile root, not a repository path — found "${href}"`,
    );
  }

  // Untouched by the narrowing above — both still hold and both are the
  // point of the test.
  assert.equal(root.includes("ib-gdp-evolution"), false);
  assert.doesNotMatch(root, /target="_blank"/);
});

test("launch gate: /cv is still interim and three copy items are still unreviewed — the contact stub closed on 2026-09-01", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // If /cv, or any of the three unreviewed copy items below, is still open
  // when Phase 6 goes to flip the robots flag, Phase 6 is blocked. This
  // test passing today is the record of which surface is still interim
  // (/cv's own interim body is asserted by tests/cv.spec.ts); when the
  // user fills it, THIS test is the thing that must be updated, which is
  // where the gate gets noticed rather than forgotten.
  //
  // NARROWED 2026-08-31 (Phase 4, Plan 5): the featured slot closed. It was
  // the third interim surface this gate covered — content/the-chart-therefore-changes.mdx
  // published with draft: false, /writing left n=0, and the slot now ships
  // its real title/standfirst with a real link (asserted by the two tests
  // above). Removing the interim headline's assertion from this
  // assertion IS the gate mechanism working: an interim state ended, and
  // the test that proved it was interim was updated rather than silently
  // left passing on a state that no longer exists.
  //
  // NARROWED 2026-08-31 (Phase 5, Plan 04): the backlog leg closed too.
  // lib/backlog.tsx ships three real items and a section date;
  // app/(en)/page.tsx no longer mounts SectionStub at #backlog; the two
  // backlog stub strings are asserted ABSENT from production HTML by the
  // stub-copy test above, not merely unrendered in dev. Removing the
  // interim assertion from THIS test IS the gate mechanism working, same
  // as Phase 4's narrowing above.
  //
  // NARROWED 2026-09-01 (Phase 6, Plan 04/09): the contact stub closed too.
  // components/contact-block.tsx renders lib/contact.ts's real channels;
  // the interim stub component is deleted (D-13's precedent applied a
  // third time). "No contact details here yet." is removed from this
  // assertion — that string is asserted ABSENT (not present) by the
  // stub-copy test above, which is the gate mechanism working exactly as
  // it did for the two prior narrowings. In its place, a POSITIVE
  // assertion: the contact leg actually closed, not merely stopped being
  // asserted, is proven by / rendering the real GitHub profile URL below —
  // the evidence, not an inference from an assertion's own absence.
  //
  // One interim surface remains — /cv (tests/cv.spec.ts, and this file's
  // G3/G6 tests below). THREE copy items remain unreviewed and all three
  // still block Phase 6's FIND-02 robots flip:
  //   1. HOME-01 — the positioning sentence still ships as
  //      POSITIONING_PLACEHOLDER in lib/work.ts (asserted elsewhere in
  //      this file).
  //   2. The user's editorial pass over both case studies has not
  //      happened (carried from Phase 4) — no automated test can assert
  //      "a human read this"; the record lives in
  //      .planning/phases/05-backlog/launch-gate.md.
  //   3. The backlog item copy is drafted from repository evidence and
  //      unreviewed by the author — asserted directly below via the
  //      COPY_REVIEWED source-scrape, D-14's second tripwire channel (the
  //      first is the same constant, independently re-asserted at the
  //      repo tier by tests/unit/backlog.test.ts). WHEN THE ASSERTION
  //      BELOW FAILS: the author's editorial pass has happened — narrow
  //      this gate again, do not delete it.
  assert.ok(
    root.includes(GITHUB),
    "/ must render the real GitHub profile URL — the evidence the contact leg actually closed",
  );
  assert.match(
    backlogSource,
    /export const COPY_REVIEWED = false/,
    "lib/backlog.tsx's COPY_REVIEWED must still read false — if this fails, the author's " +
      "editorial pass over the backlog copy has happened; narrow this gate, do not delete it",
  );
});

test("BACK-01/BACK-02: the backlog section renders three real items and a source-bound date in production", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;
  const section = backlogSectionOf(root);

  // BACK-01: exactly three rows, each with its own heading, all three item
  // names as shipped in lib/backlog.tsx (D-04's editorial order is proven
  // by Playwright's (v); this tier only needs presence).
  assert.equal((section.match(/<li\b/g) ?? []).length, 3, "the backlog must render exactly three <li>");
  assert.equal((section.match(/<h3\b/g) ?? []).length, 3, "the backlog must render exactly three <h3>");
  for (const name of [
    "A data portrait of the Swiss commodity trade",
    "The house names of Zürich",
    "The Pudding, read as a corpus",
  ]) {
    assert.ok(section.includes(name), `the backlog must render the item name "${name}"`);
  }

  // BACK-02, the date by equality against source (the POSITIONING_PLACEHOLDER
  // technique applied to a .tsx module via the shared source-reader) —
  // never a retyped literal, so this test cannot drift from lib/backlog.tsx.
  //
  // Pitfall 2, measured in this repo's shipped build: React 19.2.8 emits
  // the JSX prop name verbatim in the raw prerendered file — dateTime,
  // camelCase — not the lowercase "datetime" a browser produces after HTML
  // parsing. An `includes('datetime="...")` check here would silently
  // never match; match dateTime (camelCase) instead.
  const dateMatch = section.match(/dateTime="(\d{4}-\d{2}-\d{2})"/);
  assert.ok(
    dateMatch,
    'the backlog section must carry a <time dateTime="YYYY-MM-DD"> (camelCase — Pitfall 2)',
  );
  assert.equal(
    dateMatch![1],
    BACKLOG_LAST_TOUCHED,
    "the rendered date must equal lib/backlog.tsx's own LAST_TOUCHED by equality, not a retyped copy",
  );

  // The rendered date TEXT proves formatPostDate is the one and only
  // formatter — no second one was written for this section.
  assert.ok(
    section.includes(formatPostDate(BACKLOG_LAST_TOUCHED, "en")),
    'the backlog date line must render formatPostDate(LAST_TOUCHED, "en")\'s output',
  );

  // The copy rule: work.test.ts:56-58's banned-tool-token list, mirrored
  // here (not imported — this file does not reach into lib/work.ts) and
  // applied to the section's TEXT ONLY, tags stripped first, so a class
  // name or attribute cannot satisfy or defeat the check.
  const sectionText = section.replace(/<[^>]+>/g, " ");
  const bannedTokens = ["React", "Next", "D3", "TypeScript", "JavaScript", "Svelte", "WebGL", "Python"];
  const bannedPhrases = ["built with", "powered by"];
  for (const token of bannedTokens) {
    assert.doesNotMatch(
      sectionText,
      new RegExp(`\\b${token}\\b`, "iu"),
      `the backlog must not name the tool "${token}"`,
    );
  }
  for (const phrase of bannedPhrases) {
    assert.equal(
      sectionText.toLowerCase().includes(phrase),
      false,
      `the backlog must not contain the phrase "${phrase}"`,
    );
  }

  // D-07: none of the three items has a public artifact in v1 — zero
  // links in the backlog is a decision, not an oversight.
  assert.doesNotMatch(section, /<a\b/, "the backlog section must contain zero <a> elements in v1");
});

test("CASE-01: /writing/the-chart-therefore-changes prerenders with its six section marks and three figures", async () => {
  const routes = await getRoutes();
  const post = routes.get("writing/the-chart-therefore-changes");
  assert.ok(post, 'route "writing/the-chart-therefore-changes" must be prerendered');

  for (const id of CASE_STUDY_SECTION_IDS) {
    assert.ok(post!.includes(`id="${id}"`), `the post must render an element with id="${id}"`);
  }

  for (const src of CASE_STUDY_FIGURE_SRCS) {
    assert.ok(post!.includes(`src="${src}"`), `the post must render a figure with src="${src}"`);
  }
});

test("I18N-01: the German twin also prerendered and the English post carries a matching hreflang alternate", async () => {
  const routes = await getRoutes();
  const enPost = routes.get("writing/the-chart-therefore-changes")!;

  // Plan 04 shipped the German case study with draft: false (the "DRAFT
  // BRANCH TAKEN" decision in 04-04-SUMMARY.md), so this test asserts the
  // published branch on both sides. Had Plan 04 taken draft: true instead,
  // the correct assertion would invert entirely: the German route absent
  // from `routes`, and no "de" alternate on the English post's <head> —
  // both branches are correct behaviour, this asserts whichever one
  // shipped.
  const dePost = routes.get("texte/die-darstellung-aendert-sich");
  assert.ok(dePost, 'route "texte/die-darstellung-aendert-sich" must be prerendered');

  assert.match(
    enPost,
    /hreflang="de"/i,
    "the English post must declare a German hreflang alternate",
  );
  assert.ok(
    enPost.includes('href="/texte/die-darstellung-aendert-sich"'),
    "the English post's alternates must include the German twin's href",
  );
});

// --- Phase 6 production-tier assertions (FIND-01/FIND-02) ------------------
//
// This section replaces the file's old forward note ("when sitemap.ts is
// added, it must call publishedFor()..."): app/sitemap.ts now exists and
// does call publishedFor() (plan 06-05). The test below is what enforces
// that binding going forward, rather than trusting the source comment to
// stay true on its own.
//
// sitemap.xml and robots.txt are not *.html, so walkHtmlRoutes/getRoutes
// above never see them — their built bodies are read directly from
// .next/server/app/{sitemap.xml,robots.txt}.body, the same flattened
// on-disk shape next start serves from.

async function readBuiltBody(filename: string): Promise<string> {
  try {
    return await readFile(path.join(APP_DIR, filename), "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(NO_BUILD_MESSAGE);
    }
    throw err;
  }
}

function sitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

// A minimal, single-line-value front-matter reader — deliberately not a
// YAML parser, mirroring tests/unit/proxy-slugs.test.ts's own (good enough
// for this repo's actual content/ files, and every value produced is passed
// through the real assertFrontmatter() below).
function parseFrontmatterBlock(raw: string): Record<string, string | boolean> {
  const fence = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fence) {
    throw new Error("prerender.test.ts: no front-matter fence found");
  }
  const result: Record<string, string | boolean> = {};
  for (const line of fence[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z]+):\s*(.+)$/);
    if (!field) continue;
    const value = field[2].trim().replace(/^["']|["']$/g, "");
    result[field[1]] = value === "true" ? true : value === "false" ? false : value;
  }
  return result;
}

function postEntriesOnDisk(): PostEntry[] {
  const contentDir = path.join(process.cwd(), "content");
  return readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name))
    .map((entry) => {
      const slug = entry.name.replace(/\.mdx?$/, "");
      const raw = readFileSync(path.join(contentDir, entry.name), "utf8");
      const fm = parseFrontmatterBlock(raw);
      assertFrontmatter(fm, entry.name);
      return { slug, frontmatter: fm as PostFrontmatter };
    });
}

test("the sitemap's post entries equal lib/content.ts's real published selection for both locales, compared as sets", async () => {
  const xml = await readBuiltBody("sitemap.xml.body");
  const locs = sitemapLocs(xml);

  const staticUrls = new Set([
    SITE_URL.origin,
    new URL("/cv", SITE_URL).toString(),
    new URL(indexPath("en"), SITE_URL).toString(),
    new URL(indexPath("de"), SITE_URL).toString(),
  ]);
  const actualPostUrls = new Set(locs.filter((loc) => !staticUrls.has(loc)));

  const entries = postEntriesOnDisk();
  const expectedPostUrls = new Set<string>();
  for (const locale of LOCALES as readonly Locale[]) {
    for (const post of selectForLocale(entries, locale)) {
      expectedPostUrls.add(new URL(postPath(locale, post.slug), SITE_URL).toString());
    }
  }

  // Set comparison, not a count: a count passes when one entry is swapped
  // for another. Report the differing URL(s) by name on failure.
  const missing = [...expectedPostUrls].filter((url) => !actualPostUrls.has(url));
  const extra = [...actualPostUrls].filter((url) => !expectedPostUrls.has(url));
  assert.deepEqual(
    { missing, extra },
    { missing: [], extra: [] },
    "the sitemap's post entries must equal the real published selection exactly",
  );
});

test("the sitemap carries the four static routes, excludes /type and both reserved 404 routes by constant reference, and every loc resolves to the canonical host", async () => {
  const xml = await readBuiltBody("sitemap.xml.body");
  const locs = sitemapLocs(xml);

  for (const expected of [
    SITE_URL.origin,
    new URL("/cv", SITE_URL).toString(),
    new URL(indexPath("en"), SITE_URL).toString(),
    new URL(indexPath("de"), SITE_URL).toString(),
  ]) {
    assert.ok(locs.includes(expected), `sitemap must include the static route "${expected}"`);
  }

  // /type is Phase 1 D-05's deliberately non-indexed specimen — never a
  // sitemap candidate in the first place (F8). Both reserved 404 routes
  // (CR-01's proxy rewrite targets, plan 06-01) are real prerendered pages
  // under the same [slug]-shaped paths a post could occupy, so they are
  // excluded by constant reference — notFoundPath() — rather than assumed
  // absent.
  for (const excludedUrl of [
    new URL("/type", SITE_URL).toString(),
    new URL(notFoundPath("en"), SITE_URL).toString(),
    new URL(notFoundPath("de"), SITE_URL).toString(),
  ]) {
    assert.equal(locs.includes(excludedUrl), false, `sitemap must NOT include "${excludedUrl}"`);
  }

  for (const loc of locs) {
    assert.equal(
      new URL(loc).host,
      SITE_URL.host,
      `sitemap loc "${loc}" must resolve to the canonical host ${SITE_URL.host}`,
    );
  }
});

test("robots.txt allows crawling, disallows /type, and points to an absolute sitemap URL on the canonical host", async () => {
  const body = await readBuiltBody("robots.txt.body");

  assert.match(body, /Allow:\s*\/\s*$/m, 'robots.txt must carry "Allow: /"');
  assert.match(body, /Disallow:\s*\/type\s*$/m, 'robots.txt must carry "Disallow: /type"');

  const sitemapLineMatch = body.match(/Sitemap:\s*(\S+)/);
  assert.ok(sitemapLineMatch, "robots.txt must carry a Sitemap: line");
  const sitemapUrl = new URL(sitemapLineMatch![1]);
  assert.equal(
    sitemapUrl.origin,
    SITE_URL.origin,
    "robots.txt's Sitemap: URL must share SITE_URL's origin — the sitemap.ts default's own origin decision",
  );
});

test("/'s canonical and the sitemap's site-root loc are the exact same spelling of one page (Pitfall 8)", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;
  const canonicalMatch = root.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonicalMatch, '/ must carry a rel="canonical" link');

  const xml = await readBuiltBody("sitemap.xml.body");
  const locs = sitemapLocs(xml);
  const siteRootLoc = locs.find((loc) => new URL(loc).pathname === "/");
  assert.ok(siteRootLoc, "the sitemap must carry a site-root entry");

  // This is the one assertion that binds two files together, and it must
  // be STRING-identical, not merely same-host: the whole failure mode
  // Pitfall 8 names is two spellings of one page (the bare origin vs. the
  // origin plus a trailing slash) — same-host would pass on both spellings
  // and prove nothing.
  assert.equal(
    canonicalMatch![1],
    siteRootLoc,
    "/'s canonical href and the sitemap's site-root loc must be the exact same string",
  );
});

// The six routes FIND-01's OG sweep covers — /type is deliberately excluded
// here (it is covered separately, below, only for hreflang) because it was
// never in this plan's OG-tag instruction. hasOwnOgImage records what is
// MEASURED against the real build, not assumed from the file layout — see
// the og:image test's own comment for why three of the six read false.
const OG_TARGET_ROUTES: readonly { key: string; locale: "en" | "de"; hasOwnOgImage: boolean }[] = [
  { key: "", locale: "en", hasOwnOgImage: true },
  { key: "cv", locale: "en", hasOwnOgImage: false },
  { key: "writing", locale: "en", hasOwnOgImage: false },
  { key: "texte", locale: "de", hasOwnOgImage: false },
  { key: "writing/the-chart-therefore-changes", locale: "en", hasOwnOgImage: true },
  { key: "texte/die-darstellung-aendert-sich", locale: "de", hasOwnOgImage: true },
] as const;

test("every one of the six discoverability routes carries og:title/description/url/type/site_name/locale, on the canonical host, with the right locale", async () => {
  const routes = await getRoutes();

  for (const { key, locale } of OG_TARGET_ROUTES) {
    const html = routes.get(key);
    assert.ok(html, `route "${key || "/"}" must exist in the production build`);

    for (const property of ["og:title", "og:description", "og:url", "og:type", "og:site_name", "og:locale"]) {
      assert.match(
        html!,
        new RegExp(`<meta property="${property}" content="[^"]*"`),
        `route "${key || "/"}" must carry ${property}`,
      );
    }

    const ogUrlMatch = html!.match(/<meta property="og:url" content="([^"]*)"/);
    assert.equal(
      new URL(ogUrlMatch![1]).host,
      SITE_URL.host,
      `route "${key || "/"}"'s og:url must resolve to ${SITE_URL.host}`,
    );

    const canonicalMatch = html!.match(/<link rel="canonical" href="([^"]+)"/);
    assert.ok(canonicalMatch, `route "${key || "/"}" must carry a rel="canonical" link`);
    assert.equal(
      new URL(canonicalMatch![1]).host,
      SITE_URL.host,
      `route "${key || "/"}"'s canonical must resolve to ${SITE_URL.host}`,
    );

    const ogLocaleMatch = html!.match(/<meta property="og:locale" content="([^"]*)"/);
    const expectedOgLocale = locale === "en" ? "en_GB" : "de_DE";
    assert.equal(
      ogLocaleMatch![1],
      expectedOgLocale,
      `route "${key || "/"}"'s og:locale must be ${expectedOgLocale}`,
    );
  }
});

test("og:image is parsed from the meta tag (never hardcoded) and resolves to a real build asset on every target route", async () => {
  const routes = await getRoutes();

  for (const { key, hasOwnOgImage } of OG_TARGET_ROUTES) {
    const html = routes.get(key)!;
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/);
    const twitterCardMatch = html.match(/<meta name="twitter:card" content="([^"]*)"/);
    assert.ok(twitterCardMatch, `route "${key || "/"}" must carry twitter:card`);

    // The file convention does NOT cascade. app/(en)/opengraph-image.png sits
    // beside app/(en)/layout.tsx, so it reaches app/(en)/page.tsx at that same
    // segment but not app/(en)/cv/page.tsx, app/(en)/writing/page.tsx or
    // app/(de)/texte/page.tsx one segment deeper — plan 06-09 measured zero
    // og:image tags on those, with twitter:card falling back to "summary".
    // (app/icon.png DOES cascade; opengraph-image does not.) Closed by giving
    // routeOpenGraph() in lib/metadata.ts an explicit `images` entry pointing
    // at a stable public path (/og/site-{locale}.png) rather than Next's
    // content-hashed convention output. Every route now carries a card, so
    // hasOwnOgImage no longer gates presence — it only distinguishes routes
    // whose image is a build artifact from those served from public/.

    assert.ok(ogImageMatch, `route "${key || "/"}" must carry og:image`);
    const ogImageUrl = new URL(ogImageMatch![1]);
    assert.equal(
      ogImageUrl.host,
      SITE_URL.host,
      `route "${key || "/"}"'s og:image must resolve to ${SITE_URL.host}`,
    );
    // A convention-produced image lands in the build output; one declared via
    // routeOpenGraph() is served from public/. Both must resolve to a real
    // file on disk — assert whichever applies rather than only the first.
    const builtAssetPath = path.join(APP_DIR, `${ogImageUrl.pathname}.body`);
    const publicAssetPath = path.join(process.cwd(), "public", ogImageUrl.pathname);
    assert.ok(
      existsSync(builtAssetPath) || existsSync(publicAssetPath),
      `route "${key || "/"}"'s og:image "${ogImageUrl.pathname}" must exist on disk, either as a build artifact or under public/`,
    );
    // twitter:card arrives "for free" from the opengraph-image file
    // convention, not a hand-declaration — this is the note the plan's own
    // action asked for.
    assert.equal(
      twitterCardMatch![1],
      "summary_large_image",
      `route "${key || "/"}" must carry twitter:card="summary_large_image"`,
    );
  }

  // The per-post override is live, not merely inherited: the English
  // post's og:image differs from /'s site-wide card and from the German
  // post's own — proof the [slug]/opengraph-image.tsx route actually fires
  // per post rather than falling back silently.
  const ogImageOf = (key: string) =>
    routes.get(key)!.match(/<meta property="og:image" content="([^"]*)"/)![1];
  const rootImage = ogImageOf("");
  const enPostImage = ogImageOf("writing/the-chart-therefore-changes");
  const dePostImage = ogImageOf("texte/die-darstellung-aendert-sich");
  assert.notEqual(enPostImage, rootImage, "the English post's og:image must differ from /'s");
  assert.notEqual(enPostImage, dePostImage, "the English post's og:image must differ from the German post's");
});

test('exactly one rel="icon" ships on / and the Next scaffold favicon.ico is gone (HOME-05, Pitfall 9)', async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;
  const iconMatches = root.match(/<link rel="icon"[^>]*>/g) ?? [];
  assert.equal(iconMatches.length, 1, '/ must carry exactly one rel="icon" link');
  assert.equal(
    existsSync(path.join(process.cwd(), "app", "favicon.ico")),
    false,
    "app/favicon.ico must not exist on disk — HOME-05's Next scaffold mark",
  );
});

test("every one of the six discoverability routes carries a non-empty title, no two share a title or a description, and the site name never doubles", async () => {
  const routes = await getRoutes();
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();

  for (const { key } of OG_TARGET_ROUTES) {
    const html = routes.get(key)!;
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    assert.ok(titleMatch, `route "${key || "/"}" must carry a non-empty <title>`);
    titles.set(key, titleMatch![1]);

    const nameOccurrences = (titleMatch![1].match(/Guillem Gelabert/g) ?? []).length;
    assert.ok(
      nameOccurrences <= 1,
      `route "${key || "/"}"'s title must not repeat "Guillem Gelabert" — found ${nameOccurrences} times`,
    );

    const descriptionMatch = html.match(/<meta name="description" content="([^"]*)"/);
    assert.ok(descriptionMatch, `route "${key || "/"}" must carry a meta description`);
    descriptions.set(key, descriptionMatch![1]);
  }

  assert.equal(new Set(titles.values()).size, titles.size, "no two of the six routes may share a title");
  assert.equal(
    new Set(descriptions.values()).size,
    descriptions.size,
    "no two of the six routes may share a description",
  );
});

test("/writing and /texte still emit hreflang alternates including x-default; /, /cv and /type deliberately emit none (English-only in v1)", async () => {
  const routes = await getRoutes();

  for (const key of ["writing", "texte"]) {
    const html = routes.get(key)!;
    assert.match(html, /hrefLang="x-default"/i, `route "${key}" must emit an x-default alternate`);
  }

  // A positive statement, not an omission left to look like one: / and /cv
  // are English-only pages with no German twin (03-UI-SPEC.md §
  // Localisation), and /type is the specimen page plan 06-07 also declared
  // English-only for the same reason, in its own source comment. None of
  // the three should ever emit a languages alternate.
  for (const key of ["", "cv", "type"]) {
    const html = routes.get(key)!;
    assert.equal(
      html.includes("hrefLang"),
      false,
      `route "${key || "/"}" must emit no hreflang alternates (English-only by design)`,
    );
  }
});

// --- The three user-supplied gate rows (G3, G4, G6) ------------------------
//
// Three of this phase's five user-supplied values have no production
// surface because the values do not exist. Each gets a current-state
// assertion (what genuinely ships today) plus a skipped test naming its
// gate ID — plan 06-03's own pattern for G12. A missing assertion is
// invisible; a skipped one is a standing instruction with a name attached,
// and `npm run test:build`'s own output becomes a readable gate report.

const CV_MARKER_WORDS = ["todo", "placeholder", "coming soon", "under construction", "lorem", "tbd"];

test("G4 (email): the double-escape signature never appears anywhere, and no mailto: link exists yet", async () => {
  const routes = await getRoutes();

  // Pitfall 3: React escapes `&` in both text nodes and attribute values,
  // so a naive entity-in-JSX approach ships as `&amp;#64;` on the wire —
  // the page DISPLAYS the literal text "&#64;" instead of "@", and the
  // mailto: is broken. This fires whether or not EMAIL is set, which is
  // why the ban is unconditional across every prerendered route rather
  // than gated on G4's fill state.
  for (const [routeKey, html] of routes) {
    assert.equal(
      html.includes("&amp;#"),
      false,
      `route "${routeKey || "/"}" must never carry the double-escaped entity signature "&amp;#"`,
    );
  }

  // The current absent state: EMAIL is null (G4 unfilled), so zero
  // mailto: links exist anywhere in production yet.
  for (const [routeKey, html] of routes) {
    assert.equal(
      html.includes("mailto:"),
      false,
      `route "${routeKey || "/"}" must carry no mailto: link while EMAIL is null`,
    );
  }
});

test("G4: /'s production HTML carries the real, correctly entity-encoded address, once EMAIL is filled", async (t) => {
  if (EMAIL === null) {
    t.skip("blocked by G4 (lib/contact.ts) — EMAIL is still null; unblocks when the user supplies a real address");
    return;
  }
  const routes = await getRoutes();
  const root = routes.get("")!;
  assert.ok(root.includes("&#64;"), "/ must carry the entity-encoded @ (Pitfall 3)");
  assert.ok(root.includes("&#46;"), "/ must carry the entity-encoded . (Pitfall 3)");
  assert.equal(root.includes(EMAIL), false, "/ must NOT carry the bare address with an unescaped @");
});

test("G3 (experience): /cv's production HTML currently ships CV_STUB_BODY, with none of the six banned marker words", async () => {
  const routes = await getRoutes();
  const cv = routes.get("cv")!;
  assert.ok(cv.includes(CV_STUB_BODY), "/cv must render CV_STUB_BODY while EXPERIENCE is empty");
  for (const marker of CV_MARKER_WORDS) {
    assert.doesNotMatch(cv, new RegExp(marker, "i"), `/cv must not render the marker word "${marker}"`);
  }
});

test("G3: /cv's production HTML carries EXPERIENCE's first row and the stub line is gone, once EXPERIENCE is filled", async (t) => {
  if (EXPERIENCE.length === 0) {
    t.skip(
      "blocked by G3 (lib/cv.ts) — EXPERIENCE is still empty; unblocks when the user supplies real employment history",
    );
    return;
  }
  const routes = await getRoutes();
  const cv = routes.get("cv")!;
  assert.ok(cv.includes(EXPERIENCE[0].org), "/cv must render the first EXPERIENCE row's org");
  assert.equal(cv.includes(CV_STUB_BODY), false, "/cv must not render CV_STUB_BODY once EXPERIENCE is filled");
});

test("G6 (portrait): /cv's production HTML currently renders zero <img> elements", async () => {
  const routes = await getRoutes();
  const cv = routes.get("cv")!;
  assert.equal((cv.match(/<img\b/g) ?? []).length, 0, "/cv must render zero <img> elements while PORTRAIT is null");
});

test("G6: /cv's production HTML carries exactly one <img> at PORTRAIT's declared dimensions, once PORTRAIT is filled", async (t) => {
  if (PORTRAIT === null) {
    t.skip("blocked by G6 (lib/cv.ts) — PORTRAIT is still null; unblocks when the user supplies a real photograph");
    return;
  }
  const routes = await getRoutes();
  const cv = routes.get("cv")!;
  const imgs = cv.match(/<img\b[^>]*>/g) ?? [];
  assert.equal(imgs.length, 1, "/cv must render exactly one <img>");
  assert.match(imgs[0], new RegExp(`width="${PORTRAIT.width}"`), "the <img>'s width must match PORTRAIT's declared width");
  assert.match(
    imgs[0],
    new RegExp(`height="${PORTRAIT.height}"`),
    "the <img>'s height must match PORTRAIT's declared height",
  );
});
