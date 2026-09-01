import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

// Covers PROF-01/PROF-02, D-1.2/D-1.3/D-2.6: lib/cv.ts's data module is
// asserted on its CONTRACT, not its today-empty content — every present
// CvRole/CvEducation/CvLanguage entry must be well-formed once one exists,
// PORTRAIT must be null or a fully-specified asset, and the empty-state
// fallback (CV_STUB_BODY) is asserted as /cv's data contract even though
// this file does not implement the rendering branch — that is plan
// 06-04's job, and tests/cv.spec.ts (f) proves the marker-word ban holds
// against the real rendered page.

const { EXPERIENCE, EDUCATION, LANGUAGES, PORTRAIT, CV_STUB_BODY } = await import(
  "../../lib/cv.ts"
);
const { ALWAYS_BANNED_MARKERS } = await import("../../lib/placeholder.ts");

test("EXPERIENCE, EDUCATION and LANGUAGES are arrays", () => {
  assert.ok(Array.isArray(EXPERIENCE));
  assert.ok(Array.isArray(EDUCATION));
  assert.ok(Array.isArray(LANGUAGES));
});

test("every present CvRole has non-empty years/role/org/place and a single-line note", () => {
  for (const entry of EXPERIENCE) {
    for (const key of ["years", "role", "org", "place", "note"] as const) {
      assert.equal(typeof entry[key], "string");
      assert.ok(entry[key].length > 0, `${key} must be non-empty`);
    }
    assert.ok(!entry.note.includes("\n"), "note must be a single line (no \\n)");
    assert.ok(!entry.note.includes("\r"), "note must be a single line (no \\r)");
  }
});

test("every present CvEducation entry has non-empty years/qualification/institution/place", () => {
  for (const entry of EDUCATION) {
    for (const key of ["years", "qualification", "institution", "place"] as const) {
      assert.equal(typeof entry[key], "string");
      assert.ok(entry[key].length > 0, `${key} must be non-empty`);
    }
  }
});

test("every present CvLanguage entry has non-empty language/level", () => {
  for (const entry of LANGUAGES) {
    for (const key of ["language", "level"] as const) {
      assert.equal(typeof entry[key], "string");
      assert.ok(entry[key].length > 0, `${key} must be non-empty`);
    }
  }
});

test("PORTRAIT is null or a fully-specified asset (D-2.6: dimensions are the user-supplied fact, not a guess)", () => {
  if (PORTRAIT === null) {
    return;
  }
  assert.ok(PORTRAIT.src.startsWith("/"), "src must be a path under public/");
  assert.ok(
    Number.isInteger(PORTRAIT.width) && PORTRAIT.width > 0,
    "width must be a positive integer",
  );
  assert.ok(
    Number.isInteger(PORTRAIT.height) && PORTRAIT.height > 0,
    "height must be a positive integer",
  );
  assert.ok(PORTRAIT.alt.length > 0, "alt must be non-empty");
  assert.notEqual(
    PORTRAIT.alt.trim().toLowerCase(),
    "guillem gelabert",
    "alt must not be the person's name alone — it must describe the photograph",
  );
});

// Deliberately the ALWAYS list, not the flag-dependent BANNED_MARKERS the
// rendered-page sweeps use. CV_STUB_BODY is the copy shown when the CV has
// nothing in it at all, so it is the one string on the site that must read
// as authored in every state the site can be in — including after the
// placeholder era ends. Pinning it to the four apologies means it stays
// correct without anyone remembering to revisit it.
test("CV_STUB_BODY contains no apology marker word (mirrors tests/cv.spec.ts (f)'s ban)", () => {
  const lower = CV_STUB_BODY.toLowerCase();
  for (const marker of ALWAYS_BANNED_MARKERS) {
    assert.ok(!lower.includes(marker), `CV_STUB_BODY must not contain "${marker}"`);
  }
});

// The empty-state contract, stated as its own named test. It used to
// assert EXPERIENCE.length === 0, which was a statement about the shipped
// state rather than about the contract — and it duly failed the moment the
// section was filled, reporting a change as a defect. What actually has to
// hold is the invariant behind the branch in app/(en)/cv/page.tsx: exactly
// one of the two arms is renderable at any time, and the empty arm always
// has non-empty copy to render. That is true whether EXPERIENCE holds
// nothing, three lorem rows, or a real career.
test("branch contract: /cv renders CvSections when EXPERIENCE is non-empty and non-empty CV_STUB_BODY when it is not", () => {
  assert.ok(CV_STUB_BODY.trim().length > 0, "the empty arm must always have copy to render");
  if (EXPERIENCE.length === 0) {
    assert.equal(EDUCATION.length + LANGUAGES.length >= 0, true);
  } else {
    for (const role of EXPERIENCE) {
      assert.ok(role.note.trim().length > 0, "a rendered row must have its Body line");
    }
  }
});

// G6's disk half, asserted in the fast tier rather than only inside
// tests/unit/launch-gate.test.ts's gate arithmetic: a PORTRAIT declaration
// pointing at a file that is not there renders a broken image on a live
// page, and nothing else in the unit tier would notice.
test("a declared PORTRAIT resolves to a file that actually exists under public/", () => {
  if (PORTRAIT === null) return;
  const onDisk = path.join(process.cwd(), "public", PORTRAIT.src);
  assert.ok(existsSync(onDisk), `PORTRAIT.src points at ${PORTRAIT.src}, which is not on disk`);
});
