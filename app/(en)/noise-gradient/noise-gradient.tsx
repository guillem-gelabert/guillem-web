"use client";

import { useState, type CSSProperties } from "react";

import styles from "./noise-gradient.module.css";

const blendModes = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

type BlendMode = (typeof blendModes)[number];

export function NoiseGradient() {
  const [backgroundMode, setBackgroundMode] = useState<BlendMode>("multiply");
  const [mixMode, setMixMode] = useState<BlendMode>("multiply");

  return (
    <main className={styles.page}>
      <div
        className={styles.study}
        data-testid="noise-gradient-study"
        role="img"
        aria-label="Orange conic gradient from zero to full lightness with SVG grain over an orange background"
      >
        <div className={styles.isolate} data-testid="gradient-isolate">
          <div
            className={styles.background}
            data-testid="orange-background-layer"
            aria-hidden="true"
          />
          <div
            className={styles.noise}
            data-testid="noise-background-layer"
            aria-hidden="true"
            style={{ backgroundBlendMode: backgroundMode } as CSSProperties}
          />
          <div
            className={styles.gradient}
            data-testid="conic-gradient-layer"
            aria-hidden="true"
            style={{ mixBlendMode: mixMode }}
          />
        </div>
      </div>
      <div className={styles.controls}>
        <label>
          Background mode
          <select
            aria-label="Background blend mode"
            value={backgroundMode}
            onChange={(event) =>
              setBackgroundMode(event.target.value as BlendMode)
            }
          >
            {blendModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mix mode
          <select
            aria-label="Mix blend mode"
            value={mixMode}
            onChange={(event) => setMixMode(event.target.value as BlendMode)}
          >
            {blendModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
      </div>
    </main>
  );
}
