import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertFrontmatter,
  findBySlug,
  findTranslation,
  isVisible,
  loadPostModule,
  selectForLocale,
} from "../../lib/content.ts";
import type { PostEntry, PostFrontmatter } from "../../lib/content.ts";

// Covers WRIT-01 / I18N-01: the five VALIDATION.md rows this file discharges —
//   1. SC1 (front-matter): a post's title/standfirst/date/lang/translationKey
//      come from front-matter; assertFrontmatter accepts a complete valid
//      object and throws for every malformed shape, naming every problem.
//   2. D-06/D-07 (pairing): findTranslation pairs by translationKey across
//      locales, returns null for a lone post, and never pairs same-locale
//      entries.
//   3. ASVS V4 (slug allowlist): findBySlug resolves a known slug and
//      resolves unknown/traversal-shaped slugs to nothing, before any
//      dynamic import() runs.
//   4. D-11 (draft visibility): isVisible hides drafts in production and
//      shows them in development.
//
// allPosts, publishedFor and translationOf are deliberately NOT exercised
// here — they depend on the bundler's @/ alias and on content/ existing on
// disk, and are covered end-to-end by the Playwright specs in Plans 04/05
// instead. loadPostModule appears only in the slug-guard test below, which
// asserts the rejection that happens BEFORE any import() is reached, so it
// never touches the alias either. Everything else in this file is pure,
// synchronous helpers over inline fixtures.

function withNodeEnv(value: string, fn: () => void) {
  // process.env.NODE_ENV is typed readonly (Next.js's NodeJS.ProcessEnv
  // augmentation); cast to a plain mutable record so this suite can vary it
  // per case and restore it afterwards, keeping the suite order-independent.
  const mutableEnv = process.env as Record<string, string | undefined>;
  const original = mutableEnv.NODE_ENV;
  mutableEnv.NODE_ENV = value;
  try {
    fn();
  } finally {
    if (original === undefined) delete mutableEnv.NODE_ENV;
    else mutableEnv.NODE_ENV = original;
  }
}

const validFrontmatter: PostFrontmatter = {
  title: "Everyone in Mallorca Agrees on One Thing",
  standfirst: "A data investigation into a shared local belief.",
  date: "2026-06-01",
  lang: "en",
  translationKey: "mallorca-agrees",
};

const enPost: PostEntry = { slug: "everyone-in-mallorca-agrees-on-one-thing", frontmatter: validFrontmatter };

const enDraft: PostEntry = {
  slug: "fixture",
  frontmatter: {
    title: "Fixture",
    standfirst: "Exercises every Prose Contract element.",
    date: "2026-08-01",
    lang: "en",
    translationKey: "fixture",
    draft: true,
  },
};

const deTwin: PostEntry = {
  slug: "auf-mallorca-weiss-es-jeder",
  frontmatter: {
    title: "Auf Mallorca weiß es jeder",
    standfirst: "Eine Datenrecherche zu einem geteilten lokalen Glauben.",
    date: "2026-06-01",
    lang: "de",
    translationKey: "mallorca-agrees",
  },
};

const deLone: PostEntry = {
  slug: "ohne-uebersetzung",
  frontmatter: {
    title: "Ohne Übersetzung",
    standfirst: "Ein Text, der nur auf Deutsch existiert.",
    date: "2026-07-01",
    lang: "de",
    translationKey: "lone-de",
  },
};

test("1. assertFrontmatter accepts a complete valid object and does not throw", () => {
  assertFrontmatter(validFrontmatter, "valid.mdx");
});

test("2. assertFrontmatter throws for each malformed shape, naming the offending field", () => {
  const { standfirst: _standfirst, ...missingStandfirst } = validFrontmatter;
  const { translationKey: _translationKey, ...missingTranslationKey } = validFrontmatter;

  const cases: Array<{ file: string; fm: unknown; expectField: RegExp }> = [
    { file: "undefined.mdx", fm: undefined, expectField: /front-matter/ },
    { file: "non-object.mdx", fm: "nope", expectField: /front-matter/ },
    { file: "empty-title.mdx", fm: { ...validFrontmatter, title: "" }, expectField: /title/ },
    { file: "no-standfirst.mdx", fm: missingStandfirst, expectField: /standfirst/ },
    { file: "no-translationkey.mdx", fm: missingTranslationKey, expectField: /translationKey/ },
    { file: "bad-date.mdx", fm: { ...validFrontmatter, date: "2026-8-9" }, expectField: /date/ },
    // Shape-valid but not real dates. 2026-02-31 is the dangerous one: it
    // parses, rolls over to 2026-03-03 and would publish silently under a
    // date the author never wrote. The other two reach Intl and throw a bare
    // RangeError with no filename unless caught here.
    { file: "rollover-date.mdx", fm: { ...validFrontmatter, date: "2026-02-31" }, expectField: /date/ },
    { file: "impossible-month.mdx", fm: { ...validFrontmatter, date: "2026-13-01" }, expectField: /date/ },
    { file: "zero-date.mdx", fm: { ...validFrontmatter, date: "0000-00-00" }, expectField: /date/ },
    { file: "bad-lang.mdx", fm: { ...validFrontmatter, lang: "fr" }, expectField: /lang/ },
    { file: "bad-draft.mdx", fm: { ...validFrontmatter, draft: "yes" }, expectField: /draft/ },
    { file: "bad-type.mdx", fm: { ...validFrontmatter, type: "essay" }, expectField: /type/ },
  ];

  for (const { file, fm, expectField } of cases) {
    const escapedFile = file.replace(/\./g, "\\.");
    assert.throws(
      () => assertFrontmatter(fm, file),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match((err as Error).message, new RegExp(`^content/${escapedFile}:`));
        assert.match((err as Error).message, expectField);
        return true;
      },
    );
  }
});

test("3. assertFrontmatter reports all problems from one malformed object, not just the first", () => {
  assert.throws(
    () => assertFrontmatter({ ...validFrontmatter, title: "", lang: "fr" }, "many-problems.mdx"),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      const message = (err as Error).message;
      assert.match(message, /title/);
      assert.match(message, /lang/);
      return true;
    },
  );
});

test("4. isVisible: a draft is visible in development and hidden in production; a non-draft is visible under both", () => {
  withNodeEnv("development", () => {
    assert.equal(isVisible(enDraft), true);
    assert.equal(isVisible(enPost), true);
  });
  withNodeEnv("production", () => {
    assert.equal(isVisible(enDraft), false);
    assert.equal(isVisible(enPost), true);
  });
});

test("5. selectForLocale returns only the matching locale, drops drafts in production, ordered by date descending", () => {
  withNodeEnv("production", () => {
    assert.deepEqual(selectForLocale([enPost, enDraft, deTwin, deLone], "en"), [enPost]);
  });
  withNodeEnv("development", () => {
    // enDraft (2026-08-01) is newer than enPost (2026-06-01)
    assert.deepEqual(selectForLocale([enPost, enDraft], "en"), [enDraft, enPost]);
  });
});

test("6. findTranslation pairs across locales by translationKey and never within the same locale", () => {
  assert.deepEqual(findTranslation(enPost, [enPost, deTwin, deLone]), deTwin);
  assert.equal(findTranslation(deLone, [enPost, deTwin, deLone]), null);

  // D-06's failure mode: only a same-locale candidate shares the key.
  const sameLocaleDuplicate: PostEntry = {
    slug: "another-en-slug",
    frontmatter: { ...validFrontmatter, translationKey: "mallorca-agrees" },
  };
  assert.equal(findTranslation(enPost, [enPost, sameLocaleDuplicate]), null);
});

test("7. findBySlug resolves a known slug and allowlists away unknown or traversal-shaped slugs", () => {
  const entries = [enPost, deTwin, deLone];
  assert.deepEqual(findBySlug(entries, enPost.slug), enPost);

  // ASVS V4 allowlist assertion: the route must resolve a slug against the
  // enumerated post list before any dynamic import() runs. None of these
  // shapes — including traversal attempts — may resolve to an entry.
  for (const slug of ["unknown", "", "../secret", "../../package.json", "..%2Fsecret"]) {
    assert.equal(findBySlug(entries, slug), null);
  }
});

test("8. assertFrontmatter accepts real edge-case calendar dates rather than over-rejecting", () => {
  // The round-trip check must not reject leap days, month ends or year
  // boundaries — the failure mode of a stricter regex-plus-Date guard.
  for (const date of ["2024-02-29", "2026-01-31", "2026-12-31", "2026-01-01"]) {
    assertFrontmatter({ ...validFrontmatter, date }, "edge-date.mdx");
  }
});

test("9. loadPostModule refuses an unsafe slug structurally, before any dynamic import runs", async () => {
  // WR-02: findBySlug's allowlist ordering is the route's control, but it is
  // enforced by a comment. This is the same property expressed as code, so a
  // refactor that inlines a "convenience" loader cannot lose it silently.
  for (const slug of [
    "../secret",
    "../../package.json",
    "..%2Fsecret",
    "",
    "Fixture",
    "with space",
    "trailing-",
    "double--hyphen",
    "nur_auf_deutsch",
  ]) {
    await assert.rejects(
      () => loadPostModule(slug),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match((err as Error).message, /Refusing to import unsafe slug/);
        return true;
      },
      `loadPostModule must refuse ${JSON.stringify(slug)}`,
    );
  }
});
