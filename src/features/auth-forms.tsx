'use client';

import Link from 'next/link';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function ForgotPasswordForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const email = String(new FormData(event.currentTarget).get('email') || '');
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message || 'Unable to send a reset email.');
      return;
    }
    setNotice('If an account exists for that email, a reset link has been sent.');
  }

  return (
    <form className="auth-page-form" onSubmit={onSubmit}>
      <label>
        Work email
        <input required name="email" type="email" autoComplete="email" />
      </label>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status">{notice}</p>
      ) : null}
      <button className="shop-primary auth-submit" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </button>
      <p className="auth-alternate">
        <Link href="/sign-in">Back to sign in</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const password = String(new FormData(event.currentTarget).get('password') || '');
    const result = await authClient.resetPassword({
      newPassword: password,
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message || 'Unable to reset this password.');
      return;
    }
    setNotice('Password updated. You can sign in.');
  }

  return (
    <form className="auth-page-form" onSubmit={onSubmit}>
      <label>
        New password
        <input
          required
          name="password"
          type="password"
          minLength={12}
          autoComplete="new-password"
        />
      </label>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status">
          {notice} <Link href="/sign-in">Sign in</Link>
        </p>
      ) : null}
      <button className="shop-primary auth-submit" type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Update password'}
      </button>
    </form>
  );
}
