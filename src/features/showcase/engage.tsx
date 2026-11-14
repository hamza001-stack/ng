'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarClock, FileText, MessageCircle, Send, X } from 'lucide-react';

const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || '';
const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^\d]/g, '');

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

export function StickyCta({ quoteHref = '/pricing#quote', topic }: { quoteHref?: string; topic?: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 520;
      const quote = document.getElementById('quote')?.getBoundingClientRect();
      const quoteVisible = quote ? quote.top < window.innerHeight && quote.bottom > 0 : false;
      const consentOpen = Boolean(document.querySelector('.cookie-banner'));
      setShown(window.scrollY > 640 && !nearEnd && !quoteVisible && !consentOpen);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const message = encodeURIComponent(`Hello NEVIE-GLOBAL, I'd like to talk about ${topic || 'a project'}.`);
  return (
    <AnimatePresence>
      {shown ? (
        <motion.div
          className="sx-sticky"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="sx-sticky-copy">Planning something similar?</span>
          {bookingUrl ? (
            <a className="sx-btn ghost small" href={bookingUrl} target="_blank" rel="noreferrer">
              <CalendarClock size={15} /> Book Call
            </a>
          ) : (
            <Link className="sx-btn ghost small" href={quoteHref}>
              <CalendarClock size={15} /> Book Call
            </Link>
          )}
          <Link className="sx-btn primary small" href={quoteHref}>
            <FileText size={15} /> Request Quote
          </Link>
          {whatsapp ? (
            <a
              className="sx-btn whatsapp small"
              href={`https://wa.me/${whatsapp}?text=${message}`}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon /> WhatsApp
            </a>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ChatWidget({ topic }: { topic?: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function send(form: HTMLFormElement) {
    const data = new FormData(form);
    if (data.get('privacy') !== 'on') {
      setError('Please accept the privacy policy.');
      return;
    }
    data.set('privacy', 'true');
    data.set('kind', 'chat');
    data.set('service', topic || '');
    setStatus('sending');
    setError(null);
    try {
      const response = await fetch('/api/quote', { method: 'POST', body: data });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Message not sent.');
      setStatus('done');
      form.reset();
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Message not sent.');
    }
  }

  return (
    <div className="sx-chat">
      <AnimatePresence>
        {open ? (
          <motion.section
            className="sx-chat-panel"
            role="dialog"
            aria-label="Message the team"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22 }}
          >
            <header>
              <div>
                <strong>Message the team</strong>
                <span>Replies go to your email</span>
              </div>
              <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </header>
            {status === 'done' ? (
              <div className="sx-chat-done" role="status">
                <strong>Thanks — message received.</strong>
                <p>Check your inbox for a confirmation. We reply from the same address.</p>
                <button type="button" className="sx-btn ghost small" onClick={() => setStatus('idle')}>
                  Send another
                </button>
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send(event.currentTarget);
                }}
              >
                <p className="sx-chat-hello">Hi! Ask about scope, timelines or a product. A person reads every message.</p>
                <input name="name" placeholder="Your name" required minLength={2} autoComplete="name" aria-label="Your name" />
                <input name="email" type="email" placeholder="Email" required autoComplete="email" aria-label="Email" />
                <textarea name="details" rows={3} placeholder="How can we help?" required minLength={10} aria-label="Message" />
                <input className="sx-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <label className="sx-consent small">
                  <input type="checkbox" name="privacy" />
                  <span>
                    I accept the <Link href="/privacy">privacy policy</Link>.
                  </span>
                </label>
                {error ? (
                  <p className="sx-form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button className="sx-btn primary small" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'} <Send size={14} />
                </button>
              </form>
            )}
          </motion.section>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        className="sx-chat-toggle"
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

export function Engage({ quoteHref, topic }: { quoteHref?: string; topic?: string }) {
  return (
    <>
      <StickyCta quoteHref={quoteHref} topic={topic} />
      <ChatWidget topic={topic} />
    </>
  );
}
