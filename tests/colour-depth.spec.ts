import { expect, test } from "@playwright/test";

// The colour-depth explorer in "What Are Embeddings": it escapes the Game
// Boy quantiser, its stats and sliders follow the depth, the picture is an
// eyedropper, and the cube mounts a WebGL canvas.

const ROUTE = "/writing/what-are-embeddings";

test.describe("colour-depth explorer", () => {
  test("shows true colour and follows the depth slider", async ({ page }) => {
    await page.goto(ROUTE);
    const explorer = page.getByTestId("colour-depth");
    await explorer.scrollIntoViewIfNeeded();
    await expect(explorer).toBeVisible();
    expect(await explorer.evaluate((el) => getComputedStyle(el).filter)).toBe("none");
    // Departure Mono at 11px: one font pixel per CSS px, inside the Game Boy page's own face.
    const stat = page.getByTestId("stat-max");
    expect(await stat.evaluate((el) => getComputedStyle(el).fontSize)).toBe("11px");
    expect(await stat.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/departure/i);

    await expect(page.getByTestId("stat-colours")).toHaveText("16,777,216");
    await page.getByTestId("depth").fill("0"); // the first stop, 1 bit
    await expect(page.getByTestId("stat-max")).toHaveText("1");
    await expect(page.getByTestId("stat-colours")).toHaveText("8");
    await expect(page.getByTestId("channel-R")).toHaveAttribute("max", "1");
    // At 1 bit every channel is all or nothing.
    for (const ch of ["R", "G", "B"]) await expect(page.getByTestId(`channel-${ch}`)).toHaveValue(/^[01]$/);
    // the cube draws only the picture's colours: at most 8 at 1 bit
    // (it reads "…" until the picture has loaded, so wait for a number)
    await expect(page.getByTestId("stat-used")).toHaveText(/^[2-8]$/);

    // The last stop is 16 bits, not 5: the slider moves through stops, not bits.
    await page.getByTestId("depth").fill("5");
    await expect(page.getByTestId("stat-max")).toHaveText("65,535");
    await expect(page.getByTestId("channel-R")).toHaveAttribute("max", "65535");
  });

  test("clicking the picture picks its colour", async ({ page }) => {
    await page.goto(ROUTE);
    const photo = page.getByTestId("photo");
    await photo.scrollIntoViewIfNeeded();
    // wait until the picture has been drawn
    await expect
      .poll(() => photo.evaluate((c: HTMLCanvasElement) => c.getContext("2d")!.getImageData(600, 1000, 1, 1).data[3]))
      .toBe(255);
    const chip = page.getByTestId("chip");
    const before = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
    const box = (await photo.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.85); // the pitch
    await expect.poll(() => chip.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
  });

  test("hovering the picture shows the loupe with the colour under the pointer", async ({ page }) => {
    await page.goto(ROUTE);
    const photo = page.getByTestId("photo");
    await photo.scrollIntoViewIfNeeded();
    await expect
      .poll(() => photo.evaluate((c: HTMLCanvasElement) => c.getContext("2d")!.getImageData(600, 1000, 1, 1).data[3]))
      .toBe(255);
    const loupe = page.getByTestId("loupe");
    await expect(loupe).toBeHidden();
    const box = (await photo.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.85);
    await expect(loupe).toBeVisible();
    // a 48px square with no numbers in it
    await expect(loupe).toHaveText("");
    const lens = (await loupe.locator("canvas").boundingBox())!;
    expect([lens.width, lens.height]).toEqual([48, 48]);
    await page.mouse.move(box.x - 40, box.y - 40);
    await expect(loupe).toBeHidden();
  });

  test("the colour window keeps its size whatever the numbers", async ({ page }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(ROUTE);
      const windowBox = page.getByTestId("chip").locator("xpath=ancestor::section[1]");
      await windowBox.scrollIntoViewIfNeeded();
      const sizes = new Set<string>();
      for (const stop of ["0", "4", "5"]) {
        await page.getByTestId("depth").fill(stop); // 1, 8 and 16 bits
        for (const level of ["0", "1"]) {
          await page.getByTestId("channel-G").fill(level);
          const box = (await windowBox.boundingBox())!;
          sizes.add(`${box.width}×${box.height}`);
        }
      }
      expect([...sizes], `at ${width}px`).toHaveLength(1);
    }
  });

  test("the cube mounts a canvas", async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.getByTestId("rgb-cube").locator("canvas")).toHaveCount(1);
  });

  test("no horizontal scroll on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTE);
    await page.getByTestId("colour-depth").scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
