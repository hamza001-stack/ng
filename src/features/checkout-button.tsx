'use client';

import { useState } from 'react';

export function CheckoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    coupon: '',
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function pay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch('/api/checkout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        postcode: form.postcode,
        country: form.country,
        coupon: form.coupon || undefined,
      }),
    });
    const result = (await response.json()) as { error?: string; url?: string };
    setPending(false);
    if (!response.ok || !result.url) {
      setError(result.error || 'Unable to start checkout.');
      return;
    }
    window.location.assign(result.url);
  }

  return (
    <form className="checkout-details" onSubmit={pay} noValidate>
      <h2>Your details</h2>
      <p>Enter the details for this order. We use them for the receipt and, for physical items, delivery.</p>
      <div className="checkout-grid">
        <label className="field">
          Full name
          <input required autoComplete="name" value={form.name} onChange={(event) => set('name', event.target.value)} />
        </label>
        <label className="field">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => set('email', event.target.value)}
          />
        </label>
        <label className="field">
          Phone
          <input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => set('phone', event.target.value)} />
        </label>
        <label className="field">
          Country
          <input required autoComplete="country-name" value={form.country} onChange={(event) => set('country', event.target.value)} />
        </label>
        <label className="field wide">
          Address line 1
          <input required autoComplete="address-line1" value={form.line1} onChange={(event) => set('line1', event.target.value)} />
        </label>
        <label className="field wide">
          Address line 2
          <input autoComplete="address-line2" value={form.line2} onChange={(event) => set('line2', event.target.value)} />
        </label>
        <label className="field">
          City
          <input required autoComplete="address-level2" value={form.city} onChange={(event) => set('city', event.target.value)} />
        </label>
        <label className="field">
          Postcode
          <input required autoComplete="postal-code" value={form.postcode} onChange={(event) => set('postcode', event.target.value)} />
        </label>
        <label className="field wide">
          Coupon (optional)
          <input autoComplete="off" value={form.coupon} onChange={(event) => set('coupon', event.target.value)} />
        </label>
      </div>
      <button className="shop-primary shop-primary-block" type="submit" disabled={pending}>
        {pending ? 'Please wait…' : 'Pay now'}
      </button>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      <p className="checkout-secure">
        VAT is added at the UK rate. You complete payment on Stripe. Card numbers are not stored on this site.
      </p>
    </form>
  );
}
