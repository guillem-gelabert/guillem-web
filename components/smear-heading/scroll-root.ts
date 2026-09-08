"use client";

/**
 * The app-shell's scroller.
 *
 * iOS Safari composites the SCROLLING DOCUMENT's pixels behind the
 * translucent status bar, and `position: fixed` elements do not count. Once
 * the document has non-zero scroll, the strip behind the clock and battery
 * shows real page pixels rather than any colour you name — which is why the
 * landing's gradient bled into it and why painting the <body> canvas an
 * opaque brown only replaced the bleed with a band of the wrong colour.
 * `theme-color` is not a lever either: iOS 26 ignores it.
 *
 * The fix is to stop the document scrolling at all and scroll an inner
 * element instead (app-shell). With no scrolling document there are no
 * pixels to composite, so the strips show the solid <body> background.
 *
 * The cost is that `window.scrollY` is then permanently 0. Every scroll
 * position in the tree has to come from the scroller instead, and this
 * module is the single place that names it so the provider's frame loop and
 * use-smear-heading's registration cannot disagree — if they read different
 * origins, every heading registers at an offset and smears from the wrong
 * place.
 */
export const SCROLL_ROOT_ID = "scroll-root";

export function getScrollRoot(): HTMLElement | null {
  return document.getElementById(SCROLL_ROOT_ID);
}

/**
 * The scroll offset headings measure against.
 *
 * Falls back to `window.scrollY` rather than assuming 0: the provider wraps
 * every route, and a route that renders no #scroll-root (or a test mounting
 * a heading bare) still scrolls the document the ordinary way.
 */
export function getScrollY(): number {
  const scroller = getScrollRoot();
  return scroller ? scroller.scrollTop : window.scrollY;
}
