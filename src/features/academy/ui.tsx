import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  fmtDate,
  money,
  nextSession,
  seatsLeft,
  type AcademyTheme,
  type Programme,
  type ProgrammeSession,
} from '@/lib/academy-defaults';

/* ───────── artwork (original inline SVG from the approved design) ───────── */

export function ProgrammeArt({ theme }: { theme: AcademyTheme }) {
  if (theme === 'code') {
    return (
      <svg className="nv-art" viewBox="0 0 240 160" aria-hidden="true">
        <rect x="28" y="22" width="184" height="116" rx="10" fill="#07131f" stroke="#2b7fa3" strokeWidth="1.5" />
        <path d="M28 44h184" stroke="#2b7fa3" />
        <circle cx="44" cy="33" r="3.5" fill="#ff6b6b" />
        <circle cx="57" cy="33" r="3.5" fill="#f7c96b" />
        <circle cx="70" cy="33" r="3.5" fill="#4ade80" />
        <g strokeWidth="5" strokeLinecap="round">
          <path d="M46 62h40" stroke="#0aa0ff" />
          <path d="M94 62h54" stroke="#9db0c8" opacity=".6" />
          <path d="M58 78h64" stroke="#f7c96b" />
          <path d="M130 78h30" stroke="#9db0c8" opacity=".6" />
          <path d="M58 94h34" stroke="#9db0c8" opacity=".6" />
          <path d="M100 94h50" stroke="#0aa0ff" />
          <path d="M46 110h28" stroke="#4ade80" />
        </g>
        <text x="196" y="126" textAnchor="end" className="t-d" fontWeight="700" fontSize="20" fill="#0aa0ff">
          &lt;/&gt;
        </text>
      </svg>
    );
  }
  if (theme === 'auto') {
    return (
      <svg className="nv-art" viewBox="0 0 240 160" aria-hidden="true">
        <g fill="#14202f" stroke="#f7c96b" strokeWidth="1.5">
          <rect x="14" y="48" width="54" height="48" rx="10" />
          <rect x="93" y="48" width="54" height="48" rx="10" />
          <rect x="172" y="48" width="54" height="48" rx="10" fill="#f7c96b" fillOpacity=".18" />
        </g>
        <g stroke="#f7c96b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M68 72h25M147 72h25" />
          <path d="M87 66l6 6-6 6M166 66l6 6-6 6" />
          <path d="M188 72l8 8 16-16" />
        </g>
        <g stroke="#0aa0ff" strokeWidth="2" fill="none" strokeLinecap="round">
          <circle cx="41" cy="72" r="10" />
          <path d="M41 66v6l4 3" />
          <circle cx="120" cy="72" r="9" />
          <circle cx="120" cy="72" r="3" fill="#0aa0ff" />
        </g>
        <path d="M199 104v22H41v-22" fill="none" stroke="#4a5d7a" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M36 111l5-7 5 7" fill="none" stroke="#4a5d7a" strokeWidth="1.5" />
        <text x="120" y="146" textAnchor="middle" className="t-b" fontSize="10" fill="#9db0c8">
          retry &amp; alert on failure
        </text>
      </svg>
    );
  }
  return (
    <svg className="nv-art" viewBox="0 0 240 160" aria-hidden="true">
      <defs>
        <radialGradient id="nv-ga">
          <stop offset="0" stopColor="#0aa0ff" stopOpacity=".55" />
          <stop offset="1" stopColor="#0aa0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="80" r="76" fill="url(#nv-ga)" />
      <g stroke="#4aa8ff" strokeWidth="1.5" opacity=".75">
        <path d="M120 80L48 38M120 80L56 124M120 80L192 34M120 80L198 120M120 80L120 16M120 80L120 146" />
        <path d="M48 38L56 124M192 34L198 120" opacity=".4" />
      </g>
      <g fill="#0a1a3d" stroke="#0aa0ff" strokeWidth="2">
        <circle cx="48" cy="38" r="8" />
        <circle cx="56" cy="124" r="8" />
        <circle cx="192" cy="34" r="8" />
        <circle cx="198" cy="120" r="8" />
        <circle cx="120" cy="16" r="6" />
        <circle cx="120" cy="146" r="6" />
      </g>
      <circle cx="120" cy="80" r="26" fill="#0aa0ff" />
      <text x="120" y="88" textAnchor="middle" className="t-d" fontWeight="700" fontSize="22" fill="#fff">
        AI
      </text>
    </svg>
  );
}

export function HeroArt({ programmes }: { programmes: Programme[] }) {
  const colours: Record<AcademyTheme, string> = { ai: '#0aa0ff', code: '#2dd4bf', auto: '#f7c96b' };
  const marks: Record<AcademyTheme, string> = { ai: 'AI', code: '</>', auto: '⚙' };
  const rows = programmes.slice(0, 3);
  return (
    <svg className="nv-heroart" viewBox="0 0 520 400" role="img" aria-label="Illustration of a learning dashboard showing the programmes">
      <defs>
        <radialGradient id="nv-gh">
          <stop offset="0" stopColor="#0aa0ff" stopOpacity=".33" />
          <stop offset="1" stopColor="#0aa0ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nv-gp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12284a" />
          <stop offset="1" stopColor="#091426" />
        </linearGradient>
      </defs>
      <circle cx="260" cy="200" r="195" fill="url(#nv-gh)" />
      <rect x="80" y="60" width="360" height="270" rx="20" fill="url(#nv-gp)" stroke="#2a4a78" />
      <text x="110" y="98" className="t-d" fontSize="12" letterSpacing="2.5" fill="#0aa0ff">
        YOUR LEARNING PATH
      </text>
      {rows.map((p, i) => {
        const y = 120 + i * 58;
        const col = colours[p.theme];
        const w = [150, 110, 190][i] ?? 150;
        return (
          <g key={p.id}>
            <rect x="110" y={y} width="300" height="46" rx="10" fill="#0a1a30" stroke="#20406a" />
            <circle cx="138" cy={y + 23} r="14" fill={col} />
            <text x="138" y={y + 27} textAnchor="middle" className="t-d" fontWeight="700" fontSize="10" fill="#04101f">
              {marks[p.theme]}
            </text>
            <text x="164" y={y + 20} className="t-b" fontSize="13" fontWeight="500" fill="#e9eff8">
              {p.title.length > 34 ? p.title.slice(0, 33) + '…' : p.title}
            </text>
            <rect x="164" y={y + 28} width="230" height="5" rx="2.5" fill="#1c3354" />
            <rect x="164" y={y + 28} width={w} height="5" rx="2.5" fill={col} />
          </g>
        );
      })}
      <text x="110" y="310" className="t-b" fontSize="12" fill="#9db0c8">
        Live classes · real projects · clear start dates
      </text>
      <rect x="300" y="22" width="170" height="40" rx="20" fill="#0aa0ff" />
      <circle cx="324" cy="42" r="5" fill="#fff" />
      <text x="338" y="47" className="t-b" fontSize="14" fontWeight="700" fill="#fff">
        Live classes
      </text>
      <rect x="26" y="290" width="190" height="40" rx="20" fill="#f7c96b" />
      <text x="121" y="315" textAnchor="middle" className="t-b" fontSize="14" fontWeight="700" fill="#1a1405">
        ✓ Certificate path
      </text>
      <rect x="330" y="344" width="150" height="38" rx="19" fill="#0d1b30" stroke="#2a4a78" />
      <text x="405" y="368" textAnchor="middle" className="t-b" fontSize="13" fill="#e9eff8">
        Free to pre-register
      </text>
    </svg>
  );
}

export function SealArt() {
  return (
    <svg className="nv-seal" viewBox="0 0 120 140" aria-hidden="true">
      <path d="M38 84L26 132l34-18 34 18-12-48" fill="#2a2210" stroke="#f7c96b" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="60" cy="52" r="42" fill="#1d1a10" stroke="#f7c96b" strokeWidth="2" />
      <circle cx="60" cy="52" r="32" fill="none" stroke="#f7c96b" strokeWidth="1" strokeDasharray="3 4" />
      <path d="M44 53l11 11 22-24" fill="none" stroke="#f7c96b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  video: (<><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></>),
  project: <path d="M3 7h6l2 2h10v10H3z" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  award: (<><circle cx="12" cy="9" r="6" /><path d="M8.5 14L7 21l5-3 5 3-1.5-7" /></>),
  pick: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></>),
  form: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>),
  go: (<><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>),
  cal: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  book: <path d="M4 5h7a3 3 0 013 3v12a2 2 0 00-2-2H4zM20 5h-6" />,
};

export function Icon({ name }: { name: keyof typeof ICONS }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>;
}

/* ───────── shared blocks ───────── */

export function PageHero({ crumb, title, sub }: { crumb: string; title: string; sub: string }) {
  return (
    <div className="nv-pagehero">
      <div className="nv-wrap">
        <div className="nv-crumbs">
          <Link href="/academy">Home</Link>
          <span>›</span>
          <span>{crumb}</span>
        </div>
        <div className="nv-eyebrow">Learn / Apply / Advance</div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
    </div>
  );
}

export const enrolHref = (programmeId?: string, sessionId?: string) => {
  const q = new URLSearchParams();
  if (programmeId) q.set('programme', programmeId);
  if (sessionId) q.set('session', sessionId);
  const s = q.toString();
  return '/academy/enrol' + (s ? '?' + s : '');
};

export const registerHref = (programmeId?: string, sessionId?: string) => {
  const q = new URLSearchParams();
  if (programmeId) q.set('programme', programmeId);
  if (sessionId) q.set('session', sessionId);
  const s = q.toString();
  return '/academy/pre-registration' + (s ? '?' + s : '');
};

export function SeatPill({ session }: { session: ProgrammeSession }) {
  const left = seatsLeft(session);
  if (left === 0) return <span className="nv-pill nv-full">Full · waiting list</span>;
  if (left <= 5) return <span className="nv-pill nv-low">Only {left} seats left</span>;
  return <span className="nv-pill nv-ok">{left} seats left</span>;
}

const themeClass = { ai: 'nv-b-ai', code: 'nv-b-code', auto: 'nv-b-auto' } as const;
export const themeBg = (t: AcademyTheme) => themeClass[t] ?? themeClass.ai;

export function CourseCard({ p }: { p: Programme }) {
  const ns = nextSession(p);
  return (
    <article className="nv-card nv-course">
      <Link href={`/academy/courses/${p.id}`} className={'nv-cart ' + themeBg(p.theme)} aria-label={p.title}>
        <ProgrammeArt theme={p.theme} />
      </Link>
      <div className="nv-cbody">
        <div className="nv-top">
          <span>{p.level}</span>
          {p.intro ? <span className="nv-tag nv-gold">Free intro lesson</span> : <span className="nv-tag">Project-based</span>}
        </div>
        <h3>
          <Link href={`/academy/courses/${p.id}`}>{p.title}</Link>
        </h3>
        <p>
          <b style={{ color: 'var(--text)' }}>{p.promise}</b> {p.blurb}
        </p>
        <div className="nv-facts">
          <span><small>Length</small>{p.weeks} · {p.hours}</span>
          <span><small>Next start</small>{ns ? fmtDate(ns.startsOn) : 'To be announced'}</span>
          <span><small>Lessons</small>{p.lessons} live lessons</span>
          <span><small>Format</small>{ns?.mode ?? 'Live online'}</span>
        </div>
        <div className="nv-price"><b>{money(p.price, p.currency)}</b><span>one-off, per learner</span></div>
        <div className="nv-actions">
          <Link className="nv-btn nv-ghost nv-sm" href={`/academy/courses/${p.id}`}>Details</Link>
          <Link className="nv-btn nv-primary nv-sm" href={registerHref(p.id)}>Pre-register</Link>
        </div>
      </div>
    </article>
  );
}

/** The programme with the most lessons is highlighted as "most in-depth". */
export function PlansGrid({ programmes }: { programmes: Programme[] }) {
  const hotId = programmes.length > 1 ? [...programmes].sort((a, b) => b.lessons - a.lessons)[0].id : null;
  return (
    <div className="nv-plans">
      {programmes.map((p) => {
        const hot = p.id === hotId;
        return (
          <div className={'nv-card nv-plan ' + (hot ? 'nv-hot' : '')} key={p.id}>
            {hot ? <span className="nv-badge">MOST IN-DEPTH</span> : null}
            <span className={'nv-eyebrow ' + (hot ? 'nv-gold' : '')}>{p.cat}</span>
            <h3>{p.title}</h3>
            <small className="nv-muted">{p.level} · {p.weeks}</small>
            <div className="nv-amt">{money(p.price, p.currency)}</div>
            <small className="nv-muted">one-off · no payment today</small>
            <ul>
              <li>{p.lessons} live lessons · {p.hours}</li>
              <li>{p.sessions.length} start date{p.sessions.length === 1 ? '' : 's'} to choose from</li>
              <li>{p.intro ? 'Free introductory lesson' : 'Build a full project to present'}</li>
              <li>Tutor feedback on your work</li>
              <li>Certificate with eligible assessed programmes</li>
            </ul>
            <Link className={'nv-btn nv-block ' + (hot ? 'nv-gold' : 'nv-primary')} href={registerHref(p.id)}>Pre-register free</Link>
            <Link className="nv-link" style={{ marginTop: 16, justifyContent: 'center' }} href={`/academy/courses/${p.id}`}>See full programme</Link>
          </div>
        );
      })}
    </div>
  );
}

export function ScheduleTable({ programmes }: { programmes: Programme[] }) {
  const rows = programmes
    .flatMap((p) => p.sessions.map((s) => ({ p, s })))
    .sort((a, b) => a.s.startsOn.localeCompare(b.s.startsOn));
  if (!rows.length) return <p className="nv-muted">New start dates will be announced soon. Pre-register to be told first.</p>;
  return (
    <div className="nv-tablewrap">
      <table>
        <thead>
          <tr><th>Programme</th><th>Starts</th><th>Days</th><th>Time</th><th>Format</th><th>Seats</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map(({ p, s }) => (
            <tr key={s.id}>
              <td><b>{p.title}</b><br /><small className="nv-muted">{p.level} · {money(p.price, p.currency)}</small></td>
              <td>{fmtDate(s.startsOn)}</td>
              <td>{s.days}</td>
              <td>{s.time}</td>
              <td>{s.mode}</td>
              <td><SeatPill session={s} /></td>
              <td>
                <Link className="nv-btn nv-primary nv-sm" href={enrolHref(p.id, s.id)}>
                  {seatsLeft(s) ? 'Request a place' : 'Join waiting list'}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Faq({ items }: { items: [string, string][] }) {
  return (
    <>
      {items.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </>
  );
}
