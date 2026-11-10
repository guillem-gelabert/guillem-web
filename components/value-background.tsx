"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// The parallax background of theme: mazzucato, ported from
// value-mazzucato/src/components/ParallaxBackground.tsx: a fixed layer of the
// cover's staggered dashed stripes plus a few faint shapes, each translated
// by scrollY * its data-parallax factor. Gated behind prefers-reduced-motion.

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

const ring = (border: string): CSSProperties => ({ border, borderRadius: "50%" });

// The chapter pages' shapes (backgrounds.ts, ch06Shapes).
const SHAPES: { parallax: number; base?: string; style: CSSProperties }[] = [
  { parallax: 0.09, style: { left: -160, top: 180, width: 360, height: 360, ...ring("2px solid rgba(232,71,43,.16)") } },
  { parallax: 0.16, base: "rotate(12deg)", style: { right: -90, top: 760, width: 210, height: 210, background: "rgba(231,181,60,.07)" } },
  { parallax: 0.06, style: { left: -70, top: 1600, width: 150, height: 150, background: "rgba(63,182,196,.08)", borderRadius: "50%" } },
  { parallax: 0.12, style: { right: -140, top: 2300, width: 320, height: 320, ...ring("2px solid rgba(255,255,255,.06)") } },
];

export function ValueBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      for (const el of els) {
        const factor = parseFloat(el.dataset.parallax || "0.1") || 0.1;
        const base = el.dataset.base ? `${el.dataset.base} ` : "";
        el.style.transform = `${base}translateY(${y * factor}px)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="vx-bg" ref={ref} aria-hidden="true">
      <div className="vx-dash" data-parallax="-0.05">
        <DashField />
      </div>
      {SHAPES.map((shape, i) => (
        <div
          key={i}
          className="vx-shape"
          data-parallax={shape.parallax}
          data-base={shape.base}
          style={{ ...shape.style, transform: shape.base }}
        />
      ))}
    </div>
  );
}
