import { expect, test } from "@playwright/test";

// Covers BUILD-04 / D-4.3's second verification tier: header DELIVERY on a
// real HTTP response, as opposed to config correctness. Three tiers, three
// files, three different claims — do not duplicate another tier's job here:
//   - tests/unit/csp.test.ts owns the exact production policy STRING. This
//     suite runs against `npm run dev` (playwright.config.ts's webServer),
//     so it structurally cannot observe the production value and asserts
//     directive PRESENCE only.
//   - This file owns DELIVERY: that the six headers actually reach a real
//     response, on HTML routes and on a static asset, discovered from the
//     page rather than hardcoded.
//   - The live PRODUCTION value, against the deployed Railway URL, is owned
//     by the post-deploy `curl` recorded in plan 06-11's verification.

const REQUIRED_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
];

test("/ delivers all six security headers on a real response", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  const headers = response!.headers();
  for (const name of REQUIRED_HEADERS) {
    expect(headers[name], `missing header: ${name}`).toBeTruthy();
  }
});

test("/cv delivers all six security headers on a real response", async ({ page }) => {
  const response = await page.goto("/cv");
  expect(response).not.toBeNull();
  const headers = response!.headers();
  for (const name of REQUIRED_HEADERS) {
    expect(headers[name], `missing header: ${name}`).toBeTruthy();
  }
});

test("a /_next/static/ asset, discovered from the page rather than hardcoded, also carries all six headers", async ({
  page,
  request,
}) => {
  // source: "/:path*" in next.config.ts is supposed to cover static assets
  // too — the whole reason headers() was chosen over the proxy tier for
  // BUILD-04. Assert it against a real chunk URL the page actually
  // requested, not a guessed path that could silently stop existing.
  await page.goto("/");
  const assetUrl = await page.evaluate(() => {
    const script = Array.from(document.scripts).find((s) => s.src.includes("/_next/static/"));
    return script?.src ?? null;
  });
  expect(assetUrl, "expected the page to load at least one /_next/static/ script").not.toBeNull();

  const assetResponse = await request.get(assetUrl!);
  const headers = assetResponse.headers();
  for (const name of REQUIRED_HEADERS) {
    expect(headers[name], `missing header on static asset: ${name}`).toBeTruthy();
  }
});

test("the delivered CSP carries the directives that compensate for 'unsafe-inline' — frame-ancestors, object-src, base-uri, form-action", async ({
  page,
}) => {
  const response = await page.goto("/");
  const csp = response!.headers()["content-security-policy"];
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'self'");
  expect(csp).toContain("form-action 'none'");
});

test("X-Frame-Options and X-XSS-Protection are absent — superseded and deprecated respectively (D-4.1)", async ({
  page,
}) => {
  const response = await page.goto("/");
  const headers = response!.headers();
  expect(headers["x-frame-options"]).toBeUndefined();
  expect(headers["x-xss-protection"]).toBeUndefined();
});
