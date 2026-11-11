import { expect, test } from "@playwright/test";

// The language switch shows a flag per language (components/flag.tsx), and
// keeps the words as the link's accessible name and tooltip.
const CASES = [
  { url: "/writing/the-worst-business-in-the-world", to: ["de", "ca"] },
  { url: "/texte/das-schlechteste-geschaeft-der-welt", to: ["en", "ca"] },
];

for (const { url, to } of CASES) {
  test(`${url} switches language by flag`, async ({ page }) => {
    await page.goto(url);
    for (const locale of to) {
      const link = page.locator(`a[hreflang="${locale}"][lang="${locale}"]`).first();
      await expect(link).toHaveCount(1);
      // No visible words, a flag instead…
      expect((await link.textContent())?.trim()).toBe("");
      const flag = link.locator("svg.lang-flag");
      await expect(flag).toHaveCount(1);
      await expect(flag).toHaveAttribute("aria-hidden", "true");
      const box = await flag.boundingBox();
      expect(box!.height).toBeGreaterThan(8);
      expect(box!.width).toBeGreaterThan(box!.height);
      // …and the words as its name and tooltip.
      const label = await link.getAttribute("aria-label");
      expect(label?.length).toBeGreaterThan(3);
      await expect(link).toHaveAttribute("title", label!);
    }
  });
}

test("the switch keeps its accessible names", async ({ page }) => {
  await page.goto(CASES[0].url);
  await expect(page.getByRole("link", { name: "Auf Deutsch lesen" })).toHaveCount(1);
});
