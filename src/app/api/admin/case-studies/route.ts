import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { saveUpload, slugify } from '@/server/uploads';

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const form = await request.formData();
  const title = String(form.get('title') || '').trim();
  const summary = String(form.get('summary') || '').trim();
  const body = String(form.get('body') || '').trim();
  if (title.length < 3 || summary.length < 8 || body.length < 20) {
    return jsonError('Check title, summary and body.', 400);
  }
  let slug = slugify(title);
  if (await prisma.caseStudy.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  let coverUrl: string | null = null;
  let fileUrl: string | null = null;
  try {
    const cover = form.get('cover');
    coverUrl = await saveUpload(cover instanceof File ? cover : null, 'case-studies', {
      imagesOnly: true,
      maxBytes: 6_000_000,
    });
    const file = form.get('file');
    fileUrl = await saveUpload(file instanceof File ? file : null, 'case-studies', {
      maxBytes: 15_000_000,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Upload failed.', 400);
  }
  const text = (key: string, max = 120) => {
    const value = String(form.get(key) || '').trim().slice(0, max);
    return value || null;
  };
  const list = (key: string) =>
    String(form.get(key) || '')
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 24);
  const year = Number(form.get('year'));
  const row = await prisma.caseStudy.create({
    data: {
      slug,
      title,
      summary,
      body,
      coverUrl,
      fileUrl,
      published: true,
      client: text('client'),
      industry: text('industry'),
      country: text('country'),
      duration: text('duration'),
      year: Number.isInteger(year) && year > 1990 && year < 2100 ? year : null,
      services: list('services'),
      technologies: list('technologies'),
      results: list('results'),
    },
  });
  revalidateTag('case-studies');
  await audit({
    userId: session.user.id,
    action: 'casestudy.create',
    entity: 'CaseStudy',
    entityId: row.id,
  });
  return jsonOk({ id: row.id, slug: row.slug });
}

const patchSchema = z.object({
  id: z.string().min(1),
  published: z.boolean().optional(),
  title: z.string().trim().min(3).max(160).optional(),
  summary: z.string().trim().min(8).max(2000).optional(),
  body: z.string().trim().min(20).max(40000).optional(),
});

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid case study update.', 400);
  await prisma.caseStudy.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.published !== undefined ? { published: parsed.data.published } : {}),
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(parsed.data.summary ? { summary: parsed.data.summary } : {}),
      ...(parsed.data.body ? { body: parsed.data.body } : {}),
    },
  });
  revalidateTag('case-studies');
  await audit({
    userId: session.user.id,
    action: 'casestudy.update',
    entity: 'CaseStudy',
    entityId: parsed.data.id,
    meta: parsed.data,
  });
  return jsonOk({ updated: true });
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid case study id.', 400);
  await prisma.caseStudy.delete({ where: { id: parsed.data.id } });
  revalidateTag('case-studies');
  await audit({
    userId: session.user.id,
    action: 'casestudy.delete',
    entity: 'CaseStudy',
    entityId: parsed.data.id,
  });
  return jsonOk({ deleted: true });
}
