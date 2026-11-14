
import { getTranslations, getLocale } from 'next-intl/server';
import { SitePageHtml } from '@/components/site-page-html';
import { AcademyShell } from '@/features/academy/shell';
import { CourseBrowser } from '@/features/academy/course-browser';
import { PageHero } from '@/features/academy/ui';
import { getProgrammes } from '@/server/academy';
import { getPageMetadata } from '@/server/site-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const t = await getTranslations('CoursesPage');

  return getPageMetadata(
    'academy-courses',
    {
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
    '/academy/courses',
  );
}

export default async function CoursesPage() {
  const locale = (await getLocale()) === 'fr' ? 'fr' : 'en';
  const programmes = await getProgrammes(locale);
  const t = await getTranslations('CoursesPage');

  return (
    <AcademyShell>
      <PageHero
        crumb={t('breadcrumb')}
        title={t('title')}
        sub={t('subtitle')}
      />
      <section>
        <div className="nv-wrap">
          <SitePageHtml pageKey="academy-courses" />
          <CourseBrowser programmes={programmes} />
        </div>
      </section>
    </AcademyShell>
  );
}
