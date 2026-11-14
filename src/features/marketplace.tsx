'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Package,
  ChevronRight,
  X,
} from 'lucide-react';
import { useCatalog } from '@/components/catalog-provider';
import { money } from '@/lib/utils';
import { productImages } from '@/lib/commerce';
import { usePlatform } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { ShopCard, QuantityControl, PurchaseButtons } from './shop';
import { CheckoutButton } from './checkout-button';
const PAGE_SIZE = 6;
const slugFor = (value: string) => value.toLowerCase().replaceAll(' ', '-');
const collectionArt: Record<string, string> = {
  'Founder access': productImages('founder-box').cover,
  'Connected jewellery': productImages('bracelet-link').cover,
};
export function Marketplace({
  wishlistOnly = false,
  initialCategory,
}: {
  wishlistOnly?: boolean;
  initialCategory?: string;
}) {
  const products = useCatalog();
  const collections = [...new Set(products.map((product) => product.category))];
  const categories = ['All products', ...collections];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(
    initialCategory && categories.includes(initialCategory) ? initialCategory : 'All products',
  );
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(250);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [browseAll, setBrowseAll] = useState(Boolean(initialCategory));
  const { state, ready } = usePlatform();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('q') || '');
    setBrowseAll(params.get('all') === '1' || Boolean(initialCategory));
    const selected = initialCategory || params.get('category');
    if (selected && categories.includes(selected)) setCategory(selected);
  }, [initialCategory]);
  const results = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (!wishlistOnly || state.wishlist.includes(p.id)) &&
            (category === 'All products' || category === p.category) &&
            p.price <= maxPrice &&
            (p.name + ' ' + p.description)
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'low'
            ? a.price - b.price
            : sort === 'high'
              ? b.price - a.price
              : sort === 'name'
                ? a.name.localeCompare(b.name)
                : 0,
        ),
    [search, category, sort, maxPrice, wishlistOnly, state.wishlist],
  );
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visibleResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, category, sort, maxPrice, wishlistOnly]);
  const clear = () => {
    setSearch('');
    setCategory('All products');
    setMaxPrice(250);
    setBrowseAll(false);
  };
  const showLanding =
    !wishlistOnly &&
    !initialCategory &&
    !browseAll &&
    !search.trim() &&
    category === 'All products' &&
    maxPrice === 250;
  const jewelleryPreview = products.filter((product) => product.category === 'Connected jewellery').slice(0, 4);
  const founder = products.find((product) => product.id === 'founder-box');
  return (
    <>
      <div className="market-tabs">
        <div>
          <Link
            href="/marketplace"
            aria-current={!wishlistOnly ? 'page' : undefined}
          >
            Discover products
          </Link>
          <Link
            href="/wishlist"
            aria-current={wishlistOnly ? 'page' : undefined}
          >
            <Heart size={15} /> Saved products{' '}
            <span>{state.wishlist.length}</span>
          </Link>
        </div>
        <Link href="/cart" className="text-link">
          Your bag ({state.cart.length}) <ArrowRight size={15} />
        </Link>
      </div>
      {!wishlistOnly && !initialCategory && founder ? (
        <section className="featured-product">
          <div>
            <span className="eyebrow">FEATURED / FOUNDER COLLECTION</span>
            <h2>Discover the founder collection.</h2>
            <p>Start with founder access, then browse jewellery by collection — not the full catalogue at once.</p>
            <Button asChild variant="outline"><Link href="/marketplace/category/founder-access">Explore founder access <ArrowUpRight size={17} /></Link></Button>
          </div>
          <Link href="/marketplace/founder-box" className="featured-product-media" aria-label={founder.name}>
            <Image src={productImages(founder.id, founder.imageUrl).cover} alt={founder.name} fill sizes="(max-width: 900px) 100vw, 42vw" />
          </Link>
        </section>
      ) : null}
      <div className="market-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Search products"
            placeholder="Search products, capabilities, solutions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="icon-button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          className="button button-outline filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="product-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={17} /> Filters
        </button>
        <label className="sort-field">
          <span>Sort by</span>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
      </div>
      <div className="market-layout">
        <aside
          id="product-filters"
          className={'market-sidebar ' + (filtersOpen ? 'is-open' : '')}
        >
          <div className="sidebar-title">
            <h2>Categories</h2>
            <span>{products.length}</span>
          </div>
          <div className="category-options">
            {categories.map((c) => (
              <Link
                key={c}
                href={c === 'All products' ? '/marketplace?all=1' : '/marketplace/category/' + slugFor(c)}
                aria-current={category === c ? 'page' : undefined}
                onClick={() => {
                  setCategory(c);
                  setBrowseAll(c === 'All products');
                }}
              >
                <span>{c}</span>
                <small>
                  {c === 'All products'
                    ? products.length
                    : products.filter((p) => p.category === c).length}
                </small>
              </Link>
            ))}
          </div>
          <div className="price-filter">
            <label htmlFor="price-range">
              Maximum price <strong>{money(maxPrice)}</strong>
            </label>
            <input
              id="price-range"
              type="range"
              min={0}
              max={250}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div>
              <span>{money(0)}</span>
              <span>{money(250)}</span>
            </div>
          </div>
          <div className="sidebar-help">
            <Package size={23} />
            <h3>
              A starting point.
              <br />
              Built around your needs.
            </h3>
            <p>Need help finding the right product or a tailored solution?</p>
            <Link href="/contact" className="text-link">
              Talk to our team <ArrowUpRight size={15} />
            </Link>
          </div>
        </aside>
        <div>
          {showLanding ? (
            <>
              <div className="results-heading">
                <h2>Shop by category</h2>
                <span>{collections.length} collections</span>
              </div>
              <div className="market-collections">
                {collections.map((name) => (
                  <Link key={name} href={'/marketplace/category/' + slugFor(name)} className="market-collection-card">
                    <Image src={collectionArt[name] || productImages(products[0].id).cover} alt="" fill sizes="(max-width: 900px) 100vw, 360px" />
                    <span>
                      <small>{products.filter((product) => product.category === name).length} products</small>
                      <strong>{name}</strong>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="results-heading">
                <h2>Connected jewellery</h2>
                <Link href="/marketplace/category/connected-jewellery" className="text-link">
                  View collection <ArrowRight size={15} />
                </Link>
              </div>
              <div className="market-products">
                {jewelleryPreview.map((p) => (
                  <ShopCard key={p.id} product={p} />
                ))}
              </div>
            </>
          ) : (
            <>
          <div className="results-heading">
            <h2>{wishlistOnly ? 'Your saved products' : category}</h2>
            <span aria-live="polite">
              {results.length} {results.length === 1 ? 'product' : 'products'}
            </span>
          </div>
          {(search || category !== 'All products' || maxPrice !== 250 || browseAll) && (
            <div className="active-filters">
              <span>
                {search && `“${search}” · `}
                {category !== 'All products' && category + ' · '}Up to{' '}
                {money(maxPrice)}
              </span>
              <button onClick={clear}>
                Clear filters <X size={13} />
              </button>
            </div>
          )}
          {wishlistOnly && !ready ? (
            <div className="skeleton" aria-label="Loading saved products" />
          ) : results.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">
                {wishlistOnly ? <Heart size={28} /> : <Search size={28} />}
              </span>
              <span className="eyebrow">
                {wishlistOnly ? 'MAKE IT YOURS' : 'A DIFFERENT DIRECTION'}
              </span>
              <h2>
                {wishlistOnly && !state.wishlist.length
                  ? 'Your next idea deserves a place.'
                  : 'No products match these filters.'}
              </h2>
              <p>
                {wishlistOnly && !state.wishlist.length
                  ? 'Save products as you explore. Come back to compare them whenever you’re ready.'
                  : 'Try a broader search, another category or a different price range.'}
              </p>
              {wishlistOnly && !state.wishlist.length ? (
                <Button asChild>
                  <Link href="/marketplace">
                    Explore the marketplace <ArrowUpRight size={17} />
                  </Link>
                </Button>
              ) : (
                <Button onClick={clear} variant="outline">
                  Reset filters
                </Button>
              )}
            </div>
          ) : (
            <div className="market-products">
              {visibleResults.map((p) => (
                <ShopCard key={p.id} product={p} />
              ))}
            </div>
          )}
          {results.length > PAGE_SIZE && <nav className="pagination" aria-label="Product pages"><button className="shop-secondary" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button className="shop-secondary" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></nav>}
            </>
          )}
          <div className="catalog-disclaimer">
            <ShieldCheck size={17} />
            <small>
              Original NEVIE catalogue. Prices are imported from the source website. Purchasing opens at
              launch; saved products stay on this device.
            </small>
          </div>
        </div>
      </div>
    </>
  );
}
export function ProductActions({ id }: { id: string }) {
  const products = useCatalog();
  const product = products.find((p) => p.id === id);
  return (
    <>
      {product ? <PurchaseButtons product={product} /> : null}
      <Link href="/cart" className="text-link product-bag-link">
        Review your bag <ArrowRight size={16} />
      </Link>
    </>
  );
}
export function Cart({ checkout = false }: { checkout?: boolean }) {
  const products = useCatalog();
  const { state, ready, remove, count } = usePlatform();
  const items = products.filter((p) => state.cart.includes(p.id));
  if (!ready)
    return (
      <div className="skeleton" role="status" aria-label="Loading your bag" />
    );
  return (
    <>
      <div className="checkout-steps">
        <span className={!checkout ? 'current' : ''}>
          01 <b>Your bag</b>
        </span>
        <ChevronRight size={16} />
        <span className={checkout ? 'current' : ''}>
          02 <b>Review</b>
        </span>
        <ChevronRight size={16} />
        <span>
          03 <b>Confirmation</b>
        </span>
      </div>
      {!items.length ? (
        <div className="empty cart-empty">
          <span className="empty-icon">
            <ShoppingBag size={30} />
          </span>
          <span className="eyebrow">ROOM FOR YOUR NEXT IDEA</span>
          <h2>
            A fresh start.
            <br />A world of possibility.
          </h2>
          <p>
            Your bag is empty. Explore digital products designed around
            knowledge, operations and customer experience.
          </p>
          <Button asChild>
            <Link href="/marketplace">
              Discover products <ArrowUpRight size={17} />
            </Link>
          </Button>
          <Link className="text-link" href="/wishlist">
            View saved products <Heart size={15} />
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div>
            <div className="results-heading">
              <h2>{checkout ? 'Review your products' : 'Your selection'}</h2>
              <span>{count} items</span>
            </div>
            {items.map((p) => (
              <div className="cart-row" key={p.id}>
                <div className="cart-product-art">
                  <Image src={productImages(p.id, p.imageUrl).thumbnail} alt="" width={88} height={88} sizes="88px" />
                </div>
                <div className="cart-product-info">
                  <span className="card-meta">{p.category}</span>
                  <h3>
                    <Link href={'/marketplace/' + p.id}>{p.name}</Link>
                  </h3>
                  <p>Digital product</p><QuantityControl id={p.id} />
                  <button
                    className="remove-product"
                    onClick={() => remove(p.id)}
                    aria-label={'Remove ' + p.name}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
                <strong>{money(p.price * (state.quantities[p.id] || 1))}</strong>
              </div>
            ))}
            <Link href="/marketplace" className="text-link continue-shopping">
              Continue exploring <ArrowRight size={16} />
            </Link>
            {checkout ? <CheckoutButton /> : null}
          </div>
          <aside className="order-summary">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>
                {money(items.reduce((sum, p) => sum + p.price * (state.quantities[p.id] || 1), 0))}
              </strong>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>Confirmed at launch</span>
            </div>
            <div className="summary-row order-total">
              <span>Cart total</span>
              <strong>
                {money(items.reduce((sum, p) => sum + p.price * (state.quantities[p.id] || 1), 0))}
              </strong>
            </div>
            {checkout ? (
              <Link href="/contact" className="text-link">
                Ask about a service engagement <ArrowUpRight size={16} />
              </Link>
            ) : (
              <Button asChild>
                <Link href="/checkout">
                  Review your order <ArrowRight size={17} />
                </Link>
              </Button>
            )}
            <p>
              <ShieldCheck size={17} /> VAT is calculated at checkout. Payment is taken by Stripe.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
