import type { Metadata } from "next";
import { findBySlug, publishedFor } from "@/lib/content";
import { CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER } from "@/lib/work";
import { SmearTitle } from "@/components/smear-title";
import { FeaturedSlot } from "@/components/landing/featured-slot";
import { LandingSeam } from "@/components/landing/landing-seam";

// This route carries no client directive. Phase 1 marked whole pages as
// Client Components to reach the scroll-trail hook; doing that here would
// make the metadata export below illegal and make `await publishedFor("en")`
// impossible, because the featured slot's state is resolved from the
// filesystem at build time. SmearTitle is the one client leaf that carries
// the trail instead.

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

export default async function Landing() {
  // A null result IS the interim state — there is no boolean to flip, so
  // this must tolerate null forever: a renamed or re-drafted case-study
  // file returns the slot to its interim copy rather than throwing.
  const featured = findBySlug(await publishedFor("en"), CASE_STUDY_SLUG);

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
        </header>
      }
      // Three lines on the page, one string underneath: the same constant
      // still serves as this route's meta description, so the equality
      // tests/build/prerender.test.ts asserts between them holds. Block
      // spans break the line the way the nameplate's do, without putting
      // three separate strings in the source.
      positioning={
        <p className="max-w-prose text-standfirst">
          {POSITIONING_PLACEHOLDER.split(" ").map((word) => (
            <span className="block" key={word}>
              {word}
            </span>
          ))}
        </p>
      }
      caseStudyHead={null}
      // No visible section head: the box above this one stays empty, so the
      // section is named for assistive tech by aria-label rather than by an
      // aria-labelledby pointing at a heading that is no longer rendered.
      caseStudy={
        <section
          aria-label="Case study"
          className="flex flex-col gap-lg"
          id="case-study"
        >
          <FeaturedSlot entry={featured} />
        </section>
      }
    />
  );
}
