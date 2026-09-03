"use client";

import { useEffect, useRef } from "react";
import styles from "./style-playground.module.css";

export function SeamPlayground() {
  const sceneRef = useRef<HTMLElement>(null);
  const boxARef = useRef<HTMLDivElement>(null);
  const boxBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const boxA = boxARef.current;
    const boxB = boxBRef.current;

    if (!scene || !boxA || !boxB) return;

    const alignSeam = () => {
      const sceneRect = scene.getBoundingClientRect();
      const aRect = boxA.getBoundingClientRect();
      const bRect = boxB.getBoundingClientRect();

      const deltaX = bRect.left - aRect.right;
      const deltaY = bRect.top - aRect.bottom;
      const isPortrait = window.matchMedia(
        "(max-aspect-ratio: 1 / 1)",
      ).matches;
      let directionX = deltaX;
      let directionY = deltaY;

      if (isPortrait) {
        const sceneStyles = window.getComputedStyle(scene);
        const centerXPercent = Number.parseFloat(
          sceneStyles.getPropertyValue("--gradient-center-landscape-x"),
        );
        const centerYPercent = Number.parseFloat(
          sceneStyles.getPropertyValue("--gradient-center-landscape-y"),
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
        scene.style.removeProperty("--gradient-center-x");
        scene.style.removeProperty("--gradient-center-y");
      }

      // CSS conic angles start at twelve o'clock and advance clockwise. In
      // portrait, the seam points from the lower-left pivot through the gap.
      const angle = Math.atan2(directionX, -directionY) * (180 / Math.PI);

      scene.style.setProperty("--seam-angle", `${angle}deg`);
    };

    alignSeam();

    const observer = new ResizeObserver(alignSeam);
    observer.observe(scene);
    observer.observe(boxA);
    observer.observe(boxB);

    return () => observer.disconnect();
  }, []);

  return (
    <main
      ref={sceneRef}
      className={styles.scene}
      aria-label="Conical gradient geometry study"
    >
      <div ref={boxARef} className={`${styles.box} ${styles.boxA}`}>
        <span aria-hidden="true" className={styles.boxText}>
          BLACK
        </span>
        <span className={styles.srOnly}>Transparent box reading Black</span>
      </div>

      <div ref={boxBRef} className={`${styles.box} ${styles.boxB}`}>
        <span aria-hidden="true" className={styles.boxText}>
          WHITE
        </span>
        <span className={styles.srOnly}>Transparent box reading White</span>
      </div>
    </main>
  );
}
