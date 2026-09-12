import type { Page } from "@playwright/test";

/**
 * Scroll helpers for the specs that drive the smear trail.
 *
 * The document is the scroller (app/globals.css). It was not, between
 * fb8613d and the commit that restored the glass behind the iOS status bar,
 * and these helpers went through #scroll-root for that period — hence the
 * file name, kept so the three specs that import it do not churn.
 *
 * They stay as named helpers rather than inline `window.scrollBy` calls
 * because the choice of scroller is a property of the app-shell, and one
 * place to change it is what stops the specs disagreeing with each other if
 * it ever moves again.
 */
export function scrollBy(page: Page, y: number) {
  return page.evaluate((delta) => window.scrollBy(0, delta), y);
}

/**
 * The document's own overflow, for the "a visitor can genuinely scroll this"
 * guards.
 */
export function readOverflow(page: Page) {
  return page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
}

/** The document's end, for "scroll all the way down" assertions. */
export function scrollToBottom(page: Page) {
  return page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
}
