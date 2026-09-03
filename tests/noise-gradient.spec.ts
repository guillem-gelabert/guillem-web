import { expect, test } from "@playwright/test";

test("/noise-gradient renders an SVG-turbulence grainy gradient", async ({ page }) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(17, 17, 17)",
  );

  const isolate = page.getByTestId("gradient-isolate");
  const background = page.getByTestId("orange-background-layer");
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
  expect(gradientStyles.backgroundImage).toContain("rgb(255, 255, 255)");
  expect(gradientStyles.backgroundImage).toContain("rgb(0, 0, 0)");
  expect(
    gradientStyles.backgroundImage.indexOf("rgb(0, 0, 0)"),
  ).toBeLessThan(
    gradientStyles.backgroundImage.indexOf("rgb(255, 255, 255)"),
  );
  expect(gradientStyles.zIndex).toBe("2");
  await expect(background).toHaveCSS("background-color", "rgb(255, 128, 0)");
  await expect(background).toHaveCSS("z-index", "0");

  await expect(isolate).toHaveCSS("isolation", "isolate");
  const backgroundMode = page.getByLabel("Background blend mode");
  const mixMode = page.getByLabel("Mix blend mode");

  await expect(backgroundMode).toHaveValue("normal");
  await expect(mixMode).toHaveValue("soft-light");
  await expect(noise).toHaveCSS("background-blend-mode", "normal, normal");
  await expect(gradient).toHaveCSS("mix-blend-mode", "soft-light");
  const noiseBackground = await noise.evaluate(
    (element) => getComputedStyle(element).backgroundImage,
  );
  expect(noiseBackground).toContain("conic-gradient(at 50% 70%");
  expect(noiseBackground).toContain("rgba(0, 0, 0, 0)");
  expect(noiseBackground).toContain("rgb(0, 0, 0)");
  expect(noiseBackground).not.toContain("radial-gradient");
  expect(noiseBackground).toContain("data:image/svg+xml");
  expect(noiseBackground).toContain("feTurbulence");
  expect(noiseBackground).toContain("fractalNoise");
  expect(noiseBackground).toContain("0.55");
  await expect(noise).toHaveCSS(
    "filter",
    "grayscale(1) contrast(1.5) brightness(7)",
  );
  await expect(noise).toHaveCSS("z-index", "1");

  await backgroundMode.selectOption("screen");
  await expect(noise).toHaveCSS("background-blend-mode", "screen, screen");

  await mixMode.selectOption("normal");
  await expect(gradient).toHaveCSS("mix-blend-mode", "normal");
});
