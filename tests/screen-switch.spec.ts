import { expect, test, type Page } from "@playwright/test";

// "What Are Embeddings" changes screen as the reader goes: Game Boy for the
// opening, a colour TV from "A map in 3 dimensions", a TFT panel from "A map
// in all dimensions", and back again on the way up. Markers in the MDX
// (<ScreenSwitch />) set html[data-screen].

const ROUTE = "/writing/what-are-embeddings";

async function scrollToMarker(page: Page, to: string) {
  await page.locator(`[data-screen-switch="${to}"]`).evaluate((el) => {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100);
  });
}

// every screen is dark ink on light paper; poll past the 600ms fade
async function expectLightPage(page: Page) {
  const luma = (rgb: string) => {
    const [r, g, b] = rgb.match(/[\d.]+/g)!.map(Number);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  await expect.poll(async () => luma(await page.evaluate(() => getComputedStyle(document.body).backgroundColor))).toBeGreaterThan(0.6);
  await expect.poll(async () => luma(await page.evaluate(() => getComputedStyle(document.body).color))).toBeLessThan(0.2);
}

const font = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);

test.describe("screen switch", () => {
  test("Game Boy, then CRT, then TFT, and back", async ({ page }) => {
    await page.goto(ROUTE);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-screen", "gb");
    expect(await page.locator(".prose-site > p").first().evaluate((el) => getComputedStyle(el).filter)).toContain("gb-screen");

    await scrollToMarker(page, "crt");
    await expect(html).toHaveAttribute("data-screen", "crt");
    await expectLightPage(page);
    // pixel headings as on the Game Boy, smooth body text
    expect(await font(page, ".prose-site h2")).toMatch(/coral|yore/i);
    expect(await font(page, ".prose-site > p")).toMatch(/georgia/i);
    expect(await page.locator(".prose-site > p").first().evaluate((el) => getComputedStyle(el).filter)).toBe("none");
    expect(await page.locator(".gb-grid").evaluate((el) => getComputedStyle(el).mixBlendMode)).toBe("multiply");

    await scrollToMarker(page, "tft");
    await expect(html).toHaveAttribute("data-screen", "tft");
    await expectLightPage(page);
    expect(await font(page, ".prose-site h2")).toMatch(/georgia/i);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(html).toHaveAttribute("data-screen", "gb");
  });

  test("opening the page mid-article starts on that section's screen", async ({ page }) => {
    await page.goto(`${ROUTE}#a-map-in-all-dimensions-adding-more-dimensions-doesnt-make-the-map-more-complex`);
    await expect(page.locator("html")).toHaveAttribute("data-screen", "tft");
  });
});
