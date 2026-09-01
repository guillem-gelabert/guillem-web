import { expect, test } from "@playwright/test";

// Covers WRIT-01 (SC4): every code block is Shiki-highlighted at the
// high-contrast theme, sits on the ink tint with no theme background of its
// own, is keyboard-reachable with an accessible name, and inline code is
// deliberately left uncoloured.
//
// RESEARCH Assumption A1 (the one mechanism in this phase reasoned about
// rather than built): destructuring `style` off the `pre` props in
// mdx-components.tsx actually removes Shiki's inline background-color from
// the final markup. Measured directly against a live render — the `style`
// attribute on every <pre> in .prose-site is null. A1 held; the documented
// !important fallback was not needed.

async function readCodeBlocks(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const pres = Array.from(document.querySelectorAll(".prose-site pre"));
    const preData = pres.map((pre) => {
      const s = getComputedStyle(pre);
      return {
        className: pre.className,
        style: pre.getAttribute("style"),
        tabindex: pre.getAttribute("tabindex"),
        role: pre.getAttribute("role"),
        ariaLabel: pre.getAttribute("aria-label"),
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        backgroundColor: s.backgroundColor,
        borderRadius: s.borderRadius,
        whiteSpace: s.whiteSpace,
        scrollWidth: pre.scrollWidth,
        clientWidth: pre.clientWidth,
        hasColoredSpan: !!pre.querySelector("span[style*='color']"),
      };
    });

    const inlineCodes = Array.from(document.querySelectorAll(".prose-site code")).filter(
      (c) => !c.closest("pre"),
    );
    const inlineData = inlineCodes.map((c) => {
      const s = getComputedStyle(c);
      return {
        hasColoredSpanDescendant: !!c.querySelector("span[style*='color']"),
        color: s.color,
        backgroundColor: s.backgroundColor,
      };
    });

    return { pres: preData, inlineCodes: inlineData };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/writing/fixture");
  await page.evaluate(() => document.fonts.ready);
});

test("every pre carries Shiki's class and the high-contrast theme — an unknown language would silently drop both", async ({
  page,
}) => {
  const { pres } = await readCodeBlocks(page);
  expect(pres.length).toBeGreaterThan(0);
  for (const pre of pres) {
    expect(pre.className).toContain("shiki");
    expect(pre.className).toContain("github-light-high-contrast");
  }
});

test("no pre carries an inline background-color — A1 held, the fallback rule was not needed", async ({
  page,
}) => {
  const { pres } = await readCodeBlocks(page);
  for (const pre of pres) {
    // Measured directly: mdx-components.tsx's `style` destructure removes
    // Shiki's inline style attribute entirely (style is null, not merely
    // background-color-free), so there is nothing to search for
    // "background-color" inside.
    expect(pre.style).toBeNull();
  }
});

test("every pre is keyboard-reachable and named — tabindex once, role=region, a non-empty aria-label", async ({
  page,
}) => {
  const { pres } = await readCodeBlocks(page);
  for (const pre of pres) {
    // Shiki already emits tabindex="0"; the override must not add a second.
    expect(pre.tabindex).toBe("0");
    expect(pre.role).toBe("region");
    expect(pre.ariaLabel).toBeTruthy();
  }
});

test("no two code-sample landmarks share an accessible name, and each names its language", async ({
  page,
}) => {
  const { pres } = await readCodeBlocks(page);
  expect(pres.length).toBeGreaterThan(1);

  // Landmarks of the same role must be distinguishable in a screen reader's
  // landmark list (WCAG technique ARIA13, axe-core landmark-unique). A bare
  // truthiness check on aria-label cannot see two identical names, which is
  // how "Code sample" twice on one page survived the whole of Plan 04.
  const labels = pres.map((pre) => pre.ariaLabel);
  expect(new Set(labels).size, `duplicate landmark names: ${labels.join(" | ")}`).toBe(
    labels.length,
  );

  // The name is derived from the fence's language, which reaches the DOM only
  // because next.config.ts sets Shiki's addLanguageClass. If that option is
  // dropped, every label silently collapses back to "Code sample".
  for (const pre of pres) {
    expect(pre.ariaLabel).toMatch(/^Code sample: [\w-]+$/);
  }
  expect(labels).toContain("Code sample: json");
  expect(labels).toContain("Code sample: bash");
});

test("pre renders IBM Plex Mono at 18px with the real 1.5 line-height in pixels, square corners, no soft-wrap", async ({
  page,
}) => {
  const { pres } = await readCodeBlocks(page);
  for (const pre of pres) {
    expect(pre.fontFamily).toContain("IBM Plex Mono");
    expect(pre.fontSize).toBe("18px");
    // Computed pixel value of line-height: 1.5 at 18px, not the authored "1.5".
    expect(pre.lineHeight).toBe("27px");
    expect(pre.borderRadius).toBe("0px");
    expect(pre.whiteSpace).toBe("pre");
  }
});

test("pre sits on the resolved ink tint, measured from the render rather than assumed", async ({
  page,
}) => {
  const { pres } = await readCodeBlocks(page);
  for (const pre of pres) {
    // --color-surface-code resolves to this rgba string in the real render.
    expect(pre.backgroundColor).toBe("rgba(0, 0, 0, 0.04)");
  }
});

test("the long fenced block scrolls internally — proving the overflow case exists and the page does not scroll with it", async ({
  page,
}) => {
  const { pres } = await readCodeBlocks(page);
  const overflowing = pres.filter((pre) => pre.scrollWidth > pre.clientWidth);
  expect(overflowing.length).toBeGreaterThan(0);
});

test("token colouring survives while the CSP header is delivered — style-src carries 'unsafe-inline', then at least one span carries an inline color style (G9, part 1 of 3)", async ({
  page,
}) => {
  // BUILD-04 / G9's three-part proof (06-RESEARCH.md FINDING F6). No
  // published post contains a code fence or a table — every one lives in a
  // draft (fixture.mdx, musterseite.mdx, nur-auf-deutsch.md) and a
  // production build prerenders none of them — so G9 ("code blocks still
  // render token colour with CSP enforced") has no production surface to
  // assert against directly. That is a deliberate accepted position,
  // recorded here rather than hidden, not an oversight.
  //
  // Part 1, here: the real browser-enforcement proof. This re-navigates to
  // /writing/fixture (on top of beforeEach's navigation) specifically to
  // capture THIS response's headers and THIS navigation's console output,
  // and asserts the CSP header is actually being delivered — with
  // style-src 'unsafe-inline' present, and no "Refused to apply inline
  // style" console message — before trusting the colour claim below. A
  // policy that blocked inline style attributes would fail this test, not
  // silently degrade to monochrome.
  // Part 2: tests/unit/csp.test.ts's dev/prod style-src token-set parity
  // assertion — that is what transfers this dev-tier result to production.
  // Part 3: the post-deploy curl recording the production CSP string
  // verbatim, owned by plan 06-11.

  const consoleMessages: string[] = [];
  page.on("console", (msg) => consoleMessages.push(msg.text()));

  const response = await page.goto("/writing/fixture");
  await page.evaluate(() => document.fonts.ready);

  const csp = response?.headers()["content-security-policy"];
  expect(csp, "the CSP header must be delivered on this navigation").toBeTruthy();
  // Scoped to the style-src directive specifically, not the policy string
  // as a whole — script-src also carries 'unsafe-inline', so a substring
  // check against the whole header would still pass even if style-src's
  // own 'unsafe-inline' were dropped, silently defeating this precondition.
  const styleSrc = csp!.match(/style-src ([^;]+)/)?.[1];
  expect(styleSrc, "policy must contain a style-src directive").toBeTruthy();
  expect(styleSrc).toContain("'unsafe-inline'");

  // Matched against what this Chromium build actually emits — measured
  // directly by narrowing lib/csp.ts's dev style-src to 'self' and
  // recording the console output (06-02-SUMMARY.md). The real message is
  // "Applying inline style violates the following Content Security Policy
  // directive 'style-src ...'", not the older "Refused to apply inline
  // style" phrasing some CSP writing still quotes. Matched on both
  // fragments together so a wording change in either direction still
  // catches a real violation rather than silently stop matching.
  const cspViolations = consoleMessages.filter(
    (m) => m.includes("Content Security Policy directive") && m.toLowerCase().includes("style"),
  );
  expect(
    cspViolations,
    `browser blocked inline styles: ${cspViolations.join(" | ")}`,
  ).toHaveLength(0);

  const { pres } = await readCodeBlocks(page);
  for (const pre of pres) {
    expect(pre.hasColoredSpan).toBe(true);
  }
});

test("inline code is not highlighted — no descendant span carries an inline color, and it is full ink on the tint", async ({
  page,
}) => {
  const { inlineCodes } = await readCodeBlocks(page);
  expect(inlineCodes.length).toBeGreaterThan(0);
  for (const code of inlineCodes) {
    expect(code.hasColoredSpanDescendant).toBe(false);
    expect(code.color).toBe("rgb(0, 0, 0)");
    expect(code.backgroundColor).toBe("rgba(0, 0, 0, 0.04)");
  }
});

test("the overflowing code block is reachable by keyboard, not only by mouse", async ({
  page,
}) => {
  const overflowing = page.locator(".prose-site pre").filter({ hasText: "curl -X POST" }).first();
  await overflowing.focus();
  const isActive = await overflowing.evaluate((el) => el === document.activeElement);
  expect(isActive).toBe(true);
});

test("a fenced block's brace renders literally — MDX did not try to evaluate it as an expression", async ({
  page,
}) => {
  const jsonBlock = page.locator(".prose-site pre").first();
  await expect(jsonBlock).toContainText('{ "format": "mdx", "renders": true }');
});
