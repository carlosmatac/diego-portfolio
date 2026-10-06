import sketches from '../config/sketches.json';

/**
 * Line boil for the pencil sketches (Sketch.astro): the three drawings of each object are shown in
 * the order of sketches.json at its fps. Only sketches in view and fully decoded move; reduced
 * motion keeps the first drawing.
 */
const els = [...document.querySelectorAll<HTMLElement>('[data-boil]')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const order = sketches.sequence.map((n) => n - 1);
const stepMs = 1000 / sketches.fps;

interface Boil {
  imgs: HTMLImageElement[];
  ready: boolean;
  visible: boolean;
  shown: number;
}

const boils = new Map<Element, Boil>();
let step = 0;
let last = 0;
let raf = 0;

const show = (b: Boil, k: number) => {
  if (k === b.shown) return;
  b.imgs[b.shown].style.opacity = '0';
  b.imgs[k].style.opacity = '1';
  b.shown = k;
};

const active = () => !reduce.matches && !document.hidden && [...boils.values()].some((b) => b.ready && b.visible);

const tick = (t: number) => {
  raf = 0;
  if (!active()) return;
  if (t - last >= stepMs) {
    last = t;
    step = (step + 1) % order.length;
    for (const b of boils.values()) if (b.ready && b.visible) show(b, order[step]);
  }
  raf = requestAnimationFrame(tick);
};

const wake = () => {
  if (!raf && active()) raf = requestAnimationFrame(tick);
};

if (els.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const b = boils.get(e.target)!;
        b.visible = e.isIntersecting;
        if (b.visible && !b.ready) {
          Promise.all(b.imgs.map((i) => i.decode()))
            .then(() => {
              b.ready = true;
              wake();
            })
            .catch(() => {});
        }
      }
      wake();
    },
    { rootMargin: '120px 0px' },
  );
  for (const el of els) {
    if (boils.has(el)) continue;
    boils.set(el, { imgs: [...el.querySelectorAll('img')], ready: false, visible: false, shown: 0 });
    io.observe(el);
  }
  document.addEventListener('visibilitychange', wake);
  reduce.addEventListener('change', () => {
    if (reduce.matches) for (const b of boils.values()) show(b, 0);
    wake();
  });
}
