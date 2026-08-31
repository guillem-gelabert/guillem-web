import Link from "next/link";
import { humane } from "./fonts/humane";
import { newsreader } from "./fonts/newsreader";
import { ibmPlexMono } from "./fonts/ibm-plex-mono";
import { SmearHeadingProvider } from "@/components/smear-heading/smear-heading-provider";
import { SmearTitle } from "@/components/smear-title";
import { indexPath, UI } from "@/lib/locales";
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
