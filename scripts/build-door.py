#!/usr/bin/env python3
"""Builds the Contact "garage door" frames from diego-puerta-fotogramas-y-prompt/.

The 24 drawings are kept whole (same canvas, same margins, white paper) and only resized, so the
registration in the manifest still holds once scaled by the tier factor. Coordinates are written in
original canvas pixels; the page scales them itself. Also measures the horizontal extent of the ink
in every drawing so the page can fit the widest pose (raised elbows) into narrow screens.
Writes public/door/<tier>/<id>.webp and src/config/door.json.

Usage: python3 scripts/build-door.py   (Pillow required)
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'diego-puerta-fotogramas-y-prompt'
OUT = ROOT / 'public' / 'door'
CONFIG = ROOT / 'src' / 'config' / 'door.json'
TIERS = {'sm': 512, 'lg': 768}
INK = 190


def main() -> None:
    m = json.loads((SRC / 'manifest.json').read_text())
    cw, ch = m['canvas']['width'], m['canvas']['height']
    frames = {}
    left, right = cw, 0
    for f in m['frames']:
        im = Image.open(SRC / f['file']).convert('L')
        assert im.size == (cw, ch), f['file']
        box = im.point(lambda v: 255 if v < INK else 0).getbbox()
        left, right = min(left, box[0]), max(right, box[2])
        for tier, w in TIERS.items():
            dest = OUT / tier
            dest.mkdir(parents=True, exist_ok=True)
            im.resize((w, round(w * ch / cw)), Image.LANCZOS).save(dest / f"{f['id']}.webp", 'WEBP', quality=72, method=6)
        frames[f['id']] = {'contactY': f['contactY'], 'soleY': f['soleY']}
        print(f['id'], box)
    config = {
        'canvas': [cw, ch],
        'tiers': {t: [w, round(w * ch / cw)] for t, w in TIERS.items()},
        'ink': [left, right],
        'ascending': m['ascendingFrames'],
        'descending': m['descendingFrames'],
        'hold': m['holdFrames'],
        'initialHold': m['initialHoldFrames'],
        'timing': m['timing'],
        'frames': frames,
    }
    CONFIG.write_text(json.dumps(config, indent=2) + '\n')


if __name__ == '__main__':
    main()
