import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

// Covers WORK-01 / WORK-02 / D-05: the work-list data module is a fixed,
// non-empty tuple, not markup, and every entry is asserted structurally
// against the shape a third entry must keep. The banned-tool-word list is an
// editorial rule (PROJECT.md's allocation principle — engineering is
// demonstrated, never claimed) that would otherwise have no gate at all, and
// the host/href agreement catches a copy-paste that would silently mislabel
// a destination.

const { WORK, CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER } = await import("../../lib/work.ts");
const { BANNED_MARKERS } = await import("../../lib/placeholder.ts");

// Six string fields now, not four. domain and contentType are the two tags
// the "More work" pairs print under the annotation (components/landing/
// more-work.tsx); they are required rather than optional because a pair
// with one tag missing would render a gap where the grammar promises two.
test("WORK has exactly 2 entries, each with six non-empty string fields", () => {
  assert.equal(WORK.length, 2);
  for (const entry of WORK) {
    for (const key of ["title", "annotation", "href", "host", "contentType"] as const) {
      assert.equal(typeof entry[key], "string");
      assert.ok(entry[key].length > 0, `${key} must be non-empty`);
    }
    // domains is a LIST now — a piece can sit in more than one field.
    assert.ok(Array.isArray(entry.domains) && entry.domains.length > 0, "domains must be non-empty");
    for (const field of entry.domains) {
      assert.equal(typeof field, "string");
      assert.ok(field.length > 0, "every domain must be non-empty");
    }
  }
});

// The fifth field, asserted separately because it is the one that is allowed
// to be absent: `shot: null` is a state (the entry renders as type alone),
// not a gap. What must never happen is a half-declared shot — a src with no
// intrinsic pixels reserves no box, and the landing slot caps the image on
// the box's height and lets the width follow the ratio, so a missing or
// wrong width/height is a layout shift rather than a broken image.
test("every shot is either null or fully declared, with real intrinsic pixels", () => {
  for (const entry of WORK) {
    if (entry.shot === null) {
      continue;
    }
    assert.match(entry.shot.src, /^\/[\w./-]+\.png$/, "src must be a root-relative .png path");
    assert.ok(Number.isInteger(entry.shot.width) && entry.shot.width > 0);
    assert.ok(Number.isInteger(entry.shot.height) && entry.shot.height > 0);
    assert.ok(entry.shot.alt.length > 0, "alt must be non-empty — the chart carries the claim");
    if (entry.shot.reveal) {
      assert.match(entry.shot.reveal.src, /^\/[\w./-]+\.png$/, "reveal src must be a root-relative .png path");
      assert.ok(Number.isInteger(entry.shot.reveal.width) && entry.shot.reveal.width > 0);
      assert.ok(Number.isInteger(entry.shot.reveal.height) && entry.shot.reveal.height > 0);
    }
    // The alt describes what the chart SHOWS. Repeating the title would
    // make a screen reader read the same words twice, once from the link
    // above it and once from the image.
    assert.ok(
      !entry.shot.alt.includes(entry.title),
      "alt must not repeat the entry's title — the linked headline already says it",
    );
  }
});

// The committed file has to exist and has to be the size the entry claims:
// the width/height above are what reserve the box, so a re-exported asset
// that changed shape must fail here rather than shift the landing.
test("every declared shot names a committed file whose PNG header matches its pixels", () => {
  for (const entry of WORK) {
    if (entry.shot === null) {
      continue;
    }
    const file = path.join(import.meta.dirname, "..", "..", "public", entry.shot.src);
    const bytes = readFileSync(file);
    // IHDR is the first chunk of every PNG: width and height are big-endian
    // uint32 at byte offsets 16 and 20. Read from the file rather than
    // trusting a build step, and no image library to do it.
    assert.equal(bytes.readUInt32BE(16), entry.shot.width, `${entry.shot.src}: width`);
    assert.equal(bytes.readUInt32BE(20), entry.shot.height, `${entry.shot.src}: height`);
    if (entry.shot.reveal) {
      const revealFile = path.join(import.meta.dirname, "..", "..", "public", entry.shot.reveal.src);
      const revealBytes = readFileSync(revealFile);
      assert.equal(revealBytes.readUInt32BE(16), entry.shot.reveal.width, `${entry.shot.reveal.src}: width`);
      assert.equal(revealBytes.readUInt32BE(20), entry.shot.reveal.height, `${entry.shot.reveal.src}: height`);
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
    // Every string the entry carries, flattened — NOT Object.values(entry),
    // which now yields a WorkShot object (or null) for the fifth field and
    // threw on .includes. The shot's own strings are swept too: an asset
    // path or an alt line is as capable of naming the private repo as the
    // href is.
    const strings = [
      entry.title,
      entry.annotation,
      entry.href,
      entry.host,
      ...(entry.shot === null ? [] : [entry.shot.src, entry.shot.alt]),
    ];
    for (const value of strings) {
      assert.ok(!value.includes("ib-gdp-evolution"));
    }
  }
});

test("every body is exactly two non-empty single-line paragraphs", () => {
  for (const entry of WORK) {
    assert.equal(entry.body.length, 2);
    for (const paragraph of entry.body) {
      assert.equal(typeof paragraph, "string");
      assert.ok(paragraph.length > 0, "a body paragraph must be non-empty");
      assert.ok(!/[\n\r]/.test(paragraph), "a body paragraph is one block, no line breaks");
    }
  }
});

test("every stack entry is a non-empty tag; the stack may be empty", () => {
  for (const entry of WORK) {
    assert.ok(Array.isArray(entry.stack));
    for (const tool of entry.stack) {
      assert.equal(typeof tool, "string");
      assert.ok(tool.length > 0);
    }
  }
});

test("every tag is one short phrase — no sentence punctuation, no line breaks", () => {
  for (const entry of WORK) {
    for (const tag of [...entry.domains, entry.contentType, ...entry.stack]) {
      // A dot INSIDE a tag is a name (three.js); one at the end is a sentence.
      assert.ok(!/[\n\r]/.test(tag) && !/\.$/.test(tag), `tag must not end in a full stop or carry a line break: "${tag}"`);
      assert.ok(tag.split(/\s+/).length <= 3, `tag must be at most three words: "${tag}"`);
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
    // The body paragraphs are swept with the annotation: the copy describes
    // the piece, and the stack field is the one place a tool is named.
    for (const copy of [entry.annotation, ...entry.body]) {
      for (const token of bannedTokens) {
        const pattern = new RegExp("\\b" + token + "\\b", "iu");
        assert.ok(
          !pattern.test(copy),
          `copy must not name a tool (WORK-02, D-09): found "${token}" in "${copy}"`,
        );
      }
      for (const phrase of bannedPhrases) {
        assert.ok(
          !copy.toLowerCase().includes(phrase),
          `copy must not name a tool (WORK-02, D-09): found "${phrase}" in "${copy}"`,
        );
      }
    }
  }
});

test("CASE_STUDY_SLUG matches the SAFE_SLUG shape", () => {
  // Restated literally rather than imported: SAFE_SLUG is module-local in
  // lib/content.ts.
  const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  assert.match(CASE_STUDY_SLUG, SAFE_SLUG);
});

// BANNED_MARKERS, not a literal list: while lib/placeholder.ts's
// PLACEHOLDER_CONTENT is true this permits the lorem stand-in the sentence
// currently ships, and the moment that flag goes false the same assertion
// starts demanding the lorem be gone. The four apology markers are banned
// either way — those never become acceptable, because they tell a reader
// the site is broken rather than that the copy is pending.
test("POSITIONING_PLACEHOLDER is a non-empty string with no rendered-marker word", () => {
  assert.ok(POSITIONING_PLACEHOLDER.length > 0);
  for (const marker of BANNED_MARKERS) {
    assert.ok(
      !POSITIONING_PLACEHOLDER.toLowerCase().includes(marker.toLowerCase()),
      `POSITIONING_PLACEHOLDER must not contain "${marker}"`,
    );
  }
});

// The rendered output of these entries is deliberately NOT asserted here —
// that is tests/landing.spec.ts's job in Plan 06.
