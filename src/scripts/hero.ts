import { animation as cfg, type Slot } from '../config/animation';

type Bitmap = CanvasImageSource & { close?: () => void };

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = ([lo, hi]: readonly [number, number]) => lo + Math.random() * (hi - lo);
const smooth = (t: number) => t * t * (3 - 2 * t);
const pad = (n: number) => String(n).padStart(2, '0');
const gKey = (n: number) => `g${pad(n)}`;
const wKey = (n: number) => `w${pad(n)}`;

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const x = (s: number) => 3 * (1 - s) ** 2 * s * x1 + 3 * (1 - s) * s * s * x2 + s ** 3;
  const y = (s: number) => 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s * s * y2 + s ** 3;
  return (t: number) => {
    let lo = 0;
    let hi = 1;
    let s = t;
    for (let i = 0; i < 20; i++) {
      const dx = x(s) - t;
      if (Math.abs(dx) < 1e-4) break;
      if (dx < 0) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return y(s);
  };
}

/** Keeps compressed frames in memory and a small rolling window of decoded bitmaps. */
class Frames {
  private blobs = new Map<string, Promise<Blob>>();
  private decoding = new Map<string, Promise<void>>();
  private ready = new Map<string, Bitmap>();
  private wanted: Set<string> | null = null;

  constructor(private tier: 'sm' | 'lg', private base: string) {}

  url(key: string) {
    return `${this.base}/frames/${this.tier}/${key}.webp`;
  }

  blob(key: string) {
    let p = this.blobs.get(key);
    if (!p) {
      p = fetch(this.url(key)).then((r) => {
        if (!r.ok) throw new Error(`${key}: ${r.status}`);
        return r.blob();
      });
      this.blobs.set(key, p);
    }
    return p;
  }

  load(key: string) {
    if (this.ready.has(key)) return Promise.resolve();
    let p = this.decoding.get(key);
    if (!p) {
      p = this.blob(key)
        .then((b) => (typeof createImageBitmap === 'function' ? createImageBitmap(b) : imageFromBlob(b)))
        .then((bm) => {
          this.decoding.delete(key);
          if (this.wanted && !this.wanted.has(key)) bm.close?.();
          else this.ready.set(key, bm);
        });
      this.decoding.set(key, p);
    }
    return p;
  }

  get(key: string) {
    return this.ready.get(key);
  }

  get size() {
    return this.ready.size;
  }

  keep(keys: Set<string>) {
    this.wanted = keys;
    for (const [k, bm] of this.ready) {
      if (!keys.has(k)) {
        bm.close?.();
        this.ready.delete(k);
      }
    }
  }
}

async function imageFromBlob(blob: Blob): Promise<Bitmap> {
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await img.decode();
  URL.revokeObjectURL(img.src);
  return img;
}

interface Live {
  el: HTMLElement;
  slot: number;
  age: number;
  life: number;
  drift: [number, number];
  anchor: Slot['anchor'];
}

/** A slow, staggered stream of greetings placed in free slots around the scene. */
class Greetings {
  private live: Live[] = [];
  private recentWords: string[] = [];
  private recentSlots: number[] = [];
  private nextIn = 0;
  enabled = false;

  constructor(
    private layer: HTMLElement,
    private slots: () => readonly Slot[],
    private avoid: () => DOMRect[],
  ) {}

  update(dt: number) {
    if (!this.enabled) return;
    const g = cfg.greetings;
    for (const l of this.live) {
      l.age += dt;
      this.paint(l);
    }
    this.live = this.live.filter((l) => {
      if (l.age < l.life) return true;
      l.el.remove();
      return false;
    });
    this.nextIn -= dt;
    if (this.nextIn <= 0 && this.live.length < g.maxVisible) {
      this.nextIn = this.spawn() ? rand(g.gapMs) : 260;
    }
  }

  private paint(l: Live) {
    const g = cfg.greetings;
    const fin = smooth(clamp(l.age / g.fadeInMs));
    const fout = smooth(clamp((l.life - l.age) / g.fadeOutMs));
    const u = clamp(l.age / l.life);
    const e = 0.5 - 0.5 * Math.cos(Math.PI * u);
    const dx = (e - 0.5) * l.drift[0];
    const dy = (e - 0.5) * l.drift[1];
    const anchorX = l.anchor === 'start' ? 0 : l.anchor === 'center' ? -50 : -100;
    l.el.style.opacity = String(fin * fout);
    l.el.style.transform = `translate(${anchorX}%, -50%) translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${(0.985 + 0.015 * fin).toFixed(4)})`;
  }

  private spawn() {
    const g = cfg.greetings;
    const slots = this.slots();
    const taken = new Set(this.live.map((l) => l.slot));
    const words = g.words.filter((w) => !this.recentWords.includes(w.text));
    const word = words[Math.floor(Math.random() * words.length)];
    const side = (i: number) => (slots[i].x < 50 ? 0 : 1);
    const load = [0, 0];
    this.live.forEach((l) => load[side(l.slot)]++);
    const order = slots
      .map((_, i) => i)
      .filter((i) => !taken.has(i) && !this.recentSlots.includes(i))
      .sort((a, b) => load[side(a)] - load[side(b)] || Math.random() - 0.5);
    for (const i of order) {
      const el = this.place(word.text, word.lang, slots[i]);
      if (!el) continue;
      const live: Live = { el, slot: i, age: 0, life: rand(g.lifetimeMs), drift: slots[i].drift as [number, number], anchor: slots[i].anchor };
      this.paint(live);
      this.live.push(live);
      this.recentWords = [...this.recentWords, word.text].slice(-3);
      this.recentSlots = [...this.recentSlots, i].slice(-2);
      return true;
    }
    return false;
  }

  /** Adds a word at a slot and keeps it only if it clears the face, name, controls and viewport. */
  private place(text: string, lang: string, slot: Slot) {
    const el = document.createElement('span');
    el.className = 'greeting';
    el.lang = lang;
    el.textContent = text;
    el.style.left = `${slot.x}%`;
    el.style.top = `${slot.y}%`;
    el.style.opacity = '0';
    const anchorX = slot.anchor === 'start' ? 0 : slot.anchor === 'center' ? -50 : -100;
    el.style.transform = `translate(${anchorX}%, -50%)`;
    this.layer.append(el);
    const r = el.getBoundingClientRect();
    const m = cfg.greetings.clearancePx;
    const view = this.layer.getBoundingClientRect();
    const inside = r.left >= view.left + 10 && r.right <= view.right - 10 && r.top >= view.top + 6 && r.bottom <= view.bottom - 6;
    const clear = this.avoid().every((a) => r.right < a.left - m || r.left > a.right + m || r.bottom < a.top - m || r.top > a.bottom + m);
    const others = this.live.every((l) => {
      const o = l.el.getBoundingClientRect();
      return r.right < o.left - m || r.left > o.right + m || r.bottom < o.top - m || r.top > o.bottom + m;
    });
    if (inside && clear && others) return el;
    el.remove();
    return null;
  }

  showStatic(texts: string[]) {
    this.clear();
    const slots = this.slots();
    const g = cfg.greetings;
    let i = 0;
    for (const text of texts) {
      const word = g.words.find((w) => w.text === text);
      while (word && i < slots.length) {
        const el = this.place(word.text, word.lang, slots[i++]);
        if (el) {
          el.style.opacity = '1';
          el.classList.add('is-static');
          this.live.push({ el, slot: i - 1, age: 0, life: Infinity, drift: [0, 0], anchor: slots[i - 1].anchor });
          break;
        }
      }
    }
  }

  clear() {
    for (const l of this.live) l.el.remove();
    this.live = [];
  }
}

function boot(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const figure = root.querySelector<HTMLElement>('[data-figure]')!;
  const scaler = root.querySelector<HTMLElement>('[data-scaler]')!;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-canvas]')!;
  const poster = root.querySelector<HTMLElement>('[data-poster]');
  const nameEl = document.querySelector<HTMLElement>('[data-brand-inner]')!;
  const layer = root.querySelector<HTMLElement>('[data-greetings]')!;
  const ctx = canvas.getContext('2d')!;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia(cfg.compactQuery);

  const dpr = Math.min(window.devicePixelRatio || 1, cfg.loading.maxDevicePixelRatio);
  const tier: 'sm' | 'lg' = figure.clientHeight * dpr > cfg.loading.largeTierAbovePx ? 'lg' : 'sm';
  const [tw, th] = cfg.frames.tiers[tier];
  canvas.width = tw;
  canvas.height = th;
  const frames = new Frames(tier, import.meta.env.BASE_URL.replace(/\/$/, ''));

  const walkMs = 1000 / cfg.fps.walk;
  const greetMs = 1000 / cfg.fps.greeting;
  const arrivalTotal = cfg.arrival.cycles * cfg.frames.walk + cfg.arrival.endOnDrawing + 1;
  const arrivalMs = arrivalTotal * walkMs;
  const ease = cubicBezier(...cfg.arrival.ease);
  const seq = cfg.greetingSequence;
  const ahead = cfg.loading.decodeAhead[tier];
  const walkKeys = Array.from({ length: cfg.frames.walk }, (_, i) => wKey(i + 1));

  const greetings = new Greetings(
    layer,
    () => (compact.matches ? cfg.greetings.slots.compact : cfg.greetings.slots.desktop),
    () => {
      const fb = figure.getBoundingClientRect();
      const zones = cfg.greetings.keepClear.map(
        ([x, y, w, h]) => new DOMRect(fb.left + x * fb.width, fb.top + y * fb.height, w * fb.width, h * fb.height),
      );
      return [...zones, nameEl.getBoundingClientRect()];
    },
  );

  type Mode = 'loading' | 'arrival' | 'loop' | 'static';
  let mode: Mode = 'loading';
  let clock = 0;
  let loopClock = 0;
  let lastTime = 0;
  let raf = 0;
  let inView = true;
  const paused = false;
  let shown = '';
  let windowAt = 0;
  let nameIn = false;

  const setScale = (s: number) => {
    scaler.style.transform = `scale(${s.toFixed(4)})`;
  };

  const showName = () => {
    if (nameIn) return;
    nameIn = true;
    document.documentElement.dataset.nameState = 'in';
  };

  const draw = (key: string) => {
    if (key === shown) return;
    const bm = frames.get(key);
    if (!bm) return;
    ctx.clearRect(0, 0, tw, th);
    ctx.drawImage(bm, 0, 0);
    shown = key;
    canvas.dataset.frame = key;
    if (poster?.isConnected) poster.closest('picture')?.remove();
    canvas.dataset.ready = '';
  };

  const refreshWindow = (idx: number) => {
    const need = new Set<string>();
    if (mode === 'arrival') {
      walkKeys.forEach((k) => need.add(k));
      for (let i = 0; i < Math.min(ahead, tier === 'lg' ? 6 : 10); i++) need.add(gKey(seq[i % seq.length]));
    } else {
      for (let i = 0; i <= ahead; i++) need.add(gKey(seq[(idx + i) % seq.length]));
    }
    if (shown) need.add(shown);
    frames.keep(need);
    canvas.dataset.decoded = String(frames.size);
    need.forEach((k) => void frames.load(k).catch(() => {}));
  };

  const tick = (dt: number) => {
    if (mode === 'arrival') {
      clock += dt;
      const p = clamp(clock / arrivalMs);
      draw(wKey((Math.floor(clock / walkMs) % cfg.frames.walk) + 1));
      setScale(lerp(cfg.arrival.startScale, cfg.arrival.endScale, ease(p)));
      if (p >= cfg.arrival.nameAt) showName();
      if (p >= cfg.arrival.greetingsAt) greetings.enabled = true;
      windowAt += dt;
      if (windowAt > 400) {
        windowAt = 0;
        refreshWindow(0);
      }
      if (clock >= arrivalMs) {
        mode = 'loop';
        loopClock = 0;
        setScale(cfg.arrival.endScale);
        showName();
        greetings.enabled = true;
        draw(gKey(seq[0]));
        refreshWindow(0);
      }
    } else if (mode === 'loop') {
      loopClock += dt;
      const idx = Math.floor(loopClock / greetMs) % seq.length;
      draw(gKey(seq[idx]));
      windowAt += dt;
      if (windowAt > 250) {
        windowAt = 0;
        refreshWindow(idx);
      }
    }
    greetings.update(dt);
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;
    tick(dt);
  };

  const sync = () => {
    const shouldRun = (mode === 'arrival' || mode === 'loop') && inView && !paused && !document.hidden;
    if (shouldRun && !raf) {
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const goStatic = async () => {
    mode = 'static';
    sync();
    greetings.enabled = false;
    setScale(1);
    showName();
    try {
      await frames.load(gKey(cfg.staticDrawing));
      draw(gKey(cfg.staticDrawing));
    } catch {
      /* the poster stays on screen */
    }
    greetings.showStatic(['Hola', 'Hello', 'こんにちは']);
  };

  const prefetchGreeting = async () => {
    const queue = Array.from({ length: cfg.frames.greeting }, (_, i) => gKey(i + 1));
    const worker = async () => {
      for (let k = queue.shift(); k; k = queue.shift()) await frames.blob(k).catch(() => {});
    };
    await Promise.all(Array.from({ length: cfg.loading.prefetchConcurrency }, worker));
  };

  new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting;
      sync();
    },
    { threshold: 0.02 },
  ).observe(stage);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', () => {
    if (reduce.matches) void goStatic();
  });

  if (reduce.matches) {
    void goStatic();
    return;
  }

  const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), cfg.loading.startTimeoutMs));
  Promise.race([Promise.all(walkKeys.map((k) => frames.load(k))), timeout])
    .then(() => {
      if (reduce.matches) return;
      mode = 'arrival';
      draw(walkKeys[0]);
      setScale(cfg.arrival.startScale);
      sync();
      void prefetchGreeting();
    })
    .catch(() => goStatic());
}

const root = document.querySelector<HTMLElement>('[data-hero]');
if (root) boot(root);
