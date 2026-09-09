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
  test("uses a lighter variable-font setting and a narrower rendered label", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const measured = await page.evaluate(() => {
      const label = document.querySelector<HTMLElement>(".seam-lang-en");
      if (!label) throw new Error("language label missing");

      const style = getComputedStyle(label);
      const current = document.createElement("span");
      current.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;
        font-family:${style.fontFamily};font-size:${style.fontSize};
        font-variation-settings:${style.fontVariationSettings};font-weight:${style.fontWeight};letter-spacing:${style.letterSpacing};`;
      current.textContent = label.textContent;
      document.body.appendChild(current);
      const width = current.getBoundingClientRect().width;
      current.remove();

      const baseline = document.createElement("span");
      baseline.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;
        font-family:${style.fontFamily};font-size:${style.fontSize};
        font-variation-settings:"wght" 300;font-weight:300;letter-spacing:0.08em;`;
      baseline.textContent = label.textContent;
      document.body.appendChild(baseline);
      const baselineWidth = baseline.getBoundingClientRect().width;
      baseline.remove();

      return {
        fontVariationSettings: style.fontVariationSettings,
        fontWeight: style.fontWeight,
        width,
        baselineWidth,
      };
    });

    expect(measured.fontVariationSettings).toContain('"wght" 200');
    expect(measured.fontWeight).toBe("200");
    expect(measured.width).toBeLessThan(measured.baselineWidth);
  });

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
      // The slot is optional: the landing passes caseStudyHead={null}, and an
      // empty .box is display: none, so there is no box to collide with. A
      // missing box means the clearance holds vacuously, not that the layout
      // is broken — only assert it when the aside is actually rendered.
      const asideBox = await caseStudyHead.boundingBox();
      if (asideBox) {
        const clearOfAside =
          langBox.y + langBox.height <= asideBox.y ||
          langBox.x + langBox.width <= asideBox.x;
        expect(clearOfAside).toBe(true);
      }
    });
  }
});

// No geometry to check on a phone: the switch is display: none there (the
// coarse-pointer block at the end of landing-seam.module.css). Both links
// still point at "#" and a 393px screen has nowhere to put the pair that is
// not over the name, so it is gone rather than placed. Asserted in both
// orientations because each has its own phone branch in the stylesheet and
// the hide lives in the block they share — a rule moved into one branch
// would silently leave the other showing it.
test.describe("landing language switch — phone", () => {
  const PHONE_VIEWPORTS = [
    { name: "portrait", width: 393, height: 852 },
    { name: "landscape", width: 844, height: 390 },
  ];

  for (const viewport of PHONE_VIEWPORTS) {
    test(`is hidden in ${viewport.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
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

      const lang = page.locator("#seam-lang");
      // Still in the markup — one component serves both layouts — but
      // rendered nowhere: display: none, no box, and neither link reachable.
      await expect(lang).toHaveCount(1);
      await expect(lang).toHaveCSS("display", "none");
      await expect(lang).toBeHidden();
      await expect(page.locator(".seam-lang-en")).toBeHidden();
      await expect(page.locator(".seam-lang-de")).toBeHidden();

      await context.close();
    });
  }
});
