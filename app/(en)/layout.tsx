import type { Metadata } from "next";
import { humane } from "../fonts/humane";
import { newsreader } from "../fonts/newsreader";
import { ibmPlexMono } from "../fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import { SITE_URL } from "@/lib/site";
import { POSITIONING_PLACEHOLDER } from "@/lib/work";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: "Guillem Gelabert",
  // HOME-01, and this is the DEFAULT every (en) route inherits — not just
  // the landing's. It used to be the literal "Developer.", a duplicate of
  // POSITIONING_PLACEHOLDER's value that lib/work.ts, app/(en)/page.tsx and
  // deferred-items.md §1 all described as the single source (code review
  // WR-06). /cv sets its own title but no description, and /type is a
  // Client Component so it can export no metadata at all, so both inherited
  // the literal: writing the real positioning sentence into lib/work.ts
  // would have updated / while /cv and /type went on serving "Developer."
  // as their share-preview text.
  description: POSITIONING_PLACEHOLDER,
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
