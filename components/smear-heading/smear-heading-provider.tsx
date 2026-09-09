"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { getScrollY } from "./scroll-root";

// Constants ported verbatim from text_trail_demo/index.html:324-327,362.
const MAX_TRAIL = 280;
const MAX_SHADOWS = 240;
// The box-shadow cap. 240 layers of a 385px filled circle is ~28 million
// shadow pixels a frame where 240 glyph shadows are a small fraction of
// that, and the trail's own construction makes most of them invisible: the
// layers are evenly spaced along the offset, so past a few dozen each new
// one lands within a pixel of its neighbour. 48 holds the same smear at a
// fraction of the fill.
const MAX_DISC_SHADOWS = 48;
const SCROLL_STOP_DELAY = 120; // ms, debounce before treating scroll as "stopped"
const HUE_SPEED = 110; // degrees per second of scroll activity (:326)
const INITIAL_HUE = 345; // (:362)

// Kept as a shared switch rather than removing the provider, hook, or client
// leaves. Re-enable by changing this one value when the trail is wanted
// again; while false, no elements register and the driver attaches no input
// listeners or animation frames anywhere in the site.
export const TRAIL_ENABLED = false;

// The heading's own glyphs stay ink (--color-ink, pure black); the hue cycles
// on the trail *behind* them, so the smear reads as a moving colour field the
// black letterforms sit on. This restores the source's trailColor() cycling
// (:368-390, advanced in handleScroll at :902), which the initial Phase 1 port
// dropped per 01-UI-SPEC.md's monochrome-ink rule — superseded by explicit
// user direction during Phase 1 validation.
let trailHue = INITIAL_HUE;

// trailColor(), ported from :368-390. The source also returns red/green/blue
// components for its WebGL path; the text-shadow technique only consumes the
// `css` string, so only that is ported.
function trailColor(): string {
  const hue = ((trailHue % 360) + 360) % 360;
  return `hsl(${hue} 100% 50%)`;
}

// Which CSS property the trail is stacked into. text-shadow smears
// glyphs; box-shadow smears the element's own box and, because it respects
// border-radius, smears a border-radius: 50% element as a trail of circles.
// The layer syntax is identical for both — `0 <offset>px 0 <colour>` — so
// the draw loop is the same and only the property name differs.
export type TrailProperty = "textShadow" | "boxShadow";

interface HeadingState {
  documentTop: number;
  lagY: number;
  property: TrailProperty;
}

interface SmearHeadingRegistry {
  register: (
    el: HTMLElement,
    documentTop: number,
    property?: TrailProperty,
  ) => void;
  unregister: (el: HTMLElement) => void;
}

const SmearHeadingContext = createContext<SmearHeadingRegistry | null>(null);

export function useSmearHeadingRegistry(): SmearHeadingRegistry {
  const context = useContext(SmearHeadingContext);
  if (!context) {
    throw new Error(
      "useSmearHeadingRegistry must be used within a SmearHeadingProvider",
    );
  }
  return context;
}

/**
 * Owns the only `requestAnimationFrame` call in the whole tree — a single
 * shared driver iterating a registry of mounted headings, generalized from
 * text_trail_demo/index.html's single-`activeEffect` tab-switcher (RESEARCH.md
 * Architecture Pattern 3 / Pitfall 4).
 */
export function SmearHeadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const registryRef = useRef<Map<HTMLElement, HeadingState>>(new Map());
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersReducedMotionRef = useRef(prefersReducedMotion);

  // Sync the live ref read inside the rAF closure below. useLayoutEffect
  // (rather than useEffect) keeps the window between a reduced-motion toggle
  // and the ref catching up as tight as possible.
  useLayoutEffect(() => {
    prefersReducedMotionRef.current = prefersReducedMotion;
    if (prefersReducedMotion) {
      // T-01-11 mitigation: a live OS-level toggle mid-session must clear any
      // in-flight trail immediately, not just gate future frames.
      for (const [el, state] of registryRef.current) {
        el.style[state.property] = "none";
      }
    }
  }, [prefersReducedMotion]);

  // The shared driver: mounted once, torn down once. Ported from
  // createTextShadowEffect (:648-688) + frame()/start()/handleScroll()/
  // holdInput()/releaseInput()/finishScrolling() (:827-1063), generalized
  // from one `activeEffect` to `for (const [el, state] of registry)`.
  useLayoutEffect(() => {
    if (!TRAIL_ENABLED) return;

    const registry = registryRef.current;
    let animationFrame = 0;
    let previousTime = 0;
    let inputHeld = false;
    let touchGesture = false;
    let nonTouchScrolling = false;
    let scrollStopTimer: ReturnType<typeof setTimeout> | undefined;
    let lastScrollSample = performance.now(); // (:363)

    // draw(), ported from createTextShadowEffect.draw (:663-681), including
    // the source's `color.css` reference — every layer takes the current
    // cycling hue rather than a fixed literal.
    function draw(
      el: HTMLElement,
      targetY: number,
      lagY: number,
      strength: number,
      property: TrailProperty,
    ) {
      const difference = lagY - targetY;
      if (strength <= 0) {
        el.style[property] = "none";
        return;
      }

      const distance = Math.abs(difference);
      // box-shadow layers are whole filled discs rather than glyph
      // silhouettes, so the same 240 layers cover orders of magnitude more
      // pixels. MAX_DISC_SHADOWS is the cap for that case — measured, not
      // guessed: see the note by the constant.
      const cap = property === "boxShadow" ? MAX_DISC_SHADOWS : MAX_SHADOWS;
      const layers = Math.min(cap, Math.max(2, Math.ceil(distance * 2)));
      const color = trailColor();
      const shadows: string[] = [];
      for (let index = layers; index >= 1; index--) {
        const t = index / layers;
        shadows.push(`0 ${difference * t}px 0 ${color}`);
      }
      el.style[property] = shadows.join(",");
    }

    // frame(), ported from :827-874. Same exponential smoothing, trail
    // clamp, strength curve, and settle-below-0.15px-then-stop logic —
    // generalized to loop the registry instead of a single activeEffect.
    function frame(time: number) {
      const elapsed = Math.min(time - (previousTime || time), 40);
      const smoothing = 1 - Math.exp(-elapsed * 0.009);
      const scrollY = getScrollY();
      let anyActive = false;

      for (const [el, state] of registry) {
        const targetY = state.documentTop - scrollY;
        if (!inputHeld) {
          state.lagY += (targetY - state.lagY) * smoothing;
        }
        state.lagY =
          targetY +
          Math.max(-MAX_TRAIL, Math.min(MAX_TRAIL, state.lagY - targetY));

        const distance = Math.abs(state.lagY - targetY);
        const strength = Math.min(1, distance / 3);

        if (distance > 0.15) {
          draw(el, targetY, state.lagY, strength, state.property);
          anyActive = true;
        } else {
          state.lagY = targetY;
          draw(el, targetY, state.lagY, 0, state.property);
        }
      }

      previousTime = time;

      if (inputHeld) {
        animationFrame = 0;
        previousTime = 0;
        return;
      }

      if (anyActive) {
        animationFrame = requestAnimationFrame(frame);
      } else {
        // Settled: stop the loop entirely. The next scroll/pointer event's
        // start() call is what restarts it (:859-873's stop behavior).
        animationFrame = 0;
        previousTime = 0;
      }
    }

    // start(), ported from :876-881 — the prefers-reduced-motion early
    // return, checked before any frame is ever scheduled.
    function start() {
      if (
        prefersReducedMotionRef.current ||
        animationFrame ||
        registry.size === 0
      ) {
        return;
      }
      previousTime = 0;
      animationFrame = requestAnimationFrame(frame);
    }

    function holdInput() {
      inputHeld = true;
      start();
    }

    function releaseInput() {
      inputHeld = false;
      start();
    }

    function finishScrolling() {
      clearTimeout(scrollStopTimer);
      scrollStopTimer = undefined;
      if (touchGesture) {
        touchGesture = false;
        return;
      }
      if (nonTouchScrolling) {
        nonTouchScrolling = false;
        releaseInput();
      }
    }

    function scheduleScrollStop() {
      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(finishScrolling, SCROLL_STOP_DELAY);
    }

    function handleScroll() {
      // Hue advance, ported from :901-903 — tied to scroll samples, not to a
      // wall clock, so the colour only moves while the visitor is scrolling.
      const now = performance.now();
      const hueElapsed = Math.max(0, Math.min(now - lastScrollSample, 80));
      trailHue = (trailHue + (HUE_SPEED * hueElapsed) / 1000) % 360;
      lastScrollSample = now;

      scheduleScrollStop();
      if (!touchGesture && !nonTouchScrolling) {
        nonTouchScrolling = true;
        holdInput();
      }
      start();
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      touchGesture = true;
      nonTouchScrolling = false;
      holdInput();
    }

    function handlePointerUp(event: PointerEvent) {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        releaseInput();
        scheduleScrollStop();
      }
    }

    // On `document` in the capture phase, not on `window`: the scroller is
    // now #scroll-root (see scroll-root.ts), and scroll events do not bubble
    // — but they do run capture, so this catches the inner scroller without
    // depending on it being mounted when this effect runs. It still catches
    // the document's own scroll on routes that have no #scroll-root.
    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    document.addEventListener("scrollend", finishScrolling, {
      capture: true,
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
    });

    return () => {
      document.removeEventListener("scroll", handleScroll, {
        capture: true,
      });
      document.removeEventListener("scrollend", finishScrolling, {
        capture: true,
      });
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      cancelAnimationFrame(animationFrame);
      clearTimeout(scrollStopTimer);
    };
  }, []);

  const register = useCallback(
    (
      el: HTMLElement,
      documentTop: number,
      property: TrailProperty = "textShadow",
    ) => {
      if (!TRAIL_ENABLED) {
        // A component can remain mounted from a prior enabled build during
        // hot reload; explicitly clear the property rather than relying on
        // a repaint to make the old trail disappear.
        el.style[property] = "none";
        return;
      }
      registryRef.current.set(el, {
        documentTop,
        lagY: documentTop - getScrollY(),
        property,
      });
    },
    [],
  );

  const unregister = useCallback((el: HTMLElement) => {
    const state = registryRef.current.get(el);
    registryRef.current.delete(el);
    // Clear the property this element was actually registered with, or a
    // box-shadow trail would be left painted on unmount.
    el.style[state?.property ?? "textShadow"] = "none";
  }, []);

  const contextValue = useMemo(
    () => ({ register, unregister }),
    [register, unregister],
  );

  return (
    <SmearHeadingContext.Provider value={contextValue}>
      {children}
    </SmearHeadingContext.Provider>
  );
}
