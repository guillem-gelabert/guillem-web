"use client";

import { useEffect, type RefObject } from "react";

type ElementRef = RefObject<HTMLElement | null>;

const MOBILE_QUERY = "(max-width: 64rem)";
const LANDSCAPE_QUERY = "(orientation: landscape)";

function readPercentage(styles: CSSStyleDeclaration, property: string) {
  const value = Number.parseFloat(styles.getPropertyValue(property));
  return Number.isFinite(value) ? value : 50;
}

export function useSeamAlignment(
  sceneRef: ElementRef,
  boxARef: ElementRef,
  boxBRef: ElementRef,
) {
  useEffect(() => {
    const scene = sceneRef.current;
    const boxA = boxARef.current;
    const boxB = boxBRef.current;

    if (!scene || !boxA || !boxB) return;

    const alignSeam = () => {
      const sceneRect = scene.getBoundingClientRect();
      const aRect = boxA.getBoundingClientRect();
      const bRect = boxB.getBoundingClientRect();

      const isMobile = window.matchMedia(MOBILE_QUERY).matches;
      const isMobileLandscape =
        isMobile && window.matchMedia(LANDSCAPE_QUERY).matches;
      let directionX: number;
      let directionY: number;

      if (isMobile) {
        const sceneStyles = window.getComputedStyle(scene);
        const centerMode = isMobileLandscape
          ? "mobile-landscape"
          : "mobile-portrait";
        const centerXPercent = readPercentage(
          sceneStyles,
          `--gradient-center-${centerMode}-x`,
        );
        const centerYPercent = readPercentage(
          sceneStyles,
          `--gradient-center-${centerMode}-y`,
        );
        const centerX = (sceneRect.width * centerXPercent) / 100;
        const centerY = (sceneRect.height * centerYPercent) / 100;
        const gapCenterX =
          (aRect.right + bRect.left) / 2 - sceneRect.left;
        const gapCenterY =
          (aRect.bottom + bRect.top) / 2 - sceneRect.top;

        directionX = gapCenterX - centerX;
        directionY = gapCenterY - centerY;

        scene.style.setProperty("--gradient-center-x", `${centerX}px`);
        scene.style.setProperty("--gradient-center-y", `${centerY}px`);
      } else {
        const sceneStyles = window.getComputedStyle(scene);
        const centerXPercent = readPercentage(
          sceneStyles,
          "--gradient-center-desktop-x",
        );
        const centerYPercent = readPercentage(
          sceneStyles,
          "--gradient-center-desktop-y",
        );
        const centerX = (sceneRect.width * centerXPercent) / 100;
        const centerY = (sceneRect.height * centerYPercent) / 100;
        const gapCenterX =
          (aRect.right + bRect.left) / 2 - sceneRect.left;
        const gapCenterY =
          (aRect.bottom + bRect.top) / 2 - sceneRect.top;

        directionX = gapCenterX - centerX;
        directionY = gapCenterY - centerY;

        scene.style.removeProperty("--gradient-center-x");
        scene.style.removeProperty("--gradient-center-y");
      }

      // The seam aims from its responsive pivot through the center of the
      // measured inner-corner gap.
      // Conic angles start at twelve o'clock and advance clockwise.
      const angle = Math.atan2(directionX, -directionY) * (180 / Math.PI);

      scene.style.setProperty("--seam-angle", `${angle}deg`);
    };

    alignSeam();

    const observer = new ResizeObserver(alignSeam);
    observer.observe(scene);
    observer.observe(boxA);
    observer.observe(boxB);

    return () => observer.disconnect();
  }, [boxARef, boxBRef, sceneRef]);
}
