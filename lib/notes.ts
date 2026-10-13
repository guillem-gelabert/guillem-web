import type { WorkShot } from "./work";

export type NoteEntry = {
  title: string;
  subtitle: string; // one line, the square's only copy under the title
  href: string;
  shot: WorkShot | null;
  // The one tag a note carries: what kind of note it is. Posts carry none —
  // a post is the default, and the grid only marks the exceptions.
  tag: "TIL" | "Book" | null;
};

/** Grid order: posts, then TILs, then reviews. */
export const NOTES: readonly NoteEntry[] = [
  {
    title: "What Are Embeddings",
    subtitle: "Finding similar colours, footballers and songs by giving them coordinates.",
    href: "/writing/what-are-embeddings",
    tag: null,
    shot: {
      src: "/work/what-are-embeddings.png",
      width: 640,
      height: 640,
      alt: "Pixel-art sailing ship following coloured waypoints towards an island with a lemon tree.",
    },
  },
];
