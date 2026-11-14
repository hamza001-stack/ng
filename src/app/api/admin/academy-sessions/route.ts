import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';

const schema = z
  .object({
    id: z.string().optional(), // empty = create
    programmeId: z.string().min(1),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a start date.'),
    days: z.string().trim().min(1).max(80),
    time: z.string().trim().min(1).max(80),
    mode: z.string().trim().min(1).max(60),
    seats: z.number().int().min(1).max(10_000),
    taken: z.number().int().min(0).max(10_000),
    published: z.boolean(),
  })
  .refine((v) => v.taken <= v.seats, { message: 'Seats taken cannot exceed capacity.' });

export async function PUT(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Check the session fields.', 400);
  const { id, startsOn, ...rest } = parsed.data;
  const data = { ...rest, startsOn: new Date(startsOn + 'T00:00:00Z') };
  const saved = id
    ? await prisma.nvAcademySession.update({ where: { id }, data })
    : await prisma.nvAcademySession.create({ data });
  revalidateTag('academy');
  await audit({ userId: session.user.id, action: id ? 'academy.session.update' : 'academy.session.create', entity: 'AcademySession', entityId: saved.id });
  return jsonOk({ saved: true, id: saved.id });
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid session.', 400);
  await prisma.nvAcademySession.deleteMany({ where: { id: parsed.data.id } });
  revalidateTag('academy');
  await audit({ userId: session.user.id, action: 'academy.session.delete', entity: 'AcademySession', entityId: parsed.data.id });
  return jsonOk({ deleted: true });
}
