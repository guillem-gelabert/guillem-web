// scripts/snapshot-live-text.mjs
//
// Build-time tooling. Invoked by hand as `node scripts/snapshot-live-text.mjs`.
// It runs entirely offline from this application — it visits four live pages
// on a third-party origin and writes their rendered text to disk under
// .planning/phases/04-the-case-study/live-text/, which is then committed.
// This is the offline authority for D-19's accuracy gate: research proved the
// vault drafts differ from what shipped (en_with_charts.md's standfirst is
// not the live standfirst), so every sentence this phase presents as a
// quotation must be checkable against these files rather than against a
// working copy. See .planning/phases/04-the-case-study/04-RESEARCH.md
// § "Corrections to CONTEXT" (C-2) and 04-CONTEXT.md § Canonical References
// → "Live pages (verified 2026-08-31)".

import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = path.join(
  process.cwd(),
  ".planning",
  "phases",
  "04-the-case-study",
  "live-text",
);

// Navigate directly to each URL — never to the site root, for the same
// client-side-redirect reason as capture-case-study-figures.mjs.
const PAGES = [
  {
    url: "https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing",
    file: "en-story.txt",
  },
  {
    url: "https://ib-gdp.guillemgelabert.com/auf-mallorca-weiss-es-jeder",
    file: "de-story.txt",
  },
  {
    url: "https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing/methodology",
    file: "en-methodology.txt",
  },
  {
    url: "https://ib-gdp.guillemgelabert.com/auf-mallorca-weiss-es-jeder/methodik",
    file: "de-methodology.txt",
  },
];

const SETTLE_MS = 200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Scroll the document to its bottom in viewport-height increments with a
// short settle between increments, so any step prose or lazily-mounted
// content that appears on scroll is present in the captured text.
async function scrollToBottom(page) {
  let previousHeight = -1;
  for (;;) {
    const { scrollY, innerHeight, scrollHeight } = await page.evaluate(() => ({
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }));

    if (scrollHeight === previousHeight && scrollY + innerHeight >= scrollHeight) break;
    previousHeight = scrollHeight;

    await page.evaluate((step) => {
      window.scrollTo({ top: window.scrollY + step, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
    }, innerHeight);
    await sleep(SETTLE_MS);

    const after = await page.evaluate(() => ({
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    if (after.scrollY + after.innerHeight >= after.scrollHeight) break;
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const written = [];

  try {
    for (const { url, file } of PAGES) {
      await page.goto(url);
      await scrollToBottom(page);

      const text = await page.evaluate(() => document.body.innerText);
      const timestamp = new Date().toISOString();
      const header = `// Source: ${url}\n// Fetched: ${timestamp}\n`;
      const outputPath = path.join(OUTPUT_DIR, file);
      await writeFile(outputPath, header + text, "utf8");

      written.push({ path: outputPath, chars: text.length });
      console.log(`${outputPath}: ${text.length} chars`);
    }
  } finally {
    await browser.close();
  }

  // Self-verify. Every file exceeds 3,000 characters of body text, and three
  // anchor strings — verified verbatim on the live pages during research —
  // prove the snapshot captured the real prose rather than a shell or an
  // error page.
  for (const { path: filePath, chars } of written) {
    if (chars <= 3000) {
      throw new Error(`${filePath} is only ${chars} characters of body text, expected > 3000`);
    }
  }

  const readBody = (file) => readFile(path.join(OUTPUT_DIR, file), "utf8");

  const enStory = await readBody("en-story.txt");
  if (!enStory.includes("The chart therefore changes.")) {
    throw new Error("en-story.txt does not contain the exact string 'The chart therefore changes.'");
  }

  const deStory = await readBody("de-story.txt");
  if (!deStory.includes("Dafür ändert sich die Darstellung.")) {
    throw new Error(
      "de-story.txt does not contain the exact string 'Dafür ändert sich die Darstellung.'",
    );
  }

  const enMethodology = await readBody("en-methodology.txt");
  if (
    !enMethodology.includes("Using 2000 rather than 2022 changes the estimate by more than 20%.")
  ) {
    throw new Error(
      "en-methodology.txt does not contain the exact string 'Using 2000 rather than 2022 changes the estimate by more than 20%.'",
    );
  }

  console.log("all anchors matched");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
