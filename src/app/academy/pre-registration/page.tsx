
import { getTranslations } from 'next-intl/server';
import { SitePageHtml } from '@/components/site-page-html';
import { AcademyShell } from '@/features/academy/shell';
import { PageHero } from '@/features/academy/ui';
import { PreRegisterForm } from '@/features/academy/pre-register-form';
import { getProgrammes } from '@/server/academy';
import { getPageMetadata } from '@/server/site-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const t = await getTranslations('PreRegistrationPage');

  return getPageMetadata(
    'academy-pre-registration',
    {
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
    '/academy/pre-registration',
  );
}

export default async function PreRegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ programme?: string; session?: string }>;
}) {
  const { programme, session } = await searchParams;
  const programmes = await getProgrammes();
  const t = await getTranslations('PreRegistrationPage');

  return (
    <AcademyShell>
      <PageHero
        crumb={t('breadcrumb')}
        title={t('title')}
        sub={t('subtitle')}
      />
      <section>
        <div className="nv-wrap">
          <SitePageHtml pageKey="academy-pre-registration" />
          <PreRegisterForm
            programmes={programmes}
            initialProgramme={programme}
            initialSession={session}
          />
        </div>
      </section>
    </AcademyShell>
  );
}
