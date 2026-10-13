"use client";

import { useLayoutEffect, type RefObject } from "react";

// The seam's ink, drawn at one dot per CSS pixel as the background of the
// whole page.
//
// The first paint is public/seam-dither-desktop.png, masked onto the hero's
// .grainField and rotated to the seam (landing-seam.module.css). That file
// is 2600px stretched over 250vmax, so its dots grow with the window — 1.4
// CSS px at 1440x900, 2.5 at 2560 — and are the same size on a retina
// screen as on a 1x one. Once this has drawn, it replaces it: the ramp is
// computed for <main>'s own box and Floyd-Steinberg dithered on a canvas one
// CSS pixel per dot, and the result becomes main's background-image, which
// the browser scales by an integer device-pixel ratio with
// image-rendering: pixelated.
//
// ONE raster for the whole page, on the one element that holds both
// sections. It used to be a canvas per section, each in its own layer, and
// however exactly the two were placed, iOS Safari opened a hairline between
// them along the fold — wider on a pinch-zoom, which scales each layer by a
// fractional factor on its own. A background has no second layer to drift
// from: the fold is a row in the middle of one image.
//
// The geometry is read off the hero's .grainField rather than recomputed:
// its box is centred on the pivot and its transform is the seam's rotation,
// so inverting that matrix takes any pixel of the page back into the PNG's
// own frame, where the tone is a function of angle alone. Below the fold
// every pixel is simply further from the same pivot.

const DOT = 1; // CSS px per dither dot

// Ink density by angle in the PNG's frame, clockwise from twelve o'clock,
// every 10deg — measured from seam-dither-desktop.png over radii 100-1300px
// (the ramp does not vary with radius).
const RAMP = [
  0.998, 0.982, 0.97, 0.956, 0.941, 0.923, 0.905, 0.885, 0.864, 0.842, 0.819, 0.795, 0.769, 0.743,
  0.714, 0.689, 0.659, 0.629, 0.601, 0.569, 0.54, 0.507, 0.475, 0.442, 0.409, 0.376, 0.345, 0.312,
  0.278, 0.245, 0.212, 0.179, 0.145, 0.117, 0.073, 0.061, 0.059,
];

function ramp(degrees: number) {
  const t = Math.min(359.999, Math.max(0, degrees)) / 10;
  const i = Math.floor(t);
  return RAMP[i] + (RAMP[i + 1] - RAMP[i]) * (t - i);
}

function parseColour(value: string): [number, number, number] {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = value.match(/\d+(\.\d+)?/g);
  return rgb && rgb.length >= 3 ? [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])] : [85, 85, 85];
}

// Plain Floyd-Steinberg settles into a regular lattice in very light and very
// dark areas. A small jitter on the threshold breaks it up; seeded, so the
// pattern is the same on every load.
const JITTER = 0.18;

// Error diffusion starts cold: its first row has no error carried down from
// above, so it comes out as a near-solid line of ink. So the pass starts this
// many rows above the page's top edge, on the same ramp (the tone is defined
// everywhere), and those rows are thrown away.
const WARM_UP = 24;

// A canvas has a ceiling on its area — iOS Safari refuses anything over
// 16,777,216 pixels and draws nothing — and a phone page with every project
// stacked can be a long way down. Past this area the pass is cut into
// horizontal bands of at most TILE_ROWS rows, each exported on its own and
// laid as one more background layer, offset by its first row. The bands are
// slices of the SAME pass, not passes of their own: the error carried out of
// one band's last row is carried into the next band's first, so the joins
// are rows like any other.
const MAX_AREA = 16_000_000;
const TILE_ROWS = 4096;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Band = { top: number; rows: number; url: string };

export function usePageInk(
  pageRef: RefObject<HTMLElement | null>,
  sceneRef: RefObject<HTMLElement | null>,
  fieldRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const main = pageRef.current;
    const scene = sceneRef.current;
    const field = fieldRef.current;
    if (!main || !scene || !field) return;
    let cancelled = false;
    // Never in the document: it is only drawn on and exported. The class is
    // the tests' handle on it — the sphere shading draws on canvases too.
    const canvas = document.createElement("canvas");
    canvas.className = "seam-ink";

    const draw = () => {
      const box = main.getBoundingClientRect();
      // Whole CSS pixels: background-size is set to exactly this, so one
      // image pixel is one CSS pixel. ceil on the height, so the image never
      // falls short of the page's foot; main's background area clips the
      // fraction of a row it runs over (the second section is as tall as the
      // work it holds, 1170.22px on an iPhone 17 Pro).
      const width = Math.max(1, Math.round(box.width / DOT));
      const height = Math.max(1, Math.ceil(box.height / DOT));
      // The field is a square centred on its pivot and transformed about its
      // centre, so its bounding box's centre is the pivot — here in main's
      // frame, which is the image's.
      const fieldBox = field.getBoundingClientRect();
      const pivotX = (fieldBox.left + fieldBox.width / 2 - box.left) / DOT;
      const pivotY = (fieldBox.top + fieldBox.height / 2 - box.top) / DOT;
      const styles = getComputedStyle(field);
      const matrix = new DOMMatrixReadOnly(styles.transform === "none" ? undefined : styles.transform).inverse();
      const ink = parseColour(getComputedStyle(main).getPropertyValue("--gradient-shade") || "#555555");

      const key = [width, height, pivotX.toFixed(1), pivotY.toFixed(1), matrix.toString(), ink.join()].join("|");
      // Kept on the element rather than in this effect: a remount with main
      // still in place (React does this in development) would otherwise
      // redraw the same picture.
      if (key === main.dataset.inkKey) return;
      main.dataset.inkKey = key;

      const context = canvas.getContext("2d");
      if (!context) return;
      const bandRows = width * height <= MAX_AREA ? height : Math.max(1, Math.min(TILE_ROWS, Math.floor(MAX_AREA / width)));

      // Two rows of tone at a time, the one being dithered and the one
      // below it that takes its error. Each starts as the ramp's value for
      // its pixel; what the row above pushed down is added on top.
      const { a, b, c, d } = matrix;
      const fill = (row: Float32Array, y: number) => {
        const dy = y - WARM_UP + 0.5 - pivotY;
        for (let x = 0; x < width; x += 1) {
          const dx = x + 0.5 - pivotX;
          // Back into the PNG's frame (y down), then the angle clockwise
          // from twelve o'clock.
          const lx = a * dx + c * dy;
          const ly = b * dx + d * dy;
          row[x] = ramp(((Math.atan2(lx, -ly) * 180) / Math.PI + 360) % 360);
        }
      };
      let current = new Float32Array(width);
      let next = new Float32Array(width);
      fill(current, 0);

      const bands: Band[] = [];
      let band: ImageData | null = null;
      let bandTop = 0;
      const rows = height + WARM_UP;
      const random = mulberry32(0x5eed);
      for (let y = 0; y < rows; y += 1) {
        const below = y + 1 < rows;
        if (below) fill(next, y + 1);
        const out = y - WARM_UP;
        if (out >= 0 && !band) {
          bandTop = out;
          band = context.createImageData(width, Math.min(bandRows, height - out));
        }
        const forward = y % 2 === 0;
        const step = forward ? 1 : -1;
        for (let i = 0; i < width; i += 1) {
          const x = forward ? i : width - 1 - i;
          const old = current[x];
          const on = old >= 0.5 + (random() - 0.5) * JITTER;
          const error = old - (on ? 1 : 0);
          const ahead = x + step >= 0 && x + step < width;
          if (ahead) current[x + step] += (error * 7) / 16;
          if (below) {
            if (x - step >= 0 && x - step < width) next[x - step] += (error * 3) / 16;
            next[x] += (error * 5) / 16;
            if (ahead) next[x + step] += error / 16;
          }
          if (on && band) {
            const index = ((out - bandTop) * width + x) * 4;
            band.data[index] = ink[0];
            band.data[index + 1] = ink[1];
            band.data[index + 2] = ink[2];
            band.data[index + 3] = 255;
          }
        }
        if (band && out - bandTop + 1 === band.height) {
          canvas.width = width;
          canvas.height = band.height;
          context.putImageData(band, 0, 0);
          // A data: URL, not a blob: one — the CSP's img-src allows data:
          // only (lib/csp.ts).
          bands.push({ top: bandTop, rows: band.height, url: canvas.toDataURL("image/png") });
          band = null;
        }
        [current, next] = [next, current];
      }

      // Decoded before it is shown, and the PNG field steps aside only once
      // it is, so there is no frame without ink.
      Promise.all(
        bands.map((slice) => {
          const image = new Image();
          image.src = slice.url;
          return image.decode().catch(() => undefined);
        }),
      ).then(() => {
        // Not tied to this effect's lifetime: after a remount (React does
        // this in development) the next effect finds the same key and skips
        // the draw, so this swap is the only one coming. A newer draw
        // supersedes it, though.
        if (main.dataset.inkKey !== key) return;
        main.style.backgroundImage = bands.map((slice) => `url("${slice.url}")`).join(", ");
        main.style.backgroundSize = bands.map((slice) => `${width * DOT}px ${slice.rows * DOT}px`).join(", ");
        main.style.backgroundPosition = bands.map((slice) => `0px ${slice.top * DOT}px`).join(", ");
        main.dataset.ink = "canvas";
      });
    };

    let frame = 0;
    // Nothing draws until the fonts are in (below), including the call a
    // ResizeObserver makes as soon as it starts observing.
    let ready = false;
    const schedule = () => {
      if (!ready) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    // The first draw waits for the fonts: the boxes the seam is aimed
    // between are sized by their type, so the angle can still move until
    // the faces are in, and every move before the raster exists is free —
    // the PNG field just turns with it. Drawing straight away meant drawing
    // at one angle and again at the next, a visible change each time.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ready = true;
      schedule();
    });
    // Size changes — main is as tall as the work below the fold, so a
    // project added or a column dropped is a new raster — and the seam's
    // angle and pivot, which use-seam-alignment.ts writes as custom
    // properties on :root and on the hero scene.
    const resize = new ResizeObserver(schedule);
    resize.observe(main);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    mutations.observe(scene, { attributes: true, attributeFilter: ["style"] });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
    };
  }, [pageRef, sceneRef, fieldRef]);
}
