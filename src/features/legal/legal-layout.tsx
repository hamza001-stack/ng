import Link from 'next/link';
import { companyLines, legalEntity, type LegalEntity } from '@/lib/legal';

export function LegalLayout({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  const entity = legalEntity();
  return (
    <div className="container page-body legal-page">
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      <p className="legal-entity">{companyLines(entity).join(' · ')}</p>
      <article className="legal-copy">{children}</article>
      <nav className="legal-nav" aria-label="Legal documents">
        <Link href="/privacy">Privacy</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/refunds">Refunds</Link>
        <Link href="/returns">Returns</Link>
        <Link href="/shipping">Shipping</Link>
        <Link href="/gdpr">GDPR</Link>
        <Link href="/legal">Company</Link>
      </nav>
    </div>
  );
}

export function EntityBlock({ entity }: { entity: LegalEntity }) {
  return (
    <ul>
      {companyLines(entity).map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}
