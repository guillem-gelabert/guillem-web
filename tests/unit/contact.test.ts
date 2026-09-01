import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import path from "node:path";

// Covers PROF-03/04/05, D-2.1/D-2.2: lib/contact.ts's data module and its
// channel-assembly helper (channels()) are asserted on their CONTRACT.
// The load-bearing property — the null-channel omission rule
// (components/language-switch.tsx's null-rather-than-disabled pattern) —
// is proven across all four EMAIL/LINKEDIN null/set combinations, not
// only today's shipped state, by passing values into channels() rather
// than mutating the module.

const { EMAIL, LINKEDIN, GITHUB, channels } = await import("../../lib/contact.ts");

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

test("GITHUB is a well-formed, non-null https://github.com/ URL — established fact, not a gated absence", () => {
  assert.ok(
    GITHUB !== null && GITHUB !== undefined,
    "GITHUB must never be null: it is established from the git remote, not user-supplied — a future null here is a regression, not an absence",
  );
  const url = new URL(GITHUB);
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "github.com");
});

test("EMAIL is null or a single-@ address shape", () => {
  if (EMAIL === null) {
    return;
  }
  assert.match(EMAIL, EMAIL_SHAPE);
  assert.equal(EMAIL.split("@").length, 2, "EMAIL must contain exactly one @");
});

test("LINKEDIN is null or an https:// URL whose host is/ends linkedin.com", () => {
  if (LINKEDIN === null) {
    return;
  }
  const url = new URL(LINKEDIN);
  assert.equal(url.protocol, "https:");
  assert.ok(
    url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com"),
    `LINKEDIN host "${url.hostname}" must be or end in linkedin.com`,
  );
});

test("channels() returns the fixed Email, GitHub, LinkedIn order when both EMAIL and LINKEDIN are set", () => {
  const result = channels("person@example.com", "https://www.linkedin.com/in/person");
  assert.equal(result.length, 3);
  assert.deepEqual(
    result.map((c) => c.label),
    ["Email", "GitHub", "LinkedIn"],
  );
});

test("channels() omits Email when EMAIL is null — two entries, not three with one empty", () => {
  const result = channels(null, "https://www.linkedin.com/in/person");
  assert.equal(result.length, 2);
  assert.deepEqual(
    result.map((c) => c.label),
    ["GitHub", "LinkedIn"],
  );
});

test("channels() omits LinkedIn when LINKEDIN is null — two entries, not three with one empty", () => {
  const result = channels("person@example.com", null);
  assert.equal(result.length, 2);
  assert.deepEqual(
    result.map((c) => c.label),
    ["Email", "GitHub"],
  );
});

test("channels() omits both Email and LinkedIn when both are null — GitHub alone, one entry not three", () => {
  const result = channels(null, null);
  assert.equal(result.length, 1);
  assert.deepEqual(
    result.map((c) => c.label),
    ["GitHub"],
  );
});

test("channels() with no arguments returns exactly the module's own shipped state", () => {
  const result = channels();
  const expectedLabels = (
    [EMAIL !== null ? "Email" : null, "GitHub", LINKEDIN !== null ? "LinkedIn" : null] as const
  ).filter((label): label is "Email" | "GitHub" | "LinkedIn" => label !== null);
  assert.deepEqual(
    result.map((c) => c.label),
    expectedLabels,
  );
});

// D-2.1 / 06-CONTEXT.md's no-fabrication rule: a dead affordance is worse
// than no affordance — there must be no "disabled" or "coming soon"
// branch anywhere in the assembly path. Source-scanned because this is
// where the rule is enforceable cheaply (mirrors
// tests/unit/backlog-source.ts's source-scrape technique, applied here to
// a plain .ts module rather than a .tsx one).
const CONTACT_MODULE_PATH = path.join(process.cwd(), "lib/contact.ts");
const contactSource = readFileSync(CONTACT_MODULE_PATH, "utf8");

test("lib/contact.ts contains no disabled/coming-soon branch anywhere in the assembly path", () => {
  const lower = contactSource.toLowerCase();
  assert.ok(!lower.includes("disabled"), 'source must not contain "disabled"');
  assert.ok(!lower.includes("coming soon"), 'source must not contain "coming soon"');
});
