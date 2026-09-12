import { expect, test } from "@playwright/test";
import { PORTRAIT } from "../lib/cv";
import { readOverflow, scrollBy, scrollToBottom } from "./scroll-root";

// Covers HOME-06 as a Phase 3 regression: Phase 1 shipped the smear trail
// against a specimen route (/type), and / is now the first real page
// carrying it. Two lessons this file is shaped by:
//
// 1. Count colour functions, not commas, when reading a text-shadow layer
//    count. getComputedStyle normalises the trail hue to `rgb(r, g, b)`,
//    which carries two commas of its own, so a naive split(",") reports 3
//    for a single layer and any "> 1" assertion passes trivially.
// 2. Assert against a page that genuinely overflows the viewport, not a
//    forced-height element inserted purely to create scroll room — that
//    only proves the algorithm ran, not that a visitor could ever scroll
//    and see it (tests/smear-heading.spec.ts).

test("/ genuinely scrolls", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  // This used to be false — the Phase 1 holding page was name-only and had
  // nothing to scroll. Without this guard the rest of this file could pass
  // while a visitor saw nothing to trail at all.
  // The document is the scroller (app/globals.css). It was #scroll-root
  // while the app-shell locked the document; ./scroll-root is the one place
  // that names which, so this reads the same either way.
  const { scrollHeight, viewportHeight } = await readOverflow(page);
  expect(scrollHeight).toBeGreaterThan(viewportHeight);

  // And scrolls exactly as far as the composition is tall: the two scenes
  // and nothing after them.
  //
  // "Greater than one viewport" alone is far too loose to be a guard. The
  // scene has to be overflow-y: visible so the disc's trail can cross the
  // fold, and .seam-grain-field is 250vmax square — 4868px tall at
  // 1440x900, five times its scene. The moment that clip moved, the
  // field's box started counting toward the scroller and the page grew
  // from 1800px to 3478px: 1678px of empty scroll below the composition,
  // with the assertion above still green. The clip lives on .grain now
  // (inset: 0, so its box IS the scene's), and this is what says so.
  //
  // Plus the scroll runway, which is the one thing above the composition
  // that legitimately adds to the page (components/seam/use-scroll-runway.ts:
  // a few pixels the document is scrolled past on load so iOS never sits at
  // scrollY 0). It is named here rather than folded into a looser tolerance
  // precisely because this assertion's job is to catch anything
  // UNACCOUNTED-FOR inflating the page — the 1678px of empty scroll above is
  // what it exists for, and widening the slack to swallow the runway would
  // have swallowed that too.
  const { scenes, runway } = await page.evaluate(() => ({
    scenes: Array.from(document.querySelectorAll("section.seam-scene")).reduce(
      (total, el) => total + el.getBoundingClientRect().height,
      0,
    ),
    runway:
      document.getElementById("seam-runway")?.getBoundingClientRect().height ??
      0,
  }));
  expect(scenes).toBeGreaterThan(0);
  expect(runway).toBeGreaterThan(0);
  expect(Math.abs(scrollHeight - (scenes + runway))).toBeLessThanOrEqual(2);
});

test("the landing retains its two trail-capable targets — one text, one box", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  // These are retained so the effect can return without changing landing
  // markup. TRAIL_ENABLED is false in the shared provider, so neither is
  // currently registered or animated.
  //
  // The two are no longer both headings, which is why this was retitled.
  // The nameplate smears its glyphs (text-shadow); the story's disc smears
  // its own box (box-shadow, which follows its border-radius, so a round
  // element smears as a trail of circles). The story HEADLINE does not
  // smear at all — it is set on an arc around that disc and stays flat.
  //
  // .seam-nameplate-text, not .text-display: the landing's nameplate type
  // moved into landing-seam.module.css with the box it is measured against,
  // and this test had gone on counting the class it used to carry — so it
  // asserted one h1.text-display on a page that has none and was failing on
  // HEAD before any of this changed.
  const counts = await page.evaluate(() => ({
    nameplate: document.querySelectorAll("h1.seam-nameplate-text").length,
    disc: document.querySelectorAll("#story .seam-shot").length,
    nameplateAnywhere: document.querySelectorAll(".seam-nameplate-text").length,
    discAnywhere: document.querySelectorAll(".seam-shot").length,
  }));

  expect(counts.nameplate).toBe(1);
  expect(counts.disc).toBe(1);
  // Neither class appears anywhere else on the page.
  expect(counts.nameplateAnywhere).toBe(1);
  expect(counts.discAnywhere).toBe(1);
});

// The two registered elements, each with the property its trail is stacked
// into. The story headline was briefly in this list; it is not any more —
// the trail moved to the disc and the headline is flat.
//
// The h1's class is .seam-nameplate-text, not .text-display: the landing's
// nameplate type moved into landing-seam.module.css with the box it is
// measured against.
const TRAIL_TARGETS = [
  { selector: "h1.seam-nameplate-text", property: "textShadow" },
  { selector: "#story .seam-shot", property: "boxShadow" },
] as const;

function readShadows(page: import("@playwright/test").Page) {
  return page.evaluate((targets) => {
    return targets.map(({ selector, property }) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      // Read the property this element's trail is actually written to: the
      // disc's text-shadow is always "none" and would make every assertion
      // below pass vacuously.
      return getComputedStyle(el)[property as "textShadow" | "boxShadow"];
    });
  }, TRAIL_TARGETS as unknown as { selector: string; property: string }[]);
}

test("both retained trail targets stay plain throughout a full scroll", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  // Baseline: no shadow is present before scrolling.
  const baseline = await readShadows(page);
  for (const shadow of baseline) {
    expect(shadow).toBe("none");
  }

  await scrollBy(page, 1200);

  for (let sample = 0; sample < 10; sample += 1) {
    await page.waitForTimeout(50);
    for (const shadow of await readShadows(page)) {
      expect(shadow).toBe("none");
    }
  }
});

test("the body face does not trail", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  await scrollBy(page, 1200);
  await page.waitForTimeout(200);

  // This is the assertion that catches a future change registering the
  // wrong headings.
  // Retargeted at the elements this page actually has. All three it used to
  // read — h2.section-head, #work h3.text-standfirst and the Sections nav —
  // belong to the pre-seam landing and resolved to null here, so every
  // assertion compared null against "none" and the test was failing on HEAD.
  //
  // read() returning null rather than throwing is what makes that failure
  // LOUD, and it earned its keep again when the story's standfirst was
  // removed: this test went red on `null` instead of quietly passing over
  // an element that no longer exists. Keep it that way.
  //
  // What it is FOR still holds and is what it now measures: the trail is
  // registered on the two display headings and on nothing else, so the
  // small copy sharing their boxes must stay flat. The story headline is
  // deliberately not in this list any more — it carries the trail now.
  const shadows = await page.evaluate(() => {
    const read = (selector: string) => {
      const el = document.querySelector(selector);
      return el ? getComputedStyle(el).textShadow : null;
    };
    return {
      // The arc headline. It carried the trail for one revision and does
      // not any more — the disc does — so this is the assertion that
      // catches it being registered again by accident. Both the <h3> and
      // the SVG <text> that actually paints the glyphs are checked: a
      // text-shadow on the heading would inherit into the SVG.
      arcHeading: read("section#story h3.seam-arc"),
      arcGlyphs: read("section#story .seam-arc-svg text"),
      // The badge on the disc's edge, which is the small copy the slot
      // still has. It replaces the standfirst here one-for-one: that <p>
      // was the other flat-copy witness in this box and the slot does not
      // print it any more. Swapped rather than dropped, because the point
      // of this list is that everything in the box EXCEPT the disc stays
      // flat — deleting a line shrinks what that proves.
      badge: read("section#story p.seam-new-story"),
      // The second piece's link, now a pair below the fold rather than a
      // line under the disc. Same rule: small copy stays flat.
      pairLink: read("#seam-scene-mirrored .seam-pair a"),
      langLabel: read(".seam-lang a"),
    };
  });

  expect(shadows.arcHeading).toBe("none");
  expect(shadows.arcGlyphs).toBe("none");
  expect(shadows.badge).toBe("none");
  expect(shadows.pairLink).toBe("none");
  expect(shadows.langLabel).toBe("none");
});

// Covers BUILD-05 as a Phase 3 regression: a visitor with
// prefers-reduced-motion set is never shown motion that ignores it, on the
// landing view specifically (tests/reduced-motion.spec.ts covers the same
// contract on the /type calibration route).
test("under reduced-motion emulation, both trail targets stay none across a full scroll", async ({
  page,
}) => {
  // page.emulateMedia BEFORE page.goto is load-bearing: the app reads
  // matchMedia(...).matches at mount, so emulation applied after
  // navigation would test the change-listener path rather than the
  // visitor-arrives-with-the-preference path (03-VALIDATION.md rule 2;
  // tests/reduced-motion.spec.ts:8-16).
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  const atRest = await readShadows(page);
  for (const shadow of atRest) {
    expect(shadow).toBe("none");
  }

  await scrollBy(page, 1200);
  for (let step = 0; step < 10; step++) {
    await page.waitForTimeout(16);
    const samples = await readShadows(page);
    for (const shadow of samples) {
      expect(shadow).toBe("none");
    }
  }

  // Scroll again, all the way to the bottom, and confirm again.
  await scrollToBottom(page);
  for (let step = 0; step < 10; step++) {
    await page.waitForTimeout(16);
    const samples = await readShadows(page);
    for (const shadow of samples) {
      expect(shadow).toBe("none");
    }
  }
});

test("under reduced-motion emulation, a work link stays neutral and loses its transition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  // Hover is neutral in every motion preference. .link/.link-quiet's
  // transition declaration lives entirely inside @media
  // (prefers-reduced-motion: no-preference), so under "reduce" a work link's
  // computed transition-duration falls back to 0s while its rest colour is
  // unchanged.
  const workLink = page.locator(".seam-pair-link").first();
  const restColor = await workLink.evaluate((el) => getComputedStyle(el).color);
  const transitionDuration = await workLink.evaluate(
    (el) => getComputedStyle(el).transitionDuration,
  );

  expect(transitionDuration).toBe("0s");
  // White — color: inherit from the work square, unchanged by the
  // reduced-motion emulation.
  expect(restColor).toBe("rgb(255, 255, 255)");
});

// ---------------------------------------------------------------------------
// Plan 06-08, D-2.6: /cv's <h1> smear origin across the portrait's load.
//
// This proves invariance, not a fix for a desync — and the record it
// supersedes is wrong. 03-UI-SPEC.md:232 said a post-mount layout change
// above a trail-carrying heading leaves it smearing from a stale origin. It
// does not: components/smear-heading/use-smear-heading.ts measures
// `documentTop` exactly once, after document.fonts.ready resolves, and
// hands it to the shared driver
// (components/smear-heading/smear-heading-provider.tsx). From there
// `documentTop` enters the trail maths only as `lagY - targetY`:
//   - line 110 (draw):      const difference = lagY - targetY;
//   - line 137 (frame):     const targetY = state.documentTop - scrollY;
//   - line 145 (frame):     const distance = Math.abs(state.lagY - targetY);
//   - line 271 (register):  lagY: documentTop - window.scrollY,
// `documentTop` cancels in every one of those — shifting it by any delta
// shifts both terms of each difference by the same delta, and draw() never
// consumes an absolute document offset. The requirement to reserve the
// portrait's space stands (D-2.6), but its real justification is BUILD-06 /
// CLS, and the portrait sitting BELOW the <h1> makes even a late layout
// change a non-event for the trail specifically. If a future reader is
// tempted to "fix" a perceived desync here, the correct response is not a
// browser API that watches an element's box for size changes — there is
// nothing here for one to fix.
test.describe("D-2.6: /cv's h1 smear origin is invariant across the portrait's load", () => {
  // This block used to install a source-rewriting fixture, because
  // lib/cv.ts shipped PORTRAIT null and there was no image whose decode
  // could move anything. PORTRAIT is now declared, so the measurement runs
  // against the real page; the skip guard covers PORTRAIT returning to null,
  // in which case there is nothing to measure rather than something failing.
  test.skip(PORTRAIT === null, "PORTRAIT is null in lib/cv.ts — /cv renders no image to decode");

  test("the h1's document-relative position is identical before and after the portrait decodes", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);

    const measureOrigin = () =>
      page.evaluate(() => {
        const h1 = document.querySelector("h1");
        if (!h1) return null;
        return h1.getBoundingClientRect().top + window.scrollY;
      });

    // "Before": read immediately once fonts are ready. This is the exact
    // moment use-smear-heading.ts itself measures documentTop, so this
    // value IS what the registry stores.
    const before = await measureOrigin();

    const img = page.locator("main img");
    await expect(img).toHaveCount(1);
    await img.evaluate((el) => (el as HTMLImageElement).decode());
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));

    // "After": read again once the portrait has decoded. If the reserved
    // box (explicit width/height + aspect-ratio, plan 06-04) failed to hold
    // and the image popped in at a different size, the <h1> sits below
    // nothing that could move (D-2.4: portrait below the heading) — so this
    // is expected to hold regardless, and the assertion proves exactly that.
    const after = await measureOrigin();

    expect(before).not.toBeNull();
    expect(after).toBe(before);
  });
});
