import assert from "node:assert/strict";
import { test } from "node:test";
import { allBlocks, allSelectors, css, declarationsOf, extractBlocks, valuesOf } from "./css-source.ts";

// Covers WRIT-01 (SC3, SC4): this suite reads app/globals.css from disk and
// enforces the Prose Contract (02-UI-SPEC.md) as source assertions — it is
// the automated gate that fails the build if a fifth type size, a third
// weight, a rounded corner, or an `!important` ever appears in `.prose-site`.
//
// The nesting-aware globals.css parser (extractBlocks, declarationsOf,
// valuesOf, and the css/allBlocks/allSelectors constants it derives) now
// lives in ./css-source.ts, because tests/unit/link-contract.test.ts
// enforces the same budget over a different selector set and the parser is
// stated once, not copied.

// Every rule block whose selector starts with `.prose-site`.
const proseBlocks = allBlocks.filter((b) => b.selector.startsWith(".prose-site"));

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
