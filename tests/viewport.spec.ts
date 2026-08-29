import { expect, test } from "@playwright/test";

// Covers BUILD-03: the fluid Humane type scale (clamp()-based, D-03) renders
// within its declared bounds and genuinely responds to viewport width,
// rather than rendering a fixed size, at both a mobile-width (375px) and a
// desktop-width (1440px) viewport.
//
// Deviation note (see 01-03-SUMMARY.md): the plan's literal task text
// assumed both the Display and Heading roles sit near their clamp()
// ceiling at 1440px. Empirically (verified directly with a headless
// Chromium page against the real clamp() rules in app/globals.css):
//   - Heading (`clamp(2rem, 1rem + 4vw, 4.5rem)`) DOES saturate to its 72px
//     ceiling by 1440px (1rem + 4vw = 16 + 57.6 = 73.6px > 72px max).
//   - Display (`clamp(3.5rem, 1.5rem + 8vw, 11.25rem)`) does NOT reach its
//     180px ceiling until ~1950px viewport width (1.5rem + 8vw = 24 +
//     0.08*1440 = 139.2px at 1440px, below the 180px max). This is still
//     correct fluid behavior - above the 375px floor, below the ceiling,
//     and demonstrably larger than the mobile-width value (see the growth
//     assertion below) - just not "near ceiling" at this specific
//     breakpoint. Asserting the real formula's predicted value (rather than
//     the plan's "≈180px" assumption) keeps this test honest about what the
//     shipped CSS actually does.
const ROOT_PX = 16;
const TOLERANCE_PX = 4;

function clampPx(
  minRem: number,
  preferredRem: number,
  preferredVw: number,
  maxRem: number,
  viewportWidth: number,
) {
  const min = minRem * ROOT_PX;
  const max = maxRem * ROOT_PX;
  const preferred = preferredRem * ROOT_PX + (preferredVw / 100) * viewportWidth;
  return Math.min(Math.max(preferred, min), max);
}

async function readSizes(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const display = document.querySelector(".text-display");
    const heading = document.querySelector(".text-heading");
    return {
      display: parseFloat(getComputedStyle(display as Element).fontSize),
      heading: parseFloat(getComputedStyle(heading as Element).fontSize),
    };
  });
}

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test(`type scale renders within its clamp() bounds at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/type");

    const sizes = await readSizes(page);

    const expectedDisplay = clampPx(3.5, 1.5, 8, 11.25, viewport.width);
    const expectedHeading = clampPx(2, 1, 4, 4.5, viewport.width);

    expect(sizes.display).toBeGreaterThan(expectedDisplay - TOLERANCE_PX);
    expect(sizes.display).toBeLessThan(expectedDisplay + TOLERANCE_PX);
    expect(sizes.heading).toBeGreaterThan(expectedHeading - TOLERANCE_PX);
    expect(sizes.heading).toBeLessThan(expectedHeading + TOLERANCE_PX);
  });
}

test("display and heading sizes grow from 375px to 1440px (fluid, not fixed)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/type");
  const mobile = await readSizes(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const desktop = await readSizes(page);

  expect(desktop.display).toBeGreaterThan(mobile.display);
  expect(desktop.heading).toBeGreaterThan(mobile.heading);
});
