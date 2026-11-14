'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Check, Cookie, X } from 'lucide-react';
import { NEVIELoader } from '@/components/nevie-loader';

export function SiteOverlays() {
  const pathname = usePathname();
  const firstRoute = useRef(true);
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(8);
  const [routeBar, setRouteBar] = useState(false);
  const [cookieOpen, setCookieOpen] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const openCookies = () => {
      try {
        setCookieOpen(!localStorage.getItem('nevie-cookie-choice'));
      } catch {
        setCookieOpen(true);
      }
    };

    if (reduced) {
      setVisible(false);
      openCookies();
      return;
    }

    const started = performance.now();
    const step = window.setInterval(() => {
      const value = Math.min(96, 8 + Math.round(((performance.now() - started) / 1400) * 88));
      setProgress(value);
      if (value >= 96) clearInterval(step);
    }, 90);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      setLeaving(true);
      window.setTimeout(() => {
        setVisible(false);
        openCookies();
      }, 480);
    };

    const onReady = () => window.setTimeout(finish, 900);
    if (document.readyState === 'complete') onReady();
    else window.addEventListener('load', onReady, { once: true });
    const cap = window.setTimeout(finish, 2400);

    return () => {
      clearInterval(step);
      clearTimeout(cap);
      window.removeEventListener('load', onReady);
    };
  }, []);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    if (visible) return;
    setRouteBar(true);
    const hide = window.setTimeout(() => setRouteBar(false), 720);
    return () => clearTimeout(hide);
  }, [pathname, visible]);

  const choose = (choice: 'accepted' | 'essential') => {
    try {
      localStorage.setItem('nevie-cookie-choice', choice);
    } catch {}
    void fetch('/api/consent', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice }),
    });
    setCookieOpen(false);
  };

  return (
    <>
      {visible ? (
        <NEVIELoader variant="splash" progress={progress} leaving={leaving} />
      ) : null}
      <div
        className={'route-progress' + (routeBar ? ' is-on' : '')}
        aria-hidden="true"
      />
      {cookieOpen ? (
        <aside className="cookie-banner" aria-label="Cookie preferences">
          <Cookie size={22} />
          <div>
            <strong>Your privacy, with clarity.</strong>
            <p>
              We use essential storage to keep your basket, theme and workspace
              preferences working. Optional analytics stay off until you accept.
            </p>
            <Link href="/privacy">Read privacy notice</Link>
          </div>
          <div className="cookie-actions">
            <button
              className="cookie-essential"
              onClick={() => choose('essential')}
            >
              Essential only
            </button>
            <button className="shop-primary" onClick={() => choose('accepted')}>
              Accept all <Check size={16} />
            </button>
          </div>
          <button
            className="cookie-close"
            aria-label="Close cookie preferences"
            onClick={() => choose('essential')}
          >
            <X size={18} />
          </button>
        </aside>
      ) : null}
    </>
  );
}
