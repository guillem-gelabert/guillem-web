import styles from "./noise-gradient.module.css";

export function NoiseGradient() {
  return (
    <main className={styles.page}>
      <div
        className={styles.study}
        data-testid="noise-gradient-study"
        role="img"
        aria-label="Monochrome Gaussian noise blended with a yellow-to-orange-to-red conical gradient"
      >
        <div
          className={styles.noise}
          data-testid="noise-layer"
          aria-hidden="true"
        />
        <div
          className={styles.gradient}
          data-testid="conic-gradient-layer"
          aria-hidden="true"
        />
      </div>
    </main>
  );
}
