import { expect, test } from "@playwright/test";

test("/noise-gradient renders an SVG-turbulence grainy gradient", async ({ page }) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();

  const gradient = page.getByTestId("conic-gradient-layer");
  const noise = page.getByTestId("svg-noise-layer");

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
  expect(gradientStyles.zIndex).toBe("0");

  await expect(noise).toHaveCSS("mix-blend-mode", "multiply");
  await expect(noise).toHaveCSS(
    "filter",
    "contrast(1.7) brightness(1)",
  );
  await expect(noise).toHaveCSS("z-index", "1");

  const turbulence = noise.locator("feTurbulence");
  await expect(turbulence).toHaveAttribute("type", "fractalNoise");
  await expect(turbulence).toHaveAttribute("baseFrequency", "0.65");
  await expect(turbulence).toHaveAttribute("numOctaves", "3");
  await expect(turbulence).toHaveAttribute("stitchTiles", "stitch");
  await expect(page.locator("input, select, output")).toHaveCount(0);
});
