import { expect, test } from "@playwright/test";

test("/noise-gradient blends a noise PNG with a conic gradient", async ({ page }) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();

  const layers = {
    gradient: page.getByTestId("conic-gradient-layer"),
    noise: page.getByTestId("noise-layer"),
  };

  const backgrounds = await page.evaluate(() => ({
    gradient: getComputedStyle(
      document.querySelector('[data-testid="conic-gradient-layer"]')!,
    ).backgroundImage,
    noise: getComputedStyle(
      document.querySelector('[data-testid="noise-layer"]')!,
    ).backgroundImage,
  }));

  expect(backgrounds.gradient).toContain("conic-gradient");
  expect(backgrounds.noise).toContain("noise-gradient.png");

  const blendMode = page.getByLabel("Blend mode");
  await expect(blendMode).toHaveValue("soft-light");

  await blendMode.selectOption("multiply");
  await expect(layers.noise).toHaveCSS("mix-blend-mode", "multiply");
});
