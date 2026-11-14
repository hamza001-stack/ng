
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  EXPERIENCE_LEVELS,
  fmtDate,
  money,
  seatsLeft,
  type Programme,
} from '@/lib/academy-defaults';

type Done = {
  ref: string;
  position: number;
  programme: string;
};

export function PreRegisterForm({
  programmes,
  initialProgramme,
  initialSession,
}: {
  programmes: Programme[];
  initialProgramme?: string;
  initialSession?: string;
}) {
  const t = useTranslations('PreRegisterForm');
  const courseT = useTranslations('Courses');

  const start = programmes.find((p) => p.id === initialProgramme)?.id ?? '';
  const [pid, setPid] = useState(start);
  const [sid, setSid] = useState(initialSession ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const prog = programmes.find((p) => p.id === pid);
  const sessions = prog?.sessions ?? [];

  const getProgrammeTitle = (p: Programme) => {
    const key = `${p.id}.title`;
    return courseT.has(key) ? courseT(key) : p.title;
  };

  const experienceLabels: Record<string, string> = {
    'Prefer not to say': t('experienceOptions.preferNot'),
    'Complete beginner': t('experienceOptions.beginner'),
    'Some experience': t('experienceOptions.some'),
    'Working with it already': t('experienceOptions.working'),
  };

  if (done) {
    return (
      <div
        className="nv-card nv-ok-box"
        style={{ maxWidth: 640 }}
        role="status"
      >
        <div className="nv-big">✓</div>

        <h3 style={{ fontSize: 24, margin: '10px 0' }}>
          {t('success.title')}
        </h3>

        <p className="nv-muted">
          {done.programme} · {t('success.place')}{' '}
          <b>#{done.position}</b>
        </p>

        <p style={{ margin: '14px 0' }}>
          {t('success.reference')} <b>{done.ref}</b>
        </p>

        <p className="nv-muted" style={{ fontSize: 13 }}>
          {t('success.description')}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            marginTop: 22,
            flexWrap: 'wrap',
          }}
        >
          <Link
            className="nv-btn nv-primary nv-sm"
            href="/academy/courses"
          >
            {t('success.browse')}
          </Link>

          <Link
            className="nv-btn nv-ghost nv-sm"
            href="/academy"
          >
            {t('success.back')}
          </Link>
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

        if (!pid) return setError(t('errors.chooseProgramme'));
        if (text('name').length < 2) return setError(t('errors.name'));
        if (!/^\S+@\S+\.\S+$/.test(text('email'))) {
          return setError(t('errors.email'));
        }
        if (f.get('consent') !== 'on') {
          return setError(t('errors.consent'));
        }

        setError(null);
        setPending(true);

        try {
          const response = await fetch('/api/academy/pre-register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: text('name'),
              email: text('email'),
              phone: text('phone') || undefined,
              programmeId: pid,
              sessionId: sid || undefined,
              experience: text('experience') || undefined,
              message: text('message') || undefined,
              consent: true,
              website: text('website'),
            }),
          });

          const payload = (await response.json().catch(() => ({}))) as
            Partial<Done> & { error?: string };

          if (!response.ok) {
            throw new Error(t('errors.submit'));
          }

          setDone({
            ref: payload.ref ?? '',
            position: payload.position ?? 0,
            programme: getProgrammeTitle(prog!),
          });
        } catch {
          setError(t('errors.submit'));
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="nv-field">
        <label htmlFor="pr-prog">{t('programme')}</label>

        <select
          id="pr-prog"
          value={pid}
          onChange={(e) => {
            setPid(e.target.value);
            setSid('');
          }}
          required
        >
          <option value="">{t('chooseProgramme')}</option>

          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {getProgrammeTitle(p)} — {money(p.price, p.currency)}
            </option>
          ))}
        </select>
      </div>

      {sessions.length ? (
        <div className="nv-field">
          <label htmlFor="pr-sess">{t('startDate')}</label>

          <select
            id="pr-sess"
            value={sid}
            onChange={(e) => setSid(e.target.value)}
          >
            <option value="">{t('noPreference')}</option>

            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {fmtDate(s.startsOn)} · {s.days} ·{' '}
                {seatsLeft(s) > 0
                  ? `${seatsLeft(s)} ${t('seatsLeft')}`
                  : t('waitingList')}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="nv-row">
        <div className="nv-field">
          <label htmlFor="pr-name">{t('fullName')}</label>
          <input
            id="pr-name"
            name="name"
            autoComplete="name"
            maxLength={100}
            required
          />
        </div>

        <div className="nv-field">
          <label htmlFor="pr-email">{t('email')}</label>
          <input
            id="pr-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
      </div>

      <div className="nv-row">
        <div className="nv-field">
          <label htmlFor="pr-phone">{t('phone')}</label>
          <input
            id="pr-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
          />
        </div>

        <div className="nv-field">
          <label htmlFor="pr-exp">{t('experience')}</label>

          <select
            id="pr-exp"
            name="experience"
            defaultValue=""
          >
            <option value="">{t('experienceOptions.preferNot')}</option>

            {EXPERIENCE_LEVELS
              .filter((level) => level !== 'Prefer not to say')
              .map((level) => (
                <option key={level} value={level}>
                  {experienceLabels[level] ?? level}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="nv-field">
        <label htmlFor="pr-msg">{t('goal')}</label>
        <textarea
          id="pr-msg"
          name="message"
          rows={3}
          maxLength={1000}
        />
      </div>

      <div className="nv-hp" aria-hidden="true">
        <label>
          Website
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <label className="nv-consent">
        <input type="checkbox" name="consent" />
        <span>{t('consent')}</span>
      </label>

      {error ? (
        <p className="nv-formerr" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="nv-btn nv-primary"
        type="submit"
        disabled={pending}
      >
        {pending ? t('sending') : t('submit')}
      </button>
    </form>
  );
}
