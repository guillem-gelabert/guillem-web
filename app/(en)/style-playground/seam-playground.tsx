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
      const aRect = boxA.getBoundingClientRect();
      const bRect = boxB.getBoundingClientRect();

      const deltaX = bRect.left - aRect.right;
      const deltaY = bRect.top - aRect.bottom;

      // CSS conic angles start at twelve o'clock and advance clockwise.
      // The hard stops form a line with the requested corner-to-corner slope;
      // its origin is positioned independently in CSS.
      const angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);

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
