import { expect, test } from "@playwright/test";

test("/noise-gradient renders an SVG-turbulence grainy gradient", async ({ page }) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();

  const isolate = page.getByTestId("gradient-isolate");
  const gradient = page.getByTestId("conic-gradient-layer");
  const noise = page.getByTestId("noise-background-layer");

  const gradientStyles = await gradient.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      zIndex: styles.zIndex,
    };
  });

  expect(gradientStyles.backgroundImage).toContain("conic-gradient");
  expect(gradientStyles.backgroundImage).toContain("at 50% 70%");
  expect(gradientStyles.backgroundImage).toContain("rgb(0, 0, 0)");
  expect(gradientStyles.backgroundImage).toContain("rgb(255, 128, 0)");
  expect(gradientStyles.backgroundImage).toContain("rgb(255, 255, 255)");
  expect(gradientStyles.zIndex).toBe("1");

  await expect(isolate).toHaveCSS("isolation", "isolate");
  await expect(gradient).toHaveCSS("mix-blend-mode", "multiply");
  await expect(noise).toHaveCSS(
    "background-image",
    /noise-gradient-noise\.svg/,
  );
  await expect(noise).toHaveCSS(
    "filter",
    "contrast(1.45) brightness(6.5) invert(1)",
  );
  await expect(noise).toHaveCSS("z-index", "0");

  const noiseSvg = await page.request.get("/noise-gradient-noise.svg");
  expect(noiseSvg.ok()).toBe(true);
  const noiseSource = await noiseSvg.text();
  expect(noiseSource).toContain("<feTurbulence");
  expect(noiseSource).toContain('type="fractalNoise"');
  expect(noiseSource).toContain('baseFrequency="0.65"');
  expect(noiseSource).toContain('numOctaves="3"');
  expect(noiseSource).toContain('stitchTiles="stitch"');
  await expect(page.locator("input, select, output")).toHaveCount(0);
});
