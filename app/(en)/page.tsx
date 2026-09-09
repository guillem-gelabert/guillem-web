import type { Metadata } from "next";
import ReactDOM from "react-dom";
import { POSITIONING_PLACEHOLDER } from "@/lib/work";
import { SmearTitle } from "@/components/smear-title";
import { StorySlot } from "@/components/landing/story-slot";
import { LandingSeam } from "@/components/landing/landing-seam";

// This route carries no client directive. Phase 1 marked whole pages as
// Client Components to reach the scroll-trail hook; doing that here would
// make the metadata export below illegal. SmearTitle is the one client leaf
// that carries the trail instead.
//
// It is no longer async either, and reads nothing from content/. It used to
// resolve the case study out of the filesystem at build time
// (findBySlug(await publishedFor("en"), CASE_STUDY_SLUG)) to decide which
// half of the featured slot to render; the case studies are deferred, so the
// slot renders lib/work.ts's published pieces, which are a constant.

export const metadata: Metadata = {
  // Plan 06-07: deliberately no `title` here. Under the factory's
  // title.template ("%s — Guillem Gelabert"), any string this route
  // supplied would render doubled for the landing specifically — "Guillem
  // Gelabert — Guillem Gelabert". Leaving `title` undeclared inherits the
  // layout's title.default (SITE_NAME) instead, which renders the bare
  // name once — the correct <title> for the site root.
  // HOME-01 (Pitfall 6): one source for the positioning sentence. When the
  // user's real sentence replaces POSITIONING_PLACEHOLDER in lib/work.ts,
  // both the rendered <p> and this share-preview description update from
  // the same one-line edit. The site origin base and the noindex directive
  // are deliberately absent from this export — both are inherited from
  // app/(en)/layout.tsx, and that directive's field name must stay confined
  // to the two root layouts (Phase 6's FIND-02 flips it in exactly two
  // places).
  description: POSITIONING_PLACEHOLDER,
  alternates: { canonical: "/" },
  // No `languages` alternate: the landing is English-only in v1
  // (03-UI-SPEC.md § Localisation), so there is no German twin to declare.
  // No `openGraph` override either: the site root's own path already IS
  // rootMetadata("en")'s default og:url (lib/metadata.ts), so the factory's
  // inherited value is already correct here — unlike /cv, /writing and
  // /texte, which call lib/metadata.ts's routeOpenGraph for their own path.
};

export default function Landing() {
  // The seam's dither mask is the composition, not decoration, and CSS
  // only discovers it after the stylesheet parses — a mask-image inside a
  // custom property is invisible to the preload scanner. Hoisting it into
  // a <link rel="preload"> in the document head starts the download with
  // the HTML instead. Declared here rather than in LandingSeam because
  // that component is "use client": ReactDOM.preload there would run
  // after hydration, which is later than the CSS would have found it
  // anyway. Only the desktop file is preloaded — a phone matching the
  // media branch would otherwise fetch both and pay for the larger one it
  // never paints.
  ReactDOM.preload("/seam-dither-desktop.png", {
    as: "image",
    media: "not all and (hover: none) and (pointer: coarse)",
  });

  return (
    <LandingSeam
      nameplate={
        <header>
          {/* Block spans keep the visual line break while preserving the
              accessible name as “Guillem Gelabert”. The type spec lives in
              landing-seam.module.css, with the box it is measured against —
              this class is the hook, not a role in the global scale. */}
          <SmearTitle as="h1" className="seam-nameplate-text">
            <span className="block">Guillem</span>
            <span className="block">Gelabert</span>
          </SmearTitle>
          {/* Sits with the name rather than in its own box: one line, the
              three words spaced apart and set in caps. Still the same
              constant, so it goes on matching this route's meta
              description, which tests/build/prerender.test.ts asserts by
              equality.

              Not .text-label any more. That class is the site's 14px
              Newsreader caption, and every one of its declarations except
              the casing is now overridden in landing-seam.module.css —
              keeping it would leave a rule that looks load-bearing and
              isn't. */}
          <p className="seam-tagline uppercase">
            {POSITIONING_PLACEHOLDER}
          </p>
        </header>
      }
      positioning={null}
      caseStudyHead={null}
      // No visible section head: the box above this one stays empty, so the
      // section is named for assistive tech by aria-label rather than by an
      // aria-labelledby pointing at a heading that is no longer rendered.
      // Still the `caseStudy` slot: that prop names the CORNER of the
      // composition (the seam is measured between the nameplate's
      // bottom-right and this box's top-left), not what is printed in it.
      caseStudy={
        <section
          aria-label="Selected work"
          className="flex flex-col gap-sm"
          id="story"
        >
          <StorySlot />
        </section>
      }
    />
  );
}
