import { expect, test } from "@playwright/test";

// Covers HOME-03 / D-02: /cv is one of the five destinations the landing's
// contents list names, it 404'd before this phase, and D-02 requires it to
// read as authored rather than as an unfinished site — the placeholder-word
// absence assertion (f) is the automated half of that, because "reads as
// authored" is otherwise only checkable optically.

test.beforeEach(async ({ page }) => {
  await page.goto("/cv");
  await page.evaluate(() => document.fonts.ready);
});

test("(a) /cv responds 200", async ({ page }) => {
  const response = await page.goto("/cv");
  expect(response?.status()).toBe(200);
});

test("(b) renders exactly one h1 reading CV", async ({ page }) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  expect((await h1.innerText()).trim()).toBe("CV");
});

test("(c) the h1 carries text-heading and resolves to the Humane font stack", async ({
  page,
}) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveClass(/text-heading/);

  const fontFamily = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(fontFamily.toLowerCase()).toContain("humane");
});

test("(d) the site-root back link exists once, reads the arrow string, and targets /", async ({
  page,
}) => {
  const backLink = page.getByRole("link", { name: "← Guillem Gelabert" });
  await expect(backLink).toHaveCount(1);
  // toHaveText reads textContent, not the CSS text-transform: uppercase
  // rendering — the Label role is uppercase visually but the source string
  // (and the accessible name above) stays mixed-case.
  await expect(backLink).toHaveText("← Guillem Gelabert");
  await expect(backLink).toHaveAttribute("href", "/");
});

test("(e) the back link clears the WCAG 2.5.8 24px target floor", async ({ page }) => {
  const backLink = page.getByRole("link", { name: "← Guillem Gelabert" });
  const height = await backLink.evaluate((el) => el.getBoundingClientRect().height);
  // 03-VALIDATION.md measured a Label-role line box at 18.2px, and 26.2px
  // with py-xs applied — Phase 1's scar tissue is that a computed value
  // assumed from a plan was wrong by 40px. Assert the measured floor, not
  // the arithmetic.
  expect(height).toBeGreaterThanOrEqual(24);
});

test("(f) body text contains no placeholder marker word", async ({ page }) => {
  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  for (const word of [
    "todo",
    "placeholder",
    "coming soon",
    "under construction",
    "lorem",
    "tbd",
  ]) {
    expect(bodyText).not.toContain(word);
  }
});
