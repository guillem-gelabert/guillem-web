import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { publishedFor } from "@/lib/content";
import { indexPath, otherLocale, postPath, UI } from "@/lib/locales";
import { LanguageSwitch } from "@/components/language-switch";
import { SmearTitle } from "@/components/smear-title";
import { PostMeta } from "@/components/post-meta";

export function generateMetadata(): Metadata {
  return {
    title: `${UI.de.indexKicker} — Guillem Gelabert`,
    description: UI.de.emptyBody,
    alternates: {
      canonical: indexPath("de"),
      languages: {
        en: indexPath("en"),
        de: indexPath("de"),
        "x-default": indexPath("en"),
      },
    },
  };
}

export default async function WritingIndex() {
  const locale = "de" as const;
  const entries = await publishedFor(locale);

  return (
    <main className="flex flex-col gap-2xl px-lg py-3xl">
      <div className="flex flex-row items-baseline gap-md">
        <h1 className="text-label">{UI[locale].indexKicker}</h1>
        <LanguageSwitch from={locale} href={indexPath(otherLocale(locale))} />
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
                <Link href={postPath(locale, entry.slug)}>{entry.frontmatter.title}</Link>
              </SmearTitle>
              <div className="flex flex-col gap-md">
                <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
                {/* switchHref is always null here: the always-present
                    index-level language switch on the kicker line already
                    satisfies I18N-01's "index switcher always rendered"
                    rule. A second link inside the article would put a
                    competing affordance under a poster-scale headline —
                    the headline is the only link inside an <article>. */}
                <PostMeta
                  locale={locale}
                  date={entry.frontmatter.date}
                  switchHref={null}
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
