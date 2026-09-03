import { expect, test } from "@playwright/test";

test("/noise-gradient blends a noise PNG with a conic gradient", async ({ page }) => {
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
  expect(layerStyles.gradient.backgroundImage).toContain(
    "at 50% calc(100% - 5px)",
  );
  expect(layerStyles.gradient.backgroundImage).toContain("rgb(255, 225, 0)");
  expect(layerStyles.gradient.backgroundImage).toContain(
    "rgba(255, 128, 0, 0.5)",
  );
  expect(layerStyles.gradient.backgroundImage).toContain("rgb(228, 0, 0)");
  expect(layerStyles.gradient.zIndex).toBe("1");
  expect(layerStyles.noise.backgroundImage).toContain("noise-gradient.png");
  expect(layerStyles.noise.zIndex).toBe("0");

  const blendMode = page.getByLabel("Blend mode");
  await expect(blendMode).toHaveValue("soft-light");

  await blendMode.selectOption("multiply");
  await expect(layers.gradient).toHaveCSS("mix-blend-mode", "multiply");
});
