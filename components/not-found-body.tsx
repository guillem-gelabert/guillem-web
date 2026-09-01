import Link from "next/link";
import type { Locale } from "@/lib/content";
import { indexPath, UI } from "@/lib/locales";
import { SmearTitle } from "@/components/smear-title";

type NotFoundBodyProps = {
  locale: Locale;
};

// CR-01. The single localised 404 body, shared by both writing-segment
// not-found.tsx boundaries AND both proxy-rewritten reserved pages
// (app/(en)/writing/not-found-page, app/(de)/texte/nicht-gefunden). Four
// copies of two locales is how the German drifts — this is the one source.
export function NotFoundBody({ locale }: NotFoundBodyProps) {
  return (
    <main className="flex min-h-screen flex-col justify-center gap-md px-lg">
      <SmearTitle as="h1" className="text-heading">
        {UI[locale].notFoundHeading}
      </SmearTitle>
      <p className="text-body">{UI[locale].notFoundBody}</p>
      <Link href={indexPath(locale)} className="text-label link-quiet inline-block py-xs">
        {UI[locale].backLink}
      </Link>
    </main>
  );
}
