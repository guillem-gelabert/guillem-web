import { expect, test } from "@playwright/test";
import { EMAIL, GITHUB, LINKEDIN } from "../lib/contact";

// Covers PROF-03 (email obfuscation's three-part acceptance, PITFALLS #5)
// and D-2.1/D-2.2 (three channels, one shared component, absence as
// absence) in the browser. This file owns two of the three legs PITFALLS
// #5 names: keyboard reachability and copyability. The third — reading the
// address with a screen reader — is a recorded manual check owned by plan
// 06-11. Production truth for the served BYTES (as opposed to the decoded
// DOM this file reads) belongs to tests/build/prerender.test.ts — a
// textContent check here reads the decoded DOM and would pass even if the
// wire carried a broken entity, which is exactly why that split exists
// (T-06-46).
//
// THIS FILE USED TO CARRY A FIXTURE. EMAIL and LINKEDIN were both null in
// the shipped module, so exercising the keyboard/accessible-name/copyable
// legs meant temporarily rewriting lib/contact.ts on disk, waiting for
// Turbopack to recompile, asserting, and restoring the original bytes under
// a cross-process lock. All of that is gone: both channels now ship
// populated (with placeholder values — see lib/contact.ts), so every leg is
// exercisable against the real served page. A fixture that mutates source
// files is a liability to keep once the state it simulated is the state
// that ships.
//
// The absence half of D-2.1 did not go untested with it. channels()'s
// omit-rather-than-grey-out behaviour is covered exhaustively in
// tests/unit/contact.test.ts:57-83 against all four null combinations,
// which is a better home for it than a browser spec that could only ever
// observe one combination at a time.

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
    const isFocused = await target
      .evaluate((el) => el === document.activeElement)
      .catch(() => false);
    if (isFocused) return true;
  }
  return false;
}

// Read from the module rather than retyped, so these specs follow the real
// values through the placeholder era and out the other side without an edit.
// A null here is a legitimate state the site can return to, and the guarded
// tests below skip rather than fail if it does.
const SURFACES = ["/", "/cv"];

test.describe("the shared contact block, on both surfaces", () => {
  test("renders on / and /cv from one component, as a single semantic list", async ({ page }) => {
    for (const route of SURFACES) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const list = contactSection(page).locator('ol[role="list"]');
      await expect(list).toHaveCount(1);
      await expect(list).toHaveAttribute("role", "list");
    }
  });

  test("renders exactly the channels that are non-null — no empty row, no greyed-out row", async ({
    page,
  }) => {
    const expectedRows = [EMAIL, GITHUB, LINKEDIN].filter((value) => value !== null).length;

    for (const route of SURFACES) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const rows = contactSection(page).locator('ol[role="list"] > li');
      await expect(rows).toHaveCount(expectedRows);
    }
  });

  test("zero [disabled] and zero [aria-disabled] anywhere inside the contact block, on either surface", async ({
    page,
  }) => {
    for (const route of SURFACES) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const section = contactSection(page);
      await expect(section.locator("[disabled]")).toHaveCount(0);
      await expect(section.locator("[aria-disabled]")).toHaveCount(0);
    }
  });

  test("the GitHub link carries no target attribute, on either surface", async ({ page }) => {
    for (const route of SURFACES) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const githubLink = contactSection(page).locator(`a[href="${GITHUB}"]`);
      await expect(githubLink).toHaveCount(1);
      expect(await githubLink.getAttribute("target")).toBeNull();
    }
  });

  test("every channel link clears the WCAG 2.5.8 24px target floor, on both surfaces", async ({
    page,
  }) => {
    const expectedRows = [EMAIL, GITHUB, LINKEDIN].filter((value) => value !== null).length;

    for (const route of SURFACES) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const links = contactSection(page).locator('ol[role="list"] a');
      await expect(links).toHaveCount(expectedRows);

      const heights = await links.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().height),
      );
      for (const height of heights) {
        expect(height).toBeGreaterThanOrEqual(24);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// PROF-03's three-part acceptance (PITFALLS #5), against the address the
// site actually serves. Guarded on EMAIL rather than assuming it: an empty
// contact channel is a state lib/contact.ts explicitly permits, and a spec
// that hard-failed on it would be asserting today's data, not the contract.
// ---------------------------------------------------------------------------

test.describe("PROF-03: the email's keyboard, accessible-name and copyable legs", () => {
  test.skip(EMAIL === null, "EMAIL is null in lib/contact.ts — nothing to read, tab to or copy");

  const address = EMAIL as string;

  test("the mailto anchor is reachable by Tab and shows a visible, measured focus ring", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);

    const mailLink = page.locator(`a[href="mailto:${address}"]`);
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

  test("getByRole('link', {name}) resolves to exactly one element for the served address", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);

    // This is the assertion that fails if the entities leak into the
    // accessible name instead of decoding to the real address.
    const byAccessibleName = page.getByRole("link", { name: address, exact: true });
    await expect(byAccessibleName).toHaveCount(1);
  });

  test("textContent equals the address and href equals mailto: plus the address", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.evaluate(() => document.fonts.ready);

    const mailLink = page.locator(`a[href="mailto:${address}"]`);
    await expect(mailLink).toHaveCount(1);

    // The browser decodes entities at parse time, so both come out clean —
    // if they do not, the obfuscation is broken in the way that matters.
    const text = await mailLink.evaluate((el) => el.textContent ?? "");
    expect(text).toBe(address);

    const href = await mailLink.getAttribute("href");
    expect(href).toBe(`mailto:${address}`);
  });
});

test.describe("PROF-05: the LinkedIn row", () => {
  test.skip(LINKEDIN === null, "LINKEDIN is null in lib/contact.ts — the row is absent by design");

  test("resolves to exactly one link at the declared URL, on both surfaces", async ({ page }) => {
    for (const route of SURFACES) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const linkedinLink = contactSection(page).locator(`a[href="${LINKEDIN}"]`);
      await expect(linkedinLink).toHaveCount(1);
      expect(await linkedinLink.getAttribute("target")).toBeNull();
    }
  });
});
