import { isValidElement } from "react";
import type { MDXComponents } from "mdx/types";
import { Aside } from "@/components/mdx/aside";
import { Figure } from "@/components/mdx/figure";

/**
 * Landmarks sharing a role must have distinct accessible names, or a screen
 * reader's landmark list shows N indistinguishable "Code sample region"
 * entries (WCAG technique ARIA13, axe-core landmark-unique). The fixture
 * alone renders two. Shiki keeps the fence's language nowhere in the DOM by
 * default, so next.config.ts turns on addLanguageClass, which puts
 * `language-{lang}` on the <code> child this <pre> wraps.
 */
function codeSampleLabel(children: React.ReactNode): string {
  const className = isValidElement<{ className?: string }>(children)
    ? children.props.className
    : undefined;
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1];
  return language ? `Code sample: ${language}` : "Code sample";
}

// Figure and Aside are the entire shipped MDX component map (D-08's "MDX
// may import arbitrary React components" stays true, but the default prose
// path requires none of them).
//
// Shiki emits style="background-color:#ffffff;color:#0e1116" on <pre>.
// Turbopack forbids function-valued `transformers` in next.config.ts, so strip it here.
// Shiki already sets tabindex="0"; role + aria-label complete WCAG 2.1.1 / 4.1.2.
const components: MDXComponents = {
  Figure,
  Aside,
  pre: ({ style: _shikiBackground, children, ...props }: React.ComponentPropsWithoutRef<"pre">) => (
    <pre {...props} role="region" aria-label={codeSampleLabel(children)}>
      {children}
    </pre>
  ),
  // Wrap the incoming <table> so it can scroll horizontally without the
  // page doing so — .prose-site .prose-table is the scroll wrapper.
  table: (props: React.ComponentPropsWithoutRef<"table">) => (
    <div className="prose-table">
      <table {...props} />
    </div>
  ),
  // Bare Markdown images cannot reserve their layout space before load
  // (BUILD-06). This throws at prerender, so `next build` fails with an
  // actionable message instead of shipping a silent layout shift.
  // Revisit in v2: the archive migration's legacy posts are full of bare
  // Markdown images and will want a build-time dimension probe.
  img: (): never => {
    throw new Error(
      "Bare Markdown images are not supported. Use <Figure src alt width height /> so the image reserves its space before it loads (BUILD-06).",
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
