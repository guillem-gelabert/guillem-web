// scripts/capture-brand-images.mjs
//
// WHY THIS SCRIPT EXISTS — read this before "simplifying" it back to
// `ImageResponse` / `next/og`:
//
// next/og's bundled Satori (@vercel/og) cannot load ANY variable font.
// Reproduced locally on app/fonts/Humane-VF.ttf and on two unrelated macOS
// variable TTFs (NewYork.ttf, SFNSMono.ttf): all three crash identically at
//
//   TypeError: Cannot read properties of undefined (reading '256')
//     at parseFvarAxis  (next/dist/compiled/@vercel/og/index.node.js:11887:20)
//     at parseFvarTable (…:11917:7)
//     at parseBuffer    (…:12957:29)
//     at addFonts       (…:19754:37)
//
// A static control TTF (Andale Mono) renders fine, which proves the defect
// is font-CLASS-specific (fvar/gvar/HVAR/STAT tables), not a Humane quirk.
// `next build` does not degrade gracefully here — it FAILS OUTRIGHT. Humane's
// licence forbids modification (Phase 1 D-01), so instancing it down to a
// static TTF to work around the crash is not an option either.
//
// The only path that keeps the real Humane file on the site's brand rasters
// is: render once with a real browser (Playwright, already a devDependency)
// and commit the resulting PNGs. That is what this script does. It is
// build-time tooling, run by hand (`node scripts/capture-brand-images.mjs`),
// never imported by anything under app/.
//
// See .planning/phases/06-cv-contact-photo-discoverability/06-RESEARCH.md
// § FINDING F2 for the full measurement, and 06-VALIDATION.md decision 3 for
// the coordinator's ruling that committed PNGs are not optional here.
//
// Produces, from one source of truth (the real Humane-VF.ttf file and the
// real design tokens in app/globals.css):
//   - app/(en)/opengraph-image.png   the EN site-wide card, 1200x630
//   - app/(de)/opengraph-image.png   the DE site-wide card, 1200x630
//   - app/icon.png                   the favicon replacement, square
//   - public/og/{slug}.png           one per published post per locale,
//                                     1200x630, carrying that post's own
//                                     title in Humane (see Task 2's route
//                                     files for how these are served)
//
// Idempotent: every run overwrites its outputs from scratch. Re-run after
// publishing a post (public/og/README.md repeats this instruction).

import { chromium } from "@playwright/test";
import { mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const REPO_ROOT = process.cwd();
const FONT_PATH = path.join(REPO_ROOT, "app/fonts/Humane-VF.ttf");
const FONT_URL = `file://${FONT_PATH}`;
const GLOBALS_CSS_PATH = path.join(REPO_ROOT, "app/globals.css");
const CONTENT_DIR = path.join(REPO_ROOT, "content");
const OG_DIR = path.join(REPO_ROOT, "public/og");

const SITE_NAME = "Guillem Gelabert";
const TAGLINE = {
  en: "Data visualisation, writing and interactive work.",
  de: "Datenvisualisierung, Texte und interaktive Arbeiten.",
};
const ALT_TEXT = {
  en: "Guillem Gelabert — data visualisation, writing and interactive work.",
  de: "Guillem Gelabert — Datenvisualisierung, Texte und interaktive Arbeiten.",
};

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
// A square favicon replacement. 512x512 is large enough that Chromium's
// downscale to whatever size a browser tab actually renders (16-32px in
// practice) stays crisp, and it is the size Next.js' own icon.png examples
// use for a single committed raster (no multi-size icon set here — one file,
// one <link rel="icon">, per Pitfall 9 / T-06-37).
const ICON_SIZE = 512;

/**
 * Extracts the raw declaration block for a CSS selector, e.g. "@theme" or
 * ".text-heading". Not a general CSS parser — this repo's globals.css has
 * one occurrence of each selector this script reads, and a missing
 * declaration throws rather than silently falling back to a guessed value.
 */
function extractBlock(css, selectorPattern) {
  const re = new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`);
  const match = css.match(re);
  if (!match) {
    throw new Error(`capture-brand-images: selector ${selectorPattern} not found in globals.css`);
  }
  return match[1];
}

function extractDecl(block, property, sourceLabel) {
  const re = new RegExp(`${property}:\\s*([^;]+);`);
  const match = block.match(re);
  if (!match) {
    throw new Error(`capture-brand-images: ${property} not found in ${sourceLabel}`);
  }
  return match[1].trim();
}

/**
 * Reads the real ink/paper colours and the real Humane heading weight and
 * letter-spacing straight out of app/globals.css, rather than typing hex
 * codes and a weight into this script a second time. If the design tokens
 * ever move, this script's output moves with them on the next run.
 */
async function readDesignTokens() {
  const css = await readFile(GLOBALS_CSS_PATH, "utf8");
  const theme = extractBlock(css, "@theme");
  const heading = extractBlock(css, "\\.text-heading");
  return {
    ink: extractDecl(theme, "--color-ink", "@theme"),
    paper: extractDecl(theme, "--color-paper", "@theme"),
    headingWeight: extractDecl(heading, "font-weight", ".text-heading"),
    headingLetterSpacing: extractDecl(heading, "letter-spacing", ".text-heading"),
  };
}

/**
 * Minimal front-matter reader for this script's own purposes only.
 *
 * This deliberately does NOT import lib/content.ts's publishedFor(). That
 * function's loadPostModule() does `import(`@/content/${slug}.mdx`)`, which
 * only resolves inside Next's own bundler (the "@/" path alias and the MDX
 * compiler both live there) — a plain Node ESM script cannot import a raw
 * .mdx file at all. Rather than shelling out to Next to get one list of
 * slugs, this reads just the YAML front-matter block (title/lang/draft),
 * which is all a brand raster needs.
 *
 * Divergence risk is low and the cost of divergence is small: this script
 * produces optional cosmetic assets, and Task 2's route files fall back to
 * the site-wide card for any slug missing a committed PNG — never a broken
 * build, never a broken image URL. The predicate below intentionally mirrors
 * lib/content.ts's isVisible()/selectForLocale(): non-draft, matching locale.
 */
async function readPublishedEntries(lang) {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue;
    const raw = await readFile(path.join(CONTENT_DIR, entry.name), "utf8");
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const fm = {};
    for (const line of fmMatch[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      fm[key] = value;
    }
    if (fm.lang !== lang) continue;
    if (fm.draft === "true") continue; // isVisible(): draft !== true
    const slug = entry.name.replace(/\.mdx?$/, "");
    results.push({ slug, title: fm.title ?? slug });
  }
  return results;
}

/**
 * The site-wide / per-post card: name (or post title) in Humane, one 1px
 * ink rule, one line in the body face. D-3.2's grammar, verbatim: ink on
 * paper, no accent, no icon, no SVG, no photograph.
 *
 * The body-face line uses a serif system stack rather than the site's real
 * Newsreader webfont. Newsreader is loaded via next/font/google, which
 * writes only a hashed .woff2 into .next/static/media at build time — not a
 * stable file this standalone script can read independently of build state.
 * Satori's inability to read variable fonts (the reason this script exists
 * at all) does not apply to a real browser, which reads .woff2 fine; the
 * blocker here is purely "no build has necessarily run yet when this script
 * runs". A generic serif is the documented, low-risk substitute — this is
 * composition, not grammar, and D-3.2's grammar (ink/paper/Humane/rule) is
 * unaffected.
 */
function cardHtml({ headline, tagline, tokens }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@font-face {
  font-family: 'Humane';
  src: url('${FONT_URL}') format('truetype');
  font-weight: 100 900;
}
html, body { margin: 0; padding: 0; }
.card {
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  box-sizing: border-box;
  padding: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  background: ${tokens.paper};
}
.headline {
  font-family: 'Humane', sans-serif;
  font-weight: ${tokens.headingWeight};
  letter-spacing: ${tokens.headingLetterSpacing};
  font-size: 120px;
  line-height: 1.05;
  margin: 0;
  color: ${tokens.ink};
}
.rule {
  width: 100%;
  height: 1px;
  background: ${tokens.ink};
}
.tagline {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 28px;
  line-height: 1.4;
  margin: 0;
  color: ${tokens.ink};
}
</style>
</head>
<body>
<div class="card">
  <div class="headline">${escapeHtml(headline)}</div>
  <div class="rule"></div>
  <div class="tagline">${escapeHtml(tagline)}</div>
</div>
</body>
</html>`;
}

/** The favicon replacement: a single "G" in Humane, ink on paper, square. */
function iconHtml({ tokens }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@font-face {
  font-family: 'Humane';
  src: url('${FONT_URL}') format('truetype');
  font-weight: 100 900;
}
html, body { margin: 0; padding: 0; }
.icon {
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${tokens.paper};
}
.g {
  font-family: 'Humane', sans-serif;
  font-weight: ${tokens.headingWeight};
  font-size: 320px;
  line-height: 1;
  margin: 0;
  color: ${tokens.ink};
}
</style>
</head>
<body>
<div class="icon"><div class="g">G</div></div>
</body>
</html>`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function assertPngDimensions(filePath, expectedWidth, expectedHeight) {
  const buffer = await readFile(filePath);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(
      `${filePath} is ${width}x${height}, expected ${expectedWidth}x${expectedHeight}`,
    );
  }
  return { width, height, bytes: buffer.length };
}

async function capture(page, html, outputPath, width, height) {
  const tmpHtmlPath = path.join(os.tmpdir(), `capture-brand-images-${Date.now()}.html`);
  await writeFile(tmpHtmlPath, html, "utf8");
  try {
    await page.setViewportSize({ width, height });
    await page.goto(`file://${tmpHtmlPath}`);
    await page.evaluate(() => document.fonts.ready);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await page.screenshot({ path: outputPath });
  } finally {
    await rm(tmpHtmlPath, { force: true });
  }
  const { width: w, height: h, bytes } = await assertPngDimensions(outputPath, width, height);
  console.log(`${outputPath}: ${w}x${h}, ${bytes} bytes`);
}

async function main() {
  const tokens = await readDesignTokens();
  console.log("Design tokens read from app/globals.css:", tokens);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    // The two site-wide cards. Route-group placement (app/(en)/,
    // app/(de)/) covers /, /cv, /writing/type by segment inheritance —
    // verified in 06-RESEARCH.md Q3 — so no per-route wiring is needed.
    await capture(
      page,
      cardHtml({ headline: SITE_NAME, tagline: TAGLINE.en, tokens }),
      path.join(REPO_ROOT, "app/(en)/opengraph-image.png"),
      CARD_WIDTH,
      CARD_HEIGHT,
    );
    await capture(
      page,
      cardHtml({ headline: SITE_NAME, tagline: TAGLINE.de, tokens }),
      path.join(REPO_ROOT, "app/(de)/opengraph-image.png"),
      CARD_WIDTH,
      CARD_HEIGHT,
    );

    await writeFile(
      path.join(REPO_ROOT, "app/(en)/opengraph-image.alt.txt"),
      ALT_TEXT.en,
      "utf8",
    );
    await writeFile(
      path.join(REPO_ROOT, "app/(de)/opengraph-image.alt.txt"),
      ALT_TEXT.de,
      "utf8",
    );
    console.log("Wrote opengraph-image.alt.txt for both locales.");

    // The favicon replacement.
    await capture(
      page,
      iconHtml({ tokens }),
      path.join(REPO_ROOT, "app/icon.png"),
      ICON_SIZE,
      ICON_SIZE,
    );

    // Per-post cards, one per published entry per locale. Task 2's route
    // files (app/(en)/writing/[slug]/opengraph-image.tsx and the German
    // equivalent) serve these bytes, falling back to the site-wide card for
    // any slug that has none.
    await mkdir(OG_DIR, { recursive: true });
    for (const lang of /** @type {const} */ (["en", "de"])) {
      const entries = await readPublishedEntries(lang);
      for (const entry of entries) {
        await capture(
          page,
          cardHtml({ headline: entry.title, tagline: SITE_NAME, tokens }),
          path.join(OG_DIR, `${entry.slug}.png`),
          CARD_WIDTH,
          CARD_HEIGHT,
        );
      }
    }
  } finally {
    await browser.close();
  }

  console.log(
    "\nDone. Look at the artifacts once (app/(en)/opengraph-image.png etc.) and confirm " +
      "the name renders in Humane, not a fallback face, before moving on.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
