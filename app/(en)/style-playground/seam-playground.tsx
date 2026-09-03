"use client";

import { useRef } from "react";
import { useSeamAlignment } from "@/components/seam/use-seam-alignment";
import styles from "./style-playground.module.css";

export function SeamPlayground() {
  const sceneRef = useRef<HTMLElement>(null);
  const blackBoxRef = useRef<HTMLDivElement>(null);
  const whiteBoxRef = useRef<HTMLDivElement>(null);

  useSeamAlignment(sceneRef, blackBoxRef, whiteBoxRef);

  return (
    <main
      ref={sceneRef}
      className={styles.scene}
      aria-label="Conical gradient geometry study"
    >
      <div ref={blackBoxRef} className={`${styles.box} ${styles.boxBlack}`}>
        <span aria-hidden="true" className={styles.boxText}>
          BLACK
        </span>
        <span className={styles.srOnly}>Transparent box reading Black</span>
      </div>

      <div ref={whiteBoxRef} className={`${styles.box} ${styles.boxWhite}`}>
        <span aria-hidden="true" className={styles.boxText}>
          WHITE
        </span>
        <span className={styles.srOnly}>Transparent box reading White</span>
      </div>
    </main>
  );
}
