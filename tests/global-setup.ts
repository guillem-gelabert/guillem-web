import type { FullConfig } from "@playwright/test";

/**
 * Warm every route before the suite runs.
 *
 * `webServer` runs `npm run dev`, and the dev server compiles each route lazily
 * on its first request. Under `fullyParallel`, a worker can therefore hit a cold
 * route and blow a 5s locator timeout while the route is still compiling — which
 * showed up as a ~1-in-3 failure on `tests/cv.spec.ts` (and earlier, on the smear
 * specs) that always passed when the file was run alone.
 *
 * Requesting each route once here moves that compile cost outside the timed
 * assertions. This addresses the cause; raising the expect timeout would only
 * have hidden it.
 */
const ROUTES = [
  "/",
  "/cv",
  "/type",
  "/writing",
  "/texte",
  "/writing/the-chart-therefore-changes",
  "/texte/die-darstellung-aendert-sich",
  "/writing/does-not-exist",
  // CR-01 (plan 06-01): every new route this phase adds goes in this list.
  "/texte/gibt-es-nicht",
  "/writing/not-found-page",
  "/texte/nicht-gefunden",
];

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    process.env.PLAYWRIGHT_BASE_URL ??
    config.projects[0]?.use?.baseURL ??
    "http://localhost:3000";

  await Promise.all(
    ROUTES.map(async (route) => {
      try {
        await fetch(`${baseURL}${route}`);
      } catch {
        // A route that cannot be reached here will fail loudly in its own spec,
        // with a better message than anything this warm-up could produce.
      }
    }),
  );
}
