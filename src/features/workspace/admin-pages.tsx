'use client';

import { useState } from 'react';
import { Field, SelectInput, TextArea, TextInput } from './form-ui';
import { useSave } from './admin-actions';
import { Badge } from './ui';

async function send(method: 'PUT' | 'DELETE' | 'PATCH', url: string, body: unknown) {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Save failed');
}

/* ───────────────────────── Page HTML + SEO ───────────────────────── */

export type PageOption = { key: string; label: string; path: string };
export type SavedPage = { title: string; description: string; html: string; published: boolean };

export function SitePageEditor({
  pages,
  saved,
}: {
  pages: PageOption[];
  saved: Record<string, SavedPage>;
}) {
  const [selected, setSelected] = useState(pages[0]?.key ?? '');
  const page = pages.find((item) => item.key === selected);
  if (!page) return null;
  return (
    <div className="ws-form">
      <Field label="Page" htmlFor="page-key" hint="Pages with saved content are marked ●.">
        <SelectInput id="page-key" value={selected} onChange={(event) => setSelected(event.target.value)}>
          {pages.map((item) => (
            <option key={item.key} value={item.key}>
              {saved[item.key] ? '● ' : ''}
              {item.label} ({item.path})
            </option>
          ))}
        </SelectInput>
      </Field>
      <PageForm key={selected} page={page} initial={saved[selected]} />
    </div>
  );
}

function PageForm({ page, initial }: { page: PageOption; initial?: SavedPage }) {
  const save = useSave();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [html, setHtml] = useState(initial?.html ?? '');
  const [published, setPublished] = useState(initial?.published ?? true);
  const [done, setDone] = useState<string | null>(null);
  return (
    <form
      className="ws-form"
      onSubmit={(event) => {
        event.preventDefault();
        setDone(null);
        save.run(async () => {
          await send('PUT', '/api/admin/pages', { key: page.key, title, description, html, published });
          setDone('Saved. Live within a minute.');
        });
      }}
    >
      <Field label="SEO title" hint="Leave empty to keep the default title. Aim for under 60 characters.">
        <TextInput value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field label="SEO description" hint="Leave empty to keep the default. Aim for 150–160 characters.">
        <TextInput value={description} maxLength={320} onChange={(event) => setDescription(event.target.value)} />
      </Field>
      <Field
        label="Page HTML"
        hint="Shown at the top of the page. Allowed: p, h2–h4, ul/ol/li, a, img (https or /path), strong, em, blockquote, table, details. Scripts, styles and event handlers are removed."
      >
        <TextArea rows={12} value={html} onChange={(event) => setHtml(event.target.value)} spellCheck={false} />
      </Field>
      <label className="check-label">
        <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
        <span>Published</span>
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="ws-btn primary" type="submit" disabled={save.pending}>
          {save.pending ? 'Saving…' : 'Save page'}
        </button>
        {initial ? (
          <button
            className="ws-btn"
            type="button"
            disabled={save.pending}
            onClick={() => {
              if (!window.confirm('Remove these edits and return to the default content?')) return;
              save.run(async () => {
                await send('DELETE', '/api/admin/pages', { key: page.key });
                setTitle('');
                setDescription('');
                setHtml('');
                setPublished(true);
                setDone('Reset to defaults.');
              });
            }}
          >
            Reset to default
          </button>
        ) : null}
        <a className="ws-btn" href={page.path} target="_blank" rel="noreferrer">
          View page
        </a>
      </div>
      {done ? <p className="ws-hint">{done}</p> : null}
      {save.error ? <p className="ws-error">{save.error}</p> : null}
    </form>
  );
}

/* ───────────────────────── Pricing plans ───────────────────────── */

export type PlanView = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  points: string[];
  cta: string;
  featured: boolean;
  customised: boolean;
};

export function PricingEditor({ plans, canEdit }: { plans: PlanView[]; canEdit: boolean }) {
  return (
    <div className="ws-grid-2">
      {plans.map((plan) => (
        <PlanForm key={plan.id} plan={plan} canEdit={canEdit} />
      ))}
    </div>
  );
}

function PlanForm({ plan, canEdit }: { plan: PlanView; canEdit: boolean }) {
  const save = useSave();
  const [name, setName] = useState(plan.name);
  const [tagline, setTagline] = useState(plan.tagline);
  const [price, setPrice] = useState(plan.price);
  const [priceNote, setPriceNote] = useState(plan.priceNote);
  const [points, setPoints] = useState(plan.points.join('\n'));
  const [cta, setCta] = useState(plan.cta);
  const [featured, setFeatured] = useState(plan.featured);
  return (
    <form
      className="ws-form"
      onSubmit={(event) => {
        event.preventDefault();
        save.run(() =>
          send('PUT', '/api/admin/pricing', {
            id: plan.id,
            name,
            tagline,
            price,
            priceNote,
            points: points.split('\n').map((line) => line.trim()).filter(Boolean),
            cta,
            featured,
          }),
        );
      }}
    >
      <h4 style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {plan.id} {plan.customised ? <Badge tone="gold">Edited</Badge> : <Badge>Default</Badge>}
      </h4>
      <div className="ws-form-grid">
        <Field label="Name">
          <TextInput value={name} onChange={(event) => setName(event.target.value)} disabled={!canEdit} />
        </Field>
        <Field label="Price" hint='e.g. "From £2,500" or "To Be Confirmed"'>
          <TextInput value={price} onChange={(event) => setPrice(event.target.value)} disabled={!canEdit} />
        </Field>
      </div>
      <Field label="Price note">
        <TextInput value={priceNote} onChange={(event) => setPriceNote(event.target.value)} disabled={!canEdit} />
      </Field>
      <Field label="Tagline">
        <TextInput value={tagline} onChange={(event) => setTagline(event.target.value)} disabled={!canEdit} />
      </Field>
      <Field label="Included (one per line)">
        <TextArea rows={4} value={points} onChange={(event) => setPoints(event.target.value)} disabled={!canEdit} />
      </Field>
      <Field label="Button label">
        <TextInput value={cta} onChange={(event) => setCta(event.target.value)} disabled={!canEdit} />
      </Field>
      <label className="check-label">
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) => setFeatured(event.target.checked)}
          disabled={!canEdit}
        />
        <span>Recommended (highlighted)</span>
      </label>
      {canEdit ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ws-btn primary" type="submit" disabled={save.pending}>
            {save.pending ? 'Saving…' : 'Save plan'}
          </button>
          {plan.customised ? (
            <button
              className="ws-btn"
              type="button"
              disabled={save.pending}
              onClick={() => {
                if (!window.confirm('Return this plan to its default text and price?')) return;
                save.run(() => send('DELETE', '/api/admin/pricing', { id: plan.id }));
              }}
            >
              Reset
            </button>
          ) : null}
        </div>
      ) : (
        <p className="ws-hint">Pricing can be changed by managers and admins.</p>
      )}
      {save.error ? <p className="ws-error">{save.error}</p> : null}
    </form>
  );
}
