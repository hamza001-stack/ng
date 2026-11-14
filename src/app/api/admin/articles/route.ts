import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { slugify } from '@/server/uploads';

const patchSchema = z.object({
  id: z.string().min(1),
  published: z.boolean().optional(),
  action: z.enum(['duplicate']).optional(),
});

const createSchema = z.object({
  title: z.string().trim().min(3).max(160),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(8).max(400),
  body: z.string().trim().min(20).max(20000),
});

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Check the article fields.', 400);
  let id = slugify(parsed.data.title);
  if (await prisma.cmsArticle.findUnique({ where: { id } })) {
    id = `${id}-${Date.now().toString(36)}`;
  }
  await prisma.cmsArticle.create({
    data: {
      id,
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      body: parsed.data.body,
      published: true,
    },
  });
  revalidateTag('articles');
  await audit({
    userId: session.user.id,
    action: 'cms.create',
    entity: 'CmsArticle',
    entityId: id,
  });
  return jsonOk({ id });
}

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid article update.', 400);
  if (parsed.data.action === 'duplicate') {
    const source = await prisma.cmsArticle.findUnique({ where: { id: parsed.data.id } });
    if (!source) return jsonError('Article not found.', 404);
    const id = `${source.id}-${Date.now().toString(36)}`;
    await prisma.cmsArticle.create({
      data: {
        id,
        title: `${source.title} copy`,
        category: source.category,
        description: source.description,
        body: source.body,
        published: false,
      },
    });
    revalidateTag('articles');
    await audit({
      userId: session.user.id,
      action: 'cms.duplicate',
      entity: 'CmsArticle',
      entityId: id,
      meta: { from: source.id },
    });
    return jsonOk({ id });
  }
  if (parsed.data.published === undefined) return jsonError('Invalid article update.', 400);
  await prisma.cmsArticle.update({
    where: { id: parsed.data.id },
    data: { published: parsed.data.published },
  });
  revalidateTag('articles');
  await audit({
    userId: session.user.id,
    action: 'cms.publish',
    entity: 'CmsArticle',
    entityId: parsed.data.id,
    meta: { published: parsed.data.published },
  });
  return jsonOk({ updated: true });
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid article id.', 400);
  await prisma.cmsArticle.delete({ where: { id: parsed.data.id } });
  revalidateTag('articles');
  await audit({
    userId: session.user.id,
    action: 'cms.delete',
    entity: 'CmsArticle',
    entityId: parsed.data.id,
  });
  return jsonOk({ deleted: true });
}
