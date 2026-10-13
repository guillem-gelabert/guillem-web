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
// Read once on load, and again only when the phone turns. It used to follow
// every visualViewport resize and keep the smallest height seen, so the
// toolbar collapsing mid-scroll could not grow the composition. That made
// it a ratchet: any reading under the real height while Safari scrolled
// shrank the story corner for good, and on an iPhone 17 Pro the disc went
// from ~150px to ~60px over a few scrolls. Nothing a scroll does is a
// reason to re-lay the hero out, so nothing a scroll does is read.
// Pinch-zoom (scale !== 1) shrinks the visual viewport without the screen
// getting any smaller, so a reading taken zoomed is skipped.
export function useVisibleHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    const measure = () => {
      if (viewport.scale !== 1) return;
      root.style.setProperty("--visible-height", `${viewport.height}px`);
    };

    measure();
    // The new size is not in visualViewport yet when the media query flips,
    // so the reading waits for the next resize after it.
    const orientation = window.matchMedia("(orientation: portrait)");
    const turned = () => viewport.addEventListener("resize", measure, { once: true });
    orientation.addEventListener("change", turned);
    return () => {
      orientation.removeEventListener("change", turned);
      viewport.removeEventListener("resize", measure);
      root.style.removeProperty("--visible-height");
    };
  }, []);
}
