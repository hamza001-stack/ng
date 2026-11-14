import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="container page-body">
      <span className="eyebrow">CHECKOUT</span>
      <h1>Payment cancelled.</h1>
      <p>No charge was made. Your bag is still available.</p>
      <Link href="/checkout">Return to checkout</Link>
    </div>
  );
}
