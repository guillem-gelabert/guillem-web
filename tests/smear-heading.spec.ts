import { expect, test } from "@playwright/test";

// Covers HOME-06: a visitor scrolling sees headings trail behind the scroll
// position with a stacked-text-shadow smear that settles when scrolling stops.
//
// This runs against /type rather than /. / now carries real content and
// genuinely overflows the viewport — tests/landing-trail.spec.ts covers the
// trail there. This spec deliberately stays on /type because that route
// registers five trail headings, the project's calibration reference for
// the effect at a higher registered-heading count than any real page
// carries.
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

  // Count actual shadow layers, not commas. getComputedStyle normalises the
  // trail hue to `rgb(r, g, b)`, which carries two commas of its own, so a
  // naive split(",") reports 3 for a single layer and any "> 1" assertion
  // passes trivially. Count the colour functions instead — one per layer.
  const countLayers = (shadow: string | null) =>
    shadow ? (shadow.match(/rgba?\(/g) ?? []).length : 0;

  // Baseline: no scroll has happened yet, so no trail has ever been drawn.
  expect(await readShadow()).toBe("none");

  // A single large jump maximizes the gap between the heading's lagging
  // position and its target, giving the smoothing loop time to render a
  // clearly multi-layer shadow before it starts settling. No forced-height
  // element is injected — the page scrolls on its own content.
  await page.evaluate(() => window.scrollBy(0, 1200));

  // Poll the real state via expect.poll() rather than sampling a fixed
  // number of times inside a fixed window. The original 10-attempt/16ms
  // loop (160ms total budget) was written when this suite was roughly half
  // its current size; under parallel workers, contention can delay the rAF
  // loop's first few frames past that window, which is what made this test
  // flake under load rather than in isolation. expect.poll() retries
  // against the live DOM until the condition holds or a generous timeout
  // elapses, so it reflects what actually happens, not what happened to
  // land inside an increasingly-too-tight sampling window.
  await expect
    .poll(async () => countLayers(await readShadow()), {
      message: "expected the heading's text-shadow to grow past 10 layers mid-scroll",
      timeout: 5000,
    })
    .toBeGreaterThan(10);
  // The ported formula is layers = min(240, max(2, ceil(distance * 2))), and a
  // 1200px jump puts distance at the MAX_TRAIL clamp, so this should be deep
  // as soon as it appears at all.

  // Poll for settling back to 'none' the same way, instead of a single
  // fixed wait-then-check. The exponential smoothing's convergence is
  // CPU-time-bound, not wall-clock-bound, so a fixed 1500ms wait can
  // undershoot when frames are delayed under load; expect.poll() keeps
  // sampling until it genuinely settles or the timeout is exceeded.
  await expect
    .poll(readShadow, {
      message: "expected the heading's text-shadow to settle back to 'none'",
      timeout: 5000,
    })
    .toBe("none");
});
