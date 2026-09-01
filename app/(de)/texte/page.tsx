import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { publishedFor } from "@/lib/content";
import { indexPath, otherLocale, postPath, UI } from "@/lib/locales";
import { LanguageSwitch } from "@/components/language-switch";
import { SmearTitle } from "@/components/smear-title";
import { PostMeta } from "@/components/post-meta";
import { routeOpenGraph } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return {
    // Bare: the factory's title.template ("%s — Guillem Gelabert") adds the
    // suffix. The old literal here would have doubled it (plan 06-07).
    title: UI.de.indexKicker,
    description: UI.de.indexDescription,
    alternates: {
      canonical: indexPath("de"),
      languages: {
        en: indexPath("en"),
        de: indexPath("de"),
        "x-default": indexPath("en"),
      },
    },
    // lib/metadata.ts's routeOpenGraph supplies this route's own og:url
    // without hand-restating og:type/og:site_name/og:locale — see that
    // function's comment for why a bare `openGraph: { url }` would have
    // silently dropped them.
    openGraph: routeOpenGraph("de", indexPath("de")),
  };
}

export default async function WritingIndex() {
  const locale = "de" as const;
  const entries = await publishedFor(locale);

  return (
    <main className="flex flex-col gap-2xl px-lg py-3xl">
      {/* Amendment A2: the site-root back link the contents nav's Writing
          entry creates a need for. hrefLang="en" is a literal "en", not
          otherLocale(locale) — this is a fixed crossing to an English-only
          page, not a symmetric locale switch: the landing genuinely only
          exists in English for v1 (I18N-01 is scoped to writing and is
          complete), so a German reader following this link lands on an
          English page and the attribute says so honestly. The alternative
          was a dead end on /texte or a German landing whose largest single
          string is unwritten in either language. inline-block py-xs is not
          decoration — a Label-role link on its own line measures an 18.2px
          line box, under WCAG 2.5.8's 24px floor; the 4px block padding
          takes it to 26.2px. */}
      <Link href="/" className="text-label link-quiet inline-block py-xs" hrefLang="en">
        {UI[locale].homeLink}
      </Link>
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
                {/* Amendment A3: conformance with Phase 2's own Color
                    section, which already reserves the accent for link
                    hover/focus on any link — not a new visual decision. */}
                <Link href={postPath(locale, entry.slug)} className="link-quiet">
                  {entry.frontmatter.title}
                </Link>
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
