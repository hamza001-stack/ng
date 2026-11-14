import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const staticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === 'true';
const config = {
  poweredByHeader: false,
  output: staticPreview ? 'export' : 'standalone',
  ...(staticPreview ? { trailingSlash: true } : {}),
  images: { formats: ['image/avif', 'image/webp'], unoptimized: staticPreview },
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-table', 'recharts'],
  },
  ...(!staticPreview
    ? {
        async redirects() {
          return [
            { source: '/orders', destination: '/dashboard/orders', permanent: false },
            { source: '/my-account', destination: '/dashboard/profile', permanent: false },
            { source: '/downloads', destination: '/dashboard/downloads', permanent: false },
            { source: '/certificates', destination: '/dashboard/downloads', permanent: false },
            { source: '/invoices', destination: '/dashboard/payments', permanent: false },
            { source: '/settings', destination: '/dashboard/profile', permanent: false },
            { source: '/subscriptions', destination: '/dashboard/subscriptions', permanent: false },
          ];
        },
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                {
                  key: 'Referrer-Policy',
                  value: 'strict-origin-when-cross-origin',
                },
                { key: 'X-Frame-Options', value: 'DENY' },
                {
                  key: 'Permissions-Policy',
                  value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
                },
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ],
            },
          ];
        },
      }
    : {}),
};
const nextConfig = (phase) =>
  withNextIntl({
    ...config,
    distDir: phase === 'phase-development-server' ? '.next-dev' : '.next',
  });

export default nextConfig;
