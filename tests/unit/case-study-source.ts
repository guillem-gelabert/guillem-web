import { readFileSync } from "node:fs";
import path from "node:path";

// Shared reader/parser for the two case-study MDX files, used by both
// case-study-content.test.ts (the source-level gate) and
// case-study-figures.test.ts (the figure gate), so both fail the same
// legible way while this plan is RED. Deliberately NOT named *.test.ts —
// `npm run test:unit` globs `tests/unit/*.test.ts`, and Node exits non-zero
// on a suite with zero tests. Do not rename it. (Precedent: ./css-source.ts)

const CONTENT_DIR = path.join(process.cwd(), "content");

// D-15/04-02-PLAN.md <interfaces>: the locked filenames both writing plans
// (03 English, 04 German) create. The EN stem is asserted elsewhere to equal
// lib/work.ts's CASE_STUDY_SLUG rather than repeating the literal there too,
// but the filename itself has to be a literal somewhere to open the file.
export const EN_FILENAME = "the-chart-therefore-changes.mdx";
export const DE_FILENAME = "die-darstellung-aendert-sich.mdx";

/**
 * Reads a file from content/ by filename. On ENOENT the thrown message names
 * exactly which later plan is responsible, so a RED run reads as "waiting on
 * Plan 03/04" rather than an unexplained ENOENT stack three frames deep.
 */
export function readContentFile(filename: string): string {
  const filePath = path.join(CONTENT_DIR, filename);
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | null)?.code;
    if (code === "ENOENT") {
      throw new Error(
        `content/${filename} does not exist yet — Plan 03 (English) / Plan 04 (German) creates it`,
      );
    }
    throw error;
  }
}

export type SplitFile = { yaml: string; body: string };

/**
 * Splits a file's raw text into its front-matter YAML block and body.
 * Requires the file to open with a `---` fence, the same shape
 * lib/content.ts's own front-matter parsing assumes.
 */
export function splitFrontmatter(text: string, filename: string): SplitFile {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) {
    throw new Error(`content/${filename}: does not open with a "---" front-matter fence`);
  }
  const firstNewline = text.indexOf("\n");
  const closeIndex = text.indexOf("\n---", firstNewline);
  if (closeIndex === -1) {
    throw new Error(`content/${filename}: front-matter block is never closed with "---"`);
  }
  const yaml = text.slice(firstNewline + 1, closeIndex);
  const afterFence = text.slice(closeIndex + 4);
  const body = afterFence.replace(/^\r?\n/, "");
  return { yaml, body };
}

/**
 * A line-oriented parser for the seven scalar fields lib/content.ts's
 * PostFrontmatter defines (title, standfirst, date, lang, translationKey,
 * draft, type) — deliberately not a YAML dependency, since these are seven
 * scalars, not a document. Each line is `key: value`, value optionally
 * wrapped in matching quotes.
 */
export function parseFrontmatterFields(yaml: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of yaml.split(/\r?\n/)) {
    const match = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }
  return fields;
}

export type Heading = { level: number; text: string; index: number };

/** Every ATX heading (`##` through `######`) in document order, with its character offset. */
export function extractHeadings(body: string): Heading[] {
  return [...body.matchAll(/^(#{2,6})[ \t]+(.*)$/gm)].map((m) => ({
    level: m[1]!.length,
    text: m[2]!.trim(),
    index: m.index!,
  }));
}

/** Every whole `<Figure ...>...</Figure>` block, opening tag through closing tag. */
export function extractFigureBlocks(body: string): string[] {
  return [...body.matchAll(/<Figure\b[^>]*>[\s\S]*?<\/Figure>/g)].map((m) => m[0]);
}
