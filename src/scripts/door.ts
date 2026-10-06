import door from '../config/door.json';

/**
 * Contact as a garage door: the dark panel rises and Diego, crouched underneath, pushes it up with
 * both palms, holds it, and lets it down again. One clock picks the drawing, and the drawing decides
 * where the panel is: its bottom edge always sits on the palm line from the manifest
 * (spriteTop = groundY - soleY * s; edgeY = spriteTop + contactY * s; panelY = edgeY - panelHeight).
 * Loops while the section is mostly in view: a short wait, the gesture, then a rest with the panel
 * closed so the links can be read and used. Focusing, selecting or tapping inside the panel holds the
 * next run back; a tap during the gesture closes it at once.
 */
type FrameId = keyof typeof door.frames;

const root = document.querySelector<HTMLElement>('[data-door]');
const panel = root?.querySelector<HTMLElement>('[data-door-panel]');
const canvas = root?.querySelector<HTMLCanvasElement>('[data-door-sprite]');

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const FIRST_DELAY = 2000;
/** Rest with the panel closed between two runs of the loop. */
const LOOP_GAP = 6000;
/** Screen pixels the panel overlaps the top of the palms, so they never float under it. */
const OVERLAP = 1.5;
const HOLD_FPS = 5.5;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

if (root && panel && canvas) init(root, panel, canvas);

function init(root: HTMLElement, panel: HTMLElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const [cw, ch] = door.canvas;
  const [inkL, inkR] = door.ink;
  const t = door.timing;
  const phases = [t.revealMs, t.liftMs, t.holdMs, t.lowerMs, t.concealMs];
  const total = phases.reduce((a, b) => a + b, 0);
  const maxSupport = Math.max(...Object.values(door.frames).map((f) => f.soleY - f.contactY));
  const frameOf = (id: string) => door.frames[id as FrameId];

  let geo = { w: 0, h: 0, s: 0, x: 0, ground: 0 };
  let images = new Map<string, HTMLImageElement>();
  let loading: Promise<void> | null = null;
  let ready = false;
  let playing = false;
  let clock = 0;
  let last = 0;
  let raf = 0;
  let shown = '';
  let inView = false;
  let autoTimer = 0;
  let lastPointer = -Infinity;

  /** Fit the widest pose and the tallest reach into the door, from the original canvas coordinates. */
  const measure = () => {
    const w = root.clientWidth;
    const h = root.clientHeight;
    const pad = Math.max(16, w * 0.04);
    const ground = h - clamp(h * 0.035, 12, 36);
    const s = Math.min((ground * 0.66) / maxSupport, (w - 2 * pad) / (inkR - inkL));
    geo = { w, h, s, x: w / 2 - ((inkL + inkR) / 2) * s, ground };
    canvas.style.width = `${cw * s}px`;
    canvas.style.height = `${ch * s}px`;
  };

  /** Drawing and sprite top at a moment of the gesture; the panel follows from these alone. */
  const pose = (ms: number): { id: string; top: number } => {
    const { s, h, ground } = geo;
    const registered = (id: string) => ground - frameOf(id).soleY * s;
    const boil = (ids: string[], fps: number, at: number) => ids[Math.floor((Math.max(0, at) / 1000) * fps) % ids.length];
    let at = ms;
    const [reveal, lift, hold, lower] = phases;
    if (at < reveal || at >= total - phases[4]) {
      // Diego comes up from below the clipped edge with his palms already on the panel, and goes back.
      const k = at < reveal ? easeOut(at / reveal) : easeOut(clamp((total - at) / phases[4]));
      const id = boil(door.initialHold, HOLD_FPS, at);
      return { id, top: lerp(h - frameOf(id).contactY * s, registered(id), k) };
    }
    at -= reveal;
    if (at < lift) {
      const ids = door.ascending;
      const id = ids[Math.min(ids.length - 1, Math.floor(easeInOut(at / lift) * ids.length))];
      return { id, top: registered(id) };
    }
    at -= lift;
    if (at < hold) {
      const id = boil(door.hold, HOLD_FPS, at);
      return { id, top: registered(id) };
    }
    at -= hold;
    const ids = door.descending;
    const id = ids[Math.min(ids.length - 1, Math.floor(easeInOut(clamp(at / lower)) * ids.length))];
    return { id, top: registered(id) };
  };

  const render = (ms: number) => {
    const { id, top } = pose(ms);
    if (id !== shown) {
      const img = images.get(id);
      if (img) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        shown = id;
      }
    }
    const edge = top + frameOf(id).contactY * geo.s + OVERLAP;
    const dpr = devicePixelRatio || 1;
    const snap = (v: number) => Math.round(v * dpr) / dpr;
    canvas.style.transform = `translate3d(${snap(geo.x)}px, ${snap(top)}px, 0)`;
    panel.style.transform = `translate3d(0, ${snap(Math.min(0, edge - geo.h))}px, 0)`;
  };

  const finish = (next = LOOP_GAP) => {
    cancelAnimationFrame(raf);
    raf = 0;
    playing = false;
    delete root.dataset.playing;
    panel.style.transform = '';
    canvas.style.transform = '';
    panel.inert = false;
    schedule(next);
  };

  const frame = (now: number) => {
    raf = 0;
    if (!playing) return;
    // A hidden tab or a long frame does not jump the gesture forward.
    clock += clamp(now - last, 0, 64);
    last = now;
    if (clock >= total) return finish();
    render(clock);
    raf = requestAnimationFrame(frame);
  };

  const play = () => {
    if (!ready || reduce.matches) return;
    clearTimeout(autoTimer);
    measure();
    // The moving links leave the tab order while they travel, and come back as soon as it closes.
    panel.inert = true;
    playing = true;
    root.dataset.playing = '';
    clock = 0;
    shown = '';
    render(0);
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const load = () => {
    if (loading) return loading;
    measure();
    const need = ch * geo.s * Math.min(devicePixelRatio || 1, 2);
    const tier = need > door.tiers.sm[1] * 1.1 ? 'lg' : 'sm';
    [canvas.width, canvas.height] = door.tiers[tier];
    const ids = Object.keys(door.frames);
    loading = Promise.all(
      ids.map(async (id) => {
        const img = new Image();
        img.src = `/door/${tier}/${id}.webp`;
        await img.decode();
        return [id, img] as const;
      }),
    ).then((pairs) => {
      images = new Map(pairs);
      ready = true;
      schedule(FIRST_DELAY);
    });
    return loading;
  };

  /** Not while someone is reading, selecting or about to use the contact links. */
  const busy = () => {
    const sel = getSelection();
    return (
      root.contains(document.activeElement) ||
      (sel && !sel.isCollapsed && sel.anchorNode && root.contains(sel.anchorNode)) ||
      performance.now() - lastPointer < 2500
    );
  };

  const schedule = (delay: number) => {
    clearTimeout(autoTimer);
    if (!ready || !inView || playing || reduce.matches) return;
    autoTimer = window.setTimeout(function attempt() {
      if (!inView || playing) return;
      if (busy() || document.hidden) {
        autoTimer = window.setTimeout(attempt, 1500);
        return;
      }
      play();
    }, delay);
  };

  root.addEventListener(
    'pointerdown',
    () => {
      lastPointer = performance.now();
      if (playing) finish();
    },
    { passive: true },
  );

  // Start fetching the drawings a little before the section arrives.
  new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && !reduce.matches) load();
    },
    { rootMargin: '800px 0px' },
  ).observe(root);

  new IntersectionObserver(
    ([e]) => {
      const enough = e.intersectionRect.height >= 0.6 * Math.min(e.boundingClientRect.height, innerHeight);
      if (playing && !e.isIntersecting) finish();
      if (enough !== inView) {
        inView = enough;
        schedule(FIRST_DELAY);
      }
    },
    { threshold: Array.from({ length: 11 }, (_, i) => i / 10) },
  ).observe(root);

  new ResizeObserver(() => {
    measure();
    if (playing) render(clock);
  }).observe(root);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) last = performance.now();
  });
  reduce.addEventListener('change', () => {
    if (reduce.matches) finish();
    else load().then(() => schedule(FIRST_DELAY));
  });

  if (import.meta.env.DEV) {
    // Frame-by-frame inspection from the console: __door.seek(ms), __door.finish().
    Object.assign(window, {
      __door: {
        total,
        seek: async (ms: number) => {
          await load();
          clearTimeout(autoTimer);
          if (!playing) play();
          cancelAnimationFrame(raf);
          raf = 0;
          clock = ms;
          render(ms);
          return pose(ms).id;
        },
        finish,
      },
    });
  }
}
