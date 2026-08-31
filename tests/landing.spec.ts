import { expect, test } from "@playwright/test";

// Covers HOME-01, HOME-03, HOME-04, WORK-01, WORK-02 and the CASE-03 slot's
// structure — the eleven rows 03-VALIDATION.md's requirement->test map
// assigns to this file, the single largest Wave 0 gap in the phase.
//
// Three assertion-shape lessons this file is built around:
// (i) Computed values are read from a real render, never assumed. Phase 1's
//     tests/viewport.spec.ts had to assert the nameplate's real clamp()
//     output — 139.2px at 1440px — where the plan's own text assumed
//     "≈180px near-ceiling". Every measured value below (target sizes, the
//     separator colour, scroll-margin-top) is read the same way: from
//     getBoundingClientRect()/getComputedStyle() against a real render, not
//     derived from the plan's or the UI-SPEC's arithmetic.
// (ii) Copy that depends on draft visibility is NOT asserted here. This spec
//     runs against `npm run dev`, where showDrafts() is always true (dev is
//     NODE_ENV=development), so the featured slot's interim strings would
//     read as "published" the moment a future phase authors the case study
//     as draft: true in dev, while production still renders "interim" — a
//     spec asserting that copy would go red with no Phase 3 file changed.
//     That split lives in tests/build/prerender.test.ts, which reads real
//     `next build` output instead (Pitfall 2).
// (iii) "A title appears on /" is not a meaningful assertion on its own: `/`
//     already inherits a title and a description from app/(en)/layout.tsx,
//     so that assertion would have passed before this phase's change and
//     proven nothing (03-RESEARCH.md C-2). Every assertion below reads a
//     specific value this phase is responsible for, not merely presence.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

// ---------------------------------------------------------------------------
// Task 1: HOME-03 (the navigation surface) and HOME-01 (the positioning
// sentence)
// ---------------------------------------------------------------------------

test("(a) nav[aria-label=Sections] holds exactly 5 links, in reader-importance order", async ({
  page,
}) => {
  const nav = page.locator('nav[aria-label="Sections"]');
  await expect(nav).toHaveCount(1);

  const links = nav.locator("a");
  await expect(links).toHaveCount(5);

  const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  // Reader-importance order, not page order: Writing sits second because it
  // is the only route here that already holds shipped content. A sixth link
  // to #case-study is deliberately absent — that section sits immediately
  // beneath this nav, and a link to what the reader is already looking at
  // is noise, not navigation.
  expect(hrefs).toEqual(["#work", "/writing", "#backlog", "/cv", "#contact"]);

  const labels = await links.evaluateAll((els) =>
    els.map((el) => (el.textContent ?? "").trim()),
  );
  expect(labels).toEqual(["Work", "Writing", "Backlog", "CV", "Contact"]);
});

test("(b) every nav link clears the WCAG 2.5.8 24px target-size floor", async ({ page }) => {
  const links = page.locator('nav[aria-label="Sections"] a');
  await expect(links).toHaveCount(5);

  const heights = await links.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().height),
  );
  // Measured, not assumed: a Label-role link's line box is 18.2px, under the
  // 24px floor. py-xs (4px) takes it to 26.2px — a 2.2px margin small enough
  // that a dropped py-xs would fail here and nowhere else, so the assertion
  // reads the real box rather than trusting the class list is present.
  for (const height of heights) {
    expect(height).toBeGreaterThanOrEqual(24);
  }
});

test("(c) every section[id] anchors at scroll-margin-top: 32px, in fixed order", async ({
  page,
}) => {
  const sections = page.locator("section[id]");
  await expect(sections).toHaveCount(4);

  const ids = await sections.evaluateAll((els) => els.map((el) => el.id));
  expect(ids).toEqual(["case-study", "work", "backlog", "contact"]);

  // scroll-mt-xl exists so an anchor jump does not park the section head
  // flush against the viewport edge.
  const scrollMargins = await sections.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).scrollMarginTop),
  );
  for (const margin of scrollMargins) {
    expect(margin).toBe("32px");
  }
});

test("(d) no smooth scrolling on the document", async ({ page }) => {
  // Two concrete reasons from the Motion Contract: smooth scrolling is
  // motion that would need its own reduced-motion branch, and it fires a
  // long burst of scroll events, each of which advances the trail's
  // trailHue — a single anchor click would spin the hue through a large arc.
  const scrollBehavior = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );
  expect(scrollBehavior).not.toBe("smooth");
});

test("(e) exactly one h1, reading Guillem Gelabert, carrying text-display", async ({ page }) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText("Guillem Gelabert");
  await expect(h1).toHaveClass(/text-display/);
});

test("(f) the positioning sentence renders once at computed font-weight 530", async ({
  page,
}) => {
  const standfirst = page.locator("header p.text-standfirst");
  await expect(standfirst).toHaveCount(1);

  const fontWeight = await standfirst.evaluate((el) => getComputedStyle(el).fontWeight);
  expect(fontWeight).toBe("530");
});

test("(g) the one-source property: meta[name=description] equals the rendered positioning <p>", async ({
  page,
}) => {
  // This is the phase's most important assertion, and the reason it is
  // shaped this way is not obvious. Pitfall 6: the user eventually writes
  // the positioning sentence into the <p>, and the <meta name="description">
  // could still say "Developer." — which is what Slack, LinkedIn and
  // eventually Google quote once Phase 6 flips FIND-02. Asserting EQUALITY
  // rather than a literal string proves the property that matters: it keeps
  // passing when the user's real sentence lands, and it fails the moment the
  // two drift. The literal-value assertion against production HTML belongs
  // in tests/build/prerender.test.ts (Plan 03-08) — do NOT hardcode the
  // current placeholder word here.
  const metaContent = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  const standfirstText = await page.locator("header p.text-standfirst").innerText();
  expect(metaContent).toBe(standfirstText.trim());
});
