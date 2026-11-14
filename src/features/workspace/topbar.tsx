'use client';

import { Bell, Command, Languages, Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import type { WorkspaceRole } from '@/lib/workspace-ia';

export type ActivityItem = {
  id: string;
  action: string;
  entity: string;
  actor: string;
  createdAt: string;
};

export function WorkspaceTopbar({
  variant,
  name,
  email,
  onCommand,
  onSearch,
  onMenu,
  menuOpen = false,
  activity,
}: {
  variant: WorkspaceRole;
  name: string;
  email: string;
  onCommand: () => void;
  onSearch: (query: string) => void;
  onMenu?: () => void;
  menuOpen?: boolean;
  activity: ActivityItem[];
  adminBase?: string;
}) {
  const [open, setOpen] = useState(false);
  const initials = useMemo(
    () =>
      name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    [name],
  );

  return (
    <header className="ws-top">
      {onMenu ? (
        <button
          type="button"
          className="ws-iconbtn ws-menu-btn"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={onMenu}
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      ) : null}
      <form
        className="ws-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(String(new FormData(event.currentTarget).get('q') || '').trim());
        }}
      >
        <button type="button" className="ws-iconbtn" onClick={onCommand} aria-label="Open command palette">
          <Command size={15} />
        </button>
        <input
          name="q"
          placeholder={variant === 'admin' ? 'Search records' : 'Search your account'}
          aria-label="Search"
        />
        <kbd className="ws-kbd">Ctrl K</kbd>
      </form>
      <div className="ws-top-actions">
        <span className="ws-chip" title="Locale">
          <Languages size={13} />
          <span className="ws-chip-label">EN-GB</span>
        </span>
        <ThemeToggle className="ws-iconbtn" />
        <div className="ws-bell-wrap">
          <button
            type="button"
            className="ws-iconbtn"
            aria-expanded={open}
            aria-label="Notifications"
            onClick={() => setOpen((value) => !value)}
          >
            <Bell size={16} />
            {activity.length > 0 ? <i className="ws-dot" /> : null}
          </button>
          {open ? (
            <div className="ws-pop" role="menu">
              <p className="ws-pop-title">Notifications</p>
              {activity.length === 0 ? (
                <p className="ws-hint">Nothing waiting.</p>
              ) : (
                activity.map((item) => (
                  <div key={item.id} className="ws-pop-row">
                    <strong>{item.action}</strong>
                    <span>
                      {item.actor} {item.entity}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
        <div className="ws-profile" title={email}>
          <span className="ws-avatar">{initials || 'NG'}</span>
          <span className="ws-profile-meta">
            <strong>{name.split(' ')[0]}</strong>
            <small>{variant === 'admin' ? 'Operator' : 'Account'}</small>
          </span>
        </div>
      </div>
    </header>
  );
}
