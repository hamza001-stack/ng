import { EntityBlock, LegalLayout } from '@/features/legal/legal-layout';
import { OfficialSourceNote } from '@/features/legal/official-source';
import { legalEntity } from '@/lib/legal';
import { metadata as makeMetadata } from '@/lib/seo';

const entity = legalEntity();

export const metadata = makeMetadata(
  'GDPR',
  `UK GDPR information for ${entity.name} customers and enquirers.`,
  '/gdpr',
);

export default function GdprPage() {
  return (
    <LegalLayout title="UK GDPR" kicker="LEGAL / DATA PROTECTION">
      <OfficialSourceNote pages={['privacy']} />
      <EntityBlock entity={entity} />
      <p>
        {entity.name} is the controller for personal data processed through this website.
        {entity.ico
          ? ` ICO registration: ${entity.ico}.`
          : ' Set LEGAL_ICO_NUMBER when the ICO registration is issued.'}
      </p>
      <h2>Lawful bases</h2>
      <ul>
        <li>Contract: accounts, carts, orders, support.</li>
        <li>Legal obligation: tax, accounting, lawful requests.</li>
        <li>Legitimate interests: network security, abuse prevention, service improvement that does not override your rights.</li>
        <li>Consent: newsletters and optional cookies.</li>
      </ul>
      <h2>Requests</h2>
      <p>
        Send access or erasure requests to {entity.email}. We respond within one month. We may
        need to verify your identity.
      </p>
    </LegalLayout>
  );
}
