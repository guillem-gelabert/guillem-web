"use client";

import { useRef, type ReactNode } from "react";
import { useSeamAlignment } from "@/components/seam/use-seam-alignment";
import styles from "./landing-seam.module.css";

type LandingSeamProps = {
  nameplate: ReactNode;
  positioning: ReactNode;
  caseStudyHead: ReactNode;
  caseStudy: ReactNode;
};

// Every element below carries a plain, unhashed class as well as its CSS
// module class. The module class is what styles it; the plain one is what
// you read in devtools, where the hashed name the module compiles to
// (landing-seam-module__7PvPcq__boxNameplate) is unusable. Nothing styles
// the plain names — they are labels, and the ids match them.
//
// Four boxes in two corner stacks: the nameplate over the positioning line
// top-left, the case-study head over the case study bottom-right. Each
// stack's narrow aside is staggered outwards, into the thin end of the
// triangle the seam leaves, which puts the pinch of the gap back on the two
// main boxes' facing corners — the nameplate's bottom-right and the case
// study's top-left. Those are the two the seam is measured between.
export function LandingSeam({
  nameplate,
  positioning,
  caseStudyHead,
  caseStudy,
}: LandingSeamProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const seamStartRef = useRef<HTMLDivElement>(null);
  const seamEndRef = useRef<HTMLDivElement>(null);

  useSeamAlignment(sceneRef, seamStartRef, seamEndRef);

  const stack = `seam-stack ${styles.stack}`;
  const box = `seam-box ${styles.box}`;
  const aside = `seam-box seam-aside ${styles.box} ${styles.aside}`;
  const content = `seam-content ${styles.content}`;

  return (
    <main ref={sceneRef} id="seam-scene" className={`seam-scene ${styles.scene}`}>
      <div
        id="seam-stack-nameplate"
        className={`${stack} seam-stack-nameplate ${styles.stackNameplate}`}
      >
        <div
          id="seam-nameplate"
          ref={seamStartRef}
          className={`${box} seam-box-nameplate ${styles.boxNameplate}`}
        >
          <div className={`${content} seam-content-nameplate`}>{nameplate}</div>
        </div>

        <div
          id="seam-positioning"
          className={`${aside} seam-box-positioning ${styles.boxPositioning}`}
        >
          <div className={`${content} seam-content-positioning`}>
            {positioning}
          </div>
        </div>
      </div>

      <div
        id="seam-stack-case-study"
        className={`${stack} seam-stack-case-study ${styles.stackCaseStudy}`}
      >
        <div
          id="seam-case-study-head"
          className={`${aside} seam-box-case-study-head ${styles.boxCaseStudyHead}`}
        >
          <div className={`${content} seam-content-case-study-head`}>
            {caseStudyHead}
          </div>
        </div>

        <div
          id="seam-case-study"
          ref={seamEndRef}
          className={`${box} seam-box-case-study ${styles.boxCaseStudy}`}
        >
          <div className={`${content} seam-content-case-study`}>
            {caseStudy}
          </div>
        </div>
      </div>
    </main>
  );
}
