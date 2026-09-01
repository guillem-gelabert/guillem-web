import type { Metadata } from "next";
import { NotFoundBody } from "@/components/not-found-body";
import { UI } from "@/lib/locales";

// CR-01. The EN proxy rewrite target: proxy.ts rewrites any unmatched or
// cross-locale /writing/:slug here with { status: 404 }, so this ordinary
// Server Component only ever has to render — the status is set upstream,
// because App Router pages cannot set one themselves.
//
// This page must export its own metadata.title. The research prototype
// measured the served 404 falling back to the layout default
// "Guillem Gelabert" without one, a WCAG 2.4.2 regression against what
// app/global-not-found.tsx already achieves.
//
// It also exports its own metadata.description rather than inheriting
// app/(en)/layout.tsx's POSITIONING_PLACEHOLDER ("Developer.") — a 404
// page's share preview should not claim to be the site's positioning
// sentence. Matches app/(de)/texte/nicht-gefunden/page.tsx's same fix, and
// reuses UI.en.notFoundBody rather than inventing new copy (D-1.5 forbids
// growing the UI map for this plan).
//
// No `robots` field here, deliberately: Next injects
// <meta name="robots" content="noindex"> for any response with a status at
// or above 400 — including a proxy-set status (measured) — so this route
// stays unindexed after FIND-02 flips the two root layouts, with no extra
// code. That field stays confined to the two root layouts.
export const metadata: Metadata = {
  title: "Not found — Guillem Gelabert",
  description: UI.en.notFoundBody,
};

// A direct visit to this path is itself matched by the proxy's
// /writing/:slug matcher, is not in the published set, and is rewritten to
// itself with a 404 — so this route is self-guarding and never serves 200.
export default function WritingNotFoundPage() {
  return <NotFoundBody locale="en" />;
}
