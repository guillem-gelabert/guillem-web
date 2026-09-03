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
  // A null result IS the interim state — there is no boolean to flip. This
  // must tolerate null forever, not just this phase, so a renamed or
  // re-drafted Phase 4 file returns the slot to interim rather than
  // throwing.
  const caseStudy = findBySlug(await publishedFor("en"), CASE_STUDY_SLUG);

  return (
    <LandingSeam
      primary={
        <header className="flex flex-col gap-lg">
          {/* Block spans keep the visual line break while preserving the
              accessible name as “Guillem Gelabert”. */}
          <SmearTitle as="h1" className="text-nameplate uppercase">
            <span className="block">Guillem</span>
            <span className="block">Gelabert</span>
          </SmearTitle>
          <p className="max-w-prose text-standfirst">{POSITIONING_PLACEHOLDER}</p>
        </header>
      }
      secondary={
        <section id="case-study" aria-label="Case study" className="flex flex-col gap-lg">
          <FeaturedSlot entry={caseStudy} />
        </section>
      }
    />
  );
}
