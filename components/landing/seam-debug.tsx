"use client";

import { useEffect, useState } from "react";

// A temporary readout for the phone bugs (the disc shrinking as you
// scroll, the seam at the fold), shown only at /?debug. Emulated WebKit
// does not reproduce either, so this reads the live values off the device:
// the viewport units, what the stylesheet derives from them, and the
// canvases' sizes, with the lowest and highest each has reached.

const VERSION = "debug-2";

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
  const [topmost, setTopmost] = useState("off screen");

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
        ["100lvh", probe(document.body, "height", "100lvh")],
        ["100svh", probe(document.body, "height", "100svh")],
        ["100dvh", probe(document.body, "height", "100dvh")],
        ["--visible-height", Number.parseFloat(document.documentElement.style.getPropertyValue("--visible-height"))],
        ["chrome-bottom", probe(scene, "width", "var(--chrome-bottom)")],
        ["edge-bottom", probe(scene, "width", "var(--edge-bottom)")],
        ["scene.height", scene.getBoundingClientRect().height],
        ["disc", document.querySelector(".seam-shot-shadow")?.getBoundingClientRect().width ?? NaN],
      ];
      const canvases = [...document.querySelectorAll<HTMLCanvasElement>(".seam-grain-ink")];
      canvases.forEach((canvas, i) => {
        values.push([`grain${i}.height`, canvas.parentElement!.getBoundingClientRect().height]);
        // 150 is the canvas default before its first draw, not a reading.
        if (canvas.dataset.inkKey) values.push([`canvas${i}.height`, canvas.height]);
      });
      // The fold: where each side's box and canvas end and start, in page
      // coordinates, and how much of the canvas row either side of it is ink.
      const inked = (canvas: HTMLCanvasElement, y: number) => {
        if (!canvas.dataset.inkKey) return NaN;
        const row = canvas.getContext("2d")!.getImageData(0, y, canvas.width, 1).data;
        let n = 0;
        for (let i = 3; i < row.length; i += 4) if (row[i]! > 0) n += 1;
        return n / canvas.width;
      };
      const [above, below] = canvases;
      if (above && below) {
        const pageY = (element: Element, edge: "top" | "bottom") =>
          element.getBoundingClientRect()[edge] + window.scrollY;
        values.push(["grain0.bottom", pageY(above.parentElement!, "bottom")]);
        values.push(["canvas0.bottom", pageY(above, "bottom")]);
        values.push(["grain1.top", pageY(below.parentElement!, "top")]);
        values.push(["canvas1.top", pageY(below, "top")]);
        values.push(["canvas0.lastInk", inked(above, above.height - 1)]);
        values.push(["canvas1.row0Ink", inked(below, 0)]);
        values.push(["canvas1.row1Ink", inked(below, 1)]);
        // What paints topmost on the first row below the fold, when it is
        // on screen.
        const y = below.parentElement!.getBoundingClientRect().top + 0.5;
        if (y > 0 && y < window.innerHeight) {
          setTopmost(
            document
              .elementsFromPoint(window.innerWidth / 2, y)
              .slice(0, 3)
              .map((element) => element.className.toString().split(" ")[0] || element.tagName)
              .join(" > "),
          );
        }
      }
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
      {`\nat fold: ${topmost}`}
    </pre>
  );
}
