'use client';
import { useMemo, useState } from 'react';
import type { Programme } from '@/lib/academy-defaults';
import { CourseCard } from './ui';

/** Category tabs + search over the programmes passed in from the server. */
export function CourseBrowser({ programmes }: { programmes: Programme[] }) {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const cats = useMemo(() => ['All', ...Array.from(new Set(programmes.map((p) => p.cat)))], [programmes]);
  const list = programmes.filter((p) => {
    const text = (p.title + p.blurb + p.cat + p.promise).toLowerCase();
    return (cat === 'All' || p.cat === cat) && (!q.trim() || text.includes(q.trim().toLowerCase()));
  });
  return (
    <>
      <div className="nv-toolbar">
        <div className="nv-tabs">
          {cats.map((c) => (
            <button key={c} type="button" className={c === cat ? 'nv-on' : undefined} onClick={() => setCat(c)}>
              {c === 'All' ? 'All courses' : c}
            </button>
          ))}
        </div>
        <label className="nv-search">
          <span className="nv-muted">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses…" aria-label="Search courses" />
        </label>
      </div>
      <div className="nv-gridc">
        {list.map((p) => (
          <CourseCard key={p.id} p={p} />
        ))}
      </div>
      {!list.length ? <p className="nv-muted" style={{ marginTop: 20 }}>No courses match your search.</p> : null}
    </>
  );
}
