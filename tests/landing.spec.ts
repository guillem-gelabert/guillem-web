import { expect, test } from "@playwright/test";
import { POSITIONING_PLACEHOLDER, WORK } from "../lib/work";

// The landing's content contract. Three of these tests were written for the
// pre-seam landing — a work list plus an obfuscated email in a plain
// document — and had been failing on HEAD since the seam composition
// replaced it: they asserted zero <section>/<img> inside <main>, an h1
// whose innerText was "Guillem Gelabert", and a mailto link that route no
// longer renders. They are rewritten here against what the seam actually
// ships, and the two structural facts worth pinning survive the rewrite:
// every entry in WORK reaches the page, and its title is the only link on
// its row.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("the homepage renders only the requested content, in order", async ({ page }) => {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  // getByRole, not toHaveText: the nameplate is two block <span>s, so its
  // innerText is "GuillemGelabert" with no separator while its accessible
  // name — the thing that matters — is "Guillem Gelabert".
  await expect(page.getByRole("heading", { level: 1, name: "Guillem Gelabert" })).toHaveCount(1);

  const visibleLines = (await page.locator("main").innerText())
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  // The two language labels come first in the DOM: they sit on the seam
  // itself, not in either corner. Both are still placeholders pointing at
  // "#" — there is no German landing (see landing-seam.tsx).
  expect(visibleLines).toEqual([
    "EN",
    "DE",
    "GUILLEM",
    "GELABERT",
    POSITIONING_PLACEHOLDER.toUpperCase(),
    // The arc headline is uppercased in CSS (text-transform on the SVG
    // text), so innerText reports caps while the DOM — and the link's
    // accessible name — keep the published title's own case.
    WORK[0].title.toUpperCase(),
    // No annotation between them any more: the featured slot prints the
    // headline and the picture and nothing else. WORK[0].annotation still
    // exists and is still asserted by tests/unit/work.test.ts; it is simply
    // not on this surface.
    // The badge on the disc's edge. Set in the DOM as "New story" and
    // uppercased in CSS, so innerText reports caps while the accessible
    // name keeps its sentence case.
    "NEW STORY",
    // The second scene's own title, uppercased in CSS.
    "PROJECTS",
    // Then the mirrored scene: every piece after the first as a pair —
    // title, the two body paragraphs, the pair's one link directly under
    // them, and last the tags (domain, content type, stack), which the
    // square sets in caps.
    ...WORK.slice(1).flatMap((entry) => [
      entry.title,
      ...entry.body,
      "To project →",
      ...entry.domains.map((field) => field.toUpperCase()),
      entry.contentType.toUpperCase(),
      ...entry.stack.map((tool) => tool.toUpperCase()),
    ]),
  ]);
});

test("the visible descriptor exactly matches the meta description", async ({ page }) => {
  const descriptor = page.locator("main header p");
  // The descriptor is uppercased in CSS (text-transform), so the DOM text
  // is the constant verbatim and only the rendering is caps — which is why
  // the meta description can be compared to the same constant.
  await expect(descriptor).toHaveText(POSITIONING_PLACEHOLDER);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    POSITIONING_PLACEHOLDER,
  );
});

test("the hero disc is grey and dithered at rest, bare colour on hover", async ({ page }) => {
  await page.goto("/");
  const slot = page.locator("section#story");
  const reveal = slot.locator(".seam-shot-reveal");
  const shading = slot.locator(".seam-shot-shadow, .seam-shot-highlight");

  await expect(reveal).toHaveCount(1);
  await expect(shading).toHaveCount(2);

  // At rest: the grey capture under a full-strength dither.
  await expect(reveal).toHaveCSS("opacity", "0");
  for (const index of [0, 1]) await expect(shading.nth(index)).toHaveCSS("opacity", "1");
  // The colour layer paints LAST, over the shading. That order is what lets
  // one opaque layer hide the dither, so nothing blended has to animate.

  // Hovering the disc resolves it to the bare colour capture. The pictures
  // are pointer-events: none, so the pointer lands on the arc's stretched
  // ::after — which is exactly the disc, and is what carries the :hover.
  const disc = await slot.locator(".seam-shot").boundingBox();
  if (!disc) throw new Error("the disc has no box");
  await page.mouse.move(disc.x + disc.width / 2, disc.y + disc.height / 2);

  await expect(reveal).toHaveCSS("opacity", "1");
  // The shading does not move — it is simply covered.
  for (const index of [0, 1]) await expect(shading.nth(index)).toHaveCSS("opacity", "1");
  // ...and it is genuinely underneath: the colour layer is the last child.
  const order = await slot.evaluate((el) =>
    [...el.querySelectorAll("img")].map((n) => n.className));
  expect(order[order.length - 1]).toBe("seam-shot-reveal");

  // And the headline does NOT drive it. The glyphs are their own hit targets
  // and SVG text hit-tests against its fill, so the gaps between letters are
  // dead zones: keying the fade to the arc made dragging across the title
  // pump the dither on and off. It is keyed to the disc alone now.
  const arc = await slot.locator(".seam-arc").boundingBox();
  if (!arc) throw new Error("the arc has no box");

  // Park the pointer clear of the disc and let the fade finish, so what is
  // sampled below is the settled state and not the tail of this transition.
  await page.mouse.move(arc.x - 40, arc.y - 40);
  await expect(shading.first()).toHaveCSS("opacity", "1");

  const ring = disc.y - disc.height * 0.06; // just outside the disc, in the type
  const samples: string[] = [];
  for (let step = -6; step <= 6; step += 1) {
    await page.mouse.move(arc.x + arc.width / 2 + step * (disc.width / 16), ring);
    samples.push(await slot.locator(".seam-shot-shadow").evaluate((el) => getComputedStyle(el).opacity));
  }
  expect(
    [...new Set(samples)],
    "the dither must hold steady while the pointer crosses the headline",
  ).toEqual(["1"]);
});

test("the story slot links the first piece, title only, and shows its chart", async ({
  page,
}) => {
  const slot = page.locator("section#story");
  await expect(slot).toHaveCount(1);

  // The hero holds the FIRST entry and nothing else — the rest are pairs in
  // the mirrored scene (tests/landing-more.spec.ts). The title is the only
  // link in the slot: the annotation is not linked and neither is the chart.
  const [hero] = WORK;
  const link = slot.locator(`a[href="${hero.href}"]`);
  await expect(link).toHaveCount(1);
  await expect(link).toHaveText(hero.title);
  // Same tab: no target, and therefore no rel to check.
  await expect(link).not.toHaveAttribute("target", "_blank");
  await expect(slot.locator("a")).toHaveCount(1);

  // One <img> for a declared shot, and none for a null one — plus the two
  // decorative sphere-shading maps the disc carries over it, which are
  // matched by their own classes so the described shot stays nth(0).
  const declared = [hero].filter((entry) => entry.shot !== null);
  const shots = slot.locator("img.seam-shot");
  await expect(shots).toHaveCount(declared.length);
  // The described shot, its colour reveal, and the two shading maps.
  await expect(slot.locator("img")).toHaveCount(declared.length * 2 + 2);

  for (const [index, entry] of declared.entries()) {
    const shot = shots.nth(index);
    const asset = entry.shot!;
    await expect(shot).toHaveAttribute("src", asset.src);
    await expect(shot).toHaveAttribute("alt", asset.alt);
    // The intrinsic attributes are what reserve the box before the bytes
    // arrive, and the CSS caps the height and lets the width follow that
    // ratio — a wrong pair here is a layout shift, not a broken image.
    await expect(shot).toHaveAttribute("width", String(asset.width));
    await expect(shot).toHaveAttribute("height", String(asset.height));
    // The browser actually decoded the file the entry names.
    await shot.evaluate((el) => (el as HTMLImageElement).decode());
    expect(await shot.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(asset.width);
  }
});

test("the chart is the disc — wider than the copy column, inside the box", async ({ page }) => {
  // The premise here inverted, so the assertion did too. The chart used to
  // sit in the copy's flow and had to stay INSIDE its measure, because the
  // copy was fitted within the disc and a full-measure line reached past
  // the arc. The chart now covers the whole disc: it is a positioned square
  // wider than the copy column, and the copy sits over it.
  //
  // Still worth pinning, and for the same reason as before — the chart's
  // size is the one thing in this slot not set by its own dimensions. It
  // reads --disc-size off the box, and Tailwind preflight's
  // img{max-width:100%} sits waiting to cap it at the copy column instead,
  // which is precisely the bug the old assertion would now PASS on.
  const measured = await page.evaluate(() => {
    const shot = document.querySelector("section#story img");
    const column = document.querySelector("section#story");
    const box = document.querySelector("#seam-case-study");
    if (!shot || !column || !box) return null;
    const r = shot.getBoundingClientRect();
    return {
      shot: r.width,
      shotHeight: r.height,
      column: column.getBoundingClientRect().width,
      box: box.getBoundingClientRect().width,
    };
  });
  expect(measured).not.toBeNull();
  // Square: the disc's bounding box, not the asset's 2.195:1 ratio.
  expect(Math.abs(measured!.shot - measured!.shotHeight)).toBeLessThanOrEqual(1);
  // Wider than the copy column it is nested inside — the max-width escape.
  expect(measured!.shot).toBeGreaterThan(measured!.column);
  // But still inside the box: the disc respects the box's padding.
  expect(measured!.shot).toBeLessThan(measured!.box);
  expect(measured!.column).toBeLessThan(measured!.box);
});

test("all links are keyboard focusable and meet the 24px target floor", async ({ page }) => {
  // The two language placeholders on the seam, then one link per piece:
  // the hero's arc headline in the first scene and a pair's title in the
  // mirrored one. The mailto link this used to count is not on the seam
  // landing at all — /cv and the contact block own it.
  const links = page.locator("main a");
  const count = 2 + WORK.length;
  await expect(links).toHaveCount(count);

  for (let index = 0; index < count; index += 1) {
    await page.keyboard.press("Tab");
    await expect(links.nth(index)).toBeFocused();
  }

  const boxes = await links.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect()),
  );
  for (const box of boxes) {
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
});

for (const viewport of [
  { name: "phone", width: 320, height: 640 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  test(`the homepage has no horizontal overflow at ${viewport.name} width`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.reload();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}
