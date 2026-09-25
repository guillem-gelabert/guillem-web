"use client";

import { useLayoutEffect } from "react";

// Marks every other ROW of the "More work" grid so its pairs lay the other
// way round — square then circle — and the grid reads as a checkerboard.
//
// A script rather than :nth-child because the row a pair is on is not in the
// markup: the grid is auto-fill (landing-seam.module.css, .more), so the
// column count follows the width, and a rule written for two columns is wrong
// at three. The rows are read off the layout instead — pairs sharing an
// offsetTop share a row — and re-read whenever the list resizes.
//
// Renders nothing. The server HTML is unflipped; the grid sits below the
// fold, so the first flip lands before anyone scrolls to it.
export function PairRows({ listSelector }: { listSelector: string }) {
  useLayoutEffect(() => {
    const list = document.querySelector<HTMLElement>(listSelector);
    if (!list) return;

    const mark = () => {
      let row = -1;
      let top: number | null = null;
      for (const pair of Array.from(list.children) as HTMLElement[]) {
        if (pair.offsetTop !== top) {
          top = pair.offsetTop;
          row += 1;
        }
        pair.toggleAttribute("data-flipped", row % 2 === 1);
      }
    };

    mark();
    const observer = new ResizeObserver(mark);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listSelector]);

  return null;
}
