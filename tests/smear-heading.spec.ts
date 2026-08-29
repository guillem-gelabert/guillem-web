import { expect, test } from "@playwright/test";

// Covers HOME-06: a visitor scrolling sees headings trail behind the scroll
// position with a stacked-text-shadow smear that settles when scrolling stops.
//
// This runs against /type rather than /. The holding page is capped at
// name-only copy by CONTEXT.md D-06, so it does not overflow the viewport and
// a visitor has nothing to scroll there until Phase 3 gives it content. The
// specimen route is the page that must demonstrate the effect for real.
//
// An earlier version of this spec injected a 3000px spacer to force a scroll.
// That made the test pass while a visitor still saw nothing — it proved the
// algorithm ran, not that the criterion was met. The overflow assertion below
// is the guard against that regression.
test("type specimen overflows the viewport so a visitor can actually scroll it", async ({
  page,
}) => {
  await page.goto("/type");
  await page.evaluate(() => document.fonts.ready);

  const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));

  // Comfortably more than one screen — not merely a pixel over.
  expect(scrollHeight).toBeGreaterThan(viewportHeight * 1.5);
});

test("heading grows a multi-layer text-shadow mid-scroll and settles back to 'none' after scrolling stops", async ({
  page,
}) => {
  await page.goto("/type");

  // Let fonts finish loading and the headings register with the shared driver
  // (use-smear-heading.ts defers registration until document.fonts.ready
  // resolves) before scrolling.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  const readShadow = () =>
    page.evaluate(() => {
      const heading = document.querySelector("h1");
      return heading ? getComputedStyle(heading).textShadow : null;
    });

  // Baseline: no scroll has happened yet, so no trail has ever been drawn.
  expect(await readShadow()).toBe("none");

  // A single large jump maximizes the gap between the heading's lagging
  // position and its target, giving the smoothing loop time to render a
  // clearly multi-layer shadow before it starts settling. No spacer is
  // injected — the page scrolls on its own content.
  await page.evaluate(() => window.scrollBy(0, 1200));

  // Poll for a brief window right after the scroll — the shadow should become
  // non-'none' with multiple comma-separated layers while the rAF loop is
  // actively catching the lagging heading up to its target.
  let midScrollShadow: string | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    midScrollShadow = await readShadow();
    if (midScrollShadow && midScrollShadow !== "none") break;
    await page.waitForTimeout(16);
  }

  expect(midScrollShadow).not.toBeNull();
  expect(midScrollShadow).not.toBe("none");
  // Count actual shadow layers, not commas. getComputedStyle normalises the
  // trail hue to `rgb(r, g, b)`, which carries two commas of its own, so a
  // naive split(",") reports 3 for a single layer and any "> 1" assertion
  // passes trivially. Count the colour functions instead — one per layer.
  const layerCount = ((midScrollShadow as string).match(/rgba?\(/g) ?? []).length;
  // The ported formula is layers = min(240, max(2, ceil(distance * 2))), and a
  // 1200px jump puts distance at the MAX_TRAIL clamp, so this should be deep.
  expect(layerCount).toBeGreaterThan(10);

  // Wait past SCROLL_STOP_DELAY (120ms) plus enough settle time for the
  // exponential smoothing to converge within the 0.15px stop threshold.
  await page.waitForTimeout(1500);

  const settledShadow = await readShadow();
  expect(settledShadow).toBe("none");
});
