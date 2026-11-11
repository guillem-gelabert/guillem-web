import Link from "next/link";
import type { ReactNode } from "react";
import { archivo } from "@/app/fonts/archivo";
import { sourceSerif4 } from "@/app/fonts/source-serif-4";
import { ValueBackground } from "@/components/value-background";
import "./value-screen.css";

// Theme: mazzucato. The design system of "The Value of Everything" reader's
// summary (~/Developer/personal/value-mazzucato, design_handoff_value_of_everything):
// navy page, the cover's staggered dashed stripes, a hero in Archivo and
// light Source Serif 4 body text straight on the navy. The parallax
// background lives in components/value-background.tsx.

export function ValueScreen({
  backLabel,
  title,
  meta,
  children,
}: {
  backLabel: string;
  title: string;
  /** The post's PostMeta line: date and language links. */
  meta: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`vx ${archivo.variable} ${sourceSerif4.variable}`}>
      <ValueBackground />
      <main className="vx-main">
        <header className="vx-hero">
          <div className="vx-hero-square" aria-hidden="true" />
          <div className="vx-hero-inner">
            <Link href="/" className="vx-back" hrefLang="en">
              {backLabel}
            </Link>
            <h1 className="vx-title">{title}</h1>
            <div className="vx-meta">
              <span className="vx-meta-dot" aria-hidden="true" />
              {meta}
            </div>
          </div>
        </header>
        <article className="vx-panel">
          <div className="vx-body">{children}</div>
        </article>
      </main>
      <footer className="vx-footer">
        <Link href="/" className="vx-footer-credit" hrefLang="en">
          Guillem Gelabert
        </Link>
      </footer>
    </div>
  );
}
