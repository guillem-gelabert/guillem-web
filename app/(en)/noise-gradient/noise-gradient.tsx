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
        <div className={styles.isolate} data-testid="gradient-isolate">
          <div
            className={styles.noise}
            data-testid="noise-background-layer"
            aria-hidden="true"
          />
          <div
            className={styles.gradient}
            data-testid="conic-gradient-layer"
            aria-hidden="true"
          />
        </div>
      </div>
    </main>
  );
}
