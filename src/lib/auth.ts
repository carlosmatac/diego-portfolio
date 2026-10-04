import { requireEnv } from './env';

export const COOKIE = 'dp_session';
const MAX_AGE = 60 * 60 * 24 * 7;
const enc = new TextEncoder();

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function hmac(data: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(requireEnv('SESSION_SECRET')), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Constant-time comparison of two strings through their SHA-256 digests. */
async function safeEqual(a: string, b: string) {
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const xa = new Uint8Array(x);
  const ya = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < xa.length; i++) diff |= xa[i] ^ ya[i];
  return diff === 0;
}

export const checkPassword = (input: string) => safeEqual(input, requireEnv('ADMIN_PASSWORD'));

export async function createSession() {
  const payload = b64url(enc.encode(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })));
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySession(token: string | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !(await safeEqual(sig, await hmac(payload)))) return false;
  try {
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  sameSite: 'strict' as const,
  secure,
  path: '/',
  maxAge: MAX_AGE,
});
