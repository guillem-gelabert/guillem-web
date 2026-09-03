import styles from "./noise-gradient.module.css";

export function NoiseGradient() {
  return (
    <main className={styles.page}>
      <div
        className={styles.study}
        data-testid="noise-gradient-study"
        role="img"
        aria-label="SVG fractal noise blended with a black-to-orange-to-white conical gradient"
      >
        <div className={styles.gradient} data-testid="conic-gradient-layer" />
        <svg
          className={styles.noise}
          data-testid="svg-noise-layer"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <filter id="noise-gradient-filter" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#noise-gradient-filter)"
          />
        </svg>
      </div>
    </main>
  );
}
