import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

// A source-fact gate over every <PostMeta> call site: each one must pass a
// `draft` prop.
//
// The defect this exists for (code review WR-02):
// components/landing/featured-slot.tsx rendered
// `<PostMeta locale="en" date={…} switchHref={null} />` with `draft`
// omitted, while all four other call sites passed
// `draft={entry.frontmatter.draft}`. PostMeta computes
// `draft === true && showDrafts()`, so an omitted prop is `undefined` and
// the marker never printed. In dev showDrafts() is always true, so a draft
// case study would have rendered on / with no marker while /writing showed
// "Draft" beside the identical file.
//
// PostMetaProps now declares `draft: boolean | undefined` — a required key
// with an optional value — so omission is a type error, and `next build`
// runs tsc. This suite restates the same fact at test:unit speed, because
// the build-tier gate only fires on a full clean build and the runtime gate
// cannot fire at all: the featured slot's published branch is unreachable
// until content/the-chart-therefore-changes.mdx exists (Phase 4), so no
// Playwright or prerender assertion can exercise it today.

const ROOTS = ["app", "components"];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

/**
 * Every `<PostMeta … />` or `<PostMeta …>` element in a source file, as raw
 * text. Deliberately naive but bounded: it scans from each `<PostMeta`
 * occurrence to the first `>` that closes the opening tag, tracking brace
 * depth so a `>` inside a JSX expression container (`date={a > b ? … }`)
 * does not end the tag early.
 */
function postMetaElements(source: string): string[] {
  const elements: string[] = [];
  const OPEN = "<PostMeta";
  let from = 0;
  for (;;) {
    const start = source.indexOf(OPEN, from);
    if (start === -1) break;
    // Skip `<PostMetaSomething` — the tag name must end here.
    const after = source[start + OPEN.length];
    if (after !== undefined && /[A-Za-z0-9_]/.test(after)) {
      from = start + OPEN.length;
      continue;
    }
    let depth = 0;
    let i = start + OPEN.length;
    for (; i < source.length; i++) {
      const ch = source[i]!;
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (ch === ">" && depth === 0) break;
    }
    elements.push(source.slice(start, i + 1));
    from = i + 1;
  }
  return elements;
}

const sources = ROOTS.flatMap((root) => walk(path.join(process.cwd(), root)))
  .map((file) => ({ file: path.relative(process.cwd(), file), text: readFileSync(file, "utf8") }))
  // The component's own definition is not a call site.
  .filter(({ file }) => file !== path.join("components", "post-meta.tsx"));

test("every <PostMeta> call site passes a draft prop (WR-02)", () => {
  const callSites = sources.flatMap(({ file, text }) =>
    postMetaElements(text).map((element) => ({ file, element })),
  );

  // Guard against the scanner silently matching nothing — a vacuous pass is
  // exactly how this class of gate rots.
  assert.ok(
    callSites.length >= 5,
    `expected at least 5 <PostMeta> call sites, found ${callSites.length} — the scanner has stopped matching`,
  );

  for (const { file, element } of callSites) {
    assert.match(
      element,
      /\bdraft=/,
      `<PostMeta> in ${file} omits the draft prop — an omitted draft reads as undefined, so the marker never prints:\n${element}`,
    );
  }
});

test("the featured slot passes the entry's own draft flag, not a literal (WR-02)", () => {
  const file = path.join(process.cwd(), "components", "landing", "featured-slot.tsx");
  const [element] = postMetaElements(readFileSync(file, "utf8"));
  assert.ok(element, "components/landing/featured-slot.tsx must render a <PostMeta>");
  assert.match(
    element!,
    /draft=\{entry\.frontmatter\.draft\}/,
    "the featured slot must pass entry.frontmatter.draft through — a hardcoded draft={false} would restate D-11 instead of feeding the one predicate (Phase 2 WR-07)",
  );
});
