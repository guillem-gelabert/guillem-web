import type { Metadata } from "next";
import { humane } from "./fonts/humane";
import { newsreader } from "./fonts/newsreader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guillem Gelabert",
  description: "Developer.",
  robots: { index: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${humane.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
