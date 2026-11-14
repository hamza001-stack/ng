import { EntityBlock, LegalLayout } from '@/features/legal/legal-layout';
import { OfficialSourceNote } from '@/features/legal/official-source';
import { legalEntity } from '@/lib/legal';
import { metadata as makeMetadata } from '@/lib/seo';

const entity = legalEntity();

export const metadata = makeMetadata(
  'Terms of Sale',
  `Contract terms for ${entity.name} digital and physical products.`,
  '/terms',
);

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Sale" kicker="LEGAL / CONTRACT">
      <OfficialSourceNote />
      <p>
        Conditions générales de vente are not published on nevie-global.com (the CGV URL returns
        404). The terms below apply to purchases on this UK commercial platform.
      </p>
      <EntityBlock entity={entity} />
      <h2>1. Contract</h2>
      <p>
        By creating an account or paying through Stripe Checkout you enter a contract with{' '}
        {entity.name} for the items shown on the order confirmation.
      </p>
      <h2>2. Eligibility</h2>
      <p>You must be 18 or over and able to form a binding contract under the law of England and Wales.</p>
      <h2>3. Prices</h2>
      <p>
        Prices are in GBP. VAT is calculated at the UK rate configured for the platform at
        checkout and shown before payment. A coupon changes the net amount before VAT.
      </p>
      <h2>4. Payment</h2>
      <p>
        Payment is taken by Stripe. We never store full card numbers. Title in physical goods
        passes when we receive cleared funds and dispatch the order. Digital goods are licensed
        when the order status is paid.
      </p>
      <h2>5. Accounts</h2>
      <p>
        You must keep credentials secret. We may suspend an account used for fraud, abuse or
        chargeback risk.
      </p>
      <h2>6. Law</h2>
      <p>These terms are governed by the law of England and Wales. Courts of England and Wales have exclusive jurisdiction.</p>
    </LegalLayout>
  );
}
