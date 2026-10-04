import { defineMiddleware } from 'astro:middleware';
import { COOKIE, verifySession } from './lib/auth';

const isAdminPage = (p: string) => p === '/admin' || p.startsWith('/admin/');
const isAdminApi = (p: string) => p.startsWith('/api/admin/');
const open = new Set(['/admin/login', '/api/admin/login']);

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  if (!isAdminPage(pathname) && !isAdminApi(pathname)) return next();

  // State-changing requests must come from this very site.
  if (!['GET', 'HEAD'].includes(ctx.request.method)) {
    const origin = ctx.request.headers.get('origin');
    if (!origin || new URL(origin).host !== ctx.url.host) return new Response('Forbidden', { status: 403 });
  }

  if (!open.has(pathname) && !(await verifySession(ctx.cookies.get(COOKIE)?.value))) {
    return isAdminApi(pathname)
      ? new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
      : ctx.redirect('/admin/login');
  }

  const res = await next();
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
});
