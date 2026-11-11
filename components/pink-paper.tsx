import Link from "next/link";
import type { ReactNode } from "react";
import { sourceSerif4 } from "@/app/fonts/source-serif-4";
import { Prose } from "@/components/prose";
import "./pink-paper.css";

// Theme: pink-paper. A post set the way a business paper sets an article:
// salmon paper, one centred column, a topic kicker over a display-serif
// headline, a thin rule, and a Georgia body with teal links. It borrows the
// typographic conventions only — no masthead, logo or publication name.
// Colours and type live in pink-paper.css, scoped to .pp.
export function PinkPaperArticle({
  backLabel,
  backHrefLang,
  kicker,
  title,
  standfirst,
  meta,
  children,
}: {
  backLabel: string;
  backHrefLang?: string;
  kicker?: string;
  title: string;
  /** Omitted when the post sets hideStandfirst. */
  standfirst?: string;
  /** The post's PostMeta line: date and language links. */
  meta: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className={`pp ${sourceSerif4.variable}`}>
      <header className="pp-header">
        <Link href="/" hrefLang={backHrefLang} className="pp-back">
          {backLabel}
        </Link>
        {kicker ? <p className="pp-kicker">{kicker}</p> : null}
        <h1 className="pp-headline">{title}</h1>
        {standfirst ? <p className="pp-standfirst">{standfirst}</p> : null}
        <div className="pp-meta">{meta}</div>
      </header>
      <Prose>{children}</Prose>
    </main>
  );
}
