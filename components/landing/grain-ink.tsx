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
// centred on the pivot and its transform is the seam's rotation (and, in
// the mirrored scene, the flip), so inverting that matrix takes any pixel
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

    let lastKey = "";

    const draw = () => {
      const width = Math.max(1, Math.round(grain.clientWidth / DOT));
      const height = Math.max(1, Math.round(grain.clientHeight / DOT));
      const grainBox = grain.getBoundingClientRect();
      const fieldBox = field.getBoundingClientRect();
      // The field is a square centred on its pivot and transformed about
      // its centre, so its bounding box's centre is the pivot.
      const pivotX = (fieldBox.left + fieldBox.width / 2 - grainBox.left) / DOT;
      const pivotY = (fieldBox.top + fieldBox.height / 2 - grainBox.top) / DOT;
      const styles = getComputedStyle(field);
      const matrix = new DOMMatrixReadOnly(styles.transform === "none" ? undefined : styles.transform).inverse();
      const ink = parseColour(getComputedStyle(grain).getPropertyValue("--gradient-shade") || "#555555");

      const key = [width, height, pivotX.toFixed(1), pivotY.toFixed(1), matrix.toString(), ink.join()].join("|");
      if (key === lastKey) return;
      lastKey = key;

      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;

      const values = new Float32Array(width * height);
      const { a, b, c, d } = matrix;
      for (let y = 0; y < height; y += 1) {
        const dy = y + 0.5 - pivotY;
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
      for (let y = 0; y < height; y += 1) {
        const forward = y % 2 === 0;
        const step = forward ? 1 : -1;
        for (let i = 0; i < width; i += 1) {
          const x = forward ? i : width - 1 - i;
          const index = y * width + x;
          const old = values[index];
          const on = old >= 0.5 + (random() - 0.5) * JITTER;
          const error = old - (on ? 1 : 0);
          if (x + step >= 0 && x + step < width) values[index + step] += (error * 7) / 16;
          if (y + 1 < height) {
            if (x - step >= 0 && x - step < width) values[index + width - step] += (error * 3) / 16;
            values[index + width] += (error * 5) / 16;
            if (x + step >= 0 && x + step < width) values[index + width + step] += error / 16;
          }
          if (on) {
            const out = index * 4;
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
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    draw();
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
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
