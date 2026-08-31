import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { DE_FILENAME, EN_FILENAME, readContentFile, splitFrontmatter } from "./case-study-source.ts";

// Covers D-08, D-09: this is BUILD-06's no-layout-shift posture applied to
// content — a <Figure> whose declared width/height does not match its own
// file reserves the wrong layout space, and nothing else in the suite would
// notice, because tests/case-study.spec.ts measures naturalWidth against
// whatever PNG happens to be on disk, not against what the MDX SAYS it is.
//
// This plan (04-02) ends RED by design: neither case-study MDX file exists
// yet, so every test below fails via readContentFile's
// "does not exist yet — Plan 03 (English) / Plan 04 (German) creates it"
// message. The three PNGs themselves are real (Plan 01, Wave 1) — only the
// MDX bodies that reference them are missing.

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Reads a PNG's true intrinsic dimensions straight from its IHDR header. */
function readPngDimensions(filePath: string): { width: number; height: number } {
  const buffer = readFileSync(filePath);
  assert.ok(buffer.subarray(0, 8).equals(PNG_SIGNATURE), `${filePath} does not open with the PNG signature`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

type ParsedFigure = {
  raw: string;
  src: string | null;
  alt: string | null;
  width: number;
  height: number;
  wide: boolean;
  caption: string;
};

function attrString(attrs: string, name: string): string | null {
  const match = attrs.match(new RegExp(name + '="([^"]*)"'));
  return match ? match[1]! : null;
}

/**
 * width={2400} and width="2400" are treated alike — both are valid ways to
 * express the numeric prop. A tag carrying neither shape is a real parse
 * failure and is reported naming the offending tag, rather than silently
 * producing a figure with a missing dimension that later assertions would
 * mis-report.
 */
function attrNumber(attrs: string, name: string, rawTag: string, filename: string): number {
  const match = attrs.match(new RegExp(name + '=(?:\\{(\\d+)\\}|"(\\d+)")'));
  if (!match) {
    throw new Error(
      `${filename}: <Figure> tag has no parseable numeric ${name} prop (expected ${name}={n} or ${name}="n"): ${rawTag.slice(0, 160)}`,
    );
  }
  return Number(match[1] ?? match[2]);
}

/** Scans an MDX body for <Figure ...>...</Figure> blocks and parses each one's attributes and caption. */
function extractFigures(body: string, filename: string): ParsedFigure[] {
  const blocks = [...body.matchAll(/<Figure\b([^>]*)>([\s\S]*?)<\/Figure>/g)];
  return blocks.map((m) => {
    const [raw, attrs = "", captionText = ""] = m;
    return {
      raw,
      src: attrString(attrs, "src"),
      alt: attrString(attrs, "alt"),
      width: attrNumber(attrs, "width", raw, filename),
      height: attrNumber(attrs, "height", raw, filename),
      wide: /\bwide\b(?!\s*=)/.test(attrs),
      caption: captionText.trim(),
    };
  });
}

const EXPECTED_SRCS = [
  "/case-study/f1-constant-dollars.png",
  "/case-study/f2-eu-average.png",
  "/case-study/f3-arrivals-diverge.png",
];

const DATA_SOURCES = [
  "Rosés-Wolf",
  "Maddison",
  "Eurostat",
  "AETIB",
  "FRONTUR",
  "Funcas",
  "Cirer-Costa",
  "Barceló Pons",
  "Valdivielso",
];

const ALT_BANNED_PREFIXES = ["Chart of", "Graph of", "Image of", "A chart", "Screenshot", "Diagramm", "Grafik von"];

const LOCALES = [
  { filename: EN_FILENAME },
  { filename: DE_FILENAME },
];

test("1. each MDX body declares exactly three <Figure> elements, in the locked source order", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figures = extractFigures(body, filename);
    assert.equal(figures.length, 3, `${filename}: expected exactly three <Figure> elements`);
    assert.deepEqual(
      figures.map((f) => f.src),
      EXPECTED_SRCS,
      `${filename}: <Figure src> values must appear in document order f1, f2, f3`,
    );
  }
});

test("2. exactly one of the three figures carries wide, and it is the third (D-07 — F1/F2 are a matched pair, F3 is the wide finding)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figures = extractFigures(body, filename);
    const wideFlags = figures.map((f) => f.wide);
    assert.deepEqual(wideFlags, [false, false, true], `${filename}: only the third <Figure> may carry wide`);
  }
});

test("3. every figure's src resolves under public/ and the file exists on disk", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figures = extractFigures(body, filename);
    for (const figure of figures) {
      assert.ok(figure.src, `${filename}: figure has no src`);
      const diskPath = path.join(process.cwd(), "public", figure.src!);
      assert.doesNotThrow(
        () => readFileSync(diskPath),
        `${filename}: ${figure.src} does not resolve to a file under public/`,
      );
    }
  }
});

test("4. every figure's declared width/height matches the real PNG bytes on disk, and both equal 2400x1640", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figures = extractFigures(body, filename);
    for (const figure of figures) {
      const diskPath = path.join(process.cwd(), "public", figure.src!);
      const real = readPngDimensions(diskPath);
      assert.equal(figure.width, real.width, `${filename}: ${figure.src} declared width disagrees with the file`);
      assert.equal(figure.height, real.height, `${filename}: ${figure.src} declared height disagrees with the file`);
      assert.equal(figure.width, 2400, `${filename}: ${figure.src} width must be 2400`);
      assert.equal(figure.height, 1640, `${filename}: ${figure.src} height must be 1640`);
    }
  }
});

test("5. every alt is at least 120 characters and at least 20 words (D-09)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figures = extractFigures(body, filename);
    for (const figure of figures) {
      const alt = figure.alt ?? "";
      assert.ok(alt.length >= 120, `${filename}: ${figure.src} alt is only ${alt.length} characters, need >= 120`);
      const wordCount = alt.split(/\s+/).filter(Boolean).length;
      assert.ok(wordCount >= 20, `${filename}: ${figure.src} alt is only ${wordCount} words, need >= 20`);
    }
  }
});

test("6. no alt begins with a lazy chart-description prefix, case-insensitively", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figures = extractFigures(body, filename);
    for (const figure of figures) {
      const alt = (figure.alt ?? "").toLowerCase();
      for (const prefix of ALT_BANNED_PREFIXES) {
        assert.ok(
          !alt.startsWith(prefix.toLowerCase()),
          `${filename}: ${figure.src} alt begins with the lazy prefix "${prefix}"`,
        );
      }
    }
  }
});

test("7. no alt is byte-identical to another alt in the same file", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figures = extractFigures(body, filename);
    const alts = figures.map((f) => f.alt);
    assert.equal(new Set(alts).size, alts.length, `${filename}: two figures share byte-identical alt text`);
  }
});

test("8. every figure has non-empty caption children, and every caption names at least one data source (D-09)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figures = extractFigures(body, filename);
    for (const figure of figures) {
      assert.ok(figure.caption.length > 0, `${filename}: ${figure.src} has no caption`);
      const namesASource = DATA_SOURCES.some((source) => figure.caption.includes(source));
      assert.ok(
        namesASource,
        `${filename}: ${figure.src} caption names no known data source (${figure.caption.slice(0, 80)})`,
      );
    }
  }
});
