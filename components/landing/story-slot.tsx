import { SmearShot } from "@/components/landing/smear-shot";
import { WORK } from "@/lib/work";

// The landing's editorial block, and the whole of it.
//
// It replaces components/landing/featured-slot.tsx in this slot. That
// component resolves a case study out of content/ and, while none is
// published, prints "The case study is being written." — a promise instead
// of a piece of work. The case studies are deferred, so the slot now shows
// what actually exists: the first published story in full, with the chart it
// is about. featured-slot.tsx is left in the repo, unrendered, for when they
// come back (work-list.tsx and backlog-list.tsx already sit here on the same
// terms).
//
// The FIRST entry only. The second used to sit under the disc as a line of
// type — a title and nothing else — and it is a pair of its own now, below
// the fold, in components/landing/more-work.tsx, which takes every entry
// after this one. Nothing is printed twice.
//
// WORK is read here rather than taken as a prop, matching work-list.tsx: it
// is a fixed two-tuple in lib/work.ts (D-05), so there is nothing for a prop
// to vary and no zero state to render.
const [story] = WORK;

export function StorySlot() {
  return (
    <>
      {/* The headline rings the disc from OUTSIDE its edge, so it is set on
          a path rather than in lines.
          
          SVG textPath, not a CSS trick: there is no CSS for type on a
          curve, and this keeps the headline real text — selectable, in the
          accessible tree as the heading it is, still the link, and still
          able to carry the scroll trail (text-shadow inherits into SVG
          <text>).

          The viewBox is fixed at 200 units and the element is sized in px
          off --disc-size, so everything inside scales WITH the disc: the
          type's rendered size is its user-unit font-size times
          (rendered width / 200). That is why the font-size below is 15 and
          not a value from the type scale — at 1440x900 it renders at 37px,
          a shade above what the old stacked headline set to, and it tracks
          the disc from a 220px phone to a 1479px 5K window instead of
          tracking the viewport.

          Geometry: the disc's radius in user units is 100 / 1.28 = 78.1
          (--arc-scale is that 1.28), so a path at radius 84 sits 6 units
          outside it — ~15px at 1440x900, doubled from the 3 units it was —
          and the glyphs, which grow up from their baseline, grow away from
          the disc. Light caps at 12 units reach ~8.5 above the baseline, so
          the tops land near 92.5 of the 100 the box allows. Sweep-flag 1
          from the left point to the right one passes over the TOP in SVG's
          y-down space.

          The one constraint this shape imposes: the title has to fit the
          top half's arc, which is pi x 84 = 264 user units; the light
          uppercase setting in landing-seam.module.css takes 221 of them. A
          materially longer headline would need the font-size there
          reduced, or the arc extended past the semicircle.

          A plain <h3>, deliberately: this does NOT carry the scroll trail.
          The disc does — see components/landing/smear-shot.tsx — so the
          picture is what smears and the type stays flat. */}
      <h3 className="text-heading text-heading-body seam-arc">
        <a className="link-quiet" href={story.href}>
          <svg className="seam-arc-svg" viewBox="0 0 200 200">
            <defs>
              <path id="seam-arc-path" fill="none" d="M 16,100 A 84,84 0 0 1 184,100" />
            </defs>
            {/* The headline's rule, drawn rather than decorated. Chrome
                computes text-decoration-thickness and text-underline-offset
                to `auto` on SVG <text> and ignores what you set, so the only
                way to control this line's weight and its distance from the
                type is to draw it: an arc of the same circle at a smaller
                radius, stroked in user units.

                pathLength normalises the arc to 100 units whatever its
                geometry, so the dash below is a percentage of the sweep: the
                type takes ~84% of the top semicircle (see the note in
                landing-seam.module.css), so 84 units of dash offset by 8
                centres the rule under it. */}
            <path
              className="seam-arc-underline"
              d="M 19,100 A 81,81 0 0 1 181,100"
              pathLength="100"
              fill="none"
            />
            <text>
              {/* startOffset + text-anchor centre the line on the arc's
                  midpoint, which is the top of the circle. */}
              <textPath href="#seam-arc-path" startOffset="50%" textAnchor="middle">
                {story.title}
              </textPath>
            </text>
          </svg>
          {/* The disc's hit area, and the element whose :hover drives the
              picture below. It was the anchor's ::after, which cannot be
              hovered by a selector — and hanging the fade on .seam-arc:hover
              instead meant the GLYPHS drove it: SVG text hit-tests against
              its fill, so the gaps between letters are dead zones and
              dragging across the headline pumped the dither on and off.
              Same geometry as that ::after, still inside the anchor, so the
              link and its target size are unchanged. */}
          <span className="seam-arc-disc" aria-hidden="true" />
        </a>
      </h3>

      {/* No standfirst. The story's annotation used to print here, between
          the arc and the disc; the corner reads as the picture and its
          headline now, and the annotation is one line of prose in a box
          that is mostly circle.

          It is still in lib/work.ts and still printed by the "More work"
          pairs below the fold — only this slot stopped rendering it, the
          same way the case studies stayed in the repo when the landing
          stopped resolving them.

          This was also the landing's last `.max-w-prose`, which
          tests/landing-viewport.spec.ts's "the measure holds" sweep used to
          read. That check moved to /cv rather than being relaxed: the
          measure is a site-wide contract and it is still asserted, on a
          surface that actually sets running copy. */}
      {/* The disc: the capture, masked to a circle, covering it whole.
          Its geometry and its mask live in landing-seam.module.css, with
          the box it is measured against.

          A client leaf rather than a plain <img> because it carries the
          scroll trail (stacked box-shadow, which follows its border-radius)
          — the one element on this page that does. It is still a plain
          <img> underneath, deliberately not the framework's image
          component: production image optimization needs `sharp` as a
          runtime dependency and this site ships none, the same call
          components/portrait.tsx and components/mdx/figure.tsx both made
          and documented.

          Not aria-hidden and not alt="": the picture IS the piece, so it
          carries a real description. */}
      {story.shot === null ? null : (
        <>
          <SmearShot shot={story.shot} />
          {/* The sphere shading, over the disc. Two diffusion-dithered maps,
              pure black/white with no alpha, clipped to a sphere's
              silhouette: darken keeps the shadow map's black and discards
              its white, lighten does the reverse for the highlight, so the
              flat masked circle reads as a lit sphere without a fill behind
              it. Same pair the "More work" circles carry.

              Plain <img> siblings rather than part of SmearShot: they are
              decoration and do not carry the scroll trail, so they stay out
              of the client leaf. They share the disc's box through their own
              rules in landing-seam.module.css, and pointer-events: none
              there keeps them off the headline's hit area — the same trap
              .seam-shot documents. */}
          {/* Two exports, chosen by device pixel ratio, because a dither is
              only a dither at the pitch it was made for. One 467px map
              rendered at every size: 0.48 CSS px per dot on a phone, which
              at DPR 3 is 1.45 device px — nearest-neighbour then prints
              alternating 1px and 2px dots, and the two maps beat against
              each other as a moire grid over the whole disc. 150px at 1x
              and 280px at 2x and above put every device near the seam's
              own ~2.5 device px per dot (see .grainField in
              landing-seam.module.css). The width/height are the 2x file's,
              which is also the src fallback. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative shading layer; no `sharp` at runtime */}
          <img
            src="/work/sphere-shadow-diffusion-2x.png"
            srcSet="/work/sphere-shadow-diffusion-1x.png 1x, /work/sphere-shadow-diffusion-2x.png 2x"
            alt=""
            aria-hidden="true"
            width={280}
            height={280}
            loading="eager"
            fetchPriority="low"
            className="seam-shot-shadow"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative shading layer; no `sharp` at runtime */}
          <img
            src="/work/sphere-highlight-diffusion-2x.png"
            srcSet="/work/sphere-highlight-diffusion-1x.png 1x, /work/sphere-highlight-diffusion-2x.png 2x"
            alt=""
            aria-hidden="true"
            width={280}
            height={280}
            loading="eager"
            fetchPriority="low"
            className="seam-shot-highlight"
          />
          {story.shot.reveal ? (
            // The colour capture, over the grey one and under the shading,
            // revealed when the disc is hovered or its link focused. Same
            // construction as the "More work" circles: one asset per state
            // rather than a filter, so the resting image is a real file the
            // test can name.
            // eslint-disable-next-line @next/next/no-img-element -- decorative duplicate of the described shot
            <img
              src={story.shot.reveal.src}
              alt=""
              aria-hidden="true"
              width={story.shot.reveal.width}
              height={story.shot.reveal.height}
              loading="eager"
              fetchPriority="low"
              className="seam-shot-reveal"
            />
          ) : null}
        </>
      )}
      {/* The badge, sat on the disc's edge rather than in the empty box
          above it. Real text, not a decorative mark: it says what it says
          to a screen reader too, which is why it is a <p> with its own
          words and not a ::before.

          It is a sibling of the pictures on purpose — they share .content
          as their containing block, so the badge can be placed against the
          same --disc-size the disc itself is drawn from, and lands on the
          circumference by geometry instead of by a hand-tuned offset.
          See landing-seam.module.css. */}
      <p className="seam-new-story">New story</p>
    </>
  );
}
