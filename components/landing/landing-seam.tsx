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

  // Rendered once per section. Both get the same four layers; the mirrored
  // section flips them with a transform, so nothing differs here.
  const grain = (
    <div className={`seam-grain ${styles.grain}`} aria-hidden="true">
      <div className={`seam-grain-base ${styles.grainBase}`} />
      <div
        className={`seam-grain-field ${styles.grainField} ${styles.grainArc1}`}
      />
      <div
        className={`seam-grain-field ${styles.grainField} ${styles.grainArc2}`}
      />
      <div
        className={`seam-grain-field ${styles.grainField} ${styles.grainArc3}`}
      />
      <div
        className={`seam-grain-field ${styles.grainField} ${styles.grainArc4}`}
      />
      <div className={`seam-grain-colour ${styles.grainColour}`} />
    </div>
  );

  const stack = `seam-stack ${styles.stack}`;
  const box = `seam-box ${styles.box}`;
  const aside = `seam-box seam-aside ${styles.box} ${styles.aside}`;
  const content = `seam-content ${styles.content}`;

  return (
    <main>
      <section
        ref={sceneRef}
        id="seam-scene"
        className={`seam-scene ${styles.scene}`}
      >
        {grain}

        {/* Placeholders, both pointing at "#". There is no German landing —
            app/(de)/ holds only /texte, and lib/locales.ts and this route's
            metadata both document the landing as English-only — so neither
            of these has a real destination yet. They are here for the
            composition; give them hrefs when the pages exist. */}
        <a
          className={`text-label seam-lang seam-lang-en ${styles.langEn}`}
          href="#"
          id="seam-lang-en"
        >
          EN
        </a>
        <a
          className={`text-label seam-lang seam-lang-de ${styles.langDe}`}
          href="#"
          id="seam-lang-de"
        >
          DE
        </a>

        <div
          id="seam-stack-nameplate"
          className={`${stack} seam-stack-nameplate ${styles.stackNameplate}`}
        >
          <div
            id="seam-nameplate"
            ref={seamStartRef}
            className={`${box} seam-box-nameplate ${styles.boxNameplate}`}
          >
            <div className={`${content} seam-content-nameplate`}>
              {nameplate}
            </div>
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
      </section>

      {/* The same gradient again, mirrored along the x axis. Content-free
          and aria-hidden: it is the composition continuing past the fold,
          not a second landing, so it adds no landmark and repeats nothing
          to a screen reader. The flip is a transform on the section rather
          than a second set of arc values, so the two stay in step — the
          hook writes --seam-angle to the first scene and this inherits it
          through the shared stylesheet. */}
      <section
        aria-hidden="true"
        className={`seam-scene seam-scene-mirrored ${styles.scene} ${styles.sceneMirrored}`}
        id="seam-scene-mirrored"
      >
        {grain}
      </section>
    </main>
  );
}
