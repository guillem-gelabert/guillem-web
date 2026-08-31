import { readFileSync } from "node:fs";
import path from "node:path";

// Shared reader for lib/backlog.tsx, used by backlog.test.ts and
// backlog-freshness.test.ts so both read the same source text and parse
// LAST_TOUCHED the same way.
//
// Deliberately NOT named *.test.ts — `npm run test:unit` globs
// `tests/unit/*.test.ts`, and Node exits non-zero on a suite with zero
// tests. Do not rename it. (Precedent: ./css-source.ts, ./case-study-source.ts)
//
// This file exists at all because `node --test` cannot import a .tsx file
// (ERR_UNKNOWN_FILE_EXTENSION, reproduced on Node 22.20 — Node's built-in
// type stripping registers .ts/.mts/.cts only, and JSX requires
// transformation rather than erasure). D-05 locks lib/backlog.tsx as .tsx
// and D-09 locks a node --test check that reads LAST_TOUCHED from it.
// Reading the module as source text satisfies both without a loader
// dependency (tsx / ts-node / esbuild-register) and without splitting the
// module — exactly the technique tests/unit/link-contract.test.ts:265-267
// already uses against app/(en)/page.tsx.

export const BACKLOG_MODULE = "lib/backlog.tsx";

const BACKLOG_MODULE_PATH = path.join(process.cwd(), BACKLOG_MODULE);

export const backlogSource = readFileSync(BACKLOG_MODULE_PATH, "utf8");

// The parse must throw, never return null/undefined. A regex that quietly
// stops matching after a reformat would turn every downstream assertion —
// in backlog.test.ts and backlog-freshness.test.ts alike — into a vacuous
// pass, which is the exact failure this whole guard exists to prevent.
function parseLastTouched(source: string): string {
  const match = source.match(/export const LAST_TOUCHED\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/);
  if (!match) {
    throw new Error(
      `tests/unit/backlog-source.ts could not find ` +
        `\`export const LAST_TOUCHED = "YYYY-MM-DD"\` in ${BACKLOG_MODULE} — ` +
        "if the declaration was reformatted, fix this reader, do not delete it.",
    );
  }
  return match[1]!;
}

export const LAST_TOUCHED = parseLastTouched(backlogSource);
