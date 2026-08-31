import { expect, test } from "@playwright/test";

// Covers WRIT-01 (SC5) / D-11: a draft prerenders nowhere and appears in no
// index in production, but is reachable and marked as a draft in
// development. This file only proves the development half of that claim —
// every Playwright spec in this repo runs against `npm run dev`
// (playwright.config.ts's webServer), so `NODE_ENV` is always
// "development" here and `isVisible` always returns true for a draft. The
// production half — that a production build prerenders no draft route, no
// draft title, and no dev-only chrome — is proven separately in
// tests/build/prerender.test.ts, which reads real `next build` output from
// disk. Together the two files cover both sides of the isVisible()
// boundary; neither can prove the other's half.

test("/writing/fixture responds 200 in development", async ({ page }) => {
  const response = await page.goto("/writing/fixture");
  expect(response?.status()).toBe(200);
});

test("/writing lists the fixture in development — a draft is visible, which is what makes it testable at all", async ({
  page,
}) => {
  await page.goto("/writing");
  await page.evaluate(() => document.fonts.ready);

  const fixtureLink = page.getByRole("link", {
    name: "A Working Fixture for the Prose Contract",
  });
  await expect(fixtureLink).toHaveAttribute("href", "/writing/fixture");
});

test("the fixture's meta line shows the Draft marker exactly once, in the Label role, not accent-coloured", async ({
  page,
}) => {
  await page.goto("/writing/fixture");
  await page.evaluate(() => document.fonts.ready);

  // PostMeta renders one Label-role <p> with the date, the switch link and
  // the draft marker as sibling text on one line — "Draft" is not its own
  // element, so it is counted within the line's text rather than located
  // as an isolated node.
  const metaLine = page.locator("p.text-label", { hasText: "Draft" });
  await expect(metaLine).toHaveCount(1);

  // textContent, not innerText: the Label role applies text-transform:
  // uppercase, which innerText reflects (rendering "Draft" as "DRAFT").
  // textContent reads the un-transformed DOM text as authored.
  const lineText = await metaLine.first().evaluate((el) => el.textContent ?? "");
  const occurrences = lineText.split("Draft").length - 1;
  expect(occurrences).toBe(1);

  // The accent reservation (app/globals.css, UI-SPEC Color) is closed to
  // focus rings and link hover/focus states only. The draft marker must
  // render at the full ink value (#000000), never #C1272D.
  const color = await metaLine.first().evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe("rgb(0, 0, 0)");
  expect(color).not.toBe("rgb(193, 39, 45)");
});
