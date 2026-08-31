import { expect, test } from "@playwright/test";

// Covers CASE-02 in the rendered DOM, which is the form the requirement is
// actually written in — "a visitor can follow the case study through six
// parts". The source gate in tests/unit/case-study-content.test.ts cannot
// see rehype-slug ids or computed styles; this can.
//
// This plan (04-02) ends RED by design: /writing/the-chart-therefore-changes
// and /texte/die-darstellung-aendert-sich both 404 until Plans 03 (English)
// and 04 (German) publish the MDX files this spec asserts against.
//
// page.emulateMedia({ reducedMotion: 'reduce' }) is called BEFORE every
// page.goto — load-bearing, per tests/landing-trail.spec.ts:163: the post
// route renders SmearTitle, which reads the preference at mount, and
// Playwright's reducedMotion context option does not reliably reach
// matchMedia in this environment (03-VALIDATION.md rule 2). Routing both
// through the one visitCaseStudy() helper below keeps that ordering
// structural rather than something each test has to remember to repeat.

const EN_SECTION_IDS = [
  "the-question",
  "what-i-expected",
  "what-the-data-showed",
  "where-the-chart-changed",
  "what-shipped",
  "methodology",
];

const DE_SECTIONS = [
  "Die Frage",
  "Was ich erwartet hatte",
  "Was die Daten zeigten",
  "Wo sich die Darstellung ändert",
  "Was veröffentlicht wurde",
  "Methodik",
];

async function visitCaseStudy(page: import("@playwright/test").Page, path: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const response = await page.goto(path);
  await page.evaluate(() => document.fonts.ready);

  // A hard, legible guard rather than letting every DOM assertion below fail
  // vacuously against an empty 404 page — a "zero h3-h6" style assertion is
  // trivially (and misleadingly) true when .prose-site doesn't exist at all.
  // This throws the same "does not exist yet" shape of message the unit
  // tests use, so this plan's RED state reads as one clear cause per test,
  // not nine different symptoms of the one missing route.
  if (response?.status() !== 200) {
    throw new Error(
      `${path} responded ${response?.status() ?? "with no response"} — Plan 03 (English) / Plan 04 (German) has not published this route yet`,
    );
  }
  return response;
}

/**
 * Every <Figure> image is loading="lazy", so naturalWidth is only reliable
 * once the browser has actually decided to load the bitmap. Scroll each img
 * into view and wait for its load event (or its already-`complete` state)
 * before reading naturalWidth — a measured value off the real pixels, not
 * an attribute read, so a wrong file on disk fails here too.
 */
async function measuredImageWidths(page: import("@playwright/test").Page) {
  const imgs = page.locator(".prose-site img");
  const count = await imgs.count();
  const widths: number[] = [];
  for (let i = 0; i < count; i++) {
    const img = imgs.nth(i);
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(
      (el) =>
        (el as HTMLImageElement).complete
          ? undefined
          : new Promise((resolve) => el.addEventListener("load", () => resolve(undefined), { once: true })),
    );
    widths.push(await img.evaluate((el) => (el as HTMLImageElement).naturalWidth));
  }
  return widths;
}

test.describe("English case-study route (CASE-02)", () => {
  test("the route responds 200", async ({ page }) => {
    const response = await visitCaseStudy(page, "/writing/the-chart-therefore-changes");
    expect(response?.status()).toBe(200);
  });

  test("exactly six h2 elements inside .prose-site, with the locked rehype-slug ids in CASE-02's order", async ({
    page,
  }) => {
    await visitCaseStudy(page, "/writing/the-chart-therefore-changes");
    const h2s = page.locator(".prose-site h2");
    await expect(h2s).toHaveCount(6);
    const ids = await h2s.evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(EN_SECTION_IDS);
  });

  test("zero h3, h4, h5 and h6 elements inside .prose-site — the contract stops at h3 and this phase uses no h3 at all", async ({
    page,
  }) => {
    await visitCaseStudy(page, "/writing/the-chart-therefore-changes");
    for (const tag of ["h3", "h4", "h5", "h6"]) {
      await expect(page.locator(`.prose-site ${tag}`)).toHaveCount(0);
    }
  });

  test("exactly one aside, positioned after h2#methodology in document order (D-06 — receipts last, no pitch)", async ({
    page,
  }) => {
    await visitCaseStudy(page, "/writing/the-chart-therefore-changes");
    await expect(page.locator(".prose-site aside")).toHaveCount(1);

    // The aside is a SIBLING of the headings, not a child of the methodology
    // section — compareDocumentPosition, not a parent-relationship
    // assumption, is what actually proves "after".
    const asideFollowsMethodology = await page.evaluate(() => {
      const prose = document.querySelector(".prose-site");
      const methodology = prose?.querySelector("h2#methodology");
      const aside = prose?.querySelector("aside");
      if (!methodology || !aside) return false;
      return Boolean(methodology.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(asideFollowsMethodology).toBe(true);
  });

  test("exactly three figure elements, exactly one figure[data-wide], and the wide one is the third (D-07)", async ({
    page,
  }) => {
    await visitCaseStudy(page, "/writing/the-chart-therefore-changes");
    await expect(page.locator(".prose-site figure")).toHaveCount(3);
    await expect(page.locator(".prose-site figure[data-wide]")).toHaveCount(1);
    const wideFlags = await page
      .locator(".prose-site figure")
      .evaluateAll((els) => els.map((el) => el.hasAttribute("data-wide")));
    expect(wideFlags).toEqual([false, false, true]);
  });

  test("exactly three img elements, each measuring 2400 naturalWidth from the loaded bitmap, each with a non-empty alt", async ({
    page,
  }) => {
    await visitCaseStudy(page, "/writing/the-chart-therefore-changes");
    const imgs = page.locator(".prose-site img");
    await expect(imgs).toHaveCount(3);

    const widths = await measuredImageWidths(page);
    for (const width of widths) {
      expect(width).toBe(2400);
    }

    const alts = await imgs.evaluateAll((els) => els.map((el) => el.getAttribute("alt")));
    for (const alt of alts) {
      expect(alt).toBeTruthy();
    }
  });

  test('exactly one link to the live piece inside .prose-site, and no element anywhere on the page carries target="_blank" (D-20)', async ({
    page,
  }) => {
    await visitCaseStudy(page, "/writing/the-chart-therefore-changes");
    const outboundLinks = page.locator('.prose-site a[href^="https://ib-gdp.guillemgelabert.com"]');
    await expect(outboundLinks).toHaveCount(1);
    // "the site uses none" — checked unscoped, across the whole page, not
    // just inside the prose body.
    await expect(page.locator('[target="_blank"]')).toHaveCount(0);
  });

  test("the first blockquote's computed font-style is italic, and an em nested inside it resets to computed font-style normal (02-UI-SPEC Prose Contract)", async ({
    page,
  }) => {
    await visitCaseStudy(page, "/writing/the-chart-therefore-changes");
    const blockquote = page.locator(".prose-site blockquote").first();
    expect(await page.locator(".prose-site blockquote").count()).toBeGreaterThan(0);

    const blockquoteFontStyle = await blockquote.evaluate((el) => getComputedStyle(el).fontStyle);
    expect(blockquoteFontStyle).toBe("italic");

    // 02-UI-SPEC names the case study as exactly where an emphasised phrase
    // inside a pull quote first appears — this is the assertion that proves
    // the blockquote-em upright reset did not go invisible in production.
    const em = blockquote.locator("em").first();
    expect(await blockquote.locator("em").count()).toBeGreaterThan(0);
    const emFontStyle = await em.evaluate((el) => getComputedStyle(el).fontStyle);
    expect(emFontStyle).toBe("normal");
  });
});

test.describe("German case-study route (CASE-02, both draft branches)", () => {
  test("the route responds 200, .prose-site holds exactly six h2 elements matching the locked German section marks with non-empty ids, and zero h3-h6", async ({
    page,
  }) => {
    // Playwright runs against `npm run dev`, where showDrafts() is always
    // true, so this block passes whichever way Plan 04's executor sets the
    // German draft flag (D-17's escape hatch) — the German's PRODUCTION
    // visibility is asserted in tests/build/ instead, where drafts are
    // actually hidden.
    const response = await visitCaseStudy(page, "/texte/die-darstellung-aendert-sich");
    expect(response?.status()).toBe(200);

    const h2s = page.locator(".prose-site h2");
    await expect(h2s).toHaveCount(6);

    const texts = await h2s.allTextContents();
    expect(texts).toEqual(DE_SECTIONS);

    const ids = await h2s.evaluateAll((els) => els.map((el) => el.id));
    for (const id of ids) {
      expect(id.length).toBeGreaterThan(0);
    }

    for (const tag of ["h3", "h4", "h5", "h6"]) {
      await expect(page.locator(`.prose-site ${tag}`)).toHaveCount(0);
    }
  });
});
