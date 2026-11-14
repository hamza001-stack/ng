'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Field, FormCard, SelectInput, TextInput } from './form-ui';

type Mode = 'test' | 'live';

export type StripeView = {
  mode: Mode;
  webhookUrl: string;
  keys: Record<
    Mode,
    { secretKey: string | null; publishableKey: string | null; webhookSecret: string | null }
  >;
};

export type SmtpView = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  passSet: boolean;
};

type Result = { tone: 'ok' | 'warn'; text: string } | null;

async function send(body: unknown) {
  const response = await fetch('/api/admin/settings', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!response.ok) throw new Error(payload.error || 'Request failed');
  return payload;
}

function Note({ result }: { result: Result }) {
  if (!result) return null;
  return (
    <p className={`ws-settings-note ${result.tone}`} role="status">
      {result.text}
    </p>
  );
}

export function StripeSettingsForm({ view, canEdit }: { view: StripeView; canEdit: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(view.mode);
  const [editing, setEditing] = useState<Mode>(view.mode);
  const [confirmLive, setConfirmLive] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [pending, setPending] = useState(false);
  const keys = view.keys[editing];

  const [showTestCharge, setShowTestCharge] = useState(false);
  const [testChargeAmount, setTestChargeAmount] = useState('50');
  const [testChargeDesc, setTestChargeDesc] = useState('Academy demo charge');
  const [testChargeResult, setTestChargeResult] = useState<Result>(null);

  async function onTestCharge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pence = Math.round(parseFloat(testChargeAmount) * 100);
    if (!pence || pence < 100) { setTestChargeResult({ tone: 'warn', text: 'Minimum amount is £1.00' }); return; }
    setPending(true);
    setTestChargeResult(null);
    try {
      const payload = await send({ group: 'stripe-test-charge', amountPence: pence, description: testChargeDesc });
      setTestChargeResult({ tone: 'ok', text: payload.message || `Test charge of £${testChargeAmount} recorded.` });
    } catch (error) {
      setTestChargeResult({ tone: 'warn', text: error instanceof Error ? error.message : 'Test charge failed.' });
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'live' && view.mode !== 'live' && !confirmLive) {
      setResult({ tone: 'warn', text: 'Tick the confirmation to take real payments in live mode.' });
      return;
    }
    const form = new FormData(event.currentTarget);
    const read = (m: Mode) => ({
      secretKey: String(form.get(`${m}.secretKey`) || ''),
      publishableKey: String(form.get(`${m}.publishableKey`) ?? view.keys[m].publishableKey ?? ''),
      webhookSecret: String(form.get(`${m}.webhookSecret`) || ''),
    });
    setPending(true);
    setResult(null);
    try {
      await send({ group: 'stripe', mode, test: read('test'), live: read('live'), clear: [] });
      setResult({ tone: 'ok', text: `Saved. Checkout now uses ${mode} mode.` });
      router.refresh();
    } catch (error) {
      setResult({ tone: 'warn', text: error instanceof Error ? error.message : 'Save failed' });
    } finally {
      setPending(false);
    }
  }

  async function onTest() {
    setPending(true);
    setResult(null);
    try {
      const payload = await send({ group: 'stripe-test', mode: editing });
      setResult({ tone: 'ok', text: payload.message || 'Connected.' });
    } catch (error) {
      setResult({ tone: 'warn', text: error instanceof Error ? error.message : 'Test failed' });
    } finally {
      setPending(false);
    }
  }

  return (
    <FormCard
      title="Payments · Stripe"
      copy="Secret keys are encrypted at rest and never shown again. Leave a secret field blank to keep the saved value."
    >
      <form className="ws-form" onSubmit={onSubmit}>
        <Field label="Active mode" hint="Checkout and webhooks use the keys for this mode.">
          <div className="ws-mode-switch" role="group" aria-label="Stripe mode">
            {(['test', 'live'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={m}
                aria-pressed={mode === m}
                disabled={!canEdit}
                onClick={() => {
                  setMode(m);
                  setEditing(m);
                }}
              >
                {m === 'test' ? 'Test' : 'Live'}
              </button>
            ))}
          </div>
        </Field>
        {mode === 'live' ? (
          <p className="ws-settings-note warn">
            Live mode charges real cards. Confirm the live webhook endpoint exists in Stripe before switching.
          </p>
        ) : null}

        <Field label="Editing keys for">
          <SelectInput value={editing} onChange={(e) => setEditing(e.target.value as Mode)}>
            <option value="test">Test keys</option>
            <option value="live">Live keys</option>
          </SelectInput>
        </Field>

        {(['test', 'live'] as const).map((m) => (
          <div key={m} hidden={editing !== m} className="ws-form">
            <Field
              label="Secret key"
              htmlFor={`${m}-sk`}
              hint={view.keys[m].secretKey ? `Saved: ${view.keys[m].secretKey}` : 'Not set'}
            >
              <TextInput
                id={`${m}-sk`}
                name={`${m}.secretKey`}
                type="password"
                autoComplete="off"
                placeholder={`sk_${m}_…`}
                disabled={!canEdit}
              />
            </Field>
            <Field label="Publishable key" htmlFor={`${m}-pk`}>
              <TextInput
                id={`${m}-pk`}
                name={`${m}.publishableKey`}
                autoComplete="off"
                defaultValue={view.keys[m].publishableKey ?? ''}
                placeholder={`pk_${m}_…`}
                disabled={!canEdit}
              />
            </Field>
            <Field
              label="Webhook signing secret"
              htmlFor={`${m}-wh`}
              hint={
                view.keys[m].webhookSecret
                  ? `Saved: ${view.keys[m].webhookSecret}`
                  : `Not set. Endpoint: ${view.webhookUrl}`
              }
            >
              <TextInput
                id={`${m}-wh`}
                name={`${m}.webhookSecret`}
                type="password"
                autoComplete="off"
                placeholder="whsec_…"
                disabled={!canEdit}
              />
            </Field>
          </div>
        ))}

        {mode === 'live' && view.mode !== 'live' ? (
          <label className="console-check">
            <input type="checkbox" checked={confirmLive} onChange={(e) => setConfirmLive(e.target.checked)} />
            I understand live mode takes real payments.
          </label>
        ) : null}

        <Note result={result} />
        <div className="ws-settings-actions">
          <button className="ws-btn primary" type="submit" disabled={!canEdit || pending}>
            {pending ? 'Saving…' : 'Save Stripe settings'}
          </button>
          <button className="ws-btn" type="button" onClick={onTest} disabled={!canEdit || pending || !keys.secretKey}>
            Test {editing === 'test' ? 'test' : 'live'} keys
          </button>
          {mode === 'test' && view.keys.test.secretKey ? (
            <button className="ws-btn" type="button" disabled={pending} onClick={() => { setShowTestCharge(true); setTestChargeResult(null); }}>
              Run test charge
            </button>
          ) : null}
        </div>
        {!canEdit ? <p className="ws-hint">Only administrators can change payment keys.</p> : null}
      </form>

      {showTestCharge ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="nv-card" style={{ width: '100%', maxWidth: 420, padding: 32, margin: 16, background: 'var(--surface, #111)', border: '1px solid var(--border, #333)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Stripe test charge</h3>
            <p className="ws-hint" style={{ marginBottom: 20 }}>
              Charges the built-in Stripe test card. No real card is needed. The amount will appear in your Stripe test dashboard and in the Academy Overview sales card.
            </p>
            <form onSubmit={onTestCharge} className="ws-form">
              <div className="ws-field">
                <label htmlFor="tc-amount">Amount (£)</label>
                <input id="tc-amount" type="number" min="1" max="10000" step="0.01" value={testChargeAmount}
                  onChange={(e) => setTestChargeAmount(e.target.value)} required
                  style={{ background: 'var(--surface-2,#1a1a1a)', border: '1px solid var(--border,#333)', borderRadius: 6, padding: '8px 12px', color: 'inherit', width: '100%' }} />
              </div>
              <div className="ws-field" style={{ marginTop: 12 }}>
                <label htmlFor="tc-desc">Description (optional)</label>
                <input id="tc-desc" type="text" maxLength={200} value={testChargeDesc}
                  onChange={(e) => setTestChargeDesc(e.target.value)}
                  style={{ background: 'var(--surface-2,#1a1a1a)', border: '1px solid var(--border,#333)', borderRadius: 6, padding: '8px 12px', color: 'inherit', width: '100%' }} />
              </div>
              {testChargeResult ? (
                <p className={`ws-settings-note ${testChargeResult.tone}`} role="status" style={{ marginTop: 14 }}>{testChargeResult.text}</p>
              ) : null}
              <div className="ws-settings-actions" style={{ marginTop: 20 }}>
                <button className="ws-btn primary" type="submit" disabled={pending}>{pending ? 'Charging…' : 'Charge test card'}</button>
                <button className="ws-btn" type="button" onClick={() => setShowTestCharge(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </FormCard>
  );
}

export function SmtpSettingsForm({ view, canEdit }: { view: SmtpView; canEdit: boolean }) {
  const router = useRouter();
  const [result, setResult] = useState<Result>(null);
  const [pending, setPending] = useState(false);
  const [secure, setSecure] = useState(view.secure);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setResult(null);
    try {
      await send({
        group: 'smtp',
        host: String(form.get('host') || ''),
        port: Number(form.get('port') || 587),
        secure,
        user: String(form.get('user') || ''),
        pass: String(form.get('pass') || ''),
        from: String(form.get('from') || ''),
        clear: [],
      });
      setResult({ tone: 'ok', text: 'SMTP settings saved.' });
      router.refresh();
    } catch (error) {
      setResult({ tone: 'warn', text: error instanceof Error ? error.message : 'Save failed' });
    } finally {
      setPending(false);
    }
  }

  async function onTest() {
    setPending(true);
    setResult(null);
    try {
      const payload = await send({ group: 'smtp-test' });
      setResult({ tone: 'ok', text: payload.message || 'Sent.' });
    } catch (error) {
      setResult({ tone: 'warn', text: error instanceof Error ? error.message : 'Test failed' });
    } finally {
      setPending(false);
    }
  }

  return (
    <FormCard
      title="Email · SMTP"
      copy="Used for account confirmation, password resets, order receipts and enquiry replies."
    >
      <form className="ws-form" onSubmit={onSubmit}>
        <div className="ws-settings-row">
          <Field label="SMTP host" htmlFor="smtp-host">
            <TextInput id="smtp-host" name="host" defaultValue={view.host} placeholder="smtp.example.com" disabled={!canEdit} />
          </Field>
          <Field label="Port" htmlFor="smtp-port">
            <TextInput
              id="smtp-port"
              name="port"
              type="number"
              min={1}
              max={65535}
              defaultValue={view.port}
              disabled={!canEdit}
              onChange={(e) => {
                if (e.target.value === '465') setSecure(true);
                if (e.target.value === '587' || e.target.value === '25') setSecure(false);
              }}
            />
          </Field>
        </div>
        <Field label="Encryption" hint="Port 465 uses SSL/TLS. Port 587 upgrades with STARTTLS.">
          <SelectInput value={secure ? 'tls' : 'starttls'} onChange={(e) => setSecure(e.target.value === 'tls')} disabled={!canEdit}>
            <option value="starttls">STARTTLS (587)</option>
            <option value="tls">SSL/TLS (465)</option>
          </SelectInput>
        </Field>
        <div className="ws-settings-row">
          <Field label="Username" htmlFor="smtp-user">
            <TextInput id="smtp-user" name="user" autoComplete="off" defaultValue={view.user} disabled={!canEdit} />
          </Field>
          <Field label="Password" htmlFor="smtp-pass" hint={view.passSet ? 'Saved. Leave blank to keep.' : 'Not set'}>
            <TextInput id="smtp-pass" name="pass" type="password" autoComplete="new-password" disabled={!canEdit} />
          </Field>
        </div>
        <Field label="From address" htmlFor="smtp-from" hint="For example: NEVIE-GLOBAL UK <support.uk@nevie-global.com>">
          <TextInput id="smtp-from" name="from" defaultValue={view.from} disabled={!canEdit} />
        </Field>
        <Note result={result} />
        <div className="ws-settings-actions">
          <button className="ws-btn primary" type="submit" disabled={!canEdit || pending}>
            {pending ? 'Saving…' : 'Save SMTP settings'}
          </button>
          <button className="ws-btn" type="button" onClick={onTest} disabled={!canEdit || pending || !view.host}>
            Send test email to me
          </button>
        </div>
        {!canEdit ? <p className="ws-hint">Only administrators can change email delivery.</p> : null}
      </form>
    </FormCard>
  );
}

export function SecurityPanel({ email }: { email: string }) {
  const [codes, setCodes] = useState<string[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [pending, setPending] = useState(false);

  async function onRegenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get('password') || '');
    setPending(true);
    setResult(null);
    const response = await authClient.twoFactor.generateBackupCodes({ password });
    setPending(false);
    if (response.error || !response.data) {
      setResult({ tone: 'warn', text: response.error?.message || 'Password not accepted.' });
      return;
    }
    form.reset();
    setCodes(response.data.backupCodes);
    setResult({ tone: 'ok', text: 'New backup codes issued. Previous codes no longer work.' });
  }

  return (
    <FormCard
      title="Security · Two-step verification"
      copy={`Authenticator app is required for every staff account. On for ${email}.`}
    >
      <form className="ws-form" onSubmit={onRegenerate}>
        <Field label="Confirm password to issue new backup codes" htmlFor="sec-pass">
          <TextInput id="sec-pass" name="password" type="password" required autoComplete="current-password" />
        </Field>
        <Note result={result} />
        {codes.length ? (
          <div className="console-backup">
            <ul>
              {codes.map((code) => (
                <li key={code}>
                  <code>{code}</code>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="ws-settings-actions">
          <button className="ws-btn" type="submit" disabled={pending}>
            {pending ? 'Issuing…' : 'Regenerate backup codes'}
          </button>
        </div>
      </form>
    </FormCard>
  );
}
