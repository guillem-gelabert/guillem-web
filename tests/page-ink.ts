import type { Page } from "@playwright/test";

// The landing's ink is one raster painted as <main>'s background-image
// (components/landing/page-ink.ts) — no canvas or image in the document to
// read pixels from. These two helpers wait for it and read it back.

/** Waits until page-ink.ts has drawn, decoded and set main's background. */
export async function waitForInk(page: Page) {
  await page.waitForFunction(() => document.querySelector("main")?.dataset.ink === "canvas");
}

export type InkRaster = {
  /** The composed raster, in image pixels. */
  width: number;
  height: number;
  /** Each background layer as declared: its size and its offset, in CSS px. */
  layers: { width: number; height: number; left: number; top: number }[];
  /** main's border box, in CSS px. */
  box: { width: number; height: number };
};

/**
 * Decodes every layer of main's background-image and draws them, at their
 * declared offsets, onto one canvas kept on `window.__ink`, so a later
 * page.evaluate can sample it with getImageData. Image pixels, which are
 * CSS pixels when the layer sizes are the image sizes (the test asserts it).
 */
export async function loadInk(page: Page): Promise<InkRaster> {
  return page.evaluate(async () => {
    const main = document.querySelector("main") as HTMLElement;
    const styles = getComputedStyle(main);
    const urls = [...styles.backgroundImage.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1]!);
    const pairs = (value: string) =>
      value.split(",").map((pair) => pair.trim().split(/\s+/).map((length) => Number.parseFloat(length)));
    const sizes = pairs(styles.backgroundSize);
    const positions = pairs(styles.backgroundPosition);
    const images = await Promise.all(
      urls.map(async (url) => {
        const image = new Image();
        image.src = url;
        await image.decode();
        return image;
      }),
    );
    const layers = images.map((_, index) => ({
      width: sizes[index]![0]!,
      height: sizes[index]![1]!,
      left: positions[index]![0]!,
      top: positions[index]![1]!,
    }));
    const width = Math.max(0, ...images.map((image, index) => layers[index]!.left + image.naturalWidth));
    const height = Math.max(0, ...images.map((image, index) => layers[index]!.top + image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    images.forEach((image, index) => context.drawImage(image, layers[index]!.left, layers[index]!.top));
    (window as unknown as { __ink: HTMLCanvasElement }).__ink = canvas;
    const box = main.getBoundingClientRect();
    return { width, height, layers, box: { width: box.width, height: box.height } };
  });
}
