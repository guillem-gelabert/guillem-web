import type { Metadata } from "next";
import { humane } from "../fonts/humane";
import { newsreader } from "../fonts/newsreader";
import { ibmPlexMono } from "../fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: "Guillem Gelabert",
  // Deliberately does NOT track lib/work.ts's POSITIONING_PLACEHOLDER, and
  // this is the decision code review WR-06 asked to be made explicitly
  // rather than left implicit.
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
  description: "Entwickler.",
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
