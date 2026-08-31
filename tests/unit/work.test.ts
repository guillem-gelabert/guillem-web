import assert from "node:assert/strict";
import { test } from "node:test";

// Covers WORK-01 / WORK-02 / D-05: the work-list data module is a fixed,
// non-empty tuple, not markup, and every entry is asserted structurally
// against the shape a third entry must keep. The banned-tool-word list is an
// editorial rule (PROJECT.md's allocation principle — engineering is
// demonstrated, never claimed) that would otherwise have no gate at all, and
// the host/href agreement catches a copy-paste that would silently mislabel
// a destination.

const { WORK, CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER } = await import("../../lib/work.ts");

test("WORK has exactly 2 entries, each with four non-empty string fields", () => {
  assert.equal(WORK.length, 2);
  for (const entry of WORK) {
    for (const key of ["title", "annotation", "href", "host"] as const) {
      assert.equal(typeof entry[key], "string");
      assert.ok(entry[key].length > 0, `${key} must be non-empty`);
    }
  }
});

test("every href is absolute and https", () => {
  for (const entry of WORK) {
    const url = new URL(entry.href);
    assert.equal(url.protocol, "https:");
  }
});

test("every href's hostname agrees with its host field", () => {
  for (const entry of WORK) {
    assert.equal(new URL(entry.href).hostname, entry.host);
  }
});

test("no entry links to or names the private ib-gdp-evolution repo", () => {
  for (const entry of WORK) {
    const hostname = new URL(entry.href).hostname;
    assert.ok(hostname !== "github.com" && !hostname.endsWith(".github.com"));
    for (const value of Object.values(entry)) {
      assert.ok(!value.includes("ib-gdp-evolution"));
    }
  }
});

test("every annotation is a single line", () => {
  for (const entry of WORK) {
    assert.ok(!entry.annotation.includes("\n"));
    assert.ok(!entry.annotation.includes("\r"));
  }
});

test("no annotation names a tool, language or framework (WORK-02, D-09)", () => {
  const bannedTokens = ["React", "Next", "D3", "TypeScript", "JavaScript", "Svelte", "WebGL", "Python"];
  const bannedPhrases = ["built with", "powered by"];

  for (const entry of WORK) {
    for (const token of bannedTokens) {
      const pattern = new RegExp("\\b" + token + "\\b", "iu");
      assert.ok(
        !pattern.test(entry.annotation),
        `annotation must not name a tool (WORK-02, D-09): found "${token}" in "${entry.annotation}"`,
      );
    }
    for (const phrase of bannedPhrases) {
      assert.ok(
        !entry.annotation.toLowerCase().includes(phrase),
        `annotation must not name a tool (WORK-02, D-09): found "${phrase}" in "${entry.annotation}"`,
      );
    }
  }
});

test("CASE_STUDY_SLUG matches the SAFE_SLUG shape", () => {
  // Restated literally rather than imported: SAFE_SLUG is module-local in
  // lib/content.ts.
  const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  assert.match(CASE_STUDY_SLUG, SAFE_SLUG);
});

test("POSITIONING_PLACEHOLDER is a non-empty string with no rendered-marker word", () => {
  assert.ok(POSITIONING_PLACEHOLDER.length > 0);
  const markers = ["TODO", "placeholder", "TBD", "Coming soon", "Under construction", "Lorem"];
  for (const marker of markers) {
    assert.ok(!POSITIONING_PLACEHOLDER.toLowerCase().includes(marker.toLowerCase()));
  }
});

// The rendered output of these entries is deliberately NOT asserted here —
// that is tests/landing.spec.ts's job in Plan 06.
