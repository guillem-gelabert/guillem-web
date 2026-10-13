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
      expect(Math.abs(ink.intrinsic[0]! - ink.css[0]!)).toBeLessThanOrEqual(1);
      expect(Math.abs(ink.intrinsic[1]! - ink.css[1]!)).toBeLessThanOrEqual(1);
      expect(Math.abs(ink.css[1]! - ink.grain)).toBeLessThanOrEqual(1);
    }
    // The last row above the fold and the first below it both sit in the
    // dark half of the fan, so neither is bare paper.
    expect(inks[0]!.bottom).toBeGreaterThan(0.2);
    expect(inks[1]!.top).toBeGreaterThan(0.2);
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

// Temporary, with components/landing/seam-debug.tsx.
test("the debug readout shows at /?debug", async () => {
  const { context, page } = await openPhone(browser);
  try {
    await page.goto("/?debug");
    await expect(page.locator("pre", { hasText: "debug-1" })).toContainText("vv.height");
    console.log(await page.locator("pre", { hasText: "debug-1" }).textContent());
  } finally {
    await context.close();
  }
});
