"use client";

import { useEffect, useState } from "react";

// A temporary readout for the phone bugs (the disc shrinking as you
// scroll, the seam at the fold), shown only at /?debug. Emulated WebKit
// does not reproduce either, so this reads the live values off the device:
// the viewport units, what the stylesheet derives from them, and the
// canvases' sizes, with the lowest and highest each has reached.

const VERSION = "debug-1";

type Row = { now: number; min: number; max: number };

function probe(parent: Element, property: string, value: string) {
  const element = document.createElement("div");
  element.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;top:0;left:0";
  element.style.setProperty(property, value);
  parent.appendChild(element);
  const box = element.getBoundingClientRect();
  element.remove();
  return property === "height" ? box.height : box.width;
}

export function SeamDebug() {
  const [rows, setRows] = useState<[string, Row][] | null>(null);

  useEffect(() => {
    if (!new URLSearchParams(location.search).has("debug")) return;
    const seen = new Map<string, Row>();
    let frame = 0;

    const read = () => {
      frame = 0;
      const scene = document.getElementById("seam-scene");
      const viewport = window.visualViewport;
      if (!scene) return;
      const values: [string, number][] = [
        ["scrollY", window.scrollY],
        ["innerHeight", window.innerHeight],
        ["vv.height", viewport?.height ?? NaN],
        ["vv.width", viewport?.width ?? NaN],
        ["vv.scale", viewport?.scale ?? NaN],
        ["vv.offsetTop", viewport?.offsetTop ?? NaN],
        ["100lvh", probe(document.body, "height", "100lvh")],
        ["100svh", probe(document.body, "height", "100svh")],
        ["100dvh", probe(document.body, "height", "100dvh")],
        ["--visible-height", Number.parseFloat(document.documentElement.style.getPropertyValue("--visible-height"))],
        ["chrome-bottom", probe(scene, "width", "var(--chrome-bottom)")],
        ["edge-bottom", probe(scene, "width", "var(--edge-bottom)")],
        ["safe-top", probe(scene, "width", "var(--safe-top)")],
        ["safe-bottom", probe(scene, "width", "var(--safe-bottom)")],
        ["scene.height", scene.getBoundingClientRect().height],
        ["disc", document.querySelector(".seam-shot-shadow")?.getBoundingClientRect().width ?? NaN],
      ];
      document.querySelectorAll<HTMLCanvasElement>(".seam-grain-ink").forEach((canvas, i) => {
        values.push([`grain${i}.height`, canvas.parentElement!.getBoundingClientRect().height]);
        // 150 is the canvas default before its first draw, not a reading.
        if (canvas.dataset.inkKey) values.push([`canvas${i}.height`, canvas.height]);
      });
      for (const [name, now] of values) {
        const row = seen.get(name);
        const rounded = Math.round(now * 100) / 100;
        seen.set(name, {
          now: rounded,
          min: row ? Math.min(row.min, rounded) : rounded,
          max: row ? Math.max(row.max, rounded) : rounded,
        });
      }
      setRows([...seen.entries()]);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    const timer = setInterval(schedule, 500);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, []);

  if (!rows) return null;
  return (
    <pre
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "max(env(safe-area-inset-top), 0.5rem)",
        right: "0.5rem",
        zIndex: 2000,
        margin: 0,
        padding: "0.4rem 0.5rem",
        background: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        font: "10px/1.3 ui-monospace, monospace",
        pointerEvents: "none",
        whiteSpace: "pre",
      }}
    >
      {`${VERSION}            now     min     max\n`}
      {rows
        .map(
          ([name, row]) =>
            `${name.padEnd(17)}${String(row.now).padStart(8)}${String(row.min).padStart(8)}${String(row.max).padStart(8)}`,
        )
        .join("\n")}
    </pre>
  );
}
