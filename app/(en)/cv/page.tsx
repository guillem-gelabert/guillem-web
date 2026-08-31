import type { Metadata } from "next";
import Link from "next/link";
import { UI } from "@/lib/locales";
import { SmearTitle } from "@/components/smear-title";

// The noindex directive is deliberately absent here. It is inherited from
// app/(en)/layout.tsx:13 and stating it again would be a second
// statement of a rule Phase 6's FIND-02 must then flip in three places
// instead of two (03-RESEARCH.md Pitfall 5). Do not "fix" this inheritance
// by restating it. The base URL and the default description are likewise
// owned by the root layout and are correct as inherited for a stub.
export const metadata: Metadata = {
  title: "CV — Guillem Gelabert",
  // Consistency recommendation (03-RESEARCH.md assumption A4), not a
  // UI-SPEC requirement — /writing sets the same shape for its own route.
  alternates: { canonical: "/cv" },
};

export default function CvPage() {
  return (
    <main className="flex flex-col gap-3xl px-lg py-3xl">
      <header className="flex flex-col gap-2xl">
        {/* WCAG 2.5.8: a Label-role line box alone measures 18.2px, under
            the 24px target floor. inline-block + py-xs (4px) takes it to
            26.2px, measured. */}
        <Link href="/" className="text-label link-quiet inline-block py-xs">
          {UI.en.homeLink}
        </Link>
        <div className="flex flex-col gap-lg">
          <SmearTitle as="h1" className="text-heading">
            CV
          </SmearTitle>
          <p className="max-w-prose text-body">The CV is being written up as a page.</p>
        </div>
      </header>
    </main>
  );
}
