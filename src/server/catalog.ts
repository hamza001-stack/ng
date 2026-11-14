import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from './db';
import type { ShopProduct } from '@/lib/commerce';

function toShopProduct(row: {
  id: string;
  name: string;
  description: string;
  pricePence: number;
  tag: string | null;
  features: string[];
  imageUrl?: string | null;
  category: { name: string };
}): ShopProduct {
  return {
    id: row.id,
    name: row.name,
    category: row.category.name,
    price: row.pricePence / 100,
    description: row.description,
    tag: row.tag || '',
    features: row.features,
    imageUrl: row.imageUrl || `/products/${row.id}.webp`,
  };
}

export async function listPublishedProducts(): Promise<ShopProduct[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    return rows.map(toShopProduct);
  } catch {
    return [];
  }
}

export const cachedPublishedProducts = unstable_cache(
  listPublishedProducts,
  ['published-products'],
  { revalidate: 60, tags: ['products'] },
);

export const cachedProductsWithStock = unstable_cache(
  async () => {
    const rows = await prisma.product.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { pricePence: 'asc' },
    });
    return rows.map((row) => ({ ...toShopProduct(row), stock: row.stock }));
  },
  ['published-products-stock'],
  { revalidate: 60, tags: ['products'] },
);

export async function getProductById(id: string) {
  const row = await prisma.product.findFirst({
    where: { id, published: true },
    include: { category: true, reviews: true },
  });
  return row ? { ...toShopProduct(row), stock: row.stock, reviews: row.reviews } : null;
}

export async function searchProducts(query: string, category?: string) {
  return prisma.product.findMany({
    where: {
      published: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { category: true },
    take: 48,
    orderBy: { name: 'asc' },
  });
}
