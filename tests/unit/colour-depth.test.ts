import assert from "node:assert/strict";
import { test } from "node:test";

// The colour-depth explorer's maths (components/mdx/colour-depth/depth.ts):
// the stats it prints and the snapping the picture, cube and sliders share.

const d = await import("../../components/mdx/colour-depth/depth.ts");

test("8 bits: 255 per channel, 16,777,216 colours", () => {
  assert.equal(d.maxValue(8), 255);
  assert.equal(d.totalColours(8), 16_777_216);
  assert.equal(d.formatCount(d.totalColours(8)), "16,777,216");
});

test("1 bit: two levels, eight colours", () => {
  assert.equal(d.maxValue(1), 1);
  assert.equal(d.totalColours(1), 8);
});

test("level ↔ byte round trip is stable at every depth", () => {
  for (const bits of d.DEPTHS) {
    for (let level = 0; level <= d.maxValue(bits); level++) {
      const byte = d.toByte(level, bits);
      // above 8 bits a byte can't hold every level, so only check the way back
      if (bits <= 8) assert.equal(d.toLevel(byte, bits), level, `bits ${bits}, level ${level}`);
      assert.equal(d.snapByte(byte, bits), byte);
    }
  }
});

test("the slider stops at 1, 2, 3, 4, 8 and 16 bits", () => {
  assert.deepEqual([...d.DEPTHS], [1, 2, 3, 4, 8, 16]);
});

test("at 8 and 16 bits, snapping leaves every byte alone", () => {
  for (const bits of [8, 16]) for (let v = 0; v < 256; v++) assert.equal(d.snapByte(v, bits), v);
});

test("16 bits: 65,535 per channel, 281 trillion colours, still exact", () => {
  assert.equal(d.maxValue(16), 65_535);
  assert.equal(d.formatCount(d.totalColours(16)), "281,474,976,710,656");
  assert.ok(Number.isSafeInteger(d.totalColours(16)));
  assert.equal(d.formatBytes(d.packedBytes(1254, 1254, 16)), "9 MB");
});

test("packed memory: 512 × 512 at 8 bits is 768 KB", () => {
  assert.equal(d.packedBytes(512, 512, 8), 786_432);
  assert.equal(d.formatBytes(786_432), "768 KB");
  assert.equal(d.formatBytes(d.packedBytes(1254, 1254, 8)), "4.5 MB");
});

test("quantise at 1 bit sends every channel to 0 or 255 and keeps alpha", () => {
  const out = d.quantise(new Uint8ClampedArray([10, 128, 200, 77]), 1);
  assert.deepEqual([...out], [0, 255, 255, 77]);
});

test("paletteOf lists each snapped colour once", () => {
  const pixels = new Uint8ClampedArray([
    255, 0, 0, 255, // red
    250, 10, 5, 255, // red again at 1 bit, a new colour at 8
    255, 0, 0, 255, // red, repeated
    0, 0, 0, 255, // black
  ]);
  assert.deepEqual([...d.paletteOf(pixels, 1)], [0xff0000, 0x000000]);
  assert.deepEqual([...d.paletteOf(pixels, 8)], [0xff0000, 0xfa0a05, 0x000000]);
});

test("hex is upper-case #RRGGBB", () => {
  assert.equal(d.toHex([255, 255, 0]), "#FFFF00");
  assert.equal(d.toHex([0, 10, 171]), "#000AAB");
});
