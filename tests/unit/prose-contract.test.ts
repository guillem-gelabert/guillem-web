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
// no body (`@import "…";`, `@plugin "…";`) and at-rule or CSS nesting
// (`@theme { … }`, `@media (…) { … }`, `.prose-site { … .foo { … } }`) by
// recursing into the captured body.
//
// The `parent` argument is load-bearing, not cosmetic. It used to be absent,
// so a nested `.prose-site { … .foo { font-size: 20px } }` pushed a child
// block whose selector was the bare `.foo` — which failed the
// startsWith(".prose-site") filter below and slipped past tests (a)-(d)
// entirely, while the PARENT's declaration split produced the nonsense key
// `.foo { font-size` that matched no property either. A fifth type size, a
// third weight, a second tracking value or a rounded corner authored with
// nesting was invisible to this gate. The stylesheet happens to use no
// nesting today, and Tailwind v4 actively encourages it.
function extractBlocks(text: string, parent = ""): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i]!)) i++;
    if (i >= text.length) break;
    const start = i;
    while (i < text.length && text[i] !== "{" && text[i] !== ";") i++;
    if (i >= text.length) break;
    if (text[i] === ";") {
      // Bare statement (e.g. @import, @plugin, or a declaration inside a
      // block we are recursing into) — no body to capture.
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

    // An at-rule is a container, not a scope: `@media (…) { .foo { … } }`
    // leaves .foo's selector as .foo, qualified by whatever the at-rule
    // itself was nested in.
    const isAtRule = selector.startsWith("@");
    const qualified = parent && !isAtRule ? `${parent} ${selector}` : selector;
    blocks.push({ selector: qualified, body });
    if (body.includes("{")) {
      blocks.push(...extractBlocks(body, isAtRule ? parent : qualified));
    }
  }
  return blocks;
}

/**
 * A block's own declarations, with any nested rule blocks removed first so
 * their contents are attributed to the child block that extractBlocks already
 * pushed, never to the parent.
 */
function ownDeclarationText(body: string): string {
  let out = "";
  let i = 0;
  while (i < body.length) {
    if (body[i] === "{") {
      // Drop the selector text accumulated since the last `;`, then skip the
      // whole nested block.
      out = out.slice(0, out.lastIndexOf(";") + 1);
      let depth = 1;
      i++;
      while (i < body.length && depth > 0) {
        if (body[i] === "{") depth++;
        else if (body[i] === "}") depth--;
        i++;
      }
      continue;
    }
    out += body[i];
    i++;
  }
  return out;
}

/**
 * Split on `;` only at the top level. A naive split mis-parses any value
 * containing a semicolon — `url(data:image/svg+xml;base64,…)`, `content: "\;"`
 * — turning one declaration into two nonsense ones.
 */
function splitDeclarations(text: string): string[] {
  const parts: string[] = [];
  let current = "";
  let parens = 0;
  let quote: string | null = null;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quote) {
      current += ch;
      if (ch === "\\") current += text[++i] ?? "";
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "(") {
      parens++;
    } else if (ch === ")") {
      parens--;
    } else if (ch === ";" && parens === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
}

function declarationsOf(block: Block): Array<[string, string]> {
  return splitDeclarations(ownDeclarationText(block.body))
    .map((d) => d.trim())
    .filter((d) => d.includes(":"))
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

test("(k) the parser sees through CSS nesting — a nested violation is attributed to .prose-site", () => {
  // WR-13: the gate is only as good as its parser. Before the `parent`
  // argument existed, both of the blocks below were invisible to tests
  // (a)-(d): the child's selector was the bare `.callout` / `figure`, and the
  // parent's declaration split produced keys like ".callout { font-size".
  const nested = `
    .prose-site {
      font-size: 18px;
      .callout {
        font-size: 20px;
        border-radius: 6px;
      }
    }
    @media (min-width: 40rem) {
      .prose-site {
        letter-spacing: 0.08em;
      }
    }
  `;

  const blocks = extractBlocks(nested);
  const prose = blocks.filter((b) => b.selector.startsWith(".prose-site"));

  assert.ok(
    prose.some((b) => b.selector === ".prose-site .callout"),
    "a nested block must inherit its ancestor's selector",
  );
  assert.deepEqual(valuesOf("font-size", prose).sort(), ["18px", "20px"]);
  assert.deepEqual(valuesOf("border-radius", prose), ["6px"]);
  // An at-rule is a container, not a scope: the rule inside @media is still
  // `.prose-site`, not `@media (…) .prose-site`.
  assert.deepEqual(valuesOf("letter-spacing", prose), ["0.08em"]);

  // ...and the parent must not have swallowed the child's declarations.
  const parent = prose.find((b) => b.selector === ".prose-site")!;
  assert.deepEqual(declarationsOf(parent), [["font-size", "18px"]]);
});

test("(l) a declaration whose value contains a semicolon is not split into two", () => {
  // Secondary WR-13 defect: a naive split(';') mis-parses url(data:…;base64,…)
  // and content: "\;", turning one declaration into two nonsense ones.
  const tricky = `
    .prose-site figure {
      background-image: url("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=");
      content: "a;b";
      font-size: 14px;
    }
  `;
  const [block] = extractBlocks(tricky);
  assert.deepEqual(declarationsOf(block!), [
    ["background-image", 'url("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")'],
    ["content", '"a;b"'],
    ["font-size", "14px"],
  ]);
});
