import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { sourceSerif4 } from "@/app/fonts/source-serif-4";
import { Prose } from "@/components/prose";
import type { Locale } from "@/lib/content";
import { formatPostDate } from "@/lib/locales";
import { SITE_NAME } from "@/lib/site";
import "./pink-paper.css";

// Theme: pink-paper. A post set as a newspaper front page: salmon paper, a
// small-caps top bar closed by a double rule, a bold display-serif headline,
// the text in two justified columns beside a lead photo with a pull quote
// under it, and a bold byline opening the first paragraph. It borrows the
// conventions only: no masthead, no
// publication name, and every word on the page is the post's own.
// Colours and type live in pink-paper.css, scoped to .pp.


/**
 * MDX overrides that open the post's first paragraph with the byline in
 * bold — author and date, as a newspaper sets them — as real text in that
 * paragraph rather than generated content. A fresh closure per render, and
 * the paragraphs render in document order, so `first` is the first one.
 */
function bylineComponents(locale: Locale, date: string): MDXComponents {
  let first = true;
  const byline = `${SITE_NAME}, ${formatPostDate(date, locale)} —`;
  return {
    p({ children, ...props }) {
      const lead = first;
      first = false;
      return (
        <p {...props}>
          {lead ? (
            <>
              <strong className="pp-byline">{byline}</strong>{" "}
            </>
          ) : null}
          {children}
        </p>
      );
    },
  };
}

export function PinkPaperArticle({
  locale,
  backLabel,
  backHrefLang,
  kicker,
  title,
  standfirst,
  meta,
  lead,
  pullQuote,
  date,
  post: Post,
}: {
  locale: Locale;
  backLabel: string;
  backHrefLang?: string;
  kicker?: string;
  title: string;
  /** Omitted when the post sets hideStandfirst. */
  standfirst?: string;
  /** The post's PostMeta line: date and language links. */
  meta: ReactNode;
  lead?: { src: string; alt: string; caption?: string };
  pullQuote?: string;
  /** The post's ISO date, for the byline. */
  date: string;
  /** The compiled post; rendered here so its first paragraph gets the byline. */
  post: ComponentType<{ components?: MDXComponents }>;
}) {
  return (
    <main className={`pp ${sourceSerif4.variable}`}>
      <div className="pp-top">
        <Link href="/" hrefLang={backHrefLang} className="pp-back">
          {backLabel}
        </Link>
        {kicker ? <p className="pp-kicker">{kicker}</p> : null}
        <div className="pp-meta">{meta}</div>
      </div>

      <div className="pp-sheet">
        <article className="pp-main">
          <h1 className="pp-headline">{title}</h1>
          {standfirst ? <p className="pp-standfirst">{standfirst}</p> : null}
          <div className="pp-lede">
            <div className="pp-body">
              <Prose>
                <Post components={bylineComponents(locale, date)} />
              </Prose>
            </div>
            {lead || pullQuote ? (
              <div className="pp-aside">
                {lead ? (
                  <figure className="pp-figure">
                    {/* eslint-disable-next-line @next/next/no-img-element -- no `sharp` at runtime; see components/portrait.tsx */}
                    <img src={lead.src} alt={lead.alt} width={640} height={640} />
                    {lead.caption ? <figcaption>{lead.caption}</figcaption> : null}
                  </figure>
                ) : null}
                {pullQuote ? (
                  <blockquote className="pp-pull">
                    <p>“{pullQuote}”</p>
                  </blockquote>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>

      </div>
    </main>
  );
}
