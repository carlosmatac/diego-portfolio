#!/usr/bin/env python3
"""
Builds the web-ready animation frames from the original sketches in diego-saludo-v4/.

Inputs
  diego-saludo-v4/frames/diego-NN.png   40 greeting drawings (1024x1536, white paper)
  diego-saludo-v4/ver-saludo.html       contains the approach (walk) clip as an embedded MP4;
                                        its 48 exposures are 4 repetitions of 12 distinct drawings
Outputs
  public/frames/{sm,lg}/wink.webp       arms-crossed wink used on hover in the contact section
  public/frames/{sm,lg}/g01..g40.webp   greeting drawings
  public/frames/{sm,lg}/w01..w12.webp   walk-cycle drawings
  src/config/frames.json                crop box and tier sizes consumed by the site

The paper is removed by turning luminance into alpha over a constant ink colour. Over a light
surface this is identical to `mix-blend-mode: multiply`, without needing a blend mode, and the
drawings also work over dark surfaces.

Requires: Pillow, numpy, ffmpeg.   Usage: python3 scripts/build-frames.py
"""
import base64, json, re, subprocess, sys, tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "diego-saludo-v4"
OUT = ROOT / "public" / "frames"
CONFIG = ROOT / "src" / "config" / "frames.json"

PAPER = 252.0       # luminance treated as blank paper (the scans sit around 253)
FLOOR = 0.05        # alpha below this is paper grain and is dropped
LEVELS = 32         # alpha quantisation; keeps the pencil grain and shrinks files ~45 %
INK = (26, 25, 23)  # warm charcoal
MARGIN = 14
TIERS = {"sm": 960, "lg": 1536}  # output height in px; width follows the crop ratio
GREETING = 40
WALK = 12
STILL = 25  # keep in sync with animation.staticDrawing


def extract_walk(workdir: Path) -> list[Path]:
    html = (SRC / "ver-saludo.html").read_text(encoding="utf8")
    clips = re.findall(r'<video id="(\w+)".*?src="data:video/mp4;base64,([A-Za-z0-9+/=]+)"', html, re.S)
    walk = dict(clips).get("walk")
    if not walk:
        sys.exit("walk clip not found in ver-saludo.html")
    mp4 = workdir / "walk.mp4"
    mp4.write_bytes(base64.b64decode(walk))
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp4), "-vsync", "0", str(workdir / "w-%02d.png")], check=True)
    frames = sorted(workdir.glob("w-*.png"))
    small = lambda p: np.asarray(Image.open(p).convert("L").resize((64, 96)), dtype=np.float32)
    drift = float(np.abs(small(frames[0]) - small(frames[WALK])).mean())
    assert drift < 1.0, f"expected the clip to repeat every {WALK} exposures (drift {drift:.2f})"
    return frames[:WALK]


def alpha_of(img: Image.Image) -> np.ndarray:
    lum = np.asarray(img.convert("L"), dtype=np.float32)
    a = np.clip((PAPER - lum) / PAPER, 0, 1)
    return np.clip((a - FLOOR) / (1 - FLOOR), 0, 1)


def to_rgba(alpha: np.ndarray) -> Image.Image:
    a = np.round(alpha * (LEVELS - 1)) / (LEVELS - 1)
    out = np.zeros(alpha.shape + (4,), np.uint8)
    out[..., :3] = INK
    out[..., 3] = np.round(a * 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        walk_paths = extract_walk(Path(tmp))
        sources = {f"g{i:02d}": SRC / "frames" / f"diego-{i:02d}.png" for i in range(1, GREETING + 1)}
        sources.update({f"w{i + 1:02d}": p for i, p in enumerate(walk_paths)})
        sources["wink"] = SRC / "diego-guiño.png"

        alphas = {k: alpha_of(Image.open(p)) for k, p in sources.items()}
        full_h, full_w = next(iter(alphas.values())).shape

        # The wink is a separate drawing: nudge it so its centre and feet match the still pose it replaces on hover.
        def box(a):
            yy, xx = np.where(a > 0.12)
            return (xx.min() + xx.max()) // 2, yy.max()

        (rx, ry), (wx, wy) = box(alphas[f"g{STILL:02d}"]), box(alphas["wink"])
        dx, dy = int(rx - wx), int(ry - wy)
        shifted = np.zeros_like(alphas["wink"])
        h_, w_ = shifted.shape
        shifted[max(dy, 0):h_ + min(dy, 0), max(dx, 0):w_ + min(dx, 0)] = alphas["wink"][max(-dy, 0):h_ + min(-dy, 0), max(-dx, 0):w_ + min(-dx, 0)]
        alphas["wink"] = shifted
        print(f"wink nudged by {dx}px, {dy}px")

        ys, xs = zip(*(np.where(a > 0.12) for a in alphas.values()))
        x0 = max(0, min(x.min() for x in xs) - MARGIN) // 2 * 2
        x1 = min(full_w, max(x.max() for x in xs) + MARGIN) // 2 * 2
        y0 = max(0, min(y.min() for y in ys) - MARGIN) // 2 * 2
        y1 = min(full_h, max(y.max() for y in ys) + MARGIN) // 2 * 2
        x0, x1, y0, y1 = (int(v) for v in (x0, x1, y0, y1))
        cw, ch = x1 - x0, y1 - y0
        print(f"crop x{x0}-{x1} y{y0}-{y1} -> {cw}x{ch}")

        meta = {"source": [full_w, full_h], "crop": [x0, y0, cw, ch], "tiers": {}, "greeting": GREETING, "walk": WALK}
        for tier, height in TIERS.items():
            scale = height / full_h
            tw, th = round(cw * scale / 2) * 2, round(ch * scale / 2) * 2
            meta["tiers"][tier] = [tw, th]
            (OUT / tier).mkdir(parents=True, exist_ok=True)
            total = 0
            for key, a in alphas.items():
                crop = Image.fromarray((a[y0:y1, x0:x1] * 255).astype(np.uint8), "L")
                if (tw, th) != (cw, ch):
                    crop = crop.resize((tw, th), Image.LANCZOS)
                dest = OUT / tier / f"{key}.webp"
                to_rgba(np.asarray(crop, dtype=np.float32) / 255).save(dest, "WEBP", quality=72, method=6)
                total += dest.stat().st_size
            print(f"{tier}: {tw}x{th}, {len(alphas)} files, {total / 1024:.0f} KB total")

        CONFIG.parent.mkdir(parents=True, exist_ok=True)
        CONFIG.write_text(json.dumps(meta, indent=2) + "\n")


if __name__ == "__main__":
    main()
