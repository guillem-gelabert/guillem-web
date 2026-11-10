import type { Metadata } from "next";
import { NotFoundBody } from "@/components/not-found-body";
import { UI } from "@/lib/locales";

// CR-01. The CA proxy rewrite target, app/(de)/texte/nicht-gefunden's twin:
// proxy.ts rewrites any unmatched or cross-locale /escrits/:slug here with
// { status: 404 }. See that file for why the title and description are
// declared here.
export const metadata: Metadata = {
  title: UI.ca.notFoundHeading,
  description: UI.ca.notFoundBody,
};

export default function EscritsNoTrobatPage() {
  return <NotFoundBody locale="ca" />;
}
