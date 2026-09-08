import type { Page } from "@playwright/test";

/**
 * Test-side counterpart to components/smear-heading/scroll-root.ts.
 *
 * The document is locked and #scroll-root is the scroller (see the
 * app-shell block in app/globals.css), so `window.scrollBy` moves nothing
 * and `document.documentElement.scrollHeight` is one viewport by
 * construction. Every scroll-driven assertion has to go through the
 * scroller instead.
 *
 * These helpers deliberately do NOT fall back to the window when
 * #scroll-root is missing: a silent fallback would let the app-shell
 * regress — the strip bleeding again on iOS — while these tests stayed
 * green, which is the failure mode the specs they serve were written to
 * catch.
 */
export function scrollBy(page: Page, y: number) {
  return page.evaluate((delta) => {
    const scroller = document.getElementById("scroll-root");
    if (!scroller) throw new Error("#scroll-root is missing — the app-shell is gone");
    scroller.scrollBy(0, delta);
  }, y);
}

/**
 * The scroller's own overflow, for the "a visitor can genuinely scroll
 * this" guards. Compared against the scroller's client height rather than
 * window.innerHeight: the scroller is inset by nothing today, but it is
 * what actually clips the content, so it is the honest denominator.
 */
export function readOverflow(page: Page) {
  return page.evaluate(() => {
    const scroller = document.getElementById("scroll-root");
    if (!scroller) throw new Error("#scroll-root is missing — the app-shell is gone");
    return {
      scrollHeight: scroller.scrollHeight,
      viewportHeight: scroller.clientHeight,
    };
  });
}

/** The scroller's own end, for "scroll all the way down" assertions. */
export function scrollToBottom(page: Page) {
  return page.evaluate(() => {
    const scroller = document.getElementById("scroll-root");
    if (!scroller) throw new Error("#scroll-root is missing — the app-shell is gone");
    scroller.scrollTo(0, scroller.scrollHeight);
  });
}
