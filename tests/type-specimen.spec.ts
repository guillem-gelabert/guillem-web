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
