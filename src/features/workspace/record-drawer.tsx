'use client';

import { useEffect, type ReactNode } from 'react';

export function RecordDrawer({
  open,
  title,
  kicker = 'Details',
  badge,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  kicker?: string;
  badge?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-root" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="drawer-backdrop" aria-label="Close details" onClick={onClose} />
      <aside className="drawer-panel">
        <header className="drawer-head">
          <div>
            <p className="ws-kicker">{kicker}</p>
            <h2>{title}</h2>
          </div>
          {badge}
        </header>
        <div className="drawer-body">{children}</div>
        <footer className="drawer-foot">
          <button type="button" className="ws-btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
}
