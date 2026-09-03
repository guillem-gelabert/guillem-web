"use client";

import { useEffect, useRef } from "react";
import styles from "./style-playground.module.css";

type Point = {
  x: number;
  y: number;
};

function getBottomLeftBoundaryPoint(
  start: Point,
  end: Point,
  width: number,
  height: number,
) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const intersections: Point[] = [];
  const epsilon = 0.01;

  const addIntersection = (x: number, y: number) => {
    if (
      x >= -epsilon &&
      x <= width + epsilon &&
      y >= -epsilon &&
      y <= height + epsilon
    ) {
      intersections.push({
        x: Math.min(width, Math.max(0, x)),
        y: Math.min(height, Math.max(0, y)),
      });
    }
  };

  if (Math.abs(deltaX) > epsilon) {
    addIntersection(0, start.y + (-start.x / deltaX) * deltaY);
    addIntersection(
      width,
      start.y + ((width - start.x) / deltaX) * deltaY,
    );
  }

  if (Math.abs(deltaY) > epsilon) {
    addIntersection(start.x + (-start.y / deltaY) * deltaX, 0);
    addIntersection(
      start.x + ((height - start.y) / deltaY) * deltaX,
      height,
    );
  }

  if (intersections.length === 0) {
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
  }

  return intersections.reduce((closest, point) => {
    const distance = point.x ** 2 + (height - point.y) ** 2;
    const closestDistance = closest.x ** 2 + (height - closest.y) ** 2;

    return distance < closestDistance ? point : closest;
  });
}

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
      const pivot = getBottomLeftBoundaryPoint(
        { x: startX, y: startY },
        { x: endX, y: endY },
        sceneRect.width,
        sceneRect.height,
      );

      // CSS conic angles start at twelve o'clock and advance clockwise.
      // With hard stops at 0 and 180 degrees, the two rays form the full
      // line between the requested corners.
      const angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);

      scene.style.setProperty("--seam-angle", `${angle}deg`);
      scene.style.setProperty("--seam-x", `${pivot.x}px`);
      scene.style.setProperty("--seam-y", `${pivot.y}px`);
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
