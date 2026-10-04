/** Server-only environment access (works in `astro dev`, build and Vercel functions). */
export function env(name: string): string | undefined {
  return (import.meta.env as Record<string, string | undefined>)[name] ?? process.env[name];
}

export function requireEnv(name: string): string {
  const v = env(name);
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}
