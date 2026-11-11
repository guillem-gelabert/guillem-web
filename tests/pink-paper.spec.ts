import { expect, test } from "@playwright/test";

// theme: pink-paper (components/pink-paper.tsx). The Hempton post in all
// three locales is set like a business paper's article: salmon paper, a
// kicker over a display-serif headline, a Georgia body, no standfirst on
// the page (hideStandfirst) though it still feeds the meta description.
const POSTS = [
  { url: "/writing/the-worst-business-in-the-world", kicker: "Artificial intelligence" },
  { url: "/texte/das-schlechteste-geschaeft-der-welt", kicker: "Künstliche Intelligenz" },
  { url: "/escrits/el-pitjor-negoci-del-mon", kicker: "Intel·ligència artificial" },
];

for (const { url, kicker } of POSTS) {
  test(`${url} renders through the pink-paper theme`, async ({ page }) => {
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    const facts = await page.evaluate(() => {
      const headline = document.querySelector(".pp-headline");
      const p = document.querySelector(".pp .prose-site p");
      return {
        h1s: document.querySelectorAll("h1").length,
        headlineIsH1: headline?.tagName === "H1",
        headlineFont: headline ? getComputedStyle(headline).fontFamily : "",
        bodyFont: p ? getComputedStyle(p).fontFamily : "",
        bodyBg: getComputedStyle(document.body).backgroundColor,
        kicker: document.querySelector(".pp-kicker")?.textContent ?? "",
        standfirsts: document.querySelectorAll(".pp-standfirst, main .text-standfirst").length,
        languageLinks: document.querySelectorAll(".pp-meta a[hreflang]").length,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      };
    });
    expect(facts.h1s).toBe(1);
    expect(facts.headlineIsH1).toBe(true);
    expect(facts.headlineFont).toMatch(/Source Serif 4/);
    expect(facts.bodyFont).toMatch(/Georgia/);
    expect(facts.bodyBg).toBe("rgb(255, 241, 229)");
    expect(facts.kicker).toBe(kicker);
    expect(facts.standfirsts).toBe(0);
    expect(facts.languageLinks).toBe(2);
    expect(facts.description).toContain("Hempton");
  });
}

test("the pink-paper theme does not scroll sideways at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const { url } of POSTS) {
    await page.goto(url);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, url).toBe(0);
  }
});

test("a post without the theme does not take the salmon paper", async ({ page }) => {
  await page.goto("/writing/what-are-embeddings");
  await expect(page.locator(".pp")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("background-color", "rgb(255, 241, 229)");
});
