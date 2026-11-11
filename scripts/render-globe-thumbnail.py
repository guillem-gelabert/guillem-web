"""The watchpeopledie.live thumbnail, re-rendered offline: a port of the
watch-people-die-live globe (app/globe/shaders.ts, Earth.tsx) to numpy.

Perspective camera (FOV 45, HERO_FILL 0.66 -> distance ~3.795 R) looking at the
centre from (lon, lat), north up; image cropped to the sphere's silhouette.
Shading: day albedo with clouds mixed to white, lit by a directional light of
intensity 2 (Lambert + GGX specular from the roughness channel), mixed with the
night texture by smoothstep(-0.25, 0.5, N.S), then the fresnel atmosphere tint,
ACES filmic tone mapping and sRGB encoding, as three's renderer does.
"""
import numpy as np
from PIL import Image

TEX = "/Users/guillem/Developer/personal/watch-people-die-live/public/earth"
Image.MAX_IMAGE_PIXELS = None


def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


_cache = {}


def textures(scale=1):
    key = scale
    if key not in _cache:
        def load(name, lin):
            im = Image.open(f"{TEX}/{name}").convert("RGB")
            if scale != 1:
                im = im.resize((im.width // scale, im.height // scale), Image.LANCZOS)
            a = np.asarray(im, dtype=np.float32) / 255
            return srgb_to_lin(a) if lin else a
        _cache[key] = (
            load("earth_day_4096.jpg", True),
            load("earth_night_4096.jpg", True),
            load("earth_bump_roughness_clouds_4096.jpg", False),
        )
    return _cache[key]


def lonlat_to_vec(lon, lat):
    phi = np.radians(90 - lat)
    theta = np.radians(lon + 180)
    return np.stack([-np.sin(phi) * np.cos(theta), np.cos(phi), np.sin(phi) * np.sin(theta)], -1)


def vec_to_uv(v):
    # inverse of lonlat_to_vec; u = (lon+180)/360, v = (lat+90)/180
    lat = np.degrees(np.arcsin(np.clip(v[..., 1], -1, 1)))
    theta = np.arctan2(v[..., 2], -v[..., 0])  # = lon + 180 (rad)
    u = (np.degrees(theta) % 360) / 360
    return u, (lat + 90) / 180


def sample(tex, u, v):
    h, w, _ = tex.shape
    x = u * w - 0.5
    y = (1 - v) * h - 0.5
    x0 = np.floor(x).astype(int)
    y0 = np.floor(y).astype(int)
    fx = (x - x0)[..., None]
    fy = (y - y0)[..., None]
    x0 %= w
    x1 = (x0 + 1) % w
    y0 = np.clip(y0, 0, h - 1)
    y1 = np.clip(y0 + 1, 0, h - 1)
    return (tex[y0, x0] * (1 - fx) * (1 - fy) + tex[y0, x1] * fx * (1 - fy)
            + tex[y1, x0] * (1 - fx) * fy + tex[y1, x1] * fx * fy)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def aces(c):
    # three.js ACESFilmicToneMapping (exposure 1)
    c = c / 0.6
    m1 = np.array([[0.59719, 0.07600, 0.02840], [0.35458, 0.90834, 0.13383], [0.04823, 0.01566, 0.83777]])
    m2 = np.array([[1.60475, -0.10208, -0.00327], [-0.53108, 1.10813, -0.07276], [-0.07367, -0.00605, 1.07602]])
    c = c @ m1
    a = c * (c + 0.0245786) - 0.000090537
    b = c * (0.983729 * c + 0.4329510) + 0.238081
    c = (a / b) @ m2
    return np.clip(c, 0, 1)


def camera(center_lon, center_lat):
    d = 1 / np.sin(np.arctan(0.66 * np.tan(np.radians(22.5))))
    fwd = -lonlat_to_vec(center_lon, center_lat)
    cam = -fwd * d
    right = np.cross(fwd, [0, 1, 0]); right /= np.linalg.norm(right)
    up = np.cross(right, fwd)
    edge = np.tan(np.arcsin(1 / d))
    return cam, fwd, right, up, edge


def unproject(center_lon, center_lat, fx, fy):
    """Image fraction (0..1, y down) -> lon, lat on the sphere."""
    cam, fwd, right, up, edge = camera(center_lon, center_lat)
    ray = fwd + (fx * 2 - 1) * edge * right - (fy * 2 - 1) * edge * up
    ray /= np.linalg.norm(ray)
    b = ray @ cam; t = -b - np.sqrt(b * b - (cam @ cam - 1))
    n = cam + ray * t
    u, v = vec_to_uv(n)
    return float(u * 360 - 180), float(v * 180 - 90)


def render(center_lon, center_lat, sun_lon, sun_lat, size=512, tex_scale=1, lit=True, jitter=(0, 0), flashes=(), flash_deg=1.6):
    day, night, brc = textures(tex_scale)
    cam, fwd, right, up, edge = camera(center_lon, center_lat)
    sx = (np.arange(size) + 0.5 + jitter[0]) / size * 2 - 1
    sy = (np.arange(size) + 0.5 + jitter[1]) / size * 2 - 1
    px, py = np.meshgrid(sx * edge, -sy * edge)
    rays = fwd + px[..., None] * right + py[..., None] * up
    rays /= np.linalg.norm(rays, axis=-1, keepdims=True)
    b = rays @ cam
    c = cam @ cam - 1
    disc = b * b - c
    hit = disc > 0
    t = -b - np.sqrt(np.maximum(disc, 0))
    p = cam + rays * t[..., None]
    n = p / np.linalg.norm(p, axis=-1, keepdims=True)
    u, v = vec_to_uv(n)
    albedo = sample(day, u, v)
    extra = sample(brc, u, v)
    clouds = smoothstep(0.2, 1, extra[..., 2])[..., None]
    albedo = albedo + (1 - albedo) * np.clip(clouds * 2, 0, 1)
    if not lit:
        out = lin_to_srgb(albedo)
        out[~hit] = 0
        return out
    sun = lonlat_to_vec(sun_lon, sun_lat)
    ndl = n @ sun
    view = -rays
    # Lambert, intensity 2 (three: irradiance * albedo / pi)
    diffuse = albedo * (2 / np.pi) * np.maximum(ndl, 0)[..., None]
    # GGX specular, F0 0.04
    rough = np.where(clouds[..., 0] > 0.01, 1.0, extra[..., 1])
    rough = 0.25 + rough * 0.10
    alpha = rough ** 2
    hvec = view + sun
    hvec /= np.linalg.norm(hvec, axis=-1, keepdims=True)
    ndh = np.clip(np.sum(n * hvec, -1), 0, 1)
    ndv = np.clip(np.sum(n * view, -1), 1e-4, 1)
    vdh = np.clip(np.sum(view * hvec, -1), 0, 1)
    nl = np.clip(ndl, 1e-4, 1)
    dterm = alpha ** 2 / (np.pi * ((ndh ** 2) * (alpha ** 2 - 1) + 1) ** 2)
    k = alpha / 2
    g = (nl / (nl * (1 - k) + k)) * (ndv / (ndv * (1 - k) + k))
    f = 0.04 + 0.96 * (1 - vdh) ** 5
    spec = (dterm * g * f / (4 * nl * ndv)) * 2 * np.maximum(ndl, 0)
    lit_rgb = diffuse + spec[..., None]
    night_rgb = sample(night, u, v)
    day_strength = smoothstep(-0.25, 0.5, ndl)[..., None]
    out = night_rgb + (lit_rgb - night_rgb) * day_strength
    fresnel = 1 - np.abs(np.sum(-view * n, -1))
    atm_day = srgb_to_lin(np.array([0x4D, 0xB2, 0xFF]) / 255)
    atm_tw = srgb_to_lin(np.array([0xBC, 0x49, 0x0B]) / 255)
    atm = atm_tw + (atm_day - atm_tw) * smoothstep(-0.25, 0.75, ndl)[..., None]
    atm_mix = np.clip(smoothstep(-0.5, 1, ndl) * fresnel ** 2, 0, 1)[..., None]
    out = out + (atm - out) * atm_mix
    out = lin_to_srgb(aces(out))
    for flon, flat in flashes:
        ang = np.degrees(np.arccos(np.clip(n @ lonlat_to_vec(flon, flat), -1, 1)))
        glow = np.clip(1.25 * np.exp(-((ang / flash_deg) ** 2)), 0, 1)[..., None]
        out = out + (1 - out) * glow
    out[~hit] = 0
    return out


# --- The thumbnail: public/work/watch-people-die-earth{,-bw}.png -----------
#
#   python scripts/render-globe-thumbnail.py
#
# Needs numpy and pillow, and the watch-people-die-live checkout next to this
# repo (its public/earth textures, TEX above). The camera is the one the
# earlier screen capture was taken from (fitted against its clouds, which are
# a static texture): centred on 44E 35N. The sun is moved to a subsolar point
# of 50E 15N so Europe, Africa and Asia are all in daylight. The three flashes
# sit where the capture had them.
if __name__ == "__main__":
    CENTER = (44, 35)
    SUN = (50, 15)
    SIZE = 1140
    FLASHES = [unproject(*CENTER, fx, fy) for fx, fy in ((0.598, 0.551), (0.365, 0.824), (0.754, 0.582))]
    acc = np.zeros((SIZE, SIZE, 3))
    for j in ((-0.25, -0.25), (0.25, -0.25), (-0.25, 0.25), (0.25, 0.25)):
        acc += render(*CENTER, *SUN, size=SIZE, jitter=j, flashes=FLASHES)
    full = Image.fromarray((np.clip(acc / 4, 0, 1) * 255 + 0.5).astype(np.uint8))
    # Greyscale: luminance in linear light, at full size.
    a = np.asarray(full, np.float64) / 255
    y = srgb_to_lin(a) @ [0.2126, 0.7152, 0.0722]
    Image.fromarray((lin_to_srgb(y) * 255 + 0.5).astype(np.uint8), "L").save(
        "public/work/watch-people-die-earth-bw.png", optimize=True)
    # Colour reveal: 467px, Floyd-Steinberg onto a uniform 4-level RGB cube.
    levels = [0, 85, 170, 255]
    pal = [c for r in levels for g in levels for b in levels for c in (r, g, b)]
    palimg = Image.new("P", (1, 1))
    palimg.putpalette(pal + [0] * (768 - len(pal)))
    full.resize((467, 467), Image.LANCZOS).quantize(
        palette=palimg, dither=Image.Dither.FLOYDSTEINBERG).save(
        "public/work/watch-people-die-earth.png", optimize=True)
