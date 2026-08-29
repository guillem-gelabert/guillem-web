import { expect, test } from "@playwright/test";

// Covers BUILD-06: fonts are self-hosted (Humane via next/font/local,
// display: 'optional'; Newsreader via next/font/google, display: 'swap')
// and the page must not shift layout as they load.
//
// Measured directly via a real PerformanceObserver over the font-load
// window, not assumed from the `font-display` value alone — a
// clearly-above-zero cumulative total on this two-element page would
// indicate a real font-load shift, not measurement noise.
test("home page has near-zero cumulative layout shift across the font-load window", async ({
  page,
}) => {
  // Inject the observer before navigation so it captures every layout-shift
  // entry from the very first paint, including any shift caused by the
  // initial font swap.
  await page.addInitScript(() => {
    (window as unknown as { __clsEntries: Array<{ value: number; hadRecentInput: boolean }> }).__clsEntries = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as Array<{
        value: number;
        hadRecentInput: boolean;
      }>) {
        (
          window as unknown as {
            __clsEntries: Array<{ value: number; hadRecentInput: boolean }>;
          }
        ).__clsEntries.push({
          value: entry.value,
          hadRecentInput: entry.hadRecentInput,
        });
      }
    });
    observer.observe({ type: "layout-shift", buffered: true });
  });

  await page.goto("/");

  // Settle: wait for both self-hosted fonts to finish loading, then give the
  // browser one more paint to register any shift the font swap caused.
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });

  const cumulativeShift = await page.evaluate(() => {
    const entries = (
      window as unknown as {
        __clsEntries: Array<{ value: number; hadRecentInput: boolean }>;
      }
    ).__clsEntries;
    return entries.reduce(
      (total, entry) => (entry.hadRecentInput ? total : total + entry.value),
      0,
    );
  });

  expect(cumulativeShift).toBeLessThan(0.1);
});
