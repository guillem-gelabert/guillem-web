import type { Metadata } from "next";
import { NotFoundBody } from "@/components/not-found-body";

// CR-01. The DE proxy rewrite target: proxy.ts rewrites any unmatched or
// cross-locale /texte/:slug here with { status: 404 }, so this ordinary
// Server Component only ever has to render — the status is set upstream,
// because App Router pages cannot set one themselves.
//
// This page must export its own metadata.title. The research prototype
// measured the served 404 falling back to the layout default
// "Guillem Gelabert" without one, a WCAG 2.4.2 regression against what
// app/global-not-found.tsx already achieves.
//
// No `robots` field here, deliberately: Next injects
// <meta name="robots" content="noindex"> for any response with a status at
// or above 400 — including a proxy-set status (measured) — so this route
// stays unindexed after FIND-02 flips the two root layouts, with no extra
// code. That field stays confined to the two root layouts.
export const metadata: Metadata = {
  title: "Nicht gefunden — Guillem Gelabert",
};

// A direct visit to this path is itself matched by the proxy's
// /texte/:slug matcher, is not in the published set, and is rewritten to
// itself with a 404 — so this route is self-guarding and never serves 200.
export default function TexteNichtGefundenPage() {
  return <NotFoundBody locale="de" />;
}
