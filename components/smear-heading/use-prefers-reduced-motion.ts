"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Live-toggling prefers-reduced-motion gate.
 *
 * Ported intent from text_trail_demo/index.html:328 (`matchMedia` construction)
 * and :1066 (`reducedMotion.addEventListener('change', ...)`) — Pitfall 6:
 * checked once at mount AND re-evaluated on every OS-level toggle while the
 * tab stays open, no page reload required.
 *
 * `matchMedia` only ever runs inside `useEffect` — `window` does not exist
 * during SSR, so this must never be read at module top-level or during render.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    setPrefersReducedMotion(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}
