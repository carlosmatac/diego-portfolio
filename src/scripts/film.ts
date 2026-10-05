/**
 * Route film in the Studies section. Loads only when close to the viewport, plays once when visible,
 * pauses off screen, and rests on its last frame (the poster). Reduced motion: never autoplays.
 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

for (const fig of document.querySelectorAll<HTMLElement>('[data-film]')) {
  const video = fig.querySelector('video')!;
  const button = fig.querySelector<HTMLButtonElement>('[data-film-toggle]')!;
  const labels = {
    play: fig.querySelector<HTMLElement>('[data-label-play]')!,
    pause: fig.querySelector<HTMLElement>('[data-label-pause]')!,
    replay: fig.querySelector<HTMLElement>('[data-label-replay]')!,
  };
  const tall = matchMedia(fig.dataset.tallMedia!);
  let userPaused = false;
  let inView = false;

  const setState = (state: 'play' | 'pause' | 'replay') => {
    button.dataset.state = state;
    for (const [k, el] of Object.entries(labels)) el.hidden = k !== state;
  };

  const load = () => {
    const src = tall.matches ? video.dataset.tall! : video.dataset.wide!;
    if (video.getAttribute('src') !== src) {
      video.src = src;
      video.load();
    }
  };

  const play = () => {
    load();
    video.play().catch(() => setState('play'));
  };

  video.addEventListener('playing', () => {
    fig.dataset.playing = '';
    setState('pause');
  });
  video.addEventListener('pause', () => {
    if (!video.ended) setState('play');
  });
  video.addEventListener('ended', () => setState('replay'));

  button.addEventListener('click', () => {
    if (button.dataset.state === 'pause') {
      userPaused = true;
      video.pause();
    } else {
      userPaused = false;
      if (video.ended) video.currentTime = 0;
      play();
    }
  });

  tall.addEventListener('change', () => {
    delete fig.dataset.playing;
    video.removeAttribute('src');
    video.load();
    setState('play');
    if (inView && !reduce.matches && !userPaused) play();
  });

  button.hidden = false;
  setState('play');

  new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting;
      if (inView && !reduce.matches && !userPaused && !video.ended) play();
      else if (!inView && !video.paused) video.pause();
    },
    { threshold: 0.45 },
  ).observe(fig);
}
