import { Cart } from '@/features/marketplace';
import { PageHead } from '@/components/page-head';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata(
  'Bag',
  'Your NEVIE-GLOBAL UK bag.',
  '/cart',
  true,
);

export default function CartPage() {
  return (
    <>
      <PageHead title="Your bag" description="Review selected products." path="/cart" />
      <div className="container page-body">
        <Cart />
      </div>
    </>
  );
}
