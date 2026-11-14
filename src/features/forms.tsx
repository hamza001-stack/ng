'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { contactSchema, newsletterSchema } from '@/lib/validation';
import { contactInterests } from '@/lib/company';
async function send(url: string, data: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Unable to submit. Please try again.');
  return result;
}
export function ContactForm() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof contactSchema> & { website?: string }>({
    resolver: zodResolver(contactSchema),
    defaultValues: { consent: false, company: '' },
  });
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof contactSchema> & { website?: string }) =>
      send('/api/contact', data),
    onSuccess: () => setDone(true),
  });
  if (done)
    return (
      <div className="notice success" role="status">
        Your enquiry has been received. Thank you for getting in touch.
      </div>
    );
  return (
    <form
      className="form"
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      noValidate
    >
      <div className="form-row">
        {(['name', 'email'] as const).map((key) => (
          <div className="field" key={key}>
            <label htmlFor={key}>
              {key === 'name' ? 'Your name' : 'Work email'}
            </label>
            <input
              id={key}
              type={key === 'email' ? 'email' : 'text'}
              autoComplete={key}
              {...register(key)}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? key + '-error' : undefined}
            />
            {errors[key] && (
              <span id={key + '-error'} className="error-text">
                {errors[key].message}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="field" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="phone">Phone (optional)</label>
          <input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
        </div>
        <div className="field">
          <label htmlFor="interest">Offer of interest (optional)</label>
          <select id="interest" {...register('interest')} defaultValue="">
            <option value="">Select an offer</option>
            {contactInterests.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="company">Company (optional)</label>
        <input
          id="company"
          autoComplete="organization"
          {...register('company')}
        />
      </div>
      <div className="field">
        <label htmlFor="message">What would you like to build?</label>
        <textarea
          id="message"
          rows={5}
          {...register('message')}
          aria-invalid={!!errors.message}
          aria-describedby="message-error"
        />
        {errors.message && (
          <span id="message-error" className="error-text">
            {errors.message.message}
          </span>
        )}
      </div>
      <label className="check-label">
        <input type="checkbox" {...register('consent')} />
        <span>
          I agree to the processing of this enquiry as described in the{' '}
          <Link className="text-link" href="/privacy">
            privacy notice
          </Link>
          .
        </span>
      </label>
      {errors.consent && <p className="error-text">{errors.consent.message}</p>}
      <div style={{ marginTop: 24 }}>
        <Button disabled={mutation.isPending}>
          {mutation.isPending ? 'Sending…' : 'Send enquiry'}
          <ArrowUpRight size={18} />
        </Button>
      </div>
      {mutation.error && (
        <p role="alert" className="error-text" style={{ marginTop: 20 }}>
          {mutation.error.message}
        </p>
      )}
    </form>
  );
}
export function Newsletter() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { consent: false },
  });
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof newsletterSchema>) =>
      send('/api/newsletter', data),
  });
  if (mutation.isSuccess)
    return (
      <p className="success" role="status">
        Please check your inbox to confirm your subscription.
      </p>
    );
  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
      <label htmlFor="newsletter-email" className="subtle">
        Your email address
      </label>
      <div className="newsletter">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        <Button disabled={mutation.isPending}>
          {mutation.isPending ? 'Joining…' : 'Keep me in the loop'}
          <ArrowUpRight size={16} />
        </Button>
      </div>
      {errors.email && <p className="error-text">{errors.email.message}</p>}
      <label className="check-label" style={{ marginTop: 16 }}>
        <input type="checkbox" {...register('consent')} />
        <span>
          I agree to receive email updates. Unsubscribe at any time.{' '}
          <Link href="/privacy">Privacy notice</Link>
        </span>
      </label>
      {errors.consent && <p className="error-text">{errors.consent.message}</p>}
      {mutation.error && (
        <p className="error-text" role="alert">
          {mutation.error.message}
        </p>
      )}
    </form>
  );
}
