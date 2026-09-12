"use client";

import { useEffect, type RefObject } from "react";

/**
 * The scroll runway: a few pixels of nothing above the composition, scrolled
 * past on load.
 *
 * iOS Safari composites the SCROLLING DOCUMENT's pixels behind the
 * translucent status bar, but only once that document has NON-ZERO scroll. At
 * exactly 0 it falls back to a flat colour instead — Safari 26 takes that
 * from the background-color of a fixed or sticky element near the viewport
 * edge, else from <body>, which here is --color-paper. That is the white slab
 * behind the Dynamic Island: it appears at the top of the landing and
 * corrects itself the instant anyone scrolls, because scrolling is what hands
 * Safari real pixels.
 *
 * So the fix is not to pick a better colour — it is to not be at zero. A
 * runway makes the document a little taller than its content and this effect
 * scrolls past it on load. The offset and the scroll cancel, so nothing moves
 * on screen and every viewport-relative measurement is unchanged, but the
 * document is now at non-zero scroll from the first paint and the strip shows
 * the composition.
 *
 * The other half of the same technique is already in place: the scene is
 * 100lvh with .grain at inset: 0, so the composition bleeds past the visual
 * viewport and there is something under the strip to composite.
 *
 * What this does NOT disturb: the smear trail. components/smear-heading
 * registers each heading at `rect.top + window.scrollY` and its frame loop
 * subtracts `window.scrollY` again, so a constant offset cancels on both
 * sides. The scroll origin is what broke the last time this area was touched
 * (fb8613d), which is why it is written down here.
 */
export function useScrollRunway(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const runway = ref.current;
    if (!runway) return;

    // Read the height off the element rather than taking a number as an
    // argument: --runway is declared in landing-seam.module.css and this has
    // to agree with it, and the computed height is that value already
    // resolved from whatever unit it is written in.
    const offset = runway.getBoundingClientRect().height;
    if (offset <= 0) return;

    // Only from a cold 0. Next's App Router restores a scroll position on
    // back-navigation before effects run, and overwriting it would throw the
    // visitor back to the top of a page they had already scrolled.
    if (window.scrollY !== 0) return;

    // "instant", never "smooth": this must not read as the page moving. It is
    // a correction to where the page already should have been, so animating
    // it would both look like a glitch and ignore prefers-reduced-motion.
    window.scrollTo({ top: offset, behavior: "instant" });
  }, [ref]);
}
