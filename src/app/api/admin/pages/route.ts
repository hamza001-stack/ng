import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { editablePageKeys } from '@/lib/site-pages';
import { sanitizeHtml } from '@/lib/sanitize-html';

const saveSchema = z.object({
  key: z.string().refine((key) => editablePageKeys.has(key), 'Unknown page.'),
  title: z.string().trim().max(160).optional(),
  description: z.string().trim().max(320).optional(),
  html: z.string().max(100_000),
  published: z.boolean(),
});

/** Create or update the editable content / SEO overrides of one page. */
export async function PUT(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Check the page fields.', 400);
  const { key, title, description, html, published } = parsed.data;
  const data = {
    title: title || null,
    description: description || null,
    html: sanitizeHtml(html),
    published,
    updatedBy: session.user.id,
  };
  await prisma.nvSitePage.upsert({ where: { key }, create: { key, ...data }, update: data });
  revalidateTag('site-pages');
  await audit({ userId: session.user.id, action: 'page.save', entity: 'SitePage', entityId: key });
  return jsonOk({ saved: true });
}

/** Remove the overrides so the page goes back to its code defaults. */
export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z.object({ key: z.string().min(1) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid page.', 400);
  await prisma.nvSitePage.deleteMany({ where: { key: parsed.data.key } });
  revalidateTag('site-pages');
  await audit({ userId: session.user.id, action: 'page.reset', entity: 'SitePage', entityId: parsed.data.key });
  return jsonOk({ reset: true });
}
