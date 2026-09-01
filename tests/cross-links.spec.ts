import { expect, test } from "@playwright/test";
import { LOCALES } from "@/lib/content";
import { notFoundPath } from "@/lib/locales";

// Covers D-4.4 section 1 (06-CONTEXT.md:356-359) — the milestone's final
// cross-link integrity audit, and the CR-01 reserved-404 exclusion it
// depends on (plan 06-01). This file crawls generically rather than
// asserting route-by-route, so a link added anywhere in the future is
// inside this audit's coverage the moment it exists rather than only once
// someone remembers to add an assertion for it.
//
// Deliberately complements, not duplicates, tests/i18n-routing.spec.ts
// (which owns the language switcher's present/absent branches and
// localised date rendering) and tests/landing.spec.ts test (a) (which owns
// HOME-03's structural shape — five links, reader-importance order). This
// file's job is REACHABILITY: does every href resolve, does every fragment
// target exist in the DOM, does every hreflang alternate resolve — across
// every route in both locales.
//
// House rules this file follows (STATE.md, 02-VALIDATION.md, and this
// plan's own <interfaces>):
// - Every assertion reads a real render or a real HTTP response, never a
//   value derived from the plan's own arithmetic.
// - Internal hrefs are fetched; external hrefs are never fetched — a spec
//   that depends on third-party uptime is a flake generator (T-06-62).
//   Only their SHAPE (absolute https, no target, no private-repo leak) is
//   asserted, and every destination is recorded in the test output so the
//   audit can cite the list.
// - link[rel="alternate"]/canonical hrefs are ABSOLUTE against SITE_URL
//   (lib/site.ts's metadataBase — https://guillemgelabert.com in this
//   environment, not this suite's localhost origin). Fetching the literal
//   absolute URL would silently reach out to the real production domain
//   over the network; every alternate below is instead resolved by
//   PATHNAME against the local dev server this suite actually runs
//   against.
// - Fetches are deduplicated across all seven routes and issued
//   concurrently (Promise.all), not sequentially, to keep this file's
//   runtime — the plan's own 60-second budget — well clear of the floor.

const ROUTES = [
  "/",
  "/cv",
  "/type",
  "/writing",
  "/texte",
  "/writing/the-chart-therefore-changes",
  "/texte/die-darstellung-aendert-sich",
] as const;

// English-only surfaces (03-UI-SPEC.md § Localisation) — asserted to emit
// ZERO link[rel="alternate"] tags, positively, so this reads as a recorded
// decision rather than an unnoticed gap. /writing, /texte and both case-study
// routes are NOT in this set: they carry real alternates and are asserted
// to resolve them below.
const NO_ALTERNATE_ROUTES = new Set<string>(["/", "/cv", "/type"]);

// CR-01 (plan 06-01): both reserved rewrite targets are *supposed* to
// 404 — plan 06-01's own spec already proves that. Excluded from the
// "every internal href resolves" universe below and asserted positively
// 404 by name instead, referenced through the shared constant rather than
// a literal string so the two callers cannot drift apart.
const RESERVED_404_PATHS = LOCALES.map((locale) => notFoundPath(locale));

type CrawledHref = { href: string; target: string | null };
type CrawledAlternate = { hreflang: string; href: string };
type CrawledRoute = {
  route: string;
  hrefs: CrawledHref[];
  ids: Set<string>;
  alternates: CrawledAlternate[];
};

let crawled: CrawledRoute[] = [];

// A single shared crawl pass, not one per test: `browser` is a
// worker-scoped fixture available inside beforeAll, so every assertion
// below reads from one render of each route rather than re-navigating
// seven times per test — which is also what keeps this file inside its
// 60-second budget.
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  const results: CrawledRoute[] = [];

  for (const route of ROUTES) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]")).map((a) => ({
        href: a.getAttribute("href") ?? "",
        target: a.getAttribute("target"),
      })),
    );
    const idList = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[id]")).map((el) => el.id),
    );
    const alternates = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel="alternate"]')).map((l) => ({
        hreflang: l.getAttribute("hreflang") ?? "",
        href: l.getAttribute("href") ?? "",
      })),
    );

    results.push({ route, hrefs, ids: new Set(idList), alternates });
  }

  await page.close();
  crawled = results;
});

// href shape, not destination — a fragment is internal navigation on the
// SAME page (every fragment href found on this site targets an id on the
// page it appears on), "internal" is root-relative same-origin navigation,
// "external" is an absolute http(s) URL to a different origin, and "other"
// covers mailto:/tel:/javascript: hrefs, which are not network resources
// this audit fetches or shape-checks.
function classify(href: string): "fragment" | "internal" | "external" | "other" {
  if (href.startsWith("#")) return "fragment";
  if (href.startsWith("/")) return "internal";
  if (/^https?:\/\//.test(href)) return "external";
  return "other";
}

test("every internal href across all seven routes, deduplicated, resolves to a non-404 status", async ({
  request,
}) => {
  const byHref = new Map<string, string[]>();
  for (const { route, hrefs } of crawled) {
    for (const { href } of hrefs) {
      if (classify(href) !== "internal") continue;
      if (RESERVED_404_PATHS.includes(href)) continue; // asserted positively 404 below, not here
      const referencedFrom = byHref.get(href) ?? [];
      referencedFrom.push(route);
      byHref.set(href, referencedFrom);
    }
  }

  const uniqueHrefs = [...byHref.keys()];
  expect(uniqueHrefs.length, "expected at least one internal href across the seven routes").toBeGreaterThan(0);

  // Deduplicated AND concurrent (T-06-62) — one fetch per unique href, all
  // in flight together, rather than one fetch per (route, href) pair issued
  // in sequence.
  const results = await Promise.all(
    uniqueHrefs.map(async (href) => {
      const res = await request.get(href);
      return { href, status: res.status(), referencedFrom: byHref.get(href)! };
    }),
  );

  console.log(
    `cross-links: ${uniqueHrefs.length} unique internal hrefs fetched —\n` +
      results.map((r) => `  ${r.href} -> ${r.status} (from ${r.referencedFrom.join(", ")})`).join("\n"),
  );

  for (const { href, status, referencedFrom } of results) {
    expect(
      status,
      `internal href "${href}" (linked from ${referencedFrom.join(", ")}) returned ${status}, expected non-404`,
    ).not.toBe(404);
  }
});

test("every fragment href on every route has a matching id in that route's own rendered DOM", async () => {
  let checked = 0;
  for (const { route, hrefs, ids } of crawled) {
    for (const { href } of hrefs) {
      if (classify(href) !== "fragment") continue;
      checked++;
      const targetId = href.slice(1);
      expect(
        ids.has(targetId),
        `fragment href "${href}" on ${route} has no element with id="${targetId}" in the DOM — a renamed section is exactly as broken as a 404 and invisible to a status check`,
      ).toBe(true);
    }
  }
  expect(checked, "expected at least one fragment href to be checked (e.g. / nav's #work/#backlog/#contact)").toBeGreaterThan(0);
});

test("every external href is absolute https, carries no target attribute, and never references the private ib-gdp-evolution repository", async () => {
  const byHref = new Map<string, { target: string | null; routes: string[] }>();
  for (const { route, hrefs } of crawled) {
    for (const { href, target } of hrefs) {
      if (classify(href) !== "external") continue;
      const entry = byHref.get(href) ?? { target, routes: [] };
      entry.routes.push(route);
      byHref.set(href, entry);
    }
  }

  const externalHrefs = [...byHref.entries()];
  expect(externalHrefs.length, "expected at least one external href across the seven routes").toBeGreaterThan(0);

  // Recorded here, unconditionally, so the audit can cite the exact list —
  // never fetched (T-06-62): a spec that depends on third-party uptime is a
  // flake generator.
  console.log(
    `cross-links: ${externalHrefs.length} unique external destinations —\n` +
      externalHrefs
        .map(([href, { routes }]) => `  ${href} (from ${routes.join(", ")})`)
        .join("\n"),
  );

  for (const [href, { target }] of externalHrefs) {
    expect(href.startsWith("https://"), `external href "${href}" is not absolute https://`).toBe(true);
    expect(
      target,
      `external href "${href}" carries a target attribute ("${target}") — same-tab is this site's standing posture, and an unannounced new window is the reverse-tabnabbing surface T-06-60 exists to close`,
    ).toBeNull();
    expect(
      href.toLowerCase().includes("ib-gdp-evolution"),
      `external href "${href}" references the private ib-gdp-evolution repository (T-06-59) — it must never be linked as source`,
    ).toBe(false);
  }
});

test("every route's link[rel=\"alternate\"] tags resolve non-404 by pathname, with x-default present and live where alternates exist — and the three English-only routes emit none", async ({
  request,
}) => {
  for (const { route, alternates } of crawled) {
    if (NO_ALTERNATE_ROUTES.has(route)) {
      // English-only by design (03-UI-SPEC.md § Localisation: / and /cv
      // ship no German twin in v1; /type is a non-indexed specimen with no
      // twin either). Asserted here so the audit reads a decision, not a
      // gap.
      expect(
        alternates.length,
        `${route} is English-only (03-UI-SPEC.md § Localisation) and must emit zero link[rel="alternate"] tags`,
      ).toBe(0);
      continue;
    }

    expect(
      alternates.length,
      `${route} carries no link[rel="alternate"] tags — expected hreflang alternates on a localised route`,
    ).toBeGreaterThan(0);

    const hasXDefault = alternates.some((a) => a.hreflang === "x-default");
    expect(hasXDefault, `${route} has no hreflang="x-default" alternate`).toBe(true);

    for (const { hreflang, href } of alternates) {
      // Absolute against SITE_URL (lib/site.ts's metadataBase), not this
      // suite's localhost origin — resolved by PATHNAME against the local
      // server rather than fetched at its literal absolute URL, which
      // would reach the real production domain over the network.
      const pathname = new URL(href).pathname;
      const res = await request.get(pathname);
      expect(
        res.status(),
        `${route}'s hreflang="${hreflang}" alternate "${href}" (pathname "${pathname}") returned ${res.status()}, expected non-404`,
      ).not.toBe(404);
    }
  }
});

test("HOME-03: the five contents-list destinations are reachable from /, in the nav's declared order, with no sixth", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const nav = page.locator('nav[aria-label="Sections"]');
  const links = nav.locator("a");
  await expect(links).toHaveCount(5);

  const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  // Reader-importance order (03-UI-SPEC.md), not page order — Writing sits
  // second because it is the only route in the list that already holds
  // shipped content.
  expect(hrefs).toEqual(["#work", "/writing", "#backlog", "/cv", "#contact"]);

  const [writingRes, cvRes] = await Promise.all([request.get("/writing"), request.get("/cv")]);
  expect(writingRes.status(), "HOME-03's /writing destination returned 404").not.toBe(404);
  expect(cvRes.status(), "HOME-03's /cv destination returned 404").not.toBe(404);

  for (const id of ["work", "backlog", "contact"]) {
    await expect(
      page.locator(`#${id}`),
      `HOME-03's #${id} fragment target is missing from /'s DOM`,
    ).toHaveCount(1);
  }
});

test("the two reserved 404 routes, excluded from the reachability universe above, are asserted positively 404 by name", async ({
  request,
}) => {
  for (const locale of LOCALES) {
    const path = notFoundPath(locale);
    const res = await request.get(path);
    expect(res.status(), `reserved 404 route "${path}" (${locale}) did not return 404`).toBe(404);
  }
});
