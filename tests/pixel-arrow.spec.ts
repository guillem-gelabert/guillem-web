import { expect, test } from "@playwright/test";

// Coral Pixels has no arrow glyphs, so "→" in the embeddings post is drawn
// on the font's grid instead (components/mdx/pixel-arrow.tsx): one SVG
// pixel per font pixel, 13 to the em, with the real "→" kept for readers.

test("the latitude/longitude list draws its arrows on the font's pixel grid", async ({ page }) => {
  await page.goto("/writing/what-are-embeddings");
  const arrows = page.getByTestId("pixel-arrow");
  await expect(arrows).toHaveCount(2);
  const { height, fontSize, text } = await arrows.first().evaluate((svg) => ({
    height: svg.getBoundingClientRect().height,
    fontSize: parseFloat(getComputedStyle(svg.parentElement!).fontSize),
    text: svg.parentElement!.textContent,
  }));
  expect(height).toBeCloseTo((fontSize * 7) / 13, 1);
  expect(text).toContain("→");
  // ...but only for screen readers: the fallback-font glyph must not show
  const hidden = await arrows.first().evaluate((svg) => {
    const span = svg.nextElementSibling!;
    const r = span.getBoundingClientRect();
    return getComputedStyle(span).position === "absolute" && r.width <= 1 && r.height <= 1;
  });
  expect(hidden).toBe(true);
});
