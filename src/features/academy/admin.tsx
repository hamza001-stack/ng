
'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useSave } from '@/features/workspace/admin-actions';
import type { AdminEnrolment, AdminProgramme, AdminRegistration } from '@/server/admin-data';
import { ENROLMENT_LABELS, ENROLMENT_STATUSES, fmtDate, money, seatsLeft } from '@/lib/academy-defaults';
import '@/app/academy/academy.css';
import './academy-admin.css';

export type AcademyTab = 'overview' | 'programmes' | 'sessions' | 'waiting' | 'enrolments';

type Props = {
  tab: AcademyTab;
  canEditPrices: boolean;
  programmes: AdminProgramme[];
  registrations: AdminRegistration[];
  enrolments: AdminEnrolment[];
  courses: { id: string; title: string }[];
  learners: number;
  sales: { livePence: number; liveCount: number; testPence: number; testCount: number };
};

async function send(method: 'PUT' | 'DELETE' | 'PATCH', url: string, body: unknown) {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Save failed');
}

const base = (path: string) => path;

function Head({
  eyebrow,
  title,
  copy,
  right,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  right?: ReactNode;
}) {
  return (
    <div className="nv-admin-head">
      <div>
        <div className="nv-eyebrow nv-gold">{eyebrow}</div>
        <h2>{title}</h2>
        <p className="nv-muted">{copy}</p>
      </div>
      {right}
    </div>
  );
}

export function AcademyAdmin(props: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  const flash = (text: string) => {
    setMsg(text);
    window.setTimeout(() => setMsg(null), 2400);
  };

  return (
    <div className="nv-academy nv-embedded">
      {props.tab === 'overview' && <Overview {...props} />}
      {props.tab === 'programmes' && <Programmes {...props} flash={flash} />}
      {props.tab === 'sessions' && <Sessions {...props} flash={flash} />}
      {props.tab === 'waiting' && <Waiting {...props} flash={flash} />}
      {props.tab === 'enrolments' && <Enrolments {...props} flash={flash} />}
      {msg ? <div className="nv-toast" role="status">{msg}</div> : null}
    </div>
  );
}

/* ───────────────────────── Overview ───────────────────────── */

function Overview({
  programmes,
  registrations,
  enrolments,
  learners,
  sales,
}: Props) {
  const sessions = programmes.flatMap((p) => p.sessions);
  const seats = sessions.reduce((n, s) => n + seatsLeft(s), 0);

  return (
    <>
      <Head
        eyebrow="Workspace"
        title="Academy overview"
        copy="A snapshot of your programmes, cohorts and waiting lists."
        right={
          <Link className="nv-btn nv-ghost nv-sm" href={base('/admin/academy/programmes')}>
            Edit programmes &amp; pricing
          </Link>
        }
      />

      <div className="nv-admin-stats">
        <div className="nv-card nv-admin-stat">
          <small>Total pre-registrations</small>
          <b>{registrations.length}</b>
        </div>
        <div className="nv-card nv-admin-stat">
          <small>Programmes</small>
          <b>{programmes.length}</b>
        </div>
        <div className="nv-card nv-admin-stat">
          <small>Upcoming sessions</small>
          <b>{sessions.length}</b>
        </div>
        <div className="nv-card nv-admin-stat">
          <small>Seats remaining</small>
          <b>{seats}</b>
        </div>
        <div className="nv-card nv-admin-stat">
          <small>Open enrolment requests</small>
          <b>{enrolments.filter((e) => e.status === 'REQUESTED' || e.status === 'UNDER_REVIEW').length}</b>
        </div>
        <div className="nv-card nv-admin-stat">
          <small>Sales (live)</small>
          <b>£{(sales.livePence / 100).toLocaleString('en-GB')}</b>
          <small>{sales.liveCount} paid enrolments</small>
        </div>
        <div className="nv-card nv-admin-stat">
          <small>Sales (Stripe test mode)</small>
          <b>£{(sales.testPence / 100).toLocaleString('en-GB')}</b>
          <small>{sales.testCount} test payments</small>
        </div>
        <div className="nv-card nv-admin-stat">
          <small>Awaiting payment</small>
          <b>{enrolments.filter((e) => e.status === 'APPROVED' && e.paymentStatus !== 'PAID').length}</b>
        </div>
      </div>

      <div className="nv-card nv-admin-panel">
        <div className="nv-admin-head">
          <div>
            <h3>Programme summary</h3>
            <p className="nv-muted">Current prices, dates and enrolment.</p>
          </div>
          <span className="nv-pill nv-low">{learners} learners on free lessons</span>
        </div>

        <div className="nv-admin-list">
          {programmes.length ? programmes.map((p) => (
            <div className="nv-card nv-admin-list-item" key={p.id}>
              <div>
                <b>{p.title}</b>
                <p>{p.weeks} · {money(p.price, p.currency)} · {p.sessions.length} sessions</p>
              </div>
              <span>
                <span className={'nv-pill ' + (p.published ? 'nv-ok' : 'nv-full')}>
                  {p.published ? 'Published' : 'Hidden'}
                </span>{' '}
                <span className="nv-pill nv-ok">
                  {registrations.filter((r) => r.programmeId === p.id).length} registrations
                </span>
              </span>
            </div>
          )) : (
            <div className="nv-admin-empty">
              No programmes yet. Open “Programmes &amp; pricing” to add one.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── Programmes & pricing ───────────────────────── */

const blank: AdminProgramme = {
  id: '',
  cat: '',
  theme: 'ai',
  title: '',
  level: 'Beginner',
  price: 0,
  intro: false,
  introCourseId: '',
  lessons: 1,
  hours: '',
  weeks: '',
  promise: '',
  blurb: '',
  outcomes: '',
  syllabus: '',
  seoTitle: '',
  seoDescription: '',
  sortOrder: 0,
  published: true,
  sessions: [],
  fr: {
    title: '',
    level: '',
    price: null,
    hours: '',
    weeks: '',
    promise: '',
    blurb: '',
    outcomes: '',
    syllabus: '',
    seoTitle: '',
    seoDescription: '',
  },
};

type ProgrammeLocale = 'en' | 'fr';

function Programmes({
  programmes,
  courses,
  canEditPrices,
  flash,
}: Props & { flash: (t: string) => void }) {
  const [editing, setEditing] = useState(programmes[0]?.id ?? '__new');
  const [locale, setLocale] = useState<ProgrammeLocale>('en');
  const save = useSave();

  const isNew = editing === '__new' || !programmes.some((p) => p.id === editing);
  const p = programmes.find((x) => x.id === editing) ?? blank;
  const fr = p.fr;

  const parseLines = (value: string) =>
    value.split('\n').map((line) => line.trim()).filter(Boolean);

  const parseSyllabus = (value: string) =>
    parseLines(value).map((line) => {
      const [title, ...rest] = line.split('|');
      return {
        title: title.trim(),
        body: rest.join('|').trim(),
      };
    });

  return (
    <>
      <Head
        eyebrow="Content management"
        title="Programmes & pricing"
        copy="Manage programme information separately in English and French. English uses GBP; a saved French price uses EUR."
        right={
          <button
            className="nv-btn nv-ghost nv-sm"
            type="button"
            onClick={() => {
              setEditing('__new');
              setLocale('en');
            }}
          >
            + New programme
          </button>
        }
      />

      <div className="nv-card nv-admin-panel">
        <div className="nv-field">
          <label htmlFor="editProg">Choose programme</label>
          <select
            id="editProg"
            value={isNew ? '__new' : editing}
            onChange={(e) => {
              setEditing(e.target.value);
              setLocale('en');
            }}
          >
            {programmes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title} — {money(x.price)}
              </option>
            ))}
            <option value="__new">+ New programme</option>
          </select>
        </div>

        <div className="nv-tabs" style={{ margin: '18px 0' }}>
          <button
            type="button"
            className={locale === 'en' ? 'nv-on' : undefined}
            onClick={() => setLocale('en')}
          >
            English (GBP)
          </button>
          <button
            type="button"
            className={locale === 'fr' ? 'nv-on' : undefined}
            disabled={isNew}
            onClick={() => setLocale('fr')}
          >
            Français (EUR)
          </button>
        </div>

        {isNew ? (
          <p className="nv-admin-note">
            Create the English programme first. You can then add its French translation.
          </p>
        ) : null}

        <form
          key={editing + ':' + locale}
          className="nv-admin-form"
          onSubmit={(event) => {
            event.preventDefault();

            const f = new FormData(event.currentTarget);
            const text = (key: string) => String(f.get(key) ?? '').trim();
            const id = isNew ? text('id') : p.id;

            if (locale === 'en') {
              save.run(async () => {
                await send('PUT', '/api/admin/academy-programmes', {
                  locale: 'en',
                  isNew,
                  id,
                  title: text('title'),
                  cat: text('cat'),
                  level: text('level'),
                  theme: text('theme'),
                  price: Number(f.get('price')),
                  weeks: text('weeks'),
                  hours: text('hours'),
                  lessons: Number(f.get('lessons')),
                  intro: text('intro') === 'true',
                  introCourseId: text('introCourseId'),
                  promise: text('promise'),
                  blurb: text('blurb'),
                  outcomes: parseLines(text('outcomes')),
                  syllabus: parseSyllabus(text('syllabus')),
                  seoTitle: text('seoTitle'),
                  seoDescription: text('seoDescription'),
                  published: f.get('published') === 'on',
                });

                setEditing(id);
                flash('English programme saved');
              });
            } else {
              save.run(async () => {
                const priceValue = text('price');

                await send('PUT', '/api/admin/academy-programmes', {
                  locale: 'fr',
                  isNew: false,
                  id,
                  title: text('title'),
                  level: text('level'),
                  price: priceValue === '' ? null : Number(priceValue),
                  hours: text('hours'),
                  weeks: text('weeks'),
                  promise: text('promise'),
                  blurb: text('blurb'),
                  outcomes: parseLines(text('outcomes')),
                  syllabus: parseSyllabus(text('syllabus')),
                  seoTitle: text('seoTitle'),
                  seoDescription: text('seoDescription'),
                });

                flash('French translation saved');
              });
            }
          }}
        >
          {locale === 'en' ? (
            <>
              <div className="nv-field">
                <label>Programme title</label>
                <input name="title" defaultValue={p.title} required />
              </div>

              <div className="nv-field">
                <label>URL id (slug)</label>
                <input
                  name="id"
                  defaultValue={p.id}
                  readOnly={!isNew}
                  required
                  pattern="[a-z0-9-]{2,40}"
                  placeholder="e.g. data-skills"
                />
              </div>

              <div className="nv-field">
                <label>Price (GBP, one-off)</label>
                <input name="price" type="number" min={0} defaultValue={p.price} required />
              </div>

              <div className="nv-field">
                <label>Category</label>
                <input name="cat" defaultValue={p.cat} required />
              </div>

              <div className="nv-field">
                <label>Level</label>
                <input name="level" defaultValue={p.level} required />
              </div>

              <div className="nv-field">
                <label>Artwork</label>
                <select name="theme" defaultValue={p.theme}>
                  <option value="ai">AI (blue network)</option>
                  <option value="code">Code (editor window)</option>
                  <option value="auto">Automation (workflow)</option>
                </select>
              </div>

              <div className="nv-field">
                <label>Duration</label>
                <input name="weeks" defaultValue={p.weeks} placeholder="4 weeks" required />
              </div>

              <div className="nv-field">
                <label>Total live hours</label>
                <input name="hours" defaultValue={p.hours} placeholder="12 hrs" required />
              </div>

              <div className="nv-field">
                <label>Number of lessons</label>
                <input name="lessons" type="number" min={1} defaultValue={p.lessons} required />
              </div>

              <div className="nv-field">
                <label>Free intro lesson</label>
                <select name="intro" defaultValue={String(p.intro)}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="nv-field nv-wide">
                <label>Intro lesson course (optional)</label>
                <select name="introCourseId" defaultValue={p.introCourseId}>
                  <option value="">None</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="nv-field nv-wide">
                <label>Short promise</label>
                <input name="promise" defaultValue={p.promise} />
              </div>

              <div className="nv-field nv-wide">
                <label>Programme description</label>
                <textarea name="blurb" rows={3} defaultValue={p.blurb} />
              </div>

              <div className="nv-field nv-wide">
                <label>What you will learn (one per line)</label>
                <textarea name="outcomes" rows={4} defaultValue={p.outcomes} />
              </div>

              <div className="nv-field nv-wide">
                <label>Syllabus (one lesson per line: Title | description)</label>
                <textarea name="syllabus" rows={6} defaultValue={p.syllabus} />
              </div>

              <div className="nv-field nv-wide">
                <label>SEO title (optional)</label>
                <input name="seoTitle" defaultValue={p.seoTitle} maxLength={160} />
              </div>

              <div className="nv-field nv-wide">
                <label>SEO description (optional)</label>
                <input name="seoDescription" defaultValue={p.seoDescription} maxLength={320} />
              </div>

              <label className="nv-consent nv-wide">
                <input type="checkbox" name="published" defaultChecked={p.published} />
                <span>Published on the public site</span>
              </label>
            </>
          ) : (
            <>
              <div className="nv-field nv-wide">
                <label>Programme title (French)</label>
                <input name="title" defaultValue={fr.title} required />
              </div>

              <div className="nv-field">
                <label>Price (EUR, one-off)</label>
                <input
                  name="price"
                  type="number"
                  min={0}
                  defaultValue={fr.price ?? ''}
                  placeholder="Leave blank to use English price"
                />
              </div>

              <div className="nv-field">
                <label>Level (French)</label>
                <input name="level" defaultValue={fr.level} required />
              </div>

              <div className="nv-field">
                <label>Duration (French)</label>
                <input name="weeks" defaultValue={fr.weeks} placeholder="4 semaines" />
              </div>

              <div className="nv-field">
                <label>Total live hours (French)</label>
                <input name="hours" defaultValue={fr.hours} placeholder="12 heures" />
              </div>

              <div className="nv-field nv-wide">
                <label>Short promise (French)</label>
                <input name="promise" defaultValue={fr.promise} />
              </div>

              <div className="nv-field nv-wide">
                <label>Programme description (French)</label>
                <textarea name="blurb" rows={3} defaultValue={fr.blurb} />
              </div>

              <div className="nv-field nv-wide">
                <label>What you will learn (one per line, French)</label>
                <textarea name="outcomes" rows={4} defaultValue={fr.outcomes} />
              </div>

              <div className="nv-field nv-wide">
                <label>Syllabus (one lesson per line: French title | description)</label>
                <textarea name="syllabus" rows={6} defaultValue={fr.syllabus} />
              </div>

              <div className="nv-field nv-wide">
                <label>SEO title (French, optional)</label>
                <input name="seoTitle" defaultValue={fr.seoTitle} maxLength={160} />
              </div>

              <div className="nv-field nv-wide">
                <label>SEO description (French, optional)</label>
                <input name="seoDescription" defaultValue={fr.seoDescription} maxLength={320} />
              </div>

              <p className="nv-admin-note nv-wide">
                French category, artwork, lesson count, intro lesson and publication status
                continue to use the English programme settings.
              </p>
            </>
          )}

          <div className="nv-admin-actions nv-wide">
            <button
              className="nv-btn nv-primary"
              type="submit"
              disabled={save.pending || !canEditPrices || (isNew && locale === 'fr')}
            >
              {save.pending
                ? 'Saving…'
                : locale === 'fr'
                  ? 'Save French translation'
                  : 'Save English programme'}
            </button>

            {locale === 'en' && !isNew ? (
              <button
                className="nv-btn nv-ghost"
                type="button"
                disabled={save.pending || !canEditPrices}
                onClick={() => {
                  if (!window.confirm('Delete this programme and all its sessions? Waiting-list entries are kept.')) return;

                  save.run(async () => {
                    await send('DELETE', '/api/admin/academy-programmes', { id: p.id });
                    setEditing('__new');
                    setLocale('en');
                    flash('Programme deleted');
                  });
                }}
              >
                Delete programme
              </button>
            ) : null}
          </div>

          {save.error ? <p className="nv-formerr nv-wide">{save.error}</p> : null}

          {!canEditPrices ? (
            <p className="nv-admin-note nv-wide">
              Saving programmes and prices needs a manager or admin role.
            </p>
          ) : null}
        </form>

        <p className="nv-admin-note">
          New programmes show on the Courses, Prices and Start dates pages as soon as they are published and have a session.
        </p>
      </div>
    </>
  );
}

/* ───────────────────────── Sessions & dates ───────────────────────── */

function Sessions({ programmes, flash }: Props & { flash: (t: string) => void }) {
  const [pid, setPid] = useState(programmes[0]?.id ?? '');
  const [sid, setSid] = useState('');
  const save = useSave();

  const prog = programmes.find((p) => p.id === pid);
  const list = prog?.sessions ?? [];
  const current = sid === '__new' ? undefined : list.find((s) => s.id === sid) ?? list[0];
  const isNew = sid === '__new' || !current;

  if (!programmes.length) {
    return (
      <>
        <Head eyebrow="Cohort management" title="Sessions & dates" copy="Add a programme first." />
        <div className="nv-admin-empty nv-card">No programmes yet.</div>
      </>
    );
  }

  return (
    <>
      <Head
        eyebrow="Cohort management"
        title="Sessions & dates"
        copy="Edit start dates, class times and seat capacity, or add a new cohort. Seats left = capacity minus seats taken."
      />

      <div className="nv-card nv-admin-panel">
        <div className="nv-admin-form">
          <div className="nv-field">
            <label>Programme</label>
            <select value={pid} onChange={(e) => { setPid(e.target.value); setSid(''); }}>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="nv-field">
            <label>Session</label>
            <select value={isNew ? '__new' : current!.id} onChange={(e) => setSid(e.target.value)}>
              {list.map((s) => (
                <option key={s.id} value={s.id}>
                  {fmtDate(s.startsOn)} · {s.days}{s.published ? '' : ' (hidden)'}
                </option>
              ))}
              <option value="__new">+ Add new session</option>
            </select>
          </div>
        </div>

        <form
          key={pid + (isNew ? '__new' : current!.id)}
          className="nv-admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            const f = new FormData(event.currentTarget);
            const text = (k: string) => String(f.get(k) ?? '').trim();

            save.run(async () => {
              await send('PUT', '/api/admin/academy-sessions', {
                id: isNew ? undefined : current!.id,
                programmeId: pid,
                startsOn: text('startsOn'),
                days: text('days'),
                time: text('time'),
                mode: text('mode'),
                seats: Number(f.get('seats')),
                taken: Number(f.get('taken')),
                published: f.get('published') === 'on',
              });

              if (isNew) setSid('');
              flash('Session saved');
            });
          }}
        >
          <div className="nv-field">
            <label>Start date</label>
            <input name="startsOn" type="date" defaultValue={current?.startsOn ?? ''} required />
          </div>

          <div className="nv-field">
            <label>Days</label>
            <input name="days" defaultValue={current?.days ?? ''} placeholder="Tue & Thu" required />
          </div>

          <div className="nv-field">
            <label>Time and timezone</label>
            <input name="time" defaultValue={current?.time ?? ''} placeholder="18:00–20:00 GMT" required />
          </div>

          <div className="nv-field">
            <label>Format</label>
            <input name="mode" defaultValue={current?.mode ?? 'Live online'} required />
          </div>

          <div className="nv-field">
            <label>Seat capacity</label>
            <input name="seats" type="number" min={1} defaultValue={current?.seats ?? 20} required />
          </div>

          <div className="nv-field">
            <label>Seats already taken</label>
            <input name="taken" type="number" min={0} defaultValue={current?.taken ?? 0} required />
          </div>

          <label className="nv-consent nv-wide">
            <input type="checkbox" name="published" defaultChecked={current?.published ?? true} />
            <span>Visible on the Start dates page</span>
          </label>

          <div className="nv-admin-actions nv-wide">
            <button className="nv-btn nv-primary" type="submit" disabled={save.pending}>
              {save.pending ? 'Saving…' : 'Save session'}
            </button>

            {!isNew ? (
              <button
                className="nv-btn nv-ghost"
                type="button"
                disabled={save.pending}
                onClick={() => {
                  if (!window.confirm('Delete this session?')) return;

                  save.run(async () => {
                    await send('DELETE', '/api/admin/academy-sessions', { id: current!.id });
                    setSid('');
                    flash('Session deleted');
                  });
                }}
              >
                Delete session
              </button>
            ) : null}
          </div>

          {save.error ? <p className="nv-formerr nv-wide">{save.error}</p> : null}
        </form>
      </div>
    </>
  );
}

/* ───────────────────────── Waiting lists ───────────────────────── */

const STATUSES = ['NEW', 'CONTACTED', 'ENROLLED', 'CANCELLED'];

function Waiting({
  programmes,
  registrations,
  flash,
}: Props & { flash: (t: string) => void }) {
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const save = useSave();

  const title = (id: string) => programmes.find((p) => p.id === id)?.title ?? 'Future programmes';

  const start = (r: AdminRegistration) => {
    const s = programmes.flatMap((p) => p.sessions).find((x) => x.id === r.sessionId);
    return s ? fmtDate(s.startsOn) : '';
  };

  const rows = registrations.filter(
    (r) =>
      (!cat || r.programmeId === cat) &&
      (!q.trim() || (r.name + r.email).toLowerCase().includes(q.trim().toLowerCase())),
  );

  const exportCsv = () => {
    if (!rows.length) return flash('Nothing to export.');

    const quote = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const head = [
      'Ref', 'Name', 'Email', 'Phone', 'Programme', 'Start date',
      'Experience', 'Goal', 'Status', 'Consent given', 'Confirmation emailed', 'Date',
    ];

    const lines = [head.map(quote).join(',')].concat(
      rows.map((r) => [
        r.ref, r.name, r.email, r.phone, title(r.programmeId), start(r),
        r.experience, r.message, r.status, r.consentAt, r.emailed ? 'yes' : 'no', r.createdAt,
      ].map(quote).join(',')),
    );

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'academy-waiting-list.csv';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <>
      <Head
        eyebrow="Enrolment"
        title="Waiting lists"
        copy="Search, filter and export pre-registrations."
        right={
          <button className="nv-btn nv-primary nv-sm" type="button" onClick={exportCsv}>
            Export CSV
          </button>
        }
      />

      <div className="nv-toolbar">
        <div className="nv-tabs">
          <button type="button" className={cat === '' ? 'nv-on' : undefined} onClick={() => setCat('')}>
            All programmes
          </button>
          {programmes.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cat === p.id ? 'nv-on' : undefined}
              onClick={() => setCat(p.id)}
            >
              {p.cat} ({registrations.filter((r) => r.programmeId === p.id).length})
            </button>
          ))}
        </div>

        <label className="nv-search">
          <span className="nv-muted">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" aria-label="Search" />
        </label>
      </div>

      <div className="nv-tablewrap">
        <table>
          <thead>
            <tr>
              <th>Ref</th><th>Name</th><th>Email</th><th>Programme</th><th>Start</th><th>Date</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((r) => (
              <tr key={r.id}>
                <td>{r.ref || '—'}</td>
                <td><b>{r.name}</b></td>
                <td>
                  <a href={'mailto:' + r.email} style={{ color: 'var(--cyan)' }}>{r.email}</a>
                  {r.phone ? <div className="nv-muted" style={{ fontSize: 12 }}>{r.phone}</div> : null}
                </td>
                <td>{title(r.programmeId)}</td>
                <td>{start(r)}</td>
                <td>
                  {r.createdAt}
                  <div className="nv-muted" style={{ fontSize: 11 }}>
                    {r.consentAt ? 'consent ' + r.consentAt : 'no consent'}{r.emailed ? ' · emailed' : ''}
                  </div>
                </td>
                <td>
                  <select
                    aria-label={'Status for ' + r.email}
                    defaultValue={r.status}
                    disabled={save.pending}
                    onChange={(e) => save.run(async () => {
                      await send('PATCH', '/api/admin/academy-registrations', { id: r.id, status: e.target.value });
                      flash('Status updated');
                    })}
                    style={{ minWidth: 130 }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button
                    className="nv-link"
                    type="button"
                    onClick={() => {
                      if (!window.confirm('Remove this pre-registration?')) return;
                      save.run(async () => {
                        await send('DELETE', '/api/admin/academy-registrations', { id: r.id });
                        flash('Removed');
                      });
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="nv-muted" style={{ padding: 28 }}>No pre-registrations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="nv-muted" style={{ marginTop: 16, fontSize: 13 }}>
        {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
      </p>
      {save.error ? <p className="nv-formerr">{save.error}</p> : null}
    </>
  );
}

/* ───────────────────────── Enrolments ───────────────────────── */

const tone = (status: string) =>
  status === 'APPROVED' || status === 'ENROLLED'
    ? 'nv-ok'
    : status === 'DECLINED' || status === 'CANCELLED'
      ? 'nv-full'
      : 'nv-low';

function Enrolments({
  programmes,
  enrolments,
  flash,
}: Props & { flash: (t: string) => void }) {
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState('');
  const save = useSave();

  const title = (id: string) => programmes.find((p) => p.id === id)?.title ?? id;
  const sessionOf = (e: AdminEnrolment) =>
    programmes.flatMap((p) => p.sessions).find((s) => s.id === e.sessionId);

  const when = (e: AdminEnrolment) => {
    const s = sessionOf(e);
    return s ? fmtDate(s.startsOn) + ' · ' + s.days : '';
  };

  const rows = enrolments.filter(
    (e) =>
      (!filter || e.status === filter) &&
      (!q.trim() || (e.name + e.email + e.ref).toLowerCase().includes(q.trim().toLowerCase())),
  );

  const current = enrolments.find((e) => e.id === openId);

  const exportCsv = () => {
    if (!rows.length) return flash('Nothing to export.');

    const quote = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const head = [
      'Ref', 'Name', 'Email', 'Phone', 'Programme', 'Session',
      'Status', 'Goal', 'Consent given', 'Requested',
    ];

    const lines = [head.map(quote).join(',')].concat(
      rows.map((e) => [
        e.ref, e.name, e.email, e.phone, title(e.programmeId), when(e),
        ENROLMENT_LABELS[e.status as keyof typeof ENROLMENT_LABELS] ?? e.status,
        e.goal, e.consentAt, e.createdAt,
      ].map(quote).join(',')),
    );

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'academy-enrolments.csv';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <>
      <Head
        eyebrow="Enrolment"
        title="Enrolment requests"
        copy="Review requests, approve or decline, and email the applicant. Approving takes one seat from the session."
        right={
          <button className="nv-btn nv-primary nv-sm" type="button" onClick={exportCsv}>
            Export CSV
          </button>
        }
      />

      <div className="nv-toolbar">
        <div className="nv-tabs">
          <button type="button" className={filter === '' ? 'nv-on' : undefined} onClick={() => setFilter('')}>
            All ({enrolments.length})
          </button>
          {ENROLMENT_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={filter === s ? 'nv-on' : undefined}
              onClick={() => setFilter(s)}
            >
              {ENROLMENT_LABELS[s]} ({enrolments.filter((e) => e.status === s).length})
            </button>
          ))}
        </div>

        <label className="nv-search">
          <span className="nv-muted">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or ref…" aria-label="Search" />
        </label>
      </div>

      <div className="nv-tablewrap">
        <table>
          <thead>
            <tr>
              <th>Ref</th><th>Applicant</th><th>Programme</th><th>Session</th><th>Requested</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((e) => (
              <tr key={e.id}>
                <td>{e.ref}</td>
                <td>
                  <b>{e.name}</b>
                  <div className="nv-muted" style={{ fontSize: 12 }}>{e.email}</div>
                </td>
                <td>{title(e.programmeId)}</td>
                <td>{when(e)}</td>
                <td>{e.createdAt}</td>
                <td>
                  <span className={'nv-pill ' + tone(e.status)}>
                    {ENROLMENT_LABELS[e.status as keyof typeof ENROLMENT_LABELS] ?? e.status}
                  </span>
                  {e.paymentStatus !== 'NONE' ? (
                    <>
                      {' '}
                      <span className={'nv-pill ' + (e.paymentStatus === 'PAID' ? 'nv-ok' : 'nv-low')}>
                        {e.paymentStatus === 'PAID'
                          ? `Paid ${money(e.amountPence / 100, (e.currency?.toUpperCase() === 'EUR' ? 'EUR' : 'GBP'))}${e.paymentIsTest ? ' (test)' : ''}`
                          : 'Awaiting payment'}
                      </span>
                    </>
                  ) : null}
                </td>
                <td>
                  <button className="nv-link" type="button" onClick={() => setOpenId(openId === e.id ? '' : e.id)}>
                    {openId === e.id ? 'Close' : 'Manage'}
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="nv-muted" style={{ padding: 28 }}>No enrolment requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {current ? (
        <div className="nv-card nv-admin-panel" style={{ marginTop: 20 }} key={current.id + current.status}>
          <div className="nv-admin-head">
            <div>
              <h3>{current.name} · {current.ref}</h3>
              <p className="nv-muted">{title(current.programmeId)} · {when(current)}</p>
            </div>
            <span className={'nv-pill ' + tone(current.status)}>
              {ENROLMENT_LABELS[current.status as keyof typeof ENROLMENT_LABELS] ?? current.status}
            </span>
          </div>

          <p style={{ fontSize: 14, margin: '0 0 12px' }}>
            <a href={'mailto:' + current.email} style={{ color: 'var(--cyan)' }}>{current.email}</a>
            {current.phone ? ' · ' + current.phone : ''}
            {current.consentAt ? <span className="nv-muted"> · consent given {current.consentAt}</span> : null}
          </p>

          {current.goal ? (
            <p className="nv-muted" style={{ fontSize: 14, margin: '0 0 16px' }}>“{current.goal}”</p>
          ) : null}

          <form
            className="nv-admin-form"
            onSubmit={(event) => {
              event.preventDefault();
              const f = new FormData(event.currentTarget);

              save.run(async () => {
                await send('PATCH', '/api/admin/academy-enrolments', {
                  id: current.id,
                  status: String(f.get('status')),
                  message: String(f.get('message') ?? '').trim() || undefined,
                  staffNote: String(f.get('staffNote') ?? '').trim(),
                  notify: f.get('notify') === 'on',
                });

                flash('Enrolment updated');
              });
            }}
          >
            <div className="nv-field">
              <label>Status</label>
              <select name="status" defaultValue={current.status}>
                {ENROLMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{ENROLMENT_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <label className="nv-consent">
              <input type="checkbox" name="notify" defaultChecked />
              <span>Email the applicant about a status change</span>
            </label>

            <div className="nv-field nv-wide">
              <label>Message to the applicant (included in the email, optional)</label>
              <textarea name="message" rows={2} maxLength={1000} />
            </div>

            <div className="nv-field nv-wide">
              <label>Internal note (never shown to the applicant)</label>
              <textarea name="staffNote" rows={2} maxLength={2000} defaultValue={current.staffNote} />
            </div>

            <div className="nv-admin-actions nv-wide">
              <button className="nv-btn nv-primary" type="submit" disabled={save.pending}>
                {save.pending ? 'Saving…' : 'Save'}
              </button>

              <button
                className="nv-btn nv-ghost"
                type="button"
                disabled={save.pending}
                onClick={() => {
                  if (!window.confirm('Delete this request permanently?')) return;

                  save.run(async () => {
                    await send('DELETE', '/api/admin/academy-enrolments', { id: current.id });
                    setOpenId('');
                    flash('Deleted');
                  });
                }}
              >
                Delete
              </button>
            </div>
          </form>

          <p className="nv-muted" style={{ fontSize: 12, margin: '14px 0 6px' }}>History</p>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#b4c3d8' }}>
            {current.history.map((h, i) => (
              <li key={i}>
                {ENROLMENT_LABELS[h.status as keyof typeof ENROLMENT_LABELS] ?? h.status}
                <span className="nv-muted">
                  {' '}· {h.at} · {h.by}{h.note ? ' · “' + h.note + '”' : ''}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {save.error ? <p className="nv-formerr">{save.error}</p> : null}
    </>
  );
}
