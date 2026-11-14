import { LegalLayout } from '@/features/legal/legal-layout';
import { OfficialSourceNote } from '@/features/legal/official-source';
import { legalEntity } from '@/lib/legal';
import { metadata as makeMetadata } from '@/lib/seo';

const entity = legalEntity();

export const metadata = makeMetadata(
  'Refunds',
  `Refund policy for ${entity.name}.`,
  '/refunds',
);

export default function RefundsPage() {
  return (
    <LegalLayout title="Refund Policy" kicker="LEGAL / CONSUMER">
      <OfficialSourceNote pages={['legalNotice']} />
      <p>
        The group site publishes a one-click retraction protocol on Mentions légales. UK consumer
        cancellation for this platform follows UK law below. A dedicated refund policy is not
        published on nevie-global.com.
      </p>
      <p>
        If you buy as a consumer, the Consumer Rights Act 2015 and Consumer Contracts
        Regulations 2013 apply. Digital content that is not of satisfactory quality may be
        repaired, replaced or refunded.
      </p>
      <h2>How refunds are paid</h2>
      <p>
        Refunds are issued to the original Stripe payment method. Status on the order becomes
        Refunded or Partially refunded when Stripe confirms the refund.
      </p>
      <h2>How to ask</h2>
      <p>
        Email {entity.email} with your order ID within 14 days of delivery or of download for
        digital goods, unless a legal exception applies (for example you asked us to start
        digital supply immediately and acknowledged that you lose the 14-day cancellation
        right).
      </p>
    </LegalLayout>
  );
}
