"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./gameboy-screen.css";

// dmg-perfect v11 (sinedied, MIT), the shader behind the Game Boy look,
// re-expressed for DOM text. The shader's parameters, with grading left
// neutral so the palette is what the reader sees.
const DP = { grid: 0.3, gap: 1, shadow: 0.2 };
// Ghosting: the panel's response time as a low-pass on scroll velocity, and
// three echoes of the frame 1, 2 and 3 steps back at these strengths.
const GHOST = { decay: 0.85, taps: [0.55, 0.3, 0.15] };
const LUMA = [0.299, 0.587, 0.114];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const luma = (c: number[]) => c[0] * LUMA[0] + c[1] * LUMA[1] + c[2] * LUMA[2];
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * One Game Boy dot is N whole device pixels; S is the same length in CSS
 * px and is what every font size on the page is a multiple of. N = 3 on a
 * 2x display gives dots a shade finer than a DMG's 83 per inch.
 */
function dotSize() {
  const dpr = window.devicePixelRatio || 1;
  const N = Math.max(1, Math.round(1.5 * dpr));
  return { N, S: N / dpr, dpr };
}

/**
 * Wraps the post. Every block inside carries the #gb-screen filter (see
 * globals.css), the canvas on top is the dot matrix, and the wrapper is
 * translated each frame so the page only ever moves by whole dots.
 */
export function GameboyScreen({
  shades,
  children,
}: {
  shades: readonly [string, string, string, string];
  children: ReactNode;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const taps = useRef<(SVGFEOffsetElement | null)[]>([]);
  const [S, setS] = useState(1.5);

  const rgb = shades.map(hex);
  const paperLum = Math.max(luma(rgb[0]), 0.35);
  // discrete bins run dark → light, so the table is the palette reversed
  const table = (ch: number) => [...rgb].reverse().map((c) => c[ch].toFixed(4)).join(" ");

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    let S = 1.5;

    const draw = () => {
      const d = dotSize();
      S = d.S;
      setS(S);
      document.documentElement.style.setProperty("--gb-dot", `${S}px`);
      el.width = Math.round(innerWidth * d.dpr);
      el.height = Math.round(innerHeight * d.dpr);

      // the shader's coverage: a dot lights [0, lit) of its cell per axis,
      // measured over one output pixel; below ~3 px per cell the grid folds
      const N = d.N;
      const lit = Math.min(1, Math.max(1e-3, 1 - DP.gap / N));
      const fold = smoothstep(2, 2.9, N);
      const cov = (i: number) => 1 + (Math.min(1, Math.max(0, lit * N - i)) - 1) * fold;
      const tile = document.createElement("canvas");
      tile.width = tile.height = N;
      const tctx = tile.getContext("2d");
      if (!tctx) return;
      const img = tctx.createImageData(N, N);
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const k = DP.grid * (1 - cov(x) * cov(y)); // share reading as gap, mixed toward the white substrate
          const o = (y * N + x) * 4;
          img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
          img.data[o + 3] = Math.round(k * 255);
        }
      tctx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.imageSmoothingEnabled = false;
      const pattern = ctx.createPattern(tile, "repeat");
      if (!pattern) return;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, el.width, el.height);
    };
    draw();
    addEventListener("resize", draw);

    // Ghosting + whole-dot scrolling. Last frame's image is this frame's
    // image shifted by the scroll delta, so an echo of the previous frame
    // is the content offset by -velocity, snapped to the dot grid.
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = scrollY;
    let vel = 0;
    let raf = 0;
    const tick = () => {
      const top = scrollY;
      const dy = top - last;
      last = top;
      vel = still ? 0 : vel * GHOST.decay + dy * (1 - GHOST.decay);
      if (Math.abs(vel) < 0.05) vel = 0;
      const frac = top - Math.floor(top / S) * S;
      if (page.current) page.current.style.transform = `translateY(${frac.toFixed(3)}px)`;
      taps.current.forEach((t, i) => {
        if (!t) return;
        const px = String(-Math.round((vel * (i + 1)) / S) * S);
        if (t.getAttribute("dy") !== px) t.setAttribute("dy", px);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      removeEventListener("resize", draw);
      cancelAnimationFrame(raf);
      document.documentElement.style.removeProperty("--gb-dot");
    };
  }, []);

  const dx = (0.45 * S).toFixed(2);
  const dy = (0.85 * S).toFixed(2);

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        {/* The region reaches above and below the block so ghosts have room
            to trail; it stays transparent outside the glyphs (no flood), so
            neighbouring blocks never paint over each other. */}
        <filter id="gb-screen" colorInterpolationFilters="sRGB" x="-5%" y="-30%" width="110%" height="160%">
          {/* 1. ghost echoes, dy driven per frame */}
          {GHOST.taps.map((a, i) => (
            <feOffset key={i} in="SourceGraphic" dy="0" result={`g${i}`} ref={(n) => { taps.current[i] = n; }} />
          ))}
          {GHOST.taps.map((a, i) => (
            <feComponentTransfer key={i} in={`g${i}`} result={`g${i}f`}>
              <feFuncA type="linear" slope={a} />
            </feComponentTransfer>
          ))}
          <feMerge result="ghosted">
            <feMergeNode in="g2f" />
            <feMergeNode in="g1f" />
            <feMergeNode in="g0f" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
          {/* 2. flatten on paper, reduce to luma, snap to the four shades */}
          <feFlood floodColor="#fff" result="paper" />
          <feComposite in="ghosted" in2="paper" operator="over" result="flat" />
          <feColorMatrix
            in="flat"
            type="matrix"
            values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"
            result="lum"
          />
          <feComponentTransfer in="lum" result="quant">
            <feFuncR type="discrete" tableValues={table(0)} />
            <feFuncG type="discrete" tableValues={table(1)} />
            <feFuncB type="discrete" tableValues={table(2)} />
          </feComponentTransfer>
          {/* 3. dot shadow: darker dots cast, offset (0.45, 0.85) of a cell, opacity 1 - lum/paper */}
          <feOffset in="quant" dx={dx} dy={dy} result="qoff" />
          <feColorMatrix in="qoff" type="luminanceToAlpha" result="qlum" />
          <feComponentTransfer in="qlum" result="opac">
            <feFuncA type="linear" slope={(-1 / paperLum).toFixed(4)} intercept="1" />
          </feComponentTransfer>
          <feComponentTransfer in="opac" result="shadow">
            <feFuncA type="linear" slope={DP.shadow} />
          </feComponentTransfer>
          <feComposite in="shadow" in2="quant" operator="over" result="shaded" />
          {/* 4. back to transparent: keep only where glyphs, ghosts or their shadow are */}
          <feComponentTransfer in="ghosted" result="mask">
            <feFuncA type="discrete" tableValues="0 1 1 1 1 1 1 1 1 1" />
          </feComponentTransfer>
          <feOffset in="mask" dx={dx} dy={dy} result="maskoff" />
          <feMerge result="mask2">
            <feMergeNode in="mask" />
            <feMergeNode in="maskoff" />
          </feMerge>
          <feComposite in="shaded" in2="mask2" operator="in" />
        </filter>
      </svg>
      <canvas ref={canvas} className="gb-grid" aria-hidden="true" />
      <div ref={page} className="gb-page">
        {children}
      </div>
    </>
  );
}
