import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import { privateRoutes } from '@/lib/catalogue';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', ...privateRoutes.map((p) => '/' + p)],
    },
    sitemap: [siteUrl + '/sitemap.xml', siteUrl + '/image-sitemap.xml'],
  };
}

export const dynamic = 'force-static';
