import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('ws-card', className)}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="ws-card">
      <span className="ws-hint">{label}</span>
      <div className="ws-kpi-value">{value}</div>
      <span className="ws-hint">{hint}</span>
    </article>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'ok' | 'warn' | 'bad' | 'neutral';
}) {
  return <span className={cn('status-pill', tone)}>{children}</span>;
}

export function Badge({
  children,
  tone = 'blue',
}: {
  children: ReactNode;
  tone?: 'blue' | 'gold' | 'red';
}) {
  return <span className={cn('ws-badge', tone !== 'blue' && tone)}>{children}</span>;
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="ws-progress" aria-label={`${value}% complete`}>
      <i style={{ width: `${value}%` }} />
    </div>
  );
}

export function Bars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="ws-bars" aria-hidden="true">
      {values.map((value, index) => (
        <span key={index} style={{ height: `${Math.round((value / max) * 100)}%` }} />
      ))}
    </div>
  );
}

export function Action({
  href,
  children,
  primary,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link href={href} className={cn('ws-btn', primary && 'primary')}>
      {children}
    </Link>
  );
}
