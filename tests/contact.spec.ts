import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { acquireLock, releaseLock } from "./fixtures/file-lock";

// Covers PROF-03 (email obfuscation's three-part acceptance, PITFALLS #5)
// and D-2.1/D-2.2 (three channels, one shared component, absence as
// absence) in the browser. This file owns two of the three legs PITFALLS
// #5 names: keyboard reachability and copyability. The third — reading the
// address with a screen reader — is a recorded manual check owned by plan
// 06-11. Production truth for the served BYTES (as opposed to the decoded
// DOM this file reads) belongs to plan 06-09's tests/build/prerender.test.ts
// — a textContent check here reads the decoded DOM and would pass even if
// the wire carried a broken entity, which is exactly why that split exists
// (T-06-46).
//
// EMAIL and LINKEDIN are both null in the shipped lib/contact.ts (the
// no-fabrication rule — a fabricated address is a serious failure, a
// labelled absence is not), so there is nothing to exercise the keyboard/
// accessible-name/copyable legs against without a fixture. This file
// installs an OBVIOUSLY-fixture address and LinkedIn URL directly into
// lib/contact.ts on disk, waits for the dev server to recompile, runs the
// populated-state assertions, then restores the file's exact original
// bytes — the same technique tests/cv.spec.ts uses for the portrait, and
// the one already proven to work against this exact dev server/Turbopack
// setup (plan 06-04's own manual verification).
//
// FIXTURE_EMAIL and FIXTURE_LINKEDIN below are FIXTURES. Neither is a real
// contact channel and neither may ever become the value lib/contact.ts
// ships. FIXTURE_EMAIL's local part ("fixturecontact") deliberately
// contains no "@" or "." so it survives the entity-substitution step
// unchanged and can be grepped for in the raw served HTML regardless of
// which characters get encoded.

const REPO_ROOT = path.resolve(__dirname, "..");
const CONTACT_MODULE_PATH = path.join(REPO_ROOT, "lib", "contact.ts");
const LOCK_DIR = path.join(REPO_ROOT, ".contact-fixture.lock");
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

const FIXTURE_EMAIL = "fixturecontact@example.test";
const FIXTURE_LINKEDIN = "https://www.linkedin.com/in/fixturecontact-test-profile";

let originalContactSource: string | null = null;

async function waitForContactState(matcher: (body: string) => boolean, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const body = await fetch(`${BASE_URL}/cv`)
      .then((res) => res.text())
      .catch(() => "");
    if (matcher(body)) return;
    if (Date.now() > deadline) {
      throw new Error(
        `contact.spec.ts: /cv never reflected the expected contact state after ${timeoutMs}ms.`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}

// Locked with the same technique tests/fixtures/cv-portrait-fixture.ts uses
// for lib/cv.ts: --repeat-each duplicates this file's whole test tree, and
// each duplicate's serial describe block is a separate instance that
// Playwright's fullyParallel scheduling may run in a different worker
// process — without a real cross-process lock, two duplicates would race to
// mutate the same lib/contact.ts.
async function installContactFixture() {
  await acquireLock(LOCK_DIR);
  try {
    originalContactSource = readFileSync(CONTACT_MODULE_PATH, "utf8");
    let mutated = originalContactSource.replace(
      "export const EMAIL: string | null = null;",
      `export const EMAIL: string | null = "${FIXTURE_EMAIL}";`,
    );
    mutated = mutated.replace(
      "export const LINKEDIN: string | null = null;",
      `export const LINKEDIN: string | null = "${FIXTURE_LINKEDIN}";`,
    );
    if (mutated === originalContactSource) {
      throw new Error(
        "contact.spec.ts: the expected EMAIL/LINKEDIN null-state lines were not found " +
          "verbatim in lib/contact.ts — the source has drifted from what this fixture expects.",
      );
    }
    writeFileSync(CONTACT_MODULE_PATH, mutated);
    await waitForContactState((body) => body.includes("fixturecontact"));
  } catch (err) {
    if (originalContactSource !== null) {
      writeFileSync(CONTACT_MODULE_PATH, originalContactSource);
      originalContactSource = null;
    }
    releaseLock(LOCK_DIR);
    throw err;
  }
}

async function removeContactFixture() {
  try {
    if (originalContactSource === null) return;
    writeFileSync(CONTACT_MODULE_PATH, originalContactSource);
    originalContactSource = null;
    await waitForContactState((body) => !body.includes("fixturecontact"));
  } finally {
    releaseLock(LOCK_DIR);
  }
}

// Both surfaces render the same shared component from the same data module
// (D-2.2) — the landing's #contact section, and /cv's foot section, located
// the same way on both pages since both carry an h2#contact-head.
function contactSection(page: import("@playwright/test").Page) {
  return page.locator("section:has(#contact-head)");
}

async function tabUntilFocused(
  page: import("@playwright/test").Page,
  target: import("@playwright/test").Locator,
  maxPresses = 60,
): Promise<boolean> {
  for (let i = 0; i < maxPresses; i++) {
    await page.keyboard.press("Tab");
    const isFocused = await target.evaluate((el) => el === document.activeElement).catch(() => false);
    if (isFocused) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Absent state — against the real, untouched lib/contact.ts. Run first, and
// entirely independent of the fixture below, so these stay meaningful even
// if the fixture install ever fails.
// ---------------------------------------------------------------------------

test.describe("absent channels render as absence, on the real shipped module", () => {
  test("/ renders exactly one channel row (GitHub) and zero mailto links", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const section = contactSection(page);
    const rows = section.locator('ol[role="list"] > li');
    await expect(rows).toHaveCount(1);

    await expect(page.getByRole("link", { name: /mailto/i })).toHaveCount(0);
    await expect(section.locator("a[href^='mailto:']")).toHaveCount(0);
  });

  test("zero [disabled] and zero [aria-disabled] anywhere inside the contact block, on either surface", async ({
    page,
  }) => {
    for (const route of ["/", "/cv"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const section = contactSection(page);
      await expect(section.locator("[disabled]")).toHaveCount(0);
      await expect(section.locator("[aria-disabled]")).toHaveCount(0);
    }
  });

  test("the contact block renders on both / and /cv, from one component", async ({ page }) => {
    for (const route of ["/", "/cv"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const list = contactSection(page).locator('ol[role="list"]');
      await expect(list).toHaveCount(1);
      await expect(list).toHaveAttribute("role", "list");
    }
  });

  test("the GitHub link carries no target attribute, on either surface", async ({ page }) => {
    for (const route of ["/", "/cv"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const githubLink = contactSection(page).locator('a[href="https://github.com/guillem-gelabert"]');
      await expect(githubLink).toHaveCount(1);
      expect(await githubLink.getAttribute("target")).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Populated state — against a fixture EMAIL/LINKEDIN written temporarily
// into lib/contact.ts. Serial: this describe's tests must not interleave
// with each other or with the fixture install/removal, since they all read
// the same live, temporarily-mutated module.
// ---------------------------------------------------------------------------

test.describe("PROF-03: the email's keyboard, accessible-name and copyable legs, against a real fixture address", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    await installContactFixture();
  });

  test.afterAll(async () => {
    await removeContactFixture();
  });

  test("the mailto anchor is reachable by Tab and shows a visible, measured focus ring", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);

    const mailLink = page.locator(`a[href="mailto:${FIXTURE_EMAIL}"]`);
    await expect(mailLink).toHaveCount(1);

    const reached = await tabUntilFocused(page, mailLink);
    expect(reached).toBe(true);

    // Measured, not assumed: the site's focus treatment is a 2px accent
    // outline with 2px offset (.link-quiet:focus-visible in app/globals.css).
    const outline = await mailLink.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.outlineColor, width: s.outlineWidth, style: s.outlineStyle };
    });
    expect(outline.color).toBe("rgb(193, 39, 45)");
    expect(outline.width).toBe("2px");
    expect(outline.style).toBe("solid");
  });

  test("getByRole('link', {name}) resolves to exactly one element for the real address", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);

    // This is the assertion that fails if the entities leak into the
    // accessible name instead of decoding to the real address.
    const byAccessibleName = page.getByRole("link", { name: FIXTURE_EMAIL, exact: true });
    await expect(byAccessibleName).toHaveCount(1);
  });

  test("textContent equals the real address and href equals mailto: plus the real address", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);

    const mailLink = page.locator(`a[href="mailto:${FIXTURE_EMAIL}"]`);
    await expect(mailLink).toHaveCount(1);

    // The browser decodes entities at parse time, so both come out clean —
    // if they do not, the obfuscation is broken in the way that matters.
    const text = await mailLink.evaluate((el) => el.textContent ?? "");
    expect(text).toBe(FIXTURE_EMAIL);

    const href = await mailLink.getAttribute("href");
    expect(href).toBe(`mailto:${FIXTURE_EMAIL}`);
  });

  test("every channel link (Email, GitHub, LinkedIn) clears the WCAG 2.5.8 24px target floor, on both surfaces", async ({
    page,
  }) => {
    for (const route of ["/", "/cv"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const links = contactSection(page).locator('ol[role="list"] a');
      await expect(links).toHaveCount(3);

      const heights = await links.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().height),
      );
      for (const height of heights) {
        expect(height).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test("with the fixture populated, both surfaces render exactly one three-row channel list, GitHub still carries no target", async ({
    page,
  }) => {
    for (const route of ["/", "/cv"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const section = contactSection(page);
      const rows = section.locator('ol[role="list"] > li');
      await expect(rows).toHaveCount(3);

      const githubLink = section.locator('a[href="https://github.com/guillem-gelabert"]');
      await expect(githubLink).toHaveCount(1);
      expect(await githubLink.getAttribute("target")).toBeNull();

      const linkedinLink = section.locator(`a[href="${FIXTURE_LINKEDIN}"]`);
      await expect(linkedinLink).toHaveCount(1);
    }
  });
});
