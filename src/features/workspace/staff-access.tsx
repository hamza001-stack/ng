'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import QRCode from 'qrcode';
import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

function Gate({ title, copy, children }: { title: string; copy: string; children: ReactNode }) {
  return (
    <div className="console-gate">
      <section className="console-gate-card">
        <Image
          className="console-gate-logo"
          src="/brand/logo.webp"
          alt="NEVIE-GLOBAL"
          width={180}
          height={40}
          priority
        />
        <h1>{title}</h1>
        <p className="console-gate-copy">{copy}</p>
        {children}
      </section>
    </div>
  );
}

function CodeInput({ backup, value, onChange }: { backup: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <label className="console-field">
      {backup ? 'Backup code' : 'Authenticator code'}
      <input
        className="ws-input"
        required
        autoFocus
        name="code"
        inputMode={backup ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        pattern={backup ? undefined : '[0-9]{6}'}
        maxLength={backup ? 32 : 6}
        placeholder={backup ? 'xxxxx-xxxxx' : '6-digit code'}
        value={value}
        onChange={(event) => onChange(event.target.value.trim())}
      />
    </label>
  );
}

export function StaffSignIn() {
  const router = useRouter();
  const [step, setStep] = useState<'password' | 'code'>('password');
  const [backup, setBackup] = useState(false);
  const [code, setCode] = useState('');
  const [trust, setTrust] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function rejectNonStaff() {
    const session = await fetch('/api/session', { credentials: 'include' })
      .then((r) => r.json())
      .catch(() => null);
    const role = session?.user?.role;
    if (role === 'STAFF' || role === 'ADMIN') return false;
    await authClient.signOut();
    setError('Invalid email or password.');
    setStep('password');
    return true;
  }

  async function onPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
    });
    setPending(false);
    if (result.error) {
      setError('Invalid email or password.');
      return;
    }
    if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
      setStep('code');
      return;
    }
    if (await rejectNonStaff()) return;
    router.refresh();
  }

  async function onCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = backup
      ? await authClient.twoFactor.verifyBackupCode({ code, trustDevice: trust })
      : await authClient.twoFactor.verifyTotp({ code, trustDevice: trust });
    setPending(false);
    if (result.error) {
      setError(result.error.message || 'That code was not accepted.');
      return;
    }
    if (await rejectNonStaff()) return;
    router.refresh();
  }

  if (step === 'code') {
    return (
      <Gate title="Two-step verification" copy="Enter the code from your authenticator app to open the console.">
        <form className="console-form" onSubmit={onCode}>
          <CodeInput backup={backup} value={code} onChange={setCode} />
          <label className="console-check">
            <input type="checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} />
            Trust this device for 30 days
          </label>
          {error ? <p className="ws-error" role="alert">{error}</p> : null}
          <button className="ws-btn primary console-submit" type="submit" disabled={pending}>
            <ShieldCheck size={15} /> {pending ? 'Checking…' : 'Verify'}
          </button>
          <button
            type="button"
            className="console-link"
            onClick={() => {
              setBackup(!backup);
              setCode('');
              setError(null);
            }}
          >
            {backup ? 'Use authenticator code' : 'Use a backup code instead'}
          </button>
        </form>
      </Gate>
    );
  }

  return (
    <Gate title="Restricted console" copy="Authorised NEVIE-GLOBAL staff only. Access is logged.">
      <form className="console-form" onSubmit={onPassword}>
        <label className="console-field">
          Email
          <input className="ws-input" required name="email" type="email" autoComplete="username" />
        </label>
        <label className="console-field">
          Password
          <input className="ws-input" required name="password" type="password" autoComplete="current-password" minLength={12} />
        </label>
        {error ? <p className="ws-error" role="alert">{error}</p> : null}
        <button className="ws-btn primary console-submit" type="submit" disabled={pending}>
          <LockKeyhole size={15} /> {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </Gate>
  );
}

export function StaffTwoFactorSetup({ email }: { email: string }) {
  const router = useRouter();
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onEnable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const password = String(new FormData(event.currentTarget).get('password') || '');
    const result = await authClient.twoFactor.enable({ password, issuer: 'NEVIE-GLOBAL UK' });
    setPending(false);
    if (result.error || !result.data || !('totpURI' in result.data)) {
      setError(result.error?.message || 'Password not accepted.');
      return;
    }
    const uri = result.data.totpURI;
    setSecret(new URL(uri).searchParams.get('secret'));
    setBackupCodes(result.data.backupCodes);
    setQr(await QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: '#07080b', light: '#ffffff' } }));
  }

  async function onVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await authClient.twoFactor.verifyTotp({ code });
    setPending(false);
    if (result.error) {
      setError(result.error.message || 'That code was not accepted.');
      return;
    }
    router.refresh();
  }

  async function signOut() {
    await authClient.signOut();
    router.refresh();
  }

  if (!qr) {
    return (
      <Gate
        title="Set up two-step verification"
        copy={`Staff accounts must use an authenticator app before the console opens. Signed in as ${email}.`}
      >
        <form className="console-form" onSubmit={onEnable}>
          <label className="console-field">
            Confirm your password
            <input className="ws-input" required autoFocus name="password" type="password" autoComplete="current-password" />
          </label>
          {error ? <p className="ws-error" role="alert">{error}</p> : null}
          <button className="ws-btn primary console-submit" type="submit" disabled={pending}>
            <KeyRound size={15} /> {pending ? 'Preparing…' : 'Continue'}
          </button>
          <button type="button" className="console-link" onClick={signOut}>
            Sign out
          </button>
        </form>
      </Gate>
    );
  }

  return (
    <Gate
      title="Scan with your authenticator"
      copy="Use Google Authenticator, 1Password, Authy or Microsoft Authenticator, then enter the 6-digit code."
    >
      <div className="console-qr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Authenticator QR code" width={220} height={220} />
        {secret ? (
          <p className="ws-hint">
            Manual key: <code>{secret}</code>
          </p>
        ) : null}
      </div>
      <div className="console-backup">
        <p>
          <strong>Backup codes.</strong> Store these offline. Each works once if you lose your device.
        </p>
        <ul>
          {backupCodes.map((backupCode) => (
            <li key={backupCode}>
              <code>{backupCode}</code>
            </li>
          ))}
        </ul>
      </div>
      <form className="console-form" onSubmit={onVerify}>
        <CodeInput backup={false} value={code} onChange={setCode} />
        {error ? <p className="ws-error" role="alert">{error}</p> : null}
        <button className="ws-btn primary console-submit" type="submit" disabled={pending}>
          <ShieldCheck size={15} /> {pending ? 'Checking…' : 'Turn on and open console'}
        </button>
      </form>
    </Gate>
  );
}
