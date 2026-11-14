'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Field, FormCard, SelectInput, TextArea, TextInput } from './form-ui';
import { FileDrop } from './file-drop';
import { PROJECT_PHASES, TBC, phaseLabel } from '@/lib/editorial';

async function patch(url: string, body: unknown) {
  const response = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Update failed');
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Save failed');
}

async function postForm(url: string, body: FormData) {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body,
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Save failed');
}

export function useSave() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return {
    error,
    pending,
    run: (work: () => Promise<void>) => {
      start(async () => {
        setError(null);
        try {
          await work();
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Save failed');
        }
      });
    },
  };
}

export function RoleEditor({
  id,
  role,
}: {
  id: string;
  role: 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <SelectInput
        defaultValue={role}
        disabled={pending}
        aria-label="User role"
        onChange={(event) => {
          const next = event.target.value as typeof role;
          start(async () => {
            setError(null);
            try {
              await patch('/api/admin/users', { id, role: next });
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Update failed');
            }
          });
        }}
      >
        <option value="CUSTOMER">Customer</option>
        <option value="STAFF">Staff</option>
        <option value="MANAGER">Manager</option>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super admin</option>
      </SelectInput>
      {error ? <p className="ws-error">{error}</p> : null}
    </div>
  );
}

export function UserActions({
  id,
  suspended,
}: {
  id: string;
  suspended: boolean;
}) {
  const save = useSave();
  return (
    <div className="ws-inline-form">
      <button
        type="button"
        className="ws-btn"
        disabled={save.pending}
        onClick={() =>
          save.run(() =>
            patch('/api/admin/users', { id, action: suspended ? 'unsuspend' : 'suspend' }),
          )
        }
      >
        {suspended ? 'Restore' : 'Suspend'}
      </button>
      <button
        type="button"
        className="ws-btn"
        disabled={save.pending}
        onClick={() => save.run(() => patch('/api/admin/users', { id, action: 'resetPassword' }))}
      >
        Reset password
      </button>
      <button
        type="button"
        className="ws-btn"
        disabled={save.pending}
        onClick={() => save.run(() => patch('/api/admin/users', { id, action: 'revokeSessions' }))}
      >
        Sign out sessions
      </button>
      {save.error ? <p className="ws-error">{save.error}</p> : null}
    </div>
  );
}

export function OrderNotesForm({
  id,
  notes,
  internalNotes,
}: {
  id: string;
  notes: string;
  internalNotes: string;
}) {
  const save = useSave();
  return (
    <form
      className="ws-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        save.run(() =>
          patch('/api/admin/orders', {
            id,
            notes: String(form.get('notes') || ''),
            internalNotes: String(form.get('internalNotes') || ''),
          }),
        );
      }}
    >
      <Field label="Customer note">
        <TextArea name="notes" rows={3} defaultValue={notes} />
      </Field>
      <Field label="Internal note">
        <TextArea name="internalNotes" rows={3} defaultValue={internalNotes} />
      </Field>
      <button className="ws-btn primary" type="submit" disabled={save.pending}>
        {save.pending ? 'Saving…' : 'Save notes'}
      </button>
      {save.error ? <p className="ws-error">{save.error}</p> : null}
    </form>
  );
}

export function LeadEditor({
  id,
  status,
}: {
  id: string;
  status: 'NEW' | 'QUALIFIED' | 'WON' | 'LOST';
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <SelectInput
        defaultValue={status}
        disabled={pending}
        aria-label="Lead status"
        onChange={(event) => {
          const next = event.target.value as typeof status;
          start(async () => {
            setError(null);
            try {
              await patch('/api/admin/leads', { id, status: next });
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Update failed');
            }
          });
        }}
      >
        <option value="NEW">New</option>
        <option value="QUALIFIED">Qualified</option>
        <option value="WON">Won</option>
        <option value="LOST">Lost</option>
      </SelectInput>
      {error ? <p className="ws-error">{error}</p> : null}
    </div>
  );
}

export function ProductEditor({
  id,
  stock,
  published,
}: {
  id: string;
  stock: number;
  published: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="ws-inline-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        start(async () => {
          setError(null);
          try {
            await patch('/api/admin/products', {
              id,
              stock: Number(form.get('stock')),
              published: form.get('published') === 'on',
            });
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed');
          }
        });
      }}
    >
      <TextInput name="stock" type="number" min={0} defaultValue={stock} aria-label="Stock" />
      <label className="ws-check">
        <input name="published" type="checkbox" defaultChecked={published} />
        Live
      </label>
      <button className="ws-btn primary" type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </button>
      {error ? <p className="ws-error">{error}</p> : null}
    </form>
  );
}

export function ArticlePublish({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="ws-btn"
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await patch('/api/admin/articles', { id, published: !published });
          router.refresh();
        })
      }
    >
      {pending ? 'Saving…' : published ? 'Unpublish' : 'Publish'}
    </button>
  );
}

export function CaseStudyPublish({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="ws-btn"
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await patch('/api/admin/case-studies', { id, published: !published });
          router.refresh();
        })
      }
    >
      {pending ? 'Saving…' : published ? 'Unpublish' : 'Publish'}
    </button>
  );
}

export function RecordDelete({
  url,
  id,
  label = 'Delete',
}: {
  url: string;
  id: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="ws-btn danger"
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('Delete this record? This cannot be undone.')) return;
        start(async () => {
          const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });
          const payload = (await response.json()) as { error?: string };
          if (!response.ok) throw new Error(payload.error || 'Delete failed');
          router.refresh();
        });
      }}
    >
      {pending ? 'Deleting…' : label}
    </button>
  );
}

export function OrderStatusEditor({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <SelectInput
        defaultValue={status}
        disabled={pending}
        aria-label="Order status"
        onChange={(event) => {
          const next = event.target.value;
          start(async () => {
            setError(null);
            try {
              await patch('/api/admin/orders', { id, status: next });
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Update failed');
            }
          });
        }}
      >
        <option value="PENDING">Pending</option>
        <option value="PROCESSING">Preparing</option>
        <option value="PAID">Paid</option>
        <option value="PACKED">Packed</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="FULFILLED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="REFUNDED">Refunded</option>
        <option value="PARTIALLY_REFUNDED">Partial refund</option>
        <option value="FAILED">Failed</option>
      </SelectInput>
      {error ? <p className="ws-error">{error}</p> : null}
    </div>
  );
}

export function ProjectStatusEditor({
  id,
  status,
}: {
  id: string;
  status: 'BACKLOG' | 'DOING' | 'REVIEW' | 'DONE';
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <SelectInput
      defaultValue={status}
      disabled={pending}
      aria-label="Project status"
      onChange={(event) =>
        start(async () => {
          await patch('/api/admin/projects', { id, status: event.target.value });
          router.refresh();
        })
      }
    >
      <option value="BACKLOG">Backlog</option>
      <option value="DOING">Doing</option>
      <option value="REVIEW">Review</option>
      <option value="DONE">Done</option>
    </SelectInput>
  );
}

export function ProjectPublicEditor({
  id,
  phase,
  progress,
  isPublic,
}: {
  id: string;
  phase: string;
  progress: number | null;
  isPublic: boolean;
}) {
  const save = useSave();
  const [value, setValue] = useState(progress === null ? '' : String(progress));
  return (
    <div className="ws-inline-edit">
      <SelectInput
        defaultValue={phase}
        disabled={save.pending}
        aria-label="Public phase"
        onChange={(event) => save.run(() => patch('/api/admin/projects', { id, phase: event.target.value }))}
      >
        {PROJECT_PHASES.map((item) => (
          <option key={item} value={item}>
            {phaseLabel[item]}
          </option>
        ))}
        <option value="TBC">{TBC}</option>
      </SelectInput>
      <TextInput
        type="number"
        min={0}
        max={100}
        value={value}
        placeholder="TBC"
        aria-label="Progress percent (empty = to be confirmed)"
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          const next = value.trim() === '' ? null : Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
          if (next !== progress) save.run(() => patch('/api/admin/projects', { id, progress: next }));
        }}
      />
      <label className="ws-check">
        <input
          type="checkbox"
          defaultChecked={isPublic}
          disabled={save.pending}
          onChange={(event) =>
            save.run(() => patch('/api/admin/projects', { id, isPublic: event.target.checked }))
          }
        />
        Public
      </label>
      {save.error ? <p className="ws-error">{save.error}</p> : null}
    </div>
  );
}

const productSchema = z.object({
  name: z.string().trim().min(2, 'Enter a product name.'),
  category: z.string().trim().min(2, 'Enter a category.'),
  description: z.string().trim().min(8, 'Write a short description.'),
  price: z.number().min(0, 'Price must be 0 or more.'),
  stock: z.number().int().min(0),
  tag: z.string().optional(),
  features: z.string().optional(),
  published: z.boolean(),
});

export function AddProductForm({ categories, plain = false }: { categories: string[]; plain?: boolean }) {
  const save = useSave();
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      price: 0,
      stock: 10,
      tag: '',
      features: '',
      published: true,
    },
  });

  return (
    <FormCard plain={plain} title="Add product" copy="Labelled fields, validation, then a live catalogue row.">
      <form
        className="ws-form"
        onSubmit={form.handleSubmit((values) => {
          save.run(async () => {
            const body = new FormData();
            body.set('name', values.name);
            body.set('category', values.category);
            body.set('description', values.description);
            body.set('price', String(values.price));
            body.set('stock', String(values.stock));
            body.set('tag', values.tag || '');
            body.set('features', values.features || '');
            if (values.published) body.set('published', 'on');
            const image = (document.getElementById('product-image') as HTMLInputElement | null)?.files?.[0];
            if (image) body.set('image', image);
            await postForm('/api/admin/products', body);
            form.reset();
            const input = document.getElementById('product-image') as HTMLInputElement | null;
            if (input) input.value = '';
          });
        })}
        noValidate
      >
        <div className="ws-form-grid">
          <Field label="Product name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} autoComplete="off" />
          </Field>
          <Field label="Category" error={form.formState.errors.category?.message}>
            <TextInput {...form.register('category')} list="admin-categories" />
            <datalist id="admin-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>
          <Field label="Price (GBP)" error={form.formState.errors.price?.message}>
            <TextInput type="number" min={0} step="0.01" {...form.register('price', { valueAsNumber: true })} />
          </Field>
          <Field label="Stock" error={form.formState.errors.stock?.message}>
            <TextInput type="number" min={0} {...form.register('stock', { valueAsNumber: true })} />
          </Field>
          <Field label="Tag">
            <TextInput {...form.register('tag')} placeholder="Optional" />
          </Field>
          <Field label="Features">
            <TextInput {...form.register('features')} placeholder="Comma separated" />
          </Field>
        </div>
        <Field label="Description" error={form.formState.errors.description?.message}>
          <TextArea rows={3} {...form.register('description')} />
        </Field>
        <div className="ws-form-grid">
          <Field label="Image" hint="JPEG, PNG or WebP">
            <FileDrop id="product-image" accept="image/jpeg,image/png,image/webp" />
          </Field>
          <Field label="Visibility">
            <label className="ws-check">
              <input type="checkbox" {...form.register('published')} />
              Publish live
            </label>
          </Field>
        </div>
        <button className="ws-btn primary" type="submit" disabled={save.pending}>
          {save.pending ? 'Saving…' : 'Add product'}
        </button>
        {save.error ? <p className="ws-error">{save.error}</p> : null}
      </form>
    </FormCard>
  );
}

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name.'),
  email: z.email('Enter a valid email.'),
  company: z.string().optional(),
  message: z.string().trim().min(8, 'Add a short note.'),
  status: z.enum(['NEW', 'QUALIFIED', 'WON', 'LOST']),
});

export function AddLeadForm({ plain = false }: { plain?: boolean } = {}) {
  const save = useSave();
  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: '', email: '', company: '', message: '', status: 'NEW' },
  });
  return (
    <FormCard plain={plain} title="Add lead" copy="Creates a CRM record immediately. Contact form submissions also land here.">
      <form
        className="ws-form"
        onSubmit={form.handleSubmit((values) => {
          save.run(async () => {
            await postJson('/api/admin/leads', values);
            form.reset();
          });
        })}
        noValidate
      >
        <div className="ws-form-grid">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} autoComplete="name" />
          </Field>
          <Field label="Work email" error={form.formState.errors.email?.message}>
            <TextInput type="email" {...form.register('email')} autoComplete="email" />
          </Field>
          <Field label="Company">
            <TextInput {...form.register('company')} autoComplete="organization" />
          </Field>
          <Field label="Stage" error={form.formState.errors.status?.message}>
            <SelectInput {...form.register('status')}>
              <option value="NEW">New</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </SelectInput>
          </Field>
        </div>
        <Field label="Notes" error={form.formState.errors.message?.message}>
          <TextArea rows={3} {...form.register('message')} />
        </Field>
        <button className="ws-btn primary" type="submit" disabled={save.pending}>
          {save.pending ? 'Saving…' : 'Add lead'}
        </button>
        {save.error ? <p className="ws-error">{save.error}</p> : null}
      </form>
    </FormCard>
  );
}

const articleSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title.'),
  category: z.string().trim().min(2, 'Enter a category.'),
  description: z.string().trim().min(8, 'Add a short description.'),
  body: z.string().trim().min(20, 'Write at least 20 characters.'),
});

export function AddArticleForm({ plain = false }: { plain?: boolean } = {}) {
  const save = useSave();
  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: '', category: '', description: '', body: '' },
  });
  return (
    <FormCard plain={plain} title="Publish article" copy="Goes live in CMS as soon as it saves.">
      <form
        className="ws-form"
        onSubmit={form.handleSubmit((values) => {
          save.run(async () => {
            await postJson('/api/admin/articles', values);
            form.reset();
          });
        })}
        noValidate
      >
        <div className="ws-form-grid">
          <Field label="Title" error={form.formState.errors.title?.message}>
            <TextInput {...form.register('title')} />
          </Field>
          <Field label="Category" error={form.formState.errors.category?.message}>
            <TextInput {...form.register('category')} />
          </Field>
        </div>
        <Field label="Short description" error={form.formState.errors.description?.message}>
          <TextInput {...form.register('description')} />
        </Field>
        <Field label="Body" error={form.formState.errors.body?.message}>
          <TextArea rows={6} {...form.register('body')} />
        </Field>
        <button className="ws-btn primary" type="submit" disabled={save.pending}>
          {save.pending ? 'Saving…' : 'Publish article'}
        </button>
        {save.error ? <p className="ws-error">{save.error}</p> : null}
      </form>
    </FormCard>
  );
}

const caseStudySchema = z.object({
  title: z.string().trim().min(3, 'Enter a title.'),
  summary: z.string().trim().min(8, 'Add a summary.'),
  body: z.string().trim().min(20, 'Write the full case study.'),
  client: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  year: z.string().optional(),
  duration: z.string().optional(),
  services: z.string().optional(),
  technologies: z.string().optional(),
  results: z.string().optional(),
});

export function AddCaseStudyForm({ plain = false }: { plain?: boolean } = {}) {
  const save = useSave();
  const form = useForm<z.infer<typeof caseStudySchema>>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      title: '',
      summary: '',
      body: '',
      client: '',
      industry: '',
      country: '',
      year: '',
      duration: '',
      services: '',
      technologies: '',
      results: '',
    },
  });
  return (
    <FormCard plain={plain} title="Upload case study" copy="Cover image and attachment are optional.">
      <form
        className="ws-form"
        onSubmit={form.handleSubmit((values) => {
          save.run(async () => {
            const body = new FormData();
            body.set('title', values.title);
            body.set('summary', values.summary);
            body.set('body', values.body);
            for (const [key, value] of Object.entries(values)) {
              if (typeof value === 'string' && !['title', 'summary', 'body'].includes(key)) body.set(key, value);
            }
            const cover = (document.getElementById('case-cover') as HTMLInputElement | null)?.files?.[0];
            const file = (document.getElementById('case-file') as HTMLInputElement | null)?.files?.[0];
            if (cover) body.set('cover', cover);
            if (file) body.set('file', file);
            await postForm('/api/admin/case-studies', body);
            form.reset();
            const coverInput = document.getElementById('case-cover') as HTMLInputElement | null;
            const fileInput = document.getElementById('case-file') as HTMLInputElement | null;
            if (coverInput) coverInput.value = '';
            if (fileInput) fileInput.value = '';
          });
        })}
        noValidate
      >
        <Field label="Title" error={form.formState.errors.title?.message}>
          <TextInput {...form.register('title')} />
        </Field>
        <Field label="Summary" error={form.formState.errors.summary?.message}>
          <TextArea rows={2} {...form.register('summary')} />
        </Field>
        <Field
          label="Full write-up"
          hint="Start sections with ## Challenge, ## Architecture, ## Results … to build the public table of contents."
          error={form.formState.errors.body?.message}
        >
          <TextArea rows={7} {...form.register('body')} />
        </Field>
        <div className="ws-form-grid">
          <Field label="Client / company">
            <TextInput {...form.register('client')} />
          </Field>
          <Field label="Industry">
            <TextInput {...form.register('industry')} />
          </Field>
          <Field label="Country">
            <TextInput {...form.register('country')} />
          </Field>
          <Field label="Year">
            <TextInput inputMode="numeric" {...form.register('year')} />
          </Field>
          <Field label="Duration" hint="e.g. 12 weeks">
            <TextInput {...form.register('duration')} />
          </Field>
          <Field label="Services" hint="Comma separated: Website, CRM">
            <TextInput {...form.register('services')} />
          </Field>
        </div>
        <Field label="Technologies" hint="Comma separated">
          <TextInput {...form.register('technologies')} />
        </Field>
        <Field label="Measured results" hint="One per line, only verified numbers">
          <TextArea rows={3} {...form.register('results')} />
        </Field>
        <div className="ws-form-grid">
          <Field label="Cover image">
            <FileDrop id="case-cover" name="cover" accept="image/jpeg,image/png,image/webp" />
          </Field>
          <Field label="Attachment">
            <FileDrop
              id="case-file"
              name="file"
              accept=".pdf,.zip,.docx,image/jpeg,image/png,image/webp"
              label="Drop a file or click to upload"
              hint="PDF, ZIP, DOCX or image"
            />
          </Field>
        </div>
        <button className="ws-btn primary" type="submit" disabled={save.pending}>
          {save.pending ? 'Uploading…' : 'Upload case study'}
        </button>
        {save.error ? <p className="ws-error">{save.error}</p> : null}
      </form>
    </FormCard>
  );
}

const projectSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title.'),
  client: z.string().trim().min(2, 'Enter a client name.'),
  summary: z.string().trim().min(8, 'Describe the scope.'),
  category: z.string().optional(),
  goal: z.string().optional(),
  phase: z.string(),
  progress: z.string().optional(),
  teamSize: z.string().optional(),
  eta: z.string().optional(),
  technologies: z.string().optional(),
  features: z.string().optional(),
  isPublic: z.boolean(),
});

export function AddProjectForm({ plain = false }: { plain?: boolean } = {}) {
  const save = useSave();
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      client: '',
      summary: '',
      category: '',
      goal: '',
      phase: 'PLANNING',
      progress: '',
      teamSize: '',
      eta: '',
      technologies: '',
      features: '',
      isPublic: false,
    },
  });
  return (
    <FormCard
      plain={plain}
      title="Create project"
      copy="Lands in Backlog. Client name stays private; tick “Show on /projects” to publish the public card."
    >
      <form
        className="ws-form"
        onSubmit={form.handleSubmit((values) => {
          save.run(async () => {
            const body = new FormData();
            for (const [key, value] of Object.entries(values)) body.set(key, String(value ?? ''));
            const file = (document.getElementById('project-file') as HTMLInputElement | null)?.files?.[0];
            if (file) body.set('file', file);
            const cover = (document.getElementById('project-cover') as HTMLInputElement | null)?.files?.[0];
            if (cover) body.set('cover', cover);
            await postForm('/api/admin/projects', body);
            form.reset();
            for (const id of ['project-file', 'project-cover']) {
              const input = document.getElementById(id) as HTMLInputElement | null;
              if (input) input.value = '';
            }
          });
        })}
        noValidate
      >
        <div className="ws-form-grid">
          <Field label="Project title" error={form.formState.errors.title?.message}>
            <TextInput {...form.register('title')} />
          </Field>
          <Field label="Client" error={form.formState.errors.client?.message}>
            <TextInput {...form.register('client')} />
          </Field>
        </div>
        <Field label="Public summary" error={form.formState.errors.summary?.message}>
          <TextArea rows={3} {...form.register('summary')} />
        </Field>
        <Field label="Goal">
          <TextArea rows={2} {...form.register('goal')} />
        </Field>
        <div className="ws-form-grid">
          <Field label="Category" hint="e.g. SaaS, CRM">
            <TextInput {...form.register('category')} />
          </Field>
          <Field label="Phase">
            <SelectInput {...form.register('phase')}>
              {PROJECT_PHASES.map((phase) => (
                <option key={phase} value={phase}>
                  {phaseLabel[phase]}
                </option>
              ))}
              <option value="TBC">{TBC}</option>
            </SelectInput>
          </Field>
          <Field label="Progress %" hint="Leave empty to show To Be Confirmed">
            <TextInput type="number" min={0} max={100} placeholder="TBC" {...form.register('progress')} />
          </Field>
          <Field label="Team size">
            <TextInput type="number" min={1} {...form.register('teamSize')} />
          </Field>
          <Field label="Estimated completion">
            <TextInput type="date" {...form.register('eta')} />
          </Field>
          <Field label="Technologies" hint="Comma separated">
            <TextInput {...form.register('technologies')} />
          </Field>
        </div>
        <Field label="Features" hint="One per line">
          <TextArea rows={3} {...form.register('features')} />
        </Field>
        <div className="ws-form-grid">
          <Field label="Cover image">
            <TextInput id="project-cover" type="file" accept="image/jpeg,image/png,image/webp" />
          </Field>
          <Field label="Private file" hint="PDF, ZIP, DOCX or image">
            <TextInput id="project-file" type="file" accept=".pdf,.zip,.docx,image/jpeg,image/png,image/webp" />
          </Field>
        </div>
        <label className="ws-check">
          <input type="checkbox" {...form.register('isPublic')} /> Show on /projects
        </label>
        <button className="ws-btn primary" type="submit" disabled={save.pending}>
          {save.pending ? 'Uploading…' : 'Create project'}
        </button>
        {save.error ? <p className="ws-error">{save.error}</p> : null}
      </form>
    </FormCard>
  );
}
