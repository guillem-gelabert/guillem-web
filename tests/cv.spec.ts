import { expect, test } from "@playwright/test";
import {
  FIXTURE_EXPERIENCE_ROWS,
  FIXTURE_PORTRAIT_HEIGHT,
  FIXTURE_PORTRAIT_WIDTH,
  installPortraitFixture,
  removePortraitFixture,
} from "./fixtures/cv-portrait-fixture";

// Covers HOME-03 / D-02: /cv is one of the five destinations the landing's
// contents list names, it 404'd before this phase, and D-02 requires it to
// read as authored rather than as an unfinished site — the placeholder-word
// absence assertion (f) is the automated half of that, because "reads as
// authored" is otherwise only checkable optically.
//
// Plan 06-08 (PROF-01/PROF-02): PORTRAIT and EXPERIENCE are both null/empty
// in the shipped lib/cv.ts (no-fabrication rule), so the "populated" tests
// below run against a FIXTURE — a temporary rewrite of lib/cv.ts on disk via
// tests/fixtures/cv-portrait-fixture.ts, reverted before this file's run
// ends. FIXTURE_EXPERIENCE_ROWS and the generated fixture portrait PNG are
// fixtures: neither is real, and neither may ever become a real lib/cv.ts
// export. `git diff --stat lib/cv.ts` is asserted empty by this task's own
// verify command, run right after this spec.

test.beforeEach(async ({ page }) => {
  await page.goto("/cv");
  await page.evaluate(() => document.fonts.ready);
});

test("(a) /cv responds 200", async ({ page }) => {
  const response = await page.goto("/cv");
  expect(response?.status()).toBe(200);
});

test("(b) renders exactly one h1 reading CV", async ({ page }) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  expect((await h1.innerText()).trim()).toBe("CV");
});

test("(c) the h1 carries text-heading and resolves to the Humane font stack", async ({
  page,
}) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveClass(/text-heading/);

  const fontFamily = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(fontFamily.toLowerCase()).toContain("humane");
});

test("(d) the site-root back link exists once, reads the arrow string, and targets /", async ({
  page,
}) => {
  const backLink = page.getByRole("link", { name: "← Guillem Gelabert" });
  await expect(backLink).toHaveCount(1);
  // toHaveText reads textContent, not the CSS text-transform: uppercase
  // rendering — the Label role is uppercase visually but the source string
  // (and the accessible name above) stays mixed-case.
  await expect(backLink).toHaveText("← Guillem Gelabert");
  await expect(backLink).toHaveAttribute("href", "/");
});

test("(e) the back link clears the WCAG 2.5.8 24px target floor", async ({ page }) => {
  const backLink = page.getByRole("link", { name: "← Guillem Gelabert" });
  const height = await backLink.evaluate((el) => el.getBoundingClientRect().height);
  // 03-VALIDATION.md measured a Label-role line box at 18.2px, and 26.2px
  // with py-xs applied — Phase 1's scar tissue is that a computed value
  // assumed from a plan was wrong by 40px. Assert the measured floor, not
  // the arithmetic.
  expect(height).toBeGreaterThanOrEqual(24);
});

test("(f) body text contains no placeholder marker word", async ({ page }) => {
  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  for (const word of [
    "todo",
    "placeholder",
    "coming soon",
    "under construction",
    "lorem",
    "tbd",
  ]) {
    expect(bodyText).not.toContain(word);
  }
});

// ---------------------------------------------------------------------------
// Plan 06-08 (PROF-01, PROF-02): the portrait, the CLS guard, and the
// sections. (g) runs against the real shipped null state — no fixture, no
// mutation. Everything inside "populated" runs against the temporary
// fixture installed by tests/fixtures/cv-portrait-fixture.ts.
// ---------------------------------------------------------------------------

test.describe("portrait, CLS, and sections", () => {
  // Serial so (g)'s shipped-null assertion is guaranteed to run BEFORE the
  // nested "populated" block's beforeAll ever mutates lib/cv.ts on disk —
  // fullyParallel: true would otherwise let a different worker race this
  // test against the fixture window.
  test.describe.configure({ mode: "serial" });

  test("(g) with PORTRAIT null (shipped state), /cv renders zero <img> — no slot, no frame, no placeholder box", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("img")).toHaveCount(0);
  });

  test.describe("populated (fixture portrait + fixture EXPERIENCE)", () => {
    test.describe.configure({ mode: "serial" });

    test.beforeAll(async () => {
      await installPortraitFixture();
    });

    test.afterAll(async () => {
      await removePortraitFixture();
    });

    test("(h) exactly one <img>, and naturalWidth > 0 — the browser actually decoded the bytes", async ({
      page,
    }) => {
      await page.goto("/cv");
      await page.evaluate(() => document.fonts.ready);

      const img = page.locator("main img");
      await expect(img).toHaveCount(1);
      await img.evaluate((el) => (el as HTMLImageElement).decode());

      const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    });

    test("(i) width/height attributes are present and equal the fixture asset's real intrinsic pixels", async ({
      page,
    }) => {
      await page.goto("/cv");
      await page.evaluate(() => document.fonts.ready);

      const img = page.locator("main img");
      expect(await img.getAttribute("width")).toBe(String(FIXTURE_PORTRAIT_WIDTH));
      expect(await img.getAttribute("height")).toBe(String(FIXTURE_PORTRAIT_HEIGHT));
    });

    test("(j) Pitfall 10: computed width is strictly less than <main>'s content width, measured not assumed", async ({
      page,
    }) => {
      await page.goto("/cv");
      await page.evaluate(() => document.fonts.ready);

      // /cv's <main> is flex flex-col, whose default align-items: stretch
      // would otherwise balloon a replaced element to the column's full
      // width — measured here, not assumed.
      const widths = await page.evaluate(() => {
        const main = document.querySelector("main");
        const img = document.querySelector("main img");
        if (!main || !img) return null;
        const mainStyle = getComputedStyle(main);
        const paddingLeft = parseFloat(mainStyle.paddingLeft);
        const paddingRight = parseFloat(mainStyle.paddingRight);
        return {
          mainContentWidth: main.clientWidth - paddingLeft - paddingRight,
          imgWidth: img.getBoundingClientRect().width,
        };
      });
      expect(widths).not.toBeNull();
      expect(widths!.imgWidth).toBeLessThan(widths!.mainContentWidth);
      // Recorded for the plan's own <output> instruction: measured this run
      // at the default viewport (see SUMMARY.md).
    });

    test("(k) computed border-radius is 0px on all four corners", async ({ page }) => {
      await page.goto("/cv");
      await page.evaluate(() => document.fonts.ready);

      const img = page.locator("main img");
      const radius = await img.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          tl: s.borderTopLeftRadius,
          tr: s.borderTopRightRadius,
          br: s.borderBottomRightRadius,
          bl: s.borderBottomLeftRadius,
        };
      });
      expect(radius).toEqual({ tl: "0px", tr: "0px", br: "0px", bl: "0px" });
    });

    test("(l) the portrait sits after the h1 in document order", async ({ page }) => {
      await page.goto("/cv");
      await page.evaluate(() => document.fonts.ready);

      const isAfter = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        const img = document.querySelector("main img");
        if (!h1 || !img) return null;
        return (h1.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      });
      expect(isAfter).toBe(true);
    });

    test("(m) BUILD-06/D-2.6: the portrait's load produces near-zero cumulative layout shift", async ({
      page,
    }) => {
      // Reuses tests/font-cls.spec.ts's own PerformanceObserver pattern and
      // its threshold (< 0.1) verbatim — not a new number.
      await page.addInitScript(() => {
        (
          window as unknown as { __clsEntries: Array<{ value: number; hadRecentInput: boolean }> }
        ).__clsEntries = [];
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as Array<{
            value: number;
            hadRecentInput: boolean;
          }>) {
            (
              window as unknown as {
                __clsEntries: Array<{ value: number; hadRecentInput: boolean }>;
              }
            ).__clsEntries.push({ value: entry.value, hadRecentInput: entry.hadRecentInput });
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
      });

      await page.goto("/cv");

      const img = page.locator("main img");
      await expect(img).toHaveCount(1);
      await img.evaluate((el) => (el as HTMLImageElement).decode());
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
      // Recorded for the plan's <output> instruction: measured cumulative
      // shift value captured in SUMMARY.md.
    });

    test("(n) sections: one h1, h2.section-head headings, one Label line + one Body line per experience row", async ({
      page,
    }) => {
      await page.goto("/cv");
      await page.evaluate(() => document.fonts.ready);

      await expect(page.locator("h1")).toHaveCount(1);

      // EDUCATION/LANGUAGES stay empty (their own independent gate) — only
      // EXPERIENCE and the always-rendered Selected work section, plus /cv's
      // own Contact heading (unrelated to CvSections), so 3 total.
      const sectionHeads = page.locator("h2.section-head");
      await expect(sectionHeads).toHaveCount(3);
      const headTexts = await sectionHeads.allTextContents();
      expect(headTexts.map((t) => t.trim())).toEqual(["Experience", "Selected work", "Contact"]);

      const experienceRows = page.locator("h2#experience-head ~ ol > li");
      await expect(experienceRows).toHaveCount(FIXTURE_EXPERIENCE_ROWS.length);

      const rowShapes = await experienceRows.evaluateAll((els) =>
        els.map((el) => ({
          labelCount: el.querySelectorAll("p.text-label").length,
          bodyCount: el.querySelectorAll("p.max-w-prose.text-body").length,
        })),
      );
      for (const row of rowShapes) {
        expect(row.labelCount).toBe(1);
        expect(row.bodyCount).toBe(1);
      }
    });

    test("(o) the type budget on screen: every computed font-weight inside <main> is 400 or 530 — the only tier that catches a <strong> resolving to 700", async ({
      page,
    }) => {
      // tests/unit/prose-contract.test.ts reads app/globals.css from disk;
      // Tailwind v4 preflight ships b,strong{font-weight:bolder} in the
      // COMPILED CSS, not in that file, so a stray <strong> anywhere inside
      // <main> — including inside the fixture's own note text — would
      // render at 700 with every source-level budget gate green. This is
      // the only place that catches it.
      await page.goto("/cv");
      await page.evaluate(() => document.fonts.ready);

      const typeBudget = await page.evaluate(() => {
        const main = document.querySelector("main");
        if (!main) return [];
        const withDirectText = Array.from(main.querySelectorAll("*")).filter((node) =>
          Array.from(node.childNodes).some(
            (child) =>
              child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0,
          ),
        );
        return withDirectText.map((node) => getComputedStyle(node).fontWeight);
      });
      expect(typeBudget.length).toBeGreaterThan(0);
      for (const fontWeight of typeBudget) {
        expect(["400", "530"]).toContain(fontWeight);
      }

      const radii = await page.evaluate(() => {
        const main = document.querySelector("main");
        if (!main) return [];
        return Array.from(main.querySelectorAll("*")).map((el) => getComputedStyle(el).borderRadius);
      });
      for (const radius of radii) {
        expect(radius).toBe("0px");
      }
    });
  });
});
