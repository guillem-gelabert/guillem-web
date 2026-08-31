import assert from "node:assert/strict";
import { test } from "node:test";

// Covers I18N-01: formatPostDate produces the UI-SPEC's exact date strings
// (`29 August 2026` / `29. August 2026`) via Intl.DateTimeFormat with a UTC
// pin, and the locale path/UI helpers (indexPath, postPath, otherLocale,
// UI) that lib/content.ts and the writing routes depend on.

process.env.TZ = "America/Los_Angeles";

const locales = await import("../../lib/locales.ts");
const { formatPostDate, indexPath, postPath, otherLocale, UI } = locales;

test("formatPostDate renders the English format", () => {
  assert.equal(formatPostDate("2026-08-29", "en"), "29 August 2026");
});

test("formatPostDate renders the German format", () => {
  assert.equal(formatPostDate("2026-08-29", "de"), "29. August 2026");
});

test("formatPostDate is pinned to UTC regardless of process.env.TZ", () => {
  // process.env.TZ is America/Los_Angeles (set above, before any Intl
  // object was constructed). Without the UTC pin, "2026-01-01" would
  // drift to 31 December in a negative-offset zone.
  assert.equal(formatPostDate("2026-01-01", "en"), "1 January 2026");
});

test("indexPath returns the localised index segment", () => {
  assert.equal(indexPath("en"), "/writing");
  assert.equal(indexPath("de"), "/texte");
});

test("postPath returns the localised post segment", () => {
  assert.equal(postPath("de", "musterseite"), "/texte/musterseite");
});

test("otherLocale returns the opposite locale", () => {
  assert.equal(otherLocale("en"), "de");
  assert.equal(otherLocale("de"), "en");
});

test("UI defines all ten copy keys with non-empty strings for both locales", () => {
  const keys = [
    "indexKicker",
    "indexDescription",
    "backLink",
    "switchLabel",
    "emptyHeading",
    "emptyBody",
    "notFoundHeading",
    "notFoundBody",
    "draftMarker",
    "homeLink",
  ] as const;

  for (const locale of ["en", "de"] as const) {
    for (const key of keys) {
      const value = UI[locale][key];
      assert.equal(typeof value, "string");
      assert.ok(value.length > 0, `UI.${locale}.${key} must be non-empty`);
    }
  }
});
