import { expect, test } from "@playwright/test";
import { readOverflow, scrollBy } from "./scroll-root";

// The trail implementation remains in the codebase but is deliberately
// disabled site-wide. This is the default-motion regression: scrolling must
// leave headings as plain type, not merely defer to reduced-motion.
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

  // Through ./scroll-root, which names the app-shell's scroller — the
  // document today (app/globals.css), #scroll-root while it was locked.
  const { scrollHeight, viewportHeight } = await readOverflow(page);

  // Comfortably more than one screen — not merely a pixel over.
  expect(scrollHeight).toBeGreaterThan(viewportHeight * 1.5);
});

test("heading text-shadow stays 'none' throughout a full scroll while the trail is disabled", async ({
  page,
}) => {
  await page.goto("/type");

  // Let the retained client leaves mount before scrolling. They still render
  // the same headings; the shared registry is disabled.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  const readShadow = () =>
    page.evaluate(() => {
      const heading = document.querySelector("h1");
      return heading ? getComputedStyle(heading).textShadow : null;
    });

  // Baseline: no shadow is present before scrolling.
  expect(await readShadow()).toBe("none");

  // A large jump and several later samples catch a transient inline shadow,
  // rather than only proving the settled end-state is plain.
  await scrollBy(page, 1200);

  for (let sample = 0; sample < 5; sample += 1) {
    await page.waitForTimeout(50);
    expect(await readShadow()).toBe("none");
  }
});
