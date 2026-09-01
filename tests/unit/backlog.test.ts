import assert from "node:assert/strict";
import { test } from "node:test";
import { BACKLOG_MODULE, backlogSource, LAST_TOUCHED } from "./backlog-source.ts";

// Covers BACK-01 / BACK-02 / D-02 / D-06 / D-07 / D-09.1 / D-14 at the repo
// tier, by reading lib/backlog.tsx as SOURCE TEXT — never by importing it.
// `node --test` cannot import a .tsx file (ERR_UNKNOWN_FILE_EXTENSION,
// reproduced on Node 22.20); see tests/unit/backlog-source.ts for the full
// reasoning. Every assertion below reads backlogSource / LAST_TOUCHED from
// that shared reader.

// Strip comments before anything else touches the text, so a comment can
// never satisfy or break an assertion below (precedent: css-source.ts).
// Both /* */ and // are stripped here, unlike css-source.ts, because
// lib/backlog.tsx (TypeScript, not CSS) uses // line comments throughout.
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const strippedSource = stripComments(backlogSource);

// Scoped to the BACKLOG array literal specifically, not the whole module.
// Applying the banned-tool-token check (below) to the ENTIRE file would
// false-positive on `import type { ReactNode } from "react";` — the bare
// string "react" trips the case-insensitive \bReact\b pattern even though
// it is an import path, not copy. D-14's rule is about what the copy says,
// so the scope is the array text that holds that copy.
const BACKLOG_START_MARKER = "export const BACKLOG:";
const LAST_TOUCHED_START_MARKER = "export const LAST_TOUCHED";
const backlogArrayStart = strippedSource.indexOf(BACKLOG_START_MARKER);
const backlogArrayEnd = strippedSource.indexOf(LAST_TOUCHED_START_MARKER);
assert.ok(
  backlogArrayStart !== -1,
  `${BACKLOG_MODULE}: could not find "${BACKLOG_START_MARKER}" — if the declaration was reformatted, fix this test, do not delete it`,
);
assert.ok(
  backlogArrayEnd !== -1 && backlogArrayEnd > backlogArrayStart,
  `${BACKLOG_MODULE}: could not find "${LAST_TOUCHED_START_MARKER}" after the BACKLOG array — if the declaration was reformatted, fix this test, do not delete it`,
);
const backlogArrayText = strippedSource.slice(backlogArrayStart, backlogArrayEnd);

test("LAST_TOUCHED matches the ISO YYYY-MM-DD shape", () => {
  assert.match(LAST_TOUCHED, /^\d{4}-\d{2}-\d{2}$/);
});

test("LAST_TOUCHED is a real calendar date, not just shape-valid", () => {
  // Shape is not validity — 2026-02-31 passes the regex above and rolls
  // silently to 2026-03-03 (mirrors the trap lib/content.ts:46-61 and
  // lib/backlog.tsx's own validator both document).
  const roundTripped = new Date(`${LAST_TOUCHED}T00:00:00Z`).toISOString().slice(0, 10);
  assert.equal(roundTripped, LAST_TOUCHED, `LAST_TOUCHED "${LAST_TOUCHED}" is not a real calendar date`);
});

test("LAST_TOUCHED is not in the future (36h grace)", () => {
  // Independent re-implementation of lib/backlog.tsx's own build-time
  // check (D-09.1), not a duplication smell — the .tsx blocker (node
  // --test cannot import .tsx) makes this a genuinely separate
  // implementation of the same rule, which is D-09's stated intent: two
  // guards on one fact. +36h, not 0 (Pitfall 4): LAST_TOUCHED is authored
  // in local time (CEST = UTC+2) while this check may run in UTC, so a
  // strict comparison would fail a legitimate late-evening edit. 36h still
  // rejects a date genuinely a day or more in the future.
  const parsed = new Date(`${LAST_TOUCHED}T00:00:00Z`);
  const graceMs = 36 * 60 * 60 * 1000;
  assert.ok(
    parsed.getTime() <= Date.now() + graceMs,
    `LAST_TOUCHED "${LAST_TOUCHED}" is in the future`,
  );
});

test("COPY_REVIEWED literal is false (D-14 tripwire, asserted from source)", () => {
  const match = strippedSource.match(/export const COPY_REVIEWED\s*=\s*(true|false)/);
  assert.ok(match, `${BACKLOG_MODULE}: could not find "export const COPY_REVIEWED = true|false"`);
  assert.equal(
    match![1],
    "false",
    "COPY_REVIEWED must stay false until the author's editorial pass (D-14) — do not flip this in an unrelated plan",
  );
});

test("BACKLOG declares exactly 3 items (D-02), counted from source", () => {
  // Counting technique that cannot be fooled by a comment: count
  // occurrences of the item-object marker (the `name:` field at the
  // array's own indentation) after stripping comments — precedent:
  // css-source.ts strips comments before anything else touches the text.
  const itemStarts = [...backlogArrayText.matchAll(/^ {2}\{$/gm)];
  const nameFields = [...backlogArrayText.matchAll(/^ {4}name:/gm)];
  // Asserted exactly, not a range — three is what shipped (D-02), and a
  // fourth item entering means an existing one leaves.
  assert.equal(itemStarts.length, 3, "BACKLOG must declare exactly 3 items (D-02)");
  assert.equal(nameFields.length, 3, "BACKLOG must declare exactly 3 `name:` fields (D-02)");
});

test("every item has a non-empty name and description, and no item declares a third field", () => {
  // Split the array text on each item's opening brace (2-space indent).
  // The first segment is the array-literal prefix ("= [\n") and is
  // discarded; each remaining segment is one item's body running through
  // to just before the next item's opening brace (or the array's close).
  const itemChunks = backlogArrayText.split(/^ {2}\{$/m).slice(1);
  assert.equal(itemChunks.length, 3, "expected exactly 3 item chunks (D-02)");

  // Every field key declared at the item's own indentation, across all
  // items — used to prove no item declares a third field (D-06) without
  // having to name every possible forbidden key.
  const allFieldKeys = [...backlogArrayText.matchAll(/^ {4}([a-zA-Z]+):/gm)].map((m) => m[1]);
  assert.equal(
    allFieldKeys.length,
    itemChunks.length * 2,
    `expected exactly 2 fields per item (name, description) across ${itemChunks.length} items; found ${allFieldKeys.length} field declarations — an item may declare a third field`,
  );
  for (const key of allFieldKeys) {
    assert.ok(
      key === "name" || key === "description",
      `BacklogItem field "${key}" is not name or description (D-06) — no date, status, state, tag, progress, href or ordinal field is permitted`,
    );
  }
  // Named explicitly too, for a legible failure message if one appears.
  const forbiddenFields = ["date", "status", "state", "tag", "progress", "href", "ordinal"];
  for (const forbidden of forbiddenFields) {
    assert.ok(
      !allFieldKeys.includes(forbidden),
      `BacklogItem must not declare a "${forbidden}" field (D-06/D-07)`,
    );
  }

  for (const [index, chunk] of itemChunks.entries()) {
    const nameMatch = chunk.match(/name:\s*"([^"]*)"/);
    assert.ok(nameMatch, `item ${index + 1}: could not find a name field`);
    assert.ok(nameMatch![1].trim().length > 0, `item ${index + 1}: name must be non-empty`);

    // description was a JSX fragment (`description: (<>…</>)`) until
    // 2026-09-01 and is now a plain string literal, possibly split across
    // several concatenated lines to stay inside the line-length budget.
    // Items can arrive over HTTP from lib/backlog-store.ts, and a ReactNode
    // is not something a JSON body can carry — nor something that should be
    // rendered from an outside caller. The assertion follows the shape:
    // string literals, joined, non-empty.
    assert.match(
      chunk,
      /description:\s*\n?\s*"/,
      `item ${index + 1}: description must be a string literal (it stopped being JSX on 2026-09-01)`,
    );
    assert.doesNotMatch(
      chunk,
      /description:\s*\(/,
      `item ${index + 1}: description must not be a JSX expression — items also come from the ` +
        "database now, and only one of the two shapes can be rendered from both sources",
    );

    const descriptionText = [
      ...chunk.slice(chunk.indexOf("description:")).matchAll(/"((?:[^"\\]|\\.)*)"/g),
    ]
      .map((m) => m[1])
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    assert.ok(descriptionText.length > 0, `item ${index + 1}: description must be non-empty`);
  }
});

test("no <strong> appears in the module (Pitfall 1)", () => {
  // Tailwind v4 preflight ships b,strong{font-weight:bolder}, which
  // resolves to 700 outside .prose-site — a third weight on screen while
  // every globals.css source-budget test stays green (05-RESEARCH.md
  // Q3). <em> is the sanctioned inline emphasis element (D-08).
  assert.ok(!strippedSource.includes("<strong"), `${BACKLOG_MODULE} must not use <strong> (Pitfall 1)`);
});

test("no href, no github.com, no target=\"_blank\" appears anywhere in the module (D-07)", () => {
  // D-07: no href field on an item, deliberately — none of the three
  // shipped items has a public artifact to link to (05-RESEARCH.md Q3),
  // and the site-wide rule bans github.com and target="_blank" outright.
  assert.ok(!strippedSource.includes("href="), `${BACKLOG_MODULE} must not declare an href (D-07)`);
  assert.ok(!strippedSource.includes("github.com"), `${BACKLOG_MODULE} must not link to github.com`);
  assert.ok(
    !strippedSource.includes('target="_blank"'),
    `${BACKLOG_MODULE} must not open a link in a new window`,
  );
});

test("no description names a tool, language or framework (D-14, work.test.ts:56-58's lists)", () => {
  // Reused by copying the lists, not by importing them from lib/work.ts —
  // the plan explicitly does not modify lib/work.ts in this plan.
  // Scoped to the BACKLOG array text (backlogArrayText), not the whole
  // module: applying this to the whole file would false-positive on
  // `import type { ReactNode } from "react";`, since \bReact\b matches
  // the bare string "react" case-insensitively.
  const bannedTokens = ["React", "Next", "D3", "TypeScript", "JavaScript", "Svelte", "WebGL", "Python"];
  const bannedPhrases = ["built with", "powered by"];

  for (const token of bannedTokens) {
    const pattern = new RegExp("\\b" + token + "\\b", "iu");
    assert.ok(
      !pattern.test(backlogArrayText),
      `no backlog item may name a tool (D-14): found "${token}" in the BACKLOG array`,
    );
  }
  for (const phrase of bannedPhrases) {
    assert.ok(
      !backlogArrayText.toLowerCase().includes(phrase),
      `no backlog item may name a tool (D-14): found "${phrase}" in the BACKLOG array`,
    );
  }
});
