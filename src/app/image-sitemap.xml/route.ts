import { siteUrl } from '@/lib/seo';
export const dynamic = 'force-static';
export function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><url><loc>${siteUrl}/</loc><image:image><image:loc>${siteUrl}/brand/logo.webp</image:loc></image:image></url></urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
