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

// Constants ported verbatim from text_trail_demo/index.html:324-327,362.
const MAX_TRAIL = 280;
const MAX_SHADOWS = 240;
const SCROLL_STOP_DELAY = 120; // ms, debounce before treating scroll as "stopped"
const HUE_SPEED = 110; // degrees per second of scroll activity (:326)
const INITIAL_HUE = 345; // (:362)

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

interface HeadingState {
  documentTop: number;
  lagY: number;
}

interface SmearHeadingRegistry {
  register: (el: HTMLElement, documentTop: number) => void;
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
      for (const el of registryRef.current.keys()) {
        el.style.textShadow = "none";
      }
    }
  }, [prefersReducedMotion]);

  // The shared driver: mounted once, torn down once. Ported from
  // createTextShadowEffect (:648-688) + frame()/start()/handleScroll()/
  // holdInput()/releaseInput()/finishScrolling() (:827-1063), generalized
  // from one `activeEffect` to `for (const [el, state] of registry)`.
  useLayoutEffect(() => {
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
    ) {
      const difference = lagY - targetY;
      if (strength <= 0) {
        el.style.textShadow = "none";
        return;
      }

      const distance = Math.abs(difference);
      const layers = Math.min(MAX_SHADOWS, Math.max(2, Math.ceil(distance * 2)));
      const color = trailColor();
      const shadows: string[] = [];
      for (let index = layers; index >= 1; index--) {
        const t = index / layers;
        shadows.push(`0 ${difference * t}px 0 ${color}`);
      }
      el.style.textShadow = shadows.join(",");
    }

    // frame(), ported from :827-874. Same exponential smoothing, trail
    // clamp, strength curve, and settle-below-0.15px-then-stop logic —
    // generalized to loop the registry instead of a single activeEffect.
    function frame(time: number) {
      const elapsed = Math.min(time - (previousTime || time), 40);
      const smoothing = 1 - Math.exp(-elapsed * 0.009);
      const scrollY = window.scrollY;
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
          draw(el, targetY, state.lagY, strength);
          anyActive = true;
        } else {
          state.lagY = targetY;
          draw(el, targetY, state.lagY, 0);
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", finishScrolling, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", finishScrolling);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      cancelAnimationFrame(animationFrame);
      clearTimeout(scrollStopTimer);
    };
  }, []);

  const register = useCallback((el: HTMLElement, documentTop: number) => {
    registryRef.current.set(el, {
      documentTop,
      lagY: documentTop - window.scrollY,
    });
  }, []);

  const unregister = useCallback((el: HTMLElement) => {
    registryRef.current.delete(el);
    el.style.textShadow = "none";
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
