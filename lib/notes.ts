/**
 * The landing's writing — posts, TILs and book reviews — laid out as pairs in
 * the same grid as the projects after them (components/landing/more-work.tsx).
 *
 * Empty until real pieces exist. An entry has no href and no thumbnail yet,
 * so its circle is the flat fill WorkEntry's `shot: null` renders and the
 * pair links nowhere; when a real piece lands, give NoteEntry an href and a
 * shot then.
 */

export type NoteEntry = {
  title: string;
  subtitle: string; // one line, the square's only copy under the title
  // The one tag a note carries: what kind of note it is. Posts carry none —
  // a post is the default, and the grid only marks the exceptions.
  tag: "TIL" | "Book" | null;
};

/** Grid order: posts, then TILs, then reviews. */
export const NOTES: readonly NoteEntry[] = [];
