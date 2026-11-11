import { expect, test } from "@playwright/test";

// theme: mazzucato (components/value-screen.tsx). The Hempton post in all
// three locales renders through the Value of Everything design: Archivo
// title, light Source Serif 4 body on navy, and no horizontal scroll
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
      return {
        h1s: document.querySelectorAll("h1").length,
        titleFont: getComputedStyle(title).fontFamily,
        bodyFont: getComputedStyle(p).fontFamily,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        languageLinks: document.querySelectorAll(".vx-meta a[hreflang]").length,
        dream: getComputedStyle(document.querySelector(".vx-bg .vx-dream")!).backgroundImage,
      };
    });
    expect(facts.h1s).toBe(1);
    expect(facts.titleFont).toMatch(/Archivo/);
    expect(facts.bodyFont).toMatch(/Source Serif 4/);
    expect(facts.bodyBg).toBe("rgb(16, 24, 56)");
    expect(facts.languageLinks).toBe(2);
    // The seamless DeepDream tile under the stripes.
    expect(facts.dream).toContain("/backgrounds/hempton-dream.webp");
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

test("the mazzucato background moves with scroll, and stays put under reduced motion", async ({ browser }) => {
  const read = async (reducedMotion: "reduce" | "no-preference") => {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    await page.goto(POSTS[1]);
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(100);
    const transforms = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".vx-bg [data-parallax]")].map((el) => el.style.transform),
    );
    await context.close();
    return transforms;
  };

  const moving = await read("no-preference");
  expect(moving).toHaveLength(5);
  expect(moving[0]).toBe("translateY(-30px)"); // the stripes, factor -0.05
  expect(moving[2]).toBe("rotate(12deg) translateY(96px)"); // keeps its base rotation

  const still = await read("reduce");
  expect(still.filter((t) => t.includes("translateY"))).toHaveLength(0);
});
