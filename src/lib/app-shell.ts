const AUTH = new Set([
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
]);

const PUBLIC_ROOTS = new Set([
  'about',
  'services',
  'solutions',
  'industries',
  'ai',
  'ai-agents',
  'automation',
  'software-development',
  'mobile-app-development',
  'web-development',
  'cloud',
  'blockchain',
  'academy',
  'marketplace',
  'products',
  'pricing',
  'portfolio',
  'case-studies',
  'resources',
  'documentation',
  'blog',
  'support',
  'faq',
  'contact',
  'partners',
  'investors',
  'cart',
  'checkout',
  'orders',
  'dashboard',
  'my-account',
  'downloads',
  'certificates',
  'privacy',
  'cookies',
  'terms',
  'legal',
  'wishlist',
  'invoices',
  'settings',
  'subscriptions',
  'gdpr',
  'shipping',
  'returns',
  'refunds',
  'sign-in',
  'sign-up',
  'forgot-password',
  'reset-password',
]);

const SECRET = /^[A-Za-z0-9_-]{12,64}$/;

/** True when the URL is an account or console surface — never the public storefront. */
export function isAppShell(pathname: string) {
  if (AUTH.has(pathname) || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return true;
  }
  const segment = pathname.split('/').filter(Boolean)[0] || '';
  if (!segment || PUBLIC_ROOTS.has(segment)) return false;
  return SECRET.test(segment);
}
