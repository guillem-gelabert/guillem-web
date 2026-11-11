import type * as Three from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

export type AvatarAssets = { head: string; hair?: string; skin?: string; boot?: string; kit: string };

export type Stage = {
  /** Avatars left to right, one per player. Unknown ones load; dropped ones go. */
  setPlayers: (players: { key: string; assets: AvatarAssets }[]) => void;
  dispose: () => void;
};

const BASE = "/figures/what-are-embeddings/pes/";

// The curated PES 6 motions in body.glb (pes-avatars data/animations.json),
// all reviewed to loop cleanly. Each player sways, weight shifting from foot
// to foot, then does one of the extras, then sways again, working through
// the extras; the second player starts further along the list so the two
// never do the same thing at once. [clip, times in a row]
const STAND: [string, number] = ["standing_235_106872", 2]; // sway, 4.5 s
const EXTRAS: [string, number][] = [
  ["standing_240_45816", 1], // hand gesture, 8.7 s
  ["standing_112_149828", 1], // overhead warm-up, 3.8 s
  ["warmup_123_61212", 1], // side stretch, 4.5 s
  ["warmup_111_179852", 3], // quick footwork, 1.1 s
];
// Every change of clip, and every repeat, is a crossfade this long (at most
// a third of the clip), so no seam ever shows as a jump.
const FADE = 0.4;
// One full turn on the spot every SPIN seconds.
const SPIN = 30;

function planFor(index: number): string[] {
  const plan: string[] = [];
  for (let k = 0; k < EXTRAS.length; k++) {
    const [clip, times] = EXTRAS[(k + index * 2) % EXTRAS.length];
    for (let i = 0; i < STAND[1]; i++) plan.push(STAND[0]);
    for (let i = 0; i < times; i++) plan.push(clip);
  }
  return plan;
}

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
  let ground = 0; // the boots' height in the bind pose
  const frameOn = (model: Three.Object3D) => {
    const box = new THREE.Box3().setFromObject(model);
    const h = box.max.y - box.min.y;
    const y = (box.max.y + box.min.y) / 2;
    viewH = h * (1 + 2 * MARGIN);
    camera.position.set(0, y + 0.3, 8);
    camera.lookAt(0, y, 0);
    ground = box.min.y;
    framed = true;
  };

  // The contact shadow: a soft dark ellipse at the boots. The camera sees
  // the pitch almost edge-on, so it is drawn facing the camera, squashed,
  // and before everything else so the boots stand on it.
  const shadowTexture = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,0.75)");
    g.addColorStop(0.45, "rgba(0,0,0,0.45)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadowGeometry = new THREE.PlaneGeometry(1, 1);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

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
    turn: Three.Group;
    mixer: Three.AnimationMixer;
    clips: Map<string, Three.AnimationClip>;
    // two actions per clip, so a clip can crossfade into a repeat of itself
    actions: Map<string, Three.AnimationAction>;
    plan: string[];
    step: number;
    slot: number;
    current: Three.AnimationAction | null;
    segment: number; // seconds into the current clip
    length: number; // the current clip's duration
    spin: number; // radians turned so far
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
    // turn on the body's own axis, not on wherever the bind pose's origin is
    const centre = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
    model.position.x -= centre.x;
    model.position.z -= centre.z;

    const mixer = new THREE.AnimationMixer(model);
    const clips = new Map(body.animations.map((c) => [c.name, c]));
    const turn = new THREE.Group();
    turn.add(model);
    const root = new THREE.Group();
    root.add(turn);
    // outside the turning group: the shadow stays put while the player spins
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.scale.set(0.95, 0.16, 1);
    shadow.position.set(0, ground + 0.01, 0);
    shadow.renderOrder = -1;
    root.add(shadow);
    let hash = 0;
    for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) % 10_000;
    const avatar: Avatar = {
      root,
      turn,
      mixer,
      clips,
      actions: new Map(),
      plan: planFor(index),
      step: 0,
      slot: 0,
      current: null,
      segment: 0,
      length: 0,
      spin: 0,
    };
    next(avatar);
    // start somewhere inside the first sway, not on its first frame
    advance(avatar, (hash / 10_000) * avatar.length * 0.8);
    return avatar;
  }

  // The next clip in the avatar's plan, crossfaded in from the current one.
  function next(a: Avatar) {
    const name = a.plan[a.step % a.plan.length];
    a.step++;
    a.slot ^= 1;
    const clip = a.clips.get(name) ?? a.clips.values().next().value!;
    const id = `${clip.name}#${a.slot}`;
    let action = a.actions.get(id);
    if (!action) {
      action = a.mixer.clipAction(a.slot ? clip.clone() : clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      a.actions.set(id, action);
    }
    action.reset().play();
    // the outgoing clip started this fade with fade(a.length) left to run
    if (a.current) action.crossFadeFrom(a.current, Math.min(FADE, a.length / 3, clip.duration / 3), false);
    a.current = action;
    a.segment = 0;
    a.length = clip.duration;
  }

  // Run the avatar's mixer forward, starting each next clip exactly when
  // the current one has a fade's length left, however long dt is.
  function advance(a: Avatar, dt: number) {
    while (dt > 1e-6) {
      const until = a.length - Math.min(FADE, a.length / 3) - a.segment;
      if (until <= 0) {
        next(a);
        continue;
      }
      const step = Math.min(dt, until);
      a.mixer.update(step);
      a.segment += step;
      dt -= step;
    }
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
      // start turned a little towards the middle; the spin goes on from there
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
    const dt = Math.min(delta, 0.1);
    for (const a of ready.values()) {
      if (dt > 0) {
        advance(a, dt);
        a.spin += (dt / SPIN) * Math.PI * 2;
        a.turn.rotation.y = a.spin;
      }
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
      shadowTexture.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      renderer.dispose();
    },
  };
}
