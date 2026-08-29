import type { MDXComponents } from "mdx/types";

// Shiki emits style="background-color:#ffffff;color:#0e1116" on <pre>.
// Turbopack forbids function-valued `transformers` in next.config.ts, so strip it here.
// Shiki already sets tabindex="0"; role + aria-label complete WCAG 2.1.1 / 4.1.2.
const components: MDXComponents = {
  pre: ({ style: _shikiBackground, ...props }: React.ComponentPropsWithoutRef<"pre">) => (
    <pre {...props} role="region" aria-label="Code sample" />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
