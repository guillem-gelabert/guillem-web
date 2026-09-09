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
            <text>
              {/* startOffset + text-anchor centre the line on the arc's
                  midpoint, which is the top of the circle. */}
              <textPath href="#seam-arc-path" startOffset="50%" textAnchor="middle">
                {story.title}
              </textPath>
            </text>
          </svg>
        </a>
      </h3>

      {/* max-w-prose (65ch) is a no-op inside this box — the copy column is
          78% of the box's width, ~356px at 1440x900, where 65ch of 18px
          Jost is ~585px. It stays because the site's measure contract
          applies to every standfirst on every surface, and
          tests/landing-viewport.spec.ts's "the measure holds" sweep reads
          `main .max-w-prose` to prove 65ch resolves against the element's
          OWN font: drop the class here and that sweep silently has nothing
          left to measure on the landing. */}
      <p className="max-w-prose text-standfirst">{story.annotation}</p>

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
      {story.shot === null ? null : <SmearShot shot={story.shot} />}
    </>
  );
}
