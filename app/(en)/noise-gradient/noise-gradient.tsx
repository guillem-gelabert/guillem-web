"use client";

import { useState } from "react";

import styles from "./noise-gradient.module.css";

const bandModes = {
  five: {
    label: "5 bands",
    stack: "stackFive",
    arcs: ["arcFive1", "arcFive2", "arcFive3", "arcFive4"],
    tones: "five tones",
  },
  three: {
    label: "3 bands",
    stack: "stackThree",
    arcs: ["arcThree1", "arcThree2"],
    tones: "three tones",
  },
} as const;

type BandMode = keyof typeof bandModes;

const modeKeys = Object.keys(bandModes) as BandMode[];

export function NoiseGradient() {
  const [mode, setMode] = useState<BandMode>("five");
  const { stack, arcs, tones } = bandModes[mode];

  return (
    <main className={styles.page}>
      <div
        className={styles.study}
        data-testid="noise-gradient-study"
        role="img"
        aria-label={`Clockwise conic sweep through ${tones} of one pink, from near-white tint to near-black shade, joined by noise-dithered transitions`}
      >
        <div className={`${styles.stack} ${styles[stack]}`}>
          <div className={styles.base} data-testid="base-layer" aria-hidden="true" />
          {arcs.map((arc, index) => (
            <div
              key={arc}
              className={`${styles.field} ${styles[arc]}`}
              data-testid={`dither-field-${index + 1}`}
              aria-hidden="true"
            />
          ))}
          <div className={styles.colour} data-testid="colour-layer" aria-hidden="true" />
        </div>
      </div>
      <div className={styles.controls} role="radiogroup" aria-label="Bands">
        {modeKeys.map((key) => (
          <label key={key}>
            <input
              type="radio"
              name="bands"
              value={key}
              checked={mode === key}
              onChange={() => setMode(key)}
            />
            {bandModes[key].label}
          </label>
        ))}
      </div>
    </main>
  );
}
