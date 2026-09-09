import { expect, test } from "@playwright/test";
import { WORK } from "../lib/work";

// The second scene. It was content-free and aria-hidden — the composition
// continuing past the fold — and it now holds every published piece after
// the first, each as a PAIR: a circle (the thumbnail, or a flat fill while
// none is committed) beside a square (title, annotation, two tags). The
// first piece stays the hero disc in the scene above; nothing is printed
// twice.
//
// What these pin is the structure a third entry has to keep: the scene is
// a real landmark, one link per pair named by the title, the two tags
// present, the circle genuinely square, the square the circle's width, the
// grid's column count following the width, and the background still
// mirrored while the content reads upright.

const [hero, ...more] = WORK;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("the mirrored scene is the 'More work' landmark and holds every piece after the first", async ({
  page,
}) => {
  const scene = page.locator("#seam-scene-mirrored");
  await expect(scene).toHaveCount(1);
  await expect(scene).not.toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("region", { name: "More work" })).toHaveCount(1);

  const items = scene.getByRole("listitem");
  await expect(items).toHaveCount(more.length);

  for (const [index, entry] of more.entries()) {
    const item = items.nth(index);
    // One link, the title, same tab.
    const links = item.locator("a");
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute("href", entry.href);
    await expect(links).toHaveText(entry.title);
    await expect(links).not.toHaveAttribute("target", "_blank");
    // Both body paragraphs and every tag reach the page as text, and the
    // one-line annotation — the hero's standfirst register — does not.
    for (const paragraph of entry.body) await expect(item).toContainText(paragraph);
    await expect(item).not.toContainText(entry.annotation);
    await expect(item).toContainText(entry.domain);
    await expect(item).toContainText(entry.contentType);
    for (const tool of entry.stack) await expect(item).toContainText(tool);
    await expect(item.locator(".seam-pair-tags > *")).toHaveCount(2 + entry.stack.length);
    await expect(item.locator(".seam-pair-body")).toHaveCount(2);
    // The optional colour reveal is a second, decorative image over its
    // declared display shot; a null shot still renders no image.
    await expect(item.locator("img")).toHaveCount(entry.shot === null ? 0 : entry.shot.reveal ? 2 : 1);
  }
});

test("the second piece is printed once, below the fold, and not in the hero", async ({ page }) => {
  const [second] = more;
  const everywhere = page.locator("main").getByText(second.title, { exact: true });
  await expect(everywhere).toHaveCount(1);
  await expect(page.locator("section#story").getByText(second.title, { exact: true })).toHaveCount(0);
  // The hero links its own piece and nothing else.
  await expect(page.locator("section#story a")).toHaveCount(1);
  await expect(page.locator("section#story a")).toHaveAttribute("href", hero.href);
});

test("work titles keep their neutral treatment on hover", async ({ page }) => {
  const link = page.locator(".seam-pair-link").first();
  const rest = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, decoration: style.textDecorationLine };
  });

  await link.hover();
  const hover = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, decoration: style.textDecorationLine };
  });

  expect(hover.color).toBe(rest.color);
  expect(hover.decoration).toBe("none");
});

test("the globe fills its borderless circle and reveals its colour image from either half of the pair", async ({
  page,
}) => {
  const item = page.locator("#seam-scene-mirrored").getByRole("listitem").first();
  const circle = item.locator(".seam-pair-circle");
  const square = item.locator(".seam-pair-square");
  const dither = circle.locator(".seam-pair-shot");
  const colour = circle.locator(".seam-pair-reveal");

  await expect(colour).toHaveCount(1);
  await expect(circle).toHaveCSS("border-top-width", "0px");
  const bounds = await page.evaluate(() => {
    const circle = document.querySelector(".seam-pair-circle")!.getBoundingClientRect();
    const image = document.querySelector(".seam-pair-shot")!.getBoundingClientRect();
    const reveal = document.querySelector(".seam-pair-reveal")!.getBoundingClientRect();
    return { circle, image, reveal };
  });
  for (const image of [bounds.image, bounds.reveal]) {
    // The square source has black air around the globe itself. Each layer is
    // deliberately scaled past the mask, so that air is cropped and the
    // sphere fills the full circular slot rather than reading as an inset.
    expect(image.width).toBeGreaterThanOrEqual(bounds.circle.width * 1.14);
    expect(image.height).toBeGreaterThanOrEqual(bounds.circle.height * 1.14);
    expect(Math.abs(image.x + image.width / 2 - (bounds.circle.x + bounds.circle.width / 2))).toBeLessThanOrEqual(1);
    expect(Math.abs(image.y + image.height / 2 - (bounds.circle.y + bounds.circle.height / 2))).toBeLessThanOrEqual(1);
  }

  await expect(colour).toHaveCSS("opacity", "0");
  // The link's expanded hit area intentionally sits over the circle. Force
  // the pointer to the circle's coordinates; the pair still receives :hover.
  await circle.hover({ force: true });
  await expect(colour).toHaveCSS("opacity", "1");
  await square.hover();
  await expect(colour).toHaveCSS("opacity", "1");
  await expect(dither).toHaveCSS("opacity", "1");
});

test("each pair is a circle beside a square of the same side, on one row at 1440x900", async ({
  page,
}) => {
  const items = page.locator("#seam-scene-mirrored").getByRole("listitem");
  const count = await items.count();
  for (let index = 0; index < count; index += 1) {
    const item = items.nth(index);
    const circle = item.locator(".seam-pair-circle");
    const square = item.locator(".seam-pair-square");
    const scene = page.locator("#seam-scene-mirrored");
    const c = await circle.boundingBox();
    const s = await square.boundingBox();
    const sceneBox = await scene.boundingBox();
    if (!c || !s || !sceneBox) throw new Error("pair boxes missing");

    // The circle is a circle: a square box with a 50% radius.
    expect(Math.abs(c.width - c.height)).toBeLessThanOrEqual(1);
    await expect(circle).toHaveCSS("border-radius", "50%");
    // The square is the circle's width and height. Content must not be able
    // to overrule the panel's 1:1 geometry.
    expect(Math.abs(s.width - c.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(s.height - c.height)).toBeLessThanOrEqual(1);
    // The air between the two shapes uses the same gutter as the air from
    // the pair to the scene edge.
    const pairGap = s.x - (c.x + c.width);
    const outerGutter = c.x - sceneBox.x;
    expect(Math.abs(pairGap - outerGutter)).toBeLessThanOrEqual(1);
    // Side by side, tops aligned: one row, circle first.
    expect(Math.abs(s.y - c.y)).toBeLessThanOrEqual(1);
    expect(s.x).toBeGreaterThan(c.x + c.width);
    // Both inside the viewport's width — the pair fits its box.
    expect(c.x).toBeGreaterThanOrEqual(0);
    expect(s.x + s.width).toBeLessThanOrEqual(1440);
  }
});

test("the background is mirrored, the content is not", async ({ page }) => {
  // The flip used to sit on the section, which would turn any content
  // inside it upside down. It lives on the grain now: the section itself
  // has no transform, and the grain carries exactly scaleY(-1).
  const transforms = await page.evaluate(() => {
    const scene = document.querySelector("#seam-scene-mirrored") as HTMLElement;
    const grain = scene.querySelector(".seam-grain") as HTMLElement;
    const list = scene.querySelector("ol") as HTMLElement;
    return {
      scene: getComputedStyle(scene).transform,
      grain: getComputedStyle(grain).transform,
      list: getComputedStyle(list).transform,
    };
  });
  expect(transforms.scene).toBe("none");
  expect(transforms.grain).toBe("matrix(1, 0, 0, -1, 0, 0)");
  expect(transforms.list).toBe("none");
});

test("the grid fills the scene inside its insets and the first pair starts at the top-left", async ({
  page,
}) => {
  // The box (#seam-more) is the scene's full width and carries the insets
  // as padding, so the LIST inside it is what sits inset from the scene.
  const measured = await page.evaluate(() => {
    const scene = document.querySelector("#seam-scene-mirrored")!.getBoundingClientRect();
    const box = document.querySelector("#seam-more ol")!.getBoundingClientRect();
    const first = document.querySelector("#seam-more li")!.getBoundingClientRect();
    return {
      insetTop: box.top - scene.top,
      insetLeft: box.left - scene.left,
      insetRight: scene.right - box.right,
      insetBottom: scene.bottom - box.bottom,
      firstTop: first.top - box.top,
      firstLeft: first.left - box.left,
    };
  });
  // The declared top and horizontal insets are the scene gutter. The box
  // packs from its top, so bottom also includes any remaining scene height.
  for (const inset of [measured.insetTop, measured.insetLeft, measured.insetRight]) {
    expect(inset).toBeGreaterThan(0);
    expect(inset).toBeLessThan(200);
  }
  expect(measured.insetBottom).toBeGreaterThan(0);
  // The first pair sits in the box's top-left cell.
  expect(Math.abs(measured.firstTop)).toBeLessThanOrEqual(1);
  expect(Math.abs(measured.firstLeft)).toBeLessThanOrEqual(1);
});

// Columns from the width AND the count. The track minimum is
// clamp(max(22%, (100% - gaps) / count), 36rem, 100%): the width alone
// would give a phone one column, 1440 two, 1920 three and 2560 four, never
// five — and the count caps that at the number of pairs, so one piece is
// one column everywhere. WORK holds two pieces today (one pair), so the
// width half of the rule is exercised by writing other counts into the
// same custom property the component sets, and reading the columns back.
const COLUMNS = [
  { width: 393, height: 852, fit: 1, phone: true },
  { width: 1366, height: 768, fit: 2, phone: false },
  { width: 1440, height: 900, fit: 2, phone: false },
  { width: 1920, height: 1080, fit: 3, phone: false },
  { width: 2560, height: 1440, fit: 4, phone: false },
];
const COUNTS = [1, 2, 3, 4, 6];

// The square's type scales with the square: on the desktop's lone 663px pair
// the body is ~24px and the title ~46px, well above the site's fixed 18px
// roles, and on a phone's stacked pair those fixed sizes are the floor.
test("the square's type is sized against the square, with the site's roles as the floor", async ({
  page,
}) => {
  const read = () =>
    page.evaluate(() => {
      const square = document.querySelector(".seam-pair-square")!;
      const px = (el: Element, prop: string) => parseFloat(getComputedStyle(el).getPropertyValue(prop));
      return {
        side: square.getBoundingClientRect().width,
        title: px(square.querySelector(".seam-pair-title")!, "font-size"),
        body: px(square.querySelector(".seam-pair-body")!, "font-size"),
        tag: px(square.querySelector(".seam-pair-tags > *")!, "font-size"),
        titleWeight: getComputedStyle(square.querySelector(".seam-pair-title")!).fontWeight,
      };
    });
  const desktop = await read();
  expect(desktop.side).toBeGreaterThan(600);
  expect(desktop.body).toBeGreaterThan(22);
  expect(desktop.title).toBeGreaterThan(40);
  expect(desktop.tag).toBeGreaterThan(15);
  expect(desktop.titleWeight).toBe("530");
  // Shrink the square (two columns) and the floors take over.
  await page.evaluate(() => (document.querySelector("#seam-more ol") as HTMLElement).style.setProperty("--pair-count", "2"));
  const small = await read();
  expect(small.side).toBeLessThan(400);
  expect(small.body).toBe(18);
  expect(small.tag).toBe(14);
});

test("on a phone the pair stands — circle over square, both the full width — and the scene grows", async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const m = await page.evaluate(() => {
    const list = document.querySelector("#seam-more ol")!.getBoundingClientRect();
    const c = document.querySelector(".seam-pair-circle")!.getBoundingClientRect();
    const s = document.querySelector(".seam-pair-square")!.getBoundingClientRect();
    const square = document.querySelector(".seam-pair-square") as HTMLElement;
    const scene = document.querySelector("#seam-scene-mirrored")!.getBoundingClientRect();
    return {
      list: list.width,
      c,
      s: { x: s.x, y: s.y, width: s.width, height: s.height, bottom: s.bottom },
      content: { height: square.clientHeight, scrollHeight: square.scrollHeight },
      scene: scene.height,
      sceneBottom: scene.bottom,
    };
  });
  expect(Math.abs(m.c.width - m.list)).toBeLessThanOrEqual(1);
  expect(Math.abs(m.s.width - m.list)).toBeLessThanOrEqual(1);
  expect(Math.abs(m.s.height - m.s.width)).toBeLessThanOrEqual(1);
  expect(m.content.scrollHeight).toBeLessThanOrEqual(m.content.height);
  expect(m.s.y).toBeGreaterThanOrEqual(m.c.y + m.c.height);
  // The scene is at least a screen and holds the whole pair.
  expect(m.scene).toBeGreaterThanOrEqual(852);
  expect(m.s.bottom).toBeLessThanOrEqual(m.sceneBottom + 1);
  await context.close();
});

async function columnsFor(page: import("@playwright/test").Page, count: number) {
  return page.evaluate((count) => {
    const list = document.querySelector("#seam-more ol") as HTMLElement;
    list.style.setProperty("--pair-count", String(count));
    const pair = list.querySelector("li") as HTMLElement;
    const circle = pair.querySelector(".seam-pair-circle") as HTMLElement;
    const square = pair.querySelector(".seam-pair-square") as HTMLElement;
    const tracks = getComputedStyle(list).gridTemplateColumns.split(" ").length;
    return {
      tracks,
      listWidth: list.getBoundingClientRect().width,
      pairWidth: pair.getBoundingClientRect().width,
      gap: parseFloat(getComputedStyle(list).columnGap),
      span: square.getBoundingClientRect().right - circle.getBoundingClientRect().left,
      side: circle.getBoundingClientRect().height,
    };
  }, count);
}

for (const viewport of COLUMNS) {
  test(`min(${viewport.fit}, count) columns at ${viewport.width}x${viewport.height}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      ...(viewport.phone ? { hasTouch: true, isMobile: true } : {}),
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    // As shipped: the component wrote WORK's own count, one pair today.
    const shipped = await page.evaluate(
      () => getComputedStyle(document.querySelector("#seam-more ol")!).gridTemplateColumns.split(" ").length,
    );
    expect(shipped).toBe(Math.min(viewport.fit, more.length));

    for (const count of COUNTS) {
      const grid = await columnsFor(page, count);
      expect(grid.tracks, `count ${count}`).toBe(Math.min(viewport.fit, count));
      // The pair is one column wide and its two shapes plus the gap fill
      // it — the side is only ever capped by the height, and none of these
      // viewports is short enough for that to bind.
      expect(Math.abs(grid.pairWidth * grid.tracks + grid.gap * (grid.tracks - 1) - grid.listWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(grid.span - grid.pairWidth)).toBeLessThanOrEqual(1);
    }
    await context.close();
  });
}

test("a lone pair is held to the scene's height in a short window", async ({ page }) => {
  // 1440x600: one column is a 663px side, and the scene less its two
  // insets is ~499px. The cap binds: the circle's side is exactly that,
  // and the pair stays left-aligned, stopping short of the column's right
  // edge rather than running under the fold. The square obeys the same cap,
  // preserving its 1:1 geometry even when its copy needs more room.
  await page.setViewportSize({ width: 1440, height: 600 });
  const measured = await page.evaluate(() => {
    const scene = document.querySelector("#seam-scene-mirrored")!.getBoundingClientRect();
    const list = document.querySelector("#seam-more ol")!.getBoundingClientRect();
    const pair = document.querySelector("#seam-more li")!.getBoundingClientRect();
    const circle = document.querySelector("#seam-more .seam-pair-circle")!.getBoundingClientRect();
    const square = document.querySelector("#seam-more .seam-pair-square")!.getBoundingClientRect();
    // All four --edge values are equal on a desktop, so the top inset is
    // also the bottom one.
    const inset = list.top - scene.top;
    return {
      cap: 600 - 2 * inset,
      side: circle.height,
      square: { width: square.width, height: square.height },
      pairLeft: pair.left - list.left,
      listWidth: list.width,
      pairWidth: pair.width,
    };
  });
  expect(Math.abs(measured.side - measured.cap)).toBeLessThanOrEqual(1);
  expect(Math.abs(measured.square.width - measured.square.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(measured.pairLeft)).toBeLessThanOrEqual(1);
  // The pair no longer fills its column: the cap, not the width, set it.
  expect(measured.side * 2).toBeLessThan(measured.listWidth - 100);
});

// A phone on its side: the ideal column is half the box rather than 36rem,
// so two pieces are two columns (812px of content is one 36rem column, and
// one column there is a 400px pair in a 390px-tall scene). One piece is
// still one column, and the height cap holds that pair to the scene.
test("a landscape phone lays two columns for two pieces and one for one", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect((await columnsFor(page, 2)).tracks).toBe(2);
  expect((await columnsFor(page, 3)).tracks).toBe(2);
  const one = await columnsFor(page, 1);
  expect(one.tracks).toBe(1);
  const boxHeight = await page.evaluate(() => document.querySelector("#seam-more")!.getBoundingClientRect().height);
  expect(one.side).toBeLessThanOrEqual(boxHeight + 1);
  await context.close();
});
