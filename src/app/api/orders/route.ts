import { headers } from 'next/headers';
import { getAuthSession } from '@/server/auth';
import { prisma } from '@/server/db';
import { jsonError, jsonOk } from '@/server/logger';

export async function GET() {
  const session = await getAuthSession(await headers());
  if (!session) return jsonError('Sign in required.', 401);
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return jsonOk({
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.totalPence / 100,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    })),
  });
}
