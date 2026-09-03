import { expect, test } from "@playwright/test";

test("/noise-gradient renders a static noise-and-gradient study", async ({ page }) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();

  const layers = {
    gradient: page.getByTestId("conic-gradient-layer"),
    noise: page.getByTestId("noise-layer"),
  };

  const layerStyles = await page.evaluate(() => {
    const gradient = getComputedStyle(
      document.querySelector('[data-testid="conic-gradient-layer"]')!,
    );
    const noise = getComputedStyle(
      document.querySelector('[data-testid="noise-layer"]')!,
    );

    return {
      gradient: { backgroundImage: gradient.backgroundImage, zIndex: gradient.zIndex },
      noise: { backgroundImage: noise.backgroundImage, zIndex: noise.zIndex },
    };
  });

  expect(layerStyles.gradient.backgroundImage).toContain("conic-gradient");
  expect(layerStyles.gradient.backgroundImage).toContain("at 50% 70%");
  expect(layerStyles.gradient.backgroundImage).toContain("rgb(255, 225, 0)");
  expect(layerStyles.gradient.backgroundImage).toContain(
    "rgba(255, 128, 0, 0.5)",
  );
  expect(layerStyles.gradient.backgroundImage).toContain("rgb(228, 0, 0)");
  expect(layerStyles.gradient.zIndex).toBe("1");

  expect(layerStyles.noise.backgroundImage).toContain("noise-gradient.png");
  expect(layerStyles.noise.backgroundImage).toContain("radial-gradient");
  expect(layerStyles.noise.zIndex).toBe("0");
  await expect(layers.noise).toHaveCSS("mix-blend-mode", "screen");
  await expect(layers.noise).toHaveCSS(
    "filter",
    "contrast(1.45) brightness(6.5) invert(1)",
  );
  await expect(layers.gradient).toHaveCSS("mix-blend-mode", "soft-light");
  await expect(page.locator("input, select, output")).toHaveCount(0);
});
