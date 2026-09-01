import type { Metadata } from "next";
import { humane } from "../fonts/humane";
import { newsreader } from "../fonts/newsreader";
import { ibmPlexMono } from "../fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import { rootMetadata } from "@/lib/metadata";
import "../globals.css";

export const metadata: Metadata = {
  // lib/metadata.ts's shared factory: metadataBase, title template/default,
  // description default and OG defaults. See lib/metadata.ts for why
  // `robots` is NOT part of that factory.
  ...rootMetadata("en"),
  // Plan 06-07: the group default used to be POSITIONING_PLACEHOLDER
  // (HOME-01's sentence, code review WR-06's fix for the literal
  // "Developer." this file used to hardcode). Under the factory the group
  // default is now SITE_DESCRIPTION.en — the site's ARTIFACT description,
  // not the person's positioning sentence — which is what FIND-01 needs
  // /cv and /type to serve instead of "Developer.". `/` still keeps
  // POSITIONING_PLACEHOLDER by declaring it explicitly in its own metadata
  // export (app/(en)/page.tsx), unaffected by this change (HOME-01's
  // one-line-edit property, tests/landing.spec.ts:125).
  //
  // `robots` is declared literally here, not via the factory (see
  // lib/metadata.ts's own comment on why): Phase 6's eventual FIND-02 flip
  // edits exactly this line and app/(de)/layout.tsx's twin, and
  // tests/unit/launch-gate.test.ts asserts those are the only two files
  // site-wide (besides /type's own permanent noindex) that declare it.
  robots: { index: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${humane.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <SmearHeadingProvider>{children}</SmearHeadingProvider>
      </body>
    </html>
  );
}
