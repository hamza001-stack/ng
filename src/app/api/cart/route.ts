import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getAuthSession } from '@/server/auth';
import { getOrCreateCart, mergeGuestCart } from '@/server/cart';
import { jsonError, jsonOk } from '@/server/logger';
import { clientKey, rateLimit } from '@/server/rate-limit';
import { originAllowed } from '@/server/http-guard';

const mutateSchema = z.object({
  productId: z.string().min(1).max(80),
  quantity: z.number().int().min(0).max(99).optional(),
});

async function cartPayload(userId?: string | null) {
  const cart = userId
    ? await mergeGuestCart(userId)
    : await getOrCreateCart(null);
  const full = await prisma.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  return {
    id: full.id,
    items: full.items.map((item) => ({
      id: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      price: item.product.pricePence / 100,
      stock: item.product.stock,
      category: item.product.category.name,
    })),
  };
}

export async function GET() {
  const session = await getAuthSession(await headers());
  return jsonOk(await cartPayload(session?.user.id));
}

export async function POST(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const limited = await rateLimit(clientKey(request, 'cart'), 60, 60_000);
  if (!limited.ok) return jsonError('Too many requests.', 429);
  const parsed = mutateSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid cart update.', 400);
  const session = await getAuthSession(await headers());
  const cart = session?.user.id
    ? await mergeGuestCart(session.user.id)
    : await getOrCreateCart(null);
  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, published: true },
  });
  if (!product) return jsonError('Product not found.', 404);
  const existing = cart.items.find((item) => item.productId === product.id);
  const nextQty = Math.min(
    product.stock,
    (existing?.quantity || 0) + (parsed.data.quantity ?? 1),
  );
  if (nextQty < 1) return jsonError('This product is out of stock.', 409);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, quantity: nextQty },
    });
  }
  return jsonOk(await cartPayload(session?.user.id));
}

export async function PATCH(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const parsed = mutateSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid cart update.', 400);
  const session = await getAuthSession(await headers());
  const cart = await getOrCreateCart(session?.user.id ?? null);
  const quantity = parsed.data.quantity ?? 0;
  const existing = cart.items.find((item) => item.productId === parsed.data.productId);
  if (!existing) return jsonError('Item not in cart.', 404);
  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
  } else {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: parsed.data.productId },
    });
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: Math.min(product.stock, quantity) },
    });
  }
  return jsonOk(await cartPayload(session?.user.id));
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return jsonError('Request origin not allowed.', 403);
  const parsed = mutateSchema.pick({ productId: true }).safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid cart update.', 400);
  const session = await getAuthSession(await headers());
  const cart = await getOrCreateCart(session?.user.id ?? null);
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId: parsed.data.productId },
  });
  return jsonOk(await cartPayload(session?.user.id));
}
