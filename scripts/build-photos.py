#!/usr/bin/env python3
"""Downloads the Wikimedia Commons photos listed in scripts/photos.json, crops them, tones them to the
site's warm greys and writes WebP sizes to public/photos/ plus src/config/photos.json (sizes and credits).

Usage: python3 scripts/build-photos.py   (Pillow required)
"""
import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'photos'
CONFIG = ROOT / 'src' / 'config' / 'photos.json'
WIDTHS = [800, 1400, 2000]
UA = {'User-Agent': 'diego-portfolio/1.0 (photo build script)'}

# Tone curve: deepest shadow is warm charcoal, highlights stop at marble so photos sit on the page.
SHADOW = (31, 29, 26)
LIGHT = (236, 235, 231)


def get(url: str) -> bytes:
    for attempt in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f'rate limited: {url}')


def info(title: str) -> dict:
    q = urllib.parse.urlencode({'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata',
                                'iiurlwidth': 2400, 'format': 'json'})
    page = next(iter(json.loads(get(f'https://commons.wikimedia.org/w/api.php?{q}'))['query']['pages'].values()))
    return page['imageinfo'][0]


def text(meta: dict, key: str) -> str:
    return re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', meta.get(key, {}).get('value', ''))).strip()


def crop(im: Image.Image, aspect: float, focus: tuple[float, float]) -> Image.Image:
    w, h = im.size
    if w / h > aspect:
        cw, ch = round(h * aspect), h
    else:
        cw, ch = w, round(w / aspect)
    x = min(max(round(focus[0] * w - cw / 2), 0), w - cw)
    y = min(max(round(focus[1] * h - ch / 2), 0), h - ch)
    return im.crop((x, y, x + cw, y + ch))


def tone(im: Image.Image) -> Image.Image:
    g = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=(0.6, 0.4))
    g = g.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
    lut = []
    for c in range(3):
        lut += [round(SHADOW[c] + (LIGHT[c] - SHADOW[c]) * (i / 255) ** 1.08) for i in range(256)]
    return g.convert('RGB').point(lut)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((ROOT / 'scripts' / 'photos.json').read_text())
    config = {}
    for item in manifest:
        meta = info(item['file'])
        em = meta.get('extmetadata', {})
        src = Image.open(io.BytesIO(get(meta.get('thumburl') or meta['url'])))
        src = ImageOps.exif_transpose(src).convert('RGB')
        im = tone(crop(src, item['aspect'], tuple(item['focus'])))
        files = []
        for w in WIDTHS:
            if w > im.width and files:
                continue
            out = im.resize((min(w, im.width), round(min(w, im.width) / item['aspect'])), Image.LANCZOS)
            name = f"{item['id']}-{out.width}.webp"
            out.save(OUT / name, 'WEBP', quality=74, method=6)
            files.append({'src': f'/photos/{name}', 'w': out.width})
        config[item['id']] = {
            'files': files,
            'width': files[-1]['w'],
            'height': round(files[-1]['w'] / item['aspect']),
            'author': text(em, 'Artist'),
            'license': text(em, 'LicenseShortName'),
            'licenseUrl': em.get('LicenseUrl', {}).get('value', ''),
            'page': meta['descriptionurl'],
        }
        print(item['id'], config[item['id']]['author'], config[item['id']]['license'], [f['w'] for f in files])
        time.sleep(1)
    CONFIG.write_text(json.dumps(config, indent=2, ensure_ascii=False) + '\n')


if __name__ == '__main__':
    main()
