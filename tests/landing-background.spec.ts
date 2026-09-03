import { expect, test } from "@playwright/test";

test.describe("landing background", () => {
  test("layers repeating hard-light noise over the black, orange, and white seam", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Guillem Gelabert" }),
    ).toBeVisible();

    const background = await page.locator("main").evaluate((element) => {
      const primaryPanel = element.children.item(0);
      const primaryContent = primaryPanel?.firstElementChild;
      const styles = window.getComputedStyle(element);

      return {
        image: styles.backgroundImage,
        size: styles.backgroundSize,
        repeat: styles.backgroundRepeat,
        blendMode: styles.backgroundBlendMode,
        borderBlendMode: primaryPanel
          ? window.getComputedStyle(primaryPanel, "::before").mixBlendMode
          : "",
        contentBlendMode: primaryContent
          ? window.getComputedStyle(primaryContent).mixBlendMode
          : "",
      };
    });

    expect(background.image).toContain("noise-gradient.png");
    expect(background.image).toContain("conic-gradient");
    expect(background.image.indexOf("noise-gradient.png")).toBeLessThan(
      background.image.indexOf("conic-gradient"),
    );
    expect(background.size.split(",")[0]?.trim()).toBe("256px 256px");
    expect(background.repeat.split(",")[0]?.trim()).toBe("repeat");
    expect(
      background.blendMode.split(",").map((mode) => mode.trim()),
    ).toContain("hard-light");

    const conic = background.image.slice(
      background.image.indexOf("conic-gradient"),
    );
    const black = conic.indexOf("rgb(0, 0, 0)");
    const orange = conic.indexOf("rgb(255, 128, 0)");
    const white = conic.indexOf("rgb(255, 255, 255)");

    expect(black).toBeGreaterThanOrEqual(0);
    expect(orange).toBeGreaterThan(black);
    expect(white).toBeGreaterThan(orange);
    expect(background.borderBlendMode).toBe("difference");
    expect(background.contentBlendMode).toBe("difference");
  });
});
