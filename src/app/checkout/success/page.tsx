import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="container page-body">
      <span className="eyebrow">CHECKOUT</span>
      <h1>Payment received.</h1>
      <p>
        Stripe confirmed the session. Your order will show as paid in the workspace once the
        webhook is processed.
      </p>
      <Link href="/dashboard/orders">View orders</Link>
    </div>
  );
}
