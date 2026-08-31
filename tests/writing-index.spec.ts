import { expect, test } from "@playwright/test";

// Covers WRIT-01 (SC2): /writing and /texte read as an editorial front page
// rather than a directory listing — the featured entry's headline is the
// only link inside its <article>, there is no card/border/fill/"Read more",
// and a second entry (the /texte case, where both fixtures are draft: true
// so dev shows two) repeats the same <article> markup unchanged, separated
// by <hr>, proving the n>=2 fallback costs no second render mode.
//
// Two Phase 1 lessons apply (STATE.md, 02-VALIDATION.md): assert computed
// values measured from a real render (the "not a card" assertion below
// reads getComputedStyle rather than assuming Tailwind's default box), and
// page.emulateMedia({ reducedMotion: 'reduce' }) isn't needed here — this
// spec measures static markup, not motion.

test.beforeEach(async ({ page }) => {
  await page.goto("/writing");
  await page.evaluate(() => document.fonts.ready);
});

test("/writing renders two articles, the case study first, each h2 the sole link in its article", async ({
  page,
}) => {
  const articles = page.locator("article");
  await expect(articles).toHaveCount(2);
  // A second entry brings the separator with it — the n>=2 index shape
  // this file exists to prove costs no second render mode.
  await expect(page.locator("hr")).toHaveCount(1);

  // FIRST: content/the-chart-therefore-changes.mdx, dated 2026-08-31 —
  // newer than content/fixture.mdx's 2026-08-30, so byDateThenSlug sorts it
  // ahead in dev (where showDrafts() makes the still-draft fixture visible
  // too; production visibility of the case study is proven independently
  // in tests/build/prerender.test.ts).
  const first = articles.nth(0);
  const firstH2 = first.locator("h2");
  await expect(firstH2).toHaveClass(/text-display/);
  await expect(firstH2).toHaveText("The Chart Therefore Changes");
  const firstLinks = first.locator("a");
  await expect(firstLinks).toHaveCount(1);
  await expect(firstLinks.first()).toHaveAttribute(
    "href",
    "/writing/the-chart-therefore-changes",
  );

  // SECOND: the still-draft fixture.mdx — visible here only because
  // Playwright runs against `npm run dev`.
  const second = articles.nth(1);
  const secondH2 = second.locator("h2");
  await expect(secondH2).toHaveClass(/text-display/);
  await expect(secondH2).toHaveText("A Working Fixture for the Prose Contract");
  const secondLinks = second.locator("a");
  await expect(secondLinks).toHaveCount(1);
  await expect(secondLinks.first()).toHaveAttribute("href", "/writing/fixture");
});

// The tests below use article.first() — deliberately, and unchanged from
// before this plan: with the case study now sorting first (see above), they
// measure the case study's rendered markup rather than the fixture's. That
// is a deliberate change of subject, not an accident: the "not a card" and
// "standfirst weight 530" properties apply to every article the same way,
// through the one shared markup path app/(en)/writing/page.tsx renders both
// through, so which entry happens to be first does not change what is
// proven.
test("the article is not a card: no border, no shadow, transparent or paper background", async ({
  page,
}) => {
  const style = await page.locator("article").first().evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      borderTopWidth: s.borderTopWidth,
      borderRightWidth: s.borderRightWidth,
      borderBottomWidth: s.borderBottomWidth,
      borderLeftWidth: s.borderLeftWidth,
      boxShadow: s.boxShadow,
      backgroundColor: s.backgroundColor,
    };
  });

  expect(style.borderTopWidth).toBe("0px");
  expect(style.borderRightWidth).toBe("0px");
  expect(style.borderBottomWidth).toBe("0px");
  expect(style.borderLeftWidth).toBe("0px");
  expect(style.boxShadow).toBe("none");
  expect(["rgba(0, 0, 0, 0)", "transparent", "rgb(255, 255, 255)"]).toContain(
    style.backgroundColor,
  );
});

test("the page body contains neither Read more nor Weiterlesen", async ({ page }) => {
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toContain("Read more");
  expect(bodyText).not.toContain("Weiterlesen");
});

test("the kicker is a Label-role h1 pointing the index switch at /texte", async ({ page }) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveClass(/text-label/);
  await expect(h1).toHaveText("Writing");

  const switchLink = page.getByRole("link", { name: "Auf Deutsch lesen" });
  await expect(switchLink).toHaveAttribute("href", "/texte");
});

test("the standfirst under the headline computes to weight 530", async ({ page }) => {
  const fontWeight = await page
    .locator("article")
    .first()
    .locator(".text-standfirst")
    .first()
    .evaluate((el) => getComputedStyle(el).fontWeight);
  expect(fontWeight).toBe("530");
});

// Passes whichever way Plan 04 set the German draft flag: Playwright runs
// against `npm run dev`, where showDrafts() is always true, so
// content/die-darstellung-aendert-sich.mdx is visible here either way. Its
// PRODUCTION visibility (the branch actually shipped, draft: false) is
// proven independently in tests/build/prerender.test.ts instead.
test("/texte renders three articles separated by two hrs, reverse-chronological, all three h2s sharing one class list", async ({
  page,
}) => {
  await page.goto("/texte");
  await page.evaluate(() => document.fonts.ready);

  const articles = page.locator("article");
  await expect(articles).toHaveCount(3);
  await expect(page.locator("hr")).toHaveCount(2);

  // "the existing <hr> rule" means the Prose Contract's hairline, not a
  // second, heavier one. Scoping the stroke to .prose-site left the index's
  // separator on Tailwind preflight's currentColor — full-ink black, 8x
  // darker than --color-rule. toHaveCount(2) could not see that; the
  // computed colour can. Scoped to .first(): with two <hr> elements now
  // present, the unscoped locator throws a Playwright strict-mode
  // violation. Both hrs render through the same index.tsx code path, so
  // checking the first one's computed style is sufficient — there is no
  // second style to diverge.
  const hrStyle = await page
    .locator("main > hr")
    .first()
    .evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.borderTopColor, width: s.borderTopWidth, style: s.borderTopStyle };
    });
  expect(hrStyle.color).toBe("rgba(0, 0, 0, 0.12)");
  expect(hrStyle.width).toBe("1px");
  expect(hrStyle.style).toBe("solid");

  // Order: content/die-darstellung-aendert-sich.mdx (2026-08-31, the
  // published case study) sorts first, then the two still-draft fixtures
  // by date descending — content/musterseite.mdx (2026-08-30), then
  // content/nur-auf-deutsch.md (2026-08-29).
  const titles = await articles.locator("h2").allTextContents();
  expect(titles).toEqual([
    "Die Darstellung ändert sich",
    "Eine Musterseite für die Textvorlage",
    "Nur auf Deutsch: ein Text ohne Übersetzung",
  ]);

  const classLists = await articles.locator("h2").evaluateAll((els) =>
    els.map((el) => el.className),
  );
  expect(classLists[0]).toBe(classLists[1]);
  expect(classLists[1]).toBe(classLists[2]);
});

// Amendment A2: the dead end Phase 3's contents-nav Writing entry creates
// is closed by a site-root back link on both indexes.
test("A2: both /writing and /texte carry exactly one site-root back link to /", async ({
  page,
}) => {
  const enBackLink = page.getByRole("link", { name: "← Guillem Gelabert" });
  await expect(enBackLink).toHaveCount(1);
  await expect(enBackLink).toHaveAttribute("href", "/");

  await page.goto("/texte");
  await page.evaluate(() => document.fonts.ready);

  const deBackLink = page.getByRole("link", { name: "← Guillem Gelabert" });
  await expect(deBackLink).toHaveCount(1);
  await expect(deBackLink).toHaveAttribute("href", "/");

  // React SSR emits the DOM property spelling hrefLang, not the lowercase
  // HTML attribute — tests/build/prerender.test.ts:184-187 already records
  // this trap. Compare case-insensitively.
  const hreflang = await deBackLink.getAttribute("hreflang");
  expect(hreflang?.toLowerCase()).toBe("en");
});

// Amendment A3: the site-root back link and the entry headline link both
// take link-quiet, giving them the accent hover/focus contract every other
// non-prose link on the shipped site now carries. The back link's measured
// height (not the arithmetic) proves it clears WCAG 2.5.8's 24px floor —
// 03-VALIDATION.md measures the Label-role line box at 18.2px and the
// inline-block py-xs box at 26.2px.
test("A3: the back link and headline link carry link-quiet, and the back link clears the 24px target floor", async ({
  page,
}) => {
  const backLink = page.getByRole("link", { name: "← Guillem Gelabert" });
  await expect(backLink).toHaveClass(/link-quiet/);
  const headlineLink = page.locator("article h2 a").first();
  await expect(headlineLink).toHaveClass(/link-quiet/);

  const height = await backLink.evaluate((el) => el.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(24);

  await page.goto("/texte");
  await page.evaluate(() => document.fonts.ready);

  const deBackLink = page.getByRole("link", { name: "← Guillem Gelabert" });
  await expect(deBackLink).toHaveClass(/link-quiet/);
  const deHeadlineLink = page.locator("article h2 a").first();
  await expect(deHeadlineLink).toHaveClass(/link-quiet/);

  const deHeight = await deBackLink.evaluate((el) => el.getBoundingClientRect().height);
  expect(deHeight).toBeGreaterThanOrEqual(24);
});
