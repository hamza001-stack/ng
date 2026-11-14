'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Plus, ShoppingBag } from 'lucide-react';
import { usePlatform } from '@/components/providers';
import { productImages, type ShopProduct } from '@/lib/commerce';
import { money } from '@/lib/utils';
import { TBC, type Service } from '@/lib/editorial';

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="sx-faq">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div className={expanded ? 'sx-faq-item open' : 'sx-faq-item'} key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`faq-${index}`}
                id={`faq-q-${index}`}
                onClick={() => setOpen(expanded ? null : index)}
              >
                {item.q}
                <Plus size={18} aria-hidden="true" />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  id={`faq-${index}`}
                  role="region"
                  aria-labelledby={`faq-q-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="sx-faq-answer"
                >
                  <p>{item.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function ServiceCards({ items }: { items: Service[] }) {
  const choose = (slug: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('service', slug);
    url.hash = 'quote';
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new Event('sx:service'));
    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="sx-service-grid">
      {items.map((service, index) => (
        <motion.article
          id={`service-${service.slug}`}
          key={service.slug}
          className="sx-service-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: (index % 3) * 0.06 }}
        >
          <div className="sx-service-media">
            <Image src={service.image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" className="sx-cover-img" />
          </div>
          <div className="sx-service-body">
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <dl>
              <div>
                <dt>Starting price</dt>
                <dd>{service.startingPrice || TBC}</dd>
              </div>
              <div>
                <dt>Timeline</dt>
                <dd>{service.timeline || TBC}</dd>
              </div>
            </dl>
            <div className="sx-service-actions">
              <button type="button" className="sx-btn ghost small" onClick={() => choose(service.slug)}>
                Get a quote <ArrowUpRight size={14} />
              </button>
              {service.page ? (
                <Link className="sx-text-link" href={`/${service.page}`}>
                  Service details
                </Link>
              ) : null}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export function LiveProducts({ products }: { products: (ShopProduct & { stock: number })[] }) {
  const { add } = usePlatform();
  const router = useRouter();
  return (
    <div className="sx-product-grid">
      {products.map((product, index) => {
        const available = product.stock > 0;
        return (
          <motion.article
            key={product.id}
            className="sx-product-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
          >
            <Link href={`/marketplace/${product.id}`} className="sx-product-media" aria-label={`${product.name} details`}>
              <Image
                src={productImages(product.id, product.imageUrl).cover}
                alt=""
                fill
                sizes="(max-width: 700px) 100vw, 25vw"
                className="sx-cover-img"
              />
            </Link>
            <div className="sx-product-body">
              <div className="sx-meta">
                <span>{product.category}</span>
                <span className={available ? 'sx-avail' : 'sx-avail out'}>{available ? 'Available' : 'Sold out'}</span>
              </div>
              <h3>{product.name}</h3>
              <strong className="sx-product-price">{money(product.price)}</strong>
              <div className="sx-product-actions">
                <button
                  type="button"
                  className="sx-btn primary small"
                  disabled={!available}
                  onClick={() => {
                    add(product.id, false);
                    router.push('/checkout');
                  }}
                >
                  <ShoppingBag size={14} /> Buy
                </button>
                <Link className="sx-btn ghost small" href={`/marketplace/${product.id}`}>
                  Details
                </Link>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
