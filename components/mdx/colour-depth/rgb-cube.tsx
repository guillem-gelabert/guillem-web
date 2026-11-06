"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import type { RGB } from "./depth";
import styles from "./colour-depth.module.css";

// Point size in CSS px per depth: big enough to read as dots at 1 bit,
// small enough that a picture's worth of 8-bit colours still leaves gaps.
const POINT_PX: Record<number, number> = { 1: 14, 2: 11, 3: 8, 4: 5, 8: 2, 16: 2 };

type Scene = {
  setPalette: (palette: Uint32Array | null, bits: number) => void;
  setColour: (colour: RGB) => void;
  dispose: () => void;
};

/**
 * The RGB cube: red along x, green up, blue towards the viewer, black at the
 * corner where the axes meet. Coordinates are 0–1 shifted so the cube's
 * centre sits on the orbit target. Only the picture's own colours are drawn,
 * one point each, from `palette` (0xRRGGBB at the current depth). Renders
 * on demand only: when the camera moves, the palette changes or the colour
 * changes.
 */
export function RgbCube({
  palette,
  bits,
  colour,
  label,
}: {
  palette: Uint32Array | null;
  bits: number;
  colour: RGB;
  label: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<Record<"r" | "g" | "b", HTMLSpanElement | null>>({ r: null, g: null, b: null });
  const scene = useRef<Scene | null>(null);
  const latest = useRef({ palette, bits, colour });

  useEffect(() => {
    latest.current = { palette, bits, colour };
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [THREE, { OrbitControls }] = await Promise.all([
        import("three"),
        import("three/addons/controls/OrbitControls.js"),
      ]);
      if (cancelled || !host.current) return;
      scene.current = build(THREE, OrbitControls, host.current, labels.current);
      scene.current.setPalette(latest.current.palette, latest.current.bits);
      scene.current.setColour(latest.current.colour);
    })();
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => scene.current?.setPalette(palette, bits), [palette, bits]);
  useEffect(() => scene.current?.setColour(colour), [colour]);

  return (
    <div
      ref={host}
      className={styles.cube}
      role="img"
      aria-label={label}
      tabIndex={0}
      data-testid="rgb-cube"
    >
      <span ref={(el) => void (labels.current.r = el)} className={styles.axisLabel} data-axis="r" aria-hidden="true">
        R
      </span>
      <span ref={(el) => void (labels.current.g = el)} className={styles.axisLabel} data-axis="g" aria-hidden="true">
        G
      </span>
      <span ref={(el) => void (labels.current.b = el)} className={styles.axisLabel} data-axis="b" aria-hidden="true">
        B
      </span>
    </div>
  );
}

function build(
  THREE: typeof Three,
  OrbitControls: typeof import("three/addons/controls/OrbitControls.js").OrbitControls,
  host: HTMLDivElement,
  labelEls: Record<"r" | "g" | "b", HTMLSpanElement | null>,
): Scene {
  // The cube is the sRGB cube and every colour below is an sRGB value, so
  // colour management stays off: a point at (1, 1, 0) paints exactly
  // #FFFF00, faces interpolate in sRGB, and the ink matches the page's.
  THREE.ColorManagement.enabled = false;
  const ink = getComputedStyle(host).color || "#162d16";

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.domElement.className = styles.cubeCanvas;
  host.prepend(renderer.domElement);

  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(2.1, 1.5, 2.7);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.target.set(0, 0, 0);
  controls.update();

  const at = (r: number, g: number, b: number) => new THREE.Vector3(r - 0.5, g - 0.5, b - 0.5);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(d: T) => (disposables.push(d), d);

  // Cube edges, always on, so the points have a frame.
  const edges = new THREE.LineSegments(
    keep(new THREE.EdgesGeometry(keep(new THREE.BoxGeometry(1, 1, 1)))),
    keep(new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.35 })),
  );
  world.add(edges);

  // Axes from the black corner, a little longer than the cube. Plain ink,
  // so the coloured path to the selected colour stands out against them.
  const axisEnds = { r: at(1.18, 0, 0), g: at(0, 1.18, 0), b: at(0, 0, 1.18) };
  const origin = at(0, 0, 0);
  const axes = new THREE.LineSegments(
    keep(new THREE.BufferGeometry().setFromPoints(Object.values(axisEnds).flatMap((end) => [origin, end]))),
    keep(new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.7 })),
  );
  world.add(axes);

  // The picture's colours, one point each, rebuilt when the palette changes.
  const cloudMaterial = keep(new THREE.PointsMaterial({ vertexColors: true, sizeAttenuation: false, size: 4 }));
  const cloud = new THREE.Points(new THREE.BufferGeometry(), cloudMaterial);
  world.add(cloud);

  // The selected colour: a filled dot with an ink ring, drawn over
  // everything so it stays visible inside the cloud.
  const onTop = { depthTest: false, depthWrite: false, transparent: true };
  const ring = new THREE.Mesh(
    keep(new THREE.SphereGeometry(0.052, 24, 16)),
    keep(new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide, ...onTop })),
  );
  const dotMaterial = keep(new THREE.MeshBasicMaterial({ ...onTop }));
  const dot = new THREE.Mesh(keep(new THREE.SphereGeometry(0.038, 24, 16)), dotMaterial);
  ring.renderOrder = 10;
  dot.renderOrder = 11;
  world.add(ring, dot);

  // The way to the selected colour from black: r along red, then g up
  // green, then b out along blue, each leg in its channel's colour (NES
  // red, green and blue, as on the sliders).
  const pathGeometry = keep(new THREE.BufferGeometry());
  pathGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(18), 3));
  const legColours = [
    [0.973, 0.22, 0],
    [0.345, 0.847, 0.329],
    [0.235, 0.737, 0.988],
  ].flatMap((c) => [...c, ...c]);
  pathGeometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(legColours), 3));
  const path = new THREE.LineSegments(pathGeometry, keep(new THREE.LineBasicMaterial({ vertexColors: true, ...onTop })));
  path.renderOrder = 9;
  world.add(path);

  const placeLabels = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    for (const key of ["r", "g", "b"] as const) {
      const el = labelEls[key];
      if (!el) continue;
      const p = axisEnds[key].clone().project(camera);
      el.style.transform = `translate(${((p.x + 1) / 2) * w}px, ${((1 - p.y) / 2) * h}px) translate(-50%, -50%)`;
    }
  };

  let frame = 0;
  const render = () => {
    frame = 0;
    controls.update();
    renderer.render(world, camera);
    placeLabels();
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };
  controls.addEventListener("change", request);

  const resize = () => {
    const size = host.clientWidth;
    if (!size) return;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    request();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  // Arrow keys orbit, for readers without a pointer.
  const spherical = new THREE.Spherical();
  const offset = new THREE.Vector3();
  const onKey = (e: KeyboardEvent) => {
    const step = Math.PI / 24;
    const turn = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!turn) return;
    e.preventDefault();
    offset.copy(camera.position).sub(controls.target);
    spherical.setFromVector3(offset);
    spherical.theta += turn[0];
    spherical.phi = Math.min(Math.PI - 0.1, Math.max(0.1, spherical.phi + turn[1]));
    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
    request();
  };
  host.addEventListener("keydown", onKey);

  let currentPalette: Uint32Array | null = null;
  return {
    setPalette(palette, bits) {
      cloudMaterial.size = POINT_PX[bits] ?? 2;
      if (palette !== currentPalette) {
        currentPalette = palette;
        cloud.geometry.dispose();
        cloud.geometry = new THREE.BufferGeometry();
        if (palette) {
          const colours = new Float32Array(palette.length * 3);
          const positions = new Float32Array(palette.length * 3);
          for (let i = 0, o = 0; i < palette.length; i++, o += 3) {
            const key = palette[i];
            colours[o] = (key >>> 16) / 255;
            colours[o + 1] = ((key >>> 8) & 255) / 255;
            colours[o + 2] = (key & 255) / 255;
            positions[o] = colours[o] - 0.5;
            positions[o + 1] = colours[o + 1] - 0.5;
            positions[o + 2] = colours[o + 2] - 0.5;
          }
          cloud.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          cloud.geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
        }
      }
      request();
    },
    setColour([r8, g8, b8]) {
      const [r, g, b] = [r8 / 255, g8 / 255, b8 / 255];
      const p = at(r, g, b);
      dot.position.copy(p);
      ring.position.copy(p);
      dotMaterial.color.setRGB(r, g, b);
      const legs = pathGeometry.getAttribute("position") as Three.BufferAttribute;
      const stops = [at(0, 0, 0), at(r, 0, 0), at(r, g, 0), p];
      for (let i = 0; i < 3; i++) {
        legs.setXYZ(i * 2, stops[i].x, stops[i].y, stops[i].z);
        legs.setXYZ(i * 2 + 1, stops[i + 1].x, stops[i + 1].y, stops[i + 1].z);
      }
      legs.needsUpdate = true;
      pathGeometry.computeBoundingSphere();
      request();
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("keydown", onKey);
      controls.removeEventListener("change", request);
      controls.dispose();
      cloud.geometry.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
