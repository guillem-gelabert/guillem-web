import { expect, test } from "@playwright/test";
import { EMAIL } from "../lib/contact";
import { POSITIONING_PLACEHOLDER, WORK } from "../lib/work";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("the homepage renders only the requested content, in order", async ({ page }) => {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Guillem Gelabert");

  const visibleLines = (await page.locator("main").innerText())
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  expect(visibleLines).toEqual([
    "Guillem Gelabert",
    POSITIONING_PLACEHOLDER,
    WORK[0].title,
    WORK[0].annotation,
    WORK[1].title,
    WORK[1].annotation,
    EMAIL,
  ]);

  await expect(page.locator("main nav, main section, main button, main img, main svg")).toHaveCount(0);
});

test("the visible descriptor exactly matches the meta description", async ({ page }) => {
  const descriptor = page.locator("main header p");
  await expect(descriptor).toHaveText(POSITIONING_PLACEHOLDER);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    POSITIONING_PLACEHOLDER,
  );
});

test("the semantic work list renders the two source-bound links and descriptions", async ({
  page,
}) => {
  const items = page.locator('main ul[role="list"] > li');
  await expect(items).toHaveCount(WORK.length);

  for (const [index, work] of WORK.entries()) {
    const item = items.nth(index);
    const link = item.locator("a");
    await expect(link).toHaveText(work.title);
    await expect(link).toHaveAttribute("href", work.href);
    await expect(link).not.toHaveAttribute("target", "_blank");
    await expect(item.locator("p")).toHaveText(work.annotation);
  }
});

test("the only remaining contact affordance is one readable obfuscated email link", async ({
  page,
}) => {
  const links = page.locator("main a");
  await expect(links).toHaveCount(3);

  const mail = page.locator(`main a[href="mailto:${EMAIL}"]`);
  await expect(mail).toHaveCount(1);
  await expect(mail).toHaveText(EMAIL);
  await expect(mail).toBeVisible();
});

test("all links are keyboard focusable and meet the 24px target floor", async ({ page }) => {
  const links = page.locator("main a");
  await expect(links).toHaveCount(3);

  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press("Tab");
    await expect(links.nth(index)).toBeFocused();
  }

  const boxes = await links.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect()),
  );
  for (const box of boxes) {
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
});

for (const viewport of [
  { name: "phone", width: 320, height: 640 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  test(`the homepage has no horizontal overflow at ${viewport.name} width`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.reload();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}
