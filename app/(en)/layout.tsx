import type { Metadata } from "next";
import { humane } from "../fonts/humane";
import { newsreader } from "../fonts/newsreader";
import { ibmPlexMono } from "../fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://web-production-9cedb.up.railway.app"),
  title: "Guillem Gelabert",
  description: "Developer.",
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
