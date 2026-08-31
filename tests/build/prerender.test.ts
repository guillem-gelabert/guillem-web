import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { POSITIONING_PLACEHOLDER } from "../../lib/work.ts";
import { UI } from "../../lib/locales.ts";

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

test("every (en) route's meta description is bound to POSITIONING_PLACEHOLDER by equality, not a hardcoded literal", async () => {
  const routes = await getRoutes();

  // Pitfall 6: the failure this prevents is the user writing the real
  // positioning sentence into the rendered <p> while the meta description
  // still holds the old placeholder value — which is what Slack, LinkedIn
  // and eventually Google quote once Phase 6 flips FIND-02. Comparing
  // against the imported constant rather than a literal means this keeps
  // passing when the real sentence lands and fails the moment the two drift.
  //
  // The sweep covers /cv and /type as well as /, which is code review
  // WR-06: this gate used to scope to / only, and app/(en)/layout.tsx
  // hardcoded the literal "Developer." as the group default. /cv sets its
  // own title but no description and /type is a Client Component that can
  // export no metadata at all, so both served the layout's copy — three
  // routes shipping the same sentence from two sources, while lib/work.ts,
  // app/(en)/page.tsx and deferred-items.md §1 all documented one. The
  // layout now reads the constant, and this asserts all three follow it.
  for (const key of ["", "cv", "type"]) {
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

test("launch gate: the backlog stub and the contact stub are still interim — the featured slot closed on 2026-08-31", async () => {
  const routes = await getRoutes();
  const root = routes.get("")!;

  // If the backlog stub, the contact stub or /cv is still in its interim
  // state when Phase 6 goes to flip the robots flag, Phase 6 is blocked.
  // This test passing today is the record that these two are interim (the
  // /cv route's own interim body is asserted by tests/cv.spec.ts); when
  // Phases 5 and 6 fill them, THIS test is the thing that must be updated,
  // which is where the gate gets noticed rather than forgotten.
  //
  // NARROWED 2026-08-31 (Phase 4, Plan 5): the featured slot closed. It was
  // the third interim surface this gate covered — content/the-chart-therefore-changes.mdx
  // published with draft: false, /writing left n=0, and the slot now ships
  // its real title/standfirst with a real link (asserted by the two tests
  // above). Removing the interim headline's assertion from this
  // assertion IS the gate mechanism working: an interim state ended, and
  // the test that proved it was interim was updated rather than silently
  // left passing on a state that no longer exists. Two interim surfaces
  // remain, plus the still-unwritten HOME-01 positioning sentence
  // (POSITIONING_PLACEHOLDER, asserted elsewhere in this file) — all three
  // still block Phase 6's FIND-02 robots flip.
  assert.ok(root.includes("Nothing listed here yet."));
  assert.ok(root.includes("No contact details here yet."));
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

// Forward note for Phase 6 (FIND-02): when sitemap.ts is added, it must call
// publishedFor() from lib/content.ts rather than re-deriving the draft rule
// from front-matter directly. This file is otherwise the only place that
// rule is asserted; stating the draft predicate a second, independent way
// in sitemap.ts would let the two silently drift apart.
