import { expect, test } from "@playwright/test";

// The featured story must not print over the tagline.
//
// It did, on a 402x874 iPhone. .box hands BOTH corners --nameplate-height,
// which in portrait is 0.874 of a full-bleed box's width, and nothing
// bounded that against the height the nameplate had already taken. Worse,
// the thing that overhangs is not the disc but the RING of type around it:
// .seam-arc is --arc-scale (1.28) times --disc-size and is centred on the
// box, so it reaches 0.14 x the disc ABOVE the box's top edge. The story
// title ran straight through "DATA VISUALISATION JOURNALISM".
//
// The tagline is the thing to measure against rather than the nameplate
// box, because it is not inside it: .boxNameplate is overflow: visible and
// --nameplate-height is cut to the name's own two-line proportion, so the
// tagline hangs below the box. A cap derived from the box alone looks
// correct and still collides.
//
// Assertion shape follows 03-VALIDATION.md rule 1 and the note atop
// tests/landing-viewport.spec.ts: measure the rendered rects, do not assert
// a ceiling assumed from the stylesheet. The only constant here is the gap
// the design wants, and it is asserted as "a real gap", not as a number
// read off --tagline-block.

// Enough that the two cannot read as one crowded block. Small, because the
// composition is deliberately tight on a phone — this is a collision guard,
// not a spacing spec.
const MIN_GAP_PX = 4;

// The disc may shrink to clear the tagline; it may not vanish doing so.
// The tightest of these viewports (the SE, which is short AND gives a large
// share of itself to browser chrome) lands at ~117px, and the notched
// phones at ~163px. 110 is under the tightest and far over a collapse, so
// it fails only on a real regression — measured, not assumed.
const MIN_DISC_PX = 110;

// Viewport AND safe-area insets, because the insets are what makes this
// collide. Chromium reports env(safe-area-inset-*) as 0px, so at 0 the
// composition clears the tagline by ~120px and this whole file is vacuous —
// verified by running it against the unfixed stylesheet. The nameplate stack
// is anchored to --edge-top and the story stack to the bottom edge, so a
// 59px top inset moves the tagline 43px down the screen toward a story that
// has not moved. That is the reported bug, and these are the numbers a real
// device reports.
//
// Driven through --safe-* and --chrome-bottom rather than env() and
// calc(100lvh - 100svh), neither of which a test can set — see the block
// that declares them in landing-seam.module.css.
//
// chromeBottom is Safari's own bar — the band lvh spans and svh does not.
// It is the larger of the two effects: on the reported device the scene is
// about 695 CSS px of a 874 px screen, so roughly 180 px is browser chrome,
// and that is 180 px of room the composition does not have. The 180 is read
// off the reported screenshot; the rest are that proportion of their own
// screens. Approximations — the point is to hold the layout at a plausible
// worst case, not to model one firmware.
const PORTRAIT_VIEWPORTS = [
  // The reported device, first.
  { width: 402, height: 874, safeTop: 59, safeBottom: 34, chromeBottom: 180, name: "iPhone 17 Pro" },
  { width: 393, height: 852, safeTop: 59, safeBottom: 34, chromeBottom: 175, name: "iPhone 15/16 Pro" },
  { width: 390, height: 844, safeTop: 47, safeBottom: 34, chromeBottom: 170, name: "iPhone 12/13/14" },
  // Home button: no insets at all, and the least height. The tightest case
  // for the cap itself rather than for the chrome.
  { width: 375, height: 667, safeTop: 0, safeBottom: 0, chromeBottom: 114, name: "iPhone SE" },
];

for (const device of PORTRAIT_VIEWPORTS) {
  const viewport = { width: device.width, height: device.height };

  test(`the story clears the tagline on ${device.name} (${device.width}x${device.height})`, async ({
    browser,
  }) => {
    // hasTouch/isMobile, not width. The phone layout is a branch of
    // landing-seam.module.css keyed on (hover: none) and (pointer: coarse)
    // — a device test — and the default context reports a fine pointer
    // however narrow its viewport is. Without this the whole file would
    // silently re-measure the desktop layout and pass.
    const context = await browser.newContext({
      viewport,
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();

    try {
      await page.goto("/");

      // Before measuring anything: stand the safe-area insets up to what the
      // device reports. As a stylesheet rather than an inline style — the id
      // outranks the CSS module's class, and React does not see the DOM
      // change and warn about a hydration mismatch.
      await page.addStyleTag({
        content: `#seam-scene {
          --safe-top: ${device.safeTop}px;
          --safe-bottom: ${device.safeBottom}px;
          --chrome-bottom: ${device.chromeBottom}px;
        }`,
      });

      // And prove the override took. Without it every assertion below is
      // vacuous, which is the exact failure mode this file exists to avoid.
      const applied = await page.evaluate(() => {
        const styles = getComputedStyle(document.querySelector("#seam-scene")!);
        return {
          safeTop: styles.getPropertyValue("--safe-top").trim(),
          chromeBottom: styles.getPropertyValue("--chrome-bottom").trim(),
        };
      });
      expect(applied.safeTop).toBe(`${device.safeTop}px`);
      expect(applied.chromeBottom).toBe(`${device.chromeBottom}px`);

      await page.evaluate(() => document.fonts.ready);

      // Guard the guard, the way tests/landing-tagline.spec.ts does.
      expect(
        await page.evaluate(
          () => matchMedia("(hover: none) and (pointer: coarse)").matches,
        ),
      ).toBe(true);

      const rects = await page.evaluate(() => {
        const read = (selector: string) => {
          const el = document.querySelector(selector);
          if (!el) throw new Error(`${selector} not found`);
          const r = el.getBoundingClientRect();
          return {
            top: r.top,
            bottom: r.bottom,
            left: r.left,
            right: r.right,
            width: r.width,
            height: r.height,
          };
        };
        return {
          tagline: read(".seam-tagline"),
          arc: read(".seam-arc"),
          shot: read(".seam-shot"),
          badge: read(".seam-new-story"),
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        };
      });

      // The ring of type — the thing that was actually colliding.
      expect(rects.arc.top - rects.tagline.bottom).toBeGreaterThanOrEqual(
        MIN_GAP_PX,
      );
      // And the disc itself, which is inside the ring and so implied by the
      // above — asserted anyway, because --arc-scale is a variable and the
      // implication stops holding if it is ever set below 1.
      expect(rects.shot.top - rects.tagline.bottom).toBeGreaterThanOrEqual(
        MIN_GAP_PX,
      );

      // Clearing the tagline must not be achieved by collapsing the disc.
      expect(Math.round(rects.shot.width)).toBe(Math.round(rects.shot.height));
      expect(rects.shot.width).toBeGreaterThan(MIN_DISC_PX);

      // The badge is anchored off --disc-size, so it moves with every cap
      // above. It is the outermost thing in the corner, so it is the first
      // to leave the screen.
      expect(rects.badge.left).toBeGreaterThanOrEqual(0);
      expect(rects.badge.right).toBeLessThanOrEqual(rects.innerWidth);
      expect(rects.badge.bottom).toBeLessThanOrEqual(rects.innerHeight);

      // The scroll runway, both halves of it.
      //
      // Chromium cannot show what the runway BUYS — the strip behind the
      // Dynamic Island, which it has no concept of — but the mechanism that
      // buys it is entirely measurable here, and it is the part that can
      // silently stop working: a changed --runway, a scroll-restoration
      // change, an effect that no longer runs. Both assertions are needed
      // and neither implies the other.
      const runway = await page.evaluate(() => ({
        height:
          document.getElementById("seam-runway")?.getBoundingClientRect()
            .height ?? 0,
        scrollY: window.scrollY,
        sceneTop:
          document.getElementById("seam-scene")?.getBoundingClientRect().top ??
          NaN,
      }));

      // One: the document is NOT at zero, which is the whole point — at
      // scrollY 0 iOS paints that strip a flat colour instead of compositing
      // the page behind it.
      expect(runway.height).toBeGreaterThan(0);
      expect(runway.scrollY).toBeCloseTo(runway.height, 0);

      // Two: and it cost nothing visually. The scroll cancels the offset
      // exactly, so the composition still starts at the top of the screen.
      // Without this a runway that "worked" could be shoving the hero
      // off-screen by its own height.
      expect(Math.abs(runway.sceneTop)).toBeLessThanOrEqual(1);
    } finally {
      await context.close();
    }
  });
}
