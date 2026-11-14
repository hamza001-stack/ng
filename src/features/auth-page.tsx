'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsCode, setNeedsCode] = useState(false);
  const signup = mode === 'signup';

  async function finishSignIn() {
    await fetch('/api/cart', { credentials: 'include' });
    router.push('/dashboard');
    router.refresh();
  }

  async function onCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const code = String(new FormData(event.currentTarget).get('code') || '').trim();
    const result = /^\d{6}$/.test(code)
      ? await authClient.twoFactor.verifyTotp({ code })
      : await authClient.twoFactor.verifyBackupCode({ code });
    setPending(false);
    if (result.error) {
      setError(result.error.message || 'That code was not accepted.');
      return;
    }
    await finishSignIn();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const name = String(form.get('name') || '');
    if (signup) {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/dashboard',
      });
      setPending(false);
      if (result.error) {
        setError(result.error.message || 'Unable to create this account.');
        return;
      }
      setNotice('Check your email to confirm the account before signing in.');
      return;
    }
    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/dashboard',
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message || 'Unable to sign in.');
      return;
    }
    if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
      setNeedsCode(true);
      return;
    }
    await finishSignIn();
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">
          <Image
            src="/brand/logo.webp"
            alt="NEVIE-GLOBAL"
            width={360}
            height={80}
          />
        </Link>
        <div className="auth-copy">
          <span className="store-eyebrow">NEVIE-GLOBAL / UNITED KINGDOM</span>
          <h1>{signup ? 'Create your workspace.' : 'Welcome back.'}</h1>
          <p>
            {signup
              ? 'Create an account to keep orders, learning progress and saved products with you.'
              : 'Sign in to continue with your collection, orders and learning.'}
          </p>
          <div className="auth-trust">
            <ShieldCheck size={18} />
            <span>Passwords are hashed. Sessions use HTTP-only cookies.</span>
          </div>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-switch">
            <Link href="/sign-in" className={!signup ? 'active' : ''}>
              Sign in
            </Link>
            <Link href="/sign-up" className={signup ? 'active' : ''}>
              Create account
            </Link>
          </div>
          <div className="auth-title">
            <h2>{signup ? 'Start your workspace' : 'Sign in to NEVIE'}</h2>
            <p>
              {signup
                ? 'Use a work email. You will confirm it before the workspace opens.'
                : 'Use the email and password you registered with.'}
            </p>
          </div>
          {notice ? (
            <div className="auth-success" role="status">
              <h3>Confirm your email</h3>
              <p>{notice}</p>
            </div>
          ) : needsCode ? (
            <form className="auth-page-form" onSubmit={onCode}>
              <label>
                Authenticator or backup code
                <input
                  required
                  autoFocus
                  name="code"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  maxLength={32}
                />
              </label>
              {error ? (
                <p className="error-text" role="alert">
                  {error}
                </p>
              ) : null}
              <button className="shop-primary auth-submit" type="submit" disabled={pending}>
                {pending ? 'Please wait…' : 'Verify'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form className="auth-page-form" onSubmit={onSubmit}>
              {signup && (
                <label>
                  Full name
                  <input required name="name" autoComplete="name" placeholder="Your name" />
                </label>
              )}
              <label>
                Work email
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </label>
              <label>
                Password
                <span className="password-field">
                  <input
                    required
                    name="password"
                    minLength={12}
                    type={visible ? 'text' : 'password'}
                    autoComplete={signup ? 'new-password' : 'current-password'}
                    placeholder="At least 12 characters"
                  />
                  <button
                    type="button"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
              {!signup && (
                <Link className="forgot-link" href="/forgot-password">
                  Forgot password?
                </Link>
              )}
              {error ? (
                <p className="error-text" role="alert">
                  {error}
                </p>
              ) : null}
              <button className="shop-primary auth-submit" type="submit" disabled={pending}>
                {pending ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}{' '}
                <ArrowRight size={16} />
              </button>
              {signup && (
                <p className="auth-terms">
                  By creating an account you agree to the{' '}
                  <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
                </p>
              )}
            </form>
          )}
          <p className="auth-alternate">
            {signup ? 'Already have an account?' : 'New to NEVIE-GLOBAL?'}{' '}
            <Link href={signup ? '/sign-in' : '/sign-up'}>
              {signup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
