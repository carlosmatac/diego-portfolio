import type { LogoId } from './facts';

/** Intrinsic ratio and display height of each official logo, so nothing shifts while it loads. */
export const logos: Record<LogoId, { file: string; w: number; h: number; height: number; blend?: boolean }> = {
  uc3m: { file: 'uc3m.svg', w: 842, h: 303, height: 58 },
  berkeley: { file: 'berkeley.svg', w: 225, h: 42, height: 34 },
  bologna: { file: 'bologna.png', w: 314, h: 314, height: 84, blend: true },
  garrigues: { file: 'garrigues.svg', w: 200, h: 23.557, height: 24 },
  maec: { file: 'maec.svg', w: 2546, h: 531, height: 52 },
  fletcher: { file: 'fletcher.svg', w: 410, h: 48, height: 30 },
  areces: { file: 'areces.png', w: 251, h: 70, height: 34, blend: true },
};
