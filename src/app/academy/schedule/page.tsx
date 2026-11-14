import { SitePageHtml } from '@/components/site-page-html';
import { AcademyShell } from '@/features/academy/shell';
import { PageHero, ScheduleTable } from '@/features/academy/ui';
import { getProgrammes } from '@/server/academy';
import { getPageMetadata } from '@/server/site-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPageMetadata(
    'academy-schedule',
    {
      title: 'Academy Start Dates — Upcoming Sessions',
      description: 'Upcoming NEVIE Academy start dates, class times and seat availability across all programmes.',
    },
    '/academy/schedule',
  );
}

export default async function SchedulePage() {
  const programmes = await getProgrammes();
  return (
    <AcademyShell>
      <PageHero crumb="Start dates" title="Start dates" sub="Upcoming sessions across all programmes." />
      <section>
        <div className="nv-wrap">
          <SitePageHtml pageKey="academy-schedule" />
          <ScheduleTable programmes={programmes} />
        </div>
      </section>
    </AcademyShell>
  );
}
