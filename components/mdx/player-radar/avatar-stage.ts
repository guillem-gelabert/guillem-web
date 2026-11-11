import type * as Three from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

export type AvatarAssets = { head: string; hair?: string; skin?: string; boot?: string; kit: string };

export type Stage = {
  /** Avatars left to right, one per player. Unknown ones load; dropped ones go. */
  setPlayers: (players: { key: string; assets: AvatarAssets }[]) => void;
  dispose: () => void;
};

const BASE = "/figures/what-are-embeddings/pes/";

// Curated PES 6 standing motions, alternated so that the two players never
// sway in lockstep.
const CLIPS = ["standing_idle_1", "standing_idle_2", "standing_235_106872"];

// Headroom around the tallest avatar, as a share of its height.
const MARGIN = 0.04;
// Narrowest slot per avatar, in metres.
const SLOT = 0.8;

/**
 * The avatars: PES 6 bodies with each player's face, hair, skin and
 * national kit, playing original PES idle motion, on a transparent canvas
 * over the component's own backdrop.
 *
 * Where each avatar stands comes from the host's CSS: `--slot-0`,
 * `--slot-1`… as a share of its width (default: the centres of equal
 * slots), so a media query can move them to the edges or into a strip.
 *
 * Colour management is ignored on purpose (the RGB cube on the same page
 * switches it off globally): textures are sampled as stored and lit there.
 */
export async function createStage(host: HTMLElement, canvas: HTMLCanvasElement): Promise<Stage> {
  const [THREE, { GLTFLoader }, { clone: cloneSkinned }] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/utils/SkeletonUtils.js"),
  ]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);

  const world = new THREE.Scene();
  world.add(new THREE.HemisphereLight(0xffffff, 0x3c4a3a, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(-2, 4, 3);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.6);
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

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setSize(width, height, false);
    // Zoom out when the slots get narrower than a pair of shoulders.
    const aspect = width / Math.max(1, height);
    const halfW = Math.max((viewH * aspect) / 2, (roster.length * SLOT) / 2);
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfW / aspect;
    camera.bottom = -halfW / aspect;
    camera.updateProjectionMatrix();
    layout();
  };

  // Avatar i stands at --slot-i of the width, turned a little to the middle.
  const layout = () => {
    const css = getComputedStyle(host);
    const halfW = camera.right;
    roster.forEach((key, i) => {
      const a = ready.get(key);
      if (!a) return;
      const frac = parseFloat(css.getPropertyValue(`--slot-${i}`)) || (i + 0.5) / roster.length;
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
    layout();
    frame(0);
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
    renderer.render(world, camera);
  };

  // Animate only while on screen, and not at all under reduced motion.
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let last = 0;
  const tick = (now: number) => {
    frame(last ? (now - last) / 1000 : 0);
    last = now;
    raf = requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf);
    last = 0;
    if (entry.isIntersecting && !still) raf = requestAnimationFrame(tick);
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
      renderer.dispose();
    },
  };
}
