'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { adminNav, userNav, type WorkspaceRole } from '@/lib/workspace-ia';
import { NavGlyph } from './nav-icons';
import { adminHref } from '@/lib/admin-path';

type Hit = {
  href: string;
  label: string;
  description: string;
  group: string;
};

export function CommandPalette({
  open,
  onClose,
  variant,
  initialQuery = '',
  adminBase = '/admin',
}: {
  open: boolean;
  onClose: () => void;
  variant: WorkspaceRole;
  initialQuery?: string;
  adminBase?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const items = variant === 'admin' ? adminNav : userNav;
  const pages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [items, query]);
  const groupedHits = useMemo(() => {
    const groups = new Map<string, Hit[]>();
    for (const hit of hits) {
      const rows = groups.get(hit.group) || [];
      rows.push(hit);
      groups.set(hit.group, rows);
    }
    return [...groups.entries()];
  }, [hits]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setHits([]);
      return;
    }
    setQuery(initialQuery);
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const path =
          variant === 'admin'
            ? `/api/admin/command?q=${encodeURIComponent(q)}`
            : `/api/search?q=${encodeURIComponent(q)}`;
        const response = await fetch(path, { signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data) return;
        if (variant === 'admin') {
          setHits(Array.isArray(data.hits) ? data.hits : []);
          return;
        }
        const products = Array.isArray(data.products) ? data.products : [];
        setHits(
          products.map((product: { id: string; name: string; category: string }) => ({
            href: `/marketplace/${product.id}`,
            label: product.name,
            description: product.category,
            group: 'Products',
          })),
        );
      } catch {
        /* aborted or network */
      }
    }, 160);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query, variant]);

  if (!open) return null;

  const go = (href: string) => {
    router.push(adminHref(href, adminBase));
    onClose();
  };

  const first = pages[0] || hits[0];

  return (
    <div className="cmd-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
      <button className="cmd-backdrop" type="button" aria-label="Close command palette" onClick={onClose} />
      <div className="cmd-panel">
        <div className="cmd-search">
          <Search size={16} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={variant === 'admin' ? 'Search products, leads, orders, pages…' : 'Search pages and products'}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose();
              if (event.key === 'Enter' && first) go(first.href);
            }}
          />
          <kbd>esc</kbd>
        </div>
        <ul className="cmd-list">
          {pages.length > 0 ? (
            <>
              <li className="cmd-group">Pages</li>
              {pages.map((item) => (
                <li key={item.href}>
                  <button type="button" onClick={() => go(item.href)}>
                    <NavGlyph icon={item.icon} />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    {item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
                  </button>
                </li>
              ))}
            </>
          ) : null}
          {groupedHits.map(([group, rows]) => (
            <li key={group}>
              <p className="cmd-group">{group}</p>
              {rows.map((item) => (
                <button key={`${item.href}-${item.label}`} type="button" onClick={() => go(item.href)}>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              ))}
            </li>
          ))}
          {pages.length === 0 && hits.length === 0 ? (
            <li className="cmd-empty">No matching pages or records.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
