"use client";

import { Leva, folder, useControls } from "leva";
import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./style-playground.module.css";

type PlaygroundStyle = CSSProperties & {
  [property: `--${string}`]: string | number;
};

export function SeamPlayground() {
  const {
    edgeInset,
    cornerGap,
    seamRise,
    boxMinWidth,
    boxMinHeight,
    centerLeft,
    centerBottom,
    angleOffset,
    gradientStart,
    gradientEnd,
    outlineWidth,
    anchorSize,
  } = useControls({
    Layout: folder({
      edgeInset: {
        value: 3.5,
        min: 1,
        max: 10,
        step: 0.1,
        label: "Edge inset (vw)",
      },
      cornerGap: {
        value: 13,
        min: 3,
        max: 30,
        step: 0.5,
        label: "Corner gap (vw)",
      },
      seamRise: {
        value: 8,
        min: 2,
        max: 20,
        step: 0.25,
        label: "Seam rise (vw)",
      },
      boxMinWidth: {
        value: 224,
        min: 120,
        max: 640,
        step: 8,
        label: "Min width (px)",
      },
      boxMinHeight: {
        value: 128,
        min: 80,
        max: 480,
        step: 8,
        label: "Min height (px)",
      },
    }),
    Gradient: folder({
      centerLeft: {
        value: 15,
        min: 0,
        max: 100,
        step: 1,
        label: "Center left (%)",
      },
      centerBottom: {
        value: 15,
        min: 0,
        max: 100,
        step: 1,
        label: "Center bottom (%)",
      },
      angleOffset: {
        value: 0,
        min: -180,
        max: 180,
        step: 1,
        label: "Angle offset (°)",
      },
      gradientStart: {
        value: "#000000",
        label: "Start color",
      },
      gradientEnd: {
        value: "#ffffff",
        label: "End color",
      },
    }),
    Frames: folder({
      outlineWidth: {
        value: 1,
        min: 0,
        max: 4,
        step: 0.5,
        label: "Outline (px)",
      },
      anchorSize: {
        value: 10,
        min: 0,
        max: 24,
        step: 1,
        label: "Anchor size (px)",
      },
    }),
  });

  const sceneRef = useRef<HTMLElement>(null);
  const boxARef = useRef<HTMLDivElement>(null);
  const boxBRef = useRef<HTMLDivElement>(null);

  const sceneStyle: PlaygroundStyle = {
    "--edge": `clamp(1rem, ${edgeInset}vw, 12rem)`,
    "--corner-gap": `clamp(3rem, ${cornerGap}vw, 30rem)`,
    "--seam-rise": `clamp(0.125rem, calc(${seamRise}vw - 1.75rem), 20rem)`,
    "--box-min-width": `${boxMinWidth}px`,
    "--box-min-height": `${boxMinHeight}px`,
    "--gradient-center-landscape-x": `${centerLeft}%`,
    "--gradient-center-landscape-y": `${100 - centerBottom}%`,
    "--gradient-start": gradientStart,
    "--gradient-end": gradientEnd,
    "--outline-width": `${outlineWidth}px`,
    "--anchor-size": `${anchorSize}px`,
  };

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

      // CSS conic angles start at twelve o'clock and advance clockwise. The
      // narrow wrap seam follows the corner-to-corner direction while its
      // origin remains independently controllable.
      const angle =
        Math.atan2(deltaX, -deltaY) * (180 / Math.PI) + angleOffset;

      scene.style.setProperty("--seam-angle", `${angle}deg`);

      if (window.matchMedia("(max-aspect-ratio: 1 / 1)").matches) {
        const centerX = (aRect.right + bRect.left) / 2 - sceneRect.left;
        const centerY = (aRect.bottom + bRect.top) / 2 - sceneRect.top;

        scene.style.setProperty("--gradient-center-x", `${centerX}px`);
        scene.style.setProperty("--gradient-center-y", `${centerY}px`);
      } else {
        scene.style.removeProperty("--gradient-center-x");
        scene.style.removeProperty("--gradient-center-y");
      }
    };

    alignSeam();

    const observer = new ResizeObserver(alignSeam);
    observer.observe(scene);
    observer.observe(boxA);
    observer.observe(boxB);

    return () => observer.disconnect();
  }, [angleOffset]);

  return (
    <>
      <Leva
        collapsed={false}
        hideCopyButton
        titleBar={{ title: "Style playground", filter: false }}
      />
      <main
        ref={sceneRef}
        className={styles.scene}
        style={sceneStyle}
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
    </>
  );
}
