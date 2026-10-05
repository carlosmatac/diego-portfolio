/**
 * Studies as a pile of sheets. The section pins; for each sheet the page scroll first moves its content (if it is
 * taller than the sheet), then lifts the sheet away while the ones behind come forward. Off with reduced motion,
 * where the stages read as a plain list (and without JS, same thing).
 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const wide = matchMedia('(min-width: 900px)');
const DEPTH = 3;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => 1 - (1 - t) ** 3;

for (const deck of document.querySelectorAll<HTMLElement>('[data-deck]')) init(deck);

function init(deck: HTMLElement) {
  const view = deck.querySelector<HTMLElement>('[data-deck-view]')!;
  const cards = [...deck.querySelectorAll<HTMLElement>('[data-card]')];
  let segs: { start: number; read: number; leave: number }[] = [];
  let total = 0;
  let on = false;
  let ticking = false;

  const inner = (card: HTMLElement) =>
    card.querySelector<HTMLElement>(wide.matches ? '[data-card-scroll]' : '[data-card-body]')!;
  const movers = (card: HTMLElement) => card.querySelectorAll<HTMLElement>('[data-card-scroll], [data-card-body]');
  const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56;

  const measure = () => {
    if (!on) return;
    let start = 0;
    segs = cards.map((card, i) => {
      movers(card).forEach((el) => (el.style.transform = ''));
      const el = inner(card);
      const pad = parseFloat(getComputedStyle(card).paddingBottom);
      const read = Math.max(0, Math.ceil(el.offsetTop + el.offsetHeight + pad - card.clientHeight));
      const leave = i < cards.length - 1 ? Math.round(card.offsetHeight * 0.9) : 0;
      const seg = { start, read, leave };
      start += read + leave;
      return seg;
    });
    total = start;
    deck.style.height = `${total + view.offsetHeight}px`;
    update();
  };

  const update = () => {
    ticking = false;
    if (!on) return;
    const s = clamp(headerH() - deck.getBoundingClientRect().top, 0, total);
    const peek = parseFloat(getComputedStyle(deck).getPropertyValue('--peek')) || 14;
    const local = segs.map((g) => s - g.start);
    const lift = segs.map((g, i) => (g.leave ? clamp((local[i] - g.read) / g.leave) : 0));
    let front = lift.findIndex((t) => t < 1);
    if (front < 0) front = cards.length - 1;
    const p = front + lift[front];

    cards.forEach((card, i) => {
      inner(card).style.transform = `translate3d(0, ${-clamp(local[i], 0, segs[i].read)}px, 0)`;
      if (i <= front) {
        const t = ease(lift[i]);
        const away = card.offsetHeight + card.offsetTop + 80;
        card.style.transform = `translate3d(0, ${(-t * away).toFixed(1)}px, 0) rotate(${(-2.5 * t).toFixed(3)}deg)`;
        card.style.opacity = '1';
        card.style.visibility = lift[i] >= 1 ? 'hidden' : '';
      } else {
        const d = Math.min(i - p, DEPTH + 1);
        card.style.transform = `translate3d(0, ${(-Math.min(d, DEPTH) * peek).toFixed(1)}px, 0) scale(${(1 - Math.min(d, DEPTH) * 0.035).toFixed(4)})`;
        card.style.opacity = String(clamp(DEPTH + 1 - d));
        card.style.visibility = '';
      }
    });
  };

  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  const enable = () => {
    on = true;
    deck.classList.add('deck-on');
    cards.forEach((card, i) => {
      card.style.zIndex = String(cards.length - i);
      card.classList.toggle('surface-stone', i % 2 === 1);
    });
    measure();
  };

  const disable = () => {
    on = false;
    deck.classList.remove('deck-on');
    deck.style.height = '';
    cards.forEach((card) => {
      card.classList.remove('surface-stone');
      card.removeAttribute('style');
      movers(card).forEach((el) => (el.style.transform = ''));
    });
  };

  const apply = () => (reduce.matches ? disable() : enable());

  // Keyboard users: bring the sheet (and the part of it) holding the focused element to the front.
  deck.addEventListener('focusin', (e) => {
    if (!on) return;
    const i = cards.findIndex((c) => c.contains(e.target as Node));
    if (i < 0) return;
    const el = inner(cards[i]);
    const target = (e.target as HTMLElement).getBoundingClientRect().top - el.getBoundingClientRect().top;
    const offset = clamp(target - cards[i].clientHeight * 0.4, 0, segs[i].read);
    const deckTop = deck.getBoundingClientRect().top + scrollY - headerH();
    cards[i].scrollTop = 0;
    scrollTo({ top: deckTop + segs[i].start + offset, behavior: 'instant' });
  });

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', measure);
  wide.addEventListener('change', measure);
  reduce.addEventListener('change', apply);
  new ResizeObserver(measure).observe(view);
  document.fonts?.ready.then(measure);
  apply();
}

export {};
