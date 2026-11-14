'use client';

import { useState, type ReactNode } from 'react';
import { RecordDrawer } from './record-drawer';

export function CreateDrawer({
  label,
  title,
  kicker = 'Create',
  fab = true,
  children,
}: {
  label: string;
  title: string;
  kicker?: string;
  fab?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="ws-btn primary" onClick={() => setOpen(true)}>
        {label}
      </button>
      {fab ? (
        <button type="button" className="ws-fab" onClick={() => setOpen(true)}>
          {label}
        </button>
      ) : null}
      <RecordDrawer open={open} title={title} kicker={kicker} onClose={() => setOpen(false)}>
        {children}
      </RecordDrawer>
    </>
  );
}
