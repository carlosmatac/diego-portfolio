const doc = document.documentElement;
const header = document.querySelector<HTMLElement>('[data-header]');
const inner = header?.querySelector<HTMLElement>('[data-brand-inner]');
const row = header?.querySelector<HTMLElement>('[data-row]');
const nav = header?.querySelector<HTMLElement>('[data-nav]');

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

if (header && inner && row) init(header, inner, row);

function init(header: HTMLElement, inner: HTMLElement, row: HTMLElement) {
  const scrub = doc.dataset.brand === 'big';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let geo = { x0: 0, y0: 0, x1: 0, y1: 0, lnS: 0 };
  let ticking = false;
  let lastTheme = '';

  const measure = () => {
    inner.style.transform = '';
    const r = inner.getBoundingClientRect();
    const f0 = parseFloat(getComputedStyle(inner).fontSize);
    const final = parseFloat(getComputedStyle(doc).getPropertyValue('--brand-final')) || 26;
    const s = final / f0;
    const gutter = parseFloat(getComputedStyle(header).paddingLeft);
    geo = { x0: r.left, y0: r.top, x1: gutter, y1: (header.offsetHeight - row.offsetHeight * s) / 2, lnS: Math.log(s) };
  };

  const theme = () => {
    const probe = document.elementsFromPoint(innerWidth / 2, header.offsetHeight + 3);
    const surface = probe.map((e) => e.closest('.surface-dark, .surface-stone, .surface-light')).find(Boolean);
    const t = surface?.classList.contains('surface-dark') ? 'dark' : surface?.classList.contains('surface-stone') ? 'stone' : 'light';
    if (t !== lastTheme) {
      header.dataset.theme = t;
      lastTheme = t;
    }
  };

  const update = () => {
    ticking = false;
    if (scrub) {
      const t = clamp(scrollY / (innerHeight * 0.62));
      const e = smooth(t);
      inner.style.transform = `translate3d(${lerp(geo.x0, geo.x1, e).toFixed(2)}px, ${lerp(geo.y0, geo.y1, e).toFixed(2)}px, 0) scale(${Math.exp(geo.lnS * e).toFixed(5)})`;
      const alpha = smooth(clamp((t - 0.72) / 0.28));
      header.style.setProperty('--u', clamp(t / 0.62).toFixed(4));
      header.style.setProperty('--bg-alpha', alpha.toFixed(3));
      header.style.setProperty('--nav-alpha', alpha.toFixed(3));
      nav?.toggleAttribute('data-hidden', alpha < 0.4);
      header.dataset.state = t <= 0.002 ? 'big' : t >= 0.995 ? 'docked' : 'moving';
      if (t > 0.02) doc.dataset.nameState = 'in';
    }
    theme();
  };

  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  if (scrub) {
    measure();
    addEventListener('resize', () => {
      measure();
      request();
    });
    document.fonts?.ready.then(() => {
      measure();
      request();
    });
  } else if (!reduce.matches) {
    // Inner pages: Prados slips out from behind Diego once on load.
    header.dataset.state = 'moving';
    setTimeout(() => (header.dataset.state = 'docked'), 350);
  } else {
    header.dataset.state = 'docked';
  }

  addEventListener('scroll', request, { passive: true });
  addEventListener('load', request);
  request();

  // Current section marker for the in-page links on the home page.
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const targets = links.map((a) => document.getElementById(a.dataset.navLink!)).filter(Boolean) as HTMLElement[];
  if (targets.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          links.forEach((a) =>
            a.dataset.navLink === e.target.id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'),
          );
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    targets.forEach((t) => spy.observe(t));
  }
}
