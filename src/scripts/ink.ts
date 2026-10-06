import { animation } from '../config/animation';

/**
 * Sketch, then ink: section titles marked with data-ink arrive as a boiling pencil outline, get
 * hatched as they scroll up the screen and settle into solid type. It runs once per title (it never
 * un-inks) and not at all with reduced motion. Styles live in global.css under [data-ink-state].
 */
const cfg = animation.ink;
const els = [...document.querySelectorAll<HTMLElement>('[data-ink]')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const SVG = 'http://www.w3.org/2000/svg';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

interface Ink {
  el: HTMLElement;
  turb: SVGElement[];
  disp: SVGElement[];
  progress: number;
  visible: boolean;
  done: boolean;
}

if (els.length && !reduce.matches) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  document.body.append(svg);

  const make = <K extends string>(tag: K, attrs: Record<string, string | number>) => {
    const node = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    return node;
  };

  // Two displaced copies of the outline read as a pencil going over the same letter twice.
  const inks: Ink[] = els.map((el, i) => {
    const filter = make('filter', { id: `ink-${i}`, x: '-4%', y: '-12%', width: '108%', height: '124%' });
    const turb = [0, 1].map((k) =>
      make('feTurbulence', { type: 'fractalNoise', baseFrequency: cfg.noise, numOctaves: 2, seed: cfg.seeds[0][k], result: `n${k}` }),
    );
    const disp = [0, 1].map((k) =>
      make('feDisplacementMap', { in: 'SourceGraphic', in2: `n${k}`, scale: 0, xChannelSelector: 'R', yChannelSelector: 'G', result: `d${k}` }),
    );
    const merge = make('feMerge', {});
    merge.append(make('feMergeNode', { in: 'd0' }), make('feMergeNode', { in: 'd1' }));
    filter.append(turb[0], disp[0], turb[1], disp[1], merge);
    svg.append(filter);
    el.style.setProperty('--ink-filter', `url(#ink-${i})`);
    el.dataset.inkState = 'sketch';
    return { el, turb, disp, progress: 0, visible: false, done: false };
  });

  const paint = (ink: Ink) => {
    const { el } = ink;
    const r = el.getBoundingClientRect();
    const p = Math.max(ink.progress, clamp((innerHeight * cfg.start - r.top) / (innerHeight * cfg.span)));
    ink.progress = p;
    const hatch = smooth(clamp((p - cfg.hatchFrom) / (1 - cfg.hatchFrom)));
    const settle = smooth(clamp((p - cfg.settleFrom) / (1 - cfg.settleFrom)));
    const size = parseFloat(getComputedStyle(el).fontSize);
    const scale = (size * cfg.wobble * (1 - settle)).toFixed(2);
    ink.disp.forEach((d) => d.setAttribute('scale', scale));
    el.style.setProperty('--hatch', hatch.toFixed(3));
    el.style.setProperty('--outline', (1 - settle).toFixed(3));
    if (p >= 1) {
      ink.done = true;
      el.dataset.inkState = 'done';
    }
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    for (const ink of inks) if (ink.visible && !ink.done) paint(ink);
  };
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const ink = inks.find((k) => k.el === e.target)!;
      ink.visible = e.isIntersecting;
      // Titles skipped past (anchor jumps, restored scroll) are simply inked.
      if (!e.isIntersecting && e.boundingClientRect.bottom < 0 && !ink.done) {
        ink.progress = 1;
        paint(ink);
      }
    }
    request();
    wake();
  });
  inks.forEach((k) => io.observe(k.el));
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);

  // Line boil for the outline: the noise seeds change a few times a second, like redrawn frames.
  const order = [0, 1, 2, 1];
  let step = 0;
  let last = 0;
  let raf = 0;
  const live = () => !document.hidden && inks.some((k) => k.visible && !k.done);
  const tick = (t: number) => {
    raf = 0;
    if (!live()) return;
    if (t - last >= 1000 / cfg.fps) {
      last = t;
      step = (step + 1) % order.length;
      const seeds = cfg.seeds[order[step]];
      for (const k of inks) if (k.visible && !k.done) k.turb.forEach((n, j) => n.setAttribute('seed', String(seeds[j])));
    }
    raf = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (!raf && live()) raf = requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', wake);
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    for (const k of inks) {
      k.done = true;
      k.el.dataset.inkState = 'done';
    }
  });
}
