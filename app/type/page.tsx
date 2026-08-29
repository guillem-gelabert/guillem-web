"use client";

import { useSmearHeading } from "@/components/smear-heading/use-smear-heading";

export default function TypeSpecimen() {
  const displayRef = useSmearHeading<HTMLHeadingElement>();
  const headingRef = useSmearHeading<HTMLHeadingElement>();

  return (
    <main className="flex flex-col gap-2xl px-lg py-3xl">
      <section className="flex flex-col gap-sm">
        <p className="text-label">Display</p>
        <h1 ref={displayRef} className="text-display">
          Guillem Gelabert
        </h1>
      </section>

      <section className="flex flex-col gap-sm">
        <p className="text-label">Heading</p>
        <h2 ref={headingRef} className="text-heading">
          Editorial Judgment
        </h2>
      </section>

      <section className="flex max-w-prose flex-col gap-sm">
        <p className="text-label">Body</p>
        <p className="text-body">
          This page exists to show every declared type role at its real size,
          weight, and face — a reference the rest of the site is checked
          against as new pages are built.
        </p>
        <p className="text-body">
          The two paragraphs on this page set the running text register:
          eighteen pixels, regular weight, a line height loose enough to read
          comfortably across a normal measure. Everything else on the page
          pairs a display or heading role from the same scale.
        </p>
      </section>
    </main>
  );
}
