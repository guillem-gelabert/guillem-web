import { expect, test } from "@playwright/test";

// Covers HOME-05: /type demonstrates every declared type role (Display,
// Heading, Body, Label) at its real face/size/weight - the checkable proof
// of "a deliberate, authored typographic system" (D-05).
test("type specimen route renders all four type-scale roles", async ({ page }) => {
  await page.goto("/type");

  await expect(page.locator(".text-display").first()).toBeVisible();
  await expect(page.locator(".text-heading").first()).toBeVisible();
  await expect(page.locator(".text-body").first()).toBeVisible();

  const label = page.locator(".text-label").first();
  await expect(label).toBeVisible();
  await expect(label).toHaveCSS("text-transform", "uppercase");
});

// Covers Amendment A4: the three new link/section-head classes shipped in
// Plan 03-02 need a reference rendering, or the next phase that reaches for
// them checks against nothing. Asserted here rather than left to a visual
// pass alone because a wrong rule weight (a bare border falling through to
// currentColor) is invisible to toHaveCount and needs the computed style.
test("/type demonstrates .section-head, .link and .link-quiet exactly once each", async ({
  page,
}) => {
  await page.goto("/type");

  await expect(page.locator(".section-head")).toHaveCount(1);
  await expect(page.locator(".link")).toHaveCount(1);
  await expect(page.locator(".link-quiet")).toHaveCount(1);

  // Shape from tests/writing-index.spec.ts:104 — assert the computed colour
  // string exactly; toHaveCount alone cannot see a wrong rule weight.
  const style = await page.locator(".section-head").evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      borderBottomColor: s.borderBottomColor,
      borderBottomWidth: s.borderBottomWidth,
      borderBottomStyle: s.borderBottomStyle,
    };
  });
  expect(style.borderBottomColor).toBe("rgb(0, 0, 0)");
  expect(style.borderBottomWidth).toBe("1px");
  expect(style.borderBottomStyle).toBe("solid");
});
