"use client";

import { useLayoutEffect, useRef } from "react";
import { useSmearHeadingRegistry } from "./smear-heading-provider";
import { getScrollY } from "./scroll-root";

/**
 * Per-heading registration hook. Registers on mount, unregisters on unmount.
 *
 * Ported intent from text_trail_demo/index.html:1067
 * (`document.fonts.ready.then(() => activateApproach(...))`) — the benchmark
 * waits for fonts to finish loading before ever measuring
 * `getBoundingClientRect()`, avoiding a stale rect measured against a
 * fallback font. `useLayoutEffect` schedules the measurement after paint;
 * the actual `register()` call is deferred further, to after
 * `document.fonts.ready` resolves.
 *
 * No inline `text-shadow` is ever set from server-rendered markup (Pitfall 5)
 * — this hook only ever writes to the DOM after mount.
 */
export function useSmearHeading<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const { register, unregister } = useSmearHeadingRegistry();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      const current = ref.current;
      if (!current) return;
      const rect = current.getBoundingClientRect();
      // getScrollY(), not window.scrollY: under the app-shell the document
      // never scrolls, so window.scrollY is always 0 and this would register
      // every heading at its viewport position instead of its document
      // position. The provider's frame loop reads the same helper.
      register(current, rect.top + getScrollY());
    });

    return () => {
      cancelled = true;
      unregister(el);
    };
  }, [register, unregister]);

  return ref;
}
