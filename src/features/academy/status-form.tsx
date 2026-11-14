'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Result = {
  ref: string;
  status: string;
  label: string;
  programme: string;
  start: string;
  updated: string;
  history: { status: string; at: string }[];
};

export function StatusForm() {
  const t = useTranslations('Status');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  return (
    <div style={{ maxWidth: 640 }}>
      <form
        className="nv-card"
        style={{ padding: 30 }}
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const f = new FormData(event.currentTarget);
          setError(null);
          setResult(null);
          setPending(true);
          try {
            const response = await fetch('/api/academy/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ref: String(f.get('ref') ?? ''), email: String(f.get('email') ?? '') }),
            });
            const payload = (await response.json().catch(() => ({}))) as Partial<Result> & { error?: string };
            if (!response.ok) throw new Error(payload.error || t('errGeneric'));
            setResult(payload as Result);
          } catch (err) {
            setError(err instanceof Error ? err.message : t('errGeneric'));
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="nv-row">
          <div className="nv-field"><label htmlFor="st-ref">{t('reference')}</label><input id="st-ref" name="ref" placeholder="EN-XXXXXX" maxLength={20} required /></div>
          <div className="nv-field"><label htmlFor="st-email">{t('email')}</label><input id="st-email" name="email" type="email" maxLength={254} required /></div>
        </div>
        {error ? <p className="nv-formerr" role="alert">{error}</p> : null}
        <button className="nv-btn nv-primary" type="submit" disabled={pending}>{pending ? t('checking') : t('check')}</button>
        <p className="nv-muted" style={{ fontSize: 13, marginTop: 14 }}>
          {t('noApp')} <Link href="/academy/enrol" style={{ color: 'var(--cyan)' }}>{t('request')}</Link>.
        </p>
      </form>
      {result ? (
        <div className="nv-card nv-summary" style={{ marginTop: 20 }} role="status">
          <div className="nv-eyebrow nv-gold">{result.ref}</div>
          <h3 style={{ fontSize: 24, margin: '12px 0 6px' }}>{result.label}</h3>
          <p className="nv-muted">{result.programme}{result.start ? ' · ' + result.start : ''}</p>
          <p className="nv-muted" style={{ fontSize: 13, marginTop: 4 }}>{t('updated')} {result.updated}</p>
          <ol style={{ margin: '18px 0 0', paddingLeft: 18, fontSize: 14, color: '#b4c3d8' }}>
            {result.history.map((h, i) => (<li key={i}>{h.status} <span className="nv-muted">· {h.at}</span></li>))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
