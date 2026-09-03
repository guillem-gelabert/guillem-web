import type { Metadata, Viewport } from "next";
import { humane } from "../fonts/humane";
import { newsreader } from "../fonts/newsreader";
import { ibmPlexMono } from "../fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import { rootMetadata } from "@/lib/metadata";
import "../globals.css";

// viewport-fit=cover is what lets the landing seam reach the physical
// edges of a notched iPhone. Without it iOS letterboxes the page inside the
// safe area and the gradient stops short of the notch and the home
// indicator. The seam deliberately runs under both — components/landing/
// landing-seam.module.css takes no safe-area insets — so this and that are
// a pair: setting one without the other gets a composition that is either
// letterboxed or padded away from the edges it is meant to touch.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  // lib/metadata.ts's shared factory: metadataBase, title template/default,
  // description default and OG defaults. See lib/metadata.ts for why
  // `robots` is NOT part of that factory.
  ...rootMetadata("de"),
  // Deliberately does NOT track lib/work.ts's POSITIONING_PLACEHOLDER, and
  // this is the decision code review WR-06 asked to be made explicitly
  // rather than left implicit. Only the STRING SOURCE changed under plan
  // 06-07's factory (the literal "Entwickler." became SITE_DESCRIPTION.de);
  // the substance of this comment has not.
  //
  // POSITIONING_PLACEHOLDER is HOME-01's ENGLISH sentence. The landing view
  // is English-only in v1 (03-UI-SPEC.md § Localisation) and German is a
  // writing-only surface, so importing it here would put English
  // share-preview copy on a lang="de" document the moment the user writes
  // the real sentence.
  //
  // The correct guarantee is not that this string tracks that constant but
  // that it never actually ships: every (de) route declares its own
  // description (/texte from UI.de.indexDescription, /texte/[slug] from the
  // post's front-matter), so this value is a fallback nothing reaches.
  // tests/build/prerender.test.ts asserts exactly that against real build
  // output — if a German route ever loses its own description, the gate
  // fails rather than silently serving this line.
  //
  // `robots` is declared literally here, not via the factory (see
  // lib/metadata.ts's own comment on why): Phase 6's eventual FIND-02 flip
  // edits exactly this line and app/(en)/layout.tsx's twin, and
  // tests/unit/launch-gate.test.ts asserts those are the only two files
  // site-wide (besides /type's own permanent noindex) that declare it.
  robots: { index: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${humane.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <SmearHeadingProvider>{children}</SmearHeadingProvider>
      </body>
    </html>
  );
}
