import { expect, test, webkit, type Browser } from "@playwright/test";

// The seam's ink and the story corner on a phone, in WebKit — the engine an
// iPhone runs.
//
// Reported on an iPhone 17 Pro: the disc shrinking as you scrolled, then
// changing size on refresh, and a light row along the fold. The disc came
// from use-visible-height.ts trusting every visualViewport reading; the
// readings are played back below. The row needed the phone itself (it never
// showed in WebKit here) and was cured by a compositing layer per grain,
// which the first test pins.

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
  await page.waitForFunction(
    () =>
      document.querySelectorAll('.seam-grain[data-ink="canvas"]').length ===
      document.querySelectorAll(".seam-grain").length,
  );
  // use-visible-height.ts writes, if at all, once its readings settle (250ms).
  await page.waitForTimeout(400);
  return { context, page };
}

let browser: Browser;
test.beforeAll(async () => {
  browser = await webkit.launch();
});
test.afterAll(async () => {
  await browser.close();
});

test("on a phone each grain's canvas is one dot per CSS pixel and the fold is inked", async () => {
  const { context, page } = await openPhone(browser);

  try {
    const inks = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLCanvasElement>(".seam-grain-ink")].map((canvas) => {
        const box = canvas.getBoundingClientRect();
        const grain = canvas.parentElement!.getBoundingClientRect();
        const context = canvas.getContext("2d")!;
        const inked = (y: number) => {
          const row = context.getImageData(0, y, canvas.width, 1).data;
          let n = 0;
          for (let i = 3; i < row.length; i += 4) if (row[i]! > 0) n += 1;
          return n / canvas.width;
        };
        return {
          intrinsic: [canvas.width, canvas.height],
          css: [box.width, box.height],
          grain: grain.height,
          top: inked(0),
          bottom: inked(canvas.height - 1),
        };
      }),
    );

    // What shows is the <img> of each canvas (grain-ink.tsx): its pixels
    // must land one per CSS pixel too.
    const images = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLImageElement>(".seam-grain-ink-image")].map((image) => {
        const box = image.getBoundingClientRect();
        return { natural: [image.naturalWidth, image.naturalHeight], css: [box.width, box.height] };
      }),
    );
    expect(images).toHaveLength(inks.length);
    for (const image of images) expect(image.css).toEqual(image.natural);

    // The cure for the row at the fold on iOS: each grain its own layer.
    expect(
      await page.evaluate(() =>
        [...document.querySelectorAll(".seam-grain")].map((grain) => getComputedStyle(grain).willChange),
      ),
    ).toEqual(["transform", "transform"]);

    for (const ink of inks) {
      // Exactly, in whole pixels: a canvas stretched over a fractional box
      // is what iOS Safari smoothed and shifted.
      expect(ink.css).toEqual(ink.intrinsic);
      expect(Math.abs(ink.css[1]! - ink.grain)).toBeLessThanOrEqual(1);
    }
    // The last row above the fold and the first below it both sit in the
    // dark half of the fan, so neither is bare paper.
    expect(inks[0]!.bottom).toBeGreaterThan(0.2);
    expect(inks[1]!.top).toBeGreaterThan(0.2);

    // And on screen, not just in the canvas: no row at the fold may come
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

// What the iPhone 17 Pro's visualViewport reported, played back: a first
// reading far under the real height (561 for 714) that corrects itself
// with a resize a moment later, and readings a couple of pixels either side
// of the real one. Neither may move the story corner. The stub answers
// `low` for the first 100ms after the first read, then the real height
// plus `jitter`, and fires the resize Safari fires.
// Runs in the page before its own scripts, so it records every write.
function stubVisualViewport({ low, jitter }: Stub) {
  const real = Object.getOwnPropertyDescriptor(VisualViewport.prototype, "height")!.get!;
  let first: number | undefined;
  const w = window as unknown as { __written: string[] };
  w.__written = [];
  Object.defineProperty(VisualViewport.prototype, "height", {
    get(this: VisualViewport) {
      if (first === undefined) {
        first = performance.now();
        setTimeout(() => window.visualViewport!.dispatchEvent(new Event("resize")), 100);
      }
      if (low !== undefined && performance.now() - first < 100) return low;
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
      await page.waitForTimeout(400);
      expect(await page.evaluate(() => (window as unknown as { __written: string[] }).__written)).toEqual([]);
      expect(await page.evaluate(disc)).toBe(full);
    } finally {
      await context.close();
    }
  });
}
