import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PostFrontmatter } from "@/lib/content";
import { SmearTitle } from "@/components/smear-title";

/**
 * The post's h1. With `titleImage` in the front-matter it is a lettering
 * image, the title kept as its alt text; otherwise the usual smear heading.
 * The image's own pixel size is read from the PNG header so the page can
 * set it at one image pixel per Game Boy dot (gameboy-screen.css).
 */
export async function PostTitle({ frontmatter }: { frontmatter: PostFrontmatter }) {
  if (!frontmatter.titleImage) {
    return (
      <SmearTitle as="h1" className="text-heading">
        {frontmatter.title}
      </SmearTitle>
    );
  }
  const png = await readFile(path.join(process.cwd(), "public", frontmatter.titleImage));
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  return (
    <h1 className="text-heading title-image" style={{ "--title-w": width } as React.CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a pixel image shown at whole-dot scale, not a photo to optimise */}
      <img src={frontmatter.titleImage} alt={frontmatter.title} width={width} height={height} />
    </h1>
  );
}
