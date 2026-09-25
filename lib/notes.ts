/**
 * The landing's writing shelf: three posts, three TILs and one book review,
 * rendered below the projects by components/landing/notes.tsx.
 *
 * [PLACEHOLDER] Every string here is lorem ipsum, committed by the owner's
 * call so the landing renders at full length before the real pieces exist
 * (lib/placeholder.ts). None of them has a page yet, so no entry carries an
 * href — a card that links to "#" promises a destination that is not there.
 * When a real post lands, give its type an href and the card a link then.
 *
 * Fixed-length tuples for the same reason lib/work.ts uses one: the shelf is
 * laid out for exactly these counts, and an empty column is a build error
 * rather than a UI state.
 */

export type NoteEntry = {
  title: string;
  date: string; // ISO yyyy-mm-dd, rendered as-is in a <time>
  excerpt: string;
};

export type BookReview = NoteEntry & {
  book: string;
  author: string;
};

export const POSTS: readonly [NoteEntry, NoteEntry, NoteEntry] = [
  {
    title: "Lorem ipsum dolor sit amet",
    date: "2026-09-18",
    excerpt:
      "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Ut enim ad minim veniam",
    date: "2026-09-04",
    excerpt:
      "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "Duis aute irure dolor",
    date: "2026-08-21",
    excerpt:
      "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
];

export const TILS: readonly [NoteEntry, NoteEntry, NoteEntry] = [
  {
    title: "Excepteur sint occaecat",
    date: "2026-09-22",
    excerpt: "Cupidatat non proident, sunt in culpa qui officia deserunt.",
  },
  {
    title: "Mollit anim id est laborum",
    date: "2026-09-12",
    excerpt: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem.",
  },
  {
    title: "Nemo enim ipsam voluptatem",
    date: "2026-08-30",
    excerpt: "Quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.",
  },
];

export const BOOK_REVIEW: BookReview = {
  title: "Neque porro quisquam est",
  book: "Lorem Ipsum",
  author: "Marcus Tullius",
  date: "2026-09-09",
  excerpt:
    "Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
};
