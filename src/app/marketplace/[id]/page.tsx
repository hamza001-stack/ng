import { ProductGallery, ProductDetailControls } from '@/features/shop';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ArrowUpRight, ChevronRight, Download, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { InfoCards } from '@/components/page-head';
import { ProductActions } from '@/features/marketplace';
import { JsonLd, metadata, siteUrl } from '@/lib/seo';
import { money } from '@/lib/utils';
import { isPreOrder, productSpecs } from '@/lib/product-specs';
import { getProductById, listPublishedProducts } from '@/server/catalog';

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await listPublishedProducts();
    return products.map((p) => ({ id: p.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProductById(id);
  return p
    ? metadata(p.name, p.description, '/marketplace/' + id)
    : { title: 'Product not found' };
}

export default async function Product({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProductById(id);
  if (!p) notFound();
  const specs = productSpecs(p.id);
  const preOrder = isPreOrder(p.tag);
  const categorySlug = p.category.toLowerCase().replaceAll(' ', '-');
  const keyFacts = preOrder
    ? specs.filter((spec) => ['Dispatch window', 'Materials', 'Ring sizes', 'Bracelet sizes'].includes(spec.label))
    : specs.slice(0, 3);
  const related = (await listPublishedProducts())
    .filter((item) => item.id !== id && item.category === p.category)
    .slice(0, 3);
  return (
    <>
      <div className="container page-body product-detail-page">
        <nav className="pd-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link href="/marketplace">Marketplace</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link href={`/marketplace/category/${categorySlug}`}>{p.category}</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">{p.name}</span>
        </nav>
        <div className="product-detail-hero">
          <ProductGallery id={p.id} track />
          <div className="product-detail-buy">
            <div className="pd-badges">
              <span className={`pd-badge${preOrder ? ' pre' : ''}`}>{preOrder ? 'Pre-order' : p.tag}</span>
              <span className="pd-category">{p.category}</span>
            </div>
            <h1 className="pd-title">{p.name}</h1>
            <p className="pd-lead">{p.description}</p>
            <div className="pd-price">
              <strong>{money(p.price)}</strong>
              <span>GBP · UK VAT calculated at checkout</span>
            </div>
            {keyFacts.length ? (
              <ul className="pd-facts">
                {keyFacts.map((fact) => (
                  <li key={fact.label}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </li>
                ))}
              </ul>
            ) : null}
            <ProductActions id={p.id} />
            <ProductDetailControls id={p.id} />
            <ul className="pd-trust">
              <li>
                <ShieldCheck size={16} /> Secure payment by Stripe — card details never touch our servers
              </li>
              <li>
                <Truck size={16} /> {preOrder ? 'UK delivery · dispatch window To Be Confirmed' : 'UK delivery · see shipping policy'}
              </li>
              <li>
                <RotateCcw size={16} /> 14-day returns on unused physical goods
              </li>
            </ul>
          </div>
        </div>
        <section className="product-detail-grid">
          <div>
            <span className="store-eyebrow">SPECIFICATIONS</span>
            <h2>Designed with purpose.</h2>
            <dl className="spec-list">
              <div>
                <dt>Collection</dt>
                <dd>{p.category}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>
                  {preOrder ? 'Open for pre-order' : p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </dd>
              </div>
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <span className="store-eyebrow">WHAT’S INCLUDED</span>
            <h2>Product highlights</h2>
            <ul className="quick-features">
              {p.features.map((feature) => (
                <li key={feature}>
                  <Check size={17} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="product-detail-grid product-support">
          <div>
            <span className="store-eyebrow">SUPPORT</span>
            <h2>Documentation</h2>
            <p>Need a contract pack or technical note? Use the contact form.</p>
            <Link className="shop-secondary" href="/contact">
              <Download size={16} /> Contact support
            </Link>
          </div>
          <div>
            <span className="store-eyebrow">FAQ</span>
            <h2>Before you order</h2>
            <details>
              <summary>Are prices GBP?</summary>
              <p>Yes. UK VAT is added at checkout at the configured rate.</p>
            </details>
            <details>
              <summary>How do I pay?</summary>
              <p>Stripe Checkout. You will receive an email when the payment succeeds.</p>
            </details>
            {preOrder ? (
              <details>
                <summary>When will my pre-order ship?</summary>
                <p>
                  The dispatch window is To Be Confirmed. It will be emailed to you and shown on this page
                  as soon as it is set.
                </p>
              </details>
            ) : null}
            <details>
              <summary>Can I return it?</summary>
              <p>
                Unused physical goods can be returned within 14 days of delivery — see the{' '}
                <Link href="/returns">returns policy</Link>. Digital products follow the{' '}
                <Link href="/refunds">refunds policy</Link>.
              </p>
            </details>
          </div>
        </section>
        <section className="section">
          <div className="store-section-head">
            <div>
              <span className="store-eyebrow">MORE TO EXPLORE</span>
              <h2>Related products</h2>
            </div>
            <Link className="shop-text-link" href="/marketplace">
              View all products <ArrowUpRight size={16} />
            </Link>
          </div>
          <InfoCards
            items={related.map((item) => ({
              title: item.name,
              description: item.description,
              href: '/marketplace/' + item.id,
            }))}
          />
        </section>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: p.description,
          sku: p.id,
          brand: { '@type': 'Brand', name: 'NEVIE-GLOBAL' },
          url: siteUrl + '/marketplace/' + p.id,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'GBP',
            price: p.price,
            availability: preOrder
              ? 'https://schema.org/PreOrder'
              : p.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        }}
      />
    </>
  );
}
