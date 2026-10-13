import { expect, test, webkit, type Browser } from "@playwright/test";
import { loadInk, waitForInk } from "./page-ink";

// The seam's ink and the story corner on a phone, in WebKit — the engine an
// iPhone runs.
//
// Reported on an iPhone 17 Pro: the disc shrinking as you scrolled, then
// changing size on refresh, and a light row along the fold. The disc came
// from use-visible-height.ts trusting every visualViewport reading; the
// readings are played back below. The row needed the phone itself (it never
// showed in WebKit here). A compositing layer per grain cured it until a
// pinch-zoom opened it again as a hairline between the two layers; the ink
// is now one raster on <main> (page-ink.ts), so there is no second layer at
// the fold at all, and the first test pins that.

const PHONE = { width: 402, height: 874 };

type Stub = { low?: number; jitter: number };

async function openPhone(browser: Browser, stub?: Stub) {
  const context = await browser.newContext({
    viewport: PHONE,
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  if (stub) await page.addInitScript(stubVisualViewport, stub);
  // The CSP's upgrade-insecure-requests sends WebKit to https://localhost
  // (Chromium exempts localhost, WebKit does not), so it is dropped here.
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const response = await route.fetch();
    const headers = { ...response.headers() };
    delete headers["content-security-policy"];
    await route.fulfill({ response, headers });
  });
  await page.goto("/");
  await waitForInk(page);
  // use-visible-height.ts writes, if at all, once its readings settle (500ms).
  await page.waitForTimeout(700);
  return { context, page };
}

let browser: Browser;
test.beforeAll(async () => {
  browser = await webkit.launch();
});
test.afterAll(async () => {
  await browser.close();
});

test("on a phone the page's ink is one raster, one dot per CSS pixel, and the fold is inked", async () => {
  const { context, page } = await openPhone(browser);

  try {
    const raster = await loadInk(page);
    // Every layer is exactly its image's size, in whole pixels: an image
    // stretched over a fractional box is what iOS Safari smoothed and
    // shifted. One layer on this page; more only if it outgrows a canvas,
    // and then they are bands of the full width stacked edge to edge.
    let next = 0;
    for (const layer of raster.layers) {
      expect(layer.width).toBe(raster.width);
      expect(layer.left).toBe(0);
      expect(layer.top).toBe(next);
      next += layer.height;
    }
    expect(next).toBe(raster.height);
    // And the whole of it is main's box, in whole pixels.
    expect(raster.width).toBe(Math.round(raster.box.width));
    expect(raster.height).toBe(Math.ceil(raster.box.height));

    // The last row above the fold and the first below it both sit in the
    // dark half of the fan, so neither is bare paper.
    const edge = await page.evaluate(() => {
      const ink = (window as unknown as { __ink: HTMLCanvasElement }).__ink;
      const context = ink.getContext("2d")!;
      const main = document.querySelector("main")!.getBoundingClientRect();
      const y = Math.round(document.getElementById("seam-scene-mirrored")!.getBoundingClientRect().top - main.top);
      const inked = (row: number) => {
        const data = context.getImageData(0, row, ink.width, 1).data;
        let n = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i]! > 0) n += 1;
        return n / ink.width;
      };
      return { above: inked(y - 1), below: inked(y) };
    });
    expect(edge.above).toBeGreaterThan(0.2);
    expect(edge.below).toBeGreaterThan(0.2);

    // And on screen, not just in the raster: no row at the fold may come
    // out as bare paper.
    const fold = await page.evaluate(() => document.getElementById("seam-scene-mirrored")!.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => scrollTo(0, y - 200), fold);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const top = await page.evaluate(() => document.getElementById("seam-scene-mirrored")!.getBoundingClientRect().top);
    const shot = await page.screenshot({ clip: { x: 0, y: top - 6, width: PHONE.width, height: 12 }, scale: "css" });
    const rows = await page.evaluate(async (data) => {
      const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const out: number[] = [];
      for (let y = 0; y < image.height; y += 1) {
        const row = context.getImageData(0, y, image.width, 1).data;
        let dark = 0;
        for (let i = 0; i < row.length; i += 4) if (row[i]! < 170) dark += 1;
        out.push(dark / image.width);
      }
      return out;
    }, shot.toString("base64"));
    console.log("fold rows", top, rows.map((r) => r.toFixed(2)).join(" "));
    for (const row of rows) expect(row).toBeGreaterThan(0.2);
  } finally {
    await context.close();
  }
});

test("on a phone the story corner keeps its size when only the height changes", async () => {
  const { context, page } = await openPhone(browser);

  try {
    const read = () =>
      page.evaluate(() => ({
        token: document.documentElement.style.getPropertyValue("--visible-height"),
        disc: document.querySelector(".seam-shot")!.getBoundingClientRect().width,
      }));
    const before = await read();

    // What a toolbar sliding in and out does to the visual viewport, lower
    // each time — the sequence that used to ratchet the disc down.
    for (const height of [800, 700, 600]) {
      await page.setViewportSize({ width: PHONE.width, height });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    }
    await page.setViewportSize(PHONE);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

    expect(await read()).toEqual(before);
  } finally {
    await context.close();
  }
});

// What the iPhone 17 Pro's visualViewport reported, played back: a reading
// far under the real height (561 for 714) for as long as the page loads and
// a moment after — the toolbar in its loading size, which a pull-to-refresh
// holds until the load completes — and readings a couple of pixels either
// side of the real one. Neither may move the story corner. The stub answers
// `low` until 400ms after "load", then the real height plus `jitter`, and
// fires the resize Safari fires when its toolbar settles.
// Runs in the page before its own scripts, so it records every write.
function stubVisualViewport({ low, jitter }: Stub) {
  const real = Object.getOwnPropertyDescriptor(VisualViewport.prototype, "height")!.get!;
  let settled = false;
  window.addEventListener("load", () =>
    setTimeout(() => {
      settled = true;
      window.visualViewport!.dispatchEvent(new Event("resize"));
    }, 400),
  );
  const w = window as unknown as { __written: string[] };
  w.__written = [];
  Object.defineProperty(VisualViewport.prototype, "height", {
    get(this: VisualViewport) {
      if (low !== undefined && !settled) return low;
      return real.call(this) + jitter;
    },
  });
  const setProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (this: CSSStyleDeclaration, name: string, ...rest: [string | null, string?]) {
    if (name === "--visible-height") w.__written.push(String(rest[0]));
    return setProperty.call(this, name, ...rest);
  };
}

for (const [name, stub] of [
  ["a low first reading", { low: 561, jitter: 0 }],
  ["a reading 2px short", { jitter: -2 }],
] as const) {
  test(`on a phone ${name} of the visible height leaves the disc alone`, async () => {
    const plain = await openPhone(browser);
    const disc = () =>
      document.querySelector(".seam-shot")!.getBoundingClientRect().width;
    const full = await plain.page.evaluate(disc);
    await plain.context.close();

    const { context, page } = await openPhone(browser, stub);
    try {
      await page.waitForTimeout(1200);
      expect(await page.evaluate(() => (window as unknown as { __written: string[] }).__written)).toEqual([]);
      expect(await page.evaluate(disc)).toBe(full);
    } finally {
      await context.close();
    }
  });
}
