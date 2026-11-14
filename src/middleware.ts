import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { adminSegment } from '@/lib/admin-path';

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.ingest.sentry.io https://challenges.cloudflare.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  'object-src none',
  'upgrade-insecure-requests',
].join('; ');

function applySecurity(response: NextResponse, request: NextRequest) {
  response.headers.set('Content-Language', request.cookies.get('NEXT_LOCALE')?.value === 'fr' ? 'fr' : 'en-GB');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)',
  );
  response.headers.set('Content-Security-Policy', csp);
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }
  return response;
}

const CONSOLE_HEADER = 'x-nevie-console';

function hidden(response: NextResponse, request: NextRequest) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'private, no-store');
  return applySecurity(response, request);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionCookie(request);
  const segment = adminSegment();

  if (/^\/admin(\/|$)/i.test(pathname) && segment !== 'admin') {
    const viaConsole = segment !== null && request.headers.get(CONSOLE_HEADER) === segment;
    return hidden(
      viaConsole ? NextResponse.next() : NextResponse.rewrite(new URL('/__not-found', request.url)),
      request,
    );
  }

  if (segment && (pathname === `/${segment}` || pathname.startsWith(`/${segment}/`))) {
    if (segment === 'admin') return hidden(NextResponse.next(), request);
    const target = request.nextUrl.clone();
    target.pathname = '/admin' + pathname.slice(segment.length + 1);
    const forwarded = new Headers(request.headers);
    forwarded.set(CONSOLE_HEADER, segment);
    return hidden(NextResponse.rewrite(target, { request: { headers: forwarded } }), request);
  }

  if (/^\/(dashboard|my-account|orders|account)(\/|$)/.test(pathname) && !session) {
    const signIn = new URL('/sign-in', request.url);
    signIn.searchParams.set('next', pathname);
    return applySecurity(NextResponse.redirect(signIn), request);
  }

  const response = NextResponse.next();
  if (
    /^\/(dashboard|my-account|orders|checkout|cart|downloads|certificates)/.test(
      pathname,
    )
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return applySecurity(response, request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|products/|brand/|showcase/).*)'],
};
