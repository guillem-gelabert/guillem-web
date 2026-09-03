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

  await expect(page.getByLabel("yellow", { exact: true })).toHaveValue(
    "#ffe100",
  );
  const orange = page.getByLabel("orange", { exact: true });
  await expect(orange).toHaveValue("#ff8000");
  await expect(page.getByLabel("red", { exact: true })).toHaveValue(
    "#e40000",
  );

  const yellowAlpha = page.getByLabel("yellow alpha", { exact: true });
  await expect(yellowAlpha).toHaveValue("100");
  await expect(page.getByLabel("orange alpha", { exact: true })).toHaveValue(
    "50",
  );
  await expect(page.getByLabel("red alpha", { exact: true })).toHaveValue(
    "100",
  );
  await expect(page.locator('output[for="yellow-alpha"]')).toHaveText("100%");
  await expect(page.locator('output[for="orange-alpha"]')).toHaveText("50%");
  await expect(page.locator('output[for="red-alpha"]')).toHaveText("100%");

  await yellowAlpha.focus();
  await yellowAlpha.press("ArrowLeft");
  await expect(yellowAlpha).toHaveValue("99");
  await expect(page.locator('output[for="yellow-alpha"]')).toHaveText("99%");
  await expect.poll(async () => {
    return layers.gradient.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
  }).toContain("rgba(255, 225, 0, 0.99)");
  await expect.poll(async () => {
    return layers.gradient.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
  }).toContain("rgba(255, 128, 0, 0.5)");
  await expect.poll(async () => {
    return layers.gradient.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
  }).toContain("rgb(228, 0, 0)");

  await orange.evaluate((input: HTMLInputElement) => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    setValue?.call(input, "#00ff00");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect.poll(async () => {
    return layers.gradient.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
  }).toContain("rgba(0, 255, 0, 0.5)");

  const blendMode = page.getByLabel("Blend mode");
  await expect(blendMode).toHaveValue("soft-light");

  await blendMode.selectOption("multiply");
  await expect(layers.gradient).toHaveCSS("mix-blend-mode", "multiply");
});
