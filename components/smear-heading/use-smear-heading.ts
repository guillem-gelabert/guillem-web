"use client";

import { useLayoutEffect, useRef } from "react";
import {
  useSmearHeadingRegistry,
  type TrailProperty,
} from "./smear-heading-provider";

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
export function useSmearHeading<T extends HTMLElement>(
  // Defaults to the text trail this hook was written for. The disc passes
  // "boxShadow" so the thumbnail smears as circles rather than glyphs.
  property: TrailProperty = "textShadow",
) {
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
      // Document position, not viewport position: the provider's frame loop
      // subtracts window.scrollY from this every frame, so the two have to
      // read the same origin or every heading smears from the wrong place.
      register(current, rect.top + window.scrollY, property);
    });

    return () => {
      cancelled = true;
      unregister(el);
    };
  }, [register, unregister, property]);

  return ref;
}
