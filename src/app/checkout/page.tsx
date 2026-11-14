import { Cart } from '@/features/marketplace';
import { PageHead } from '@/components/page-head';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata(
  'Checkout',
  'Review your bag and pay with Stripe.',
  '/checkout',
  true,
);

export default function CheckoutPage() {
  return (
    <>
      <PageHead title="Checkout" description="Review and pay." path="/checkout" />
      <div className="container page-body">
        <Cart checkout />
      </div>
    </>
  );
}
