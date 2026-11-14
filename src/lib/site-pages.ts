import { routes, privateRoutes } from '@/lib/catalogue';

/**
 * Pages whose SEO title/description and extra HTML can be edited in
 * Admin → Pages & pricing. To make another page editable:
 *   1. add it here (key = the value you pass to getSitePage()), and
 *   2. render <SitePageHtml pageKey="…" /> and use getPageMetadata() on that page.
 * Every public slug served by src/app/[slug]/page.tsx is already wired.
 */
export type EditablePage = { key: string; label: string; path: string };

const dedicated: EditablePage[] = [
  { key: 'academy', label: 'Academy — Overview', path: '/academy' },
  { key: 'academy-courses', label: 'Academy — Courses', path: '/academy/courses' },
  { key: 'academy-pricing', label: 'Academy — Prices', path: '/academy/pricing' },
  { key: 'academy-schedule', label: 'Academy — Start dates', path: '/academy/schedule' },
  { key: 'academy-pre-registration', label: 'Academy — Pre-registration', path: '/academy/pre-registration' },
  { key: 'academy-enrol', label: 'Academy — Request a place', path: '/academy/enrol' },
  { key: 'pricing', label: 'Pricing', path: '/pricing' },
];

const dedicatedKeys = new Set(dedicated.map((page) => page.key));

const label = (slug: string) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const editablePages: EditablePage[] = [
  ...dedicated,
  ...routes
    .filter((slug) => !privateRoutes.includes(slug) && !dedicatedKeys.has(slug))
    .map((slug) => ({ key: slug, label: label(slug), path: '/' + slug })),
];

export const editablePageKeys = new Set(editablePages.map((page) => page.key));
