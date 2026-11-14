import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PageHead } from '@/components/page-head';
import { LazyPlayer } from '@/features/lazy-player';
import { JsonLd, metadata, siteUrl } from '@/lib/seo';
import { getAcademyCourse } from '@/server/site-content';

// Courses come from the CmsCourse / CmsLesson tables (falls back to src/lib/catalogue.ts),
// so any course added to the database gets its own page without a rebuild.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getAcademyCourse(id);
  return c
    ? metadata(c.title, c.description, '/academy/' + id)
    : { title: 'Course not found' };
}

export default async function Course({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getAcademyCourse(id);
  if (!c) notFound();
  return (
    <>
      <PageHead
        title={c.title}
        description={c.description}
        path={'/academy/' + id}
        eyebrow={'ACADEMY / ' + c.category.toUpperCase()}
      />
      <div className="container page-body">
        <p>
          <Link className="text-link" href="/academy/courses">
            <ArrowLeft size={16} /> All courses
          </Link>
        </p>
        <Suspense fallback={<p>Loading curriculum…</p>}>
          <LazyPlayer course={c} />
        </Suspense>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: c.title,
          description: c.description,
          inLanguage: 'en-GB',
          isAccessibleForFree: true,
          provider: {
            '@type': 'Organization',
            name: 'NEVIE-GLOBAL UK',
            url: siteUrl,
          },
          url: siteUrl + '/academy/' + id,
        }}
      />
    </>
  );
}
