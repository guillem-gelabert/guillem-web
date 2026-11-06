"use client";

import { useEffect, useRef, type RefObject } from "react";
import { snapByte, toHex } from "./depth";
import styles from "./colour-depth.module.css";

/** Source pixels across the loupe: few enough that each one reads as a block. */
const SPAN = 7;
/** Loupe diameter in CSS px. */
const SIZE = 48;

/**
 * A magnifier that follows the pointer over the picture: a square of the
 * quantised pixels around it, framed in the colour under the pointer. Moves with the pointer by writing styles
 * directly, so hovering never re-renders the explorer.
 */
export function Loupe({
  source,
  original,
  bits,
}: {
  source: RefObject<HTMLCanvasElement | null>;
  original: ImageData | null;
  bits: number;
}) {
  const loupe = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLCanvasElement>(null);
  // the last pointer position in source pixels, so a depth change redraws in place
  const last = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  useEffect(() => {
    const src = source.current;
    const box = loupe.current;
    const out = lens.current;
    const ctx = out?.getContext("2d");
    if (!src || !box || !out || !ctx || !original) return;

    const dpr = window.devicePixelRatio || 1;
    out.width = out.height = Math.round(SIZE * dpr);

    const draw = () => {
      const p = last.current;
      if (!p) return;
      const sx = Math.round(p.x - SPAN / 2);
      const sy = Math.round(p.y - SPAN / 2);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(src, sx, sy, SPAN, SPAN, 0, 0, out.width, out.height);

      const px = Math.min(original.width - 1, Math.max(0, Math.floor(p.x)));
      const py = Math.min(original.height - 1, Math.max(0, Math.floor(p.y)));
      const o = (py * original.width + px) * 4;
      const bytes = [original.data[o], original.data[o + 1], original.data[o + 2]];
      box.style.setProperty("--hover", toHex([snapByte(bytes[0], bits), snapByte(bytes[1], bits), snapByte(bytes[2], bits)]));
      box.style.transform = `translate(${p.cx}px, ${p.cy}px)`;
    };

    let frame = 0;
    const move = (e: PointerEvent) => {
      const rect = src.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return hide();
      last.current = { x: (cx / rect.width) * src.width, y: (cy / rect.height) * src.height, cx, cy };
      box.hidden = false;
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          draw();
        });
    };
    const hide = () => {
      box.hidden = true;
      last.current = null;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") hide();
    };

    src.addEventListener("pointermove", move);
    src.addEventListener("pointerdown", move);
    src.addEventListener("pointerleave", hide);
    src.addEventListener("pointerup", up);
    src.addEventListener("pointercancel", hide);
    // A depth change while hovering: wait a frame, because the picture is
    // re-quantised by the parent's effect, which runs after this one.
    frame = requestAnimationFrame(() => {
      frame = 0;
      draw();
    });
    return () => {
      cancelAnimationFrame(frame);
      src.removeEventListener("pointermove", move);
      src.removeEventListener("pointerdown", move);
      src.removeEventListener("pointerleave", hide);
      src.removeEventListener("pointerup", up);
      src.removeEventListener("pointercancel", hide);
    };
  }, [source, original, bits]);

  return (
    <div ref={loupe} className={styles.loupe} hidden aria-hidden="true" data-testid="loupe">
      <canvas ref={lens} className={styles.lens} />
    </div>
  );
}
