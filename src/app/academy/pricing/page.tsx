import { SitePageHtml } from '@/components/site-page-html';
import { AcademyShell } from '@/features/academy/shell';
import { PageHero, PlansGrid } from '@/features/academy/ui';
import { getProgrammes } from '@/server/academy';
import { getPageMetadata } from '@/server/site-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPageMetadata(
    'academy-pricing',
    {
      title: 'Academy Prices — One-off, No Subscriptions',
      description: 'Clear, one-off prices for every NEVIE Academy programme. Pre-registration is free and no payment is taken until your place is confirmed.',
    },
    '/academy/pricing',
  );
}

export default async function PricingPage() {
  const programmes = await getProgrammes();
  return (
    <AcademyShell>
      <PageHero crumb="Prices" title="Prices" sub="Clear, one-off prices for every programme." />
      <section>
        <div className="nv-wrap">
          <SitePageHtml pageKey="academy-pricing" />
          <PlansGrid programmes={programmes} />
          <p className="nv-muted" style={{ marginTop: 26, fontSize: 13 }}>
            Prices are per learner. Pre-registration is free and no payment is taken until your place is confirmed.
          </p>
        </div>
      </section>
    </AcademyShell>
  );
}
