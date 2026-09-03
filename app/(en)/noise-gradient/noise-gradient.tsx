"use client";

import { useState } from "react";
import styles from "./noise-gradient.module.css";

const blendModes = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "soft-light",
  "hard-light",
  "difference",
  "exclusion",
  "hue",
  "color",
  "luminosity",
] as const;

type BlendMode = (typeof blendModes)[number];

export function NoiseGradient() {
  const [blendMode, setBlendMode] = useState<BlendMode>("soft-light");

  return (
    <main className={styles.page}>
      <div
        className={styles.study}
        data-testid="noise-gradient-study"
        role="img"
        aria-label={`Monochrome Gaussian noise blended with a yellow-to-orange-to-red conical gradient using ${blendMode}`}
      >
        <div
          className={styles.noise}
          data-testid="noise-layer"
          aria-hidden="true"
        />
        <div
          className={styles.gradient}
          data-testid="conic-gradient-layer"
          style={{ mixBlendMode: blendMode }}
          aria-hidden="true"
        />
      </div>

      <label className={styles.control}>
        <span>Blend mode</span>
        <select
          value={blendMode}
          onChange={(event) => setBlendMode(event.target.value as BlendMode)}
        >
          {blendModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>
    </main>
  );
}
