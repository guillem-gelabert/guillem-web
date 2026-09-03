"use client";

import { useRef, type ReactNode } from "react";
import { useSeamAlignment } from "@/components/seam/use-seam-alignment";
import styles from "./landing-seam.module.css";

type LandingSeamProps = {
  primary: ReactNode;
  secondary: ReactNode;
};

export function LandingSeam({ primary, secondary }: LandingSeamProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const boxARef = useRef<HTMLDivElement>(null);
  const boxBRef = useRef<HTMLDivElement>(null);

  useSeamAlignment(sceneRef, boxARef, boxBRef);

  return (
    <main ref={sceneRef} className={styles.scene}>
      <div ref={boxARef} className={`${styles.box} ${styles.boxA}`}>
        <div className={styles.content}>{primary}</div>
      </div>

      <div ref={boxBRef} className={`${styles.box} ${styles.boxB}`}>
        <div className={styles.content}>{secondary}</div>
      </div>
    </main>
  );
}
