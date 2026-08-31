import Link from "next/link";
import { indexPath, UI } from "@/lib/locales";
import { SmearTitle } from "@/components/smear-title";

// This segment's own localised not-found boundary. Reached via
// dynamicParams = true + an explicit notFound() call in [slug]/page.tsx,
// never via a routing-layer 404 (there is no global not-found with two root
// layouts). No error boundary anywhere in this plan: UI-SPEC is explicit
// that a malformed post fails next build rather than degrading a visitor's
// request, so there is no runtime error state to build for.
export default function WritingNotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-center gap-md px-lg">
      <SmearTitle as="h1" className="text-heading">
        {UI.de.notFoundHeading}
      </SmearTitle>
      <p className="text-body">{UI.de.notFoundBody}</p>
      <Link href={indexPath("de")} className="text-label link-quiet inline-block py-xs">
        {UI.de.backLink}
      </Link>
    </main>
  );
}
