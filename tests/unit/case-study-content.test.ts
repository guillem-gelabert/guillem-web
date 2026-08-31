import assert from "node:assert/strict";
import { test } from "node:test";
import { CASE_STUDY_SLUG } from "../../lib/work.ts";
import {
  DE_FILENAME,
  EN_FILENAME,
  extractHeadings,
  parseFrontmatterFields,
  readContentFile,
  splitFrontmatter,
} from "./case-study-source.ts";

// Covers CASE-01, CASE-02 and CONTEXT decisions D-04, D-05, D-10, D-12,
// D-15, D-16, D-19, D-20: the source-level gate over both case-study MDX
// files. This is a SOURCE scan rather than a rendered assertion — the
// rendered half lives in tests/case-study.spec.ts — because a source scan
// can see things the DOM cannot: which components were imported, whether a
// bare Markdown image was written, and the raw front-matter fields before
// any component ever touches them.
//
// This plan (04-02) ends RED by design: content/{EN_FILENAME,DE_FILENAME}
// are the interface Plans 03 (English) and 04 (German) write against, and
// neither exists yet. Every test below fails with
// "content/{filename} does not exist yet — Plan 03 (English) / Plan 04
// (German) creates it" until then.

// The six section marks per locale, in CASE-02's order (04-02-PLAN.md
// <interfaces> — THE CONTRACT Plans 03/04 write against).
const EN_SECTIONS = [
  "The question",
  "What I expected",
  "What the data showed",
  "Where the chart changed",
  "What shipped",
  "Methodology",
];

const DE_SECTIONS = [
  "Die Frage",
  "Was ich erwartet hatte",
  "Was die Daten zeigten",
  "Wo sich die Darstellung ändert",
  "Was veröffentlicht wurde",
  "Methodik",
];

type LocaleFixture = {
  lang: "en" | "de";
  filename: string;
  title: string;
  sections: string[];
};

const LOCALES: LocaleFixture[] = [
  { lang: "en", filename: EN_FILENAME, title: "The Chart Therefore Changes", sections: EN_SECTIONS },
  { lang: "de", filename: DE_FILENAME, title: "Die Darstellung ändert sich", sections: DE_SECTIONS },
];

// SAFE_SLUG is module-local in lib/content.ts; restated here the same way
// tests/unit/work.test.ts already does, since it cannot be imported.
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Word count over a post body, defined deterministically so a near-miss is
 * reproducible rather than argued about:
 *   1. Remove every <Figure ...>...</Figure> block whole — alt text and
 *      captions are not running prose.
 *   2. Strip any remaining tag (<Aside>, </Aside>, stray markup).
 *   3. Reduce Markdown links [label](href) to their label.
 *   4. Count whitespace-separated tokens.
 */
function countWords(body: string): number {
  let text = body;
  text = text.replace(/<Figure\b[^>]*>[\s\S]*?<\/Figure>/g, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  return text.split(/\s+/).filter(Boolean).length;
}

/** The raw text before the first `##` heading — must be imports/blanks only. */
function textBeforeFirstH2(body: string): string {
  const firstH2 = body.match(/^##[ \t]/m);
  return firstH2 ? body.slice(0, firstH2.index!) : body;
}

test("1. the English filename stem equals CASE_STUDY_SLUG, not a repeated literal", () => {
  readContentFile(EN_FILENAME); // surfaces the RED message if missing
  const stem = EN_FILENAME.replace(/\.mdx?$/, "");
  assert.equal(stem, CASE_STUDY_SLUG);
});

test("2. both filename stems match the SAFE_SLUG shape", () => {
  for (const { filename } of LOCALES) {
    readContentFile(filename);
    const stem = filename.replace(/\.mdx?$/, "");
    assert.match(stem, SAFE_SLUG, `${filename}'s stem must match SAFE_SLUG`);
  }
});

test("3. the German stem is die-darstellung-aendert-sich (SAFE_SLUG rejects ä, so 'ae' is required, not stylistic)", () => {
  readContentFile(DE_FILENAME);
  const stem = DE_FILENAME.replace(/\.mdx?$/, "");
  assert.equal(stem, "die-darstellung-aendert-sich");
});

test("4. both files carry title, standfirst, date, lang and translationKey as non-empty strings", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { yaml } = splitFrontmatter(text, filename);
    const fields = parseFrontmatterFields(yaml);
    for (const key of ["title", "standfirst", "date", "lang", "translationKey"]) {
      assert.ok(fields[key] && fields[key]!.length > 0, `${filename}: ${key} must be a non-empty string`);
    }
  }
});

test("5. date is 2026-08-31 and type is case-study in both files", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { yaml } = splitFrontmatter(text, filename);
    const fields = parseFrontmatterFields(yaml);
    assert.equal(fields.date, "2026-08-31", `${filename}: date`);
    assert.equal(fields.type, "case-study", `${filename}: type`);
  }
});

test("6. lang is en/de respectively, and the two translationKey values are equal and non-empty", () => {
  const parsed = LOCALES.map(({ filename }) => {
    const text = readContentFile(filename);
    const { yaml } = splitFrontmatter(text, filename);
    return parseFrontmatterFields(yaml);
  });
  assert.equal(parsed[0]!.lang, "en");
  assert.equal(parsed[1]!.lang, "de");
  assert.ok(parsed[0]!.translationKey && parsed[0]!.translationKey!.length > 0);
  assert.equal(parsed[0]!.translationKey, parsed[1]!.translationKey);
});

test("7. the English draft is exactly false", () => {
  const text = readContentFile(EN_FILENAME);
  const { yaml } = splitFrontmatter(text, EN_FILENAME);
  const fields = parseFrontmatterFields(yaml);
  assert.equal(fields.draft, "false", "English draft must be exactly false (D-16)");
});

test("8. the German draft is a boolean — its value is not asserted, both true and false are legitimate (D-17 escape hatch)", () => {
  const text = readContentFile(DE_FILENAME);
  const { yaml } = splitFrontmatter(text, DE_FILENAME);
  const fields = parseFrontmatterFields(yaml);
  assert.ok(fields.draft === "true" || fields.draft === "false", "German draft must be a boolean literal");
});

test("9. titles are exactly the locked English and German strings", () => {
  for (const { filename, title } of LOCALES) {
    const text = readContentFile(filename);
    const { yaml } = splitFrontmatter(text, filename);
    const fields = parseFrontmatterFields(yaml);
    assert.equal(fields.title, title, `${filename}: title`);
  }
});

test("10. both standfirst values are non-empty plain text — no *, _, [, <, or backtick", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { yaml } = splitFrontmatter(text, filename);
    const fields = parseFrontmatterFields(yaml);
    const standfirst = fields.standfirst ?? "";
    assert.ok(standfirst.length > 0, `${filename}: standfirst must be non-empty`);
    for (const char of ["*", "_", "[", "<", "`"]) {
      assert.ok(!standfirst.includes(char), `${filename}: standfirst must not contain "${char}"`);
    }
  }
});

test("11. each body has exactly six h2 headings and zero h3-h6 (the prose contract stops at h3, this phase uses no h3 at all)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const headings = extractHeadings(body);
    const h2s = headings.filter((h) => h.level === 2);
    const deeper = headings.filter((h) => h.level > 2);
    assert.equal(h2s.length, 6, `${filename}: expected exactly six h2 headings`);
    assert.equal(deeper.length, 0, `${filename}: expected zero h3-h6 headings, found ${deeper.length}`);
  }
});

test("12. the six h2 texts, in document order, equal the locked section marks for that locale", () => {
  for (const { filename, sections } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const h2Texts = extractHeadings(body)
      .filter((h) => h.level === 2)
      .map((h) => h.text);
    assert.deepEqual(h2Texts, sections, `${filename}: h2 order/wording`);
  }
});

test("13. nothing appears in the body before the first h2 other than component imports and blank lines", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const preamble = textBeforeFirstH2(body);
    for (const line of preamble.split(/\r?\n/)) {
      if (line.trim() === "") continue;
      assert.match(
        line,
        /^import\s+.*from\s+["'][^"']+["'];?$/,
        `${filename}: line before the first h2 must be an import or blank, got: ${JSON.stringify(line)}`,
      );
    }
  }
});

test("14. English word count is between 1200 and 1800 inclusive (D-05)", () => {
  const text = readContentFile(EN_FILENAME);
  const { body } = splitFrontmatter(text, EN_FILENAME);
  const count = countWords(body);
  assert.ok(count >= 1200 && count <= 1800, `English word count ${count} must be between 1200 and 1800`);
});

test("15. German word count is between 80% and 125% of the English count — a translation band, not an independent target", () => {
  const enText = readContentFile(EN_FILENAME);
  const deText = readContentFile(DE_FILENAME);
  const enCount = countWords(splitFrontmatter(enText, EN_FILENAME).body);
  const deCount = countWords(splitFrontmatter(deText, DE_FILENAME).body);
  const lower = enCount * 0.8;
  const upper = enCount * 1.25;
  assert.ok(
    deCount >= lower && deCount <= upper,
    `German word count ${deCount} must be within 80%-125% of the English count ${enCount} (band ${lower}-${upper})`,
  );
});

test("16. the only JSX element names appearing in either body are Figure and Aside (D-10)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const names = new Set([...body.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((m) => m[1]));
    for (const name of names) {
      assert.ok(name === "Figure" || name === "Aside", `${filename}: unexpected component "${name}"`);
    }
  }
});

test("17. at most one import statement per file, and if present it imports only from @/components/mdx/figure", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const importLines = body.split(/\r?\n/).filter((line) => /^import\s/.test(line));
    assert.ok(importLines.length <= 1, `${filename}: expected at most one import statement, found ${importLines.length}`);
    if (importLines.length === 1) {
      assert.match(
        importLines[0]!,
        /from\s+["']@\/components\/mdx\/figure["'];?$/,
        `${filename}: the one import must come from @/components/mdx/figure`,
      );
    }
  }
});

test("18. exactly one Aside per file (D-06 — the losing caveat goes into running prose, not a second aside)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const count = (body.match(/<Aside\b/g) ?? []).length;
    assert.equal(count, 1, `${filename}: expected exactly one <Aside`);
  }
});

test("19. zero bare Markdown images and zero fenced code blocks in either body", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    assert.ok(!body.includes("!["), `${filename}: bare Markdown image found — every image must be a <Figure>`);
    assert.ok(!body.includes("```"), `${filename}: fenced code block found — this is not a build write-up`);
  }
});

test("20. no engineering product name appears, matched case-sensitively on word boundaries (D-12)", () => {
  const bannedTokens = [
    "React",
    "Next.js",
    "D3",
    "Vue",
    "Nuxt",
    "TypeScript",
    "JavaScript",
    "Svelte",
    "WebGL",
    "Python",
    "SVG",
    "Tailwind",
    "Playwright",
  ];
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    for (const token of bannedTokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp("\\b" + escaped + "\\b");
      assert.ok(!pattern.test(body), `${filename}: found banned engineering token "${token}"`);
    }
  }
});

test("21. no engineering-framing phrase appears, matched case-insensitively (D-12)", () => {
  const bannedPhrases = ["built with", "powered by", "tech stack", "under the hood", "Observable Plot"];
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const lower = body.toLowerCase();
    for (const phrase of bannedPhrases) {
      assert.ok(!lower.includes(phrase.toLowerCase()), `${filename}: found banned phrase "${phrase}"`);
    }
  }
});

test("22. 'International Baccalaureate' never appears — D-00's one factual error that invalidates the artifact", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    assert.ok(!body.includes("International Baccalaureate"), `${filename}: found "International Baccalaureate"`);
  }
});

test("23. 'World Bank' and 'EU-15' never appear (D-19 traps 1 and 7 — no such data exists in this project)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    assert.ok(!body.includes("World Bank"), `${filename}: found "World Bank"`);
    assert.ok(!body.includes("EU-15"), `${filename}: found "EU-15"`);
  }
});

test("24. 'ib-gdp-evolution' and any github.com URL never appear — the repository is private (T-04-05)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    assert.ok(!body.includes("ib-gdp-evolution"), `${filename}: found "ib-gdp-evolution"`);
    assert.ok(!/github\.com/.test(body), `${filename}: found a github.com URL`);
  }
});

test("25. target=\"_blank\" never appears — the site uses none", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    assert.ok(!body.includes('target="_blank"'), `${filename}: found target="_blank"`);
  }
});

test("26. the outbound link to the live piece appears exactly once per body, as a Markdown link (D-20)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const occurrences = body.split("https://ib-gdp.guillemgelabert.com").length - 1;
    assert.equal(occurrences, 1, `${filename}: expected exactly one occurrence of the outbound URL`);
    assert.match(
      body,
      /\[[^\]]+\]\(https:\/\/ib-gdp\.guillemgelabert\.com[^)]*\)/,
      `${filename}: the outbound URL must sit inside a Markdown link [label](url)`,
    );
  }
});

test("27. the outbound link falls inside 'What shipped'/'Was veröffentlicht wurde' — after the fifth h2, before the sixth", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const h2s = extractHeadings(body).filter((h) => h.level === 2);
    assert.equal(h2s.length, 6, `${filename}: expected six h2 headings to bound the link`);
    const linkIndex = body.indexOf("https://ib-gdp.guillemgelabert.com");
    assert.ok(linkIndex !== -1, `${filename}: outbound URL not found`);
    const fifthHeadingIndex = h2s[4]!.index;
    const sixthHeadingIndex = h2s[5]!.index;
    assert.ok(
      linkIndex > fifthHeadingIndex && linkIndex < sixthHeadingIndex,
      `${filename}: outbound link must sit strictly between the fifth and sixth h2 headings (found at ${linkIndex}, bounds ${fifthHeadingIndex}-${sixthHeadingIndex})`,
    );
  }
});

test("28. no euro sign appears inside any <Figure> block — the unit is 2011 international PPP dollars, not euros (Pitfall 6)", () => {
  for (const { filename } of LOCALES) {
    const text = readContentFile(filename);
    const { body } = splitFrontmatter(text, filename);
    const figureBlocks = [...body.matchAll(/<Figure\b[^>]*>[\s\S]*?<\/Figure>/g)].map((m) => m[0]);
    for (const block of figureBlocks) {
      assert.ok(!block.includes("€"), `${filename}: found € inside a <Figure> block`);
    }
    // The body itself is NOT banned from quoting euro salary figures — beat 2
    // legitimately quotes the abandoned thesis's ~€23,100/~€31,600 salary
    // comparison. Only the figure captions, which describe PPP-dollar charts,
    // are forbidden from carrying a euro sign.
  }
});
