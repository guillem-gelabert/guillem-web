"use client";

import { useEffect } from "react";

// Writes --visible-height to :root: the height of what the browser actually
// shows between its bars, read from visualViewport. The landing's
// --chrome-bottom is 100lvh minus this, and the story corner is sized to fit
// above it.
//
// 100svh is meant to be that same number, and on most loads it is. On some
// iOS loads it is not — Safari once reported 776 for a 714pt visible area,
// and Chrome put the "New story" badge under its toolbar — while
// visualViewport.height was right every time. Until this runs, the CSS falls
// back to 100svh.
//
// Only the SMALLEST height seen is kept: that is the toolbar-expanded state.
// Following every resize would resize the composition as the toolbar
// collapses mid-scroll. A width change (rotation) starts over, and pinch-zoom
// (scale !== 1) is ignored, since it shrinks the visual viewport without the
// screen getting any smaller.
export function useVisibleHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    let width = viewport.width;
    let smallest = Infinity;

    const update = () => {
      if (viewport.scale !== 1) return;
      if (viewport.width !== width) {
        width = viewport.width;
        smallest = Infinity;
      }
      if (viewport.height >= smallest) return;
      smallest = viewport.height;
      root.style.setProperty("--visible-height", `${smallest}px`);
    };

    update();
    viewport.addEventListener("resize", update);
    return () => {
      viewport.removeEventListener("resize", update);
      root.style.removeProperty("--visible-height");
    };
  }, []);
}
