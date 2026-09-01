import { deflateSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { acquireLock, releaseLock } from "./file-lock";

// FIXTURE-ONLY module — not part of lib/cv.ts, not shipped. Both
// tests/cv.spec.ts (Task 2) and tests/landing-trail.spec.ts (Task 3) need to
// exercise /cv's *populated* state (a real, decodable portrait; two real
// EXPERIENCE rows) against the real dev server, because "measured, not
// assumed" (this repo's own standing assertion rule) requires a genuine
// render, not a mocked one. lib/cv.ts's shipped PORTRAIT/EXPERIENCE are
// null/empty by the phase's own no-fabrication rule, so there is nothing to
// measure without a fixture.
//
// This module gets a fixture onto a real page by temporarily rewriting
// lib/cv.ts on disk (the only proven technique in this exact dev
// server/Turbopack setup — plan 06-04 did the identical thing by hand
// during its own verification: a temporary probe PNG wired into PORTRAIT,
// reverted before its task commit) and waiting for Turbopack's dev-mode HMR
// to actually recompile before handing control back to the caller. It then
// restores lib/cv.ts's ORIGINAL bytes byte-for-byte, so `git diff lib/cv.ts`
// reads empty once the fixture window closes — verified by both callers'
// own task-level acceptance criteria.
//
// EVERY VALUE BELOW IS A FIXTURE. None may ever become a real export of
// lib/cv.ts: no real employer, no real role, no real dates. The generated
// PNG this module writes to public/fixture/ is deleted when the fixture
// window closes.
//
// Because two different spec files (running in two different Playwright
// worker processes, per playwright.config.ts's fullyParallel: true) both
// mutate the SAME lib/cv.ts, an atomically-created lock directory
// (mkdirSync, which either succeeds or throws EEXIST — no race window)
// serializes their fixture windows so neither ever observes the other's
// half-written state.

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const CV_MODULE_PATH = path.join(REPO_ROOT, "lib", "cv.ts");
const FIXTURE_PNG_PATH = path.join(REPO_ROOT, "public", "fixture", "portrait-06-08.png");
const FIXTURE_PNG_PUBLIC_SRC = "/fixture/portrait-06-08.png";
const LOCK_DIR = path.join(REPO_ROOT, ".portrait-fixture.lock");

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export const FIXTURE_PORTRAIT_WIDTH = 300;
export const FIXTURE_PORTRAIT_HEIGHT = 400;
export const FIXTURE_PORTRAIT_ALT =
  "A fixture portrait rendered only by tests/cv.spec.ts and tests/landing-trail.spec.ts — never the real, shipped photograph.";

// Two rows, matching Task 2's "fixture two-row EXPERIENCE" requirement.
// Deliberately absurd dates ("2222") so nothing here is mistakable for a
// real employment record even out of context.
export const FIXTURE_EXPERIENCE_ROWS = [
  {
    years: "2222-present",
    role: "Fixture Role One",
    org: "Fixture Org One",
    place: "Fixture Place One",
    note: "A fixture note describing fixture work, read only by tests/cv.spec.ts.",
  },
  {
    years: "2221-2222",
    role: "Fixture Role Two",
    org: "Fixture Org Two",
    place: "Fixture Place Two",
    note: "A second fixture row, so the section renders more than one item.",
  },
];

// --- A minimal, dependency-free PNG encoder -------------------------------
// Real, valid, decodable PNG bytes (signature + IHDR + IDAT + IEND, 8-bit
// RGB, no interlace) using only node:zlib's built-in deflate — no image
// library, no new dependency. naturalWidth/naturalHeight in the browser
// therefore prove a genuine decode, not a mocked 200 response.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function makeSolidPng(width: number, height: number, rgb: [number, number, number]): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: truecolor (RGB)
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method: none
  const ihdr = pngChunk("IHDR", ihdrData);

  const stride = 1 + width * 3; // filter-type byte + RGB per pixel
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const p = rowStart + 1 + x * 3;
      raw[p] = rgb[0];
      raw[p + 1] = rgb[1];
      raw[p + 2] = rgb[2];
    }
  }
  const idat = pngChunk("IDAT", deflateSync(raw));
  const iend = pngChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// --- Public API --------------------------------------------------------

let originalSource: string | null = null;

async function waitForServedState(matcher: (body: string) => boolean, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const body = await fetch(`${BASE_URL}/cv`)
      .then((res) => res.text())
      .catch(() => "");
    if (matcher(body)) return;
    if (Date.now() > deadline) {
      throw new Error(
        "cv-portrait-fixture: /cv never reflected the expected state after " +
          `${timeoutMs}ms — the dev server may not have recompiled lib/cv.ts.`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}

/**
 * Rewrites lib/cv.ts's PORTRAIT and EXPERIENCE exports to fixture values,
 * writes a real generated PNG to public/fixture/, and blocks until the dev
 * server has recompiled and is serving the new state. Call
 * removePortraitFixture() in the same test/describe's cleanup, always.
 */
export async function installPortraitFixture(): Promise<void> {
  await acquireLock(LOCK_DIR);

  try {
    originalSource = readFileSync(CV_MODULE_PATH, "utf8");

    if (!existsSync(path.dirname(FIXTURE_PNG_PATH))) {
      mkdirSync(path.dirname(FIXTURE_PNG_PATH), { recursive: true });
    }
    writeFileSync(
      FIXTURE_PNG_PATH,
      makeSolidPng(FIXTURE_PORTRAIT_WIDTH, FIXTURE_PORTRAIT_HEIGHT, [193, 39, 45]),
    );

    const experienceLiteral = JSON.stringify(FIXTURE_EXPERIENCE_ROWS, null, 2);
    let mutated = originalSource.replace(
      "export const EXPERIENCE: readonly CvRole[] = [];",
      `export const EXPERIENCE: readonly CvRole[] = ${experienceLiteral};`,
    );
    mutated = mutated.replace(
      "export const PORTRAIT: PortraitAsset | null = null;",
      `export const PORTRAIT: PortraitAsset | null = { src: "${FIXTURE_PNG_PUBLIC_SRC}", width: ${FIXTURE_PORTRAIT_WIDTH}, height: ${FIXTURE_PORTRAIT_HEIGHT}, alt: "${FIXTURE_PORTRAIT_ALT}" };`,
    );

    if (mutated === originalSource) {
      throw new Error(
        "cv-portrait-fixture: the expected PORTRAIT/EXPERIENCE null-state lines were not " +
          "found verbatim in lib/cv.ts — the source has drifted from what this fixture writer expects.",
      );
    }

    writeFileSync(CV_MODULE_PATH, mutated);

    await waitForServedState((body) => body.includes(FIXTURE_PNG_PUBLIC_SRC));
  } catch (err) {
    // Best-effort revert before propagating, so a failed install never
    // leaves the lock held or lib/cv.ts mutated.
    if (originalSource !== null) {
      writeFileSync(CV_MODULE_PATH, originalSource);
      originalSource = null;
    }
    rmSync(FIXTURE_PNG_PATH, { force: true });
    releaseLock(LOCK_DIR);
    throw err;
  }
}

/**
 * Restores lib/cv.ts to the exact bytes read by installPortraitFixture(),
 * removes the generated PNG, waits for the dev server to reflect the
 * reverted state, and releases the lock. Safe to call even if install()
 * partially failed (originalSource is null in that case — a no-op).
 */
export async function removePortraitFixture(): Promise<void> {
  try {
    if (originalSource === null) return;
    writeFileSync(CV_MODULE_PATH, originalSource);
    originalSource = null;
    rmSync(FIXTURE_PNG_PATH, { force: true });

    await waitForServedState((body) => !body.includes(FIXTURE_PNG_PUBLIC_SRC));
  } finally {
    releaseLock(LOCK_DIR);
  }
}
