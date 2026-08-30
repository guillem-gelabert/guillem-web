import { expect, test } from "@playwright/test";

// Covers I18N-01: two root layouts, no locale prefix in either URL, a
// translated piece crossable in both directions, an untranslated piece
// rendering no switch at all, hreflang/canonical on every page, localised
// dates, and the robots noindex meta surviving the layout split — plus the
// German .md format facts (literal braces, dropped raw HTML) now that a
// German route exists to serve content/nur-auf-deutsch.md.
//
// Two Phase 1 lessons apply (STATE.md, 02-VALIDATION.md): assert computed
// values measured from a real render, not values assumed from the plan
// (the exact rendered date text below is read off the fixtures' real
// front-matter, not an illustrative placeholder); and
// page.emulateMedia({ reducedMotion: 'reduce' }) isn't needed here — this
// spec measures static markup, not motion — recorded for consistency.

test("/writing and /writing/fixture serve html lang=en; /texte, /texte/musterseite and /texte/nur-auf-deutsch serve html lang=de", async ({
  page,
}) => {
  const englishPaths = ["/writing", "/writing/fixture"];
  const germanPaths = ["/texte", "/texte/musterseite", "/texte/nur-auf-deutsch"];

  for (const path of englishPaths) {
    await page.goto(path);
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe("en");
    expect(path).not.toMatch(/^\/de\//);
  }

  for (const path of germanPaths) {
    await page.goto(path);
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe("de");
    expect(path).not.toMatch(/^\/de\//);
  }
});

test("the switcher's present branch crosses from English to German and back", async ({
  page,
}) => {
  await page.goto("/writing/fixture");
  await page.evaluate(() => document.fonts.ready);

  const toDe = page.getByRole("link", { name: "Auf Deutsch lesen" });
  await expect(toDe).toHaveAttribute("hreflang", "de");
  await expect(toDe).toHaveAttribute("href", "/texte/musterseite");

  // Cross-locale navigation between two root layouts is a genuine full page
  // load, not a client transition — and in dev mode Turbopack compiles a
  // route on its first hit, which can take longer than a click's default
  // wait under parallel load. waitForURL's own timeout (not toHaveURL's
  // default 5s) accommodates that first-compile latency honestly rather
  // than papering over it with a retry.
  await toDe.click();
  await page.waitForURL(/\/texte\/musterseite$/, { timeout: 15000 });
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("de");

  const toEn = page.getByRole("link", { name: "Read in English" });
  await expect(toEn).toHaveAttribute("hreflang", "en");
  await expect(toEn).toHaveAttribute("href", "/writing/fixture");

  await toEn.click();
  await page.waitForURL(/\/writing\/fixture$/, { timeout: 15000 });
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("en");
});

// D-07: a dead affordance is worse than no affordance. Assert absence from
// the DOM, not disabled-ness — no aria-disabled anywhere on the page.
test("the switcher's absent branch — no translation, no switch, no aria-disabled anywhere", async ({
  page,
}) => {
  await page.goto("/texte/nur-auf-deutsch");
  await page.evaluate(() => document.fonts.ready);

  await expect(page.getByText("Auf Deutsch lesen")).toHaveCount(0);
  await expect(page.getByText("Read in English")).toHaveCount(0);
  await expect(page.locator("[aria-disabled]")).toHaveCount(0);
});

test("hreflang alternates plus x-default and a canonical are emitted on a translated page", async ({
  page,
}) => {
  await page.goto("/writing/fixture");

  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test("an untranslated page still emits a resolvable de alternate and x-default, with no en alternate", async ({
  page,
}) => {
  await page.goto("/texte/nur-auf-deutsch");

  await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(0);
});

test("localised dates render the correct shape, text and datetime together", async ({ page }) => {
  await page.goto("/writing/fixture");
  await page.evaluate(() => document.fonts.ready);

  const enTime = page.locator("time").first();
  const en = await enTime.evaluate((el) => ({
    datetime: el.getAttribute("datetime"),
    text: el.textContent,
  }));
  expect(en.datetime).toBe("2026-08-30");
  expect(en.text).toBe("30 August 2026");

  await page.goto("/texte/musterseite");
  await page.evaluate(() => document.fonts.ready);

  const deTime = page.locator("time").first();
  const de = await deTime.evaluate((el) => ({
    datetime: el.getAttribute("datetime"),
    text: el.textContent,
  }));
  expect(de.datetime).toBe("2026-08-30");
  expect(de.text).toBe("30. August 2026");
});

test("robots noindex survives the root-layout split — present on both a /writing/* and a /texte/* page", async ({
  page,
}) => {
  await page.goto("/writing/fixture");
  const enRobots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(enRobots).toContain("noindex");

  await page.goto("/texte/musterseite");
  const deRobots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(deRobots).toContain("noindex");
});

test(".md format facts on the German route: literal braces survive, raw HTML is dropped, Shiki still highlights", async ({
  page,
}) => {
  await page.goto("/texte/nur-auf-deutsch");
  await page.evaluate(() => document.fonts.ready);

  // A bare `{` in running prose would be parsed as an MDX expression in
  // .mdx; format: 'md' keeps it literal, proving one plugin chain still
  // treats .md's prose as plain text while it highlights the fenced block.
  await expect(page.getByText("{geschweifte Klammern}")).toBeVisible();

  // The raw <Aside> tag's inner text survives in the surrounding paragraph,
  // but no <aside> element is produced — raw HTML is dropped in format: 'md',
  // the safety property that makes it the right format for the v2 archive.
  await expect(page.getByText("Dieser Text bleibt.")).toBeVisible();
  await expect(page.locator("aside")).toHaveCount(0);

  await expect(page.locator("pre.shiki")).toHaveCount(1);
});
