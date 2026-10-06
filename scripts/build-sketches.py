#!/usr/bin/env python3
"""Turns the line-boil drawings in elementos-line-boil/ into small WebP frames for the site.

Each object has three drawings. They share one crop box (the union of their ink), so the pencil stays in
register between frames. The white paper is removed: every pixel becomes charcoal ink whose alpha is its
darkness, which sits on marble as it is and turns light on dark sections with a CSS invert.
Writes public/sketches/<id>/<n>.webp and src/config/sketches.json (sizes, frame count).

Usage: python3 scripts/build-sketches.py   (Pillow required)
"""
import json
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'elementos-line-boil'
OUT = ROOT / 'public' / 'sketches'
CONFIG = ROOT / 'src' / 'config' / 'sketches.json'
WIDTH = 480
INK = (26, 25, 23)
# Ink lighter than this (paper grain, faint smudges) is dropped so the crop and the alpha stay clean.
FLOOR = 0.06
PAD = 0.03


def ink(im: Image.Image) -> Image.Image:
    rgba = im.convert('RGBA')
    lum = rgba.convert('L')
    dark = lum.point(lambda v: 255 - v)
    alpha = ImageChops.multiply(dark, rgba.getchannel('A'))
    alpha = alpha.point(lambda a: 0 if a < FLOOR * 255 else round((a - FLOOR * 255) / (1 - FLOOR)))
    out = Image.new('RGBA', rgba.size, INK + (0,))
    out.putalpha(alpha)
    return out


def main() -> None:
    manifest = json.loads((SRC / 'manifest.json').read_text())
    config = {'fps': manifest['fps'], 'sequence': manifest['sequence'], 'items': {}}
    for obj in manifest['objects']:
        frames = [ink(Image.open(SRC / f)) for f in obj['frames']]
        boxes = [f.getchannel('A').getbbox() for f in frames]
        l, t = min(b[0] for b in boxes), min(b[1] for b in boxes)
        r, b = max(b[2] for b in boxes), max(b[3] for b in boxes)
        pad = round(PAD * max(r - l, b - t))
        w0, h0 = frames[0].size
        box = (max(l - pad, 0), max(t - pad, 0), min(r + pad, w0), min(b + pad, h0))
        cw, ch = box[2] - box[0], box[3] - box[1]
        size = (WIDTH, round(WIDTH * ch / cw))
        dest = OUT / obj['id']
        dest.mkdir(parents=True, exist_ok=True)
        for n, f in enumerate(frames, 1):
            f.crop(box).resize(size, Image.LANCZOS).save(dest / f'{n}.webp', 'WEBP', quality=70, alpha_quality=70, method=6)
        config['items'][obj['id']] = {'width': size[0], 'height': size[1], 'frames': len(frames)}
        print(obj['id'], size, box)
    CONFIG.write_text(json.dumps(config, indent=2) + '\n')


if __name__ == '__main__':
    main()
