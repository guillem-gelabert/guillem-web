import { expect, test } from "@playwright/test";

// Covers HOME-04: the landing view stays legible with only two work items —
// lists and prose, no card grids and no three-across rows — measured at a
// mobile-width (375px) and a desktop-width (1440px) viewport.
//
// Assertion-shape lesson (03-VALIDATION.md rule 1, tests/viewport.spec.ts):
// values are asserted against the real clamp() formula via clampPx(), never
// against a ceiling assumed from the plan. tests/viewport.spec.ts had to be
// corrected from "≈180px near-ceiling" to the real 139.2px, and the Display
// curve does not reach its 180px ceiling until roughly a 1950px viewport.
//
// What this spec deliberately does NOT cover: whether the five-item contents
// list wraps to a readable two or three rows rather than a ragged column,
// whether the ordinal-above-title stack reads as one row rather than four
// loose lines, and whether the work section reads as hierarchy at 1440px.
// All three are optical and are the designated manual checkpoint
// (03-VALIDATION.md § Manual-only verifications).

const ROOT_PX = 16;
const TOLERANCE_PX = 4;

function clampPx(
  minRem: number,
  preferredRem: number,
  preferredVw: number,
  maxRem: number,
  viewportWidth: number,
) {
  const min = minRem * ROOT_PX;
  const max = maxRem * ROOT_PX;
  const preferred = preferredRem * ROOT_PX + (preferredVw / 100) * viewportWidth;
  return Math.min(Math.max(preferred, min), max);
}

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
    });

    test(`no horizontal page overflow at ${viewport.width}px`, async ({ page }) => {
      // A poster-scale Humane nameplate at a 375px viewport is the realistic
      // way this breaks — the Display curve's floor is still 56px, wide
      // enough for "Guillem Gelabert" to push the page sideways if it were
      // not allowed to wrap or shrink correctly.
      const { pageScrollWidth, innerWidth } = await page.evaluate(() => ({
        pageScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(pageScrollWidth).toBeLessThanOrEqual(innerWidth);
    });

    test(`the nameplate tracks the Display curve at ${viewport.width}px`, async ({ page }) => {
      const fontSize = await page.evaluate(() => {
        const h1 = document.querySelector("h1.text-display");
        return h1 ? parseFloat(getComputedStyle(h1).fontSize) : null;
      });
      expect(fontSize).not.toBeNull();

      // At 375px this is the 56px floor; at 1440px it is 139.2px, not
      // 180px — the Display curve does not saturate until ~1950px.
      const expected = clampPx(3.5, 1.5, 8, 11.25, viewport.width);
      expect(fontSize as number).toBeGreaterThan(expected - TOLERANCE_PX);
      expect(fontSize as number).toBeLessThan(expected + TOLERANCE_PX);
    });

    test(`the story headline stays under the Heading curve at ${viewport.width}px`, async ({
      page,
    }) => {
      const fontSize = await page.evaluate(() => {
        const h3 = document.querySelector("section#story h3.text-heading");
        return h3 ? parseFloat(getComputedStyle(h3).fontSize) : null;
      });
      expect(fontSize).not.toBeNull();

      // This test used to assert the headline SAT ON the Heading curve,
      // within tolerance, at both viewports. That premise is gone, and it
      // was already only half true: landing-seam.module.css has always
      // sized this headline as min(the Heading clamp, a share of its box),
      // and the share has won at 1440px since the seam shipped — the 1440px
      // variant of this test was failing on HEAD before the slot changed at
      // all. The share is 9cqh now (it was 17cqh), because the headline
      // shares its box with a standfirst, a chart and a second title, so
      // the share wins at 375px too.
      //
      // So the assertion is the contract that is actually true: the box's
      // share may take the headline DOWN from the Heading curve, never up
      // past it. That still catches the failure this test exists for — a
      // headline running away past the role's ceiling — and it no longer
      // encodes which of the two terms happens to win at a given width.
      const ceiling = clampPx(2, 1, 4, 4.5, viewport.width);
      expect(fontSize as number).toBeLessThan(ceiling + TOLERANCE_PX);
      // And a floor, so "smaller than the ceiling" cannot be satisfied by a
      // headline that has collapsed. 16px is the body text's own size: this
      // is a headline, so it is never smaller than running copy.
      expect(fontSize as number).toBeGreaterThanOrEqual(16);
    });

    test(`the work list is one column at ${viewport.width}px`, async ({ page }) => {
      const rects = await page.evaluate(() =>
        Array.from(document.querySelectorAll("#work li")).map((li) => {
          const r = li.getBoundingClientRect();
          return { x: r.x, y: r.y, height: r.height };
        }),
      );

      expect(rects).toHaveLength(2);
      // Same x within 1px — a vertical list, not a row.
      expect(Math.abs(rects[0].x - rects[1].x)).toBeLessThanOrEqual(1);
      // Second row strictly below the first, past its own height — not a
      // grid and not an overlapping stack.
      expect(rects[1].y).toBeGreaterThan(rects[0].y + rects[0].height);
    });

    test(`nothing inside <main> scrolls internally at ${viewport.width}px`, async ({ page }) => {
      // fixture-viewport.spec.ts's internal-scroll idiom, adapted: at 375px
      // a long absolute URL or a long annotation is the realistic overflow
      // source, and it would be invisible to the page-level check above if
      // the container clipped it instead of the page scrolling.
      const overflowingCount = await page.evaluate(
        () =>
          Array.from(document.querySelectorAll("main *")).filter(
            (el) => el.scrollWidth > el.clientWidth,
          ).length,
      );
      expect(overflowingCount).toBe(0);
    });

    test(`the measure holds at ${viewport.width}px`, async ({ page }) => {
      // 65ch legitimately exceeds a 375px viewport — that is correct, and is
      // why the page-overflow and no-internal-scroll checks exist alongside
      // this one rather than instead of it.
      //
      // getComputedStyle resolves max-width: 65ch to an absolute px value,
      // not the string "65ch", and that resolved px depends on the
      // element's own font — so a fixed px assertion here would itself be
      // an assumed value, exactly what 03-VALIDATION.md rule 1 warns
      // against. Instead, measure what 65ch actually is for that element's
      // font with a same-font probe and compare against it.
      const diffs = await page.evaluate(() =>
        Array.from(document.querySelectorAll("main .max-w-prose")).map((el) => {
          const computedMaxWidth = parseFloat(getComputedStyle(el).maxWidth);
          const probe = document.createElement("span");
          probe.style.position = "absolute";
          probe.style.visibility = "hidden";
          probe.style.display = "inline-block";
          probe.style.whiteSpace = "nowrap";
          probe.style.font = getComputedStyle(el).font;
          probe.style.width = "65ch";
          document.body.appendChild(probe);
          const chWidth = probe.getBoundingClientRect().width;
          probe.remove();
          return Math.abs(computedMaxWidth - chWidth);
        }),
      );
      expect(diffs.length).toBeGreaterThan(0);
      for (const diff of diffs) {
        expect(diff).toBeLessThan(1);
      }
    });
  });
}
