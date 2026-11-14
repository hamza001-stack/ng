import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession } from '@/server/auth';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { customerNotifications } from '@/server/user-data';

const schema = z.object({
  id: z.string().min(1),
  read: z.boolean().optional(),
  delete: z.boolean().optional(),
});

export async function GET() {
  const session = await getAuthSession(await headers());
  if (!session) return jsonError('Sign in required.', 401);
  const rows = await customerNotifications(session.user.id);
  return jsonOk({
    items: rows.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      href: item.href,
      read: item.read,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await getAuthSession(await headers());
  if (!session) return jsonError('Sign in required.', 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid notification update.', 400);
  const existing = await prisma.userNotification.findFirst({
    where: { id: parsed.data.id, userId: session.user.id },
  });
  if (!existing) return jsonError('Notification not found.', 404);
  if (parsed.data.delete) {
    await prisma.userNotification.delete({ where: { id: existing.id } });
  } else {
    await prisma.userNotification.update({
      where: { id: existing.id },
      data: { read: parsed.data.read ?? true },
    });
  }
  return jsonOk({ updated: true });
}
