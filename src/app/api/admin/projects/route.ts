import { headers } from 'next/headers';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { saveUpload, slugify } from '@/server/uploads';
import { PROJECT_PHASES } from '@/lib/editorial';

const phases = z.enum([...PROJECT_PHASES, 'TBC']);

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const form = await request.formData();
  const title = String(form.get('title') || '').trim();
  const client = String(form.get('client') || '').trim();
  const summary = String(form.get('summary') || '').trim();
  if (title.length < 3 || client.length < 2 || summary.length < 8) {
    return jsonError('Check title, client and summary.', 400);
  }
  let fileUrl: string | null = null;
  let coverUrl: string | null = null;
  try {
    const file = form.get('file');
    fileUrl = await saveUpload(file instanceof File ? file : null, 'projects', {
      maxBytes: 20_000_000,
    });
    const cover = form.get('cover');
    coverUrl = await saveUpload(cover instanceof File ? cover : null, 'projects', {
      imagesOnly: true,
      maxBytes: 6_000_000,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Upload failed.', 400);
  }
  const text = (key: string, max = 160) => {
    const value = String(form.get(key) || '').trim().slice(0, max);
    return value || null;
  };
  const list = (key: string) =>
    String(form.get(key) || '')
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 24);
  const phase = phases.safeParse(form.get('phase'));
  const rawProgress = String(form.get('progress') ?? '').trim();
  const progress = rawProgress ? Math.round(Number(rawProgress)) : NaN;
  const teamSize = Math.round(Number(form.get('teamSize')));
  const eta = text('eta') ? new Date(String(form.get('eta'))) : null;
  let slug = slugify(title);
  if (await prisma.deliveryProject.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  const row = await prisma.deliveryProject.create({
    data: {
      title,
      client,
      summary,
      fileUrl,
      coverUrl,
      slug,
      isPublic: form.get('isPublic') === 'true',
      phase: phase.success ? phase.data : 'PLANNING',
      progress: Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : null,
      category: text('category'),
      goal: text('goal', 600),
      technologies: list('technologies'),
      features: list('features'),
      teamSize: Number.isFinite(teamSize) && teamSize > 0 ? teamSize : null,
      eta: eta && !Number.isNaN(eta.getTime()) ? eta : null,
    },
  });
  revalidateTag('projects');
  await audit({
    userId: session.user.id,
    action: 'project.create',
    entity: 'DeliveryProject',
    entityId: row.id,
  });
  return jsonOk({ id: row.id });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['BACKLOG', 'DOING', 'REVIEW', 'DONE']).optional(),
  title: z.string().trim().min(3).max(160).optional(),
  client: z.string().trim().min(2).max(120).optional(),
  summary: z.string().trim().min(8).max(4000).optional(),
  phase: phases.optional(),
  progress: z.number().int().min(0).max(100).nullable().optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid project update.', 400);
  await prisma.deliveryProject.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(parsed.data.client ? { client: parsed.data.client } : {}),
      ...(parsed.data.summary ? { summary: parsed.data.summary } : {}),
      ...(parsed.data.phase ? { phase: parsed.data.phase } : {}),
      ...(parsed.data.progress !== undefined ? { progress: parsed.data.progress } : {}),
      ...(parsed.data.isPublic !== undefined ? { isPublic: parsed.data.isPublic } : {}),
    },
  });
  revalidateTag('projects');
  await audit({
    userId: session.user.id,
    action: 'project.update',
    entity: 'DeliveryProject',
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
  if (!parsed.success) return jsonError('Invalid project id.', 400);
  await prisma.deliveryProject.delete({ where: { id: parsed.data.id } });
  revalidateTag('projects');
  await audit({
    userId: session.user.id,
    action: 'project.delete',
    entity: 'DeliveryProject',
    entityId: parsed.data.id,
  });
  return jsonOk({ deleted: true });
}
