/**
 * The CRT and TFT screens' overlays: one period of each shader's pattern,
 * sampled at device-pixel centres and multiplied over the page.
 *
 * Ported from sinedied's perfect-retroshaders (MIT, Copyright (c) 2026
 * sinedied): crt-perfect v14 at its preset (scanlines 0.60, aperture grille
 * 0.20, min. pitch 3, brightness 1.25) and lcd-perfect at its preset (grid
 * 0.30, balance 0.60, subpixels 0.20, min. pitch 3, brightness 1.25). A page
 * has no source pixels, so the pitch is the shaders' minimum: 3 device px,
 * which keeps both patterns below Nyquist on every display.
 *
 * The shaders encode with a gamma of 2, so a pattern gain m multiplies the
 * encoded colour by sqrt(m). A multiply blend cannot brighten, so gains
 * above 1 clip to 1: the bright scanline centres sit at full paper, which is
 * where the brightness term was taking them anyway.
 */

export type Tile = { w: number; h: number; data: Uint8ClampedArray<ArrayBuffer> };

export const PITCH = 3;
const TAU = Math.PI * 2;
const boxSinc = (f: number) => {
  const x = Math.PI * Math.max(f, 1e-4);
  return Math.sin(x) / x;
};

function tile(w: number, h: number, gain: (x: number, y: number) => [number, number, number]): Tile {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const g = gain(x, y);
      const o = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) data[o + c] = Math.round(Math.min(1, Math.sqrt(Math.max(0, g[c]))) * 255);
      data[o + 3] = 255;
    }
  return { w, h, data };
}

/** crt-perfect: horizontal scanlines times an RGB aperture grille. */
export function crtTile(scanlines = 0.6, mask = 0.2, brightness = 1.25): Tile {
  const f = 1 / PITCH;
  const sinc = boxSinc(f);
  return tile(PITCH, PITCH, (x, y) => {
    const scan = 1 - 0.5 * scanlines - 0.5 * scanlines * sinc * Math.cos(TAU * ((y + 0.5) * f));
    const phase = (x + 0.5) * f - 1 / 6;
    const dc = 1 - 0.5 * mask;
    const ac = 0.5 * mask * sinc;
    const r = dc + ac * Math.cos(TAU * phase);
    const g = dc + ac * Math.cos(TAU * (phase - 1 / 3));
    const b = Math.max(3 * dc - r - g, 0);
    const k = scan * brightness;
    return [r * k, g * k, b * k];
  });
}

/** lcd-perfect: a soft backlit mesh times RGB subpixel stripes. */
export function tftTile(grid = 0.3, balance = 0.6, subpixels = 0.2, brightness = 1.25): Tile {
  const f = 1 / PITCH;
  const sinc = boxSinc(f);
  // columns take `balance` of the mesh, rows the rest
  const amp = [grid * 2 * balance, grid * 2 * (1 - balance)].map((a) => Math.min(1, a));
  // the aperture's density: 1 - amp cos, dark line on the cell boundary,
  // peak-normalised so the open cell reads as 1
  const aperture = (a: number, i: number) => (1 - a * sinc * Math.cos(TAU * ((i + 0.5) * f - 0.5 * f))) / (1 + a);
  return tile(PITCH, PITCH, (x, y) => {
    const X = TAU * ((x + 0.5) * f - 0.5 * f);
    const ac = subpixels * sinc;
    const r = 1 + ac * (0.5 * Math.cos(X) + 0.866025404 * Math.sin(X));
    const g = 1 - ac * Math.cos(X);
    const b = 3 - r - g;
    const k = aperture(amp[0], x) * aperture(amp[1], y) * brightness;
    return [r * k, g * k, b * k];
  });
}
