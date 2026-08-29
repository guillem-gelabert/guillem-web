type FigureProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  wide?: boolean;
  children?: React.ReactNode;
};

// Plain <img>, deliberately not the framework's built-in image component:
// production image optimization in Next 16 requires `sharp` as a runtime
// dependency, and this phase's stated outcome is zero new runtime
// dependencies. The explicit width/height attributes below, plus
// `height: auto` in .prose-site, give the browser an intrinsic aspect
// ratio and reserve the space before load — which is what BUILD-06's
// no-layout-shift posture actually requires.
export function Figure({ src, alt, width, height, wide, children }: FigureProps) {
  return (
    <figure data-wide={wide ? true : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element -- see rationale above: intrinsic width/height, no new runtime dependency */}
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      {children ? <figcaption>{children}</figcaption> : null}
    </figure>
  );
}
