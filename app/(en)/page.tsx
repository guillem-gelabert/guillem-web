import type { Metadata } from "next";
import { findBySlug, publishedFor } from "@/lib/content";
import { CASE_STUDY_SLUG, POSITIONING_PLACEHOLDER } from "@/lib/work";
import { LAST_TOUCHED } from "@/lib/backlog";
import { formatPostDate } from "@/lib/locales";
import { SmearTitle } from "@/components/smear-title";
import { ContentsNav } from "@/components/landing/contents-nav";
import { FeaturedSlot } from "@/components/landing/featured-slot";
import { WorkList } from "@/components/landing/work-list";
import { BacklogList } from "@/components/landing/backlog-list";
import { SectionStub } from "@/components/landing/section-stub";

// This route carries no client directive. Phase 1 marked whole pages as
// Client Components to reach the scroll-trail hook; doing that here would
// make the metadata export below illegal and make `await publishedFor("en")`
// impossible, because the featured slot's state is resolved from the
// filesystem at build time. SmearTitle is the one client leaf that carries
// the trail instead.

export const metadata: Metadata = {
  title: "Guillem Gelabert",
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
};

export default async function Landing() {
  // A null result IS the interim state — there is no boolean to flip. This
  // must tolerate null forever, not just this phase, so a renamed or
  // re-drafted Phase 4 file returns the slot to interim rather than
  // throwing.
  const caseStudy = findBySlug(await publishedFor("en"), CASE_STUDY_SLUG);

  return (
    <main className="flex flex-col gap-3xl px-lg py-3xl">
      {/* Deliberately no full-viewport-height sizing and no vertical
          centring on this shell: the site is content-led, not hero-led, and
          the featured section must be reachable by a short scroll at
          1440px rather than gated behind a viewport-height nameplate. Do
          not reintroduce either. */}
      <header className="flex flex-col gap-lg">
        <SmearTitle as="h1" className="text-display">
          Guillem Gelabert
        </SmearTitle>
        <p className="max-w-prose text-standfirst">{POSITIONING_PLACEHOLDER}</p>
        <ContentsNav />
      </header>

      {/* Section order: evidence first (case study, then work), then
          work-in-progress (backlog), then the ask (contact). Every
          section[id] carries scroll-mt-xl so an anchor jump does not park
          the section head flush against the viewport edge. */}
      <section
        id="case-study"
        aria-labelledby="case-study-head"
        className="scroll-mt-xl flex flex-col gap-lg"
      >
        <h2 id="case-study-head" className="section-head">
          Case study
        </h2>
        <FeaturedSlot entry={caseStudy} />
      </section>

      <section id="work" aria-labelledby="work-head" className="scroll-mt-xl flex flex-col gap-lg">
        <h2 id="work-head" className="section-head">
          Work
        </h2>
        <WorkList />
      </section>

      <section
        id="backlog"
        aria-labelledby="backlog-head"
        className="scroll-mt-xl flex flex-col gap-lg"
      >
        <h2 id="backlog-head" className="section-head">
          Backlog
        </h2>
        {/* D-12: the section keeps its own gap-lg, and this one div carries
            the date line and the list, so head→date and date→list are both
            lg. Above the items, not below — BACK-02 is the mitigation the
            user accepted in place of per-item dates, and a freshness signal
            only mitigates the wishlist read if it is read before the list. */}
        <div className="flex flex-col gap-lg">
          <p className="text-label">
            Last touched <time dateTime={LAST_TOUCHED}>{formatPostDate(LAST_TOUCHED, "en")}</time>
          </p>
          <BacklogList />
        </div>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-head"
        className="scroll-mt-xl flex flex-col gap-lg"
      >
        <h2 id="contact-head" className="section-head">
          Contact
        </h2>
        <SectionStub
          state="No contact details here yet."
          body="Email, GitHub and LinkedIn are being added."
        />
      </section>
    </main>
  );
}
