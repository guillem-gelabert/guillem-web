"use client";

import { useLayoutEffect, useRef } from "react";
import { BLUE_NOISE_SIZE, blueNoise } from "./blue-noise";

// The sphere shading over a circle: two 1-bit maps, a shadow (black dots on
// transparent) and a highlight (white dots on transparent), stacked over the
// circle's picture or fill.
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
// The light follows the mouse. Each sphere is lit by a point light at the
// pointer, raised LIGHT_HEIGHT radii above the page, so every circle on the
// page turns towards the same cursor. At rest — no pointer yet, the pointer
// out of the window, a touch screen, or reduced motion — the light is the
// fixed upper-left one the original PNGs were lit from.
//
// That rules out error diffusion. Floyd-Steinberg carries every pixel's
// error to its neighbours, so the smallest change of light reshuffles every
// dot on the disc and the shading boils while the mouse moves. These maps
// are thresholded against a fixed blue-noise tile instead (blue-noise.ts):
// a dot only flips when the tone under it crosses its own threshold, so the
// grain holds still and the terminator slides across it. It is also one
// independent test per pixel, cheap enough to redraw every frame.
//
// The maps are transparent where they have no dot rather than white or
// black under a blend mode. That is pixel-for-pixel what darken and lighten
// gave, but a blended layer cannot be composited on the GPU, and these
// layers now change every frame.

const DOT = 1; // CSS px per dither dot

// Resting light: azimuth 230deg (image coords, y down), elevation 65deg.
const AZ = (230 * Math.PI) / 180;
const EL = (65 * Math.PI) / 180;
const REST: Vec = [Math.cos(EL) * Math.cos(AZ), Math.cos(EL) * Math.sin(AZ), Math.sin(EL)];

// The pointer light, in units of the sphere's radius. At this height a
// pointer just outside the circle's upper-left rim gives the resting light.
// MIN_ELEVATION keeps circles far from the pointer from going dark.
const LIGHT_HEIGHT = 3;
const MIN_ELEVATION = (35 * Math.PI) / 180;
// How fast the light catches up with the pointer, as a time constant.
const EASE_MS = 50;

// Shadow: Lambert diffuse over a hemisphere ambient, then an exposure,
//   tone = min(1, EXPOSURE * (AMBIENT * (1 + N.L) / 2 + (1 - AMBIENT) * max(0, N.L)))
// AMBIENT is the fill light, and it comes from the light's side of the sky:
// it is AMBIENT/2 at the terminator and falls to 0 on the point facing
// straight away, so the dark side keeps a gradient instead of a flat floor.
// EXPOSURE sets the white point: everything within about 40deg of the light
// clips to no dots at all, as the picture underneath is already the lit
// surface.
const AMBIENT = 0.3;
const EXPOSURE = 1.3;

// Highlight: Blinn-Phong specular for a viewer straight above the page,
//   tone = HL_PEAK * max(0, N.H)^SHININESS,  H = normalize(L + V), V = (0,0,1)
// It peaks where the surface normal is H, round near the centre and drawn
// out only towards the rim, as the sphere's own foreshortening dictates.
// SHININESS sets its size; HL_PEAK keeps even its core a dither, not a fill.
const SHININESS = 12;
const HL_PEAK = 0.22;
// The highlight is drawn only where it rises above one threshold step.
const HL_FLOOR = 1 / 512;

const BLACK = 0xff000000; // RGBA bytes 0,0,0,255 on a little-endian Uint32Array
const WHITE = 0xffffffff;

type Vec = [number, number, number];

type Sphere = {
  shadow: HTMLCanvasElement;
  highlight: HTMLCanvasElement;
  light: Vec;
  drawn: Vec | null;
  size: number;
  shadowImage: ImageData | null;
  highlightImage: ImageData | null;
  offset: number;
  visible: boolean;
};

// Per-size geometry: the sphere's z at each pixel (-1 outside the disc) and
// x, y per column and row, shared by every sphere of that size.
type Geometry = { nx: Float32Array; ny: Float32Array; nz: Float32Array };
const geometries = new Map<number, Geometry>();

function geometry(size: number): Geometry {
  let cached = geometries.get(size);
  if (cached) return cached;
  const axis = Float32Array.from({ length: size }, (_, i) => ((i + 0.5) / size) * 2 - 1);
  const nz = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const r2 = axis[x] * axis[x] + axis[y] * axis[y];
      nz[y * size + x] = r2 > 1 ? -1 : Math.sqrt(1 - r2);
    }
  }
  cached = { nx: axis, ny: axis, nz };
  geometries.set(size, cached);
  return cached;
}

let thresholds: Float32Array | null = null;

function threshold(): Float32Array {
  thresholds ??= Float32Array.from(blueNoise(), (value) => (value + 0.5) / 256);
  return thresholds;
}

function resize(sphere: Sphere) {
  const size = Math.max(1, Math.round(sphere.shadow.clientWidth / DOT));
  if (size === sphere.size) return;
  for (const canvas of [sphere.shadow, sphere.highlight]) {
    canvas.width = size;
    canvas.height = size;
  }
  sphere.size = size;
  sphere.drawn = null;
  sphere.shadowImage = new ImageData(size, size);
  sphere.highlightImage = new ImageData(size, size);
}

function draw(sphere: Sphere) {
  resize(sphere);
  const { size, light, drawn } = sphere;
  if (drawn && drawn[0] === light[0] && drawn[1] === light[1] && drawn[2] === light[2]) return;
  const shadowImage = sphere.shadowImage!;
  const highlightImage = sphere.highlightImage!;
  const { nx, ny, nz } = geometry(size);
  const tile = threshold();
  const mask = BLUE_NOISE_SIZE - 1;
  const [lx, ly, lz] = light;

  // Shadow: black wherever the lit tone falls under the threshold.
  const shadow = new Uint32Array(shadowImage.data.buffer);
  const sx = sphere.offset & mask;
  const sy = (sphere.offset >> 6) & mask;
  const diffuse = 1 - AMBIENT;
  const fill = AMBIENT / 2;
  for (let y = 0; y < size; y += 1) {
    const row = y * size;
    const tileRow = ((y + sy) & mask) * BLUE_NOISE_SIZE;
    const yTerm = ny[y] * ly;
    for (let x = 0; x < size; x += 1) {
      const z = nz[row + x];
      if (z < 0) {
        shadow[row + x] = 0;
        continue;
      }
      const lambert = nx[x] * lx + yTerm + z * lz;
      const tone = EXPOSURE * (fill * (1 + lambert) + (lambert > 0 ? diffuse * lambert : 0));
      shadow[row + x] = tone < tile[tileRow + ((x + sx) & mask)] ? BLACK : 0;
    }
  }

  // Highlight: white wherever the specular term rises over the threshold.
  // Only computed inside the cap where it can: N.H >= cosCap. That cap lies
  // inside a ball of radius sin(cap) around H cos(cap), so its picture on
  // the page is inside the disc of that radius around (Hx, Hy) cos(cap).
  const half = Math.hypot(lx, ly, lz + 1);
  const hxv = lx / half;
  const hyv = ly / half;
  const hzv = (lz + 1) / half;
  const cosCap = Math.pow(HL_FLOOR / HL_PEAK, 1 / SHININESS);
  const sinCap = Math.sqrt(1 - cosCap * cosCap);
  const highlight = new Uint32Array(highlightImage.data.buffer);
  highlight.fill(0);
  const toPixel = (n: number) => ((n + 1) / 2) * size;
  const x0 = Math.max(0, Math.floor(toPixel(hxv * cosCap - sinCap)));
  const x1 = Math.min(size, Math.ceil(toPixel(hxv * cosCap + sinCap)));
  const y0 = Math.max(0, Math.floor(toPixel(hyv * cosCap - sinCap)));
  const y1 = Math.min(size, Math.ceil(toPixel(hyv * cosCap + sinCap)));
  const hx = (sx + BLUE_NOISE_SIZE / 2) & mask;
  const hy = (sy + BLUE_NOISE_SIZE / 2) & mask;
  for (let y = y0; y < y1; y += 1) {
    const row = y * size;
    const tileRow = ((y + hy) & mask) * BLUE_NOISE_SIZE;
    const yTerm = ny[y] * hyv;
    for (let x = x0; x < x1; x += 1) {
      const z = nz[row + x];
      if (z < 0) continue;
      const specular = nx[x] * hxv + yTerm + z * hzv;
      if (specular < cosCap) continue;
      const tone = HL_PEAK * Math.pow(specular, SHININESS);
      if (tone > tile[tileRow + ((x + hx) & mask)]) highlight[row + x] = WHITE;
    }
  }

  sphere.shadow.getContext("2d")?.putImageData(shadowImage, 0, 0);
  sphere.highlight.getContext("2d")?.putImageData(highlightImage, 0, 0);
  sphere.drawn = [lx, ly, lz];
}

// --- One pointer, one animation loop, for every sphere on the page. ---

const spheres = new Set<Sphere>();
const byCanvas = new WeakMap<Element, Sphere>();
let mounted = 0;
let pointer: { x: number; y: number } | null = null;
let tracking = false;
let frame = 0;
let last = 0;

function target(sphere: Sphere): Vec {
  if (!tracking || !pointer) return REST;
  const rect = sphere.shadow.getBoundingClientRect();
  const r = rect.width / 2;
  if (r <= 0) return REST;
  let dx = (pointer.x - (rect.left + r)) / r;
  let dy = (pointer.y - (rect.top + r)) / r;
  const reach = LIGHT_HEIGHT / Math.tan(MIN_ELEVATION);
  const distance = Math.hypot(dx, dy);
  if (distance > reach) {
    dx *= reach / distance;
    dy *= reach / distance;
  }
  const length = Math.hypot(dx, dy, LIGHT_HEIGHT);
  return [dx / length, dy / length, LIGHT_HEIGHT / length];
}

function tick(now: number) {
  frame = 0;
  const dt = last ? Math.min(now - last, 100) : 16;
  last = now;
  const k = 1 - Math.exp(-dt / EASE_MS);
  let moving = false;
  for (const sphere of spheres) {
    if (!sphere.visible) continue;
    const goal = target(sphere);
    const light = sphere.light;
    const next: Vec = [
      light[0] + (goal[0] - light[0]) * k,
      light[1] + (goal[1] - light[1]) * k,
      light[2] + (goal[2] - light[2]) * k,
    ];
    const length = Math.hypot(...next) || 1;
    const settled =
      Math.hypot(goal[0] - next[0] / length, goal[1] - next[1] / length, goal[2] - next[2] / length) < 1e-3;
    sphere.light = settled ? [...goal] : [next[0] / length, next[1] / length, next[2] / length];
    if (!settled) moving = true;
    draw(sphere);
  }
  if (moving) schedule();
  else last = 0;
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function listen() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const update = () => {
    tracking = fine.matches && !reduced.matches;
    schedule();
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointer = { x: event.clientX, y: event.clientY };
    if (tracking) schedule();
  };
  const leave = () => {
    pointer = null;
    schedule();
  };
  const scroll = () => {
    if (tracking && pointer) schedule();
  };
  const visibility = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const sphere = byCanvas.get(entry.target);
      if (sphere) sphere.visible = entry.isIntersecting;
    }
    schedule();
  });
  const sizes = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const sphere = byCanvas.get(entry.target);
      if (sphere) draw(sphere);
    }
  });

  update();
  fine.addEventListener("change", update);
  reduced.addEventListener("change", update);
  window.addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("mouseleave", leave);
  window.addEventListener("blur", leave);
  document.addEventListener("scroll", scroll, { passive: true, capture: true });

  return {
    observe(canvas: HTMLCanvasElement) {
      visibility.observe(canvas);
      sizes.observe(canvas);
    },
    unobserve(canvas: HTMLCanvasElement) {
      visibility.unobserve(canvas);
      sizes.unobserve(canvas);
    },
    stop() {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      window.removeEventListener("blur", leave);
      document.removeEventListener("scroll", scroll, { capture: true });
      visibility.disconnect();
      sizes.disconnect();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    },
  };
}

let observers: ReturnType<typeof listen> | null = null;

function register(shadow: HTMLCanvasElement, highlight: HTMLCanvasElement): Sphere {
  // Each sphere reads the tile from its own offset, so neighbouring circles
  // don't share a grain.
  const sphere: Sphere = {
    shadow,
    highlight,
    light: [...REST],
    drawn: null,
    size: 0,
    shadowImage: null,
    highlightImage: null,
    offset: (mounted * 1637) & 0xfff,
    visible: true,
  };
  mounted += 1;
  spheres.add(sphere);
  byCanvas.set(shadow, sphere);
  draw(sphere);
  observers ??= listen();
  observers.observe(shadow);
  schedule();
  return sphere;
}

function unregister(sphere: Sphere) {
  spheres.delete(sphere);
  observers?.unobserve(sphere.shadow);
  if (spheres.size === 0) {
    observers?.stop();
    observers = null;
  }
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
    const sphere = register(shadow, highlight);
    return () => unregister(sphere);
  }, []);

  return (
    <>
      <canvas ref={shadowRef} aria-hidden="true" className={shadowClassName} />
      <canvas ref={highlightRef} aria-hidden="true" className={highlightClassName} />
    </>
  );
}
