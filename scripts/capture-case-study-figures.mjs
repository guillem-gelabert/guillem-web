// scripts/capture-case-study-figures.mjs
//
// Build-time tooling. Invoked by hand as
// `node scripts/capture-case-study-figures.mjs`. It runs entirely offline
// from this application — it drives a third-party live site with a headless
// browser and writes three PNGs to public/case-study/, which are then
// committed to the repository. Nothing under app/ may ever fetch
// ib-gdp.guillemgelabert.com at request time: the live-site dependency this
// case study has is discharged the moment these files are committed, not
// carried into production.
//
// Ports a subset of the production-tested settle driver from
// ib-gdp-evolution/tests/e2e/helpers/story-driver.ts — readLifecycle,
// waitForNewerGeneration, waitForChartIdle, waitForActiveStep,
// scrollStepIntoView and scrollToStep — rather than re-deriving the
// animation oracle. Function bodies and their comments are carried across
// verbatim; only the entry point and figure-specific logic are new. See
// .planning/phases/04-the-case-study/04-RESEARCH.md
// § "Figures — capture is a solved problem" for the measurements this
// encodes and 04-CONTEXT.md D-07/D-08 for why screenshots of the live piece
// are the only honest source for these figures.

import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

// The canonical story URL, not the site root. The app root is a client-side
// language redirect; navigating to it races location.replace and aborts with
// net::ERR_ABORTED.
const STORY_URL = "https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing";

// Act 1 is the first .explainer-root on the page, Act 2 the second.
const ACT2 = 1;

// Failure ceiling, not a wait — a legitimate settle runs ~1.4-2.1s (a
// full-width domain rescale or the Act II mode tween) plus up to ~1.2s of
// per-series stagger (200ms x up to 6 positions). An idle chart resolves at
// once; this timeout only fires when something is actually wrong.
const SETTLE_TIMEOUT_MS = 10000;

const OUTPUT_DIR = path.join(process.cwd(), "public", "case-study");

// DOM data-step is 1-indexed; data-active-step and the shipped ACT2_STEPS
// key are 0-indexed (story-driver.ts: `const stepIndex = dataStep - 1`).
// The three targets are ACT2_STEPS keys s2, s5 and s11 — DOM data-step
// values 3, 6 and 12 respectively. F2 takes data-step 6 (key s5), not 7
// (key s6): s5 is both the axis switch to pct-eu27 AND the Ireland/Bulgaria
// calibration of the new scale that the prose describes; s6 drops back to
// just the Balearics and the EU average and shows nothing about the new
// measure.
const FIGURES = [
  { dataStep: 3, file: "f1-constant-dollars.png" }, // ACT2_STEPS key s2
  { dataStep: 6, file: "f2-eu-average.png" }, // ACT2_STEPS key s5
  { dataStep: 12, file: "f3-arrivals-diverge.png" }, // ACT2_STEPS key s11
];

function explainerRoot(page, rootIndex) {
  return page.locator(".explainer-root").nth(rootIndex);
}

function chartSvg(page, rootIndex) {
  return explainerRoot(page, rootIndex).locator("svg").first();
}

// Ported from story-driver.ts. Reads the chart's animation lifecycle off two
// DOM contracts: `.explainer-root[data-active-step]` (the step
// chart-explainer.vue considers active, -1 before the first) and
// `svg[data-animation-generation][data-animation-state]` (line-chart.vue's
// animation lifecycle — each update() opens a generation, and state reaches
// "idle" only once every transition that generation scheduled has ended,
// been interrupted, or been cancelled, which is exactly when the DOM equals
// the committed target).
async function readLifecycle(page, rootIndex) {
  return page.evaluate((index) => {
    const root = document.querySelectorAll(".explainer-root")[index];
    const svg = root?.querySelector("svg");
    return {
      generation: Number(svg?.getAttribute("data-animation-generation") ?? "-1"),
      state: svg?.getAttribute("data-animation-state") ?? null,
      activeStep: Number(root?.getAttribute("data-active-step") ?? "-1"),
    };
  }, rootIndex);
}

async function chartGeneration(page, rootIndex) {
  return (await readLifecycle(page, rootIndex)).generation;
}

// Resolves once a generation strictly newer than `after` exists, returning it.
async function waitForNewerGeneration(page, rootIndex, after) {
  const handle = await page.waitForFunction(
    ({ index, previous }) => {
      const svg = document.querySelectorAll(".explainer-root")[index]?.querySelector("svg");
      const generation = Number(svg?.getAttribute("data-animation-generation") ?? "-1");
      return generation > previous ? generation : false;
    },
    { index: rootIndex, previous: after },
    { timeout: SETTLE_TIMEOUT_MS },
  );
  return handle.jsonValue();
}

// Resolves once the chart is idle at `generation` or later. Later counts: a
// superseding update means the generation we were watching was interrupted,
// and whatever replaced it is the state under test.
async function waitForChartIdle(page, rootIndex, generation) {
  const handle = await page.waitForFunction(
    ({ index, atLeast }) => {
      const svg = document.querySelectorAll(".explainer-root")[index]?.querySelector("svg");
      if (!svg || svg.getAttribute("data-animation-state") !== "idle") return false;
      const current = Number(svg.getAttribute("data-animation-generation") ?? "-1");
      return current >= atLeast ? current : false;
    },
    { index: rootIndex, atLeast: generation },
    { timeout: SETTLE_TIMEOUT_MS },
  );
  return handle.jsonValue();
}

async function waitForActiveStep(page, rootIndex, step) {
  await page.waitForFunction(
    ({ index, expected }) =>
      Number(
        document.querySelectorAll(".explainer-root")[index]?.getAttribute("data-active-step") ??
          "-1",
      ) === expected,
    { index: rootIndex, expected: step },
    { timeout: SETTLE_TIMEOUT_MS },
  );
}

// Puts a step's midpoint at the viewport centre and nudges the scroll
// listener. The nudge matters because an instant programmatic scroll does
// not always emit a scroll event of its own, and the step then never
// activates.
async function scrollStepIntoView(page, rootIndex, dataStep) {
  const el = explainerRoot(page, rootIndex).locator(`.step[data-step="${dataStep}"]`);
  await el.waitFor({ state: "attached" });
  await el.evaluate((step) => {
    const rect = step.getBoundingClientRect();
    const target = rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2;
    window.scrollTo({ top: target, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
  });
}

// The driver: capture the generation, scroll, confirm the step took, wait
// for a strictly newer generation, then wait for it to settle. Returns the
// idle generation.
//
// Re-targeting the step that is already active is a no-op for the chart —
// no props change, so no update() and no new generation — so that case only
// waits for anything already in flight to finish.
async function scrollToStep(page, rootIndex, dataStep) {
  const before = await readLifecycle(page, rootIndex);
  const stepIndex = dataStep - 1;
  await scrollStepIntoView(page, rootIndex, dataStep);
  await waitForActiveStep(page, rootIndex, stepIndex);
  if (before.activeStep === stepIndex) {
    return waitForChartIdle(page, rootIndex, before.generation);
  }
  const generation = await waitForNewerGeneration(page, rootIndex, before.generation);
  return waitForChartIdle(page, rootIndex, generation);
}

// Overlap probe. This is the one hazard the settle oracle gives no runtime
// warning sign for: in desktop layout the chart panel is a full-screen
// overlay and the step prose card is painted on top of the chart, so an
// element screenshot silently captures whatever else is painted in the box.
// Read the Act 2 SVG's bounding rect and the bounding rects of every .step
// element whose computed opacity is greater than 0 (mirroring the
// `.explainer-root .step` selector the opacity injection targets), and
// throw naming the offending step(s) if any rect intersects the SVG box.
async function assertNoStepOverlapsChart(page, rootIndex, figureName) {
  const offending = await page.evaluate((index) => {
    const root = document.querySelectorAll(".explainer-root")[index];
    const svg = root?.querySelector("svg");
    if (!svg) return [];
    const svgRect = svg.getBoundingClientRect();
    const steps = Array.from(document.querySelectorAll(".step"));
    const hits = [];
    for (const step of steps) {
      const opacity = Number(window.getComputedStyle(step).opacity);
      if (opacity <= 0) continue;
      const rect = step.getBoundingClientRect();
      const intersects =
        rect.left < svgRect.right &&
        rect.right > svgRect.left &&
        rect.top < svgRect.bottom &&
        rect.bottom > svgRect.top;
      if (intersects) {
        hits.push(step.getAttribute("data-step") ?? "(unknown step)");
      }
    }
    return hits;
  }, rootIndex);

  if (offending.length > 0) {
    throw new Error(
      `${figureName}: step prose card(s) [data-step=${offending.join(", ")}] overlap the chart SVG — the "opacity: 0 !important" injection did not take effect before this screenshot.`,
    );
  }
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

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // Never page.goto("/") — see STORY_URL comment above.
    await page.goto(STORY_URL);

    const act2Root = explainerRoot(page, ACT2);
    await act2Root.locator(".step").first().waitFor({ state: "attached" });
    await chartSvg(page, ACT2).waitFor({ state: "visible" });
    // The series data arrives after mount and triggers a second, static
    // render; waiting for idle covers both without caring which one we
    // caught.
    await waitForChartIdle(page, ACT2, 0);

    // Act 2 sits below the outro — scroll it into view before driving Act 2's
    // steps, or scrollStepIntoView's midpoint math lands on the wrong target.
    const beforeOutro = await chartGeneration(page, ACT2);
    await page.evaluate(() => {
      document.querySelector("#outro")?.scrollIntoView({ behavior: "instant", block: "start" });
      window.dispatchEvent(new Event("scroll"));
    });
    await waitForChartIdle(page, ACT2, beforeOutro);

    let totalBytes = 0;
    const targets = new Map(FIGURES.map((figure) => [figure.dataStep, figure]));
    const lastStep = Math.max(...FIGURES.map((figure) => figure.dataStep));

    // Walk 1..lastStep in order, settling every intermediate step. The chart
    // is path-dependent — a reveal grows or draws depending on the step
    // before it — so jumping straight to step 12 would render a state that
    // never actually occurs when a reader scrolls through in order. This is
    // the settle-each-step path, not the fast one, because the subject of
    // each capture is a settled intermediate state.
    for (let dataStep = 1; dataStep <= lastStep; dataStep += 1) {
      await scrollToStep(page, ACT2, dataStep);

      const figure = targets.get(dataStep);
      if (!figure) continue;

      // Mandatory, applied after settle and before every screenshot: the
      // desktop chart panel is a full-screen overlay and the step prose card
      // is painted on top of the chart. opacity rather than display: none or
      // visibility: hidden deliberately — those collapse layout and would
      // break step activation for any steps still to come in the walk.
      await page.addStyleTag({ content: ".explainer-root .step { opacity: 0 !important }" });

      await assertNoStepOverlapsChart(page, ACT2, figure.file);

      const outputPath = path.join(OUTPUT_DIR, figure.file);
      await chartSvg(page, ACT2).screenshot({ path: outputPath });

      const { width, height, bytes } = await assertPngDimensions(outputPath, 2400, 1640);
      totalBytes += bytes;
      console.log(`${outputPath}: ${width}x${height}, ${bytes} bytes`);
    }

    console.log(`Total bytes written: ${totalBytes}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
