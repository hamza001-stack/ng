'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';

export type RowMenuItem = {
  label: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
};

export function RowMenu({ items, label = 'Actions' }: { items: RowMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="ws-kebab" ref={ref}>
      <button
        type="button"
        className="ws-iconbtn"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={16} />
      </button>
      {open ? (
        <div className="ws-kebab-menu" role="menu">
          {items.map((item) => {
            const className = item.danger ? 'danger' : undefined;
            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={className}
                  role="menuitem"
                  target={item.href.startsWith('/') ? undefined : '_blank'}
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              );
            }
            return (
              <button
                key={item.label}
                type="button"
                className={className}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function initials(name: string) {
  return (
    name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'NG'
  );
}

export function AvatarMark({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return <img className="ws-avatar" src={image} alt="" width={28} height={28} />;
  }
  return <span className="ws-avatar">{initials(name)}</span>;
}

export function EmptyArt({ children }: { children?: ReactNode }) {
  return (
    <svg className="ws-empty-art" viewBox="0 0 120 72" aria-hidden="true">
      <rect x="8" y="18" width="104" height="42" rx="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="20" y="30" width="40" height="6" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="20" y="42" width="64" height="6" rx="3" fill="currentColor" opacity="0.18" />
      <circle cx="96" cy="36" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {children}
    </svg>
  );
}
