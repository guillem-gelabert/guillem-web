import type { Metadata } from "next";
import Link from "next/link";
import { humane } from "./fonts/humane";
import { newsreader } from "./fonts/newsreader";
import { ibmPlexMono } from "./fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import { SmearTitle } from "@/components/smear-title";
import { indexPath, UI } from "@/lib/locales";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// The global not-found boundary — the routing layer's 404, reached by every
// URL that matches no route at all (/nope, /blog, /de/texte). Before this
// file existed those served Next's built-in default: no <html lang>, no
// fonts, untranslated chrome — the same WCAG 2.1 SC 3.1.1 (Level A) failure
// the localised boundaries were written to avoid.
//
// It owns its own <html>/<body> and re-declares the font variables, because
// with two root layouts under (en)/ and (de)/ no layout wraps this file.
//
// English, matching the site's x-default alternate: an unmatched URL carries
// no locale signal this file can read. It renders as the /_not-found route,
// so headers() is unavailable (reading it turns every page dynamic) and
// usePathname() reports "/_not-found", not the URL the visitor typed.

// WCAG 2.1 SC 2.4.2 Page Titled (Level A) — the same conformance level as
// the SC 3.1.1 failure this file exists to fix. Without it document.title is
// "" on every unmatched URL, so the browser tab, the history entry, the
// bookmark and every assistive-technology page announcement fall back to the
// raw URL. This export is only legal because global-not-found replaces the
// injected default root layout; under app/not-found.tsx it was impossible.
//
// No `robots` key here, deliberately. Next already emits
// <meta name="robots" content="noindex"> for any response with a status
// above 400 (next/dist/server/app-render/app-render.js's NonIndex), measured
// present in both .next/server/app/_not-found.html and the live `next start`
// response. Declaring it again would ship the tag twice on the site's most
// crawled surface. tests/build/prerender.test.ts asserts it appears exactly
// once, so this stays a gated fact rather than an assumption — and so a
// Phase 6 FIND-02 flip of the two root layouts, which do NOT wrap this file,
// cannot make the 404 indexable without failing that test.
export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: `${UI.en.notFoundHeading} — Guillem Gelabert`,
};

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${humane.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <SmearHeadingProvider>
          <main className="flex min-h-screen flex-col justify-center gap-md px-lg">
            <SmearTitle as="h1" className="text-heading">
              {UI.en.notFoundHeading}
            </SmearTitle>
            <p className="text-body">{UI.en.notFoundBody}</p>
            <Link href={indexPath("en")} className="text-label link-quiet inline-block py-xs">
              {UI.en.backLink}
            </Link>
          </main>
        </SmearHeadingProvider>
      </body>
    </html>
  );
}
