import { expect, test } from "@playwright/test";

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
  const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(scrollHeight).toBeGreaterThan(viewportHeight);
});

test("exactly two trail-carrying headings are registered", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  // Humane gets the trail, Newsreader never does — a 240-layer stacked
  // shadow on a 14px uppercase section head would be visual noise at
  // reading scale. Cost is linear in *registered* headings, not visible
  // ones (03-RESEARCH.md § C-3), so capping the landing at two is what
  // keeps it bounded. No viewport guard is to be added: research measured
  // draw() at the 240-layer clamp costing 0.40ms at two headings against an
  // 8.33ms budget, and the shipped 5-heading /type holds 120fps.
  const counts = await page.evaluate(() => ({
    display: document.querySelectorAll("h1.text-display").length,
    heading: document.querySelectorAll("section#case-study h3.text-heading").length,
    displayAnywhere: document.querySelectorAll(".text-display").length,
    headingAnywhere: document.querySelectorAll(".text-heading").length,
  }));

  expect(counts.display).toBe(1);
  expect(counts.heading).toBe(1);
  // No .text-display or .text-heading element exists anywhere else on the
  // page beyond the two counted above.
  expect(counts.displayAnywhere).toBe(1);
  expect(counts.headingAnywhere).toBe(1);
});

// Generalises tests/smear-heading.spec.ts's document.querySelector("h1") to
// both registered headings on /.
const TRAIL_SELECTORS = ["h1.text-display", "section#case-study h3.text-heading"];

function readShadows(page: import("@playwright/test").Page) {
  return page.evaluate((selectors) => {
    return selectors.map((selector) => {
      const el = document.querySelector(selector);
      return el ? getComputedStyle(el).textShadow : null;
    });
  }, TRAIL_SELECTORS);
}

// Count actual shadow layers, not commas. getComputedStyle normalises the
// trail hue to rgb(r, g, b), which carries two commas of its own, so a
// naive split(",") reports 3 for a single layer and any "> 1" assertion
// passes trivially. Count the colour functions instead — one per layer.
const countLayers = (shadow: string | null) =>
  shadow ? (shadow.match(/rgba?\(/g) ?? []).length : 0;

test("both headings smear mid-scroll and settle to none", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  // Baseline: no scroll has happened yet, so no trail has ever been drawn.
  const baseline = await readShadows(page);
  for (const shadow of baseline) {
    expect(shadow).toBe("none");
  }

  await page.evaluate(() => window.scrollBy(0, 1200));

  // Poll the live DOM via expect.poll() rather than sampling a fixed number
  // of times inside a fixed window (see tests/smear-heading.spec.ts's
  // header comment for why a tight fixed-attempt loop flakes under
  // parallel workers). Each poll tick is still ONE page.evaluate reading
  // both headings (readShadows), not two round trips; the minimum of the
  // two layer counts is what's polled, so the assertion only resolves once
  // BOTH headings have independently cleared the threshold.
  await expect
    .poll(
      async () => {
        const shadows = await readShadows(page);
        return Math.min(...shadows.map(countLayers));
      },
      {
        message: "expected both headings' text-shadow to grow past 10 layers mid-scroll",
        timeout: 5000,
      },
    )
    .toBeGreaterThan(10);
  // The ported formula is layers = min(240, max(2, ceil(distance * 2))), and
  // a 1200px jump puts distance at the MAX_TRAIL clamp, so this should be
  // deep as soon as it appears at all.

  // Poll for settling back to 'none' the same way — one page.evaluate per
  // sample, resolves once both headings read 'none'. The exponential
  // smoothing's convergence is CPU-time-bound, not wall-clock-bound, so a
  // fixed wait-then-check can undershoot under load.
  await expect
    .poll(
      async () => {
        const shadows = await readShadows(page);
        return shadows.every((shadow) => shadow === "none");
      },
      {
        message: "expected both headings' text-shadow to settle back to 'none'",
        timeout: 5000,
      },
    )
    .toBe(true);
});

test("Newsreader does not trail", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  await page.evaluate(() => window.scrollBy(0, 1200));
  await page.waitForTimeout(200);

  // This is the assertion that catches a future change registering the
  // wrong headings.
  const shadows = await page.evaluate(() => {
    const sectionHead = document.querySelector("h2.section-head");
    const workTitle = document.querySelector("#work h3.text-standfirst");
    const navLink = document.querySelector('nav[aria-label="Sections"] a');
    return {
      sectionHead: sectionHead ? getComputedStyle(sectionHead).textShadow : null,
      workTitle: workTitle ? getComputedStyle(workTitle).textShadow : null,
      navLink: navLink ? getComputedStyle(navLink).textShadow : null,
    };
  });

  expect(shadows.sectionHead).toBe("none");
  expect(shadows.workTitle).toBe("none");
  expect(shadows.navLink).toBe("none");
});

// Covers BUILD-05 as a Phase 3 regression: a visitor with
// prefers-reduced-motion set is never shown motion that ignores it, on the
// landing view specifically (tests/reduced-motion.spec.ts covers the same
// contract on the /type calibration route).
test("under reduced-motion emulation, both headings stay none across a full scroll", async ({
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

  await page.evaluate(() => window.scrollBy(0, 1200));
  for (let step = 0; step < 10; step++) {
    await page.waitForTimeout(16);
    const samples = await readShadows(page);
    for (const shadow of samples) {
      expect(shadow).toBe("none");
    }
  }

  // Scroll again, all the way to the bottom, and confirm again.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  for (let step = 0; step < 10; step++) {
    await page.waitForTimeout(16);
    const samples = await readShadows(page);
    for (const shadow of samples) {
      expect(shadow).toBe("none");
    }
  }
});

test("under reduced-motion emulation, a nav link keeps its colour state change but loses its transition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  // The state change is not motion — under prefers-reduced-motion: reduce a
  // link still changes to accent and still gains its hover underline; only
  // the transition is removed. .link/.link-quiet's transition declaration
  // lives entirely inside @media (prefers-reduced-motion: no-preference),
  // so under "reduce" a nav link's computed transition-duration falls back
  // to the CSS initial value, 0s, while its rest colour is unchanged.
  const navLink = page.locator('nav[aria-label="Sections"] a').first();
  const restColor = await navLink.evaluate((el) => getComputedStyle(el).color);
  const transitionDuration = await navLink.evaluate(
    (el) => getComputedStyle(el).transitionDuration,
  );

  expect(transitionDuration).toBe("0s");
  // rgb(0, 0, 0) — color: inherit from --color-ink, unchanged by the
  // reduced-motion emulation.
  expect(restColor).toBe("rgb(0, 0, 0)");
});
