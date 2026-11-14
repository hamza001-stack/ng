import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession } from '@/server/auth';
import { jsonError, jsonOk } from '@/server/logger';
import { originAllowed } from '@/server/http-guard';
import { customerWishlist } from '@/server/user-data';

const schema = z.object({ productId: z.string().min(1).max(80) });

export async function GET() {
  const session = await getAuthSession(await headers());
  if (!session) return jsonError('Sign in required.', 401);
  return jsonOk({ items: await customerWishlist(session.user.id) });
}

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await getAuthSession(await headers());
  if (!session) return jsonError('Sign in required.', 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid wishlist update.', 400);
  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, published: true },
    select: { id: true },
  });
  if (!product) return jsonError('Product not found.', 404);
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId: product.id } },
    update: {},
    create: { userId: session.user.id, productId: product.id },
  });
  return jsonOk({ items: await customerWishlist(session.user.id) });
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const session = await getAuthSession(await headers());
  if (!session) return jsonError('Sign in required.', 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid wishlist update.', 400);
  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId: parsed.data.productId },
  });
  return jsonOk({ items: await customerWishlist(session.user.id) });
}
