"use client";

import { useLayoutEffect, useRef } from "react";

// The seam's ink, redrawn at one dot per CSS pixel.
//
// The first paint is public/seam-dither-desktop.png, masked onto
// .grainField and rotated to the seam (landing-seam.module.css). That file
// is 2600px stretched over 250vmax, so its dots grow with the window — 1.4
// CSS px at 1440x900, 2.5 at 2560 — and are the same size on a retina
// screen as on a 1x one. Once this has drawn, it replaces it: the ramp is
// computed for the scene's own box and Floyd-Steinberg dithered on a canvas
// one CSS pixel per dot, which the browser scales by an integer device-pixel
// ratio with image-rendering: pixelated.
//
// The geometry is read off .grainField rather than recomputed: its box is
// centred on the pivot and its transform is the seam's rotation, so
// inverting that matrix takes any pixel
// back into the PNG's own frame, where the tone is a function of angle
// alone.

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

// Every grain on the page is one texture. The fields share a pivot and an
// angle, so the tone already runs on across the fold — but error diffusion
// is a sequence, and two passes that each start at their own top edge put
// two unrelated dot patterns either side of the fold, which reads as a seam
// even where the densities agree. So each canvas replays the pass from the
// top of the FIRST grain, with the first grain's geometry, the same seed and
// the same width, and keeps only its own rows: the dots at its top edge are
// the very ones the scene above would have drawn next.

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function GrainInk({ className }: { className: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = ref.current;
    const grain = canvas?.parentElement;
    const field = grain?.querySelector<HTMLElement>(".seam-grain-field");
    if (!canvas || !grain || !field) return;


    const draw = () => {
      const box = grain.getBoundingClientRect();
      const width = Math.max(1, Math.round(box.width / DOT));
      const height = Math.max(1, Math.ceil(box.height / DOT));
      // Whole CSS pixels, and set here rather than left to inset: 0. The
      // second grain is as tall as the work it holds — 1170.22px on an
      // iPhone 17 Pro — and iOS Safari composited the 1170-row canvas
      // stretched over that box with smoothing and a pixel's shift: a row of
      // bare paper at the fold and blurred dots below it, image-rendering
      // notwithstanding. At exactly its own size the canvas maps 1:1 onto CSS
      // pixels; ceil, so it never falls short, and .grain clips the rest. Its
      // top is snapped to a whole pixel of the page for the same reason.
      const pageTop = box.top + window.scrollY;
      canvas.style.top = `${Math.round(pageTop) - pageTop}px`;
      canvas.style.width = `${width * DOT}px`;
      canvas.style.height = `${height * DOT}px`;
      const first = document.querySelector<HTMLElement>(".seam-grain") ?? grain;
      const firstField = first.querySelector<HTMLElement>(".seam-grain-field") ?? field;
      const firstBox = first.getBoundingClientRect();
      const fieldBox = firstField.getBoundingClientRect();
      // The first canvas's top, snapped as above: row 0 of the shared pass.
      const origin = Math.round(firstBox.top + window.scrollY) - window.scrollY;
      // Rows between the first canvas's top and this one's: the part of the
      // shared pass that belongs to the scenes above.
      const above = Math.round((Math.round(pageTop) - window.scrollY - origin) / DOT);
      // The field is a square centred on its pivot and transformed about
      // its centre, so its bounding box's centre is the pivot. Read off the
      // first grain, in its frame, so the replayed rows are its rows exactly.
      const pivotX = (fieldBox.left + fieldBox.width / 2 - firstBox.left) / DOT;
      const pivotY = (fieldBox.top + fieldBox.height / 2 - origin) / DOT;
      const styles = getComputedStyle(firstField);
      const matrix = new DOMMatrixReadOnly(styles.transform === "none" ? undefined : styles.transform).inverse();
      const ink = parseColour(getComputedStyle(grain).getPropertyValue("--gradient-shade") || "#555555");

      const key = [width, height, above, pivotX.toFixed(1), pivotY.toFixed(1), matrix.toString(), ink.join()].join("|");
      // Kept on the element rather than in this effect: a remount with the
      // canvas still in place (React does this in development) would
      // otherwise redraw the same picture.
      if (key === canvas.dataset.inkKey) return;
      canvas.dataset.inkKey = key;

      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;

      const skip = WARM_UP + above;
      const rows = height + skip;
      const values = new Float32Array(width * rows);
      const { a, b, c, d } = matrix;
      for (let y = 0; y < rows; y += 1) {
        const dy = y - WARM_UP + 0.5 - pivotY;
        for (let x = 0; x < width; x += 1) {
          const dx = x + 0.5 - pivotX;
          // Back into the PNG's frame (y down), then the angle clockwise
          // from twelve o'clock.
          const lx = a * dx + c * dy;
          const ly = b * dx + d * dy;
          const degrees = ((Math.atan2(lx, -ly) * 180) / Math.PI + 360) % 360;
          values[y * width + x] = ramp(degrees);
        }
      }

      const image = context.createImageData(width, height);
      const data = image.data;
      const random = mulberry32(0x5eed);
      for (let y = 0; y < rows; y += 1) {
        const forward = y % 2 === 0;
        const step = forward ? 1 : -1;
        for (let i = 0; i < width; i += 1) {
          const x = forward ? i : width - 1 - i;
          const index = y * width + x;
          const old = values[index];
          const on = old >= 0.5 + (random() - 0.5) * JITTER;
          const error = old - (on ? 1 : 0);
          if (x + step >= 0 && x + step < width) values[index + step] += (error * 7) / 16;
          if (y + 1 < rows) {
            if (x - step >= 0 && x - step < width) values[index + width - step] += (error * 3) / 16;
            values[index + width] += (error * 5) / 16;
            if (x + step >= 0 && x + step < width) values[index + width + step] += error / 16;
          }
          if (on && y >= skip) {
            const out = (index - skip * width) * 4;
            data[out] = ink[0];
            data[out + 1] = ink[1];
            data[out + 2] = ink[2];
            data[out + 3] = 255;
          }
        }
      }
      context.putImageData(image, 0, 0);
      // The PNG field steps aside once the canvas has the ink.
      grain.dataset.ink = "canvas";
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
    // the faces are in, and every move before the canvas exists is free —
    // the PNG field just turns with it. Drawing straight away meant drawing
    // at one angle and again at the next, a visible change each time.
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ready = true;
      schedule();
    });
    // Size changes, and the seam's angle and pivot, which
    // use-seam-alignment.ts writes as custom properties on :root and on the
    // scene.
    const resize = new ResizeObserver(schedule);
    resize.observe(grain);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    const scene = grain.parentElement;
    if (scene) mutations.observe(scene, { attributes: true, attributeFilter: ["style"] });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
