"use client";

import { useLayoutEffect } from "react";

// Marks each pair of the "More work" grid with its place in the
// checkerboard: data-flipped on odd rows, which lay circle first, and
// data-tone="light" where row plus column is odd, which paints the pair
// white (more-work.module.css).
//
// A script rather than :nth-child because the row a pair is on is not in the
// markup: the grid is auto-fill (landing-seam.module.css, .more), so the
// column count follows the width, and a rule written for two columns is wrong
// at three. The rows are read off the layout instead — pairs sharing an
// offsetTop share a row, and their order in it is the column — and re-read
// whenever the list resizes.
//
// Renders nothing. The server HTML is unflipped and all dark; the grid
// sits below the fold, so the first pass lands before anyone scrolls to it.
export function PairRows({ listSelector }: { listSelector: string }) {
  useLayoutEffect(() => {
    const list = document.querySelector<HTMLElement>(listSelector);
    if (!list) return;

    const mark = () => {
      let row = -1;
      let column = 0;
      let top: number | null = null;
      for (const pair of Array.from(list.children) as HTMLElement[]) {
        if (pair.offsetTop !== top) {
          top = pair.offsetTop;
          row += 1;
          column = 0;
        }
        pair.toggleAttribute("data-flipped", row % 2 === 1);
        pair.dataset.tone = (row + column) % 2 === 1 ? "light" : "dark";
        column += 1;
      }
    };

    mark();
    const observer = new ResizeObserver(mark);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listSelector]);

  return null;
}
