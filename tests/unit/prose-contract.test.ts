import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

// Covers WRIT-01 (SC3, SC4): this suite reads app/globals.css from disk and
// enforces the Prose Contract (02-UI-SPEC.md) as source assertions — it is
// the automated gate that fails the build if a fifth type size, a third
// weight, a rounded corner, or an `!important` ever appears in `.prose-site`.

const CSS_PATH = path.join(process.cwd(), "app/globals.css");
const rawCss = readFileSync(CSS_PATH, "utf8");

// Strip comments before anything else touches the text, so a comment can
// never satisfy or break an assertion below.
const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");

type Block = { selector: string; body: string };

// A minimal brace-depth-aware block extractor. Handles bare statements with
// no body (`@import "…";`, `@plugin "…";`) and one level of at-rule nesting
// (`@theme { … }`, `@media (…) { … }`) by recursing into the captured body —
// all this stylesheet ever needs.
function extractBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i]!)) i++;
    if (i >= text.length) break;
    const start = i;
    while (i < text.length && text[i] !== "{" && text[i] !== ";") i++;
    if (i >= text.length) break;
    if (text[i] === ";") {
      // Bare statement (e.g. @import, @plugin) — no body to capture.
      i++;
      continue;
    }
    const selector = text.slice(start, i).trim();
    i++; // skip '{'
    const bodyStart = i;
    let depth = 1;
    while (i < text.length && depth > 0) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      if (depth === 0) break;
      i++;
    }
    const body = text.slice(bodyStart, i);
    i++; // skip closing '}'
    blocks.push({ selector, body });
    if (body.includes("{")) {
      blocks.push(...extractBlocks(body));
    }
  }
  return blocks;
}

function declarationsOf(block: Block): Array<[string, string]> {
  return block.body
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d.length > 0)
    .map((d) => {
      const idx = d.indexOf(":");
      return [d.slice(0, idx).trim(), d.slice(idx + 1).trim()] as [string, string];
    });
}

function valuesOf(property: string, blocks: Block[]): string[] {
  const values: string[] = [];
  for (const block of blocks) {
    for (const [prop, value] of declarationsOf(block)) {
      if (prop === property) values.push(value);
    }
  }
  return values;
}

const allBlocks = extractBlocks(css);

// Every rule block whose selector starts with `.prose-site`.
const proseBlocks = allBlocks.filter((b) => b.selector.startsWith(".prose-site"));

// The set of every individual (comma-split, trimmed) selector across every
// block in the file — used for exact-selector presence checks.
const allSelectors = new Set(
  allBlocks.flatMap((b) => b.selector.split(",").map((s) => s.trim())),
);

test("(a) .prose-site uses only the two fixed font sizes, plus inherit", () => {
  const sizes = new Set(valuesOf("font-size", proseBlocks));
  assert.ok(sizes.size > 0, "expected at least one font-size declaration");
  for (const size of sizes) {
    assert.ok(
      size === "14px" || size === "18px" || size === "inherit",
      `unexpected font-size "${size}" in .prose-site — the type budget is exactly 14px and 18px`,
    );
  }
});

test("(b) .prose-site uses only the two weights, plus inherit", () => {
  const weights = new Set(valuesOf("font-weight", proseBlocks));
  assert.ok(weights.size > 0, "expected at least one font-weight declaration");
  for (const weight of weights) {
    assert.ok(
      weight === "400" || weight === "530" || weight === "inherit",
      `unexpected font-weight "${weight}" in .prose-site — the weight budget is exactly 400 and 530`,
    );
  }
});

test("(c) .prose-site uses only one tracking value, plus 0", () => {
  const values = new Set(valuesOf("letter-spacing", proseBlocks));
  assert.ok(values.size > 0, "expected at least one letter-spacing declaration");
  for (const value of values) {
    assert.ok(
      value === "0.04em" || value === "0",
      `unexpected letter-spacing "${value}" in .prose-site`,
    );
  }
});

test("(d) every border-radius in .prose-site is 0", () => {
  const values = valuesOf("border-radius", proseBlocks);
  assert.ok(values.length >= 3, "expected at least three border-radius declarations");
  for (const value of values) {
    assert.equal(value, "0", "no rounded corner is permitted anywhere in this phase");
  }
});

test("(e) !important does not appear anywhere in globals.css", () => {
  assert.ok(!css.includes("!important"), "unlayered CSS should never need !important");
});

test("(f) every required Prose Contract selector is present", () => {
  const required = [
    ".prose-site p",
    ".prose-site h2",
    ".prose-site h3",
    ".prose-site a",
    ".prose-site strong",
    ".prose-site em",
    ".prose-site blockquote",
    ".prose-site blockquote em",
    ".prose-site code",
    ".prose-site pre",
    ".prose-site table",
    ".prose-site th",
    ".prose-site td",
    ".prose-site figure",
    ".prose-site figcaption",
    ".prose-site aside",
    ".prose-site hr",
    ".text-standfirst",
  ];
  for (const selector of required) {
    assert.ok(allSelectors.has(selector), `missing required selector: ${selector}`);
  }
});

test("(g) the prose contract stops at h3 — h4/h5/h6 are not styled", () => {
  for (const selector of allSelectors) {
    assert.ok(
      !/\.prose-site\s+h[456]\b/.test(selector),
      `h4/h5/h6 must not be styled under .prose-site: found "${selector}"`,
    );
  }
});

test("(h) the mono face and the two ink tints are declared inside @theme", () => {
  const themeBlock = allBlocks.find((b) => b.selector === "@theme");
  assert.ok(themeBlock, "expected an @theme block in app/globals.css");
  const themeProps = declarationsOf(themeBlock!).map(([prop]) => prop);
  assert.ok(themeProps.includes("--font-mono"), "--font-mono must be defined inside @theme");
  assert.ok(
    themeProps.includes("--color-surface-code"),
    "--color-surface-code must be defined inside @theme",
  );
  assert.ok(themeProps.includes("--color-rule"), "--color-rule must be defined inside @theme");
});

test("(i) .text-standfirst declares exactly one size (18px) and weight 530", () => {
  const standfirstBlocks = allBlocks.filter((b) => b.selector === ".text-standfirst");
  assert.equal(standfirstBlocks.length, 1, "expected exactly one .text-standfirst block");
  const sizes = valuesOf("font-size", standfirstBlocks);
  assert.deepEqual(sizes, ["18px"], ".text-standfirst must declare exactly one font-size, 18px");
  const weights = valuesOf("font-weight", standfirstBlocks);
  assert.ok(weights.includes("530"), ".text-standfirst must declare font-weight: 530");
});

test("(j) the edit was additive — Phase 1's clamp() curves are untouched", () => {
  const display = "clamp(3.5rem, 1.5rem + 8vw, 11.25rem)";
  const heading = "clamp(2rem, 1rem + 4vw, 4.5rem)";
  const countOccurrences = (needle: string) => css.split(needle).length - 1;
  assert.equal(countOccurrences(display), 1, "Display clamp() curve must appear exactly once");
  assert.equal(countOccurrences(heading), 1, "Heading clamp() curve must appear exactly once");
});
