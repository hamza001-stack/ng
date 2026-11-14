'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { fmtDate, money, seatsLeft, type Programme } from '@/lib/academy-defaults';

export function EnrolForm({
  programmes,
  initialProgramme,
  initialSession,
}: {
  programmes: Programme[];
  initialProgramme?: string;
  initialSession?: string;
}) {
  const t = useTranslations('Enrol');
  const [pid, setPid] = useState(programmes.find((p) => p.id === initialProgramme)?.id ?? '');
  const [sid, setSid] = useState(initialSession ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ref: string; programme: string } | null>(null);
  const prog = programmes.find((p) => p.id === pid);
  const sessions = prog?.sessions ?? [];

  if (done) {
    return (
      <div className="nv-card nv-ok-box" style={{ maxWidth: 640 }} role="status">
        <div className="nv-big">✓</div>
        <h3 style={{ fontSize: 24, margin: '10px 0' }}>{t('doneTitle')}</h3>
        <p className="nv-muted">{done.programme}</p>
        <p style={{ margin: '14px 0' }}>{t('reference')} <b>{done.ref}</b></p>
        <p className="nv-muted" style={{ fontSize: 13 }}>
          {t('doneBody')}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
          <Link className="nv-btn nv-primary nv-sm" href="/academy/status">{t('track')}</Link>
          <Link className="nv-btn nv-ghost nv-sm" href="/academy">{t('back')}</Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="nv-card"
      style={{ padding: 30, maxWidth: 640 }}
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const f = new FormData(event.currentTarget);
        const text = (k: string) => String(f.get(k) ?? '').trim();
        if (!pid) return setError(t('errProgramme'));
        if (!sid) return setError(t('errDate'));
        if (text('name').length < 2) return setError(t('errName'));
        if (!/^\S+@\S+\.\S+$/.test(text('email'))) return setError(t('errEmail'));
        if (f.get('consent') !== 'on') return setError(t('errConsent'));
        setError(null);
        setPending(true);
        try {
          const response = await fetch('/api/academy/enrol', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: text('name'),
              email: text('email'),
              phone: text('phone') || undefined,
              programmeId: pid,
              sessionId: sid,
              goal: text('goal') || undefined,
              consent: true,
              website: text('website'),
            }),
          });
          const payload = (await response.json().catch(() => ({}))) as { ref?: string; programme?: string; error?: string };
          if (!response.ok) throw new Error(payload.error || t('errGeneric'));
          setDone({ ref: payload.ref ?? '', programme: payload.programme ?? prog?.title ?? '' });
        } catch (err) {
          setError(err instanceof Error ? err.message : t('errGeneric'));
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="nv-field">
        <label htmlFor="en-prog">{t('programme')}</label>
        <select id="en-prog" value={pid} onChange={(e) => { setPid(e.target.value); setSid(''); }} required>
          <option value="">{t('choose')}</option>
          {programmes.map((p) => (<option key={p.id} value={p.id}>{p.title} — {money(p.price)}</option>))}
        </select>
      </div>
      <div className="nv-field">
        <label htmlFor="en-sess">{t('startDate')}</label>
        <select id="en-sess" value={sid} onChange={(e) => setSid(e.target.value)} required disabled={!sessions.length}>
          <option value="">{pid && !sessions.length ? t('noDates') : t('chooseDate')}</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {fmtDate(s.startsOn)} · {s.days} · {seatsLeft(s) > 0 ? seatsLeft(s) + ' ' + t('seatsLeft') : t('full')}
            </option>
          ))}
        </select>
        {pid && !sessions.length ? <small className="nv-muted"><Link href={'/academy/pre-registration?programme=' + pid} style={{ color: 'var(--cyan)' }}>{t('joinList')}</Link> {t('joinListTail')}</small> : null}
      </div>
      <div className="nv-row">
        <div className="nv-field"><label htmlFor="en-name">{t('name')}</label><input id="en-name" name="name" autoComplete="name" maxLength={100} required /></div>
        <div className="nv-field"><label htmlFor="en-email">{t('email')}</label><input id="en-email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
      </div>
      <div className="nv-field"><label htmlFor="en-phone">{t('phone')}</label><input id="en-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></div>
      <div className="nv-field"><label htmlFor="en-goal">{t('goal')}</label><textarea id="en-goal" name="goal" rows={3} maxLength={1000} /></div>
      <div className="nv-hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="nv-consent"><input type="checkbox" name="consent" /><span>{t('consent')}</span></label>
      {error ? <p className="nv-formerr" role="alert">{error}</p> : null}
      <button className="nv-btn nv-primary" type="submit" disabled={pending}>{pending ? t('sending') : t('submit')}</button>
    </form>
  );
}
