const VALID = /^[A-Za-z0-9_-]{12,64}$/;

/**
 * Public URL segment for the admin console. Production refuses to expose the
 * console on the guessable `/admin` path; without a valid ADMIN_PATH it is unreachable.
 */
export function adminSegment(): string | null {
  const raw = (process.env.ADMIN_PATH || '').trim().replace(/^\/+|\/+$/g, '');
  if (raw && raw.toLowerCase() !== 'admin' && VALID.test(raw)) return raw;
  return process.env.NODE_ENV === 'production' ? null : 'admin';
}

export function adminBase() {
  const segment = adminSegment();
  return segment ? `/${segment}` : null;
}

export function adminHref(href: string, base: string) {
  if (href === '/admin' || href.startsWith('/admin/') || href.startsWith('/admin?')) {
    return base + href.slice('/admin'.length);
  }
  return href;
}
