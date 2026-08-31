import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
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
