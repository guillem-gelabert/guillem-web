import Link from "next/link";
import type { ReactNode } from "react";
import { archivo } from "@/app/fonts/archivo";
import { sourceSerif4 } from "@/app/fonts/source-serif-4";
import "./value-screen.css";

// Theme: mazzucato. The design system of "The Value of Everything" reader's
// summary (~/Developer/personal/value-mazzucato, design_handoff_value_of_everything):
// navy page, the cover's staggered dashed stripes, a vermilion globe, a dark
// hero in Archivo and a cream reading panel in Source Serif 4. Static: the
// handoff's scroll parallax is left out.

// The cover's stripes, ported from the handoff's makeDash().
const DASH_W = 1700;
const DASH_H = 1500;
const DASH_PATTERNS = [
  [34, 26],
  [54, 30, 14, 40],
  [20, 60, 40, 24],
  [70, 34],
  [14, 42, 64, 18],
  [44, 22, 30, 48],
  [90, 40],
  [24, 50, 18, 62],
];

function DashField() {
  const lines = [];
  for (let i = 0, x = 14; x < DASH_W; i++, x += 34) {
    lines.push(
      <line
        key={i}
        x1={x}
        y1={-60}
        x2={x}
        y2={DASH_H}
        strokeDasharray={DASH_PATTERNS[i % DASH_PATTERNS.length].join(" ")}
        strokeDashoffset={(i * 41) % 130}
      />,
    );
  }
  return (
    <svg
      viewBox={`0 0 ${DASH_W} ${DASH_H}`}
      width={DASH_W}
      height={DASH_H}
      fill="none"
      stroke="#e8472b"
      strokeWidth={2}
      opacity={0.3}
    >
      {lines}
    </svg>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="100" cy="100" r="90" />
      <line x1="10" y1="100" x2="190" y2="100" />
      <line x1="22" y1="56" x2="178" y2="56" />
      <line x1="22" y1="144" x2="178" y2="144" />
      <ellipse cx="100" cy="100" rx="30" ry="90" />
      <ellipse cx="100" cy="100" rx="62" ry="90" />
      <line x1="100" y1="10" x2="100" y2="190" />
    </svg>
  );
}

function GlobeMark() {
  return (
    <svg viewBox="0 0 40 40" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2.4}>
      <circle cx="20" cy="20" r="17" />
      <ellipse cx="20" cy="20" rx="8" ry="17" />
      <line x1="20" y1="3" x2="20" y2="37" />
      <line x1="3" y1="20" x2="37" y2="20" />
    </svg>
  );
}

export function ValueScreen({
  backHref,
  backLabel,
  title,
  meta,
  children,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  /** The post's PostMeta line: date and language links. */
  meta: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`vx ${archivo.variable} ${sourceSerif4.variable}`}>
      <div className="vx-bg" aria-hidden="true">
        <div className="vx-dash">
          <DashField />
        </div>
        <div className="vx-shape vx-shape--ring" />
        <div className="vx-shape vx-shape--square" />
      </div>
      <main className="vx-main">
        <header className="vx-hero">
          <div className="vx-hero-globe" aria-hidden="true">
            <Globe />
          </div>
          <div className="vx-hero-square" aria-hidden="true" />
          <div className="vx-hero-inner">
            <Link href={backHref} className="vx-back">
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
        <span className="vx-footer-mark" aria-hidden="true">
          <GlobeMark />
        </span>
        <Link href="/" className="vx-footer-credit" hrefLang="en">
          Guillem Gelabert
        </Link>
      </footer>
    </div>
  );
}
