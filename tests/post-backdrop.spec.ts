import { expect, test } from "@playwright/test";

// The Hempton post in all three locales renders through the site's own post
// layout, with only its DeepDream tile behind it (front-matter `backdrop`,
// components/post-backdrop.tsx).
const POSTS = [
  "/escrits/el-pitjor-negoci-del-mon",
  "/writing/the-worst-business-in-the-world",
  "/texte/das-schlechteste-geschaeft-der-welt",
];

for (const url of POSTS) {
  test(`${url} has the DeepDream backdrop and the plain post layout`, async ({ page }) => {
    await page.goto(url);
    const facts = await page.evaluate(() => {
      const backdrop = document.querySelector<HTMLElement>(".post-backdrop");
      return {
        h1s: document.querySelectorAll("h1").length,
        backdrops: document.querySelectorAll(".post-backdrop").length,
        image: backdrop ? getComputedStyle(backdrop).backgroundImage : "",
        position: backdrop ? getComputedStyle(backdrop).position : "",
        bodyBg: getComputedStyle(document.body).backgroundColor,
        themeLeftovers: document.querySelectorAll(".vx, .vx-bg").length,
      };
    });
    expect(facts.h1s).toBe(1);
    expect(facts.backdrops).toBe(1);
    expect(facts.image).toContain("/backgrounds/hempton-dream.webp");
    expect(facts.position).toBe("fixed");
    expect(facts.bodyBg).toBe("rgb(255, 255, 255)");
    expect(facts.themeLeftovers).toBe(0);
  });
}

test("a post without a backdrop gets none", async ({ page }) => {
  await page.goto("/writing/what-are-embeddings");
  await expect(page.locator(".post-backdrop")).toHaveCount(0);
});

test("the backdrop post does not scroll sideways at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const url of POSTS) {
    await page.goto(url);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, url).toBe(0);
  }
});
