import { expect, test } from "@playwright/test";

// Covers HOME-06: a visitor scrolling sees headings trail behind the scroll
// position with a stacked-text-shadow smear that settles when scrolling
// stops. Verifies the actual ported algorithm's observable behavior — a
// multi-layer text-shadow mid-scroll, and a return to 'none' once the
// SCROLL_STOP_DELAY (120ms) debounce plus settle time has elapsed — not
// just that some flag was read.
test("heading grows a multi-layer text-shadow mid-scroll and settles back to 'none' after scrolling stops", async ({
  page,
}) => {
  await page.goto("/");

  // Let fonts finish loading and the heading register with the shared
  // driver (use-smear-heading.ts defers registration until
  // document.fonts.ready resolves) before scrolling.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  // The holding page (D-06) is intentionally short and does not overflow the
  // viewport on its own at common viewport sizes. Append a tall spacer so
  // the scroll below is a genuine scrollY change the trail can react to.
  // Test-only DOM addition; does not touch any production file.
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "3000px";
    document.body.appendChild(spacer);
  });

  const readShadow = () =>
    page.evaluate(() => {
      const heading = document.querySelector("h1");
      return heading ? getComputedStyle(heading).textShadow : null;
    });

  // Baseline: no scroll has happened yet, so no trail has ever been drawn.
  expect(await readShadow()).toBe("none");

  // A single large jump maximizes the gap between the heading's lagging
  // position and its target, giving the smoothing loop time to render a
  // clearly multi-layer shadow before it starts settling.
  await page.evaluate(() => window.scrollBy(0, 1200));

  // Poll for a brief window right after the scroll — the shadow should
  // become non-'none' with multiple comma-separated layers while the rAF
  // loop is actively catching the lagging heading up to its target.
  let midScrollShadow: string | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    midScrollShadow = await readShadow();
    if (midScrollShadow && midScrollShadow !== "none") break;
    await page.waitForTimeout(16);
  }

  expect(midScrollShadow).not.toBeNull();
  expect(midScrollShadow).not.toBe("none");
  // A real stacked-shadow value is a comma-separated list of many layers,
  // e.g. "0 12px 0 #171714, 0 11.9px 0 #171714, ...".
  const layerCount = (midScrollShadow as string).split(",").length;
  expect(layerCount).toBeGreaterThan(1);

  // Wait past SCROLL_STOP_DELAY (120ms) plus enough settle time for the
  // exponential smoothing to converge within the 0.15px stop threshold.
  await page.waitForTimeout(1500);

  const settledShadow = await readShadow();
  expect(settledShadow).toBe("none");
});
