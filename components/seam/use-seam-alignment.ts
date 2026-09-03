"use client";

import { useEffect, type RefObject } from "react";

type ElementRef = RefObject<HTMLElement | null>;

// Matches the two phone branches in the seam stylesheets — a device
// test, not a width one. Keep the three in step: the hook reads the
// pivot the branch it matches declares.
const MOBILE_QUERY = "(hover: none) and (pointer: coarse)";
const LANDSCAPE_QUERY = "(orientation: landscape)";

// The gradient centres are viewport lengths (vw/dvh), so they cannot be
// read with parseFloat and scaled against the scene — 85dvh would parse to
// 85 and then be treated as 85% of whatever the scene happens to be. This
// resolves the declared value the way the browser does, in pixels, by
// letting it compute on a throwaway element. Falls back to half the given
// extent when the property is missing or does not resolve.
function readLength(
  scene: HTMLElement,
  styles: CSSStyleDeclaration,
  property: string,
  fallbackExtent: number,
) {
  const declared = styles.getPropertyValue(property).trim();
  if (declared === "") return fallbackExtent / 2;

  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = declared;
  scene.appendChild(probe);
  const resolved = probe.getBoundingClientRect().width;
  probe.remove();

  return Number.isFinite(resolved) ? resolved : fallbackExtent / 2;
}

// seamStartRef and seamEndRef are the two boxes whose facing corners the
// seam threads between — the upper-left box's bottom-right corner and the
// lower-right box's top-left one. Where a corner holds a stack of boxes,
// that is whichever box in it actually pinches the gap, not simply the
// lowest or the highest.
export function useSeamAlignment(
  sceneRef: ElementRef,
  seamStartRef: ElementRef,
  seamEndRef: ElementRef,
) {
  useEffect(() => {
    const scene = sceneRef.current;
    const seamStart = seamStartRef.current;
    const seamEnd = seamEndRef.current;

    if (!scene || !seamStart || !seamEnd) return;

    const alignSeam = () => {
      const sceneRect = scene.getBoundingClientRect();
      const sceneStyles = window.getComputedStyle(scene);

      const isMobile = window.matchMedia(MOBILE_QUERY).matches;
      const isMobileLandscape =
        isMobile && window.matchMedia(LANDSCAPE_QUERY).matches;

      if (isMobile) {
        // Both phone modes take their angle straight from CSS rather than
        // deriving it. A phone's boxes are full-bleed and stacked, so the
        // gap between them is a horizontal band centred near the middle of
        // the screen; aiming at it from a corner pivot gives a near-vertical
        // ray however the content reflows. The declared angle is the design
        // decision — only the pivot still moves.
        const centerMode = isMobileLandscape
          ? "mobile-landscape"
          : "mobile-portrait";
        const centerX = readLength(
          scene,
          sceneStyles,
          `--gradient-center-${centerMode}-x`,
          sceneRect.width,
        );
        const centerY = readLength(
          scene,
          sceneStyles,
          `--gradient-center-${centerMode}-y`,
          sceneRect.height,
        );

        scene.style.setProperty("--gradient-center-x", `${centerX}px`);
        scene.style.setProperty("--gradient-center-y", `${centerY}px`);
        // Hand the angle back to the stylesheet's own declaration.
        // On :root, not the scene: the mirrored section is the scene's
        // SIBLING, so an inline value here would never reach it and its
        // seam would sit at the stylesheet's default while this one
        // tracked the boxes.
        document.documentElement.style.removeProperty("--seam-angle");
        return;
      }

      // Desktop aims from its pivot through the centre of the gap the two
      // seam boxes leave between their facing corners.
      const startRect = seamStart.getBoundingClientRect();
      const endRect = seamEnd.getBoundingClientRect();
      const centerX = readLength(
        scene,
        sceneStyles,
        "--gradient-center-desktop-x",
        sceneRect.width,
      );
      const centerY = readLength(
        scene,
        sceneStyles,
        "--gradient-center-desktop-y",
        sceneRect.height,
      );
      const gapCenterX = (startRect.right + endRect.left) / 2 - sceneRect.left;
      const gapCenterY = (startRect.bottom + endRect.top) / 2 - sceneRect.top;

      scene.style.removeProperty("--gradient-center-x");
      scene.style.removeProperty("--gradient-center-y");

      // Conic angles start at twelve o'clock and advance clockwise.
      const angle =
        Math.atan2(gapCenterX - centerX, -(gapCenterY - centerY)) *
        (180 / Math.PI);

      document.documentElement.style.setProperty("--seam-angle", `${angle}deg`);
    };

    alignSeam();

    const observer = new ResizeObserver(alignSeam);
    observer.observe(scene);
    observer.observe(seamStart);
    observer.observe(seamEnd);

    return () => {
      observer.disconnect();
      // --seam-angle lives on :root now, so it outlives this component
      // unless it is cleared here. A stale value would be inherited by
      // whatever renders next.
      document.documentElement.style.removeProperty("--seam-angle");
    };
  }, [seamStartRef, seamEndRef, sceneRef]);
}
