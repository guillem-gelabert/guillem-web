import type { PortraitAsset } from "@/lib/cv";

type PortraitProps = {
  asset: PortraitAsset | null;
};

// Nothing upstream specifies a rendered display size for the portrait — only
// that it must be explicit and reserved before the bytes arrive (06-CONTEXT.md
// D-2.6, 06-RESEARCH.md's Q&A). 240px reads as a headshot-scale image beside
// the CV's running text at both mobile and desktop widths without competing
// with the h1 for attention. Kept as a named constant, not a literal, so a
// future width change is one line.
const RENDERED_WIDTH_PX = 240;

// Plain <img>, deliberately not the framework's built-in image component:
// production image optimization in Next 16 requires `sharp` as a runtime
// dependency whose absence fails with a 500 (components/mdx/figure.tsx:10-16
// already made and documented exactly this call for content images; this
// site's standing posture is zero new runtime dependencies of any kind).
//
// Returns null, not a frame or a grey box, when PORTRAIT is null — the same
// contract components/language-switch.tsx already ships elsewhere on the
// site (T-06-24): no placeholder asset is committed and none may be
// generated. No slot at all reads as more honest than an empty one.
export function Portrait({ asset }: PortraitProps) {
  if (asset === null) {
    return null;
  }

  const { src, width, height, alt } = asset;

  return (
    // self-start: /cv's <main> is `flex flex-col`, whose default
    // align-items: stretch would otherwise stretch this replaced element's
    // width to the column's full width, with height: auto following it —
    // measured, 06-RESEARCH.md Pitfall 10. The explicit rendered width below
    // is belt-and-braces on top of self-start, per the same pitfall.
    //
    // width/height are the asset's real intrinsic pixels (lib/cv.ts's
    // PORTRAIT contract), so Tailwind v4 preflight's `img { max-width: 100%;
    // height: auto }` (node_modules/tailwindcss/preflight.css:230-234,
    // verified) already reserves a correctly-proportioned box before the
    // file decodes. The inline aspect-ratio below is belt-and-braces on top
    // of that (D-2.6) — derived from the same real pixels via `style`, not a
    // Tailwind arbitrary-value class, because it must track whatever the
    // committed asset's actual dimensions are rather than a guessed literal.
    //
    // Square corners, no border, no shadow, no radius — the Figure
    // treatment tests/unit/prose-contract.test.ts already enforces as
    // border-radius: 0 (inherited here from the site's base <img> styling,
    // not restated).
    //
    // loading="eager" + fetchPriority="high" deliberately diverge from
    // figure.tsx's loading="lazy" precedent: content figures always sit
    // below a standfirst and a meta line, but /cv's <h1> and back link
    // occupy roughly 200px, so at 375x667 the portrait is very likely the
    // LCP element and lazy-loading it would hurt that — an assumption to be
    // measured once the file exists (06-RESEARCH.md A6), not a measured
    // fact yet.
    //
    // eslint-disable-next-line @next/next/no-img-element -- see the file-level rationale above: intrinsic width/height, no new runtime dependency
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="eager"
      fetchPriority="high"
      className="self-start"
      style={{ width: `${RENDERED_WIDTH_PX}px`, aspectRatio: `${width} / ${height}` }}
    />
  );
}
