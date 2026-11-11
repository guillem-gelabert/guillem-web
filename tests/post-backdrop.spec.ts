import { expect, test } from "@playwright/test";
import sharp from "sharp";

// The Hempton post in all three locales renders through the site's own post
// layout over its DeepDream tile (front-matter `backdrop`,
// components/post-backdrop.tsx): header and text on white panels, the text
// in three columns from 1024px, and no standfirst on the page
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

test("on desktop the text runs in three columns, every line on a white band", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(POSTS[1]);
  const result = await page.evaluate(() => {
    const box = document.querySelector<HTMLElement>(".backdrop-columns")!;
    const style = getComputedStyle(box);
    const rect = box.getBoundingClientRect();
    // The bands, by the same arithmetic as the gradient in app/globals.css.
    const pad = parseFloat(style.paddingLeft);
    const gap = parseFloat(style.columnGap);
    const col = (rect.width - 2 * pad - 2 * gap) / 3;
    const bands = [0, 1, 2].map((i) => {
      const start = pad + i * (col + gap);
      return [rect.left + start - pad, rect.left + start + col + pad];
    });
    const lines: { left: number; right: number }[] = [];
    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) if (r.width > 0) lines.push({ left: r.left, right: r.right });
    }
    const offBand = lines.filter(
      (line) => !bands.some(([a, b]) => line.left >= a - 0.5 && line.right <= b + 0.5),
    ).length;
    const used = new Set(
      lines.map((line) => bands.findIndex(([a, b]) => line.left >= a - 0.5 && line.right <= b + 0.5)),
    );
    return { columns: style.columnCount, lines: lines.length, offBand, bandsUsed: used.size, gutter: gap - 2 * pad };
  });
  expect(result.columns).toBe("3");
  expect(result.lines).toBeGreaterThan(20);
  expect(result.offBand).toBe(0);
  expect(result.bandsUsed).toBe(3);
  expect(result.gutter).toBeGreaterThan(0);
});

test("the gradient paints the bands white and leaves the gutters to the dream", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(POSTS[1]);
  const box = page.locator(".backdrop-columns");
  await box.scrollIntoViewIfNeeded();
  const geometry = await box.evaluate((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const pad = parseFloat(style.paddingLeft);
    const gap = parseFloat(style.columnGap);
    const col = (rect.width - 2 * pad - 2 * gap) / 3;
    return { x: rect.left, y: rect.top, h: rect.height, pad, gap, col };
  });
  const { x, y, h, pad, gap, col } = geometry;
  const top = Math.max(y, 0) + 8;
  const height = Math.min(200, h - 16);
  // Strips 2px wide: the middle of each band's left padding (white), and
  // the middle of each gutter (the dream).
  const strip = async (left: number) => {
    const shot = await page.screenshot({ clip: { x: Math.round(left) - 1, y: top, width: 2, height } });
    const { data } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
    let white = 0;
    for (let i = 0; i < data.length; i += 3) if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) white += 1;
    return white / (data.length / 3);
  };
  for (const i of [0, 1, 2]) {
    expect(await strip(x + i * (col + gap) + pad / 2), `band ${i} padding`).toBe(1);
  }
  for (const i of [0, 1]) {
    expect(await strip(x + pad + col + i * (col + gap) + gap / 2), `gutter ${i}`).toBeLessThan(0.2);
  }
});

test("on a phone the text is one white column", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(POSTS[1]);
  const box = page.locator(".backdrop-columns");
  await expect(box).toHaveCSS("column-count", "auto");
  await expect(box).toHaveCSS("background-color", "rgb(255, 255, 255)");
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
