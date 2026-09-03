import { expect, test } from "@playwright/test";

test("/noise-gradient renders separate black and white SVG-noise gradients", async ({
  page,
}) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(17, 17, 17)",
  );

  const isolate = page.getByTestId("gradient-isolate");
  const background = page.getByTestId("pink-background-layer");
  const whiteNoise = page.getByTestId("white-noise-gradient");
  const blackNoise = page.getByTestId("black-noise-gradient");
  const colorLayer = page.getByTestId("pink-color-layer");
  const contrast = page.getByLabel("Noise contrast");
  const brightness = page.getByLabel("Noise brightness");

  await expect(background).toHaveCSS("background-color", "rgb(255, 20, 147)");
  await expect(background).toHaveCSS("z-index", "0");
  await expect(whiteNoise).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(whiteNoise).toHaveCSS("mix-blend-mode", "screen");
  await expect(whiteNoise).toHaveCSS("z-index", "1");
  await expect(whiteNoise).toHaveCSS(
    "mask-image",
    /conic-gradient\(at 50% 70%/,
  );
  await expect(blackNoise).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(blackNoise).toHaveCSS("mix-blend-mode", "multiply");
  await expect(blackNoise).toHaveCSS("z-index", "1");
  await expect(blackNoise).toHaveCSS(
    "mask-image",
    /conic-gradient\(at 50% 70%/,
  );
  await expect(colorLayer).toHaveCSS("background-color", "rgb(255, 20, 147)");
  await expect(colorLayer).toHaveCSS("mix-blend-mode", "color");
  await expect(colorLayer).toHaveCSS("z-index", "2");

  await expect(isolate).toHaveCSS("isolation", "isolate");
  const backgroundMode = page.getByLabel("Background blend mode");
  const mixMode = page.getByLabel("Mix blend mode");

  await expect(backgroundMode).toHaveValue("color");
  await expect(mixMode).toHaveValue("luminosity");
  await expect(colorLayer).toHaveCSS("mix-blend-mode", "color");
  await expect(whiteNoise).toHaveCSS("background-blend-mode", "luminosity");
  await expect(blackNoise).toHaveCSS("background-blend-mode", "luminosity");

  for (const noise of [whiteNoise, blackNoise]) {
    const noiseBackground = await noise.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
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
      "grayscale(1) contrast(1) brightness(1)",
    );
  }

  await expect(contrast).toHaveValue("100");
  await expect(brightness).toHaveValue("100");
  await expect(contrast).toHaveAttribute("min", "0");
  await expect(contrast).toHaveAttribute("max", "1000");
  await expect(contrast).toHaveAttribute("step", "10");
  await expect(brightness).toHaveAttribute("min", "0");
  await expect(brightness).toHaveAttribute("max", "3000");
  await expect(brightness).toHaveAttribute("step", "25");

  await backgroundMode.selectOption("hue");
  await expect(colorLayer).toHaveCSS("mix-blend-mode", "hue");

  await mixMode.selectOption("screen");
  await expect(whiteNoise).toHaveCSS("background-blend-mode", "screen");
  await expect(blackNoise).toHaveCSS("background-blend-mode", "screen");

  await contrast.fill("1000");
  await brightness.fill("3000");
  for (const noise of [whiteNoise, blackNoise]) {
    await expect(noise).toHaveCSS(
      "filter",
      "grayscale(1) contrast(10) brightness(30)",
    );
  }
  await expect(page.getByText("1000%", { exact: true })).toBeVisible();
  await expect(page.getByText("3000%", { exact: true })).toBeVisible();
});
