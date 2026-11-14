import { AcademyShell } from '@/features/academy/shell';
import { StatusForm } from '@/features/academy/status-form';
import { PageHero } from '@/features/academy/ui';
import { getPageMetadata } from '@/server/site-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPageMetadata(
    'academy-status',
    { title: 'Track Your Application — NEVIE Academy', description: 'Check the status of your NEVIE Academy enrolment request.' },
    '/academy/status',
    true,
  );
}

export default function StatusPage() {
  return (
    <AcademyShell>
      <PageHero crumb="My application" title="Track your application" sub="Enter the reference from your confirmation email." />
      <section>
        <div className="nv-wrap">
          <StatusForm />
        </div>
      </section>
    </AcademyShell>
  );
}
