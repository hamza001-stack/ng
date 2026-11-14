'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { adminNav, userNav, type WorkspaceRole } from '@/lib/workspace-ia';
import { NavGlyph } from './nav-icons';
import { adminHref } from '@/lib/admin-path';

function groups(variant: WorkspaceRole) {
  const nav = (variant === 'admin' ? adminNav : userNav).filter(
    (item) => item.section !== 'settings' && item.section !== 'profile',
  );
  const order: string[] = [];
  const map = new Map<string, typeof nav>();
  for (const item of nav) {
    if (!map.has(item.group)) {
      map.set(item.group, []);
      order.push(item.group);
    }
    map.get(item.group)!.push(item);
  }
  return order.map((group) => ({ group, items: map.get(group)! }));
}

export function WorkspaceSidebar({
  variant,
  collapsed,
  mobileOpen = false,
  onToggle,
  onCloseMobile,
  onSignOut,
  adminBase = '/admin',
}: {
  variant: WorkspaceRole;
  collapsed: boolean;
  mobileOpen?: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
  onSignOut: () => void;
  adminBase?: string;
}) {
  const pathname = usePathname();
  const home = variant === 'admin' ? adminBase : '/dashboard';
  const settingsHref = variant === 'admin' ? adminHref('/admin/settings', adminBase) : '/dashboard/settings';
  const profileHref = variant === 'admin' ? '/dashboard/profile' : '/dashboard/profile';

  return (
    <aside
      className={[collapsed ? 'ws-side collapsed' : 'ws-side', mobileOpen ? 'open' : ''].filter(Boolean).join(' ')}
      aria-label="Primary"
    >
      <div className="ws-side-top">
        <Link href={home} className="ws-brand" title="NEVIE-GLOBAL UK" onClick={onCloseMobile}>
          <Image src="/brand/logo.webp" alt="" width={28} height={28} />
          {collapsed && !mobileOpen ? null : (
            <span>
              NEVIE
              <small>{variant === 'admin' ? 'Console' : 'Account'}</small>
            </span>
          )}
        </Link>
        <button
          type="button"
          className="ws-iconbtn ws-side-collapse"
          onClick={onToggle}
          aria-pressed={collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
      <p className="ws-workspace-chip">{collapsed && !mobileOpen ? 'NG' : 'NEVIE · United Kingdom'}</p>
      <nav className="ws-nav" aria-label={variant === 'admin' ? 'Console' : 'Account'}>
        {groups(variant).map((section) => (
          <div key={section.group} className="ws-nav-group">
            {collapsed && !mobileOpen ? null : <p className="ws-nav-label">{section.group}</p>}
            {section.items.map((item) => {
              const href = adminHref(item.href, adminBase);
              const active =
                href === home
                  ? pathname === home
                  : pathname === href || pathname.startsWith(href + '/');
              if (item.children?.length && !(collapsed && !mobileOpen)) {
                return (
                  <NavParent
                    key={item.href}
                    item={item}
                    active={active}
                    pathname={pathname}
                    adminBase={adminBase}
                    onNavigate={onCloseMobile}
                  />
                );
              }
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={active ? 'active' : undefined}
                  aria-current={active ? 'page' : undefined}
                  title={item.label}
                  onClick={onCloseMobile}
                >
                  <span className="ws-nav-ico">
                    <NavGlyph icon={item.icon} />
                  </span>
                  {collapsed && !mobileOpen ? null : <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="ws-side-pin">
        <Link
          href={settingsHref}
          className={pathname.startsWith(settingsHref) ? 'active' : undefined}
          onClick={onCloseMobile}
        >
          <span className="ws-nav-ico">
            <NavGlyph icon="settings" />
          </span>
          {collapsed && !mobileOpen ? null : <span>Settings</span>}
        </Link>
        <Link
          href={profileHref}
          className={pathname === profileHref ? 'active' : undefined}
          onClick={onCloseMobile}
        >
          <span className="ws-nav-ico">
            <NavGlyph icon="profile" />
          </span>
          {collapsed && !mobileOpen ? null : <span>Profile</span>}
        </Link>
        <button type="button" className="ws-signout" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </aside>
  );
}

/** A sidebar item with a collapsible list of sub-pages (e.g. Academy). */
function NavParent({
  item,
  active,
  pathname,
  adminBase,
  onNavigate,
}: {
  item: (typeof adminNav)[number];
  active: boolean;
  pathname: string;
  adminBase: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const subs = item.children ?? [];
  const current = subs
    .map((sub) => adminHref(sub.href, adminBase))
    .filter((h) => pathname === h || pathname.startsWith(h + '/'))
    .sort((a, b) => b.length - a.length)[0];
  return (
    <>
      <button
        type="button"
        className={'ws-nav-toggle' + (active ? ' has-active' : '')}
        aria-expanded={open}
        aria-controls={'sub-' + item.section}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ws-nav-ico">
          <NavGlyph icon={item.icon} />
        </span>
        <span>{item.label}</span>
        <ChevronRight size={14} className="ws-chev" />
      </button>
      {open ? (
        <div className="ws-sub" id={'sub-' + item.section}>
          {subs.map((sub) => {
            const subHref = adminHref(sub.href, adminBase);
            const on = subHref === current;
            return (
              <Link
                key={sub.href}
                href={subHref}
                className={on ? 'active' : undefined}
                aria-current={on ? 'page' : undefined}
                onClick={onNavigate}
              >
                {sub.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
