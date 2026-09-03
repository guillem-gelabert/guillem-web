import styles from "./noise-gradient.module.css";

export function NoiseGradient() {
  return (
    <main className={styles.page}>
      <div
        className={styles.study}
        data-testid="noise-gradient-study"
        role="img"
        aria-label="SVG fractal noise blended with a yellow-to-orange-to-red conical gradient"
      >
        <div
          className={styles.grain}
          data-testid="grainy-conic-gradient"
          aria-hidden="true"
        />
      </div>
    </main>
  );
}
