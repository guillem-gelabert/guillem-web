import type { ReactNode } from "react";
import { BOOK_REVIEW, POSTS, TILS, type NoteEntry } from "@/lib/notes";
import styles from "./notes.module.css";

// The writing shelf, below the projects on the mirrored scene: three columns
// — posts, TILs, the one book review — each a heading over a stack of cards.
//
// Painted the way the pairs are and for the same reason: the shelf crosses
// the seam, so every card is #000 with #fff type (--pair-fill and
// --pair-type, inherited from .more in landing-seam.module.css) rather than
// either of the two grounds.
//
// No links. The entries are lorem ipsum with no page behind them
// (lib/notes.ts); a card becomes a link when its piece exists.

function Card({ entry, kicker }: { entry: NoteEntry; kicker?: string }) {
  return (
    <li className={`seam-note ${styles.card}`}>
      <p className={styles.meta}>
        <time dateTime={entry.date}>{entry.date}</time>
      </p>
      <h4 className={styles.title}>{entry.title}</h4>
      {kicker ? <p className={styles.meta}>{kicker}</p> : null}
      <p className={styles.excerpt}>{entry.excerpt}</p>
    </li>
  );
}

function Column({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <div className={styles.column}>
      <h3 id={id} className={styles.heading}>
        {heading}
      </h3>
      {/* role="list": Safari drops list semantics under list-style: none. */}
      <ol role="list" aria-labelledby={id} className={styles.list}>
        {children}
      </ol>
    </div>
  );
}

export function Notes() {
  return (
    <section aria-labelledby="seam-notes-title" className={`seam-notes ${styles.notes}`}>
      <h2 id="seam-notes-title" className={styles.sectionTitle}>
        Writing
      </h2>
      <div className={styles.columns}>
        <Column id="seam-notes-posts" heading="Posts">
          {POSTS.map((entry) => (
            <Card key={entry.title} entry={entry} />
          ))}
        </Column>
        <Column id="seam-notes-til" heading="Today I learned">
          {TILS.map((entry) => (
            <Card key={entry.title} entry={entry} />
          ))}
        </Column>
        <Column id="seam-notes-reading" heading="Book review">
          <Card
            entry={BOOK_REVIEW}
            kicker={`${BOOK_REVIEW.book}, ${BOOK_REVIEW.author}`}
          />
        </Column>
      </div>
    </section>
  );
}
