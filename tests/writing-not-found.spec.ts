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
// Amendment A3 grows this to three entries: /nope reaches the root
// app/not-found.tsx boundary (that boundary renders UI.en, matching the
// English-locale writing case) rather than a localised not-found.tsx, but
// its rendered copy and back link are identical to the /writing case, so it
// slots into the same table without a fourth field.
const LOCALE_CASES = [
  {
    path: "/writing/does-not-exist",
    heading: "Not found",
    body: "That piece doesn't exist here.",
    backLinkText: "← Writing",
    backLinkHref: "/writing",
  },
  {
    path: "/texte/gibt-es-nicht",
    heading: "Nicht gefunden",
    body: "Diesen Text gibt es hier nicht.",
    backLinkText: "← Texte",
    backLinkHref: "/texte",
  },
  {
    path: "/nope",
    heading: "Not found",
    body: "That piece doesn't exist here.",
    backLinkText: "← Writing",
    backLinkHref: "/writing",
  },
];

// The global boundary (app/not-found.tsx): every URL that matches no route at
// all. Asserted with JavaScript disabled, because the whole point of the file
// is that the 404 exists in the SERVER HTML — a Playwright context with JS on
// waits for hydration and would pass against a blank shell.
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
      await expect(page.getByRole("link", { name: "← Writing" })).toHaveAttribute(
        "href",
        "/writing",
      );
    } finally {
      await context.close();
    }
  });
}

for (const locale of LOCALE_CASES) {
  test(`an unknown slug at ${locale.path} renders the localised not-found copy`, async ({ page }) => {
    const response = await page.goto(locale.path);
    expect(response?.status()).toBe(404);

    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator("h1")).toHaveText(locale.heading);
    await expect(page.getByText(locale.body)).toBeVisible();

    const backLink = page.getByRole("link", { name: locale.backLinkText });
    await expect(backLink).toHaveAttribute("href", locale.backLinkHref);
  });

  // Amendment A3: all three not-found back links take link-quiet and clear
  // the WCAG 2.5.8 24px target floor.
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

// KNOWN GAP (code review CR-01), deliberately not asserted here: the two
// localised boundaries above are reached by an explicit notFound() throw, and
// Next 16.3.3 never server-renders a thrown notFound()'s boundary — it emits
// `<html id="__next_error__">` with an empty hidden body and paints the copy
// on hydration. Measured in this repo against `next start` for a static
// prerender, an ISR render and `dynamic = "force-dynamic"` alike, with and
// without app/not-found.tsx present. A no-JS assertion on these two paths
// would therefore fail today, and the only fix that makes them server-render
// (dynamicParams = false, which routes them to the English global boundary
// above) drops the German copy 02-UI-SPEC's Error State row requires. That is
// a design trade, not a code fix; see 02-REVIEW-FIX notes.
