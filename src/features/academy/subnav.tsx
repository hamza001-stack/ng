
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

/* Public academy navigation. Add/rename a tab here. */
const items = [
  { href: '/academy', key: 'home', exact: true },
  { href: '/academy/courses', key: 'courses' },
  { href: '/academy/pricing', key: 'prices' },
  { href: '/academy/schedule', key: 'startDates' },
  { href: '/academy/status', key: 'myApplication' },
] as const;

export function AcademySubNav() {
  const path = usePathname() || '';
  const t = useTranslations('Navigation');

  return (
    <div className="nv-subnav">
      <div className="nv-wrap">
        <nav className="nv-nav" aria-label={t('ariaLabel')}>
          {items.map((item) => {
            const on = 'exact' in item && item.exact
              ? path === item.href
              : path === item.href || path.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={on ? 'nv-on' : undefined}
                aria-current={on ? 'page' : undefined}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/academy/pre-registration"
          className="nv-btn nv-primary nv-sm"
        >
          {t('preRegister')}
        </Link>
      </div>
    </div>
  );
}
