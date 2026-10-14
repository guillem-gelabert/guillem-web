import type { PostFrontmatter } from "@/lib/content";

/**
 * Re-points the site's paper and ink tokens for one post's route. The body,
 * the prose contract, rules and code surfaces all read the two tokens, so
 * one :root override recolours the whole page without touching the layout.
 * Values are validated as #rrggbb in assertFrontmatter, so the inline style
 * cannot carry anything but a colour.
 */
export function PostPalette({ frontmatter }: { frontmatter: PostFrontmatter }) {
  const { paper, ink } = frontmatter;
  if (!paper || !ink) return null;
  return <style>{`:root{--color-paper:${paper};--color-ink:${ink}}`}</style>;
}
