import { expect, test } from "@playwright/test";

const TOLERANCE_PX = 1;
const ANGLE_TOLERANCE_DEGREES = 0.01;

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function panelRects(page: import("@playwright/test").Page): Promise<[Rect, Rect]> {
  // LandingSeam's two panels are deliberately the direct children of its
  // only <main>. Keep this relationship-based selector independent of the
  // CSS Module's generated class names.
  const panels = page.locator("main > div");
  await expect(panels).toHaveCount(2);

  const rects = await panels.evaluateAll((elements) =>
    elements.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }),
  );

  return rects as [Rect, Rect];
}

function expectNearlyEqual(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE_PX);
}

async function desktopSeamAngle(
  page: import("@playwright/test").Page,
) {
  const scene = page.locator("main");

  await expect
    .poll(() =>
      scene.evaluate((element) =>
        element.style.getPropertyValue("--seam-angle"),
      ),
    )
    .not.toBe("");

  return scene.evaluate((element) => {
    const [primary, secondary] = Array.from(element.children);
    const sceneRect = element.getBoundingClientRect();
    const primaryRect = primary.getBoundingClientRect();
    const secondaryRect = secondary.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    return {
      scene: {
        x: sceneRect.x,
        y: sceneRect.y,
        width: sceneRect.width,
        height: sceneRect.height,
      },
      primary: {
        x: primaryRect.x,
        y: primaryRect.y,
        width: primaryRect.width,
        height: primaryRect.height,
      },
      secondary: {
        x: secondaryRect.x,
        y: secondaryRect.y,
        width: secondaryRect.width,
        height: secondaryRect.height,
      },
      pivotXPercent: Number.parseFloat(
        styles.getPropertyValue("--gradient-center-desktop-x"),
      ),
      pivotYPercent: Number.parseFloat(
        styles.getPropertyValue("--gradient-center-desktop-y"),
      ),
      seamAngle: Number.parseFloat(styles.getPropertyValue("--seam-angle")),
    };
  });
}

test.describe("landing seam geometry", () => {
  test("keeps the desktop panels landscape and pinned to opposite corners", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const [primary, secondary] = await panelRects(page);
    const secondaryRightInset = 1440 - secondary.x - secondary.width;
    const secondaryBottomInset = 900 - secondary.y - secondary.height;

    expectNearlyEqual(primary.width, secondary.width);
    expectNearlyEqual(primary.height, secondary.height);
    expectNearlyEqual(primary.x, primary.y);
    expectNearlyEqual(secondaryRightInset, secondaryBottomInset);
    expectNearlyEqual(primary.x, secondaryRightInset);
    expect(primary.width / primary.height).toBeGreaterThan(1.5);

    const seam = await desktopSeamAngle(page);
    const pivotX = (seam.scene.width * seam.pivotXPercent) / 100;
    const pivotY = (seam.scene.height * seam.pivotYPercent) / 100;
    const gapCenterX =
      (seam.primary.x + seam.primary.width + seam.secondary.x) / 2 -
      seam.scene.x;
    const gapCenterY =
      (seam.primary.y + seam.primary.height + seam.secondary.y) / 2 -
      seam.scene.y;
    const expectedAngle =
      Math.atan2(gapCenterX - pivotX, -(gapCenterY - pivotY)) *
      (180 / Math.PI);

    expect(Math.abs(seam.seamAngle - expectedAngle)).toBeLessThanOrEqual(
      ANGLE_TOLERANCE_DEGREES,
    );
  });

  test("keeps the narrow portrait panels stacked on their shared left edge", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const [primary, secondary] = await panelRects(page);

    expectNearlyEqual(primary.width, secondary.width);
    expectNearlyEqual(primary.x, secondary.x);
    expect(secondary.y).toBeGreaterThanOrEqual(primary.y + primary.height);
  });

  test("keeps the narrow landscape panels side by side in opposite corners", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/");

    const [primary, secondary] = await panelRects(page);
    const secondaryRightInset = 844 - secondary.x - secondary.width;
    const secondaryBottomInset = 390 - secondary.y - secondary.height;

    expectNearlyEqual(primary.height, secondary.height);
    expectNearlyEqual(primary.x, primary.y);
    expectNearlyEqual(secondaryRightInset, secondaryBottomInset);
    expectNearlyEqual(primary.x, secondaryRightInset);
    expect(secondary.x).toBeGreaterThanOrEqual(primary.x + primary.width);
  });
});
