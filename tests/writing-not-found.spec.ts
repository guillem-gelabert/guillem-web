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
const LOCALE_CASES = [
  {
    path: "/writing/does-not-exist",
    heading: "Not found",
    body: "That piece doesn't exist here.",
    backLinkText: "← Writing",
    backLinkHref: "/writing",
  },
];

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
}
