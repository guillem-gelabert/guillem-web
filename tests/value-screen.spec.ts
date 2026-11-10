import { expect, test } from "@playwright/test";

// theme: mazzucato (components/value-screen.tsx). The Hempton post in all
// three locales renders through the Value of Everything design: Archivo
// title, Source Serif 4 body, cream reading panel, and no horizontal scroll
// at phone width.
const POSTS = [
  "/escrits/el-pitjor-negoci-del-mon",
  "/writing/the-worst-business-in-the-world",
  "/texte/das-schlechteste-geschaeft-der-welt",
];

for (const url of POSTS) {
  test(`${url} renders through the mazzucato theme`, async ({ page }) => {
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);

    const facts = await page.evaluate(() => {
      const title = document.querySelector(".vx-title")!;
      const p = document.querySelector(".vx-body p")!;
      const panel = document.querySelector(".vx-panel")!;
      return {
        h1s: document.querySelectorAll("h1").length,
        titleFont: getComputedStyle(title).fontFamily,
        bodyFont: getComputedStyle(p).fontFamily,
        panelBg: getComputedStyle(panel).backgroundColor,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        languageLinks: document.querySelectorAll(".vx-meta a[hreflang]").length,
      };
    });
    expect(facts.h1s).toBe(1);
    expect(facts.titleFont).toMatch(/Archivo/);
    expect(facts.bodyFont).toMatch(/Source Serif 4/);
    expect(facts.panelBg).toBe("rgb(247, 243, 236)");
    expect(facts.bodyBg).toBe("rgb(16, 24, 56)");
    expect(facts.languageLinks).toBe(2);
  });
}

test("the mazzucato theme does not scroll sideways at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const url of POSTS) {
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, url).toBe(0);
  }
});
