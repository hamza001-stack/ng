import type { ReactNode } from 'react';

export function ShowcaseEmpty({
  eyebrow,
  title,
  copy,
  actions,
  variant = 'studies',
}: {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: ReactNode;
  variant?: 'studies' | 'projects' | 'search';
}) {
  return (
    <div className="sx-empty">
      <svg className="sx-empty-art" viewBox="0 0 240 160" aria-hidden="true">
        <defs>
          <linearGradient id={`sx-empty-${variant}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--electric)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--gold)" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <circle cx="120" cy="80" r="70" fill="var(--electric)" opacity="0.06" />
        {variant === 'projects' ? (
          <>
            <rect x="46" y="44" width="148" height="12" rx="6" className="sx-empty-line" />
            <rect x="46" y="44" width="62" height="12" rx="6" fill={`url(#sx-empty-${variant})`} />
            <rect x="46" y="74" width="148" height="12" rx="6" className="sx-empty-line" />
            <rect x="46" y="74" width="104" height="12" rx="6" fill={`url(#sx-empty-${variant})`} opacity="0.7" />
            <rect x="46" y="104" width="148" height="12" rx="6" className="sx-empty-line" />
            <rect x="46" y="104" width="28" height="12" rx="6" fill={`url(#sx-empty-${variant})`} opacity="0.5" />
          </>
        ) : variant === 'search' ? (
          <>
            <circle cx="108" cy="74" r="30" fill="none" stroke={`url(#sx-empty-${variant})`} strokeWidth="8" />
            <path d="M130 96 L162 128" stroke={`url(#sx-empty-${variant})`} strokeWidth="10" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="58" y="34" width="124" height="92" rx="14" className="sx-empty-card" />
            <rect x="58" y="34" width="124" height="40" rx="14" fill={`url(#sx-empty-${variant})`} opacity="0.85" />
            <rect x="72" y="86" width="72" height="8" rx="4" className="sx-empty-line" />
            <rect x="72" y="102" width="96" height="8" rx="4" className="sx-empty-line" />
            <path d="M160 58 l10 -10 l10 10" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span className="sx-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      {actions ? <div className="sx-actions center">{actions}</div> : null}
    </div>
  );
}
