import { defineConfig, devices } from "@playwright/test";

// Port 3000 is not this machine's to assume. Other projects in this vault
// run their own `next dev` there, and when one is up, Playwright's
// `reuseExistingServer` happily adopts it — the suite then runs green-ish
// against a completely different application, reporting 404s on every route
// this repo owns rather than "the server is not mine". That failure mode has
// now cost two debugging sessions, so the port is a variable.
//
// `npm run dev` reads PORT too (Next honours it), so setting one variable
// moves the server and the client together. Kept at 3000 by default because
// every recorded measurement in .planning/ was taken there.
const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
