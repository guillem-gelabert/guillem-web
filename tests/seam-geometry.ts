import type { Locator, Page } from "@playwright/test";

// Shared by landing-seam-geometry.spec.ts and landing-lang-geometry.spec.ts.
// Not *.spec.ts on purpose — Playwright's testMatch would otherwise pick it
// up as a suite with zero tests.

export type Point = { x: number; y: number };

// --gradient-center-x/y, --edge-top and --edge-right are dvh/vw/clamp()
// lengths, not plain numbers, so they cannot be read with parseFloat and
// scaled by hand. This resolves them the way the browser does — and the way
// use-seam-alignment.ts's own readLength() does — by letting a throwaway
// element compute the value, then measuring it in pixels.
export async function resolveSceneLength(
  scene: Locator,
  property: string,
): Promise<number> {
  return scene.evaluate((element, prop) => {
    const declared = getComputedStyle(element).getPropertyValue(prop).trim();
    const probe = document.createElement("div");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.width = declared;
    element.appendChild(probe);
    const resolved = probe.getBoundingClientRect().width;
    probe.remove();
    return resolved;
  }, property);
}

// --seam-angle lives on :root on desktop (the hook writes it there) and on
// .scene on phones (the stylesheet's media-query branches declare it
// directly, and the hook only writes the pivot). Reading it off .scene's
// computed style covers both: on desktop nothing shadows the inherited
// :root value, so the computed style still carries it.
export async function seamAngleDegrees(page: Page, scene: Locator): Promise<number> {
  await page
    .waitForFunction(() => {
      const value = getComputedStyle(
        document.querySelector("#seam-scene")!,
      ).getPropertyValue("--seam-angle");
      return value.trim() !== "";
    })
    .catch(() => {
      // Falls through to the stylesheet's own 50deg default if the hook
      // never writes anything — evaluate() below still returns a number.
    });

  const raw = await scene.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--seam-angle"),
  );
  return Number.parseFloat(raw);
}

export async function elementCenter(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element has no box");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

// Signed distance of a point from the seam ray, along the across-seam
// normal n = (cos S, sin S). Positive is the case-study (light) side.
export function acrossSeam(point: Point, pivot: Point, angleDegrees: number): number {
  const s = (angleDegrees * Math.PI) / 180;
  const n = { x: Math.cos(s), y: Math.sin(s) };
  return (point.x - pivot.x) * n.x + (point.y - pivot.y) * n.y;
}

// Signed distance along the seam ray, direction d = (sin S, -cos S).
export function alongSeam(point: Point, pivot: Point, angleDegrees: number): number {
  const s = (angleDegrees * Math.PI) / 180;
  const d = { x: Math.sin(s), y: -Math.cos(s) };
  return (point.x - pivot.x) * d.x + (point.y - pivot.y) * d.y;
}
