"use client";

import { useEffect } from "react";

// Writes --visible-height to :root: the height of what the browser actually
// shows between its bars with the toolbar expanded, read from
// visualViewport. The landing's --chrome-bottom is 100lvh minus this (capped
// at 100svh), and the story corner is sized to fit above it.
//
// 100svh is meant to be that same number, and on most loads it is. On some
// iOS loads it is not — Safari once reported 776 for a 714pt visible area,
// and Chrome put the "New story" badge under its toolbar. Until this runs,
// the CSS falls back to 100svh.
//
// The LARGEST height seen while the page is at the top. Not the first one:
// on an iPhone 17 Pro (iOS 26) the first reading on some loads was 561 for
// a 714 visible area, and the disc came out 86px instead of 220. Not the
// smallest either: that was a ratchet, and the same low readings shrank the
// story corner for good. Only at the top, because scrolling collapses the
// toolbar and the visual viewport grows by its height; the stylesheet's
// 100svh cap covers a collapse that happens without a scroll. A width change
// (rotation) starts over, and pinch-zoom (scale !== 1) is ignored, since it
// shrinks the visual viewport without the screen getting any smaller.
//
// Written once the readings settle, not as each arrives. That low first
// reading is Safari's toolbar on its way from its loading size to its
// resting one, and following it drew the disc tiny and then grew it in
// front of you on every refresh. Until a value is written the stylesheet
// uses 100svh, which was right on that phone from the start.
//
// And only when it differs from what is already in effect by a real
// margin. The same phone reported 712 on one load and 714 on the next for
// the same screen, and following that moved the disc by a couple of pixels
// on refresh. Off by less than this, 100svh (or the value already written)
// stays; the readings this exists for were off by 60px and more.
const SETTLE_MS = 250;
const MARGIN_PX = 16;

function smallViewportHeight() {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;height:100svh";
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}
export function useVisibleHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    let width = viewport.width;
    let largest = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const write = () => {
      const current =
        Number.parseFloat(root.style.getPropertyValue("--visible-height")) || smallViewportHeight();
      if (Math.abs(largest - current) < MARGIN_PX) return;
      root.style.setProperty("--visible-height", `${largest}px`);
    };

    const update = () => {
      if (viewport.scale !== 1) return;
      if (viewport.width !== width) {
        width = viewport.width;
        largest = 0;
      }
      if (window.scrollY > 0 || viewport.height <= largest) return;
      largest = viewport.height;
      clearTimeout(timer);
      timer = setTimeout(write, SETTLE_MS);
    };

    update();
    viewport.addEventListener("resize", update);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(timer);
      viewport.removeEventListener("resize", update);
      window.removeEventListener("resize", update);
      root.style.removeProperty("--visible-height");
    };
  }, []);
}
