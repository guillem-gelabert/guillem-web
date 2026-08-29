import { expect, test } from "@playwright/test";

// Covers WRIT-01 (SC1): a file dropped into content/ is served at
// /writing/{filename} with no per-post route file added — the slug comes
// from the filename, and the title, date and standfirst on the rendered
// page come from front-matter, not from any hand-wired page component.
test.describe("filesystem-driven routing", () => {
  test("a content file renders at /writing/{slug} with front-matter-driven title, standfirst and date", async ({
    page,
  }) => {
    const response = await page.goto("/writing/fixture");
    expect(response?.status()).toBe(200);

    // Three faces now load instead of two — wait for the font-load window
    // to settle before reading anything off the page.
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator("h1")).toHaveText("A Working Fixture for the Prose Contract");
    await expect(
      page.getByText(
        "A draft-only page assembled to exercise every rule this pipeline renders, from headings and lists to code and captioned figures.",
      ),
    ).toBeVisible();

    // Read the datetime attribute and its rendered text together, off the
    // same element, so they can't drift apart between two round trips.
    const time = page.locator("time");
    const { datetime, text } = await time.evaluate((el) => ({
      datetime: el.getAttribute("datetime"),
      text: el.textContent,
    }));
    expect(datetime).toBe("2026-08-30");
    expect(text).toBe("30 August 2026");
  });

  test("an English-locale request for a German-only slug falls through to the not-found boundary", async ({
    page,
  }) => {
    // content/nur-auf-deutsch.md is lang: de and carries no English
    // translation, so it is absent from publishedFor("en"). The allowlist
    // must reject it at the HTTP layer, not just inside lib/content.ts's
    // own unit tests.
    const response = await page.goto("/writing/nur-auf-deutsch");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("Not found");
  });

  test("the fixture's body renders an Aside and both Figures, one of them wide", async ({ page }) => {
    await page.goto("/writing/fixture");
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator("aside")).toHaveCount(1);
    await expect(page.locator("figure")).toHaveCount(2);
    await expect(page.locator("figure[data-wide]")).toHaveCount(1);
  });

  test("a fenced code block's brace renders literally, proving MDX treats fences as literal code", async ({
    page,
  }) => {
    await page.goto("/writing/fixture");
    await page.evaluate(() => document.fonts.ready);

    // The JSON block is the first <pre> in document order and is the one
    // fenced block in the fixture containing a `{` — a fenced block stays
    // literal even in .mdx, where a bare `{` in running prose would
    // otherwise be parsed as an MDX expression.
    const firstCodeBlock = page.locator("pre").first();
    await expect(firstCodeBlock).toContainText("{");
  });
});

// The German .md file's own format assertions — literal {braces} in prose
// and the raw <Aside> tag being dropped rather than rendered — run in Plan
// 06 once /texte/[slug] exists to serve content/nur-auf-deutsch.md. This
// file only proves the English route's allowlist rejects that slug.
