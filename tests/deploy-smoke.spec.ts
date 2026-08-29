import { expect, test } from "@playwright/test";

// Covers BUILD-02: the live Railway URL serves the real Next.js app, not the
// old static prototype-stack.html (which has zero occurrences of "__next" or
// "_next/static" in its markup — confirmed against the deleted file at
// git show HEAD~1:prototype-stack.html).
//
// Deviation from plan: the plan specified checking for a
// `script#__NEXT_DATA__` tag / "__NEXT_DATA__" string. That marker is a
// Pages Router convention and does not exist in Next.js 16 App Router output
// (confirmed by inspecting the actual rendered HTML) — App Router streams
// hydration data via `self.__next_f.push(...)` RSC payload scripts instead.
// Asserting on `__next_f` + a `/_next/static/` script src achieves the same
// goal (a marker absent from the old static prototype, present in any real
// Next.js App Router response) without depending on a marker that no longer
// exists in the framework's current output.
//
// Runs against local `next dev` by default (via playwright.config.ts
// baseURL), and against the live deployed URL when PLAYWRIGHT_BASE_URL is
// set.
test("home page responds 200 and serves the real Next.js app", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page.locator('script[src*="/_next/static/"]').first()).toBeAttached();

  const html = await page.content();
  expect(html).toContain("__next_f");
});
