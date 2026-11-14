import { headers } from 'next/headers';
import { prisma } from '@/server/db';
import { requireStaff } from '@/server/staff';
import { jsonError, jsonOk } from '@/server/logger';

export async function GET(request: Request) {
  const session = await requireStaff(await headers());
  if (!session) return jsonError('Forbidden.', 403);
  const q = new URL(request.url).searchParams.get('q')?.trim().slice(0, 80) || '';
  if (q.length < 2) return jsonOk({ hits: [] as { href: string; label: string; description: string; group: string }[] });

  const [products, leads, orders, articles] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { id: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      take: 8,
      orderBy: { name: 'asc' },
    }),
    prisma.lead.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { id: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.cmsArticle.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { id: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 6,
      orderBy: { title: 'asc' },
    }),
  ]);

  return jsonOk({
    hits: [
      ...products.map((product) => ({
        href: `/admin/marketplace?q=${encodeURIComponent(product.id)}`,
        label: product.name,
        description: `${product.category.name} · ${product.id}`,
        group: 'Products',
      })),
      ...leads.map((lead) => ({
        href: `/admin/crm?q=${encodeURIComponent(lead.email)}`,
        label: lead.name,
        description: lead.email,
        group: 'Leads',
      })),
      ...orders.map((order) => ({
        href: `/admin/finance?q=${encodeURIComponent(order.id)}`,
        label: `Order ${order.id.slice(0, 12)}`,
        description: `${order.email} · ${order.status}`,
        group: 'Orders',
      })),
      ...articles.map((article) => ({
        href: '/admin/cms',
        label: article.title,
        description: article.category,
        group: 'CMS',
      })),
    ],
  });
}
