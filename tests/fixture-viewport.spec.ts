import { expect, test } from "@playwright/test";

// Covers WRIT-01 (SC5): the fixture renders every Prose Contract element at
// 375px and at 1440px, with no horizontal PAGE overflow. Code blocks and
// tables are allowed — expected — to scroll inside their own containers;
// this spec asserts that distinction explicitly rather than conflating the
// two, per 02-VALIDATION.md.

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
];

async function readFixture(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const prose = document.querySelector(".prose-site");
    const q = (sel: string) => (prose ? prose.querySelectorAll(sel).length : 0);
    const counts = {
      h2: q("h2"),
      h3: q("h3"),
      p: q("p"),
      strong: q("strong"),
      em: q("em"),
      blockquote: q("blockquote"),
      blockquoteEm: q("blockquote em"),
      inlineCode: prose
        ? Array.from(prose.querySelectorAll("code")).filter((c) => !c.closest("pre")).length
        : 0,
      ul: q("ul"),
      ol: q("ol"),
      nestedOlOl: q("ol ol"),
      nestedOlUl: q("ol ul"),
      table: q("table"),
      th: q("th"),
      td: q("td"),
      figcaption: q("figcaption"),
      aside: q("aside"),
      hr: q("hr"),
      internalLink: q('a[href^="/"]'),
      externalLink: q('a[href^="http"]'),
      pre: q("pre"),
      figure: q("figure"),
      figureWide: q("figure[data-wide]"),
    };

    // Internal-scroll distinction: a pre or a .prose-table whose own
    // scrollWidth exceeds its own clientWidth is correct behaviour, not a
    // bug — collected separately from the page-level overflow check below.
    const internallyScrolling = Array.from(
      document.querySelectorAll(".prose-site pre, .prose-site .prose-table"),
    ).filter((el) => el.scrollWidth > el.clientWidth).length;

    const h2El = document.querySelector(".prose-site h2");
    const h3El = document.querySelector(".prose-site h3");
    const h2s = h2El ? getComputedStyle(h2El) : null;
    const h3s = h3El ? getComputedStyle(h3El) : null;

    return {
      counts,
      internallyScrolling,
      pageScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      h2: h2s && { marginTop: h2s.marginTop, borderBottomWidth: h2s.borderBottomWidth },
      h3: h3s && { marginTop: h3s.marginTop, borderBottomWidth: h3s.borderBottomWidth },
    };
  });
}

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.width}px`, () => {
    test(`every Prose Contract element renders at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/writing/fixture");
      await page.evaluate(() => document.fonts.ready);

      const { counts } = await readFixture(page);

      expect(counts.h2, "h2").toBeGreaterThan(0);
      expect(counts.h3, "h3").toBeGreaterThan(0);
      expect(counts.p, "p").toBeGreaterThan(0);
      expect(counts.strong, "strong").toBeGreaterThan(0);
      expect(counts.em, "em").toBeGreaterThan(0);
      expect(counts.blockquote, "blockquote").toBeGreaterThan(0);
      expect(counts.blockquoteEm, "blockquote em").toBeGreaterThan(0);
      expect(counts.inlineCode, "code outside a pre").toBeGreaterThan(0);
      expect(counts.ul, "ul").toBeGreaterThan(0);
      expect(counts.ol, "ol").toBeGreaterThan(0);
      expect(
        counts.nestedOlOl > 0 || counts.nestedOlUl > 0,
        "a nested ol ol or ol ul",
      ).toBe(true);
      expect(counts.table, "table").toBeGreaterThan(0);
      expect(counts.th, "th").toBeGreaterThan(0);
      expect(counts.td, "td").toBeGreaterThan(0);
      expect(counts.figcaption, "figcaption").toBeGreaterThan(0);
      expect(counts.aside, "aside").toBeGreaterThan(0);
      expect(counts.hr, "hr").toBeGreaterThan(0);
      expect(counts.internalLink, 'a[href^="/"]').toBeGreaterThan(0);
      expect(counts.externalLink, 'a[href^="http"]').toBeGreaterThan(0);
      expect(counts.pre, "exactly two pre").toBe(2);
      expect(counts.figure, "exactly two figure").toBe(2);
      expect(counts.figureWide, "one figure[data-wide]").toBe(1);
    });

    test(`no page-level horizontal overflow at ${viewport.width}px — internal scrolling of code/tables is fine`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/writing/fixture");
      await page.evaluate(() => document.fonts.ready);

      const { pageScrollWidth, innerWidth, internallyScrolling } = await readFixture(page);

      // The page itself must not scroll sideways (1px rounding tolerance).
      // NOTE: this check is one-sided. scrollWidth only ever grows to the
      // RIGHT — content hanging off x < 0 is clipped and unreachable but
      // contributes nothing to scrollWidth, so this assertion passed for the
      // whole of Plan 04 while <Figure wide> sat 61px off the left edge. The
      // two-sided check lives in the bounding-box test below; do not delete it
      // on the grounds that this one already covers overflow.
      expect(pageScrollWidth).toBeLessThanOrEqual(innerWidth + 1);

      // At least one element (the long bash fenced block) is expected to
      // scroll inside its own container — 18px mono forcing that at 375px
      // is accepted, not a bug. This is a different scrollWidth check from
      // the page-level one above; the two must not be confused.
      expect(internallyScrolling).toBeGreaterThan(0);
    });

    test(`the h2/h3 hierarchy signal — a 1px rule and 48px vs 32px top margin — is still measurable at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/writing/fixture");
      await page.evaluate(() => document.fonts.ready);

      const { h2, h3 } = await readFixture(page);
      expect(h2).not.toBeNull();
      expect(h3).not.toBeNull();

      // If this fails optically at 375px, the fix is more space above h2,
      // never a fifth type size (UI-SPEC Dimension 4 flag #2).
      expect(h2!.marginTop).toBe("48px");
      expect(parseFloat(h2!.borderBottomWidth)).toBeGreaterThan(0);
      expect(h3!.marginTop).toBe("32px");
      expect(h3!.borderBottomWidth).toBe("0px");
    });
  });
}

// The breakout check the overflow test above structurally cannot make.
// Measured at the three desktop widths the code review used, plus 375px:
// getBoundingClientRect() sees both edges, so a figure centred on a
// left-pinned column (margin-left: 50% + translateX(-50%)) fails here at
// x = -61 even though documentElement.scrollWidth reads exactly innerWidth.
const WIDE_FIGURE_WIDTHS = [375, 1280, 1440, 1920];

test("<Figure wide> stays inside the viewport at every width and still breaks the reading measure on desktop", async ({
  page,
}) => {
  await page.goto("/writing/fixture");
  await page.evaluate(() => document.fonts.ready);

  const figure = page.locator(".prose-site figure[data-wide]");
  const prose = page.locator(".prose-site");

  for (const width of WIDE_FIGURE_WIDTHS) {
    await page.setViewportSize({ width, height: 900 });

    const box = await figure.boundingBox();
    expect(box, `figure[data-wide] must be laid out at ${width}px`).not.toBeNull();

    // Neither edge may leave the viewport (1px rounding tolerance).
    expect(box!.x, `left edge at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width, `right edge at ${width}px`).toBeLessThanOrEqual(width + 1);

    // ...and it must still be a breakout: at desktop widths the wide measure
    // has to be wider than the 65ch reading measure, or the fix degenerated
    // into clamping the figure down to the column.
    if (width >= 1280) {
      const proseBox = await prose.boundingBox();
      expect(box!.width, `wide measure vs reading measure at ${width}px`).toBeGreaterThan(
        proseBox!.width,
      );
    }
  }
});
