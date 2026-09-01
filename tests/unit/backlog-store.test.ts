import assert from "node:assert/strict";
import { test } from "node:test";

// The write API's boundary logic, tested without a database.
//
// validateItem() is deliberately pure and exported for exactly this: it is the
// only thing standing between an HTTP body and a row that renders on a live
// job-hunting site, and it must be provable without provisioning Postgres in
// CI. The database-touching half (addItem, deleteItem, the ceiling
// transaction) is not covered here — it needs a real connection, and a mocked
// pg would be asserting against the mock rather than against Postgres. What is
// covered is every rejection a caller can trigger.

// lib/backlog-validate.ts, NOT lib/backlog-store.ts: the store imports
// lib/backlog.tsx for the seed, and `node --test` cannot load a .tsx file
// (ERR_UNKNOWN_FILE_EXTENSION). That is exactly why the pure half is a module
// of its own — see its header.
const { validateItem, MAX_ITEMS, MAX_NAME_LENGTH, MAX_DESCRIPTION_LENGTH } = await import(
  "../../lib/backlog-validate.ts"
);

const valid = { name: "A study of ferry timetables", description: "One paragraph about the work." };

test("a well-formed item is accepted and returned normalised", () => {
  const result = validateItem(valid);
  assert.equal(result.ok, true);
  assert.deepEqual(result.ok && result.value, valid);
});

test("whitespace is collapsed, not merely trimmed — a here-doc's newlines must not reach the database", () => {
  const result = validateItem({
    name: "  Spaced   out  ",
    description: "One line.\n\n   Then another,\tafter a tab.",
  });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.value.name, "Spaced out");
  assert.equal(result.ok && result.value.description, "One line. Then another, after a tab.");
});

test("a non-object body is rejected outright, with one error rather than a list", () => {
  for (const body of ["a string", 42, null, true, ["an", "array"]]) {
    const result = validateItem(body);
    assert.equal(result.ok, false, `${JSON.stringify(body)} must be rejected`);
    assert.deepEqual(result.ok === false && result.errors, ["body must be a JSON object"]);
  }
});

test("both fields are required, and BOTH errors come back from one call", () => {
  // Collect-then-return, not throw-on-first: a caller fixing a malformed
  // request should see everything wrong with it at once rather than
  // discovering the second problem after fixing the first.
  const result = validateItem({});
  assert.equal(result.ok, false);
  const errors = result.ok === false ? result.errors : [];
  assert.equal(errors.length, 2);
  assert.ok(errors.some((e) => e.startsWith("name")));
  assert.ok(errors.some((e) => e.startsWith("description")));
});

test("an empty or whitespace-only field is rejected", () => {
  for (const blank of ["", "   ", "\n\t "]) {
    const result = validateItem({ ...valid, name: blank });
    assert.equal(result.ok, false, `name ${JSON.stringify(blank)} must be rejected`);
    assert.ok((result.ok === false ? result.errors : []).some((e) => e.includes("must not be empty")));
  }
});

test("a non-string field is rejected rather than coerced", () => {
  for (const value of [42, null, {}, [], true]) {
    const result = validateItem({ ...valid, description: value });
    assert.equal(result.ok, false, `description ${JSON.stringify(value)} must be rejected`);
  }
});

test("D-06: a third field is named in the error, not silently dropped", () => {
  // Dropping it quietly would let the caller's misunderstanding survive a 201.
  // Every one of these is a field the backlog deliberately does not have.
  for (const extra of ["href", "status", "date", "tag", "ordinal", "id"]) {
    const result = validateItem({ ...valid, [extra]: "x" });
    assert.equal(result.ok, false, `${extra} must be rejected`);
    assert.ok(
      (result.ok === false ? result.errors : []).some((e) => e.includes(extra)),
      `the error must name "${extra}"`,
    );
  }
});

test("length caps are enforced at the boundary, and the error reports the actual length", () => {
  const longName = "x".repeat(MAX_NAME_LENGTH + 1);
  const nameResult = validateItem({ ...valid, name: longName });
  assert.equal(nameResult.ok, false);
  assert.ok(
    (nameResult.ok === false ? nameResult.errors : []).some((e) =>
      e.includes(String(MAX_NAME_LENGTH + 1)),
    ),
  );

  // Exactly at the cap is allowed — an off-by-one here would reject a
  // legitimate item with a message claiming it is too long.
  assert.equal(validateItem({ ...valid, name: "x".repeat(MAX_NAME_LENGTH) }).ok, true);
  assert.equal(
    validateItem({ ...valid, description: "x".repeat(MAX_DESCRIPTION_LENGTH) }).ok,
    true,
  );
  assert.equal(
    validateItem({ ...valid, description: "x".repeat(MAX_DESCRIPTION_LENGTH + 1) }).ok,
    false,
  );
});

test("control characters are rejected — they are invisible in every review surface", () => {
  // Not an escaping risk (React escapes everything), which is exactly why they
  // need rejecting at the boundary: nothing downstream will show them to a
  // human who could notice.
  for (const ch of ["\u0000", "\u0007", "\u001b", "\u007f", "\u0085"]) {
    const result = validateItem({ ...valid, name: `Study${ch}of ferries` });
    assert.equal(result.ok, false, `${JSON.stringify(ch)} must be rejected`);
  }
});

test("markup and SQL survive validation as literal text — neither is special here", () => {
  // Both are stored and rendered as text: React escapes on output and every
  // query is parameterised. Asserting they are ACCEPTED is the point — a
  // validator that rejected apostrophes or angle brackets would be cargo-cult
  // defence that breaks legitimate titles like "Zürich's <untitled> corpus".
  const result = validateItem({
    name: "Robert'); DROP TABLE backlog_item;--",
    description: "An <em>emphatic</em> & unusual title, with \"quotes\".",
  });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.value.name, "Robert'); DROP TABLE backlog_item;--");
});

test("MAX_ITEMS is D-02's ceiling of four, not a larger number that quietly relaxed it", () => {
  // The ceiling is the backlog's whole editorial premise (curation, not a
  // wishlist). Pinned as a value so raising it is a deliberate, reviewable
  // edit rather than a drift.
  assert.equal(MAX_ITEMS, 4);
});
