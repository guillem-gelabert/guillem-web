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
  await page.goto("/");

  // Let fonts finish loading and the heading register with the shared
  // driver (use-smear-heading.ts defers registration until
  // document.fonts.ready resolves) before scrolling.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  // The holding page (D-06) is intentionally short — one heading, one line
  // of body text, centered — and does not overflow the viewport on its own
  // at common viewport sizes. Append a tall spacer so the scroll performed
  // below is a genuine scrollY change, not a no-op against a page with
  // nothing to scroll. This is a test-only DOM addition; it does not touch
  // any production file.
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
