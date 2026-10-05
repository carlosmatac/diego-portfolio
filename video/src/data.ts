/**
 * The route shown in the film. Only facts already on the site (src/data/facts.ts): places in order and the
 * years the site states. Bologna has no year on the site, so it has none here either.
 */
export interface Stop {
  id: string;
  name: string;
  lonLat: [number, number];
  line: string;
  year?: string;
  /** Label side next to the dot. */
  side: 'left' | 'right';
}

export const stops: Stop[] = [
  { id: 'granada', name: 'Granada', lonLat: [-3.5986, 37.1773], line: 'Where he was born', side: 'left' },
  { id: 'madrid', name: 'Madrid', lonLat: [-3.7038, 40.4168], line: 'Universidad Carlos III de Madrid', year: '2020', side: 'right' },
  { id: 'berkeley', name: 'Berkeley', lonLat: [-122.2727, 37.8716], line: 'University of California, Berkeley', year: '2022', side: 'right' },
  { id: 'bologna', name: 'Bologna', lonLat: [11.3426, 44.4949], line: 'Università di Bologna', side: 'right' },
  { id: 'bruges', name: 'Bruges', lonLat: [3.2247, 51.2093], line: 'College of Europe', year: '2025', side: 'right' },
  { id: 'boston', name: 'Boston', lonLat: [-71.0589, 42.3601], line: 'The Fletcher School and Harvard Kennedy School', year: '2026', side: 'left' },
];

export const FPS = 30;

/**
 * Timeline in frames. Each leg: the camera starts moving at `move`, the line is drawn from `draw` to `arrive`,
 * and the caption for the destination rises at `arrive`.
 */
export const legs = [
  { to: 1, move: 60, draw: 66, arrive: 104 },
  { to: 2, move: 164, draw: 178, arrive: 256 },
  { to: 3, move: 316, draw: 330, arrive: 408 },
  { to: 4, move: 468, draw: 478, arrive: 524 },
  { to: 5, move: 584, draw: 596, arrive: 672 },
];

export const OUTRO = 732;
export const DURATION = 860;
