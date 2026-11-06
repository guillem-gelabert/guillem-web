"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { departureMono } from "@/app/fonts/departure-mono";
import {
  DEPTHS,
  formatBytes,
  formatCount,
  maxValue,
  packedBytes,
  paletteOf,
  quantise,
  snapByte,
  toByte,
  toHex,
  toLevel,
  totalColours,
  type RGB,
} from "./depth";
import { Loupe } from "./loupe";
import { RgbCube } from "./rgb-cube";
import styles from "./colour-depth.module.css";

const CHANNELS = [
  { key: "R", name: "red" },
  { key: "G", name: "green" },
  { key: "B", name: "blue" },
] as const;

type Props = { src: string; alt: string; width: number; height: number };

/**
 * Colour depth: how many levels each of R, G and B gets. One slider sets
 * the depth; the cube, the picture, the stats and the channel sliders all
 * follow. The picked colour is kept at 8 bits and snapped on the way out,
 * so stepping the depth down and back up returns to the same colour.
 */
export function ColourDepth({ src, alt, width, height }: Props) {
  const [bits, setBits] = useState(8);
  const [picked, setPicked] = useState<RGB>([250, 214, 20]);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [original, setOriginal] = useState<ImageData | null>(null);

  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const ctx = off.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);
      setOriginal(ctx.getImageData(0, 0, width, height));
    };
    img.src = src;
  }, [src, width, height]);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !original) return;
    const out = new ImageData(width, height);
    quantise(original.data, bits, out.data);
    ctx.putImageData(out, 0, 0);
  }, [original, bits, width, height]);

  const shown = useMemo<RGB>(
    () => [snapByte(picked[0], bits), snapByte(picked[1], bits), snapByte(picked[2], bits)],
    [picked, bits],
  );
  const levels = picked.map((c) => toLevel(c, bits));
  const max = maxValue(bits);
  const fill = toHex(shown);

  const pickAt = (x: number, y: number) => {
    if (!original) return;
    const px = Math.min(width - 1, Math.max(0, Math.floor(x)));
    const py = Math.min(height - 1, Math.max(0, Math.floor(y)));
    const o = (py * width + px) * 4;
    setPicked([original.data[o], original.data[o + 1], original.data[o + 2]]);
    setSpot({ x: (px + 0.5) / width, y: (py + 0.5) / height });
  };

  const onPhotoClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pickAt(((e.clientX - rect.left) / rect.width) * width, ((e.clientY - rect.top) / rect.height) * height);
  };

  const onPhotoKey = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    pickAt(width / 2, height / 2);
  };

  const setChannel = (i: number, level: number) => {
    const next = [...picked] as [number, number, number];
    next[i] = toByte(level, bits);
    setPicked(next);
    setSpot(null);
  };

  // the picture's own colours at this depth: what the cube draws
  const palette = useMemo(() => (original ? paletteOf(original.data, bits) : null), [original, bits]);
  const used = palette ? formatCount(palette.length) : "…";

  const cubeLabel =
    `RGB cube at ${bits} bits per channel, showing the ${used} colours the picture uses. ` +
    `Selected colour: red ${levels[0]}, green ${levels[1]}, blue ${levels[2]}, out of ${max}.`;

  const stop = DEPTHS.indexOf(bits as (typeof DEPTHS)[number]);
  const lastStop = DEPTHS.length - 1;

  return (
    <div
      className={`colour-depth not-prose ${departureMono.variable} ${styles.root}`}
      role="group"
      aria-label="Colour depth explorer"
      data-testid="colour-depth"
    >
      <section className={styles.window}>
        <div className={styles.title} id="colour-depth-bits">
          Bits per channel
        </div>
        <div className={styles.depth}>
          <input
            type="range"
            min={0}
            max={lastStop}
            step={1}
            value={stop}
            style={{ "--frac": stop / lastStop } as CSSProperties}
            aria-labelledby="colour-depth-bits"
            aria-valuetext={`${bits} bit${bits === 1 ? "" : "s"} per channel`}
            onChange={(e) => setBits(DEPTHS[Number(e.target.value)])}
            data-testid="depth"
          />
          <div className={styles.stops} aria-hidden="true">
            {DEPTHS.map((b, i) => (
              <span
                key={b}
                style={{ "--at": i / lastStop } as CSSProperties}
                data-current={b === bits ? "" : undefined}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Max/channel</dt>
            <dd data-testid="stat-max">{formatCount(max)}</dd>
          </div>
          <div>
            <dt>Colours</dt>
            <dd data-testid="stat-colours">{formatCount(totalColours(bits))}</dd>
          </div>
          <div>
            <dt>Image</dt>
            <dd>
              {width}×{height}
            </dd>
          </div>
          <div>
            <dt>Memory</dt>
            <dd data-testid="stat-memory">{formatBytes(packedBytes(width, height, bits))}</dd>
          </div>
        </dl>
      </section>

      <div className={styles.panels}>
        <section className={styles.window}>
          <div className={styles.title}>RGB cube</div>
          <RgbCube palette={palette} bits={bits} colour={shown} label={cubeLabel} />
          <div className={styles.hint}>
            <span data-testid="stat-used">{used}</span> in picture
            <span aria-hidden="true">Drag</span>
          </div>
        </section>
        <section className={styles.window}>
          <div className={styles.title}>Picture</div>
          <div className={styles.photo}>
            <canvas
              ref={canvas}
              width={width}
              height={height}
              role="img"
              aria-label={`${alt} Shown at ${bits} bits per channel. Click to pick a colour.`}
              tabIndex={0}
              onClick={onPhotoClick}
              onKeyDown={onPhotoKey}
              data-testid="photo"
            />
            <Loupe source={canvas} original={original} bits={bits} />
            {spot ? (
              <span
                className={styles.marker}
                style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                aria-hidden="true"
              />
            ) : null}
          </div>
          <div className={styles.hint} aria-hidden="true">
            Click to pick
          </div>
        </section>
      </div>

      <section className={`${styles.window} ${styles.colour}`}>
        <div className={styles.title}>Colour</div>
        <span className={styles.chip} style={{ background: fill }} aria-hidden="true" data-testid="chip" />
        <div className={styles.sliders}>
          {CHANNELS.map((c, i) => (
            <label key={c.key} className={styles.channel} data-ch={c.key}>
              <span aria-hidden="true">{c.key}</span>
              <input
                type="range"
                min={0}
                max={max}
                step={1}
                value={levels[i]}
                style={{ "--frac": levels[i] / max } as CSSProperties}
                aria-label={`${c.name}, 0 to ${max}`}
                onChange={(e) => setChannel(i, Number(e.target.value))}
                data-testid={`channel-${c.key}`}
              />
              <output>
                {levels[i]}/{max}
              </output>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
