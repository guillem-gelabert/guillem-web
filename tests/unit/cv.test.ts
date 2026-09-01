import assert from "node:assert/strict";
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

test("CV_STUB_BODY contains no placeholder marker word (mirrors tests/cv.spec.ts (f)'s ban)", () => {
  const markers = ["todo", "placeholder", "coming soon", "under construction", "lorem", "tbd"];
  const lower = CV_STUB_BODY.toLowerCase();
  for (const marker of markers) {
    assert.ok(!lower.includes(marker), `CV_STUB_BODY must not contain "${marker}"`);
  }
});

// The empty-state contract, stated as its own named test: with EXPERIENCE
// empty (today's shipped state), /cv's data contract is to render
// CV_STUB_BODY — never an empty <section>, never a visible marker. This
// file owns the data half; plan 06-04 implements the rendering branch and
// tests/cv.spec.ts proves it in the browser.
test("empty-state contract: EXPERIENCE.length === 0 today, and CV_STUB_BODY is the non-empty fallback /cv must render", () => {
  assert.equal(EXPERIENCE.length, 0);
  assert.ok(CV_STUB_BODY.length > 0);
});
