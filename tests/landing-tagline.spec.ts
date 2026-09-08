import { expect, test, type Page } from "@playwright/test";

// The tagline is three words justified across the nameplate's measure with
// nothing between them — no bullet, no rule, no hyphen. That only reads as
// deliberate spacing while it stays on ONE line. If it wraps, the orphan
// takes the whole measure's worth of stretch in the line above it and the
// gaps blow out to something like six spaces wide, which reads as broken
// text. The blow-out is invisible to a width assertion, because justify
// pulls the wrapped line out to the box either way — so these tests measure
// the line count and the natural (unjustified) width instead.

/** The line's natural width if it were never justified or wrapped. */
async function taglineFit(page: Page) {
  return page.evaluate(() => {
    const tagline = document.querySelector<HTMLElement>(".seam-tagline");
    const name = document.querySelector<HTMLElement>(".seam-nameplate-text");
    const box = document.querySelector<HTMLElement>(".seam-box-nameplate");
    if (!tagline || !name || !box) throw new Error("landing nameplate not found");

    const style = getComputedStyle(tagline);
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;
      font-family:${style.fontFamily};font-size:${style.fontSize};
      font-variation-settings:${style.fontVariationSettings};
      letter-spacing:${style.letterSpacing};text-transform:uppercase;`;
    probe.textContent = tagline.textContent;
    document.body.appendChild(probe);
    const naturalWidth = probe.getBoundingClientRect().width;
    probe.remove();

    return {
      lineCount: tagline.getClientRects().length,
      naturalWidth,
      boxWidth: box.getBoundingClientRect().width,
      taglineRight: tagline.getBoundingClientRect().right,
      nameRight: name.getBoundingClientRect().right,
      taglineLeft: tagline.getBoundingClientRect().left,
      nameLeft: name.getBoundingClientRect().left,
      fontFamily: style.fontFamily,
    };
  });
}

function expectSingleJustifiedLine(fit: Awaited<ReturnType<typeof taglineFit>>) {
  expect(fit.lineCount).toBe(1);
  // Room left over for the two word gaps to open into. Fitting exactly is
  // not enough — with no slack the justification has nothing to distribute
  // and the three words close up into one run.
  expect(fit.naturalWidth).toBeLessThan(fit.boxWidth);
  // Flush with the name above it on both edges: that is what "aligned with
  // GUILLEM GELABERT" means here, and it is what the justify buys.
  expect(Math.abs(fit.taglineLeft - fit.nameLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(fit.taglineRight - fit.nameRight)).toBeLessThanOrEqual(1);
}

test.describe("landing tagline", () => {
  test("has no hyphens between the three words", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator(".seam-tagline").textContent();
    expect(text?.trim()).toBe("Data Visualisation Journalism");
    expect(text).not.toContain("-");
  });

  test("renders in the geometric sans, not the body serif", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const fit = await taglineFit(page);
    expect(fit.fontFamily).toContain("Jost");
  });

  for (const width of [1920, 1600, 1440, 1366, 1024, 820]) {
    test(`stays on one justified line at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      expectSingleJustifiedLine(await taglineFit(page));
    });
  }

  test("stays on one justified line on a portrait phone", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 393, height: 852 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    // Guard the guard: the phone layout is a different branch of
    // landing-seam.module.css, and without coarse pointer this would
    // silently re-test the desktop one.
    expect(
      await page.evaluate(
        () => matchMedia("(hover: none) and (pointer: coarse)").matches,
      ),
    ).toBe(true);

    expectSingleJustifiedLine(await taglineFit(page));
    await context.close();
  });
});
