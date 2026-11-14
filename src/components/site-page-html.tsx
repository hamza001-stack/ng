import { getSitePage } from '@/server/site-content';
import { sanitizeHtml } from '@/lib/sanitize-html';

/**
 * Renders the admin-edited HTML for a page (Admin → Pages & pricing).
 * Renders nothing until someone has saved content for `pageKey`.
 * HTML is sanitised here, at render time, regardless of what is stored.
 */
export async function SitePageHtml({ pageKey, className }: { pageKey: string; className?: string }) {
  const page = await getSitePage(pageKey);
  const html = page ? sanitizeHtml(page.html) : '';
  if (!html.trim()) return null;
  return (
    <section className={'site-page-html prose ' + (className ?? '')} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
