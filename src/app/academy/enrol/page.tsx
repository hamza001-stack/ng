import { getTranslations } from 'next-intl/server';
import { AcademyShell } from '@/features/academy/shell';
import { EnrolForm } from '@/features/academy/enrol-form';
import { PageHero } from '@/features/academy/ui';
import { getProgrammes } from '@/server/academy';
import { getPageMetadata } from '@/server/site-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPageMetadata(
    'academy-enrol',
    { title: 'Request a Place — NEVIE Academy', description: 'Request a place on a NEVIE Academy programme and start date. No payment today.' },
    '/academy/enrol',
  );
}

export default async function EnrolPage({ searchParams }: { searchParams: Promise<{ programme?: string; session?: string }> }) {
  const { programme, session } = await searchParams;
  const programmes = await getProgrammes();
  return (
    <AcademyShell>
      <PageHero crumb="Enrol" title="Request a place" sub="Choose your programme and start date. We review every request and email you the decision. No payment today." />
      <section>
        <div className="nv-wrap">
          <EnrolForm programmes={programmes} initialProgramme={programme} initialSession={session} />
        </div>
      </section>
    </AcademyShell>
  );
}
