import { LegalLayout } from '@/features/legal/legal-layout';
import { OfficialSourceNote } from '@/features/legal/official-source';
import { legalEntity } from '@/lib/legal';
import { metadata as makeMetadata } from '@/lib/seo';

const entity = legalEntity();

export const metadata = makeMetadata(
  'Shipping',
  `Shipping for ${entity.name} physical products.`,
  '/shipping',
);

export default function ShippingPage() {
  return (
    <LegalLayout title="Shipping" kicker="LEGAL / DELIVERY">
      <OfficialSourceNote />
      <p>
        No shipping policy is published on nevie-global.com. Dispatch windows for connected
        jewellery remain To Be Confirmed.
      </p>
      <p>
        Physical products ship to the United Kingdom unless a product page states otherwise.
        Shipping is shown as a separate amount at Stripe Checkout when a shipping rate is
        configured.
      </p>
      <p>
        Dispatch windows are stated on the product page (including pre-order). Risk in physical
        goods passes on delivery to the address you give Stripe Checkout.
      </p>
      <p>Lost parcels: contact {entity.email} with the order ID within 14 days of the due date.</p>
    </LegalLayout>
  );
}
