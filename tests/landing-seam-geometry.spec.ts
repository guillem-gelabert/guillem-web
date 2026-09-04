import { expect, test } from "@playwright/test";
import { resolveSceneLength, seamAngleDegrees } from "./seam-geometry";

const TOLERANCE_PX = 1;
const ANGLE_TOLERANCE_DEGREES = 0.01;

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// The two corner boxes the seam is measured between: the nameplate's
// top-left stack and the case study's bottom-right stack. Their facing
// corners (nameplate's bottom-right, case study's top-left) pinch the gap
// the seam runs through — see landing-seam.tsx's file comment.
async function panelRects(page: import("@playwright/test").Page): Promise<[Rect, Rect]> {
  const primary = page.locator("#seam-nameplate");
  const secondary = page.locator("#seam-case-study");

  const [primaryRect, secondaryRect] = await Promise.all([
    primary.evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }),
    secondary.evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }),
  ]);

  return [primaryRect, secondaryRect];
}

function expectNearlyEqual(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE_PX);
}

async function desktopSeamAngle(page: import("@playwright/test").Page) {
  const scene = page.locator("#seam-scene");

  const seamAngle = await seamAngleDegrees(page, scene);
  const pivotXPercent = await scene.evaluate((element) =>
    Number.parseFloat(
      getComputedStyle(element).getPropertyValue("--gradient-center-desktop-x"),
    ),
  );
  const pivotYPercent = await scene.evaluate((element) =>
    Number.parseFloat(
      getComputedStyle(element).getPropertyValue("--gradient-center-desktop-y"),
    ),
  );
  const pivotX = await resolveSceneLength(scene, "--gradient-center-x");
  const pivotY = await resolveSceneLength(scene, "--gradient-center-y");

  const sceneRect = await scene.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  });
  const [primary, secondary] = await panelRects(page);

  return {
    scene: sceneRect,
    primary,
    secondary,
    pivotXPercent,
    pivotYPercent,
    pivotX,
    pivotY,
    seamAngle,
  };
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
    // The nameplate box is a 1.16 rectangle by construction (its own
    // module CSS comment); the case study mirrors that proportion.
    expect(primary.width / primary.height).toBeGreaterThan(1);
    expect(primary.width / primary.height).toBeLessThan(1.3);

    const seam = await desktopSeamAngle(page);
    const gapCenterX =
      (seam.primary.x + seam.primary.width + seam.secondary.x) / 2 -
      seam.scene.x;
    const gapCenterY =
      (seam.primary.y + seam.primary.height + seam.secondary.y) / 2 -
      seam.scene.y;
    const pivotX = seam.pivotX - seam.scene.x;
    const pivotY = seam.pivotY - seam.scene.y;
    const expectedAngle =
      Math.atan2(gapCenterX - pivotX, -(gapCenterY - pivotY)) *
      (180 / Math.PI);

    expect(Math.abs(seam.seamAngle - expectedAngle)).toBeLessThanOrEqual(
      ANGLE_TOLERANCE_DEGREES,
    );
  });

  test("keeps the narrow portrait panels stacked on their shared left edge", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto("/");

    const isCoarse = await page.evaluate(() =>
      matchMedia("(hover: none) and (pointer: coarse)").matches,
    );
    expect(isCoarse).toBe(true);

    const [primary, secondary] = await panelRects(page);

    expectNearlyEqual(primary.width, secondary.width);
    expectNearlyEqual(primary.x, secondary.x);
    expect(secondary.y).toBeGreaterThanOrEqual(primary.y + primary.height);

    await context.close();
  });

  test("keeps the narrow landscape panels side by side in opposite corners", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 844, height: 390 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto("/");

    const isCoarse = await page.evaluate(() =>
      matchMedia("(hover: none) and (pointer: coarse)").matches,
    );
    expect(isCoarse).toBe(true);

    const [primary, secondary] = await panelRects(page);
    const secondaryRightInset = 844 - secondary.x - secondary.width;
    const secondaryBottomInset = 390 - secondary.y - secondary.height;

    expectNearlyEqual(secondaryRightInset, secondaryBottomInset);
    expect(secondary.x).toBeGreaterThanOrEqual(primary.x + primary.width);

    await context.close();
  });
});
