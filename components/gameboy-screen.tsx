"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { coralPixels } from "@/app/fonts/coral-pixels";
import { geistPixel } from "@/app/fonts/geist-pixel";
import { crtTile, tftTile, type Tile } from "./screen-masks";
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

// The ?dev picker's faces. next/font ones by family; the rest are files in
// design/fonts, served in development by app/api/dev-fonts. "" keeps the
// stylesheet's own face.
const NEXT_FONTS: Record<string, string> = { "geist-pixel": geistPixel.style.fontFamily };
const FONTS = [
  "geist-pixel",
  "yore-in-peril.ttf",
  "yore-in-peril-m-lord.ttf",
  "yore-in-peril-m-lord-mono.ttf",
  "16-bit-dreams-mono.ttf",
  "access-denied.ttf",
  "access-denied-mono.ttf",
  "detectives-n-dames.ttf",
  "detectives-n-dames-mono.ttf",
  "eaten-by-grues.ttf",
  "eaten-by-grues-mono.ttf",
  "ittiest-bittiest.ttf",
  "itty-bitty.ttf",
  "lanky-git-mono.ttf",
  "lord-flimbington.ttf",
  "lord-flimbington-mono.ttf",
  "mythos-maximus.ttf",
  "mythos-maximus-mono.ttf",
  "that-s-delaware-mono.ttf",
  "DepartureMono.otf",
  "PixelOperator.ttf",
  "PixelOperator-Bold.ttf",
];

/**
 * The screens a Game Boy post can switch to further down. A post opts in by
 * placing <ScreenSwitch to="crt" /> markers in its MDX; the last marker
 * above the middle of the viewport picks the screen, and `html[data-screen]`
 * carries it to the stylesheet (gameboy-screen.css) and to components that
 * draw their own pixels. "gb" is the default above the first marker.
 */
export type ScreenKind = "gb" | "crt" | "tft";
const SCREENS: Record<Exclude<ScreenKind, "gb">, { paper: string; ink: string; tile: () => Tile }> = {
  // an NES on a colour TV: palette entries 0x37 (palest peach) and 0x0F (black)
  crt: { paper: "#fce0a8", ink: "#000000", tile: () => crtTile() },
  // design/tft-demo.html's panel and ink
  tft: { paper: "#d9ddd6", ink: "#1c2024", tile: () => tftTile() },
};

function screenAt(): ScreenKind {
  let kind: ScreenKind = "gb";
  for (const marker of document.querySelectorAll<HTMLElement>("[data-screen-switch]")) {
    if (marker.getBoundingClientRect().top < innerHeight / 2) kind = marker.dataset.screenSwitch as ScreenKind;
  }
  return kind;
}

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
  const [cfg, setCfg] = useState<Cfg>({ shades, grid: DP.grid, gap: DP.gap, shadow: DP.shadow, dot: 1.5, em: 13 });
  const presets = PRESETS.some((p) => p.shades.join() === shades.join()) ? PRESETS : [{ label: "post", shades }, ...PRESETS];
  const cfgRef = useRef(cfg);
  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);
  const [screen, setScreen] = useState<ScreenKind>("gb");
  const [tune, setTune] = useState(false);
  const [dev, setDev] = useState(false);

  useEffect(() => {
    // after paint, so the server-rendered page and the first client render agree
    const id = requestAnimationFrame(() => {
      const q = new URLSearchParams(location.search);
      setTune(q.has("tune"));
      setDev(q.has("dev"));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // a preset swap re-points the page's paper and ink too, and so does a screen
  useEffect(() => {
    const root = document.documentElement.style;
    const other = screen === "gb" ? null : SCREENS[screen];
    root.setProperty("--color-paper", other?.paper ?? cfg.shades[0]);
    root.setProperty("--color-ink", other?.ink ?? cfg.shades[3]);
    // the four shades by name, for components that draw in them directly
    cfg.shades.forEach((shade, i) => root.setProperty(`--gb-shade-${i}`, shade));
  }, [cfg.shades, screen]);

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
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.imageSmoothingEnabled = false;

      // CRT and TFT: the shader's pattern multiplied over the page (the
      // canvas blends with multiply on those screens, see the stylesheet)
      if (screen !== "gb") {
        const t = SCREENS[screen].tile();
        const tile = document.createElement("canvas");
        tile.width = t.w;
        tile.height = t.h;
        tile.getContext("2d")?.putImageData(new ImageData(t.data, t.w, t.h), 0, 0);
        const pattern = ctx.createPattern(tile, "repeat");
        if (!pattern) return;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, el.width, el.height);
        // the tube's darker corners; the panel's backlight, brighter at the edges
        const w = el.width;
        const h = el.height;
        const g =
          screen === "crt"
            ? ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) / 2)
            : ctx.createLinearGradient(0, 0, 0, h);
        if (screen === "crt") {
          g.addColorStop(0, "#fff");
          g.addColorStop(1, "#9a9a9a");
        } else {
          g.addColorStop(0, "#fff");
          g.addColorStop(0.2, "#f3f3f3");
          g.addColorStop(0.8, "#f3f3f3");
          g.addColorStop(1, "#fff");
        }
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
        return;
      }

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
      const pattern = ctx.createPattern(tile, "repeat");
      if (!pattern) return;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, el.width, el.height);
    };
    draw();
    addEventListener("resize", draw);
    return () => removeEventListener("resize", draw);
  }, [grid, gap, dot, screen]);

  // Which screen the reader is on, from the markers' positions: a hard cut
  // when a marker crosses the middle of the viewport, either way.
  useEffect(() => {
    const html = document.documentElement;
    let current: ScreenKind | null = null;
    const check = () => {
      const next = screenAt();
      if (next === current) return;
      current = next;
      html.dataset.screen = next;
      setScreen(next);
    };
    check();
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    return () => {
      removeEventListener("scroll", check);
      removeEventListener("resize", check);
      delete html.dataset.screen;
    };
  }, []);


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
      <div ref={page} className={`gb-page ${geistPixel.variable} ${coralPixels.variable}`}>
        {children}
      </div>
      {tune || dev ? (
        <div className="gb-tune" aria-label="Screen tuning">
          {dev ? <Fonts /> : null}
          {tune ? <Tune cfg={cfg} setCfg={setCfg} presets={presets} /> : null}
        </div>
      ) : null}
    </>
  );
}

/** The demo page's screen controls, shown with ?tune in the URL. */
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
    <>
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
    </>
  );
}

/**
 * The ?dev font picker: loads a face from design/fonts on demand and points
 * --gb-heading-font or --gb-body-font at it (see gameboy-screen.css), plus
 * Geist Pixel's ELSH axis.
 */
function Fonts() {
  const [faces, setFaces] = useState({ heading: "", body: "" });
  const [elsh, setElsh] = useState(0);

  useEffect(() => {
    document.documentElement.style.setProperty("--gb-elsh", String(elsh));
  }, [elsh]);

  const pick = async (role: keyof typeof faces, file: string) => {
    setFaces((f) => ({ ...f, [role]: file }));
    const root = document.documentElement.style;
    if (!file) return root.removeProperty(`--gb-${role}-font`);
    if (NEXT_FONTS[file]) return root.setProperty(`--gb-${role}-font`, NEXT_FONTS[file]);
    const family = `gb-dev-${file.replace(/\.\w+$/, "")}`;
    if (![...document.fonts].some((f) => f.family === family)) {
      document.fonts.add(await new FontFace(family, `url(/api/dev-fonts/${file})`).load());
    }
    root.setProperty(`--gb-${role}-font`, `"${family}"`);
  };

  return (
    <>
      {(["heading", "body"] as const).map((role) => (
        <label key={role} className="gb-tune-row">
          <span>{role}</span>
          <span />
          <select value={faces[role]} onChange={(e) => pick(role, e.target.value)}>
            <option value="">default</option>
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f.replace(/\.\w+$/, "")}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="gb-tune-row">
        <span>ELSH</span>
        <span>{elsh}</span>
        <input type="range" min={0} max={100} step={1} value={elsh} onChange={(e) => setElsh(Number(e.target.value))} />
      </label>
    </>
  );
}
