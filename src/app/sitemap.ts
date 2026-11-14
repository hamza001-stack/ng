import type { MetadataRoute } from 'next';
import { routes, products, articles, privateRoutes } from '@/lib/catalogue';
import { cachedCourses } from '@/server/site-content';
import { getProgrammes } from '@/server/academy';
import { siteUrl } from '@/lib/seo';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, programmes] = await Promise.all([cachedCourses(), getProgrammes()]);
  return [
    '',
    'projects',
    ...routes.filter((r) => !privateRoutes.includes(r)),
    ...products.map((p) => 'marketplace/' + p.id),
    'academy/courses',
    'academy/pricing',
    'academy/schedule',
    'academy/pre-registration',
    'academy/enrol',
    ...programmes.map((p) => 'academy/courses/' + p.id),
    ...courses.map((c) => 'academy/' + c.id),
    ...articles.map((a) => 'blog/' + a.id),
  ].map((path) => ({
    url: siteUrl + '/' + path,
    changeFrequency: 'monthly',
    priority: path ? 0.7 : 1,
    alternates: {
      languages: {
        'en-GB': siteUrl + '/' + path,
        'x-default': siteUrl + '/' + path,
      },
    },
  }));
}

export const revalidate = 3600;
