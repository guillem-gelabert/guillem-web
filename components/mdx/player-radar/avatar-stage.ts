import type * as Three from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

export type AvatarAssets = { head: string; hair?: string; skin?: string; boot?: string; kit: string };

export type Stage = {
  /** Avatars left to right, one per player. Unknown ones load; dropped ones go. */
  setPlayers: (players: { key: string; assets: AvatarAssets }[]) => void;
  dispose: () => void;
};

const BASE = "/figures/what-are-embeddings/pes/";

// Two of the curated PES 6 standing motions, alternated so that two
// players side by side never sway in lockstep.
const CLIPS = ["standing_idle_1", "standing_idle_2", "standing_235_106872"];

// Headroom around the tallest avatar, as a share of its height.
const MARGIN = 0.06;
// Narrowest slot per avatar, in metres.
const SLOT = 0.8;

// 4×4 Bayer matrix, the Game Boy Camera's dither.
const QUANTISE = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec3 shade0;
  uniform vec3 shade1;
  uniform vec3 shade2;
  uniform vec3 shade3;
  uniform vec3 cuts;
  uniform float spread;
  varying vec2 vUv;

  float bayer(vec2 p) {
    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    int i = x + y * 4;
    float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
    return (m[i] + 0.5) / 16.0;
  }

  void main() {
    vec4 c = texture2D(tScene, vUv);
    // transparent background reads as paper
    vec3 rgb = mix(vec3(1.0), c.rgb, c.a);
    float l = dot(rgb, vec3(0.299, 0.587, 0.114));
    l += (bayer(gl_FragCoord.xy) - 0.5) * spread;
    vec3 shade = l >= cuts.x ? shade0 : l >= cuts.y ? shade1 : l >= cuts.z ? shade2 : shade3;
    gl_FragColor = vec4(shade, 1.0);
  }
`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const luma = (c: number[]) => c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114;

/**
 * The avatar strip: PES 6 bodies with each player's face, hair, skin and
 * national kit, playing original PES idle motion. Everything is drawn at
 * one texel per Game Boy dot into a render target, then snapped to the
 * page's four shades with ordered dithering, so the canvas matches the
 * dot grid instead of going through the page's SVG filter every frame.
 *
 * Colour management is deliberately ignored (the RGB cube on the same page
 * switches it off globally): textures are sampled as stored, lit in that
 * space, and only their luma matters.
 */
export async function createStage(host: HTMLElement, canvas: HTMLCanvasElement): Promise<Stage> {
  const [THREE, { GLTFLoader }, { clone: cloneSkinned }] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/utils/SkeletonUtils.js"),
  ]);

  const css = getComputedStyle(host);
  const shades = [0, 1, 2, 3].map((i) => css.getPropertyValue(`--shade-${i}`).trim());
  const rgb = shades.map(hex);
  const lums = rgb.map(luma);
  const dot = parseFloat(css.getPropertyValue("--gb-dot")) || 1.5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1 / dot);
  const target = new THREE.WebGLRenderTarget(1, 1, { magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter });

  const world = new THREE.Scene();
  world.add(new THREE.HemisphereLight(0xffffff, 0x50505a, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(-2, 4, 3);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(3, 1.5, 2);
  world.add(key, fill);

  // Framed on the first assembled avatar: body.glb's origin is not at the
  // boots, and the head and hair only exist once attached.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  let viewH = 2;
  let framed = false;
  const frameOn = (model: Three.Object3D) => {
    const box = new THREE.Box3().setFromObject(model);
    const h = box.max.y - box.min.y;
    const y = (box.max.y + box.min.y) / 2;
    viewH = h * (1 + 2 * MARGIN);
    camera.position.set(0, y + 0.3, 8);
    camera.lookAt(0, y, 0);
    framed = true;
  };

  const post = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quantise = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: target.texture },
      shade0: { value: new THREE.Vector3(...rgb[0]) },
      shade1: { value: new THREE.Vector3(...rgb[1]) },
      shade2: { value: new THREE.Vector3(...rgb[2]) },
      shade3: { value: new THREE.Vector3(...rgb[3]) },
      // the page filter's cuts, from its own shades: halfway between neighbours
      cuts: { value: new THREE.Vector3((lums[0] + lums[1]) / 2, (lums[1] + lums[2]) / 2, (lums[2] + lums[3]) / 2) },
      spread: { value: 0.22 },
    },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: QUANTISE,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quantise);
  post.add(quad);

  const gltfLoader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();
  const gltfs = new Map<string, Promise<GLTF>>();
  const textures = new Map<string, Promise<Three.Texture>>();
  const gltf = (url: string) => {
    if (!gltfs.has(url)) gltfs.set(url, gltfLoader.loadAsync(BASE + url));
    return gltfs.get(url)!;
  };
  const texture = (url: string) => {
    if (!textures.has(url))
      textures.set(
        url,
        textureLoader.loadAsync(BASE + url).then((t) => {
          t.flipY = false;
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          return t;
        }),
      );
    return textures.get(url)!;
  };

  type Avatar = {
    root: Three.Group;
    mixer: Three.AnimationMixer;
    actions: Three.AnimationAction[];
    duration: number;
    elapsed: number;
  };
  const avatars = new Map<string, Promise<Avatar | null>>();
  const ready = new Map<string, Avatar>();
  let roster: string[] = [];
  let disposed = false;

  async function build(key: string, assets: AvatarAssets, index: number): Promise<Avatar | null> {
    const [body, head, hair, kit, skin, boot] = await Promise.all([
      gltf("body/body.glb"),
      gltf(assets.head),
      assets.hair ? gltf(assets.hair) : null,
      texture(assets.kit),
      assets.skin ? texture(assets.skin) : null,
      assets.boot ? texture(assets.boot) : null,
    ]);
    if (disposed) return null;

    const model = cloneSkinned(body.scene);
    const maps: Record<string, Three.Texture | null> = { kit, skin, boots: boot };
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const swap = (m: Three.Material) => {
        const clone = m.clone();
        const map = maps[clone.name];
        if (map && clone instanceof THREE.MeshStandardMaterial) {
          clone.map = map;
          clone.color.setRGB(1, 1, 1);
        }
        return clone;
      };
      object.material = Array.isArray(object.material) ? object.material.map(swap) : swap(object.material);
    });
    const attach = model.getObjectByName("HeadAttach");
    if (!attach) throw new Error("body.glb is missing HeadAttach");
    attach.add(head.scene.clone(true));
    if (hair) attach.add(hair.scene.clone(true));

    if (!framed) frameOn(model);

    const clip = body.animations.find((a) => a.name === CLIPS[index % CLIPS.length]) ?? body.animations[0];
    const mixer = new THREE.AnimationMixer(model);
    // Two copies overlap at the seam: the extracted clips do not loop cleanly.
    const actions = [mixer.clipAction(clip), mixer.clipAction(clip.clone())];
    actions.forEach((a) => a.setLoop(THREE.LoopOnce, 1).play());

    const root = new THREE.Group();
    root.add(model);
    let hash = 0;
    for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) % 10_000;
    return { root, mixer, actions, duration: clip.duration, elapsed: (hash / 10_000) * clip.duration };
  }

  let width = 0;
  let height = 0;
  const resize = () => {
    width = host.clientWidth;
    height = host.clientHeight;
    renderer.setSize(width, height, false);
    const w = Math.max(1, Math.round(width / dot));
    const h = Math.max(1, Math.round(height / dot));
    target.setSize(w, h);
    // Zoom out when the slots get narrower than a pair of shoulders, so
    // five players on a phone stand side by side instead of overlapping.
    const aspect = width / Math.max(1, height);
    const halfW = Math.max((viewH * aspect) / 2, roster.length * SLOT / 2);
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfW / aspect;
    camera.bottom = -halfW / aspect;
    camera.updateProjectionMatrix();
    layout();
  };

  // Avatar i stands at the centre of the i-th of N equal slots, turned a
  // little towards the middle.
  const layout = () => {
    const halfW = camera.right;
    roster.forEach((key, i) => {
      const a = ready.get(key);
      if (!a) return;
      const frac = (i + 0.5) / roster.length;
      a.root.position.x = (frac * 2 - 1) * halfW;
      a.root.rotation.y = THREE.MathUtils.degToRad((0.5 - frac) * 40);
    });
  };

  const setPlayers: Stage["setPlayers"] = (players) => {
    const keep = new Set(players.map((p) => p.key));
    for (const key of [...avatars.keys()]) {
      if (keep.has(key)) continue;
      avatars.delete(key);
      const a = ready.get(key);
      if (a) {
        world.remove(a.root);
        a.mixer.stopAllAction();
        ready.delete(key);
      }
    }
    const resized = roster.length !== players.length;
    roster = players.map((p) => p.key);
    players.forEach((p, i) => {
      if (avatars.has(p.key)) return;
      const pending = build(p.key, p.assets, i).catch((error) => {
        console.error(error);
        return null;
      });
      avatars.set(p.key, pending);
      void pending.then((a) => {
        if (a && avatars.get(p.key) === pending) {
          ready.set(p.key, a);
          world.add(a.root);
          resize();
          frame(0);
        }
      });
    });
    if (resized) resize();
    else layout();
    frame(0);
  };

  const draw = () => {
    renderer.setRenderTarget(target);
    renderer.setClearColor(0xffffff, 1);
    renderer.clear();
    renderer.render(world, camera);
    renderer.setRenderTarget(null);
    renderer.render(post, postCamera);
  };

  const frame = (delta: number) => {
    for (const a of ready.values()) {
      a.elapsed += Math.min(delta, 0.1);
      const blend = Math.min(0.35, a.duration / 4);
      const period = a.duration - blend;
      const t = ((a.elapsed % period) + period) % period;
      const incoming = Math.min(1, t / blend);
      a.actions[0].time = t;
      a.actions[0].setEffectiveWeight(incoming);
      a.actions[1].time = Math.min(t + period, a.duration);
      a.actions[1].setEffectiveWeight(1 - incoming);
      a.mixer.update(0);
    }
    draw();
  };

  // Animate only while on screen, and not at all under reduced motion.
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let last = 0;
  let visible = false;
  const tick = (now: number) => {
    frame(last ? (now - last) / 1000 : 0);
    last = now;
    raf = requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(raf);
    last = 0;
    if (visible && !still) raf = requestAnimationFrame(tick);
    else frame(0);
  });
  observer.observe(host);
  const sizer = new ResizeObserver(() => {
    resize();
    frame(0);
  });
  sizer.observe(host);
  resize();

  return {
    setPlayers,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      sizer.disconnect();
      for (const a of ready.values()) a.mixer.stopAllAction();
      void Promise.all([...textures.values()]).then((ts) => ts.forEach((t) => t.dispose()));
      target.dispose();
      quantise.dispose();
      quad.geometry.dispose();
      renderer.dispose();
    },
  };
}
