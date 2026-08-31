import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { allBlocks, allSelectors, css, declarationsOf, valuesOf } from "./css-source.ts";

// This file is the Phase 3 source-fact gate. Its first remit (below) covers
// HOME-03/HOME-04 by enforcing the UI-SPEC's central promise — every
// declaration inside .section-head, .link and .link-quiet is a value
// already shipped in app/globals.css. Plan 03-03 appends a second remit to
// this file: the amendment-A1 assertion that app/(en)/page.tsx carries no
// "use client" directive and no useSmearHeading import, which is a source
// fact no browser assertion can replace.
//
// Deliberate overlap with prose-contract.test.ts test (f): presence of the
// three new selectors is asserted in both files, because a value assertion
// over an empty block set (the failure mode if the classes were ever
// removed) would pass vacuously here.

// Every block whose selector, comma-split and trimmed, has any part
// starting with .section-head, .link or .link-quiet.
const linkBlocks = allBlocks.filter((b) =>
  b.selector
    .split(",")
    .map((s) => s.trim())
    .some(
      (s) => s.startsWith(".section-head") || s.startsWith(".link-quiet") || s.startsWith(".link"),
    ),
);

assert.ok(
  linkBlocks.length >= 6,
  `expected at least 6 link-contract blocks, found ${linkBlocks.length} — .section-head, .link and .link-quiet are missing from app/globals.css`,
);

test("(a) all seven .section-head/.link/.link-quiet selectors are present", () => {
  const required = [
    ".section-head",
    ".link",
    ".link:hover",
    ".link:focus-visible",
    ".link-quiet",
    ".link-quiet:hover",
    ".link-quiet:focus-visible",
  ];
  for (const selector of required) {
    assert.ok(allSelectors.has(selector), `missing required selector: ${selector}`);
  }
});

test("(b) type budget: four sizes and two weights, Phase 3 adds none", () => {
  const sizes = new Set(valuesOf("font-size", linkBlocks));
  for (const size of sizes) {
    assert.ok(
      size === "14px" || size === "inherit",
      `unexpected font-size "${size}" — the budget is four sizes total and .section-head/.link/.link-quiet are Label-role only`,
    );
  }
  const weights = new Set(valuesOf("font-weight", linkBlocks));
  for (const weight of weights) {
    assert.ok(
      weight === "400" || weight === "530" || weight === "inherit",
      `unexpected font-weight "${weight}" — the weight budget is exactly 400 and 530`,
    );
  }
  const tracking = new Set(valuesOf("letter-spacing", linkBlocks));
  for (const value of tracking) {
    assert.ok(
      value === "0.04em" || value === "0.035em" || value === "0" || value === "normal",
      `unexpected letter-spacing "${value}"`,
    );
  }
});

test("(c) no literal colour anywhere in the link contract", () => {
  const allowedColorValues = new Set([
    "inherit",
    "currentColor",
    "var(--color-accent)",
    "var(--color-ink)",
    "var(--color-rule)",
    "var(--color-paper)",
  ]);
  const colorProps = [
    "color",
    "text-decoration-color",
    "border-bottom-color",
    "border-color",
    "outline-color",
    "background",
  ];
  for (const prop of colorProps) {
    for (const value of valuesOf(prop, linkBlocks)) {
      assert.ok(
        allowedColorValues.has(value),
        `unexpected literal "${prop}: ${value}" in the link contract — colour must be a shipped var() token`,
      );
    }
  }

  // Belt-and-braces: no hex or rgba() anywhere in any linkBlocks declaration,
  // regardless of property name.
  for (const block of linkBlocks) {
    for (const [prop, value] of declarationsOf(block)) {
      assert.ok(
        !/#[0-9a-fA-F]{3,8}\b/.test(value),
        `literal hex colour "${value}" found in "${prop}" — the link contract must use var() tokens only`,
      );
      assert.ok(
        !/\brgba?\(/.test(value),
        `literal rgb()/rgba() colour "${value}" found in "${prop}" — the link contract must use var() tokens only`,
      );
    }
  }
});

test("(d) no fourth rule weight: border/outline widths are 1px or 2px with a var() colour", () => {
  const widthPropertyPattern = /^border(-[a-z]+)?(-width)?$/;
  const outlinePropertyPattern = /^outline(-width)?$/;
  const allowedRuleColors = ["var(--color-ink)", "var(--color-rule)", "var(--color-accent)"];

  let checkedAny = false;
  for (const block of linkBlocks) {
    for (const [prop, value] of declarationsOf(block)) {
      if (!widthPropertyPattern.test(prop) && !outlinePropertyPattern.test(prop)) continue;
      checkedAny = true;

      const pxValues = value.match(/\d+(?:\.\d+)?px/g) ?? [];
      assert.ok(
        pxValues.length > 0,
        `"${prop}: ${value}" declares no length component`,
      );
      for (const px of pxValues) {
        assert.ok(
          px === "1px" || px === "2px",
          `unexpected rule weight "${px}" in "${prop}: ${value}" — the budget is 1px (structural/separator) and 2px (focus outline) only`,
        );
      }

      // A bare width with no colour component is exactly Pitfall 1 / WR-06's
      // failure mode: it falls through to Tailwind v4 preflight's
      // currentColor default and silently renders full ink.
      const colorMatches = value.match(/var\(--color-[a-z]+\)/g) ?? [];
      assert.ok(
        colorMatches.length > 0,
        `"${prop}: ${value}" has no colour component — a bare border/outline width falls through to currentColor (Pitfall 1 / WR-06)`,
      );
      for (const colorValue of colorMatches) {
        assert.ok(
          allowedRuleColors.includes(colorValue),
          `unexpected rule colour "${colorValue}" in "${prop}: ${value}"`,
        );
      }
    }
  }
  assert.ok(checkedAny, "expected at least one border/outline declaration in the link contract");
});

test("(e) .link-quiet has no underline at rest and gains one on hover/focus", () => {
  const restBlock = allBlocks.find((b) => b.selector === ".link-quiet");
  assert.ok(restBlock, "expected a .link-quiet rest-state block");
  const restDecls = declarationsOf(restBlock!);
  const restsNoUnderline = restDecls.some(
    ([prop, value]) =>
      (prop === "text-decoration" || prop === "text-decoration-line") && value === "none",
  );
  assert.ok(
    restsNoUnderline,
    ".link-quiet's rest state must declare text-decoration: none (or text-decoration-line: none)",
  );

  const hoverBlock = allBlocks.find((b) =>
    b.selector
      .split(",")
      .map((s) => s.trim())
      .includes(".link-quiet:hover"),
  );
  assert.ok(hoverBlock, "expected a .link-quiet:hover block");
  const hoverDecls = declarationsOf(hoverBlock!);
  const hoverHasUnderline = hoverDecls.some(
    ([prop, value]) =>
      (prop === "text-decoration" || prop === "text-decoration-line") &&
      value.includes("underline"),
  );
  assert.ok(
    hoverHasUnderline,
    ".link-quiet's :hover/:focus-visible state must declare an underline — removing it must fail this test",
  );
});

test("(f) .link and .link-quiet both show a 2px accent focus-visible outline; outline: none never appears", () => {
  const focusBlock = allBlocks.find((b) => {
    const parts = b.selector.split(",").map((s) => s.trim());
    return parts.includes(".link:focus-visible") && parts.includes(".link-quiet:focus-visible");
  });
  assert.ok(
    focusBlock,
    "expected a combined .link:focus-visible, .link-quiet:focus-visible block",
  );
  const decls = declarationsOf(focusBlock!);
  assert.ok(
    decls.some(([prop, value]) => prop === "outline" && value === "2px solid var(--color-accent)"),
    "expected outline: 2px solid var(--color-accent) on the focus-visible rule",
  );
  assert.ok(
    decls.some(([prop, value]) => prop === "outline-offset" && value === "2px"),
    "expected outline-offset: 2px on the focus-visible rule",
  );

  assert.ok(!/outline\s*:\s*none/.test(css), '"outline: none" must appear nowhere in app/globals.css');
  assert.ok(!/outline\s*:\s*none/.test(css.replace(/\s/g, "")), '"outline:none" must appear nowhere in app/globals.css');
});

test("(g) both transitions sit inside @media (prefers-reduced-motion: no-preference); the state change does not", () => {
  // The parser treats an at-rule as a container, not a scope — a block's
  // selector cannot tell you whether it sits inside the media query. Answer
  // it from the @media block's own body text instead.
  const reducedMotionBlocks = allBlocks.filter(
    (b) => b.selector.startsWith("@media") && b.selector.includes("prefers-reduced-motion: no-preference"),
  );
  assert.ok(reducedMotionBlocks.length > 0, "expected a prefers-reduced-motion: no-preference block");

  const countIn = (text: string) => (text.match(/transition/g) ?? []).length;
  const insideCount = reducedMotionBlocks.reduce((sum, b) => sum + countIn(b.body), 0);
  const totalCount = countIn(css);

  assert.ok(insideCount > 0, "expected at least one transition inside the reduced-motion media query");
  assert.equal(
    insideCount,
    totalCount,
    "every `transition` in globals.css must sit inside @media (prefers-reduced-motion: no-preference) — a transition written outside it is exactly the regression this test catches",
  );
});

test("(h) the existing invariants still hold, restated so this suite fails independently of prose-contract", () => {
  assert.ok(!css.includes("!important"), "!important must not appear anywhere in globals.css");

  const display = "clamp(3.5rem, 1.5rem + 8vw, 11.25rem)";
  const heading = "clamp(2rem, 1rem + 4vw, 4.5rem)";
  const countOccurrences = (needle: string) => css.split(needle).length - 1;
  assert.equal(countOccurrences(display), 1, "Display clamp() curve must appear exactly once");
  assert.equal(countOccurrences(heading), 1, "Heading clamp() curve must appear exactly once");
});

// Amendment A1's second remit for this file: a source-fact gate over
// app/(en)/page.tsx's client boundary. A Playwright assertion cannot replace
// this — measured today, "/" already inherits a <title> and a <meta
// name="description"> from app/(en)/layout.tsx, so "a title appears on /"
// passes before this plan's change and proves nothing (03-RESEARCH.md
// C-2). The client boundary is a source fact — no "use client", no
// useSmearHeading import — and must be asserted as one.
const LANDING_PAGE_PATH = path.join(process.cwd(), "app/(en)/page.tsx");
const landingPageSource = readFileSync(LANDING_PAGE_PATH, "utf8");

test("(i) app/(en)/page.tsx is a Server Component exporting route metadata with a canonical, and declares no robots of its own", () => {
  assert.ok(
    !landingPageSource.includes('"use client"'),
    'app/(en)/page.tsx must not contain "use client" — Amendment A1 de-clients the landing view',
  );
  assert.ok(
    !landingPageSource.includes("useSmearHeading"),
    "app/(en)/page.tsx must not import useSmearHeading directly — SmearTitle is the sanctioned client leaf",
  );
  assert.ok(
    landingPageSource.includes("export const metadata"),
    "app/(en)/page.tsx must export const metadata",
  );
  assert.ok(
    landingPageSource.includes("canonical"),
    "app/(en)/page.tsx's metadata must declare a canonical",
  );
  assert.ok(
    !landingPageSource.includes("robots"),
    'the string "robots" must not appear in app/(en)/page.tsx — it stays confined to the two root layouts until Phase 6\'s FIND-02',
  );
});
