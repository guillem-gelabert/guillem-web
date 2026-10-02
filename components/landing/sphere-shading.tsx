"use client";

import { useLayoutEffect, useRef } from "react";

// The sphere shading over a circle: two 1-bit maps, a shadow (white where
// lit, black where not) and a highlight (white blob on black), which the
// stylesheet blends with darken and lighten.
//
// Drawn here rather than shipped as PNGs. The PNGs were 150px and 280px
// dithers stretched over circles 300-400px wide, so a dot came out 1.4-2.6
// CSS px and read as low-res on a desktop. A dither is only crisp at the
// pitch it was made for, and the circles have no single size, so the maps
// are computed and dithered at the circle's own width: one dot per CSS
// pixel (DOT), which the browser then scales by an integer device-pixel
// ratio with image-rendering: pixelated — no uneven dots on any 1x/2x/3x
// screen.
//
// The lighting is fitted to the PNGs it replaces, so the look holds: a
// Lambert sphere lit from the upper left, and an elliptical highlight
// blob at the upper left.

const DOT = 1; // CSS px per dither dot

// Shadow: Lambert term, light at azimuth 230deg (image coords, y down)
// and 65deg elevation, gained by 1.3 into white.
const AZ = (230 * Math.PI) / 180;
const EL = (65 * Math.PI) / 180;
const LIGHT = [Math.cos(EL) * Math.cos(AZ), Math.cos(EL) * Math.sin(AZ), Math.sin(EL)];
const SHADOW_GAIN = 1.3;

// Highlight: a super-Gaussian ellipse, centred up and left, its long axis
// at 140deg, peaking at 0.6 — so even its core is a dither, not a fill.
const HL_X = -0.404;
const HL_Y = -0.471;
const HL_ANGLE = (139.7 * Math.PI) / 180;
const HL_MAJOR = 0.303;
const HL_MINOR = 0.173;
const HL_PEAK = 0.6;

function tone(kind: "shadow" | "highlight", nx: number, ny: number) {
  const r2 = nx * nx + ny * ny;
  if (r2 > 1) return kind === "shadow" ? 1 : 0; // outside: pass-through under the blend
  if (kind === "shadow") {
    const nz = Math.sqrt(1 - r2);
    const lambert = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
    return Math.min(1, SHADOW_GAIN * lambert);
  }
  const dx = nx - HL_X;
  const dy = ny - HL_Y;
  const u = (dx * Math.cos(HL_ANGLE) + dy * Math.sin(HL_ANGLE)) / HL_MAJOR;
  const v = (-dx * Math.sin(HL_ANGLE) + dy * Math.cos(HL_ANGLE)) / HL_MINOR;
  const d2 = u * u + v * v;
  return HL_PEAK * Math.exp(-0.5 * d2 * d2);
}

// Floyd-Steinberg, serpentine, into opaque black and white.
function draw(canvas: HTMLCanvasElement, kind: "shadow" | "highlight") {
  const size = Math.max(1, Math.round(canvas.clientWidth / DOT));
  if (canvas.width === size && canvas.height === size) return;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return;

  const values = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      values[y * size + x] = tone(kind, ((x + 0.5) / size) * 2 - 1, ((y + 0.5) / size) * 2 - 1);
    }
  }

  const image = context.createImageData(size, size);
  const random = mulberry32(kind === "shadow" ? 0x5ad0 : 0x419);
  for (let y = 0; y < size; y += 1) {
    const forward = y % 2 === 0;
    for (let i = 0; i < size; i += 1) {
      const x = forward ? i : size - 1 - i;
      const index = y * size + x;
      const old = values[index];
      const next = old >= 0.5 + (random() - 0.5) * JITTER ? 1 : 0;
      const error = old - next;
      const step = forward ? 1 : -1;
      if (x + step >= 0 && x + step < size) values[index + step] += (error * 7) / 16;
      if (y + 1 < size) {
        if (x - step >= 0 && x - step < size) values[index + size - step] += (error * 3) / 16;
        values[index + size] += (error * 5) / 16;
        if (x + step >= 0 && x + step < size) values[index + size + step] += (error * 1) / 16;
      }
      const out = index * 4;
      const value = next * 255;
      image.data[out] = value;
      image.data[out + 1] = value;
      image.data[out + 2] = value;
      image.data[out + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
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

type SphereShadingProps = {
  shadowClassName: string;
  highlightClassName: string;
};

export function SphereShading({ shadowClassName, highlightClassName }: SphereShadingProps) {
  const shadowRef = useRef<HTMLCanvasElement>(null);
  const highlightRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const shadow = shadowRef.current;
    const highlight = highlightRef.current;
    if (!shadow || !highlight) return;
    const redraw = () => {
      draw(shadow, "shadow");
      draw(highlight, "highlight");
    };
    redraw();
    const observer = new ResizeObserver(redraw);
    observer.observe(shadow);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <canvas ref={shadowRef} aria-hidden="true" className={shadowClassName} />
      <canvas ref={highlightRef} aria-hidden="true" className={highlightClassName} />
    </>
  );
}
