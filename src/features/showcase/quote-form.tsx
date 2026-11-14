'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowUpRight, CalendarClock, CheckCircle2, Paperclip, Send } from 'lucide-react';
import { quoteOptions, services } from '@/lib/editorial';

const schema = z.object({
  company: z.string().trim().max(160),
  name: z.string().trim().min(2, 'Enter your name.'),
  email: z.string().trim().email('Enter a valid email.'),
  phone: z.string().trim().max(40),
  country: z.string().trim().max(80),
  industry: z.string().trim().max(80),
  businessSize: z.string(),
  budget: z.string(),
  timeline: z.string(),
  service: z.string().min(1, 'Choose a service.'),
  site: z.string().trim().max(200),
  details: z.string().trim().min(10, 'Tell us a little more (10+ characters).'),
  contact: z.string(),
  meeting: z.string(),
  privacy: z.boolean().refine((value) => value, 'Please accept the privacy policy.'),
  website: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || '';

export function QuoteForm({ defaultService = '' }: { defaultService?: string }) {
  const [kind, setKindState] = useState<'quote' | 'call'>('quote');
  const kindRef = useRef<'quote' | 'call'>('quote');
  const planRef = useRef('');
  const setKind = (next: 'quote' | 'call') => {
    kindRef.current = next;
    setKindState(next);
  };
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: '',
      name: '',
      email: '',
      phone: '',
      country: 'United Kingdom',
      industry: '',
      businessSize: '',
      budget: '',
      timeline: '',
      service: defaultService,
      site: '',
      details: '',
      contact: 'Email',
      meeting: 'Any time',
      privacy: false,
      website: '',
    },
  });

  useEffect(() => {
    const apply = () => {
      const params = new URLSearchParams(window.location.search);
      const match = services.find((item) => item.slug === params.get('service'));
      if (match) setValue('service', match.name);
      planRef.current = params.get('plan') || '';
    };
    apply();
    window.addEventListener('sx:service', apply);
    return () => window.removeEventListener('sx:service', apply);
  }, [setValue]);

  const submit = handleSubmit(async (values) => {
    setStatus('sending');
    setError(null);
    const body = new FormData();
    for (const [key, value] of Object.entries(values)) body.set(key, String(value ?? ''));
    body.set('kind', kindRef.current);
    if (planRef.current) body.set('plan', planRef.current);
    const file = fileRef.current?.files?.[0];
    if (file) {
      if (file.size > 10_000_000) {
        setStatus('idle');
        setError('Attachment must be under 10 MB.');
        return;
      }
      body.set('file', file);
    }
    try {
      const response = await fetch('/api/quote', { method: 'POST', body });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Could not send your request.');
      setStatus('done');
      reset();
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Could not send your request.');
    }
  });

  if (status === 'done') {
    return (
      <div className="sx-quote-done" role="status">
        <CheckCircle2 size={40} />
        <h3>{kind === 'call' ? 'Call request received.' : 'Quote request received.'}</h3>
        <p>A confirmation is on its way to your inbox. The team reviews every request and replies by your preferred contact method.</p>
        <div className="sx-actions center">
          {kind === 'call' && bookingUrl ? (
            <a className="sx-btn primary" href={bookingUrl} target="_blank" rel="noreferrer">
              Pick a time now <CalendarClock size={16} />
            </a>
          ) : null}
          <button className="sx-btn ghost" type="button" onClick={() => setStatus('idle')}>
            Send another request
          </button>
        </div>
      </div>
    );
  }

  const fieldError = (key: keyof Values) =>
    errors[key]?.message ? (
      <span className="sx-field-error" role="alert">
        {String(errors[key]?.message)}
      </span>
    ) : null;

  return (
    <form className="sx-quote-form" onSubmit={submit} noValidate>
      <div className="sx-form-grid">
        <label className="sx-field">
          <span>Company</span>
          <input autoComplete="organization" {...register('company')} />
        </label>
        <label className="sx-field">
          <span>Name *</span>
          <input autoComplete="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
          {fieldError('name')}
        </label>
        <label className="sx-field">
          <span>Email *</span>
          <input type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
          {fieldError('email')}
        </label>
        <label className="sx-field">
          <span>Phone</span>
          <input type="tel" autoComplete="tel" {...register('phone')} />
        </label>
        <label className="sx-field">
          <span>Country</span>
          <input autoComplete="country-name" {...register('country')} />
        </label>
        <label className="sx-field">
          <span>Industry</span>
          <input {...register('industry')} />
        </label>
        <label className="sx-field">
          <span>Business size</span>
          <select {...register('businessSize')}>
            <option value="">Select</option>
            {quoteOptions.businessSize.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="sx-field">
          <span>Budget range</span>
          <select {...register('budget')}>
            <option value="">Select</option>
            {quoteOptions.budget.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="sx-field">
          <span>Timeline</span>
          <select {...register('timeline')}>
            <option value="">Select</option>
            {quoteOptions.timeline.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="sx-field">
          <span>Service required *</span>
          <select aria-invalid={Boolean(errors.service)} {...register('service')}>
            <option value="">Select</option>
            {services.map((service) => (
              <option key={service.slug}>{service.name}</option>
            ))}
            <option>Not sure yet</option>
          </select>
          {fieldError('service')}
        </label>
        <label className="sx-field">
          <span>Website</span>
          <input type="url" placeholder="https://" autoComplete="url" {...register('site')} />
        </label>
        <label className="sx-field">
          <span>Preferred contact</span>
          <select {...register('contact')}>
            {quoteOptions.contact.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="sx-field">
          <span>Meeting time</span>
          <select {...register('meeting')}>
            {quoteOptions.meeting.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="sx-field sx-file">
          <span>Upload file</span>
          <span className="sx-file-drop">
            <Paperclip size={16} />
            {fileName || 'Brief, spec or screenshot — PDF, DOCX, ZIP, image (10 MB)'}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.zip,.docx,image/jpeg,image/png,image/webp"
              onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
            />
          </span>
        </label>
        <label className="sx-field wide">
          <span>Project details *</span>
          <textarea rows={5} aria-invalid={Boolean(errors.details)} {...register('details')} />
          {fieldError('details')}
        </label>
      </div>
      <div className="sx-hp" aria-hidden="true">
        <label htmlFor="quote-website">Leave empty</label>
        <input id="quote-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>
      <label className="sx-consent">
        <input type="checkbox" {...register('privacy')} />
        <span>
          I agree to NEVIE-GLOBAL UK processing these details to respond to my request, as described in the{' '}
          <Link href="/privacy">privacy policy</Link>.
        </span>
      </label>
      {fieldError('privacy')}
      {error ? (
        <p className="sx-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="sx-actions">
        <button className="sx-btn primary" type="submit" disabled={status === 'sending'} onClick={() => setKind('quote')}>
          {status === 'sending' && kind === 'quote' ? 'Sending…' : 'Request Quote'} <Send size={16} />
        </button>
        <button className="sx-btn ghost" type="submit" disabled={status === 'sending'} onClick={() => setKind('call')}>
          {status === 'sending' && kind === 'call' ? 'Sending…' : 'Book Discovery Call'} <ArrowUpRight size={16} />
        </button>
      </div>
    </form>
  );
}
