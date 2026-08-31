import { expect, test } from "@playwright/test";

// Covers HOME-01, HOME-03, HOME-04, WORK-01, WORK-02 and the CASE-03 slot's
// structure — the eleven rows 03-VALIDATION.md's requirement->test map
// assigns to this file, the single largest Wave 0 gap in the phase.
//
// Three assertion-shape lessons this file is built around:
// (i) Computed values are read from a real render, never assumed. Phase 1's
//     tests/viewport.spec.ts had to assert the nameplate's real clamp()
//     output — 139.2px at 1440px — where the plan's own text assumed
//     "≈180px near-ceiling". Every measured value below (target sizes, the
//     separator colour, scroll-margin-top) is read the same way: from
//     getBoundingClientRect()/getComputedStyle() against a real render, not
//     derived from the plan's or the UI-SPEC's arithmetic.
// (ii) Copy that depends on draft visibility is NOT asserted here. This spec
//     runs against `npm run dev`, where showDrafts() is always true (dev is
//     NODE_ENV=development), so the featured slot's interim strings would
//     read as "published" the moment a future phase authors the case study
//     as draft: true in dev, while production still renders "interim" — a
//     spec asserting that copy would go red with no Phase 3 file changed.
//     That split lives in tests/build/prerender.test.ts, which reads real
//     `next build` output instead (Pitfall 2).
// (iii) "A title appears on /" is not a meaningful assertion on its own: `/`
//     already inherits a title and a description from app/(en)/layout.tsx,
//     so that assertion would have passed before this phase's change and
//     proven nothing (03-RESEARCH.md C-2). Every assertion below reads a
//     specific value this phase is responsible for, not merely presence.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

// ---------------------------------------------------------------------------
// Task 1: HOME-03 (the navigation surface) and HOME-01 (the positioning
// sentence)
// ---------------------------------------------------------------------------

test("(a) nav[aria-label=Sections] holds exactly 5 links, in reader-importance order", async ({
  page,
}) => {
  const nav = page.locator('nav[aria-label="Sections"]');
  await expect(nav).toHaveCount(1);

  const links = nav.locator("a");
  await expect(links).toHaveCount(5);

  const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  // Reader-importance order, not page order: Writing sits second because it
  // is the only route here that already holds shipped content. A sixth link
  // to #case-study is deliberately absent — that section sits immediately
  // beneath this nav, and a link to what the reader is already looking at
  // is noise, not navigation.
  expect(hrefs).toEqual(["#work", "/writing", "#backlog", "/cv", "#contact"]);

  const labels = await links.evaluateAll((els) =>
    els.map((el) => (el.textContent ?? "").trim()),
  );
  expect(labels).toEqual(["Work", "Writing", "Backlog", "CV", "Contact"]);
});

test("(b) every nav link clears the WCAG 2.5.8 24px target-size floor", async ({ page }) => {
  const links = page.locator('nav[aria-label="Sections"] a');
  await expect(links).toHaveCount(5);

  const heights = await links.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().height),
  );
  // Measured, not assumed: a Label-role link's line box is 18.2px, under the
  // 24px floor. py-xs (4px) takes it to 26.2px — a 2.2px margin small enough
  // that a dropped py-xs would fail here and nowhere else, so the assertion
  // reads the real box rather than trusting the class list is present.
  for (const height of heights) {
    expect(height).toBeGreaterThanOrEqual(24);
  }
});

test("(c) every section[id] anchors at scroll-margin-top: 32px, in fixed order", async ({
  page,
}) => {
  const sections = page.locator("section[id]");
  await expect(sections).toHaveCount(4);

  const ids = await sections.evaluateAll((els) => els.map((el) => el.id));
  expect(ids).toEqual(["case-study", "work", "backlog", "contact"]);

  // scroll-mt-xl exists so an anchor jump does not park the section head
  // flush against the viewport edge.
  const scrollMargins = await sections.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).scrollMarginTop),
  );
  for (const margin of scrollMargins) {
    expect(margin).toBe("32px");
  }
});

test("(d) no smooth scrolling on the document", async ({ page }) => {
  // Two concrete reasons from the Motion Contract: smooth scrolling is
  // motion that would need its own reduced-motion branch, and it fires a
  // long burst of scroll events, each of which advances the trail's
  // trailHue — a single anchor click would spin the hue through a large arc.
  const scrollBehavior = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );
  expect(scrollBehavior).not.toBe("smooth");
});

test("(e) exactly one h1, reading Guillem Gelabert, carrying text-display", async ({ page }) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText("Guillem Gelabert");
  await expect(h1).toHaveClass(/text-display/);
});

test("(f) the positioning sentence renders once at computed font-weight 530", async ({
  page,
}) => {
  const standfirst = page.locator("header p.text-standfirst");
  await expect(standfirst).toHaveCount(1);

  const fontWeight = await standfirst.evaluate((el) => getComputedStyle(el).fontWeight);
  expect(fontWeight).toBe("530");
});

test("(g) the one-source property: meta[name=description] equals the rendered positioning <p>", async ({
  page,
}) => {
  // This is the phase's most important assertion, and the reason it is
  // shaped this way is not obvious. Pitfall 6: the user eventually writes
  // the positioning sentence into the <p>, and the <meta name="description">
  // could still say "Developer." — which is what Slack, LinkedIn and
  // eventually Google quote once Phase 6 flips FIND-02. Asserting EQUALITY
  // rather than a literal string proves the property that matters: it keeps
  // passing when the user's real sentence lands, and it fails the moment the
  // two drift. The literal-value assertion against production HTML belongs
  // in tests/build/prerender.test.ts (Plan 03-08) — do NOT hardcode the
  // current placeholder word here.
  const metaContent = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  const standfirstText = await page.locator("header p.text-standfirst").innerText();
  expect(metaContent).toBe(standfirstText.trim());
});

// ---------------------------------------------------------------------------
// Task 2: WORK-01, WORK-02 and HOME-04 — the work list's structure,
// destinations and non-card treatment
// ---------------------------------------------------------------------------

test("(h) #work holds exactly one ol[role=list] with exactly 2 li", async ({ page }) => {
  const work = page.locator("section#work");
  const list = work.locator('ol[role="list"]');
  await expect(list).toHaveCount(1);

  // role="list" is not redundant: Safari drops list semantics when
  // list-style: none is applied, so the role restores what the CSS removes.
  await expect(list).toHaveAttribute("role", "list");

  const items = list.locator("> li");
  await expect(items).toHaveCount(2);
});

test("(i) both work-list rows point at the two locked D-06 destinations, same tab", async ({
  page,
}) => {
  const items = page.locator("section#work ol[role='list'] > li");
  await expect(items).toHaveCount(2);

  for (let i = 0; i < 2; i++) {
    await expect(items.nth(i).locator("a")).toHaveCount(1);
  }

  const hrefs = await items.locator("a").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  // Hosting is per-project with no uniform pattern (one is an apex
  // subdomain, the other a separate domain), so these are asserted as
  // literals rather than derived from a rule (D-06).
  expect(hrefs).toEqual([
    "https://ib-gdp.guillemgelabert.com/everyone-in-mallorca-agrees-on-one-thing",
    "https://watchpeopledie.live",
  ]);

  // Same-tab links create no window.opener, so there is no reverse-
  // tabnabbing surface, and adding a new-window attribute later would
  // require the accompanying hardening attribute to be considered.
  const targets = await items.locator("a").evaluateAll((els) =>
    els.map((el) => el.getAttribute("target")),
  );
  expect(targets).toEqual([null, null]);
});

test("(j) the private repo stays private: no github.com link, no repo name in rendered text", async ({
  page,
}) => {
  await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);

  const bodyText = await page.locator("body").innerText();
  // The repo is private and the entry titles are the pieces' published
  // headlines, never repository names (D-06).
  expect(bodyText).not.toContain("ib-gdp-evolution");
});

test("(k) each row's annotation is a single non-empty line, and its host label names the row's real destination", async ({
  page,
}) => {
  const items = page.locator("section#work ol[role='list'] > li");
  await expect(items).toHaveCount(2);

  for (let i = 0; i < 2; i++) {
    const row = items.nth(i);
    const annotation = row.locator("p.text-body");
    await expect(annotation).toHaveCount(1);
    const annotationText = await annotation.innerText();
    expect(annotationText.trim().length).toBeGreaterThan(0);
    expect(annotationText).not.toContain("\n");

    // The host line is derived, inside the browser, from the row's own <a>
    // — proving the outbound marker names the real destination rather than
    // a stale copy, not merely that some string with two dots is present.
    const hostText = await row.evaluate((el) => {
      const link = el.querySelector("a");
      const labels = el.querySelectorAll("p.text-label");
      const hostLabel = labels[labels.length - 1];
      return {
        expected: link ? new URL(link.getAttribute("href") as string).hostname : null,
        rendered: (hostLabel?.textContent ?? "").trim(),
      };
    });
    expect(hostText.rendered).toBe(hostText.expected);
  }
});

test("(l) the ordinals are aria-hidden and read 01, 02", async ({ page }) => {
  const items = page.locator("section#work ol[role='list'] > li");
  await expect(items).toHaveCount(2);

  // The <ol> already conveys order and count to assistive technology; a
  // visible "01" read aloud as "zero one" is noise.
  const ordinals = await items.evaluateAll((els) =>
    els.map((el) => {
      const p = el.querySelector("p.text-label");
      return { text: (p?.textContent ?? "").trim(), ariaHidden: p?.getAttribute("aria-hidden") };
    }),
  );
  expect(ordinals[0]).toEqual({ text: "01", ariaHidden: "true" });
  expect(ordinals[1]).toEqual({ text: "02", ariaHidden: "true" });
});

test("(m) HOME-04: the work list and its first row are not a card", async ({ page }) => {
  const list = page.locator("section#work ol[role='list']");
  const firstItem = page.locator("section#work ol[role='list'] > li").first();

  for (const locator of [list, firstItem]) {
    const style = await locator.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        borderTopWidth: s.borderTopWidth,
        borderRightWidth: s.borderRightWidth,
        borderBottomWidth: s.borderBottomWidth,
        borderLeftWidth: s.borderLeftWidth,
        boxShadow: s.boxShadow,
        borderRadius: s.borderRadius,
        backgroundColor: s.backgroundColor,
      };
    });
    expect(style.borderTopWidth).toBe("0px");
    expect(style.borderRightWidth).toBe("0px");
    expect(style.borderBottomWidth).toBe("0px");
    expect(style.borderLeftWidth).toBe("0px");
    expect(style.boxShadow).toBe("none");
    expect(style.borderRadius).toBe("0px");
    expect(["rgba(0, 0, 0, 0)", "transparent", "rgb(255, 255, 255)"]).toContain(
      style.backgroundColor,
    );
  }
});

test("(n) HOME-04: the second row's separator is the hairline, not a fourth rule weight", async ({
  page,
}) => {
  const secondItem = page.locator("section#work ol[role='list'] > li").nth(1);

  const style = await secondItem.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      borderTopWidth: s.borderTopWidth,
      borderTopStyle: s.borderTopStyle,
      borderTopColor: s.borderTopColor,
      borderRightWidth: s.borderRightWidth,
      borderBottomWidth: s.borderBottomWidth,
      borderLeftWidth: s.borderLeftWidth,
    };
  });

  // Tailwind v4's preflight emits `border: 0 solid` with no colour, so
  // border-t without border-rule falls through to currentColor — full-ink
  // black, 8x darker than --color-rule, and a fourth rule weight the Prose
  // Contract forbids (WR-06 recurring). A toHaveCount() assertion cannot see
  // this; only the computed colour can.
  expect(style.borderTopWidth).toBe("1px");
  expect(style.borderTopStyle).toBe("solid");
  expect(style.borderTopColor).toBe("rgba(0, 0, 0, 0.12)");
  expect(style.borderRightWidth).toBe("0px");
  expect(style.borderBottomWidth).toBe("0px");
  expect(style.borderLeftWidth).toBe("0px");
});

test("(o) the work list is a single column at the default viewport", async ({ page }) => {
  const items = page.locator("section#work ol[role='list'] > li");
  await expect(items).toHaveCount(2);

  const boxes = await items.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect()),
  );
  expect(boxes[0].x).toBe(boxes[1].x);
  expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
});

// ---------------------------------------------------------------------------
// Task 3: the CASE-03 slot structure (state-agnostic), the heading outline,
// and the no-placeholder-words rule
// ---------------------------------------------------------------------------

test("(p) the featured slot renders exactly one section head and one heading, state-agnostically", async ({
  page,
}) => {
  // Deliberately NOT asserting either the interim heading sentence or the
  // interim body paragraph's wording here, and NOT asserting whether the
  // <h3> contains an <a>. Every Playwright spec in this repo
  // runs against `npm run dev`, where showDrafts() returns true, so the
  // moment a future phase creates the case-study MDX file with draft: true
  // — the normal way to author — findBySlug starts returning an entry in
  // dev only, and the slot renders its PUBLISHED state in dev while
  // production still renders INTERIM. A copy assertion here would turn red
  // during that authoring with no Phase 3 file changed. The interim copy is
  // asserted against real production HTML in tests/build/prerender.test.ts
  // instead. What is asserted here is true in BOTH states: one section head,
  // one Heading-role <h3>, same roles, same order.
  const caseStudy = page.locator("section#case-study");
  await expect(caseStudy).toHaveCount(1);
  await expect(caseStudy.locator("h2.section-head")).toHaveCount(1);
  await expect(caseStudy.locator("h3.text-heading")).toHaveCount(1);
});

test("(q) all four section heads render in order with the structural 1px full-ink rule", async ({
  page,
}) => {
  const heads = page.locator("section[id] > h2.section-head");
  await expect(heads).toHaveCount(4);

  const texts = await heads.allTextContents();
  expect(texts.map((t) => t.trim())).toEqual(["Case study", "Work", "Backlog", "Contact"]);

  const styles = await heads.evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el);
      return {
        borderBottomWidth: s.borderBottomWidth,
        borderBottomStyle: s.borderBottomStyle,
        borderBottomColor: s.borderBottomColor,
      };
    }),
  );
  // The "1px full ink = structural" weight, distinct from the work-list
  // separator's rgba(0, 0, 0, 0.12). Two rule weights on this page, no
  // third.
  for (const style of styles) {
    expect(style.borderBottomWidth).toBe("1px");
    expect(style.borderBottomStyle).toBe("solid");
    expect(style.borderBottomColor).toBe("rgb(0, 0, 0)");
  }
});

test("(r) the heading outline is h1=1, h2=4, h3=3, h4/h5/h6=0, and every aria-labelledby resolves", async ({
  page,
}) => {
  const counts = await page.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    h2: document.querySelectorAll("h2").length,
    h3: document.querySelectorAll("h3").length,
    h4: document.querySelectorAll("h4").length,
    h5: document.querySelectorAll("h5").length,
    h6: document.querySelectorAll("h6").length,
  }));
  // The <h3> rendering far larger than its <h2> is deliberate, not an
  // inversion to fix: semantics follow structure, visual weight follows
  // editorial hierarchy. An <h2> in the featured slot would put two <h2>s
  // inside section#case-study and silently break the outline
  // aria-labelledby depends on.
  expect(counts).toEqual({ h1: 1, h2: 4, h3: 3, h4: 0, h5: 0, h6: 0 });

  const labelledBy = await page.evaluate(() =>
    Array.from(document.querySelectorAll("section[id]")).map((section) => {
      const labelId = section.getAttribute("aria-labelledby");
      const h2 = section.querySelector("h2");
      return { labelId, h2Id: h2?.id ?? null };
    }),
  );
  for (const { labelId, h2Id } of labelledBy) {
    expect(labelId).toBe(h2Id);
  }
});

test("(s) D-02: nothing on / reads as unfinished", async ({ page }) => {
  // D-08 calls for a clearly-marked placeholder and D-02 for deliberately
  // typeset content; they resolve exactly one way — the placeholder is
  // marked in the source, not on the screen. A rendered
  // "[positioning sentence goes here]" on a live URL during a job hunt is
  // what D-02 exists to prevent (Pitfall 7).
  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  const banned = ["todo", "placeholder", "coming soon", "under construction", "lorem", "tbd"];
  for (const word of banned) {
    expect(bodyText).not.toContain(word);
  }
});

test("(t) no card idiom anywhere on the page: no button, no img, no svg, no rounded corners, no shadow", async ({
  page,
}) => {
  // This phase ships no form, no toggle, no icon and no image
  // (PROF-02 is Phase 6). Scoped to <main> because Next.js's dev-mode
  // overlay injects its own "Open Next.js Dev Tools" <button> into a
  // <nextjs-portal> shadow root appended to <body> on every route in every
  // dev-server render — a framework artifact Playwright's shadow-piercing
  // locator finds regardless of what this phase ships, absent from any
  // production build. Scoping to <main> asserts what this phase actually
  // controls rather than the dev server's own tooling.
  await expect(page.locator("main button")).toHaveCount(0);
  await expect(page.locator("img")).toHaveCount(0);
  await expect(page.locator("main svg")).toHaveCount(0);

  const boxStyles = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("main section, main div"));
    return els.map((el) => {
      const s = getComputedStyle(el);
      return { borderRadius: s.borderRadius, boxShadow: s.boxShadow };
    });
  });
  for (const style of boxStyles) {
    expect(style.borderRadius).toBe("0px");
    expect(style.boxShadow).toBe("none");
  }
});

test("(u) both stubs render one standfirst and one body line, standfirst at weight 530", async ({
  page,
}) => {
  for (const id of ["backlog", "contact"]) {
    const section = page.locator(`section#${id}`);
    const standfirst = section.locator("p.text-standfirst");
    const body = section.locator("p.text-body");
    await expect(standfirst).toHaveCount(1);
    await expect(body).toHaveCount(1);

    const fontWeight = await standfirst.evaluate((el) => getComputedStyle(el).fontWeight);
    expect(fontWeight).toBe("530");
  }
  // Production truth for the stub copy strings belongs to Plan 03-08's
  // build-tier test; the absence assertion in (s) already covers the
  // failure mode that matters here.
});
