import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { publishedFor } from "@/lib/content";
import { indexAlternates, indexPath, otherLocales, postPath, UI } from "@/lib/locales";
import { LanguageSwitch } from "@/components/language-switch";
import { SmearTitle } from "@/components/smear-title";
import { PostMeta } from "@/components/post-meta";
import { routeOpenGraph } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return {
    title: UI.ca.indexKicker,
    description: UI.ca.indexDescription,
    alternates: {
      canonical: indexPath("ca"),
      languages: indexAlternates(),
    },
    openGraph: routeOpenGraph("ca", indexPath("ca")),
  };
}

// app/(de)/texte/page.tsx's twin; see that file for the reasoning behind
// the home link's hrefLang="en" and the article-level switchHref omission.
export default async function WritingIndex() {
  const locale = "ca" as const;
  const entries = await publishedFor(locale);

  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-2xl px-lg py-3xl">
      <Link href="/" className="text-label link-quiet inline-block py-xs" hrefLang="en">
        {UI[locale].homeLink}
      </Link>
      <div className="flex flex-row items-baseline gap-md">
        <h1 className="text-label">{UI[locale].indexKicker}</h1>
        {otherLocales(locale).map((to) => (
          <LanguageSwitch key={to} to={to} href={indexPath(to)} />
        ))}
      </div>
      {entries.length === 0 ? (
        <div className="flex flex-col gap-md">
          <p className="max-w-prose text-standfirst">{UI[locale].emptyHeading}</p>
          <p className="max-w-prose text-body">{UI[locale].emptyBody}</p>
        </div>
      ) : (
        entries.map((entry, index) => (
          <Fragment key={entry.slug}>
            {index > 0 ? <hr /> : null}
            <article className="flex flex-col gap-lg">
              <SmearTitle as="h2" className="text-display">
                <Link href={postPath(locale, entry.slug)} className="link-quiet">
                  {entry.frontmatter.title}
                </Link>
              </SmearTitle>
              <div className="flex flex-col gap-md">
                <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
                <PostMeta
                  locale={locale}
                  date={entry.frontmatter.date}
                  translations={[]}
                  draft={entry.frontmatter.draft}
                />
              </div>
            </article>
          </Fragment>
        ))
      )}
    </main>
  );
}
