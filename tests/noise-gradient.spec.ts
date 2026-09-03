import { expect, test } from "@playwright/test";

test("/noise-gradient renders one static grainy conic background", async ({
  page,
}) => {
  await page.goto("/noise-gradient");

  const study = page.getByTestId("noise-gradient-study");

  await expect(study).toBeVisible();
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(17, 17, 17)",
  );
  await expect(study).toHaveCSS("background-color", "rgb(255, 20, 147)");
  await expect(study).toHaveCSS(
    "background-blend-mode",
    "color, soft-light, normal",
  );
  await expect(study).toHaveCSS(
    "background-size",
    "100% 100%, 400px 310px, 100% 100%",
  );
  await expect(study).toHaveCSS(
    "background-repeat",
    "no-repeat, repeat, no-repeat",
  );
  await expect(study).toHaveCSS("mask-image", "none");

  const backgroundImage = await study.evaluate(
    (element) => getComputedStyle(element).backgroundImage,
  );

  expect(backgroundImage).toContain("linear-gradient");
  expect(backgroundImage).toContain("data:image/svg+xml");
  expect(backgroundImage).toContain("feTurbulence");
  expect(backgroundImage).toContain("fractalNoise");
  expect(backgroundImage).toContain("0.55");
  expect(backgroundImage).toContain("conic-gradient(at 50% 70%");
  expect(backgroundImage).toContain("rgb(0, 0, 0) 90deg");
  expect(backgroundImage).toContain("rgb(255, 255, 255) 270deg");

  await expect(study.locator(":scope > *")).toHaveCount(0);
  await expect(page.locator("select, input[type='range']")).toHaveCount(0);
});
