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
    // Greyscale at rest and the colour original on hover, like the project
    // circles (lib/work.ts). The grey is a luminance reduction in linear light.
    shot: {
      src: "/work/what-are-embeddings-bw.png",
      width: 640,
      height: 640,
      reveal: {
        src: "/work/what-are-embeddings.png",
        width: 640,
        height: 640,
      },
      alt: "Pixel-art sailing ship following coloured waypoints towards an island with a lemon tree.",
    },
  },
  {
    title: "COMMENT: John Hempton on the Financials of A.I.",
    subtitle: "A.I. will transform the world and still has the worst investment profile he has ever seen.",
    href: "/writing/the-worst-business-in-the-world",
    tag: null,
    // His portrait run through DeepDream (scripts/deepdream-tile.py, photo
    // mode) until it is mostly the network's dog faces and eyes. Greyscale at
    // rest and the colour dream on hover; the grey is a luminance reduction
    // in linear light, as for the other shots.
    shot: {
      src: "/work/hempton-dream-bw.webp",
      width: 640,
      height: 640,
      reveal: {
        src: "/work/hempton-dream.webp",
        width: 640,
        height: 640,
      },
      alt: "John Hempton's portrait run through DeepDream until only the outline of his head is left, filled with dog faces and eyes.",
    },
  },
];
