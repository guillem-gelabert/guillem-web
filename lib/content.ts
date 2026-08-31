import { readdir } from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export type PostFrontmatter = {
  title: string;
  standfirst: string;
  date: string; // ISO 8601, e.g. "2026-08-29"
  lang: Locale;
  translationKey: string;
  draft?: boolean;
  type?: "post" | "case-study";
};

export type PostEntry = { slug: string; frontmatter: PostFrontmatter };

/**
 * ASVS V12: CONTENT_DIR is a fixed, module-scope constant. No caller-supplied
 * path ever reaches readdir — content/ is the only directory this module
 * ever touches.
 */
const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Throws during `next build` (inside allPosts, inside generateStaticParams)
 * if a post's front-matter is malformed. ASVS V5: this is the phase's
 * input-validation control — a missing `---` fence or a mistyped field fails
 * the build loudly instead of shipping as visible prose or an empty
 * `<html lang>`.
 */
export function assertFrontmatter(fm: unknown, file: string): asserts fm is PostFrontmatter {
  const f = fm as Partial<PostFrontmatter> | null | undefined;
  const problems: string[] = [];

  if (!f || typeof f !== "object") {
    problems.push("missing front-matter block");
  } else {
    for (const key of ["title", "standfirst", "translationKey"] as const) {
      if (typeof f[key] !== "string" || !f[key]) {
        problems.push(`${key} must be a non-empty string`);
      }
    }
    if (typeof f.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(f.date)) {
      problems.push("date must be an ISO date (YYYY-MM-DD)");
    } else {
      // Shape is not validity. Round-tripping through Date catches both
      // halves of that gap: an unparseable date (2026-13-01, 0000-00-00)
      // would otherwise reach Intl.DateTimeFormat in formatPostDate and
      // throw a bare "RangeError: Invalid time value" with no filename and
      // no field, three modules from the file that caused it; and a calendar
      // rollover (2026-02-31 -> 2026-03-03) would pass silently and publish
      // under a date the author never wrote, with an invalid datetime
      // attribute and a sort key that orders the index by the typo.
      const parsed = new Date(`${f.date}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== f.date) {
        problems.push(`date "${f.date}" is not a real calendar date`);
      }
    }
    if (!LOCALES.includes(f.lang as Locale)) {
      problems.push(`lang must be one of ${LOCALES.join(", ")}`);
    }
    if (f.draft !== undefined && typeof f.draft !== "boolean") {
      problems.push("draft must be a boolean");
    }
    if (f.type !== undefined && f.type !== "post" && f.type !== "case-study") {
      problems.push("type must be 'post' or 'case-study'");
    }
  }

  if (problems.length) {
    throw new Error(`content/${file}: ${problems.join("; ")}`);
  }
}

async function slugsOnDisk(): Promise<string[]> {
  const files = await readdir(CONTENT_DIR);
  return files.filter((file) => /\.mdx?$/.test(file)).map((file) => file.replace(/\.mdx?$/, ""));
}

/**
 * Dual-extension dynamic import — the extension must stay in the specifier
 * or the build fails at prerender with "Cannot find module". @next/mdx
 * derives .md vs .mdx format from the file suffix, so this six-line
 * try/catch is the entirety of the two-format dispatch.
 */
export async function loadPostModule(
  slug: string,
): Promise<{ default: ComponentType; frontmatter: unknown }> {
  try {
    return await import(`@/content/${slug}.mdx`);
  } catch {
    return await import(`@/content/${slug}.md`);
  }
}

/** Drafts are visible in dev, invisible in a production build. D-11. */
export function isVisible(entry: PostEntry): boolean {
  return process.env.NODE_ENV === "development" || entry.frontmatter.draft !== true;
}

export function selectForLocale(entries: PostEntry[], lang: Locale): PostEntry[] {
  return entries
    .filter((entry) => entry.frontmatter.lang === lang && isVisible(entry))
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

/**
 * D-06/D-07: the translation is the entry sharing translationKey in the
 * other locale, and never the same locale — or null when there is none.
 */
export function findTranslation(entry: PostEntry, entries: PostEntry[]): PostEntry | null {
  return (
    entries.find(
      (candidate) =>
        candidate.frontmatter.translationKey === entry.frontmatter.translationKey &&
        candidate.frontmatter.lang !== entry.frontmatter.lang,
    ) ?? null
  );
}

/**
 * ASVS V4: the phase's access-control boundary. Route handlers MUST call
 * findBySlug(await publishedFor(locale), slug) and bail to notFound() BEFORE
 * ever calling loadPostModule — never the other way round. Do not reorder.
 */
export function findBySlug(entries: PostEntry[], slug: string): PostEntry | null {
  return entries.find((entry) => entry.slug === slug) ?? null;
}

export async function allPosts(): Promise<PostEntry[]> {
  const slugs = await slugsOnDisk();
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const { frontmatter } = await loadPostModule(slug);
      assertFrontmatter(frontmatter, slug);
      return { slug, frontmatter };
    }),
  );
  return entries.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

export async function publishedFor(lang: Locale): Promise<PostEntry[]> {
  return selectForLocale(await allPosts(), lang);
}

export async function translationOf(entry: PostEntry): Promise<PostEntry | null> {
  const candidate = findTranslation(entry, await allPosts());
  return candidate && isVisible(candidate) ? candidate : null;
}
