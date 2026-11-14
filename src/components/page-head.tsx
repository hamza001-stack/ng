import Link from 'next/link';
import { ArrowUpRight, ChevronRight, Layers3 } from 'lucide-react';
import { BreadcrumbSchema } from '@/lib/seo';
const labels: Record<string, string> = {
  '/marketplace': 'DIGITAL PRODUCTS',
  '/products': 'DIGITAL PRODUCTS',
  '/academy': 'LEARN / APPLY / ADVANCE',
  '/services': 'EXPERTISE / BUILT AROUND YOU',
  '/about': 'THE COMPANY / OUR PURPOSE',
  '/dashboard': 'YOUR WORKSPACE',
  '/contact': 'LET’S MAKE THE CONNECTION',
  '/case-studies': 'WORK / APPROACH / OUTCOME',
  '/projects': 'DELIVERY BOARD',
  '/pricing': 'PLANS / SCOPE / CATALOGUE',
};
export function PageHead({
  title,
  description,
  path,
  eyebrow,
}: {
  title: string;
  description: string;
  path: string;
  eyebrow?: string;
}) {
  const compact = [
    '/marketplace',
    '/products',
    '/academy',
    '/cart',
    '/checkout',
    '/dashboard',
    '/orders',
    '/my-account',
    '/wishlist',
    '/subscriptions',
  ].includes(path);
  return (
    <div className={'page-head-shell ' + (compact ? 'compact' : '')}>
      <div className="container page-head">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <span aria-current="page">{title}</span>
        </nav>
        <div className="page-head-content">
          <div>
            <span className="eyebrow">
              {eyebrow || labels[path] || 'NEVIE-GLOBAL / UNITED KINGDOM'}
            </span>
            <h1>{title}</h1>
            <p>{description}</p>
            {path === '/contact' ? (
              <Link href="/services" className="shop-text-link page-head-cta">
                Explore capabilities <ArrowUpRight size={16} />
              </Link>
            ) : path === '/cart' || path === '/checkout' ? null : (
              <Link href="/contact" className="shop-text-link page-head-cta">
                Talk to our team <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
          <span className="page-head-mark" aria-hidden="true">
            N<span>G</span>
          </span>
        </div>
        <BreadcrumbSchema name={title} path={path} />
      </div>
    </div>
  );
}
export function InfoCards({
  items,
}: {
  items: { title: string; description: string; href: string }[];
}) {
  return (
    <div className="card-grid info-grid">
      {items.map((item, i) => (
        <Link href={item.href} className="card info-card" key={item.title}>
          <div className="info-card-top">
            <Layers3 size={23} />
            <span>{String(i + 1).padStart(2, '0')}</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <span className="card-footer">
            Explore <ArrowUpRight size={18} />
          </span>
        </Link>
      ))}
    </div>
  );
}
