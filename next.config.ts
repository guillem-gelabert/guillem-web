import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Swaps Next's injected default root layout for /_not-found — a bare
  // <html><body> stub with no lang and no font classes — for the
  // app/global-not-found.tsx file itself, which then owns the whole
  // document and, crucially, can export route `metadata`.
  //
  // Without this flag app/not-found.tsx rendered its own <html>/<body>
  // INSIDE the injected stub's, so the shipped 404 carried two <html> and
  // two <body> tags and, because a file under the default layout cannot
  // export metadata, zero <title> — a WCAG 2.1 SC 2.4.2 (Level A) failure
  // on the one surface a stranger reaches first (code review CR-01/WR-01).
  //
  // Experimental in Next 16.3.3 and gated behind this flag
  // (next/dist/build/webpack/loaders/next-app-loader/index.js: "TODO
  // (global-not-found): remove this flag assertion condition once
  // global-not-found is stable"). tests/build/prerender.test.ts asserts the
  // resulting document shape — one <html>, one <body>, a non-empty <title>
  // — so a future Next release that changes or drops the flag fails the
  // build gate rather than silently regressing the 404.
  experimental: { globalNotFound: true },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
    ],
    rehypePlugins: [
      "rehype-slug",
      [
        "@shikijs/rehype",
        {
          theme: "github-light-high-contrast",
          inline: false,
          fallbackLanguage: "text",
          // Puts `language-{lang}` on the <code> element. Shiki does not
          // otherwise keep the fence's language anywhere in the DOM, and
          // mdx-components.tsx needs it to give each <pre> landmark a unique
          // accessible name (WCAG ARIA13 / axe-core landmark-unique).
          addLanguageClass: true,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
