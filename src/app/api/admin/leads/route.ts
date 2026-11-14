import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['NEW', 'QUALIFIED', 'WON', 'LOST']),
  notes: z.string().max(4000).optional(),
});

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  company: z.string().trim().max(120).optional(),
  message: z.string().trim().min(8).max(4000),
  status: z.enum(['NEW', 'QUALIFIED', 'WON', 'LOST']).default('NEW'),
});

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Check the lead fields.', 400);
  const lead = await prisma.lead.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      message: parsed.data.message,
      source: 'admin',
      status: parsed.data.status,
      userId: session.user.id,
    },
  });
  await audit({
    userId: session.user.id,
    action: 'lead.create',
    entity: 'Lead',
    entityId: lead.id,
  });
  return jsonOk({ id: lead.id });
}

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid lead update.', 400);
  await prisma.lead.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes,
    },
  });
  await audit({
    userId: session.user.id,
    action: 'lead.status',
    entity: 'Lead',
    entityId: parsed.data.id,
    meta: { status: parsed.data.status },
  });
  return jsonOk({ updated: true });
}
