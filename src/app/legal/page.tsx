import { EntityBlock, LegalLayout } from '@/features/legal/legal-layout';
import { GroupLegalFacts, OfficialSourceNote } from '@/features/legal/official-source';
import { legalEntity } from '@/lib/legal';
import { metadata as makeMetadata } from '@/lib/seo';

const entity = legalEntity();

export const metadata = makeMetadata(
  'Company information',
  `Statutory information for ${entity.name}.`,
  '/legal',
);

export default function CompanyLegalPage() {
  return (
    <LegalLayout title="Company information" kicker="LEGAL / STATUTORY">
      <OfficialSourceNote pages={['legalNotice']} />
      <EntityBlock entity={entity} />
      <p>
        {entity.number && entity.office
          ? `${entity.name} is a company registered in the United Kingdom.`
          : `Trading name ${entity.name}. UK company number, VAT and registered office are To Be Confirmed.`}
      </p>
      <p>Governing law for this UK platform: England and Wales. Enquiries: {entity.email}.</p>
      <GroupLegalFacts />
    </LegalLayout>
  );
}
