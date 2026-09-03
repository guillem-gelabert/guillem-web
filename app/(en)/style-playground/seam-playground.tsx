"use client";

import { useRef } from "react";
import { useSeamAlignment } from "@/components/seam/use-seam-alignment";
import styles from "./style-playground.module.css";

export function SeamPlayground() {
  const sceneRef = useRef<HTMLElement>(null);
  const boxARef = useRef<HTMLDivElement>(null);
  const boxBRef = useRef<HTMLDivElement>(null);

  useSeamAlignment(sceneRef, boxARef, boxBRef);

  return (
    <main
      ref={sceneRef}
      className={styles.scene}
      aria-label="Conical gradient geometry study"
    >
      <div ref={boxARef} className={`${styles.box} ${styles.boxA}`}>
        <span aria-hidden="true" className={styles.boxText}>
          BLACK
        </span>
        <span className={styles.srOnly}>Transparent box reading Black</span>
      </div>

      <div ref={boxBRef} className={`${styles.box} ${styles.boxB}`}>
        <span aria-hidden="true" className={styles.boxText}>
          WHITE
        </span>
        <span className={styles.srOnly}>Transparent box reading White</span>
      </div>
    </main>
  );
}
