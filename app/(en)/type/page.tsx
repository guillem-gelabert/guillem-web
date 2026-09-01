import type { Metadata } from "next";
import Link from "next/link";
import { SmearTitle } from "@/components/smear-title";
import { routeOpenGraph } from "@/lib/metadata";

// This route carries no client directive. Phase 3 de-cliented the landing
// (app/(en)/page.tsx) for the same reason this route now follows: a whole
// page marked "use client" cannot export `metadata` at all, which is what
// left this specimen unable to declare its own noindex (06-RESEARCH.md
// Pitfall 6) and left it inheriting the (en) layout's title/description
// instead of its own. SmearTitle is the one client leaf that carries the
// scroll trail instead — see components/smear-title.tsx.
export const metadata: Metadata = {
  title: "Type Specimen",
  // Hand-written, not the positioning sentence (HOME-01 stays / only) and
  // not the site's artifact description either — this route describes
  // itself, the type system, not the site.
  description: "A specimen of the site's display, heading, body and label type roles.",
  alternates: { canonical: "/type" },
  // No `languages` alternate: /type is English-only, like / and /cv
  // (03-UI-SPEC.md § Localisation) — there is no German twin to cross to.
  openGraph: routeOpenGraph("en", "/type"),
  // ⚠️ PERMANENT — this is NOT part of the FIND-02 flip. /type is a
  // deliberately non-indexed specimen route (Phase 1 D-05) and stays
  // noindex forever, unlike the two root layouts' index-false value, which
  // Phase 6's eventual flip DOES edit. tests/unit/launch-gate.test.ts (plan
  // 06-03) treats this declaration as the one permitted exception outside
  // the two root layouts — do not fold it into that flip and do not delete
  // it once the layouts flip.
  robots: { index: false },
};

export default function TypeSpecimen() {
  return (
    <main className="flex flex-col gap-3xl px-lg py-3xl">
      <section className="flex flex-col gap-sm">
        <p className="text-label">Display</p>
        <SmearTitle as="h1" className="text-display">
          Guillem Gelabert
        </SmearTitle>
        <p className="max-w-prose text-body">
          Humane, variable weight 530, tracked at 0.035em, on a fluid curve
          from 3.5rem to 11.25rem. The curve is what lets poster-scale type
          survive down to a 375px viewport without a separate mobile size.
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <p className="text-label">Display, second setting</p>
        <SmearTitle as="h2" className="text-display">
          Data Journalism
        </SmearTitle>
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
        <SmearTitle as="h2" className="text-heading">
          Editorial Judgment
        </SmearTitle>
        <p className="max-w-prose text-body">
          The heading role runs from 2rem to 4.5rem on its own curve, at the
          same weight and tracking as display. It is the section marker rather
          than the page marker.
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <p className="text-label">Heading, second setting</p>
        <SmearTitle as="h2" className="text-heading">
          Form Follows Data
        </SmearTitle>
        <p className="max-w-prose text-body">
          Scrolling past each heading should smear it behind the scroll
          position and let it settle once the page stops. The effect is stacked
          CSS text-shadow — no canvas, no WebGL — so it degrades to a plain
          heading wherever it cannot run.
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <p className="text-label">Heading, third setting</p>
        <SmearTitle as="h2" className="text-heading">
          Reduced Motion
        </SmearTitle>
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

      <section className="flex flex-col gap-sm">
        <p className="text-label">Section head and links</p>
        <h2 className="section-head">Section head</h2>
        <p className="max-w-prose text-body">
          A link set inside a block of running copy, like this{" "}
          <Link className="link" href="/">
            reference to the site root
          </Link>
          , takes the rest-state underline the link-quiet specimen below
          deliberately omits.
        </p>
        <Link className="text-label link-quiet inline-block py-xs" href="/">
          Guillem Gelabert
        </Link>
        <p className="max-w-prose text-body">
          Neither is coloured at rest. Both classes move to the accent colour
          on hover and on focus; .link-quiet adds its underline back on
          hover so the affordance is never colour-only; both show a 2px
          accent focus ring on :focus-visible; and under prefers-reduced-motion:
          reduce the colour and underline change still happens — only the
          120ms transition is removed, because the state change is not
          motion.
        </p>
      </section>
    </main>
  );
}
