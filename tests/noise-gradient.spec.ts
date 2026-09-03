import { expect, test } from "@playwright/test";

test("/noise-gradient renders an SVG-turbulence grainy gradient", async ({ page }) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(17, 17, 17)",
  );

  const isolate = page.getByTestId("gradient-isolate");
  const background = page.getByTestId("pink-background-layer");
  const gradient = page.getByTestId("conic-gradient-layer");
  const noise = page.getByTestId("noise-background-layer");
  const maskToggle = page.getByLabel("Noise mask");
  const contrast = page.getByLabel("Noise contrast");
  const brightness = page.getByLabel("Noise brightness");
  const leftPalette = page.getByTestId("left-palette-guard");
  const rightPalette = page.getByTestId("right-palette-guard");
  const centerPalette = page.getByTestId("center-pink-guard");

  const gradientStyles = await gradient.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      zIndex: styles.zIndex,
    };
  });

  expect(gradientStyles.backgroundImage).toContain("conic-gradient");
  expect(gradientStyles.backgroundImage).toContain("rgb(255, 255, 255)");
  expect(gradientStyles.backgroundImage).toContain("rgb(0, 0, 0)");
  expect(
    gradientStyles.backgroundImage.indexOf("rgb(0, 0, 0)"),
  ).toBeLessThan(
    gradientStyles.backgroundImage.indexOf("rgb(255, 255, 255)"),
  );
  expect(gradientStyles.zIndex).toBe("2");
  await expect(background).toHaveCSS("background-color", "rgb(255, 20, 147)");
  await expect(background).toHaveCSS("z-index", "0");
  await expect(leftPalette).toHaveCSS("background-color", "rgb(255, 20, 147)");
  await expect(leftPalette).toHaveCSS("mix-blend-mode", "screen");
  await expect(leftPalette).toHaveCSS(
    "mask-image",
    /conic-gradient\(at 50% 70%/,
  );
  await expect(rightPalette).toHaveCSS("background-color", "rgb(255, 20, 147)");
  await expect(rightPalette).toHaveCSS("mix-blend-mode", "multiply");
  await expect(rightPalette).toHaveCSS(
    "mask-image",
    /conic-gradient\(at 50% 70%/,
  );
  await expect(centerPalette).toHaveCSS(
    "background-color",
    "rgb(255, 20, 147)",
  );
  await expect(centerPalette).toHaveCSS("mix-blend-mode", "normal");
  await expect(centerPalette).toHaveCSS("z-index", "4");
  await expect(centerPalette).toHaveCSS(
    "mask-image",
    /conic-gradient\(at 50% 70%/,
  );

  await expect(isolate).toHaveCSS("isolation", "isolate");
  const backgroundMode = page.getByLabel("Background blend mode");
  const mixMode = page.getByLabel("Mix blend mode");

  await expect(backgroundMode).toHaveValue("hue");
  await expect(mixMode).toHaveValue("luminosity");
  await expect(noise).toHaveCSS("background-blend-mode", "hue");
  await expect(gradient).toHaveCSS("mix-blend-mode", "luminosity");
  const noiseBackground = await noise.evaluate(
    (element) => getComputedStyle(element).backgroundImage,
  );
  expect(noiseBackground).not.toContain("conic-gradient");
  await expect(noise).toHaveCSS("background-size", "400px 310px");
  await expect(noise).toHaveCSS("background-position", "50% 50%");
  await expect(noise).toHaveCSS("background-repeat", "repeat");
  expect(noiseBackground).not.toContain("radial-gradient");
  expect(noiseBackground).toContain("data:image/svg+xml");
  expect(noiseBackground).toContain("feTurbulence");
  expect(noiseBackground).toContain("fractalNoise");
  expect(noiseBackground).toContain("0.55");
  await expect(noise).toHaveCSS(
    "filter",
    "grayscale(1) contrast(1.5) brightness(7)",
  );
  await expect(noise).toHaveCSS("z-index", "0");
  await expect(noise).toHaveCSS("mask-image", "none");
  await expect(maskToggle).not.toBeChecked();
  await expect(contrast).toHaveValue("150");
  await expect(brightness).toHaveValue("700");
  await expect(contrast).toHaveAttribute("min", "0");
  await expect(contrast).toHaveAttribute("max", "1000");
  await expect(contrast).toHaveAttribute("step", "10");
  await expect(brightness).toHaveAttribute("min", "0");
  await expect(brightness).toHaveAttribute("max", "3000");
  await expect(brightness).toHaveAttribute("step", "25");

  await backgroundMode.selectOption("screen");
  await expect(noise).toHaveCSS("background-blend-mode", "screen");

  await mixMode.selectOption("normal");
  await expect(gradient).toHaveCSS("mix-blend-mode", "normal");

  await maskToggle.check();
  await expect(maskToggle).toBeChecked();
  await expect(noise).toHaveCSS(
    "mask-image",
    /conic-gradient\(at 50% 70%/,
  );
  await expect(noise).toHaveCSS("background-size", "400px 310px");

  await contrast.fill("1000");
  await brightness.fill("3000");
  await expect(noise).toHaveCSS(
    "filter",
    "grayscale(1) contrast(10) brightness(30)",
  );
  await expect(page.getByText("1000%", { exact: true })).toBeVisible();
  await expect(page.getByText("3000%", { exact: true })).toBeVisible();
});
