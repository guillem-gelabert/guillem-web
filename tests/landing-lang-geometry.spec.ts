import { expect, test } from "@playwright/test";
import {
  acrossSeam,
  alongSeam,
  elementCenter,
  resolveSceneLength,
  seamAngleDegrees,
} from "./seam-geometry";

const TOLERANCE_PX = 1;

const DESKTOP_VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
];

test.describe("landing language switch geometry — desktop", () => {
  for (const viewport of DESKTOP_VIEWPORTS) {
    test(`straddles the seam inside the margins at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      const scene = page.locator("#seam-scene");
      const lang = page.locator("#seam-lang");
      const en = page.locator(".seam-lang-en");
      const de = page.locator(".seam-lang-de");
      const caseStudyHead = page.locator("#seam-case-study-head");

      const angle = await seamAngleDegrees(page, scene);
      const pivot = {
        x: await resolveSceneLength(scene, "--gradient-center-x"),
        y: await resolveSceneLength(scene, "--gradient-center-y"),
      };
      const edgeTop = await resolveSceneLength(scene, "--edge-top");
      const edgeRight = await resolveSceneLength(scene, "--edge-right");

      const langCenter = await elementCenter(lang);
      const enCenter = await elementCenter(en);
      const deCenter = await elementCenter(de);

      // The seam splits the block down its own centre.
      expect(Math.abs(acrossSeam(langCenter, pivot, angle))).toBeLessThanOrEqual(
        TOLERANCE_PX,
      );

      // EN and DE sit on opposite sides, equally far from the seam — EN on
      // the nameplate's (negative-normal) side.
      const acrossEN = acrossSeam(enCenter, pivot, angle);
      const acrossDE = acrossSeam(deCenter, pivot, angle);
      expect(acrossEN).toBeLessThan(-10);
      expect(acrossDE).toBeGreaterThan(10);
      expect(Math.abs(acrossEN + acrossDE)).toBeLessThanOrEqual(TOLERANCE_PX);

      // The column itself flows straight across the seam: EN -> DE has no
      // component along the ray.
      const alongEN = alongSeam(enCenter, pivot, angle);
      const alongDE = alongSeam(deCenter, pivot, angle);
      expect(Math.abs(alongEN - alongDE)).toBeLessThanOrEqual(TOLERANCE_PX);

      // Never inside the window margin, and touching whichever edge binds.
      const langBox = await lang.boundingBox();
      if (!langBox) throw new Error("lang box missing");
      const topMargin = langBox.y - edgeTop;
      const rightMargin = viewport.width - (langBox.x + langBox.width) - edgeRight;
      expect(topMargin).toBeGreaterThanOrEqual(-TOLERANCE_PX);
      expect(rightMargin).toBeGreaterThanOrEqual(-TOLERANCE_PX);
      expect(Math.min(topMargin, rightMargin)).toBeLessThanOrEqual(TOLERANCE_PX);

      // Clear of the case-study head aside (conservative: bounding boxes).
      const asideBox = await caseStudyHead.boundingBox();
      if (!asideBox) throw new Error("aside box missing");
      const clearOfAside =
        langBox.y + langBox.height <= asideBox.y ||
        langBox.x + langBox.width <= asideBox.x;
      expect(clearOfAside).toBe(true);
    });
  }
});

test.describe("landing language switch geometry — phone", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("straddles the seam in portrait", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 393, height: 852 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const isCoarse = await page.evaluate(() =>
      matchMedia("(hover: none) and (pointer: coarse)").matches,
    );
    expect(isCoarse).toBe(true);

    const scene = page.locator("#seam-scene");
    const lang = page.locator("#seam-lang");
    const en = page.locator(".seam-lang-en");
    const de = page.locator(".seam-lang-de");

    const angle = await seamAngleDegrees(page, scene);
    const pivot = {
      x: await resolveSceneLength(scene, "--gradient-center-x"),
      y: await resolveSceneLength(scene, "--gradient-center-y"),
    };
    const edgeTop = await resolveSceneLength(scene, "--edge-top");
    const edgeRight = await resolveSceneLength(scene, "--edge-right");

    const langCenter = await elementCenter(lang);
    const enCenter = await elementCenter(en);
    const deCenter = await elementCenter(de);

    expect(Math.abs(acrossSeam(langCenter, pivot, angle))).toBeLessThanOrEqual(
      TOLERANCE_PX,
    );

    const acrossEN = acrossSeam(enCenter, pivot, angle);
    const acrossDE = acrossSeam(deCenter, pivot, angle);
    expect(acrossEN).toBeLessThan(-5);
    expect(acrossDE).toBeGreaterThan(5);
    expect(Math.abs(acrossEN + acrossDE)).toBeLessThanOrEqual(TOLERANCE_PX);

    const langBox = await lang.boundingBox();
    if (!langBox) throw new Error("lang box missing");
    const topMargin = langBox.y - edgeTop;
    const rightMargin = 393 - (langBox.x + langBox.width) - edgeRight;
    expect(topMargin).toBeGreaterThanOrEqual(-TOLERANCE_PX);
    expect(rightMargin).toBeGreaterThanOrEqual(-TOLERANCE_PX);
    expect(Math.min(topMargin, rightMargin)).toBeLessThanOrEqual(TOLERANCE_PX);

    await context.close();
  });

  test("straddles the seam in landscape", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 844, height: 390 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const isCoarse = await page.evaluate(() =>
      matchMedia("(hover: none) and (pointer: coarse)").matches,
    );
    expect(isCoarse).toBe(true);

    const scene = page.locator("#seam-scene");
    const lang = page.locator("#seam-lang");
    const en = page.locator(".seam-lang-en");
    const de = page.locator(".seam-lang-de");

    const angle = await seamAngleDegrees(page, scene);
    const pivot = {
      x: await resolveSceneLength(scene, "--gradient-center-x"),
      y: await resolveSceneLength(scene, "--gradient-center-y"),
    };
    const edgeTop = await resolveSceneLength(scene, "--edge-top");
    const edgeRight = await resolveSceneLength(scene, "--edge-right");

    const langCenter = await elementCenter(lang);
    const enCenter = await elementCenter(en);
    const deCenter = await elementCenter(de);

    expect(Math.abs(acrossSeam(langCenter, pivot, angle))).toBeLessThanOrEqual(
      TOLERANCE_PX,
    );

    const acrossEN = acrossSeam(enCenter, pivot, angle);
    const acrossDE = acrossSeam(deCenter, pivot, angle);
    expect(acrossEN).toBeLessThan(-5);
    expect(acrossDE).toBeGreaterThan(5);
    expect(Math.abs(acrossEN + acrossDE)).toBeLessThanOrEqual(TOLERANCE_PX);

    const langBox = await lang.boundingBox();
    if (!langBox) throw new Error("lang box missing");
    const topMargin = langBox.y - edgeTop;
    const rightMargin = 844 - (langBox.x + langBox.width) - edgeRight;
    expect(topMargin).toBeGreaterThanOrEqual(-TOLERANCE_PX);
    expect(rightMargin).toBeGreaterThanOrEqual(-TOLERANCE_PX);
    expect(Math.min(topMargin, rightMargin)).toBeLessThanOrEqual(TOLERANCE_PX);

    await context.close();
  });
});
