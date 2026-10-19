"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./gameboy-screen.css";

// dmg-perfect v11 (sinedied, MIT), the shader behind the Game Boy look,
// re-expressed for DOM text. The shader's parameters, with grading left
// neutral so the palette is what the reader sees.
const DP = { grid: 0.3, gap: 1, shadow: 0.2 };
const LUMA = [0.299, 0.587, 0.114];

type Shades = readonly [string, string, string, string];
type Cfg = { shades: Shades; grid: number; gap: number; shadow: number; dot: number; em: number };

// The two answers from gameboy.guillem.ch on 2026-10-14, for the ?tune panel.
const PRESETS: { label: string; shades: Shades }[] = [
  { label: "11:29:36 (t 0.44)", shades: ["#adc44f", "#8ba238", "#3d5b35", "#162d16"] },
  { label: "11:33:45 (t 0.17)", shades: ["#a2bf28", "#8ba81f", "#355f32", "#123412"] },
];

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
function dotSize(dot: number) {
  const dpr = window.devicePixelRatio || 1;
  const N = Math.max(1, Math.round(dot * dpr));
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
  const [S, setS] = useState(1.5);
  const [cfg, setCfg] = useState<Cfg>({ shades, grid: DP.grid, gap: DP.gap, shadow: DP.shadow, dot: 1.5, em: 16 });
  const presets = PRESETS.some((p) => p.shades.join() === shades.join()) ? PRESETS : [{ label: "post", shades }, ...PRESETS];
  const cfgRef = useRef(cfg);
  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);
  const [tune, setTune] = useState(false);

  useEffect(() => {
    // after paint, so the server-rendered page and the first client render agree
    const id = requestAnimationFrame(() => setTune(new URLSearchParams(location.search).has("tune")));
    return () => cancelAnimationFrame(id);
  }, []);

  // a preset swap re-points the page's paper and ink too
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--color-paper", cfg.shades[0]);
    root.setProperty("--color-ink", cfg.shades[3]);
  }, [cfg.shades]);

  const rgb = cfg.shades.map(hex);
  const paperLum = Math.max(luma(rgb[0]), 0.35);
  // feComponentTransfer's discrete bins are uniform, but the shades are not
  // evenly spaced in luma (paper sits near 0.69, not 1), so a 32-bin table
  // places each cut at the midpoint between neighbouring shades. A pixel
  // already painted in one of the shades then maps to itself.
  const lums = rgb.map(luma); // light → dark
  const cuts = [1, 2, 3].map((i) => (lums[i - 1] + lums[i]) / 2); // descending
  const BINS = 32;
  const shadeAt = (l: number) => (l >= cuts[0] ? 0 : l >= cuts[1] ? 1 : l >= cuts[2] ? 2 : 3);
  const table = (ch: number) =>
    Array.from({ length: BINS }, (_, b) => rgb[shadeAt((b + 0.5) / BINS)][ch].toFixed(4)).join(" ");

  // body size in dots; the stylesheet derives the line height from it
  useEffect(() => {
    document.documentElement.style.setProperty("--gb-em", String(cfg.em));
  }, [cfg.em]);

  const { grid, gap, dot } = cfg;
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const draw = () => {
      const d = dotSize(dot);
      const S = d.S;
      setS(S);
      document.documentElement.style.setProperty("--gb-dot", `${S}px`);
      el.width = Math.round(innerWidth * d.dpr);
      el.height = Math.round(innerHeight * d.dpr);

      // the shader's coverage: a dot lights [0, lit) of its cell per axis,
      // measured over one output pixel; below ~3 px per cell the grid folds
      const N = d.N;
      const lit = Math.min(1, Math.max(1e-3, 1 - gap / N));
      const fold = smoothstep(2, 2.9, N);
      const cov = (i: number) => 1 + (Math.min(1, Math.max(0, lit * N - i)) - 1) * fold;
      const tile = document.createElement("canvas");
      tile.width = tile.height = N;
      const tctx = tile.getContext("2d");
      if (!tctx) return;
      const img = tctx.createImageData(N, N);
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const k = grid * (1 - cov(x) * cov(y)); // share reading as gap, mixed toward the white substrate
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
    return () => removeEventListener("resize", draw);
  }, [grid, gap, dot]);

  useEffect(() => {
    // Whole-dot scrolling only. The old ghosting mutated feOffset dy on
    // every block every frame, which re-ran the whole filter graph for each
    // block and made scrolling unusable on phones; the static quantiser is
    // rasterised once and merely moves.
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let lastFrac = NaN;

    const tick = () => {
      const S = dotSize(cfgRef.current.dot).S;
      const frac = scrollY - Math.floor(scrollY / S) * S;
      if (frac !== lastFrac) {
        lastFrac = frac;
        if (page.current) page.current.style.transform = `translateY(${frac.toFixed(3)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    if (!still) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.removeProperty("--gb-dot");
    };
  }, []);

  const dx = (0.45 * S).toFixed(2);
  const dy = (0.85 * S).toFixed(2);

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        {/* The region only has to hold the dot shadow's offset; it stays
            transparent outside the glyphs (no flood), so neighbouring
            blocks never paint over each other. */}
        <filter id="gb-screen" colorInterpolationFilters="sRGB" x="-2%" y="-8%" width="104%" height="116%">
          {/* 1. flatten on paper, reduce to luma, snap to the four shades */}
          <feFlood floodColor="#fff" result="paper" />
          <feComposite in="SourceGraphic" in2="paper" operator="over" result="flat" />
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
          {/* 2. dot shadow: darker dots cast, offset (0.45, 0.85) of a cell, opacity 1 - lum/paper */}
          <feOffset in="quant" dx={dx} dy={dy} result="qoff" />
          <feColorMatrix in="qoff" type="luminanceToAlpha" result="qlum" />
          <feComponentTransfer in="qlum" result="opac">
            <feFuncA type="linear" slope={(-1 / paperLum).toFixed(4)} intercept="1" />
          </feComponentTransfer>
          <feComponentTransfer in="opac" result="shadow">
            <feFuncA type="linear" slope={cfg.shadow} />
          </feComponentTransfer>
          <feComposite in="shadow" in2="quant" operator="over" result="shaded" />
          {/* 3. back to transparent: keep only where glyphs or their shadow are */}
          <feComponentTransfer in="SourceGraphic" result="mask">
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
      {tune ? <Tune cfg={cfg} setCfg={setCfg} presets={presets} /> : null}
    </>
  );
}

/** The demo page's control panel, shown with ?tune in the URL. */
function Tune({ cfg, setCfg, presets }: { cfg: Cfg; setCfg: (c: Cfg) => void; presets: typeof PRESETS }) {
  const num = (key: keyof Cfg, min: number, max: number, step: number) => (
    <label className="gb-tune-row">
      <span>{key}</span>
      <span>{(cfg[key] as number).toFixed(2)}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={cfg[key] as number}
        onChange={(e) => setCfg({ ...cfg, [key]: parseFloat(e.target.value) })}
      />
    </label>
  );
  return (
    <div className="gb-tune" aria-label="Screen tuning">
      <label className="gb-tune-row">
        <span>shades</span>
        <span />
        <select
          value={cfg.shades.join(" ")}
          onChange={(e) => {
            const p = presets.find((x) => x.shades.join(" ") === e.target.value);
            if (p) setCfg({ ...cfg, shades: p.shades });
          }}
        >
          {presets.map((p) => (
            <option key={p.label} value={p.shades.join(" ")}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      {num("grid", 0, 1, 0.05)}
      {num("gap", 0.25, 2, 0.05)}
      {num("shadow", 0, 1, 0.05)}
      {num("dot", 1, 3, 0.5)}
      {num("em", 10, 24, 1)}
      <div className="gb-tune-shades">{cfg.shades.join(" ")}</div>
    </div>
  );
}
