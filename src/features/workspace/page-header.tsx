'use client';

import type { ReactNode } from 'react';
import { EmptyArt } from './row-menu';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="ws-pagehead">
      <div>
        <p className="ws-kicker">{eyebrow}</p>
        <h1 className="ws-title">{title}</h1>
        <p className="ws-copy">{description}</p>
      </div>
      {actions ? <div className="ws-pagehead-actions">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="ws-empty-card" role="status">
      <EmptyArt />
      <strong>{title}</strong>
      <p>{copy}</p>
      {action}
    </div>
  );
}
