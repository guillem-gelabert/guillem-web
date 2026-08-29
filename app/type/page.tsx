"use client";

import { useSmearHeading } from "@/components/smear-heading/use-smear-heading";

export default function TypeSpecimen() {
  const displayRef = useSmearHeading<HTMLHeadingElement>();
  const displayAltRef = useSmearHeading<HTMLHeadingElement>();
  const headingOneRef = useSmearHeading<HTMLHeadingElement>();
  const headingTwoRef = useSmearHeading<HTMLHeadingElement>();
  const headingThreeRef = useSmearHeading<HTMLHeadingElement>();

  return (
    <main className="flex flex-col gap-3xl px-lg py-3xl">
      <section className="flex flex-col gap-sm">
        <p className="text-label">Display</p>
        <h1 ref={displayRef} className="text-display">
          Guillem Gelabert
        </h1>
        <p className="max-w-prose text-body">
          Humane, variable weight 530, tracked at 0.035em, on a fluid curve
          from 3.5rem to 11.25rem. The curve is what lets poster-scale type
          survive down to a 375px viewport without a separate mobile size.
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <p className="text-label">Display, second setting</p>
        <h2 ref={displayAltRef} className="text-display">
          Data Journalism
        </h2>
        <p className="max-w-prose text-body">
          A second display setting at a different measure. Long words are where
          ultra-condensed faces fail first, so the specimen carries more than
          one to check that tracking holds on real language rather than on a
          convenient short string.
        </p>
      </section>

      <section className="flex max-w-prose flex-col gap-sm">
        <p className="text-label">Body</p>
        <p className="text-body">
          Newsreader, regular weight, eighteen pixels, line height 1.6. This is
          the register the reading load sits in — the case study, the writing,
          the CV. It is deliberately not the display face: the display face
          carries structure, this one carries argument.
        </p>
        <p className="text-body">
          The scale is two faces and two weights. Everything on this page is one
          of four roles, and any new page is checked against this one rather
          than inventing a fifth. A specimen that only showed each role once
          would not prove much; the point is to see them repeat and stay
          consistent as the page scrolls.
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <p className="text-label">Heading</p>
        <h2 ref={headingOneRef} className="text-heading">
          Editorial Judgment
        </h2>
        <p className="max-w-prose text-body">
          The heading role runs from 2rem to 4.5rem on its own curve, at the
          same weight and tracking as display. It is the section marker rather
          than the page marker.
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <p className="text-label">Heading, second setting</p>
        <h2 ref={headingTwoRef} className="text-heading">
          Form Follows Data
        </h2>
        <p className="max-w-prose text-body">
          Scrolling past each heading should smear it behind the scroll
          position and let it settle once the page stops. The effect is stacked
          CSS text-shadow — no canvas, no WebGL — so it degrades to a plain
          heading wherever it cannot run.
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <p className="text-label">Heading, third setting</p>
        <h2 ref={headingThreeRef} className="text-heading">
          Reduced Motion
        </h2>
        <p className="max-w-prose text-body">
          With a reduced-motion preference set, every heading on this page
          renders entirely static — the animation loop never starts rather than
          starting and being hidden. Set the preference and reload to check it.
        </p>
      </section>

      <section className="flex max-w-prose flex-col gap-sm">
        <p className="text-label">Label</p>
        <p className="text-body">
          The label role is Newsreader at fourteen pixels, uppercase, tracked at
          0.04em. Every grey caption on this page is one — it marks what is
          being shown without competing with it.
        </p>
      </section>
    </main>
  );
}
