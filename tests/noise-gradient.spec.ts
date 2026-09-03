import { expect, test } from "@playwright/test";

test("/noise-gradient renders an SVG-turbulence grainy gradient", async ({ page }) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();

  const grain = page.getByTestId("grainy-conic-gradient");

  const grainStyles = await grain.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundBlendMode: styles.backgroundBlendMode,
      backgroundImage: styles.backgroundImage,
      filter: styles.filter,
    };
  });

  expect(grainStyles.backgroundImage).toContain("conic-gradient");
  expect(grainStyles.backgroundImage).toContain("at 50% 70%");
  expect(grainStyles.backgroundImage).toContain("rgb(255, 225, 0)");
  expect(grainStyles.backgroundImage).toContain(
    "rgba(255, 128, 0, 0.5)",
  );
  expect(grainStyles.backgroundImage).toContain("rgb(228, 0, 0)");
  expect(grainStyles.backgroundImage).toContain("noise-gradient-noise.svg");
  expect(grainStyles.backgroundImage).not.toContain("noise-gradient.png");
  expect(grainStyles.backgroundBlendMode).toContain("multiply");
  expect(grainStyles.filter).toBe("contrast(1.7) brightness(10)");

  const noiseSvg = await page.request.get("/noise-gradient-noise.svg");
  expect(noiseSvg.ok()).toBe(true);
  const noiseSource = await noiseSvg.text();
  expect(noiseSource).toContain("<feTurbulence");
  expect(noiseSource).toContain('type="fractalNoise"');
  expect(noiseSource).toContain('stitchTiles="stitch"');
  await expect(page.locator("input, select, output")).toHaveCount(0);
});
