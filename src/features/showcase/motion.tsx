'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export function ShowcaseHero({
  badge,
  title,
  accent,
  description,
  crumbs,
  actions,
  aside,
}: {
  badge: string;
  title: string;
  accent?: string;
  description: string;
  crumbs: { label: string; href?: string }[];
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.from('[data-hero-item]', {
          y: 28,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.09,
        });
        gsap.utils.toArray<HTMLElement>('.sx-orb').forEach((orb, index) => {
          gsap.to(orb, {
            x: index % 2 ? -60 : 70,
            y: index % 2 ? 40 : -50,
            scale: 1.15,
            duration: 9 + index * 2,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });
        });
      }, node);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);
  return (
    <section className="sx-hero" ref={root}>
      <div className="sx-hero-bg" aria-hidden="true">
        <span className="sx-orb one" />
        <span className="sx-orb two" />
        <span className="sx-orb three" />
        <span className="sx-grid" />
      </div>
      <div className="container sx-hero-inner">
        <nav className="sx-crumbs" aria-label="Breadcrumb" data-hero-item>
          {crumbs.map((crumb, index) => (
            <span key={crumb.label}>
              {index > 0 ? <ChevronRight size={12} aria-hidden="true" /> : null}
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
            </span>
          ))}
        </nav>
        <div className="sx-hero-grid">
          <div>
            <span className="sx-badge" data-hero-item>
              <span className="sx-badge-dot" aria-hidden="true" />
              {badge}
            </span>
            <h1 data-hero-item>
              {title}
              {accent ? (
                <>
                  {' '}
                  <span className="sx-accent">{accent}</span>
                </>
              ) : null}
            </h1>
            <p className="sx-lead" data-hero-item>
              {description}
            </p>
            {actions ? (
              <div className="sx-actions" data-hero-item>
                {actions}
              </div>
            ) : null}
          </div>
          {aside ? (
            <div className="sx-hero-aside" data-hero-item>
              {aside}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

export function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce, value]);
  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}

export function ProgressRing({ value, size = 64 }: { value: number | null; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const length = 2 * Math.PI * radius;
  if (value === null) {
    return (
      <div className="sx-ring tbc" style={{ width: size, height: size }} title="Progress to be confirmed">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={radius} className="sx-ring-track" strokeWidth={stroke} fill="none" strokeDasharray="4 6" />
        </svg>
        <span className="sx-ring-value" aria-label="Progress to be confirmed">TBC</span>
      </div>
    );
  }
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="sx-ring" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} className="sx-ring-track" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="sx-ring-bar"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={length}
          initial={{ strokeDashoffset: length }}
          animate={{ strokeDashoffset: inView ? length * (1 - clamped / 100) : length }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="sx-ring-value" aria-label={`${clamped}% complete`}>
        <Counter value={clamped} suffix="%" />
      </span>
    </div>
  );
}
