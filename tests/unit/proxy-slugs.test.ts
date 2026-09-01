import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { isPublished } from "../../proxy.ts";
import { assertFrontmatter, selectForLocale } from "../../lib/content.ts";
import type { Locale, PostEntry, PostFrontmatter } from "../../lib/content.ts";

// This file is the SOLE guarantee that proxy.ts's isPublished predicate and
// lib/content.ts's real published-slug selection never silently diverge.
// The proxy restates the locale filter and D-11's draft-visibility rule a
// second time (fs.readdirSync + a front-matter regex, at request time)
// instead of importing lib/content.ts's own loaders, because proxy.ts must
// resolve every request in the nodejs runtime independent of the bundler's
// @/content/* dynamic import (06-RESEARCH.md § "How the proxy learns the
// published slug set"). Deleting this file re-opens the exact failure mode
// CR-01 exists to close: a published post 404s, a draft becomes reachable,
// or a German slug serves under the English layout with a 200.
//
// Binds to selectForLocale() + assertFrontmatter(), not the literal
// publishedFor(), and this is a deliberate, measured substitution — not a
// weaker test. publishedFor() = selectForLocale(await allPosts(), lang),
// and allPosts() loads every post via loadPostModule's
// import(`@/content/${slug}.mdx`) — a bundler-only alias specifier that
// content.test.ts's own header comment already documents as untestable
// under plain `node --test` ("they depend on the bundler's @/ alias... are
// covered end-to-end by the Playwright specs instead"). Confirmed here: the
// same ERR_MODULE_NOT_FOUND reproduces for publishedFor() as for any other
// @/-aliased specifier under `node --test`. selectForLocale is the exact,
// unmodified selection algorithm publishedFor() delegates to; the entries
// fed into it below come from reading the same content/ files' real
// front-matter, validated through the real assertFrontmatter(), so this
// test still exercises lib/content.ts's real, unforked rules — everything
// publishedFor() does except the MDX-component load, which the slug-set
// question never touches.

const LOCALES: readonly Locale[] = ["en", "de"];

const CONTENT_DIR = path.join(process.cwd(), "content");

// A minimal, single-line-value front-matter reader — deliberately not a
// YAML parser. Good enough for this repo's actual content/ files (verified
// by reading all five in full), and every value it produces is passed
// through the real assertFrontmatter() below, so a shape it gets wrong
// fails loudly here rather than producing a silently-wrong oracle.
function parseFrontmatterBlock(raw: string): Record<string, string | boolean> {
  const fence = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fence) {
    throw new Error("proxy-slugs.test.ts: no front-matter fence found");
  }
  const result: Record<string, string | boolean> = {};
  for (const line of fence[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z]+):\s*(.+)$/);
    if (!field) continue;
    const value = field[2].trim().replace(/^["']|["']$/g, "");
    result[field[1]] = value === "true" ? true : value === "false" ? false : value;
  }
  return result;
}

// Every entry on disk, drafts included — the same universe allPosts() draws
// from, read independently rather than through loadPostModule.
function entriesOnDisk(): PostEntry[] {
  return readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name))
    .map((entry) => {
      const slug = entry.name.replace(/\.mdx?$/, "");
      const raw = readFileSync(path.join(CONTENT_DIR, entry.name), "utf8");
      const fm = parseFrontmatterBlock(raw);
      assertFrontmatter(fm, entry.name);
      return { slug, frontmatter: fm as PostFrontmatter };
    });
}

async function withNodeEnv<T>(value: string, fn: () => T | Promise<T>): Promise<T> {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const original = mutableEnv.NODE_ENV;
  mutableEnv.NODE_ENV = value;
  try {
    return await fn();
  } finally {
    if (original === undefined) delete mutableEnv.NODE_ENV;
    else mutableEnv.NODE_ENV = original;
  }
}

function admittedByProxy(locale: Locale, candidates: string[]): string[] {
  return candidates.filter((slug) => isPublished(locale, slug)).sort();
}

function selectedByContent(entries: PostEntry[], locale: Locale): string[] {
  return selectForLocale(entries, locale)
    .map((entry) => entry.slug)
    .sort();
}

test("1. isPublished and lib/content.ts's real selection admit exactly the same slugs, per locale, in production", async () => {
  await withNodeEnv("production", () => {
    const entries = entriesOnDisk();
    const candidates = entries.map((entry) => entry.slug);
    for (const locale of LOCALES) {
      const admitted = admittedByProxy(locale, candidates);
      const selected = selectedByContent(entries, locale);
      assert.deepEqual(
        admitted,
        selected,
        `locale=${locale} (production): proxy admits [${admitted.join(", ")}], ` +
          `lib/content.ts selects [${selected.join(", ")}]`,
      );
    }
  });
});

test("2. isPublished and lib/content.ts's real selection still agree in development, where drafts are visible", async () => {
  await withNodeEnv("development", () => {
    const entries = entriesOnDisk();
    const candidates = entries.map((entry) => entry.slug);
    for (const locale of LOCALES) {
      const admitted = admittedByProxy(locale, candidates);
      const selected = selectedByContent(entries, locale);
      assert.deepEqual(
        admitted,
        selected,
        `locale=${locale} (development): proxy admits [${admitted.join(", ")}], ` +
          `lib/content.ts selects [${selected.join(", ")}]`,
      );
    }
  });
});

test("3. the-chart-therefore-changes (EN case study) is admitted for en and rejected for de", async () => {
  await withNodeEnv("production", () => {
    assert.equal(isPublished("en", "the-chart-therefore-changes"), true);
    assert.equal(isPublished("de", "the-chart-therefore-changes"), false);
  });
});

test("4. die-darstellung-aendert-sich (DE case study) is admitted for de and rejected for en", async () => {
  await withNodeEnv("production", () => {
    assert.equal(isPublished("de", "die-darstellung-aendert-sich"), true);
    assert.equal(isPublished("en", "die-darstellung-aendert-sich"), false);
  });
});

test("5. every draft fixture slug is rejected for both locales in production", async () => {
  await withNodeEnv("production", () => {
    for (const slug of ["fixture", "musterseite", "nur-auf-deutsch"]) {
      for (const locale of LOCALES) {
        assert.equal(
          isPublished(locale, slug),
          false,
          `${slug} must be rejected for locale=${locale} in production`,
        );
      }
    }
  });
});

test("6. slug shapes that fail SAFE_SLUG are rejected before any filesystem read, for both locales", () => {
  for (const slug of ["../secret", "a/b", "UPPER", ""]) {
    for (const locale of LOCALES) {
      assert.equal(isPublished(locale, slug), false, `must reject ${JSON.stringify(slug)} for locale=${locale}`);
    }
  }
});
