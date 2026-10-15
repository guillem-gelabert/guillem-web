import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { PERMISSIONS_POLICY, buildCsp } from "./lib/csp.ts";

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

  // BUILD-04: the six-header security response set (D-4.1/D-4.2), delivered
  // on every response via next.config.ts's headers() rather than a proxy.
  //
  // `source: "/:path*"` is deliberate and load-bearing: it is the ONLY
  // matcher that also covers `/_next/static/*`. A path-matched proxy (Next
  // 16's `proxy.ts`, which this repo also has — created solely for CR-01's
  // localised-404 fix) does not see static-asset requests at all, so it
  // structurally cannot deliver these headers there. That is why headers()
  // beats the proxy tier for BUILD-04, even though a proxy now exists.
  // 06-CONTEXT.md's D-4.1 said "not middleware — none exists"; that premise
  // no longer holds, but the conclusion (headers do not belong in the
  // request-matched tier) still does. Do not "fix" this by moving the
  // headers into proxy.ts — that would silently drop coverage on every
  // built JS/CSS chunk.
  //
  // buildCsp() is called here, not at module scope, so `process.env.NODE_ENV`
  // is read fresh on every request rather than baked in at config-load time
  // — matching how Next evaluates this file in a long-lived Node process at
  // both `next build` and `next start`.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildCsp({ dev: process.env.NODE_ENV !== "production" }),
          },
          {
            // Two years, no `preload`. `preload` is a one-way door
            // submitted per registrable domain, and the site currently
            // lives on a Railway-generated subdomain it does not control
            // (D-3.4) — adding it belongs with BUILD-07's custom-domain
            // cutover, not here.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: PERMISSIONS_POLICY,
          },
          {
            // Free: the site has no `target="_blank"` anywhere.
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },

  // Redirects inherited from the retired guillem-edge Cloudflare Worker,
  // which used to front guillemgelabert.com and proxy here. The apex and
  // www now point straight at this service, so the Worker's two jobs that
  // still matter move here:
  //   - the GDP story and its legacy prefixes live on
  //     ib-gdp.guillemgelabert.com; old apex links 302 there with path and
  //     query preserved (Next forwards the query string itself). Kept a
  //     302, as the Worker had it, until the move is declared permanent.
  //   - www is not canonical: 301 to the apex.
  // Story rules come first so a www story link reaches the new host in one
  // hop, matching the Worker's order.
  async redirects() {
    const storyPrefixes = [
      "/everyone-in-mallorca-agrees-on-one-thing",
      "/a-mallorca-ho-sap-tothom",
      "/auf-mallorca-weiss-es-jeder",
      "/en",
      "/ca",
      "/de",
      "/split",
      "/review",
      "/ib-gdp",
    ];
    return [
      ...storyPrefixes.map((prefix) => ({
        source: `${prefix}/:path*`,
        destination: `https://ib-gdp.guillemgelabert.com${prefix}/:path*`,
        statusCode: 302 as const,
      })),
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "www.guillemgelabert.com" }],
        destination: "https://guillemgelabert.com/:path*",
        statusCode: 301 as const,
      },
    ];
  },

  // Deliberately NOT shipped, each for a stated reason (D-4.1):
  //   - X-Frame-Options: superseded by this policy's `frame-ancestors`.
  //     The author's own 2020 writing on this header is stale on exactly
  //     this point; the CSP directive is the current recommendation.
  //   - X-XSS-Protection: deprecated and now considered actively harmful
  //     by browser vendors — shipping it is worse than omitting it.
  //   - Cross-Origin-Resource-Policy: a `same-origin` value would risk
  //     blocking a headless-browser link unfurler from fetching the
  //     generated OG image, silently defeating FIND-01. Not worth it for a
  //     site with no cross-origin subresources to protect.
  //   - X-DNS-Prefetch-Control, COEP: nothing on the site needs either.
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
