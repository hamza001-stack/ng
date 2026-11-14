import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession, roleOf } from '@/server/auth';
import { can } from '@/server/rbac';
import { jsonError, jsonOk } from '@/server/logger';

export async function GET() {
  const session = await getAuthSession(await headers());
  const role = roleOf(session);
  if (!can(role, 'STAFF')) return jsonError('Forbidden.', 403);
  const [orders, leads, users, products, paid] = await Promise.all([
    prisma.order.count(),
    prisma.lead.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalPence: true },
    }),
  ]);
  return jsonOk({
    orders,
    leads,
    users,
    products,
    revenue: (paid._sum.totalPence || 0) / 100,
  });
}
