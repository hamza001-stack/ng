import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { audit } from '@/server/audit';
import { notifyUser } from '@/server/notify';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { orderLabel } from '@/lib/order-status';
import { orderRef } from '@/lib/workspace-format';

const schema = z.object({
  id: z.string().min(1),
  status: z
    .enum([
      'PENDING',
      'PROCESSING',
      'PAID',
      'PACKED',
      'SHIPPED',
      'DELIVERED',
      'FULFILLED',
      'CANCELLED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
      'FAILED',
    ])
    .optional(),
  notes: z.string().max(4000).optional(),
  internalNotes: z.string().max(4000).optional(),
});

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid order update.', 400);
  if (!parsed.data.status && parsed.data.notes === undefined && parsed.data.internalNotes === undefined) {
    return jsonError('Invalid order update.', 400);
  }
  const data = {
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes || null } : {}),
    ...(parsed.data.internalNotes !== undefined ? { internalNotes: parsed.data.internalNotes || null } : {}),
  };
  let order;
  try {
    order = await prisma.order.update({ where: { id: parsed.data.id }, data });
  } catch {
    order = await prisma.order.update({
      where: { id: parsed.data.id },
      data: parsed.data.status ? { status: parsed.data.status } : {},
    });
  }
  await audit({
    userId: session.user.id,
    action: parsed.data.status ? 'order.status' : 'order.notes',
    entity: 'Order',
    entityId: parsed.data.id,
    meta: parsed.data,
  });
  if (parsed.data.status) {
    await notifyUser({
      userId: order.userId,
      title: `Order ${orderLabel(order.status).toLowerCase()}`,
      body: `${orderRef(order.id, order.createdAt)} is now ${orderLabel(order.status).toLowerCase()}.`,
      href: `/dashboard/orders/${order.id}`,
    });
  }
  return jsonOk({ updated: true });
}
