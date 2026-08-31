import { readFileSync } from "node:fs";
import path from "node:path";

// The shared, nesting-aware app/globals.css parser. Extracted from
// prose-contract.test.ts (WR-13's fix) so link-contract.test.ts can enforce
// the same source-fact budget over a different selector set without
// re-deriving the parser.
//
// Deliberately NOT named *.test.ts — `npm run test:unit` globs
// `tests/unit/*.test.ts`, and Node exits non-zero on a suite with zero
// tests. Renaming this file would silently turn it into a failing (or
// worse, silently red-and-ignored) phantom test suite. Do not rename it.

const CSS_PATH = path.join(process.cwd(), "app/globals.css");
const rawCss = readFileSync(CSS_PATH, "utf8");

// Strip comments before anything else touches the text, so a comment can
// never satisfy or break an assertion below.
export const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");

export type Block = { selector: string; body: string };

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
export function extractBlocks(text: string, parent = ""): Block[] {
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
export function ownDeclarationText(body: string): string {
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
export function splitDeclarations(text: string): string[] {
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

export function declarationsOf(block: Block): Array<[string, string]> {
  return splitDeclarations(ownDeclarationText(block.body))
    .map((d) => d.trim())
    .filter((d) => d.includes(":"))
    .map((d) => {
      const idx = d.indexOf(":");
      return [d.slice(0, idx).trim(), d.slice(idx + 1).trim()] as [string, string];
    });
}

export function valuesOf(property: string, blocks: Block[]): string[] {
  const values: string[] = [];
  for (const block of blocks) {
    for (const [prop, value] of declarationsOf(block)) {
      if (prop === property) values.push(value);
    }
  }
  return values;
}

export const allBlocks = extractBlocks(css);

// The set of every individual (comma-split, trimmed) selector across every
// block in the file — used for exact-selector presence checks.
export const allSelectors = new Set(
  allBlocks.flatMap((b) => b.selector.split(",").map((s) => s.trim())),
);
