import type { CSSProperties } from "react";
import { WORK } from "@/lib/work";
import styles from "./more-work.module.css";

// Every published piece after the first, as pairs, below the fold.
//
// The first entry is the hero disc in the scene above (story-slot.tsx); this
// takes the rest. Each is a circle beside a square: the circle is the
// thumbnail masked round, or a flat fill while no file is committed, and
// the square carries the title, the annotation and the two tags. It used to
// be a single line of type under the hero disc, which gave the second piece
// a title and nothing else.
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
const listStyle = { "--pair-count": more.length } as CSSProperties;

export function MoreWork() {
  return (
    // role="list" is required and not redundant: Safari drops list semantics
    // when list-style: none is applied, so the role restores what the CSS
    // removes (the same note work-list.tsx carries).
    <ol role="list" className={`seam-more-list ${styles.list}`} style={listStyle}>
      {more.map((entry) => (
        <li key={entry.href} className={`seam-pair ${styles.pair}`}>
          {/* The circle. Its border-radius is the mask, and the fill behind
              the picture is what shows while shot is null. aria-hidden only
              when it is that fill — an empty box says nothing a screen
              reader should hear; a real thumbnail carries its alt. */}
          <div
            className={`seam-pair-circle ${styles.circle}`}
            aria-hidden={entry.shot === null ? "true" : undefined}
          >
            {entry.shot === null ? null : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- no `sharp` at runtime; see components/portrait.tsx */}
                <img
                  src={entry.shot.src}
                  alt={entry.shot.alt}
                  width={entry.shot.width}
                  height={entry.shot.height}
                  loading="lazy"
                  className={`seam-pair-shot ${styles.shot}`}
                />
                {entry.shot.reveal ? (
                  // eslint-disable-next-line @next/next/no-img-element -- decorative duplicate of the described dither image
                  <img
                    src={entry.shot.reveal.src}
                    alt=""
                    aria-hidden="true"
                    width={entry.shot.reveal.width}
                    height={entry.shot.reveal.height}
                    loading="lazy"
                    className={`seam-pair-reveal ${styles.shot} ${styles.reveal}`}
                  />
                ) : null}
              </>
            )}
          </div>

          <div className={`seam-pair-square ${styles.square}`}>
            {/* The title is the ONLY link in the pair — the same rule the
                hero, work-list.tsx and the /writing index follow. Same tab,
                so no target and therefore no rel: with no new window there is
                no window.opener to close. The anchor's ::after stretches over
                the whole pair (more-work.module.css), so the circle is
                clickable without becoming a second link.

                No role classes (.text-standfirst, .text-body, .text-label)
                on the copy in here: their sizes are fixed pixels, and this
                type is sized against the square it sits in — see
                more-work.module.css. Weights stay the site's two. */}
            <h3 className={`seam-pair-title ${styles.title}`}>
              <a className={`link-quiet seam-pair-link ${styles.link}`} href={entry.href}>
                {entry.title}
              </a>
            </h3>
            {/* Two paragraphs, not the one-line annotation: the annotation
                is the hero's standfirst register, and this square has the
                room to say what the piece is. */}
            {entry.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className={`seam-pair-body ${styles.body}`}>
                {paragraph}
              </p>
            ))}
            {/* The tags: domain, content type, then the stack. No separator
                glyph between them: the site ships no icons and its non-Latin
                character budget is a single arrow
                (tests/design-budget.spec.ts), so a middle dot is out; the gap
                does the separating. */}
            <p className={`seam-pair-tags ${styles.tags}`}>
              <span className={styles.tag}>{entry.domain}</span>
              <span className={styles.tag}>{entry.contentType}</span>
              {entry.stack.map((tool) => (
                <span key={tool} className={`seam-pair-stack ${styles.tag}`}>
                  {tool}
                </span>
              ))}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
