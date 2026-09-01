/**
 * Writes public/portrait.png — the flat panel standing in for the
 * photograph until the real file exists.
 *
 * Read lib/cv.ts's PORTRAIT comment before changing anything here. The
 * standing rule is that NO SYNTHETIC OR STOCK FACE may ever be committed to
 * this repo: a generated face on a personal job-hunting site is an
 * impersonation artifact, not a placeholder, and that rule has not been
 * relaxed by the decision to run the rest of the site on lorem ipsum. What
 * this script emits is a tone panel — no face, no figure, no silhouette,
 * nothing that could be read as a likeness of anybody. Its only job is to
 * occupy the portrait's real box so /cv's rhythm, its CLS behaviour and the
 * heading trail above it can be judged at the size the photograph will have.
 *
 * 3:4 at 960x1280, which is the aspect a headshot is normally cropped to and
 * is rendered down to 240px wide by components/portrait.tsx. The two tones
 * come straight from app/globals.css: --color-paper (#ffffff) and the
 * flattened --color-rule (rgba(0,0,0,0.12) over paper = #e0e0e0).
 *
 * Dependency-free by the same reasoning as scripts/capture-brand-images.mjs
 * and tests/fixtures/cv-portrait-fixture.ts: node:zlib's deflate plus a
 * hand-rolled CRC is the whole PNG encoder, and this site's standing posture
 * is zero new dependencies of any kind, runtime or dev.
 *
 * Run: node scripts/make-placeholder-portrait.mjs
 * Delete both this script and public/portrait.png when the real photograph
 * lands — a placeholder generator left in the tree outlives its reason.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import path from "node:path";

const WIDTH = 960;
const HEIGHT = 1280;
const OUTPUT = path.join(process.cwd(), "public", "portrait.png");

// --color-paper and --color-rule flattened over it, app/globals.css:9-13.
const PAPER = [0xff, 0xff, 0xff];
const RULE = [0xe0, 0xe0, 0xe0];
// The panel itself: one step off paper, well inside the site's ink range so
// it never competes with the h1 above it for attention.
const PANEL = [0xf2, 0xf2, 0xf2];
const BORDER_PX = 2;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function colourAt(x, y) {
  const onBorder =
    x < BORDER_PX || y < BORDER_PX || x >= WIDTH - BORDER_PX || y >= HEIGHT - BORDER_PX;
  if (onBorder) return RULE;
  // A single hairline inset from the border, at the same tone: enough
  // structure that the panel reads as a deliberately empty frame rather
  // than as a failed image load, without adding a glyph or an icon to a
  // site that ships neither.
  const inset = 24;
  const onInset =
    (x === inset || x === WIDTH - 1 - inset) && y >= inset && y <= HEIGHT - 1 - inset;
  const onInsetHorizontal =
    (y === inset || y === HEIGHT - 1 - inset) && x >= inset && x <= WIDTH - 1 - inset;
  if (onInset || onInsetHorizontal) return RULE;
  if (x < inset || y < inset || x >= WIDTH - inset || y >= HEIGHT - inset) return PAPER;
  return PANEL;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type: truecolour RGB
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace: none

const stride = 1 + WIDTH * 3;
const raw = Buffer.alloc(stride * HEIGHT);
for (let y = 0; y < HEIGHT; y++) {
  const rowStart = y * stride;
  raw[rowStart] = 0; // filter type: none
  for (let x = 0; x < WIDTH; x++) {
    const [r, g, b] = colourAt(x, y);
    const p = rowStart + 1 + x * 3;
    raw[p] = r;
    raw[p + 1] = g;
    raw[p + 2] = b;
  }
}

writeFileSync(
  OUTPUT,
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]),
);

console.log(`wrote ${OUTPUT} (${WIDTH}x${HEIGHT})`);
