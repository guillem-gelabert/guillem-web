import { expect, test } from "@playwright/test";

// The Hempton post in all three locales renders through the site's own post
// layout over its DeepDream tile (front-matter `backdrop`,
// components/post-backdrop.tsx): header and text on white panels one
// reading measure wide, and no standfirst on the page
// (`hideStandfirst`), though it still feeds the meta description.
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
        opacity: backdrop ? getComputedStyle(backdrop).opacity : "",
        standfirsts: document.querySelectorAll("main .text-standfirst").length,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      };
    });
    expect(facts.h1s).toBe(1);
    expect(facts.backdrops).toBe(1);
    expect(facts.image).toContain("/backgrounds/hempton-dream.webp");
    expect(facts.position).toBe("fixed");
    expect(facts.bodyBg).toBe("rgb(255, 255, 255)");
    expect(facts.themeLeftovers).toBe(0);
    expect(facts.opacity).toBe("1");
    expect(facts.standfirsts).toBe(0);
    expect(facts.description).toContain("Hempton");
  });
}

test("the text is one white column, and every line sits on it", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto(POSTS[1]);
    const result = await page.evaluate(() => {
      const box = document.querySelector<HTMLElement>(".backdrop-text")!;
      const style = getComputedStyle(box);
      const rect = box.getBoundingClientRect();
      const pad = parseFloat(style.paddingLeft);
      let lines = 0;
      let off = 0;
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          if (r.width === 0) continue;
          lines += 1;
          if (r.left < rect.left + pad - 0.5 || r.right > rect.right - pad + 0.5) off += 1;
        }
      }
      return {
        columns: style.columnCount,
        background: style.backgroundColor,
        lines,
        off,
        width: rect.width,
        viewport: window.innerWidth,
      };
    });
    expect(result.columns, `${viewport.width}px`).toBe("auto");
    expect(result.background).toBe("rgb(255, 255, 255)");
    expect(result.lines).toBeGreaterThan(10);
    expect(result.off).toBe(0);
    if (viewport.width === 1440) {
      // One measure, not the page: the dream shows beside it.
      expect(result.width).toBeLessThan(result.viewport * 0.6);
    }
  }
});

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
