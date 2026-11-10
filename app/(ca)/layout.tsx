import type { Metadata, Viewport } from "next";
import { humane } from "../fonts/humane";
import { jost } from "../fonts/jost";
import { yore } from "../fonts/yore";
import { ibmPlexMono } from "../fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import { rootMetadata } from "@/lib/metadata";
import "../globals.css";

// The Catalan root layout, the (de) one's twin. Catalan is a writing-only
// surface like German: every (ca) route declares its own description, so the
// layout default is a fallback nothing reaches.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...rootMetadata("ca"),
  // Declared literally, not via the factory: see lib/metadata.ts and
  // tests/unit/launch-gate.test.ts.
  robots: { index: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ca"
      className={`${humane.variable} ${jost.variable} ${yore.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <SmearHeadingProvider>{children}</SmearHeadingProvider>
      </body>
    </html>
  );
}
