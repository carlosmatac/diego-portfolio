import type { APIRoute } from 'astro';
import { COOKIE, checkPassword, cookieOptions, createSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  if (!(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 900));
    return redirect('/admin/login?error=1', 303);
  }
  cookies.set(COOKIE, await createSession(), cookieOptions(url.protocol === 'https:'));
  return redirect('/admin', 303);
};
