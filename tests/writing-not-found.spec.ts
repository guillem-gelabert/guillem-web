import { expect, test } from "@playwright/test";

// Covers WRIT-01 (error path): an unknown or wrong-locale slug renders this
// writing segment's own localised not-found copy, not Next.js's default 404.
//
// The route keeps dynamicParams = true plus an explicit notFound() call
// rather than dynamicParams = false: with two root layouts there is no
// global not-found to fall back on, so dynamicParams = false would 404 at
// the routing layer before this segment's own not-found.tsx ever rendered.
// true + an explicit notFound() is unambiguous either way.
//
// A one-entry table today, looped over rather than hand-written once, so
// Plan 06 can add the German /texte case without restructuring this file.
//
// Two entries, both real localised SEGMENT boundaries reached by an unknown
// slug. /nope used to be a third row here — it is not a slug, has no locale
// and reaches no localised boundary, and two of the three assertions it ran
// duplicated the UNMATCHED_PATHS loop below. Once code review WR-05 pointed
// the global boundary at the site root, the row became actively wrong: it
// asserted href="/writing". Its one unique assertion (the back link's
// link-quiet class and 24px target height) moved into the UNMATCHED_PATHS
// loop, where the surface it describes actually lives (IN-07).
const LOCALE_CASES = [
  {
    path: "/writing/does-not-exist",
    lang: "en",
    heading: "Not found",
    body: "That piece doesn't exist here.",
    backLinkText: "← Writing",
    backLinkHref: "/writing",
  },
  {
    path: "/texte/gibt-es-nicht",
    lang: "de",
    heading: "Nicht gefunden",
    body: "Diesen Text gibt es hier nicht.",
    backLinkText: "← Texte",
    backLinkHref: "/texte",
  },
];

// The global boundary (app/global-not-found.tsx): every URL that matches no
// route at all. Asserted with JavaScript disabled, because the whole point of
// the file is that the 404 exists in the SERVER HTML — a Playwright context
// with JS on waits for hydration and would pass against a blank shell.
const UNMATCHED_PATHS = ["/nope", "/blog", "/de/texte"];

for (const path of UNMATCHED_PATHS) {
  test(`${path} matches no route and renders the global not-found copy without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);

      // WCAG 2.1 SC 3.1.1 (Level A): the document must declare its language,
      // in the server HTML, before any script runs.
      expect(await page.evaluate(() => document.documentElement.lang)).toBe("en");

      // WCAG 2.1 SC 2.4.2 Page Titled (Level A), same conformance level.
      // Measured empty here before app/global-not-found.tsx existed: the tab,
      // the history entry, the bookmark and every assistive-technology page
      // announcement fell back to the raw URL (code review CR-01).
      expect(await page.title()).not.toBe("");

      await expect(page.locator("h1")).toHaveText("Not found");
      await expect(page.getByText("That piece doesn't exist here.")).toBeVisible();

      // WR-05: the site root, not the writing index. This boundary is
      // reached by visitors who were not looking for /writing, and in
      // production /writing ships "Nothing published here yet." — so the
      // segment-scoped back link sent them from a mistyped URL to an empty
      // page with still no route to the site root.
      const backLink = page.getByRole("link", { name: "← Guillem Gelabert" });
      await expect(backLink).toHaveAttribute("href", "/");

      // The global boundary must offer no route into the writing segment:
      // a second link here would be the dead end WR-05 removed.
      await expect(page.locator('a[href="/writing"]')).toHaveCount(0);

      // Amendment A3 / WCAG 2.5.8, moved here from the LOCALE_CASES /nope
      // row (IN-07) so the assertion sits on the surface it describes.
      await expect(backLink).toHaveClass(/link-quiet/);
      await page.evaluate(() => document.fonts.ready);
      const height = await backLink.evaluate((el) => el.getBoundingClientRect().height);
      expect(height).toBeGreaterThanOrEqual(24);
    } finally {
      await context.close();
    }
  });
}

for (const locale of LOCALE_CASES) {
  // CR-01, resolved: proxy.ts rewrites an unmatched or cross-locale slug to
  // a real per-locale page with an explicit 404 status BEFORE the App
  // Router render starts, rather than this segment's [slug]/page.tsx
  // throwing notFound() (which Next 16.3.3 never server-renders — see
  // .planning/phases/02-content-pipeline/deferred-items.md for the original
  // isolation, this file's own git history for the code-review comment this
  // block replaces, and 06-RESEARCH.md § "CR-01 — SOLVED AND MEASURED" for
  // the fix). The status is set at the proxy tier because an App Router
  // page cannot set one itself, and the German copy survives because the
  // rewrite target is a real per-locale page — dynamicParams = false was
  // the other option and could not preserve it (it always serves the
  // English global boundary). Asserted here exactly as WCAG 3.1.1 requires:
  // in the server HTML, with JavaScript disabled.
  test(`an unknown slug at ${locale.path} renders the localised not-found copy without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      const response = await page.goto(locale.path);
      expect(response?.status()).toBe(404);

      // WCAG 2.1 SC 3.1.1 (Level A), the defect this block replaces: the
      // document must declare the REQUESTED locale's language in the server
      // HTML, before any script runs.
      expect(await page.evaluate(() => document.documentElement.lang)).toBe(locale.lang);

      // WCAG 2.1 SC 2.4.2 Page Titled (Level A). The reserved pages export
      // their own metadata.title precisely so this is never the bare layout
      // default (06-RESEARCH.md: measured falling back to "Guillem Gelabert"
      // without it).
      const title = await page.title();
      expect(title).not.toBe("");
      expect(title).not.toBe("Guillem Gelabert");

      await expect(page.locator("h1")).toHaveText(locale.heading);
      await expect(page.getByText(locale.body)).toBeVisible();

      const backLink = page.getByRole("link", { name: locale.backLinkText });
      await expect(backLink).toHaveAttribute("href", locale.backLinkHref);
    } finally {
      await context.close();
    }
  });

  // Amendment A3: all three not-found back links take link-quiet and clear
  // the WCAG 2.5.8 24px target floor. Left JavaScript-enabled: it needs a
  // real layout pass (getBoundingClientRect after fonts load), unlike the
  // status/lang/title/h1/body assertions above.
  test(`the back link at ${locale.path} carries link-quiet and clears the 24px target floor`, async ({
    page,
  }) => {
    await page.goto(locale.path);
    await page.evaluate(() => document.fonts.ready);

    const backLink = page.getByRole("link", { name: locale.backLinkText });
    await expect(backLink).toHaveClass(/link-quiet/);

    const height = await backLink.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(24);
  });
}

// CR-01: the locale filter, not just the unmatched-slug case. A published
// post's own slug requested under the OTHER locale's segment must still
// 404, in that segment's own language — the case that catches a slug
// allowlist that forgot to check `lang` and matched by filename alone.
// Asserted with JavaScript disabled for the same WCAG 3.1.1 reason as above.
const CROSS_LOCALE_CASES = [
  {
    path: "/writing/die-darstellung-aendert-sich",
    lang: "en",
    heading: "Not found",
  },
  {
    path: "/texte/the-chart-therefore-changes",
    lang: "de",
    heading: "Nicht gefunden",
  },
];

for (const cross of CROSS_LOCALE_CASES) {
  test(`${cross.path} (the other locale's published slug) 404s in the requesting segment's own language`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      const response = await page.goto(cross.path);
      expect(response?.status()).toBe(404);
      expect(await page.evaluate(() => document.documentElement.lang)).toBe(cross.lang);
      await expect(page.locator("h1")).toHaveText(cross.heading);
    } finally {
      await context.close();
    }
  });
}

// CR-01: the reserved rewrite targets are self-guarding. A direct visit is
// itself matched by the proxy's own /writing/:slug or /texte/:slug matcher,
// is not in the published set, and is rewritten to itself with a 404 — so
// neither reserved route is a crawlable soft-404 URL.
const RESERVED_TARGET_PATHS = ["/writing/not-found-page", "/texte/nicht-gefunden"];

for (const path of RESERVED_TARGET_PATHS) {
  test(`a direct visit to the reserved target ${path} returns 404, not 200`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  });
}
