import { z } from 'zod';

export type ShopProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  tag: string;
  features: string[];
  imageUrl?: string | null;
};

export function productImages(id: string, imageUrl?: string | null) {
  const cover = imageUrl || `/products/${id}.webp`;
  const catalogSet = !imageUrl || imageUrl.startsWith(`/products/${id}`);
  const hover = catalogSet ? `/products/${id}-detail.webp` : cover;
  const thumbnail = catalogSet ? `/products/${id}-thumb.webp` : cover;
  return {
    cover,
    hover,
    gallery: catalogSet && hover !== cover ? [cover, hover] : [cover],
    thumbnail,
  };
}

const factsSchema = z.object({
  id: z.string().min(1).max(80),
  rating: z.number().min(0).max(5).nullable().default(null),
  reviewCount: z.number().int().min(0).default(0),
  compareAtPrice: z.number().nonnegative().nullable().default(null),
  publishedAt: z.string().datetime().nullable().default(null),
  sales: z.number().int().nonnegative().nullable().default(null),
  views: z.number().int().nonnegative().nullable().default(null),
  reviews: z
    .array(
      z.object({
        id: z.string().max(100),
        author: z.string().max(80),
        text: z.string().max(1000),
        rating: z.number().min(1).max(5),
        verified: z.boolean(),
      }),
    )
    .max(20)
    .default([]),
}).refine((v) => v.rating === null || v.reviewCount > 0, 'A rating requires reviews');

export const catalogueFeedSchema = z
  .object({ products: z.array(factsSchema).max(10000) })
  .refine((v) => new Set(v.products.map((p) => p.id)).size === v.products.length, 'Duplicate product ID');

export type CommerceFacts = z.infer<typeof factsSchema>;
export type CommerceData = Record<string, CommerceFacts>;
export const commerce: CommerceData = {};
export const launchIds = [
  'founder-card',
  'founder-box',
  'bague-aura',
  'bague-signet',
  'bague-origin',
  'bracelet-link',
  'bracelet-core',
  'bracelet-weave',
];
