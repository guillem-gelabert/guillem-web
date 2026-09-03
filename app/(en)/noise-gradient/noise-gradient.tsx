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

type GradientStop = {
  color: string;
  alpha: number;
};

const initialGradientStops: Record<GradientColor, GradientStop> = {
  yellow: { color: "#ffe100", alpha: 100 },
  orange: { color: "#ff8000", alpha: 50 },
  red: { color: "#e40000", alpha: 100 },
};

function withAlpha(hex: string, alpha: number) {
  if (alpha === 100) {
    return hex;
  }

  const color = Number.parseInt(hex.slice(1), 16);
  const red = (color >> 16) & 255;
  const green = (color >> 8) & 255;
  const blue = color & 255;

  return `rgb(${red} ${green} ${blue} / ${alpha / 100})`;
}

export function NoiseGradient() {
  const [blendMode, setBlendMode] = useState<BlendMode>("soft-light");
  const [gradientStops, setGradientStops] = useState(initialGradientStops);

  function updateColor(stop: GradientColor, value: string) {
    setGradientStops((current) => ({
      ...current,
      [stop]: { ...current[stop], color: value },
    }));
  }

  function updateAlpha(stop: GradientColor, value: number) {
    setGradientStops((current) => ({
      ...current,
      [stop]: { ...current[stop], alpha: value },
    }));
  }

  const gradientStyle = {
    "--gradient-yellow": withAlpha(
      gradientStops.yellow.color,
      gradientStops.yellow.alpha,
    ),
    "--gradient-orange": withAlpha(
      gradientStops.orange.color,
      gradientStops.orange.alpha,
    ),
    "--gradient-red": withAlpha(gradientStops.red.color, gradientStops.red.alpha),
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
          {(Object.keys(gradientStops) as GradientColor[]).map((stop) => {
            const gradientStop = gradientStops[stop];
            const colorInputId = `${stop}-color`;
            const alphaInputId = `${stop}-alpha`;

            return (
              <div key={stop} className={styles.colorControl}>
                <label className={styles.colorLabel} htmlFor={colorInputId}>
                  {stop}
                </label>
                <input
                  id={colorInputId}
                  className={styles.colorInput}
                  type="color"
                  value={gradientStop.color}
                  onChange={(event) => updateColor(stop, event.target.value)}
                />
                <label className={styles.alphaLabel} htmlFor={alphaInputId}>
                  {stop} alpha
                </label>
                <input
                  id={alphaInputId}
                  className={styles.alphaInput}
                  type="range"
                  min="0"
                  max="100"
                  value={gradientStop.alpha}
                  onChange={(event) =>
                    updateAlpha(stop, Number.parseInt(event.target.value, 10))
                  }
                />
                <output className={styles.alphaValue} htmlFor={alphaInputId}>
                  {gradientStop.alpha}%
                </output>
              </div>
            );
          })}
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
