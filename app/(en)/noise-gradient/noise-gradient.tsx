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
  const [backgroundMode, setBackgroundMode] = useState<BlendMode>("hue");
  const [mixMode, setMixMode] = useState<BlendMode>("luminosity");
  const [maskEnabled, setMaskEnabled] = useState(false);
  const [contrast, setContrast] = useState(150);
  const [brightness, setBrightness] = useState(700);

  return (
    <main className={styles.page}>
      <div
        className={styles.study}
        data-testid="noise-gradient-study"
        role="img"
        aria-label="Black-to-white conic gradient with SVG grain over a pink background"
      >
        <div className={styles.isolate} data-testid="gradient-isolate">
          <div
            className={styles.background}
            data-testid="pink-background-layer"
            aria-hidden="true"
          />
          <div
            className={`${styles.noise} ${maskEnabled ? styles.noiseMasked : ""}`}
            data-testid="noise-background-layer"
            aria-hidden="true"
            style={
              {
                backgroundBlendMode: backgroundMode,
                filter: `grayscale(100%) contrast(${contrast}%) brightness(${brightness}%)`,
              } as CSSProperties
            }
          />
          <div
            className={styles.gradient}
            data-testid="conic-gradient-layer"
            aria-hidden="true"
            style={{ mixBlendMode: mixMode }}
          />
          <div
            className={`${styles.paletteGuard} ${styles.paletteLight}`}
            data-testid="left-palette-guard"
            aria-hidden="true"
          />
          <div
            className={`${styles.paletteGuard} ${styles.paletteDark}`}
            data-testid="right-palette-guard"
            aria-hidden="true"
          />
          <div
            className={`${styles.paletteGuard} ${styles.paletteCenter}`}
            data-testid="center-pink-guard"
            aria-hidden="true"
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
        <label className={styles.maskControl}>
          <input
            type="checkbox"
            checked={maskEnabled}
            onChange={(event) => setMaskEnabled(event.target.checked)}
          />
          Noise mask
        </label>
        <label className={styles.rangeControl}>
          <span>
            Contrast <output>{contrast}%</output>
          </span>
          <input
            aria-label="Noise contrast"
            type="range"
            min="0"
            max="1000"
            step="10"
            value={contrast}
            onChange={(event) => setContrast(Number(event.target.value))}
          />
        </label>
        <label className={styles.rangeControl}>
          <span>
            Brightness <output>{brightness}%</output>
          </span>
          <input
            aria-label="Noise brightness"
            type="range"
            min="0"
            max="3000"
            step="25"
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
          />
        </label>
      </div>
    </main>
  );
}
