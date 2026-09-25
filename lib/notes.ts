/**
 * The landing's writing: three posts, three TILs and one book review, laid
 * out as pairs in the same grid as the projects after them
 * (components/landing/more-work.tsx).
 *
 * [PLACEHOLDER] Every string here is lorem ipsum, committed by the owner's
 * call so the landing renders at full length before the real pieces exist
 * (lib/placeholder.ts). None of them has a page yet, so no entry carries an
 * href — a pair that links to "#" promises a destination that is not there
 * — and none has a thumbnail, so each circle is the flat fill WorkEntry's
 * `shot: null` already renders. When a real piece lands, give NoteEntry an
 * href and a shot then.
 */

export type NoteEntry = {
  title: string;
  subtitle: string; // one line, the square's only copy under the title
  // The one tag a note carries: what kind of note it is. Posts carry none —
  // a post is the default, and the grid only marks the exceptions.
  tag: "TIL" | "Book" | null;
};

export const POSTS: readonly [NoteEntry, NoteEntry, NoteEntry] = [
  {
    title: "Lorem ipsum dolor sit amet",
    subtitle: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    tag: null,
  },
  {
    title: "Ut enim ad minim veniam",
    subtitle: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    tag: null,
  },
  {
    title: "Duis aute irure dolor",
    subtitle: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
    tag: null,
  },
];

export const TILS: readonly [NoteEntry, NoteEntry, NoteEntry] = [
  {
    title: "Excepteur sint occaecat",
    subtitle: "Cupidatat non proident, sunt in culpa qui officia deserunt.",
    tag: "TIL",
  },
  {
    title: "Mollit anim id est laborum",
    subtitle: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem.",
    tag: "TIL",
  },
  {
    title: "Nemo enim ipsam voluptatem",
    subtitle: "Quia voluptas sit aspernatur aut odit aut fugit.",
    tag: "TIL",
  },
];

export const BOOK_REVIEW: NoteEntry = {
  title: "Neque porro quisquam est",
  subtitle: "Lorem Ipsum, by Marcus Tullius: qui dolorem ipsum quia dolor sit amet.",
  tag: "Book",
};

/** Grid order: posts, then TILs, then the review. */
export const NOTES: readonly NoteEntry[] = [...POSTS, ...TILS, BOOK_REVIEW];
