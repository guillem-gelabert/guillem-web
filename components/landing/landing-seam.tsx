"use client";

import { useRef, type ReactNode } from "react";
import { useSeamAlignment } from "@/components/seam/use-seam-alignment";
import { useScrollRunway } from "@/components/seam/use-scroll-runway";
import styles from "./landing-seam.module.css";

type LandingSeamProps = {
  nameplate: ReactNode;
  positioning: ReactNode;
  caseStudyHead: ReactNode;
  caseStudy: ReactNode;
  /** Everything after the hero, rendered in the mirrored scene below the fold. */
  more: ReactNode;
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
  more,
}: LandingSeamProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const seamStartRef = useRef<HTMLDivElement>(null);
  const seamEndRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);

  useSeamAlignment(sceneRef, seamStartRef, seamEndRef);
  useScrollRunway(runwayRef);

  // Rendered once per section: the paper, and the ink the dither cuts
  // into. It was six layers — four turbulence fields multiplying into
  // five plateaus, plus a tinting pass — and the ramp those built now
  // arrives whole in the PNG. The mirrored section flips them with a
  // transform, so nothing differs here.
  const grain = (
    <div className={`seam-grain ${styles.grain}`} aria-hidden="true">
      <div className={`seam-grain-base ${styles.grainBase}`} />
      <div className={`seam-grain-field ${styles.grainField}`} />
    </div>
  );

  const stack = `seam-stack ${styles.stack}`;
  const box = `seam-box ${styles.box}`;
  const aside = `seam-box seam-aside ${styles.box} ${styles.aside}`;
  const content = `seam-content ${styles.content}`;

  return (
    <main className={styles.landing}>
      {/* The scroll runway. A few pixels of paper above the composition that
          use-scroll-runway.ts scrolls past on load, so the document is never
          at scrollY 0 — which is the one state where iOS Safari paints the
          status-bar strip a flat colour instead of compositing the page
          behind it. See that file for the whole mechanism.

          aria-hidden and empty: it is a scroll affordance, not content, and
          it is not in the reading order. */}
      <div
        ref={runwayRef}
        id="seam-runway"
        className={`seam-runway ${styles.runway}`}
        aria-hidden="true"
      />
      <section
        ref={sceneRef}
        id="seam-scene"
        className={`seam-scene ${styles.scene}`}
      >
        {grain}

        {/* Placeholders, both pointing at "#". There is no German landing —
            app/(de)/ holds only /texte, and lib/locales.ts and this route's
            metadata both document the landing as English-only — so neither
            has a real destination yet. */}
        <div className={`seam-lang ${styles.lang}`} id="seam-lang">
          <a className="seam-lang-en" href="#">
            EN
          </a>
          <a className="seam-lang-de" href="#">
            DE
          </a>
        </div>

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
            {/* No disc element here any more. It was a flat red circle
                behind the copy, and before that a violet field under three
                radial washes; the capture covers the whole disc now, so the
                picture IS the circle and an empty div behind it would paint
                nothing. The geometry both used lives on the box as
                --disc-size (landing-seam.module.css), which the capture and
                the link's hit area still share. */}
            <div className={`${content} seam-content-case-study`}>
              {caseStudy}
            </div>
          </div>
        </div>
      </section>

      {/* The same gradient again, mirrored along the x axis, with the rest
          of the work on it. It used to be content-free and aria-hidden —
          the composition continuing past the fold and nothing more. It is
          a landmark now, named the way #story is (aria-label, no rendered
          heading), holding every published piece after the hero as a pair
          of a circle and a square (components/landing/more-work.tsx).

          The flip is on the GRAIN, not on the section: a scaleY(-1) on the
          section would turn the pairs upside down with the background. The
          angle is still shared — the hook writes --seam-angle to :root and
          both grains read it — so the two seams stay parallel. */}
      {/* aria-labelledby, not aria-label: the section has a visible heading
          now, and naming it something else would give a screen reader
          "More work" for a region titled PROJECTS. */}
      <section
        aria-labelledby="seam-more-title"
        className={`seam-scene seam-scene-mirrored ${styles.scene} ${styles.sceneMirrored}`}
        id="seam-scene-mirrored"
      >
        {grain}
        <div id="seam-more" className={`seam-more ${styles.more}`}>
          <h2 id="seam-more-title" className={`seam-more-title ${styles.moreTitle}`}>
            Projects
          </h2>
          {more}
        </div>
      </section>
    </main>
  );
}
