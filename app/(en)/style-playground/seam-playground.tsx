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

      const startX = aRect.right - sceneRect.left;
      const startY = aRect.bottom - sceneRect.top;
      const endX = bRect.left - sceneRect.left;
      const endY = bRect.top - sceneRect.top;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // CSS conic angles start at twelve o'clock and advance clockwise.
      // With hard stops at 0 and 180 degrees, the two rays form the full
      // line between the requested corners.
      const angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);

      scene.style.setProperty("--seam-angle", `${angle}deg`);
      scene.style.setProperty("--seam-x", `${(startX + endX) / 2}px`);
      scene.style.setProperty("--seam-y", `${(startY + endY) / 2}px`);
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
        <span aria-hidden="true">A</span>
        <span className={styles.srOnly}>Blue box A</span>
      </div>

      <div ref={boxBRef} className={`${styles.box} ${styles.boxB}`}>
        <span aria-hidden="true">B</span>
        <span className={styles.srOnly}>Red box B</span>
      </div>
    </main>
  );
}
