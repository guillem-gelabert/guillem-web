"use client";

import { type CSSProperties, useState } from "react";
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
type GradientColor = "yellow" | "orange" | "red";

const initialColors: Record<GradientColor, string> = {
  yellow: "#ffe100",
  orange: "#ff8000",
  red: "#e40000",
};

function withHalfOpacity(hex: string) {
  const color = Number.parseInt(hex.slice(1), 16);
  const red = (color >> 16) & 255;
  const green = (color >> 8) & 255;
  const blue = color & 255;

  return `rgb(${red} ${green} ${blue} / 0.5)`;
}

export function NoiseGradient() {
  const [blendMode, setBlendMode] = useState<BlendMode>("soft-light");
  const [colors, setColors] = useState(initialColors);

  function updateColor(stop: GradientColor, value: string) {
    setColors((current) => ({ ...current, [stop]: value }));
  }

  const gradientStyle = {
    "--gradient-yellow": colors.yellow,
    "--gradient-orange": withHalfOpacity(colors.orange),
    "--gradient-red": colors.red,
    mixBlendMode: blendMode,
  } as CSSProperties;

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
          style={gradientStyle}
          aria-hidden="true"
        />
      </div>

      <section className={styles.controls} aria-label="Gradient controls">
        <fieldset className={styles.colorControls}>
          <legend>Gradient colors</legend>
          {(Object.keys(colors) as GradientColor[]).map((stop) => (
            <label key={stop} className={styles.colorControl}>
              <span>{stop}</span>
              <input
                type="color"
                value={colors[stop]}
                onChange={(event) => updateColor(stop, event.target.value)}
              />
            </label>
          ))}
        </fieldset>

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
      </section>
    </main>
  );
}
