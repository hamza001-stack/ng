import 'server-only';
import { prisma } from '@/server/db';
import type { CommerceData } from './commerce';

export async function getCommerce(): Promise<CommerceData> {
  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      include: { reviews: true },
    });
    return Object.fromEntries(
      products.map((product) => {
        const reviewCount = product.reviews.length;
        const rating =
          reviewCount === 0
            ? null
            : product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
        return [
          product.id,
          {
            id: product.id,
            rating,
            reviewCount,
            compareAtPrice: product.compareAtPence ? product.compareAtPence / 100 : null,
            publishedAt: product.createdAt.toISOString(),
            sales: null,
            views: null,
            reviews: product.reviews.map((review) => ({
              id: review.id,
              author: review.author,
              text: review.text,
              rating: review.rating,
              verified: review.verified,
            })),
          },
        ];
      }),
    );
  } catch {
    return {};
  }
}
