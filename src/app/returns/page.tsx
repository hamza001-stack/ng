import { LegalLayout } from '@/features/legal/legal-layout';
import { OfficialSourceNote } from '@/features/legal/official-source';
import { legalEntity } from '@/lib/legal';
import { metadata as makeMetadata } from '@/lib/seo';

const entity = legalEntity();

export const metadata = makeMetadata(
  'Returns',
  `Returns process for ${entity.name}.`,
  '/returns',
);

export default function ReturnsPage() {
  return (
    <LegalLayout title="Returns" kicker="LEGAL / FULFILMENT">
      <OfficialSourceNote />
      <p>No returns page is published on nevie-global.com. The process below applies to this UK shop.</p>
      <p>
        Physical goods may be returned unused, in original packaging, within 14 days of
        delivery. You pay return postage unless the item is faulty.
      </p>
      <p>
        Digital products cannot be “posted back”. Cancellation follows the refund policy once
        supply has started with your consent.
      </p>
      <p>Arrange a return via {entity.email} before sending anything.</p>
    </LegalLayout>
  );
}
