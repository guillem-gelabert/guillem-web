import { expect, test } from "@playwright/test";

// Covers WRIT-01 (SC3): rendered prose computes to Phase 1's four type roles
// (Display/Heading/Body/Label — this page only ever reaches Body and Label)
// rather than @tailwindcss/typography's own default scale.
//
// Two Phase 1 lessons apply directly (STATE.md, 02-VALIDATION.md):
//   1. Assert computed values measured from a real render, not values assumed
//      from the plan. Every assertion below was read from a live page via
//      getComputedStyle, not derived from the authored CSS text.
//   2. page.emulateMedia({ reducedMotion: 'reduce' }) before page.goto() is
//      not needed here — this spec measures static typography, not motion —
//      but is recorded for consistency with the rest of the suite.
//
// Deviation note (recorded in full in 02-05-SUMMARY.md): three measured
// disagreements between the shipped CSS and the Prose Contract were found
// and corrected in app/globals.css before this spec was written:
//   - .prose-site blockquote declared no font-family/font-size/line-height
//     and rendered in the browser's default sans-serif at 16px, not
//     Newsreader 18px/1.6. Fixed by adding the three declarations.
//   - .prose-site itself declared no Body-role default, so ul/ol list items
//     and <Aside> body text (neither of which has its own font rule) fell
//     back to the same 16px default. Fixed by putting the Body role
//     (Newsreader, 18px, 400, 1.6) on .prose-site itself, which every more
//     specific selector (h2/h3/th/td/code/pre) already overrides.
//   - .prose-site table declared no font-size, so <table>/<thead>/<tbody>/
//     <tr> (which carry no visible text themselves — all text lives in
//     already-correct <th>/<td> cells) retained @tailwindcss/typography's
//     own 0.875em (15.75px against an 18px base). Fixed with an explicit
//     14px to close the gap for the negative assertion below.

async function readTypography(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    function cs(selector: string) {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        textTransform: s.textTransform,
        borderBottomWidth: s.borderBottomWidth,
        borderTopWidth: s.borderTopWidth,
        borderLeftWidth: s.borderLeftWidth,
        marginTop: s.marginTop,
        fontVariantNumeric: s.fontVariantNumeric,
      };
    }

    // The negative assertion: walk every element under .prose-site and
    // collect the distinct computed font sizes, excluding `pre code` spans
    // (Shiki token spans), which inherit from `pre` and are not part of the
    // Body/Label budget being measured here.
    const distinctFontSizes = Array.from(
      new Set(
        Array.from(document.querySelectorAll(".prose-site *"))
          .filter((el) => !el.closest("pre"))
          .map((el) => getComputedStyle(el).fontSize),
      ),
    );

    return {
      p: cs(".prose-site p"),
      h2: cs(".prose-site h2"),
      h3: cs(".prose-site h3"),
      strong: cs(".prose-site strong"),
      em: cs(".prose-site em"),
      blockquote: cs(".prose-site blockquote"),
      blockquoteEm: cs(".prose-site blockquote em"),
      th: cs(".prose-site th"),
      td: cs(".prose-site td"),
      distinctFontSizes,
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/writing/fixture");
  await page.evaluate(() => document.fonts.ready);
});

test("paragraph computes to Newsreader 18px/400 with the real 1.6 line-height in pixels", async ({
  page,
}) => {
  const { p } = await readTypography(page);
  expect(p).not.toBeNull();
  expect(p!.fontFamily).toContain("Newsreader");
  expect(p!.fontSize).toBe("18px");
  expect(p!.fontWeight).toBe("400");
  // Computed pixel value of line-height: 1.6 at 18px, not the authored "1.6".
  expect(p!.lineHeight).toBe("28.8px");
});

test("h2 and h3 carry identical type, split only by the rule and the top margin — the hierarchy signal", async ({
  page,
}) => {
  const { h2, h3 } = await readTypography(page);
  expect(h2).not.toBeNull();
  expect(h3).not.toBeNull();

  // Identical type metrics: same size, same case, same tracking.
  for (const heading of [h2!, h3!]) {
    expect(heading.fontSize).toBe("14px");
    expect(heading.textTransform).toBe("uppercase");
    // Computed pixel value of 0.04em at 14px, not the authored "0.04em".
    expect(heading.letterSpacing).toBe("0.56px");
  }

  // The rule: h2 gets a full-ink rule beneath it, h3 does not.
  expect(parseFloat(h2!.borderBottomWidth)).toBeGreaterThan(0);
  expect(h3!.borderBottomWidth).toBe("0px");

  // The margin: h2 sits further from the preceding block than h3 does.
  expect(h2!.marginTop).toBe("48px");
  expect(h3!.marginTop).toBe("32px");
});

test("strong renders at weight 530, not 600 or 700", async ({ page }) => {
  const { strong } = await readTypography(page);
  expect(strong).not.toBeNull();
  expect(strong!.fontWeight).toBe("530");
});

test("em renders italic at weight 400 in Newsreader — proof the loader's added italic actually loaded", async ({
  page,
}) => {
  const { em } = await readTypography(page);
  expect(em).not.toBeNull();
  expect(em!.fontStyle).toBe("italic");
  expect(em!.fontWeight).toBe("400");
  expect(em!.fontFamily).toContain("Newsreader");
});

test("blockquote is italic Body role between two hairlines with no left bar", async ({
  page,
}) => {
  const { blockquote } = await readTypography(page);
  expect(blockquote).not.toBeNull();
  expect(blockquote!.fontStyle).toBe("italic");
  expect(parseFloat(blockquote!.borderTopWidth)).toBeGreaterThan(0);
  expect(parseFloat(blockquote!.borderBottomWidth)).toBeGreaterThan(0);
  expect(blockquote!.borderLeftWidth).toBe("0px");
});

test("an em nested inside a blockquote resets upright — without this the emphasis is invisible against the quote's own italic", async ({
  page,
}) => {
  const { blockquoteEm } = await readTypography(page);
  expect(blockquoteEm).not.toBeNull();
  expect(blockquoteEm!.fontStyle).toBe("normal");
});

test("table header and data cells render Label role with the sentence-case/tracking-0 distinction on td", async ({
  page,
}) => {
  const { th, td } = await readTypography(page);
  expect(th).not.toBeNull();
  expect(td).not.toBeNull();

  expect(th!.fontSize).toBe("14px");
  expect(th!.textTransform).toBe("uppercase");
  expect(th!.letterSpacing).toBe("0.56px");

  expect(td!.fontSize).toBe("14px");
  expect(td!.textTransform).toBe("none");
  expect(["normal", "0px"]).toContain(td!.letterSpacing);
  expect(td!.fontVariantNumeric).toContain("tabular-nums");
});

test("the typography plugin's own scale is not in force — every rendered prose element resolves to 14px or 18px, nothing else", async ({
  page,
}) => {
  const { distinctFontSizes } = await readTypography(page);
  expect(distinctFontSizes.length).toBeGreaterThan(0);
  for (const size of distinctFontSizes) {
    expect(["14px", "18px"]).toContain(size);
  }
});
