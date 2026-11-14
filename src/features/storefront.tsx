'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Search, ShieldCheck, Layers3, Headphones, KeyRound, Gem, Link2, Store, Users, GraduationCap, Cloud, BriefcaseBusiness, Star, TrendingUp, BrainCircuit, Database, Workflow } from 'lucide-react';
import { useCatalog } from '@/components/catalog-provider';
import { launchIds, productImages, type ShopProduct } from '@/lib/commerce';
import { useCommerce } from '@/components/commerce-provider';
import { usePlatform } from '@/components/providers';
import { ShopCard } from './shop';
import { Carousel, Card } from '@/components/ui/apple-cards-carousel';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { WobbleCard } from '@/components/ui/wobble-card';
import { InfiniteRibbon } from '@/components/ui/infinite-ribbon';
function Hero() {
  return <section className="mosaic-hero container" aria-label="Featured NEVIE-GLOBAL collections">
    <article className="mosaic-main">
      <Image src={productImages('bracelet-link').cover} alt="Bracelet Link from the NEVIE-GLOBAL collection" fill priority sizes="(max-width: 760px) 100vw, 68vw" />
      <div className="mosaic-shade" />
      <div className="mosaic-main-copy">
        <span className="mosaic-kicker">THE NEVIE-GLOBAL MARKETPLACE</span>
        <h1>Connected thinking.<br /><em>Made tangible.</em></h1>
        <p>Founder access, connected jewellery and digital tools, brought together around your next move.</p>
        <div className="mosaic-actions"><Link className="mosaic-cta" href="/marketplace">Explore marketplace <ArrowUpRight size={17} /></Link><Link className="mosaic-link" href="/marketplace/bague-aura">Discover Bague Aura <ArrowRight size={16} /></Link></div>
      </div>
      <div className="mosaic-index"><span>01 / CONNECTED JEWELLERY</span><strong>Bracelet Link</strong></div>
    </article>
    <aside className="mosaic-side" aria-label="Featured marketplace highlights">
      <Link className="mosaic-promo mosaic-founder" href="/marketplace/founder-box">
        <Image src={productImages('founder-box').cover} alt="Coffret Fondateur from NEVIE-GLOBAL" fill sizes="(max-width: 760px) 100vw, 32vw" />
        <span className="mosaic-promo-shade" />
        <span className="mosaic-promo-copy"><small>FOUNDER ACCESS</small><strong>Coffret<br />Fondateur</strong><em>Your entry point to the NEVIE ecosystem <ArrowUpRight size={16} /></em></span>
      </Link>
      <Link className="mosaic-promo mosaic-link-card" href="/marketplace/bracelet-link">
        <span className="mosaic-orbit" aria-hidden="true" />
        <span className="mosaic-promo-copy"><small>CONNECTED JEWELLERY</small><strong>Wear the<br />connection.</strong><em>Explore Bracelet Link <ArrowUpRight size={16} /></em></span>
      </Link>
    </aside>
  </section>;
}

const showcaseCards = [
  { category: 'PRIVATE AI', title: 'Knowledge Agent', src: '/showcase/knowledge-agent.webp?v=3', copy: 'A governed AI layer that works with the knowledge your organisation already owns.', href: '/ai' },
  { category: 'INTELLIGENCE', title: 'AI Agents', src: '/showcase/ai-agents.webp?v=3', copy: 'Purpose-built digital teammates that connect knowledge, tools and human oversight.', href: '/ai-agents' },
  { category: 'AUTOMATION', title: 'Workflow Studio', src: '/showcase/workflow-studio.webp?v=3', copy: 'Connect the systems, approvals and people behind the work that repeats.', href: '/automation' },
  { category: 'CUSTOMER EXPERIENCE', title: 'Customer Hub', src: '/showcase/customer-hub.webp?v=3', copy: 'Bring customer relationships, service and pipeline into one clear view.', href: '/crm' },
  { category: 'CRM', title: 'Customer relationships', src: '/showcase/crm.webp?v=3', copy: 'Pipeline, service and account context in one operational view.', href: '/crm' },
  { category: 'OPERATIONS', title: 'ERP foundations', src: '/showcase/erp.webp?v=3', copy: 'Plan finance, inventory and delivery around a connected operational core.', href: '/erp' },
  { category: 'COMMERCE', title: 'E-commerce', src: '/showcase/ecommerce.webp?v=3', copy: 'Connected catalogues, journeys and checkout experiences for digital retail.', href: '/marketplace' },
  { category: 'MOBILE', title: 'Mobile Apps', src: '/showcase/mobile-apps.webp?v=3', copy: 'Thoughtful mobile experiences for customers and field teams.', href: '/mobile-app-development' },
  { category: 'WEB', title: 'Web Development', src: '/showcase/web-development.webp?v=3', copy: 'Fast, accessible digital experiences that earn customer confidence.', href: '/web-development' },
  { category: 'SOFTWARE', title: 'SaaS', src: '/showcase/saas.webp?v=3', copy: 'Build a focused software product with a foundation designed to grow.', href: '/saas' },
  { category: 'INFRASTRUCTURE', title: 'Cloud', src: '/showcase/cloud.webp?v=3', copy: 'Resilient infrastructure with clear ownership and cost visibility.', href: '/cloud' },
  { category: 'INTEGRATION', title: 'API Integration', src: '/showcase/api.webp?v=3', copy: 'Reliable integrations with explicit contracts and observable behaviour.', href: '/api-development' },
  { category: 'SECURITY', title: 'Cyber Security', src: '/showcase/cyber-security.webp?v=3', copy: 'Security considered across architecture, implementation and operations.', href: '/cyber-security' },
  { category: 'LEARNING', title: 'NEVIE Academy', src: '/showcase/academy.webp?v=3', copy: 'Practical AI for the decisions your team makes every week.', href: '/academy' },
];
function AceternityShowcase() {
  const cards = showcaseCards.map((item, index) => <Card key={item.title} index={index} card={{ category: item.category, title: item.title, src: item.src, content: <div className="aceternity-detail"><p>{item.copy}</p><Link href={item.href} className="shop-primary">Explore {item.title} <ArrowUpRight size={16} /></Link></div> }} />);
  return <section id="ecosystem" className="aceternity-section store-band" aria-label="NEVIE technology showcase"><div className="store-section-head"><div><span className="store-eyebrow">THE NEVIE-GLOBAL ECOSYSTEM</span><h2>Explore what connects next.</h2><p>Open a solution to see how it fits your business.</p></div><Link href="/services" className="shop-text-link">All services <ArrowUpRight size={17} /></Link></div><Carousel items={cards} /></section>;
}
function AceternityGradient() {
 return <section className="aceternity-gradient-wrap"><BackgroundGradientAnimation containerClassName="aceternity-gradient" className="aceternity-gradient-content" gradientBackgroundStart="rgb(0, 8, 16)" gradientBackgroundEnd="rgb(0, 42, 72)" firstColor="0, 169, 255" secondColor="80, 190, 255" thirdColor="0, 40, 70" fourthColor="255, 212, 122" fifthColor="0, 20, 36" pointerColor="0, 169, 255" size="70%" blendingValue="soft-light" interactive={false}><div className="aceternity-gradient-copy"><span className="store-eyebrow">NEVIE-GLOBAL / UK</span><h2>From possibility<br />to <em>progress.</em></h2><p>Bring intelligence, automation and customer operations into a system your team can use with confidence.</p><Link href="/contact" className="mosaic-cta">Talk to our team <ArrowUpRight size={17} /></Link></div></BackgroundGradientAnimation></section>;
}
const platformBlocks = [
 { icon: BrainCircuit, title: 'Knowledge Agent', text: 'Private intelligence around your business knowledge.' },
 { icon: Workflow, title: 'Workflow Studio', text: 'Automations with approvals and people in control.' },
 { icon: Users, title: 'Customer Hub', text: 'Customers, service and pipeline in a shared view.' },
 { icon: Database, title: 'ERP foundations', text: 'Connected data for finance, delivery and inventory.' },
];
function AceternityPlatformCards() {
 return <section className="aceternity-platform store-section store-band"><div className="store-section-head"><div><span className="store-eyebrow">BUILD YOUR PLATFORM</span><h2>Systems that move together.</h2><p>Intelligence, workflow and customer operations, designed as one connected layer.</p></div><Link href="/services" className="shop-text-link">Explore capabilities <ArrowUpRight size={17} /></Link></div><div className="aceternity-glow-grid">{platformBlocks.map(({icon: Icon,title,text},index)=><div className={'aceternity-glow-card glow-'+index} key={title}><GlowingEffect spread={42} glow proximity={80} inactiveZone={0.01} disabled={false} /><div className="aceternity-glow-card-inner"><span><Icon size={21} /></span><h3>{title}</h3><p>{text}</p><Link href="/services">Learn more <ArrowRight size={15}/></Link></div></div>)}</div><div className="aceternity-wobble-grid"><WobbleCard containerClassName="aceternity-wobble aceternity-wobble-main" className="aceternity-wobble-content"><span className="store-eyebrow">CONNECTED OPERATIONS</span><h3>One clear system for the work that matters.</h3><p>Start with a practical challenge. Build the connections that make the whole operation move with less friction.</p><Link href="/contact" className="mosaic-cta">Plan your next step <ArrowUpRight size={16}/></Link></WobbleCard><WobbleCard containerClassName="aceternity-wobble aceternity-wobble-side" className="aceternity-wobble-content"><span className="store-eyebrow">NEVIE ACADEMY</span><h3>Practical AI for business.</h3><p>Learn the decisions behind useful, responsible AI.</p><Link href="/academy" className="mosaic-link">Explore Academy <ArrowRight size={16}/></Link></WobbleCard></div></section>;
}
export function ProductRail({ title, eyebrow, description, items, children }: { title: string; eyebrow?: string; description?: string; items: ShopProduct[]; children?: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null); const drag = useRef({ x: 0, left: 0, active: false });
  const move = (direction: 1 | -1) => { const node = rail.current; if (!node) return; const step = Math.min(360, node.clientWidth * .88); const start = node.scrollLeft <= 2; const end = node.scrollLeft + node.clientWidth >= node.scrollWidth - 2; if (direction === 1 && end) node.scrollTo({ left: 0, behavior: 'smooth' }); else if (direction === -1 && start) node.scrollTo({ left: node.scrollWidth, behavior: 'smooth' }); else node.scrollBy({ left: direction * step, behavior: 'smooth' }); };
  return <section className="store-section"><div className="store-section-head"><div>{eyebrow && <span className="store-eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div><div className="rail-controls"><Link href="/marketplace">View all <ArrowUpRight size={15} /></Link>{items.length > 0 && <><button className="shop-icon" aria-label={'Previous ' + title} onClick={() => move(-1)}><ChevronLeft size={18} /></button><button className="shop-icon" aria-label={'Next ' + title} onClick={() => move(1)}><ChevronRight size={18} /></button></>}</div></div>{items.length ? <div className="product-rail" ref={rail} tabIndex={0} aria-label={title + ' products'} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } }} onPointerDown={event => { drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, active: true }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { if (drag.current.active) event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x); }} onPointerUp={event => { drag.current.active = false; event.currentTarget.releasePointerCapture(event.pointerId); }}>{items.map(item => <ShopCard key={item.id} product={item} />)}</div> : children}</section>;
}
const categories = [
  { name: 'Founder access', icon: KeyRound, id: 'founder-box', href: '/marketplace/category/founder-access' },
  { name: 'Rings', icon: Gem, id: 'bague-aura', href: '/marketplace/category/connected-jewellery' },
  { name: 'Bracelets', icon: Link2, id: 'bracelet-link', href: '/marketplace/category/connected-jewellery' },
  { name: 'Marketplace', icon: Store, id: 'bracelet-core', href: '/marketplace' },
  { name: 'CRM', icon: Users, art: '/showcase/crm.webp', href: '/crm' },
  { name: 'Academy', icon: GraduationCap, art: '/showcase/academy.webp', href: '/academy' },
  { name: 'SaaS', icon: Cloud, art: '/showcase/saas.webp', href: '/saas' },
  { name: 'Business Tools', icon: BriefcaseBusiness, art: '/categories/business-tools.webp', href: '/products' },
];
function CollectionTabs() {
  const products = useCatalog();
  const commerce = useCommerce();
  const [tab, setTab] = useState('New arrivals');
  const options = ['New arrivals', 'Best sellers', 'Trending products'];
  const items = products.filter((p) => {
    const facts = commerce[p.id];
    if (tab === 'New arrivals') return Boolean(facts?.publishedAt);
    if (tab === 'Best sellers') return (facts?.sales || 0) > 0;
    return (facts?.views || 0) > 0;
  });
  const fallback = launchIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ShopProduct => Boolean(p));
  return <section className="store-section discovery-section store-band"><div className="store-section-head"><div><span className="store-eyebrow">FIND YOUR NEXT FAVOURITE</span><h2>Worth a closer look.</h2><p>A curated preview of the collection, organised around how you want to explore.</p></div><div className="collection-tabs" role="tablist" aria-label="Product collections">{options.map(option => <button id={'tab-' + option.replaceAll(' ', '-')} key={option} role="tab" aria-controls="collection-panel" aria-selected={tab === option} tabIndex={tab === option ? 0 : -1} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const next = options[(options.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : 2)) % 3]; setTab(next); document.getElementById('tab-' + next.replaceAll(' ', '-'))?.focus(); } }} onClick={() => setTab(option)}>{option}</button>)}</div></div><div id="collection-panel" role="tabpanel" aria-labelledby={'tab-' + tab.replaceAll(' ', '-')} tabIndex={0}>{items.length ? <div className="product-rail">{items.map(p => <ShopCard key={p.id} product={p} />)}</div> : fallback.length ? <><p className="collection-data-note">Curated preview selection · {tab === 'New arrivals' ? 'Release dates will be confirmed at launch.' : 'Live rankings appear when verified shopping data is available.'}</p><div className="product-rail">{fallback.map((p) => <ShopCard key={p.id} product={p} />)}</div></> : <div className="collection-empty"><TrendingUp size={25} /><div><h3>{tab === 'New arrivals' ? 'The next collection is on its way.' : tab === 'Best sellers' ? 'Discover tomorrow’s favourites.' : 'A new perspective is coming.'}</h3><p>{tab === 'New arrivals' ? 'New releases will appear here once launch dates are confirmed.' : 'Rankings will appear here when verified shopping activity is available.'}</p></div><Link href="/marketplace" className="shop-secondary">Explore marketplace <ArrowRight size={16} /></Link></div>}</div></section>;
}
export function Storefront() {
  const products = useCatalog();
  const { state, ready } = usePlatform();
  const commerce = useCommerce();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const searchResults = search.trim() ? products.filter(product => (product.name + ' ' + product.category + ' ' + product.description).toLowerCase().includes(search.trim().toLowerCase())).slice(0, 5) : [];
  const launchProducts = launchIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ShopProduct => Boolean(p));
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { const sections = root.current?.querySelectorAll('.store-section'); if (!sections || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-revealed'); observer.unobserve(e.target); } }), { threshold: 0.06 }); sections.forEach(s => { s.classList.add('reveal-ready'); observer.observe(s); }); return () => observer.disconnect(); }, []);
  const recent = state.recent.map(id => products.find(p => p.id === id)!).filter(Boolean);
  const preferred = new Set(products.filter(p => [...state.wishlist, ...state.recent].includes(p.id)).map(p => p.category));
  const recommended = [...launchProducts].sort((a, b) => Number(preferred.has(b.category)) - Number(preferred.has(a.category)));
  const deals = products.filter((p) => (commerce[p.id]?.compareAtPrice || 0) > p.price);
  return <div className="storefront" ref={root}><div className="store-announcement"><span>THE NEVIE DIGITAL COLLECTION</span><span>Explore the preview. Find your next advantage.</span><Link href="/marketplace">Discover now <ArrowRight size={14} /></Link></div><div className="store-shopbar container"><nav aria-label="Shop collections"><Link href="/marketplace?all=1">All products</Link><a href="#categories">Categories</a><a href="#offers">Offers</a><Link href="/academy">Academy</Link></nav><form className="store-search" role="search" onSubmit={event => { event.preventDefault(); if (search.trim()) router.push('/marketplace?q=' + encodeURIComponent(search.trim())); }}><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} name="q" aria-label="Search the marketplace" placeholder="Search products, AI, CRM…" autoComplete="off" /><button aria-label="Search"><ArrowRight size={17} /></button>{search.trim() && <div className="search-results" role="listbox">{searchResults.length ? searchResults.map(product => <Link role="option" key={product.id} href={'/marketplace/' + product.id} onClick={() => setSearch('')}><span>{product.category}</span><strong>{product.name}</strong></Link>) : <p>No matching products yet.</p>}</div>}</form></div><div className="store-stage"><Hero /><InfiniteRibbon className="nevie-market-ribbon" duration={34} rotation={0}>NEVIE-GLOBAL · CONNECTED JEWELLERY · KNOWLEDGE AGENT · WORKFLOW STUDIO · CUSTOMER HUB · </InfiniteRibbon><div className="store-benefits container"><span><Layers3 size={19} /> Digital-first products</span><span><ShieldCheck size={19} /> Clear product information</span><span><Headphones size={19} /> A team you can talk to</span><span> Curated by NEVIE-GLOBAL</span></div></div><div className="container"><section id="categories" className="store-section category-section store-band"><div className="store-section-head"><div><span className="store-eyebrow">EXPLORE YOUR POSSIBILITIES</span><h2>What will you build next?</h2><p>Jewellery, CRM, SaaS and Academy — one visual language across the ecosystem.</p></div><Link className="shop-text-link" href="/marketplace">Browse marketplace <ArrowUpRight size={17} /></Link></div><div className="category-rail">{categories.map(({ name, id, art, href, icon: Icon }) => <Link href={href} className="visual-category" key={name}><div><Image src={art || productImages(id!).thumbnail} alt={name} width={144} height={120} sizes="144px" /><Icon size={18} /></div><span>{name}</span></Link>)}</div></section><AceternityShowcase /><AceternityGradient /><AceternityPlatformCards /><div id="collections"><ProductRail title="The NEVIE-GLOBAL collection." eyebrow="FEATURED PRODUCTS" description="Founder access and connected jewellery from NEVIE-GLOBAL." items={launchProducts} /></div><section className="store-section store-editorial"><div><span className="store-eyebrow">THE JEWELLERY EDIT</span><h2>A new kind of<br /><em>connection.</em></h2><p>Discover connected jewellery from the NEVIE-GLOBAL collection.</p><Link className="shop-primary" href="/marketplace/bague-aura">Explore the collection <ArrowUpRight size={17} /></Link><span className="editorial-caption">NEVIE-GLOBAL / CONNECTED JEWELLERY</span></div><div className="editorial-image"><Image src={productImages('bague-aura').cover} alt="Bague Aura from the NEVIE-GLOBAL collection" fill sizes="(max-width: 700px) 90vw, 600px" /></div></section><CollectionTabs /><ProductRail title="Recommended for you" eyebrow="A LITTLE INSPIRATION" description={preferred.size ? 'Inspired by the products you’ve explored on this device.' : 'Start with these picks from our digital collection.'} items={recommended} /><section id="offers" className="store-section"><div className="store-section-head"><div><span className="store-eyebrow">THE OFFERS EDIT</span><h2>Flash deals</h2><p>Promotions appear here when a live campaign is confirmed.</p></div><Link className="shop-text-link" href="/marketplace">Browse products <ArrowUpRight size={17} /></Link></div>{deals.length ? <div className="product-rail">{deals.map(p => <ShopCard key={p.id} product={p} />)}</div> : <div className="offer-banner"><div><span className="shop-badge">UP NEXT</span><h3>Good things are worth looking out for.</h3><p>No live promotions yet. Discover the collection while we prepare for launch.</p></div><Link className="shop-secondary" href="/marketplace">Explore products <ArrowRight size={17} /></Link></div>}</section><section className="store-section brand-feature"><div><span className="store-eyebrow">FEATURED BRAND</span><h2>One connected ecosystem.<br />Yours to explore.</h2><p>Digital products, practical learning and specialist services, brought together by NEVIE-GLOBAL.</p><Link className="shop-text-link" href="/about">Meet NEVIE-GLOBAL <ArrowUpRight size={17} /></Link></div><div className="brand-wordmark">NEVIE<span>—</span>GLOBAL<small>INTELLIGENCE. CONNECTED.</small></div></section><section className="store-section store-reviews"><div><span className="store-eyebrow">CUSTOMER REVIEWS</span><h2>Real experiences.<br />When they’re ready to share.</h2></div><div><Star size={26} /><h3>Your experience will matter.</h3><p>Verified customer reviews will appear here after live purchases begin. Until then, explore product details or talk to our team.</p><Link className="shop-text-link" href="/contact">Ask a product question <ArrowRight size={16} /></Link></div></section>{ready && recent.length > 0 && <ProductRail title="Pick up where you left off" eyebrow="RECENTLY VIEWED" items={recent} />}</div><div className="store-preview-note">Preview catalogue · Source catalogue prices · Original NEVIE imagery · Purchasing opens at launch</div></div>;
}
