'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Heart, Eye, GitCompareArrows, ShoppingBag, X, Minus, Plus, Star, Trash2, Check, ZoomIn, Share2, FileText } from 'lucide-react';
import { useCommerce } from '@/components/commerce-provider';
import { usePlatform } from '@/components/providers';
import { productImages, type ShopProduct } from '@/lib/commerce';
import { money } from '@/lib/utils';
import { useCatalog } from '@/components/catalog-provider';

export function ShopDialog({ open, close, title, children, drawer = false }: { open: boolean; close: () => void; title: string; children: ReactNode; drawer?: boolean }) {
  useEffect(() => { if (!open) return; const previous = document.activeElement as HTMLElement | null; const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); }; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; document.addEventListener('keydown', onKey); return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); previous?.focus(); }; }, [open, close]);
  if (!open) return null;
  return createPortal(<div className={'shop-modal-layer ' + (drawer ? 'shop-drawer-layer' : '')} role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><section className={'shop-dialog ' + (drawer ? 'shop-drawer' : '')} role="dialog" aria-modal="true" aria-label={title}><div className="dialog-content"><div className="dialog-heading"><h2>{title}</h2><button className="shop-icon" aria-label={'Close ' + title} onClick={close}><X size={20} /></button></div>{children}</div></section></div>, document.body);
}
export function ProductGallery({ id, track = false }: { id: string; track?: boolean }) {
  const products = useCatalog();
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const { viewed } = usePlatform();
  const product = products.find(p => p.id === id);
  const images = productImages(id, product?.imageUrl);
  const name = product?.name || 'Product';
  const tracked = useRef<string | null>(null);
  useEffect(() => { if (track && tracked.current !== id) { tracked.current = id; viewed(id); } }, [id, track, viewed]);
  return <><div className="product-gallery"><div className="gallery-main"><Image src={images.gallery[selected]} alt={`${name} NEVIE ecosystem promotional image${selected ? ', detail' : ''}`} fill sizes="(max-width: 700px) 90vw, 550px" priority={track} /><button className="gallery-zoom" onClick={() => setZoom(true)} aria-label={`Zoom ${name} image`}><ZoomIn size={18} /> Zoom</button></div><div className="gallery-thumbs">{images.gallery.map((src, i) => <button key={src} aria-label={`View ${name} image ${i + 1}`} aria-pressed={selected === i} onClick={() => setSelected(i)}><Image src={src} alt="" width={88} height={60} /></button>)}<span>Original NEVIE image</span></div></div><ShopDialog open={zoom} close={() => setZoom(false)} title={`${name} image`}><div className="zoom-image"><Image src={images.gallery[selected]} alt={`${name} enlarged NEVIE image`} width={1200} height={960} sizes="90vw" /></div></ShopDialog></>;
}
export function PurchaseButtons({ product, compact = false }: { product: ShopProduct; compact?: boolean }) {
  const { add } = usePlatform(); const router = useRouter();
  return <div className={'shop-purchase ' + (compact ? 'compact' : '')}><button className="shop-primary" onClick={() => add(product.id)}><ShoppingBag size={16} /> Add to cart</button><button className="shop-secondary" onClick={() => { add(product.id, false); router.push('/checkout'); }}>Buy now <ArrowRight size={15} /></button></div>;
}
export function ShopCard({ product: p }: { product: ShopProduct }) {
  const { state, wish, compare, setQuickId } = usePlatform();
  const art = productImages(p.id, p.imageUrl); const facts = useCommerce()[p.id] ?? { id: p.id, rating: null, reviewCount: 0, compareAtPrice: null, publishedAt: null, sales: null, views: null, reviews: [] };
  const discount = facts.compareAtPrice && facts.compareAtPrice > p.price ? Math.round((1 - p.price / facts.compareAtPrice) * 100) : null;
  return <article className="shop-card"><div className="shop-card-art"><Link href={'/marketplace/' + p.id} aria-label={'View ' + p.name}><Image src={art.cover} alt={`${p.name} NEVIE ecosystem promotional image`} fill sizes="(max-width: 600px) 78vw, (max-width: 1000px) 42vw, 300px" /><Image className="shop-hover-art" src={art.hover} alt="" fill sizes="300px" /></Link><span className="shop-badge">{discount ? `−${discount}%` : p.category}</span><button className="shop-icon card-wish" aria-label={(state.wishlist.includes(p.id) ? 'Unsave ' : 'Save ') + p.name} aria-pressed={state.wishlist.includes(p.id)} onClick={() => wish(p.id)}><Heart size={17} fill={state.wishlist.includes(p.id) ? 'currentColor' : 'none'} /></button><div className="card-tools"><button onPointerDown={event => event.stopPropagation()} onClick={event => { event.preventDefault(); event.stopPropagation(); setQuickId(p.id); }} aria-label={'Quick view ' + p.name}><Eye size={16} /> Quick view</button><button aria-label={'Compare ' + p.name} aria-pressed={state.compare.includes(p.id)} onClick={() => compare(p.id)}>{state.compare.includes(p.id) ? <Check size={16} /> : <GitCompareArrows size={16} />} Compare</button></div></div><div className="shop-card-body"><span className="shop-maker">NEVIE-GLOBAL / DIGITAL COLLECTION</span><h3><Link href={'/marketplace/' + p.id}>{p.name}</Link></h3><p>{p.features[0]}</p><div className="shop-rating"><Star size={13} /> {facts.rating === null ? 'Not yet rated' : `${facts.rating} (${facts.reviewCount})`}</div><div className="shop-price"><strong>{money(p.price)}</strong>{discount && <del>{money(facts.compareAtPrice!)}</del>}<span>Source catalogue price</span></div><PurchaseButtons product={p} compact /></div></article>;
}
export function QuantityControl({ id }: { id: string }) {
  const products = useCatalog();
  const { state, quantity } = usePlatform(); const value = state.quantities[id] || 1; const name = products.find(p => p.id === id)?.name;
  return <div className="quantity-control"><button aria-label={'Decrease ' + name + ' quantity'} disabled={value === 1} onClick={() => quantity(id, value - 1)}><Minus size={14} /></button><output aria-label={name + ' quantity'} aria-live="polite">{value}</output><button aria-label={'Increase ' + name + ' quantity'} disabled={value === 99} onClick={() => quantity(id, value + 1)}><Plus size={14} /></button></div>;
}
export function ShoppingOverlays() {
  const products = useCatalog();
  const { state, ready, cartOpen, setCartOpen, count, remove, compare, quickId, setQuickId } = usePlatform();
  const [comparing, setComparing] = useState(false);
  const items = products.filter(p => state.cart.includes(p.id));
  const compared = products.filter(p => state.compare.includes(p.id));
  const quickProduct = quickId ? products.find((product) => product.id === quickId) : null;
  const subtotal = items.reduce((sum, p) => sum + p.price * (state.quantities[p.id] || 1), 0);
  return <><ShopDialog open={quickProduct !== null} close={() => setQuickId(null)} title={quickProduct?.name || 'Quick view'}>{quickProduct && <div className="quick-layout"><ProductGallery id={quickProduct.id} /><div><span className="shop-badge">{quickProduct.category}</span><p>{quickProduct.description}</p><ul className="quick-features">{quickProduct.features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul><div className="shop-price"><strong>{money(quickProduct.price)}</strong><span>Source catalogue price</span></div><PurchaseButtons product={quickProduct} /><Link className="shop-text-link" href={'/marketplace/' + quickProduct.id} onClick={() => setQuickId(null)}>Full product details <ArrowRight size={16} /></Link></div></div>}</ShopDialog><ShopDialog open={cartOpen} close={() => setCartOpen(false)} title={`Your cart (${count})`} drawer>{!ready ? <div className="shop-skeleton" role="status">Loading your cart…</div> : !items.length ? <div className="shop-empty"><ShoppingBag size={42} /><h3>Your next idea starts here.</h3><p>Find something that moves your business forward.</p><button className="shop-primary" onClick={() => setCartOpen(false)}>Continue shopping</button><Link href="/marketplace" onClick={() => setCartOpen(false)}>Explore all products</Link></div> : <><div className="drawer-items">{items.map(p => <div className="drawer-item" key={p.id}><Image src={productImages(p.id).thumbnail} alt={p.name} width={88} height={88} /><div><Link href={'/marketplace/' + p.id} onClick={() => setCartOpen(false)}>{p.name}</Link><span>{money(p.price)} each</span><QuantityControl id={p.id} /></div><button className="shop-icon" aria-label={'Remove ' + p.name} onClick={() => remove(p.id)}><Trash2 size={16} /></button></div>)}</div><div className="drawer-summary"><div><span>Subtotal</span><strong aria-live="polite">{money(subtotal)}</strong></div><p>Source catalogue prices. UK VAT is added at Stripe Checkout.</p><Link className="shop-primary" href="/checkout" onClick={() => setCartOpen(false)}>Checkout <ArrowRight size={17} /></Link><button className="shop-secondary" onClick={() => setCartOpen(false)}>Continue shopping</button></div></>}</ShopDialog>{compared.length > 0 && <div className="compare-tray"><span><GitCompareArrows size={17} /> {compared.length} selected</span><button className="shop-primary" onClick={() => setComparing(true)}>Compare products</button><button className="shop-icon" aria-label="Clear comparison" onClick={() => compared.forEach(p => compare(p.id))}><X size={18} /></button></div>}<ShopDialog open={comparing} close={() => setComparing(false)} title="Compare products"><div className="compare-grid">{compared.map(p => <div key={p.id}><Image src={productImages(p.id).cover} alt={p.name} width={300} height={200} /><h3>{p.name}</h3><span className="shop-badge">{p.category}</span><div className="shop-price"><strong>{money(p.price)}</strong></div><p>{p.description}</p><ul>{p.features.map(f => <li key={f}>{f}</li>)}</ul><PurchaseButtons product={p} /><button className="shop-text-link" onClick={() => compare(p.id)}>Remove from comparison</button></div>)}</div>{!compared.length && <p>Select products to compare their capabilities and prices.</p>}</ShopDialog></>;
}

export function ProductDetailControls({ id }: { id: string }) {
  const products = useCatalog();
  const { state, wish, compare } = usePlatform();
  const [status, setStatus] = useState('');
  const share = async () => { const url = window.location.href; try { if (navigator.share) await navigator.share({ title: products.find((p) => p.id === id)?.name, url }); else { await navigator.clipboard.writeText(url); setStatus('Link copied'); } } catch {} };
  return <div className="detail-tools"><button className="shop-secondary" onClick={() => wish(id)} aria-pressed={state.wishlist.includes(id)}><Heart size={16} fill={state.wishlist.includes(id) ? 'currentColor' : 'none'} /> {state.wishlist.includes(id) ? 'Saved' : 'Wishlist'}</button><button className="shop-secondary" onClick={() => compare(id)} aria-pressed={state.compare.includes(id)}><GitCompareArrows size={16} /> Compare</button><button className="shop-secondary" onClick={share}><Share2 size={16} /> Share</button><Link className="shop-secondary" href="/documentation"><FileText size={16} /> Documentation</Link><span aria-live="polite" className="sr-only">{status}</span></div>;
}
