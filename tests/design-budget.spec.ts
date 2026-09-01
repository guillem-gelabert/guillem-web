import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { allBlocks, valuesOf } from "./unit/css-source.ts";

// Covers D-4.4 section 3 (06-CONTEXT.md:365-370) — the design-system
// roll-call, at the ONE tier that sees rendered values.
//
// OWNERSHIP, stated precisely so a future reader does not delete one file
// as redundant with the other:
//   - tests/unit/prose-contract.test.ts owns app/globals.css. It reads the
//     stylesheet from disk and enforces the whole-file budget (four sizes,
//     two weights, zero border-radius, no literal colour outside @theme, no
//     !important) as SOURCE assertions.
//   - THIS file owns RENDERED VALUES and JSX — the two surfaces the unit
//     test structurally cannot read. An arbitrary Tailwind value written
//     directly in a .tsx file (text-[20px], font-[700], bg-[#eee]) never
//     touches app/globals.css and passes every one of the unit test's
//     assertions silently. Tailwind v4's own preflight ships
//     `b, strong { font-weight: bolder }` in COMPILED CSS, not in
//     app/globals.css, so an unscoped <strong> resolves to 700 — a third
//     weight on screen — with the entire source-level budget green. Only a
//     getComputedStyle() sweep over a real render catches either.
//
// Swept routes: / and /cv — the two surfaces this phase changed and the
// two the source-level gates read least — plus /type as a third target,
// included because it stayed fast: the specimen deliberately exercises
// every type role and is a useful control.
//
// Fixed viewport (STATE.md/UI-SPEC's own house rule): the Heading and
// Display roles are clamp()-based fluid curves, so comparing font-size sets
// across viewports would be meaningless. Every test in this file runs at
// ONE viewport, declared once via test.use() below, matching the 1440px
// desktop checkpoint every UI-SPEC in this repo already designates.
test.use({ viewport: { width: 1440, height: 900 } });

const ROUTES = ["/", "/cv", "/type"] as const;

// --- The expected accent value, read from source, never hardcoded --------
//
// D-4.4 §3 requires this: "Read the expected value from app/globals.css's
// @theme block rather than hardcoding the hex." Reuses
// tests/unit/css-source.ts's parser rather than re-deriving one — the same
// module prose-contract.test.ts and link-contract.test.ts already share.

const themeBlock = allBlocks.find((b) => b.selector === "@theme");
if (!themeBlock) {
  throw new Error("design-budget.spec.ts: expected an @theme block in app/globals.css");
}
const [accentHex] = valuesOf("--color-accent", [themeBlock]);
if (!accentHex) {
  throw new Error("design-budget.spec.ts: expected --color-accent inside app/globals.css's @theme block");
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

const ACCENT_RGB = hexToRgb(accentHex);

// --- Weight and size: the DOM-tier sweep no source gate can make ---------

type TypeSample = {
  tag: string;
  classes: string;
  text: string;
  fontWeight: string;
  fontSize: string;
};

// House pattern (tests/landing.spec.ts (u)/(x)): an element "renders text"
// only if it carries a DIRECT text-node child — a wrapper whose text lives
// entirely inside a nested element (e.g. <h3><a>Title</a></h3>) is skipped
// in favour of the nested element that actually carries the text, which is
// also the element whose computed style is the one that matters.
async function sweepMainTypeSamples(page: Page): Promise<TypeSample[]> {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return [];
    const withDirectText = Array.from(main.querySelectorAll("*")).filter((node) =>
      Array.from(node.childNodes).some(
        (child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0,
      ),
    );
    return withDirectText.map((node) => {
      const s = getComputedStyle(node);
      return {
        tag: node.tagName.toLowerCase(),
        classes: (node as HTMLElement).className || "",
        text: (node.textContent ?? "").trim().slice(0, 60),
        fontWeight: s.fontWeight,
        fontSize: s.fontSize,
      };
    });
  });
}

const VALID_WEIGHTS = new Set(["400", "530"]);

for (const route of ROUTES) {
  test(`(weight/size) every text-bearing element inside <main> on ${route} computes a budget-legal weight, and the route's distinct font-size set has cardinality <= 4`, async ({
    page,
  }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const samples = await sweepMainTypeSamples(page);
    expect(samples.length, `expected at least one text-bearing element inside <main> on ${route}`).toBeGreaterThan(0);

    // Weight — the assertion this spec exists for: catches <strong>
    // resolving to 700 (Tailwind preflight, outside .prose-site) and any
    // font-[…] arbitrary value, neither of which app/globals.css contains.
    const weightOffenders = samples.filter((s) => !VALID_WEIGHTS.has(s.fontWeight));
    expect(
      weightOffenders,
      `third weight found on ${route} — offending elements:\n${JSON.stringify(weightOffenders, null, 2)}`,
    ).toEqual([]);

    // Size — cardinality, not membership: even if every individual size is
    // one of the four legal values, a fifth would only be caught by
    // counting the DISTINCT set actually rendered. Reported unconditionally
    // so a future fifth size is a one-line diagnosis.
    const sizeSet = [...new Set(samples.map((s) => s.fontSize))];
    console.log(`design-budget: ${route} distinct rendered font-size set at 1440px: ${sizeSet.join(", ")}`);
    expect(sizeSet.length, `${route} rendered ${sizeSet.length} distinct font sizes: ${sizeSet.join(", ")}`).toBeLessThanOrEqual(4);
  });
}

// --- Radius: every corner, on every element, is 0 ------------------------

for (const route of ROUTES) {
  test(`(radius) every computed border-radius inside <main> on ${route} is 0px on all four corners`, async ({
    page,
  }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const offenders = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return [];
      const bad: Array<{ tag: string; classes: string; tl: string; tr: string; br: string; bl: string }> = [];
      for (const node of Array.from(main.querySelectorAll("*"))) {
        const s = getComputedStyle(node);
        const corners = {
          tl: s.borderTopLeftRadius,
          tr: s.borderTopRightRadius,
          br: s.borderBottomRightRadius,
          bl: s.borderBottomLeftRadius,
        };
        if (Object.values(corners).some((v) => v !== "0px")) {
          bad.push({ tag: node.tagName.toLowerCase(), classes: (node as HTMLElement).className || "", ...corners });
        }
      }
      return bad;
    });

    expect(offenders, `non-zero border-radius found on ${route}:\n${JSON.stringify(offenders, null, 2)}`).toEqual([]);
  });
}

// --- Icons: zero <svg>, zero <use> ----------------------------------------

for (const route of ROUTES) {
  test(`(icons) zero <svg> and zero <use> anywhere in the rendered DOM on ${route}`, async ({ page }) => {
    await page.goto(route);
    const count = await page.evaluate(() => document.querySelectorAll("svg, use").length);
    expect(count, `expected zero <svg>/<use> on ${route}, found ${count}`).toBe(0);
  });
}

// --- Non-Latin characters: the union across / and /cv is exactly {U+2190} -

const ARROW = "←"; // ← the one sanctioned exception (U+2190), the back-link glyph

// Typographic punctuation in legitimate running prose (em/en dash, curly
// quotes, ellipsis, nbsp) and the Latin-1 Supplement block (U+00C0–U+00FF —
// e.g. "Zürich"'s ü) are not decoration; they are this site's actual
// English/German copy (lib/work.ts's WORK annotations use an em dash;
// lib/backlog.tsx's "The house names of Zürich" entry uses ü twice — both
// measured present on / at execution time). The plan's own wording
// ("characters outside Basic Latin") names the ASCII ⩽U+007F block, which
// taken completely literally would also flag both of those — not the
// decorative-glyph failure mode (an arrow or a bullet slipping in as
// decoration) this assertion exists to catch. The filter below is
// therefore measured against what the site actually renders, per this
// repo's standing rule to assert measured values rather than values
// derived from the plan's own wording — recorded in 06-10-SUMMARY.md.
const PROSE_PUNCTUATION = new Set([
  "–", // – en dash
  "—", // — em dash
  "‘", // '
  "’", // '
  "“", // "
  "”", // "
  "…", // … ellipsis
  " ", // non-breaking space
]);

function isExpectedProseCharacter(ch: string): boolean {
  const code = ch.codePointAt(0)!;
  if (code <= 0x7f) return true; // Basic Latin / ASCII
  if (code >= 0x00c0 && code <= 0x00ff) return true; // Latin-1 Supplement letters (ü, ä, ö, ß, é, …)
  return PROSE_PUNCTUATION.has(ch);
}

test("(non-Latin) the union of non-ASCII, non-prose-punctuation characters rendered across / and /cv is exactly {U+2190}", async ({
  page,
}) => {
  const union = new Set<string>();
  const perRoute: Record<string, string[]> = {};

  for (const route of ["/", "/cv"] as const) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const text = await page.evaluate(() => document.body.innerText);
    const routeSet = new Set<string>();
    for (const ch of Array.from(text)) {
      if (!isExpectedProseCharacter(ch)) {
        union.add(ch);
        routeSet.add(ch);
      }
    }
    perRoute[route] = [...routeSet].map(
      (c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`,
    );
  }

  console.log(`design-budget: non-Latin/non-prose-punctuation set per route: ${JSON.stringify(perRoute)}`);

  expect([...union]).toEqual([ARROW]);
});

// --- Accent: absent at rest, present on focus and on hover ---------------

async function tabUntilFocused(page: Page, target: Locator, maxPresses = 60): Promise<boolean> {
  for (let i = 0; i < maxPresses; i++) {
    await page.keyboard.press("Tab");
    const isFocused = await target.evaluate((el) => el === document.activeElement).catch(() => false);
    if (isFocused) return true;
  }
  return false;
}

test("(accent) reserved to focus and hover — absent at rest on /, /cv and /type; present on a focused and a hovered link", async ({
  page,
}) => {
  // Every case below touches a hover/focus transition, so this is called
  // before the first goto (plan's own <interfaces> rule; Playwright's
  // reducedMotion context/test options do not reliably affect matchMedia in
  // this environment — STATE.md).
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const route of ROUTES) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const offenders = await page.evaluate((accent) => {
      const main = document.querySelector("main");
      if (!main) return [];
      const hits: string[] = [];
      for (const node of Array.from(main.querySelectorAll("*"))) {
        const s = getComputedStyle(node);
        const props: Record<string, string> = {
          color: s.color,
          backgroundColor: s.backgroundColor,
          outlineColor: s.outlineColor,
          textDecorationColor: s.textDecorationColor,
          borderTopColor: s.borderTopColor,
          borderRightColor: s.borderRightColor,
          borderBottomColor: s.borderBottomColor,
          borderLeftColor: s.borderLeftColor,
        };
        for (const [prop, value] of Object.entries(props)) {
          if (value === accent) {
            hits.push(`${node.tagName.toLowerCase()}.${(node as HTMLElement).className || ""} ${prop}=${value}`);
          }
        }
      }
      return hits;
    }, ACCENT_RGB);

    expect(offenders, `resting-state accent found on ${route}: ${offenders.join(", ")}`).toEqual([]);
  }

  // Now prove the reservation is a reservation, not merely an absence.
  await page.goto("/");
  const link = page.locator('nav[aria-label="Sections"] a').first();

  const reached = await tabUntilFocused(page, link);
  expect(reached, "could not reach the nav's first link by keyboard Tab").toBe(true);
  const focusOutline = await link.evaluate((el) => getComputedStyle(el).outlineColor);
  expect(focusOutline, `focused link's outlineColor was "${focusOutline}", expected the accent (${ACCENT_RGB})`).toBe(
    ACCENT_RGB,
  );

  await link.hover();
  const hoverColor = await link.evaluate((el) => getComputedStyle(el).color);
  expect(hoverColor, `hovered link's color was "${hoverColor}", expected the accent (${ACCENT_RGB})`).toBe(
    ACCENT_RGB,
  );
});

// --- Source sweep: arbitrary Tailwind values and non-zero rounded utilities

type ArbitraryOffender = { key: string; file: string; line: number; pattern: string; text: string };

const ARBITRARY_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "text-[", regex: /\btext-\[/ },
  { name: "font-[", regex: /\bfont-\[/ },
  { name: "bg-[#", regex: /\bbg-\[#/ },
  { name: "w-[", regex: /\bw-\[/ },
  // "rounded-none" computes to border-radius: 0, which the getComputedStyle
  // sweep above already proves is budget-legal everywhere it is used. Every
  // OTHER rounded-* utility introduces a non-zero radius the design system
  // forbids outright, so the pattern excludes only that one word.
  { name: "rounded- (non-zero)", regex: /\brounded-(?!none\b)[a-z]/ },
];

function walkTsxFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkTsxFiles(full, out);
    } else if (entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function sweepArbitraryTailwindValues(): ArbitraryOffender[] {
  const root = process.cwd();
  const files = [...walkTsxFiles(path.join(root, "app")), ...walkTsxFiles(path.join(root, "components"))];
  const offenders: ArbitraryOffender[] = [];
  for (const file of files) {
    const rel = path.relative(root, file);
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, idx) => {
      for (const { name, regex } of ARBITRARY_PATTERNS) {
        if (regex.test(line)) {
          offenders.push({ key: `${rel}:${idx + 1}:${name}`, file: rel, line: idx + 1, pattern: name, text: line.trim() });
        }
      }
    });
  }
  return offenders;
}

// Built from what is ACTUALLY in the tree at execution time — verified
// 2026-09-01: zero matches across app/ and components/ (`grep -rnoE
// "(text-\[|font-\[|bg-\[#|w-\[|rounded-[a-z0-9]*)" app components
// --include="*.tsx"` returned nothing) — not assumed empty. Add an entry
// here only with its reason, keyed by the exact
// "relative/path.tsx:line:pattern" string sweepArbitraryTailwindValues
// produces, if a legitimate arbitrary value is ever added.
const ARBITRARY_VALUE_ALLOWLIST: Record<string, string> = {};

test("(source sweep) no arbitrary Tailwind value and no non-zero rounded utility outside a dated, reasoned allowlist", () => {
  const offenders = sweepArbitraryTailwindValues();
  console.log(
    `design-budget: arbitrary-Tailwind-value source sweep found ${offenders.length} occurrence(s) —\n` +
      (offenders.length ? offenders.map((o) => `  ${o.key}: ${o.text}`).join("\n") : "  (none)"),
  );

  const unexplained = offenders.filter((o) => !(o.key in ARBITRARY_VALUE_ALLOWLIST));
  expect(unexplained, JSON.stringify(unexplained, null, 2)).toEqual([]);
});
