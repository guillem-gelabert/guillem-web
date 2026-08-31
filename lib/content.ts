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

/**
 * The slug list, with the two ways readdir can lie about it closed off.
 *
 * withFileTypes + isFile(): a directory named content/notes.mdx/, an editor
 * lock symlink (content/.#draft.mdx) or any other non-file entry matching the
 * extension would otherwise become a "slug" whose import fails the build with
 * a message that points at the wrong file.
 *
 * Collision check: the phase deliberately ships both .md and .mdx, so
 * content/foo.md alongside content/foo.mdx is a live possibility (and a v2
 * archive migration makes it likelier). Stripping both extensions without
 * de-duplicating returned two entries with slug "foo", both resolving to the
 * .mdx module — the index rendered the same post twice under a duplicate
 * React key, and generateStaticParams() returned the same param twice. Fail
 * the build naming both filenames instead.
 */
async function slugsOnDisk(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  const seen = new Map<string, string>();

  for (const entry of entries) {
    if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue;
    const slug = entry.name.replace(/\.mdx?$/, "");
    const previous = seen.get(slug);
    if (previous) {
      throw new Error(
        `content/: "${previous}" and "${entry.name}" resolve to the same slug "${slug}"`,
      );
    }
    seen.set(slug, entry.name);
  }

  return [...seen.keys()];
}

/**
 * ASVS V4: the allowlist ordering documented at findBySlug is enforced by
 * convention — a comment — and the routes honour it today. This regex is the
 * same property expressed as code, so it survives a refactor that inlines a
 * "convenience" loader and loses the ordering silently. loadPostModule feeds
 * a caller-supplied string into a bundler context module whose generated
 * request pattern (^\./.*\.mdx$ rooted at content/) also matches ./../…
 * shapes; this is what makes that structurally unreachable.
 */
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Dual-extension dynamic import — the extension must stay in the specifier
 * or the build fails at prerender with "Cannot find module". @next/mdx
 * derives .md vs .mdx format from the file suffix, so this try/catch is the
 * entirety of the two-format dispatch.
 */
export async function loadPostModule(
  slug: string,
): Promise<{ default: ComponentType; frontmatter: unknown }> {
  if (!SAFE_SLUG.test(slug)) {
    throw new Error(
      `Refusing to import unsafe slug: ${JSON.stringify(slug)}. ` +
        `Post filenames must be lowercase a-z, 0-9 and single hyphens ` +
        `(German slugs transliterate umlauts: "ue", "ae", "oe", "ss").`,
    );
  }
  try {
    return await import(`@/content/${slug}.mdx`);
  } catch (error) {
    // Only a *resolution* failure means "this post is a .md, not a .mdx".
    // A bare catch here would swallow every error thrown while EVALUATING
    // content/{slug}.mdx — a broken relative import inside the MDX, a
    // component that throws at module scope, a plugin failure specific to
    // that file — and replace it with the .md fallback's own resolution
    // error, so the build would fail with "Cannot find module
    // '@/content/{slug}.md'" while pointing at a file that was never the
    // problem and hiding the real stack.
    if (!isModuleResolutionError(error)) throw error;
    return await import(`@/content/${slug}.md`);
  }
}

function isModuleResolutionError(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  if (code === "MODULE_NOT_FOUND" || code === "ERR_MODULE_NOT_FOUND") return true;
  // Turbopack and webpack both phrase their context-module misses in prose
  // rather than with an errno code, so the message is the only signal.
  return /Cannot find module|Module not found/.test(String((error as Error | null)?.message ?? ""));
}

/**
 * D-11, stated once. PostMeta needs the same predicate to decide whether to
 * print the draft marker, and used to re-derive it inline — two independent
 * statements of one rule that could drift apart the moment it changes (a
 * SHOW_DRAFTS flag, a preview mode), with the visible symptom being a draft
 * marker on a published post or a published post with no marker in dev.
 */
export function showDrafts(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Drafts are visible in dev, invisible in a production build. D-11. */
export function isVisible(entry: PostEntry): boolean {
  return showDrafts() || entry.frontmatter.draft !== true;
}

/**
 * Reverse-chronological, then alphabetical by slug. The slug tiebreak is not
 * cosmetic: comparing dates alone returns 0 for two posts sharing a date, and
 * a stable sort then preserves readdir order, which is filesystem- and
 * platform-dependent. The rendered index order and the order of
 * generateStaticParams() could differ between a developer's machine and the
 * deploy build with no error and no test failure. content/fixture.mdx and
 * content/musterseite.mdx already share 2026-08-30.
 */
function byDateThenSlug(a: PostEntry, b: PostEntry): number {
  return (
    b.frontmatter.date.localeCompare(a.frontmatter.date) || a.slug.localeCompare(b.slug)
  );
}

export function selectForLocale(entries: PostEntry[], lang: Locale): PostEntry[] {
  return entries
    .filter((entry) => entry.frontmatter.lang === lang && isVisible(entry))
    .sort(byDateThenSlug);
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
  return entries.sort(byDateThenSlug);
}

export async function publishedFor(lang: Locale): Promise<PostEntry[]> {
  return selectForLocale(await allPosts(), lang);
}

/**
 * Visibility is part of the selection, not a veto applied after it. Finding
 * first and filtering second returned the NEWEST candidate sharing the
 * translationKey (allPosts includes drafts and is sorted date-descending)
 * and then discarded it if it was a draft — so a locale with two posts on
 * one translationKey, the newer of them a draft, silently lost its language
 * switch in production even though a published twin existed. The only
 * symptom would have been a missing link.
 */
export async function translationOf(entry: PostEntry): Promise<PostEntry | null> {
  const visible = (await allPosts()).filter(isVisible);
  return findTranslation(entry, visible);
}
