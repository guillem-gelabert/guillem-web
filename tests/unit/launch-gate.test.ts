import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import path from "node:path";

// ============================================================================
// THIS TEST IS THE WHOLE MECHANISM.
//
// This is the one phase in the milestone that touches real personal facts.
// 06-VALIDATION.md (2026-09-01) records the user's explicit decision: the
// copy gate STAYS BLOCKING, and Phase 6 must NOT flip robots. Three copy
// items are blocking — HOME-01's positioning sentence (lib/work.ts's
// POSITIONING_PLACEHOLDER), the case-study editorial pass (G12, below —
// the one row that cannot be mechanised), and the backlog's COPY_REVIEWED
// (lib/backlog.tsx) — plus three user-supplied facts (the email, the
// LinkedIn URL, the employment history, and the photograph — G3/G4/G5/G6).
// This file is the mechanical enforcement of that choice.
//
// It binds six blocking, mechanisable launch-gate rows (G2, G3, G4, G5,
// G6, G11) to robots: { index: false } on BOTH root layouts as a
// BICONDITIONAL — not a one-directional assertion. While ANY value is
// unfilled, both layouts MUST read index: false; once EVERY value is
// filled, both MUST read index: true. Both branches exist below on
// purpose: an assertion that only ever checked for index: false would let
// someone flip the flag by editing app/(en)/layout.tsx and
// app/(de)/layout.tsx alone, with a placeholder still in place — this test
// makes "flip the flag" and "the values are real" the same commit by
// construction.
//
// It runs in the fast tier (npm run test:unit) on every commit. Nobody has
// to remember to read it, and on failure it names the exact unfilled rows
// rather than raising a bare assertion error — the phase reports blocked
// with the exact failing rows rather than shipping past them.
// ============================================================================

const EN_LAYOUT_PATH = path.join(process.cwd(), "app/(en)/layout.tsx");
const DE_LAYOUT_PATH = path.join(process.cwd(), "app/(de)/layout.tsx");
const EN_LAYOUT_SRC = readFileSync(EN_LAYOUT_PATH, "utf8");
const DE_LAYOUT_SRC = readFileSync(DE_LAYOUT_PATH, "utf8");

const { POSITIONING_PLACEHOLDER } = await import("../../lib/work.ts");
const { EXPERIENCE, PORTRAIT } = await import("../../lib/cv.ts");
const { EMAIL, LINKEDIN } = await import("../../lib/contact.ts");
// lib/backlog.tsx is .tsx — node --test cannot import it
// (ERR_UNKNOWN_FILE_EXTENSION). Reuse the shared source-reader
// tests/build/prerender.test.ts already imports rather than writing a
// second one (06-03-PLAN.md's interfaces block).
const { backlogSource } = await import("./backlog-source.ts");

const COPY_REVIEWED_MATCH = backlogSource.match(/export const COPY_REVIEWED\s*=\s*(true|false)/);
if (!COPY_REVIEWED_MATCH) {
  throw new Error(
    "tests/unit/launch-gate.test.ts could not find `export const COPY_REVIEWED = true|false` " +
      "in lib/backlog.tsx — if the declaration was reformatted, fix this reader, do not delete it.",
  );
}
const COPY_REVIEWED = COPY_REVIEWED_MATCH[1] === "true";

// G6: a declared portrait whose file is missing on disk is NOT filled.
const PORTRAIT_FILE_EXISTS =
  PORTRAIT !== null && existsSync(path.join(process.cwd(), "public", PORTRAIT.src));

type GateCheck = { id: string; filled: boolean; file: string };

const GATES: readonly GateCheck[] = [
  { id: "G2", filled: POSITIONING_PLACEHOLDER !== "Developer.", file: "lib/work.ts" },
  { id: "G3", filled: EXPERIENCE.length > 0, file: "lib/cv.ts" },
  { id: "G4", filled: EMAIL !== null, file: "lib/contact.ts" },
  { id: "G5", filled: LINKEDIN !== null, file: "lib/contact.ts" },
  { id: "G6", filled: PORTRAIT_FILE_EXISTS, file: "lib/cv.ts" },
  { id: "G11", filled: COPY_REVIEWED, file: "lib/backlog.tsx" },
] as const;

const UNFILLED = GATES.filter((gate) => !gate.filled);
const ALL_FILLED = UNFILLED.length === 0;

test("G2-G6, G11: robots is a BICONDITIONAL on the six blocking values, not a one-directional assertion", () => {
  const unfilledMessage = () =>
    `blocked — unfilled rows: ${UNFILLED.map((g) => `${g.id} (${g.file})`).join(", ")}`;

  const layouts: readonly [string, string][] = [
    ["app/(en)/layout.tsx", EN_LAYOUT_SRC],
    ["app/(de)/layout.tsx", DE_LAYOUT_SRC],
  ];

  for (const [name, source] of layouts) {
    if (!ALL_FILLED) {
      assert.match(
        source,
        /robots:\s*\{\s*index:\s*false\s*\}/,
        `${name} must read robots: { index: false } while any blocking value is unfilled — ${unfilledMessage()}`,
      );
    } else {
      assert.match(
        source,
        /robots:\s*\{\s*index:\s*true\s*\}/,
        `${name} must read robots: { index: true } — every blocking value (G2, G3, G4, G5, G6, G11) is now filled`,
      );
    }
  }
});

// Second test: the field appears in exactly two files site-wide — the two
// files a FIND-02 flip must edit. Generalises
// tests/unit/link-contract.test.ts:298 (which asserts app/(en)/page.tsx
// declares none) and is what would catch plan 06-07 accidentally
// absorbing robots into a shared metadata factory.
const SCAN_ROOTS = ["app", "lib"];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")))
      out.push(full);
  }
  return out;
}

const ROBOTS_DECLARATION = /\brobots\s*:/;

const FILES_DECLARING_ROBOTS = SCAN_ROOTS.flatMap((root) => walk(path.join(process.cwd(), root)))
  .filter((file) => ROBOTS_DECLARATION.test(readFileSync(file, "utf8")))
  .sort();

const FLIP_TARGETS = [EN_LAYOUT_PATH, DE_LAYOUT_PATH].sort();

// /type is a deliberately permanent noindex (Phase 1 D-05) — if plan
// 06-07 has landed and given it its own robots: { index: false }
// declaration, that declaration is allowed to exist but is NEVER one of
// the two files a FIND-02 flip edits.
const TYPE_PAGE_PATH = path.join(process.cwd(), "app/(en)/type/page.tsx");

test("robots: is declared in exactly the two root layouts a FIND-02 flip must edit", () => {
  const flipDeclarations = FILES_DECLARING_ROBOTS.filter((file) => FLIP_TARGETS.includes(file));
  assert.equal(
    flipDeclarations.length,
    2,
    `expected robots: in exactly the two root layouts, found: ${FILES_DECLARING_ROBOTS.join(", ")}`,
  );
  assert.deepEqual(flipDeclarations, FLIP_TARGETS);

  const extraDeclarations = FILES_DECLARING_ROBOTS.filter(
    (file) => !FLIP_TARGETS.includes(file),
  );
  for (const extra of extraDeclarations) {
    assert.equal(
      extra,
      TYPE_PAGE_PATH,
      `unexpected robots: declaration outside the two root layouts and /type's permanent noindex: ${extra} — ` +
        "this is what catches a shared metadata factory accidentally absorbing robots (plan 06-07)",
    );
  }
});

// Third test: G12 — the user's editorial pass over both case studies —
// cannot be a code assertion. Recorded instead as a durable row in the
// phase's launch-gate.md, which plan 06-11 writes. Until that file
// exists, this is explicitly skipped rather than silently absent.
test("G12: the case-study editorial pass is recorded as an unticked row in the phase's launch-gate.md", (t) => {
  const LAUNCH_GATE_RECORD = path.join(
    process.cwd(),
    ".planning/phases/06-cv-contact-photo-discoverability/launch-gate.md",
  );
  if (!existsSync(LAUNCH_GATE_RECORD)) {
    t.skip(
      "plan 06-11 owns .planning/phases/06-cv-contact-photo-discoverability/launch-gate.md " +
        "— the file does not exist yet",
    );
    return;
  }
  const record = readFileSync(LAUNCH_GATE_RECORD, "utf8");
  assert.match(
    record,
    /G12/,
    "launch-gate.md must record a G12 row for the case-study editorial pass",
  );
  assert.doesNotMatch(
    record,
    /G12[^\n]*\bticked\b/i,
    "G12 must remain unticked until the user's editorial pass over both case studies is complete",
  );
});
