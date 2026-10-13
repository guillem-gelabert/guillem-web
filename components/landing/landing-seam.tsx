"use client";

import { useRef, type ReactNode } from "react";
import { SEAM_ANGLE_SCRIPT, useSeamAlignment } from "@/components/seam/use-seam-alignment";
import { useVisibleHeight } from "@/components/seam/use-visible-height";
import { usePageInk } from "./page-ink";
import styles from "./landing-seam.module.css";

type LandingSeamProps = {
  nameplate: ReactNode;
  positioning: ReactNode;
  caseStudyHead: ReactNode;
  caseStudy: ReactNode;
  /** Everything after the hero, rendered in the second scene below the fold. */
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
  const pageRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const seamStartRef = useRef<HTMLDivElement>(null);
  const seamEndRef = useRef<HTMLDivElement>(null);

  useSeamAlignment(sceneRef, seamStartRef, seamEndRef);
  useVisibleHeight();
  // The ink for the whole page, drawn once hydrated as <main>'s own
  // background (page-ink.ts). Both sections are transparent over it.
  usePageInk(pageRef, sceneRef, fieldRef);

  const stack = `seam-stack ${styles.stack}`;
  const box = `seam-box ${styles.box}`;
  const aside = `seam-box seam-aside ${styles.box} ${styles.aside}`;
  const content = `seam-content ${styles.content}`;

  return (
    <main ref={pageRef} id="seam-page" className={`seam-page ${styles.page}`}>
      {/* Covers the page until its ink has drawn (.loader in
          landing-seam.module.css hides itself off main's data-ink). */}
      <div className={`seam-loader ${styles.loader}`} aria-hidden="true" />
      <noscript>
        <style>{`.seam-loader { display: none !important; }`}</style>
      </noscript>
      <section
        ref={sceneRef}
        id="seam-scene"
        className={`seam-scene ${styles.scene}`}
      >
        {/* The hero's dither field: the first paint, before page-ink.ts has
            drawn, and after that the geometry it reads — its box is centred
            on the pivot and its transform is the seam's rotation. The one
            field on the page; the section below has only main's paper until
            the raster arrives. .grain clips it to this scene. */}
        <div className={`seam-grain ${styles.grain}`} aria-hidden="true">
          <div ref={fieldRef} className={`seam-grain-field ${styles.grainField}`} />
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

      {/* Sets --seam-angle before the first paint (see SEAM_ANGLE_SCRIPT).
          Server HTML only: React never runs a script it renders on the
          client, and the hook takes over at hydration anyway. */}
      <script dangerouslySetInnerHTML={{ __html: SEAM_ANGLE_SCRIPT }} />

      {/* The same gradient carried on below the fold, with the rest of the
          work on it. It used to be content-free and aria-hidden —
          the composition continuing past the fold and nothing more. It is
          a landmark now, named the way #story is (aria-label, no rendered
          heading), holding every published piece after the hero as a pair
          of a circle and a square (components/landing/more-work.tsx).

          It was a mirror of the first scene; it is now the first scene's
          ink continued. It paints nothing of its own: the ink is one raster
          on <main> (page-ink.ts), computed about the hero's pivot all the
          way down, so the texture runs on across the fold with no layer
          boundary there to open. The id and class keep the old "mirrored"
          name for the tests that key on them. */}
      {/* aria-labelledby, not aria-label: the section has a visible heading
          now, and naming it something else would give a screen reader
          "More work" for a region titled PROJECTS. */}
      <section
        aria-labelledby="seam-more-title"
        className={`seam-scene seam-scene-mirrored ${styles.scene} ${styles.sceneMirrored}`}
        id="seam-scene-mirrored"
      >
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
