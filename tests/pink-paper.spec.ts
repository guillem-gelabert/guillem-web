import { expect, test } from "@playwright/test";

// theme: pink-paper (components/pink-paper.tsx). The Hempton post in all
// three locales is set as a newspaper front page: salmon paper, a section
// line in the top bar, a display-serif headline, the text in two justified
// columns beside a lead photo and a pull quote, an Inside column of other
// posts, and no standfirst on the page (hideStandfirst) though it still
// feeds the meta description.
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
        lead: document.querySelector<HTMLImageElement>(".pp-figure img")?.getAttribute("src") ?? "",
        leadAlt: document.querySelector<HTMLImageElement>(".pp-figure img")?.alt ?? "",
        pull: document.querySelector(".pp-pull")?.textContent ?? "",
        inside: [...document.querySelectorAll<HTMLAnchorElement>(".pp-inside a")].map((a) => a.getAttribute("href")),
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
    // The byline opens the first paragraph, in bold, and only that one.
    const firstParagraph = page.locator(".pp .prose-site p").first();
    await expect(firstParagraph.locator("strong.pp-byline")).toHaveText(/^Guillem Gelabert, .*2026 —$/);
    await expect(firstParagraph.locator("strong.pp-byline")).toHaveCSS("font-weight", "700");
    await expect(page.locator(".pp-byline")).toHaveCount(1);
    expect(facts.lead).toBe("/work/hempton-dream.webp");
    expect(facts.leadAlt).toContain("DeepDream");
    expect(facts.pull.length).toBeGreaterThan(10);
    // The pull quote is the post's own words.
    const body = await page.locator(".pp .prose-site").textContent();
    expect(body?.toLowerCase()).toContain(facts.pull.replace(/[“”]/g, "").toLowerCase());
    // Inside lists other real posts in the same locale (English has some;
    // a locale with none gets no Inside column at all).
    if (url.startsWith("/writing/")) expect(facts.inside.length).toBeGreaterThan(0);
    await expect(page.locator(".pp-side")).toHaveCount(facts.inside.length > 0 ? 1 : 0);
    for (const href of facts.inside) {
      expect(href?.startsWith(url.split("/").slice(0, 2).join("/") + "/")).toBe(true);
      expect(href).not.toBe(url);
      const response = await page.request.get(href!);
      expect(response.status(), href!).toBe(200);
    }
  });
}

test("on desktop the text runs in two columns beside the photo, with Inside on the right", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(POSTS[0].url);
  const layout = await page.evaluate(() => {
    const body = document.querySelector(".pp .prose-site")!;
    const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    return {
      columns: getComputedStyle(body).columnCount,
      align: getComputedStyle(body).textAlign,
      hyphens: getComputedStyle(body).hyphens,
      body: box(".pp-body"),
      aside: box(".pp-aside"),
      main: box(".pp-main"),
      side: box(".pp-side"),
    };
  });
  expect(layout.columns).toBe("2");
  expect(layout.align).toBe("justify");
  expect(layout.hyphens).toBe("auto");
  expect(layout.aside.left).toBeGreaterThan(layout.body.right - 1);
  expect(layout.side.left).toBeGreaterThan(layout.main.right - 1);
  // The columns stay short enough to read without scrolling back up.
  expect(layout.body.height).toBeLessThan(900);
});

test("on a phone the front page stacks into one column", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(POSTS[0].url);
  await expect(page.locator(".pp .prose-site")).toHaveCSS("column-count", "auto");
  const [body, side] = await Promise.all([
    page.locator(".pp-body").boundingBox(),
    page.locator(".pp-side").boundingBox(),
  ]);
  expect(side!.y).toBeGreaterThan(body!.y + body!.height - 1);
});

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

test("the English post writes A.I. with points, never bare AI", async ({ page }) => {
  await page.goto(POSTS[0].url);
  const text = (await page.locator(".pp-main").textContent()) ?? "";
  expect(text).toContain("A.I.");
  expect(text).not.toMatch(/\bAI\b/);
});

test("a post without the theme does not take the salmon paper", async ({ page }) => {
  await page.goto("/writing/what-are-embeddings");
  await expect(page.locator(".pp")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("background-color", "rgb(255, 241, 229)");
});
