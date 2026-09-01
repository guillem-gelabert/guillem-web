import { expect, test } from "@playwright/test";
import { EDUCATION, EXPERIENCE, LANGUAGES, PORTRAIT } from "../lib/cv";
import { BANNED_MARKERS } from "../lib/placeholder";

// Covers HOME-03 / D-02: /cv is one of the five destinations the landing's
// contents list names, it 404'd before this phase, and D-02 requires it to
// read as authored rather than as an unfinished site — the placeholder-word
// absence assertion (f) is the automated half of that, because "reads as
// authored" is otherwise only checkable optically.
//
// Plan 06-08 (PROF-01/PROF-02) originally ran the populated assertions
// against a FIXTURE, because PORTRAIT and EXPERIENCE both shipped null/empty
// and there was nothing on the page to measure. That fixture temporarily
// rewrote lib/cv.ts on disk, waited for Turbopack to recompile, and restored
// the bytes under a cross-process lock — a lot of machinery to simulate a
// state that now simply ships. lib/cv.ts is populated (with placeholder
// content, tagged as such in that file), so every assertion below reads the
// real served page and the fixture is deleted.
//
// The values are imported from lib/cv, never retyped: replacing the lorem
// with a real CV must not require touching this file, and an assertion that
// hardcoded three rows would fail on the first real edit for no good reason.

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

test("(f) body text contains no currently-banned marker word", async ({ page }) => {
  // BANNED_MARKERS, not a literal list: the four apology markers ("todo",
  // "coming soon", "under construction", "tbd") are banned in every state
  // the site can be in, because they tell a reader the page is broken.
  // "lorem" and "placeholder" join them only once lib/placeholder.ts's
  // PLACEHOLDER_CONTENT goes false — which is the assertion that proves the
  // placeholder copy is actually gone rather than merely declared gone.
  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  for (const word of BANNED_MARKERS) {
    expect(bodyText).not.toContain(word);
  }
});

// ---------------------------------------------------------------------------
// Plan 06-08 (PROF-01, PROF-02): the portrait, the CLS guard, and the
// sections. Everything below runs against the real served /cv — no fixture,
// no source mutation — and derives what it expects from lib/cv's own
// exports, so the assertions survive the swap from placeholder to real.
// ---------------------------------------------------------------------------

test.describe("portrait, CLS, and sections", () => {
  test("(g) the portrait slot renders exactly as many <img> as PORTRAIT declares — none when null", async ({
    page,
  }) => {
    // The null arm is not dead code waiting to be deleted: components/
    // portrait.tsx's contract is that absence renders as absence — no
    // frame, no grey box, no slot — and PORTRAIT going back to null while
    // the real photograph is being taken is a state the site can genuinely
    // be in. Asserting the count against the declaration keeps both arms
    // honest with one expression.
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("main img")).toHaveCount(PORTRAIT === null ? 0 : 1);
  });

  test.describe("populated", () => {
    test.skip(PORTRAIT === null, "PORTRAIT is null in lib/cv.ts — there is no image to measure");

    const portrait = PORTRAIT!;

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

    test("(i) width/height attributes are present and equal the asset's real intrinsic pixels", async ({
      page,
    }) => {
      await page.goto("/cv");
      await page.evaluate(() => document.fonts.ready);

      const img = page.locator("main img");
      expect(await img.getAttribute("width")).toBe(String(portrait.width));
      expect(await img.getAttribute("height")).toBe(String(portrait.height));
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

      // Education and Languages are each gated on their own length in
      // components/cv/cv-sections.tsx — an h2 the author never filled must
      // not render over an empty list (D-02) — so the expected headings are
      // derived from the data rather than hardcoded. Selected work always
      // renders (WORK is a fixed two-tuple by type), and Contact is /cv's
      // own heading, unrelated to CvSections.
      const expectedHeads = [
        "Experience",
        ...(EDUCATION.length > 0 ? ["Education"] : []),
        ...(LANGUAGES.length > 0 ? ["Languages"] : []),
        "Selected work",
        "Contact",
      ];
      const sectionHeads = page.locator("h2.section-head");
      await expect(sectionHeads).toHaveCount(expectedHeads.length);
      const headTexts = await sectionHeads.allTextContents();
      expect(headTexts.map((t) => t.trim())).toEqual(expectedHeads);

      const experienceRows = page.locator("h2#experience-head ~ ol > li");
      await expect(experienceRows).toHaveCount(EXPERIENCE.length);

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
      // <main> — including inside a CV row's own note text — would
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
