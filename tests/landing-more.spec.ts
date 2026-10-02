import { expect, test } from "@playwright/test";
import { NOTES } from "../lib/notes";
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
  // Named by its visible heading (aria-labelledby), not by an aria-label
  // that said something else.
  await expect(page.getByRole("region", { name: "Projects" })).toHaveCount(1);
  await expect(page.locator("#seam-more-title")).toHaveText("Projects");

  // Scoped to the pairs' own list: the writing shelf under it
  // (components/landing/notes.tsx) is in the same scene and has list items
  // of its own.
  // The projects first, then the writing (lib/notes.ts), in one list.
  const items = scene.getByRole("listitem");
  await expect(items).toHaveCount(more.length + NOTES.length);

  for (const [index, entry] of more.entries()) {
    const item = items.nth(index);
    // One link, the host line, same tab. The title is plain type and the
    // pair is not a click target: see the box-is-not-clickable test below.
    const links = item.locator("a");
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute("href", entry.href);
    await expect(links).toHaveText("To project →");
    // Named for a screen reader by the piece it goes to: "To project"
    // repeated down a list names every link the same. The visible words open
    // the label, so WCAG 2.5.3's label-in-name holds.
    await expect(links).toHaveAttribute("aria-label", `To project: ${entry.title}`);
    await expect(links).not.toHaveAttribute("target", "_blank");
    // The title is still printed — as a heading, not a link.
    await expect(item.locator(".seam-pair-title")).toHaveText(entry.title);
    await expect(item.locator(".seam-pair-title a")).toHaveCount(0);
    // Both body paragraphs and every tag reach the page as text, and the
    // one-line annotation — the hero's standfirst register — does not.
    for (const paragraph of entry.body) await expect(item).toContainText(paragraph);
    await expect(item).not.toContainText(entry.annotation);
    for (const field of entry.domains) await expect(item).toContainText(field);
    await expect(item).toContainText(entry.contentType);
    for (const tool of entry.stack) await expect(item).toContainText(tool);
    await expect(item.locator(".seam-pair-tags > *")).toHaveCount(
      entry.domains.length + 1 + entry.stack.length,
    );
    // The domains are the rounded chips; the stack and the content type
    // are square. The shape is the only thing separating the two kinds.
    await expect(item.locator(".seam-pair-domain")).toHaveCount(entry.domains.length);
    await expect(item.locator(".seam-pair-body")).toHaveCount(2);
    // The optional colour reveal is a second, decorative image over its
    // declared display shot, and any thumbnail also carries the two sphere
    // shading maps; a null shot still renders no image at all.
    const shading = 2;
    await expect(item.locator("img")).toHaveCount(
      entry.shot === null ? 0 : (entry.shot.reveal ? 2 : 1) + shading,
    );
  }

  // The writing: the same pair with no link, no thumbnail, one subtitle and
  // at most one tag — TIL or Book, none on a post.
  for (const [index, note] of NOTES.entries()) {
    const item = items.nth(more.length + index);
    await expect(item.locator("a")).toHaveCount(0);
    await expect(item.locator("img")).toHaveCount(0);
    await expect(item.locator(".seam-pair-title")).toHaveText(note.title);
    await expect(item.locator(".seam-pair-body")).toHaveText(note.subtitle);
    await expect(item.locator(".seam-pair-tags > *")).toHaveText(note.tag === null ? [] : [note.tag]);
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

test("the pair's link reads as a link, and stays colour-neutral on hover", async ({ page }) => {
  const link = page.locator(".seam-pair-link").first();
  const rest = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, decoration: style.textDecorationLine };
  });

  // Underlined at rest. This is the one element in the pair that should
  // announce itself: the title is plain type and the box takes no clicks,
  // so without this the pair would offer no visible affordance at all.
  expect(rest.decoration).toBe("underline");

  await link.hover();
  // .link eases its colour (globals.css), so wait for it to land on the
  // square's before reading it.
  await expect
    .poll(() => link.evaluate((el) => getComputedStyle(el).color === getComputedStyle(el.closest(".seam-pair-square")!).color))
    .toBe(true);
  const hover = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    const square = getComputedStyle(element.closest(".seam-pair-square")!);
    return { color: style.color, decoration: style.textDecorationLine, square: square.color };
  });

  // The link has no hover colour of its own. Hovering it hovers the pair,
  // which repaints the whole entry in its own hover colour
  // (more-work.module.css), and the link just follows its square.
  expect(hover.color).toBe(hover.square);
  expect(hover.decoration).toBe("underline");
});

test("every pair hovers its own hue, at the featured badge's saturation and lightness", async ({ page }) => {
  const pairs = page.locator("#seam-more .seam-pair");
  const count = await pairs.count();
  const fills: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const pair = pairs.nth(index);
    await pair.hover();
    const { fill, circle, type } = await pair.evaluate((el) => ({
      fill: getComputedStyle(el.querySelector(".seam-pair-square")!).backgroundColor,
      circle: getComputedStyle(el.querySelector(".seam-pair-circle")!).backgroundColor,
      type: getComputedStyle(el.querySelector(".seam-pair-square")!).color,
    }));
    expect(circle, `pair ${index}: circle and square share the hover fill`).toBe(fill);
    const [r, g, b] = fill.match(/\d+/g)!.map(Number);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // #EE0000 is hsl(0 100% 46.7%): max 238, min 0.
    expect(max, `pair ${index} ${fill}`).toBeGreaterThanOrEqual(237);
    expect(max, `pair ${index} ${fill}`).toBeLessThanOrEqual(239);
    expect(min, `pair ${index} ${fill}`).toBe(0);
    expect(["rgb(0, 0, 0)", "rgb(255, 255, 255)"]).toContain(type);
    fills.push(fill);
  }
  expect(fills[0], "the first pair hovers the badge's own red").toBe("rgb(238, 0, 0)");
  expect(new Set(fills).size, fills.join(" | ")).toBe(count);
});

test("the pair's box is not a click target — only the link is", async ({ page }) => {
  const item = page.locator("#seam-scene-mirrored").getByRole("listitem").first();
  // elementFromPoint reads VIEWPORT coordinates, so the pair has to be on
  // screen first. Without this every probe returns null and the whole test
  // passes for the wrong reason.
  await item.scrollIntoViewIfNeeded();

  // What actually sits under the pointer at each of these points. The
  // anchor used to stretch a ::after over the whole <li>, so the circle and
  // the copy were both clickable with nothing on screen saying so.
  const probe = async (target: ReturnType<typeof item.locator>) => {
    const box = await target.boundingBox();
    if (!box) throw new Error("no box to probe");
    return page.evaluate(
      ([x, y]) => {
        const el = document.elementFromPoint(x, y);
        // null would mean the point is off screen — the caller must not read
        // that as "no link here".
        return el === null ? "OFFSCREEN" : el.closest("a") ? "LINK" : "NOT-A-LINK";
      },
      [box.x + box.width / 2, box.y + box.height / 2],
    );
  };

  expect(await probe(item.locator(".seam-pair-circle"))).toBe("NOT-A-LINK");
  expect(await probe(item.locator(".seam-pair-title"))).toBe("NOT-A-LINK");
  // And the link itself still takes the pointer at its own coordinates.
  expect(await probe(item.locator(".seam-pair-link"))).toBe("LINK");
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
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    return {
      circle: rect(".seam-pair-circle"),
      image: rect(".seam-pair-shot"),
      reveal: rect(".seam-pair-reveal"),
      shading: [...document.querySelectorAll(".seam-pair-shade")].map((element) =>
        element.getBoundingClientRect(),
      ),
    };
  });
  // EVERY layer is the circle exactly, and that is the whole registration
  // the treatment depends on. The capture used to be scaled to 1.16 because
  // it carried black air around the planet; it is cropped to the sphere's
  // own bounding square now, so it lands at 1:1 like the two shading maps —
  // whose sphere likewise meets all four edges of its frame. Scale any of
  // them and the terminator and rim light fall outside the mask.
  expect(bounds.shading).toHaveLength(2);
  for (const layer of [bounds.image, bounds.reveal, ...bounds.shading]) {
    expect(Math.abs(layer.width - bounds.circle.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(layer.height - bounds.circle.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(layer.x - bounds.circle.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(layer.y - bounds.circle.y)).toBeLessThanOrEqual(1);
  }

  const shading = circle.locator(".seam-pair-shade");
  await expect(colour).toHaveCSS("opacity", "0");
  // The shading is on at rest, over the grey capture.
  for (const index of [0, 1]) await expect(shading.nth(index)).toHaveCSS("opacity", "1");

  // Nothing overlays the circle now, but force is kept so this asserts the
  // reveal rather than the pointer's route to it.
  await circle.hover({ force: true });
  await expect(colour).toHaveCSS("opacity", "1");
  await square.hover();
  await expect(colour).toHaveCSS("opacity", "1");
  await expect(dither).toHaveCSS("opacity", "1");
  // Hovering resolves to the bare colour capture. The dither does not fade:
  // the opaque colour layer paints over it, which is what keeps any
  // mix-blend-mode layer out of the animation.
  for (const index of [0, 1]) await expect(shading.nth(index)).toHaveCSS("opacity", "1");
  const order = await circle.evaluate((el) =>
    [...el.querySelectorAll("img")].map((n) => n.className.split(" ")[0]));
  expect(order[order.length - 1]).toBe("seam-pair-reveal");
});

test("each pair is a circle beside a square of the same side, on one row at 1440x900, and every other row is flipped", async ({
  page,
}) => {
  // One real project ships today, and a checkerboard needs rows. Stand up
  // five copies of that pair (three rows at two columns); the row script in
  // pair-rows.tsx re-marks on the list's resize, so wait for a flipped row.
  await page.evaluate(() => {
    const list = document.querySelector("#seam-more ol") as HTMLElement;
    const pair = list.firstElementChild!;
    for (let i = list.children.length; i < 5; i += 1) list.append(pair.cloneNode(true));
    list.style.setProperty("--pair-count", "5");
  });
  await page.waitForFunction(() => document.querySelector("#seam-more ol > [data-flipped]") !== null);
  const items = page.locator("#seam-scene-mirrored").getByRole("listitem");
  const count = await items.count();
  // One gap everywhere: between a pair's two shapes, between columns and
  // between rows. Read off the grid itself, and asserted non-trivial.
  const gridGap = await page.evaluate(() => {
    const list = getComputedStyle(document.querySelector("#seam-more ol")!);
    return { column: parseFloat(list.columnGap), row: parseFloat(list.rowGap) };
  });
  expect(gridGap.column).toBeGreaterThan(0);
  expect(gridGap.row).toBe(gridGap.column);
  const shapesByRow: { x: number; right: number; y: number; bottom: number }[][] = [];

  let row = -1;
  let rowTop: number | null = null;
  for (let index = 0; index < count; index += 1) {
    const item = items.nth(index);
    const circle = item.locator(".seam-pair-circle");
    const square = item.locator(".seam-pair-square");
    const c = await circle.boundingBox();
    const s = await square.boundingBox();
    if (!c || !s) throw new Error("pair boxes missing");

    // The circle is a circle: a square box with a 50% radius.
    expect(Math.abs(c.width - c.height)).toBeLessThanOrEqual(1);
    await expect(circle).toHaveCSS("border-radius", "50%");
    // The square is the circle's width and height. Content must not be able
    // to overrule the panel's 1:1 geometry.
    expect(Math.abs(s.width - c.width), `pair ${index} width`).toBeLessThanOrEqual(1);
    expect(Math.abs(s.height - c.height), `pair ${index} height`).toBeLessThanOrEqual(1);
    // Side by side, tops aligned: one row.
    expect(Math.abs(s.y - c.y)).toBeLessThanOrEqual(1);

    // The checkerboard (components/landing/pair-rows.tsx): square first on
    // even rows, circle first on odd ones; and the pairs alternate black and
    // white by row plus column.
    if (rowTop === null || Math.abs(c.y - rowTop) > 1) {
      rowTop = c.y;
      row += 1;
      shapesByRow.push([]);
    }
    for (const box of [c, s]) {
      shapesByRow[row].push({ x: box.x, right: box.x + box.width, y: box.y, bottom: box.y + box.height });
    }
    const [left, right] = row % 2 === 0 ? [s, c] : [c, s];
    const column = shapesByRow[row].length / 2 - 1;
    const fill = (row + column) % 2 === 0 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
    await expect(square, `pair ${index} fill`).toHaveCSS("background-color", fill);
    await expect(circle, `pair ${index} fill`).toHaveCSS("background-color", fill);
    expect(right.x, `pair ${index} on row ${row}`).toBeGreaterThan(left.x + left.width);
    // The air between the two shapes is the grid's own gap.
    expect(Math.abs(right.x - (left.x + left.width) - gridGap.column)).toBeLessThanOrEqual(1);
    // Both inside the viewport's width — the pair fits its box.
    expect(left.x).toBeGreaterThanOrEqual(0);
    expect(right.x + right.width).toBeLessThanOrEqual(1440);
  }
  expect(row, "the grid should span more than one row").toBeGreaterThan(0);

  // Across the whole checkerboard: every horizontal gap between neighbouring
  // shapes in a row, and every gap between rows, is that same value.
  for (const [index, shapes] of shapesByRow.entries()) {
    const sorted = [...shapes].sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(Math.abs(sorted[i].x - sorted[i - 1].right - gridGap.column), `row ${index}, gap ${i}`).toBeLessThanOrEqual(1);
    }
    if (index > 0) {
      const above = Math.max(...shapesByRow[index - 1].map((box) => box.bottom));
      expect(Math.abs(shapes[0].y - above - gridGap.row), `above row ${index}`).toBeLessThanOrEqual(1);
    }
  }
});

test("the background is mirrored across the fold, the content is not", async ({ page }) => {
  // The flip used to sit on the section, which would turn any content
  // inside it upside down; then on the grain, as a scaleY(-1) about the
  // grain's own centre, which is a reflection across the fold only while
  // this scene is exactly one screen tall — on a phone it is taller and the
  // seam broke at the fold. It lives on the ink FIELD now: a reflection
  // (determinant -1) composed with the seam's rotation, about a pivot placed
  // where the first scene's pivot reflects to. The section, the grain and
  // the list carry no transform.
  const transforms = await page.evaluate(() => {
    const first = document.querySelector("#seam-scene") as HTMLElement;
    const scene = document.querySelector("#seam-scene-mirrored") as HTMLElement;
    const grain = scene.querySelector(".seam-grain") as HTMLElement;
    const list = scene.querySelector("ol") as HTMLElement;
    const det = (el: Element) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return m.a * m.d - m.b * m.c;
    };
    const pivot = (root: HTMLElement) => {
      const field = root.querySelector(".seam-grain-field") as HTMLElement;
      const f = field.getBoundingClientRect();
      const r = root.getBoundingClientRect();
      // The field is a square centred on its pivot; the transform is about
      // that centre, so the bounding box's centre IS the pivot.
      return f.top + f.height / 2 - r.top;
    };
    return {
      scene: getComputedStyle(scene).transform,
      grain: getComputedStyle(grain).transform,
      list: getComputedStyle(list).transform,
      firstFieldDet: det(first.querySelector(".seam-grain-field")!),
      mirroredFieldDet: det(grain.querySelector(".seam-grain-field")!),
      firstPivot: pivot(first),
      mirroredPivot: pivot(scene),
      firstHeight: first.getBoundingClientRect().height,
    };
  });
  expect(transforms.scene).toBe("none");
  expect(transforms.grain).toBe("none");
  expect(transforms.list).toBe("none");
  // A rotation keeps orientation; a rotation composed with one flip reverses it.
  expect(transforms.firstFieldDet).toBeCloseTo(1, 3);
  expect(transforms.mirroredFieldDet).toBeCloseTo(-1, 3);
  // The pivots are mirror images across the fold: as far below it as the
  // first one is above it.
  expect(
    Math.abs(transforms.mirroredPivot - (transforms.firstHeight - transforms.firstPivot)),
  ).toBeLessThanOrEqual(1);
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
// would give a phone one column and 1440 two. Past --container-page (96rem)
// the list stops growing — the boxed layout's --page-inset takes the rest —
// so 1920 and 2560 stay at two as well. The count caps that at the number
// of pairs, so one piece is
// one column everywhere. WORK holds two pieces today (one pair), so the
// width half of the rule is exercised by writing other counts into the
// same custom property the component sets, and reading the columns back.
const COLUMNS = [
  { width: 393, height: 852, fit: 1, phone: true },
  { width: 1366, height: 768, fit: 2, phone: false },
  { width: 1440, height: 900, fit: 2, phone: false },
  { width: 1920, height: 1080, fit: 2, phone: false },
  { width: 2560, height: 1440, fit: 2, phone: false },
];
const COUNTS = [1, 2, 3, 4, 6];

// The square's type scales with the square: on the desktop's lone 663px pair
// the body is ~24px and the title ~46px, well above the site's fixed 18px
// roles, and on a phone's stacked pair those fixed sizes are the floor.
test("the square's type is a fixed share of the square, at any size, and the square stays 1:1", async ({
  page,
}) => {
  const read = () =>
    page.evaluate(() => {
      const square = document.querySelector(".seam-pair-square")!;
      const px = (el: Element, prop: string) => parseFloat(getComputedStyle(el).getPropertyValue(prop));
      const box = square.getBoundingClientRect();
      return {
        side: box.width,
        height: box.height,
        title: px(square.querySelector(".seam-pair-title")!, "font-size"),
        body: px(square.querySelector(".seam-pair-body")!, "font-size"),
        tag: px(square.querySelector(".seam-pair-tags > *")!, "font-size"),
        titleWeight: getComputedStyle(square.querySelector(".seam-pair-title")!).fontWeight,
      };
    });
  // One column — a lone pair's square — then a two-column grid's smaller one.
  // No pixel floors (more-work.module.css): every size scales with the side,
  // so the ratios hold at both. Two is written rather than read off the
  // shipped list, which holds a single pair today.
  const setCount = (count: string) =>
    page.evaluate((value) => (document.querySelector("#seam-more ol") as HTMLElement).style.setProperty("--pair-count", value), count);
  await setCount("1");
  const large = await read();
  await setCount("2");
  const small = await read();
  expect(large.side).toBeGreaterThan(600);
  expect(small.side).toBeLessThan(400);
  expect(large.titleWeight).toBe("530");
  for (const size of [large, small]) {
    expect(Math.abs(size.height - size.side)).toBeLessThanOrEqual(1);
  }
  const scale = small.side / large.side;
  for (const key of ["title", "body", "tag"] as const) {
    expect(small[key] / large[key], key).toBeCloseTo(scale, 1);
  }
});

test("on a phone the pair stands — square over circle, both the full width — and the scene grows", async ({
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
  // SQUARE on top on a phone. The DOM order is unchanged — the square is
  // still second, so reading and focus order still meet the title and its
  // link before the picture; only the paint order flips, via
  // flex-direction: column-reverse (landing-seam.module.css, .more).
  expect(m.c.y).toBeGreaterThanOrEqual(m.s.y + m.s.height);
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
      // Either shape can lead (the checkerboard flips rows), so the span is
      // outermost edge to outermost edge.
      span:
        Math.max(square.getBoundingClientRect().right, circle.getBoundingClientRect().right) -
        Math.min(square.getBoundingClientRect().left, circle.getBoundingClientRect().left),
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

    // As shipped: the component wrote the projects' and the writing's
    // count together.
    const shipped = await page.evaluate(
      () => getComputedStyle(document.querySelector("#seam-more ol")!).gridTemplateColumns.split(" ").length,
    );
    expect(shipped).toBe(Math.min(viewport.fit, more.length + NOTES.length));

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

// The square holds a title, two paragraphs, a link and the chips, and its
// side is derived from the viewport — so the two can disagree. They did:
// before this was fixed a 320px window left a 136px square holding 661px of
// copy, because the pair kept its circle and square side by side in a column
// already too narrow for both, and the type's pixel floors could not shrink
// to meet it.
//
// Swept rather than spot-checked, and across BOTH pointer branches: the
// phone layout is a different branch of landing-seam.module.css, and the
// desktop one is what a narrow browser window gets.
for (const touch of [false, true]) {
  const branch = touch ? "phone" : "desktop";
  test(`the square never overflows its own box — ${branch} branch`, async ({ browser }) => {
    const sizes = [
      [320, 700], [360, 780], [375, 812], [393, 852], [430, 932],
      [600, 900], [768, 1024], [1024, 768], [1280, 800], [1440, 900],
    ] as const;

    for (const [width, height] of sizes) {
      const context = await browser.newContext({
        viewport: { width, height },
        hasTouch: touch,
        isMobile: touch,
      });
      const page = await context.newPage();
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      const squares = await page.evaluate(() =>
        [...document.querySelectorAll(".seam-pair-square")].map((square) => ({
          clientHeight: square.clientHeight,
          scrollHeight: square.scrollHeight,
          clientWidth: square.clientWidth,
          scrollWidth: square.scrollWidth,
        })),
      );
      expect(squares.length).toBeGreaterThan(0);

      for (const square of squares) {
        expect(
          square.scrollHeight,
          `${branch} ${width}x${height}: copy is ${square.scrollHeight}px in a ${square.clientHeight}px square`,
        ).toBeLessThanOrEqual(square.clientHeight);
        expect(
          square.scrollWidth,
          `${branch} ${width}x${height}: copy is ${square.scrollWidth}px in a ${square.clientWidth}px square`,
        ).toBeLessThanOrEqual(square.clientWidth);
      }
      await context.close();
    }
  });
}

test("a lone pair is held to the scene's height in a short window", async ({ page }) => {
  // 1440x600: one column is a 663px side, and the scene less its two
  // insets is ~499px. The cap binds: the circle's side is exactly that,
  // and the pair stays left-aligned, stopping short of the column's right
  // edge rather than running under the fold. The square obeys the same cap,
  // preserving its 1:1 geometry even when its copy needs more room.
  await page.setViewportSize({ width: 1440, height: 600 });
  // One column, as a lone pair would lay: the shipped grid has two here.
  await page.evaluate(() => (document.querySelector("#seam-more ol") as HTMLElement).style.setProperty("--pair-count", "1"));
  const measured = await page.evaluate(() => {
    const scene = document.querySelector("#seam-scene-mirrored")!.getBoundingClientRect();
    const list = document.querySelector("#seam-more ol")!.getBoundingClientRect();
    const pair = document.querySelector("#seam-more li")!.getBoundingClientRect();
    const circle = document.querySelector("#seam-more .seam-pair-circle")!.getBoundingClientRect();
    const square = document.querySelector("#seam-more .seam-pair-square")!.getBoundingClientRect();
    // Measured at BOTH ends rather than doubling one: --edge-top carries a
    // 4rem floor the other three insets do not, so the scene is no longer
    // symmetric and the cap (--pair-max-side) subtracts the two separately.
    //
    // The TOP inset is read off the section's title, not the list. The title
    // sits inside the same padding box and the list now sits below it, so
    // measuring the list here would fold the heading's height into the inset
    // and under-report the cap by exactly that much.
    const title = document.querySelector("#seam-more-title")!.getBoundingClientRect();
    const insetTop = title.top - scene.top;
    // The BOTTOM inset is the box's own padding, not the gap under the
    // list: the writing shelf (components/landing/notes.tsx) sits between
    // the list and the scene's foot now.
    const more = document.querySelector("#seam-more")!;
    const insetBottom = Number.parseFloat(getComputedStyle(more).paddingBottom);
    return {
      cap: 600 - insetTop - insetBottom,
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
