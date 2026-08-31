import { expect, test } from "@playwright/test";

// Covers BUILD-05: a visitor with prefers-reduced-motion set is never shown
// motion that ignores it — the heading trail's start()-equivalent gate must
// be checked before any requestAnimationFrame is ever scheduled, not
// retrofitted after the fact.
//
// Uses `page.emulateMedia({ reducedMotion: 'reduce' })` (a real
// `matchMedia('(prefers-reduced-motion: reduce)')` match, not a manual CSS
// override), applied BEFORE navigation so the app's own mount-time read of
// `matchMedia(...).matches` sees the emulated value from the very first
// effect run — mirroring a visitor who already has the OS-level preference
// set before opening the tab, rather than depending on the `change` listener
// to correct a stale initial read. (Playwright's `reducedMotion` context/test
// option was tried first and found unreliable for `matchMedia` in this
// environment/version — see 01-04-SUMMARY.md Deviations.)
test("heading text-shadow stays 'none' throughout a full scroll under reduced-motion emulation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Runs against /type, not /. / now carries real content and genuinely
  // overflows the viewport — tests/landing-trail.spec.ts covers the
  // reduced-motion case there. This spec deliberately stays on /type
  // because that route registers five trail headings, the project's
  // calibration reference for the effect at a higher registered-heading
  // count than any real page carries. An earlier version injected a 3000px
  // spacer into / to force a scroll, which made the test pass without
  // exercising anything a visitor would experience.
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

  // Confirm the baseline is genuinely 'none' before scrolling.
  expect(await readShadow()).toBe("none");

  // Scroll in several steps, sampling the computed style after each one —
  // a single before/after check could miss a transient shadow mid-scroll.
  const samples: (string | null)[] = [];
  for (let step = 0; step < 5; step++) {
    await page.evaluate((y) => window.scrollBy(0, y), 200);
    // Give the (never-scheduled) rAF loop a chance to run if it incorrectly
    // started, and let scroll/scrollend listeners fire.
    await page.waitForTimeout(50);
    samples.push(await readShadow());
  }

  // Wait past SCROLL_STOP_DELAY (120ms) plus settle time for good measure.
  await page.waitForTimeout(300);
  samples.push(await readShadow());

  for (const sample of samples) {
    expect(sample).toBe("none");
  }
});
