import { expect, test, webkit, type Browser } from "@playwright/test";

// The seam's ink and the story corner on a phone, in WebKit — the engine an
// iPhone runs.
//
// Reported on an iPhone 17 Pro after a few scrolls: the disc shrinking
// every time, and below the fold the second scene's canvas squashed to two
// dither rows per CSS pixel, so the texture changed at the fold. Both came
// from use-visible-height.ts keeping the smallest visualViewport height it
// ever saw: each lower reading shrank the story corner, which re-laid out
// the second scene too, and the canvas was redrawn against heights that did
// not last.

const PHONE = { width: 402, height: 874 };

async function openPhone(browser: Browser) {
  const context = await browser.newContext({
    viewport: PHONE,
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
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
  // use-visible-height.ts writes once its readings have settled.
  await page.waitForFunction(() => document.documentElement.style.getPropertyValue("--visible-height") !== "");
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
    expect(before.token).not.toBe("");

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

// The other half: on some iOS loads the first reading is far under the
// real height (561 for 714 on an iPhone 17 Pro) and the right one only
// arrives with a later resize. The disc has to come back to full size.
test("on a phone a low first reading of the visible height does not stick", async () => {
  const { context, page } = await openPhone(browser);

  try {
    const read = () =>
      page.evaluate(() => ({
        token: document.documentElement.style.getPropertyValue("--visible-height"),
        disc: document.querySelector(".seam-shot")!.getBoundingClientRect().width,
      }));
    const full = await read();

    await page.setViewportSize({ width: PHONE.width, height: 561 });
    await page.reload();
    await page.waitForFunction(() => document.documentElement.style.getPropertyValue("--visible-height") === "561px");
    await page.setViewportSize(PHONE);
    await page.waitForFunction(
      (token) => document.documentElement.style.getPropertyValue("--visible-height") === token,
      full.token,
    );
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

    expect(await read()).toEqual(full);
  } finally {
    await context.close();
  }
});

// Temporary, with components/landing/seam-debug.tsx.
test("the debug readout shows at /?debug", async () => {
  const { context, page } = await openPhone(browser);
  try {
    await page.goto("/?debug");
    await expect(page.locator("pre", { hasText: "debug-2" })).toContainText("vv.height");
    console.log(await page.locator("pre", { hasText: "debug-2" }).textContent());
  } finally {
    await context.close();
  }
});
