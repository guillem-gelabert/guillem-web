import type { CSSProperties } from "react";
import { NOTES } from "@/lib/notes";
import { WORK, type WorkShot } from "@/lib/work";
import { PairRows } from "./pair-rows";
import { SphereShading } from "./sphere-shading";
import styles from "./more-work.module.css";

// Every published piece after the first, as pairs, below the fold.
//
// The first entry is the hero disc in the scene above (story-slot.tsx); this
// takes the rest. Each is a circle beside a square: the circle is the
// thumbnail masked round, or a flat fill while no file is committed, and
// the square carries the title, the tags and the arrow that is the link.
//
// Same plain-class-plus-module-class convention as landing-seam.tsx: the
// module class styles the element, the plain one is what devtools and the
// tests read.
//
// WORK is read here rather than taken as a prop, matching story-slot.tsx and
// work-list.tsx: it is a fixed tuple, so there is nothing for a prop to vary.
const [, ...more] = WORK;

// The count reaches the stylesheet as a custom property: the grid never lays
// more columns than there are pairs (landing-seam.module.css, .more), so
// one piece takes the whole width rather than a half or a quarter of it.
// A typed cast because React's CSSProperties does not know custom
// properties; the value is an integer, never a string, so it is a number
// on the CSS side too.
//
// The writing (lib/notes.ts) shares the grid, after the projects, so it
// counts towards the columns too.
const pairCount = more.length + NOTES.length;
const listStyle = { "--pair-count": pairCount } as CSSProperties;

// Each pair's hover colour: its own hue, at the featured badge's saturation
// and lightness. The badge is #EE0000, hsl(0 100% 46.7%)
// (landing-seam.module.css), so the hues start there and step round the
// wheel evenly, one per pair in list order — the first pair hovers the
// badge's own red. The type is black or white, whichever reads better on
// that hue by WCAG contrast: a yellow wants black, a blue wants white.
//
// Written as custom properties on the <li>; more-work.module.css only says
// that hover uses them.
const BADGE_SATURATION = 1;
const BADGE_LIGHTNESS = 0xee / 0xff / 2; // #EE0000: max 0.933, min 0

function hslToRgb(hue: number): [number, number, number] {
  const chroma = (1 - Math.abs(2 * BADGE_LIGHTNESS - 1)) * BADGE_SATURATION;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = BADGE_LIGHTNESS - chroma / 2;
  const [r, g, b] =
    hue < 60 ? [chroma, x, 0]
    : hue < 120 ? [x, chroma, 0]
    : hue < 180 ? [0, chroma, x]
    : hue < 240 ? [0, x, chroma]
    : hue < 300 ? [x, 0, chroma]
    : [chroma, 0, x];
  return [r + m, g + m, b + m];
}

function luminance([r, g, b]: [number, number, number]) {
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function hoverStyle(index: number): CSSProperties {
  const hue = (index * 360) / pairCount;
  const rgb = hslToRgb(hue);
  const l = luminance(rgb);
  // Contrast against black is (L + 0.05) / 0.05, against white 1.05 / (L + 0.05).
  const type = (l + 0.05) / 0.05 >= 1.05 / (l + 0.05) ? "#000" : "#fff";
  const hex = rgb.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
  return { "--pair-hover": `#${hex}`, "--pair-hover-type": type } as CSSProperties;
}

// The whole pair is a click target: this link sits behind the circle and
// the square, sized to the two of them (more-work.module.css, .cover), and
// both shapes let the pointer through to it. It is a pointer convenience
// only, so it is hidden from assistive technology and the tab order: the
// arrow in the square stays the pair's one announced, focusable link, and
// keyboard and screen-reader use are unchanged.
function PairCover({ href }: { href: string }) {
  return (
    <a className={`seam-pair-cover ${styles.cover}`} href={href} aria-hidden="true" tabIndex={-1} />
  );
}

// The circle, the same for a project and a note. Its border-radius is the
// mask, and the fill behind the picture is what shows while shot is null.
// aria-hidden only when it is that fill — an empty box says nothing a screen
// reader should hear; a real thumbnail carries its alt.
//
// Every circle carries the sphere shading, a picture or not: a shadow map
// and a highlight map, 1-bit, dithered at the circle's own size
// (sphere-shading.tsx), over the grey capture and under the colour one.
// Their light follows the mouse. Over an empty circle they shade the pair's
// own fill.
function PairCircle({ shot }: { shot: WorkShot | null }) {
  return (
    <div
      className={`seam-pair-circle ${styles.circle}`}
      aria-hidden={shot === null ? "true" : undefined}
    >
      {shot === null ? null : (
        // eslint-disable-next-line @next/next/no-img-element -- no `sharp` at runtime; see components/portrait.tsx
        <img
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          loading="lazy"
          className={`seam-pair-shot ${styles.shot}`}
        />
      )}
      <SphereShading
        shadowClassName={`seam-pair-shade ${styles.shade}`}
        highlightClassName={`seam-pair-shade ${styles.shade}`}
      />
      {shot === null ? (
        // No picture, so no colour capture to fade in: the hover colour
        // itself fades in instead, on the same layer and timing as a
        // capture's (.reveal), so every circle in the grid changes the same
        // way.
        <div className={`seam-pair-reveal ${styles.reveal} ${styles.revealFill}`} />
      ) : shot.reveal ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative duplicate of the described image
        <img
          src={shot.reveal.src}
          alt=""
          aria-hidden="true"
          width={shot.reveal.width}
          height={shot.reveal.height}
          loading="lazy"
          className={`seam-pair-reveal ${styles.shot} ${styles.reveal}`}
        />
      ) : null}
    </div>
  );
}

export function MoreWork() {
  return (
    // role="list" is required and not redundant: Safari drops list semantics
    // when list-style: none is applied, so the role restores what the CSS
    // removes (the same note work-list.tsx carries).
    <>
      <ol role="list" className={`seam-more-list ${styles.list}`} style={listStyle}>
        {more.map((entry, index) => (
          <li key={entry.href} className={`seam-pair ${styles.pair}`} style={hoverStyle(index)}>
            <PairCover href={entry.href} />
            <PairCircle shot={entry.shot} />

            <div className={`seam-pair-square ${styles.square}`}>
              {/* The title is not a link itself: the arrow at the foot is the
                  pair's one announced link, and the cover behind the pair
                  (PairCover) takes a click anywhere on the circle or square.

                  No role classes (.text-standfirst, .text-body, .text-label)
                  on the copy in here: their sizes are fixed pixels, and this
                  type is sized against the square it sits in — see
                  more-work.module.css. Weights stay the site's two. */}
              <h3 className={`seam-pair-title ${styles.title}`}>{entry.title}</h3>
              <p className={`seam-pair-body ${styles.body}`}>{entry.annotation}</p>
              {/* The tags and arrow sit along the square's floor. */}
              <div className={`seam-pair-foot ${styles.foot}`}>
                {/* The tags: the domains, the content type, then the stack.
                    Outlined chips, all rectangular. No separator glyph
                    between them: the site ships no icons and its non-Latin
                    budget is the two arrows (tests/design-budget.spec.ts). */}
                <p className={`seam-pair-tags ${styles.tags}`}>
                  {entry.domains.map((field) => (
                    <span key={field} className={`seam-pair-domain ${styles.tag}`}>
                      {field}
                    </span>
                  ))}
                  <span className={styles.tag}>{entry.contentType}</span>
                  {entry.stack.map((tool) => (
                    <span key={tool} className={`seam-pair-stack ${styles.tag}`}>
                      {tool}
                    </span>
                  ))}
                </p>
                {/* The one announced link in the pair: the arrow in the
                    square's corner. The rest of the pair reaches the same
                    href through PairCover, which is hidden from assistive
                    technology.

                    U+2192, the mirror of the U+2190 every back link sets
                    (lib/locales.ts); the two arrows are the whole of the
                    site's non-Latin budget. aria-label names the piece,
                    since the glyph says nothing to a screen reader.

                    Same tab: no target, and therefore no rel — with no new
                    window there is no window.opener to close. Do not
                    "harden" this by opening a new tab; that reopens the
                    reverse-tabnabbing surface work-list.tsx documents.

                    .link-quiet, not .link: a glyph is its own affordance
                    and an underline under an arrow reads as a stray rule.
                    The accent focus outline still comes from globals.css. */}
                <a
                  className={`link-quiet seam-pair-link ${styles.projectLink}`}
                  href={entry.href}
                  aria-label={`To project: ${entry.title}`}
                >
                  →
                </a>
              </div>
            </div>
          </li>
        ))}
        {NOTES.map((note, index) => (
          <li
            key={note.title}
            className={`seam-pair seam-pair-note ${styles.pair}`}
            style={hoverStyle(more.length + index)}
          >
            <PairCover href={note.href} />
            <PairCircle shot={note.shot} />
            <div className={`seam-pair-square ${styles.square}`}>
              <h3 className={`seam-pair-title ${styles.title}`}>{note.title}</h3>
              <p className={`seam-pair-body ${styles.body}`}>{note.subtitle}</p>
              <div className={`seam-pair-foot ${styles.foot}`}>
                {note.tag === null ? null : (
                  <p className={`seam-pair-tags ${styles.tags}`}>
                    <span className={styles.tag}>{note.tag}</span>
                  </p>
                )}
                <a
                  className={`link-quiet seam-pair-link ${styles.projectLink}`}
                  href={note.href}
                  aria-label={`Read: ${note.title}`}
                  style={{ marginInlineStart: "auto" }}
                >
                  →
                </a>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {/* Every other row lays its pairs square-first; see pair-rows.tsx. */}
      <PairRows listSelector=".seam-more-list" />
    </>
  );
}
