import { articles } from '@/lib/catalogue';
import { siteUrl } from '@/lib/seo';
export const dynamic = 'force-static';
const escape = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
export function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>NEVIE-GLOBAL UK Insights</title><link>${siteUrl}/blog</link><description>Technology perspectives from NEVIE-GLOBAL UK.</description><language>en-gb</language>${articles.map((a) => `<item><title>${escape(a.title)}</title><link>${siteUrl}/blog/${a.id}</link><guid>${siteUrl}/blog/${a.id}</guid><description>${escape(a.description)}</description></item>`).join('')}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
}
