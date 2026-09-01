import { readFile } from "node:fs/promises";
import path from "node:path";
import { publishedFor } from "@/lib/content";

// A static file cannot live under a dynamic [slug] segment - one PNG would
// serve every slug. This route file is the per-post override: it reads a
// committed raster from public/og/{slug}.png and returns its bytes. The
// rasters themselves are produced by scripts/capture-brand-images.mjs (see
// that script's header for why they are committed PNGs rather than
// next/og's ImageResponse - Satori cannot load Humane, a variable font, and
// next build fails outright if it tries).

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors the sibling page.tsx exactly, so the published slug set for the
// card can never drift from the published slug set for the post itself.
export async function generateStaticParams() {
  return (await publishedFor("de")).map(({ slug }) => ({ slug }));
}

// ASVS V12: both paths below resolve from module-scope directory constants,
// never from string-concatenating the raw param into an arbitrary path.
const OG_DIR = path.join(process.cwd(), "public", "og");
const SITE_CARD_PATH = path.join(process.cwd(), "app", "(de)", "opengraph-image.png");

// Mirrors lib/content.ts:122's SAFE_SLUG exactly. Kept local rather than
// imported - it is not exported there, and this route touches only its own
// segment's files. generateStaticParams already only ever supplies slugs
// that passed this same shape (via publishedFor -> slugsOnDisk), but this
// route may also be reached with an arbitrary dynamicParams value at
// request time, so the check is enforced here too, before any readFile.
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (SAFE_SLUG.test(slug)) {
    try {
      const bytes = await readFile(path.join(OG_DIR, `${slug}.png`));
      return new Response(bytes, { headers: { "Content-Type": "image/png" } });
    } catch {
      // No committed card for this slug (not yet captured, or the slug
      // failed SAFE_SLUG and never reached the readFile above). Fall
      // through to the site-wide card below - the fallback is not
      // optional: a new post must never fail the build or emit a broken
      // image URL because somebody forgot to re-run the capture script.
    }
  }

  const fallback = await readFile(SITE_CARD_PATH);
  return new Response(fallback, { headers: { "Content-Type": "image/png" } });
}
