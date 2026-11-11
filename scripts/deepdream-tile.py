"""Seamless DeepDream tile, after https://www.tensorflow.org/tutorials/generative/deepdream

Same model, layers and octave loop as the tutorial (InceptionV3, mixed3 +
mixed5, gradient ascent, octave scale 1.3). Two changes make it tile:
- the model sees the image wrap-padded on all four sides, inside the
  gradient tape, so the gradient for an edge pixel includes what the
  network saw across the opposite edge;
- octave resizes are done on a wrap-padded copy, then cropped.

Start image: the ground of the Hempton post's former theme (mazzucato), navy with red/gold/teal dashed
vertical stripes, built to repeat exactly.

  python scripts/deepdream-tile.py OUT.png --size 1024 --steps 80 --step-size 0.02

It also dreams on a picture rather than the stripes: --start PATH (a square
image) with --edges reflect, so the edges mirror instead of wrapping. The
Hempton thumbnail (public/work/hempton-dream{,-bw}.webp: 640px, the grey a
linear-light luminance) is, from a square crop of his portrait,

  python scripts/deepdream-tile.py OUT.png --start CROP.png --edges reflect \
    --size 448 --octaves 4 --steps 100 --step-size 0.02 --layers mixed4,mixed5

then upscaled to 640. Dreaming small and on the deeper layers is what makes
the dog faces and eyes big against the head.

Needs tensorflow, pillow and numpy (Python 3.12). The committed tile,
public/backgrounds/hempton-dream.webp (the Hempton post's backdrop until it took
theme: pink-paper; removed, in git history) was the first (stripes) run saved as WebP
at quality 78.
"""
import argparse
import numpy as np
import tensorflow as tf
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--size", type=int, default=1024)
ap.add_argument("--steps", type=int, default=50)
ap.add_argument("--step-size", type=float, default=0.01)
ap.add_argument("--layers", default="mixed3,mixed5")
ap.add_argument("--seed", type=int, default=1)
ap.add_argument("--start", help="square start image; default is the stripes")
ap.add_argument("--edges", choices=["wrap", "reflect"], default="wrap")
ap.add_argument("--octaves", type=int, default=3, help="octaves at 1.3x, ending at --size")
args = ap.parse_args()

rng = np.random.default_rng(args.seed)
tf.random.set_seed(args.seed)

NAVY = np.array([0x10, 0x18, 0x38]) / 255
COLOURS = [np.array(c) / 255 for c in ([0xE8, 0x47, 0x2B], [0xE7, 0xB5, 0x3C], [0x3F, 0xB6, 0xC4])]


def start_image(size):
    img = np.tile(NAVY, (size, size, 1)).astype(np.float32)
    pitch = size // 12  # ~12 stripes across
    period = size // 8  # dash period divides the tile, so it wraps
    for i, x in enumerate(range(pitch // 2, size, pitch)):
        colour = COLOURS[0] if i % 5 else COLOURS[1 + (i // 5) % 2]
        on = int(period * rng.uniform(0.35, 0.7))
        offset = int(rng.integers(0, period))
        for y in range(size):
            if (y + offset) % period < on:
                img[y, x - 1 : x + 2] = colour
    # Low-frequency toroidal noise so the dream has something to grow from.
    noise = np.zeros((size, size, 3))
    for k in range(1, 6):
        phase = rng.uniform(0, 2 * np.pi, (3, 2))
        t = np.linspace(0, 2 * np.pi * k, size, endpoint=False)
        for c in range(3):
            noise[..., c] += np.sin(t[None, :] + phase[c, 0]) * np.cos(t[:, None] + phase[c, 1]) / k
    img += 0.18 * noise
    return np.clip(img, 0, 1)


base = tf.keras.applications.InceptionV3(include_top=False, weights="imagenet")
outputs = [base.get_layer(name).output for name in args.layers.split(",")]
model = tf.keras.Model(inputs=base.input, outputs=outputs)

PAD = 96


def wrap_pad(img, pad):
    if args.edges == "reflect":
        return tf.pad(img, [[pad, pad], [pad, pad], [0, 0]], mode="REFLECT")
    img = tf.concat([img[-pad:], img, img[:pad]], axis=0)
    return tf.concat([img[:, -pad:], img, img[:, :pad]], axis=1)


def wrap_resize(img, size):
    h = tf.shape(img)[0]
    pad = 8
    scale = size / tf.cast(h, tf.float32)
    big = tf.image.resize(wrap_pad(img, pad), tf.cast(tf.cast(h + 2 * pad, tf.float32) * scale, tf.int32) * [1, 1])
    p = tf.cast(tf.round(pad * scale), tf.int32)
    return tf.image.resize(big[p:-p, p:-p], [size, size])


@tf.function
def step(img, step_size):
    shift = tf.random.uniform([2], 0, tf.shape(img)[0], dtype=tf.int32)
    rolled = tf.roll(img, shift=shift, axis=[0, 1])
    with tf.GradientTape() as tape:
        tape.watch(rolled)
        acts = model(wrap_pad(rolled, PAD)[None])
        if not isinstance(acts, list):
            acts = [acts]
        loss = tf.add_n([tf.reduce_mean(a) for a in acts])
    grad = tape.gradient(loss, rolled)
    grad /= tf.math.reduce_std(grad) + 1e-8
    rolled = tf.clip_by_value(rolled + grad * step_size, -1, 1)
    return tf.roll(rolled, shift=-shift, axis=[0, 1]), loss


if args.start:
    start = np.asarray(Image.open(args.start).convert("RGB").resize((args.size, args.size)), np.float32) / 255
else:
    start = start_image(args.size)
img = tf.constant(start * 2 - 1, tf.float32)  # inception range [-1, 1]
for octave in range(1 - args.octaves, 1):
    size = int(round(args.size * 1.3**octave))
    img = wrap_resize(img, size)
    for i in range(args.steps):
        img, loss = step(img, tf.constant(args.step_size))
    print(f"octave {octave} size {size} loss {float(loss):.3f}", flush=True)

out = ((img.numpy() + 1) / 2 * 255).clip(0, 255).astype(np.uint8)
Image.fromarray(out).save(args.out)
print("wrote", args.out)
