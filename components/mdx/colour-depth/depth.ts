// Colour-depth maths for the explorer. Plain TS with no enums or other
// TS-only runtime syntax, so `node --test` can import it directly.

export type RGB = readonly [number, number, number];

/** The depths the slider stops at: the low ones step by step, then the
 * two depths images are actually stored in. */
export const DEPTHS = [1, 2, 3, 4, 8, 16] as const;

/** Highest level a channel can hold: 255 at 8 bits, 1 at 1 bit. */
export const maxValue = (bits: number): number => 2 ** bits - 1;

/** Levels per channel, cubed. */
export const totalColours = (bits: number): number => 2 ** (3 * bits);

/** An 8-bit channel value snapped to the nearest level at this depth. */
export const toLevel = (byte: number, bits: number): number => Math.round((byte / 255) * maxValue(bits));

/** A level at this depth, back on the 0–255 scale the screen shows. */
export const toByte = (level: number, bits: number): number => Math.round((level * 255) / maxValue(bits));

/** Snap an 8-bit value to this depth and back, in one step. */
export const snapByte = (byte: number, bits: number): number => toByte(toLevel(byte, bits), bits);

/**
 * Every 8-bit value snapped to this depth, as a lookup table. Quantising a
 * full image then costs one array read per channel instead of two roundings.
 */
export function snapTable(bits: number): Uint8ClampedArray {
  const table = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) table[v] = snapByte(v, bits);
  return table;
}

/** RGBA pixels snapped to this depth; alpha is left alone. */
export function quantise(source: Uint8ClampedArray, bits: number, target = new Uint8ClampedArray(source.length)) {
  const table = snapTable(bits);
  for (let i = 0; i < source.length; i += 4) {
    target[i] = table[source[i]];
    target[i + 1] = table[source[i + 1]];
    target[i + 2] = table[source[i + 2]];
    target[i + 3] = source[i + 3];
  }
  return target;
}

/**
 * The distinct colours in RGBA pixels once snapped to this depth, each
 * packed as 0xRRGGBB (8-bit values). A bit per possible colour, 2 MB, marks
 * the ones already seen, so a 1254 × 1254 picture is one pass.
 */
export function paletteOf(source: Uint8ClampedArray, bits: number): Uint32Array {
  const table = snapTable(bits);
  const seen = new Uint32Array(1 << 19);
  const found: number[] = [];
  for (let i = 0; i < source.length; i += 4) {
    const key = (table[source[i]] << 16) | (table[source[i + 1]] << 8) | table[source[i + 2]];
    const word = key >>> 5;
    const bit = 1 << (key & 31);
    if (seen[word] & bit) continue;
    seen[word] |= bit;
    found.push(key);
  }
  return Uint32Array.from(found);
}

/** Bytes for w × h pixels at 3 × bits per pixel, packed with no padding. */
export const packedBytes = (width: number, height: number, bits: number): number => (width * height * 3 * bits) / 8;

export const formatCount = (n: number): string => n.toLocaleString("en-GB");

/** 786432 → "768 KB", 1572864 → "1.5 MB". Binary units, as memory is counted. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${trim(kb)} KB`;
  return `${trim(kb / 1024)} MB`;
}

const trim = (n: number) => (n >= 100 ? Math.round(n).toString() : Number(n.toFixed(1)).toString());

export const toHex = ([r, g, b]: RGB): string =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
