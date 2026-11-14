'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Menu,
  X,
  ShoppingBag,
  ArrowUpRight,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { usePlatform } from './providers';
import { navigation } from '@/lib/navigation';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { HeaderAccount } from './header-account';
import { BrandLogo } from './brand-logo';
export function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const path = usePathname();
  const { count, setCartOpen } = usePlatform();
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    function outside(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(null);
        setMobile(false);
      }
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(null);
        setMobile(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prior;
    };
  }, [mobile]);
  const close = () => {
    setOpen(null);
    setMobile(false);
  };
  return (
    <header
      ref={root}
      className="site-header"
      onMouseLeave={() => setOpen(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null);
      }}
    >
      <div className="container header-inner">
        <Link
          href="/"
          className="wordmark"
          aria-label="NEVIE-GLOBAL UK home"
          onClick={close}
        >
          <BrandLogo priority />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">

      {navigation.map((group) => (
            <div className="nav-group" key={group.label}>
              <button
                ref={open === group.label ? trigger : undefined}
                className={
                  'nav-trigger ' +
                  (group.links.some(
                    (l) => path === l[2] || path.startsWith(l[2] + '/'),
                  )
                    ? 'active'
                    : '')
                }
                aria-expanded={open === group.label}
                aria-controls={'nav-' + group.label}
                onMouseEnter={() => setOpen(group.label)}
                onClick={() =>
                  setOpen(open === group.label ? null : group.label)
                }
              >
                {group.label}
                <ChevronDown size={13} />
              </button>
            </div>
          ))}
        </nav>
        <div className="header-actions">
          <HeaderAccount />
          <button className="icon-button bag-button" aria-label={`Shopping cart, ${count} items`} onClick={() => { close(); setCartOpen(true); }}><ShoppingBag size={18} />{count > 0 && <span className="bag-count" aria-live="polite">{count}</span>}</button>
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/marketplace" className="header-cta" onClick={close}>
            Shop collection <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label={mobile ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobile}
            aria-controls="mobile-menu"
            onClick={(e) => {
              trigger.current = e.currentTarget;
              setMobile(!mobile);
              setOpen(null);
            }}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {navigation.map((group) => (
        <div
          id={'nav-' + group.label}
          key={group.label}
          className="mega-menu"
          hidden={open !== group.label}
        >
          <div className="container mega-inner">
            <div className="mega-intro">
              <span className="eyebrow">
                NEVIE / {group.label.toUpperCase()}
              </span>
              <h2>{group.intro}</h2>
              <p>{group.description}</p>
              <Link href={group.href} className="text-link" onClick={close}>
                Explore {group.label.toLowerCase()} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mega-links">
              {group.links.map(([title, description, href]) => (
                <Link
                  href={href}
                  key={href}
                  onClick={close}
                  aria-current={path === href ? 'page' : undefined}
                >
                  <span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
      {mobile && (
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {navigation.map((group) => (
            <details key={group.label}>
              <summary>
                {group.label}
                <ChevronDown size={17} />
              </summary>
              {group.links.map(([title, description, href]) => (
                <Link href={href} onClick={close} key={href}>
                  {title}
                  <small>{description}</small>
                </Link>
              ))}
            </details>
          ))}
          <Link href="/dashboard" onClick={close}>
            My workspace
          </Link>
          <Link href="/sign-in" onClick={close}>
            Sign in
          </Link>
          <Link href="/sign-up" onClick={close}>
            Create account
          </Link>
          <Link href="/contact" onClick={close} className="button button-gold">
            Talk to our team <ArrowUpRight size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}
