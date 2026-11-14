'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';
import type { WorkspaceRole } from '@/lib/workspace-ia';
import { cn } from '@/lib/utils';
import { CommandPalette } from './command-palette';
import { WorkspaceSidebar } from './sidebar';
import { WorkspaceTopbar, type ActivityItem } from './topbar';

export function WorkspaceShell({
  variant,
  children,
  name,
  email,
  role: _role,
  activity = [],
  className,
  adminBase,
}: {
  variant: WorkspaceRole;
  children: ReactNode;
  name: string;
  email: string;
  role: string;
  activity?: ActivityItem[];
  className?: string;
  adminBase?: string;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [command, setCommand] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    setCollapsed(window.localStorage.getItem('nevie-sidebar') === '1');
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [variant]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommand((value) => !value);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        if (window.matchMedia('(max-width: 1024px)').matches) {
          setMobileOpen((value) => !value);
          return;
        }
        setCollapsed((value) => {
          const next = !value;
          window.localStorage.setItem('nevie-sidebar', next ? '1' : '0');
          return next;
        });
      }
      if (event.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function logout() {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div
      className={cn(
        collapsed ? 'ws-root collapsed' : 'ws-root',
        mobileOpen ? 'mobile-nav' : undefined,
        className,
      )}
    >
      {mobileOpen ? (
        <button
          type="button"
          className="ws-nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <WorkspaceSidebar
        variant={variant}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggle={() => {
          setCollapsed((value) => {
            const next = !value;
            window.localStorage.setItem('nevie-sidebar', next ? '1' : '0');
            return next;
          });
        }}
        onSignOut={logout}
        adminBase={adminBase}
      />
      <div className="ws-main">
        <WorkspaceTopbar
          variant={variant}
          name={name}
          email={email}
          activity={activity}
          adminBase={adminBase}
          onMenu={() => setMobileOpen((value) => !value)}
          menuOpen={mobileOpen}
          onCommand={() => {
            setCommandQuery('');
            setCommand(true);
          }}
          onSearch={(query) => {
            setCommandQuery(query);
            setCommand(true);
          }}
        />
        <div className="ws-body">{children}</div>
      </div>
      <CommandPalette
        open={command}
        onClose={() => setCommand(false)}
        variant={variant}
        initialQuery={commandQuery}
        adminBase={adminBase}
      />
    </div>
  );
}
