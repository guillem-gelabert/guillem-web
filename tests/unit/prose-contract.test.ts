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
//
// Tests (a)-(l) are SELECTOR-SCOPED to `.prose-site`. Tests (m)-(o) below
// are not, and that distinction is the whole point of code review WR-04.
// Both this suite and link-contract derived their block set by selector
// prefix — `.prose-site*` here, `.section-head`/`.link*` there — so nothing
// in either inspected .text-display, .text-heading, .text-body or
// .text-label: the four role classes that ARE the four-size/two-weight
// budget. Proven in a sandbox copy of both suites: a new `.text-caption`
// carrying a fifth size (12px), a third weight (700), a literal hex, a
// third tracking value, a 6px border-radius and a colourless
// `border-top: 3px solid` passed 21/21; and mutating the shipped
// `.text-body` to 20px and `.text-label` to `font-weight: 700 ! important`
// also passed 21/21. 03-09-SUMMARY.md names these two suites as "the proof
// no budget widened" when specifying the remedy for three open optical
// items. That proof did not exist. (m)-(o) are it.

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
  // Matched as a pattern, not a substring. `font-weight: 700 ! important`
  // is valid CSS — the grammar permits whitespace between the delimiter and
  // the keyword, and browsers honour it — so the old
  // `css.includes("!important")` accepted it. Confirmed in the WR-04 probe:
  // the whole suite passed 21/21 with that exact declaration shipped on
  // .text-label. Comments are already stripped from `css`, so this cannot
  // be tripped by prose.
  assert.ok(
    !/!\s*important/i.test(css),
    "unlayered CSS should never need !important (in any spacing, including `! important`)",
  );
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
    ".section-head",
    ".link",
    ".link-quiet",
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

// --- WR-04: the whole-file budget, derived by EXCLUSION not inclusion -----
//
// (m)-(o) start from every block in the file. There is no selector
// allowlist to fall out of, which is the defect they exist to close: a
// class invented tomorrow is inside this budget the moment it is written,
// and so are the four role classes that were never inside the old one.
//
// The only exclusion is @theme, and only for the literal-colour ban —
// @theme is where literal values are supposed to live, which is exactly
// why nothing outside it may restate one. Note that `!important` is NOT
// restated here: prose-contract (e) and link-contract (h) already assert
// /!\s*important/i over the whole file, and a third copy would be one more
// place to forget to update.

/**
 * 03-UI-SPEC.md § Typography, verbatim. Four roles, two fixed sizes plus
 * two fluid Humane curves, two weights. `inherit` is a pass-through, not a
 * fifth size: it declares that the element takes whatever role wraps it.
 */
const TYPE_SIZES = new Set([
  "14px", // Label
  "18px", // Body
  "clamp(2rem, 1rem + 4vw, 4.5rem)", // Heading
  "clamp(3.5rem, 1.5rem + 8vw, 11.25rem)", // Display
]);
const TYPE_WEIGHTS = new Set(["400", "530"]);
const TRACKING = new Set([
  "0.04em", // Label role — the UI-SPEC's stated cap for multi-word real text
  "0.035em", // both Humane curves
  "0",
]);
const PASSTHROUGH = new Set(["inherit", "normal"]);

/**
 * Rule weights. 1px is the structural/separator stroke, 4px is Phase 2's
 * `.prose-site aside` marker, and 2px is the focus-outline exception the
 * spacing scale declares as an affordance width rather than a distance.
 * `0` (as in `border: 0`) resets rather than draws.
 */
const RULE_WIDTHS = new Set(["1px", "2px", "4px"]);
const RULE_COLORS = new Set([
  "var(--color-ink)",
  "var(--color-rule)",
  "var(--color-accent)",
]);

// Anchored to properties that actually carry a width. The looser
// /^border(-[a-z]+)?(-width)?$/ used by link-contract (d) also matches
// `border-radius` and `border-collapse`, which produces a wrong message the
// first time it fires.
const WIDTH_PROPERTY = /^(?:border(?:-(?:top|right|bottom|left))?(?:-width)?|outline(?:-width)?)$/;

const isThemeBlock = (selector: string) =>
  selector === "@theme" || selector.startsWith("@theme ");

test("(m) every declaration in the whole stylesheet sits inside the shipped budget", () => {
  let checkedSizes = 0;
  let checkedWeights = 0;

  for (const block of allBlocks) {
    for (const [prop, value] of declarationsOf(block)) {
      const where = `"${prop}: ${value}" in "${block.selector}"`;

      if (prop === "font-size") {
        checkedSizes++;
        assert.ok(
          TYPE_SIZES.has(value) || PASSTHROUGH.has(value),
          `fifth type size — ${where}. The budget is 14px, 18px and the two Humane clamp() curves. If a section reads thin, the remedy is more space and the existing seven spacing tokens, NOT a fifth size (03-UI-SPEC.md § The type budget).`,
        );
      }

      if (prop === "font-weight") {
        checkedWeights++;
        assert.ok(
          TYPE_WEIGHTS.has(value) || PASSTHROUGH.has(value),
          `third weight — ${where}. The weight budget is exactly 400 and 530; do not introduce 600 or 700.`,
        );
      }

      if (prop === "letter-spacing") {
        assert.ok(
          TRACKING.has(value) || PASSTHROUGH.has(value),
          `new tracking value — ${where}. The cap on multi-word real text is 0.04em.`,
        );
      }

      if (prop === "border-radius") {
        assert.equal(value, "0", `rounded corner — ${where}. No rounded corners anywhere.`);
      }

      // Literal colour outside @theme. Every colour on the site is one of
      // five tokens; a hex or rgb() anywhere else is a sixth, un-named and
      // un-contrast-checked.
      if (!isThemeBlock(block.selector)) {
        assert.ok(
          !/#[0-9a-fA-F]{3,8}\b/.test(value),
          `literal hex colour outside the @theme token block — ${where}.`,
        );
        assert.ok(
          !/\brgba?\(/.test(value),
          `literal rgb()/rgba() colour outside the @theme token block — ${where}.`,
        );
      }

      if (WIDTH_PROPERTY.test(prop)) {
        const pxValues = value.match(/\d+(?:\.\d+)?px/g) ?? [];
        if (pxValues.length === 0) {
          // `border: 0` / `border: none` resets; anything else that declares
          // no length is a keyword width (`thin`, `medium`) sneaking past.
          assert.ok(
            value === "0" || value === "none",
            `rule with no length component — ${where}. Use 0/none to reset, or an explicit px width.`,
          );
          continue;
        }
        for (const px of pxValues) {
          assert.ok(
            RULE_WIDTHS.has(px),
            `unexpected rule weight "${px}" — ${where}. The budget is 1px (structural/separator), 4px (the aside marker) and 2px (the focus-outline exception).`,
          );
        }
        // Pitfall 1 / Phase 2 WR-06: a bare width falls through to Tailwind
        // v4 preflight's currentColor and silently renders full ink — which
        // is how the indexes' <hr> shipped 8x too dark.
        const colorMatches = value.match(/var\(--color-[a-z-]+\)/g) ?? [];
        assert.ok(
          colorMatches.length > 0,
          `rule with a width but no colour — ${where}. A bare border/outline width falls through to currentColor.`,
        );
        for (const colorValue of colorMatches) {
          assert.ok(
            RULE_COLORS.has(colorValue),
            `unexpected rule colour "${colorValue}" — ${where}.`,
          );
        }
      }
    }
  }

  // A budget test over an empty declaration set passes vacuously, which is
  // the failure mode that let the original gates look green.
  assert.ok(checkedSizes >= 15, `expected at least 15 font-size declarations, saw ${checkedSizes}`);
  assert.ok(
    checkedWeights >= 15,
    `expected at least 15 font-weight declarations, saw ${checkedWeights}`,
  );
});

test("(n) the whole stylesheet declares exactly four type sizes and exactly two weights", () => {
  // Membership in (m) catches an addition. Set EQUALITY catches the other
  // direction too — a role silently losing its size, or the Display curve
  // being retuned so the file no longer holds the four the UI-SPEC names.
  const sizes = new Set(
    valuesOf("font-size", allBlocks).filter((value) => !PASSTHROUGH.has(value)),
  );
  assert.deepEqual(
    [...sizes].sort(),
    [...TYPE_SIZES].sort(),
    "app/globals.css must declare exactly the four shipped type sizes — no more, and none missing",
  );

  const weights = new Set(
    valuesOf("font-weight", allBlocks).filter((value) => !PASSTHROUGH.has(value)),
  );
  assert.deepEqual(
    [...weights].sort(),
    [...TYPE_WEIGHTS].sort(),
    "app/globals.css must declare exactly the two shipped weights, 400 and 530",
  );
});

test("(o) each of the four role classes pins its own size and weight", () => {
  // (m) and (n) prove the file holds four sizes and two weights. They do not
  // prove each role still carries the RIGHT one: swapping .text-body to 14px
  // and .text-label to 18px keeps both sets intact. This is the assertion
  // that fails by name when a role drifts.
  const ROLES: Array<[string, string, string]> = [
    [".text-display", "clamp(3.5rem, 1.5rem + 8vw, 11.25rem)", "530"],
    [".text-heading", "clamp(2rem, 1rem + 4vw, 4.5rem)", "530"],
    [".text-body", "18px", "400"],
    [".text-label", "14px", "400"],
  ];

  for (const [selector, size, weight] of ROLES) {
    const blocks = allBlocks.filter((b) => b.selector === selector);
    assert.equal(blocks.length, 1, `expected exactly one ${selector} block in app/globals.css`);
    assert.deepEqual(
      valuesOf("font-size", blocks),
      [size],
      `${selector} must declare exactly one font-size, ${size}`,
    );
    assert.deepEqual(
      valuesOf("font-weight", blocks),
      [weight],
      `${selector} must declare exactly one font-weight, ${weight}`,
    );
  }
});
