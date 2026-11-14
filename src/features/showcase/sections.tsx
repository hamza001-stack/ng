import Link from 'next/link';
import { ArrowUpRight, CalendarClock, FileText, Layers } from 'lucide-react';
import { Reveal } from './motion';

const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || '';

export function BookCallLink({ className = 'sx-btn ghost', label = 'Book a Call' }: { className?: string; label?: string }) {
  return bookingUrl ? (
    <a className={className} href={bookingUrl} target="_blank" rel="noreferrer">
      <CalendarClock size={16} /> {label}
    </a>
  ) : (
    <Link className={className} href="/pricing?intent=call#quote">
      <CalendarClock size={16} /> {label}
    </Link>
  );
}

export function SimilarCta({
  title = 'Need a similar solution?',
  copy = 'Tell us what you are building. You will get a scoped proposal — not a sales script.',
}: {
  title?: string;
  copy?: string;
}) {
  return (
    <Reveal className="container">
      <section className="sx-cta">
        <div className="sx-cta-glow" aria-hidden="true" />
        <span className="sx-eyebrow">Next step</span>
        <h2>{title}</h2>
        <p>{copy}</p>
        <div className="sx-actions center">
          <Link className="sx-btn primary" href="/pricing#quote">
            <FileText size={16} /> Request a Quote
          </Link>
          <BookCallLink />
          <Link className="sx-btn ghost" href="/services">
            <Layers size={16} /> View Services
          </Link>
        </div>
      </section>
    </Reveal>
  );
}

export function RelatedServices({
  title = 'Related services',
  items,
}: {
  title?: string;
  items: { name: string; description: string; href: string }[];
}) {
  if (!items.length) return null;
  return (
    <section className="container sx-section">
      <div className="sx-section-head">
        <span className="sx-eyebrow">Often paired with</span>
        <h2>{title}</h2>
      </div>
      <div className="sx-related">
        {items.map((item, index) => (
          <Reveal key={item.name} delay={index * 0.06}>
            <Link className="sx-related-card" href={item.href}>
              <strong>{item.name}</strong>
              <p>{item.description}</p>
              <ArrowUpRight size={16} />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
